import { useState, useEffect } from 'react'
import { TrendingUp, Users, Briefcase, Activity, Filter, BarChart3, Target, Clock, Lightbulb, ChevronDown } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, FunnelChart, Funnel, LabelList,
  LineChart, Line,
} from 'recharts'

const BASE = import.meta.env.VITE_API_URL ?? ''
const card  = 'bg-white rounded-xl'
const cStyle = { border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }
const tt = {
  contentStyle: { background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 11, color: '#0f172a' },
  labelStyle: { color: '#64748b' },
}
const PIE_COLORS = ['#6366f1', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#94a3b8']

function apiFetch(path: string) {
  const t = localStorage.getItem('hireai_token')
  return fetch(`${BASE}${path}`, { headers: t ? { Authorization: `Bearer ${t}` } : {} }).then(r => r.json())
}

// ── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({
  icon, iconBg, iconColor, value, label, trend,
}: {
  icon: React.ReactNode; iconBg: string; iconColor: string
  value: string; label: string; trend: string
}) {
  const isNeutral = trend === 'Not enough data yet'
  return (
    <div className={`${card} p-5`} style={cStyle}>
      <div className="flex items-start justify-between mb-3">
        <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: iconBg }}>
          <span style={{ color: iconColor }}>{icon}</span>
        </div>
        <span className={`text-[10px] font-medium text-right leading-tight max-w-[110px] ${isNeutral ? 'text-slate-300 italic' : 'text-slate-400'}`}>
          {trend}
        </span>
      </div>
      <p className="text-3xl font-bold text-slate-900 leading-none mb-1">{value}</p>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
    </div>
  )
}

// ── Sparse caption ────────────────────────────────────────────────────────────
function SparseCaption({ msg }: { msg: string }) {
  return (
    <p className="text-[10px] text-slate-400 italic mt-2 text-center">{msg}</p>
  )
}

// ── Empty placeholder ─────────────────────────────────────────────────────────
function EmptyChart({ icon, title, sub }: { icon: React.ReactNode; title: string; sub: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 rounded-xl"
      style={{ background: '#f8fafc', border: '2px dashed #e2e8f0' }}>
      <span className="text-slate-300 mb-2">{icon}</span>
      <p className="text-xs font-semibold text-slate-600">{title}</p>
      <p className="text-[11px] text-slate-400 mt-1">{sub}</p>
    </div>
  )
}

// ── Headline insight ──────────────────────────────────────────────────────────
function buildHeadline(
  totalApps: number,
  activeJobs: number,
  hires: number,
  topJob: string | null,
  jobsWithZeroApps: number,
): string {
  if (totalApps === 0 && activeJobs === 0)
    return "No jobs posted yet — post your first role to start tracking applications."

  if (totalApps === 0)
    return `You have ${activeJobs} active job${activeJobs !== 1 ? 's' : ''} but no applications yet — consider promoting your postings or broadening skill requirements.`

  const ratio = activeJobs > 0 ? totalApps / activeJobs : 0

  if (hires > 0)
    return `Great momentum — ${hires} hire${hires !== 1 ? 's' : ''} made from ${totalApps} application${totalApps !== 1 ? 's' : ''} across ${activeJobs} active job${activeJobs !== 1 ? 's' : ''}${topJob ? `, led by "${topJob}"` : ''}.`

  if (ratio < 0.5 && activeJobs >= 3)
    return `You've posted ${activeJobs} jobs but received only ${totalApps} application${totalApps !== 1 ? 's' : ''}${topJob ? ` — "${topJob}" is leading` : ''} — ${jobsWithZeroApps > 0 ? `${jobsWithZeroApps} job${jobsWithZeroApps !== 1 ? 's' : ''} have zero applications and may need attention` : 'visibility or skill matching may need review'}.`

  if (ratio >= 3)
    return `Strong activity — averaging ${ratio.toFixed(1)} applications per job across ${activeJobs} active posting${activeJobs !== 1 ? 's' : ''}${topJob ? `, with "${topJob}" drawing the most interest` : ''}.`

  return `${totalApps} application${totalApps !== 1 ? 's' : ''} received across ${activeJobs} active job${activeJobs !== 1 ? 's' : ''}${topJob ? ` — "${topJob}" is your top role by applicants` : ''}.`
}

// ── Actionable insights ───────────────────────────────────────────────────────
function buildInsights(
  totalApps: number,
  activeJobs: number,
  hires: number,
  inInterview: number,
  jobWiseStats: any[],
  avgAts: number,
): string[] {
  const insights: string[] = []

  if (totalApps === 0) {
    insights.push(`You have ${activeJobs} active job${activeJobs !== 1 ? 's' : ''} with no applicants yet — share your postings externally or lower required experience thresholds to widen your funnel.`)
    return insights
  }

  const ratio = activeJobs > 0 ? (totalApps / activeJobs).toFixed(1) : '0'
  const zeroAppJobs = jobWiseStats.filter(j => j.status === 'Active' && j.total_applications === 0)
  const topJobs = [...jobWiseStats].sort((a, b) => b.total_applications - a.total_applications)

  if (zeroAppJobs.length > 0) {
    const names = zeroAppJobs.slice(0, 3).map(j => `"${j.job_title}"`).join(', ')
    insights.push(`${zeroAppJobs.length} active job${zeroAppJobs.length !== 1 ? 's' : ''} have zero applications — review ${names} for clarity, skill breadth, or visibility.`)
  } else {
    insights.push(`Application rate: ${ratio} per active job — all roles have at least one applicant.`)
  }

  if (inInterview > 0)
    insights.push(`${inInterview} candidate${inInterview !== 1 ? 's are' : ' is'} in the Interview stage — move to Offer if evaluations are complete to keep momentum.`)
  else if (totalApps > 0 && hires === 0)
    insights.push(`No candidates have reached Interview yet — consider screening top-scored applicants to advance the pipeline.`)

  if (hires > 0)
    insights.push(`${hires} hire${hires !== 1 ? 's' : ''} completed — that's a ${((hires / totalApps) * 100).toFixed(0)}% conversion rate from application to hire.`)
  else
    insights.push(`No hires yet. Your pipeline has ${totalApps} application${totalApps !== 1 ? 's' : ''} — advance high-scoring candidates to close your first hire.`)

  if (avgAts > 0 && avgAts < 50)
    insights.push(`Average ATS score is ${avgAts}% — applicants' skills may not match your job requirements well. Consider adjusting skill lists on low-performing postings.`)

  if (topJobs.length > 0 && topJobs[0].total_applications > 0)
    insights.push(`"${topJobs[0].job_title}" is your most applied-to role with ${topJobs[0].total_applications} applicant${topJobs[0].total_applications !== 1 ? 's' : ''} — use it as a benchmark for what attracts candidates.`)

  return insights
}

// ── Main component ────────────────────────────────────────────────────────────
export function Analytics() {
  const [analytics, setAnalytics] = useState<any>(null)
  const [funnel, setFunnel]       = useState<any[]>([])
  const [kanban, setKanban]       = useState<Record<string, any[]>>({})
  const [jobs, setJobs]           = useState<any[]>([])
  const [selectedJobId, setSelectedJobId] = useState<string>('all')

  useEffect(() => {
    apiFetch('/analytics').then(d => { if (d?.total_jobs !== undefined) setAnalytics(d) }).catch(() => {})
    apiFetch('/analytics/funnel').then(d => setFunnel(Array.isArray(d) ? d : [])).catch(() => {})
    apiFetch('/applications/kanban').then(d => setKanban(d && typeof d === 'object' ? d : {})).catch(() => {})
    apiFetch('/jobs/').then(d => setJobs(Array.isArray(d) ? d : [])).catch(() => {})
  }, [])

  // ── Derived values ────────────────────────────────────────────────────────
  const jobWiseStats = analytics?.job_wise_stats ?? []
  
  // Filter data by selected job
  const filteredJobWise = selectedJobId === 'all' 
    ? jobWiseStats 
    : jobWiseStats.filter((j: any) => String(j.job_id) === selectedJobId)
  
  const allCards        = Object.values(kanban).flat()
  const filteredCards   = selectedJobId === 'all'
    ? allCards
    : allCards.filter((c: any) => String(c.job_id) === selectedJobId)
  
  const totalApps       = selectedJobId === 'all'
    ? (analytics?.total_applications ?? 0)
    : filteredJobWise.reduce((s: number, j: any) => s + (j.total_applications ?? 0), 0)
  
  const totalHires      = filteredJobWise.reduce((s: number, j: any) => s + (j.status_breakdown?.Hired ?? 0), 0)
  
  const activeJobs      = selectedJobId === 'all'
    ? (analytics?.active_jobs ?? 0)
    : filteredJobWise.filter((j: any) => j.status === 'Active').length
  
  const avgAts          = selectedJobId === 'all'
    ? (analytics?.avg_ats_score ?? 0)
    : filteredJobWise.length > 0
      ? filteredJobWise.reduce((s: number, j: any) => s + (j.avg_ats_score ?? 0), 0) / filteredJobWise.length
      : 0
  
  const topSkills: any[] = analytics?.top_skills ?? []
  const overTime: any[] = analytics?.applications_over_time ?? []
  const inInterview     = selectedJobId === 'all'
    ? (kanban['Interview']?.length ?? 0)
    : (kanban['Interview']?.filter((c: any) => String(c.job_id) === selectedJobId).length ?? 0)

  // Rebuild status data based on filtered cards
  const statusData = selectedJobId === 'all'
    ? Object.entries(kanban).map(([status, cards]) => ({ status, count: cards.length })).filter(s => s.count > 0)
    : Object.entries(kanban).map(([status, cards]) => ({
        status,
        count: cards.filter((c: any) => String(c.job_id) === selectedJobId).length
      })).filter(s => s.count > 0)

  const topJobByApps = [...filteredJobWise].sort((a: any, b: any) => b.total_applications - a.total_applications)[0] ?? null
  const topJobName   = topJobByApps?.total_applications > 0 ? topJobByApps.job_title : null
  const zeroAppCount = filteredJobWise.filter((j: any) => j.status === 'Active' && j.total_applications === 0).length

  // ── Trend labels for stat cards ───────────────────────────────────────────
  const appsTrend   = overTime.length >= 2
    ? `+${overTime[overTime.length - 1].count} most recent day`
    : overTime.length === 1
      ? 'First application received'
      : totalApps === 0 ? 'No applications yet' : 'Not enough data yet'

  const hiresTrend  = totalHires > 0
    ? `${((totalHires / totalApps) * 100).toFixed(0)}% conversion rate`
    : totalApps > 0 ? 'No hires yet — pipeline active' : 'Not enough data yet'

  const jobsTrend   = zeroAppCount > 0
    ? `${zeroAppCount} job${zeroAppCount !== 1 ? 's' : ''} with zero applicants`
    : activeJobs > 0 ? 'All roles have applicants' : 'Not enough data yet'

  const atsTrend    = avgAts > 0
    ? avgAts >= 70 ? 'Strong match quality' : avgAts >= 50 ? 'Moderate match quality' : 'Low match — review job skills'
    : 'Not enough data yet'

  // ── Headline ──────────────────────────────────────────────────────────────
  const headline = analytics
    ? buildHeadline(totalApps, activeJobs, totalHires, topJobName, zeroAppCount)
    : null

  // ── Insights ──────────────────────────────────────────────────────────────
  const insights = analytics && totalApps >= 0
    ? buildInsights(totalApps, activeJobs, totalHires, inInterview, filteredJobWise, avgAts)
    : []
  
  // ── Selected job detail ───────────────────────────────────────────────────
  const selectedJobDetail = selectedJobId !== 'all' 
    ? filteredJobWise.find((j: any) => String(j.job_id) === selectedJobId)
    : null

  return (
    <div className="space-y-6">
      {/* Header with Job Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 size={20} className="text-indigo-600" /> Analytics Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Live hiring metrics from your database.</p>
        </div>
        
        {/* Job Filter Dropdown */}
        <div className="relative">
          <select
            value={selectedJobId}
            onChange={(e) => setSelectedJobId(e.target.value)}
            className="appearance-none bg-white border border-slate-200 rounded-lg px-4 pr-10 py-2 text-sm font-medium text-slate-700 hover:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer transition-colors"
            style={{ minWidth: '200px' }}
          >
            <option value="all">All Jobs</option>
            {jobWiseStats.map((job: any) => (
              <option key={job.job_id} value={String(job.job_id)}>
                {job.job_title} @ {job.company}
              </option>
            ))}
          </select>
          <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* Headline insight */}
      {headline && (
        <div className="rounded-xl px-4 py-3 flex items-start gap-3"
          style={{ background: '#f0f9ff', border: '1px solid #bae6fd' }}>
          <Lightbulb size={15} className="text-sky-500 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-sky-800 font-medium leading-snug">{headline}</p>
        </div>
      )}

      {/* 4 Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Users size={16} />}      iconBg="#eef2ff" iconColor="#6366f1"
          value={analytics ? String(totalApps) : '—'} label="Total Applications" trend={appsTrend} />
        <StatCard icon={<TrendingUp size={16} />} iconBg="#ecfdf5" iconColor="#10b981"
          value={analytics ? String(totalHires) : '—'}  label="Total Hires"         trend={hiresTrend} />
        <StatCard icon={<Briefcase size={16} />} iconBg="#f5f3ff" iconColor="#8b5cf6"
          value={analytics ? String(activeJobs) : '—'}  label="Active Jobs"         trend={jobsTrend} />
        <StatCard icon={<Activity size={16} />}  iconBg="#fffbeb" iconColor="#f59e0b"
          value={analytics ? `${Math.round(avgAts)}%` : '—'} label="Avg ATS Score" trend={atsTrend} />
      </div>

      {/* Applications over time */}
      <div className={`${card} p-5`} style={cStyle}>
        <p className="text-xs font-bold text-slate-900 mb-4 flex items-center gap-2">
          <TrendingUp size={14} className="text-indigo-600" /> Applications Over Time
        </p>
        {overTime.length === 0 ? (
          <EmptyChart
            icon={<TrendingUp size={28} />}
            title="No application history yet"
            sub="A daily timeline will appear here once candidates start applying."
          />
        ) : (
          <>
            <ResponsiveContainer width="100%" height={180}>
              {overTime.length === 1 ? (
                <BarChart data={overTime}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip {...tt} />
                  <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} name="Applications" />
                </BarChart>
              ) : (
                <LineChart data={overTime}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip {...tt} />
                  <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2} dot={{ r: 4, fill: '#6366f1' }} name="Applications" />
                </LineChart>
              )}
            </ResponsiveContainer>
            {overTime.length <= 3 && (
              <SparseCaption msg="Only a few data points so far — the trend will become clearer as more applications come in." />
            )}
          </>
        )}
      </div>

      {/* Funnel + Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className={`${card} p-5`} style={cStyle}>
          <p className="text-xs font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Filter size={14} className="text-indigo-600" /> Hiring Funnel
          </p>
          {funnel.every(f => f.count === 0) || funnel.length === 0 ? (
            <EmptyChart icon={<Filter size={28} />} title="No applications yet" sub="Funnel data will appear once candidates apply." />
          ) : (
            <>
              <ResponsiveContainer width="100%" height={220}>
                <FunnelChart>
                  <Tooltip {...tt} />
                  <Funnel dataKey="count" data={funnel} isAnimationActive>
                    <LabelList position="right" fill="#64748b" stroke="none" fontSize={10}
                      formatter={(val: number) => val.toLocaleString()} />
                    {funnel.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Funnel>
                </FunnelChart>
              </ResponsiveContainer>
              {totalApps < 5 && (
                <SparseCaption msg="Funnel shape will become more meaningful as more applications progress through stages." />
              )}
            </>
          )}
        </div>

        <div className={`${card} p-5`} style={cStyle}>
          <p className="text-xs font-bold text-slate-900 mb-4 flex items-center gap-2">
            <BarChart3 size={14} className="text-indigo-600" /> Status Distribution
          </p>
          {statusData.length === 0 ? (
            <EmptyChart icon={<BarChart3 size={28} />} title="No applications yet" sub="Stage breakdown will appear once candidates apply." />
          ) : (
            <>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={statusData} barCategoryGap="30%">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="status" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip {...tt} />
                  <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} name="Applications" />
                </BarChart>
              </ResponsiveContainer>
              {statusData.length === 1 && (
                <SparseCaption msg="All applications are in the same stage — distribution will spread as you advance candidates." />
              )}
            </>
          )}
        </div>
      </div>

      {/* Top Skills + Top Jobs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className={`${card} p-5`} style={cStyle}>
          <p className="text-xs font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Target size={14} className="text-indigo-600" /> Top Skills Among Applicants
          </p>
          {topSkills.length === 0 ? (
            <EmptyChart
              icon={<Users size={28} />}
              title="No matched skill data yet"
              sub="Skills breakdown reflects actual applicants' matched skills — appears once candidates apply."
            />
          ) : (
            <>
              <div className="flex items-center gap-4">
                <ResponsiveContainer width="50%" height={180}>
                  <PieChart>
                    <Pie data={topSkills} dataKey="count" nameKey="skill"
                      cx="50%" cy="50%" innerRadius={50} outerRadius={75} strokeWidth={2} stroke="#fff">
                      {topSkills.map((_: any, i: number) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip {...tt} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-col gap-2 flex-1">
                  {topSkills.map((s: any, i: number) => (
                    <div key={s.skill} className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: PIE_COLORS[i] }} />
                      <span className="text-[10px] text-slate-500 flex-1 capitalize">{s.skill}</span>
                      <span className="text-[10px] font-bold text-slate-900">{s.count}</span>
                    </div>
                  ))}
                </div>
              </div>
              {totalApps < 3 && (
                <SparseCaption msg="Based on limited applicants — skill distribution will be more representative with more applications." />
              )}
            </>
          )}
        </div>

        <div className={`${card} p-5`} style={cStyle}>
          <p className="text-xs font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Briefcase size={14} className="text-indigo-600" /> Top Jobs by Applicants
          </p>
          {jobs.length === 0 ? (
            <EmptyChart icon={<Briefcase size={28} />} title="No jobs posted yet" sub="Post a job to start tracking applicants per role." />
          ) : (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart
                  data={[...jobs]
                    .sort((a, b) => (b.applicants ?? 0) - (a.applicants ?? 0))
                    .slice(0, 7)
                    .map(j => ({ name: j.title?.split(' ').slice(0, 2).join(' '), apps: j.applicants ?? 0 }))}
                  layout="vertical" barCategoryGap="30%">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                  <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <YAxis dataKey="name" type="category" width={90} tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip {...tt} />
                  <Bar dataKey="apps" fill="#8b5cf6" radius={[0, 4, 4, 0]} name="Applicants" />
                </BarChart>
              </ResponsiveContainer>
              {jobs.every(j => (j.applicants ?? 0) === 0) && (
                <SparseCaption msg="No applicants yet on any role — bars will fill in as candidates apply." />
              )}
              {zeroAppCount > 0 && jobs.some(j => (j.applicants ?? 0) > 0) && (
                <SparseCaption msg={`${zeroAppCount} job${zeroAppCount !== 1 ? 's' : ''} still at zero — they appear flat at the bottom.`} />
              )}
            </>
          )}
        </div>
      </div>

      {/* Hiring Insights */}
      {insights.length > 0 && (
        <div className="rounded-xl p-4 bg-indigo-50" style={{ border: '1px solid #e0e7ff' }}>
          <p className="text-xs font-semibold text-indigo-700 mb-3 flex items-center gap-1.5">
            <Clock size={13} /> Hiring Insights
          </p>
          <ul className="space-y-2">
            {insights.map((tip, i) => (
              <li key={i} className="text-xs text-indigo-700/80 flex gap-2 leading-relaxed">
                <span className="text-indigo-400 flex-shrink-0 mt-0.5">→</span>{tip}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Job-Wise Visualization */}
      {selectedJobId !== 'all' && selectedJobDetail ? (
        <div className={`${card} p-5`} style={cStyle}>
          <p className="text-xs font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Briefcase size={14} className="text-indigo-600" /> Job Pipeline Breakdown
          </p>
          <div className="space-y-4">
            {/* Job Info Header */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <p className="font-semibold text-sm text-slate-900">{selectedJobDetail.job_title}</p>
                <p className="text-xs text-slate-500 mt-0.5">{selectedJobDetail.company}</p>
              </div>
              <span className={`px-2 py-1 rounded text-[10px] font-medium ${
                selectedJobDetail.status === 'Active' 
                  ? 'bg-green-50 text-green-700' 
                  : 'bg-slate-100 text-slate-600'
              }`}>
                {selectedJobDetail.status}
              </span>
            </div>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-[10px] text-slate-500 uppercase tracking-wide mb-1">Total Applications</p>
                <p className="text-2xl font-bold text-slate-900">{selectedJobDetail.total_applications}</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-[10px] text-slate-500 uppercase tracking-wide mb-1">Avg ATS Score</p>
                <p className="text-2xl font-bold text-slate-900">{Math.round(selectedJobDetail.avg_ats_score ?? 0)}%</p>
              </div>
            </div>

            {/* Status Breakdown Bars */}
            {selectedJobDetail.status_breakdown && Object.keys(selectedJobDetail.status_breakdown).length > 0 ? (
              <div className="space-y-2">
                <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-wide">Pipeline Stages</p>
                {Object.entries(selectedJobDetail.status_breakdown).map(([status, count]: [string, any]) => {
                  const total = selectedJobDetail.total_applications || 1
                  const percentage = ((count / total) * 100).toFixed(0)
                  const colors: Record<string, string> = {
                    Applied: 'bg-blue-500',
                    Screening: 'bg-yellow-500',
                    Interview: 'bg-purple-500',
                    Offer: 'bg-green-500',
                    Hired: 'bg-emerald-600',
                    Rejected: 'bg-red-500'
                  }
                  return count > 0 ? (
                    <div key={status} className="space-y-1">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-slate-600 font-medium">{status}</span>
                        <span className="text-slate-900 font-bold">{count} ({percentage}%)</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div 
                          className={`h-full ${colors[status] || 'bg-slate-400'} transition-all duration-300`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  ) : null
                })}
              </div>
            ) : (
              <p className="text-xs text-slate-400 text-center py-4 italic">No applications yet for this job</p>
            )}
          </div>
        </div>
      ) : selectedJobId === 'all' && jobWiseStats.length > 0 ? (
        <div className={`${card} p-5`} style={cStyle}>
          <p className="text-xs font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Briefcase size={14} className="text-indigo-600" /> Job-Wise Performance Table
          </p>
          <div className="overflow-x-auto -mx-5 px-5">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="pb-2 pr-4 text-[10px] font-bold text-slate-600 uppercase tracking-wide">Job Title</th>
                  <th className="pb-2 px-3 text-[10px] font-bold text-slate-600 uppercase tracking-wide">Company</th>
                  <th className="pb-2 px-3 text-[10px] font-bold text-slate-600 uppercase tracking-wide text-center">Status</th>
                  <th className="pb-2 px-3 text-[10px] font-bold text-slate-600 uppercase tracking-wide text-right">Applications</th>
                  <th className="pb-2 pl-3 text-[10px] font-bold text-slate-600 uppercase tracking-wide text-right">Avg ATS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {jobWiseStats.map((job: any) => (
                  <tr key={job.job_id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 pr-4 text-xs font-medium text-slate-900">{job.job_title}</td>
                    <td className="py-3 px-3 text-xs text-slate-600">{job.company}</td>
                    <td className="py-3 px-3 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium ${
                        job.status === 'Active' 
                          ? 'bg-green-50 text-green-700' 
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {job.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-xs font-semibold text-slate-900 text-right">{job.total_applications}</td>
                    <td className="py-3 pl-3 text-xs font-semibold text-slate-900 text-right">{Math.round(job.avg_ats_score ?? 0)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </div>
  )
}
