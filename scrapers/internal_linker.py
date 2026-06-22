import re

# Keyword to internal path mapping
# Maps common terms to their dynamic categories and qualifications pages
LINK_MAPPING = {
    r'\b10th\s*(?:pass|class|fail)?\b': '/jobs?qualification=10th',
    r'\b12th\s*(?:pass|class)?\b': '/jobs?qualification=12th',
    r'\bgraduates?\b': '/jobs?qualification=Graduate',
    r'\bgraduation\b': '/jobs?qualification=Graduate',
    r'\bdiploma\b': '/jobs?qualification=Diploma',
    r'\bb\.tech\b': '/jobs?qualification=B.Tech',
    r'\biti\b': '/jobs?qualification=ITI',
    r'\badmit\s*cards?\b': '/admit-cards',
    r'\bresults?\b': '/results',
    r'\banswer\s*keys?\b': '/answer-keys',
    r'\bsarkari\s*yojanas?\b': '/yojana',
    r'\bscholarships?\b': '/yojana'
}

def inject_internal_links(markdown_content: str) -> str:
    """Scans the markdown text and replaces the first occurrence of key terms
    with markdown hyperlinks, while avoiding altering existing links.
    """
    if not markdown_content:
        return ""

    # Temporary store for existing markdown links so we don't modify them
    # Example link match: [Text](url)
    link_pattern = r'(\[.*?\]\(.*?\))'
    placeholders = []
    
    def save_link(match):
        placeholders.append(match.group(1))
        return f"__LINK_PLACEHOLDER_{len(placeholders)-1}__"

    # 1. Substitute existing links with placeholders
    modified_text = re.sub(link_pattern, save_link, markdown_content)

    # 2. Iterate through mapping and replace the first occurrence
    for pattern_str, path in LINK_MAPPING.items():
        # Match the word boundary pattern
        pattern = re.compile(pattern_str, re.IGNORECASE)
        
        # We only want to replace the first match in the text
        match = pattern.search(modified_text)
        if match:
            matched_word = match.group(0)
            # Replace only the first occurrence of this exact word
            # Format link with a relative URL that Next.js routes correctly
            replacement = f"[{matched_word}]({path})"
            modified_text = pattern.sub(replacement, modified_text, count=1)

    # 3. Restore the original links from placeholders
    for idx, original_link in enumerate(placeholders):
        modified_text = modified_text.replace(f"__LINK_PLACEHOLDER_{idx}__", original_link)

    return modified_text
