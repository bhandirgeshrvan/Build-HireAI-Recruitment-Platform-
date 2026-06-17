"""
Recruiter Dashboard – active jobs, candidates, interviews, hiring rate,
plus recent activity and quick actions.
"""

import streamlit as st
import plotly.graph_objects as go
import pandas as pd
import numpy as np
from utils.auth  import require_login
from utils.data  import get_jobs, get_candidates
from utils.styles import section_header


def _mini_bar(df: pd.DataFrame, x: str, y: str, color: str) -> go.Figure:
    fig = go.Figure(go.Bar(
        x=df[x], y=df[y],
        marker_color=color,
        marker_line_width=0,
    ))
    fig.update_layout(
        paper_bgcolor="rgba(0,0,0,0)",
        plot_bgcolor="rgba(0,0,0,0)",
        margin=dict(l=0, r=0, t=8, b=0),
        height=180,
        xaxis=dict(showgrid=False, tickfont=dict(color="#64748b", size=10)),
        yaxis=dict(showgrid=True, gridcolor="#1e3a5f",
                   tickfont=dict(color="#64748b", size=10)),
        showlegend=False,
    )
    return fig


def render() -> None:
    if not require_login(["recruiter"]):
        return

    name = st.session_state.user_name
    st.markdown(section_header(
        f"Welcome, {name} 💼",
        "Manage your job listings, review candidates, and track hiring progress.",
    ), unsafe_allow_html=True)

    # ── KPIs ──────────────────────────────────────────────────────────────
    col1, col2, col3, col4 = st.columns(4)
    with col1:
        st.metric("Active Jobs",          "14",    "+2 this week")
    with col2:
        st.metric("Total Candidates",     "387",   "+42 this week")
    with col3:
        st.metric("Scheduled Interviews", "18",    "+5 today")
    with col4:
        st.metric("Hiring Rate",          "22%",   "+3%")

    st.markdown("<br>", unsafe_allow_html=True)

    # ── Pipeline funnel strip ─────────────────────────────────────────────
    stages = ["Applied", "Screened", "Interview", "Offer", "Hired"]
    counts = [387, 210, 86, 28, 19]
    colors = ["#3b82f6", "#8b5cf6", "#f59e0b", "#10b981", "#22c55e"]

    stage_cols = st.columns(5)
    for col, stage, count, color in zip(stage_cols, stages, counts, colors):
        with col:
            st.markdown(f"""
            <div style="background:#111827;border:1px solid #1e3a5f;
                        border-top:3px solid {color};border-radius:12px;
                        padding:16px;text-align:center;">
                <div style="color:{color};font-size:1.8rem;font-weight:700;">{count}</div>
                <div style="color:#94a3b8;font-size:0.78rem;font-weight:600;
                            text-transform:uppercase;letter-spacing:.04em;">{stage}</div>
            </div>
            """, unsafe_allow_html=True)

    st.markdown("<br>", unsafe_allow_html=True)

    # ── Charts row ────────────────────────────────────────────────────────
    chart_left, chart_right = st.columns(2)

    with chart_left:
        st.markdown("""<p style="color:#f1f5f9;font-weight:600;font-size:0.95rem;
                        margin-bottom:8px;">📊 Applications This Week</p>""",
                    unsafe_allow_html=True)
        days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
        apps = [42, 58, 51, 73, 67, 29, 18]
        fig = _mini_bar(
            pd.DataFrame({"day": days, "apps": apps}),
            "day", "apps", "#2563eb",
        )
        st.plotly_chart(fig, use_container_width=True, config={"displayModeBar": False})

    with chart_right:
        st.markdown("""<p style="color:#f1f5f9;font-weight:600;font-size:0.95rem;
                        margin-bottom:8px;">🎯 Hires by Department</p>""",
                    unsafe_allow_html=True)
        depts = ["Engineering", "Product", "Design", "Sales", "Data"]
        hires = [8, 3, 2, 4, 2]
        fig = _mini_bar(
            pd.DataFrame({"dept": depts, "hires": hires}),
            "dept", "hires", "#10b981",
        )
        st.plotly_chart(fig, use_container_width=True, config={"displayModeBar": False})

    # ── Active Jobs table ─────────────────────────────────────────────────
    st.markdown("""<h3 style="color:#f1f5f9;font-size:1.05rem;font-weight:600;
                    margin:8px 0 14px;">📌 Active Job Listings</h3>""",
                unsafe_allow_html=True)

    jobs_df = get_jobs(10)
    active  = jobs_df[jobs_df["status"] == "Active"].head(8)
    display = active[["title", "location", "type", "experience",
                       "applicants", "posted_days"]].copy()
    display.columns = ["Role", "Location", "Type", "Experience",
                        "Applicants", "Posted (days ago)"]
    st.dataframe(display, use_container_width=True, hide_index=True)

    col_post, col_rank, _ = st.columns([1, 1, 3])
    with col_post:
        if st.button("➕ Post New Job", use_container_width=True):
            st.session_state.current_page = "job_posting"
            st.rerun()
    with col_rank:
        if st.button("👥 View Rankings", use_container_width=True):
            st.session_state.current_page = "candidate_ranking"
            st.rerun()

    st.markdown("<br>", unsafe_allow_html=True)

    # ── Today's schedule ──────────────────────────────────────────────────
    st.markdown("""<h3 style="color:#f1f5f9;font-size:1.05rem;font-weight:600;
                    margin:0 0 14px;">📅 Today's Interviews</h3>""",
                unsafe_allow_html=True)

    schedule = [
        ("10:00 AM", "Alex Johnson",    "Senior SWE",      "Technical Round"),
        ("11:30 AM", "Maria Garcia",    "Data Scientist",  "Final Round"),
        ("02:00 PM", "James Wilson",    "DevOps Engineer", "Technical Round"),
        ("04:00 PM", "Sarah Chen",      "PM",              "Culture Fit"),
    ]
    for time, candidate, role, round_type in schedule:
        st.markdown(f"""
        <div style="background:#111827;border:1px solid #1e3a5f;
                    border-radius:10px;padding:12px 18px;margin-bottom:8px;
                    display:flex;justify-content:space-between;align-items:center;">
            <div>
                <span style="color:#3b82f6;font-weight:600;font-size:0.9rem;
                             margin-right:16px;">{time}</span>
                <span style="color:#f1f5f9;font-weight:500;font-size:0.9rem;">
                    {candidate}
                </span>
                <span style="color:#64748b;font-size:0.82rem;margin-left:8px;">
                    · {role}
                </span>
            </div>
            <span style="background:rgba(139,92,246,0.15);color:#a78bfa;
                         border:1px solid rgba(139,92,246,0.3);border-radius:99px;
                         padding:3px 12px;font-size:0.75rem;font-weight:600;">
                {round_type}
            </span>
        </div>
        """, unsafe_allow_html=True)
