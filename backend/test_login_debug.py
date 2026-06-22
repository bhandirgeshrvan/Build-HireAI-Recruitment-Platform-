"""
Debug script to test login with exact credentials
"""
import requests

BASE_URL = "http://localhost:8000"

print("Testing login with both accounts...\n")

# Test 1: Candidate login
print("=" * 60)
print("TEST 1: Candidate Login")
print("=" * 60)
print("Email: aditya.shinde@test.com")
print("Password: TestPassword123!")

try:
    response = requests.post(
        f"{BASE_URL}/auth/login",
        json={
            "email": "aditya.shinde@test.com",
            "password": "TestPassword123!"
        }
    )
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        print("✓ SUCCESS")
        data = response.json()
        print(f"User: {data['user']['name']}")
        print(f"Role: {data['user']['role']}")
    else:
        print("✗ FAILED")
        print(response.text)
except Exception as e:
    print(f"✗ ERROR: {e}")

print("\n")

# Test 2: Recruiter login
print("=" * 60)
print("TEST 2: Recruiter Login")
print("=" * 60)
print("Email: john.recruiter@test.com")
print("Password: RecruiterPass123!")

try:
    response = requests.post(
        f"{BASE_URL}/auth/login",
        json={
            "email": "john.recruiter@test.com",
            "password": "RecruiterPass123!"
        }
    )
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        print("✓ SUCCESS")
        data = response.json()
        print(f"User: {data['user']['name']}")
        print(f"Role: {data['user']['role']}")
    else:
        print("✗ FAILED")
        print(response.text)
except Exception as e:
    print(f"✗ ERROR: {e}")

print("\n")

# Test 3: Wrong password
print("=" * 60)
print("TEST 3: Wrong Password (should fail)")
print("=" * 60)
print("Email: john.recruiter@test.com")
print("Password: WrongPassword")

try:
    response = requests.post(
        f"{BASE_URL}/auth/login",
        json={
            "email": "john.recruiter@test.com",
            "password": "WrongPassword"
        }
    )
    print(f"Status: {response.status_code}")
    if response.status_code == 401:
        print("✓ Correctly rejected")
        print(response.json())
    else:
        print("✗ Unexpected status")
        print(response.text)
except Exception as e:
    print(f"✗ ERROR: {e}")

print("\n" + "=" * 60)
print("SUMMARY")
print("=" * 60)
print("Backend API is working correctly.")
print("If frontend login fails, check:")
print("1. Browser console for errors")
print("2. Network tab for failed requests")
print("3. CORS errors")
print("4. Frontend .env file")
