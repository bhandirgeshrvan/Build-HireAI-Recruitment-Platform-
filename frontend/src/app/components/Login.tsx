import { useState } from 'react'
import { Bot, Eye, EyeOff } from 'lucide-react'
import { useAuth, useNav } from '../App'
import type { Role } from './data'

export function Login() {
  const { login } = useAuth()
  const { navigate } = useNav()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole]         = useState<Role>('candidate')
  const [showPw, setShowPw]     = useState(false)
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!email || !password) { setError('Please enter both email and password.'); return }
    setLoading(true)
    const result = await login(email, password)
    setLoading(false)
    if (!result.ok) setError(result.msg)
  }

  const inputStyle = {
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    outline: 'none',
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-200">
            <Bot size={22} className="text-white" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">Welcome back</h1>
          <p className="text-sm text-slate-500 mt-1">Sign in to your HireAI account</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl p-7 bg-white shadow-sm" style={{ border: '1px solid #e2e8f0' }}>
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Role selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-2">I am a…</label>
              <div className="grid grid-cols-2 gap-3">
                {(['candidate', 'recruiter'] as Role[]).map(r => (
                  <button key={r} type="button" onClick={() => setRole(r)}
                    className="py-3 rounded-xl text-xs font-semibold transition-all"
                    style={{
                      background: role === r ? '#eef2ff' : '#ffffff',
                      border: `1px solid ${role === r ? '#6366f1' : '#e2e8f0'}`,
                      color: role === r ? '#4f46e5' : '#64748b',
                    }}>
                    {r === 'candidate' ? '👤 Job Seeker' : '💼 Recruiter'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Email address</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full px-3 py-2.5 rounded-lg text-sm text-slate-800 placeholder-slate-300 transition-all"
                style={inputStyle}
                onFocus={e => (e.target.style.borderColor = '#6366f1')}
                onBlur={e => (e.target.style.borderColor = '#e2e8f0')}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'} value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2.5 rounded-lg text-sm text-slate-800 placeholder-slate-300 transition-all pr-10"
                  style={inputStyle}
                  onFocus={e => (e.target as HTMLInputElement).style.borderColor = '#6366f1'}
                  onBlur={e => (e.target as HTMLInputElement).style.borderColor = '#e2e8f0'}
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="text-xs text-red-600 px-3 py-2 rounded-lg bg-red-50 border border-red-100">
                {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-60"
              style={{ background: loading ? '#818cf8' : 'linear-gradient(135deg, #6366f1, #4f46e5)', boxShadow: '0 4px 14px rgba(99,102,241,0.3)' }}>
              {loading ? 'Signing in…' : 'Sign In →'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-500 mt-4">
          Don't have an account?{' '}
          <button onClick={() => navigate('signup')} className="text-indigo-600 hover:underline font-semibold">
            Sign up
          </button>
        </p>
      </div>
    </div>
  )
}
