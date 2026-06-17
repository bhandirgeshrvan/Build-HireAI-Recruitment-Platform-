"""
Analytics Dashboard – Plotly charts: hiring funnel, applications by month,
candidate sources, hiring success rate, time-to-hire, skills demand.
"""

import streamlit as st
import plotly.graph_objects as go
import plotly.express as px
import pandas as pd
import numpy as np
from utils.auth  import require_login
from utils.data  import (
    get_monthly_applications, get_hiring_funnel,
    get_candidate_sources, get_skills_demand, get_time_to_hire,
)
from utils.styles import section_header

# ── Shared chart layout ───────────────────────────────────────────────────
BASE_LAYOUT = dict(
    paper_bgcolor="rgba(0,0,0,0)",
    plot_bgcolor="rgba(0,0,0,0)",
    font=dict(color="#94a3b8", size=11, family="Inter"),
    margin=dict(l=10, r=10, t=30, b=10),
    legend=dict(bgcolor="rgba(0,0,0,0)", bordercolor="#1e3a5f"),
    xaxis=dict(gridcolor="#1e2d4a", zerolinecolor="#1e2d4a"),
    yaxis=dict(gridcolor="#1e2d4a", zerolinecolor="#1e2d4a"),
)


def _apply_base(fig: go.Figure, height: int = 300) -> go.Figure:
    fig.update_layout(**BASE_LAYOUT, height=height)
    return fig


def render() -> None:
    if not require_login(["recruiter", "admin"]):
        return

    st.markdown(section_header(
        "📈 Analytics Dashboard",
        "Comprehensive hiring metrics and performance insights.",
    ), unsafe_allow_html=True)

    # ── Date range selector ───────────────────────────────────────────────
    col_dr, col_grp, _ = st.columns([2, 1.5, 4])
    with col_dr:
        date_range = st.selectbox("Time Period",
                                  ["Last 30 days", "Last 3 months",
                                   "Last 6 months", "Last 12 months"])
    with col_grp:
        grouping = st.selectbox("Granularity", ["Monthly", "Weekly"])

    # ── KPI strip ─────────────────────────────────────────────────────────
    k1, k2, k3, k4, k5 = st.columns(5)
    with k1: st.metric("Total Applications", "18,904", "+12% MoM")
    with k2: st.metric("Total Hires",        "682",    "+8% MoM")
    with k3: st.metric("Avg Time-to-Hire",   "24 days", "-3 days")
    with k4: st.metric("Offer Accept Rate",  "71%",    "+4%")
    with k5: st.metric("Cost Per Hire",      "$3,240",  "-$180")

    st.markdown("<br>", unsafe_allow_html=True)

    # ── Row 1: Applications over time + Hiring Funnel ─────────────────────
    chart1, chart2 = st.columns(2)

    with chart1:
        st.markdown("""<p style="color:#f1f5f9;font-weight:600;margin-bottom:6px;">
                        📅 Applications & Hires by Month</p>""",
                    unsafe_allow_html=True)
        df = get_monthly_applications()
        fig = go.Figure()
        fig.add_trace(go.Bar(
            x=df["month"], y=df["applications"],
            name="Applications", marker_color="#2563eb", marker_line_width=0,
        ))
        fig.add_trace(go.Bar(
            x=df["month"], y=df["hires"],
            name="Hires", marker_color="#10b981", marker_line_width=0,
        ))
        fig.update_layout(barmode="group", **BASE_LAYOUT, height=300)
        st.plotly_chart(fig, use_container_width=True,
                        config={"displayModeBar": False})

    with chart2:
        st.markdown("""<p style="color:#f1f5f9;font-weight:600;margin-bottom:6px;">
                        🔻 Hiring Funnel</p>""",
                    unsafe_allow_html=True)
        df = get_hiring_funnel()
        fig = go.Figure(go.Funnel(
            y=df["stage"],
            x=df["count"],
            textinfo="value+percent initial",
            marker=dict(
                color=["#2563eb", "#7c3aed", "#f59e0b", "#10b981", "#22c55e"],
            ),
            connector=dict(line=dict(color="#1e2d4a", width=2)),
        ))
        fig.update_layout(**{k: v for k, v in BASE_LAYOUT.items()
                              if k not in ("xaxis", "yaxis")}, height=300)
        st.plotly_chart(fig, use_container_width=True,
                        config={"displayModeBar": False})

    # ── Row 2: Sources + Time-to-hire ─────────────────────────────────────
    chart3, chart4 = st.columns(2)

    with chart3:
        st.markdown("""<p style="color:#f1f5f9;font-weight:600;margin-bottom:6px;">
                        🌐 Candidate Sources</p>""",
                    unsafe_allow_html=True)
        df = get_candidate_sources()
        fig = go.Figure(go.Pie(
            labels=df["source"], values=df["count"],
            hole=0.55,
            marker=dict(colors=["#3b82f6","#10b981","#8b5cf6",
                                  "#f59e0b","#ef4444","#64748b"],
                        line=dict(color="#0a0e1a", width=2)),
            textinfo="label+percent",
            textfont=dict(color="#94a3b8", size=10),
        ))
        fig.update_layout(**{k: v for k, v in BASE_LAYOUT.items()
                              if k not in ("xaxis", "yaxis")},
                          height=300,
                          annotations=[dict(text="Sources", x=0.5, y=0.5,
                                            font_size=13, showarrow=False,
                                            font_color="#f1f5f9")])
        st.plotly_chart(fig, use_container_width=True,
                        config={"displayModeBar": False})

    with chart4:
        st.markdown("""<p style="color:#f1f5f9;font-weight:600;margin-bottom:6px;">
                        ⏱️ Average Time-to-Hire by Department (days)</p>""",
                    unsafe_allow_html=True)
        df = get_time_to_hire().sort_values("days")
        fig = go.Figure(go.Bar(
            x=df["days"], y=df["department"],
            orientation="h",
            marker_color="#6366f1", marker_line_width=0,
            text=df["days"].apply(lambda v: f"{v}d"),
            textposition="outside",
            textfont=dict(color="#94a3b8"),
        ))
        fig.update_layout(**BASE_LAYOUT, height=300,
                          xaxis=dict(gridcolor="#1e2d4a"),
                          yaxis=dict(gridcolor="rgba(0,0,0,0)"))
        st.plotly_chart(fig, use_container_width=True,
                        config={"displayModeBar": False})

    # ── Row 3: Skills demand + Hiring success trend ───────────────────────
    chart5, chart6 = st.columns(2)

    with chart5:
        st.markdown("""<p style="color:#f1f5f9;font-weight:600;margin-bottom:6px;">
                        🔧 Top Skills in Demand</p>""",
                    unsafe_allow_html=True)
        df = get_skills_demand()
        fig = go.Figure(go.Bar(
            x=df["demand"], y=df["skill"],
            orientation="h",
            marker=dict(
                color=df["demand"],
                colorscale=[[0, "#1e3a8a"], [1, "#3b82f6"]],
                showscale=False,
            ),
            marker_line_width=0,
        ))
        fig.update_layout(**BASE_LAYOUT, height=300,
                          xaxis=dict(gridcolor="#1e2d4a"),
                          yaxis=dict(gridcolor="rgba(0,0,0,0)"))
        st.plotly_chart(fig, use_container_width=True,
                        config={"displayModeBar": False})

    with chart6:
        st.markdown("""<p style="color:#f1f5f9;font-weight:600;margin-bottom:6px;">
                        📈 Hiring Success Rate (12 months)</p>""",
                    unsafe_allow_html=True)
        months = ["Jan","Feb","Mar","Apr","May","Jun",
                  "Jul","Aug","Sep","Oct","Nov","Dec"]
        rate   = [18,20,22,19,24,23,21,25,27,26,28,30]
        fig = go.Figure()
        fig.add_trace(go.Scatter(
            x=months, y=rate, mode="lines+markers",
            line=dict(color="#10b981", width=2.5),
            marker=dict(color="#10b981", size=6),
            fill="tozeroy",
            fillcolor="rgba(16,185,129,0.08)",
            name="Success Rate %",
        ))
        fig.update_layout(**BASE_LAYOUT, height=300,
                          yaxis=dict(ticksuffix="%", gridcolor="#1e2d4a"))
        st.plotly_chart(fig, use_container_width=True,
                        config={"displayModeBar": False})

    # ── Diversity metrics ─────────────────────────────────────────────────
    st.markdown("---")
    st.markdown("""<h3 style="color:#f1f5f9;font-size:1.05rem;font-weight:600;
                    margin:0 0 14px;">🌍 Diversity & Inclusion Metrics</h3>""",
                unsafe_allow_html=True)

    div_cols = st.columns(4)
    div_data = [
        ("Gender Balance",    "48% / 52%",  "Female / Male",       "#3b82f6"),
        ("Underrepresented",  "34%",         "of new hires",         "#8b5cf6"),
        ("Remote Hires",      "61%",         "of total hires",       "#10b981"),
        ("Referral Hires",    "22%",         "via employee referral", "#f59e0b"),
    ]
    for col, (label, value, sub, color) in zip(div_cols, div_data):
        with col:
            st.markdown(f"""
            <div style="background:#111827;border:1px solid #1e3a5f;
                        border-left:3px solid {color};border-radius:12px;
                        padding:16px;text-align:center;">
                <p style="color:#94a3b8;font-size:0.75rem;font-weight:600;
                           text-transform:uppercase;letter-spacing:.05em;margin:0 0 6px;">
                    {label}
                </p>
                <p style="color:{color};font-size:1.6rem;font-weight:700;margin:0 0 2px;">
                    {value}
                </p>
                <p style="color:#64748b;font-size:0.75rem;margin:0;">{sub}</p>
            </div>
            """, unsafe_allow_html=True)
