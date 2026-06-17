import { useState } from 'react'
import { PageHeader, KPICard } from './KPICard'
import { BarChart3, TrendingUp, Users, Clock } from 'lucide-react'
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, Funnel, FunnelChart, LabelList,
} from 'recharts'
import { MONTHLY_DATA, FUNNEL_DATA, SOURCES_DATA, TIME_TO_HIRE, SUCCESS_RATE, DIVERSITY_STATS } from './data'

const tt = {
  contentStyle: { background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 11, color: '#0f172a' },
  labelStyle: { color: '#64748b' },
}
const PIE_COLORS = ['#6366f1', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#94a3b8']
const card = 'bg-white rounded-xl p-5'
const cardStyle = { border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }

export function Analytics() {
  const [range, setRange] = useState('Last 12 months')

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <PageHeader title="📈 Analytics Dashboard" subtitle="Comprehensive hiring metrics and performance insights." />
        <select value={range} onChange={e => setRange(e.target.value)}
          className="px-3 py-2 rounded-lg text-xs text-slate-800 outline-none cursor-pointer bg-white"
          style={{ border: '1px solid #e2e8f0' }}>
          {['Last 30 days','Last 3 months','Last 6 months','Last 12 months'].map(r => <option key={r}>{r}</option>)}
        </select>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <KPICard title="Total Applications" value="18,904" delta="+12% MoM" icon={<Users size={15} />}       accentColor="#6366f1" />
        <KPICard title="Total Hires"        value="682"    delta="+8% MoM"  icon={<TrendingUp size={15} />}  accentColor="#10b981" />
        <KPICard title="Avg Time-to-Hire"   value="24 days" delta="-3 days" icon={<Clock size={15} />}        accentColor="#8b5cf6" deltaUp={false} />
        <KPICard title="Offer Accept Rate"  value="71%"    delta="+4%"      icon={<BarChart3 size={15} />}   accentColor="#f59e0b" />
        <KPICard title="Cost Per Hire"      value="$3,240" delta="-$180"    icon={<TrendingUp size={15} />}  accentColor="#22c55e" />
      </div>

      {/* Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className={card} style={cardStyle}>
          <p className="text-xs font-bold text-slate-700 mb-4">📅 Applications & Hires by Month</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={MONTHLY_DATA} barCategoryGap="25%">
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip {...tt} />
              <Legend wrapperStyle={{ fontSize: 11, color: '#64748b', paddingTop: 8 }} />
              <Bar dataKey="applications" fill="#6366f1" radius={[3, 3, 0, 0]} name="Applications" />
              <Bar dataKey="hires"        fill="#10b981" radius={[3, 3, 0, 0]} name="Hires" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className={card} style={cardStyle}>
          <p className="text-xs font-bold text-slate-700 mb-4">🔻 Hiring Funnel</p>
          <ResponsiveContainer width="100%" height={220}>
            <FunnelChart>
              <Tooltip {...tt} />
              <Funnel dataKey="count" data={FUNNEL_DATA} isAnimationActive>
                <LabelList position="right" fill="#64748b" stroke="none" fontSize={10}
                  formatter={(val: number) => val.toLocaleString()} />
                {FUNNEL_DATA.map((entry, index) => (
                  <Cell key={index} fill={entry.fill} />
                ))}
              </Funnel>
            </FunnelChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className={card} style={cardStyle}>
          <p className="text-xs font-bold text-slate-700 mb-4">🌐 Candidate Sources</p>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width="50%" height={180}>
              <PieChart>
                <Pie data={SOURCES_DATA} dataKey="count" nameKey="source"
                  cx="50%" cy="50%" innerRadius={50} outerRadius={75} strokeWidth={2} stroke="#fff">
                  {SOURCES_DATA.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip {...tt} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-2">
              {SOURCES_DATA.map((s, i) => (
                <div key={s.source} className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: PIE_COLORS[i] }} />
                  <span className="text-[10px] text-slate-500">{s.source}</span>
                  <span className="text-[10px] font-bold text-slate-900 ml-auto">{s.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className={card} style={cardStyle}>
          <p className="text-xs font-bold text-slate-700 mb-4">⏱️ Avg Time-to-Hire by Dept (days)</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={TIME_TO_HIRE} layout="vertical" barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis dataKey="dept" type="category" width={72} tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip {...tt} />
              <Bar dataKey="days" fill="#8b5cf6" radius={[0, 4, 4, 0]} name="Days" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className={card} style={cardStyle}>
          <p className="text-xs font-bold text-slate-700 mb-4">📈 Hiring Success Rate (%)</p>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={SUCCESS_RATE}>
              <defs>
                <linearGradient id="successGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#10b981" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
              <Tooltip {...tt} formatter={(v: number) => [`${v}%`, 'Success Rate']} />
              <Area dataKey="rate" stroke="#10b981" strokeWidth={2} fill="url(#successGrad)"
                dot={{ r: 3, fill: '#10b981', strokeWidth: 0 }} name="Rate" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className={card} style={cardStyle}>
          <p className="text-xs font-bold text-slate-700 mb-4">💰 Monthly Revenue ($)</p>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={MONTHLY_DATA}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false}
                tickFormatter={v => `$${(v/1000).toFixed(0)}K`} />
              <Tooltip {...tt} formatter={(v: number) => [`$${v.toLocaleString()}`, 'Revenue']} />
              <Area dataKey="revenue" stroke="#6366f1" strokeWidth={2} fill="url(#revGrad)"
                dot={{ r: 3, fill: '#6366f1', strokeWidth: 0 }} name="Revenue" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Diversity */}
      <div className={card} style={cardStyle}>
        <p className="text-xs font-bold text-slate-700 mb-4">🌍 Diversity & Inclusion</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {DIVERSITY_STATS.map(d => (
            <div key={d.label} className="rounded-lg p-3 text-center bg-slate-50"
              style={{ border: '1px solid #e2e8f0', borderLeft: `3px solid ${d.color}` }}>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">{d.label}</p>
              <p className="text-lg font-bold" style={{ color: d.color }}>{d.val}</p>
              <p className="text-[9px] text-slate-400 mt-0.5">{d.sub}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
