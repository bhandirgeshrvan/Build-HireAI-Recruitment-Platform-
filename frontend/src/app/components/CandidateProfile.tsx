import { useState, useEffect } from 'react'
import {
  User, Mail, Phone, MapPin, Briefcase, GraduationCap, DollarSign,
  Linkedin, Github, Save, X, BarChart3, Check, Plus, FileText,
  Upload, AlertCircle, RotateCcw, Zap,
} from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { resume as resumeApi } from '../api'

const BASE = import.meta.env.VITE_API_URL ?? ''

// ── Shared design primitives ──────────────────────────────────────────────
// These are the canonical tokens — reuse in ResumeAnalyzer and other pages.
export const cardClass = 'bg-white rounded-xl'
export const cardStyle = { border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }

export function SectionHeader({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
      <span className="text-indigo-600">{icon}</span>
      <h3 className="text-sm font-bold text-slate-900">{label}</h3>
    </div>
  )
}

export function FieldLabel({ icon, children }: { icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <label className="text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1.5 block">
      {icon && <span className="text-slate-400">{icon}</span>}
      {children}
    </label>
  )
}

export function SkillPill({ label, onRemove }: { label: string; onRemove?: () => void }) {
  return (
    <span className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
      {label}
      {onRemove && (
        <button onClick={onRemove} className="ml-0.5 text-indigo-400 hover:text-indigo-700 transition-colors">
          <X size={10} />
        </button>
      )}
    </span>
  )
}

// ── Shared Dropzone — also used by ResumeParser ──────────────────────────
export function Dropzone({
  onFile, accept = '.pdf,.docx', maxMb = 10, compact = false,
}: {
  onFile: (f: File) => void
  accept?: string
  maxMb?: number
  compact?: boolean
}) {
  const [dragging, setDragging] = useState(false)
  const [err, setErr] = useState('')

  const validate = (f: File): string => {
    if (!f.name.match(/\.(pdf|docx)$/i)) return 'Only PDF or DOCX files are accepted.'
    if (f.size > maxMb * 1024 * 1024) return `File must be under ${maxMb} MB.`
    return ''
  }

  const handle = (f: File | undefined) => {
    if (!f) return
    const e = validate(f)
    if (e) { setErr(e); return }
    setErr('')
    onFile(f)
  }

  return (
    <div>
      <label
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); handle(e.dataTransfer.files?.[0]) }}
        className={`flex ${compact ? 'flex-row items-center gap-3 px-4 py-3' : 'flex-col items-center gap-3 py-6'} rounded-xl cursor-pointer transition-all`}
        style={{
          border: `2px dashed ${dragging ? '#6366f1' : err ? '#fca5a5' : '#e2e8f0'}`,
          background: dragging ? '#eef2ff' : err ? '#fef2f2' : '#f8fafc',
        }}>
        <div className={`${compact ? 'w-8 h-8' : 'w-10 h-10'} rounded-xl flex items-center justify-center flex-shrink-0`}
          style={{ background: 'linear-gradient(135deg,#eef2ff,#e0e7ff)' }}>
          <Upload size={compact ? 14 : 18} className="text-indigo-500" />
        </div>
        <div className={compact ? '' : 'text-center'}>
          <p className="text-sm font-semibold text-slate-700">
            Drop here or{' '}
            <span className="text-indigo-600 underline underline-offset-2">browse files</span>
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">PDF or DOCX · Max {maxMb} MB</p>
        </div>
        <input type="file" accept={accept} className="hidden"
          onChange={e => handle(e.target.files?.[0])} />
      </label>
      {err && (
        <p className="flex items-center gap-1.5 text-[11px] text-red-500 mt-1.5">
          <AlertCircle size={11} /> {err}
        </p>
      )}
    </div>
  )
}

// ── API helpers ──────────────────────────────────────────────────────────
function apiFetch(path: string, options?: RequestInit) {
  const t = localStorage.getItem('hireai_token')
  return fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      ...options?.headers,
      ...(t ? { Authorization: `Bearer ${t}` } : {}),
      'Content-Type': 'application/json',
    },
  }).then(r => r.json())
}

// ── Resume upload section ────────────────────────────────────────────────
function ResumeSection({
  resumePath, onUploaded,
}: { resumePath: string | null; onUploaded: (path: string) => void }) {
  const [uploading, setUploading] = useState(false)
  const [uploadErr, setUploadErr] = useState('')
  const [confirmRemove, setConfirmRemove] = useState(false)
  const [localPath, setLocalPath] = useState<string | null>(resumePath)

  const hasResume = !!localPath

  // Extract a readable filename from an S3 URL or plain path
  const fileName = localPath
    ? (localPath.split('/').pop()?.split('?')[0] ?? 'resume')
    : null

  const handleUpload = async (file: File) => {
    setUploading(true)
    setUploadErr('')
    try {
      const result = await resumeApi.upload(file)
      const path = result.file_path ?? localPath ?? ''
      setLocalPath(path)
      onUploaded(path)
    } catch (e: unknown) {
      setUploadErr(e instanceof Error ? e.message : 'Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const handleRemove = () => {
    setLocalPath(null)
    onUploaded('')
    setConfirmRemove(false)
  }

  return (
    <div>
      <SectionHeader icon={<FileText size={16} />} label="Resume" />

      {uploading ? (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-indigo-50 border border-indigo-200">
          <div className="w-4 h-4 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin flex-shrink-0" />
          <span className="text-xs text-indigo-700 font-medium">Uploading…</span>
        </div>
      ) : hasResume ? (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl"
          style={{ background: '#ecfdf5', border: '1px solid #6ee7b7' }}>
          <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: '#d1fae5', border: '1px solid #a7f3d0' }}>
            <FileText size={16} className="text-emerald-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-emerald-800 truncate">{fileName}</p>
            <p className="text-[10px] text-emerald-600 mt-0.5">Resume on file · ready for analysis</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <label className="text-[11px] font-semibold text-indigo-600 hover:underline cursor-pointer">
              Replace
              <input type="file" accept=".pdf,.docx" className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) handleUpload(f) }} />
            </label>
            {confirmRemove ? (
              <span className="flex items-center gap-1.5">
                <button onClick={handleRemove}
                  className="text-[11px] font-semibold text-red-600 hover:underline">Confirm</button>
                <button onClick={() => setConfirmRemove(false)}
                  className="text-[11px] text-slate-400 hover:text-slate-600">Cancel</button>
              </span>
            ) : (
              <button onClick={() => setConfirmRemove(true)}
                className="text-slate-400 hover:text-red-500 transition-colors p-1 rounded">
                <X size={13} />
              </button>
            )}
          </div>
        </div>
      ) : (
        <Dropzone onFile={handleUpload} compact />
      )}

      {uploadErr && (
        <p className="flex items-center gap-1.5 text-[11px] text-red-500 mt-1.5">
          <AlertCircle size={11} /> {uploadErr}
        </p>
      )}
    </div>
  )
}

// ── Profile Strength card ────────────────────────────────────────────────
function ProfileStrength({ items }: { items: { label: string; done: boolean }[] }) {
  const score = Math.round((items.filter(i => i.done).length / items.length) * 100)
  const color = score >= 80 ? '#10b981' : score >= 50 ? '#f59e0b' : '#6366f1'
  const label = score >= 80 ? 'Strong' : score >= 50 ? 'Good' : 'Getting started'

  return (
    <div className={`${cardClass} p-6`} style={cardStyle}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <BarChart3 size={16} className="text-indigo-600" /> Profile Strength
        </h3>
        <span className="text-[11px] font-bold px-2.5 py-1 rounded-full"
          style={{ background: `${color}15`, color }}>{label}</span>
      </div>

      {/* Progress bar */}
      <div className="mb-5">
        <div className="flex justify-between text-[11px] mb-1.5">
          <span className="text-slate-500">Completion</span>
          <span className="font-bold" style={{ color }}>{score}%</span>
        </div>
        <div className="h-2 rounded-full bg-slate-100">
          <div className="h-full rounded-full transition-all duration-700"
            style={{ width: `${score}%`, background: `linear-gradient(90deg,#6366f1,${color})` }} />
        </div>
      </div>

      {/* Checklist — 2 columns */}
      <div className="grid grid-cols-2 gap-x-6 gap-y-2">
        {items.map(item => (
          <div key={item.label} className="flex items-center gap-2">
            {item.done
              ? <Check size={13} className="text-emerald-500 flex-shrink-0" />
              : <span className="w-3.5 h-3.5 rounded-full border-2 border-slate-300 flex-shrink-0" />}
            <span className={`text-xs ${item.done ? 'text-slate-500' : 'text-slate-700 font-medium'}`}>
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Main page ────────────────────────────────────────────────────────────
export function CandidateProfile() {
  const [profile, setProfile]       = useState<any>(null)
  const [loading, setLoading]       = useState(true)
  const [saving, setSaving]         = useState(false)
  const [message, setMessage]       = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [resumePath, setResumePath] = useState<string | null>(null)

  // Form state
  const [name, setName]         = useState('')
  const [email, setEmail]       = useState('')
  const [phone, setPhone]       = useState('')
  const [linkedin, setLinkedin] = useState('')
  const [github, setGithub]     = useState('')
  const [role, setRole]         = useState('')
  const [experience, setExperience] = useState(0)
  const [education, setEducation]   = useState('')
  const [location, setLocation]     = useState('')
  const [salaryExp, setSalaryExp]   = useState<number | ''>(0)
  const [skills, setSkills]         = useState<string[]>([])
  const [skillInput, setSkillInput] = useState('')

  useEffect(() => {
    apiFetch('/candidates/me')
      .then(data => {
        setProfile(data)
        setName(data.name || '')
        setEmail(data.email || '')
        setPhone(data.phone || '')
        setLinkedin(data.linkedin || '')
        setGithub(data.github || '')
        setRole(data.role || '')
        setExperience(data.experience || 0)
        setEducation(data.education || '')
        setLocation(data.location || '')
        setSalaryExp(data.salary_exp || '')
        setSkills(Array.isArray(data.skills) ? data.skills : [])
        setResumePath(data.resume_path || null)
      })
      .catch(() => setMessage({ type: 'error', text: 'Failed to load profile' }))
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    setMessage(null)
    try {
      const updated = await apiFetch('/candidates/me', {
        method: 'PUT',
        body: JSON.stringify({
          name, phone, linkedin, github, role,
          experience: Number(experience),
          education, location,
          salary_exp: Number(salaryExp) || 0,
          skills,
        }),
      })
      setProfile(updated)
      setMessage({ type: 'success', text: 'Profile updated successfully!' })
      setTimeout(() => setMessage(null), 3000)
    } catch {
      setMessage({ type: 'error', text: 'Failed to update profile.' })
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    if (!profile) return
    setName(profile.name || '')
    setEmail(profile.email || '')
    setPhone(profile.phone || '')
    setLinkedin(profile.linkedin || '')
    setGithub(profile.github || '')
    setRole(profile.role || '')
    setExperience(profile.experience || 0)
    setEducation(profile.education || '')
    setLocation(profile.location || '')
    setSalaryExp(profile.salary_exp || '')
    setSkills(Array.isArray(profile.skills) ? profile.skills : [])
    setMessage(null)
  }

  const strengthItems = [
    { label: 'Full name',       done: !!name },
    { label: 'Phone',           done: !!phone },
    { label: 'Location',        done: !!location },
    { label: 'Current role',    done: !!role },
    { label: 'Experience',      done: experience > 0 },
    { label: 'Education',       done: !!education },
    { label: 'LinkedIn',        done: !!linkedin },
    { label: 'GitHub',          done: !!github },
    { label: 'Skills added',    done: skills.length > 0 },
    { label: 'Expected salary', done: !!salaryExp && Number(salaryExp) > 0 },
    { label: 'Resume uploaded', done: !!resumePath },
  ]

  if (loading) return (
    <div className="flex justify-center py-12">
      <div className="w-8 h-8 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <User size={20} className="text-indigo-600" /> My Profile
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Manage your personal information and professional details.
        </p>
      </div>

      {/* Toast */}
      {message && (
        <div className={`px-4 py-3 rounded-xl border text-sm font-medium flex items-center gap-2 ${
          message.type === 'success'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
            : 'bg-red-50 border-red-200 text-red-700'
        }`}>
          {message.type === 'success'
            ? <Check size={14} />
            : <AlertCircle size={14} />}
          {message.text}
        </div>
      )}

      {/* Main card */}
      <div className={`${cardClass} p-6`} style={cardStyle}>
        <div className="space-y-8">

          {/* Contact Information */}
          <section>
            <SectionHeader icon={<User size={16} />} label="Contact Information" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <FieldLabel icon={<User size={11} />}>Full Name</FieldLabel>
                <Input value={name} onChange={e => setName(e.target.value)}
                  placeholder="John Doe" className="text-sm" />
              </div>
              <div>
                <FieldLabel icon={<Mail size={11} />}>
                  Email <span className="text-slate-400 font-normal">(read-only)</span>
                </FieldLabel>
                <Input value={email} disabled placeholder="john@example.com"
                  className="text-sm bg-slate-50 text-slate-400" />
              </div>
              <div>
                <FieldLabel icon={<Phone size={11} />}>Phone</FieldLabel>
                <Input value={phone} onChange={e => setPhone(e.target.value)}
                  placeholder="+1 (555) 123-4567" className="text-sm" />
              </div>
              <div>
                <FieldLabel icon={<MapPin size={11} />}>Location</FieldLabel>
                <Input value={location} onChange={e => setLocation(e.target.value)}
                  placeholder="San Francisco, CA" className="text-sm" />
              </div>
            </div>
          </section>

          {/* Resume */}
          <section>
            <ResumeSection
              resumePath={resumePath}
              onUploaded={path => setResumePath(path || null)}
            />
          </section>

          {/* Professional Details */}
          <section>
            <SectionHeader icon={<Briefcase size={16} />} label="Professional Details" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <FieldLabel icon={<Briefcase size={11} />}>Current Role</FieldLabel>
                <Input value={role} onChange={e => setRole(e.target.value)}
                  placeholder="Software Engineer" className="text-sm" />
              </div>
              <div>
                <FieldLabel>Years of Experience</FieldLabel>
                <Input type="number" value={experience}
                  onChange={e => setExperience(Number(e.target.value))}
                  placeholder="0" min="0" className="text-sm" />
              </div>
              <div>
                <FieldLabel icon={<GraduationCap size={11} />}>Education</FieldLabel>
                <Input value={education} onChange={e => setEducation(e.target.value)}
                  placeholder="Bachelor's in Computer Science" className="text-sm" />
              </div>
              <div>
                <FieldLabel icon={<DollarSign size={11} />}>Expected Salary</FieldLabel>
                <Input type="number" value={salaryExp}
                  onChange={e => setSalaryExp(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="Not set" min="0" className="text-sm" />
              </div>
            </div>
          </section>

          {/* Social Profiles */}
          <section>
            <SectionHeader icon={<Linkedin size={16} />} label="Social Profiles" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <FieldLabel icon={<Linkedin size={11} />}>LinkedIn</FieldLabel>
                <Input value={linkedin} onChange={e => setLinkedin(e.target.value)}
                  placeholder="https://linkedin.com/in/johndoe" className="text-sm" />
              </div>
              <div>
                <FieldLabel icon={<Github size={11} />}>GitHub</FieldLabel>
                <Input value={github} onChange={e => setGithub(e.target.value)}
                  placeholder="https://github.com/johndoe" className="text-sm" />
              </div>
            </div>
          </section>

          {/* Skills */}
          <section>
            <SectionHeader icon={<Zap size={16} />} label="Skills" />
            <div className="flex flex-wrap gap-2 mb-3 min-h-[32px]">
              {skills.map(skill => (
                <SkillPill key={skill} label={skill} onRemove={() => setSkills(skills.filter(s => s !== skill))} />
              ))}
              {skills.length === 0 && (
                <span className="text-xs text-slate-400 italic">No skills added yet</span>
              )}
            </div>
            <div className="flex gap-2 max-w-sm">
              <Input
                value={skillInput}
                onChange={e => setSkillInput(e.target.value)}
                onKeyDown={e => {
                  if ((e.key === 'Enter' || e.key === ',') && skillInput.trim()) {
                    e.preventDefault()
                    const s = skillInput.trim().replace(/,$/, '')
                    if (s && !skills.includes(s)) setSkills([...skills, s])
                    setSkillInput('')
                  }
                }}
                placeholder="Type a skill and press Enter"
                className="text-sm"
              />
              <Button variant="outline" size="sm"
                className="flex items-center gap-1 shrink-0"
                onClick={() => {
                  const s = skillInput.trim()
                  if (s && !skills.includes(s)) setSkills([...skills, s])
                  setSkillInput('')
                }}>
                <Plus size={13} /> Add
              </Button>
            </div>
          </section>

          {/* Action buttons */}
          <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-6 h-9 flex items-center gap-2">
              {saving ? (
                <>
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  Saving…
                </>
              ) : (
                <><Save size={13} /> Save Changes</>
              )}
            </Button>
            <Button
              onClick={handleReset}
              disabled={saving}
              variant="outline"
              className="text-sm px-6 h-9 flex items-center gap-2">
              <RotateCcw size={13} /> Reset
            </Button>
          </div>
        </div>
      </div>

      {/* Profile Strength */}
      <ProfileStrength items={strengthItems} />
    </div>
  )
}
