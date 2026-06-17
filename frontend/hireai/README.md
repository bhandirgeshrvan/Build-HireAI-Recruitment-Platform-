# HireAI – AI Powered Recruitment Platform

A complete Streamlit frontend application for a modern AI recruitment platform.

## Quick Start

```bash
cd hireai
pip install -r requirements.txt
streamlit run app.py
```

## Demo Logins

| Role      | Email                    | Password |
|-----------|--------------------------|----------|
| Candidate | candidate@hireai.com     | demo123  |
| Recruiter | recruiter@hireai.com     | demo123  |
| Admin     | admin@hireai.com         | demo123  |

## Project Structure

```
hireai/
├── app.py                          # Entry point + sidebar routing
├── requirements.txt
├── utils/
│   ├── auth.py                     # Session auth helpers
│   ├── data.py                     # Dummy data generators
│   └── styles.py                   # Global CSS + HTML components
└── pages/
    ├── landing.py                  # Marketing landing page
    ├── login.py                    # Login form
    ├── signup.py                   # Registration form
    ├── candidate_dashboard.py      # Candidate home
    ├── resume_parser.py            # AI resume parser UI
    ├── job_search.py               # Search + filter jobs
    ├── application_tracking.py     # Kanban application board
    ├── recruiter_dashboard.py      # Recruiter home
    ├── job_posting.py              # Create job listing
    ├── candidate_ranking.py        # AI-ranked candidate table
    ├── analytics.py                # Plotly analytics charts
    └── admin_dashboard.py          # Admin controls
```
