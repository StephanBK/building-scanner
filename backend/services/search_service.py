"""Service for web searches using Google Custom Search API."""

import os
import httpx
import asyncio
from typing import List, Dict, Optional
import logging

logger = logging.getLogger(__name__)


class SearchService:
    """Service to perform web searches for building classification context."""

    BASE_URL = "https://www.googleapis.com/customsearch/v1"

    # Search query suffixes to determine building type
    SEARCH_SUFFIXES = [
        "rent",
        "for lease",
        "apartments",
        "office space",
        "hotel",
        "hospital medical"
    ]

    def __init__(
        self,
        api_key: Optional[str] = None,
        search_engine_id: Optional[str] = None
    ):
        self.api_key = api_key or os.getenv("GOOGLE_SEARCH_API_KEY")
        self.search_engine_id = search_engine_id or os.getenv("GOOGLE_SEARCH_ENGINE_ID")

        if not self.api_key:
            logger.warning("Google Custom Search API key not configured")
        if not self.search_engine_id:
            logger.warning("Google Custom Search Engine ID not configured")

    async def search_address(self, address: str) -> Dict[str, List[str]]:
        """
        Perform multiple searches for an address to gather context.

        Args:
            address: Full address string

        Returns:
            Dictionary mapping search type to list of result snippets
        """
        if not self.api_key or not self.search_engine_id:
            logger.warning("Search service not configured, skipping searches")
            return {}

        results: Dict[str, List[str]] = {}

        async with httpx.AsyncClient() as client:
            tasks = []
            for suffix in self.SEARCH_SUFFIXES:
                query = f"{address} {suffix}"
                tasks.append(self._perform_search(client, query, suffix))

            search_results = await asyncio.gather(*tasks, return_exceptions=True)

            for suffix, result in zip(self.SEARCH_SUFFIXES, search_results):
                if isinstance(result, list):
                    results[suffix] = result
                elif isinstance(result, Exception):
                    logger.error(f"Search error for '{suffix}': {result}")
                    results[suffix] = []

        return results

    async def _perform_search(
        self,
        client: httpx.AsyncClient,
        query: str,
        search_type: str
    ) -> List[str]:
        """
        Perform a single search query.

        Args:
            client: HTTP client
            query: Search query string
            search_type: Type of search (for logging)

        Returns:
            List of result snippets
        """
        try:
            response = await client.get(
                self.BASE_URL,
                params={
                    "key": self.api_key,
                    "cx": self.search_engine_id,
                    "q": query,
                    "num": 3  # Get top 3 results per query
                },
                timeout=15.0
            )

            if response.status_code == 200:
                data = response.json()
                items = data.get("items", [])
                snippets = []

                for item in items:
                    snippet = item.get("snippet", "")
                    title = item.get("title", "")
                    if snippet:
                        snippets.append(f"{title}: {snippet}")

                return snippets

            elif response.status_code == 429:
                logger.warning("Search API rate limit reached")
                return []

            else:
                logger.warning(f"Search failed: {response.status_code}")
                return []

        except Exception as e:
            logger.error(f"Search error: {e}")
            raise

    def format_search_context(self, search_results: Dict[str, List[str]]) -> str:
        """
        Format search results into a context string for the vision model.

        Args:
            search_results: Dictionary of search results

        Returns:
            Formatted string for inclusion in prompt
        """
        if not search_results:
            return "No web search results available."

        parts = []

        for search_type, snippets in search_results.items():
            if snippets:
                parts.append(f"Search '{search_type}':")
                for snippet in snippets[:2]:  # Limit to top 2 per type
                    parts.append(f"  - {snippet[:200]}")  # Truncate long snippets

        if not parts:
            return "No relevant web search results found."

        return "\n".join(parts)
