import { useState } from 'react'
import { X, Upload, Zap, CheckCircle } from 'lucide-react'
import type { Job } from '../api'
import { applications, resume as resumeApi } from '../api'

interface Props {
  job: Job
  onClose: () => void
  onSuccess: (jobId: number) => void
}

export function ApplyModal({ job, onClose, onSuccess }: Props) {
  const [step, setStep]           = useState<'form' | 'success'>('form')
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]         = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!resumeFile) {
      setError('Please upload your resume before applying.')
      return
    }

    setSubmitting(true)
    try {
      // 1. Upload resume first
      setUploading(true)
      await resumeApi.upload(resumeFile)
      setUploading(false)

      // 2. Submit application
      await applications.apply(job.id)
      onSuccess(job.id)
      setStep('success')
    } catch (err: unknown) {
      setUploading(false)
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(2px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>

      <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden"
        style={{ border: '1px solid #e2e8f0', maxHeight: '90vh', overflowY: 'auto' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b"
          style={{ borderColor: '#e2e8f0', background: 'linear-gradient(135deg,#6366f1,#4f46e5)' }}>
          <div>
            <p className="text-sm font-bold text-white">{job.title}</p>
            <p className="text-xs text-indigo-200 mt-0.5">🏢 {job.company} · 📍 {job.location}</p>
          </div>
          <button onClick={onClose} className="text-indigo-200 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        {step === 'success' ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <CheckCircle size={52} className="text-emerald-500 mb-4" />
            <h2 className="text-lg font-bold text-slate-900 mb-2">Application Submitted!</h2>
            <p className="text-sm text-slate-500 mb-1">
              You've applied to <strong>{job.title}</strong> at <strong>{job.company}</strong>.
            </p>
            <p className="text-xs text-slate-400 mb-6">Your resume was uploaded and your match score has been calculated.</p>
            <button onClick={() => { onSuccess(job.id); onClose() }}
              className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white"
              style={{ background: 'linear-gradient(135deg,#6366f1,#4f46e5)', boxShadow: '0 4px 12px rgba(99,102,241,0.3)' }}>
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">

            <div className="rounded-xl p-4 bg-indigo-50 border border-indigo-100">
              <p className="text-xs font-semibold text-indigo-700 mb-1">One step application</p>
              <p className="text-xs text-indigo-600/80">
                Upload your resume and we will attach it to your application for {job.title} at {job.company}.
              </p>
            </div>

            {/* Resume upload */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Resume <span className="text-red-500">*</span>
              </label>
              {resumeFile ? (
                <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-emerald-50 border border-emerald-200">
                  <CheckCircle size={15} className="text-emerald-500 flex-shrink-0" />
                  <span className="text-xs text-emerald-700 font-medium truncate">{resumeFile.name}</span>
                  <button type="button" onClick={() => setResumeFile(null)}
                    className="ml-auto text-slate-400 hover:text-red-500 transition-colors">
                    <X size={13} />
                  </button>
                </div>
              ) : (
                <label className="flex items-center justify-center gap-3 py-6 rounded-xl cursor-pointer transition-all hover:border-indigo-400 hover:bg-indigo-50"
                  style={{ border: '2px dashed #e2e8f0', background: '#f8fafc' }}>
                  <Upload size={18} className="text-indigo-400" />
                  <div>
                    <p className="text-sm font-medium text-slate-700">Upload Resume</p>
                    <p className="text-xs text-slate-400">PDF or DOCX · Max 10MB</p>
                  </div>
                  <input type="file" accept=".pdf,.docx" className="hidden"
                    onChange={e => setResumeFile(e.target.files?.[0] ?? null)} />
                </label>
              )}
            </div>

            {error && (
              <div className="text-xs text-red-600 px-3 py-2 rounded-lg bg-red-50 border border-red-100">
                ❌ {error}
              </div>
            )}

            <button type="submit" disabled={submitting}
              className="w-full py-3 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-60 flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg,#6366f1,#4f46e5)', boxShadow: '0 4px 14px rgba(99,102,241,0.3)' }}>
              {submitting ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  {uploading ? 'Uploading resume…' : 'Submitting…'}
                </>
              ) : (
                <><Zap size={14} /> Submit Application</>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
