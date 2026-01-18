"""Rate limiting service for Building Scanner."""

import time
from typing import Dict, Tuple
from collections import defaultdict
import logging

logger = logging.getLogger(__name__)

# Rate limit: 100 buildings per hour per IP
RATE_LIMIT_BUILDINGS = 100
RATE_LIMIT_WINDOW = 3600  # 1 hour in seconds


class RateLimiter:
    """In-memory rate limiter tracking buildings processed per IP."""

    def __init__(self, limit: int = RATE_LIMIT_BUILDINGS, window: int = RATE_LIMIT_WINDOW):
        self.limit = limit
        self.window = window
        # Dict of IP -> list of (timestamp, building_count) tuples
        self._requests: Dict[str, list] = defaultdict(list)

    def _cleanup_old_requests(self, ip: str) -> None:
        """Remove requests older than the time window."""
        now = time.time()
        cutoff = now - self.window
        self._requests[ip] = [
            (ts, count) for ts, count in self._requests[ip]
            if ts > cutoff
        ]

    def get_usage(self, ip: str) -> Tuple[int, int]:
        """
        Get current usage for an IP.

        Args:
            ip: Client IP address

        Returns:
            Tuple of (buildings_used, buildings_remaining)
        """
        self._cleanup_old_requests(ip)
        used = sum(count for _, count in self._requests[ip])
        remaining = max(0, self.limit - used)
        return used, remaining

    def check_limit(self, ip: str, building_count: int) -> Tuple[bool, str]:
        """
        Check if a request is within rate limits.

        Args:
            ip: Client IP address
            building_count: Number of buildings in this request

        Returns:
            Tuple of (is_allowed, message)
        """
        self._cleanup_old_requests(ip)
        used, remaining = self.get_usage(ip)

        if building_count > remaining:
            minutes_until_reset = int(self.window / 60)
            return False, f"Rate limit exceeded. You have {remaining} buildings remaining this hour. Limit resets hourly. Requested: {building_count}"

        return True, f"OK. Using {building_count} of {remaining} remaining buildings."

    def record_usage(self, ip: str, building_count: int) -> None:
        """
        Record that buildings were processed for an IP.

        Args:
            ip: Client IP address
            building_count: Number of buildings processed
        """
        self._requests[ip].append((time.time(), building_count))
        logger.info(f"Rate limit: IP {ip} used {building_count} buildings. Total: {self.get_usage(ip)[0]}/{self.limit}")

    def get_reset_time(self, ip: str) -> int:
        """
        Get seconds until the oldest request expires.

        Args:
            ip: Client IP address

        Returns:
            Seconds until some quota is freed, or 0 if no requests
        """
        self._cleanup_old_requests(ip)
        if not self._requests[ip]:
            return 0

        oldest_ts = min(ts for ts, _ in self._requests[ip])
        reset_time = int(oldest_ts + self.window - time.time())
        return max(0, reset_time)


# Global rate limiter instance
rate_limiter = RateLimiter()
