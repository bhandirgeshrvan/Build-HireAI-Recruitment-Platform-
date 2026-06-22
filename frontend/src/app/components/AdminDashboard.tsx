import { useState, useEffect } from 'react'
import { useAuth } from '../App'
import { PageHeader, KPICard } from './KPICard'
import { Users, Briefcase, TrendingUp, Shield, Activity, RefreshCw, Download, Trash2, Filter, BarChart } from 'lucide-react'
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const BASE = import.meta.env.VITE_API_URL ?? ''
const tt = {
  contentStyle: { background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 11, color: '#0f172a' },
  labelStyle: { color: '#64748b' },
}
const QUICK_ACTIONS = [
  { label: 'Send Announcement', icon: <Users size={13} />,     msg: '📢 Announcement queued!',         color: '#6366f1' },
  { label: 'Rebuild AI Index',  icon: <RefreshCw size={13} />, msg: '🔄 Re-index triggered.',          color: '#8b5cf6' },
  { label: 'Export Users CSV',  icon: <Download size={13} />,  msg: '📥 Export queued — check email.', color: '#10b981' },
  { label: 'Clear Cache',       icon: <Trash2 size={13} />,    msg: '🧹 Cache cleared.',               color: '#f59e0b' },
]
const card = 'bg-white rounded-xl'
const cardStyle = { border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }

function apiFetch(path: string) {
  const t = localStorage.getItem('hireai_token')
  return fetch(`${BASE}${path}`, { headers: t ? { Authorization: `Bearer ${t}` } : {} }).then(r => r.json())
}

export function AdminDashboard() {
  const { user } = useAuth()
  const [actionMsg, setActionMsg] = useState('')
  const [stats, setStats] = useState<any>(null)
  const [funnel, setFunnel] = useState<any[]>([])
  const [candidates, setCandidates] = useState<any[]>([])
  const [jobs, setJobs] = useState<any[]>([])

  useEffect(() => {
    apiFetch('/analytics/stats').then(d => { if (d?.total_users !== undefined) setStats(d) }).catch(() => {})
    apiFetch('/analytics/funnel').then(d => setFunnel(Array.isArray(d) ? d : [])).catch(() => {})
    apiFetch('/candidates').then(d => setCandidates(Array.isArray(d) ? d.slice(0, 6) : [])).catch(() => {})
    apiFetch('/jobs').then(d => setJobs(Array.isArray(d) ? d.slice(0, 6) : [])).catch(() => {})
  }, [])

  return (
    <div className="space-y-6">
      <PageHeader title={<span className="flex items-center gap-2">Admin Panel · {user?.name ?? 'Admin'}<Shield size={18} className="text-indigo-600" /></span>} subtitle="Platform-wide overview — users, jobs, and system health." />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Total Users"   value={stats ? String(stats.total_users) : '—'}    delta="registered"  icon={<Users size={15} />}      accentColor="#6366f1" />
        <KPICard title="Recruiters"    value={stats ? String(stats.recruiters) : '—'}      delta="accounts"    icon={<Shield size={15} />}     accentColor="#8b5cf6" />
        <KPICard title="Jobs Posted"   value={stats ? String(stats.jobs_posted) : '—'}     delta="total"       icon={<Briefcase size={15} />}  accentColor="#10b981" />
        <KPICard title="Total Hires"   value={stats ? String(stats.hires) : '—'}           delta="completed"   icon={<TrendingUp size={15} />} accentColor="#f59e0b" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Candidates"    value={stats ? String(stats.candidates) : '—'}      delta="registered"  icon={<Users size={15} />}      accentColor="#22c55e" />
        <KPICard title="Active Jobs"   value={stats ? String(stats.active_jobs) : '—'}     delta="live"        icon={<Briefcase size={15} />}  accentColor="#f97316" />
        <KPICard title="Applications"  value={stats ? String(stats.applications) : '—'}    delta="submitted"   icon={<Activity size={15} />}   accentColor="#06b6d4" />
        <KPICard title="Interviews"    value={stats ? String(stats.total_interviews ?? 0) : '—'} delta="scheduled" icon={<Activity size={15} />} accentColor="#8b5cf6" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className={`${card} p-5`} style={cardStyle}>
          <p className="text-xs font-bold text-slate-700 mb-4 flex items-center gap-1.5">
            <Filter size={14} className="text-slate-600" /> Hiring Funnel
          </p>
          {funnel.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-8">No funnel data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <RechartsBarChart data={funnel} barCategoryGap="35%">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="stage" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip {...tt} />
                <Bar dataKey="count" fill="#6366f1" radius={[3, 3, 0, 0]} name="Count" />
              </RechartsBarChart>
            </ResponsiveContainer>
          )}
        </div>
        <div className={`${card} p-5`} style={cardStyle}>
          <p className="text-xs font-bold text-slate-700 mb-4 flex items-center gap-1.5">
            <Users size={14} className="text-slate-600" /> Top Candidates by Match Score
          </p>
          {candidates.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-8">No candidates yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <RechartsBarChart data={candidates.map(c => ({ name: c.name?.split(' ')[0], score: c.match_score ?? 0 }))} barCategoryGap="35%">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip {...tt} />
                <Bar dataKey="score" fill="#10b981" radius={[3, 3, 0, 0]} name="Score %" />
              </RechartsBarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className={`${card} overflow-hidden`} style={cardStyle}>
          <div className="px-4 py-3 border-b bg-slate-50" style={{ borderColor: '#e2e8f0' }}>
            <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Users size={12} /> Recent Candidates
            </p>
          </div>
          {candidates.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6">No candidates yet.</p>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden sm:block">
                <div className="grid text-[9px] font-bold text-slate-400 uppercase tracking-wider px-4 py-2 bg-slate-50"
                  style={{ gridTemplateColumns: '2fr 1.5fr 1.5fr', borderBottom: '1px solid #e2e8f0' }}>
                  <span>Name</span><span>Role</span><span>Status</span>
                </div>
                {candidates.map((c: any, i: number) => (
                  <div key={c.id} className="grid items-center px-4 py-2 text-xs hover:bg-slate-50 transition-colors"
                    style={{ gridTemplateColumns: '2fr 1.5fr 1.5fr', borderBottom: i < candidates.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                    <span className="font-semibold text-slate-900 truncate pr-2">{c.name}</span>
                    <span className="text-slate-500 truncate text-[10px]">{c.role || '—'}</span>
                    <span className="text-slate-400 text-[10px]">{c.status}</span>
                  </div>
                ))}
              </div>
              
              {/* Mobile cards */}
              <div className="sm:hidden space-y-2 p-3">
                {candidates.map((c: any) => (
                  <div key={c.id} className="p-3 rounded-lg border bg-white" style={{ borderColor: '#e2e8f0' }}>
                    <p className="text-sm font-bold text-slate-900">{c.name}</p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                      <span>{c.role || '—'}</span>
                      <span>•</span>
                      <span className="text-slate-400">{c.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
        <div className={`${card} overflow-hidden`} style={cardStyle}>
          <div className="px-4 py-3 border-b bg-slate-50" style={{ borderColor: '#e2e8f0' }}>
            <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Briefcase size={12} /> Recent Job Listings
            </p>
          </div>
          {jobs.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6">No jobs yet.</p>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden sm:block">
                <div className="grid text-[9px] font-bold text-slate-400 uppercase tracking-wider px-4 py-2 bg-slate-50"
                  style={{ gridTemplateColumns: '2fr 1.5fr 0.8fr', borderBottom: '1px solid #e2e8f0' }}>
                  <span>Title</span><span>Company</span><span>Apps</span>
                </div>
                {jobs.map((j: any, i: number) => (
                  <div key={j.id} className="grid items-center px-4 py-2 text-xs hover:bg-slate-50 transition-colors"
                    style={{ gridTemplateColumns: '2fr 1.5fr 0.8fr', borderBottom: i < jobs.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                    <span className="font-semibold text-slate-900 truncate pr-2">{j.title}</span>
                    <span className="text-slate-500 text-[10px]">{j.company}</span>
                    <span className="font-bold text-emerald-600">{j.applicants ?? 0}</span>
                  </div>
                ))}
              </div>
              
              {/* Mobile cards */}
              <div className="sm:hidden space-y-2 p-3">
                {jobs.map((j: any) => (
                  <div key={j.id} className="p-3 rounded-lg border bg-white" style={{ borderColor: '#e2e8f0' }}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-900">{j.title}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{j.company}</p>
                      </div>
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full flex-shrink-0">
                        {j.applicants ?? 0}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className={`${card} p-5`} style={cardStyle}>
        <p className="text-xs font-bold text-slate-700 mb-4">⚡ Quick Actions</p>
        {actionMsg && (
          <div className="mb-3 text-xs px-3 py-2 rounded-lg text-emerald-700 bg-emerald-50 border border-emerald-200">{actionMsg}</div>
        )}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {QUICK_ACTIONS.map(a => (
            <button key={a.label}
              onClick={() => { setActionMsg(a.msg); setTimeout(() => setActionMsg(''), 3000) }}
              className="flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-semibold transition-all hover:shadow-sm"
              style={{ background: `${a.color}10`, border: `1px solid ${a.color}20`, color: a.color }}>
              {a.icon} {a.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
