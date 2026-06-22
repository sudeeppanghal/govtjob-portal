import requests
from bs4 import BeautifulSoup, XMLParsedAsHTMLWarning
import urllib3
import re
import warnings

# Disable insecure request warnings for government sites with outdated SSL configs
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
warnings.filterwarnings("ignore", category=XMLParsedAsHTMLWarning)

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
    'Connection': 'keep-alive'
}

def safe_fetch(url: str) -> str:
    """Safely fetches HTML content from a URL with headers and timeout."""
    try:
        response = requests.get(url, headers=HEADERS, verify=False, timeout=20)
        if response.status_code == 200:
            return response.text
        else:
            print(f"Failed to fetch {url}. Status code: {response.status_code}")
            return ""
    except Exception as e:
        print(f"Error fetching {url}: {e}")
        return ""

def scrape_upsc() -> list:
    """Scrapes UPSC active notification links from What's New."""
    url = "https://upsc.gov.in/whats-new"
    html = safe_fetch(url)
    results = []
    if not html:
        return results

    soup = BeautifulSoup(html, 'html.parser')
    # Find all table rows or list elements containing links
    for a in soup.find_all('a', href=True):
        text = a.get_text(strip=True)
        href = a['href']
        
        # Look for PDF links or recruitment notices
        if 'recruitment' in href.lower() or 'examination' in href.lower() or href.endswith('.pdf'):
            full_url = href if href.startswith('http') else f"https://upsc.gov.in{href}"
            
            # Categorize
            category = "Job"
            if "result" in text.lower() or "written-result" in href.lower():
                category = "Result"
            elif "admit-card" in text.lower() or "e-admit" in href.lower():
                category = "Admit Card"
                
            if len(text) > 15: # Skip short labels
                results.append({
                    "title": text,
                    "url": full_url,
                    "category": category,
                    "source": "UPSC"
                })
    return results[:5]

def scrape_ssc() -> list:
    """Scrapes SSC notice links."""
    # Since SSC uses dynamic frontends, we look at the main portal alerts or RSS feeds
    url = "https://ssc.gov.in/candidate-portal/notices"
    # Fallback to homepage notices
    html = safe_fetch("https://ssc.gov.in/")
    results = []
    if not html:
        # SSC frequently has firewalls, fallback to rss or backup links
        return results

    soup = BeautifulSoup(html, 'html.parser')
    for a in soup.find_all('a', href=True):
        text = a.get_text(strip=True)
        href = a['href']
        if href.endswith('.pdf') or 'notice' in href.lower() or 'document' in href.lower():
            full_url = href if href.startswith('http') else f"https://ssc.gov.in{href}"
            category = "Job"
            if "result" in text.lower():
                category = "Result"
            elif "admit" in text.lower():
                category = "Admit Card"
            elif "answer" in text.lower():
                category = "Answer Key"
                
            if len(text) > 15:
                results.append({
                    "title": text,
                    "url": full_url,
                    "category": category,
                    "source": "SSC"
                })
    return results[:5]

def scrape_ibps() -> list:
    """Scrapes IBPS notice board."""
    url = "https://www.ibps.in/"
    html = safe_fetch(url)
    results = []
    if not html:
        return results

    soup = BeautifulSoup(html, 'html.parser')
    # IBPS uses marquee for scrolling new notifications
    marquee = soup.find('marquee')
    elements = marquee.find_all('a', href=True) if marquee else soup.find_all('a', href=True)
    
    for a in elements:
        text = a.get_text(strip=True)
        href = a['href']
        if 'crp' in href.lower() or href.endswith('.pdf') or 'notification' in href.lower():
            full_url = href if href.startswith('http') else f"https://www.ibps.in{href}"
            category = "Job"
            if "result" in text.lower():
                category = "Result"
            elif "admit" in text.lower() or "call-letter" in text.lower():
                category = "Admit Card"
            
            if len(text) > 15:
                results.append({
                    "title": text,
                    "url": full_url,
                    "category": category,
                    "source": "IBPS"
                })
    return results[:5]

def scrape_rrb() -> list:
    """Scrapes RRB Chandigarh (Central RRB portal)."""
    url = "https://www.rrbcdg.gov.in/"
    html = safe_fetch(url)
    results = []
    if not html:
        return results

    soup = BeautifulSoup(html, 'html.parser')
    # Parse table rows representing notices
    for a in soup.find_all('a', href=True):
        text = a.get_text(strip=True)
        href = a['href']
        if href.endswith('.pdf') or 'cen' in href.lower():
            full_url = href if href.startswith('http') else f"https://www.rrbcdg.gov.in/{href}"
            category = "Job"
            if "result" in text.lower() or "score" in text.lower():
                category = "Result"
            elif "admit" in text.lower() or "e-call" in text.lower():
                category = "Admit Card"
            elif "key" in text.lower():
                category = "Answer Key"
                
            if len(text) > 15:
                results.append({
                    "title": text,
                    "url": full_url,
                    "category": category,
                    "source": "RRB"
                })
    return results[:5]

def scrape_sbi() -> list:
    """Scrapes SBI Careers notifications."""
    url = "https://bank.sbi/web/careers"
    html = safe_fetch(url)
    results = []
    if not html:
        return results

    soup = BeautifulSoup(html, 'html.parser')
    # SBI Careers notices lists are usually in accordion blocks
    for a in soup.find_all('a', href=True):
        text = a.get_text(strip=True)
        href = a['href']
        if 'recruitment' in href.lower() or href.endswith('.pdf'):
            if 'advertisement' in text.lower() or 'notice' in text.lower():
                full_url = href if href.startswith('http') else f"https://bank.sbi{href}"
                category = "Job"
                if "result" in text.lower():
                    category = "Result"
                elif "letter" in text.lower():
                    category = "Admit Card"
                    
                if len(text) > 15:
                    results.append({
                        "title": text,
                        "url": full_url,
                        "category": category,
                        "source": "SBI Careers"
                    })
    return results[:5]

def scrape_ncs() -> list:
    """Scrapes National Career Service updates."""
    url = "https://www.ncs.gov.in/"
    html = safe_fetch(url)
    results = []
    if not html:
        return results

    soup = BeautifulSoup(html, 'html.parser')
    for a in soup.find_all('a', href=True):
        text = a.get_text(strip=True)
        href = a['href']
        if 'job' in href.lower() or 'notification' in href.lower():
            full_url = href if href.startswith('http') else f"https://www.ncs.gov.in{href}"
            if len(text) > 20:
                results.append({
                    "title": text,
                    "url": full_url,
                    "category": "Job",
                    "source": "NCS"
                })
    return results[:5]

def scrape_employment_news() -> list:
    """Scrapes Employment News website notice boards."""
    url = "https://employmentnews.gov.in/"
    html = safe_fetch(url)
    results = []
    if not html:
        return results

    soup = BeautifulSoup(html, 'html.parser')
    for a in soup.find_all('a', href=True):
        text = a.get_text(strip=True)
        href = a['href']
        if href.endswith('.pdf') or 'jobs' in href.lower():
            full_url = href if href.startswith('http') else f"https://employmentnews.gov.in/{href}"
            if len(text) > 15:
                results.append({
                    "title": text,
                    "url": full_url,
                    "category": "Job",
                    "source": "Employment News"
                })
    return results[:5]

def scrape_yojana() -> list:
    """Scrapes PIB press releases for Yojanas & Government Schemes."""
    url = "https://pib.gov.in/indexd.aspx" # Press Information Bureau (India)
    html = safe_fetch(url)
    results = []
    if not html:
        return results

    soup = BeautifulSoup(html, 'html.parser')
    for a in soup.find_all('a', href=True):
        text = a.get_text(strip=True)
        href = a['href']
        if 'pressrelease' in href.lower() or 'pib.gov.in/PressRelease' in href:
            full_url = href if href.startswith('http') else f"https://pib.gov.in{href}"
            # Filter schemes/yojana keyword
            if any(kw in text.lower() for kw in ['scheme', 'yojana', 'cabinet approves', 'scholarship', 'pension', 'subsidy', 'portal']):
                results.append({
                    "title": text,
                    "url": full_url,
                    "category": "Sarkari Yojana" if "scheme" in text.lower() or "yojana" in text.lower() else "Scholarship",
                    "source": "PIB Press"
                })
    return results[:5]

def scrape_rojgarlive() -> list:
    """Scrapes Rojgarlive latest Sarkari Naukri RSS feed."""
    url = "https://www.rojgarlive.com/category/sarkari-naukri/feed"
    html = safe_fetch(url)
    results = []
    if not html:
        return results

    try:
        soup = BeautifulSoup(html, 'html.parser')
        items = soup.find_all('item')
        for item in items:
            title = item.find('title').text if item.find('title') else ''
            
            # Extract link
            link_text = ''
            for child in item.children:
                if child.name == 'link':
                    link_text = child.text
                    if not link_text and child.next_sibling:
                        link_text = child.next_sibling.strip()
            
            if title and link_text:
                category = "Job"
                if "result" in title.lower():
                    category = "Result"
                elif "admit card" in title.lower() or "call letter" in title.lower():
                    category = "Admit Card"
                elif "answer key" in title.lower():
                    category = "Answer Key"
                    
                results.append({
                    "title": title,
                    "url": link_text,
                    "category": category,
                    "source": "Rojgarlive Feed"
                })
    except Exception as e:
        print(f"Error parsing Rojgarlive Feed: {e}")
        
    return results[:8]

def scrape_govtjobsblog() -> list:
    """Scrapes GovtJobsBlog RSS feed for state and central jobs."""
    url = "https://govtjobsblog.in/feed"
    html = safe_fetch(url)
    results = []
    if not html:
        return results

    try:
        soup = BeautifulSoup(html, 'html.parser')
        items = soup.find_all('item')
        for item in items:
            title = item.find('title').text if item.find('title') else ''
            
            # Extract link
            link_text = ''
            for child in item.children:
                if child.name == 'link':
                    link_text = child.text
                    if not link_text and child.next_sibling:
                        link_text = child.next_sibling.strip()
            
            if title and link_text:
                category = "Job"
                if "result" in title.lower():
                    category = "Result"
                elif "admit card" in title.lower():
                    category = "Admit Card"
                elif "answer key" in title.lower():
                    category = "Answer Key"
                elif "yojana" in title.lower() or "scheme" in title.lower():
                    category = "Sarkari Yojana"
                    
                results.append({
                    "title": title,
                    "url": link_text,
                    "category": category,
                    "source": "GovtJobsBlog Feed"
                })
    except Exception as e:
        print(f"Error parsing GovtJobsBlog Feed: {e}")
        
    return results[:8]

def scrape_sarkariyojnaa_portal() -> list:
    """Scrapes sarkariyojnaa.com RSS feed for government schemes."""
    url = "https://sarkariyojnaa.com/feed/"
    html = safe_fetch(url)
    results = []
    if not html:
        return results

    try:
        soup = BeautifulSoup(html, 'html.parser')
        items = soup.find_all('item')
        for item in items:
            title = item.find('title').text if item.find('title') else ''
            
            # Extract link
            link_text = ''
            for child in item.children:
                if child.name == 'link':
                    link_text = child.text
                    if not link_text and child.next_sibling:
                        link_text = child.next_sibling.strip()
            
            if title and link_text:
                category = "Sarkari Yojana"
                if "scholarship" in title.lower() or "chhatravriti" in title.lower():
                    category = "Scholarship"
                
                results.append({
                    "title": title,
                    "url": link_text,
                    "category": category,
                    "source": "Sarkari Yojana Portal"
                })
    except Exception as e:
        print(f"Error parsing Sarkari Yojana Feed: {e}")
        
    return results[:10]

def scrape_biharhelp_portal() -> list:
    """Scrapes biharhelp.in RSS feed for state schemes and scholarships."""
    url = "https://biharhelp.in/feed/"
    html = safe_fetch(url)
    results = []
    if not html:
        return results

    try:
        soup = BeautifulSoup(html, 'html.parser')
        items = soup.find_all('item')
        for item in items:
            title = item.find('title').text if item.find('title') else ''
            
            # Extract link
            link_text = ''
            for child in item.children:
                if child.name == 'link':
                    link_text = child.text
                    if not link_text and child.next_sibling:
                        link_text = child.next_sibling.strip()
            
            if title and link_text:
                category = "Sarkari Yojana"
                title_lower = title.lower()
                if "scholarship" in title_lower or "scholar" in title_lower or "chhatravriti" in title_lower or "स्कॉलरशिप" in title:
                    category = "Scholarship"
                elif "admit card" in title_lower or "admit-card" in title_lower or "प्रवेश पत्र" in title:
                    category = "Admit Card"
                elif "result" in title_lower or "परिणाम" in title:
                    category = "Result"
                elif "vacancy" in title_lower or "recruitment" in title_lower or "bharti" in title_lower or "नौकरी" in title or "job" in title_lower:
                    category = "Job"
                elif "answer key" in title_lower or "उत्तर कुंजी" in title:
                    category = "Answer Key"
                
                results.append({
                    "title": title,
                    "url": link_text,
                    "category": category,
                    "source": "Bihar Help Portal"
                })
    except Exception as e:
        print(f"Error parsing Bihar Help Feed: {e}")
        
    return results[:10]

def scrape_all_sources() -> list:
    """Orchestrates all source crawlers and combines their notices."""
    all_notices = []
    crawlers = [
        scrape_upsc,
        scrape_ssc,
        scrape_ibps,
        scrape_rrb,
        scrape_sbi,
        scrape_ncs,
        scrape_employment_news,
        scrape_yojana,
        scrape_rojgarlive,
        scrape_govtjobsblog,
        scrape_sarkariyojnaa_portal,
        scrape_biharhelp_portal
    ]
    for crawler in crawlers:
        try:
            print(f"Running crawler: {crawler.__name__}")
            items = crawler()
            print(f"Found {len(items)} items.")
            all_notices.extend(items)
        except Exception as e:
            print(f"Error executing crawler {crawler.__name__}: {e}")
            
    # Deduplicate by url
    seen_urls = set()
    deduped = []
    for item in all_notices:
        if item['url'] not in seen_urls:
            seen_urls.add(item['url'])
            deduped.append(item)
    return deduped
