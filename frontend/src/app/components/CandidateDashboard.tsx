import { useState, useEffect } from 'react'
import { Upload, Briefcase, Calendar, ChevronRight, User } from 'lucide-react'
import { useAuth, useNav } from '../App'
import { ScoreBadge } from './KPICard'
import { resume as resumeApi } from '../api'

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
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')

  useEffect(() => {
    apiFetch('/jobs/?status=Active').then(d => setJobs(Array.isArray(d) ? d.slice(0, 7) : []))
    apiFetch('/interviews/mine').then(d => setInterviews(Array.isArray(d) ? d : []))
    apiFetch('/applications/mine').then(d => setApplications(Array.isArray(d) ? d : []))
    apiFetch('/candidates/me').then(d => { if (d?.id) setCandidateProfile(d) }).catch(() => {})
  }, [])

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setUploadError('')
    try {
      await resumeApi.upload(file)
      setUploaded(true)
      apiFetch('/candidates/me').then(d => { if (d?.id) setCandidateProfile(d) }).catch(() => {})
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

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

  // Calculate average match score from applications
  const avgMatchScore = applications.length > 0
    ? Math.round(applications.reduce((sum, app) => sum + (app.score ?? 0), 0) / applications.length)
    : 0

  const profileTodos = [
    { done: !!candidateProfile?.name,               label: 'Profile name set' },
    { done: (candidateProfile?.skills?.length > 0),  label: 'Skills listed' },
    { done: !!candidateProfile?.experience,          label: 'Experience added' },
    { done: !!candidateProfile?.education,           label: 'Education filled' },
    { done: !!candidateProfile?.resume_path,         label: 'Resume uploaded' },
  ]

  // Get top match info
  const topMatch = applications.length > 0
    ? applications.reduce((best, app) => (app.score > best.score ? app : best), applications[0])
    : null

  const applicationsInProgress = applications.filter(app => 
    ['Applied', 'Screening', 'Interview'].includes(app.status)
  ).length

  return (
    <div className="space-y-6">
      {/* Hero Banner with Embedded Stats */}
      <div 
        className="rounded-2xl p-6 sm:p-8" 
        style={{ 
          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)',
          boxShadow: '0 4px 20px rgba(99, 102, 241, 0.2)'
        }}
      >
        <div className="space-y-6">
          {/* Greeting */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              Welcome back, {user?.name ?? 'there'}
            </h1>
            <p className="text-indigo-100 text-sm sm:text-base">
              {applicationsInProgress > 0 ? (
                <>
                  You have <span className="font-semibold text-white">{applicationsInProgress} application{applicationsInProgress === 1 ? '' : 's'}</span> in progress
                  {topMatch && avgMatchScore > 0 && (
                    <> and <span className="font-semibold text-white">1 top match</span> waiting</>
                  )}
                </>
              ) : applications.length > 0 ? (
                `Tracking ${applications.length} application${applications.length === 1 ? '' : 's'}`
              ) : (
                'Ready to start your job search journey'
              )}
            </p>
          </div>

          {/* Embedded Mini Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Applied Jobs */}
            <div className="rounded-xl p-4" style={{ background: 'rgba(255, 255, 255, 0.15)', backdropFilter: 'blur(10px)' }}>
              <p className="text-xs font-semibold text-indigo-100 uppercase tracking-wider mb-2">Applied Jobs</p>
              <div className="flex items-end justify-between">
                <p className="text-3xl font-bold text-white">{applications.length}</p>
                <span className="text-xs font-medium text-indigo-200 px-2 py-1 rounded-full" style={{ background: 'rgba(255, 255, 255, 0.2)' }}>
                  Total
                </span>
              </div>
            </div>

            {/* Top Match */}
            <div className="rounded-xl p-4" style={{ background: 'rgba(255, 255, 255, 0.15)', backdropFilter: 'blur(10px)' }}>
              <p className="text-xs font-semibold text-indigo-100 uppercase tracking-wider mb-2">Top Match</p>
              <div className="flex items-end justify-between">
                <p className="text-3xl font-bold text-white">{avgMatchScore}%</p>
                {topMatch && (
                  <span className="text-xs font-medium text-white px-2 py-1 rounded-full truncate max-w-[120px]" style={{ background: 'rgba(16, 185, 129, 0.3)' }}>
                    {topMatch.job?.company || 'Best match'}
                  </span>
                )}
              </div>
            </div>

            {/* Profile Strength */}
            <div className="rounded-xl p-4" style={{ background: 'rgba(255, 255, 255, 0.15)', backdropFilter: 'blur(10px)' }}>
              <p className="text-xs font-semibold text-indigo-100 uppercase tracking-wider mb-2">Profile Strength</p>
              <div className="flex items-end justify-between">
                <p className="text-3xl font-bold text-white">{completion}%</p>
                <span className="text-xs font-medium text-indigo-200 px-2 py-1 rounded-full" style={{ background: 'rgba(255, 255, 255, 0.2)' }}>
                  {completion >= 80 ? 'Strong' : 'Growing'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile + Interviews */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className={card} style={cardStyle}>
          <div className="flex flex-col items-center text-center mb-4">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-3"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
              <User size={28} className="text-white" />
            </div>
            <p className="text-sm font-bold text-slate-900">{user?.name}</p>
            <p className="text-xs text-slate-500 mt-0.5">{candidateProfile?.role || user?.role}</p>
          </div>
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
          <p className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Calendar size={16} className="text-indigo-600" /> Interview Schedule
          </p>
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

      {/* Open Jobs */}
      <div className="rounded-xl overflow-hidden bg-white" style={{ border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        <div className="px-5 py-3.5 flex items-center justify-between border-b" style={{ borderColor: '#e2e8f0' }}>
          <p className="text-sm font-semibold text-slate-900 flex items-center gap-2"><Briefcase size={15} className="text-indigo-600" /> Open Jobs</p>
          <button onClick={() => navigate('job-search')} className="text-xs text-indigo-600 hover:underline font-medium">Browse all →</button>
        </div>
        {jobs.length === 0 ? (
          <div className="text-center py-10">
            <Briefcase size={32} className="mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-semibold text-slate-700">No open jobs yet</p>
            <p className="text-xs text-slate-400 mt-1">Check back soon or broaden your search.</p>
          </div>
        ) : (
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {jobs.map((job: any) => {
              const tc = job.type === 'Full-time' ? '#6366f1' : job.type === 'Contract' ? '#f59e0b' : '#8b5cf6'
              return (
                <div key={job.id}
                  onClick={() => navigate('job-detail', { jobId: job.id })}
                  className="rounded-xl p-4 bg-white cursor-pointer transition-all hover:shadow-md"
                  style={{ border: '1px solid #e2e8f0' }}>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center"
                      style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                      <Briefcase size={16} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <span className="text-sm font-bold text-slate-900 truncate">{job.title}</span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
                          style={{ background: `${tc}12`, color: tc, border: `1px solid ${tc}20` }}>
                          {job.type || 'Full-time'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mb-2">{job.company} · {(job.location ?? '').split(',')[0]}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-600">
                          ${((job.salary_min ?? 0) / 1000).toFixed(0)}K – ${((job.salary_max ?? 0) / 1000).toFixed(0)}K
                        </span>
                        <ScoreBadge score={job.match_score ?? 0} />
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Resume Upload */}
      <div className={card} style={cardStyle}>
        <p className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2"><Upload size={15} className="text-indigo-600" /> Upload / Update Resume</p>
        {uploading ? (
          <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-indigo-50 border border-indigo-200">
            <div className="w-4 h-4 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
            <span className="text-xs text-indigo-700 font-medium">Uploading…</span>
          </div>
        ) : uploaded || candidateProfile?.resume_path ? (
          <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-emerald-50 border border-emerald-200">
            <span className="text-emerald-600">✓</span>
            <span className="text-xs text-emerald-700 font-medium">Resume uploaded!</span>
            <button onClick={() => navigate('resume-analyzer')} className="ml-auto text-xs text-indigo-600 hover:underline font-semibold">Analyze Resume →</button>
          </div>
        ) : (
          <>
            <label className="flex flex-col items-center justify-center gap-2 py-8 rounded-xl cursor-pointer transition-all hover:border-indigo-300 hover:bg-indigo-50"
              style={{ border: '2px dashed #e2e8f0', background: '#f8fafc' }}>
              <Upload size={22} className="text-indigo-400" />
              <p className="text-sm font-medium text-slate-700">Drop PDF/DOCX resume here or click to upload</p>
              <p className="text-xs text-slate-400">PDF or DOCX · Max 10 MB</p>
              <input type="file" accept=".pdf,.docx" className="hidden" onChange={handleResumeUpload} />
            </label>
            {uploadError && <p className="text-xs text-red-500 mt-1">{uploadError}</p>}
          </>
        )}
      </div>
    </div>
  )
}
