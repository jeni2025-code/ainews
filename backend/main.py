from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from services.news_fetcher import fetch_latest_news
from services.ai_processor import process_news_articles, get_trending_topics
from collections import Counter
import time
import json
from pydantic import BaseModel, EmailStr
from contextlib import asynccontextmanager
from apscheduler.schedulers.background import BackgroundScheduler
from services.email_sender import send_daily_newsletter

# Setup APScheduler
scheduler = BackgroundScheduler()

def scheduled_newsletter():
    try:
        articles = get_cached_articles()
        trending = get_trending_topics(articles, top_n=10)
        send_daily_newsletter(articles, trending)
    except Exception as e:
        print(f"Failed to send scheduled newsletter: {e}")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Start scheduler on startup
    scheduler.add_job(scheduled_newsletter, 'cron', hour=8, minute=0) # Runs daily at 8 AM
    scheduler.start()
    yield
    # Shutdown on exit
    scheduler.shutdown()

app = FastAPI(title="AI News API", version="2.0.0", lifespan=lifespan)

# Configure CORS - allow all origins for Vercel, HF Space, and local dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── In-memory cache ────────────────────────────────────────────────────────────
_cache: dict = {"articles": [], "ts": 0}
CACHE_TTL = 300  # seconds (5 min)


def get_cached_articles():
    if time.time() - _cache["ts"] > CACHE_TTL or not _cache["articles"]:
        raw = fetch_latest_news()
        _cache["articles"] = process_news_articles(raw)
        _cache["ts"] = time.time()
    return _cache["articles"]


# ── Endpoints ──────────────────────────────────────────────────────────────────

@app.get("/")
async def root():
    return {"message": "AI News API v2.0 is running 🚀", "docs": "/docs"}


@app.get("/api/news")
async def get_news():
    """Get all latest AI-curated news articles."""
    try:
        articles = get_cached_articles()
        return {"status": "success", "count": len(articles), "data": articles}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/news/categories")
async def get_categories():
    """Get all available news categories."""
    try:
        articles = get_cached_articles()
        cats = list(set(a["category"] for a in articles))
        return {"status": "success", "categories": sorted(cats)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/news/category/{category_name}")
async def get_news_by_category(category_name: str):
    """Get news articles filtered by a specific category."""
    try:
        articles = get_cached_articles()
        filtered = [
            a for a in articles
            if a["category"].lower() == category_name.lower()
        ]
        return {
            "status": "success",
            "category": category_name,
            "count": len(filtered),
            "data": filtered,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/news/trending")
async def get_trending(top_n: int = Query(default=10, ge=1, le=30)):
    """Get the top trending topics from today's news."""
    try:
        articles = get_cached_articles()
        trending = get_trending_topics(articles, top_n=top_n)
        return {"status": "success", "trending": trending}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/news/search")
async def search_news(q: str = Query(..., min_length=2)):
    """Search news articles by keyword."""
    try:
        articles = get_cached_articles()
        q_lower = q.lower()
        results = [
            a for a in articles
            if q_lower in a["title"].lower() or q_lower in a["summary"].lower()
        ]
        return {"status": "success", "query": q, "count": len(results), "data": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/news/stats")
async def get_stats():
    """Get analytics: category distribution, sentiment breakdown, source breakdown."""
    try:
        articles = get_cached_articles()
        category_dist = dict(Counter(a["category"] for a in articles))
        sentiment_dist = dict(Counter(a["sentiment"] for a in articles))
        source_dist = dict(Counter(a["source"] for a in articles).most_common(10))
        return {
            "status": "success",
            "total": len(articles),
            "category_distribution": category_dist,
            "sentiment_distribution": sentiment_dist,
            "source_distribution": source_dist,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class SubscribeRequest(BaseModel):
    email: EmailStr

@app.post("/api/subscribe")
async def subscribe_newsletter(req: SubscribeRequest):
    """Subscribe to the daily email newsletter."""
    try:
        subscribers = []
        try:
            with open("subscribers.json", "r") as f:
                subscribers = json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            pass
        
        if req.email not in subscribers:
            subscribers.append(req.email)
            with open("subscribers.json", "w") as f:
                json.dump(subscribers, f)
                
        return {"status": "success", "message": "Successfully subscribed!"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/test-email")
async def test_email():
    """Immediately trigger the newsletter email for testing."""
    try:
        scheduled_newsletter()
        return {"status": "success", "message": "Email job triggered in background"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=7860, reload=True)
