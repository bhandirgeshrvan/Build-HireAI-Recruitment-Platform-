import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import type { Role, User } from './components/data'
import { Layout } from './components/Layout'
import { Landing } from './components/Landing'
import { Login } from './components/Login'
import { Signup } from './components/Signup'
import { CandidateDashboard } from './components/CandidateDashboard'
import { ResumeParser } from './components/ResumeParser'
import { JobSearch } from './components/JobSearch'
import { ApplicationTracking } from './components/ApplicationTracking'
import { RecruiterDashboard } from './components/RecruiterDashboard'
import { JobPosting } from './components/JobPosting'
import { CandidateRanking } from './components/CandidateRanking'
import { Analytics } from './components/Analytics'
import { AdminDashboard } from './components/AdminDashboard'
import { auth, token } from './api'

// -- Page type
export type Page =
  | 'landing' | 'login' | 'signup'
  | 'candidate-dashboard' | 'resume-parser' | 'job-search' | 'application-tracking'
  | 'recruiter-dashboard' | 'job-posting' | 'candidate-ranking' | 'analytics'
  | 'admin-dashboard'

const PROTECTED: Page[] = [
  'candidate-dashboard', 'resume-parser', 'application-tracking',
  'recruiter-dashboard', 'job-posting', 'candidate-ranking',
  'analytics', 'admin-dashboard',
]

const PUBLIC_ONLY: Page[] = ['landing', 'login', 'signup']

// -- Auth context
interface AuthCtx {
  user: User | null
  login: (email: string, password: string) => Promise<{ ok: boolean; msg: string }>
  signup: (name: string, email: string, password: string, role: Role) => Promise<{ ok: boolean; msg: string }>
  logout: () => void
}
export const AuthContext = createContext<AuthCtx>({} as AuthCtx)
export const useAuth = () => useContext(AuthContext)

// -- Nav context
interface NavCtx { currentPage: Page; navigate: (p: Page) => void }
export const NavContext = createContext<NavCtx>({} as NavCtx)
export const useNav = () => useContext(NavContext)

// -- Page renderer
function PageRenderer({ page }: { page: Page }) {
  switch (page) {
    case 'landing':               return <Landing />
    case 'login':                 return <Login />
    case 'signup':                return <Signup />
    case 'candidate-dashboard':   return <CandidateDashboard />
    case 'resume-parser':         return <ResumeParser />
    case 'job-search':            return <JobSearch />
    case 'application-tracking':  return <ApplicationTracking />
    case 'recruiter-dashboard':   return <RecruiterDashboard />
    case 'job-posting':           return <JobPosting />
    case 'candidate-ranking':     return <CandidateRanking />
    case 'analytics':             return <Analytics />
    case 'admin-dashboard':       return <AdminDashboard />
    default:                      return <Landing />
  }
}

export default function App() {
  const [user, setUser] = useState<User | null>(null)
  const [currentPage, setCurrentPage] = useState<Page>('landing')
  const [bootstrapped, setBootstrapped] = useState(false)

  useEffect(() => {
    document.documentElement.classList.remove('dark')
    // Restore session from token
    const t = token.get()
    if (t) {
      auth.me()
        .then(u => {
          setUser({ name: u.name, email: u.email, role: u.role as Role })
          const dash: Record<Role, Page> = {
            candidate: 'candidate-dashboard',
            recruiter: 'recruiter-dashboard',
            admin:     'admin-dashboard',
          }
          setCurrentPage(dash[u.role as Role])
        })
        .catch(() => token.clear())
        .finally(() => setBootstrapped(true))
    } else {
      setBootstrapped(true)
    }
  }, [])

  const navigate = (page: Page) => {
    if (PROTECTED.includes(page) && !user) {
      setCurrentPage('login')
      return
    }
    setCurrentPage(page)
  }

  const login = async (email: string, password: string) => {
    try {
      const res = await auth.login(email, password)
      token.set(res.access_token)
      const me = await auth.me()
      const newUser: User = { name: me.name, email: me.email, role: me.role as Role }
      setUser(newUser)
      const dash: Record<Role, Page> = {
        candidate: 'candidate-dashboard',
        recruiter: 'recruiter-dashboard',
        admin:     'admin-dashboard',
      }
      setCurrentPage(dash[me.role as Role])
      return { ok: true, msg: '' }
    } catch (e: unknown) {
      return { ok: false, msg: e instanceof Error ? e.message : 'Login failed.' }
    }
  }

  const signup = async (name: string, email: string, password: string, role: Role) => {
    try {
      await auth.register(name, email, password, role)
      return { ok: true, msg: 'Account created! You can now log in.' }
    } catch (e: unknown) {
      return { ok: false, msg: e instanceof Error ? e.message : 'Signup failed.' }
    }
  }

  const logout = () => {
    token.clear()
    setUser(null)
    setCurrentPage('landing')
  }

  if (!bootstrapped) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
      </div>
    )
  }

  const isPublicPage = PUBLIC_ONLY.includes(currentPage)

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
      <NavContext.Provider value={{ currentPage, navigate }}>
        <div className="min-h-screen bg-background text-foreground">
          {isPublicPage ? (
            <PageRenderer page={currentPage} />
          ) : (
            <Layout>
              <PageRenderer page={currentPage} />
            </Layout>
          )}
        </div>
      </NavContext.Provider>
    </AuthContext.Provider>
  )
}
