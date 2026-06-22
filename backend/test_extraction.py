#!/usr/bin/env python3
"""
Test script for resume extraction functionality.
Tests the extract_structured_data function with sample resume text.
"""

from controller.resume_controller import extract_structured_data
import json

# Sample resume text
SAMPLE_RESUME = """
John Doe
Software Engineer
john.doe@email.com | (555) 123-4567
San Francisco, CA
LinkedIn: linkedin.com/in/johndoe
GitHub: github.com/johndoe

SUMMARY
Experienced full-stack developer with 5+ years building scalable web applications.
Proficient in Python, JavaScript, and cloud technologies.

SKILLS
Python, JavaScript, React, Node.js, PostgreSQL, AWS, Docker, Git

EXPERIENCE

Senior Software Engineer | Tech Corp | 2021-Present
- Led development of microservices architecture serving 1M+ users
- Implemented CI/CD pipelines reducing deployment time by 60%
- Mentored junior developers and conducted code reviews

Software Engineer | StartupXYZ | 2018-2021
- Built RESTful APIs using Python Flask and FastAPI
- Developed responsive frontend using React and TypeScript
- Managed AWS infrastructure with Terraform

EDUCATION

Bachelor of Science in Computer Science
University of California, Berkeley | 2018

PROJECTS

E-Commerce Platform
Built full-stack e-commerce application with React, Node.js, and MongoDB
Technologies: React, Express, MongoDB, Stripe API

Task Manager API
RESTful API with authentication and real-time updates
Technologies: Python, FastAPI, PostgreSQL, WebSockets

CERTIFICATIONS
AWS Certified Solutions Architect
Google Cloud Professional Developer
"""

def test_extraction():
    print("Testing resume extraction...\n")
    print("=" * 60)
    
    try:
        structured_data = extract_structured_data(SAMPLE_RESUME)
        
        if structured_data:
            print("✓ Extraction successful!\n")
            print(json.dumps(structured_data, indent=2))
            print("\n" + "=" * 60)
            print(f"\nExtracted {len(structured_data)} top-level fields:")
            for key in structured_data.keys():
                print(f"  - {key}")
        else:
            print("✗ Extraction returned None")
            
    except Exception as e:
        print(f"✗ Extraction failed with error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_extraction()
