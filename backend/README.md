# HireAI Backend

FastAPI-based REST API for the HireAI recruitment platform. Handles authentication, job postings, candidate management, resume parsing, application tracking, interview scheduling, and analytics.

---

## Tech Stack

- **Python** 3.11.9
- **FastAPI** 0.115.12
- **SQLAlchemy** 2.0.41 (ORM)
- **PostgreSQL** via `psycopg2-binary`
- **JWT** via `python-jose`
- **Uvicorn** 0.34.3 (ASGI server)
- **Pydantic** 2.11.5
- **bcrypt** for password hashing
- **PyPDF2** + **python-docx** for resume parsing

---

## Project Structure

```
backend/
├── controller/         # Business logic
│   ├── auth_controller.py
│   ├── job_controller.py
│   ├── candidate_controller.py
│   ├── application_controller.py
│   ├── resume_controller.py
│   ├── interview_controller.py
│   └── analytics_controller.py
├── router/             # Route definitions
│   ├── auth_router.py
│   ├── job_router.py
│   ├── candidate_router.py
│   ├── application_router.py
│   ├── resume_router.py
│   ├── interview_router.py
│   └── analytics_router.py
├── models/
│   └── models.py       # SQLAlchemy ORM models
├── core/
│   ├── dependencies.py # Auth dependencies & role guards
│   └── jwt.py          # JWT encode/decode helpers
├── database_config.py  # DB engine, session, Base
├── server.py           # App entry point
├── requirements.txt
├── render.yaml         # Render deployment config
├── reset_db.py         # Drop & recreate all tables
└── seed_demo_users.py  # Seed demo users
```

---

## Setup

### 1. Create & activate conda environment

```bash
conda create -n hireai python=3.11.9 -y
conda activate hireai
```

### 2. Install dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure environment

Create a `.env` file in the `backend/` directory:

```env
DATABASE_LINK=postgresql://<user>:<password>@<host>:<port>/<dbname>
JWT_SECRET=<your-secret-key>
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
UPLOAD_DIR=/tmp/uploads
```

### 4. Run the server

```bash
uvicorn server:app --host 0.0.0.0 --port 8000 --reload
```

API docs available at: `http://localhost:8000/docs`

---

## Data Models

| Model | Description |
|---|---|
| `User` | Auth entity — roles: `candidate`, `recruiter`, `admin` |
| `Job` | Job postings created by recruiters |
| `Candidate` | Candidate profile linked to a user |
| `Resume` | Uploaded resumes with parsed skills |
| `Application` | Candidate ↔ Job application with match score |
| `Interview` | Scheduled interviews linked to an application |

---

## API Endpoints

### Auth — `/auth`

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/auth/register` | Public | Register and receive JWT |
| POST | `/auth/login` | Public | Login and receive JWT |
| GET | `/auth/me` | Authenticated | Get current user info |

### Jobs — `/jobs`

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/jobs/` | Public | List all jobs |
| GET | `/jobs/mine` | Recruiter/Admin | Jobs posted by me |
| GET | `/jobs/{job_id}` | Public | Get job by ID |
| POST | `/jobs/` | Recruiter/Admin | Create job posting |
| PUT | `/jobs/{job_id}` | Recruiter/Admin | Update job posting |
| DELETE | `/jobs/{job_id}` | Recruiter/Admin | Delete job posting |

### Candidates — `/candidates`

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/candidates/` | Recruiter/Admin | List all candidates |
| GET | `/candidates/me` | Candidate | My profile |
| GET | `/candidates/ranking/{job_id}` | Recruiter/Admin | Rank candidates for a job |
| GET | `/candidates/user/{user_id}` | Authenticated | Get candidate by user ID |
| GET | `/candidates/{candidate_id}` | Recruiter/Admin | Get candidate by ID |
| PUT | `/candidates/{candidate_id}` | Authenticated | Update candidate profile |

### Applications — `/applications`

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/applications/` | Candidate | Apply to a job |
| GET | `/applications/kanban` | Recruiter/Admin | Kanban board by pipeline stage |
| GET | `/applications/mine` | Candidate | My applications |
| GET | `/applications/candidate/{candidate_id}` | Recruiter/Admin | Applications by candidate |
| GET | `/applications/job/{job_id}` | Recruiter/Admin | Applications for a job (sorted by match score) |
| PUT | `/applications/{app_id}/status` | Recruiter/Admin | Update pipeline status |

### Resumes — `/resumes`

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/resumes/upload` | Candidate | Upload PDF/DOCX — auto-parses skills |
| GET | `/resumes/mine` | Candidate | My resumes |
| GET | `/resumes/match/{job_id}` | Candidate | Skill match score vs job |
| GET | `/resumes/candidate/{candidate_id}` | Recruiter/Admin | Resumes for a candidate |

### Interviews — `/interviews`

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/interviews/` | Recruiter/Admin | Schedule an interview |
| GET | `/interviews/mine` | Candidate | My upcoming interviews |
| GET | `/interviews/scheduled` | Recruiter/Admin | Interviews scheduled by me |
| GET | `/interviews/job/{job_id}` | Recruiter/Admin | Interviews for a job |
| PUT | `/interviews/{interview_id}` | Recruiter/Admin | Update interview details |
| DELETE | `/interviews/{interview_id}` | Recruiter/Admin | Cancel interview |

### Analytics — `/analytics`

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/analytics/stats` | Admin | Platform-wide stats |
| GET | `/analytics/funnel` | Recruiter/Admin | Hiring pipeline funnel |

---

## Application Pipeline Statuses

`Applied` → `Screening` → `Interview` → `Offer` → `Hired`

---

## Roles

| Role | Permissions |
|---|---|
| `candidate` | Apply to jobs, manage own profile & resumes, view own interviews |
| `recruiter` | Post/manage jobs, view candidates, manage applications & interviews, view analytics funnel |
| `admin` | All recruiter permissions + platform-wide stats |

---

## Deployment (Render)

Configured via `render.yaml`. Set the following environment variables in Render dashboard:

- `DATABASE_LINK`
- `JWT_SECRET`

Start command: `uvicorn server:app --host 0.0.0.0 --port $PORT`

uvicorn server:app --host 0.0.0.0 --port 8000 --reload
