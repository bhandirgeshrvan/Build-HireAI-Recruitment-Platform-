import { useState } from 'react'
import {
  FileText, CheckCircle, AlertCircle, Zap,
  RotateCcw, ScanText, X, TrendingUp, TrendingDown,
  ChevronDown, Lightbulb, ShieldCheck, BarChart2,
} from 'lucide-react'
import { Tag } from './KPICard'
import { resume as resumeApi } from '../api'
import type { ATSResult } from '../api'
import { cardClass, cardStyle, Dropzone } from './CandidateProfile'

// ── Step badge ────────────────────────────────────────────────────────────
function StepBadge({ n, label }: { n: number; label: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
        style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
        {n}
      </span>
      <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">{label}</span>
    </div>
  )
}

function OptionalBadge() {
  return (
    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full ml-2"
      style={{ background: '#f1f5f9', color: '#94a3b8', border: '1px solid #e2e8f0' }}>
      Optional
    </span>
  )
}

// ── Upload card ────────────────────────────────────────────────────────────
function ResumeUploadCard({ file, onFile }: { file: File | null; onFile: (f: File | null) => void }) {
  return (
    <div className={`${cardClass} p-5`} style={cardStyle}>
      <StepBadge n={1} label="Upload Resume" />
      {file ? (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl"
          style={{ background: '#ecfdf5', border: '1px solid #6ee7b7' }}>
          <CheckCircle size={16} className="text-emerald-500 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-emerald-700 truncate">{file.name}</p>
            <p className="text-[10px] text-emerald-500 mt-0.5">{(file.size / 1024).toFixed(0)} KB · Ready to analyze</p>
          </div>
          <button onClick={() => onFile(null)}
            className="text-slate-400 hover:text-red-500 transition-colors p-1 rounded">
            <X size={13} />
          </button>
        </div>
      ) : (
        <Dropzone onFile={f => onFile(f)} />
      )}
    </div>
  )
}

// ── Job description card ───────────────────────────────────────────────────
function JobDescriptionCard({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className={`${cardClass} p-5`} style={cardStyle}>
      <div className="flex items-center mb-3">
        <StepBadge n={2} label="Job Description" />
        <OptionalBadge />
      </div>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        rows={7}
        placeholder="Paste the job description here to get a tailored score and see exactly which keywords are missing…"
        className="w-full px-3 py-2.5 rounded-xl text-sm text-slate-700 placeholder-slate-300 outline-none resize-none leading-relaxed"
        style={{ border: '1px solid #e2e8f0', background: '#f8fafc' }}
        onFocus={e => (e.target.style.borderColor = '#6366f1')}
        onBlur={e => (e.target.style.borderColor = '#e2e8f0')}
      />
      {value.length > 0 && (
        <p className="text-[10px] text-slate-400 mt-1.5 text-right">{value.length} chars</p>
      )}
    </div>
  )
}

// ── Analyze button ────────────────────────────────────────────────────────
function AnalyzeButton({ disabled, loading, onClick }: { disabled: boolean; loading: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className="w-full py-3.5 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      style={{
        background: 'linear-gradient(135deg,#6366f1,#4f46e5)',
        boxShadow: disabled ? 'none' : '0 4px 16px rgba(99,102,241,0.3)',
      }}>
      {loading ? (
        <>
          <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
          Analysing with AI…
        </>
      ) : (
        <><Zap size={15} /> Analyse Resume</>
      )}
    </button>
  )
}

// ── Score ring ────────────────────────────────────────────────────────────
function ScoreRing({ score }: { score: number }) {
  const color = score >= 75 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444'
  const label = score >= 75 ? 'Excellent' : score >= 50 ? 'Needs Work' : 'Poor'
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-28 h-28">
        <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
          <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e2e8f0" strokeWidth="3" />
          <circle cx="18" cy="18" r="15.9" fill="none"
            stroke={color} strokeWidth="3"
            strokeDasharray={`${score} ${100 - score}`} strokeLinecap="round"
            style={{ transition: 'stroke-dasharray 0.8s ease' }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-extrabold" style={{ color }}>{score}</span>
          <span className="text-[9px] text-slate-400 font-semibold">/ 100</span>
        </div>
      </div>
      <span className="mt-2 text-[11px] font-bold px-3 py-1 rounded-full"
        style={{ background: `${color}15`, color }}>{label}</span>
    </div>
  )
}

// ── Score bar ─────────────────────────────────────────────────────────────
function ScoreBar({ label, val }: { label: string; val: number }) {
  const color = val >= 75 ? '#10b981' : val >= 50 ? '#f59e0b' : '#ef4444'
  return (
    <div className="mb-3 last:mb-0">
      <div className="flex justify-between text-[11px] mb-1">
        <span className="text-slate-500 font-medium">{label}</span>
        <span className="font-bold" style={{ color }}>{val}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-slate-100">
        <div className="h-full rounded-full transition-all duration-700"
          style={{ width: `${val}%`, background: `linear-gradient(90deg,#6366f1,${color})` }} />
      </div>
    </div>
  )
}

// ── Results panel ─────────────────────────────────────────────────────────
function ResultsPanel({ result, onReset }: { result: ATSResult; onReset: () => void }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className={`${cardClass} p-6 flex flex-col items-center justify-center`} style={cardStyle}>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">ATS Score</p>
          <ScoreRing score={result.ats_score} />
          <p className="text-[11px] text-slate-500 text-center mt-4 leading-relaxed">{result.summary}</p>
          <div className="flex items-center gap-1.5 mt-3 text-[10px] text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full border border-indigo-100">
            <FileText size={10} /> {result.filename}
          </div>
        </div>
        <div className={`lg:col-span-2 ${cardClass} p-6`} style={cardStyle}>
          <p className="text-xs font-bold text-slate-900 mb-4 flex items-center gap-2">
            <BarChart2 size={14} className="text-indigo-600" /> Score Breakdown
          </p>
          <ScoreBar label="Keyword Match"          val={result.breakdown.keyword_match} />
          <ScoreBar label="Formatting & Structure" val={result.breakdown.formatting} />
          <ScoreBar label="Experience Relevance"   val={result.breakdown.experience_relevance} />
          <ScoreBar label="Skills Coverage"        val={result.breakdown.skills_coverage} />
          <ScoreBar label="Education Fit"          val={result.breakdown.education_fit} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className={`${cardClass} p-5`} style={cardStyle}>
          <p className="text-xs font-bold text-slate-900 mb-3 flex items-center gap-2">
            <ShieldCheck size={14} className="text-emerald-500" /> Strengths
          </p>
          <ul className="space-y-2">
            {result.strengths.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                <TrendingUp size={12} className="text-emerald-500 mt-0.5 flex-shrink-0" />{s}
              </li>
            ))}
          </ul>
        </div>
        <div className={`${cardClass} p-5`} style={cardStyle}>
          <p className="text-xs font-bold text-slate-900 mb-3 flex items-center gap-2">
            <Lightbulb size={14} className="text-amber-500" /> How to Improve
          </p>
          <ul className="space-y-2">
            {result.improvements.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                <TrendingDown size={12} className="text-amber-500 mt-0.5 flex-shrink-0" />{s}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {result.missing_keywords.length > 0 && (
          <div className={`${cardClass} p-5`} style={cardStyle}>
            <p className="text-xs font-bold text-slate-900 mb-3 flex items-center gap-2">
              <ChevronDown size={14} className="text-red-400" /> Missing Keywords
            </p>
            <div className="flex flex-wrap gap-1.5">
              {result.missing_keywords.map(k => (
                <span key={k} className="text-[10px] px-2.5 py-1 rounded-full font-semibold"
                  style={{ background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca' }}>
                  {k}
                </span>
              ))}
            </div>
          </div>
        )}
        {result.skills_found.length > 0 && (
          <div className={`${cardClass} p-5`} style={cardStyle}>
            <p className="text-xs font-bold text-slate-900 mb-3 flex items-center gap-2">
              <CheckCircle size={14} className="text-indigo-500" /> Skills Detected
            </p>
            <div className="flex flex-wrap">
              {result.skills_found.map(s => <Tag key={s} label={s} color="#6366f1" />)}
            </div>
          </div>
        )}
      </div>

      <button onClick={onReset}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-indigo-600 border border-indigo-200 hover:bg-indigo-50 transition-all">
        <RotateCcw size={13} /> Analyze Another Resume
      </button>
    </div>
  )
}

// ── Page component ────────────────────────────────────────────────────────
export function ResumeParser() {
  const [file, setFile]       = useState<File | null>(null)
  const [jobDesc, setJobDesc] = useState('')
  const [result, setResult]   = useState<ATSResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const handleAnalyze = async () => {
    if (!file) return
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const data = await resumeApi.atsCheck(file, jobDesc)
      setResult(data)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Analysis failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const reset = () => { setFile(null); setResult(null); setError(''); setJobDesc('') }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <ScanText size={20} className="text-indigo-600" /> Resume Analyzer
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Upload your resume and get an AI-powered ATS score with tailored improvement suggestions.
        </p>
      </div>

      {!result ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ResumeUploadCard file={file} onFile={setFile} />
            <JobDescriptionCard value={jobDesc} onChange={setJobDesc} />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-xs text-red-600 px-4 py-3 rounded-xl bg-red-50 border border-red-100">
              <AlertCircle size={14} className="flex-shrink-0" /> {error}
            </div>
          )}

          <AnalyzeButton disabled={!file} loading={loading} onClick={handleAnalyze} />

          {/* Results placeholder — shown until analysis runs */}
          {!loading && (
            <div className={`${cardClass} p-5`} style={{ ...cardStyle, opacity: 0.45 }}>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <BarChart2 size={13} /> Analysis Results
              </p>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full border-4 border-dashed border-slate-200 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-slate-300">–%</span>
                </div>
                <div className="flex-1 space-y-2">
                  {['Keyword Match', 'Formatting', 'Skills Coverage'].map(l => (
                    <div key={l}>
                      <div className="flex justify-between text-[10px] text-slate-300 mb-1">
                        <span>{l}</span><span>–%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-slate-100" />
                    </div>
                  ))}
                </div>
              </div>
              <p className="text-[11px] text-slate-400 text-center mt-4">
                Upload a resume and click Analyse to see your full ATS report here.
              </p>
            </div>
          )}
        </div>
      ) : (
        <ResultsPanel result={result} onReset={reset} />
      )}
    </div>
  )
}
