import { useState, useEffect } from 'react'
import { PageHeader, KPICard } from './KPICard'
import { TrendingUp, Users, Briefcase, Activity } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell, FunnelChart, Funnel, LabelList,
} from 'recharts'

const BASE = import.meta.env.VITE_API_URL ?? ''
const tt = {
  contentStyle: { background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 11, color: '#0f172a' },
  labelStyle: { color: '#64748b' },
}
const PIE_COLORS = ['#6366f1', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#94a3b8']
const card = 'bg-white rounded-xl p-5'
const cardStyle = { border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }

function apiFetch(path: string) {
  const t = localStorage.getItem('hireai_token')
  return fetch(`${BASE}${path}`, { headers: t ? { Authorization: `Bearer ${t}` } : {} }).then(r => r.json())
}

export function Analytics() {
  const [stats, setStats] = useState<any>(null)
  const [funnel, setFunnel] = useState<any[]>([])
  const [candidates, setCandidates] = useState<any[]>([])
  const [jobs, setJobs] = useState<any[]>([])

  useEffect(() => {
    apiFetch('/analytics/stats').then(d => { if (d?.total_users !== undefined) setStats(d) }).catch(() => {})
    apiFetch('/analytics/funnel').then(d => setFunnel(Array.isArray(d) ? d : [])).catch(() => {})
    apiFetch('/candidates').then(d => setCandidates(Array.isArray(d) ? d : [])).catch(() => {})
    apiFetch('/jobs').then(d => setJobs(Array.isArray(d) ? d : [])).catch(() => {})
  }, [])

  // Derive skill distribution from candidates
  const skillCounts: Record<string, number> = {}
  candidates.forEach(c => (c.skills ?? []).forEach((s: string) => { skillCounts[s] = (skillCounts[s] ?? 0) + 1 }))
  const topSkills = Object.entries(skillCounts)
    .sort((a, b) => b[1] - a[1]).slice(0, 6)
    .map(([skill, count]) => ({ skill, count }))

  // Status distribution
  const statusCounts: Record<string, number> = {}
  candidates.forEach(c => { statusCounts[c.status] = (statusCounts[c.status] ?? 0) + 1 })
  const statusData = Object.entries(statusCounts).map(([status, count]) => ({ status, count }))

  return (
    <div className="space-y-6">
      <PageHeader title="📈 Analytics Dashboard" subtitle="Live hiring metrics from your database." />

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KPICard title="Total Applications" value={stats ? String(stats.applications) : '—'} delta="all time"   icon={<Users size={15} />}      accentColor="#6366f1" />
        <KPICard title="Total Hires"        value={stats ? String(stats.hires) : '—'}         delta="completed"  icon={<TrendingUp size={15} />}  accentColor="#10b981" />
        <KPICard title="Active Jobs"        value={stats ? String(stats.active_jobs) : '—'}   delta="live"       icon={<Briefcase size={15} />}   accentColor="#8b5cf6" />
        <KPICard title="Total Candidates"   value={stats ? String(stats.candidates) : '—'}    delta="registered" icon={<Activity size={15} />}    accentColor="#f59e0b" />
      </div>

      {/* Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className={card} style={cardStyle}>
          <p className="text-xs font-bold text-slate-700 mb-4">🔻 Hiring Funnel</p>
          {funnel.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-8">No funnel data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <FunnelChart>
                <Tooltip {...tt} />
                <Funnel dataKey="count" data={funnel} isAnimationActive>
                  <LabelList position="right" fill="#64748b" stroke="none" fontSize={10}
                    formatter={(val: number) => val.toLocaleString()} />
                  {funnel.map((entry, index) => (
                    <Cell key={index} fill={entry.fill ?? PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Funnel>
              </FunnelChart>
            </ResponsiveContainer>
          )}
        </div>
        <div className={card} style={cardStyle}>
          <p className="text-xs font-bold text-slate-700 mb-4">📊 Candidate Status Distribution</p>
          {statusData.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-8">No candidate data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={statusData} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="status" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip {...tt} />
                <Bar dataKey="count" fill="#6366f1" radius={[3, 3, 0, 0]} name="Candidates" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className={card} style={cardStyle}>
          <p className="text-xs font-bold text-slate-700 mb-4">🛠️ Top Skills in Candidate Pool</p>
          {topSkills.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-8">No skill data yet.</p>
          ) : (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="50%" height={180}>
                <PieChart>
                  <Pie data={topSkills} dataKey="count" nameKey="skill"
                    cx="50%" cy="50%" innerRadius={50} outerRadius={75} strokeWidth={2} stroke="#fff">
                    {topSkills.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip {...tt} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col gap-2">
                {topSkills.map((s, i) => (
                  <div key={s.skill} className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: PIE_COLORS[i] }} />
                    <span className="text-[10px] text-slate-500">{s.skill}</span>
                    <span className="text-[10px] font-bold text-slate-900 ml-auto">{s.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className={card} style={cardStyle}>
          <p className="text-xs font-bold text-slate-700 mb-4">🏢 Top Jobs by Applicants</p>
          {jobs.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-8">No jobs yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart
                data={jobs.sort((a, b) => (b.applicants ?? 0) - (a.applicants ?? 0)).slice(0, 7)
                  .map(j => ({ name: j.title?.split(' ').slice(0, 2).join(' '), apps: j.applicants ?? 0 }))}
                layout="vertical" barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" width={90} tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip {...tt} />
                <Bar dataKey="apps" fill="#8b5cf6" radius={[0, 4, 4, 0]} name="Applicants" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  )
}
