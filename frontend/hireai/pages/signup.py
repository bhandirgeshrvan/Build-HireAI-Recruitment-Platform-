"""
Sign Up Page
"""

import streamlit as st
from utils.auth import signup


def render() -> None:
    _, col, _ = st.columns([1, 1.4, 1])

    with col:
        st.markdown("""
        <div style="text-align:center;margin-bottom:32px;">
            <div style="font-size:2.5rem;">🚀</div>
            <h1 style="color:#f1f5f9;font-size:1.8rem;font-weight:700;margin:8px 0 4px;">
                Create your account
            </h1>
            <p style="color:#64748b;font-size:0.9rem;margin:0;">
                Join 50,000+ professionals on HireAI
            </p>
        </div>
        """, unsafe_allow_html=True)

        st.markdown("""
        <div style="background:#111827;border:1px solid #1e3a5f;
                    border-radius:16px;padding:32px;">
        """, unsafe_allow_html=True)

        with st.form("signup_form"):
            name     = st.text_input("Full Name",       placeholder="Jane Smith")
            email    = st.text_input("Email address",   placeholder="jane@company.com")
            password = st.text_input("Password",        type="password",
                                     placeholder="At least 6 characters")
            confirm  = st.text_input("Confirm Password", type="password",
                                     placeholder="Re-enter password")

            role = st.selectbox(
                "I am a…",
                ["candidate", "recruiter"],
                format_func=lambda r: "👤 Job Seeker (Candidate)" if r == "candidate"
                                      else "💼 Hiring Professional (Recruiter)",
            )

            st.markdown("<br>", unsafe_allow_html=True)
            submitted = st.form_submit_button("Create Account →", use_container_width=True)

            if submitted:
                if password != confirm:
                    st.error("❌ Passwords do not match.")
                else:
                    ok, msg = signup(name, email, password, role)
                    if ok:
                        st.success(f"✅ {msg}")
                        st.info("👉 Use the Login page to sign in.")
                    else:
                        st.error(f"❌ {msg}")

        st.markdown("</div>", unsafe_allow_html=True)

        st.markdown("<br>", unsafe_allow_html=True)
        _, btn_col, _ = st.columns([1, 2, 1])
        with btn_col:
            if st.button("Already have an account? Log in", use_container_width=True):
                st.session_state.current_page = "login"
                st.rerun()
