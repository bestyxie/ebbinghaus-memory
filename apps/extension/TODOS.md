# TODOS

## Performance

### Dictionary API Caching
**Priority:** P2
**What:** Cache word → definition mappings from the Dictionary API to avoid duplicate calls for the same word.
**Why:** Improves performance, reduces API load, shows definitions faster for repeated words.
**Pros:** Better UX, lower latency, fewer API calls
**Cons:** Adds complexity to cache invalidation, chrome.storage.local has quota limits
**Context:** Use chrome.storage.local with TTL (24hr). Cache key = word, value = {definition, timestamp}. Prune old entries when quota exceeded.
**Effort estimate:** S (human: ~2 hours / CC: ~15 min)
**Depends on / blocked by:** Dictionary API integration

## Completed

*None yet*
