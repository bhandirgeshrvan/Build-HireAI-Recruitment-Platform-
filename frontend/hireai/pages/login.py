"""
Login Page
"""

import streamlit as st
from utils.auth import login


def render() -> None:
    # Centered layout
    _, col, _ = st.columns([1, 1.4, 1])

    with col:
        st.markdown("""
        <div style="text-align:center;margin-bottom:32px;">
            <div style="font-size:2.5rem;">🤖</div>
            <h1 style="color:#f1f5f9;font-size:1.8rem;font-weight:700;margin:8px 0 4px;">
                Welcome back
            </h1>
            <p style="color:#64748b;font-size:0.9rem;margin:0;">
                Sign in to your HireAI account
            </p>
        </div>
        """, unsafe_allow_html=True)

        # Card wrapper
        st.markdown("""
        <div style="background:#111827;border:1px solid #1e3a5f;
                    border-radius:16px;padding:32px;">
        """, unsafe_allow_html=True)

        with st.form("login_form"):
            email = st.text_input("Email address", placeholder="you@company.com")
            password = st.text_input("Password", type="password", placeholder="••••••••")

            st.markdown("<br>", unsafe_allow_html=True)
            submitted = st.form_submit_button("Sign In →", use_container_width=True)

            if submitted:
                if not email or not password:
                    st.error("Please enter both email and password.")
                else:
                    success, msg = login(email, password)
                    if success:
                        st.success("✅ Login successful! Redirecting…")
                        st.rerun()
                    else:
                        st.error(f"❌ {msg}")

        st.markdown("</div>", unsafe_allow_html=True)

        st.markdown("<br>", unsafe_allow_html=True)

        _, btn_col, _ = st.columns([1, 2, 1])
        with btn_col:
            if st.button("Don't have an account? Sign up", use_container_width=True):
                st.session_state.current_page = "signup"
                st.rerun()
