"""Service for fetching street-level images using Google Street View API."""

import os
import io
import httpx
import asyncio
from pathlib import Path
from typing import List, Optional
import logging
from PIL import Image

logger = logging.getLogger(__name__)

# JPEG compression quality for downloads (0-100, 65 is good balance)
COMPRESS_QUALITY = 65


class ImageService:
    """Service to fetch street-level images from Google Street View Static API."""

    BASE_URL = "https://maps.googleapis.com/maps/api/streetview"
    METADATA_URL = "https://maps.googleapis.com/maps/api/streetview/metadata"

    # Headings for different angles (degrees from north)
    HEADINGS = [0, 90, 180, 270]

    def __init__(self, api_key: Optional[str] = None, output_dir: str = "output"):
        self.api_key = api_key or os.getenv("GOOGLE_MAPS_API_KEY")
        if not self.api_key:
            logger.warning("Google Maps API key not configured")
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)

    def _sanitize_folder_name(self, address: str) -> str:
        """Create a safe folder name from an address."""
        # Replace spaces and special characters
        safe_name = address.replace(" ", "_").replace(",", "").replace("/", "-")
        # Remove any other problematic characters
        safe_name = "".join(c for c in safe_name if c.isalnum() or c in "_-")
        return safe_name[:100]  # Limit length

    async def check_streetview_availability(self, address: str) -> bool:
        """
        Check if Street View imagery is available for an address.

        Args:
            address: Full address string

        Returns:
            True if imagery is available, False otherwise
        """
        if not self.api_key:
            return False

        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    self.METADATA_URL,
                    params={
                        "location": address,
                        "key": self.api_key
                    },
                    timeout=10.0
                )

                if response.status_code == 200:
                    data = response.json()
                    return data.get("status") == "OK"
                return False

        except Exception as e:
            logger.error(f"Error checking Street View availability: {e}")
            return False

    async def fetch_images(
        self,
        address: str,
        num_images: int = 4,
        size: str = "640x640"
    ) -> List[str]:
        """
        Fetch street-level images for an address from multiple angles.

        Args:
            address: Full address string
            num_images: Number of images to fetch (max 4 for different angles)
            size: Image size in WxH format

        Returns:
            List of local file paths to saved images
        """
        if not self.api_key:
            logger.error("Google Maps API key not configured")
            return []

        # Create folder for this address
        folder_name = self._sanitize_folder_name(address)
        address_dir = self.output_dir / folder_name
        address_dir.mkdir(parents=True, exist_ok=True)

        # Check availability first
        available = await self.check_streetview_availability(address)
        if not available:
            logger.warning(f"No Street View data available for: {address}")
            return []

        saved_paths: List[str] = []
        headings = self.HEADINGS[:num_images]

        async with httpx.AsyncClient() as client:
            tasks = []
            for i, heading in enumerate(headings):
                tasks.append(
                    self._fetch_single_image(
                        client, address, heading, size, address_dir, i
                    )
                )

            results = await asyncio.gather(*tasks, return_exceptions=True)

            for result in results:
                if isinstance(result, str):
                    saved_paths.append(result)
                elif isinstance(result, Exception):
                    logger.error(f"Error fetching image: {result}")

        return saved_paths

    async def _fetch_single_image(
        self,
        client: httpx.AsyncClient,
        address: str,
        heading: int,
        size: str,
        output_dir: Path,
        index: int
    ) -> str:
        """
        Fetch a single Street View image.

        Args:
            client: HTTP client
            address: Full address string
            heading: Camera heading in degrees
            size: Image size
            output_dir: Directory to save image
            index: Image index for filename

        Returns:
            Path to saved image file
        """
        params = {
            "location": address,
            "size": size,
            "heading": heading,
            "pitch": 10,  # Slight upward tilt to capture building facade
            "fov": 90,  # Field of view
            "key": self.api_key
        }

        response = await client.get(
            self.BASE_URL,
            params=params,
            timeout=30.0
        )

        if response.status_code == 200:
            # Check if we got an actual image (not an error image)
            content_type = response.headers.get("content-type", "")
            if "image" in content_type:
                filename = f"streetview_{index}_{heading}deg.jpg"
                filepath = output_dir / filename

                with open(filepath, "wb") as f:
                    f.write(response.content)

                logger.info(f"Saved image: {filepath}")
                return str(filepath)

        raise Exception(f"Failed to fetch image for heading {heading}: {response.status_code}")

    def get_folder_name(self, address: str) -> str:
        """Get the folder name that would be used for an address."""
        return self._sanitize_folder_name(address)

    def get_image_paths(self, folder_name: str) -> List[str]:
        """Get all image paths for a given folder."""
        folder_path = self.output_dir / folder_name
        if folder_path.exists():
            return [str(p) for p in folder_path.glob("*.jpg")]
        return []

    def compress_image(self, image_path: str, quality: int = COMPRESS_QUALITY) -> bytes:
        """
        Compress an image to JPEG with specified quality.

        Args:
            image_path: Path to the image file
            quality: JPEG quality (0-100)

        Returns:
            Compressed image as bytes
        """
        try:
            with Image.open(image_path) as img:
                # Convert to RGB if necessary (for PNG with alpha)
                if img.mode in ('RGBA', 'P'):
                    img = img.convert('RGB')

                # Compress to JPEG
                buffer = io.BytesIO()
                img.save(buffer, format='JPEG', quality=quality, optimize=True)
                return buffer.getvalue()
        except Exception as e:
            logger.error(f"Error compressing image {image_path}: {e}")
            # Return original file content as fallback
            with open(image_path, 'rb') as f:
                return f.read()

    def get_compressed_images(self, folder_name: str) -> List[tuple]:
        """
        Get all images for a folder as compressed bytes.

        Args:
            folder_name: Name of the folder

        Returns:
            List of (filename, compressed_bytes) tuples
        """
        images = []
        folder_path = self.output_dir / folder_name

        if folder_path.exists():
            for image_path in folder_path.glob("*.jpg"):
                compressed = self.compress_image(str(image_path))
                images.append((image_path.name, compressed))

        return images
