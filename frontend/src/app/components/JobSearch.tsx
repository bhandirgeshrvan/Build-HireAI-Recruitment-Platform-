import { useState } from 'react'
import { Search, MapPin, Briefcase, Clock, Users, DollarSign, Bookmark, Zap } from 'lucide-react'
import { PageHeader, ScoreBadge, Tag } from './KPICard'
import { JOBS, LOCATIONS } from './data'
import type { Job } from './data'

const TYPE_COLORS: Record<string, string> = {
  'Full-time': '#6366f1',
  'Part-time': '#8b5cf6',
  'Contract':  '#f59e0b',
}

function JobCard({ job }: { job: Job }) {
  const [applied, setApplied] = useState(false)
  const [saved, setSaved]     = useState(false)
  const tc = TYPE_COLORS[job.type] ?? '#94a3b8'

  return (
    <div className="rounded-xl p-5 bg-white transition-all hover:shadow-md"
      style={{ border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-sm font-bold text-slate-900">{job.title}</span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
              style={{ background: `${tc}12`, color: tc, border: `1px solid ${tc}20` }}>
              {job.type}
            </span>
          </div>
          <p className="text-xs text-indigo-600 font-semibold mb-2">🏢 {job.company}</p>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-500 mb-3">
            <span className="flex items-center gap-1"><MapPin size={10} />{job.location}</span>
            <span className="flex items-center gap-1"><DollarSign size={10} />${(job.salary_min/1000).toFixed(0)}K – ${(job.salary_max/1000).toFixed(0)}K</span>
            <span className="flex items-center gap-1"><Clock size={10} />{job.experience}</span>
            <span className="flex items-center gap-1"><Users size={10} />{job.applicants} applicants</span>
            <span className="flex items-center gap-1"><Briefcase size={10} />{job.posted_days}d ago</span>
          </div>
          <div className="flex flex-wrap">{job.skills.slice(0, 4).map(s => <Tag key={s} label={s} />)}</div>
        </div>
        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          <ScoreBadge score={job.match_score} />
          <div className="flex gap-2 mt-2">
            <button onClick={() => setSaved(!saved)}
              className="p-2 rounded-lg transition-colors border"
              style={{
                background: saved ? '#eef2ff' : '#f8fafc',
                borderColor: saved ? '#6366f1' : '#e2e8f0',
              }}
              title="Save job">
              <Bookmark size={13} style={{ color: saved ? '#6366f1' : '#94a3b8' }} />
            </button>
            <button onClick={() => setApplied(true)} disabled={applied}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-70"
              style={{
                background: applied ? '#ecfdf5' : 'linear-gradient(135deg, #6366f1, #4f46e5)',
                color: applied ? '#10b981' : '#fff',
                border: applied ? '1px solid #6ee7b7' : 'none',
                boxShadow: applied ? 'none' : '0 2px 8px rgba(99,102,241,0.3)',
              }}>
              {applied ? '✓ Applied' : <><Zap size={11} />Apply</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export function JobSearch() {
  const [query, setQuery]     = useState('')
  const [location, setLocation] = useState('All')
  const [type, setType]       = useState('All')
  const [exp, setExp]         = useState('All')
  const [maxSal, setMaxSal]   = useState(300)
  const [sortBy, setSortBy]   = useState('match_score')

  const filtered = JOBS
    .filter(j => {
      if (j.status !== 'Active') return false
      if (query && !j.title.toLowerCase().includes(query.toLowerCase()) &&
          !j.company.toLowerCase().includes(query.toLowerCase()) &&
          !j.skills.some(s => s.toLowerCase().includes(query.toLowerCase()))) return false
      if (location !== 'All' && j.location !== location) return false
      if (type !== 'All' && j.type !== type) return false
      if (exp !== 'All' && j.experience !== exp) return false
      if (j.salary_max / 1000 > maxSal) return false
      return true
    })
    .sort((a, b) => {
      if (sortBy === 'match_score') return b.match_score - a.match_score
      if (sortBy === 'salary')      return b.salary_max - a.salary_max
      return a.posted_days - b.posted_days
    })

  const selectStyle = {
    background: '#ffffff', border: '1px solid #e2e8f0',
    outline: 'none', color: '#0f172a',
  }

  return (
    <div className="space-y-5">
      <PageHeader title="🔍 Job Search" subtitle="Find your next opportunity from thousands of AI-matched listings." />

      {/* Filters */}
      <div className="rounded-xl p-4 bg-white space-y-3" style={{ border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Search jobs, companies, skills…"
            className="w-full pl-9 pr-4 py-2.5 rounded-lg text-sm text-slate-800 placeholder-slate-300 outline-none"
            style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}
            onFocus={e => (e.target.style.borderColor = '#6366f1')}
            onBlur={e => (e.target.style.borderColor = '#e2e8f0')}
          />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <select value={location} onChange={e => setLocation(e.target.value)}
            className="px-3 py-2 rounded-lg text-xs cursor-pointer" style={selectStyle}>
            <option value="All">All Locations</option>
            {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
          <select value={type} onChange={e => setType(e.target.value)}
            className="px-3 py-2 rounded-lg text-xs cursor-pointer" style={selectStyle}>
            <option value="All">All Types</option>
            <option>Full-time</option><option>Part-time</option><option>Contract</option>
          </select>
          <select value={exp} onChange={e => setExp(e.target.value)}
            className="px-3 py-2 rounded-lg text-xs cursor-pointer" style={selectStyle}>
            <option value="All">All Experience</option>
            <option>0-2 yrs</option><option>2-5 yrs</option><option>5-8 yrs</option><option>8+ yrs</option>
          </select>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)}
            className="px-3 py-2 rounded-lg text-xs cursor-pointer" style={selectStyle}>
            <option value="match_score">Sort: Match Score</option>
            <option value="salary">Sort: Salary</option>
            <option value="posted">Sort: Newest</option>
          </select>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-slate-500 whitespace-nowrap">Max Salary: ${maxSal}K</span>
          <input type="range" min={50} max={300} step={10} value={maxSal}
            onChange={e => setMaxSal(Number(e.target.value))}
            className="flex-1 accent-indigo-600 h-1 cursor-pointer" />
        </div>
      </div>

      <p className="text-xs text-slate-500">
        Showing <span className="font-bold text-slate-900">{filtered.length}</span> jobs
      </p>

      {filtered.length === 0 && (
        <div className="text-center py-12 rounded-xl bg-white" style={{ border: '1px solid #e2e8f0' }}>
          <Search size={28} className="mx-auto text-slate-300 mb-3" />
          <p className="text-sm text-slate-500">No jobs found. Try broadening your filters.</p>
        </div>
      )}

      <div className="space-y-3">
        {filtered.map(job => <JobCard key={job.id} job={job} />)}
      </div>
    </div>
  )
}
