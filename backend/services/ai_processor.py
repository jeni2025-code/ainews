import os
import random

def process_news_articles(articles):
    """
    Processes the raw articles.
    In a real app, this would call OpenAI, Gemini, etc. to categorize and summarize.
    Since we don't have an API key, we'll simulate the AI processing with dummy categories.
    """
    
    categories = ["AI", "Startups", "Programming", "Gadgets", "Security"]
    
    processed = []
    for article in articles:
        # Mock AI summary
        mock_summary = f"This is an AI-generated summary for the article '{article['title']}'. It discusses key insights from {article['source']}."
        
        # Mock AI categorization
        mock_category = random.choice(categories)
        
        processed.append({
            "title": article["title"],
            "url": article["link"],
            "source": article["source"],
            "published": article["published"],
            "summary": mock_summary,
            "category": mock_category,
            "sentiment": random.choice(["Positive", "Neutral", "Neutral", "Negative"])
        })
        
    return processed
