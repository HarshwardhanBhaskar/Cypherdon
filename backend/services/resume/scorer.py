import re
from typing import Dict, Any, List, Tuple

# A basic static mapping of standard roles to expected skills/keywords.
# In a real app, this might come from a database or OpenAI.
ROLE_KEYWORDS = {
    "frontend": ["html", "css", "javascript", "react", "next.js", "vue", "angular", "typescript", "tailwind", "ui", "ux", "responsive"],
    "backend": ["python", "java", "node.js", "express", "django", "fastapi", "spring", "sql", "postgresql", "mongodb", "api", "rest", "docker", "aws"],
    "fullstack": ["javascript", "react", "node.js", "python", "sql", "api", "aws", "docker", "typescript", "html", "css", "database"],
    "data science": ["python", "sql", "machine learning", "pandas", "numpy", "scikit-learn", "tensorflow", "pytorch", "statistics", "data analysis"],
    "software engineer": ["java", "python", "c++", "c#", "git", "agile", "sql", "api", "system design", "algorithms", "data structures"]
}

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
    
    # Fallback if specific role isn't in mapping
    keywords_to_check = ROLE_KEYWORDS.get("software engineer")
    for key in ROLE_KEYWORDS.keys():
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
    
    expected_sections = [
        (r'\b(experience|employment|work history)\b', "Experience"),
        (r'\b(education|academic)\b', "Education"),
        (r'\b(skills|technologies|tools)\b', "Skills"),
        (r'\b(projects|portfolio)\b', "Projects")
    ]
    
    for pattern, name in expected_sections:
        if re.search(pattern, text_lower):
            found_sections.append(name)
            sections_score += 7.5  # 4 sections * 7.5 = 30 pts
        else:
            missing_sections.append(name)
            
    sections_score = int(sections_score)
    total_score += sections_score
    
    # --- 3. Quantified Achievements (Max 30 points) ---
    # Detect numbers, percentages, dollar amounts.
    quant_score = 0
    
    # Find percentages (e.g. 20%, 50 %)
    percentages = re.findall(r'\b\d+\s*%', text)
    # Find dollar amounts (e.g. $1M, $500,000)
    dollars = re.findall(r'\$\d+(?:,\d+)*(?:\.\d+)?(?:[kKmMbB])?', text)
    # Find standalone metrics/numbers (ignoring years like 2020)
    # Match numbers like 10, 50, 100+ but avoid 4 digit years starting with 19 or 20
    general_numbers = re.findall(r'\b(?!(?:19|20)\d{2}\b)\d{1,3}(?:,\d{3})*(?:\+)?\b', text)
    
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
