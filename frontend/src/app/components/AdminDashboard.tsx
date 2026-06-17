import { useAuth } from '../App'
import { PageHeader, KPICard } from './KPICard'
import { Users, Briefcase, TrendingUp, DollarSign, Shield, Activity, RefreshCw, Download, Trash2 } from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { ADMIN_STATS, MONTHLY_DATA, CANDIDATES, JOBS } from './data'
import { useState } from 'react'

const tt = {
  contentStyle: { background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 11, color: '#0f172a' },
  labelStyle: { color: '#64748b' },
}

const SUBSCRIPTION_TIERS = [
  { tier: 'Free',       users: 1842, price: '$0/mo',   color: '#94a3b8' },
  { tier: 'Starter',    users: 896,  price: '$49/mo',  color: '#6366f1' },
  { tier: 'Growth',     users: 312,  price: '$149/mo', color: '#8b5cf6' },
  { tier: 'Enterprise', users: 92,   price: '$499/mo', color: '#f59e0b' },
]

const HEALTH_METRICS = [
  { label: 'API Uptime',        value: '99.98%', pct: 99.98, color: '#10b981' },
  { label: 'Avg Response Time', value: '142 ms', pct: 85,    color: '#6366f1' },
  { label: 'DB CPU Usage',      value: '34%',    pct: 34,    color: '#f59e0b' },
  { label: 'Error Rate',        value: '0.02%',  pct: 2,     color: '#10b981' },
]

const QUICK_ACTIONS = [
  { label: 'Send Announcement', icon: <Users size={13} />,     msg: '📢 Announcement queued!',          color: '#6366f1' },
  { label: 'Rebuild AI Index',  icon: <RefreshCw size={13} />, msg: '🔄 Re-index triggered (~4 min).', color: '#8b5cf6' },
  { label: 'Export Users CSV',  icon: <Download size={13} />,  msg: '📥 Export queued — check email.', color: '#10b981' },
  { label: 'Clear Cache',       icon: <Trash2 size={13} />,    msg: '🧹 Cache cleared.',                color: '#f59e0b' },
]

const card = 'bg-white rounded-xl'
const cardStyle = { border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }

export function AdminDashboard() {
  const { user } = useAuth()
  const [actionMsg, setActionMsg] = useState('')
  const s = ADMIN_STATS
  const recentCandidates = CANDIDATES.slice(0, 6)
  const recentJobs       = JOBS.slice(0, 6)

  return (
    <div className="space-y-6">
      <PageHeader title={`Admin Panel · ${user?.name ?? 'Admin'} 🛡️`} subtitle="Platform-wide overview — users, jobs, revenue and system health." />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Total Users"   value={s.total_users.toLocaleString()} delta="+142 this month" icon={<Users size={15} />}      accentColor="#6366f1" />
        <KPICard title="Recruiters"    value={s.recruiters.toLocaleString()}  delta="+12 this month"  icon={<Shield size={15} />}     accentColor="#8b5cf6" />
        <KPICard title="Jobs Posted"   value={s.jobs_posted.toLocaleString()} delta="+87 this month"  icon={<Briefcase size={15} />}  accentColor="#10b981" />
        <KPICard title="Total Hires"   value={s.hires.toLocaleString()}       delta="+34 this month"  icon={<TrendingUp size={15} />} accentColor="#f59e0b" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Monthly Revenue" value={`$${(s.monthly_revenue/1000).toFixed(0)}K`} delta="+$2,400"  icon={<DollarSign size={15} />} accentColor="#22c55e" />
        <KPICard title="ARR"             value={`$${(s.arr/1000).toFixed(0)}K`}             delta="+18%"      icon={<TrendingUp size={15} />}  accentColor="#06b6d4" />
        <KPICard title="Active Jobs"     value={s.active_jobs.toLocaleString()}              delta="-12"       icon={<Briefcase size={15} />}  accentColor="#f97316" deltaUp={false} />
        <KPICard title="Churn Rate"      value={`${s.churn_rate}%`}                         delta="-0.3%"     icon={<Activity size={15} />}  accentColor="#10b981" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className={`${card} p-5`} style={cardStyle}>
          <p className="text-xs font-bold text-slate-700 mb-4">💰 Monthly Revenue (USD)</p>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={MONTHLY_DATA}>
              <defs>
                <linearGradient id="revAdminGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#10b981" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false}
                tickFormatter={v => `$${(v/1000).toFixed(0)}K`} />
              <Tooltip {...tt} formatter={(v: number) => [`$${v.toLocaleString()}`, 'Revenue']} />
              <Area dataKey="revenue" stroke="#10b981" strokeWidth={2} fill="url(#revAdminGrad)" dot={false} name="Revenue" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className={`${card} p-5`} style={cardStyle}>
          <p className="text-xs font-bold text-slate-700 mb-4">📈 Applications Growth</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={MONTHLY_DATA} barCategoryGap="35%">
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip {...tt} />
              <Bar dataKey="applications" fill="#6366f1" radius={[3, 3, 0, 0]} name="Applications" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className={`${card} overflow-hidden`} style={cardStyle}>
          <div className="px-4 py-3 border-b bg-slate-50" style={{ borderColor: '#e2e8f0' }}>
            <p className="text-xs font-bold text-slate-900">👥 Recent Users</p>
          </div>
          <div>
            <div className="grid text-[9px] font-bold text-slate-400 uppercase tracking-wider px-4 py-2 bg-slate-50"
              style={{ gridTemplateColumns: '2fr 1.5fr 1.5fr', borderBottom: '1px solid #e2e8f0' }}>
              <span>Name</span><span>Role</span><span>Location</span>
            </div>
            {recentCandidates.map((c, i) => (
              <div key={c.id} className="grid items-center px-4 py-2 text-xs hover:bg-slate-50 transition-colors"
                style={{ gridTemplateColumns: '2fr 1.5fr 1.5fr', borderBottom: i < recentCandidates.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                <span className="font-semibold text-slate-900 truncate pr-2">{c.name}</span>
                <span className="text-slate-500 truncate text-[10px]">{c.role}</span>
                <span className="text-slate-400 text-[10px]">{c.location.split(',')[0]}</span>
              </div>
            ))}
          </div>
        </div>
        <div className={`${card} overflow-hidden`} style={cardStyle}>
          <div className="px-4 py-3 border-b bg-slate-50" style={{ borderColor: '#e2e8f0' }}>
            <p className="text-xs font-bold text-slate-900">📋 Top Job Listings</p>
          </div>
          <div>
            <div className="grid text-[9px] font-bold text-slate-400 uppercase tracking-wider px-4 py-2 bg-slate-50"
              style={{ gridTemplateColumns: '2fr 1.5fr 0.8fr', borderBottom: '1px solid #e2e8f0' }}>
              <span>Title</span><span>Company</span><span>Apps</span>
            </div>
            {recentJobs.map((j, i) => (
              <div key={j.id} className="grid items-center px-4 py-2 text-xs hover:bg-slate-50 transition-colors"
                style={{ gridTemplateColumns: '2fr 1.5fr 0.8fr', borderBottom: i < recentJobs.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                <span className="font-semibold text-slate-900 truncate pr-2">{j.title}</span>
                <span className="text-slate-500 text-[10px]">{j.company}</span>
                <span className="font-bold text-emerald-600">{j.applicants}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* System health */}
      <div className={`${card} p-5`} style={cardStyle}>
        <p className="text-xs font-bold text-slate-700 mb-4">🖥️ System Health</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {HEALTH_METRICS.map(m => (
            <div key={m.label} className="rounded-lg p-3 bg-slate-50" style={{ border: '1px solid #e2e8f0' }}>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">{m.label}</p>
              <p className="text-base font-bold mb-2" style={{ color: m.color }}>{m.value}</p>
              <div className="h-1.5 rounded-full bg-slate-200">
                <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(m.pct, 100)}%`, background: m.color }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Subscriptions */}
      <div className={`${card} p-5`} style={cardStyle}>
        <p className="text-xs font-bold text-slate-700 mb-4">💳 Subscription Breakdown</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {SUBSCRIPTION_TIERS.map(t => (
            <div key={t.tier} className="rounded-lg p-4 text-center bg-slate-50"
              style={{ border: '1px solid #e2e8f0', borderLeft: `3px solid ${t.color}` }}>
              <p className="text-xs font-bold mb-1" style={{ color: t.color }}>{t.tier}</p>
              <p className="text-xl font-extrabold text-slate-900">{t.users.toLocaleString()}</p>
              <p className="text-[10px] text-slate-400 mt-1">{t.price}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <div className={`${card} p-5`} style={cardStyle}>
        <p className="text-xs font-bold text-slate-700 mb-4">⚡ Quick Actions</p>
        {actionMsg && (
          <div className="mb-3 text-xs px-3 py-2 rounded-lg text-emerald-700 bg-emerald-50 border border-emerald-200">
            {actionMsg}
          </div>
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
