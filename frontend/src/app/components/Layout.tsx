import type { ReactNode } from 'react'
import {
  LayoutDashboard, FileText, Search, ClipboardList,
  BriefcaseBusiness, PlusCircle, Users, BarChart3,
  Shield, LogOut, Bot, ChevronRight,
} from 'lucide-react'
import { useAuth } from '../App'
import { useNav } from '../App'
import type { Page } from '../App'

interface NavItem { label: string; page: Page; icon: ReactNode }

const CANDIDATE_NAV: NavItem[] = [
  { label: 'Dashboard',        page: 'candidate-dashboard',  icon: <LayoutDashboard size={15} /> },
  { label: 'Resume Parser',    page: 'resume-parser',        icon: <FileText size={15} /> },
  { label: 'Job Search',       page: 'job-search',           icon: <Search size={15} /> },
  { label: 'My Applications',  page: 'application-tracking', icon: <ClipboardList size={15} /> },
]

const RECRUITER_NAV: NavItem[] = [
  { label: 'Dashboard',         page: 'recruiter-dashboard',  icon: <LayoutDashboard size={15} /> },
  { label: 'Post a Job',        page: 'job-posting',          icon: <PlusCircle size={15} /> },
  { label: 'Job Search',        page: 'job-search',           icon: <Search size={15} /> },
  { label: 'Candidate Ranking', page: 'candidate-ranking',    icon: <Users size={15} /> },
  { label: 'Analytics',         page: 'analytics',            icon: <BarChart3 size={15} /> },
]

const ADMIN_NAV: NavItem[] = [
  { label: 'Admin Dashboard',   page: 'admin-dashboard',      icon: <Shield size={15} /> },
  { label: 'Analytics',         page: 'analytics',            icon: <BarChart3 size={15} /> },
  { label: 'Candidate Ranking', page: 'candidate-ranking',    icon: <Users size={15} /> },
  { label: 'Job Search',        page: 'job-search',           icon: <Search size={15} /> },
]

const ROLE_COLOR: Record<string, string> = {
  candidate: '#6366f1',
  recruiter: '#10b981',
  admin:     '#f59e0b',
}

const ROLE_ICON: Record<string, string> = {
  candidate: '👤',
  recruiter: '💼',
  admin:     '🛡️',
}

function NavLink({ item, active }: { item: NavItem; active: boolean }) {
  const { navigate } = useNav()
  return (
    <button
      onClick={() => navigate(item.page)}
      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-xs font-medium transition-all duration-150 group ${
        active
          ? 'bg-indigo-50 text-indigo-700'
          : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
      }`}
      style={active ? { border: '1px solid #e0e7ff' } : { border: '1px solid transparent' }}
    >
      <span className={`${active ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'} transition-colors`}>
        {item.icon}
      </span>
      <span className="flex-1">{item.label}</span>
      {active && <ChevronRight size={11} className="text-indigo-500 opacity-60" />}
    </button>
  )
}

export function Layout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth()
  const { currentPage, navigate } = useNav()

  const navItems = user?.role === 'candidate' ? CANDIDATE_NAV
    : user?.role === 'recruiter' ? RECRUITER_NAV
    : ADMIN_NAV

  const roleColor = ROLE_COLOR[user?.role ?? 'candidate']
  const roleIcon  = ROLE_ICON[user?.role ?? 'candidate']

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* ── Sidebar ──────────────────────────────────────────── */}
      <aside
        className="w-56 flex-shrink-0 flex flex-col border-r bg-white"
        style={{ borderColor: '#e2e8f0' }}
      >
        {/* Brand */}
        <div className="px-4 pt-5 pb-4 border-b" style={{ borderColor: '#e2e8f0' }}>
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-indigo-600 flex items-center justify-center flex-shrink-0">
              <Bot size={14} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 tracking-tight">HireAI</p>
              <p className="text-[10px] text-slate-400">AI Recruitment</p>
            </div>
          </div>
        </div>

        {/* User badge */}
        {user && (
          <div className="px-3 py-3 border-b" style={{ borderColor: '#e2e8f0' }}>
            <div className="flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs flex-shrink-0"
                style={{ background: `${roleColor}18`, border: `1px solid ${roleColor}35` }}
              >
                {roleIcon}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-800 truncate">{user.name}</p>
                <p className="text-[10px] capitalize font-medium" style={{ color: roleColor }}>
                  {user.role}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest px-2 py-1 mb-1">
            Navigation
          </p>
          {navItems.map(item => (
            <NavLink key={item.page} item={item} active={currentPage === item.page} />
          ))}
        </nav>

        {/* Bottom */}
        <div className="px-2 pb-4 space-y-1 border-t pt-3" style={{ borderColor: '#e2e8f0' }}>
          {/* Demo credentials */}
          <div className="mx-1 mb-2 rounded-lg p-2.5 text-[10px]"
            style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
            <p className="text-indigo-600 font-semibold mb-1.5">Demo Logins</p>
            <p className="text-slate-500 leading-5">
              candidate@hireai.com<br />
              recruiter@hireai.com<br />
              admin@hireai.com<br />
              <span className="text-slate-400">pw: demo123</span>
            </p>
          </div>

          {user ? (
            <button
              onClick={() => { logout(); navigate('landing') }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-slate-500 hover:text-red-500 hover:bg-red-50 transition-all"
            >
              <LogOut size={13} /> Sign out
            </button>
          ) : (
            <button
              onClick={() => navigate('login')}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-indigo-600 hover:bg-indigo-50 transition-all"
            >
              Sign in
            </button>
          )}
        </div>
      </aside>

      {/* ── Main content ──────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto bg-slate-50">
        {/* Topbar */}
        <div
          className="sticky top-0 z-10 flex items-center justify-between px-6 py-3 border-b bg-white"
          style={{ borderColor: '#e2e8f0' }}
        >
          <p className="text-sm font-semibold text-slate-800 capitalize">
            {currentPage.replace(/-/g, ' ')}
          </p>
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-slate-400 hidden sm:block">
              {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </span>
            {user && (
              <div
                className="text-[10px] px-2.5 py-1 rounded-full font-semibold"
                style={{ background: `${ROLE_COLOR[user.role]}15`, color: ROLE_COLOR[user.role] }}
              >
                {user.role}
              </div>
            )}
          </div>
        </div>

        <div className="p-6">{children}</div>
      </main>
    </div>
  )
}
