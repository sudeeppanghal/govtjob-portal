import sys
import os
import io
from datetime import datetime
from bs4 import BeautifulSoup

# Force UTF-8 encoding on standard output/error to prevent encoding crashes on Windows
if sys.platform.startswith('win'):
    try:
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
        sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')
    except Exception:
        pass

# Ensure scrapers folder is in the python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from scrapers.config import supabase
from scrapers.sources import scrape_all_sources
from scrapers.pdf_parser import extract_text_from_pdf_url, download_file
from scrapers.gemini_extractor import extract_with_gemini
from scrapers.fallback_generator import generate_fallback_article
from scrapers.sources.crawlers import safe_fetch
from scrapers.internal_linker import inject_internal_links
from scrapers.google_indexer import submit_to_google_indexing

def extract_html_text(url: str) -> str:
    """Helper to fetch HTML and extract text if url is not a PDF."""
    html = safe_fetch(url)
    if not html:
        return ""
    soup = BeautifulSoup(html, 'html.parser')
    
    # Remove script and style elements
    for script in soup(["script", "style", "nav", "footer", "header"]):
        script.decompose()
        
    text = soup.get_text(separator=' ')
    # Clean up whitespace
    lines = (line.strip() for line in text.splitlines())
    chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
    text = '\n'.join(chunk for chunk in chunks if chunk)
    return text[:20000] # Limit to 20k chars for HTML pages

def determine_sector(source_name: str, title: str, content: str, states: list) -> str:
    """Helper to classify a job notification into a specific sector."""
    source_lower = source_name.lower()
    title_lower = title.lower()
    content_lower = content.lower()
    
    # 1. Banking
    if any(x in source_lower for x in ["ibps", "sbi", "careers"]) or "bank" in title_lower or "bank" in content_lower:
        return "Banking"
        
    # 2. UPSC
    if "upsc" in source_lower or "union public service" in title_lower or "union public service" in content_lower:
        return "UPSC"
        
    # 3. SSC
    if "ssc" in source_lower or "staff selection" in title_lower or "staff selection" in content_lower:
        return "SSC"
        
    # 4. Railway
    if "rrb" in source_lower or "railway" in title_lower or "railway" in content_lower or "rrc" in title_lower:
        return "Railway"
        
    # 5. Defense / Police
    defense_keywords = [
        "police", "constable", "sub inspector", "sub-inspector", "inspector", "army", "navy", "air force", 
        "nda", "cds", "bsf", "crpf", "itbp", "cisf", "ssb", "guard", "rifleman", "jawan", "lieutenant", 
        "defense", "defence", "military", "airforce", "commando", "soldier"
    ]
    if any(kw in title_lower for kw in defense_keywords) or any(kw in content_lower for kw in defense_keywords):
        return "Defense / Police"
        
    # 6. Teaching
    teaching_keywords = [
        "teacher", "lecturer", "teaching", "professor", "tgt", "pgt", "prt", "tet", "ctet", "principal", "b.ed", "school"
    ]
    if any(kw in title_lower for kw in teaching_keywords) or any(kw in content_lower for kw in teaching_keywords):
        return "Teaching"
        
    # 7. State Jobs
    if states and len(states) > 0 and not any(s.lower() in ["national", "central"] for s in states):
        return "State Jobs"
        
    state_names = [
        "andhra pradesh", "arunachal pradesh", "assam", "bihar", "chhattisgarh", "goa", "gujarat", "haryana", 
        "himachal pradesh", "jharkhand", "karnataka", "kerala", "madhya pradesh", "maharashtra", "manipur", 
        "meghalaya", "mizoram", "nagaland", "odisha", "punjab", "rajasthan", "sikkim", "tamil nadu", "telangana", 
        "tripura", "uttar pradesh", "uttarakhand", "west bengal", "delhi", "chandigarh", "jammu", "kashmir", "ladakh"
    ]
    if any(st in title_lower for st in state_names) or any(st in content_lower for st in state_names):
        return "State Jobs"
        
    return "Others"

def process_single_notice(notice: dict) -> tuple:
    """Processes a single scraped notice. Returns (success_bool, ai_used_bool)"""
    url = notice['url']
    source = notice['source']
    category = notice['category']
    title = notice['title']

    # 1. Check if URL already exists in DB
    try:
        exists_check = supabase.table("notifications").select("id").eq("source_url", url).execute()
        if exists_check.data:
            print(f"Notice already processed, skipping: {url}")
            return False, False
    except Exception as e:
        print(f"Error checking DB for URL {url}: {e}")
        return False, False

    print(f"\nProcessing new notice: {title} ({url})")
    
    # 2. Extract Text (PDF or HTML page)
    if url.lower().endswith('.pdf'):
        text = extract_text_from_pdf_url(url)
    else:
        text = extract_html_text(url)
        
    if not text:
        print(f"Skipping notice, could not extract text from {url}")
        return False, False

    # 3. AI facts extraction and article content generation
    ai_used = False
    data = extract_with_gemini(text, category, source)
    
    if data:
        print("Gemini AI extraction successful.")
        ai_used = True
    else:
        print("Falling back to rule-based template generation.")
        data = generate_fallback_article(text, category, source, url, title)

    # 4. Insert Notification into Supabase
    try:
        # Dynamic OG cover image URL using Next.js Vercel OG API
        slug = data['slug']
        image_url = f"/api/og?title={slug}&source={source}&category={category}"
        
        # Run Auto-Siloing Internal Linker on article markdown
        linked_content = inject_internal_links(data['article_content'])
        
        # Determine sector
        sector = determine_sector(
            source_name=source,
            title=data['article_title'],
            content=data['article_content'],
            states=data.get('states', [])
        )
        
        # Validate and sanitize last_date to prevent database date-format crashes (e.g. from 'Not Mentioned')
        raw_last_date = data.get('last_date')
        clean_last_date = None
        if raw_last_date and re.match(r'^\d{4}-\d{2}-\d{2}$', str(raw_last_date).strip()):
            clean_last_date = str(raw_last_date).strip()

        insert_data = {
            "source_name": source,
            "source_url": url,
            "category": category,
            "title": title,
            "article_title": data['article_title'],
            "slug": slug,
            "extracted_json": data['extracted_json'],
            "article_content": linked_content,
            "meta_description": data['meta_description'],
            "schemas": data['schemas'],
            "status": "published",
            "last_date": clean_last_date,
            "qualifications": data['qualifications'],
            "states": data['states'],
            "image_url": image_url,
            "is_updated": False,
            "sector": sector
        }
        
        supabase.table("notifications").insert(insert_data).execute()
        print(f"Successfully published: {data['article_title']}")
        
        # Submit newly published URL to Google Search Indexing API
        is_yojana = category.lower() in ["sarkari yojana", "scholarship"]
        page_path = f"/yojana/{slug}" if is_yojana else f"/jobs/{slug}"
        published_url = f"https://railwayadmitcard.online{page_path}"
        submit_to_google_indexing(published_url)
        
        return True, ai_used
    except Exception as e:
        print(f"Error inserting notice into DB: {e}")
        return False, False

def main():
    print(f"Starting Scraper Run at {datetime.now().isoformat()}")
    
    # Insert crawl run log in DB
    crawl_log = {
        "status": "running",
        "new_notices": 0,
        "tokens_used": 0
    }
    
    crawl_id = None
    try:
        res = supabase.table("crawls").insert(crawl_log).execute()
        if res.data:
            crawl_id = res.data[0]['id']
    except Exception as e:
        print(f"Error logging crawl start in DB: {e}")

    # Start scraping
    success_count = 0
    ai_calls_count = 0
    error_log = []
    
    try:
        notices = scrape_all_sources()
        print(f"Scrape phase completed. Found {len(notices)} total notices.")
        
        for notice in notices:
            try:
                success, ai_used = process_single_notice(notice)
                if success:
                    success_count += 1
                if ai_used:
                    ai_calls_count += 1
            except Exception as notice_err:
                err_msg = f"Failed to process notice {notice.get('url')}: {notice_err}"
                print(err_msg)
                error_log.append(err_msg)

        # Update crawl run log on success
        if crawl_id:
            tokens_estimate = ai_calls_count * 1500 # rough estimation for logging
            supabase.table("crawls").update({
                "completed_at": datetime.now().isoformat(),
                "status": "success",
                "new_notices": success_count,
                "tokens_used": tokens_estimate,
                "error_log": "\n".join(error_log) if error_log else None
            }).eq("id", crawl_id).execute()
            
    except Exception as run_err:
        print(f"Main execution failed: {run_err}")
        if crawl_id:
            supabase.table("crawls").update({
                "completed_at": datetime.now().isoformat(),
                "status": "failed",
                "error_log": str(run_err)
            }).eq("id", crawl_id).execute()

    print(f"Scraper Run completed. Added {success_count} new entries.")

if __name__ == "__main__":
    main()
