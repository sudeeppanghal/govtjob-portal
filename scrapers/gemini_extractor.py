import json
import re
import google.generativeai as genai
from scrapers.config import GEMINI_API_KEY

def clean_slug(slug_str: str) -> str:
    """Cleans a string to make it a valid URL slug."""
    slug_str = slug_str.lower()
    slug_str = re.sub(r'[^a-z0-9\s-]', '', slug_str)
    slug_str = re.sub(r'[\s-]+', '-', slug_str)
    return slug_str.strip('-')

def clean_json_text(text: str) -> str:
    """Cleans invalid backslash escape sequences from raw model output JSON string."""
    text = text.strip()
    # Remove markdown code block wrappers if present
    if text.startswith("```json"):
        text = text[7:]
    elif text.startswith("```"):
        text = text[3:]
    if text.endswith("```"):
        text = text[:-3]
    text = text.strip()

    fixed_chars = []
    i = 0
    n = len(text)
    while i < n:
        if text[i] == '\\':
            if i + 1 < n:
                next_char = text[i+1]
                # Check if it's a standard JSON escape
                if next_char in ['"', '\\', '/', 'b', 'f', 'n', 'r', 't']:
                    fixed_chars.append('\\')
                    fixed_chars.append(next_char)
                    i += 2
                # Check if it's a unicode escape
                elif next_char == 'u' and i + 5 < n and all(c in '0123456789abcdefABCDEF' for c in text[i+2:i+6]):
                    fixed_chars.append(text[i:i+6])
                    i += 6
                else:
                    # Invalid escape sequence! Escape the backslash
                    fixed_chars.append('\\\\')
                    i += 1
            else:
                # Trailing backslash, escape it
                fixed_chars.append('\\\\')
                i += 1
        else:
            fixed_chars.append(text[i])
            i += 1
            
    return "".join(fixed_chars)

def extract_with_gemini(pdf_text: str, category: str, source_name: str) -> dict:
    """Uses Gemini API to extract details from notice text and generate SEO-optimized article.
    Returns a dict containing article title, content, SEO metadata, and schemas.
    Returns None if the call fails or quota is exceeded.
    """
    if not GEMINI_API_KEY:
        print("Gemini API key is not configured. Skipping AI extraction.")
        return None

    # Define model configurations
    generation_config = {
        "temperature": 0.2,
        "top_p": 0.95,
        "max_output_tokens": 8192,
        "response_mime_type": "application/json",
    }

    system_instruction = (
        "You are an expert AI SEO copywriter and data extractor specialized in Indian Government notifications "
        "(Sarkari Exam, Results, Admit Cards, Scholarships, and Yojanas).\n"
        "Your task is to analyze the raw text of an official notification and output a structured JSON response. "
        "Strictly follow the JSON structure defined below. Do not fabricate facts. If any field is not present in "
        "the text, use 'Not Mentioned' or an empty array.\n\n"
        "To optimize for Google E-E-A-T and Search Guidelines, write detailed, informative, and complete content (800-1500 words). "
        "Use bullet lists and HTML-friendly Markdown tables for quick fact parsing.\n\n"
        "JSON SCHEMA:\n"
        "{\n"
        "  \"article_title\": \"SEO-optimized, catchy title containing key terms (e.g., 'SSC CGL Recruitment 2026: Apply Online for 17727 Vacancies')\",\n"
        "  \"slug\": \"clean-url-slug (e.g., 'ssc-cgl-recruitment-2026')\",\n"
        "  \"meta_description\": \"Compelling meta description under 160 characters containing key search keywords\",\n"
        "  \"qualifications\": [\"Array of education levels required, select from: 10th, 12th, Graduate, Post Graduate, B.Tech, ITI, Diploma, LLB, MBBS, PhD\"],\n"
        "  \"states\": [\"Array of states target (e.g., 'Uttar Pradesh', 'Maharashtra') or 'Central' if national\"],\n"
        "  \"last_date\": \"YYYY-MM-DD (Extract application closing date. Use null if not found or not applicable)\",\n"
        "  \"extracted_json\": {\n"
        "    \"vacancies\": \"Number of total vacancies or summary string (e.g. '17,727 Posts')\",\n"
        "    \"age_limit\": \"Min/max age requirements and relaxation details\",\n"
        "    \"qualification\": \"Education eligibility summary\",\n"
        "    \"salary\": \"Salary scale / Pay level details\",\n"
        "    \"fee\": {\"General/OBC\": \"Rs. 100\", \"SC/ST/PwD\": \"Nil\", \"Female\": \"Nil\"},\n"
        "    \"selection_process\": [\"Stage 1: Tier 1 Exam\", \"Stage 2: Tier 2 Exam\", \"Stage 3: Document Verification\"],\n"
        "    \"important_dates\": {\n"
        "      \"start_date\": \"Application start date\",\n"
        "      \"end_date\": \"Application end date\",\n"
        "      \"exam_date\": \"Exam date (if mentioned)\",\n"
        "      \"result_date\": \"Result date (if mentioned)\"\n"
        "    }\n"
        "  },\n"
        "  \"article_content\": \"Full markdown-formatted article. Must be long, detailed, and clear. Include: \n"
        "     - Introduction (brief overview)\n"
        "     - Important Dates Table (application start/end dates, exam date)\n"
        "     - Vacancy & Post-wise Details Table (number of openings per post/category)\n"
        "     - Eligibility Criteria (Age Limit, Qualification)\n"
        "       * Add H3 subheadings for: '### Age Relaxation & Category-wise Limits' and '### In-depth Salary Scale & Allowances'\n"
        "     - Application Fee Details\n"
        "     - Selection Process Steps\n"
        "       * Add H3 subheading for: '### Syllabus & Exam Pattern Details' (outline exam stages, duration, and subjects)\n"
        "     - How to Apply Steps (step-by-step registration guidelines)\n"
        "     - Important Links Section (Notification PDF link, Online Apply Link)\n"
        "     - FAQ Section (Exactly 5 highly searched user questions and answers regarding syllabus, fee, age limit, dates, eligibility)\n"
        "     - Disclaimer Footer: prepended with '> **Disclaimer:** This information is sourced directly from official announcements. Always verify details on the official portal.'\",\n"
        "  \"schemas\": {\n"
        "    \"job_posting\": { /* Valid Schema.org JobPosting object or null if category is not 'Job' */ },\n"
        "    \"faq\": { /* Valid Schema.org FAQPage object representing the FAQ Section questions */ },\n"
        "    \"breadcrumb\": { /* Valid Schema.org BreadcrumbList object */ }\n"
        "  }\n"
        "}"
    )

    prompt = (
        f"Category: {category}\n"
        f"Source Organiser: {source_name}\n"
        f"Notification Text:\n{pdf_text[:40000]}" # Limit to first 40,000 chars to save token limits
    )

    try:
        model = genai.GenerativeModel(
            model_name="gemini-2.5-flash",
            generation_config=generation_config,
            system_instruction=system_instruction
        )
        
        response = model.generate_content(prompt)
        cleaned_text = clean_json_text(response.text)
        result_json = json.loads(cleaned_text, strict=False)
        
        # Post-process verification
        if 'article_title' not in result_json or 'article_content' not in result_json:
            print("Missing critical fields in Gemini output.")
            return None
            
        result_json['slug'] = clean_slug(result_json.get('slug', result_json['article_title']))
        return result_json

    except Exception as e:
        print(f"Gemini API execution failed or rate limit hit: {e}")
        return None
