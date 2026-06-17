"""
HireAI – AI Powered Recruitment Platform
Main entry point: handles sidebar navigation and page routing.

Run with:  streamlit run app.py
"""

import streamlit as st

# ── Local imports ─────────────────────────────────────────────────────────
from utils.auth   import init_session, logout
from utils.styles import GLOBAL_CSS

# ── Page modules ──────────────────────────────────────────────────────────
from pages.landing              import render as render_landing
from pages.login                import render as render_login
from pages.signup               import render as render_signup
from pages.candidate_dashboard  import render as render_candidate_dashboard
from pages.resume_parser        import render as render_resume_parser
from pages.job_search           import render as render_job_search
from pages.application_tracking import render as render_application_tracking
from pages.recruiter_dashboard  import render as render_recruiter_dashboard
from pages.job_posting          import render as render_job_posting
from pages.candidate_ranking    import render as render_candidate_ranking
from pages.analytics            import render as render_analytics
from pages.admin_dashboard      import render as render_admin_dashboard

# ── Streamlit page config ─────────────────────────────────────────────────
st.set_page_config(
    page_title="HireAI – AI Recruitment Platform",
    page_icon="🤖",
    layout="wide",
    initial_sidebar_state="expanded",
)

# Inject global CSS
st.markdown(GLOBAL_CSS, unsafe_allow_html=True)

# Bootstrap session state
init_session()

# ── Sidebar ───────────────────────────────────────────────────────────────
with st.sidebar:
    # Logo / brand
    st.markdown("""
    <div style="padding:16px 0 24px;text-align:center;">
        <div style="font-size:2rem;">🤖</div>
        <h2 style="color:#f1f5f9;font-size:1.4rem;font-weight:800;margin:4px 0 2px;">
            HireAI
        </h2>
        <p style="color:#475569;font-size:0.75rem;margin:0;">
            AI-Powered Recruitment
        </p>
    </div>
    """, unsafe_allow_html=True)

    st.divider()

    logged_in = st.session_state.logged_in
    role      = st.session_state.user_role

    # ── Public navigation (not logged in) ─────────────────────────────────
    if not logged_in:
        st.markdown('<p style="color:#64748b;font-size:0.72rem;font-weight:600;'
                    'text-transform:uppercase;letter-spacing:.06em;padding:0 4px;">Menu</p>',
                    unsafe_allow_html=True)

        pages_public = {
            "🏠  Home":       "landing",
            "🔍  Job Search": "job_search",
            "🔑  Login":      "login",
            "📝  Sign Up":    "signup",
        }
        for label, page_key in pages_public.items():
            active = st.session_state.current_page == page_key
            btn_style = (
                "background:rgba(37,99,235,0.15);color:#60a5fa;"
                "border:1px solid rgba(37,99,235,0.3);"
            ) if active else "background:transparent;color:#94a3b8;border:1px solid transparent;"
            if st.button(
                label,
                key=f"nav_{page_key}",
                use_container_width=True,
            ):
                st.session_state.current_page = page_key
                st.rerun()

    # ── Candidate navigation ───────────────────────────────────────────────
    elif role == "candidate":
        st.markdown(f'<p style="color:#60a5fa;font-size:0.8rem;font-weight:600;'
                    f'padding:0 4px;">👤 {st.session_state.user_name}</p>',
                    unsafe_allow_html=True)
        st.markdown('<p style="color:#64748b;font-size:0.72rem;font-weight:600;'
                    'text-transform:uppercase;letter-spacing:.06em;padding:4px 4px 0;">Candidate</p>',
                    unsafe_allow_html=True)

        candidate_pages = {
            "📊  Dashboard":    "candidate_dashboard",
            "📄  Resume Parser": "resume_parser",
            "🔍  Job Search":   "job_search",
            "📋  My Applications": "application_tracking",
        }
        for label, page_key in candidate_pages.items():
            if st.button(label, key=f"nav_{page_key}", use_container_width=True):
                st.session_state.current_page = page_key
                st.rerun()

    # ── Recruiter navigation ───────────────────────────────────────────────
    elif role == "recruiter":
        st.markdown(f'<p style="color:#10b981;font-size:0.8rem;font-weight:600;'
                    f'padding:0 4px;">💼 {st.session_state.user_name}</p>',
                    unsafe_allow_html=True)
        st.markdown('<p style="color:#64748b;font-size:0.72rem;font-weight:600;'
                    'text-transform:uppercase;letter-spacing:.06em;padding:4px 4px 0;">Recruiter</p>',
                    unsafe_allow_html=True)

        recruiter_pages = {
            "📊  Dashboard":       "recruiter_dashboard",
            "📝  Post a Job":      "job_posting",
            "👥  Candidate Ranking": "candidate_ranking",
            "📈  Analytics":       "analytics",
        }
        for label, page_key in recruiter_pages.items():
            if st.button(label, key=f"nav_{page_key}", use_container_width=True):
                st.session_state.current_page = page_key
                st.rerun()

    # ── Admin navigation ───────────────────────────────────────────────────
    elif role == "admin":
        st.markdown(f'<p style="color:#f59e0b;font-size:0.8rem;font-weight:600;'
                    f'padding:0 4px;">🛡️ {st.session_state.user_name}</p>',
                    unsafe_allow_html=True)
        st.markdown('<p style="color:#64748b;font-size:0.72rem;font-weight:600;'
                    'text-transform:uppercase;letter-spacing:.06em;padding:4px 4px 0;">Admin</p>',
                    unsafe_allow_html=True)

        admin_pages = {
            "🛡️  Admin Dashboard": "admin_dashboard",
            "📈  Analytics":       "analytics",
            "👥  All Candidates":  "candidate_ranking",
            "🔍  Job Search":      "job_search",
        }
        for label, page_key in admin_pages.items():
            if st.button(label, key=f"nav_{page_key}", use_container_width=True):
                st.session_state.current_page = page_key
                st.rerun()

    # ── Logout ─────────────────────────────────────────────────────────────
    if logged_in:
        st.divider()
        if st.button("🚪  Logout", use_container_width=True):
            logout()
            st.rerun()

    # ── Demo credentials hint ──────────────────────────────────────────────
    st.divider()
    st.markdown("""
    <div style="padding:12px;background:#0f1629;border:1px solid #1e3a5f;
                border-radius:10px;font-size:0.72rem;color:#64748b;">
        <p style="color:#94a3b8;font-weight:600;margin:0 0 6px;">🔐 Demo Logins</p>
        <p style="margin:2px 0;">candidate@hireai.com</p>
        <p style="margin:2px 0;">recruiter@hireai.com</p>
        <p style="margin:2px 0;">admin@hireai.com</p>
        <p style="margin:6px 0 0;color:#475569;">Password: <b>demo123</b></p>
    </div>
    """, unsafe_allow_html=True)

# ── Page Router ───────────────────────────────────────────────────────────
page = st.session_state.current_page

ROUTE_MAP = {
    "landing":              render_landing,
    "login":                render_login,
    "signup":               render_signup,
    "candidate_dashboard":  render_candidate_dashboard,
    "resume_parser":        render_resume_parser,
    "job_search":           render_job_search,
    "application_tracking": render_application_tracking,
    "recruiter_dashboard":  render_recruiter_dashboard,
    "job_posting":          render_job_posting,
    "candidate_ranking":    render_candidate_ranking,
    "analytics":            render_analytics,
    "admin_dashboard":      render_admin_dashboard,
}

renderer = ROUTE_MAP.get(page, render_landing)
renderer()
