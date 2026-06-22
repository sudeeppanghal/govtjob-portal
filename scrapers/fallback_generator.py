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
    
    # Generate clean slugs and SEO metadata
    slug_base = f"{source_name}-{category}-{datetime.now().year}"
    slug_base = re.sub(r'[^a-zA-Z0-9\s-]', '', slug_base).strip().replace(' ', '-').lower()
    
    article_title = f"{source_name} Recruitment {datetime.now().year}: {category} Notification Out for {vacancies}"
    meta_desc = f"Latest {source_name} {category} notification issued. Check vacancy details, eligibility criteria, application fee, and dates. Apply before {last_date or 'closing date'}."
    
    # Pre-designed Markdown template
    article_content = f"""# {article_title}

The **{source_name}** has released the official notification for **{category}**. This page contains all the important details regarding eligibility criteria, vacancies, important dates, selection process, and application instructions. Interested candidates can find the direct official links below.

## Important Overview
Below is a summarized overview of the {source_name} recruitment details:

| Attribute | Details |
| --- | --- |
| **Organization** | {source_name} |
| **Notification Category** | {category} |
| **Total Vacancies** | {vacancies} |
| **Qualifications Required** | {", ".join(quals)} |
| **Last Date to Apply** | {last_date or "Refer to PDF"} |
| **Official Website** | [{source_name} Official Site]({source_url}) |

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

> **Disclaimer:** This information is sourced directly from official announcements. Always verify details on the official portal.
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
