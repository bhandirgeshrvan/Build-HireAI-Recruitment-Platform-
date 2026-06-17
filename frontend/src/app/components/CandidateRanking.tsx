import { useState } from 'react'
import { PageHeader, ScoreBadge, Tag } from './KPICard'
import { CANDIDATES } from './data'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from 'recharts'
import { Mail, X } from 'lucide-react'

const tt = {
  contentStyle: { background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 11, color: '#0f172a' },
  labelStyle: { color: '#64748b' },
}
const card = 'bg-white rounded-xl'
const cardStyle = { border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }

export function CandidateRanking() {
  const [minScore, setMinScore]   = useState(60)
  const [stageFilter, setStageFilter] = useState('All')
  const [sortBy, setSortBy]       = useState('match_score')
  const [invitedIds, setInvitedIds]   = useState<number[]>([])
  const [rejectedIds, setRejectedIds] = useState<number[]>([])

  const filtered = CANDIDATES
    .filter(c => c.match_score >= minScore && (stageFilter === 'All' || c.status === stageFilter))
    .filter(c => !rejectedIds.includes(c.id))
    .sort((a, b) => {
      if (sortBy === 'match_score') return b.match_score - a.match_score
      if (sortBy === 'experience')  return b.experience - a.experience
      return b.salary_exp - a.salary_exp
    })

  const scoreDistribution = [
    { range: '90+',   count: filtered.filter(c => c.match_score >= 90).length },
    { range: '80-89', count: filtered.filter(c => c.match_score >= 80 && c.match_score < 90).length },
    { range: '70-79', count: filtered.filter(c => c.match_score >= 70 && c.match_score < 80).length },
    { range: '60-69', count: filtered.filter(c => c.match_score >= 60 && c.match_score < 70).length },
    { range: '<60',   count: CANDIDATES.filter(c => c.match_score < 60).length },
  ]

  const topCandidate = filtered[0]
  const radarData = topCandidate ? [
    { subject: 'Skills',     A: 92 },
    { subject: 'Experience', A: Math.min(topCandidate.experience * 8, 100) },
    { subject: 'Education',  A: 85 },
    { subject: 'Comms',      A: 78 },
    { subject: 'Culture',    A: 88 },
  ] : []

  const rankIcon = (i: number) => i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`

  const selectStyle = { background: '#fff', border: '1px solid #e2e8f0', outline: 'none', color: '#0f172a' }

  return (
    <div className="space-y-6">
      <PageHeader title="👥 Candidate Ranking" subtitle="AI-ranked candidates sorted by overall match score." />

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center p-4 bg-white rounded-xl" style={{ border: '1px solid #e2e8f0' }}>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Min Score:</span>
          <span className="text-xs font-bold text-slate-900 w-8">{minScore}%</span>
          <input type="range" min={0} max={100} step={5} value={minScore}
            onChange={e => setMinScore(+e.target.value)}
            className="w-28 accent-indigo-600 h-1 cursor-pointer" />
        </div>
        <select value={stageFilter} onChange={e => setStageFilter(e.target.value)}
          className="px-3 py-1.5 rounded-lg text-xs cursor-pointer" style={selectStyle}>
          {['All','Applied','Screening','Interview','Offer','Hired'].map(s => <option key={s}>{s}</option>)}
        </select>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)}
          className="px-3 py-1.5 rounded-lg text-xs cursor-pointer" style={selectStyle}>
          <option value="match_score">Sort: Match Score</option>
          <option value="experience">Sort: Experience</option>
          <option value="salary_exp">Sort: Salary</option>
        </select>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Candidates',   val: filtered.length,                                                                                    color: '#6366f1' },
          { label: 'Avg Match Score',    val: `${(filtered.reduce((s, c) => s + c.match_score, 0) / (filtered.length || 1)).toFixed(0)}%`,        color: '#10b981' },
          { label: 'Top Matches (≥80%)', val: filtered.filter(c => c.match_score >= 80).length,                                                   color: '#8b5cf6' },
          { label: 'Avg Experience',     val: `${(filtered.reduce((s, c) => s + c.experience, 0) / (filtered.length || 1)).toFixed(1)} yrs`,       color: '#f59e0b' },
        ].map(k => (
          <div key={k.label} className={`${card} p-4`}
            style={{ ...cardStyle, borderLeft: `3px solid ${k.color}` }}>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{k.label}</p>
            <p className="text-xl font-bold" style={{ color: k.color }}>{k.val}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className={`${card} p-5`} style={cardStyle}>
          <p className="text-xs font-bold text-slate-700 mb-4">🏆 Score Distribution</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={scoreDistribution} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="range" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip {...tt} />
              <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} name="Candidates" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        {topCandidate && (
          <div className={`${card} p-5`} style={cardStyle}>
            <p className="text-xs font-bold text-slate-700 mb-1">🎯 Top Candidate: {topCandidate.name}</p>
            <p className="text-[10px] text-slate-400 mb-2">{topCandidate.role} · {topCandidate.experience} yrs</p>
            <ResponsiveContainer width="100%" height={180}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 8 }} />
                <Radar name="Score" dataKey="A" stroke="#6366f1" fill="#6366f1" fillOpacity={0.15} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Ranked list */}
      <div className="space-y-2">
        {filtered.map((candidate, i) => (
          <div key={candidate.id} className={`${card} p-4 transition-all hover:shadow-md`} style={cardStyle}>
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <span className="text-lg min-w-[28px] text-center">{rankIcon(i)}</span>
                <div>
                  <p className="text-sm font-bold text-slate-900">{candidate.name}</p>
                  <p className="text-xs text-indigo-600 font-medium mt-0.5">
                    {candidate.role} · {candidate.experience} yrs · {candidate.education}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <ScoreBadge score={candidate.match_score} />
                <span className="text-[10px] text-slate-400">📍 {candidate.location}</span>
                <span className="text-[10px] text-slate-400">💰 ${(candidate.salary_exp/1000).toFixed(0)}K</span>
              </div>
            </div>
            <div className="flex flex-wrap mt-2">
              {candidate.skills.map(s => <Tag key={s} label={s} />)}
            </div>
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => setInvitedIds(ids => [...ids, candidate.id])}
                disabled={invitedIds.includes(candidate.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-60"
                style={{
                  background: invitedIds.includes(candidate.id) ? '#ecfdf5' : '#eef2ff',
                  border: `1px solid ${invitedIds.includes(candidate.id) ? '#6ee7b7' : '#c7d2fe'}`,
                  color: invitedIds.includes(candidate.id) ? '#10b981' : '#6366f1',
                }}>
                <Mail size={11} />
                {invitedIds.includes(candidate.id) ? 'Invited ✓' : 'Send Invite'}
              </button>
              <button
                onClick={() => setRejectedIds(ids => [...ids, candidate.id])}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all border border-slate-200">
                <X size={11} /> Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
