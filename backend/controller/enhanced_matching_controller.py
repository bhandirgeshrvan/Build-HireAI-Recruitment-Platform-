"""
Enhanced candidate-job matching system
Considers multiple factors beyond just skills:
- Technical skills match
- Experience level
- Projects relevance
- Leadership qualities
- Soft skills
- Achievements
- Online presence (GitHub, LeetCode, Codeforces, Portfolio)
- Education fit
"""
from sqlalchemy.orm import Session
from fastapi import HTTPException
from models.models import Candidate, Job, Resume
import re
from controller.profile_scraper_controller import analyze_online_presence


def calculate_experience_score(candidate_exp: int, required_exp_str: str) -> tuple[float, str]:
    """
    Calculate experience match score
    Returns: (score 0-100, feedback message)
    """
    if not required_exp_str or not candidate_exp:
        return 50.0, "Experience not specified"
    
    # Parse required experience (e.g., "2-4 years", "3+ years", "5 years")
    match = re.search(r'(\d+)(?:-(\d+))?', required_exp_str)
    if not match:
        return 50.0, "Could not parse experience requirement"
    
    min_exp = int(match.group(1))
    max_exp = int(match.group(2)) if match.group(2) else min_exp + 2
    
    if candidate_exp < min_exp:
        gap = min_exp - candidate_exp
        score = max(30.0, 70.0 - (gap * 15))
        return score, f"Under-qualified by {gap} year(s)"
    elif candidate_exp > max_exp:
        excess = candidate_exp - max_exp
        score = max(70.0, 100.0 - (excess * 5))
        return score, f"Over-qualified by {excess} year(s)"
    else:
        return 100.0, "Experience matches perfectly"


def analyze_projects_match(parsed_profile: dict, job_description: str, job_skills: list) -> tuple[float, list, str]:
    """
    Analyze if candidate's projects align with job requirements
    Returns: (score 0-100, relevant_projects, feedback)
    """
    if not parsed_profile or 'projects' not in parsed_profile:
        return 0.0, [], "No projects found in resume"
    
    projects = parsed_profile.get('projects', [])
    if not projects:
        return 0.0, [], "No projects listed"
    
    relevant_projects = []
    total_skill_matches = 0
    
    for project in projects:
        if not isinstance(project, dict):
            continue
        
        tech_stack = project.get('tech_stack', [])
        if isinstance(tech_stack, list):
            # Count how many job skills are used in this project
            matches = sum(1 for skill in job_skills if any(skill.lower() in tech.lower() for tech in tech_stack))
            if matches > 0:
                relevant_projects.append({
                    'name': project.get('name', 'Unnamed'),
                    'description': project.get('description', '')[:100],
                    'tech_stack': tech_stack,
                    'matched_skills': matches
                })
                total_skill_matches += matches
    
    # Score based on number of relevant projects and skill matches
    if not relevant_projects:
        return 20.0, [], "No projects align with job requirements"
    
    score = min(100.0, 40.0 + (len(relevant_projects) * 15) + (total_skill_matches * 5))
    feedback = f"Found {len(relevant_projects)} relevant project(s)"
    
    return score, relevant_projects, feedback


def analyze_leadership_and_ownership(parsed_profile: dict) -> tuple[float, list, str]:
    """
    Analyze leadership qualities and ownership from achievements and experience
    Returns: (score 0-100, indicators, feedback)
    """
    indicators = []
    score = 50.0  # Base score
    
    if not parsed_profile:
        return score, indicators, "No profile data available"
    
    # Check achievements
    achievements = parsed_profile.get('achievements', [])
    if achievements:
        leadership_keywords = ['winner', 'lead', 'led', 'managed', 'coordinated', 'founded', 'organized', 'mentored']
        for achievement in achievements:
            if isinstance(achievement, str):
                lower_ach = achievement.lower()
                for keyword in leadership_keywords:
                    if keyword in lower_ach:
                        indicators.append(f"Achievement: {achievement[:80]}")
                        score += 10
                        break
    
    # Check experience descriptions
    experience = parsed_profile.get('experience', [])
    if experience:
        ownership_keywords = ['architected', 'designed', 'built', 'developed', 'implemented', 'created', 'improved']
        for exp in experience:
            if isinstance(exp, dict):
                highlights = exp.get('highlights', [])
                for highlight in highlights:
                    if isinstance(highlight, str):
                        lower_highlight = highlight.lower()
                        for keyword in ownership_keywords:
                            if keyword in lower_highlight:
                                indicators.append(f"Owned: {highlight[:80]}")
                                score += 5
                                break
    
    # Check projects for leadership
    projects = parsed_profile.get('projects', [])
    for project in projects:
        if isinstance(project, dict):
            desc = project.get('description', '').lower()
            if any(word in desc for word in ['built', 'developed', 'created', 'architected']):
                indicators.append(f"Project: {project.get('name', 'Unnamed')}")
                score += 8
    
    score = min(100.0, score)
    
    if score > 80:
        feedback = "Strong leadership and ownership demonstrated"
    elif score > 60:
        feedback = "Good ownership qualities shown"
    else:
        feedback = "Limited leadership indicators"
    
    return score, indicators[:5], feedback  # Return top 5


def analyze_soft_skills(parsed_profile: dict) -> tuple[float, list, str]:
    """
    Analyze soft skills from experience descriptions
    Returns: (score 0-100, found_skills, feedback)
    """
    soft_skills_keywords = {
        'communication': ['presented', 'documented', 'communicated', 'coordinated', 'collaborated'],
        'teamwork': ['team', 'collaborated', 'coordinated', 'cross-functional', 'agile'],
        'problem-solving': ['solved', 'optimized', 'improved', 'reduced', 'enhanced', 'fixed'],
        'adaptability': ['learned', 'adapted', 'migrated', 'transitioned', 'flexible'],
        'time-management': ['delivered', 'deadline', 'sprint', 'scheduled', 'prioritized']
    }
    
    found_skills = []
    score = 40.0  # Base score
    
    if not parsed_profile:
        return score, found_skills, "No profile data available"
    
    # Collect all text from experience and projects
    all_text = []
    
    experience = parsed_profile.get('experience', [])
    for exp in experience:
        if isinstance(exp, dict):
            highlights = exp.get('highlights', [])
            all_text.extend([h.lower() for h in highlights if isinstance(h, str)])
    
    projects = parsed_profile.get('projects', [])
    for project in projects:
        if isinstance(project, dict):
            desc = project.get('description', '')
            if desc:
                all_text.append(desc.lower())
    
    # Search for soft skills
    combined_text = ' '.join(all_text)
    
    for skill_name, keywords in soft_skills_keywords.items():
        for keyword in keywords:
            if keyword in combined_text:
                if skill_name not in [s['skill'] for s in found_skills]:
                    found_skills.append({'skill': skill_name.title(), 'indicator': keyword})
                    score += 12
                break
    
    score = min(100.0, score)
    
    if score > 80:
        feedback = f"Excellent soft skills ({len(found_skills)} areas)"
    elif score > 60:
        feedback = f"Good soft skills ({len(found_skills)} areas)"
    else:
        feedback = "Limited soft skill indicators"
    
    return score, found_skills, feedback


def analyze_achievements(parsed_profile: dict) -> tuple[float, list, str]:
    """
    Analyze achievements and certifications
    Returns: (score 0-100, achievements_list, feedback)
    """
    achievements_list = []
    score = 50.0  # Base score
    
    if not parsed_profile:
        return score, achievements_list, "No profile data available"
    
    # Check achievements
    achievements = parsed_profile.get('achievements', [])
    if achievements:
        for ach in achievements:
            if isinstance(ach, str):
                achievements_list.append({'type': 'Achievement', 'title': ach})
                score += 15
    
    # Check certifications
    certifications = parsed_profile.get('certifications', [])
    if certifications:
        for cert in certifications:
            if isinstance(cert, str):
                achievements_list.append({'type': 'Certification', 'title': cert})
                score += 10
    
    score = min(100.0, score)
    
    total_count = len(achievements) + len(certifications)
    if total_count >= 5:
        feedback = f"Impressive achievements ({total_count} total)"
    elif total_count >= 3:
        feedback = f"Good achievements ({total_count} total)"
    else:
        feedback = f"Some achievements listed ({total_count} total)"
    
    return score, achievements_list, feedback


def calculate_comprehensive_match(db: Session, candidate_id: int, job_id: int) -> dict:
    """
    Calculate comprehensive match score considering multiple factors
    """
    candidate = db.query(Candidate).filter(Candidate.id == candidate_id).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
    
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    # Get resume data
    resume = db.query(Resume).filter(Resume.candidate_id == candidate_id).first()
    parsed_profile = resume.parsed_profile if resume else {}
    
    # 1. Technical Skills Match (25% weight)
    job_skills = set(s.lower() for s in (job.skills or []))
    candidate_skills = set(s.lower() for s in (candidate.skills or []))
    matched_skills = sorted(candidate_skills & job_skills)
    missing_skills = sorted(job_skills - candidate_skills)
    skills_score = round((len(matched_skills) / len(job_skills) * 100) if job_skills else 0, 1)
    
    # 2. Experience Match (20% weight)
    exp_score, exp_feedback = calculate_experience_score(candidate.experience or 0, job.experience or "")
    
    # 3. Projects Relevance (20% weight)
    projects_score, relevant_projects, projects_feedback = analyze_projects_match(
        parsed_profile, 
        job.title + " " + (job.type or ""), 
        list(job_skills)
    )
    
    # 4. Leadership & Ownership (15% weight)
    leadership_score, leadership_indicators, leadership_feedback = analyze_leadership_and_ownership(parsed_profile)
    
    # 5. Soft Skills (10% weight)
    soft_skills_score, soft_skills_found, soft_skills_feedback = analyze_soft_skills(parsed_profile)
    
    # 6. Achievements (10% weight)
    achievements_score, achievements_list, achievements_feedback = analyze_achievements(parsed_profile)
    
    # 7. Online Presence (10% weight) - GitHub, LeetCode, Codeforces, Portfolio
    raw_text = resume.raw_text if resume else ""
    online_presence = analyze_online_presence(parsed_profile, raw_text)
    online_score = online_presence['score']
    
    # Calculate weighted overall score (adjusted weights to include online presence)
    overall_score = round(
        (skills_score * 0.25) +
        (exp_score * 0.15) +
        (projects_score * 0.15) +
        (leadership_score * 0.15) +
        (soft_skills_score * 0.10) +
        (achievements_score * 0.10) +
        (online_score * 0.10),
        1
    )
    
    return {
        "candidate_id": candidate_id,
        "candidate_name": candidate.name,
        "job_id": job_id,
        "job_title": job.title,
        "overall_score": overall_score,
        "breakdown": {
            "technical_skills": {
                "score": skills_score,
                "weight": "25%",
                "matched_skills": matched_skills,
                "missing_skills": missing_skills,
                "total_required": len(job_skills),
                "total_matched": len(matched_skills)
            },
            "experience": {
                "score": exp_score,
                "weight": "15%",
                "candidate_experience": candidate.experience or 0,
                "required_experience": job.experience or "Not specified",
                "feedback": exp_feedback
            },
            "projects": {
                "score": projects_score,
                "weight": "15%",
                "relevant_projects": relevant_projects,
                "feedback": projects_feedback
            },
            "leadership_ownership": {
                "score": leadership_score,
                "weight": "15%",
                "indicators": leadership_indicators,
                "feedback": leadership_feedback
            },
            "soft_skills": {
                "score": soft_skills_score,
                "weight": "10%",
                "found_skills": soft_skills_found,
                "feedback": soft_skills_feedback
            },
            "achievements": {
                "score": achievements_score,
                "weight": "10%",
                "achievements_and_certs": achievements_list,
                "feedback": achievements_feedback
            },
            "online_presence": {
                "score": online_score,
                "weight": "10%",
                "platforms": online_presence['platforms'],
                "indicators": online_presence['total_indicators'],
                "summary": online_presence['summary']
            }
        },
        "recommendation": get_recommendation(overall_score),
        "next_steps": get_next_steps(overall_score)
    }


def get_recommendation(score: float) -> str:
    """Get hiring recommendation based on score"""
    if score >= 85:
        return "Strongly Recommended - Excellent match across all criteria"
    elif score >= 75:
        return "Recommended - Strong candidate with good fit"
    elif score >= 65:
        return "Consider - Good potential with some gaps"
    elif score >= 50:
        return "Maybe - Moderate fit, needs evaluation"
    else:
        return "Not Recommended - Significant gaps in requirements"


def get_next_steps(score: float) -> list:
    """Get recommended next steps based on score"""
    if score >= 85:
        return ["Schedule technical interview immediately", "Prepare offer discussion", "Check references"]
    elif score >= 75:
        return ["Schedule technical interview", "Review portfolio/projects", "Assess cultural fit"]
    elif score >= 65:
        return ["Phone screening first", "Assess skill gaps", "Consider training requirements"]
    elif score >= 50:
        return ["Detailed resume review needed", "Consider for junior positions", "Assess learning potential"]
    else:
        return ["Keep in talent pool", "Consider for different roles", "Encourage skill development"]
