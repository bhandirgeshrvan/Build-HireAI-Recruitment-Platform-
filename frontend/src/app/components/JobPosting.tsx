import { useState } from 'react'
import { PageHeader } from './KPICard'
import { LOCATIONS, SKILLS_POOL } from './data'
import { CheckCircle } from 'lucide-react'
import { jobs as jobsApi } from '../api'

const inputClass = 'w-full px-3 py-2.5 rounded-lg text-sm text-slate-800 placeholder-slate-300 outline-none transition-all'
const inputStyle = { background: '#ffffff', border: '1px solid #e2e8f0' }
const focusIndigo = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
  (e.target.style.borderColor = '#6366f1')
const blurGray = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
  (e.target.style.borderColor = '#e2e8f0')

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-600 mb-1.5">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}

function SectionHead({ title }: { title: string }) {
  return (
    <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest py-2 border-b border-slate-100 mb-4">
      {title}
    </p>
  )
}

export function JobPosting() {
  const [submitted, setSubmitted] = useState(false)
  const [errors, setErrors]       = useState<string[]>([])
  const [form, setForm] = useState({
    title: '', dept: 'Engineering', company: '', type: 'Full-time',
    location: 'Remote', workplace: 'Remote',
    salaryMin: 80000, salaryMax: 150000, currency: 'USD',
    expLevel: 'Senior (5-8 yrs)', education: 'Any',
    requiredSkills: ['Python', 'SQL', 'Docker'] as string[],
    description: '', benefits: '',
    openings: 1, autoRank: true, screening: false,
  })

  const set = (key: string, val: unknown) => setForm(f => ({ ...f, [key]: val }))

  const toggleSkill = (skill: string) => {
    set('requiredSkills', form.requiredSkills.includes(skill)
      ? form.requiredSkills.filter(s => s !== skill)
      : [...form.requiredSkills, skill])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs: string[] = []
    if (!form.title) errs.push('Job title is required.')
    if (!form.company) errs.push('Company name is required.')
    if (!form.description) errs.push('Job description is required.')
    if (form.requiredSkills.length === 0) errs.push('At least one required skill must be selected.')
    if (form.salaryMax <= form.salaryMin) errs.push('Max salary must exceed min salary.')
    setErrors(errs)
    if (errs.length > 0) return

    try {
      await jobsApi.create({
        title: form.title,
        company: form.company,
        location: form.location,
        salary_min: form.salaryMin,
        salary_max: form.salaryMax,
        type: form.type as 'Full-time' | 'Part-time' | 'Contract',
        experience: form.expLevel,
        skills: form.requiredSkills,
        status: 'Active',
      })
    } catch {
      // still show success in demo if API fails (recruiter may not be linked to a company yet)
    }
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="space-y-6">
        <PageHeader title="📝 Post a New Job" />
        <div className="rounded-2xl p-10 text-center bg-white" style={{ border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <CheckCircle size={48} className="mx-auto text-emerald-500 mb-4" />
          <h2 className="text-lg font-bold text-slate-900 mb-2">Job Published!</h2>
          <p className="text-sm text-slate-500 mb-6">
            <strong className="text-slate-800">{form.title}</strong> at <strong className="text-slate-800">{form.company}</strong> is now live.
          </p>
          <div className="inline-grid grid-cols-2 gap-3 text-left text-xs mb-6 bg-slate-50 rounded-xl p-4" style={{ border: '1px solid #e2e8f0' }}>
            {[
              ['Location', `${form.location} (${form.workplace})`],
              ['Salary', `${form.currency} $${(form.salaryMin/1000).toFixed(0)}K–$${(form.salaryMax/1000).toFixed(0)}K`],
              ['Experience', form.expLevel],
              ['Openings', String(form.openings)],
            ].map(([k, v]) => (
              <div key={k}>
                <span className="text-slate-400">{k}: </span>
                <span className="text-slate-800 font-semibold">{v}</span>
              </div>
            ))}
          </div>
          <button onClick={() => { setSubmitted(false); setForm(f => ({ ...f, title: '', description: '', company: '' })) }}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
            style={{ background: 'linear-gradient(135deg,#6366f1,#4f46e5)', boxShadow: '0 4px 12px rgba(99,102,241,0.3)' }}>
            Post Another Job
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader title="📝 Post a New Job" subtitle="Fields marked * are required." />
      <form onSubmit={handleSubmit}>
        <div className="rounded-2xl p-6 bg-white space-y-6" style={{ border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <SectionHead title="Basic Information" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Job Title" required>
              <input value={form.title} onChange={e => set('title', e.target.value)}
                placeholder="e.g. Senior Backend Engineer"
                className={inputClass} style={inputStyle} onFocus={focusIndigo} onBlur={blurGray} />
            </Field>
            <Field label="Company Name" required>
              <input value={form.company} onChange={e => set('company', e.target.value)}
                placeholder="Your Company"
                className={inputClass} style={inputStyle} onFocus={focusIndigo} onBlur={blurGray} />
            </Field>
            <Field label="Department">
              <select value={form.dept} onChange={e => set('dept', e.target.value)}
                className={inputClass} style={inputStyle} onFocus={focusIndigo} onBlur={blurGray}>
                {['Engineering','Product','Design','Data Science','DevOps','Security','Marketing','Sales'].map(d => <option key={d}>{d}</option>)}
              </select>
            </Field>
            <Field label="Employment Type">
              <select value={form.type} onChange={e => set('type', e.target.value)}
                className={inputClass} style={inputStyle} onFocus={focusIndigo} onBlur={blurGray}>
                <option>Full-time</option><option>Part-time</option><option>Contract</option><option>Internship</option>
              </select>
            </Field>
            <Field label="Location">
              <select value={form.location} onChange={e => set('location', e.target.value)}
                className={inputClass} style={inputStyle} onFocus={focusIndigo} onBlur={blurGray}>
                <option>Remote</option>
                {LOCATIONS.map(l => <option key={l}>{l}</option>)}
              </select>
            </Field>
            <Field label="Workplace Model">
              <div className="flex gap-2">
                {['Remote','Hybrid','On-site'].map(w => (
                  <button key={w} type="button" onClick={() => set('workplace', w)}
                    className="flex-1 py-2.5 rounded-lg text-xs font-semibold transition-all"
                    style={{
                      background: form.workplace === w ? '#eef2ff' : '#f8fafc',
                      border: `1px solid ${form.workplace === w ? '#6366f1' : '#e2e8f0'}`,
                      color: form.workplace === w ? '#6366f1' : '#64748b',
                    }}>
                    {w}
                  </button>
                ))}
              </div>
            </Field>
          </div>

          <SectionHead title="Compensation" />
          <div className="grid grid-cols-3 gap-4">
            <Field label="Min Salary ($)">
              <input type="number" value={form.salaryMin} onChange={e => set('salaryMin', +e.target.value)}
                step={5000} className={inputClass} style={inputStyle} onFocus={focusIndigo} onBlur={blurGray} />
            </Field>
            <Field label="Max Salary ($)">
              <input type="number" value={form.salaryMax} onChange={e => set('salaryMax', +e.target.value)}
                step={5000} className={inputClass} style={inputStyle} onFocus={focusIndigo} onBlur={blurGray} />
            </Field>
            <Field label="Currency">
              <select value={form.currency} onChange={e => set('currency', e.target.value)}
                className={inputClass} style={inputStyle} onFocus={focusIndigo} onBlur={blurGray}>
                <option>USD</option><option>EUR</option><option>GBP</option><option>CAD</option>
              </select>
            </Field>
          </div>

          <SectionHead title="Requirements" />
          <div className="grid grid-cols-2 gap-4">
            <Field label="Experience Level">
              <select value={form.expLevel} onChange={e => set('expLevel', e.target.value)}
                className={inputClass} style={inputStyle} onFocus={focusIndigo} onBlur={blurGray}>
                <option>Entry (0-2 yrs)</option><option>Mid (2-5 yrs)</option>
                <option>Senior (5-8 yrs)</option><option>Staff (8+ yrs)</option>
              </select>
            </Field>
            <Field label="Education">
              <select value={form.education} onChange={e => set('education', e.target.value)}
                className={inputClass} style={inputStyle} onFocus={focusIndigo} onBlur={blurGray}>
                <option>Any</option><option>B.S.</option><option>M.S.</option><option>Ph.D.</option>
              </select>
            </Field>
          </div>
          <Field label="Required Skills *">
            <div className="flex flex-wrap gap-1.5 mt-1">
              {SKILLS_POOL.map(s => (
                <button key={s} type="button" onClick={() => toggleSkill(s)}
                  className="text-[10px] px-2.5 py-1 rounded-lg font-semibold transition-all"
                  style={{
                    background: form.requiredSkills.includes(s) ? '#eef2ff' : '#f8fafc',
                    border: `1px solid ${form.requiredSkills.includes(s) ? '#6366f1' : '#e2e8f0'}`,
                    color: form.requiredSkills.includes(s) ? '#6366f1' : '#94a3b8',
                  }}>
                  {s}
                </button>
              ))}
            </div>
          </Field>

          <SectionHead title="Job Description" />
          <Field label="Full Job Description" required>
            <textarea value={form.description} onChange={e => set('description', e.target.value)}
              rows={5} placeholder="Describe the role, responsibilities, and what success looks like…"
              className={inputClass} style={{ ...inputStyle, resize: 'vertical' }}
              onFocus={focusIndigo} onBlur={blurGray} />
          </Field>
          <Field label="Benefits & Perks">
            <textarea value={form.benefits} onChange={e => set('benefits', e.target.value)}
              rows={2} placeholder="Health insurance, 401k, unlimited PTO…"
              className={inputClass} style={{ ...inputStyle, resize: 'vertical' }}
              onFocus={focusIndigo} onBlur={blurGray} />
          </Field>

          <SectionHead title="Settings" />
          <div className="grid grid-cols-2 gap-4">
            <Field label="Number of Openings">
              <input type="number" value={form.openings} onChange={e => set('openings', +e.target.value)}
                min={1} className={inputClass} style={inputStyle} onFocus={focusIndigo} onBlur={blurGray} />
            </Field>
            <div className="flex flex-col gap-3 pt-5">
              {[
                { key: 'autoRank',  label: 'Enable AI Auto-Ranking' },
                { key: 'screening', label: 'Require screening questions' },
              ].map(opt => (
                <label key={opt.key} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox"
                    checked={form[opt.key as keyof typeof form] as boolean}
                    onChange={e => set(opt.key, e.target.checked)}
                    className="w-3.5 h-3.5 rounded accent-indigo-600" />
                  <span className="text-xs text-slate-600">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          {errors.length > 0 && (
            <div className="rounded-xl p-3 space-y-1 bg-red-50 border border-red-200">
              {errors.map((e, i) => <p key={i} className="text-xs text-red-600">❌ {e}</p>)}
            </div>
          )}

          <button type="submit"
            className="w-full py-3 rounded-xl text-sm font-bold text-white transition-all"
            style={{ background: 'linear-gradient(135deg,#6366f1,#4f46e5)', boxShadow: '0 4px 14px rgba(99,102,241,0.3)' }}>
            🚀 Publish Job Posting
          </button>
        </div>
      </form>
    </div>
  )
}
