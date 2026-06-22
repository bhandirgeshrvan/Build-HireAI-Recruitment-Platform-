"""
Complete end-to-end test script:
1. Reset database
2. Register candidate and recruiter
3. Upload resume
4. Test all endpoints

Run: python test_full_flow.py
"""
import requests
import json
import os
from pathlib import Path

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

def print_section(title):
    print(f"\n{'='*60}")
    print(f"  {title}")
    print(f"{'='*60}\n")

def print_success(message):
    print(f"✓ {message}")

def print_error(message):
    print(f"✗ {message}")

def print_response(response):
    try:
        data = response.json()
        print(json.dumps(data, indent=2))
    except:
        print(response.text)

def test_health():
    """Test if server is running"""
    print_section("1. Testing Server Health")
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
        print_error("Cannot connect to server. Make sure it's running on http://localhost:8000")
        return False

def register_user(user_data, user_type):
    """Register a new user"""
    print_section(f"2. Registering {user_type}")
    
    response = requests.post(
        f"{BASE_URL}/auth/register",
        json=user_data
    )
    
    if response.status_code in [200, 201]:
        print_success(f"{user_type} registered successfully")
        data = response.json()
        print_response(response)
        return data.get("access_token")
    else:
        print_error(f"Failed to register {user_type}")
        print(f"Status Code: {response.status_code}")
        print_response(response)
        return None

def login_user(email, password, user_type):
    """Login user"""
    print_section(f"2b. Logging in {user_type}")
    
    response = requests.post(
        f"{BASE_URL}/auth/login",
        json={"email": email, "password": password}
    )
    
    if response.status_code == 200:
        print_success(f"{user_type} logged in successfully")
        data = response.json()
        print_response(response)
        return data.get("access_token")
    else:
        print_error(f"Failed to login {user_type}")
        print(f"Status Code: {response.status_code}")
        print_response(response)
        return None

def get_profile(token, user_type):
    """Get user profile"""
    print_section(f"3. Getting {user_type} Profile")
    
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{BASE_URL}/auth/me", headers=headers)
    
    if response.status_code == 200:
        print_success(f"{user_type} profile retrieved")
        print_response(response)
        return response.json()
    else:
        print_error(f"Failed to get {user_type} profile")
        print_response(response)
        return None

def upload_resume(token):
    """Upload resume for candidate"""
    print_section("4. Uploading Resume")
    
    if not os.path.exists(RESUME_PATH):
        print_error(f"Resume file not found at: {RESUME_PATH}")
        return None
    
    print(f"Resume file: {RESUME_PATH}")
    print(f"File size: {os.path.getsize(RESUME_PATH)} bytes")
    
    headers = {"Authorization": f"Bearer {token}"}
    
    with open(RESUME_PATH, 'rb') as f:
        files = {'file': (os.path.basename(RESUME_PATH), f, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')}
        response = requests.post(
            f"{BASE_URL}/resumes/upload",
            headers=headers,
            files=files
        )
    
    if response.status_code in [200, 201]:
        print_success("Resume uploaded successfully")
        print_response(response)
        return response.json()
    else:
        print_error("Failed to upload resume")
        print(f"Status Code: {response.status_code}")
        print_response(response)
        return None

def get_my_resumes(token):
    """Get candidate's resumes"""
    print_section("5. Getting Candidate Resumes")
    
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{BASE_URL}/resumes/mine", headers=headers)
    
    if response.status_code == 200:
        print_success("Retrieved candidate resumes")
        print_response(response)
        return response.json()
    else:
        print_error("Failed to get resumes")
        print_response(response)
        return None

def ats_check(token):
    """Test ATS check"""
    print_section("6. Testing ATS Check")
    
    if not os.path.exists(RESUME_PATH):
        print_error(f"Resume file not found at: {RESUME_PATH}")
        return None
    
    headers = {"Authorization": f"Bearer {token}"}
    
    with open(RESUME_PATH, 'rb') as f:
        files = {'file': (os.path.basename(RESUME_PATH), f, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')}
        data = {'job_description': 'Looking for a software engineer with Python and React experience'}
        response = requests.post(
            f"{BASE_URL}/resumes/ats-check",
            headers=headers,
            files=files,
            data=data
        )
    
    if response.status_code == 200:
        print_success("ATS check completed")
        print_response(response)
        return response.json()
    else:
        print_error("Failed ATS check")
        print(f"Status Code: {response.status_code}")
        print_response(response)
        return None

def main():
    print("\n" + "="*60)
    print("  HireAI - Complete End-to-End Test")
    print("="*60)
    
    # Test server health
    if not test_health():
        print("\n⚠️  Please start the server first:")
        print("   cd Build-HireAI-Recruitment-Platform-/backend")
        print("   uvicorn server:app --reload")
        return
    
    # Register Candidate
    candidate_token = register_user(CANDIDATE_DATA, "Candidate")
    if not candidate_token:
        print("\n⚠️  Registration failed. This might be okay if user already exists.")
        print("Trying to login instead...")
        candidate_token = login_user(CANDIDATE_DATA["email"], CANDIDATE_DATA["password"], "Candidate")
    
    if not candidate_token:
        print_error("Cannot proceed without candidate token")
        return
    
    # Register Recruiter
    recruiter_token = register_user(RECRUITER_DATA, "Recruiter")
    if not recruiter_token:
        print("\n⚠️  Registration failed. This might be okay if user already exists.")
        print("Trying to login instead...")
        recruiter_token = login_user(RECRUITER_DATA["email"], RECRUITER_DATA["password"], "Recruiter")
    
    if not recruiter_token:
        print_error("Cannot proceed without recruiter token")
        return
    
    # Get profiles
    candidate_profile = get_profile(candidate_token, "Candidate")
    recruiter_profile = get_profile(recruiter_token, "Recruiter")
    
    # Upload resume
    resume_data = upload_resume(candidate_token)
    
    # Get candidate resumes
    resumes = get_my_resumes(candidate_token)
    
    # Test ATS check
    ats_result = ats_check(candidate_token)
    
    # Final summary
    print_section("Test Summary")
    print(f"✓ Server is running")
    print(f"✓ Candidate registered/logged in: {CANDIDATE_DATA['email']}")
    print(f"✓ Recruiter registered/logged in: {RECRUITER_DATA['email']}")
    print(f"✓ Candidate token: {candidate_token[:20]}...")
    print(f"✓ Recruiter token: {recruiter_token[:20]}...")
    
    if resume_data:
        print(f"✓ Resume uploaded successfully")
    else:
        print(f"✗ Resume upload failed")
    
    if resumes:
        print(f"✓ Resume retrieval working")
    else:
        print(f"✗ Resume retrieval failed")
    
    if ats_result:
        print(f"✓ ATS check working")
    else:
        print(f"✗ ATS check failed")
    
    print("\n" + "="*60)
    print("  Test Complete!")
    print("="*60 + "\n")

if __name__ == "__main__":
    main()
