import { Zap, Target, BarChart3, MessageSquare, Link2, Lock, ArrowRight } from 'lucide-react'
import { useNav } from '../App'

const STATS = [
  { value: '50K+',    label: 'Active Candidates', color: '#6366f1' },
  { value: '2.8K+',   label: 'Companies Hiring',  color: '#10b981' },
  { value: '94%',     label: 'Match Accuracy',     color: '#8b5cf6' },
  { value: '12 days', label: 'Avg Time-to-Hire',   color: '#f59e0b' },
]

const FEATURES = [
  { icon: <Zap size={18} />,           title: 'AI Resume Screening',    desc: 'NLP engine reads every resume in seconds and surfaces the best matches automatically.',  color: '#6366f1' },
  { icon: <Target size={18} />,        title: 'Smart Candidate Ranking', desc: 'Multi-dimensional scoring across skills, experience, culture fit, and salary expectations.', color: '#8b5cf6' },
  { icon: <BarChart3 size={18} />,     title: 'Real-time Analytics',    desc: 'Live dashboards showing funnel metrics, source performance, and diversity insights.', color: '#10b981' },
  { icon: <MessageSquare size={18} />, title: 'Automated Outreach',     desc: 'Personalised email sequences triggered by candidate stage changes — zero manual work.', color: '#f59e0b' },
  { icon: <Link2 size={18} />,         title: 'ATS Integrations',       desc: 'Connect with Greenhouse, Lever, Workday, and 20+ other tools out of the box.', color: '#06b6d4' },
  { icon: <Lock size={18} />,          title: 'Enterprise Security',    desc: 'SOC 2 Type II certified, GDPR compliant, SSO and role-based access controls.', color: '#ef4444' },
]

const TESTIMONIALS = [
  { name: 'Sarah K.',  role: 'Head of Talent @ Stripe',        quote: 'HireAI cut our time-to-hire by 60%. The AI match scores are eerily accurate.' },
  { name: 'Marcus T.', role: 'Engineering Director @ Shopify', quote: 'We went from reviewing 500 resumes manually to a ranked shortlist in minutes.' },
  { name: 'Priya M.',  role: 'People Ops @ Airbnb',            quote: 'The analytics dashboard gave us visibility we never had before. Highly recommend.' },
]

export function Landing() {
  const { navigate } = useNav()

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* ── Topnav ─────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-6 py-3.5 bg-white border-b"
        style={{ borderColor: '#e2e8f0' }}>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-indigo-600 flex items-center justify-center">
            <span className="text-white text-xs font-bold">AI</span>
          </div>
          <span className="font-bold text-slate-900 text-sm">HireAI</span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('job-search')}
            className="text-xs text-slate-500 hover:text-slate-800 transition-colors">
            Browse Jobs
          </button>
          <button onClick={() => navigate('login')}
            className="text-xs px-3 py-1.5 rounded-lg text-slate-700 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors">
            Log in
          </button>
          <button onClick={() => navigate('signup')}
            className="text-xs px-3 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors font-semibold">
            Get Started
          </button>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────────────── */}
      <section className="relative overflow-hidden px-6 pt-20 pb-16 text-center"
        style={{ background: 'linear-gradient(180deg, #f5f3ff 0%, #ffffff 100%)' }}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] opacity-20"
            style={{ background: 'radial-gradient(ellipse, #6366f1, transparent 70%)' }} />
        </div>
        <div className="relative max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-semibold mb-6 bg-indigo-50 text-indigo-600 border border-indigo-100">
            ✦ AI-POWERED RECRUITMENT
          </div>
          <h1 className="font-extrabold text-slate-900 mb-4 leading-tight"
            style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}>
            Hire smarter with{' '}
            <span style={{ background: 'linear-gradient(90deg, #6366f1, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              AI
            </span>
          </h1>
          <p className="text-slate-500 text-base max-w-xl mx-auto mb-8 leading-relaxed">
            Automate resume screening, rank candidates by fit, and close roles faster — powered by cutting-edge AI.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <button onClick={() => navigate('signup')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-200">
              Get Started Free <ArrowRight size={14} />
            </button>
            <button onClick={() => navigate('login')}
              className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-700 border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all">
              Sign In
            </button>
            <button onClick={() => navigate('job-search')}
              className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors">
              Browse Jobs →
            </button>
          </div>
        </div>
      </section>

      {/* ── Stats strip ────────────────────────────────────────── */}
      <section className="px-6 pb-12">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {STATS.map(s => (
            <div key={s.label} className="rounded-xl p-5 text-center bg-white"
              style={{ border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
              <p className="font-extrabold text-2xl mb-1" style={{ color: s.color }}>{s.value}</p>
              <p className="text-xs text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────────── */}
      <section className="px-6 pb-16 bg-slate-50">
        <div className="max-w-4xl mx-auto pt-12">
          <h2 className="text-xl font-bold text-slate-900 text-center mb-2">Why teams choose HireAI</h2>
          <p className="text-sm text-slate-500 text-center mb-8">Everything you need to hire the best people, faster.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map(f => (
              <div key={f.title} className="rounded-xl p-5 bg-white transition-all hover:shadow-md"
                style={{ border: '1px solid #e2e8f0' }}>
                <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3"
                  style={{ background: `${f.color}12`, border: `1px solid ${f.color}20` }}>
                  <span style={{ color: f.color }}>{f.icon}</span>
                </div>
                <h3 className="text-sm font-semibold text-slate-800 mb-2">{f.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ───────────────────────────────────────── */}
      <section className="px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl font-bold text-slate-900 text-center mb-8">Trusted by leading teams</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {TESTIMONIALS.map(t => (
              <div key={t.name} className="rounded-xl p-5 bg-white" style={{ border: '1px solid #e2e8f0' }}>
                <div className="flex mb-3">
                  {[...Array(5)].map((_, i) => <span key={i} className="text-amber-400 text-xs">★</span>)}
                </div>
                <p className="text-xs text-slate-500 italic leading-relaxed mb-4">"{t.quote}"</p>
                <p className="text-xs font-semibold text-slate-800">{t.name}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{t.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────── */}
      <section className="px-6 pb-16">
        <div className="max-w-4xl mx-auto rounded-2xl p-10 text-center relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
          <div className="absolute inset-0 opacity-20"
            style={{ background: 'radial-gradient(circle at 30% 50%, #fff, transparent 60%)' }} />
          <div className="relative">
            <h2 className="text-xl font-bold text-white mb-2">Ready to transform your hiring?</h2>
            <p className="text-sm text-indigo-100 mb-6">Join 2,800+ companies already using HireAI.</p>
            <button onClick={() => navigate('signup')}
              className="px-6 py-2.5 rounded-xl bg-white text-indigo-700 text-sm font-bold hover:bg-indigo-50 transition-colors shadow-md">
              Start for Free →
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
