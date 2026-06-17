import { useState } from 'react'
import { Upload, FileText } from 'lucide-react'
import { PageHeader, Tag } from './KPICard'
import { SAMPLE_RESUME } from './data'

const RESUME = SAMPLE_RESUME

type TabKey = 'skills' | 'experience' | 'education' | 'certs'
const TABS: { key: TabKey; label: string }[] = [
  { key: 'skills',     label: '🛠️ Skills'       },
  { key: 'experience', label: '💼 Experience'    },
  { key: 'education',  label: '🎓 Education'     },
  { key: 'certs',      label: '📜 Certifications'},
]

const card = 'bg-white rounded-xl'
const cardStyle = { border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }

function ScoreBar({ label, val }: { label: string; val: number }) {
  const color = val >= 85 ? '#10b981' : val >= 70 ? '#f59e0b' : '#ef4444'
  return (
    <div className="mb-3">
      <div className="flex justify-between text-[10px] mb-1">
        <span className="text-slate-500">{label}</span>
        <span className="font-semibold" style={{ color }}>{val}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-slate-100">
        <div className="h-full rounded-full transition-all duration-700"
          style={{ width: `${val}%`, background: `linear-gradient(90deg, #6366f1, ${color})` }} />
      </div>
    </div>
  )
}

export function ResumeParser() {
  const [parsed, setParsed]   = useState(false)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<TabKey>('skills')

  const handleUpload = async () => {
    setLoading(true)
    await new Promise(r => setTimeout(r, 1500))
    setLoading(false)
    setParsed(true)
  }

  const scoreColor = RESUME.score >= 80 ? '#10b981' : '#f59e0b'

  return (
    <div className="space-y-6">
      <PageHeader title="📄 AI Resume Parser" subtitle="Upload your resume and let AI extract structured insights." />

      {!parsed && (
        <div className="flex flex-col items-center justify-center gap-3 py-14 rounded-xl cursor-pointer transition-all hover:border-indigo-300 hover:bg-indigo-50 bg-white"
          style={{ border: '2px dashed #e2e8f0' }}
          onClick={handleUpload}>
          {loading ? (
            <>
              <div className="w-8 h-8 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
              <p className="text-sm font-medium text-slate-700">Running NLP extraction pipeline…</p>
              <p className="text-xs text-slate-400">This takes about 2 seconds</p>
            </>
          ) : (
            <>
              <Upload size={28} className="text-indigo-400" />
              <p className="text-sm font-medium text-slate-700">Upload Resume (PDF)</p>
              <p className="text-xs text-slate-400">Click to parse sample resume (demo mode)</p>
            </>
          )}
        </div>
      )}

      {parsed && (
        <>
          <div className="text-xs px-3 py-2 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600">
            ℹ️ Demo mode — results below are generated from sample data.
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className={`lg:col-span-2 ${card} p-5`} style={cardStyle}>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0 border border-indigo-100">
                  <FileText size={18} className="text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">{RESUME.name}</h2>
                  <p className="text-xs text-indigo-600 mt-0.5">
                    ✉️ {RESUME.email} · 📞 {RESUME.phone} · 📍 {RESUME.location}
                  </p>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">{RESUME.summary}</p>
                </div>
              </div>
            </div>
            <div className={`${card} p-5 text-center`} style={cardStyle}>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">AI Resume Score</p>
              <div className="text-5xl font-extrabold mb-1" style={{ color: scoreColor }}>{RESUME.score}</div>
              <div className="text-xs font-semibold mb-4" style={{ color: scoreColor }}>Excellent</div>
              {RESUME.breakdown.map(b => <ScoreBar key={b.label} label={b.label} val={b.val} />)}
            </div>
          </div>

          {/* Tabs */}
          <div className={`${card} overflow-hidden`} style={cardStyle}>
            <div className="flex border-b" style={{ borderColor: '#e2e8f0' }}>
              {TABS.map(t => (
                <button key={t.key} onClick={() => setActiveTab(t.key)}
                  className="px-5 py-3 text-xs font-semibold transition-all"
                  style={{
                    color: activeTab === t.key ? '#6366f1' : '#94a3b8',
                    borderBottom: activeTab === t.key ? '2px solid #6366f1' : '2px solid transparent',
                    background: activeTab === t.key ? '#f5f3ff' : 'transparent',
                  }}>
                  {t.label}
                </button>
              ))}
            </div>
            <div className="p-5">
              {activeTab === 'skills' && (
                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Technical Skills</p>
                    <div className="flex flex-wrap">{RESUME.skills.technical.map(s => <Tag key={s} label={s} color="#6366f1" />)}</div>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Soft Skills</p>
                    <div className="flex flex-wrap">{RESUME.skills.soft.map(s => <Tag key={s} label={s} color="#10b981" />)}</div>
                  </div>
                </div>
              )}
              {activeTab === 'experience' && (
                <div className="space-y-4">
                  {RESUME.experience.map(exp => (
                    <div key={exp.title} className="rounded-lg p-4 bg-slate-50"
                      style={{ border: '1px solid #e2e8f0', borderLeft: '3px solid #6366f1' }}>
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="text-sm font-bold text-slate-900">{exp.title}</p>
                          <p className="text-xs text-indigo-600 font-medium">{exp.company}</p>
                        </div>
                        <span className="text-[10px] text-slate-400">{exp.dates}</span>
                      </div>
                      <ul className="space-y-1">
                        {exp.bullets.map((b, i) => (
                          <li key={i} className="text-xs text-slate-600 leading-relaxed flex gap-2">
                            <span className="text-indigo-400 flex-shrink-0 mt-0.5">•</span>{b}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
              {activeTab === 'education' && (
                <div className="space-y-3">
                  {RESUME.education.map(edu => (
                    <div key={edu.degree} className="rounded-lg p-4 bg-slate-50"
                      style={{ border: '1px solid #e2e8f0', borderLeft: '3px solid #8b5cf6' }}>
                      <p className="text-sm font-bold text-slate-900">{edu.degree}</p>
                      <p className="text-xs text-violet-600 font-medium mt-0.5">{edu.school}</p>
                      <p className="text-[10px] text-slate-400 mt-1">Graduated {edu.year} · GPA {edu.gpa}</p>
                    </div>
                  ))}
                </div>
              )}
              {activeTab === 'certs' && (
                <div className="space-y-2">
                  {RESUME.certifications.map(cert => (
                    <div key={cert} className="flex items-center gap-3 px-4 py-3 rounded-lg bg-amber-50"
                      style={{ border: '1px solid #fde68a' }}>
                      <span className="text-amber-500">🏅</span>
                      <span className="text-sm text-slate-800 font-medium">{cert}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
