import type { ReactNode } from 'react'
import { useState } from 'react'
import {
  LayoutDashboard, FileText, Search, ClipboardList,
  BriefcaseBusiness, PlusCircle, Users, BarChart3,
  Shield, LogOut, Bot, ChevronRight, UserCircle, User, Briefcase,
  Menu, X as CloseIcon, ScanText, Layers,
} from 'lucide-react'
import { useAuth } from '../App'
import { useNav } from '../App'
import type { Page } from '../App'

interface NavItem { label: string; page: Page; icon: ReactNode }

const CANDIDATE_NAV: NavItem[] = [
  { label: 'Dashboard',        page: 'candidate-dashboard',  icon: <LayoutDashboard size={15} /> },
  { label: 'Resume Analyzer',  page: 'resume-analyzer',      icon: <ScanText size={15} /> },
  { label: 'Job Search',       page: 'job-search',           icon: <Search size={15} /> },
  { label: 'My Applications',  page: 'application-tracking', icon: <ClipboardList size={15} /> },
  { label: 'My Profile',       page: 'candidate-profile',    icon: <UserCircle size={15} /> },
]

const RECRUITER_NAV: NavItem[] = [
  { label: 'Dashboard',         page: 'recruiter-dashboard',  icon: <LayoutDashboard size={15} /> },
  { label: 'Post a Job',        page: 'job-posting',          icon: <PlusCircle size={15} /> },
  { label: 'Manage Jobs',       page: 'manage-jobs',          icon: <Layers size={15} /> },
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

const ROLE_ICON: Record<string, any> = {
  candidate: <User size={14} />,
  recruiter: <Briefcase size={14} />,
  admin:     <Shield size={14} />,
}

function NavLink({ item, active, onNavigate }: { item: NavItem; active: boolean; onNavigate?: () => void }) {
  const { navigate } = useNav()
  return (
    <button
      onClick={() => {
        navigate(item.page)
        onNavigate?.()
      }}
      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-xs font-medium transition-all duration-150 group ${
        active
          ? 'bg-indigo-50 text-indigo-700'
          : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
      }`}
      style={{
        ...(active ? { border: '1px solid #e0e7ff' } : { border: '1px solid transparent' }),
        minHeight: '44px', // Accessibility: touch target size
      }}
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
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const navItems = user?.role === 'candidate' ? CANDIDATE_NAV
    : user?.role === 'recruiter' ? RECRUITER_NAV
    : ADMIN_NAV

  const roleColor = ROLE_COLOR[user?.role ?? 'candidate']
  const roleIcon  = ROLE_ICON[user?.role ?? 'candidate']

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ──────────────────────────────────────────── */}
      <aside
        className={`
          w-56 flex-shrink-0 flex flex-col border-r bg-white z-50
          fixed lg:static inset-y-0 left-0
          transform transition-transform duration-200 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
        style={{ borderColor: '#e2e8f0' }}
      >
        {/* Brand */}
        <div className="px-4 pt-5 pb-4 border-b flex items-center justify-between" style={{ borderColor: '#e2e8f0' }}>
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-indigo-600 flex items-center justify-center flex-shrink-0">
              <Bot size={14} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 tracking-tight">HireAI</p>
              <p className="text-[10px] text-slate-400">AI Recruitment</p>
            </div>
          </div>
          {/* Close button - mobile only */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 hover:bg-slate-100 rounded transition-colors"
            aria-label="Close menu"
          >
            <CloseIcon size={18} className="text-slate-600" />
          </button>
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
            <NavLink 
              key={item.page} 
              item={item} 
              active={currentPage === item.page}
              onNavigate={() => setSidebarOpen(false)}
            />
          ))}
        </nav>

        {/* Bottom */}
        <div className="px-2 pb-4 space-y-1 border-t pt-3" style={{ borderColor: '#e2e8f0' }}>
          {user ? (
            <button
              onClick={() => { logout(); navigate('landing'); setSidebarOpen(false) }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-slate-500 hover:text-red-500 hover:bg-red-50 transition-all"
              style={{ minHeight: '44px' }}
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
      <main className="flex-1 overflow-y-auto bg-slate-50 lg:ml-0">
        {/* Topbar */}
        <div
          className="sticky top-0 z-10 flex items-center justify-between px-4 sm:px-6 py-3 border-b bg-white"
          style={{ borderColor: '#e2e8f0' }}
        >
          <div className="flex items-center gap-3">
            {/* Hamburger menu - mobile only */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors"
              aria-label="Open menu"
            >
              <Menu size={20} className="text-slate-600" />
            </button>
            <p className="text-sm font-semibold text-slate-800 capitalize">
              {currentPage.replace(/-/g, ' ').replace(/\b(ats|ai|id)\b/gi, s => s.toUpperCase())}
            </p>
          </div>
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

        <div className="p-4 sm:p-6">{children}</div>
      </main>
    </div>
  )
}
