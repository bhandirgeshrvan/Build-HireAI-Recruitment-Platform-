import { useState, useEffect } from 'react'
import { LOCATIONS, SKILLS_POOL } from './data'
import { CheckCircle, FileText, Rocket, X, PlusCircle, MapPin, DollarSign, Briefcase, GraduationCap } from 'lucide-react'
import { jobs as jobsApi } from '../api'
import { SectionHeader } from './CandidateProfile'
import { useNav } from '../App'

const BASE = import.meta.env.VITE_API_URL ?? ''

const inputClass = 'w-full px-3 py-2.5 rounded-lg text-sm text-slate-800 placeholder-slate-300 outline-none transition-all'
const inputStyle = { background: '#f8fafc', border: '1px solid #e2e8f0' }
const focus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
  (e.target.style.borderColor = '#6366f1')
const blur  = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
  (e.target.style.borderColor = '#e2e8f0')

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-600 mb-1.5">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}

export function JobPosting({ editJobId }: { editJobId?: number }) {
  const { navigate } = useNav()
  const isEdit = !!editJobId
  const [loadingJob, setLoadingJob] = useState(isEdit)
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

  useEffect(() => {
    if (!editJobId) return
    const t = localStorage.getItem('hireai_token')
    fetch(`${BASE}/jobs/${editJobId}`, { headers: t ? { Authorization: `Bearer ${t}` } : {} })
      .then(r => r.json())
      .then(job => setForm(f => ({
        ...f,
        title: job.title ?? '',
        company: job.company ?? '',
        type: job.type ?? 'Full-time',
        location: job.location ?? 'Remote',
        salaryMin: job.salary_min ?? 80000,
        salaryMax: job.salary_max ?? 150000,
        expLevel: job.experience ?? 'Senior (5-8 yrs)',
        requiredSkills: Array.isArray(job.skills) ? job.skills : [],
        description: job.description ?? '',
      })))
      .catch(() => {})
      .finally(() => setLoadingJob(false))
  }, [editJobId])

  const set = (key: string, val: unknown) => setForm(f => ({ ...f, [key]: val }))

  const toggleSkill = (skill: string) =>
    set('requiredSkills', form.requiredSkills.includes(skill)
      ? form.requiredSkills.filter(s => s !== skill)
      : [...form.requiredSkills, skill])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs: string[] = []
    if (!form.title) errs.push('Job title is required.')
    if (!form.company) errs.push('Company name is required.')
    if (!form.description) errs.push('Job description is required.')
    if (form.requiredSkills.length === 0) errs.push('Select at least one required skill.')
    if (form.salaryMax <= form.salaryMin) errs.push('Max salary must exceed min salary.')
    setErrors(errs)
    if (errs.length > 0) return

    try {
      if (isEdit && editJobId) {
        const t = localStorage.getItem('hireai_token')
        const r = await fetch(`${BASE}/jobs/${editJobId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', ...(t ? { Authorization: `Bearer ${t}` } : {}) },
          body: JSON.stringify({
            title: form.title, company: form.company, location: form.location,
            salary_min: form.salaryMin, salary_max: form.salaryMax,
            type: form.type, experience: form.expLevel, skills: form.requiredSkills,
          }),
        })
        if (!r.ok) throw new Error('Update failed')
      } else {
        await jobsApi.create({
          title: form.title, company: form.company, location: form.location,
          salary_min: form.salaryMin, salary_max: form.salaryMax,
          type: form.type as 'Full-time' | 'Part-time' | 'Contract',
          experience: form.expLevel, skills: form.requiredSkills, status: 'Active',
        })
      }
      setSubmitted(true)
    } catch (e: unknown) {
      setErrors([e instanceof Error ? e.message : 'Failed to post job. Please try again.'])
    }
  }

  if (loadingJob) return (
    <div className="flex justify-center py-20">
      <div className="w-8 h-8 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
    </div>
  )

  if (submitted) return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <FileText size={20} className="text-indigo-600" /> Post a New Job
        </h1>
      </div>
      <div className="bg-white rounded-xl p-10 text-center" style={{ border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <div className="w-16 h-16 rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={32} className="text-emerald-500" />
        </div>
        <h2 className="text-lg font-bold text-slate-900 mb-2">{isEdit ? 'Job Updated!' : 'Job Published!'}</h2>
        <p className="text-sm text-slate-500 mb-6">
          <span className="font-semibold text-slate-800">{form.title}</span> at{' '}
          <span className="font-semibold text-slate-800">{form.company}</span> {isEdit ? 'has been updated.' : 'is now live.'}
        </p>
        <div className="inline-grid grid-cols-2 gap-3 text-left text-xs mb-6 rounded-xl p-4"
          style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
          {[
            ['Location', `${form.location} (${form.workplace})`],
            ['Salary', `${form.currency} $${(form.salaryMin / 1000).toFixed(0)}K – $${(form.salaryMax / 1000).toFixed(0)}K`],
            ['Experience', form.expLevel],
            ['Openings', String(form.openings)],
          ].map(([k, v]) => (
            <div key={k}>
              <span className="text-slate-400">{k}: </span>
              <span className="text-slate-800 font-semibold">{v}</span>
            </div>
          ))}
        </div>
        <button
          onClick={() => isEdit
            ? navigate('manage-jobs')
            : (setSubmitted(false), setForm(f => ({ ...f, title: '', description: '', company: '' })))
          }
          className="px-5 py-2.5 rounded-xl text-sm font-bold text-white flex items-center gap-2 mx-auto"
          style={{ background: 'linear-gradient(135deg,#6366f1,#4f46e5)', boxShadow: '0 4px 12px rgba(99,102,241,0.3)' }}>
          {isEdit ? <><FileText size={15} /> Back to Manage Jobs</> : <><PlusCircle size={15} /> Post Another Job</>}
        </button>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <FileText size={20} className="text-indigo-600" /> {isEdit ? 'Edit Job Posting' : 'Post a New Job'}
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">{isEdit ? `Editing: ${form.title || '\u2026'}` : 'Fields marked * are required.'}</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-xl p-6 space-y-8" style={{ border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>

          {/* Basic Info */}
          <section>
            <SectionHeader icon={<Briefcase size={16} />} label="Basic Information" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Job Title" required>
                <input value={form.title} onChange={e => set('title', e.target.value)}
                  placeholder="e.g. Senior Backend Engineer"
                  className={inputClass} style={inputStyle} onFocus={focus} onBlur={blur} />
              </Field>
              <Field label="Company Name" required>
                <input value={form.company} onChange={e => set('company', e.target.value)}
                  placeholder="Your Company"
                  className={inputClass} style={inputStyle} onFocus={focus} onBlur={blur} />
              </Field>
              <Field label="Department">
                <select value={form.dept} onChange={e => set('dept', e.target.value)}
                  className={inputClass} style={inputStyle} onFocus={focus} onBlur={blur}>
                  {['Engineering', 'Product', 'Design', 'Data Science', 'DevOps', 'Security', 'Marketing', 'Sales']
                    .map(d => <option key={d}>{d}</option>)}
                </select>
              </Field>
              <Field label="Employment Type">
                <select value={form.type} onChange={e => set('type', e.target.value)}
                  className={inputClass} style={inputStyle} onFocus={focus} onBlur={blur}>
                  <option>Full-time</option><option>Part-time</option>
                  <option>Contract</option><option>Internship</option>
                </select>
              </Field>
              <Field label="Location">
                <div className="relative">
                  <MapPin size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <select value={form.location} onChange={e => set('location', e.target.value)}
                    className={`${inputClass} pl-8`} style={inputStyle} onFocus={focus} onBlur={blur}>
                    <option>Remote</option>
                    {LOCATIONS.map(l => <option key={l}>{l}</option>)}
                  </select>
                </div>
              </Field>
              <Field label="Workplace Model">
                <div className="flex gap-2">
                  {['Remote', 'Hybrid', 'On-site'].map(w => (
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
          </section>

          {/* Compensation */}
          <section>
            <SectionHeader icon={<DollarSign size={16} />} label="Compensation" />
            <div className="grid grid-cols-3 gap-4">
              <Field label="Min Salary">
                <input type="number" value={form.salaryMin} onChange={e => set('salaryMin', +e.target.value)}
                  step={5000} className={inputClass} style={inputStyle} onFocus={focus} onBlur={blur} />
              </Field>
              <Field label="Max Salary">
                <input type="number" value={form.salaryMax} onChange={e => set('salaryMax', +e.target.value)}
                  step={5000} className={inputClass} style={inputStyle} onFocus={focus} onBlur={blur} />
              </Field>
              <Field label="Currency">
                <select value={form.currency} onChange={e => set('currency', e.target.value)}
                  className={inputClass} style={inputStyle} onFocus={focus} onBlur={blur}>
                  <option>USD</option><option>EUR</option><option>GBP</option><option>CAD</option><option>INR</option>
                </select>
              </Field>
            </div>
          </section>

          {/* Requirements */}
          <section>
            <SectionHeader icon={<GraduationCap size={16} />} label="Requirements" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <Field label="Experience Level">
                <select value={form.expLevel} onChange={e => set('expLevel', e.target.value)}
                  className={inputClass} style={inputStyle} onFocus={focus} onBlur={blur}>
                  <option>Entry (0-2 yrs)</option><option>Mid (2-5 yrs)</option>
                  <option>Senior (5-8 yrs)</option><option>Staff (8+ yrs)</option>
                </select>
              </Field>
              <Field label="Education">
                <select value={form.education} onChange={e => set('education', e.target.value)}
                  className={inputClass} style={inputStyle} onFocus={focus} onBlur={blur}>
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
              {form.requiredSkills.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2 pt-2 border-t border-slate-100">
                  {form.requiredSkills.map(s => (
                    <span key={s} className="flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {s}
                      <button type="button" onClick={() => toggleSkill(s)} className="text-indigo-400 hover:text-indigo-700">
                        <X size={9} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </Field>
          </section>

          {/* Description */}
          <section>
            <SectionHeader icon={<FileText size={16} />} label="Job Description" />
            <div className="space-y-4">
              <Field label="Full Job Description" required>
                <textarea value={form.description} onChange={e => set('description', e.target.value)}
                  rows={5} placeholder="Describe the role, responsibilities, and what success looks like…"
                  className={inputClass} style={{ ...inputStyle, resize: 'vertical' }}
                  onFocus={focus} onBlur={blur} />
              </Field>
              <Field label="Benefits & Perks">
                <textarea value={form.benefits} onChange={e => set('benefits', e.target.value)}
                  rows={2} placeholder="Health insurance, 401k, unlimited PTO…"
                  className={inputClass} style={{ ...inputStyle, resize: 'vertical' }}
                  onFocus={focus} onBlur={blur} />
              </Field>
            </div>
          </section>

          {/* Settings */}
          <section>
            <SectionHeader icon={<Rocket size={16} />} label="Settings" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Number of Openings">
                <input type="number" value={form.openings} onChange={e => set('openings', +e.target.value)}
                  min={1} className={inputClass} style={inputStyle} onFocus={focus} onBlur={blur} />
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
          </section>

          {/* Errors */}
          {errors.length > 0 && (
            <div className="rounded-xl p-4 space-y-1.5 bg-red-50 border border-red-200">
              {errors.map((e, i) => (
                <p key={i} className="text-xs text-red-600 flex items-center gap-1.5">
                  <X size={12} className="flex-shrink-0" /> {e}
                </p>
              ))}
            </div>
          )}

          {/* Submit */}
          <div className="pt-2 border-t border-slate-100">
            <button type="submit"
              className="w-full py-3.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-all"
              style={{ background: 'linear-gradient(135deg,#6366f1,#4f46e5)', boxShadow: '0 4px 14px rgba(99,102,241,0.3)' }}>
              <Rocket size={15} /> {isEdit ? 'Save Changes' : 'Publish Job Posting'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
