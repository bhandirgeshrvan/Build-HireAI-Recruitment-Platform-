import { useState, useEffect, useMemo } from 'react'
import {
  FileText, Briefcase, Calendar, Search, Filter, ChevronLeft,
  ChevronRight, ArrowUpRight, X, Download, Plus, Clock, Building2,
} from 'lucide-react'
import { useNav } from '../App'

const BASE = import.meta.env.VITE_API_URL ?? ''

const ALL_STAGES = ['Applied', 'Screening', 'Interview', 'Offer', 'Hired', 'Rejected', 'Withdrawn']

const STATUS_META: Record<string, { color: string; bg: string; border: string }> = {
  Applied:   { color: '#64748b', bg: '#f1f5f9',   border: '#cbd5e1' },
  Screening: { color: '#6366f1', bg: '#eef2ff',   border: '#c7d2fe' },
  Interview: { color: '#f59e0b', bg: '#fffbeb',   border: '#fde68a' },
  Offer:     { color: '#10b981', bg: '#ecfdf5',   border: '#6ee7b7' },
  Hired:     { color: '#ffffff', bg: '#10b981',   border: '#10b981' },
  Rejected:  { color: '#ef4444', bg: '#fef2f2',   border: '#fecaca' },
  Withdrawn: { color: '#94a3b8', bg: '#f8fafc',   border: '#e2e8f0' },
}

interface AppRow {
  id: number
  job_id: number
  job_title: string
  company: string
  date: string
  status: string
  score: number
  matched_skills: string[]
}

function apiFetch(path: string) {
  const t = localStorage.getItem('hireai_token')
  return fetch(`${BASE}${path}`, { headers: t ? { Authorization: `Bearer ${t}` } : {} }).then(r => r.json())
}

function StatusBadge({ status }: { status: string }) {
  const m = STATUS_META[status] ?? STATUS_META['Applied']
  const isSolid = status === 'Hired'
  return (
    <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap"
      style={{
        color: m.color,
        background: m.bg,
        border: `1px solid ${m.border}`,
        ...(isSolid ? { color: '#fff' } : {}),
      }}>
      {status}
    </span>
  )
}

function CompanyAvatar({ company }: { company: string }) {
  const initials = company.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  const hue = company.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % 360
  return (
    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0"
      style={{ background: `hsl(${hue},60%,50%)` }}>
      {initials}
    </div>
  )
}

// Minimal SVG donut chart — no external dep
function DonutChart({ shortlisted, total }: { shortlisted: number; total: number }) {
  const r = 40
  const circ = 2 * Math.PI * r
  const pct = total > 0 ? shortlisted / total : 0
  const dash = pct * circ
  return (
    <svg width="100" height="100" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r={r} fill="none" stroke="#e2e8f0" strokeWidth="14" />
      <circle cx="50" cy="50" r={r} fill="none"
        stroke="#6366f1" strokeWidth="14"
        strokeDasharray={`${dash} ${circ - dash}`}
        strokeDashoffset={circ / 4}
        strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 0.6s ease' }} />
      <text x="50" y="54" textAnchor="middle" fontSize="14" fontWeight="700" fill="#0f172a">
        {total > 0 ? Math.round(pct * 100) : 0}%
      </text>
    </svg>
  )
}

const PAGE_SIZE = 8

export function ApplicationTracking() {
  const { navigate } = useNav()
  const [rows, setRows]           = useState<AppRow[]>([])
  const [interviews, setInterviews] = useState<any[]>([])
  const [loading, setLoading]     = useState(true)
  const [query, setQuery]         = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [page, setPage]           = useState(1)

  useEffect(() => {
    Promise.all([
      apiFetch('/applications/mine'),
      apiFetch('/jobs/?limit=200'),
      apiFetch('/interviews/mine'),
    ]).then(([apps, jobs, ivs]) => {
      const jobMap: Record<number, any> = {}
      if (Array.isArray(jobs)) jobs.forEach((j: any) => { jobMap[j.id] = j })

      if (Array.isArray(apps)) {
        setRows(apps.map((app: any) => ({
          id: app.id,
          job_id: app.job_id,
          job_title: jobMap[app.job_id]?.title ?? `Job #${app.job_id}`,
          company: jobMap[app.job_id]?.company ?? '—',
          date: app.date ?? '',
          status: ALL_STAGES.includes(app.status) ? app.status : 'Applied',
          score: app.score ?? 0,
          matched_skills: app.matched_skills ?? [],
        })))
      }
      if (Array.isArray(ivs)) setInterviews(ivs)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  // Derived stats
  const total       = rows.length
  const inProgress  = rows.filter(r => ['Screening', 'Interview'].includes(r.status)).length
  const offers      = rows.filter(r => ['Offer', 'Hired'].includes(r.status)).length
  const shortlisted = rows.filter(r => ['Screening', 'Interview', 'Offer', 'Hired'].includes(r.status)).length

  // Contextual pro tips based on stage
  const hasOffer     = rows.some(r => r.status === 'Offer')
  const hasInterview = rows.some(r => r.status === 'Interview')
  const hasScreening = rows.some(r => r.status === 'Screening')
  const proTips = hasOffer ? [
    'Review the offer details carefully — salary, equity, and benefits all matter.',
    "It's okay to negotiate; a polite counter-offer is expected.",
    'Get any verbal promises in writing before accepting.',
  ] : hasInterview ? [
    'Prepare STAR-format answers for every experience bullet on your resume.',
    "Research the company's engineering blog and recent releases.",
    'Have 2–3 thoughtful questions ready for your interviewers.',
  ] : hasScreening ? [
    'Tailor your pitch to the specific role during screening calls.',
    'Keep answers concise — screeners move fast.',
    'Confirm next steps and timeline before ending the call.',
  ] : [
    "Follow up 5–7 days after applying if you haven't heard back.",
    'A cover letter mirroring job description keywords boosts your chances.',
    'Apply in the first 48 hours — early applicants get more attention.',
  ]

  // Filtered + paginated rows
  const filtered = useMemo(() => rows.filter(r => {
    const q = query.toLowerCase()
    const matchText = !q || r.job_title.toLowerCase().includes(q) || r.company.toLowerCase().includes(q)
    const matchStatus = statusFilter === 'All' || r.status === statusFilter
    return matchText && matchStatus
  }), [rows, query, statusFilter])

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  // Reset to page 1 on filter change
  useEffect(() => { setPage(1) }, [query, statusFilter])

  const statCard = (
    icon: React.ReactNode,
    iconBg: string,
    iconColor: string,
    value: number,
    label: string,
    context: React.ReactNode,
  ) => (
    <div className="bg-white rounded-xl p-5" style={{ border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
      <div className="flex items-start justify-between mb-3">
        <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: iconBg }}>
          <span style={{ color: iconColor }}>{icon}</span>
        </div>
        <span className="text-[10px] font-medium text-slate-400 text-right leading-tight max-w-[110px]">{context}</span>
      </div>
      <p className="text-3xl font-bold text-slate-900 leading-none mb-1">{value}</p>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
    </div>
  )

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="w-8 h-8 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FileText size={20} className="text-indigo-600" /> Application Tracker
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Track the status of every job you've applied to.</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-600 border border-slate-200 bg-white hover:bg-slate-50 transition-colors">
            <Download size={13} /> Export Report
          </button>
          <button
            onClick={() => navigate('job-search')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-white transition-colors"
            style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)', boxShadow: '0 2px 8px rgba(99,102,241,0.25)' }}>
            <Plus size={13} /> New Application
          </button>
        </div>
      </div>

      {/* 3 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {statCard(
          <Briefcase size={16} />, '#eef2ff', '#6366f1',
          total, 'Total Applied',
          total > 0 ? `${rows.filter(r => {
            const d = new Date(r.date); const now = new Date()
            return now.getTime() - d.getTime() < 30 * 24 * 60 * 60 * 1000
          }).length} this month` : 'Start applying to jobs',
        )}
        {statCard(
          <Clock size={16} />, '#fffbeb', '#f59e0b',
          inProgress, 'In Progress',
          inProgress > 0 ? `${inProgress} pending review` : 'No active reviews',
        )}
        {statCard(
          <FileText size={16} />, '#ecfdf5', '#10b981',
          offers, 'Offers Received',
          total > 0 && offers > 0
            ? `${Math.round((offers / total) * 100)}% offer rate`
            : 'Keep applying!',
        )}
      </div>

      {/* Stage breakdown chips */}
      {total > 0 && (
        <div className="flex flex-wrap gap-2">
          {['Applied', 'Screening', 'Interview', 'Offer', 'Hired'].map(s => {
            const count = rows.filter(r => r.status === s).length
            if (count === 0) return null
            const m = STATUS_META[s]
            return (
              <button key={s}
                onClick={() => setStatusFilter(statusFilter === s ? 'All' : s)}
                className="flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1 rounded-full transition-all"
                style={{
                  color: statusFilter === s ? '#fff' : m.color,
                  background: statusFilter === s ? m.color : m.bg,
                  border: `1px solid ${m.border}`,
                }}>
                {s} <span className="opacity-70">{count}</span>
              </button>
            )
          })}
          {statusFilter !== 'All' && (
            <button onClick={() => setStatusFilter('All')}
              className="flex items-center gap-1 text-[10px] font-medium px-2.5 py-1 rounded-full text-slate-400 bg-slate-100 border border-slate-200">
              <X size={10} /> Clear
            </button>
          )}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl overflow-hidden" style={{ border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        {/* Table toolbar */}
        <div className="px-4 py-3 flex items-center gap-3 border-b border-slate-100">
          <div className="relative flex-1 max-w-xs">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search role or company…"
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg outline-none text-slate-800 placeholder-slate-300"
              style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}
              onFocus={e => (e.target.style.borderColor = '#6366f1')}
              onBlur={e => (e.target.style.borderColor = '#e2e8f0')}
            />
          </div>
          <div className="relative">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="pl-7 pr-3 py-1.5 text-xs rounded-lg cursor-pointer outline-none appearance-none"
              style={{ background: '#f8fafc', border: '1px solid #e2e8f0', color: '#0f172a' }}>
              <option value="All">All Statuses</option>
              {ALL_STAGES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <Filter size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
          <span className="text-[10px] text-slate-400 ml-auto whitespace-nowrap">
            {filtered.length} result{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-14">
            <FileText size={36} className="mx-auto text-slate-300 mb-3" />
            <p className="text-sm font-semibold text-slate-700">
              {total === 0 ? 'No applications yet' : 'No matches found'}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {total === 0
                ? 'Browse open jobs and hit Apply to get started.'
                : 'Try adjusting your search or filter.'}
            </p>
            {total === 0 && (
              <button onClick={() => navigate('job-search')}
                className="mt-4 px-4 py-2 rounded-lg text-xs font-semibold text-white"
                style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)' }}>
                Browse Jobs
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Table head */}
            <div className="grid text-[10px] font-bold text-slate-400 uppercase tracking-wider px-4 py-2.5 bg-slate-50 border-b border-slate-100"
              style={{ gridTemplateColumns: '2.5rem 1fr 1fr 7rem 7rem 7rem' }}>
              <span />
              <span>Role</span>
              <span>Company</span>
              <span>Applied</span>
              <span>Status</span>
              <span>Actions</span>
            </div>

            {paginated.map((row, i) => (
              <div key={row.id}
                className="grid items-center px-4 py-3 hover:bg-slate-50 transition-colors"
                style={{
                  gridTemplateColumns: '2.5rem 1fr 1fr 7rem 7rem 7rem',
                  borderBottom: i < paginated.length - 1 ? '1px solid #f1f5f9' : 'none',
                }}>
                <CompanyAvatar company={row.company} />
                <div className="min-w-0 pr-2">
                  <p className="text-xs font-semibold text-slate-900 truncate">{row.job_title}</p>
                  {row.matched_skills.length > 0 && (
                    <p className="text-[10px] text-slate-400 truncate mt-0.5">
                      {row.matched_skills.slice(0, 3).join(' · ')}
                    </p>
                  )}
                </div>
                <p className="text-xs text-slate-500 truncate pr-2">{row.company}</p>
                <p className="text-[11px] text-slate-500">
                  {row.date ? new Date(row.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' }) : '—'}
                </p>
                <div><StatusBadge status={row.status} /></div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => navigate('job-detail', { jobId: row.job_id })}
                    className="text-[11px] font-semibold text-indigo-600 hover:underline flex items-center gap-0.5">
                    View <ArrowUpRight size={10} />
                  </button>
                  {!['Hired', 'Rejected', 'Withdrawn'].includes(row.status) && (
                    <button className="text-[11px] font-medium text-slate-400 hover:text-red-500 transition-colors">
                      Withdraw
                    </button>
                  )}
                </div>
              </div>
            ))}

            {/* Pagination — only shown when needed */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
                <span className="text-[10px] text-slate-400">
                  Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-30 hover:bg-slate-50 transition-colors">
                    <ChevronLeft size={13} />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                    <button key={n} onClick={() => setPage(n)}
                      className="w-7 h-7 rounded-lg text-[11px] font-semibold transition-colors"
                      style={{
                        background: n === page ? '#6366f1' : 'transparent',
                        color: n === page ? '#fff' : '#64748b',
                        border: n === page ? 'none' : '1px solid #e2e8f0',
                      }}>
                      {n}
                    </button>
                  ))}
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-30 hover:bg-slate-50 transition-colors">
                    <ChevronRight size={13} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Interviews + Success Rate */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Upcoming Interviews */}
        <div className="bg-white rounded-xl p-5" style={{ border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <p className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Calendar size={15} className="text-indigo-600" /> Upcoming Interviews
          </p>
          {interviews.filter(iv => iv.status === 'Scheduled').length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 rounded-xl text-center"
              style={{ background: '#f8fafc', border: '2px dashed #e2e8f0' }}>
              <Calendar size={28} className="text-slate-300 mb-2" />
              <p className="text-xs font-semibold text-slate-600">No interviews scheduled yet</p>
              <p className="text-[11px] text-slate-400 mt-1 max-w-[200px] leading-relaxed">
                Once a recruiter schedules an interview, the date, time, and round details will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {interviews.filter(iv => iv.status === 'Scheduled').slice(0, 4).map((iv: any) => {
                const d = new Date(iv.scheduled_at)
                return (
                  <div key={iv.id} className="flex items-center gap-3 p-3 rounded-lg"
                    style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl flex flex-col items-center justify-center text-center"
                      style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                      <span className="text-[10px] font-bold text-indigo-200 uppercase leading-none">
                        {d.toLocaleDateString('en', { month: 'short' })}
                      </span>
                      <span className="text-lg font-bold text-white leading-none">{d.getDate()}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-900 truncate">{iv.location ?? 'Video Call'}</p>
                      <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Clock size={9} /> {d.toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <ArrowUpRight size={14} className="text-slate-300 flex-shrink-0" />
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Application Success Rate */}
        <div className="bg-white rounded-xl p-5" style={{ border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <p className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Building2 size={15} className="text-indigo-600" /> Application Success Rate
          </p>
          {total === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 rounded-xl text-center"
              style={{ background: '#f8fafc', border: '2px dashed #e2e8f0' }}>
              <Building2 size={28} className="text-slate-300 mb-2" />
              <p className="text-xs font-semibold text-slate-600">No data yet</p>
              <p className="text-[11px] text-slate-400 mt-1">Apply to jobs to see your shortlist rate.</p>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-6">
                <DonutChart shortlisted={shortlisted} total={total} />
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: '#6366f1' }} />
                    <span className="text-xs text-slate-600">Shortlisted</span>
                    <span className="text-xs font-bold text-slate-900 ml-auto">{shortlisted}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: '#e2e8f0' }} />
                    <span className="text-xs text-slate-600">Not progressed</span>
                    <span className="text-xs font-bold text-slate-900 ml-auto">{total - shortlisted}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-xs text-slate-600">Total applied</span>
                    <span className="text-xs font-bold text-slate-900 ml-2">{total}</span>
                  </div>
                </div>
              </div>
              {shortlisted > 0 && (
                <p className="text-[11px] text-slate-500 mt-4 pt-3 border-t border-slate-100">
                  {Math.round((shortlisted / total) * 100)}% of your applications moved past the initial review —
                  {shortlisted / total >= 0.3 ? ' that\'s a strong conversion rate.' : ' keep refining your applications to improve this.'}
                </p>
              )}
            </>
          )}
        </div>
      </div>

      {/* Pro Tips */}
      <div className="rounded-xl p-4 bg-indigo-50" style={{ border: '1px solid #e0e7ff' }}>
        <p className="text-xs font-semibold text-indigo-700 mb-2 flex items-center gap-1.5">
          <Briefcase size={13} /> Pro Tips
        </p>
        <ul className="space-y-1">
          {proTips.map((tip, i) => (
            <li key={i} className="text-xs text-indigo-700/70 flex gap-2">
              <span className="text-indigo-400 flex-shrink-0">·</span>{tip}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
