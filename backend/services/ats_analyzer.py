"""
ATS Resume Analyzer Service
---------------------------
Analyzes resume text against user skills and common industry keywords.
Scoring: skill_match (50%) + keyword_presence (30%) + structure (20%)
"""

import re
from typing import List, Dict

# Common tech keywords that ATS systems look for
COMMON_TECH_KEYWORDS = [
    "python", "javascript", "typescript", "react", "node.js", "next.js",
    "fastapi", "django", "flask", "sql", "postgresql", "mongodb",
    "docker", "kubernetes", "aws", "azure", "gcp", "git", "ci/cd",
    "rest api", "graphql", "html", "css", "tailwind", "machine learning",
    "deep learning", "tensorflow", "pytorch", "data science", "pandas",
    "numpy", "java", "c++", "rust", "go", "swift", "kotlin",
    "agile", "scrum", "jira", "linux", "redis", "elasticsearch",
    "microservices", "devops", "terraform", "ansible",
]

# Important resume sections that demonstrate structure
EXPECTED_SECTIONS = [
    "education", "experience", "work experience", "skills",
    "projects", "certifications", "summary", "objective",
    "achievements", "awards", "publications", "languages",
]

# Action verbs that indicate measurable achievements
ACTION_VERBS = [
    "developed", "implemented", "designed", "built", "created",
    "managed", "led", "improved", "optimized", "reduced",
    "increased", "delivered", "automated", "scaled", "deployed",
    "architected", "mentored", "collaborated", "analyzed", "solved",
]


def analyze_resume(resume_text: str, user_skills: List[str]) -> Dict:
    """
    Main analysis function.
    Returns score (0-100), missing_skills, and suggestions.
    """
    text_lower = resume_text.lower()

    # ──── 1. Skill Match (50% of total score) ────
    skill_score, matched_skills, missing_skills = _score_skills(text_lower, user_skills)

    # ──── 2. Keyword Presence (30% of total score) ────
    keyword_score, found_keywords, missing_keywords = _score_keywords(text_lower)

    # ──── 3. Structure & Readability (20% of total score) ────
    structure_score, found_sections, missing_sections = _score_structure(text_lower)

    # ──── Weighted Total ────
    total_score = int(
        (skill_score * 0.50) +
        (keyword_score * 0.30) +
        (structure_score * 0.20)
    )
    total_score = min(100, max(0, total_score))  # clamp

    # ──── Generate Suggestions ────
    suggestions = _generate_suggestions(
        text_lower, missing_skills, missing_keywords,
        missing_sections, skill_score, keyword_score, structure_score
    )

    return {
        "score": total_score,
        "breakdown": {
            "skill_match": round(skill_score),
            "keyword_presence": round(keyword_score),
            "structure": round(structure_score),
        },
        "matched_skills": matched_skills,
        "missing_skills": missing_skills[:10],  # top 10
        "found_keywords": found_keywords,
        "missing_keywords": missing_keywords[:8],
        "found_sections": found_sections,
        "suggestions": suggestions,
    }


def _score_skills(text: str, user_skills: List[str]):
    """Score how many of the user's declared skills appear in the resume."""
    if not user_skills:
        return 50, [], []  # neutral if no skills provided

    matched = [s for s in user_skills if s.lower() in text]
    missing = [s for s in user_skills if s.lower() not in text]
    score = (len(matched) / len(user_skills)) * 100 if user_skills else 0
    return score, matched, missing


def _score_keywords(text: str):
    """Score presence of common industry/tech keywords."""
    found = [kw for kw in COMMON_TECH_KEYWORDS if kw in text]
    missing = [kw for kw in COMMON_TECH_KEYWORDS if kw not in text]
    # Normalize: having 15+ keywords = 100%
    score = min(100, (len(found) / 15) * 100)
    return score, found, missing


def _score_structure(text: str):
    """Score the structural quality of the resume."""
    score = 0

    # Check for important sections (60 pts)
    found_sections = [s for s in EXPECTED_SECTIONS if s in text]
    section_score = min(60, (len(found_sections) / 5) * 60)
    missing_sections = [s for s in EXPECTED_SECTIONS if s not in text]

    # Check for action verbs (20 pts)
    action_count = sum(1 for v in ACTION_VERBS if v in text)
    action_score = min(20, (action_count / 5) * 20)

    # Check for numbers/metrics (20 pts) – indicates measurable achievements
    numbers = re.findall(r'\d+%|\d+\+|\$\d+', text)
    metric_score = min(20, len(numbers) * 5)

    score = section_score + action_score + metric_score
    return min(100, score), found_sections, missing_sections


def _generate_suggestions(
    text, missing_skills, missing_keywords,
    missing_sections, skill_score, keyword_score, structure_score
):
    """Generate actionable improvement suggestions."""
    suggestions = []

    if skill_score < 60:
        suggestions.append(
            f"Add your key skills explicitly: {', '.join(missing_skills[:4])}"
        )

    if keyword_score < 50:
        suggestions.append(
            "Include more industry-relevant keywords and technologies"
        )

    if "summary" not in [s.lower() for s in missing_sections]:
        pass
    else:
        suggestions.append(
            "Add a professional summary section at the top of your resume"
        )

    if "experience" in [s.lower() for s in missing_sections] and \
       "work experience" in [s.lower() for s in missing_sections]:
        suggestions.append("Add a clear Work Experience section")

    if "education" in [s.lower() for s in missing_sections]:
        suggestions.append("Include an Education section")

    if "projects" in [s.lower() for s in missing_sections]:
        suggestions.append("Add a Projects section to showcase practical work")

    # Check for measurable achievements
    numbers = re.findall(r'\d+%|\d+\+|\$\d+', text)
    if len(numbers) < 3:
        suggestions.append(
            "Add measurable achievements (e.g., 'Improved performance by 40%')"
        )

    action_count = sum(1 for v in ACTION_VERBS if v in text)
    if action_count < 3:
        suggestions.append(
            "Use strong action verbs like 'developed', 'implemented', 'optimized'"
        )

    if structure_score < 40:
        suggestions.append("Improve overall resume structure with clear sections")

    # Cap at 6 suggestions to keep it useful
    return suggestions[:6]
