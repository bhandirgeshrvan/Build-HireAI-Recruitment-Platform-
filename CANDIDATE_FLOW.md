# HireAI — Candidate Side: End-to-End Flow

Complete reference for every candidate-facing feature: which UI page triggers it, which API endpoint handles it, which database table is read or written, and what happens at each step.

---

## Database Tables (Quick Reference)

| Table | Purpose |
|-------|---------|
| `users` | Authentication — stores name, email, hashed password, role |
| `candidates` | Candidate profile — skills, experience, resume path, location, etc. |
| `resumes` | Uploaded resume files — S3 path, parsed skills, raw text, structured JSON |
| `jobs` | Job postings — title, company, salary, skills, status |
| `applications` | One row per candidate × job — ATS score, matched/missing skills, pipeline status |
| `interviews` | Scheduled interview slots — linked to application, candidate, job, recruiter |

---

## Feature 1 — Register & Login

**UI Page:** Landing → Sign Up / Login  
**Frontend file:** `Signup.tsx`, `Login.tsx`, `App.tsx`

### Sign Up
```
POST /auth/register
Body: { name, email, password, role: "candidate" }
```
**Writes to:**
- `users` → inserts new row with hashed password and role `candidate`
- `candidates` → inserts linked candidate profile row (name, email, user_id)

**Returns:** `{ access_token, token_type, user: { id, name, email, role } }`

### Login
```
POST /auth/login
Body: { email, password }
```
**Reads from:** `users` (match email + verify bcrypt hash)  
**Returns:** JWT token + user object  
**Frontend stores:** token in `localStorage` as `hireai_token`

### Session Restore (on page reload)
```
GET /auth/me
Header: Authorization: Bearer <token>
```
**Reads from:** `users` (decode JWT → fetch user row)  
**Used by:** `App.tsx` on mount to restore session without re-login

---

## Feature 2 — Candidate Dashboard

**UI Page:** Dashboard (`CandidateDashboard.tsx`)  
**Loads on:** first page after login

### 2a. Load Open Jobs
```
GET /jobs/?status=Active
(public — no auth required)
```
**Reads from:** `jobs` WHERE `status = 'Active'`  
**Displayed as:** Rich job cards in the Open Jobs grid (top 7)

### 2b. Load My Applications (for hero stats)
```
GET /applications/mine
Header: Authorization: Bearer <token>
```
**Reads from:**
- `applications` WHERE `candidate_id = <me>`
- Joined with `jobs` to get job title and company

**Used to compute:**
- `Applied Jobs` count (hero stat)
- `Top Match` score (highest `score` across all applications)
- `In Progress` count (status in `Applied`, `Screening`, `Interview`)
- Profile Strength checklist (whether `resume_path` is set)

### 2c. Load Interview Schedule
```
GET /interviews/mine
Header: Authorization: Bearer <token>
```
**Reads from:** `interviews` WHERE `candidate_id = <me>` AND `status = 'Scheduled'`  
**Displayed as:** Upcoming interview cards with date badge + time

### 2d. Load Candidate Profile (for completion score)
```
GET /candidates/me
Header: Authorization: Bearer <token>
```
**Reads from:** `candidates` WHERE `user_id = <current user>`  
**Used to compute:** Profile Strength % (name, skills, experience, education, resume_path)

### 2e. Resume Upload (from dashboard shortcut)
```
POST /resumes/upload
Header: Authorization: Bearer <token>
Body: multipart/form-data { file: <pdf|docx> }
```
**Writes to:**
- `resumes` → new row with filename, S3 path, parsed skills, raw text
- `candidates` → updates `resume_path` and `skills` array

**Returns:** resume object with extracted skills and candidate profile

---

## Feature 3 — My Profile

**UI Page:** My Profile (`CandidateProfile.tsx`)

### 3a. Load Profile
```
GET /candidates/me
Header: Authorization: Bearer <token>
```
**Reads from:** `candidates` (all fields including skills array, resume_path, salary_exp)

### 3b. Save Profile Changes
```
PUT /candidates/me
Header: Authorization: Bearer <token>
Body: { name, phone, linkedin, github, role, experience, education, location, salary_exp, skills[] }
```
**Writes to:** `candidates` — updates all editable fields except `email` (email is read-only, stored in `users`)

### 3c. Upload / Replace Resume
```
POST /resumes/upload
Header: Authorization: Bearer <token>
Body: multipart/form-data { file: <pdf|docx> }
```
**Writes to:**
- `resumes` → new row (filename, S3 path, parsed_skills, parsed_profile JSON, raw_text, uploaded_at)
- `candidates` → updates `resume_path` to the new S3 presigned URL and merges extracted `skills`

**Validation (client-side):** PDF or DOCX only, max 10 MB  
**Storage:** AWS S3 bucket `hireai-resumes-prod-2024` under `resumes/candidate_<id>/`

### 3d. Profile Strength Checklist
Computed entirely client-side from the loaded profile — no separate API call.  
Checks: name, phone, location, role, experience > 0, education, linkedin, github, skills.length > 0, salary_exp > 0, resume_path set.

---

## Feature 4 — Resume Analyzer

**UI Page:** Resume Analyzer (`ResumeParser.tsx`, route `resume-analyzer`)

### 4a. ATS Score Check
```
POST /resumes/ats-check
Header: Authorization: Bearer <token>
Body: multipart/form-data { file: <pdf|docx>, job_description: string }
```
**Does NOT write to any table** — this is a pure analysis call.  
**Internally:** Sends resume text + job description to AWS Bedrock (Llama3 model) for scoring.

**Returns:**
```json
{
  "ats_score": 78,
  "filename": "resume.pdf",
  "breakdown": {
    "keyword_match": 80,
    "formatting": 75,
    "experience_relevance": 82,
    "skills_coverage": 70,
    "education_fit": 85
  },
  "strengths": ["..."],
  "improvements": ["..."],
  "missing_keywords": ["..."],
  "skills_found": ["..."],
  "summary": "..."
}
```

**Note:** Job description is optional. Without it, scoring is generic. With it, scoring is tailored to that specific role's keywords.

---

## Feature 5 — Job Search (Find Your Next Role)

**UI Page:** Job Search (`JobSearch.tsx`)

### 5a. Load All Jobs
```
GET /jobs/?limit=100
(public — no auth required)
```
**Reads from:** `jobs` WHERE `status = 'Active'`  
**All filters (location, type, experience, sort) are applied client-side** on the fetched array.

### 5b. Load Already-Applied Job IDs
```
GET /applications/mine
Header: Authorization: Bearer <token>
```
**Reads from:** `applications` WHERE `candidate_id = <me>`  
**Used for:** Showing "✓ Applied" state on job cards the candidate already applied to

### 5c. Apply to a Job (from card Apply button)
Opens `ApplyModal` → on confirm:
```
POST /applications/
Header: Authorization: Bearer <token>
Body: { job_id: <id> }
```
**Writes to:**
- `applications` → new row with `candidate_id`, `job_id`, `status: "Applied"`, ATS `score`, `matched_skills`, `missing_skills`, `date`
- `jobs` → increments `applicants` count

**Score calculation:** Server computes skill overlap between `candidates.skills` and `jobs.skills` at apply time.

### 5d. View Job Detail
Clicking a card navigates to `job-detail` page (no API call — `jobId` passed via nav state):
```
GET /jobs/<job_id>
(public — no auth required)
```
**Reads from:** `jobs` WHERE `id = job_id`

---

## Feature 6 — Job Detail & Apply

**UI Page:** Job Detail (`JobDetail.tsx`)

### 6a. Load Job
```
GET /jobs/<job_id>
(public — no auth required)
```
**Reads from:** `jobs` (single row by ID)  
**Displays:** Title, company, location, salary, type, experience, skills, description

### 6b. Check If Already Applied
```
GET /applications/mine
Header: Authorization: Bearer <token>
```
**Reads from:** `applications` WHERE `candidate_id = <me>`  
**Used for:** Showing "Applied" badge vs "Apply Now" button on the detail page

### 6c. Apply from Detail Page
```
POST /applications/
Header: Authorization: Bearer <token>
Body: { job_id: <id> }
```
Same write path as 5c above.

---

## Feature 7 — Application Tracker

**UI Page:** Application Tracker (`ApplicationTracking.tsx`)

### 7a. Load My Applications
```
GET /applications/mine
Header: Authorization: Bearer <token>
```
**Reads from:**
- `applications` WHERE `candidate_id = <me>`
- Client fetches `GET /jobs/?limit=200` in parallel to build a `jobId → job` lookup map

**Displayed as:** Table rows with company avatar, role, applied date, status badge, ATS score, matched skills

### 7b. Load My Interviews
```
GET /interviews/mine
Header: Authorization: Bearer <token>
```
**Reads from:** `interviews` WHERE `candidate_id = <me>`  
**Displayed as:** Upcoming Interviews card (date badge, time, location/round)

### 7c. Computed Stats (client-side, no extra API)
From the loaded applications array:
- **Total Applied** — `applications.length`
- **In Progress** — rows where `status IN ('Screening', 'Interview')`
- **Offers Received** — rows where `status IN ('Offer', 'Hired')`
- **Shortlisted** — rows where `status IN ('Screening', 'Interview', 'Offer', 'Hired')`
- **Donut chart** — `shortlisted / total`

### 7d. Pro Tips
Computed client-side based on the highest active pipeline stage — no API call.

---

## End-to-End Candidate Journey (Summary Flow)

```
1. REGISTER
   POST /auth/register
   → writes: users, candidates

2. LOGIN
   POST /auth/login
   → reads: users
   → returns: JWT token

3. UPLOAD RESUME (Profile or Dashboard)
   POST /resumes/upload
   → writes: resumes (S3 + parsed data), candidates (resume_path, skills)

4. COMPLETE PROFILE
   PUT /candidates/me
   → writes: candidates (name, phone, location, role, experience, education, salary_exp, skills)

5. BROWSE JOBS
   GET /jobs/?status=Active
   → reads: jobs

6. APPLY TO JOB
   POST /applications/
   → writes: applications (score, matched_skills, missing_skills, status: Applied)
   → writes: jobs (increments applicants count)

7. TRACK APPLICATION
   GET /applications/mine  →  reads: applications
   GET /jobs/?limit=200    →  reads: jobs (for title/company lookup)
   GET /interviews/mine    →  reads: interviews

8. ANALYZE RESUME (optional, any time)
   POST /resumes/ats-check
   → reads: nothing (stateless AI call to Bedrock)
   → returns: score breakdown, missing keywords, suggestions
```

---

## Auth & Security Notes

- Every candidate-only endpoint uses `require_role("candidate")` — requests from recruiter/admin tokens return `403`.
- JWT tokens are decoded server-side on every request; no session storage in the database.
- The `email` field in `candidates` is read-only in the UI — it is sourced from `users.email` and never written via `PUT /candidates/me`.
- Resume files are stored in S3 with 1-year presigned URLs. The URL is stored in `candidates.resume_path` and refreshed on next upload.
- `match_score` on the `candidates` table is the candidate's global score. Per-application ATS score is stored separately in `applications.score` and is what the Application Tracker and Dashboard hero stat use.
