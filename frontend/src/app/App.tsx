import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import type { Role, User, DBUser } from './components/data'
import { DEMO_USERS } from './components/data'
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
  login: (email: string, password: string) => { ok: boolean; msg: string }
  signup: (name: string, email: string, password: string, role: Role) => { ok: boolean; msg: string }
  logout: () => void
}
export const AuthContext = createContext<AuthCtx>({} as AuthCtx)
export const useAuth = () => useContext(AuthContext)

// -- Nav context
interface NavCtx { currentPage: Page; navigate: (p: Page) => void }
export const NavContext = createContext<NavCtx>({} as NavCtx)
export const useNav = () => useContext(NavContext)

// -- Users DB (seeded from data.ts)
const USERS_DB: Record<string, DBUser> = { ...DEMO_USERS }

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

  useEffect(() => {
    document.documentElement.classList.remove('dark')
  }, [])

  const navigate = (page: Page) => {
    if (PROTECTED.includes(page) && !user) {
      setCurrentPage('login')
      return
    }
    setCurrentPage(page)
  }

  const login = (email: string, password: string) => {
    const u = USERS_DB[email.toLowerCase().trim()]
    if (!u) return { ok: false, msg: 'No account found with that email.' }
    if (u.password !== password) return { ok: false, msg: 'Incorrect password.' }
    const newUser: User = { name: u.name, email: email.toLowerCase(), role: u.role }
    setUser(newUser)
    const dash: Record<Role, Page> = {
      candidate: 'candidate-dashboard',
      recruiter: 'recruiter-dashboard',
      admin:     'admin-dashboard',
    }
    setCurrentPage(dash[u.role])
    return { ok: true, msg: '' }
  }

  const signup = (name: string, email: string, password: string, role: Role) => {
    if (!name || !email || !password) return { ok: false, msg: 'All fields are required.' }
    if (USERS_DB[email.toLowerCase()]) return { ok: false, msg: 'Email already registered.' }
    if (password.length < 6) return { ok: false, msg: 'Password must be at least 6 characters.' }
    USERS_DB[email.toLowerCase()] = { password, role, name }
    return { ok: true, msg: 'Account created! You can now log in.' }
  }

  const logout = () => {
    setUser(null)
    setCurrentPage('landing')
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
