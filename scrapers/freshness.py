import sys
import os
from datetime import datetime, timedelta
import re
from bs4 import BeautifulSoup

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from scrapers.config import supabase
from scrapers.sources.crawlers import safe_fetch

UPDATE_KEYWORDS = {
    "Admit Card": [r'admit card', r'call letter', r'hall ticket', r'e-admit', r'download admit'],
    "Result": [r'result declared', r'written result', r'merit list', r'cut-off marks', r'result link'],
    "Answer Key": [r'answer key', r'omr sheet', r'objection tracker', r'keys challenge'],
    "Date Extended": [r'date extended', r'last date extension', r'revised schedule', r'corrigendum']
}

def detect_updates_in_html(html_text: str, title: str) -> list:
    """Scans the page HTML text to detect if any updates related to the title occurred."""
    if not html_text:
        return []
        
    detected = []
    # Search for keywords
    for update_type, patterns in UPDATE_KEYWORDS.items():
        for pattern in patterns:
            # We look for the keyword close to a post name or general notices page
            if re.search(pattern, html_text, re.IGNORECASE):
                detected.append(update_type)
                break
    return detected

def update_article_with_banner(original_content: str, update_type: str, date_str: str) -> str:
    """Prepends a stylized markdown warning/alert block detailing the update."""
    banner_text = f"\n> [!IMPORTANT]\n> **UPDATE ({date_str}):** {update_type} has been released! Candidates can check the details or download the respective document via the links in the Important Links section below.\n\n"
    
    # Check if this update banner is already present to prevent duplicate prepends
    if f"UPDATE ({date_str}):** {update_type}" in original_content:
        return original_content
        
    # Append banner right after the main H1 header
    h1_match = re.search(r'^(#\s+.*?\n)', original_content)
    if h1_match:
        pos = h1_match.end()
        return original_content[:pos] + banner_text + original_content[pos:]
    else:
        return banner_text + original_content

def check_freshness():
    print(f"Starting Freshness System check at {datetime.now().isoformat()}")
    
    # Fetch articles published in the last 60 days that are active
    time_limit = (datetime.now() - timedelta(days=60)).strftime('%Y-%m-%d')
    
    try:
        res = supabase.table("notifications").select("id", "article_title", "source_url", "article_content", "is_updated").gte("created_at", time_limit).execute()
        active_articles = res.data or []
        print(f"Found {len(active_articles)} active articles to inspect.")
    except Exception as e:
        print(f"Error fetching active articles: {e}")
        return

    updated_count = 0
    today_str = datetime.now().strftime('%d-%m-%Y')
    
    for article in active_articles:
        url = article['source_url']
        content = article['article_content']
        title = article['article_title']
        article_id = article['id']
        
        # We fetch the latest html from the source URL
        print(f"Checking updates for: {title}")
        html = safe_fetch(url)
        if not html:
            continue
            
        soup = BeautifulSoup(html, 'html.parser')
        page_text = soup.get_text()
        
        detected_updates = detect_updates_in_html(page_text, title)
        if detected_updates:
            new_content = content
            for update in detected_updates:
                new_content = update_article_with_banner(new_content, update, today_str)
            
            # If content changed, push update to Supabase
            if new_content != content:
                print(f"--> Update detected for '{title}': {detected_updates}. Updating article in DB.")
                try:
                    supabase.table("notifications").update({
                        "article_content": new_content,
                        "is_updated": True,
                        "updated_at": datetime.now().isoformat()
                    }).eq("id", article_id).execute()
                    updated_count += 1
                except Exception as db_err:
                    print(f"Error saving update for {title}: {db_err}")
        else:
            print("No new updates detected.")

    print(f"Freshness check completed. Updated {updated_count} articles.")

if __name__ == "__main__":
    check_freshness()
