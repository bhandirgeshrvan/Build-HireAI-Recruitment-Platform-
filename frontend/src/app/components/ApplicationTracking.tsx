import { PageHeader, ScoreBadge } from './KPICard'
import { KANBAN } from './data'
import type { KanbanCard } from './data'

const STAGE_META: Record<string, { color: string; icon: string; label: string }> = {
  Applied:   { color: '#6366f1', icon: '📬', label: 'Applied'   },
  Screening: { color: '#8b5cf6', icon: '🔍', label: 'Screening' },
  Interview: { color: '#f59e0b', icon: '🎤', label: 'Interview' },
  Offer:     { color: '#10b981', icon: '📩', label: 'Offer'     },
  Hired:     { color: '#22c55e', icon: '🎉', label: 'Hired'     },
}

function KanbanItem({ item, color }: { item: KanbanCard; color: string }) {
  return (
    <div className="rounded-lg p-3 mb-2 bg-white transition-all hover:shadow-sm"
      style={{ border: '1px solid #e2e8f0', borderLeft: `3px solid ${color}` }}>
      <p className="text-xs font-bold text-slate-900 mb-0.5">{item.name}</p>
      <p className="text-[10px] font-medium mb-1" style={{ color }}>{item.role}</p>
      <p className="text-[10px] text-slate-400 mb-2">🏢 {item.company}</p>
      <div className="flex items-center justify-between">
        <span className="text-[9px] text-slate-400">📅 {item.date}</span>
        <ScoreBadge score={item.score} />
      </div>
    </div>
  )
}

export function ApplicationTracking() {
  const stages = Object.keys(KANBAN)
  const totals = stages.reduce((acc, s) => acc + (KANBAN[s]?.length ?? 0), 0)

  return (
    <div className="space-y-6">
      <PageHeader title="📋 Application Tracker" subtitle="Track the status of every job you've applied to." />

      {/* Stage KPIs */}
      <div className="grid grid-cols-5 gap-3">
        {stages.map(stage => {
          const meta  = STAGE_META[stage]
          const count = KANBAN[stage]?.length ?? 0
          return (
            <div key={stage} className="rounded-xl p-3 text-center bg-white"
              style={{ border: '1px solid #e2e8f0', borderTop: `3px solid ${meta.color}`, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <div className="text-lg mb-1">{meta.icon}</div>
              <div className="text-xl font-bold" style={{ color: meta.color }}>{count}</div>
              <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">{meta.label}</div>
            </div>
          )
        })}
      </div>

      {/* Progress bar */}
      <div className="rounded-xl p-4 bg-white" style={{ border: '1px solid #e2e8f0' }}>
        <div className="flex justify-between text-[10px] text-slate-400 mb-2">
          <span>Pipeline Progress</span>
          <span>{totals} total applications</span>
        </div>
        <div className="flex h-2 rounded-full overflow-hidden gap-0.5 bg-slate-100">
          {stages.map(stage => {
            const meta  = STAGE_META[stage]
            const count = KANBAN[stage]?.length ?? 0
            const pct   = totals > 0 ? (count / totals) * 100 : 0
            return pct > 0 ? (
              <div key={stage} className="h-full transition-all rounded-full"
                style={{ width: `${pct}%`, background: meta.color }} title={`${stage}: ${count}`} />
            ) : null
          })}
        </div>
        <div className="flex gap-4 mt-2 flex-wrap">
          {stages.map(stage => {
            const meta  = STAGE_META[stage]
            const count = KANBAN[stage]?.length ?? 0
            return (
              <span key={stage} className="flex items-center gap-1 text-[10px] text-slate-500">
                <span className="w-2 h-2 rounded-full" style={{ background: meta.color }} />
                {meta.label} ({count})
              </span>
            )
          })}
        </div>
      </div>

      {/* Kanban board */}
      <div className="grid grid-cols-5 gap-3">
        {stages.map(stage => {
          const meta  = STAGE_META[stage]
          const items = KANBAN[stage] ?? []
          return (
            <div key={stage}>
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg mb-2"
                style={{ background: `${meta.color}10`, border: `1px solid ${meta.color}25` }}>
                <span className="text-sm">{meta.icon}</span>
                <span className="text-xs font-bold" style={{ color: meta.color }}>{meta.label}</span>
                <span className="ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                  style={{ background: `${meta.color}20`, color: meta.color }}>
                  {items.length}
                </span>
              </div>
              {items.length === 0 ? (
                <div className="text-center py-6 rounded-lg text-[10px] text-slate-400"
                  style={{ border: '2px dashed #e2e8f0' }}>
                  Empty
                </div>
              ) : (
                items.map((item, i) => <KanbanItem key={i} item={item} color={meta.color} />)
              )}
            </div>
          )
        })}
      </div>

      {/* Tips */}
      <div className="rounded-xl p-4 bg-indigo-50" style={{ border: '1px solid #e0e7ff' }}>
        <p className="text-xs font-semibold text-indigo-700 mb-2">💡 Pro Tips</p>
        <ul className="space-y-1">
          {[
            'Follow up 5–7 days after applying if you haven\'t heard back.',
            'Prepare STAR-format answers for every experience bullet.',
            'Research the company\'s engineering blog before interviews.',
          ].map((tip, i) => (
            <li key={i} className="text-xs text-indigo-700/70 flex gap-2">
              <span className="text-indigo-400 flex-shrink-0">·</span>{tip}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
