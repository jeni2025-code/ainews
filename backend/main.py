from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from services.news_fetcher import fetch_latest_news
from services.ai_processor import process_news_articles

app = FastAPI(title="AI News API")

# Configure CORS for the Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://jeni2025-ainews.hf.space",
        "*"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/news")
async def get_news():
    try:
        # 1. Fetch raw news from RSS feeds
        raw_articles = fetch_latest_news()
        
        # 2. Process/summarize articles using AI
        processed_articles = process_news_articles(raw_articles)
        
        return {"status": "success", "data": processed_articles}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
