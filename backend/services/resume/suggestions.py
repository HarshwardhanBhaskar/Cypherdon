from typing import List, Dict, Any

def generate_suggestions(missing_keywords: List[str], metrics: Dict[str, Any]) -> List[str]:
    """
    Generates actionable improvement suggestions based on scoring metrics.
    """
    suggestions = []
    
    # 1. Section Suggestions
    missing_sections = metrics.get("missing_sections", [])
    if missing_sections:
        sections_str = ", ".join(missing_sections)
        suggestions.append(f"Add missing standard sections to improve ATS parsability: {sections_str}.")
        
    # 2. Keyword Suggestions
    if len(missing_keywords) > 0:
        if len(missing_keywords) <= 3:
            suggestions.append(f"Consider adding these missing keywords if you have the experience: {', '.join(missing_keywords)}.")
        else:
            suggestions.append(f"Your resume is missing several key industry terms. Try incorporating: {', '.join(missing_keywords[:5])} and others.")
            
    # 3. Quantitative Suggestions
    metrics_found = metrics.get("metrics_found", 0)
    if metrics_found == 0:
        suggestions.append("Your resume lacks quantified achievements. ATS systems and recruiters look for numbers, percentages, and metrics. Try changing 'Improved performance' to 'Improved performance by 20%'.")
    elif metrics_found < 5:
        suggestions.append("You have a few numbers, but you should quantify your achievements more. Aim for at least 5-8 metrics across your experience bullets.")
        
    # Generic praise if doing well
    if metrics.get("keyword_score", 0) >= 30 and metrics.get("sections_score", 0) == 30 and metrics.get("quant_score", 0) == 30:
        suggestions.append("Great job! Your resume is highly optimized for Applicant Tracking Systems.")
        
    return suggestions
