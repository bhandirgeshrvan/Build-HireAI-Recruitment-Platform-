"""
Admin Dashboard – platform-wide stats, user management, revenue, system health.
"""

import streamlit as st
import plotly.graph_objects as go
import pandas as pd
import numpy as np
from utils.auth  import require_login
from utils.data  import get_admin_stats, get_revenue_data, get_candidates, get_jobs
from utils.styles import section_header

BASE_LAYOUT = dict(
    paper_bgcolor="rgba(0,0,0,0)",
    plot_bgcolor="rgba(0,0,0,0)",
    font=dict(color="#94a3b8", size=11, family="Inter"),
    margin=dict(l=10, r=10, t=30, b=10),
    xaxis=dict(gridcolor="#1e2d4a"),
    yaxis=dict(gridcolor="#1e2d4a"),
)


def render() -> None:
    if not require_login(["admin"]):
        return

    stats = get_admin_stats()

    st.markdown(section_header(
        "🛡️ Admin Dashboard",
        "Platform-wide overview — users, jobs, revenue and system health.",
    ), unsafe_allow_html=True)

    # ── Top KPIs ──────────────────────────────────────────────────────────
    k1, k2, k3, k4 = st.columns(4)
    with k1: st.metric("Total Users",    f"{stats['total_users']:,}",  "+142 this month")
    with k2: st.metric("Recruiters",     f"{stats['recruiters']:,}",   "+12 this month")
    with k3: st.metric("Jobs Posted",    f"{stats['jobs_posted']:,}",  "+87 this month")
    with k4: st.metric("Total Hires",    f"{stats['hires']:,}",        "+34 this month")

    st.markdown("<br>", unsafe_allow_html=True)

    k5, k6, k7, k8 = st.columns(4)
    with k5: st.metric("Monthly Revenue", f"${stats['monthly_revenue']:,}", "+$2,400")
    with k6: st.metric("ARR",             f"${stats['arr']:,}",             "+18%")
    with k7: st.metric("Active Jobs",     f"{stats['active_jobs']:,}",      "-12")
    with k8: st.metric("Churn Rate",      f"{stats['churn_rate']}%",        "-0.3%")

    st.markdown("<br>", unsafe_allow_html=True)

    # ── Revenue charts ────────────────────────────────────────────────────
    rev_left, rev_right = st.columns(2)

    with rev_left:
        st.markdown("""<p style="color:#f1f5f9;font-weight:600;margin-bottom:6px;">
                        💰 Monthly Revenue (USD)</p>""",
                    unsafe_allow_html=True)
        df = get_revenue_data()
        fig = go.Figure()
        fig.add_trace(go.Scatter(
            x=df["month"], y=df["revenue"],
            mode="lines+markers",
            line=dict(color="#10b981", width=2.5),
            marker=dict(color="#10b981", size=6),
            fill="tozeroy",
            fillcolor="rgba(16,185,129,0.08)",
        ))
        fig.update_layout(**BASE_LAYOUT, height=260,
                          yaxis=dict(tickprefix="$", gridcolor="#1e2d4a"))
        st.plotly_chart(fig, use_container_width=True,
                        config={"displayModeBar": False})

    with rev_right:
        st.markdown("""<p style="color:#f1f5f9;font-weight:600;margin-bottom:6px;">
                        👤 User Growth</p>""",
                    unsafe_allow_html=True)
        df = get_revenue_data()
        fig = go.Figure(go.Bar(
            x=df["month"], y=df["users"],
            marker_color="#6366f1", marker_line_width=0,
        ))
        fig.update_layout(**BASE_LAYOUT, height=260)
        st.plotly_chart(fig, use_container_width=True,
                        config={"displayModeBar": False})

    # ── User breakdown ────────────────────────────────────────────────────
    st.markdown("---")
    left_tbl, right_tbl = st.columns(2)

    with left_tbl:
        st.markdown("""<h3 style="color:#f1f5f9;font-size:1.05rem;font-weight:600;
                        margin:0 0 14px;">👥 Recent Users</h3>""",
                    unsafe_allow_html=True)
        cands = get_candidates(8)
        display = cands[["name", "role", "location", "applied_date"]].copy()
        display.columns = ["Name", "Role", "Location", "Joined"]
        display["Joined"] = display["Joined"].dt.strftime("%b %d, %Y")
        st.dataframe(display, use_container_width=True, hide_index=True)

    with right_tbl:
        st.markdown("""<h3 style="color:#f1f5f9;font-size:1.05rem;font-weight:600;
                        margin:0 0 14px;">📋 Top Active Jobs</h3>""",
                    unsafe_allow_html=True)
        jobs = get_jobs(8)
        display = jobs[["title", "company", "applicants", "status"]].copy()
        display.columns = ["Title", "Company", "Applicants", "Status"]
        st.dataframe(display, use_container_width=True, hide_index=True)

    # ── System health ─────────────────────────────────────────────────────
    st.markdown("---")
    st.markdown("""<h3 style="color:#f1f5f9;font-size:1.05rem;font-weight:600;
                    margin:0 0 16px;">🖥️ System Health</h3>""",
                unsafe_allow_html=True)

    sys_cols = st.columns(4)
    sys_metrics = [
        ("API Uptime",         "99.98%",  "#10b981", 99.98),
        ("Avg Response Time",  "142 ms",  "#3b82f6",  85),
        ("DB CPU Usage",       "34%",     "#f59e0b",  34),
        ("Error Rate",         "0.02%",   "#10b981",  0.02 * 10),
    ]
    for col, (label, value, color, bar_val) in zip(sys_cols, sys_metrics):
        with col:
            st.markdown(f"""
            <div style="background:#111827;border:1px solid #1e3a5f;
                        border-radius:12px;padding:16px;">
                <p style="color:#94a3b8;font-size:0.75rem;font-weight:600;
                           text-transform:uppercase;letter-spacing:.05em;margin:0 0 8px;">
                    {label}
                </p>
                <p style="color:{color};font-size:1.5rem;font-weight:700;margin:0 0 10px;">
                    {value}
                </p>
            </div>
            """, unsafe_allow_html=True)
            st.progress(min(bar_val / 100, 1.0))

    st.markdown("<br>", unsafe_allow_html=True)

    # ── Subscription tiers ────────────────────────────────────────────────
    st.markdown("""<h3 style="color:#f1f5f9;font-size:1.05rem;font-weight:600;
                    margin:0 0 16px;">💳 Subscription Breakdown</h3>""",
                unsafe_allow_html=True)

    tiers = [
        ("Free",       1_842, "0",       "#64748b"),
        ("Starter",      896, "$49/mo",  "#3b82f6"),
        ("Growth",       312, "$149/mo", "#8b5cf6"),
        ("Enterprise",    92, "$499/mo", "#f59e0b"),
    ]
    tier_cols = st.columns(4)
    for col, (tier, users, price, color) in zip(tier_cols, tiers):
        with col:
            st.markdown(f"""
            <div style="background:#111827;border:1px solid #1e3a5f;
                        border-left:3px solid {color};border-radius:12px;
                        padding:16px;text-align:center;">
                <p style="color:{color};font-size:0.85rem;font-weight:600;margin:0 0 6px;">
                    {tier}
                </p>
                <p style="color:#f1f5f9;font-size:1.6rem;font-weight:700;margin:0 0 2px;">
                    {users:,}
                </p>
                <p style="color:#64748b;font-size:0.78rem;margin:0;">
                    accounts · {price}
                </p>
            </div>
            """, unsafe_allow_html=True)

    st.markdown("<br>", unsafe_allow_html=True)

    # ── Admin quick actions ───────────────────────────────────────────────
    st.markdown("""<h3 style="color:#f1f5f9;font-size:1.05rem;font-weight:600;
                    margin:0 0 14px;">⚡ Quick Actions</h3>""",
                unsafe_allow_html=True)

    a1, a2, a3, a4 = st.columns(4)
    with a1:
        if st.button("📧 Send Platform Announcement", use_container_width=True):
            st.success("Announcement queued for delivery!")
    with a2:
        if st.button("🔄 Rebuild AI Index",           use_container_width=True):
            st.info("AI re-index job triggered. ETA: ~4 min.")
    with a3:
        if st.button("📥 Export User CSV",             use_container_width=True):
            st.info("Export queued — you'll receive an email.")
    with a4:
        if st.button("🧹 Clear Cache",                 use_container_width=True):
            st.success("Application cache cleared.")
