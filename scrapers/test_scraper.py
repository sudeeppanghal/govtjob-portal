import sys
import os
import io

# Force UTF-8 encoding on standard output/error to prevent encoding crashes on Windows
if sys.platform.startswith('win'):
    try:
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
        sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')
    except Exception:
        pass

# Put current path into sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from scrapers.sources.crawlers import scrape_upsc, scrape_sarkariyojnaa_portal, scrape_biharhelp_portal
from scrapers.fallback_generator import generate_fallback_article
from scrapers.config import supabase

def run_tests():
    print("=== TEST 1: Crawling UPSC What's New ===")
    try:
        notices = scrape_upsc()
        print(f"Success! Found {len(notices)} notices.")
        for idx, item in enumerate(notices):
            print(f"[{idx+1}] Source: {item['source']} | Cat: {item['category']} | Title: {item['title'][:60]}... \n    URL: {item['url']}")
    except Exception as e:
        print(f"UPSC crawler test failed: {e}")

    print("\n=== TEST 1B: Crawling Sarkari Yojana Portal Feed ===")
    try:
        yojana_items = scrape_sarkariyojnaa_portal()
        print(f"Success! Found {len(yojana_items)} items.")
        for idx, item in enumerate(yojana_items[:3]):
            print(f"[{idx+1}] Source: {item['source']} | Cat: {item['category']} | Title: {item['title'][:60]}... \n    URL: {item['url']}")
    except Exception as e:
        print(f"Sarkari Yojana crawler test failed: {e}")

    print("\n=== TEST 1C: Crawling Bihar Help Portal Feed ===")
    try:
        bihar_items = scrape_biharhelp_portal()
        print(f"Success! Found {len(bihar_items)} items.")
        for idx, item in enumerate(bihar_items[:3]):
            print(f"[{idx+1}] Source: {item['source']} | Cat: {item['category']} | Title: {item['title'][:60]}... \n    URL: {item['url']}")
    except Exception as e:
        print(f"Bihar Help crawler test failed: {e}")

    print("\n=== TEST 2: Testing Rule-Based Fallback Generator ===")
    mock_notice_text = """
    UNION PUBLIC SERVICE COMMISSION
    ADVERTISEMENT NO. 05/2026
    LAST DATE FOR RECEIPT OF APPLICATIONS IS 15/07/2026.
    The Commission invites applications for 150 posts of Assistant Director.
    Age Limit: Minimum 18 years, Maximum 35 years.
    Qualification: Graduate Degree in Engineering or equivalent.
    Application Fee: Rs. 100/- for General/OBC. SC/ST/Women candidates are exempted.
    Apply online at www.upsconline.nic.in
    """
    try:
        data = generate_fallback_article(
            pdf_text=mock_notice_text,
            category="Job",
            source_name="UPSC",
            source_url="https://upsc.gov.in/mock-notice.pdf",
            title="UPSC Assistant Director Recruitment 2026"
        )
        print("Success! Generated fallback article.")
        print(f"Title: {data['article_title']}")
        print(f"Slug: {data['slug']}")
        print(f"Qualifications extracted: {data['qualifications']}")
        print(f"Last date extracted: {data['last_date']}")
        print(f"Vacancies extracted: {data['extracted_json']['vacancies']}")
        print(f"Article content snippet (first 200 chars):\n{data['article_content'][:200]}...")
    except Exception as e:
        print(f"Fallback generator test failed: {e}")

    print("\n=== TEST 3: Testing Supabase Database Connection ===")
    try:
        # Check connection by fetching a simple count from notifications
        res = supabase.table("notifications").select("id", count="exact").limit(1).execute()
        print("Success! Connected to Supabase.")
        print(f"Total existing notifications in database: {res.count if res.count is not None else 0}")
    except Exception as e:
        print(f"Supabase connection test failed: {e}")
        print("Please check your .env variables (SUPABASE_URL and SUPABASE_SERVICE_KEY).")

    print("\n=== TEST 4: Testing Auto-Siloing Internal Linker ===")
    try:
        from scrapers.internal_linker import inject_internal_links
        mock_markdown = "Candidates with 12th pass qualifications or a Graduate degree can check their result."
        linked = inject_internal_links(mock_markdown)
        print("Success! Injected internal links.")
        print(f"Original: {mock_markdown}")
        print(f"Linked:   {linked}")
    except Exception as e:
        print(f"Linker test failed: {e}")

if __name__ == "__main__":
    run_tests()
