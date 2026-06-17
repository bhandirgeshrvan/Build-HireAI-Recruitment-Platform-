"""
Sample dummy data generators for HireAI platform.
All data is synthetic and used only for demonstration.
"""

import numpy as np
import pandas as pd
import random

# ── Seed for reproducibility ──────────────────────────────────────────────
random.seed(42)
np.random.seed(42)

# ── Constants ─────────────────────────────────────────────────────────────
SKILLS_POOL = [
    "Python", "JavaScript", "React", "Node.js", "SQL", "PostgreSQL",
    "AWS", "Docker", "Kubernetes", "Machine Learning", "TensorFlow",
    "FastAPI", "Django", "TypeScript", "Go", "Java", "Spring Boot",
    "GraphQL", "Redis", "MongoDB", "Spark", "Kafka", "CI/CD",
    "Terraform", "Figma", "Product Management", "Data Analysis",
]

COMPANIES = [
    "Google", "Microsoft", "Amazon", "Meta", "Apple", "Netflix",
    "Stripe", "Shopify", "Airbnb", "Uber", "Lyft", "Dropbox",
    "Salesforce", "HubSpot", "Atlassian", "GitHub", "GitLab",
]

LOCATIONS = [
    "San Francisco, CA", "New York, NY", "Austin, TX", "Seattle, WA",
    "Boston, MA", "Chicago, IL", "Los Angeles, CA", "Remote",
    "Denver, CO", "Atlanta, GA",
]

JOB_TITLES = [
    "Senior Software Engineer", "Full Stack Developer", "Data Scientist",
    "Product Manager", "DevOps Engineer", "ML Engineer",
    "Frontend Engineer", "Backend Engineer", "Cloud Architect",
    "Engineering Manager", "QA Engineer", "Security Engineer",
]

CANDIDATE_NAMES = [
    "Alex Johnson", "Maria Garcia", "James Wilson", "Sarah Chen",
    "David Kim", "Emily Rodriguez", "Michael Brown", "Ashley Davis",
    "Daniel Martinez", "Jessica Thompson", "Ryan Lee", "Amanda Taylor",
    "Kevin Patel", "Natalie White", "Chris Harris", "Laura Jackson",
    "Brandon Moore", "Rachel Clark", "Tyler Lewis", "Megan Walker",
]

MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
          "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]


# ── Job listings ──────────────────────────────────────────────────────────
def get_jobs(n: int = 20) -> pd.DataFrame:
    """Return a DataFrame of sample job listings."""
    rows = []
    for i in range(n):
        title = random.choice(JOB_TITLES)
        skills = random.sample(SKILLS_POOL, k=random.randint(3, 6))
        rows.append({
            "id":          i + 1,
            "title":       title,
            "company":     random.choice(COMPANIES),
            "location":    random.choice(LOCATIONS),
            "salary_min":  random.randint(80, 150) * 1000,
            "salary_max":  random.randint(150, 250) * 1000,
            "type":        random.choice(["Full-time", "Part-time", "Contract"]),
            "experience":  random.choice(["0-2 yrs", "2-5 yrs", "5-8 yrs", "8+ yrs"]),
            "skills":      ", ".join(skills),
            "posted_days": random.randint(1, 30),
            "applicants":  random.randint(5, 200),
            "match_score": random.randint(60, 99),
            "status":      random.choice(["Active", "Active", "Active", "Closed"]),
        })
    return pd.DataFrame(rows)


# ── Candidates ────────────────────────────────────────────────────────────
def get_candidates(n: int = 25) -> pd.DataFrame:
    """Return a DataFrame of sample candidate profiles."""
    rows = []
    for i, name in enumerate(CANDIDATE_NAMES[:n]):
        skills = random.sample(SKILLS_POOL, k=random.randint(4, 8))
        rows.append({
            "id":           i + 1,
            "name":         name,
            "email":        f"{name.lower().replace(' ', '.')}@email.com",
            "role":         random.choice(JOB_TITLES),
            "experience":   random.randint(1, 12),
            "education":    random.choice(["B.S. CS", "M.S. CS", "B.S. EE", "MBA", "Ph.D"]),
            "skills":       ", ".join(skills[:5]),
            "match_score":  random.randint(55, 99),
            "location":     random.choice(LOCATIONS),
            "status":       random.choice(["Applied", "Screening", "Interview", "Offer", "Hired"]),
            "applied_date": pd.Timestamp("2024-01-01") + pd.Timedelta(days=random.randint(0, 180)),
            "salary_exp":   random.randint(90, 200) * 1000,
        })
    return pd.DataFrame(rows)


# ── Applications (kanban) ─────────────────────────────────────────────────
def get_applications() -> dict:
    """Return applications bucketed by Kanban stage."""
    cands = get_candidates(20)
    stages = {
        "Applied":    [],
        "Screening":  [],
        "Interview":  [],
        "Offer":      [],
        "Hired":      [],
    }
    for _, row in cands.iterrows():
        stage = row["status"]
        if stage in stages:
            stages[stage].append({
                "name":    row["name"],
                "role":    row["role"],
                "score":   row["match_score"],
                "company": random.choice(COMPANIES),
                "date":    str(row["applied_date"].date()),
            })
    return stages


# ── Analytics data ────────────────────────────────────────────────────────
def get_monthly_applications() -> pd.DataFrame:
    base = [45, 52, 61, 74, 68, 83, 91, 87, 95, 102, 115, 128]
    return pd.DataFrame({"month": MONTHS, "applications": base,
                          "hires": [int(v * random.uniform(0.08, 0.15)) for v in base]})


def get_hiring_funnel() -> pd.DataFrame:
    return pd.DataFrame({
        "stage":  ["Applications", "Screened", "Interviews", "Offers", "Hired"],
        "count":  [1200, 720, 320, 95, 68],
    })


def get_candidate_sources() -> pd.DataFrame:
    return pd.DataFrame({
        "source":  ["LinkedIn", "Indeed", "Referral", "Company Site", "GitHub", "Other"],
        "count":   [420, 310, 185, 145, 90, 50],
    })


def get_skills_demand() -> pd.DataFrame:
    skills = random.sample(SKILLS_POOL, 10)
    return pd.DataFrame({
        "skill":  skills,
        "demand": [random.randint(30, 100) for _ in skills],
    }).sort_values("demand", ascending=False)


def get_time_to_hire() -> pd.DataFrame:
    return pd.DataFrame({
        "department": ["Engineering", "Product", "Design", "Sales", "Marketing", "Data"],
        "days":       [28, 22, 19, 31, 25, 24],
    })


# ── Admin stats ───────────────────────────────────────────────────────────
def get_admin_stats() -> dict:
    return {
        "total_users":     4_821,
        "recruiters":        342,
        "candidates":      4_479,
        "jobs_posted":     1_253,
        "active_jobs":       487,
        "applications":   18_904,
        "hires":             682,
        "monthly_revenue": 48_500,
        "arr":            582_000,
        "churn_rate":        2.3,
    }


def get_revenue_data() -> pd.DataFrame:
    rev = [28000, 31000, 35000, 38000, 41000, 44000,
           42000, 45000, 48000, 51000, 55000, 58000]
    return pd.DataFrame({"month": MONTHS, "revenue": rev,
                          "users": [int(r / 120) for r in rev]})


# ── Resume parser mock ────────────────────────────────────────────────────
def get_mock_resume_data() -> dict:
    """Simulate parsed resume data returned by an AI parser."""
    return {
        "name":    "Alex Johnson",
        "email":   "alex.johnson@email.com",
        "phone":   "+1 (555) 867-5309",
        "location": "San Francisco, CA",
        "summary": (
            "Senior Software Engineer with 7+ years of experience building "
            "scalable distributed systems. Passionate about ML and developer tooling."
        ),
        "score": 87,
        "skills": {
            "technical": ["Python", "Go", "Kubernetes", "AWS", "PostgreSQL",
                          "Redis", "Kafka", "Docker", "Terraform"],
            "soft":      ["Leadership", "Communication", "Problem Solving",
                          "Agile", "Mentoring"],
        },
        "experience": [
            {
                "title":   "Senior Software Engineer",
                "company": "Stripe",
                "dates":   "Jan 2021 – Present",
                "bullets": [
                    "Led migration of payment pipeline to event-driven architecture (Kafka), reducing latency by 40%.",
                    "Mentored 4 junior engineers; conducted 50+ technical interviews.",
                    "Designed multi-region failover system handling 99.99% uptime for $2B daily transactions.",
                ],
            },
            {
                "title":   "Software Engineer",
                "company": "Airbnb",
                "dates":   "Jun 2018 – Dec 2020",
                "bullets": [
                    "Built and maintained search ranking service serving 50M requests/day.",
                    "Reduced infrastructure cost by 30% via spot-instance auto-scaling.",
                ],
            },
        ],
        "education": [
            {
                "degree": "M.S. Computer Science",
                "school": "Stanford University",
                "year":   "2018",
                "gpa":    "3.9",
            },
            {
                "degree": "B.S. Computer Science",
                "school": "UC Berkeley",
                "year":   "2016",
                "gpa":    "3.7",
            },
        ],
        "certifications": [
            "AWS Solutions Architect – Professional",
            "Certified Kubernetes Administrator (CKA)",
        ],
    }
