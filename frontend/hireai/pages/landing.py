"""
Landing Page – Hero, Features, Statistics, CTA
"""

import streamlit as st
from utils.styles import hero_gradient, badge


def render() -> None:
    # ── Hero ─────────────────────────────────────────────────────────────
    st.markdown(hero_gradient(), unsafe_allow_html=True)

    col1, col2, col3 = st.columns(3)
    with col1:
        if st.button("🚀  Get Started Free", use_container_width=True):
            st.session_state.current_page = "signup"
            st.rerun()
    with col2:
        if st.button("🔑  Login", use_container_width=True):
            st.session_state.current_page = "login"
            st.rerun()
    with col3:
        if st.button("🔍  Browse Jobs", use_container_width=True):
            st.session_state.current_page = "job_search"
            st.rerun()

    st.markdown("<br>", unsafe_allow_html=True)

    # ── Statistics strip ──────────────────────────────────────────────────
    st.markdown("""
    <div style="background:linear-gradient(135deg,#111827,#1a2744);
                border:1px solid #1e3a5f;border-radius:14px;
                padding:28px 32px;margin-bottom:32px;">
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;text-align:center;">
            <div>
                <p style="color:#3b82f6;font-size:2.2rem;font-weight:800;margin:0;">50K+</p>
                <p style="color:#94a3b8;font-size:0.82rem;margin:4px 0 0;">Active Candidates</p>
            </div>
            <div>
                <p style="color:#10b981;font-size:2.2rem;font-weight:800;margin:0;">2.8K+</p>
                <p style="color:#94a3b8;font-size:0.82rem;margin:4px 0 0;">Companies Hiring</p>
            </div>
            <div>
                <p style="color:#8b5cf6;font-size:2.2rem;font-weight:800;margin:0;">94%</p>
                <p style="color:#94a3b8;font-size:0.82rem;margin:4px 0 0;">Match Accuracy</p>
            </div>
            <div>
                <p style="color:#f59e0b;font-size:2.2rem;font-weight:800;margin:0;">12 days</p>
                <p style="color:#94a3b8;font-size:0.82rem;margin:4px 0 0;">Avg. Time-to-Hire</p>
            </div>
        </div>
    </div>
    """, unsafe_allow_html=True)

    # ── Features grid ─────────────────────────────────────────────────────
    st.markdown("""
    <h2 style="color:#f1f5f9;font-size:1.7rem;font-weight:700;
               text-align:center;margin-bottom:8px;">
        Why teams choose HireAI
    </h2>
    <p style="color:#64748b;text-align:center;margin-bottom:28px;">
        Everything you need to hire the best people, faster.
    </p>
    """, unsafe_allow_html=True)

    features = [
        ("🤖", "AI Resume Screening",
         "Our NLP engine reads every resume in seconds and surfaces the best matches automatically."),
        ("🎯", "Smart Candidate Ranking",
         "Multi-dimensional scoring across skills, experience, culture fit, and salary expectations."),
        ("📊", "Real-time Analytics",
         "Live dashboards showing funnel metrics, source performance, and diversity insights."),
        ("💬", "Automated Outreach",
         "Personalised email sequences triggered by candidate stage changes — no manual work."),
        ("🔗", "ATS Integrations",
         "Connect with Greenhouse, Lever, Workday, and 20+ other tools out of the box."),
        ("🔒", "Enterprise Security",
         "SOC 2 Type II certified, GDPR compliant, SSO and role-based access controls."),
    ]

    for i in range(0, len(features), 3):
        cols = st.columns(3)
        for j, col in enumerate(cols):
            if i + j < len(features):
                icon, title, desc = features[i + j]
                with col:
                    st.markdown(f"""
                    <div style="background:#111827;border:1px solid #1e3a5f;
                                border-radius:12px;padding:24px;height:100%;
                                transition:border-color .2s;">
                        <div style="font-size:2rem;margin-bottom:12px;">{icon}</div>
                        <h3 style="color:#f1f5f9;font-size:1rem;font-weight:600;margin:0 0 8px;">
                            {title}
                        </h3>
                        <p style="color:#64748b;font-size:0.85rem;line-height:1.5;margin:0;">
                            {desc}
                        </p>
                    </div>
                    """, unsafe_allow_html=True)

    st.markdown("<br>", unsafe_allow_html=True)

    # ── Testimonials ──────────────────────────────────────────────────────
    st.markdown("""
    <h2 style="color:#f1f5f9;font-size:1.5rem;font-weight:700;
               text-align:center;margin-bottom:24px;">
        Trusted by leading teams
    </h2>
    """, unsafe_allow_html=True)

    testimonials = [
        ("Sarah K.", "Head of Talent @ Stripe",
         "HireAI cut our time-to-hire by 60%. The AI match scores are eerily accurate."),
        ("Marcus T.", "Engineering Director @ Shopify",
         "We went from reviewing 500 resumes manually to getting a ranked shortlist in minutes."),
        ("Priya M.", "People Ops @ Airbnb",
         "The analytics dashboard gave us visibility we never had before. Highly recommend."),
    ]
    cols = st.columns(3)
    for col, (name, role, quote) in zip(cols, testimonials):
        with col:
            st.markdown(f"""
            <div style="background:#0f1629;border:1px solid #1e3a5f;
                        border-radius:12px;padding:20px;">
                <p style="color:#94a3b8;font-size:0.88rem;line-height:1.6;
                           font-style:italic;margin:0 0 16px;">"{quote}"</p>
                <p style="color:#f1f5f9;font-weight:600;font-size:0.85rem;margin:0;">{name}</p>
                <p style="color:#475569;font-size:0.75rem;margin:2px 0 0;">{role}</p>
            </div>
            """, unsafe_allow_html=True)

    st.markdown("<br>", unsafe_allow_html=True)

    # ── CTA banner ────────────────────────────────────────────────────────
    st.markdown("""
    <div style="background:linear-gradient(135deg,#1e3a8a,#4c1d95);
                border-radius:16px;padding:40px;text-align:center;">
        <h2 style="color:#f1f5f9;font-size:1.8rem;font-weight:700;margin:0 0 10px;">
            Ready to transform your hiring?
        </h2>
        <p style="color:#a5b4fc;margin:0 0 24px;font-size:0.95rem;">
            Join 2,800+ companies already using HireAI.
        </p>
    </div>
    """, unsafe_allow_html=True)

    c1, c2, c3 = st.columns([2, 1, 2])
    with c2:
        if st.button("Start for Free →", use_container_width=True):
            st.session_state.current_page = "signup"
            st.rerun()
