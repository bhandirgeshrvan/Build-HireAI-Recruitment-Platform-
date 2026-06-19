import { useState, useEffect } from 'react'
import { Upload, Briefcase, Calendar, Star, ChevronRight } from 'lucide-react'
import { useAuth, useNav } from '../App'
import { KPICard, PageHeader, ScoreBadge } from './KPICard'

const BASE = import.meta.env.VITE_API_URL ?? ''
const card = 'bg-white rounded-xl p-5'
const cardStyle = { border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }

function apiFetch(path: string) {
  const t = localStorage.getItem('hireai_token')
  return fetch(`${BASE}${path}`, { headers: t ? { Authorization: `Bearer ${t}` } : {} }).then(r => r.json())
}

export function CandidateDashboard() {
  const { user } = useAuth()
  const { navigate } = useNav()
  const [jobs, setJobs] = useState<any[]>([])
  const [interviews, setInterviews] = useState<any[]>([])
  const [applications, setApplications] = useState<any[]>([])
  const [candidateProfile, setCandidateProfile] = useState<any>(null)
  const [uploaded, setUploaded] = useState(false)

  useEffect(() => {
    apiFetch('/jobs?status=Active').then(d => setJobs(Array.isArray(d) ? d.slice(0, 7) : []))
    apiFetch('/interviews/mine').then(d => setInterviews(Array.isArray(d) ? d : []))
    apiFetch('/applications/mine').then(d => setApplications(Array.isArray(d) ? d : []))
    apiFetch('/candidates/me').then(d => { if (d?.id) setCandidateProfile(d) }).catch(() => {})
  }, [])

  const STAGE_COLORS: Record<string, string> = {
    Scheduled: '#10b981', Completed: '#6366f1', Cancelled: '#ef4444'
  }

  const completion = candidateProfile ? (() => {
    let score = 0
    if (candidateProfile.name) score += 20
    if (candidateProfile.skills?.length > 0) score += 20
    if (candidateProfile.experience) score += 20
    if (candidateProfile.education) score += 20
    if (candidateProfile.resume_path) score += 20
    return score
  })() : 0

  const profileTodos = [
    { done: !!candidateProfile?.name,              label: 'Profile name set' },
    { done: (candidateProfile?.skills?.length > 0), label: 'Skills listed' },
    { done: !!candidateProfile?.experience,         label: 'Experience added' },
    { done: !!candidateProfile?.education,          label: 'Education filled' },
    { done: !!candidateProfile?.resume_path,        label: 'Resume uploaded' },
  ]

  return (
    <div className="space-y-6">
      <PageHeader title={`Welcome back, ${user?.name ?? 'there'} 👋`} subtitle="Here's a snapshot of your job search activity." />

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Applied Jobs"      value={String(applications.length)}   delta="total"       icon={<Briefcase size={16} />} accentColor="#6366f1" />
        <KPICard title="Interviews"        value={String(interviews.length)}      delta="scheduled"   icon={<Calendar size={16} />}  accentColor="#8b5cf6" />
        <KPICard title="Avg Match Score"   value={`${candidateProfile?.match_score ?? 0}%`} delta="your score" icon={<Star size={16} />} accentColor="#10b981" />
        <KPICard title="Profile Complete"  value={`${completion}%`}              delta="completion"  icon={<Star size={16} />}      accentColor="#f59e0b" />
      </div>

      {/* Profile + Interviews */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className={card} style={cardStyle}>
          <div className="flex flex-col items-center text-center mb-4">
            <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl mb-3"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>👤</div>
            <p className="text-sm font-bold text-slate-900">{user?.name}</p>
            <p className="text-xs text-slate-500 mt-0.5">{candidateProfile?.role || user?.role}</p>
          </div>
          {/* Completion ring */}
          <div className="flex flex-col items-center mb-4">
            <div className="relative w-24 h-24">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e2e8f0" strokeWidth="3" />
                <circle cx="18" cy="18" r="15.9" fill="none"
                  stroke={completion >= 80 ? '#10b981' : '#f59e0b'} strokeWidth="3"
                  strokeDasharray={`${completion} ${100 - completion}`} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-base font-bold text-slate-900">{completion}%</span>
              </div>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Profile Complete</p>
          </div>
          <div className="space-y-1.5 rounded-lg p-3" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-2">Checklist</p>
            {profileTodos.map(t => (
              <div key={t.label} className="flex items-center gap-2">
                <span className={`text-xs ${t.done ? 'text-emerald-500' : 'text-red-400'}`}>{t.done ? '✓' : '✗'}</span>
                <span className={`text-xs ${t.done ? 'text-slate-400' : 'text-slate-700'}`}>{t.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={`lg:col-span-2 ${card}`} style={cardStyle}>
          <p className="text-sm font-semibold text-slate-900 mb-4">📅 Interview Schedule</p>
          {interviews.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">No interviews scheduled yet.</p>
          ) : (
            <div className="space-y-2.5">
              {interviews.slice(0, 5).map((iv: any) => {
                const color = STAGE_COLORS[iv.status] ?? '#6366f1'
                return (
                  <div key={iv.id} className="flex items-center justify-between px-4 py-3 rounded-lg"
                    style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderLeft: `3px solid ${color}` }}>
                    <div>
                      <span className="text-sm font-semibold text-slate-900">{iv.location ?? 'Video Call'}</span>
                      <span className="text-xs text-slate-500 ml-2">· {iv.status}</span>
                    </div>
                    <span className="text-xs font-medium" style={{ color }}>
                      {new Date(iv.scheduled_at).toLocaleDateString()}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
          <button onClick={() => navigate('application-tracking')}
            className="mt-4 flex items-center gap-1 text-xs text-indigo-600 hover:underline font-medium">
            View all applications <ChevronRight size={12} />
          </button>
        </div>
      </div>

      {/* Recommended Jobs */}
      <div className="rounded-xl overflow-hidden bg-white" style={{ border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        <div className="px-5 py-3.5 flex items-center justify-between border-b" style={{ borderColor: '#e2e8f0' }}>
          <p className="text-sm font-semibold text-slate-900">🎯 Open Jobs</p>
          <button onClick={() => navigate('job-search')} className="text-xs text-indigo-600 hover:underline font-medium">Browse all →</button>
        </div>
        {jobs.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-8">No jobs available yet.</p>
        ) : (
          <div>
            <div className="grid text-[10px] font-bold text-slate-400 uppercase tracking-wider px-5 py-2.5 bg-slate-50"
              style={{ gridTemplateColumns: '2fr 1.5fr 1.2fr 1fr 0.8fr', borderBottom: '1px solid #e2e8f0' }}>
              <span>Role</span><span>Company</span><span>Location</span><span>Salary</span><span>Match</span>
            </div>
            {jobs.map((job: any, i: number) => (
              <div key={job.id} className="grid items-center px-5 py-3 text-xs hover:bg-slate-50 transition-colors cursor-pointer"
                style={{ gridTemplateColumns: '2fr 1.5fr 1.2fr 1fr 0.8fr', borderBottom: i < jobs.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                <span className="font-semibold text-slate-900 truncate pr-2">{job.title}</span>
                <span className="text-slate-500 truncate">{job.company}</span>
                <span className="text-slate-500 truncate">{(job.location ?? '').split(',')[0]}</span>
                <span className="text-slate-600">${((job.salary_min ?? 0)/1000).toFixed(0)}K–${((job.salary_max ?? 0)/1000).toFixed(0)}K</span>
                <ScoreBadge score={job.match_score ?? 0} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Resume Upload */}
      <div className={card} style={cardStyle}>
        <p className="text-sm font-semibold text-slate-900 mb-3">📎 Upload / Update Resume</p>
        {uploaded ? (
          <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-emerald-50 border border-emerald-200">
            <span className="text-emerald-600">✓</span>
            <span className="text-xs text-emerald-700 font-medium">Resume uploaded!</span>
            <button onClick={() => navigate('resume-parser')} className="ml-auto text-xs text-indigo-600 hover:underline font-semibold">Parse Resume →</button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center gap-2 py-8 rounded-xl cursor-pointer transition-all hover:border-indigo-300 hover:bg-indigo-50"
            style={{ border: '2px dashed #e2e8f0', background: '#f8fafc' }}>
            <Upload size={22} className="text-indigo-400" />
            <p className="text-sm font-medium text-slate-700">Drop PDF resume here or click to upload</p>
            <p className="text-xs text-slate-400">PDF format only · Max 10 MB</p>
            <input type="file" accept=".pdf" className="hidden" onChange={() => setUploaded(true)} />
          </label>
        )}
      </div>
    </div>
  )
}
