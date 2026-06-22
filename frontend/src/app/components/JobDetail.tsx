import { useState, useEffect } from 'react'
import { useNav, useAuth } from '../App'
import { 
  Briefcase, MapPin, DollarSign, Clock, Users, Building2, 
  CheckCircle, ArrowLeft, Loader2, Calendar, Award, Target 
} from 'lucide-react'

const BASE = import.meta.env.VITE_API_URL ?? ''

function apiFetch(path: string) {
  const t = localStorage.getItem('hireai_token')
  return fetch(`${BASE}${path}`, { headers: t ? { Authorization: `Bearer ${t}` } : {} }).then(r => r.json())
}

interface JobDetailProps {
  jobId: number
}

export function JobDetail({ jobId }: JobDetailProps) {
  const { navigate } = useNav()
  const { user } = useAuth()
  const [job, setJob] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState(false)
  const [applied, setApplied] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    apiFetch(`/jobs/${jobId}`)
      .then(data => {
        setJob(data)
        // Check if already applied
        if (user?.role === 'candidate') {
          apiFetch('/applications/mine').then(apps => {
            const hasApplied = Array.isArray(apps) && apps.some((app: any) => app.job_id === jobId)
            setApplied(hasApplied)
          })
        }
      })
      .catch(() => setError('Job not found'))
      .finally(() => setLoading(false))
  }, [jobId, user])

  const handleApply = async () => {
    if (!user || user.role !== 'candidate') {
      navigate('login')
      return
    }

    setApplying(true)
    setError('')
    
    try {
      const response = await fetch(`${BASE}/applications/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('hireai_token')}`,
        },
        body: JSON.stringify({ job_id: jobId }),
      })

      if (!response.ok) throw new Error('Application failed')
      
      setApplied(true)
    } catch (err) {
      setError('Failed to apply. Please try again.')
    } finally {
      setApplying(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    )
  }

  if (error || !job) {
    return (
      <div className="text-center py-20">
        <Building2 size={48} className="mx-auto text-slate-300 mb-4" />
        <p className="text-lg font-semibold text-slate-700">Job not found</p>
        <button
        onClick={() => navigate('candidate-dashboard')}
          className="mt-4 text-indigo-600 hover:underline flex items-center gap-2 mx-auto"
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </button>
      </div>
    )
  }

  // Mock data for fields not in database yet (can be replaced when model is enhanced)
  const mockData = {
    companyAbout: job.company_about || `${job.company} is a leading technology company focused on innovation and growth. We're committed to creating cutting-edge solutions that make a real difference.`,
    responsibilities: job.responsibilities || [
      'Design and develop scalable applications',
      'Collaborate with cross-functional teams',
      'Write clean, maintainable code',
      'Participate in code reviews and mentoring',
      'Contribute to technical documentation',
    ],
    requirements: job.requirements || [
      `${job.experience || '2-4'} years of relevant experience`,
      'Strong proficiency in required tech stack',
      'Excellent problem-solving skills',
      'Strong communication and teamwork abilities',
      'Bachelor\'s degree in Computer Science or related field',
    ],
    benefits: job.benefits || [
      'Competitive salary and equity',
      'Health, dental, and vision insurance',
      'Flexible work arrangements',
      'Professional development budget',
      '401(k) matching',
    ],
    openings: job.openings || 2,
  }

  const hiringStages = [
    { label: 'Application Review', duration: '2-3 days', icon: <CheckCircle size={16} /> },
    { label: 'Technical Assessment', duration: '1 week', icon: <Award size={16} /> },
    { label: 'Interviews', duration: '1-2 weeks', icon: <Users size={16} /> },
    { label: 'Final Decision', duration: '3-5 days', icon: <Target size={16} /> },
  ]

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Back button */}
      <button
        onClick={() => navigate('candidate-dashboard')}
        className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft size={16} /> Back
      </button>

      {/* Header Card */}
      <div className="bg-white rounded-xl p-6 sm:p-8" style={{ border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <div className="flex flex-col sm:flex-row gap-6">
          {/* Company Logo Placeholder */}
          <div className="flex-shrink-0">
            <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Building2 size={32} className="text-white" />
            </div>
          </div>

          {/* Job Info */}
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">{job.title}</h1>
            <p className="text-lg text-slate-600 mb-4">{job.company}</p>
            
            <div className="flex flex-wrap gap-3 text-sm text-slate-600">
              <span className="flex items-center gap-1.5">
                <MapPin size={14} className="text-slate-400" />
                {job.location || 'Remote'}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock size={14} className="text-slate-400" />
                {job.type || 'Full-time'}
              </span>
              <span className="flex items-center gap-1.5">
                <DollarSign size={14} className="text-slate-400" />
                ${(job.salary_min / 1000).toFixed(0)}K - ${(job.salary_max / 1000).toFixed(0)}K
              </span>
              <span className="flex items-center gap-1.5">
                <Users size={14} className="text-slate-400" />
                {mockData.openings} openings
              </span>
            </div>
          </div>

          {/* Apply Button */}
          <div className="flex-shrink-0">
            {user?.role === 'candidate' ? (
              applied ? (
                <div className="px-6 py-3 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-2">
                  <CheckCircle size={18} />
                  <span className="font-semibold">Applied</span>
                </div>
              ) : (
                <button
                  onClick={handleApply}
                  disabled={applying}
                  className="px-6 py-3 rounded-xl text-white font-semibold transition-all disabled:opacity-60 flex items-center gap-2"
                  style={{ 
                    background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                    boxShadow: '0 4px 14px rgba(99,102,241,0.3)',
                    minHeight: '44px'
                  }}
                >
                  {applying ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Applying...
                    </>
                  ) : (
                    <>
                      <Briefcase size={18} />
                      Apply Now
                    </>
                  )}
                </button>
              )
            ) : (
              <button
                onClick={() => navigate('login')}
                className="px-6 py-3 rounded-xl text-white font-semibold"
                style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)' }}
              >
                Sign in to Apply
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">
            {error}
          </div>
        )}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* About Company */}
          <div className="bg-white rounded-xl p-6" style={{ border: '1px solid #e2e8f0' }}>
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Building2 size={20} className="text-indigo-600" />
              About {job.company}
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">{mockData.companyAbout}</p>
          </div>

          {/* Role Details */}
          <div className="bg-white rounded-xl p-6" style={{ border: '1px solid #e2e8f0' }}>
            <h2 className="text-lg font-bold text-slate-900 mb-4">Role Details</h2>
            
            {/* Responsibilities */}
            <div className="mb-6">
              <h3 className="text-sm font-bold text-slate-700 mb-3">Key Responsibilities</h3>
              <ul className="space-y-2">
                {mockData.responsibilities.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                    <CheckCircle size={16} className="text-indigo-500 flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Requirements */}
            <div className="mb-6">
              <h3 className="text-sm font-bold text-slate-700 mb-3">Requirements</h3>
              <ul className="space-y-2">
                {mockData.requirements.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                    <CheckCircle size={16} className="text-indigo-500 flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Tech Stack */}
            {job.skills && job.skills.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-slate-700 mb-3">Tech Stack</h3>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill: string) => (
                    <span
                      key={skill}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Offer Package */}
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-6" style={{ border: '1px solid #d1fae5' }}>
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <DollarSign size={20} className="text-emerald-600" />
              Offer Package
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-slate-500 mb-1">Target Salary</p>
                <p className="text-2xl font-bold text-slate-900">
                  ${(job.salary_min / 1000).toFixed(0)}K - ${(job.salary_max / 1000).toFixed(0)}K
                </p>
                <p className="text-xs text-slate-500">per year</p>
              </div>
              <div className="pt-3 border-t border-emerald-200">
                <p className="text-xs font-bold text-slate-700 mb-2">Benefits & Perks</p>
                <ul className="space-y-1.5">
                  {mockData.benefits.map((benefit, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                      <CheckCircle size={12} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Hiring Timeline */}
          <div className="bg-white rounded-xl p-6" style={{ border: '1px solid #e2e8f0' }}>
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Calendar size={20} className="text-indigo-600" />
              Hiring Process
            </h2>
            <div className="space-y-4">
              {hiringStages.map((stage, index) => (
                <div key={index} className="relative">
                  {index < hiringStages.length - 1 && (
                    <div className="absolute left-2 top-8 bottom-0 w-0.5 bg-slate-200" />
                  )}
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 relative z-10">
                      {stage.icon}
                    </div>
                    <div className="flex-1 pt-0.5">
                      <p className="text-sm font-semibold text-slate-900">{stage.label}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{stage.duration}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-slate-200">
              <p className="text-xs text-slate-500">
                Total process: <span className="font-semibold text-slate-700">3-5 weeks</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
