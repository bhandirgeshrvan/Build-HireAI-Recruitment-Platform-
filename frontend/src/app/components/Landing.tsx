import { useState, useEffect } from 'react'
import { 
  ArrowRight, Zap, BarChart3, Target, CheckCircle2, TrendingUp, 
  Users, Briefcase, Clock, Trophy, Medal, Code, Star, ChevronRight,
  FileText, Sparkles, Activity, Filter, PieChart, Award
} from 'lucide-react'
import { useNav } from '../App'

// Design System Colors
const COLORS = {
  inkNavy: '#0f172a',
  slateBlue: '#475569',
  precisionBlue: '#3b82f6',
  warmPaper: '#fafaf9',
  softCream: '#f5f5f4',
  dataGreen: '#10b981',
  signalOrange: '#f97316',
}

// Live ATS Score Preview Component (Signature Element)
function LiveATSPreview() {
  const [progress, setProgress] = useState(0)
  const [stage, setStage] = useState<'uploading' | 'parsing' | 'complete'>('uploading')

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) {
      setStage('complete')
      setProgress(100)
      return
    }

    const timer1 = setTimeout(() => {
      setStage('parsing')
      const interval = setInterval(() => {
        setProgress(p => {
          if (p >= 100) {
            clearInterval(interval)
            setTimeout(() => setStage('complete'), 200)
            return 100
          }
          return p + 2
        })
      }, 30)
      return () => clearInterval(interval)
    }, 800)

    return () => clearTimeout(timer1)
  }, [])

  return (
    <div className="bg-white rounded-xl p-5 shadow-lg border border-slate-200 w-full max-w-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
            <FileText size={16} className="text-indigo-600" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-900">Resume Analysis</p>
            <p className="text-[10px] text-slate-500">John_Doe_Resume.pdf</p>
          </div>
        </div>
        {stage === 'complete' && (
          <CheckCircle2 size={18} className="text-green-500" />
        )}
      </div>

      {stage !== 'complete' ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-600">
              {stage === 'uploading' ? 'Uploading...' : 'Parsing with AI...'}
            </span>
            <span className="font-mono font-semibold text-slate-900">{progress}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
              <span className="text-slate-600">Skills Match</span>
              <span className="font-mono font-bold text-slate-900">8/10</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
              <span className="text-slate-600">Experience</span>
              <span className="font-mono font-bold text-green-600">✓ 5y</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
              <span className="text-slate-600">Education</span>
              <span className="font-mono font-bold text-green-600">✓ BS</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
              <span className="text-slate-600">Location</span>
              <span className="font-mono font-bold text-green-600">✓</span>
            </div>
          </div>
          
          <div className="pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-700">Overall ATS Score</span>
              <span className="font-mono text-2xl font-bold text-green-600">94.2%</span>
            </div>
            <div className="flex gap-2">
              <span className="px-2 py-1 rounded-md text-[10px] font-semibold bg-green-50 text-green-700 border border-green-200">
                Top 5% Match
              </span>
              <span className="px-2 py-1 rounded-md text-[10px] font-semibold bg-orange-50 text-orange-700 border border-orange-200">
                Invite to Interview
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Stat Card with Monospace Numbers
function DataStatCard({ value, label, sublabel }: { value: string; label: string; sublabel?: string }) {
  return (
    <div className="flex-shrink-0 w-40 sm:w-48 p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
      <p className="font-mono text-3xl font-bold text-slate-900 mb-1">{value}</p>
      <p className="text-xs font-semibold text-slate-700 uppercase tracking-wide">{label}</p>
      {sublabel && <p className="text-[10px] text-slate-500 mt-1">{sublabel}</p>}
    </div>
  )
}

// Feature Section with Real UI Screenshot
function FeatureSection({ 
  reverse, 
  image, 
  headline, 
  description, 
  metrics,
  accent
}: { 
  reverse?: boolean
  image: React.ReactNode
  headline: string
  description: string
  metrics?: { label: string; value: string }[]
  accent?: string
}) {
  return (
    <div className={`flex flex-col ${reverse ? 'lg:flex-row-reverse' : 'lg:flex-row'} gap-8 lg:gap-12 items-center`}>
      <div className="flex-1 space-y-4">
        <h3 className="text-2xl lg:text-3xl font-bold text-slate-900 leading-tight">
          {headline}
        </h3>
        <p className="text-base text-slate-600 leading-relaxed">
          {description}
        </p>
        {metrics && (
          <div className="flex flex-wrap gap-4 pt-2">
            {metrics.map(m => (
              <div key={m.label} className="flex items-baseline gap-2">
                <span className="font-mono text-2xl font-bold" style={{ color: accent || COLORS.precisionBlue }}>
                  {m.value}
                </span>
                <span className="text-sm text-slate-600">{m.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="flex-1 w-full">
        {image}
      </div>
    </div>
  )
}

export function Landing() {
  const { navigate } = useNav()

  return (
    <div className="min-h-screen" style={{ background: COLORS.warmPaper, fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: COLORS.precisionBlue }}>
                <span className="text-white text-sm font-bold">AI</span>
              </div>
              <span className="font-bold text-lg" style={{ color: COLORS.inkNavy }}>HireAI</span>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate('job-search')}
                className="text-sm font-medium transition-colors hover:text-slate-900"
                style={{ color: COLORS.slateBlue }}
              >
                Browse Jobs
              </button>
              <button 
                onClick={() => navigate('login')}
                className="text-sm font-medium px-4 py-2 rounded-lg border border-slate-300 transition-all hover:border-slate-400 hover:bg-slate-50"
                style={{ color: COLORS.inkNavy }}
              >
                Log in
              </button>
              <button 
                onClick={() => navigate('signup')}
                className="text-sm font-semibold px-4 py-2 rounded-lg text-white transition-all hover:opacity-90 shadow-md"
                style={{ background: COLORS.precisionBlue }}
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12 lg:pt-24 lg:pb-20">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-center">
          {/* Left: Editorial Content */}
          <div className="flex-1 space-y-6 lg:space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-50 border border-blue-200"
              style={{ color: COLORS.precisionBlue }}>
              <Sparkles size={14} />
              AI-Powered Recruitment Platform
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight"
              style={{ color: COLORS.inkNavy }}>
              The hiring platform<br />that shows its work
            </h1>
            
            <p className="text-lg sm:text-xl leading-relaxed max-w-xl"
              style={{ color: COLORS.slateBlue }}>
              Every resume scored. Every decision backed by data. No black box—just transparent AI that helps you hire better, faster.
            </p>
            
            <div className="flex flex-wrap items-center gap-4">
              <button 
                onClick={() => navigate('signup')}
                className="flex items-center gap-2 px-6 py-3 rounded-xl text-base font-semibold text-white transition-all hover:opacity-90 shadow-lg"
                style={{ background: COLORS.precisionBlue, minHeight: '44px' }}
              >
                Get Started Free
                <ArrowRight size={18} />
              </button>
              <button 
                onClick={() => navigate('login')}
                className="px-6 py-3 rounded-xl text-base font-medium border-2 border-slate-300 transition-all hover:border-slate-400 hover:bg-white"
                style={{ color: COLORS.inkNavy, minHeight: '44px' }}
              >
                View Demo
              </button>
            </div>

            <div className="flex items-center gap-6 pt-4 text-sm" style={{ color: COLORS.slateBlue }}>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={18} className="text-green-500" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={18} className="text-green-500" />
                <span>Free 14-day trial</span>
              </div>
            </div>
          </div>

          {/* Right: Live Product UI Preview */}
          <div className="flex-1 flex items-center justify-center lg:justify-end w-full">
            <LiveATSPreview />
          </div>
        </div>
      </section>

      {/* Real Product Stats - Horizontal Scroll */}
      <section className="border-y border-slate-200 bg-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            <DataStatCard value="Real-time" label="Resume Parsing" sublabel="powered by AI" />
            <DataStatCard value="6-Dimension" label="Match Scoring" sublabel="comprehensive analysis" />
            <DataStatCard value="Auto" label="Skill Extraction" sublabel="from any format" />
            <DataStatCard value="Live" label="Analytics" sublabel="funnel insights" />
          </div>
        </div>
      </section>

      {/* Feature 1: AI Resume Screening */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
        <FeatureSection
          headline="AI-powered resume screening in seconds"
          description="Our NLP engine powered by AWS Bedrock parses skills, experience, education, and location from any resume format. The AI understands context, synonyms, and industry terminology to surface the best candidates automatically—no manual keyword matching required."
          metrics={[
            { value: '8/10', label: 'skills matched' },
            { value: 'PDF/DOCX', label: 'supported' },
          ]}
          accent={COLORS.dataGreen}
          image={
            <div className="rounded-2xl border-2 border-slate-200 bg-white shadow-2xl overflow-hidden">
              <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <span className="text-xs font-semibold text-slate-600">Candidate Ranking</span>
              </div>
              <div className="p-6 space-y-3">
                {/* Candidate 1 */}
                <div className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 bg-gradient-to-r from-yellow-50 to-white">
                  <Trophy size={20} className="text-yellow-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900">Sarah Chen</p>
                    <p className="text-xs text-slate-600">Senior Frontend Engineer · 5 yrs</p>
                  </div>
                  <span className="font-mono text-lg font-bold text-green-600">94%</span>
                </div>
                
                {/* Candidate 2 */}
                <div className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 bg-white">
                  <Medal size={20} className="text-slate-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900">Marcus Thompson</p>
                    <p className="text-xs text-slate-600">Full Stack Developer · 4 yrs</p>
                  </div>
                  <span className="font-mono text-lg font-bold text-green-600">89%</span>
                </div>
                
                {/* Candidate 3 */}
                <div className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 bg-white">
                  <Medal size={20} className="text-amber-600 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900">Priya Patel</p>
                    <p className="text-xs text-slate-600">Software Engineer · 3 yrs</p>
                  </div>
                  <span className="font-mono text-lg font-bold text-orange-600">82%</span>
                </div>

                {/* Skills Preview */}
                <div className="pt-4 border-t border-slate-200">
                  <p className="text-xs font-semibold text-slate-700 mb-2">Top Matched Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {['React', 'TypeScript', 'Node.js', 'Python', 'AWS', 'Docker'].map(skill => (
                      <span key={skill} className="px-2 py-1 rounded-md text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          }
        />
      </section>

      {/* Feature 2: Real-time Analytics */}
      <section className="bg-white border-y border-slate-200 py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FeatureSection
            reverse
            headline="Live funnel metrics for data-driven decisions"
            description="Track every stage from Applied → Screening → Interview → Hired. Filter by job, view conversion rates, and get actionable insights. Every metric ties directly to hiring decisions—no vanity dashboards, just real data."
            metrics={[
              { value: '5', label: 'pipeline stages' },
              { value: 'Per-job', label: 'breakdown' },
            ]}
            accent={COLORS.precisionBlue}
            image={
              <div className="rounded-2xl border-2 border-slate-200 bg-white shadow-2xl overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-600">Analytics Dashboard</span>
                  <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-white border border-slate-200">
                    <span className="text-xs text-slate-700">All Jobs</span>
                    <ChevronRight size={14} className="text-slate-400" />
                  </div>
                </div>
                <div className="p-6">
                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="p-3 rounded-lg bg-indigo-50 border border-indigo-100">
                      <p className="text-xs text-slate-600 mb-1">Total Applications</p>
                      <p className="font-mono text-2xl font-bold text-slate-900">147</p>
                    </div>
                    <div className="p-3 rounded-lg bg-green-50 border border-green-100">
                      <p className="text-xs text-slate-600 mb-1">Hired</p>
                      <p className="font-mono text-2xl font-bold text-slate-900">12</p>
                    </div>
                  </div>

                  {/* Funnel Visualization */}
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-slate-700 mb-3">Hiring Funnel</p>
                    {[
                      { stage: 'Applied', count: 147, width: '100%', color: '#6366f1' },
                      { stage: 'Screening', count: 89, width: '60%', color: '#8b5cf6' },
                      { stage: 'Interview', count: 34, width: '35%', color: '#f59e0b' },
                      { stage: 'Offer', count: 18, width: '20%', color: '#10b981' },
                      { stage: 'Hired', count: 12, width: '12%', color: '#22c55e' },
                    ].map(stage => (
                      <div key={stage.stage} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-600 font-medium">{stage.stage}</span>
                          <span className="font-mono font-bold text-slate-900">{stage.count}</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                          <div 
                            className="h-full transition-all duration-300"
                            style={{ width: stage.width, background: stage.color }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Insight Card */}
                  <div className="mt-6 p-3 rounded-lg bg-blue-50 border border-blue-200 flex gap-2">
                    <Activity size={14} className="text-blue-600 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-blue-800 leading-relaxed">
                      23% conversion from Interview to Offer—above industry average
                    </p>
                  </div>
                </div>
              </div>
            }
          />
        </div>
      </section>

      {/* Feature 3: Multi-dimensional Scoring */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4" style={{ color: COLORS.inkNavy }}>
            Beyond keyword matching
          </h2>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: COLORS.slateBlue }}>
            Comprehensive 6-dimension scoring: technical skills (25%), experience (20%), projects (20%), leadership (15%), soft skills (10%), and achievements (10%). See exactly why each candidate ranks where they do.
          </p>
        </div>

        <div className="rounded-2xl border-2 border-slate-200 bg-white shadow-2xl overflow-hidden">
          <div className="p-6 lg:p-8">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Left: Candidate Info */}
              <div className="flex-1 space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                    SC
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Sarah Chen</h3>
                    <p className="text-sm text-slate-600">Senior Frontend Engineer</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Briefcase size={12} /> 5 years
                      </span>
                      <span className="flex items-center gap-1">
                        <Code size={12} /> Full-time
                      </span>
                      <span className="flex items-center gap-1">
                        <Trophy size={12} /> Top 5%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-semibold text-slate-700 mb-2">Technical Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {['React', 'TypeScript', 'Node.js', 'GraphQL', 'AWS', 'Docker', 'PostgreSQL', 'Redis'].map(skill => (
                        <span key={skill} className="px-2 py-1 rounded-md text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-slate-700 mb-2">Experience Breakdown</p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-600">Senior Role (3y)</span>
                        <div className="flex-1 mx-3 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-green-500" style={{ width: '100%' }} />
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-600">Mid-level (2y)</span>
                        <div className="flex-1 mx-3 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-green-500" style={{ width: '80%' }} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 border border-green-200">
                  <CheckCircle2 size={16} className="text-green-600" />
                  <p className="text-xs font-medium text-green-800">
                    Salary expectation ($140K) aligns with budget ($130K-$150K)
                  </p>
                </div>
              </div>

              {/* Right: Overall Score */}
              <div className="lg:w-80 space-y-4">
                <div className="text-center p-6 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200">
                  <p className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-2">
                    Overall Match Score
                  </p>
                  <p className="font-mono text-6xl font-bold text-green-600 mb-2">94.2%</p>
                  <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 border border-green-300">
                    <Award size={12} className="text-green-700" />
                    <span className="text-xs font-semibold text-green-700">Excellent Match</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-semibold text-slate-700">Score Breakdown</p>
                  {[
                    { label: 'Skills Match', score: 95, color: '#10b981' },
                    { label: 'Experience Level', score: 98, color: '#3b82f6' },
                    { label: 'Education', score: 90, color: '#8b5cf6' },
                    { label: 'Culture Fit', score: 92, color: '#f59e0b' },
                    { label: 'Salary Alignment', score: 96, color: '#06b6d4' },
                  ].map(item => (
                    <div key={item.label} className="flex items-center gap-3">
                      <span className="text-xs text-slate-600 w-32">{item.label}</span>
                      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full transition-all duration-300"
                          style={{ width: `${item.score}%`, background: item.color }}
                        />
                      </div>
                      <span className="font-mono text-xs font-bold text-slate-900 w-10 text-right">
                        {item.score}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof / Testimonials */}
      <section className="bg-white border-y border-slate-200 py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4" style={{ color: COLORS.inkNavy }}>
              Built for hiring teams
            </h2>
            <p className="text-lg" style={{ color: COLORS.slateBlue }}>
              Real scenarios from teams using HireAI
            </p>
            <p className="text-sm text-slate-400 mt-2">
              * Demo testimonials for illustration purposes
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {/* Testimonial 1 - Large */}
            <div className="md:col-span-2 rounded-2xl border-2 border-slate-200 bg-gradient-to-br from-white to-slate-50 p-8 shadow-lg">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={18} className="text-amber-400 fill-amber-400" />
                ))}
              </div>
              <blockquote className="text-xl font-medium leading-relaxed mb-6" style={{ color: COLORS.inkNavy }}>
                "HireAI cut our time-to-hire significantly. The AI match scores help us focus on the right candidates—our top ranked candidates consistently make it to final rounds."
              </blockquote>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-lg font-bold">
                  SK
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Sarah K.</p>
                  <p className="text-sm text-slate-600">Head of Talent</p>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-slate-200 flex items-center gap-6">
                <div className="flex items-baseline gap-2">
                  <span className="font-mono text-3xl font-bold text-green-600">Faster</span>
                  <span className="text-sm text-slate-600">hiring process</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="font-mono text-3xl font-bold text-indigo-600">Top 3</span>
                  <span className="text-sm text-slate-600">reach finals</span>
                </div>
              </div>
            </div>

            {/* Testimonial 2 - Small */}
            <div className="rounded-2xl border-2 border-slate-200 bg-white p-6 shadow-lg">
              <div className="flex gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} className="text-amber-400 fill-amber-400" />
                ))}
              </div>
              <blockquote className="text-base leading-relaxed mb-4" style={{ color: COLORS.inkNavy }}>
                "We went from reviewing hundreds of resumes manually to a ranked shortlist in minutes. Complete game changer."
              </blockquote>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white text-sm font-bold">
                  MT
                </div>
                <div>
                  <p className="font-semibold text-sm text-slate-900">Marcus T.</p>
                  <p className="text-xs text-slate-600">Engineering Director</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-200">
                <div className="flex items-baseline gap-2">
                  <span className="font-mono text-2xl font-bold text-orange-600">Hundreds→10</span>
                  <span className="text-xs text-slate-600">shortlist size</span>
                </div>
              </div>
            </div>

            {/* Testimonial 3 - Small */}
            <div className="rounded-2xl border-2 border-slate-200 bg-white p-6 shadow-lg">
              <div className="flex gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} className="text-amber-400 fill-amber-400" />
                ))}
              </div>
              <blockquote className="text-base leading-relaxed mb-4" style={{ color: COLORS.inkNavy }}>
                "The analytics dashboard gives us visibility we never had. We can finally track what's working in our pipeline."
              </blockquote>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-bold">
                  PM
                </div>
                <div>
                  <p className="font-semibold text-sm text-slate-900">Priya M.</p>
                  <p className="text-xs text-slate-600">People Operations</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-200">
                <div className="flex items-baseline gap-2">
                  <span className="font-mono text-2xl font-bold text-purple-600">Better</span>
                  <span className="text-xs text-slate-600">pipeline insights</span>
                </div>
              </div>
            </div>

            {/* Testimonial 4 - Medium */}
            <div className="md:col-span-2 rounded-2xl border-2 border-slate-200 bg-white p-6 shadow-lg">
              <div className="flex gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} className="text-amber-400 fill-amber-400" />
                ))}
              </div>
              <blockquote className="text-lg leading-relaxed mb-4" style={{ color: COLORS.inkNavy }}>
                "Finally, an ATS that doesn't feel like a black box. We can see exactly why candidates score the way they do. Our hiring managers actually trust the rankings now."
              </blockquote>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-sm font-bold">
                  JL
                </div>
                <div>
                  <p className="font-semibold text-sm text-slate-900">Jennifer Liu</p>
                  <p className="text-xs text-slate-600">VP Talent @ Notion</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
        <div className="rounded-3xl border-2 border-slate-200 bg-gradient-to-br from-slate-900 to-slate-800 p-12 lg:p-16 text-center shadow-2xl relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
          
          <div className="relative z-10 max-w-3xl mx-auto">
            <h2 className="text-3xl lg:text-5xl font-bold text-white mb-6 leading-tight">
              Ready to transform your hiring process?
            </h2>
            <p className="text-lg lg:text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
              Join 2,800+ companies using HireAI to find better candidates faster. Start your free 14-day trial—no credit card required.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <button 
                onClick={() => navigate('signup')}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-lg font-semibold transition-all shadow-xl hover:shadow-2xl hover:scale-105"
                style={{ background: COLORS.precisionBlue, color: 'white', minHeight: '56px' }}
              >
                Start Free Trial
                <ArrowRight size={20} />
              </button>
              <button 
                onClick={() => navigate('login')}
                className="w-full sm:w-auto px-8 py-4 rounded-xl text-lg font-semibold bg-white/10 text-white border-2 border-white/20 transition-all hover:bg-white/20 backdrop-blur-sm"
                style={{ minHeight: '56px' }}
              >
                View Live Demo
              </button>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-slate-400">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-green-400" />
                <span>Free 14-day trial</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-green-400" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-green-400" />
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: COLORS.precisionBlue }}>
                <span className="text-white text-sm font-bold">AI</span>
              </div>
              <span className="font-bold text-lg" style={{ color: COLORS.inkNavy }}>HireAI</span>
            </div>
            
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-600">
              <button onClick={() => navigate('job-search')} className="hover:text-slate-900 transition-colors">
                Browse Jobs
              </button>
              <button onClick={() => navigate('login')} className="hover:text-slate-900 transition-colors">
                Log In
              </button>
              <button onClick={() => navigate('signup')} className="hover:text-slate-900 transition-colors">
                Sign Up
              </button>
              <span className="hover:text-slate-900 transition-colors cursor-pointer">Privacy</span>
              <span className="hover:text-slate-900 transition-colors cursor-pointer">Terms</span>
              <span className="hover:text-slate-900 transition-colors cursor-pointer">Docs</span>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-slate-200 text-center">
            <p className="text-sm text-slate-500">
              © 2026 HireAI. Built for hiring teams who value transparency and data-driven decisions.
            </p>
          </div>
        </div>
      </footer>

      {/* Custom scrollbar styles */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        /* Focus states for accessibility */
        button:focus-visible {
          outline: 2px solid ${COLORS.precisionBlue};
          outline-offset: 2px;
        }
        
        /* Monospace tabular numbers */
        .font-mono {
          font-variant-numeric: tabular-nums;
        }
      `}</style>
    </div>
  )
}
