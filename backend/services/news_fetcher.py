import feedparser
from datetime import datetime, timezone

# Expanded RSS feeds covering more categories
RSS_FEEDS = [
    # Tech / AI
    {"url": "https://techcrunch.com/feed/", "label": "TechCrunch"},
    {"url": "https://news.ycombinator.com/rss", "label": "Hacker News"},
    {"url": "https://www.theverge.com/rss/index.xml", "label": "The Verge"},
    {"url": "https://feeds.wired.com/wired/index", "label": "Wired"},
    {"url": "https://www.technologyreview.com/feed/", "label": "MIT Tech Review"},
    # Security
    {"url": "https://krebsonsecurity.com/feed/", "label": "Krebs on Security"},
    {"url": "https://www.schneier.com/feed/atom/", "label": "Schneier on Security"},
    # Science
    {"url": "https://www.sciencedaily.com/rss/top/technology.xml", "label": "Science Daily"},
    # Startups / Business
    {"url": "https://feeds.feedburner.com/venturebeat/SZYF", "label": "VentureBeat"},
]

def fetch_latest_news(limit_per_feed=6):
    """Fetches the latest news from configured RSS feeds."""
    articles = []

    for feed_config in RSS_FEEDS:
        try:
            parsed_feed = feedparser.parse(feed_config["url"])
            for entry in parsed_feed.entries[:limit_per_feed]:
                # Try to get summary/description
                summary_raw = (
                    entry.get("summary", "")
                    or entry.get("description", "")
                    or ""
                )
                # Strip HTML tags roughly
                import re
                summary_clean = re.sub(r"<[^>]+>", "", summary_raw)[:300]

                articles.append({
                    "title": entry.get("title", "Untitled"),
                    "link": entry.get("link", ""),
                    "source": feed_config["label"],
                    "published": entry.get("published", ""),
                    "raw_summary": summary_clean,
                })
        except Exception:
            # Skip broken feeds gracefully
            continue

    return articles
