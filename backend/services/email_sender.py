import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import os
import json
import logging

logger = logging.getLogger(__name__)

SMTP_SERVER = os.environ.get("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.environ.get("SMTP_PORT", 587))
SMTP_USER = os.environ.get("SMTP_USER", "")
SMTP_PASS = os.environ.get("SMTP_PASS", "")

def get_subscribers():
    try:
        with open("subscribers.json", "r") as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return []

def send_daily_newsletter(articles, trending_topics):
    subscribers = get_subscribers()
    if not subscribers:
        logger.info("No subscribers found for daily newsletter.")
        return

    # Build the HTML content
    html_content = f"""
    <html>
    <body style="font-family: Arial, sans-serif; background-color: #f4f4f5; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; padding: 20px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
            <h1 style="color: #2563eb; text-align: center;">⚡ AI News Intel - Daily Brief</h1>
            <p style="color: #4b5563; text-align: center;">Your daily curation of the most important tech & AI stories.</p>
            
            <h2 style="color: #f97316; border-bottom: 2px solid #f97316; padding-bottom: 5px;">🔥 Top Trending Today</h2>
            <ul style="color: #374151;">
                {''.join(f"<li><b>{t['topic']}</b> ({t['count']} mentions)</li>" for t in trending_topics[:5])}
            </ul>

            <h2 style="color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 5px;">📰 Top Stories</h2>
    """

    for art in articles[:10]:
        sentiment_color = "#16a34a" if art['sentiment'] == "Positive" else "#dc2626" if art['sentiment'] == "Negative" else "#3b82f6"
        html_content += f"""
            <div style="margin-bottom: 20px; padding: 15px; border-left: 4px solid {sentiment_color}; background: #f8fafc;">
                <span style="font-size: 12px; font-weight: bold; color: {sentiment_color}; text-transform: uppercase;">{art['category']} • {art['source']}</span>
                <h3 style="margin: 5px 0;"><a href="{art['url']}" style="color: #1e293b; text-decoration: none;">{art['title']}</a></h3>
                <p style="font-size: 14px; color: #475569; margin-bottom: 0;">{art['summary'][:150]}...</p>
            </div>
        """

    html_content += """
            <p style="text-align: center; color: #9ca3af; font-size: 12px; margin-top: 30px;">
                You are receiving this because you subscribed to AI News Intel.<br>
                <a href="#" style="color: #9ca3af;">Unsubscribe</a>
            </p>
        </div>
    </body>
    </html>
    """

    # If no SMTP credentials, just mock it
    if not SMTP_USER or not SMTP_PASS:
        logger.warning(f"SMTP credentials not set. Mock sending email to {len(subscribers)} subscribers.")
        logger.debug(html_content)
        return

    # Send via SMTP
    try:
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(SMTP_USER, SMTP_PASS)

        for email_addr in subscribers:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = "Your Daily AI & Tech Brief 🚀"
            msg["From"] = f"AI News Intel <{SMTP_USER}>"
            msg["To"] = email_addr
            
            part = MIMEText(html_content, "html")
            msg.attach(part)
            
            server.sendmail(SMTP_USER, email_addr, msg.as_string())
            
        server.quit()
        logger.info(f"Successfully sent newsletter to {len(subscribers)} subscribers.")
    except Exception as e:
        logger.error(f"Failed to send email: {str(e)}")
