"""
NLP-based resume analysis utilities for AnalyserX.
Uses keyword extraction + cosine similarity (sklearn) with optional spaCy enrichment.
"""

import re
import json
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

# -----------------------------------------------------------------
# Tech / domain skill vocabulary
# -----------------------------------------------------------------
SKILLS_DB = [
    # Programming
    "python", "java", "javascript", "typescript", "c++", "c#", "ruby", "go", "rust",
    "kotlin", "swift", "scala", "r", "matlab", "perl", "php", "bash", "shell",
    # Web
    "react", "angular", "vue", "nextjs", "nodejs", "express", "django", "flask",
    "fastapi", "spring", "laravel", "rails", "html", "css", "sass", "tailwind",
    "bootstrap", "jquery", "graphql", "rest api", "websocket",
    # Data / ML
    "machine learning", "deep learning", "nlp", "computer vision", "tensorflow",
    "pytorch", "keras", "scikit-learn", "pandas", "numpy", "matplotlib", "seaborn",
    "opencv", "huggingface", "transformers", "llm", "generative ai",
    # Cloud / DevOps
    "aws", "azure", "gcp", "docker", "kubernetes", "ci/cd", "jenkins", "github actions",
    "terraform", "ansible", "linux", "nginx", "apache",
    # Databases
    "sql", "mysql", "postgresql", "mongodb", "redis", "elasticsearch", "sqlite",
    "cassandra", "dynamodb", "firebase",
    # Tools
    "git", "github", "jira", "agile", "scrum", "figma", "postman",
    # Soft skills
    "leadership", "communication", "teamwork", "problem solving", "critical thinking",
    "project management", "time management", "collaboration",
]

# ATS-penalised patterns
ATS_PENALTIES = {
    "no_contact_info": ("Missing contact info (email/phone)", -15),
    "no_education": ("No education section detected", -10),
    "no_experience": ("No experience section detected", -10),
    "very_short": ("Resume is very short (< 200 words)", -20),
    "too_long": ("Resume exceeds recommended length (> 1200 words)", -5),
    "special_chars": ("Excessive special characters may confuse ATS", -5),
}

# -----------------------------------------------------------------
# Helpers
# -----------------------------------------------------------------

def clean_text(text: str) -> str:
    text = re.sub(r'\s+', ' ', text)
    text = re.sub(r'[^\w\s@.+#\-/]', ' ', text)
    return text.lower().strip()


def extract_skills(text: str) -> list:
    text_lower = text.lower()
    found = []
    for skill in SKILLS_DB:
        pattern = r'\b' + re.escape(skill) + r'\b'
        if re.search(pattern, text_lower):
            found.append(skill)
    return list(set(found))


def extract_jd_skills(jd_text: str) -> list:
    return extract_skills(jd_text)


def compute_match_score(resume_text: str, jd_text: str) -> float:
    """Cosine similarity between TF-IDF vectors."""
    if not jd_text.strip():
        return 0.0
    vectorizer = TfidfVectorizer(stop_words='english', ngram_range=(1, 2))
    try:
        matrix = vectorizer.fit_transform([clean_text(resume_text), clean_text(jd_text)])
        score = float(cosine_similarity(matrix[0:1], matrix[1:2])[0][0])
        return round(min(score * 1.8, 1.0) * 100, 1)   # scale & cap at 100
    except Exception:
        return 0.0


def compute_ats_score(resume_text: str) -> dict:
    """Rule-based ATS scoring returning score + breakdown."""
    text = resume_text.lower()
    word_count = len(resume_text.split())
    penalties = []
    score = 100.0

    # Contact info
    if not re.search(r'[\w.+-]+@[\w-]+\.\w+', text) and not re.search(r'\b\d{10}\b|\+\d{1,3}', text):
        penalties.append(ATS_PENALTIES["no_contact_info"][0])
        score += ATS_PENALTIES["no_contact_info"][1]

    # Education
    if not any(k in text for k in ["education", "bachelor", "master", "degree", "university", "college"]):
        penalties.append(ATS_PENALTIES["no_education"][0])
        score += ATS_PENALTIES["no_education"][1]

    # Experience
    if not any(k in text for k in ["experience", "work", "employment", "internship", "project"]):
        penalties.append(ATS_PENALTIES["no_experience"][0])
        score += ATS_PENALTIES["no_experience"][1]

    # Length
    if word_count < 200:
        penalties.append(ATS_PENALTIES["very_short"][0])
        score += ATS_PENALTIES["very_short"][1]
    elif word_count > 1200:
        penalties.append(ATS_PENALTIES["too_long"][0])
        score += ATS_PENALTIES["too_long"][1]

    # Special chars density
    special_ratio = len(re.findall(r'[^a-z0-9\s@.\-+#/]', text)) / max(len(text), 1)
    if special_ratio > 0.05:
        penalties.append(ATS_PENALTIES["special_chars"][0])
        score += ATS_PENALTIES["special_chars"][1]

    score = round(max(score, 0), 1)
    return {"score": score, "penalties": penalties, "word_count": word_count}


def compute_skill_gap(resume_skills: list, jd_skills: list) -> list:
    resume_set = set(s.lower() for s in resume_skills)
    return [s for s in jd_skills if s.lower() not in resume_set]


def generate_suggestions(resume_text: str, skill_gaps: list, ats_info: dict, match_score: float) -> list:
    suggestions = []
    text_lower = resume_text.lower()

    # Skill gaps
    if skill_gaps:
        top_gaps = skill_gaps[:5]
        suggestions.append(f"Add missing skills to your resume: {', '.join(top_gaps)}.")

    # ATS penalties
    for p in ats_info.get("penalties", []):
        suggestions.append(f"ATS Issue — {p}")

    # Quantified achievements
    if not re.search(r'\b\d+%|\d+ years?|\$\d+|\d+\+', text_lower):
        suggestions.append("Quantify your achievements (e.g., 'Improved performance by 30%').")

    # Action verbs
    action_verbs = ["developed", "designed", "implemented", "led", "built", "optimized", "managed"]
    if sum(1 for v in action_verbs if v in text_lower) < 3:
        suggestions.append("Use strong action verbs (e.g., Developed, Designed, Led, Optimized).")

    # Summary section
    if "summary" not in text_lower and "objective" not in text_lower and "profile" not in text_lower:
        suggestions.append("Add a professional summary/objective section at the top.")

    # Match score
    if match_score < 50:
        suggestions.append("Tailor your resume keywords to better match the job description.")

    if not suggestions:
        suggestions.append("Great resume! Minor tweaks to keywords can push your score higher.")

    return suggestions


def get_keyword_frequency(text: str, top_n: int = 15) -> list:
    """Top keywords by TF-IDF for chart display."""
    words = re.findall(r'\b[a-z]{3,}\b', text.lower())
    stop_words = {"the", "and", "for", "are", "was", "with", "that", "this", "from",
                  "have", "has", "had", "been", "will", "you", "your", "our", "their"}
    filtered = [w for w in words if w not in stop_words]
    freq: dict = {}
    for w in filtered:
        freq[w] = freq.get(w, 0) + 1
    sorted_kw = sorted(freq.items(), key=lambda x: x[1], reverse=True)[:top_n]
    return [{"word": k, "count": v} for k, v in sorted_kw]


def full_analysis(resume_text: str, jd_text: str = "") -> dict:
    resume_skills = extract_skills(resume_text)
    jd_skills = extract_jd_skills(jd_text) if jd_text else []
    match_score = compute_match_score(resume_text, jd_text) if jd_text else 0.0
    ats_info = compute_ats_score(resume_text)
    skill_gaps = compute_skill_gap(resume_skills, jd_skills)
    suggestions = generate_suggestions(resume_text, skill_gaps, ats_info, match_score)
    keywords = get_keyword_frequency(resume_text)

    return {
        "resume_skills": resume_skills,
        "jd_skills": jd_skills,
        "match_score": match_score,
        "ats_score": ats_info["score"],
        "ats_penalties": ats_info["penalties"],
        "word_count": ats_info["word_count"],
        "skill_gaps": skill_gaps,
        "suggestions": suggestions,
        "keywords": keywords,
    }
