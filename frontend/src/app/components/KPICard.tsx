import type { ReactNode } from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface KPICardProps {
  title: string
  value: string
  delta?: string
  deltaUp?: boolean
  icon?: ReactNode
  accentColor?: string
  subtitle?: string
}

export function KPICard({
  title, value, delta, deltaUp = true, icon, accentColor = '#6366f1', subtitle,
}: KPICardProps) {
  return (
    <div
      className="relative rounded-xl p-4 bg-white overflow-hidden"
      style={{ border: '1px solid #e2e8f0', borderLeft: `3px solid ${accentColor}` }}
    >
      {/* Soft glow */}
      <div
        className="absolute top-0 right-0 w-20 h-20 opacity-[0.04] rounded-full blur-2xl pointer-events-none"
        style={{ background: accentColor }}
      />
      <div className="relative flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
            {title}
          </p>
          <p className="text-2xl font-bold text-slate-900 leading-none mb-1">{value}</p>
          {subtitle && <p className="text-[10px] text-slate-400 mt-1">{subtitle}</p>}
          {delta && (
            <div className="flex items-center gap-1 mt-2">
              {deltaUp
                ? <TrendingUp size={10} className="text-emerald-500" />
                : <TrendingDown size={10} className="text-red-400" />}
              <span className="text-[10px] font-medium"
                style={{ color: deltaUp ? '#10b981' : '#ef4444' }}>
                {delta}
              </span>
            </div>
          )}
        </div>
        {icon && (
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: `${accentColor}12`, border: `1px solid ${accentColor}25` }}
          >
            <span style={{ color: accentColor }}>{icon}</span>
          </div>
        )}
      </div>
    </div>
  )
}

export function ScoreBadge({ score }: { score: number }) {
  const color = score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444'
  const label = score >= 80 ? 'Top Match' : score >= 60 ? 'Good Fit' : 'Partial'
  return (
    <span
      className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
      style={{ background: `${color}12`, color, border: `1px solid ${color}25` }}
    >
      {score}% · {label}
    </span>
  )
}

export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-6">
      <h1 className="text-xl font-bold text-slate-900">{title}</h1>
      {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
    </div>
  )
}

export function Tag({ label, color = '#6366f1' }: { label: string; color?: string }) {
  return (
    <span
      className="inline-block text-[10px] font-medium px-2 py-0.5 rounded-md mr-1 mb-1"
      style={{ background: `${color}10`, color, border: `1px solid ${color}20` }}
    >
      {label}
    </span>
  )
}

export function StatusPill({ status }: { status: string }) {
  const colors: Record<string, string> = {
    Active:    '#10b981',
    Closed:    '#94a3b8',
    Applied:   '#6366f1',
    Screening: '#8b5cf6',
    Interview: '#f59e0b',
    Offer:     '#10b981',
    Hired:     '#22c55e',
  }
  const c = colors[status] ?? '#94a3b8'
  return (
    <span
      className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
      style={{ background: `${c}12`, color: c, border: `1px solid ${c}25` }}
    >
      {status}
    </span>
  )
}
