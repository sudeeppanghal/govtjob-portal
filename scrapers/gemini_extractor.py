import json
import re
import os
import requests
import google.generativeai as genai
from scrapers.config import GEMINI_API_KEYS

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

def fill_defaults(result_json: dict, source_name: str, category: str) -> dict:
    """Fills default values for missing keys in parsed AI output to prevent KeyErrors."""
    if 'article_title' not in result_json:
        result_json['article_title'] = f"{source_name} {category} Notification"
    result_json['slug'] = clean_slug(result_json.get('slug', result_json['article_title']))
    result_json['meta_description'] = result_json.get('meta_description', '')
    result_json['qualifications'] = result_json.get('qualifications', [])
    result_json['states'] = result_json.get('states', [])
    result_json['last_date'] = result_json.get('last_date', None)
    result_json['extracted_json'] = result_json.get('extracted_json', {})
    result_json['article_content'] = result_json.get('article_content', '')
    result_json['schemas'] = result_json.get('schemas', {})
    return result_json

def extract_with_groq(prompt: str, system_instruction: str, source_name: str, category: str) -> dict:
    """Uses Groq API as a fallback to extract details and generate content in JSON format."""
    groq_key = os.getenv("GROQ_API_KEY")
    if not groq_key:
        print("Groq API key is not configured. Skipping Groq fallback.")
        return None

    # Try models sequentially
    models = ["llama-3.3-70b-versatile", "llama-3.1-8b-instant", "mixtral-8x7b-32768"]
    url = "https://api.groq.com/openai/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {groq_key}",
        "Content-Type": "application/json"
    }

    for model in models:
        try:
            print(f"Attempting Groq extraction using model: {model}...")
            payload = {
                "model": model,
                "messages": [
                    {"role": "system", "content": system_instruction},
                    {"role": "user", "content": prompt}
                ],
                "temperature": 0.2,
                "max_tokens": 4096,
                "response_format": {"type": "json_object"}
            }
            # Timeout in 35 seconds
            response = requests.post(url, headers=headers, json=payload, timeout=35)
            if response.status_code == 200:
                res_data = response.json()
                content = res_data['choices'][0]['message']['content']
                cleaned_text = clean_json_text(content)
                result_json = json.loads(cleaned_text, strict=False)
                
                # Verify structure
                if 'article_title' in result_json and 'article_content' in result_json:
                    print(f"Groq extraction successful with model {model}.")
                    return fill_defaults(result_json, source_name, category)
                else:
                    print(f"Groq model {model} returned JSON, but it is missing critical fields.")
            else:
                print(f"Groq API {model} failed with status {response.status_code}: {response.text}")
        except Exception as e:
            print(f"Groq API model {model} execution failed: {e}")

    return None

def extract_with_gemini(pdf_text: str, category: str, source_name: str) -> dict:
    """Uses Gemini API with key rotation, falling back to Groq Llama 3 if needed."""
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
        "To optimize for Google E-E-A-T and Search Guidelines, write detailed, informative, and complete content. "
        "Use bullet lists and HTML-friendly Markdown tables for quick fact parsing.\n\n"
        "Style Guidelines:\n"
        "- Write in a highly engaging, professional yet conversational, human-like tone that completely bypasses AI detectors. Avoid robotic phrases like 'Furthermore', 'In summary', 'Consequently', 'Moreover', 'Crucial', 'It is important to note'. Use active verbs.\n"
        "- For Hindi translation, use natural and popular Hindi search phrasing (e.g. use 'आवेदन कैसे करें' or 'पात्रता' rather than awkward direct translations like 'चरण-दर-चरण मार्गदर्शिका'). Ensure Hindi is grammatically flawless.\n"
        "- CRITICAL: Do NOT mention any website names (such as 'Sarkari Result', 'Bihar Help', 'Sarkari Yojana Portal', 'PM Modi Yojana', etc.) in the title. If the source text comes from these portals, extract the actual recruiting government authority/organization name (like 'UPSC', 'SSC', 'BPSSC', 'Navy', 'Railway', etc.) or scheme name, and use that instead. Never include portal website names in the article title.\n\n"
        "JSON SCHEMA:\n"
        "{\n"
        "  \"article_title\": \"SEO-optimized title using these exact formulas: [Jobs: '[Org Name] [Post Name] Recruitment 2026 - Apply Online for [Vacancy Count] Posts' (e.g. 'SSC CGL Recruitment 2026 - Apply Online for 17,727 Posts'), or if vacancy is unknown, use 'Various Posts'], [Admit Cards: '[Org Name] [Exam Name] Admit Card 2026 - Download Hall Ticket Link Active'], [Results: '[Org Name] [Exam Name] Result 2026 - Merit List, Cut Off Marks PDF'], [Answer Keys: '[Org Name] [Exam Name] Answer Key 2026 - Download PDF & Objections Link'], [Yojana: '[Scheme Name] 2026 - Online Registration, Eligibility & Beneficiary Status'], [Scholarship: '[Scholarship Name] 2026 - Online Application, Eligibility & Last Date']. Always append the relevant Hindi translation in parentheses to target bilingual queries (e.g. 'SSC CGL Recruitment 2026 - Apply Online for 17,727 Posts (एसएससी सीजीएल भर्ती 2026)'). DO NOT mention website names in the title!\",\n"
        "  \"slug\": \"clean-url-slug (e.g., 'pm-kisan-yojana-2026')\",\n"
        "  \"meta_description\": \"Compelling meta description under 160 characters containing key search keywords\",\n"
        "  \"qualifications\": [\"Array of education levels required, select from: 10th, 12th, Graduate, Post Graduate, B.Tech, ITI, Diploma, LLB, MBBS, PhD\"],\n"
        "  \"states\": [\"Array of states target (e.g., 'Uttar Pradesh', 'Maharashtra') or 'Central' if national\"],\n"
        "  \"last_date\": \"YYYY-MM-DD (Extract application closing date or deadline. Use null if not found or not applicable)\",\n"
        "  \"extracted_json\": {\n"
        "    \"vacancies\": \"Number of total vacancies or summary string (e.g. '17,727 Posts' or 'All Eligible Citizens')\",\n"
        "    \"age_limit\": \"Min/max age requirements or beneficiary target criteria\",\n"
        "    \"qualification\": \"Education or eligibility summary\",\n"
        "    \"salary\": \"Salary scale / Pay level / Financial benefits summary (e.g., 'Rs. 6000/year in 3 installments')\",\n"
        "    \"fee\": {\"General/OBC\": \"Rs. 100\", \"SC/ST/PwD\": \"Nil\", \"Female\": \"Nil\"},\n"
        "    \"selection_process\": [\"Stage 1: Tier 1 Exam\", \"Stage 2: Tier 2 Exam\" or \"Step 1: Document Verification\", \"Step 2: Benefit Disbursement\"],\n"
        "    \"important_dates\": {\n"
        "      \"start_date\": \"Application start date\",\n"
        "      \"end_date\": \"Application end date\",\n"
        "      \"exam_date\": \"Exam date / Installment date (if mentioned)\",\n"
        "      \"result_date\": \"Result date / Status check date (if mentioned)\"\n"
        "    }\n"
        "  },\n"
        "  \"article_content\": \"Full markdown-formatted article written in BOTH Hindi and English. Choose structure based on Category (Note: Hindi version MUST be first, followed by the English version):\n\n"
        "     [STRUCTURE A: For Category 'Sarkari Yojana' or 'Scholarship']\n"
        "     # Hindi Version / हिंदी में पूरी जानकारी\n"
        "     - योजना का परिचय और उद्देश्य (संक्षिप्त विवरण और किसके द्वारा शुरू की गई)\n"
        "     - योजना के मुख्य बिंदु तालिका (योजना का नाम, शुरुआतकर्ता, लाभार्थी, वित्तीय लाभ, आवेदन मोड, आधिकारिक वेबसाइट)\n"
        "     - पात्रता मानदंड (आवेदन के लिए आवश्यक योग्यता, आय सीमा, निवासी नियम)\n"
        "     - आवश्यक दस्तावेज (सूची जैसे आधार कार्ड, निवास प्रमाण पत्र, बैंक खाता पासबुक, मोबाइल नंबर आदि)\n"
        "     - योजना के लाभ एवं विशेषताएं (वित्तीय सहायता, छात्रवृत्ति राशि, या सब्सिडी की विस्तृत जानकारी)\n"
        "     - आवेदन प्रक्रिया (ऑनलाइन/ऑफलाइन आवेदन कैसे करें, स्टेप-बाय-स्टेप रजिस्ट्रेशन और फॉर्म भरने का सरल तरीका)\n"
        "     - महत्वपूर्ण लिंक्स (ऑनलाइन आवेदन लिंक, दिशानिर्देश पीडीएफ, आधिकारिक वेबसाइट)\n"
        "     - अक्सर पूछे जाने वाले प्रश्न (FAQ - Exactly 5 highly searched questions and answers in Hindi)\n\n"
        "     # English Version\n"
        "     - Introduction & Objective (What is this scheme/scholarship, who launched it, who is the main beneficiary)\n"
        "     - Key Highlights Table (Scheme Name, Launched By, Target Beneficiaries, Financial Benefits, Application Mode, Official Website)\n"
        "     - Eligibility Criteria (Detailed bulleted requirements including residency, category, income limits, education, etc.)\n"
        "     - Required Documents (Bulleted checklist of documents like Aadhar card, income certificate, residence proof, bank passbook, passport photo, etc.)\n"
        "     - Scheme Benefits & Features (Explain detail of financial assistance, subsidies, or scholarship amount)\n"
        "     - Step-by-step Application Guide (Clear, humanized registration instructions on the portal, application form filling, uploading docs, submitting)\n"
        "     - Official Links Section (Direct link to Apply Online, Scheme Portal Link, Guidelines PDF Link)\n"
        "     - FAQ Section (Exactly 5 highly searched questions regarding beneficiary list, status check, eligibility, document requirements, and contact details)\n\n"
        "     - Disclaimer Footer: prepended with '> **Disclaimer:** This information is sourced directly from official announcements. Always verify details on the official portal.' (Provide both English and Hindi versions).\n\n"
        "     [STRUCTURE B: For Category 'Job', 'Result', 'Admit Card', 'Answer Key']\n"
        "     # Hindi Version / हिंदी में पूरी जानकारी\n"
        "     - प्रस्तावना (संक्षिप्त विवरण)\n"
        "     - महत्वपूर्ण तिथियां तालिका (आवेदन शुरू/अंतिम तिथि, परीक्षा तिथि)\n"
        "     - रिक्ति और पद-वार विवरण तालिका (श्रेणी-वार रिक्तियों की संख्या)\n"
        "     - पात्रता मानदंड (आयु सीमा, आवश्यक शैक्षणिक योग्यता)\n"
        "       * Add H3 subheadings for: '### आयु सीमा में छूट' and '### वेतनमान एवं भत्ते'\n"
        "     - आवेदन शुल्क का विवरण\n"
        "     - चयन प्रक्रिया के चरण\n"
        "       * Add H3 subheading for: '### परीक्षा पाठ्यक्रम एवं पैटर्न विवरण'\n"
        "     - आवेदन कैसे करें (स्टेप-बाय-स्टेप आवेदन प्रक्रिया)\n"
        "     - महत्वपूर्ण लिंक्स (अधिसूचना पीडीएफ, ऑनलाइन आवेदन लिंक)\n"
        "     - अक्सर पूछे जाने वाले प्रश्न (FAQ - Exactly 5 highly searched questions and answers in Hindi)\n\n"
        "     # English Version\n"
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
        "     - FAQ Section (Exactly 5 highly searched user questions and answers regarding syllabus, fee, age limit, dates, eligibility)\n\n"
        "     - Disclaimer Footer: prepended with '> **Disclaimer:** This information is sourced directly from official announcements. Always verify details on the official portal.' (Provide both English and Hindi versions).\",\n"
        "  \"schemas\": {\n"
        "    \"job_posting\": { /* Valid Schema.org JobPosting object or null if category is not 'Job'. MUST include title, description, datePosted (ISO YYYY-MM-DD), validThrough (ISO deadline date with T23:59:59+05:30), employmentType: 'FULL_TIME', hiringOrganization (with name, sameAs, and logo: 'https://railwayadmitcard.online/logo.png'), jobLocation (with Place and PostalAddress including streetAddress: 'Government Secretariat, Official Headquarters', addressLocality: 'New Delhi', addressRegion: 'Delhi', postalCode: '110001', addressCountry: 'IN'), and baseSalary (with MonetaryAmount currency: 'INR', value: { @type: 'QuantitativeValue', value: 35000, minValue: 25000, maxValue: 80000, unitText: 'MONTH' }) */ },\n"
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

    # 1. Try Gemini with key rotation
    if GEMINI_API_KEYS:
        import random
        shuffled_keys = list(GEMINI_API_KEYS)
        random.shuffle(shuffled_keys)
        for idx, api_key in enumerate(shuffled_keys):
            try:
                print(f"Attempting Gemini extraction using shuffled key #{idx+1}...")
                genai.configure(api_key=api_key)
                model = genai.GenerativeModel(
                    model_name="gemini-2.5-flash",
                    generation_config=generation_config,
                    system_instruction=system_instruction
                )
                response = model.generate_content(prompt)
                cleaned_text = clean_json_text(response.text)
                result_json = json.loads(cleaned_text, strict=False)
                
                if 'article_title' in result_json and 'article_content' in result_json:
                    print("Gemini AI extraction successful.")
                    return fill_defaults(result_json, source_name, category)
                else:
                    print("Missing critical fields in Gemini output.")
            except Exception as e:
                print(f"Gemini API key #{idx+1} failed: {e}")
    else:
        print("No Gemini API keys configured. Checking Groq fallback...")

    # 2. Try Groq Fallback
    print("Gemini keys exhausted or missing. Falling back to Groq API...")
    groq_data = extract_with_groq(prompt, system_instruction, source_name, category)
    if groq_data:
        return groq_data

    print("All AI extraction methods failed.")
    return None

