"""
Candidate Dashboard – profile completion, jobs, interviews, match score,
recommended jobs table, and resume upload section.
"""

import streamlit as st
import pandas as pd
from utils.auth  import require_login
from utils.data  import get_jobs
from utils.styles import section_header, card


def _profile_completion_gauge(pct: int) -> str:
    """Render a circular-style progress indicator as HTML."""
    color = "#10b981" if pct >= 80 else "#f59e0b" if pct >= 50 else "#ef4444"
    return f"""
    <div style="text-align:center;padding:16px 0;">
        <div style="position:relative;display:inline-block;width:100px;height:100px;">
            <svg viewBox="0 0 36 36" style="width:100px;height:100px;transform:rotate(-90deg);">
                <circle cx="18" cy="18" r="15.9"
                    fill="none" stroke="#1e3a5f" stroke-width="3"/>
                <circle cx="18" cy="18" r="15.9"
                    fill="none" stroke="{color}" stroke-width="3"
                    stroke-dasharray="{pct} {100 - pct}"
                    stroke-linecap="round"/>
            </svg>
            <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);
                        color:#f1f5f9;font-size:1.2rem;font-weight:700;">{pct}%</div>
        </div>
        <p style="color:#94a3b8;font-size:0.8rem;margin:8px 0 0;">Profile Complete</p>
    </div>
    """


def render() -> None:
    if not require_login(["candidate"]):
        return

    name = st.session_state.user_name
    st.markdown(section_header(
        f"Welcome back, {name} 👋",
        "Here's a snapshot of your job search activity.",
    ), unsafe_allow_html=True)

    # ── KPI row ──────────────────────────────────────────────────────────
    col1, col2, col3, col4 = st.columns(4)
    with col1:
        st.metric("Applied Jobs",       "12",   "+3 this week")
    with col2:
        st.metric("Interview Invites",  "4",    "+1 new")
    with col3:
        st.metric("Avg Match Score",    "82%",  "+5%")
    with col4:
        st.metric("Profile Views",      "147",  "+22 this week")

    st.markdown("<br>", unsafe_allow_html=True)

    # ── Profile card + quick actions ─────────────────────────────────────
    left, right = st.columns([1, 2])

    with left:
        st.markdown("""
        <div style="background:#111827;border:1px solid #1e3a5f;
                    border-radius:14px;padding:20px;text-align:center;">
            <div style="width:72px;height:72px;border-radius:50%;
                        background:linear-gradient(135deg,#2563eb,#7c3aed);
                        display:flex;align-items:center;justify-content:center;
                        font-size:1.8rem;margin:0 auto 12px;">👤</div>
            <h3 style="color:#f1f5f9;font-size:1.05rem;font-weight:600;margin:0 0 4px;">
                Alex Johnson
            </h3>
            <p style="color:#64748b;font-size:0.8rem;margin:0 0 12px;">
                Senior Software Engineer
            </p>
        </div>
        """, unsafe_allow_html=True)
        st.markdown(_profile_completion_gauge(72), unsafe_allow_html=True)
        st.markdown("""
        <div style="background:#111827;border:1px solid #1e3a5f;
                    border-radius:10px;padding:12px 16px;margin-top:8px;">
            <p style="color:#94a3b8;font-size:0.78rem;font-weight:600;margin:0 0 8px;
                      text-transform:uppercase;letter-spacing:.05em;">Complete your profile</p>
            <p style="color:#ef4444;font-size:0.8rem;margin:3px 0;">✗ Add portfolio link</p>
            <p style="color:#ef4444;font-size:0.8rem;margin:3px 0;">✗ Upload resume</p>
            <p style="color:#10b981;font-size:0.8rem;margin:3px 0;">✓ Work experience</p>
            <p style="color:#10b981;font-size:0.8rem;margin:3px 0;">✓ Skills added</p>
            <p style="color:#10b981;font-size:0.8rem;margin:3px 0;">✓ Education</p>
        </div>
        """, unsafe_allow_html=True)

    with right:
        # Active interview invitations
        st.markdown("""
        <h3 style="color:#f1f5f9;font-size:1.05rem;font-weight:600;margin:0 0 14px;">
            📅 Interview Invitations
        </h3>
        """, unsafe_allow_html=True)

        interviews = [
            ("Stripe",    "Senior SWE",      "Tomorrow, 2:00 PM",  "#10b981"),
            ("Shopify",   "Backend Eng.",    "Thu, Jun 20 @ 10 AM", "#3b82f6"),
            ("Airbnb",    "Full Stack Dev",  "Fri, Jun 21 @ 3 PM",  "#8b5cf6"),
            ("Netflix",   "Platform Eng.",   "Pending Schedule",    "#f59e0b"),
        ]
        for company, role, time, color in interviews:
            st.markdown(f"""
            <div style="background:#0f1629;border:1px solid #1e3a5f;
                        border-left:3px solid {color};border-radius:10px;
                        padding:12px 16px;margin-bottom:8px;
                        display:flex;justify-content:space-between;align-items:center;">
                <div>
                    <span style="color:#f1f5f9;font-weight:600;font-size:0.9rem;">
                        {company}
                    </span>
                    <span style="color:#64748b;font-size:0.8rem;margin-left:8px;">{role}</span>
                </div>
                <span style="color:{color};font-size:0.8rem;font-weight:500;">{time}</span>
            </div>
            """, unsafe_allow_html=True)

    st.markdown("<br>", unsafe_allow_html=True)

    # ── Recommended Jobs ──────────────────────────────────────────────────
    st.markdown("""
    <h3 style="color:#f1f5f9;font-size:1.1rem;font-weight:600;margin:0 0 14px;">
        🎯 Recommended Jobs for You
    </h3>
    """, unsafe_allow_html=True)

    jobs_df = get_jobs(8)
    display = jobs_df[["title", "company", "location", "salary_min",
                        "salary_max", "experience", "match_score"]].copy()
    display.columns = ["Title", "Company", "Location",
                        "Min Salary ($)", "Max Salary ($)", "Experience", "Match %"]
    display["Match %"] = display["Match %"].apply(lambda x: f"{x}%")
    display["Min Salary ($)"] = display["Min Salary ($)"].apply(lambda x: f"${x:,}")
    display["Max Salary ($)"] = display["Max Salary ($)"].apply(lambda x: f"${x:,}")
    st.dataframe(display, use_container_width=True, hide_index=True)

    st.markdown("<br>", unsafe_allow_html=True)

    # ── Resume Upload ─────────────────────────────────────────────────────
    st.markdown("""
    <h3 style="color:#f1f5f9;font-size:1.1rem;font-weight:600;margin:0 0 14px;">
        📎 Upload / Update Resume
    </h3>
    """, unsafe_allow_html=True)

    uploaded = st.file_uploader(
        "Drop your PDF resume here",
        type=["pdf"],
        help="PDF format preferred. Max 10 MB.",
    )
    if uploaded:
        st.success(f"✅ '{uploaded.name}' uploaded successfully! "
                   "Go to Resume Parser to view extracted details.")
        if st.button("📄 Parse My Resume"):
            st.session_state.current_page = "resume_parser"
            st.rerun()
