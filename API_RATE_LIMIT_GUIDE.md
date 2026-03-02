# API Rate Limit Management Guide

## Your Limits

| API | Limit | Details |
|-----|-------|---------|
| **OMDB** | 1,000 requests/day | Free tier. Resets at midnight UTC. |
| **TMDB** | 40 requests/10 seconds | Public API, no key needed for basic requests |
| **Reddit** | ~60 requests/minute | Friendly to reasonable use, enforce 2s delay |

## Budget Per Run

### fetch-omdb-scores.ts (519 movies)
- **Time:** ~13 minutes
- **Requests:** ~519 OMDB calls
- **Budget used:** ~52% of daily 1000 limit
- **Delay:** 1500ms between requests

**Safe to run:** 1-2 times per day MAX

### fetch-tmdb-posters.ts (519 movies)  
- **Time:** ~4 minutes  
- **Requests:** ~519 TMDB calls (well under 40/10s limit)
- **Budget used:** None (TMDB doesn't count against OMDB)
- **Delay:** 500ms between requests

**Safe to run:** Multiple times per day

### fetch-real-popularity.ts (519 movies)
- **Time:** ~17 minutes (2s delay)
- **Requests:** ~519 Reddit calls
- **Budget used:** None (Reddit separate from OMDB)
- **Delay:** 2000ms between requests, 60s backoff on limit

**Safe to run:** 1-2 times per day

## Running Strategy

### ✅ DO:
- **Space out OMDB runs** — Run at 8 AM, skip until evening (12+ hours apart)
- **Run TMDB + Reddit together** — They have separate rate limits
- **Use exponential backoff** — Script waits and retries automatically
- **Check daily usage** — Visit https://www.omdbapi.com/apikey.aspx before running

### ❌ DON'T:
- Run OMDB script multiple times in quick succession
- Run in parallel (will hit limits faster)
- Ignore rate limit errors (the new script handles them, but don't force it)

## If You Hit a Rate Limit

**Old behavior:** Script crashes with "API rate limit reached"

**New behavior:** Script waits and retries:
- 1st retry: waits 5 seconds
- 2nd retry: waits 10 seconds  
- 3rd retry: waits 20 seconds

If it still fails after 3 attempts, the script moves on to the next movie.

## Monitoring

### Check OMDB quota:
```bash
# Visit this URL and log in
https://www.omdbapi.com/apikey.aspx

# Your key: 17475e67
# Check "Requests made today" counter
```

### Estimate remaining budget:
- You have **1000 requests/day**
- Each OMDB run uses ~520 requests
- **Formula:** 1000 - (520 × runs_completed) = remaining

## When to Upgrade

- **If running tests frequently:** Consider paid tier ($39/year = 100k requests)
- **If building production features:** Paid tier is worth it
- **For now:** Respect the free tier limits, use careful scheduling

## Script Improvements Applied (2026-03-02)

✅ Exponential backoff + retry logic  
✅ Rate limit error detection  
✅ Safer delays (OMDB: 1500ms, TMDB: 500ms, Reddit: 2000ms)  
✅ Clear progress logging  
✅ Automatic recovery from transient errors

---

**Last updated:** 2026-03-02 09:12 CST
**By:** Vesper
