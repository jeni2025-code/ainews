import feedparser

# Using a few popular tech news RSS feeds for demonstration
RSS_FEEDS = [
    "https://news.ycombinator.com/rss",
    "https://techcrunch.com/feed/"
]

def fetch_latest_news(limit_per_feed=5):
    """Fetches the latest news from configured RSS feeds."""
    articles = []
    
    for feed_url in RSS_FEEDS:
        parsed_feed = feedparser.parse(feed_url)
        
        for entry in parsed_feed.entries[:limit_per_feed]:
            articles.append({
                "title": entry.title,
                "link": entry.link,
                "source": parsed_feed.feed.get("title", "Unknown Source"),
                "published": entry.get("published", "")
            })
            
    return articles
