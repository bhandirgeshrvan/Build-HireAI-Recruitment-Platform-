import { useState, useEffect } from 'react'
import { useNav, useAuth } from '../App'
import { KPICard, PageHeader } from './KPICard'
import { Briefcase, Users, Calendar, TrendingUp, PlusCircle } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const BASE = import.meta.env.VITE_API_URL ?? ''
const tt = {
  contentStyle: { background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 11, color: '#0f172a' },
  labelStyle: { color: '#64748b' },
}
const card = 'bg-white rounded-xl'
const cardStyle = { border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }

function apiFetch(path: string) {
  const t = localStorage.getItem('hireai_token')
  return fetch(`${BASE}${path}`, { headers: t ? { Authorization: `Bearer ${t}` } : {} }).then(r => r.json())
}

const FUNNEL_COLORS = ['#6366f1', '#8b5cf6', '#f59e0b', '#10b981', '#22c55e']
const STAGES = ['Applied', 'Screening', 'Interview', 'Offer', 'Hired']

export function RecruiterDashboard() {
  const { user } = useAuth()
  const { navigate } = useNav()
  const [jobs, setJobs] = useState<any[]>([])
  const [candidates, setCandidates] = useState<any[]>([])
  const [interviews, setInterviews] = useState<any[]>([])
  const [kanban, setKanban] = useState<Record<string, any[]>>({})

  useEffect(() => {
    apiFetch('/jobs').then(d => setJobs(Array.isArray(d) ? d : []))
    apiFetch('/candidates').then(d => setCandidates(Array.isArray(d) ? d : [])).catch(() => {})
    apiFetch('/interviews/scheduled').then(d => setInterviews(Array.isArray(d) ? d : [])).catch(() => {})
    apiFetch('/applications/kanban').then(d => setKanban(d && typeof d === 'object' ? d : {})).catch(() => {})
  }, [])

  const activeJobs = jobs.filter(j => j.status === 'Active').slice(0, 6)
  const todayInterviews = interviews.filter(iv => {
    const d = new Date(iv.scheduled_at)
    const now = new Date()
    return d.toDateString() === now.toDateString()
  }).slice(0, 5)

  const funnelData = STAGES.map((stage, i) => ({
    stage, count: kanban[stage]?.length ?? 0, color: FUNNEL_COLORS[i]
  }))

  // Build weekly app chart from kanban totals by day (approximate from application dates)
  const hireRate = candidates.length > 0
    ? Math.round((kanban['Hired']?.length ?? 0) / candidates.length * 100)
    : 0

  return (
    <div className="space-y-6">
      <PageHeader title={`Welcome, ${user?.name ?? 'Recruiter'} 💼`} subtitle="Manage listings, review candidates, and track hiring progress." />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Active Jobs"      value={String(activeJobs.length)}   delta="live"         icon={<Briefcase size={16} />} accentColor="#6366f1" />
        <KPICard title="Total Candidates" value={String(candidates.length)}   delta="in pipeline"  icon={<Users size={16} />}     accentColor="#8b5cf6" />
        <KPICard title="Interviews Today" value={String(todayInterviews.length)} delta="scheduled" icon={<Calendar size={16} />}  accentColor="#f59e0b" />
        <KPICard title="Hire Rate"        value={`${hireRate}%`}              delta="hired/total"  icon={<TrendingUp size={16} />} accentColor="#10b981" />
      </div>

      {/* Pipeline funnel */}
      <div className="grid grid-cols-5 gap-3">
        {funnelData.map(s => (
          <div key={s.stage} className="rounded-xl p-3 text-center bg-white"
            style={{ border: '1px solid #e2e8f0', borderTop: `3px solid ${s.color}`, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div className="text-xl font-bold" style={{ color: s.color }}>{s.count}</div>
            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">{s.stage}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className={`${card} p-5`} style={cardStyle}>
          <p className="text-xs font-bold text-slate-700 mb-4">📊 Pipeline by Stage</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={funnelData} barCategoryGap="35%">
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="stage" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip {...tt} />
              <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} name="Candidates" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className={`${card} p-5`} style={cardStyle}>
          <p className="text-xs font-bold text-slate-700 mb-4">👥 Top Candidates by Score</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={candidates.slice(0, 7).map(c => ({ name: c.name?.split(' ')[0], score: c.match_score ?? 0 }))} barCategoryGap="35%">
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip {...tt} />
              <Bar dataKey="score" fill="#10b981" radius={[4, 4, 0, 0]} name="Match %" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Active Jobs table */}
      <div className="rounded-xl overflow-hidden bg-white" style={{ border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        <div className="flex items-center justify-between px-5 py-3.5 border-b bg-slate-50" style={{ borderColor: '#e2e8f0' }}>
          <p className="text-sm font-bold text-slate-900">📌 Active Job Listings</p>
          <div className="flex gap-2">
            <button onClick={() => navigate('job-posting')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white"
              style={{ background: 'linear-gradient(135deg,#6366f1,#4f46e5)', boxShadow: '0 2px 6px rgba(99,102,241,0.3)' }}>
              <PlusCircle size={12} /> Post Job
            </button>
            <button onClick={() => navigate('candidate-ranking')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-600 bg-indigo-50 border border-indigo-200">
              <Users size={12} /> Rankings
            </button>
          </div>
        </div>
        {activeJobs.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-8">No active jobs. Post one!</p>
        ) : (
          <div>
            <div className="grid text-[10px] font-bold text-slate-400 uppercase tracking-wider px-5 py-2.5 bg-slate-50"
              style={{ gridTemplateColumns: '2fr 1.5fr 1fr 1fr 0.8fr', borderBottom: '1px solid #e2e8f0' }}>
              <span>Role</span><span>Company</span><span>Type</span><span>Applicants</span><span>Days ago</span>
            </div>
            {activeJobs.map((job: any, i: number) => (
              <div key={job.id} className="grid items-center px-5 py-2.5 text-xs hover:bg-slate-50 transition-colors"
                style={{ gridTemplateColumns: '2fr 1.5fr 1fr 1fr 0.8fr', borderBottom: i < activeJobs.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                <span className="font-semibold text-slate-900 truncate pr-2">{job.title}</span>
                <span className="text-slate-500">{job.company}</span>
                <span className="text-slate-500">{job.type}</span>
                <span className="font-semibold text-slate-800">{job.applicants ?? 0}</span>
                <span className="text-slate-400">{job.posted_days ?? 0}d</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Today's interviews */}
      <div className={`${card} p-5`} style={cardStyle}>
        <p className="text-sm font-bold text-slate-900 mb-4">📅 Today's Interviews</p>
        {todayInterviews.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-4">No interviews scheduled for today.</p>
        ) : (
          <div className="space-y-2">
            {todayInterviews.map((iv: any) => (
              <div key={iv.id} className="flex items-center justify-between px-4 py-2.5 rounded-lg bg-slate-50"
                style={{ border: '1px solid #e2e8f0' }}>
                <div className="flex items-center gap-4">
                  <span className="text-xs font-bold text-indigo-600 min-w-[80px]">
                    {new Date(iv.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <div>
                    <span className="text-xs font-semibold text-slate-900">Candidate #{iv.candidate_id}</span>
                    <span className="text-[10px] text-slate-400 ml-2">· {iv.location ?? 'Video Call'}</span>
                  </div>
                </div>
                <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full"
                  style={{ background: '#eef2ff', color: '#6366f1', border: '1px solid #c7d2fe' }}>
                  {iv.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
