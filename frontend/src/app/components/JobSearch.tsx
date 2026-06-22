import { useState, useEffect, useMemo } from 'react'
import { Search, MapPin, Briefcase, Clock, Users, DollarSign, Bookmark, Zap, SlidersHorizontal, X } from 'lucide-react'
import { ScoreBadge } from './KPICard'
import type { Job } from '../api'
import { jobs as jobsApi, applications } from '../api'
import { ApplyModal } from './ApplyModal'
import { useNav } from '../App'

// Exact values present in the DB — derived from actual API data
const EXP_OPTIONS = ['Entry (0-2 yrs)', 'Mid (2-5 yrs)', 'Senior (5-8 yrs)', '2-4 years']
const TYPE_OPTIONS = ['Full-time', 'Part-time', 'Contract', 'Internship']

const TYPE_META: Record<string, { color: string }> = {
  'Full-time':  { color: '#6366f1' },
  'Part-time':  { color: '#8b5cf6' },
  'Contract':   { color: '#f59e0b' },
  'Internship': { color: '#10b981' },
}

function freshnessLabel(days: number): string {
  if (days === 0) return 'Just posted'
  if (days === 1) return 'Posted yesterday'
  if (days <= 7)  return `Posted ${days}d ago`
  if (days <= 14) return `Posted ${days}d ago`
  return `Posted ${days}d ago`
}

function CompanyLogo({ company }: { company: string }) {
  const initials = company.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  const hue = company.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % 360
  return (
    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
      style={{ background: `hsl(${hue},55%,48%)` }}>
      {initials}
    </div>
  )
}

function SkillChip({ label }: { label: string }) {
  return (
    <span className="text-[10px] font-medium px-2 py-0.5 rounded-md"
      style={{ background: '#eef2ff', color: '#6366f1', border: '1px solid #e0e7ff' }}>
      {label}
    </span>
  )
}

function JobCard({
  job, onApply, appliedIds, onViewDetail,
}: {
  job: Job; onApply: (job: Job) => void; appliedIds: Set<number>; onViewDetail: (id: number) => void
}) {
  const [saved, setSaved] = useState(false)
  const applied = appliedIds.has(job.id)
  const tc = TYPE_META[job.type]?.color ?? '#94a3b8'

  return (
    <div
      className="rounded-xl bg-white transition-all hover:shadow-md cursor-pointer"
      style={{ border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
      onClick={() => onViewDetail(job.id)}
    >
      <div className="p-5">
        <div className="flex items-start gap-4">
          <CompanyLogo company={job.company} />

          <div className="flex-1 min-w-0">
            {/* Title row */}
            <div className="flex items-start justify-between gap-3 mb-1">
              <h3 className="text-sm font-bold text-slate-900 leading-snug">{job.title}</h3>
              {/* Match score — prominent, top-right */}
              {job.match_score > 0 && (
                <div className="flex-shrink-0">
                  <ScoreBadge score={job.match_score} />
                </div>
              )}
            </div>

            {/* Company + type */}
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <span className="text-xs font-semibold text-indigo-600">{job.company}</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                style={{ background: `${tc}12`, color: tc, border: `1px solid ${tc}25` }}>
                {job.type}
              </span>
            </div>

            {/* Meta row */}
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-500 mb-3">
              <span className="flex items-center gap-1"><MapPin size={10} />{job.location}</span>
              <span className="flex items-center gap-1">
                <DollarSign size={10} />
                {job.salary_min >= 100000
                  ? `$${(job.salary_min / 1000).toFixed(0)}K – $${(job.salary_max / 1000).toFixed(0)}K`
                  : job.salary_min > 50000
                    ? `₹${(job.salary_min / 100000).toFixed(1)}L – ₹${(job.salary_max / 100000).toFixed(1)}L`
                    : `$${job.salary_min.toLocaleString()} – $${job.salary_max.toLocaleString()}`
                }
              </span>
              <span className="flex items-center gap-1"><Clock size={10} />{job.experience}</span>
              {job.applicants > 0 && (
                <span className="flex items-center gap-1"><Users size={10} />{job.applicants} applicants</span>
              )}
              <span className="flex items-center gap-1 text-slate-400">
                <Briefcase size={10} />{freshnessLabel(job.posted_days)}
              </span>
            </div>

            {/* Skills */}
            {job.skills.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {job.skills.slice(0, 5).map(s => <SkillChip key={s} label={s} />)}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Card footer — actions */}
      <div className="px-5 py-3 flex items-center justify-between border-t border-slate-100">
        <button
          onClick={e => { e.stopPropagation(); setSaved(!saved) }}
          className="flex items-center gap-1.5 text-[11px] font-medium transition-colors"
          style={{ color: saved ? '#6366f1' : '#94a3b8' }}
          title={saved ? 'Saved' : 'Save job'}>
          <Bookmark size={13} fill={saved ? '#6366f1' : 'none'} />
          {saved ? 'Saved' : 'Save'}
        </button>
        <button
          onClick={e => { e.stopPropagation(); !applied && onApply(job) }}
          disabled={applied}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all"
          style={{
            background: applied ? '#ecfdf5' : 'linear-gradient(135deg, #6366f1, #4f46e5)',
            color: applied ? '#10b981' : '#fff',
            border: applied ? '1px solid #6ee7b7' : 'none',
            boxShadow: applied ? 'none' : '0 2px 8px rgba(99,102,241,0.25)',
          }}>
          {applied ? <>✓ Applied</> : <><Zap size={11} /> Apply Now</>}
        </button>
      </div>
    </div>
  )
}

export function JobSearch() {
  const { navigate } = useNav()
  const [query, setQuery]       = useState('')
  const [location, setLocation] = useState('All')
  const [type, setType]         = useState('All')
  const [exp, setExp]           = useState('All')
  const [sortBy, setSortBy]     = useState('match_score')
  const [allJobs, setAllJobs]   = useState<Job[]>([])
  const [loading, setLoading]   = useState(true)
  const [applyJob, setApplyJob] = useState<Job | null>(null)
  const [appliedIds, setAppliedIds] = useState<Set<number>>(new Set())
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    Promise.all([
      jobsApi.list({ limit: 100 }),
      // Prefetch already-applied IDs so Apply buttons show correct state
      fetch(`${import.meta.env.VITE_API_URL ?? ''}/applications/mine`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('hireai_token') ?? ''}` },
      }).then(r => r.ok ? r.json() : []),
    ]).then(([data, apps]) => {
      setAllJobs(Array.isArray(data) ? data : [])
      if (Array.isArray(apps)) {
        setAppliedIds(new Set(apps.map((a: any) => a.job_id)))
      }
    }).catch(() => setAllJobs([])).finally(() => setLoading(false))
  }, [])

  // Derive unique filter options from actual data
  const locationOptions = useMemo(() =>
    ['All', ...Array.from(new Set(allJobs.map(j => j.location).filter(Boolean))).sort()],
  [allJobs])

  const expOptions = useMemo(() =>
    ['All', ...Array.from(new Set(allJobs.map(j => j.experience).filter(Boolean))).sort()],
  [allJobs])

  const filtered = useMemo(() => allJobs
    .filter(j => {
      if (j.status !== 'Active') return false
      if (query) {
        const q = query.toLowerCase()
        if (!j.title.toLowerCase().includes(q) &&
            !j.company.toLowerCase().includes(q) &&
            !j.skills.some(s => s.toLowerCase().includes(q))) return false
      }
      if (location !== 'All' && j.location !== location) return false
      if (type !== 'All' && j.type !== type) return false
      if (exp !== 'All' && j.experience !== exp) return false
      return true
    })
    .sort((a, b) => {
      if (sortBy === 'match_score') return b.match_score - a.match_score
      if (sortBy === 'salary')      return b.salary_max - a.salary_max
      return a.posted_days - b.posted_days
    }),
  [allJobs, query, location, type, exp, sortBy])

  const hasActiveFilters = location !== 'All' || type !== 'All' || exp !== 'All' || query

  const selectStyle = {
    background: '#fff', border: '1px solid #e2e8f0',
    outline: 'none', color: '#0f172a', borderRadius: '0.5rem',
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900">Find Your Next Role</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Browse AI-matched opportunities and apply with one click.
        </p>
      </div>

      {/* Search bar + filter toggle */}
      <div className="rounded-xl p-4 bg-white space-y-3"
        style={{ border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search by role, company, or skill…"
              className="w-full pl-9 pr-4 py-2.5 rounded-lg text-sm text-slate-800 placeholder-slate-300 outline-none"
              style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}
              onFocus={e => (e.target.style.borderColor = '#6366f1')}
              onBlur={e => (e.target.style.borderColor = '#e2e8f0')}
            />
          </div>
          <button
            onClick={() => setShowFilters(f => !f)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border transition-colors"
            style={{
              background: showFilters ? '#eef2ff' : '#f8fafc',
              borderColor: showFilters ? '#6366f1' : '#e2e8f0',
              color: showFilters ? '#6366f1' : '#64748b',
            }}>
            <SlidersHorizontal size={13} />
            Filters
            {hasActiveFilters && !showFilters && (
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 ml-0.5" />
            )}
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-1">
            <select value={location} onChange={e => setLocation(e.target.value)}
              className="px-3 py-2 text-xs cursor-pointer" style={selectStyle}>
              {locationOptions.map(l => <option key={l} value={l}>{l === 'All' ? 'All Locations' : l}</option>)}
            </select>
            <select value={type} onChange={e => setType(e.target.value)}
              className="px-3 py-2 text-xs cursor-pointer" style={selectStyle}>
              <option value="All">All Types</option>
              {TYPE_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <select value={exp} onChange={e => setExp(e.target.value)}
              className="px-3 py-2 text-xs cursor-pointer" style={selectStyle}>
              {expOptions.map(e => <option key={e} value={e}>{e === 'All' ? 'All Experience' : e}</option>)}
            </select>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)}
              className="px-3 py-2 text-xs cursor-pointer" style={selectStyle}>
              <option value="match_score">Sort: Match Score</option>
              <option value="salary">Sort: Salary</option>
              <option value="posted">Sort: Newest</option>
            </select>
          </div>
        )}

        {/* Active filter chips */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {query && (
              <span className="flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                "{query}" <button onClick={() => setQuery('')}><X size={9} /></button>
              </span>
            )}
            {location !== 'All' && (
              <span className="flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                {location} <button onClick={() => setLocation('All')}><X size={9} /></button>
              </span>
            )}
            {type !== 'All' && (
              <span className="flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                {type} <button onClick={() => setType('All')}><X size={9} /></button>
              </span>
            )}
            {exp !== 'All' && (
              <span className="flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                {exp} <button onClick={() => setExp('All')}><X size={9} /></button>
              </span>
            )}
            <button onClick={() => { setQuery(''); setLocation('All'); setType('All'); setExp('All') }}
              className="text-[10px] font-medium text-slate-400 hover:text-slate-600 px-2 py-1">
              Clear all
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
        </div>
      ) : (
        <>
          <p className="text-xs text-slate-500">
            Showing <span className="font-bold text-slate-900">{filtered.length}</span> of{' '}
            <span className="font-bold text-slate-900">{allJobs.filter(j => j.status === 'Active').length}</span> jobs
          </p>

          {filtered.length === 0 ? (
            <div className="text-center py-14 rounded-xl bg-white" style={{ border: '1px solid #e2e8f0' }}>
              <Search size={36} className="mx-auto text-slate-300 mb-3" />
              <p className="text-sm font-semibold text-slate-700">No jobs match your filters</p>
              <p className="text-xs text-slate-400 mt-1">Try removing a filter or broadening your search.</p>
              <button
                onClick={() => { setQuery(''); setLocation('All'); setType('All'); setExp('All') }}
                className="mt-4 text-xs font-semibold text-indigo-600 hover:underline">
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map(job => (
                <JobCard
                  key={job.id}
                  job={job}
                  onApply={setApplyJob}
                  appliedIds={appliedIds}
                  onViewDetail={id => navigate('job-detail', { jobId: id })}
                />
              ))}
            </div>
          )}
        </>
      )}

      {applyJob && (
        <ApplyModal
          job={applyJob}
          onClose={() => setApplyJob(null)}
          onSuccess={jobId => {
            setAppliedIds(prev => new Set(prev).add(jobId))
            setApplyJob(null)
          }}
        />
      )}
    </div>
  )
}
