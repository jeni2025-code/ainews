import random
from collections import Counter

# Keywords mapped to categories for smarter classification
CATEGORY_KEYWORDS = {
    "AI": [
        "ai", "artificial intelligence", "machine learning", "deep learning",
        "llm", "gpt", "openai", "gemini", "claude", "neural", "chatgpt",
        "generative", "model", "transformer", "automation", "robot"
    ],
    "Security": [
        "hack", "breach", "vulnerability", "malware", "ransomware", "phishing",
        "exploit", "cybersecurity", "security", "threat", "attack", "leak",
        "password", "encryption", "zero-day", "patch", "cve"
    ],
    "Startups": [
        "startup", "funding", "venture", "series a", "series b", "ipo",
        "unicorn", "founder", "investor", "seed", "raise", "valuation",
        "acquisition", "merger", "scaleup"
    ],
    "Programming": [
        "code", "developer", "software", "open source", "github", "api",
        "framework", "library", "python", "javascript", "typescript", "rust",
        "kubernetes", "docker", "devops", "cloud", "aws", "azure"
    ],
    "Gadgets": [
        "device", "hardware", "smartphone", "iphone", "android", "laptop",
        "chip", "processor", "gpu", "apple", "samsung", "pixel", "tablet",
        "wearable", "headset", "vr", "ar"
    ],
    "Science": [
        "research", "study", "scientist", "discovery", "space", "nasa",
        "biology", "climate", "quantum", "physics", "medicine", "health",
        "breakthrough", "experiment"
    ],
    "Business": [
        "earnings", "revenue", "profit", "market", "stock", "economy",
        "company", "ceo", "enterprise", "layoff", "hiring", "google",
        "microsoft", "apple", "meta", "amazon"
    ],
}

SENTIMENT_WORDS = {
    "Positive": [
        "breakthrough", "success", "launch", "growth", "improve", "win",
        "new", "innovation", "record", "partnership", "release", "funding"
    ],
    "Negative": [
        "hack", "breach", "fail", "layoff", "lawsuit", "ban", "drop",
        "crash", "threat", "risk", "leak", "exploit", "outage"
    ],
}


def classify_category(title: str, summary: str) -> str:
    text = (title + " " + summary).lower()
    scores = {}
    for category, keywords in CATEGORY_KEYWORDS.items():
        scores[category] = sum(1 for kw in keywords if kw in text)
    best = max(scores, key=scores.get)
    # Fall back to random if no keyword matched
    return best if scores[best] > 0 else random.choice(list(CATEGORY_KEYWORDS.keys()))


def classify_sentiment(title: str, summary: str) -> str:
    text = (title + " " + summary).lower()
    pos = sum(1 for w in SENTIMENT_WORDS["Positive"] if w in text)
    neg = sum(1 for w in SENTIMENT_WORDS["Negative"] if w in text)
    if pos > neg:
        return "Positive"
    elif neg > pos:
        return "Negative"
    return "Neutral"


def process_news_articles(articles):
    """
    Processes raw articles with smart keyword-based AI categorisation & sentiment.
    """
    processed = []
    for article in articles:
        title = article.get("title", "")
        raw_summary = article.get("raw_summary", "")

        category = classify_category(title, raw_summary)
        sentiment = classify_sentiment(title, raw_summary)

        # Generate a concise mock AI summary
        if raw_summary:
            ai_summary = raw_summary[:200] + ("..." if len(raw_summary) > 200 else "")
        else:
            ai_summary = f"AI-curated insight: {title[:100]}"

        processed.append({
            "title": title,
            "url": article.get("link", ""),
            "source": article.get("source", ""),
            "published": article.get("published", ""),
            "summary": ai_summary,
            "category": category,
            "sentiment": sentiment,
        })

    return processed


def get_trending_topics(articles, top_n=10):
    """Extract trending keywords from article titles."""
    STOP_WORDS = {
        "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for",
        "of", "with", "is", "are", "was", "were", "be", "been", "has", "have",
        "had", "that", "this", "it", "its", "from", "by", "as", "up", "out",
        "not", "no", "new", "will", "can", "more", "how", "why", "what", "who",
        "when", "i", "you", "he", "she", "we", "they", "their", "your", "our",
        "about", "after", "into", "over", "than", "then", "there", "s", "t"
    }
    words = []
    for article in articles:
        tokens = article.get("title", "").lower().split()
        for token in tokens:
            clean = token.strip(".,!?\"'():;-")
            if len(clean) > 3 and clean not in STOP_WORDS:
                words.append(clean)

    counter = Counter(words)
    return [{"topic": word, "count": count} for word, count in counter.most_common(top_n)]
