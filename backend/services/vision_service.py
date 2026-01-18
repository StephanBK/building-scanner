"""Service for analyzing building images using OpenAI Vision API."""

import os
import base64
import json
import re
from pathlib import Path
from typing import List, Optional
import logging
from openai import AsyncOpenAI

from models import VisionAnalysisResult, BuildingType, Confidence

logger = logging.getLogger(__name__)


class VisionService:
    """Service to analyze building images using OpenAI GPT-4o Vision."""

    SYSTEM_PROMPT = """You are an expert building analyst. Your task is to analyze street-level images of buildings to determine:
1. Building Type: Classify into specific categories
2. Window-to-Wall Ratio (WWR): What percentage of the facade is glass/windows?

You must respond ONLY with valid JSON in the exact format specified. No additional text."""

    USER_PROMPT_TEMPLATE = """Analyze these street-level images of the building at {address}.

Context from web search:
{search_context}

Based on the images and search context, determine:
1. Building Type: Choose ONE from the list below
2. Window-to-Wall Ratio (WWR): percentage of facade that is glass (0-100%)

Respond ONLY with this JSON format (no markdown, no code blocks, just raw JSON):
{{
  "building_type": "<type from list below>",
  "wwr_estimate": <number 0-100>,
  "confidence": "high" | "medium" | "low",
  "reasoning": "<brief explanation>"
}}

Building Type Options (choose exactly one):
- "residential" - apartments, condos, houses, multi-family dwellings, dormitories
- "commercial-office" - office buildings, corporate headquarters, business centers
- "commercial-hotel" - hotels, motels, resorts, hospitality buildings
- "commercial-medical" - hospitals, medical centers, clinics, healthcare facilities
- "commercial-retail" - stores, shopping centers, malls, restaurants, banks
- "commercial-warehouse" - warehouses, distribution centers, industrial storage
- "mixed" - buildings with BOTH residential AND commercial use (e.g., ground floor retail with apartments above)
- "misc" - churches, schools, parks, government buildings, parking structures, unclear

Guidelines:
- Use web search context to help identify building use (hotel names, office tenants, etc.)
- WWR: Estimate the visible glass/windows as a percentage of the total facade area
- If images are unclear or show multiple buildings, use "low" confidence
- For misc buildings, still estimate WWR if possible, or use 0 if not applicable"""

    def __init__(self, api_key: Optional[str] = None):
        self._api_key = api_key
        self._client = None

    @property
    def client(self):
        """Lazily initialize the OpenAI client."""
        if self._client is None:
            api_key = self._api_key or os.getenv("OPENAI_API_KEY")
            if not api_key:
                logger.warning("OpenAI API key not configured")
                return None
            self._client = AsyncOpenAI(api_key=api_key)
        return self._client

    def _encode_image(self, image_path: str) -> str:
        """Encode an image file to base64."""
        with open(image_path, "rb") as f:
            return base64.b64encode(f.read()).decode("utf-8")

    def _parse_response(self, response_text: str) -> VisionAnalysisResult:
        """
        Parse the model's response into a structured result.

        Args:
            response_text: Raw response from the model

        Returns:
            VisionAnalysisResult object
        """
        # Clean up the response - remove markdown code blocks if present
        cleaned = response_text.strip()
        if cleaned.startswith("```"):
            # Remove markdown code block markers
            cleaned = re.sub(r"^```(?:json)?\n?", "", cleaned)
            cleaned = re.sub(r"\n?```$", "", cleaned)

        try:
            data = json.loads(cleaned)

            # Validate and convert building_type
            building_type_str = data.get("building_type", "misc").lower()
            valid_types = [
                "residential", "commercial-office", "commercial-hotel",
                "commercial-medical", "commercial-retail", "commercial-warehouse",
                "mixed", "misc"
            ]
            if building_type_str not in valid_types:
                # Try to map old "commercial" to "commercial-office" as default
                if building_type_str == "commercial":
                    building_type_str = "commercial-office"
                else:
                    building_type_str = "misc"
            building_type = BuildingType(building_type_str)

            # Validate WWR
            wwr = int(data.get("wwr_estimate", 0))
            wwr = max(0, min(100, wwr))  # Clamp to 0-100

            # Validate confidence
            confidence_str = data.get("confidence", "low").lower()
            if confidence_str not in ["high", "medium", "low"]:
                confidence_str = "low"
            confidence = Confidence(confidence_str)

            reasoning = data.get("reasoning", "No reasoning provided")

            return VisionAnalysisResult(
                building_type=building_type,
                wwr_estimate=wwr,
                confidence=confidence,
                reasoning=reasoning
            )

        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse JSON response: {e}")
            logger.error(f"Response was: {response_text}")
            # Return a default result with low confidence
            return VisionAnalysisResult(
                building_type=BuildingType.MISC,
                wwr_estimate=0,
                confidence=Confidence.LOW,
                reasoning=f"Failed to parse model response: {str(e)}"
            )

    async def analyze_building(
        self,
        image_paths: List[str],
        address: str,
        search_context: str = ""
    ) -> VisionAnalysisResult:
        """
        Analyze building images using OpenAI Vision.

        Args:
            image_paths: List of paths to street-level images
            address: The building address
            search_context: Formatted search results for context

        Returns:
            VisionAnalysisResult with classification and WWR estimate
        """
        if not self.client:
            logger.error("OpenAI client not initialized")
            return VisionAnalysisResult(
                building_type=BuildingType.MISC,
                wwr_estimate=0,
                confidence=Confidence.LOW,
                reasoning="OpenAI API not configured"
            )

        if not image_paths:
            logger.warning(f"No images provided for {address}")
            return VisionAnalysisResult(
                building_type=BuildingType.MISC,
                wwr_estimate=0,
                confidence=Confidence.LOW,
                reasoning="No street view images available"
            )

        # Build the message content with images
        content = []

        # Add text prompt
        user_prompt = self.USER_PROMPT_TEMPLATE.format(
            address=address,
            search_context=search_context if search_context else "No search results available."
        )
        content.append({"type": "text", "text": user_prompt})

        # Add images
        for image_path in image_paths:
            if Path(image_path).exists():
                base64_image = self._encode_image(image_path)
                content.append({
                    "type": "image_url",
                    "image_url": {
                        "url": f"data:image/jpeg;base64,{base64_image}",
                        "detail": "high"
                    }
                })

        try:
            response = await self.client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {"role": "system", "content": self.SYSTEM_PROMPT},
                    {"role": "user", "content": content}
                ],
                max_tokens=500,
                temperature=0.3  # Lower temperature for more consistent outputs
            )

            response_text = response.choices[0].message.content
            logger.info(f"Vision API response for {address}: {response_text}")

            return self._parse_response(response_text)

        except Exception as e:
            logger.error(f"Error calling OpenAI Vision API: {e}")
            return VisionAnalysisResult(
                building_type=BuildingType.MISC,
                wwr_estimate=0,
                confidence=Confidence.LOW,
                reasoning=f"API error: {str(e)}"
            )
