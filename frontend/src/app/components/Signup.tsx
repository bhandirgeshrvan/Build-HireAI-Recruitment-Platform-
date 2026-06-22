import { useState } from 'react'
import { Bot, User, Briefcase } from 'lucide-react'
import { useAuth, useNav } from '../App'
import type { Role } from './data'

export function Signup() {
  const { signup } = useAuth()
  const { navigate } = useNav()
  const [name, setName]         = useState('')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm]   = useState('')
  const [role, setRole]         = useState<Role>('candidate')
  const [error, setError]       = useState('')
  const [success, setSuccess]   = useState('')
  const [loading, setLoading]   = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(''); setSuccess('')
    if (password !== confirm) { setError('Passwords do not match.'); return }
    setLoading(true)
    const result = await signup(name, email, password, role)
    setLoading(false)
    if (!result.ok) { setError(result.msg); return }
    setSuccess(result.msg)
  }

  const inputStyle = { background: '#ffffff', border: '1px solid #e2e8f0', outline: 'none' }
  const focusIndigo = (e: React.FocusEvent<HTMLInputElement>) => (e.target.style.borderColor = '#6366f1')
  const blurGray    = (e: React.FocusEvent<HTMLInputElement>) => (e.target.style.borderColor = '#e2e8f0')

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-200">
            <Bot size={22} className="text-white" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">Create your account</h1>
          <p className="text-sm text-slate-500 mt-1">Join 50,000+ professionals on HireAI</p>
        </div>

        <div className="rounded-2xl p-7 bg-white shadow-sm" style={{ border: '1px solid #e2e8f0' }}>
          {success ? (
            <div className="text-center py-6">
              <div className="text-4xl mb-3">🎉</div>
              <p className="text-sm font-semibold text-emerald-600 mb-2">{success}</p>
              <button onClick={() => navigate('login')}
                className="mt-4 px-5 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold shadow-md shadow-indigo-200">
                Go to Login
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Full Name</label>
                <input value={name} onChange={e => setName(e.target.value)} placeholder="Jane Smith"
                  className="w-full px-3 py-2.5 rounded-lg text-sm text-slate-800 placeholder-slate-300 transition-all"
                  style={inputStyle} onFocus={focusIndigo} onBlur={blurGray} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Email address</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="jane@company.com"
                  className="w-full px-3 py-2.5 rounded-lg text-sm text-slate-800 placeholder-slate-300 transition-all"
                  style={inputStyle} onFocus={focusIndigo} onBlur={blurGray} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Password</label>
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min 6 chars"
                    className="w-full px-3 py-2.5 rounded-lg text-sm text-slate-800 placeholder-slate-300 transition-all"
                    style={inputStyle} onFocus={focusIndigo} onBlur={blurGray} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Confirm</label>
                  <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Re-enter"
                    className="w-full px-3 py-2.5 rounded-lg text-sm text-slate-800 placeholder-slate-300 transition-all"
                    style={inputStyle} onFocus={focusIndigo} onBlur={blurGray} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-2">I am a…</label>
                <div className="grid grid-cols-2 gap-3">
                  {(['candidate', 'recruiter'] as Role[]).map(r => (
                    <button key={r} type="button" onClick={() => setRole(r)}
                      className="py-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2"
                      style={{
                        background: role === r ? '#eef2ff' : '#ffffff',
                        border: `1px solid ${role === r ? '#6366f1' : '#e2e8f0'}`,
                        color: role === r ? '#4f46e5' : '#64748b',
                      }}>
                      {r === 'candidate' ? (
                        <><User size={14} /> Job Seeker</>
                      ) : (
                        <><Briefcase size={14} /> Recruiter</>
                      )}
                    </button>
                  ))}
                </div>
              </div>
              {error && (
                <div className="text-xs text-red-600 px-3 py-2 rounded-lg bg-red-50 border border-red-100">
                  {error}
                </div>
              )}
              <button type="submit" disabled={loading}
                className="w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)', boxShadow: '0 4px 14px rgba(99,102,241,0.3)' }}>
                {loading ? 'Creating account…' : 'Create Account →'}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-xs text-slate-500 mt-4">
          Already have an account?{' '}
          <button onClick={() => navigate('login')} className="text-indigo-600 hover:underline font-semibold">
            Log in
          </button>
        </p>
      </div>
    </div>
  )
}
