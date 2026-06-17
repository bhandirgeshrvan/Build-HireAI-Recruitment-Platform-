"""
Candidate Ranking Page – sortable table with AI match scores, plus
detailed candidate profile drawer.
"""

import streamlit as st
import pandas as pd
import plotly.graph_objects as go
from utils.auth  import require_login
from utils.data  import get_candidates, get_jobs
from utils.styles import section_header


def _score_badge(score: int) -> str:
    color = "#10b981" if score >= 80 else "#f59e0b" if score >= 60 else "#ef4444"
    label = "Top Match" if score >= 80 else "Good Fit" if score >= 60 else "Partial"
    return (
        f'<span style="background:{color}22;color:{color};border:1px solid {color}44;'
        f'border-radius:99px;padding:2px 10px;font-size:0.75rem;font-weight:600;">'
        f'{score}% · {label}</span>'
    )


def render() -> None:
    if not require_login(["recruiter", "admin"]):
        return

    st.markdown(section_header(
        "👥 Candidate Ranking",
        "AI-ranked candidates sorted by overall match score.",
    ), unsafe_allow_html=True)

    # ── Filter controls ───────────────────────────────────────────────────
    jobs_df = get_jobs(15)
    active_jobs = jobs_df[jobs_df["status"] == "Active"]["title"].tolist()

    f1, f2, f3, f4 = st.columns(4)
    with f1:
        selected_job = st.selectbox("Filter by Job", ["All Jobs"] + active_jobs)
    with f2:
        min_score = st.slider("Min Match Score", 0, 100, 60)
    with f3:
        status_filter = st.selectbox(
            "Stage",
            ["All", "Applied", "Screening", "Interview", "Offer", "Hired"],
        )
    with f4:
        sort_col = st.selectbox("Sort by",
                                ["match_score", "experience", "salary_exp"])

    # ── Load candidates ───────────────────────────────────────────────────
    cands = get_candidates(20)
    cands = cands[cands["match_score"] >= min_score]

    if status_filter != "All":
        cands = cands[cands["status"] == status_filter]

    cands = cands.sort_values(sort_col, ascending=False).reset_index(drop=True)
    cands.index += 1  # 1-based rank

    # ── Stats strip ───────────────────────────────────────────────────────
    k1, k2, k3, k4 = st.columns(4)
    with k1: st.metric("Total Candidates",  len(cands))
    with k2: st.metric("Avg Match Score",   f"{cands['match_score'].mean():.0f}%")
    with k3: st.metric("Top Matches (≥80)", (cands["match_score"] >= 80).sum())
    with k4: st.metric("Avg Experience",    f"{cands['experience'].mean():.1f} yrs")

    st.markdown("<br>", unsafe_allow_html=True)

    # ── Spider / radar chart for top candidate ────────────────────────────
    left_chart, right_chart = st.columns(2)

    with left_chart:
        st.markdown("""<p style="color:#f1f5f9;font-weight:600;font-size:0.95rem;
                        margin-bottom:8px;">🏆 Score Distribution</p>""",
                    unsafe_allow_html=True)
        bins = [
            "90-100", "80-89", "70-79", "60-69", "50-59", "<50",
        ]
        counts = [
            (cands["match_score"] >= 90).sum(),
            ((cands["match_score"] >= 80) & (cands["match_score"] < 90)).sum(),
            ((cands["match_score"] >= 70) & (cands["match_score"] < 80)).sum(),
            ((cands["match_score"] >= 60) & (cands["match_score"] < 70)).sum(),
            ((cands["match_score"] >= 50) & (cands["match_score"] < 60)).sum(),
            (cands["match_score"] < 50).sum(),
        ]
        fig = go.Figure(go.Bar(
            x=bins, y=counts,
            marker_color=["#10b981","#3b82f6","#6366f1","#f59e0b","#f97316","#ef4444"],
            marker_line_width=0,
        ))
        fig.update_layout(
            paper_bgcolor="rgba(0,0,0,0)", plot_bgcolor="rgba(0,0,0,0)",
            margin=dict(l=0, r=0, t=8, b=0), height=220,
            xaxis=dict(showgrid=False, tickfont=dict(color="#64748b", size=10)),
            yaxis=dict(showgrid=True, gridcolor="#1e3a5f",
                       tickfont=dict(color="#64748b", size=10)),
        )
        st.plotly_chart(fig, use_container_width=True,
                        config={"displayModeBar": False})

    with right_chart:
        # Radar for top candidate
        top = cands.iloc[0]
        st.markdown(f"""<p style="color:#f1f5f9;font-weight:600;font-size:0.95rem;
                        margin-bottom:8px;">🎯 Top Candidate: {top['name']}</p>""",
                    unsafe_allow_html=True)

        categories = ["Skills", "Experience", "Education", "Communication", "Culture"]
        values     = [92, min(top["experience"] * 8, 100), 85, 78, 88]
        values    += [values[0]]  # close loop
        categories += [categories[0]]

        fig = go.Figure(go.Scatterpolar(
            r=values, theta=categories, fill="toself",
            fillcolor="rgba(37,99,235,0.2)",
            line=dict(color="#3b82f6", width=2),
        ))
        fig.update_layout(
            polar=dict(
                bgcolor="rgba(0,0,0,0)",
                radialaxis=dict(visible=True, range=[0, 100],
                                gridcolor="#1e3a5f", tickfont=dict(color="#64748b", size=9)),
                angularaxis=dict(tickfont=dict(color="#94a3b8", size=10),
                                 gridcolor="#1e3a5f"),
            ),
            paper_bgcolor="rgba(0,0,0,0)",
            margin=dict(l=20, r=20, t=8, b=8), height=220,
            showlegend=False,
        )
        st.plotly_chart(fig, use_container_width=True,
                        config={"displayModeBar": False})

    st.markdown("---")

    # ── Ranking table ─────────────────────────────────────────────────────
    st.markdown("""<h3 style="color:#f1f5f9;font-size:1.05rem;font-weight:600;
                    margin:0 0 14px;">📋 Ranked Candidates</h3>""",
                unsafe_allow_html=True)

    for idx, row in cands.iterrows():
        rank_color = (
            "#f59e0b" if idx == 1
            else "#94a3b8" if idx == 2
            else "#cd7f32" if idx == 3
            else "#475569"
        )
        rank_icon  = "🥇" if idx == 1 else "🥈" if idx == 2 else "🥉" if idx == 3 else f"#{idx}"

        st.markdown(f"""
        <div style="background:#111827;border:1px solid #1e3a5f;
                    border-radius:12px;padding:16px 20px;margin-bottom:10px;">
            <div style="display:flex;justify-content:space-between;align-items:center;
                        flex-wrap:wrap;gap:10px;">
                <div style="display:flex;align-items:center;gap:14px;">
                    <span style="color:{rank_color};font-size:1.2rem;font-weight:700;
                                 min-width:40px;">{rank_icon}</span>
                    <div>
                        <p style="color:#f1f5f9;font-weight:600;font-size:0.95rem;margin:0;">
                            {row['name']}
                        </p>
                        <p style="color:#60a5fa;font-size:0.8rem;margin:2px 0 0;">
                            {row['role']}  ·  {row['experience']} yrs exp  ·  {row['education']}
                        </p>
                    </div>
                </div>
                <div style="display:flex;align-items:center;gap:12px;">
                    {_score_badge(row['match_score'])}
                    <span style="color:#64748b;font-size:0.8rem;">
                        📍 {row['location']}
                    </span>
                    <span style="color:#64748b;font-size:0.8rem;">
                        💰 ${row['salary_exp']:,}
                    </span>
                </div>
            </div>
            <p style="color:#475569;font-size:0.78rem;margin:8px 0 0;">
                🔧 {row['skills']}
            </p>
        </div>
        """, unsafe_allow_html=True)

        action1, action2, action3, _ = st.columns([1, 1, 1, 4])
        with action1:
            if st.button("📧 Invite", key=f"invite_{row['id']}"):
                st.success(f"Invitation sent to {row['name']}!")
        with action2:
            if st.button("⏭️ Advance", key=f"advance_{row['id']}"):
                st.info(f"{row['name']} moved to next stage.")
        with action3:
            if st.button("❌ Reject", key=f"reject_{row['id']}"):
                st.warning(f"{row['name']} marked as rejected.")
