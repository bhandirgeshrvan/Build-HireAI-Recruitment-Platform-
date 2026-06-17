import { useState } from 'react'
import { Upload, Briefcase, Calendar, Star, Eye, ChevronRight } from 'lucide-react'
import { useAuth, useNav } from '../App'
import { KPICard, PageHeader, Tag, ScoreBadge } from './KPICard'
import { JOBS, INTERVIEWS, PROFILE_TODOS } from './data'

const card = 'bg-white rounded-xl p-5'
const cardStyle = { border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }

export function CandidateDashboard() {
  const { user } = useAuth()
  const { navigate } = useNav()
  const [uploaded, setUploaded] = useState(false)
  const completion = 72
  const topJobs = JOBS.slice(0, 7)

  return (
    <div className="space-y-6">
      <PageHeader title={`Welcome back, ${user?.name ?? 'Alex'} 👋`} subtitle="Here's a snapshot of your job search activity." />

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Applied Jobs"      value="12"   delta="+3 this week"  icon={<Briefcase size={16} />} accentColor="#6366f1" />
        <KPICard title="Interview Invites" value="4"    delta="+1 new"        icon={<Calendar size={16} />}  accentColor="#8b5cf6" />
        <KPICard title="Avg Match Score"   value="82%"  delta="+5% this week" icon={<Star size={16} />}      accentColor="#10b981" />
        <KPICard title="Profile Views"     value="147"  delta="+22 this week" icon={<Eye size={16} />}       accentColor="#f59e0b" />
      </div>

      {/* Profile + Interviews */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className={card} style={cardStyle}>
          <div className="flex flex-col items-center text-center mb-4">
            <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl mb-3"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
              👤
            </div>
            <p className="text-sm font-bold text-slate-900">{user?.name ?? 'Alex Johnson'}</p>
            <p className="text-xs text-slate-500 mt-0.5">Senior Software Engineer</p>
          </div>
          {/* Ring */}
          <div className="flex flex-col items-center mb-4">
            <div className="relative w-24 h-24">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e2e8f0" strokeWidth="3" />
                <circle cx="18" cy="18" r="15.9" fill="none"
                  stroke={completion >= 80 ? '#10b981' : '#f59e0b'}
                  strokeWidth="3"
                  strokeDasharray={`${completion} ${100 - completion}`}
                  strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-base font-bold text-slate-900">{completion}%</span>
              </div>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Profile Complete</p>
          </div>
          {/* Checklist */}
          <div className="space-y-1.5 rounded-lg p-3" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-2">To Complete</p>
            {PROFILE_TODOS.map(t => (
              <div key={t.label} className="flex items-center gap-2">
                <span className={`text-xs ${t.done ? 'text-emerald-500' : 'text-red-400'}`}>
                  {t.done ? '✓' : '✗'}
                </span>
                <span className={`text-xs ${t.done ? 'text-slate-400' : 'text-slate-700'}`}>{t.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={`lg:col-span-2 ${card}`} style={cardStyle}>
          <p className="text-sm font-semibold text-slate-900 mb-4">📅 Interview Invitations</p>
          <div className="space-y-2.5">
            {INTERVIEWS.map(iv => (
              <div key={iv.company} className="flex items-center justify-between px-4 py-3 rounded-lg"
                style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderLeft: `3px solid ${iv.color}` }}>
                <div>
                  <span className="text-sm font-semibold text-slate-900">{iv.company}</span>
                  <span className="text-xs text-slate-500 ml-2">· {iv.role}</span>
                </div>
                <span className="text-xs font-medium" style={{ color: iv.color }}>{iv.time}</span>
              </div>
            ))}
          </div>
          <button onClick={() => navigate('application-tracking')}
            className="mt-4 flex items-center gap-1 text-xs text-indigo-600 hover:underline font-medium">
            View all applications <ChevronRight size={12} />
          </button>
        </div>
      </div>

      {/* Recommended Jobs */}
      <div className="rounded-xl overflow-hidden bg-white" style={{ border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        <div className="px-5 py-3.5 flex items-center justify-between border-b" style={{ borderColor: '#e2e8f0' }}>
          <p className="text-sm font-semibold text-slate-900">🎯 Recommended Jobs for You</p>
          <button onClick={() => navigate('job-search')} className="text-xs text-indigo-600 hover:underline font-medium">
            Browse all →
          </button>
        </div>
        <div>
          <div className="grid text-[10px] font-bold text-slate-400 uppercase tracking-wider px-5 py-2.5 bg-slate-50"
            style={{ gridTemplateColumns: '2fr 1.5fr 1.2fr 1fr 0.8fr', borderBottom: '1px solid #e2e8f0' }}>
            <span>Role</span><span>Company</span><span>Location</span><span>Salary</span><span>Match</span>
          </div>
          {topJobs.map((job, i) => (
            <div key={job.id} className="grid items-center px-5 py-3 text-xs hover:bg-slate-50 transition-colors cursor-pointer"
              style={{ gridTemplateColumns: '2fr 1.5fr 1.2fr 1fr 0.8fr', borderBottom: i < topJobs.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
              <span className="font-semibold text-slate-900 truncate pr-2">{job.title}</span>
              <span className="text-slate-500 truncate">{job.company}</span>
              <span className="text-slate-500 truncate">{job.location.split(',')[0]}</span>
              <span className="text-slate-600">${(job.salary_min/1000).toFixed(0)}K–${(job.salary_max/1000).toFixed(0)}K</span>
              <ScoreBadge score={job.match_score} />
            </div>
          ))}
        </div>
      </div>

      {/* Resume Upload */}
      <div className={card} style={cardStyle}>
        <p className="text-sm font-semibold text-slate-900 mb-3">📎 Upload / Update Resume</p>
        {uploaded ? (
          <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-emerald-50 border border-emerald-200">
            <span className="text-emerald-600">✓</span>
            <span className="text-xs text-emerald-700 font-medium">Resume uploaded successfully!</span>
            <button onClick={() => navigate('resume-parser')} className="ml-auto text-xs text-indigo-600 hover:underline font-semibold">
              Parse Resume →
            </button>
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
