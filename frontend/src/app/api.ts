const BASE = import.meta.env.VITE_API_URL ?? ''

// ── Token storage ──────────────────────────────────────────────────────────
export const token = {
  get: () => localStorage.getItem('hireai_token'),
  set: (t: string) => localStorage.setItem('hireai_token', t),
  clear: () => localStorage.removeItem('hireai_token'),
}

// ── Base fetch ─────────────────────────────────────────────────────────────
async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> ?? {}),
  }
  const t = token.get()
  if (t) headers['Authorization'] = `Bearer ${t}`

  const res = await fetch(`${BASE}${path}`, { ...options, headers })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Request failed' }))
    throw new Error(err.detail ?? 'Request failed')
  }

  // 204 No Content
  if (res.status === 204) return undefined as T
  return res.json()
}

// ── Auth ───────────────────────────────────────────────────────────────────
export const auth = {
  login: (email: string, password: string) =>
    request<{ access_token: string; token_type: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (name: string, email: string, password: string, role: string) =>
    request<{ id: number; name: string; email: string; role: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, role }),
    }),

  me: () => request<{ id: number; name: string; email: string; role: string }>('/auth/me'),
}

// ── Jobs ───────────────────────────────────────────────────────────────────
export const jobs = {
  list: (params?: { skip?: number; limit?: number; status?: string }) => {
    const q = new URLSearchParams()
    if (params?.skip !== undefined) q.set('skip', String(params.skip))
    if (params?.limit !== undefined) q.set('limit', String(params.limit))
    if (params?.status) q.set('status', params.status)
    return request<Job[]>(`/jobs?${q}`)
  },
  get: (id: number) => request<Job>(`/jobs/${id}`),
  create: (data: Partial<Job>) => request<Job>('/jobs', { method: 'POST', body: JSON.stringify(data) }),
}

// ── Candidates ─────────────────────────────────────────────────────────────
export const candidates = {
  list: (params?: { skip?: number; limit?: number }) => {
    const q = new URLSearchParams()
    if (params?.skip !== undefined) q.set('skip', String(params.skip))
    if (params?.limit !== undefined) q.set('limit', String(params.limit))
    return request<Candidate[]>(`/candidates?${q}`)
  },
  get: (id: number) => request<Candidate>(`/candidates/${id}`),
  me: () => request<Candidate>('/candidates/me'),
}

// ── Applications ───────────────────────────────────────────────────────────
export const applications = {
  list: (params?: { candidate_id?: number; job_id?: number }) => {
    const q = new URLSearchParams()
    if (params?.candidate_id !== undefined) q.set('candidate_id', String(params.candidate_id))
    if (params?.job_id !== undefined) q.set('job_id', String(params.job_id))
    return request<Application[]>(`/applications?${q}`)
  },
  create: (candidate_id: number, job_id: number) =>
    request<Application>('/applications', {
      method: 'POST',
      body: JSON.stringify({ candidate_id, job_id }),
    }),
  updateStatus: (id: number, status: string) =>
    request<Application>(`/applications/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
}

// ── Interviews ─────────────────────────────────────────────────────────────
export const interviews = {
  list: () => request<Interview[]>('/interviews'),
  create: (data: Partial<Interview>) =>
    request<Interview>('/interviews', { method: 'POST', body: JSON.stringify(data) }),
}

// ── Analytics ──────────────────────────────────────────────────────────────
export const analytics = {
  summary: () => request<AnalyticsSummary>('/analytics/summary'),
}

// ── Resume ─────────────────────────────────────────────────────────────────
export const resume = {
  upload: (candidateId: number, file: File) => {
    const form = new FormData()
    form.append('file', file)
    const t = token.get()
    return fetch(`${BASE}/resume/upload/${candidateId}`, {
      method: 'POST',
      headers: t ? { Authorization: `Bearer ${t}` } : {},
      body: form,
    }).then(async res => {
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: 'Upload failed' }))
        throw new Error(err.detail ?? 'Upload failed')
      }
      return res.json()
    })
  },
}

// ── API types ──────────────────────────────────────────────────────────────
export interface Job {
  id: number
  recruiter_id?: number
  title: string
  company: string
  location: string
  salary_min: number
  salary_max: number
  type: 'Full-time' | 'Part-time' | 'Contract'
  experience: string
  skills: string[]
  posted_days: number
  applicants: number
  match_score: number
  status: 'Active' | 'Closed'
  created_at?: string
}

export interface Candidate {
  id: number
  user_id?: number
  name: string
  email: string
  role: string
  experience: number
  education: string
  skills: string[]
  match_score: number
  location: string
  status: 'Applied' | 'Screening' | 'Interview' | 'Offer' | 'Hired'
  salary_exp: number
  resume_path?: string
}

export interface Application {
  id: number
  candidate_id: number
  job_id: number
  status: string
  score: number
  matched_skills: string[]
  missing_skills: string[]
  date: string
}

export interface Interview {
  id: number
  application_id: number
  candidate_id: number
  job_id: number
  recruiter_id: number
  scheduled_at: string
  location?: string
  notes?: string
  status: 'Scheduled' | 'Completed' | 'Cancelled'
}

export interface AnalyticsSummary {
  total_jobs: number
  total_candidates: number
  total_applications: number
  total_interviews: number
  total_hires: number
}
