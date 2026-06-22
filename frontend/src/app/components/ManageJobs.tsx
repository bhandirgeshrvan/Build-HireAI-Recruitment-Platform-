import { useState, useEffect, useMemo } from 'react'
import {
  Layers, PlusCircle, Search, Pencil, Trash2, MapPin,
  DollarSign, Clock, Users, AlertCircle, X, CheckCircle,
} from 'lucide-react'
import { useNav } from '../App'
import { cardClass, cardStyle } from './CandidateProfile'

const BASE = import.meta.env.VITE_API_URL ?? ''

const STATUS_META: Record<string, { color: string; bg: string; border: string }> = {
  Active: { color: '#10b981', bg: '#ecfdf5', border: '#6ee7b7' },
  Closed: { color: '#64748b', bg: '#f1f5f9', border: '#cbd5e1' },
  Draft:  { color: '#f59e0b', bg: '#fffbeb', border: '#fde68a' },
}
const STATUSES = ['Active', 'Closed', 'Draft']

function apiFetch(path: string, opts?: RequestInit) {
  const t = localStorage.getItem('hireai_token')
  return fetch(`${BASE}${path}`, {
    ...opts,
    headers: {
      ...(opts?.headers as Record<string, string> ?? {}),
      ...(t ? { Authorization: `Bearer ${t}` } : {}),
      'Content-Type': 'application/json',
    },
  })
}

function StatusBadge({ status }: { status: string }) {
  const m = STATUS_META[status] ?? STATUS_META['Closed']
  return (
    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full"
      style={{ color: m.color, background: m.bg, border: `1px solid ${m.border}` }}>
      {status}
    </span>
  )
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

function DeleteConfirm({ jobTitle, onConfirm, onCancel, loading }: {
  jobTitle: string; onConfirm: () => void; onCancel: () => void; loading: boolean
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.4)' }}>
      <div className={`${cardClass} p-6 max-w-sm w-full`} style={cardStyle}>
        <div className="flex items-start justify-between mb-4">
          <div className="w-10 h-10 rounded-full bg-red-50 border border-red-200 flex items-center justify-center flex-shrink-0">
            <Trash2 size={18} className="text-red-500" />
          </div>
          <button onClick={onCancel} className="text-slate-400 hover:text-slate-600 p-1">
            <X size={16} />
          </button>
        </div>
        <h3 className="text-sm font-bold text-slate-900 mb-1">Delete Job Posting</h3>
        <p className="text-xs text-slate-500 mb-1">
          Are you sure you want to delete <span className="font-semibold text-slate-700">"{jobTitle}"</span>?
        </p>
        <p className="text-xs text-red-500 mb-5">This cannot be undone.</p>
        <div className="flex gap-2">
          <button onClick={onCancel} disabled={loading}
            className="flex-1 py-2 rounded-lg text-xs font-semibold text-slate-600 border border-slate-200 hover:bg-slate-50 transition-colors">
            Cancel
          </button>
          <button onClick={onConfirm} disabled={loading}
            className="flex-1 py-2 rounded-lg text-xs font-bold text-white transition-colors flex items-center justify-center gap-1.5"
            style={{ background: loading ? '#fca5a5' : '#ef4444' }}>
            {loading
              ? <><div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> Deleting…</>
              : <><Trash2 size={12} /> Delete</>}
          </button>
        </div>
      </div>
    </div>
  )
}

export function ManageJobs() {
  const { navigate } = useNav()
  const [jobs, setJobs]             = useState<any[]>([])
  const [loading, setLoading]       = useState(true)
  const [query, setQuery]           = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [toast, setToast]           = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [updatingId, setUpdatingId] = useState<number | null>(null)

  const showToast = (type: 'success' | 'error', text: string) => {
    setToast({ type, text })
    setTimeout(() => setToast(null), 3500)
  }

  useEffect(() => {
    apiFetch('/jobs/mine')
      .then(r => r.json())
      .then(d => setJobs(Array.isArray(d) ? d : []))
      .catch(() => showToast('error', 'Failed to load jobs.'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => jobs.filter(j => {
    const q = query.toLowerCase()
    const matchText = !q || j.title.toLowerCase().includes(q) || j.company.toLowerCase().includes(q)
    const matchStatus = statusFilter === 'All' || j.status === statusFilter
    return matchText && matchStatus
  }), [jobs, query, statusFilter])

  const handleStatusChange = async (jobId: number, newStatus: string) => {
    setUpdatingId(jobId)
    // Optimistic update
    setJobs(prev => prev.map(j => j.id === jobId ? { ...j, status: newStatus } : j))
    try {
      const r = await apiFetch(`/jobs/${jobId}`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus }),
      })
      if (!r.ok) throw new Error()
      showToast('success', `Status updated to ${newStatus}.`)
    } catch {
      // Revert on failure
      setJobs(prev => prev.map(j => j.id === jobId ? { ...j, status: j._prevStatus ?? j.status } : j))
      showToast('error', 'Failed to update status. Please try again.')
    } finally {
      setUpdatingId(null)
    }
  }

  const handleDelete = async () => {
    if (deletingId === null) return
    setDeleteLoading(true)
    try {
      const r = await apiFetch(`/jobs/${deletingId}`, { method: 'DELETE' })
      if (!r.ok) throw new Error()
      setJobs(prev => prev.filter(j => j.id !== deletingId))
      showToast('success', 'Job posting deleted.')
    } catch {
      showToast('error', 'Failed to delete. Please try again.')
    } finally {
      setDeleteLoading(false)
      setDeletingId(null)
    }
  }

  const deleteTarget = jobs.find(j => j.id === deletingId)

  const counts = {
    All:    jobs.length,
    Active: jobs.filter(j => j.status === 'Active').length,
    Closed: jobs.filter(j => j.status === 'Closed').length,
    Draft:  jobs.filter(j => j.status === 'Draft').length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Layers size={20} className="text-indigo-600" /> Manage Jobs
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">View and manage all jobs you've posted.</p>
        </div>
        <button onClick={() => navigate('job-posting')}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold text-white flex-shrink-0"
          style={{ background: 'linear-gradient(135deg,#6366f1,#4f46e5)', boxShadow: '0 2px 8px rgba(99,102,241,0.25)' }}>
          <PlusCircle size={13} /> Post New Job
        </button>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium ${
          toast.type === 'success'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
            : 'bg-red-50 border-red-200 text-red-600'
        }`}>
          {toast.type === 'success' ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
          {toast.text}
        </div>
      )}

      {/* Search + filter bar */}
      <div className={`${cardClass} p-4 flex flex-wrap items-center gap-3`} style={cardStyle}>
        <div className="relative flex-1 min-w-[180px]">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Search by title or company…"
            className="w-full pl-8 pr-3 py-2 text-xs rounded-lg outline-none text-slate-800 placeholder-slate-300"
            style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}
            onFocus={e => (e.target.style.borderColor = '#6366f1')}
            onBlur={e => (e.target.style.borderColor = '#e2e8f0')} />
        </div>
        <div className="flex items-center gap-1.5">
          {(['All', ...STATUSES] as const).map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className="text-[10px] font-bold px-2.5 py-1.5 rounded-lg transition-all"
              style={{
                background: statusFilter === s ? '#eef2ff' : '#f8fafc',
                color: statusFilter === s ? '#6366f1' : '#64748b',
                border: `1px solid ${statusFilter === s ? '#c7d2fe' : '#e2e8f0'}`,
              }}>
              {s} <span className="opacity-60 ml-0.5">{counts[s as keyof typeof counts]}</span>
            </button>
          ))}
        </div>
        <span className="text-[10px] text-slate-400 ml-auto">{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
        </div>
      ) : jobs.length === 0 ? (
        <div className={`${cardClass} text-center py-16`} style={cardStyle}>
          <Layers size={40} className="mx-auto text-slate-300 mb-3" />
          <p className="text-sm font-semibold text-slate-700">No jobs posted yet</p>
          <p className="text-xs text-slate-400 mt-1 mb-5">Post your first job to start receiving applications.</p>
          <button onClick={() => navigate('job-posting')}
            className="px-5 py-2.5 rounded-xl text-sm font-bold text-white"
            style={{ background: 'linear-gradient(135deg,#6366f1,#4f46e5)', boxShadow: '0 4px 12px rgba(99,102,241,0.3)' }}>
            Post a Job
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className={`${cardClass} text-center py-12`} style={cardStyle}>
          <Search size={32} className="mx-auto text-slate-300 mb-3" />
          <p className="text-sm font-semibold text-slate-700">No matches</p>
          <p className="text-xs text-slate-400 mt-1">Try adjusting your search or filter.</p>
          <button onClick={() => { setQuery(''); setStatusFilter('All') }}
            className="mt-4 text-xs font-semibold text-indigo-600 hover:underline">
            Clear filters
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(job => {
            const tc = job.type === 'Full-time' ? '#6366f1' : job.type === 'Internship' ? '#10b981' : '#f59e0b'
            const isUpdating = updatingId === job.id
            return (
              <div key={job.id} className={`${cardClass} p-5`} style={cardStyle}>
                <div className="flex items-start gap-4">
                  <CompanyAvatar company={job.company} />
                  <div className="flex-1 min-w-0">
                    {/* Title + type + status */}
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="text-sm font-bold text-slate-900">{job.title}</h3>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                        style={{ background: `${tc}12`, color: tc, border: `1px solid ${tc}20` }}>
                        {job.type}
                      </span>
                      <StatusBadge status={job.status} />
                    </div>

                    {/* Meta row */}
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-500 mb-3">
                      <span className="font-semibold text-slate-600">{job.company}</span>
                      {job.location && (
                        <span className="flex items-center gap-1"><MapPin size={10} />{job.location}</span>
                      )}
                      {(job.salary_min > 0 || job.salary_max > 0) && (
                        <span className="flex items-center gap-1">
                          <DollarSign size={10} />
                          {job.salary_min >= 100000
                            ? `$${(job.salary_min / 1000).toFixed(0)}K – $${(job.salary_max / 1000).toFixed(0)}K`
                            : job.salary_min > 10000
                              ? `₹${(job.salary_min / 100000).toFixed(1)}L – ₹${(job.salary_max / 100000).toFixed(1)}L`
                              : `$${job.salary_min.toLocaleString()} – $${job.salary_max.toLocaleString()}`}
                        </span>
                      )}
                      {job.experience && (
                        <span className="flex items-center gap-1"><Clock size={10} />{job.experience}</span>
                      )}
                      <span className="flex items-center gap-1"><Users size={10} />{job.applicants ?? 0} applicants</span>
                      {job.created_at && (
                        <span className="text-slate-400">
                          Posted {new Date(job.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' })}
                        </span>
                      )}
                    </div>

                    {/* Skills */}
                    {job.skills?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {job.skills.slice(0, 6).map((s: string) => (
                          <span key={s} className="text-[10px] font-medium px-2 py-0.5 rounded-md"
                            style={{ background: '#eef2ff', color: '#6366f1', border: '1px solid #e0e7ff' }}>
                            {s}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Actions row */}
                    <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                      {/* Status toggle */}
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] font-semibold text-slate-400 mr-1">Status:</span>
                        {STATUSES.map(s => {
                          const m = STATUS_META[s]
                          const active = job.status === s
                          return (
                            <button key={s} onClick={() => !active && handleStatusChange(job.id, s)}
                              disabled={isUpdating}
                              className="text-[10px] font-bold px-2.5 py-1 rounded-lg transition-all disabled:opacity-50"
                              style={{
                                background: active ? m.bg : '#f8fafc',
                                color: active ? m.color : '#94a3b8',
                                border: `1px solid ${active ? m.border : '#e2e8f0'}`,
                              }}>
                              {isUpdating && active
                                ? <span className="flex items-center gap-1"><div className="w-2.5 h-2.5 border border-current border-t-transparent rounded-full animate-spin" />{s}</span>
                                : s}
                            </button>
                          )
                        })}
                      </div>

                      <div className="ml-auto flex items-center gap-2">
                        <button
                          onClick={() => navigate('job-posting', { editJobId: job.id })}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-600 border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 transition-colors">
                          <Pencil size={12} /> Edit
                        </button>
                        <button
                          onClick={() => setDeletingId(job.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-500 border border-red-200 bg-red-50 hover:bg-red-100 transition-colors">
                          <Trash2 size={12} /> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Delete confirm dialog */}
      {deletingId !== null && deleteTarget && (
        <DeleteConfirm
          jobTitle={deleteTarget.title}
          onConfirm={handleDelete}
          onCancel={() => setDeletingId(null)}
          loading={deleteLoading}
        />
      )}
    </div>
  )
}
