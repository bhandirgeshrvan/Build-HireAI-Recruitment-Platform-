import { useState, useEffect } from 'react'
import { useNav, useAuth } from '../App'
import {
  Briefcase, Users, Calendar, TrendingUp, PlusCircle,
  BarChart2, ChevronRight, MapPin, Clock, ArrowUpRight,
} from 'lucide-react'
import {
  BarChart as RechartsBarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'

const BASE = import.meta.env.VITE_API_URL ?? ''
const card  = 'bg-white rounded-xl'
const cStyle = { border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }
const tt = {
  contentStyle: { background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 11, color: '#0f172a' },
  labelStyle: { color: '#64748b' },
}

const STAGE_COLORS: Record<string, string> = {
  Applied: '#6366f1', Screening: '#8b5cf6', Interview: '#f59e0b', Offer: '#10b981', Hired: '#22c55e',
}
const STAGES = ['Applied', 'Screening', 'Interview', 'Offer', 'Hired']

function apiFetch(path: string) {
  const t = localStorage.getItem('hireai_token')
  return fetch(`${BASE}${path}`, { headers: t ? { Authorization: `Bearer ${t}` } : {} }).then(r => r.json())
}

function CompanyAvatar({ company }: { company: string }) {
  const initials = company.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  const hue = company.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % 360
  return (
    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
      style={{ background: `hsl(${hue},55%,48%)` }}>
      {initials}
    </div>
  )
}

export function RecruiterDashboard() {
  const { user } = useAuth()
  const { navigate } = useNav()
  const [jobs, setJobs]             = useState<any[]>([])
  const [candidates, setCandidates] = useState<any[]>([])
  const [interviews, setInterviews] = useState<any[]>([])
  const [kanban, setKanban]         = useState<Record<string, any[]>>({})

  useEffect(() => {
    apiFetch('/jobs/').then(d => setJobs(Array.isArray(d) ? d : []))
    apiFetch('/candidates/').then(d => setCandidates(Array.isArray(d) ? d : [])).catch(() => {})
    apiFetch('/interviews/scheduled').then(d => setInterviews(Array.isArray(d) ? d : [])).catch(() => {})
    apiFetch('/applications/kanban').then(d => setKanban(d && typeof d === 'object' ? d : {})).catch(() => {})
  }, [])

  const activeJobs       = jobs.filter(j => j.status === 'Active')
  const todayInterviews  = interviews.filter(iv => {
    const d = new Date(iv.scheduled_at)
    return d.toDateString() === new Date().toDateString()
  })
  const totalApplicants  = Object.values(kanban).flat().length
  const hireRate         = candidates.length > 0
    ? Math.round(((kanban['Hired']?.length ?? 0) / candidates.length) * 100)
    : 0

  const funnelData = STAGES.map(stage => ({
    stage, count: kanban[stage]?.length ?? 0, color: STAGE_COLORS[stage],
  }))

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="rounded-2xl p-6 sm:p-8"
        style={{
          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)',
          boxShadow: '0 4px 20px rgba(99,102,241,0.2)',
        }}>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              Welcome back, {user?.name ?? 'Recruiter'}
            </h1>
            <p className="text-indigo-100 text-sm sm:text-base">
              {activeJobs.length > 0
                ? <>You have <span className="font-semibold text-white">{activeJobs.length} active listing{activeJobs.length !== 1 ? 's' : ''}</span> and <span className="font-semibold text-white">{totalApplicants} applicant{totalApplicants !== 1 ? 's' : ''}</span> in the pipeline.</>
                : 'Start by posting a job to begin receiving applications.'}
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Active Jobs',     value: activeJobs.length,       badge: 'live' },
              { label: 'Total Applicants', value: totalApplicants,         badge: 'in pipeline' },
              { label: 'Interviews Today', value: todayInterviews.length,  badge: 'scheduled' },
              { label: 'Hire Rate',       value: `${hireRate}%`,          badge: 'hired/total' },
            ].map(s => (
              <div key={s.label} className="rounded-xl p-4"
                style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)' }}>
                <p className="text-xs font-semibold text-indigo-100 uppercase tracking-wider mb-2">{s.label}</p>
                <div className="flex items-end justify-between">
                  <p className="text-3xl font-bold text-white">{s.value}</p>
                  <span className="text-xs font-medium text-indigo-200 px-2 py-1 rounded-full"
                    style={{ background: 'rgba(255,255,255,0.2)' }}>
                    {s.badge}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pipeline stage chips */}
      <div className="grid grid-cols-5 gap-3">
        {funnelData.map(s => (
          <div key={s.stage} className={`${card} p-4 text-center`} style={cStyle}>
            <div className="text-2xl font-bold mb-1" style={{ color: s.color }}>{s.count}</div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{s.stage}</div>
            <div className="mt-2 h-1 rounded-full" style={{ background: `${s.color}25` }}>
              <div className="h-full rounded-full transition-all" style={{
                width: totalApplicants > 0 ? `${(s.count / totalApplicants) * 100}%` : '0%',
                background: s.color,
              }} />
            </div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className={`${card} p-5`} style={cStyle}>
          <p className="text-xs font-bold text-slate-900 mb-4 flex items-center gap-2">
            <BarChart2 size={14} className="text-indigo-600" /> Pipeline by Stage
          </p>
          <ResponsiveContainer width="100%" height={180}>
            <RechartsBarChart data={funnelData} barCategoryGap="35%">
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="stage" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip {...tt} />
              <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} name="Candidates" />
            </RechartsBarChart>
          </ResponsiveContainer>
        </div>
        <div className={`${card} p-5`} style={cStyle}>
          <p className="text-xs font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Users size={14} className="text-indigo-600" /> Top Candidates by Score
          </p>
          <ResponsiveContainer width="100%" height={180}>
            <RechartsBarChart
              data={candidates.slice(0, 7).map(c => ({
                name: c.name?.split(' ')[0] ?? '?',
                score: Math.round(c.match_score ?? 0),
              }))}
              barCategoryGap="35%">
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} domain={[0, 100]} />
              <Tooltip {...tt} />
              <Bar dataKey="score" fill="#10b981" radius={[4, 4, 0, 0]} name="Match %" />
            </RechartsBarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Active Jobs rich cards */}
      <div className="rounded-xl overflow-hidden bg-white" style={cStyle}>
        <div className="px-5 py-3.5 flex items-center justify-between border-b border-slate-100">
          <p className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <Briefcase size={15} className="text-indigo-600" /> Active Job Listings
          </p>
          <div className="flex items-center gap-2">
            <button onClick={() => navigate('candidate-ranking')}
              className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 border border-indigo-200 bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors">
              <Users size={12} /> Rankings
            </button>
            <button onClick={() => navigate('job-posting')}
              className="flex items-center gap-1.5 text-xs font-semibold text-white px-3 py-1.5 rounded-lg"
              style={{ background: 'linear-gradient(135deg,#6366f1,#4f46e5)', boxShadow: '0 2px 8px rgba(99,102,241,0.25)' }}>
              <PlusCircle size={12} /> Post Job
            </button>
          </div>
        </div>

        {activeJobs.length === 0 ? (
          <div className="text-center py-12">
            <Briefcase size={36} className="mx-auto text-slate-300 mb-3" />
            <p className="text-sm font-semibold text-slate-700">No active jobs yet</p>
            <p className="text-xs text-slate-400 mt-1">Post your first job to start receiving applications.</p>
            <button onClick={() => navigate('job-posting')}
              className="mt-4 px-4 py-2 rounded-lg text-xs font-semibold text-white"
              style={{ background: 'linear-gradient(135deg,#6366f1,#4f46e5)' }}>
              Post a Job
            </button>
          </div>
        ) : (
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {activeJobs.slice(0, 6).map(job => {
              const tc = job.type === 'Full-time' ? '#6366f1' : job.type === 'Internship' ? '#10b981' : '#f59e0b'
              return (
                <div key={job.id} className="rounded-xl p-4 bg-white transition-all hover:shadow-md"
                  style={{ border: '1px solid #e2e8f0' }}>
                  <div className="flex items-start gap-3">
                    <CompanyAvatar company={job.company} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <span className="text-sm font-bold text-slate-900 truncate">{job.title}</span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
                          style={{ background: `${tc}12`, color: tc, border: `1px solid ${tc}20` }}>
                          {job.type}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mb-2">{job.company} · {(job.location ?? '').split(',')[0]}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-600">
                          ${((job.salary_min ?? 0) / 1000).toFixed(0)}K – ${((job.salary_max ?? 0) / 1000).toFixed(0)}K
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                          style={{ background: '#eef2ff', color: '#6366f1', border: '1px solid #c7d2fe' }}>
                          {job.applicants ?? 0} applicants
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Today's interviews */}
      <div className={`${card} p-5`} style={cStyle}>
        <p className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <Calendar size={15} className="text-indigo-600" /> Today's Interviews
        </p>
        {todayInterviews.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 rounded-xl text-center"
            style={{ background: '#f8fafc', border: '2px dashed #e2e8f0' }}>
            <Calendar size={28} className="text-slate-300 mb-2" />
            <p className="text-xs font-semibold text-slate-600">No interviews today</p>
            <p className="text-[11px] text-slate-400 mt-1 max-w-[200px] leading-relaxed">
              Scheduled interviews for today will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {todayInterviews.map((iv: any) => {
              const d = new Date(iv.scheduled_at)
              return (
                <div key={iv.id} className="flex items-center gap-3 px-4 py-3 rounded-lg"
                  style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderLeft: '3px solid #6366f1' }}>
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl flex flex-col items-center justify-center"
                    style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
                    <span className="text-[10px] font-bold text-indigo-200 uppercase leading-none">
                      {d.toLocaleDateString('en', { month: 'short' })}
                    </span>
                    <span className="text-lg font-bold text-white leading-none">{d.getDate()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-900">Candidate #{iv.candidate_id}</p>
                    <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <Clock size={9} />
                      {d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      · {iv.location ?? 'Video Call'}
                    </p>
                  </div>
                  <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full flex-shrink-0"
                    style={{ background: '#eef2ff', color: '#6366f1', border: '1px solid #c7d2fe' }}>
                    {iv.status}
                  </span>
                </div>
              )
            })}
          </div>
        )}
        <button onClick={() => navigate('candidate-ranking')}
          className="mt-4 flex items-center gap-1 text-xs text-indigo-600 hover:underline font-medium">
          View all candidates <ChevronRight size={12} />
        </button>
      </div>
    </div>
  )
}
