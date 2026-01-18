"""Service for parsing messy CSV files using LLM."""

import os
import json
import logging
from typing import List, Dict, Optional
from openai import AsyncOpenAI

logger = logging.getLogger(__name__)


class CSVParserService:
    """Service to parse messy CSV files using GPT-4o-mini."""

    SYSTEM_PROMPT = """You are a data parsing assistant. Your job is to extract address information from CSV data.

The user will provide CSV content that may have:
- Different column names (Address, Street, addr, location, etc.)
- Full addresses in one column or split across multiple columns
- Extra columns that should be ignored
- Inconsistent formatting

Your task: Extract and normalize addresses into this exact JSON format:
{
  "addresses": [
    {"street_number": "123", "street_name": "Main Street", "zip_code": "10001"},
    {"street_number": "456", "street_name": "Oak Avenue", "zip_code": "90210"}
  ],
  "parsing_notes": "Brief note about what you found/interpreted"
}

Rules:
- street_number: Just the building number (e.g., "123", "456-A")
- street_name: Street name with type (e.g., "Main Street", "5th Avenue", "Park Ave NW")
- zip_code: 5-digit US ZIP code only (ignore ZIP+4)
- If you can't find a ZIP code for an address, use "00000" as placeholder
- Skip rows that don't appear to be addresses (headers, totals, notes)
- Maximum 100 addresses (ignore extras)

Respond ONLY with valid JSON. No markdown, no explanation outside the JSON."""

    def __init__(self, api_key: Optional[str] = None):
        self._api_key = api_key
        self._client = None

    @property
    def client(self):
        """Lazily initialize the OpenAI client."""
        if self._client is None:
            api_key = self._api_key or os.getenv("OPENAI_API_KEY")
            if api_key:
                self._client = AsyncOpenAI(api_key=api_key)
        return self._client

    async def parse_csv(self, csv_content: str) -> Dict:
        """
        Parse messy CSV content using GPT-4o-mini.

        Args:
            csv_content: Raw CSV file content

        Returns:
            Dict with 'addresses' list and 'parsing_notes'
        """
        if not self.client:
            logger.error("OpenAI client not initialized")
            return {"addresses": [], "parsing_notes": "OpenAI API not configured"}

        # Truncate very large CSVs to avoid token limits
        max_chars = 15000  # ~4000 tokens
        if len(csv_content) > max_chars:
            csv_content = csv_content[:max_chars]
            logger.warning(f"CSV truncated to {max_chars} characters")

        try:
            response = await self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": self.SYSTEM_PROMPT},
                    {"role": "user", "content": f"Parse this CSV and extract addresses:\n\n{csv_content}"}
                ],
                max_tokens=4000,
                temperature=0.1  # Low temperature for consistent parsing
            )

            response_text = response.choices[0].message.content
            logger.info(f"CSV parser response: {response_text[:500]}...")

            # Clean up response
            cleaned = response_text.strip()
            if cleaned.startswith("```"):
                import re
                cleaned = re.sub(r"^```(?:json)?\n?", "", cleaned)
                cleaned = re.sub(r"\n?```$", "", cleaned)

            result = json.loads(cleaned)

            # Validate structure
            if "addresses" not in result:
                result = {"addresses": [], "parsing_notes": "Invalid response structure"}

            # Ensure all addresses have required fields
            valid_addresses = []
            for addr in result.get("addresses", []):
                if all(k in addr for k in ["street_number", "street_name", "zip_code"]):
                    valid_addresses.append({
                        "street_number": str(addr["street_number"]).strip(),
                        "street_name": str(addr["street_name"]).strip(),
                        "zip_code": str(addr["zip_code"]).strip()[:5]
                    })

            result["addresses"] = valid_addresses[:100]  # Enforce limit
            return result

        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse LLM response as JSON: {e}")
            return {"addresses": [], "parsing_notes": f"Failed to parse response: {str(e)}"}

        except Exception as e:
            logger.error(f"Error calling OpenAI API: {e}")
            return {"addresses": [], "parsing_notes": f"API error: {str(e)}"}
