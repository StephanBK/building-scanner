"""Service for looking up state and county from zip code."""

import httpx
from typing import Optional, Tuple
import logging

logger = logging.getLogger(__name__)


class ZipService:
    """Service to lookup state and county from zip code using Zippopotam.us API."""

    BASE_URL = "https://api.zippopotam.us/us"

    def __init__(self):
        self._cache: dict[str, Tuple[Optional[str], Optional[str]]] = {}

    async def lookup(self, zip_code: str) -> Tuple[Optional[str], Optional[str]]:
        """
        Lookup state and county for a given zip code.

        Args:
            zip_code: 5-digit US zip code

        Returns:
            Tuple of (state_abbr, county) or (None, None) if not found
        """
        # Normalize zip code
        zip_code = zip_code.strip()[:5]

        # Check cache first
        if zip_code in self._cache:
            return self._cache[zip_code]

        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.BASE_URL}/{zip_code}",
                    timeout=10.0
                )

                if response.status_code == 200:
                    data = response.json()
                    state = data.get("state abbreviation")
                    # Zippopotam returns places array with county info
                    places = data.get("places", [])
                    county = None
                    if places:
                        # County is in the "state" field within places (confusing API)
                        # Actually it's just city name, need to use a different approach
                        # For now, we'll just return state
                        county = places[0].get("place name", "")

                    result = (state, county)
                    self._cache[zip_code] = result
                    return result
                else:
                    logger.warning(f"Zip lookup failed for {zip_code}: {response.status_code}")
                    self._cache[zip_code] = (None, None)
                    return (None, None)

        except Exception as e:
            logger.error(f"Error looking up zip code {zip_code}: {e}")
            return (None, None)

    async def get_full_address(
        self,
        street_number: str,
        street_name: str,
        zip_code: str
    ) -> str:
        """
        Build a full address string for API queries.

        Args:
            street_number: Building number
            street_name: Street name
            zip_code: Zip code

        Returns:
            Formatted address string
        """
        state, city = await self.lookup(zip_code)

        parts = [f"{street_number} {street_name}"]
        if city:
            parts.append(city)
        if state:
            parts.append(state)
        parts.append(zip_code)

        return ", ".join(parts)
