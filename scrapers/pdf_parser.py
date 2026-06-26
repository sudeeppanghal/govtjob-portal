import os
import tempfile
import requests
import pdfplumber

def download_file(url: str, temp_file_path: str) -> bool:
    """Downloads a file from a URL to a temporary local path."""
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    try:
        response = requests.get(url, headers=headers, timeout=30, stream=True, verify=False)
        if response.status_code == 200:
            with open(temp_file_path, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    f.write(chunk)
            return True
        else:
            print(f"Failed to download PDF from {url}. Status code: {response.status_code}")
            return False
    except Exception as e:
        print(f"Error downloading PDF from {url}: {e}")
        return False

def extract_text_from_pdf_url(url: str, max_pages: int = 15) -> str:
    """Downloads a PDF from url and extracts text.
    If the document has more than max_pages, it extracts the first max_pages - 3 pages
    and the last 3 pages, where crucial application dates and fees are typically placed.
    """
    if not url.lower().endswith('.pdf'):
        print(f"URL is not a PDF link: {url}")
        return ""

    with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as temp_file:
        temp_path = temp_file.name

    try:
        if not download_file(url, temp_path):
            return ""

        extracted_text = []
        with pdfplumber.open(temp_path) as pdf:
            total_pages = len(pdf.pages)
            print(f"PDF {url} has {total_pages} pages.")
            
            if total_pages <= max_pages:
                pages_to_read = list(range(total_pages))
            else:
                # Read first portion and the very end
                first_part = list(range(max_pages - 3))
                last_part = list(range(total_pages - 3, total_pages))
                pages_to_read = first_part + last_part

            for page_num in pages_to_read:
                if page_num < total_pages:
                    page = pdf.pages[page_num]
                    text = page.extract_text()
                    if text:
                        extracted_text.append(f"--- Page {page_num + 1} ---\n{text}")

        return "\n\n".join(extracted_text)

    except Exception as e:
        print(f"Error parsing PDF from {url}: {e}")
        return ""
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)
