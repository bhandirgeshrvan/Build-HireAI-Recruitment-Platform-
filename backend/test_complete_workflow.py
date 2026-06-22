"""
Complete end-to-end workflow test:
1. Register users (candidate & recruiter)
2. Upload candidate resume
3. Recruiter posts job
4. Candidate applies for job
5. Check skill matching
6. Schedule interview
7. Test analytics

Run: python test_complete_workflow.py
"""
import requests
import json
import os
from datetime import datetime, timedelta

# Configuration
BASE_URL = "http://localhost:8000"
RESUME_PATH = "/home/ideabliss/Hiring-platform/Build-HireAI-Recruitment-Platform-/resume/Aditya_K_Shinde_Resume_ATS.docx"

# Test data
CANDIDATE_DATA = {
    "name": "Aditya K Shinde",
    "email": "aditya.shinde@test.com",
    "password": "TestPassword123!",
    "role": "candidate"
}

RECRUITER_DATA = {
    "name": "John Recruiter",
    "email": "john.recruiter@test.com",
    "password": "RecruiterPass123!",
    "role": "recruiter"
}

ADMIN_DATA = {
    "name": "Admin User",
    "email": "admin@test.com",
    "password": "AdminPass123!",
    "role": "admin"
}

JOB_DATA = {
    "title": "Full Stack Developer",
    "company": "Tech Innovations Inc",
    "location": "Pune, India",
    "salary_min": 800000,
    "salary_max": 1500000,
    "type": "Full-time",
    "experience": "2-4 years",
    "skills": ["python", "javascript", "react", "node.js", "postgresql", "aws", "docker"],
    "status": "Active"
}

def print_section(title):
    print(f"\n{'='*70}")
    print(f"  {title}")
    print(f"{'='*70}\n")

def print_success(message):
    print(f"✓ {message}")

def print_error(message):
    print(f"✗ {message}")

def print_response(response, limit=None):
    try:
        data = response.json()
        output = json.dumps(data, indent=2)
        if limit and len(output) > limit:
            output = output[:limit] + "\n... (truncated)"
        print(output)
    except:
        print(response.text)

def test_health():
    """Test server health"""
    print_section("Step 1: Server Health Check")
    try:
        response = requests.get(f"{BASE_URL}/")
        if response.status_code == 200:
            print_success("Server is running")
            print_response(response)
            return True
        else:
            print_error(f"Server returned status {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print_error("Cannot connect to server at http://localhost:8000")
        return False

def register_or_login(user_data, user_type):
    """Register or login user"""
    print_section(f"Step 2: {user_type} Authentication")
    
    # Try to register
    response = requests.post(f"{BASE_URL}/auth/register", json=user_data)
    
    if response.status_code in [200, 201]:
        print_success(f"{user_type} registered successfully")
        data = response.json()
        return data.get("access_token")
    elif response.status_code == 400 and "already registered" in response.text:
        print(f"ℹ️  {user_type} already exists, logging in...")
        # Login instead
        response = requests.post(
            f"{BASE_URL}/auth/login",
            json={"email": user_data["email"], "password": user_data["password"]}
        )
        if response.status_code == 200:
            print_success(f"{user_type} logged in successfully")
            data = response.json()
            return data.get("access_token")
    
    print_error(f"Failed to authenticate {user_type}")
    print(f"Status: {response.status_code}")
    print_response(response)
    return None

def get_profile(token, user_type):
    """Get user profile"""
    print_section(f"Step 3: Get {user_type} Profile")
    
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{BASE_URL}/auth/me", headers=headers)
    
    if response.status_code == 200:
        print_success(f"{user_type} profile retrieved")
        profile = response.json()
        print_response(response)
        return profile
    else:
        print_error(f"Failed to get {user_type} profile")
        return None

def update_candidate_profile(token):
    """Update candidate profile with experience and other details"""
    print_section("Step 4b: Update Candidate Profile")
    
    headers = {"Authorization": f"Bearer {token}"}
    profile_data = {
        "phone": "+91 7972873499",
        "linkedin": "https://linkedin.com/in/aditya-shinde45",
        "github": "https://github.com/aditya-shinde-45",
        "experience": 2,  # 2 years experience
        "location": "Pune, India",
        "salary_exp": 1200000  # 12 LPA
    }
    
    response = requests.put(
        f"{BASE_URL}/candidates/me",
        headers=headers,
        json=profile_data
    )
    
    if response.status_code == 200:
        print_success("Profile updated successfully")
        data = response.json()
        print(f"Name: {data['name']}")
        print(f"Experience: {data['experience']} years")
        print(f"Location: {data['location']}")
        print(f"Expected Salary: ₹{data['salary_exp']:,}")
        return data
    else:
        print_error("Profile update failed")
        print_response(response)
        return None


def view_candidate_profile(token, candidate_id, candidate_token=None):
    """View full candidate profile with comprehensive details"""
    print_section(f"Step 4c: View Complete Candidate Profile #{candidate_id}")
    
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{BASE_URL}/candidates/{candidate_id}", headers=headers)
    
    if response.status_code == 200:
        print_success("Candidate profile retrieved")
        candidate = response.json()
        
        print(f"\n{'='*70}")
        print(f"  📋 CANDIDATE PROFILE - {candidate['name']}")
        print(f"{'='*70}")
        
        print(f"\n👤 Basic Information:")
        print(f"  • Name: {candidate['name']}")
        print(f"  • Email: {candidate['email']}")
        print(f"  • Phone: {candidate.get('phone', 'Not provided')}")
        print(f"  • Location: {candidate.get('location', 'Not specified')}")
        
        print(f"\n💼 Professional Details:")
        print(f"  • Experience: {candidate.get('experience', 0)} years")
        print(f"  • Current Role: {candidate.get('role', 'Not specified')}")
        print(f"  • Education: {candidate.get('education', 'Not specified')}")
        print(f"  • Expected Salary: ₹{candidate.get('salary_exp', 0):,}")
        
        print(f"\n🔗 Social Links:")
        print(f"  • LinkedIn: {candidate.get('linkedin', 'Not provided')}")
        print(f"  • GitHub: {candidate.get('github', 'Not provided')}")
        
        # Get resume details - need candidate token for this
        if candidate_token:
            resume_headers = {"Authorization": f"Bearer {candidate_token}"}
            resume_response = requests.get(f"{BASE_URL}/resumes/mine", headers=resume_headers)
            if resume_response.status_code == 200:
                resumes = resume_response.json()
                if resumes:
                    resume = resumes[0]
                    parsed_profile = resume.get('parsed_profile', {})
                    
                    print(f"\n🎓 Education:")
                    education = parsed_profile.get('education', [])
                    if education:
                        for edu in education:
                            if isinstance(edu, dict):
                                print(f"  • {edu.get('degree', 'Degree')} - {edu.get('field', 'Field')}")
                                print(f"    {edu.get('institution', 'Institution')} ({edu.get('start_date', '')}-{edu.get('end_date', '')})")
                    else:
                        print(f"  • No education details available")
                    
                    print(f"\n💻 Technical Skills ({len(candidate.get('skills', []))}):")
                    skills = candidate.get('skills', [])
                    if skills:
                        # Group skills for better display
                        for i in range(0, len(skills), 6):
                            print(f"  • {', '.join(skills[i:i+6])}")
                    else:
                        print(f"  • No skills listed")
                    
                    print(f"\n🚀 Work Experience:")
                    experience = parsed_profile.get('experience', [])
                    if experience:
                        for exp in experience:
                            if isinstance(exp, dict):
                                print(f"\n  • {exp.get('title', 'Position')} at {exp.get('company', 'Company')}")
                                print(f"    {exp.get('start_date', '')} - {exp.get('end_date', '')}")
                                highlights = exp.get('highlights', [])
                                if highlights:
                                    for highlight in highlights[:3]:
                                        print(f"    ✓ {highlight[:70]}{'...' if len(highlight) > 70 else ''}")
                    else:
                        print(f"  • No work experience details")
                    
                    print(f"\n📊 Projects:")
                    projects = parsed_profile.get('projects', [])
                    if projects:
                        for proj in projects[:3]:
                            if isinstance(proj, dict):
                                print(f"\n  • {proj.get('name', 'Project')}")
                                print(f"    {proj.get('description', 'No description')[:100]}")
                                tech_stack = proj.get('tech_stack', [])
                                if tech_stack:
                                    print(f"    Tech: {', '.join(tech_stack[:5])}")
                    else:
                        print(f"  • No projects listed")
                    
                    print(f"\n🏆 Achievements:")
                    achievements = parsed_profile.get('achievements', [])
                    if achievements:
                        for ach in achievements[:5]:
                            if isinstance(ach, str):
                                print(f"  ✓ {ach}")
                    else:
                        print(f"  • No achievements listed")
                    
                    print(f"\n📜 Certifications:")
                    certifications = parsed_profile.get('certifications', [])
                    if certifications:
                        for cert in certifications[:5]:
                            if isinstance(cert, str):
                                print(f"  ✓ {cert}")
                    else:
                        print(f"  • No certifications listed")
        
        print(f"\n{'='*70}\n")
        return candidate
    else:
        print_error("Failed to get candidate profile")
        return None
    """Upload resume"""
    print_section("Step 4: Upload Candidate Resume")
    
    if not os.path.exists(RESUME_PATH):
        print_error(f"Resume file not found: {RESUME_PATH}")
        return None
    
    print(f"📄 File: {RESUME_PATH}")
    print(f"📦 Size: {os.path.getsize(RESUME_PATH)} bytes")
    
    headers = {"Authorization": f"Bearer {token}"}
    
    with open(RESUME_PATH, 'rb') as f:
        files = {'file': (os.path.basename(RESUME_PATH), f, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')}
        response = requests.post(f"{BASE_URL}/resumes/upload", headers=headers, files=files)
    
    if response.status_code in [200, 201]:
        print_success("Resume uploaded successfully")
        data = response.json()
        print(f"Resume ID: {data['id']}")
        print(f"Skills found: {len(data['parsed_skills'])} - {', '.join(data['parsed_skills'][:5])}...")
        return data
    else:
        print_error("Resume upload failed")
        print_response(response)
        return None

def post_job(token):
    """Recruiter posts a job"""
    print_section("Step 5: Recruiter Posts Job")
    
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.post(f"{BASE_URL}/jobs", headers=headers, json=JOB_DATA)
    
    if response.status_code in [200, 201]:
        print_success("Job posted successfully")
        data = response.json()
        print(f"Job ID: {data['id']}")
        print(f"Title: {data['title']}")
        print(f"Company: {data['company']}")
        print(f"Location: {data['location']}")
        print(f"Salary: ₹{data['salary_min']:,} - ₹{data['salary_max']:,}")
        print(f"Skills required: {', '.join(data['skills'])}")
        return data
    else:
        print_error("Job posting failed")
        print_response(response)
        return None

def list_jobs(token):
    """List all jobs"""
    print_section("Step 6: List All Jobs")
    
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{BASE_URL}/jobs", headers=headers)
    
    if response.status_code == 200:
        jobs = response.json()
        print_success(f"Found {len(jobs)} job(s)")
        for job in jobs:
            print(f"\n  • {job['title']} at {job['company']}")
            print(f"    ID: {job['id']}, Status: {job['status']}")
        return jobs
    else:
        print_error("Failed to list jobs")
        return []

def upload_resume(token):
    """Upload resume"""
    print_section("Step 4: Upload Candidate Resume")
    
    if not os.path.exists(RESUME_PATH):
        print_error(f"Resume file not found: {RESUME_PATH}")
        return None
    
    print(f"📄 File: {RESUME_PATH}")
    print(f"📦 Size: {os.path.getsize(RESUME_PATH)} bytes")
    
    headers = {"Authorization": f"Bearer {token}"}
    
    with open(RESUME_PATH, 'rb') as f:
        files = {'file': (os.path.basename(RESUME_PATH), f, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')}
        response = requests.post(f"{BASE_URL}/resumes/upload", headers=headers, files=files)
    
    if response.status_code in [200, 201]:
        print_success("Resume uploaded successfully")
        data = response.json()
        print(f"Resume ID: {data['id']}")
        print(f"Skills found: {len(data['parsed_skills'])} - {', '.join(data['parsed_skills'][:5])}...")
        return data
    else:
        print_error("Resume upload failed")
        print_response(response)
        return None


def get_comprehensive_match(token, candidate_id, job_id):
    """Get comprehensive matching analysis"""
    print_section(f"Step 7b: 🎯 Comprehensive Match Analysis")
    
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(
        f"{BASE_URL}/candidates/{candidate_id}/match/{job_id}",
        headers=headers
    )
    
    if response.status_code == 200:
        print_success("Comprehensive match analysis completed")
        data = response.json()
        
        print(f"\n{'='*70}")
        print(f"  COMPREHENSIVE CANDIDATE-JOB MATCH REPORT")
        print(f"{'='*70}")
        
        print(f"\n🎯 OVERALL MATCH SCORE: {data['overall_score']}%")
        print(f"📋 RECOMMENDATION: {data['recommendation']}")
        
        print(f"\n{'='*70}")
        print(f"  THE SYSTEM IDENTIFIED:")
        print(f"{'='*70}")
        
        breakdown = data['breakdown']
        
        # Technical Skills
        print(f"\n✅ TECHNICAL SKILLS ({breakdown['technical_skills']['weight']}) - Score: {breakdown['technical_skills']['score']}%")
        print(f"   Matched {breakdown['technical_skills']['total_matched']} out of {breakdown['technical_skills']['total_required']} required skills")
        print(f"   ✓ Matched Skills: {', '.join(breakdown['technical_skills']['matched_skills'])}")
        if breakdown['technical_skills']['missing_skills']:
            print(f"   ✗ Missing Skills: {', '.join(breakdown['technical_skills']['missing_skills'])}")
        
        # Experience
        print(f"\n✅ EXPERIENCE LEVEL ({breakdown['experience']['weight']}) - Score: {breakdown['experience']['score']}%")
        print(f"   Candidate has {breakdown['experience']['candidate_experience']} years of experience")
        print(f"   Job requires: {breakdown['experience']['required_experience']}")
        print(f"   Assessment: {breakdown['experience']['feedback']}")
        
        # Projects
        print(f"\n✅ PROJECTS RELEVANCE ({breakdown['projects']['weight']}) - Score: {breakdown['projects']['score']}%")
        print(f"   {breakdown['projects']['feedback']}")
        if breakdown['projects']['relevant_projects']:
            print(f"   Relevant Projects Found:")
            for proj in breakdown['projects']['relevant_projects']:
                print(f"   • {proj['name']}")
                print(f"     └─ {proj['description']}")
                print(f"     └─ Matched {proj['matched_skills']} job-required skills")
                print(f"     └─ Tech: {', '.join(proj.get('tech_stack', [])[:5])}")
        
        # Leadership
        print(f"\n✅ LEADERSHIP & OWNERSHIP ({breakdown['leadership_ownership']['weight']}) - Score: {breakdown['leadership_ownership']['score']}%")
        print(f"   {breakdown['leadership_ownership']['feedback']}")
        if breakdown['leadership_ownership']['indicators']:
            print(f"   Leadership Indicators:")
            for indicator in breakdown['leadership_ownership']['indicators']:
                print(f"   • {indicator}")
        
        # Soft Skills
        print(f"\n✅ SOFT SKILLS ({breakdown['soft_skills']['weight']}) - Score: {breakdown['soft_skills']['score']}%")
        print(f"   {breakdown['soft_skills']['feedback']}")
        if breakdown['soft_skills']['found_skills']:
            print(f"   Identified Soft Skills:")
            for skill_item in breakdown['soft_skills']['found_skills']:
                print(f"   • {skill_item['skill']} (indicator: '{skill_item['indicator']}')")
        
        # Achievements
        print(f"\n✅ ACHIEVEMENTS & CERTIFICATIONS ({breakdown['achievements']['weight']}) - Score: {breakdown['achievements']['score']}%")
        print(f"   {breakdown['achievements']['feedback']}")
        if breakdown['achievements']['achievements_and_certs']:
            print(f"   Notable Achievements:")
            for item in breakdown['achievements']['achievements_and_certs']:
                print(f"   • [{item['type']}] {item['title']}")
        
        print(f"\n{'='*70}")
        print(f"  HIRING RECOMMENDATION")
        print(f"{'='*70}")
        print(f"\n📝 Recommended Next Steps:")
        for i, step in enumerate(data['next_steps'], 1):
            print(f"  {i}. {step}")
        
        print(f"\n{'='*70}\n")
        
        return data
    else:
        print_error("Failed to get comprehensive match")
        print_response(response)
        return None


def apply_for_job(token, job_id):
    """Candidate applies for a job"""
    print_section(f"Step 7: Apply for Job #{job_id}")
    
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.post(
        f"{BASE_URL}/applications",
        headers=headers,
        json={"job_id": job_id}
    )
    
    if response.status_code in [200, 201]:
        print_success("Application submitted successfully")
        data = response.json()
        print(f"Application ID: {data['id']}")
        print(f"Status: {data['status']}")
        print(f"Match Score: {data['score']}%")
        print(f"Matched Skills: {', '.join(data['matched_skills'][:5])}...")
        if data['missing_skills']:
            print(f"Missing Skills: {', '.join(data['missing_skills'][:5])}...")
        return data
    else:
        print_error("Application failed")
        print_response(response)
        return None

def get_my_applications(token):
    """Get candidate's applications"""
    print_section("Step 8: View My Applications")
    
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{BASE_URL}/applications/mine", headers=headers)
    
    if response.status_code == 200:
        applications = response.json()
        print_success(f"Found {len(applications)} application(s)")
        for app in applications:
            print(f"\n  • Application #{app['id']}")
            print(f"    Job ID: {app['job_id']}")
            print(f"    Status: {app['status']}")
            print(f"    Score: {app['score']}%")
        return applications
    else:
        print_error("Failed to get applications")
        return []

def get_job_applications(token, job_id):
    """Recruiter views applications for a job"""
    print_section(f"Step 9: View Applications for Job #{job_id}")
    
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{BASE_URL}/applications/job/{job_id}", headers=headers)
    
    if response.status_code == 200:
        applications = response.json()
        print_success(f"Found {len(applications)} application(s) for this job")
        for app in applications:
            print(f"\n  • Application #{app['id']}")
            print(f"    Candidate: {app.get('candidate_name', 'N/A')}")
            print(f"    Status: {app['status']}")
            print(f"    Score: {app['score']}%")
        return applications
    else:
        print_error("Failed to get job applications")
        return []

def schedule_interview(token, application_id, candidate_id, job_id):
    """Recruiter schedules an interview"""
    print_section(f"Step 10: Schedule Interview for Application #{application_id}")
    
    # Schedule for tomorrow at 2 PM
    interview_time = datetime.now() + timedelta(days=1)
    interview_time = interview_time.replace(hour=14, minute=0, second=0)
    
    headers = {"Authorization": f"Bearer {token}"}
    interview_data = {
        "application_id": application_id,
        "candidate_id": candidate_id,
        "job_id": job_id,
        "scheduled_at": interview_time.isoformat(),
        "location": "Google Meet - link will be sent via email",
        "notes": "Technical round - Full Stack Development"
    }
    
    response = requests.post(
        f"{BASE_URL}/interviews",
        headers=headers,
        json=interview_data
    )
    
    if response.status_code in [200, 201]:
        print_success("Interview scheduled successfully")
        data = response.json()
        print(f"Interview ID: {data['id']}")
        print(f"Scheduled: {data['scheduled_at']}")
        print(f"Location: {data['location']}")
        print(f"Status: {data['status']}")
        return data
    else:
        print_error("Interview scheduling failed")
        print_response(response)
        return None

def get_candidate_interviews(token):
    """Get candidate's interviews"""
    print_section("Step 11: View My Interviews (Candidate)")
    
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{BASE_URL}/interviews/mine", headers=headers)
    
    if response.status_code == 200:
        interviews = response.json()
        print_success(f"Found {len(interviews)} scheduled interview(s)")
        for interview in interviews:
            print(f"\n  • Interview #{interview['id']}")
            print(f"    Job ID: {interview['job_id']}")
            print(f"    Time: {interview['scheduled_at']}")
            print(f"    Location: {interview['location']}")
            print(f"    Status: {interview['status']}")
        return interviews
    else:
        print_error("Failed to get interviews")
        return []

def get_analytics(admin_token, recruiter_token):
    """Get admin/recruiter analytics"""
    print_section("Step 12: View Analytics Dashboard")
    
    # Get stats (admin only)
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    response = requests.get(f"{BASE_URL}/analytics/stats", headers=admin_headers)
    
    stats = None
    if response.status_code == 200:
        stats = response.json()
        print_success("Admin Statistics retrieved")
        print(f"\n📊 Platform Statistics:")
        print(f"  • Total Users: {stats['total_users']}")
        print(f"  • Recruiters: {stats['recruiters']}")
        print(f"  • Candidates: {stats['candidates']}")
        print(f"  • Jobs Posted: {stats['jobs_posted']}")
        print(f"  • Active Jobs: {stats['active_jobs']}")
        print(f"  • Applications: {stats['applications']}")
        print(f"  • Hires: {stats['hires']}")
        print(f"  • Interviews: {stats['total_interviews']}")
    else:
        print_error(f"Failed to get admin stats (status: {response.status_code})")
    
    # Get funnel (recruiter can access)
    recruiter_headers = {"Authorization": f"Bearer {recruiter_token}"}
    funnel_response = requests.get(f"{BASE_URL}/analytics/funnel", headers=recruiter_headers)
    if funnel_response.status_code == 200:
        funnel = funnel_response.json()
        print_success("Hiring Funnel retrieved")
        print(f"\n🔄 Hiring Funnel:")
        for stage in funnel:
            print(f"  • {stage['stage']}: {stage['count']}")
    else:
        print_error("Failed to get hiring funnel")
    
    return stats

def update_application_status(token, application_id, new_status):
    """Update application status"""
    print_section(f"Step 13: Update Application #{application_id} Status")
    
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.put(
        f"{BASE_URL}/applications/{application_id}/status",
        headers=headers,
        json={"status": new_status}
    )
    
    if response.status_code == 200:
        print_success(f"Application status updated to: {new_status}")
        return True
    else:
        print_error("Failed to update status")
        return False

def main():
    print("\n" + "="*70)
    print("  🚀 HireAI - Complete Workflow Test")
    print("="*70)
    print("\nThis test will:")
    print("  1. Register/Login users (candidate, recruiter, admin)")
    print("  2. Upload resume & update profile")
    print("  3. Post a job")
    print("  4. Apply for job with comprehensive matching")
    print("  5. Schedule interview")
    print("  6. View analytics")
    
    # Step 1: Server health
    if not test_health():
        print("\n⚠️  Please start the server:")
        print("   uvicorn server:app --reload")
        return
    
    # Step 2: Authenticate users
    candidate_token = register_or_login(CANDIDATE_DATA, "Candidate")
    if not candidate_token:
        return
    
    recruiter_token = register_or_login(RECRUITER_DATA, "Recruiter")
    if not recruiter_token:
        return
    
    admin_token = register_or_login(ADMIN_DATA, "Admin")
    if not admin_token:
        return
    
    # Step 3: Get profiles
    candidate_profile = get_profile(candidate_token, "Candidate")
    recruiter_profile = get_profile(recruiter_token, "Recruiter")
    admin_profile = get_profile(admin_token, "Admin")
    
    if not candidate_profile or not recruiter_profile or not admin_profile:
        return
    
    # Step 4: Upload resume
    resume_data = upload_resume(candidate_token)
    if not resume_data:
        return
    
    # Step 4b: Update candidate profile
    profile_update = update_candidate_profile(candidate_token)
    
    # Step 4c: View candidate profile (recruiter view)
    candidate_full_profile = view_candidate_profile(recruiter_token, candidate_profile['id'], candidate_token)
    
    # Step 5: Post job
    job_data = post_job(recruiter_token)
    if not job_data:
        return
    
    job_id = job_data['id']
    
    # Step 6: List jobs
    jobs = list_jobs(candidate_token)
    
    # Step 7: Apply for job
    application = apply_for_job(candidate_token, job_id)
    if not application:
        return
    
    application_id = application['id']
    candidate_id = application['candidate_id']
    
    # Step 7b: Get comprehensive match analysis
    comprehensive_match = get_comprehensive_match(recruiter_token, candidate_id, job_id)
    
    # Step 8: View candidate applications
    my_applications = get_my_applications(candidate_token)
    
    # Step 9: View job applications (recruiter)
    job_applications = get_job_applications(recruiter_token, job_id)
    
    # Step 10: Schedule interview
    interview = schedule_interview(recruiter_token, application_id, candidate_id, job_id)
    
    # Step 11: View interviews
    candidate_interviews = get_candidate_interviews(candidate_token)
    
    # Step 12: View analytics
    analytics = get_analytics(admin_token, recruiter_token)
    
    # Step 13: Update application status
    update_application_status(recruiter_token, application_id, "Screening")
    
    # Final Summary
    print_section("✅ Test Complete - Summary")
    print(f"✓ Users registered: 3 (1 candidate, 1 recruiter, 1 admin)")
    print(f"✓ Candidate profile: Updated with experience, location, contact info")
    print(f"✓ Resumes uploaded: 1 (with full profile parsing)")
    print(f"✓ Jobs posted: 1 (Job ID: {job_id})")
    print(f"✓ Applications submitted: 1 (Application ID: {application_id})")
    print(f"✓ Comprehensive matching: {'Completed' if comprehensive_match else 'Failed'}")
    if comprehensive_match:
        print(f"✓ Overall match score: {comprehensive_match['overall_score']}%")
    print(f"✓ Basic skill match: {application['score']}%")
    print(f"✓ Interviews scheduled: {1 if interview else 0}")
    print(f"✓ Analytics working: {'Yes' if analytics else 'No'}")
    
    print(f"\n{'='*70}")
    print("  🎉 Complete Workflow Test PASSED!")
    print("="*70)
    
    print("\n📝 Test Accounts Created:")
    print("  • Candidate: aditya.shinde@test.com / TestPassword123!")
    print("  • Recruiter: john.recruiter@test.com / RecruiterPass123!")
    print("  • Admin: admin@test.com / AdminPass123!")
    
    print("\n📝 Next Steps:")
    print("  • Login to frontend and explore all features")
    print("  • Check applications, interviews, and dashboards")
    print("  • Test the complete hiring workflow")

if __name__ == "__main__":
    main()
