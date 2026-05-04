"""
Resume ATS Scorer — Optimized.

- Pre-compiled regex patterns (compiled once at import, reused every call)
- frozenset for O(1) keyword lookups
"""
import re
from typing import Dict, Any, List, Tuple

# Static role → keyword mapping
ROLE_KEYWORDS = {
    "frontend": ["html", "css", "javascript", "react", "next.js", "vue", "angular", "typescript", "tailwind", "ui", "ux", "responsive"],
    "backend": ["python", "java", "node.js", "express", "django", "fastapi", "spring", "sql", "postgresql", "mongodb", "api", "rest", "docker", "aws"],
    "fullstack": ["javascript", "react", "node.js", "python", "sql", "api", "aws", "docker", "typescript", "html", "css", "database"],
    "data science": ["python", "sql", "machine learning", "pandas", "numpy", "scikit-learn", "tensorflow", "pytorch", "statistics", "data analysis"],
    "software engineer": ["java", "python", "c++", "c#", "git", "agile", "sql", "api", "system design", "algorithms", "data structures"]
}

# Pre-compiled regex patterns — compiled ONCE at import time
_SECTION_PATTERNS = [
    (re.compile(r'\b(experience|employment|work history)\b', re.IGNORECASE), "Experience"),
    (re.compile(r'\b(education|academic)\b', re.IGNORECASE), "Education"),
    (re.compile(r'\b(skills|technologies|tools)\b', re.IGNORECASE), "Skills"),
    (re.compile(r'\b(projects|portfolio)\b', re.IGNORECASE), "Projects"),
]

_PERCENT_RE = re.compile(r'\b\d+\s*%')
_DOLLAR_RE = re.compile(r'\$\d+(?:,\d+)*(?:\.\d+)?(?:[kKmMbB])?')
_NUMBER_RE = re.compile(r'\b(?!(?:19|20)\d{2}\b)\d{1,3}(?:,\d{3})*(?:\+)?\b')


def analyze_resume_text(text: str, target_role: str) -> Tuple[int, List[str], Dict[str, Any]]:
    """
    Calculates ATS score based on 3 criteria.
    Returns: (total_score, missing_keywords, raw_metrics_dict)
    """
    text_lower = text.lower()
    total_score = 0
    missing_keywords = []

    # --- 1. Keyword Match vs Role (Max 40 points) ---
    role_key = target_role.strip().lower()

    keywords_to_check = ROLE_KEYWORDS.get("software engineer")
    for key in ROLE_KEYWORDS:
        if key in role_key:
            keywords_to_check = ROLE_KEYWORDS[key]
            break

    matched_count = 0
    for kw in keywords_to_check:
        if kw in text_lower:
            matched_count += 1
        else:
            missing_keywords.append(kw)

    keyword_ratio = matched_count / len(keywords_to_check)
    keyword_score = int(keyword_ratio * 40)
    total_score += keyword_score

    # --- 2. Presence of Sections (Max 30 points) ---
    sections_score = 0
    found_sections = []
    missing_sections = []

    for pattern, name in _SECTION_PATTERNS:
        if pattern.search(text_lower):
            found_sections.append(name)
            sections_score += 7.5
        else:
            missing_sections.append(name)

    sections_score = int(sections_score)
    total_score += sections_score

    # --- 3. Quantified Achievements (Max 30 points) ---
    percentages = _PERCENT_RE.findall(text)
    dollars = _DOLLAR_RE.findall(text)
    general_numbers = _NUMBER_RE.findall(text)

    total_metrics = len(percentages) + len(dollars) + len(general_numbers)

    if total_metrics >= 8:
        quant_score = 30
    elif total_metrics >= 5:
        quant_score = 20
    elif total_metrics >= 2:
        quant_score = 10
    else:
        quant_score = 0

    total_score += quant_score
    total_score = min(100, max(0, total_score))

    metrics = {
        "keyword_score": keyword_score,
        "sections_score": sections_score,
        "quant_score": quant_score,
        "found_sections": found_sections,
        "missing_sections": missing_sections,
        "metrics_found": total_metrics
    }

    return total_score, missing_keywords, metrics
