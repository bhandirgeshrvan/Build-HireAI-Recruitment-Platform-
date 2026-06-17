"""
Resume Parser Page – upload PDF, show extracted skills / education /
experience, and an AI resume score.
"""

import streamlit as st
from utils.auth  import require_login
from utils.data  import get_mock_resume_data
from utils.styles import section_header


def _score_color(score: int) -> str:
    if score >= 80: return "#10b981"
    if score >= 60: return "#f59e0b"
    return "#ef4444"


def render() -> None:
    if not require_login(["candidate"]):
        return

    st.markdown(section_header(
        "📄 AI Resume Parser",
        "Upload your resume and let our AI extract structured insights.",
    ), unsafe_allow_html=True)

    # ── Upload zone ───────────────────────────────────────────────────────
    uploaded = st.file_uploader(
        "Upload Resume (PDF)",
        type=["pdf"],
        help="Only PDF supported. Demo data loads automatically.",
    )

    # Use mock data regardless of upload (demo)
    data = get_mock_resume_data()

    if uploaded:
        st.success(f"✅ **{uploaded.name}** uploaded. Parsing with AI…")
        with st.spinner("Running NLP extraction pipeline…"):
            import time; time.sleep(1.2)

    st.markdown("---")
    st.markdown("""
    <div style="background:rgba(37,99,235,0.08);border:1px solid rgba(37,99,235,0.2);
                border-radius:10px;padding:10px 16px;margin-bottom:20px;font-size:0.82rem;
                color:#60a5fa;">
        ℹ️ Demo mode: results below are generated from sample data.
    </div>
    """, unsafe_allow_html=True)

    # ── Header card ───────────────────────────────────────────────────────
    col_info, col_score = st.columns([3, 1])

    with col_info:
        st.markdown(f"""
        <div style="background:#111827;border:1px solid #1e3a5f;
                    border-radius:14px;padding:24px;">
            <h2 style="color:#f1f5f9;font-size:1.4rem;font-weight:700;margin:0 0 4px;">
                {data['name']}
            </h2>
            <p style="color:#60a5fa;font-size:0.88rem;margin:0 0 12px;">
                ✉️ {data['email']}  &nbsp;|&nbsp;  📞 {data['phone']}
                &nbsp;|&nbsp;  📍 {data['location']}
            </p>
            <p style="color:#94a3b8;font-size:0.88rem;line-height:1.6;margin:0;">
                {data['summary']}
            </p>
        </div>
        """, unsafe_allow_html=True)

    with col_score:
        score  = data["score"]
        color  = _score_color(score)
        label  = "Excellent" if score >= 80 else "Good" if score >= 60 else "Fair"
        st.markdown(f"""
        <div style="background:#111827;border:1px solid #1e3a5f;
                    border-radius:14px;padding:24px;text-align:center;height:100%;">
            <p style="color:#94a3b8;font-size:0.78rem;font-weight:600;
                      text-transform:uppercase;letter-spacing:.05em;margin:0 0 8px;">
                AI Resume Score
            </p>
            <div style="font-size:3rem;font-weight:800;color:{color};">{score}</div>
            <div style="color:{color};font-size:0.85rem;font-weight:600;">{label}</div>
        </div>
        """, unsafe_allow_html=True)

    # Score breakdown progress
    st.markdown("<br>", unsafe_allow_html=True)
    st.markdown("**Score Breakdown**")
    breakdown = {
        "Skills Match":          92,
        "Experience Relevance":  88,
        "Education":             75,
        "Resume Formatting":     85,
        "Keywords Optimisation": 78,
    }
    for label, val in breakdown.items():
        st.markdown(f"<small style='color:#94a3b8;'>{label}</small>", unsafe_allow_html=True)
        st.progress(val / 100)

    st.markdown("<br>", unsafe_allow_html=True)

    # ── Tabs: Skills / Experience / Education ─────────────────────────────
    tab_skills, tab_exp, tab_edu, tab_certs = st.tabs(
        ["🛠️ Skills", "💼 Experience", "🎓 Education", "📜 Certifications"]
    )

    with tab_skills:
        st.markdown("**Technical Skills**")
        tech_cols = st.columns(4)
        for i, skill in enumerate(data["skills"]["technical"]):
            with tech_cols[i % 4]:
                st.markdown(f"""
                <span style="display:inline-block;background:rgba(37,99,235,0.15);
                             color:#60a5fa;border:1px solid rgba(37,99,235,0.3);
                             border-radius:99px;padding:5px 14px;font-size:0.8rem;
                             font-weight:600;margin:4px 0;">{skill}</span>
                """, unsafe_allow_html=True)

        st.markdown("<br>**Soft Skills**", unsafe_allow_html=True)
        soft_cols = st.columns(4)
        for i, skill in enumerate(data["skills"]["soft"]):
            with soft_cols[i % 4]:
                st.markdown(f"""
                <span style="display:inline-block;background:rgba(16,185,129,0.12);
                             color:#10b981;border:1px solid rgba(16,185,129,0.25);
                             border-radius:99px;padding:5px 14px;font-size:0.8rem;
                             font-weight:600;margin:4px 0;">{skill}</span>
                """, unsafe_allow_html=True)

    with tab_exp:
        for exp in data["experience"]:
            st.markdown(f"""
            <div style="background:#111827;border:1px solid #1e3a5f;
                        border-left:3px solid #2563eb;border-radius:12px;
                        padding:20px;margin-bottom:16px;">
                <div style="display:flex;justify-content:space-between;
                            align-items:flex-start;margin-bottom:8px;">
                    <div>
                        <h4 style="color:#f1f5f9;font-size:1rem;font-weight:600;
                                   margin:0 0 2px;">{exp['title']}</h4>
                        <p style="color:#60a5fa;font-size:0.85rem;margin:0;">
                            {exp['company']}
                        </p>
                    </div>
                    <span style="color:#64748b;font-size:0.8rem;">{exp['dates']}</span>
                </div>
                <ul style="color:#94a3b8;font-size:0.85rem;margin:0;
                           padding-left:20px;line-height:1.7;">
                    {''.join(f"<li>{b}</li>" for b in exp['bullets'])}
                </ul>
            </div>
            """, unsafe_allow_html=True)

    with tab_edu:
        for edu in data["education"]:
            st.markdown(f"""
            <div style="background:#111827;border:1px solid #1e3a5f;
                        border-left:3px solid #8b5cf6;border-radius:12px;
                        padding:20px;margin-bottom:16px;">
                <h4 style="color:#f1f5f9;font-size:1rem;font-weight:600;margin:0 0 4px;">
                    {edu['degree']}
                </h4>
                <p style="color:#a78bfa;font-size:0.88rem;margin:0 0 4px;">
                    {edu['school']}
                </p>
                <p style="color:#64748b;font-size:0.82rem;margin:0;">
                    Graduated {edu['year']} &nbsp;·&nbsp; GPA {edu['gpa']}
                </p>
            </div>
            """, unsafe_allow_html=True)

    with tab_certs:
        for cert in data["certifications"]:
            st.markdown(f"""
            <div style="background:#111827;border:1px solid #1e3a5f;
                        border-left:3px solid #f59e0b;border-radius:10px;
                        padding:14px 18px;margin-bottom:10px;">
                <span style="color:#fbbf24;font-size:0.9rem;">🏅 {cert}</span>
            </div>
            """, unsafe_allow_html=True)
