"""
Authentication helpers for HireAI.
Uses Streamlit session_state; no real backend — demo only.
"""

import streamlit as st

# ── Fake user database ────────────────────────────────────────────────────
USERS_DB: dict = {
    "candidate@hireai.com":  {"password": "demo123", "role": "candidate",  "name": "Alex Johnson"},
    "recruiter@hireai.com":  {"password": "demo123", "role": "recruiter",  "name": "Sarah Chen"},
    "admin@hireai.com":      {"password": "demo123", "role": "admin",      "name": "Admin User"},
}


def init_session() -> None:
    """Initialise all required session state keys."""
    defaults = {
        "logged_in":    False,
        "user_email":   "",
        "user_name":    "",
        "user_role":    "",
        "current_page": "landing",
    }
    for key, val in defaults.items():
        if key not in st.session_state:
            st.session_state[key] = val


def login(email: str, password: str) -> tuple[bool, str]:
    """
    Attempt login with email/password.
    Returns (success, error_message).
    """
    user = USERS_DB.get(email.lower().strip())
    if not user:
        return False, "No account found with that email."
    if user["password"] != password:
        return False, "Incorrect password."

    st.session_state.logged_in   = True
    st.session_state.user_email  = email.lower().strip()
    st.session_state.user_name   = user["name"]
    st.session_state.user_role   = user["role"]

    # Route to the correct dashboard after login
    role_page = {
        "candidate": "candidate_dashboard",
        "recruiter": "recruiter_dashboard",
        "admin":     "admin_dashboard",
    }
    st.session_state.current_page = role_page[user["role"]]
    return True, ""


def logout() -> None:
    """Clear session and return to landing page."""
    for key in ["logged_in", "user_email", "user_name", "user_role"]:
        st.session_state[key] = "" if key != "logged_in" else False
    st.session_state.current_page = "landing"


def signup(name: str, email: str, password: str, role: str) -> tuple[bool, str]:
    """
    Register a new user (in-memory only for demo).
    Returns (success, message).
    """
    if not name or not email or not password:
        return False, "All fields are required."
    if email.lower() in USERS_DB:
        return False, "An account with this email already exists."
    if len(password) < 6:
        return False, "Password must be at least 6 characters."

    USERS_DB[email.lower()] = {"password": password, "role": role, "name": name}
    return True, "Account created! You can now log in."


def require_login(allowed_roles: list[str] | None = None) -> bool:
    """
    Guard pages that need authentication.
    Returns True if the current user is authorised.
    Shows an error and redirects otherwise.
    """
    if not st.session_state.get("logged_in"):
        st.error("🔒 Please log in to access this page.")
        if st.button("Go to Login"):
            st.session_state.current_page = "login"
            st.rerun()
        return False

    if allowed_roles and st.session_state.user_role not in allowed_roles:
        st.error(f"⛔ This page is restricted to: {', '.join(allowed_roles)}.")
        return False

    return True
