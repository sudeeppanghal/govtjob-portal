import re
import json
from datetime import datetime

def extract_dates(text: str) -> list:
    """Helper to extract DD-MM-YYYY or DD/MM/YYYY dates from text."""
    date_patterns = [
        r'\b\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4}\b',
        r'\b\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{2,4}\b'
    ]
    dates = []
    for pattern in date_patterns:
        matches = re.findall(pattern, text, re.IGNORECASE)
        dates.extend(matches)
    return list(set(dates))

def extract_vacancies(text: str) -> str:
    """Extract vacancy counts using regex heuristic."""
    # Look for number + vacancy/post keywords
    pattern = r'\b(\d{2,6})\s*(?:vacancies|posts|openings|positions)\b'
    matches = re.findall(pattern, text, re.IGNORECASE)
    if matches:
        return f"{matches[0]} Posts"
    
    pattern2 = r'(?:total|number of)\s*(?:vacancies|posts)\s*:\s*(\d{2,6})'
    matches2 = re.findall(pattern2, text, re.IGNORECASE)
    if matches2:
        return f"{matches2[0]} Posts"
        
    return "Refer to Notification PDF"

def extract_qualifications(text: str) -> list:
    """Find qualification keywords in text."""
    keywords = {
        '10th': [r'10th', r'matriculation', r'secondary school'],
        '12th': [r'12th', r'intermediate', r'senior secondary', r'10\+2'],
        'Graduate': [r'graduate', r'bachelor', r'degree', r'b\.a', r'b\.sc', r'b\.com'],
        'B.Tech': [r'b\.tech', r'b\.e\b', r'engineering degree'],
        'ITI': [r'\biti\b', r'industrial training institute'],
        'Diploma': [r'diploma'],
        'Post Graduate': [r'post graduate', r'master', r'm\.tech', r'm\.sc', r'm\.a', r'mba'],
        'LLB': [r'llb', r'law graduate', r'b\.a\.\s*llb'],
        'MBBS': [r'mbbs', r'medical degree'],
    }
    found = []
    for key, patterns in keywords.items():
        for pat in patterns:
            if re.search(pat, text, re.IGNORECASE):
                found.append(key)
                break
    if not found:
        found = ['Check Notification']
    return found

def parse_last_date(text: str) -> str:
    """Try to find the closing date for application."""
    patterns = [
        r'(?:last|closing|end)\s*date\s*(?:for|of)?\s*(?:receipt|online|submission)?\s*(?:of|is)?\s*[:\-\s]*(\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4})',
        r'last\s*date\s*[:\-\s]*(\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4})'
    ]
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            date_str = match.group(1)
            # Try to convert to YYYY-MM-DD
            for fmt in ('%d-%m-%Y', '%d/%m/%Y', '%d-%m-%y', '%d/%m/%y'):
                try:
                    return datetime.strptime(date_str, fmt).strftime('%Y-%m-%d')
                except ValueError:
                    continue
    return None

def generate_fallback_article(pdf_text: str, category: str, source_name: str, source_url: str, title: str) -> dict:
    """Generates a rule-based SEO-friendly article based on notification text heuristics."""
    vacancies = extract_vacancies(pdf_text)
    quals = extract_qualifications(pdf_text)
    last_date = parse_last_date(pdf_text)
    dates = extract_dates(pdf_text)
    
    # Clean the source name to find if it's a website and extract a proper authority
    website_names = [
        "sarkari result", "sarkariyojnaa", "sarkari yojana", "pm modi yojana", "pmmodiyojana",
        "bihar help", "biharhelp", "employment news"
    ]
    is_website = any(web in source_name.lower() for web in website_names)
    
    authority = ""
    if is_website:
        # Search for common Indian exam/recruitment boards in the notice title
        boards = ["UPSC", "SSC", "IBPS", "RRB", "SBI", "BPSSC", "UPPSC", "HSSC", "RSSB", "RPSC", "DSSSB", "MPPSC", "CGPSC", "NIACL", "NBEMS", "CSIR", "LIC", "DRDO", "ISRO", "IOCL", "ONGC"]
        for board in boards:
            if re.search(r'\b' + board + r'\b', title, re.IGNORECASE):
                authority = board
                break
        if not authority:
            # Fallback to the first capitalized acronym of length >= 3 in the title
            words = re.findall(r'\b[A-Z]{3,6}\b', title)
            if words:
                authority = words[0]
            else:
                authority = "Government"
    else:
        authority = source_name

    # Generate clean slugs and SEO metadata
    # Use title if long enough, otherwise fallback to source+category+url hash
    clean_title = re.sub(r'[^a-zA-Z0-9\s-]', '', title).strip().replace(' ', '-').lower()
    # Normalize multiple dashes to single dashes
    clean_title = re.sub(r'-+', '-', clean_title)
    
    if len(clean_title) > 10:
        slug_base = clean_title
    else:
        import hashlib
        url_hash = hashlib.md5(source_url.encode('utf-8')).hexdigest()[:6]
        slug_base = f"{authority}-{category}-{datetime.now().year}-{url_hash}"
        slug_base = re.sub(r'[^a-zA-Z0-9\s-]', '', slug_base).strip().replace(' ', '-').lower()
        slug_base = re.sub(r'-+', '-', slug_base)
    
    category_hindi = {
        "job": "सरकारी नौकरी भर्ती",
        "result": "परीक्षा परिणाम (Result)",
        "admit card": "एडमिट कार्ड (Admit Card)",
        "answer key": "उत्तर कुंजी (Answer Key)",
        "sarkari yojana": "सरकारी योजना",
        "scholarship": "स्कॉलरशिप"
    }
    cat_lower = category.lower()
    hindi_suffix = category_hindi.get(cat_lower, "सरकारी अपडेट")

    year = datetime.now().year
    
    # We clean the title to be used for Yojana/Scholarship to avoid double year or double category suffix
    clean_feed_title = title
    # Remove common year suffixes if they already exist in the feed title
    clean_feed_title = re.sub(r'\b(2024|2025|2026)\b', '', clean_feed_title).strip()
    clean_feed_title = re.sub(r'\s+', ' ', clean_feed_title)

    if cat_lower == 'job':
        vac_str = f"for {vacancies}" if "refer" not in vacancies.lower() else "for Various Posts"
        article_title = f"{authority} Recruitment {year} - Apply Online {vac_str} ({hindi_suffix} {year})"
    elif cat_lower == 'admit card':
        article_title = f"{authority} Admit Card {year} - Download Hall Ticket Link Active ({hindi_suffix})"
    elif cat_lower == 'result':
        article_title = f"{authority} Result {year} - Merit List, Cut Off Marks PDF ({hindi_suffix})"
    elif cat_lower == 'answer key':
        article_title = f"{authority} Answer Key {year} - Download PDF & Objections Link ({hindi_suffix})"
    elif cat_lower == 'sarkari yojana':
        article_title = f"{clean_feed_title} {year} - Online Registration, Eligibility & Beneficiary Status (सरकारी योजना)"
    elif cat_lower == 'scholarship':
        article_title = f"{clean_feed_title} {year} - Online Application, Eligibility & Last Date (स्कॉलरशिप)"
    else:
        article_title = f"{authority} {category} {year} Notification Out ({hindi_suffix})"

    meta_desc = f"Latest {authority} {category} notification issued ({hindi_suffix}). Check vacancy details, eligibility, application fee, and dates. Apply before {last_date or 'closing date'}."
    
    # Pre-designed Markdown bilingual template
    article_content = f"""# {article_title}

# Hindi Version / हिंदी में पूरी जानकारी

**{authority}** ने **{category} ({hindi_suffix})** के लिए आधिकारिक अधिसूचना जारी की है। इस पृष्ठ में पात्रता मानदंड, रिक्तियों, महत्वपूर्ण तिथियों, चयन प्रक्रिया और आवेदन निर्देशों से संबंधित सभी महत्वपूर्ण विवरण शामिल हैं। इच्छुक उम्मीदवार नीचे दिए गए सीधे आधिकारिक लिंक पा सकते हैं।

## महत्वपूर्ण अवलोकन
भर्ती विवरण का एक संक्षिप्त सारांश नीचे दिया गया है:

| विवरण | जानकारी |
| --- | --- |
| **संगठन का नाम** | {authority} |
| **अधिसूचना श्रेणी** | {category} ({hindi_suffix}) |
| **कुल रिक्तियां (पदों की संख्या)** | {vacancies} |
| **शैक्षणिक योग्यता** | {", ".join(quals)} |
| **आवेदन करने की अंतिम तिथि** | {last_date or "पीडीएफ देखें"} |
| **आधिकारिक वेबसाइट** | [{authority} Official Site]({source_url}) |

## महत्वपूर्ण तिथियां
उम्मीदवारों को निम्नलिखित महत्वपूर्ण घटनाओं और तिथियों को नोट करना चाहिए:
- **आवेदन शुरू होने की तिथि:** आधिकारिक अधिसूचना देखें
- **आवेदन करने की अंतिम तिथि:** {last_date or "पीडीएफ देखें"}
- **एडमिट कार्ड जारी होने की तिथि:** जल्द ही अधिसूचित की जाएगी
- **परीक्षा की तिथि:** अधिसूचना विवरण देखें

## पात्रता मानदंड
### शैक्षणिक योग्यता
उम्मीदवारों के पास पदों के आधार पर निम्नलिखित योग्यताएं होनी चाहिए:
- **न्यूनतम शैक्षणिक योग्यता:** मान्यता प्राप्त बोर्ड या विश्वविद्यालय से **{", ".join(quals)}**।

### आयु सीमा
- न्यूनतम/अधिकतम आयु सीमा और आयु छूट के विवरण के लिए कृपया नीचे दी गई आधिकारिक अधिसूचना पीडीएफ देखें।

### आयु सीमा में छूट
- सरकारी नियमों के अनुसार आरक्षित श्रेणियों (OBC, SC, ST, PwD, और Ex-Servicemen) के उम्मीदवारों के लिए आयु सीमा में छूट लागू है।

### वेतनमान एवं भत्ते
- वेतनमान, मूल वेतन (Basic Salary), और अन्य भत्तों (HRA, DA, TA) की जानकारी आधिकारिक अधिसूचना में दी गई है।

## आवेदन शुल्क
- सामान्य / ओबीसी (General / OBC): अधिसूचना देखें
- एससी / एसटी / दिव्यांग (SC / ST / PwD): अधिसूचना देखें
- भुगतान का प्रकार: ऑनलाइन (डेबिट कार्ड, क्रेडिट कार्ड, नेट बैंकिंग)

## विश्वसनीय जानकारी के लिए चयन प्रक्रिया
- चयन प्रक्रिया के विभिन्न चरणों (लिखित परीक्षा, शारीरिक/कौशल परीक्षा, साक्षात्कार) के लिए कृपया आधिकारिक अधिसूचना देखें।

### परीक्षा पाठ्यक्रम एवं पैटर्न विवरण
- विस्तृत परीक्षा पाठ्यक्रम और परीक्षा पैटर्न का विवरण अधिसूचना दस्तावेज के भीतर उपलब्ध है।

## आवेदन कैसे करें
1. आधिकारिक वेबसाइट पर जाएं या नीचे दिए गए डायरेक्ट अप्लाई लिंक पर क्लिक करें।
2. आधिकारिक निर्देशों को ध्यान से पढ़ें।
3. पंजीकरण फॉर्म भरें और आवश्यक दस्तावेज (फोटो, हस्ताक्षर और शैक्षिक प्रमाणपत्र) अपलोड करें।
4. ऑनलाइन माध्यम से आवेदन शुल्क का भुगतान करें।
5. भविष्य के संदर्भ के लिए फाइनल सबमिशन पेज का प्रिंटआउट लें।

## महत्वपूर्ण लिंक्स
- **आधिकारिक अधिसूचना PDF:** [अधिसूचना डाउनलोड करें]({source_url})
- **ऑनलाइन आवेदन लिंक:** [आधिकारिक पोर्टल]({source_url})

## अक्सर पूछे जाने वाले प्रश्न (FAQ)

### प्रश्न 1. इस भर्ती के लिए आवेदन करने की अंतिम तिथि क्या है?
**उत्तर:** आवेदन करने की अंतिम तिथि **{last_date or "अधिसूचना पीडीएफ में निर्दिष्ट है"}** है।

### प्रश्न 2. न्यूनतम शैक्षणिक योग्यता क्या है?
**उत्तर:** आवेदन करने के लिए उम्मीदवारों के पास **{", ".join(quals)}** होना चाहिए।

### प्रश्न 3. परीक्षा का पाठ्यक्रम क्या है?
**उत्तर:** विस्तृत पाठ्यक्रम ऊपर दिए गए आधिकारिक अधिसूचना पीडीएफ लिंक में देखा जा सकता है।

### प्रश्न 4. क्या आयु सीमा में कोई छूट है?
**उत्तर:** हां, सरकारी नियमों के अनुसार आरक्षित वर्गों के लिए आयु सीमा में छूट प्रदान की जाती है।

### प्रश्न 5. मैं आधिकारिक अधिसूचना कैसे डाउनलोड कर सकता हूं?
**उत्तर:** आप ऊपर दिए गए [अधिसूचना डाउनलोड करें]({source_url}) लिंक पर क्लिक करके सीधे अधिसूचना डाउनलोड कर सकते हैं।

---

# English Version

The **{authority}** has released the official notification for **{category}**. This page contains all the important details regarding eligibility criteria, vacancies, important dates, selection process, and application instructions. Interested candidates can find the direct official links below.

## Important Overview
Below is a summarized overview of the {authority} recruitment details:

| Attribute | Details |
| --- | --- |
| **Organization** | {authority} |
| **Notification Category** | {category} |
| **Total Vacancies** | {vacancies} |
| **Qualifications Required** | {", ".join(quals)} |
| **Last Date to Apply** | {last_date or "Refer to PDF"} |
| **Official Website** | [{authority} Official Site]({source_url}) |

## Important Dates
Candidates should note down the following important events and dates:
- **Application Start Date:** Check Official Notification
- **Last Date to Apply:** {last_date or "Refer to PDF"}
- **Admit Card Release Date:** Will be notified soon
- **Exam Date:** Check Notification Details
- **Detected Dates in PDF:** {", ".join(dates[:4]) if dates else "Not specified"}

## Eligibility Criteria
### Educational Qualifications
Candidates must possess the following qualifications based on the posts:
- **Minimum Qualification:** {", ".join(quals)} from a recognized board or university.

### Age Limit
- Please refer to the official notification PDF below for details on minimum/maximum age limits and age relaxations.

### Age Relaxation & Category-wise Limits
- Candidate age relaxations (for OBC, SC, ST, PwD, and Ex-Servicemen) apply in accordance with official guidelines. Refer to the official bulletin below.

### In-depth Salary Scale & Allowances
- Post salary grades, pay bands, basic scale, and associated allowances (HRA, DA, TA) are specified in the official notification details.

## Application Fee
- General / OBC: Refer to notification
- SC / ST / PwD: Refer to notification
- Mode of Payment: Online (Debit Card, Credit Card, Net Banking)

## Selection Process
- Please check the official PDF for specific stages (Written Test, Skill Test, Interview).

### Syllabus & Exam Pattern Details
- Detailed syllabus topics, marks weightage, and paper durations are listed inside the official notification guidelines document.

## How to Apply
1. Visit the official website or click the direct apply link below.
2. Read the official instructions carefully.
3. Complete the registration form and upload required documents (Photograph, Signature, and Educational certificates).
4. Pay the applicable application fee online.
5. Print the final confirmation page for future reference.

## Important Links
- **Official Notification PDF:** [Download PDF]({source_url})
- **Apply Online Link:** [Official Portal]({source_url})

## FAQ (Frequently Asked Questions)

### Q1. What is the last date to apply for this vacancy?
**Ans:** The last date of application is **{last_date or "as specified in the notification PDF"}**.

### Q2. What are the minimum educational requirements?
**Ans:** Candidates must possess **{", ".join(quals)}** to apply.

### Q3. What is the syllabus for the exam?
**Ans:** The detailed exam syllabus and question weightage can be found inside the official notification PDF linked above.

### Q4. Is there any age relaxation?
**Ans:** Yes, category-wise age relaxations are provided for reserved groups per government rules.

### Q5. How can I download the official notification?
**Ans:** You can download the notification directly by clicking the [Download PDF]({source_url}) link above.

---

> **Disclaimer:** This information is sourced directly from official announcements. Always verify details on the official portal.
> **अस्वीकरण:** यह जानकारी सीधे आधिकारिक घोषणाओं से ली गई है। हमेशा आधिकारिक पोर्टल पर विवरण की पुष्टि करें.
"""

    # Generate standard schema objects
    schemas = {
        "faq": {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
                {
                    "@type": "Question",
                    "name": f"What is the last date to apply for {source_name}?",
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": f"The last date is {last_date or 'available in the official notification PDF'}."
                    }
                },
                {
                    "@type": "Question",
                    "name": f"What are the qualifications required for {source_name}?",
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": f"Candidates must have completed {', '.join(quals)}."
                    }
                },
                {
                    "@type": "Question",
                    "name": f"What is the syllabus for the {source_name} exam?",
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": f"The detailed exam syllabus and question weightage can be found inside the official notification PDF."
                    }
                },
                {
                    "@type": "Question",
                    "name": f"Is there any age relaxation for {source_name}?",
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": f"Yes, category-wise age relaxations are provided for reserved groups per official rules."
                    }
                },
                {
                    "@type": "Question",
                    "name": f"How can I download the official {source_name} notification?",
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": f"You can download the notification directly by clicking the download PDF link in our important links section."
                    }
                }
            ]
        },
        "breadcrumb": {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
                {
                    "@type": "ListItem",
                    "position": 1,
                    "name": "Home",
                    "item": "https://railwayadmitcard.online"
                },
                {
                    "@type": "ListItem",
                    "position": 2,
                    "name": category,
                    "item": f"https://railwayadmitcard.online/{category.lower().replace(' ', '-')}"
                },
                {
                    "@type": "ListItem",
                    "position": 3,
                    "name": article_title,
                    "item": f"https://railwayadmitcard.online/{category.lower().replace(' ', '-')}/{slug_base}"
                }
            ]
        }
    }

    if category.lower() == 'job':
        schemas["job_posting"] = {
            "@context": "https://schema.org/",
            "@type": "JobPosting",
            "title": article_title,
            "description": meta_desc,
            "datePosted": datetime.now().strftime('%Y-%m-%d'),
            "validThrough": last_date,
            "employmentType": "FULL_TIME",
            "hiringOrganization": {
                "@type": "Organization",
                "name": source_name,
                "sameAs": source_url
            },
            "jobLocation": {
                "@type": "Place",
                "address": {
                    "@type": "PostalAddress",
                    "addressCountry": "IN"
                }
            }
        }
    else:
        schemas["job_posting"] = None

    return {
        "article_title": article_title,
        "slug": slug_base,
        "meta_description": meta_desc,
        "qualifications": quals,
        "states": ["Central"] if "ssc" in source_name.lower() or "upsc" in source_name.lower() or "ibps" in source_name.lower() else ["State"],
        "last_date": last_date,
        "extracted_json": {
            "vacancies": vacancies,
            "age_limit": "Refer to official PDF",
            "qualification": ", ".join(quals),
            "salary": "Refer to official PDF",
            "fee": "Refer to official PDF",
            "selection_process": ["Refer to official PDF"],
            "important_dates": {
                "start_date": "Check Notification",
                "end_date": last_date or "Check Notification"
            }
        },
        "article_content": article_content,
        "schemas": schemas
    }
