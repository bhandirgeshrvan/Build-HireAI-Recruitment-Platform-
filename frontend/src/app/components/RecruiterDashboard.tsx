import { useNav, useAuth } from '../App'
import { KPICard, PageHeader } from './KPICard'
import { Briefcase, Users, Calendar, TrendingUp, PlusCircle } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { JOBS, WEEKLY_APPLICATIONS, DEPT_HIRES, RECRUITER_FUNNEL, TODAY_SCHEDULE } from './data'
const tt = {
  contentStyle: { background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 11, color: '#0f172a' },
  labelStyle: { color: '#64748b' },
}
const card = 'bg-white rounded-xl'
const cardStyle = { border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }

export function RecruiterDashboard() {
  const { user } = useAuth()
  const { navigate } = useNav()
  const activeJobs = JOBS.filter(j => j.status === 'Active').slice(0, 6)

  return (
    <div className="space-y-6">
      <PageHeader title={`Welcome, ${user?.name ?? 'Sarah'} 💼`} subtitle="Manage listings, review candidates, and track hiring progress." />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Active Jobs"          value="14"  delta="+2 this week"  icon={<Briefcase size={16} />} accentColor="#6366f1" />
        <KPICard title="Total Candidates"     value="387" delta="+42 this week" icon={<Users size={16} />}     accentColor="#8b5cf6" />
        <KPICard title="Scheduled Interviews" value="18"  delta="+5 today"      icon={<Calendar size={16} />}  accentColor="#f59e0b" />
        <KPICard title="Hiring Rate"          value="22%" delta="+3%"           icon={<TrendingUp size={16} />} accentColor="#10b981" />
      </div>

      {/* Pipeline */}
      <div className="grid grid-cols-5 gap-3">
        {RECRUITER_FUNNEL.map(s => (
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
          <p className="text-xs font-bold text-slate-700 mb-4">📊 Applications This Week</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={WEEKLY_APPLICATIONS} barCategoryGap="35%">
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="day" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip {...tt} />
              <Bar dataKey="apps" fill="#6366f1" radius={[4, 4, 0, 0]} name="Applications" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className={`${card} p-5`} style={cardStyle}>
          <p className="text-xs font-bold text-slate-700 mb-4">🎯 Hires by Department</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={DEPT_HIRES} barCategoryGap="35%">
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="dept" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip {...tt} />
              <Bar dataKey="hires" fill="#10b981" radius={[4, 4, 0, 0]} name="Hires" />
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
        <div>
          <div className="grid text-[10px] font-bold text-slate-400 uppercase tracking-wider px-5 py-2.5 bg-slate-50"
            style={{ gridTemplateColumns: '2fr 1.5fr 1fr 1fr 0.8fr', borderBottom: '1px solid #e2e8f0' }}>
            <span>Role</span><span>Company</span><span>Type</span><span>Applicants</span><span>Days ago</span>
          </div>
          {activeJobs.map((job, i) => (
            <div key={job.id} className="grid items-center px-5 py-2.5 text-xs hover:bg-slate-50 transition-colors"
              style={{ gridTemplateColumns: '2fr 1.5fr 1fr 1fr 0.8fr', borderBottom: i < activeJobs.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
              <span className="font-semibold text-slate-900 truncate pr-2">{job.title}</span>
              <span className="text-slate-500">{job.company}</span>
              <span className="text-slate-500">{job.type}</span>
              <span className="font-semibold text-slate-800">{job.applicants}</span>
              <span className="text-slate-400">{job.posted_days}d</span>
            </div>
          ))}
        </div>
      </div>

      {/* Schedule */}
      <div className={`${card} p-5`} style={cardStyle}>
        <p className="text-sm font-bold text-slate-900 mb-4">📅 Today's Interviews</p>
        <div className="space-y-2">
          {TODAY_SCHEDULE.map((s, i) => (
            <div key={i} className="flex items-center justify-between px-4 py-2.5 rounded-lg bg-slate-50"
              style={{ border: '1px solid #e2e8f0' }}>
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-indigo-600 min-w-[64px]">{s.time}</span>
                <div>
                  <span className="text-xs font-semibold text-slate-900">{s.name}</span>
                  <span className="text-[10px] text-slate-400 ml-2">· {s.role}</span>
                </div>
              </div>
              <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full"
                style={{ background: `${s.color}12`, color: s.color, border: `1px solid ${s.color}25` }}>
                {s.round}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
