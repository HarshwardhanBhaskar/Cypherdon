"""
In-memory TTL cache for Cypherdon.
Uses a simple dict + expiry timestamps.
Thread-safe via asyncio locks. Zero external dependencies.
"""
import asyncio
import hashlib
import json
import time
from typing import Any, Optional

_cache: dict[str, tuple[Any, float]] = {}
_lock = asyncio.Lock()

DEFAULT_TTL = 300  # 5 minutes


def _make_key(prefix: str, data: Any) -> str:
    """Generates a deterministic cache key from arbitrary data."""
    raw = json.dumps(data, sort_keys=True, default=str)
    digest = hashlib.sha256(raw.encode()).hexdigest()[:16]
    return f"{prefix}:{digest}"


async def cache_get(prefix: str, data: Any) -> Optional[Any]:
    """Returns cached value or None if expired/missing."""
    key = _make_key(prefix, data)
    async with _lock:
        if key in _cache:
            value, expires_at = _cache[key]
            if time.time() < expires_at:
                return value
            else:
                del _cache[key]
    return None


async def cache_set(prefix: str, data: Any, value: Any, ttl: int = DEFAULT_TTL) -> None:
    """Stores a value with TTL."""
    key = _make_key(prefix, data)
    async with _lock:
        _cache[key] = (value, time.time() + ttl)


async def cache_clear() -> None:
    """Clears all cached entries."""
    async with _lock:
        _cache.clear()


def cache_stats() -> dict:
    """Returns cache size and entry count (for monitoring)."""
    now = time.time()
    active = sum(1 for _, (_, exp) in _cache.items() if now < exp)
    return {"total_entries": len(_cache), "active_entries": active}
