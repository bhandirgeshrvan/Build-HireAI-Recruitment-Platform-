"""
Job Posting Page – form for recruiters to create new job listings.
"""

import streamlit as st
from utils.auth  import require_login
from utils.data  import LOCATIONS, SKILLS_POOL
from utils.styles import section_header


def render() -> None:
    if not require_login(["recruiter"]):
        return

    st.markdown(section_header(
        "📝 Post a New Job",
        "Fill in the details below. Fields marked * are required.",
    ), unsafe_allow_html=True)

    with st.form("job_posting_form", clear_on_submit=False):
        # ── Basic info ────────────────────────────────────────────────────
        st.markdown("""<p style="color:#60a5fa;font-weight:600;font-size:0.85rem;
                        margin-bottom:4px;text-transform:uppercase;letter-spacing:.05em;">
                        Basic Information</p>""", unsafe_allow_html=True)

        col1, col2 = st.columns(2)
        with col1:
            title = st.text_input("Job Title *",    placeholder="e.g. Senior Backend Engineer")
            dept  = st.selectbox("Department *", [
                "Engineering", "Product", "Design", "Data Science",
                "DevOps", "Security", "Marketing", "Sales", "Operations",
            ])
        with col2:
            company  = st.text_input("Company Name *", value="Your Company")
            job_type = st.selectbox("Employment Type *",
                                    ["Full-time", "Part-time", "Contract", "Internship"])

        location  = st.selectbox("Location *", ["Remote"] + LOCATIONS)
        workplace = st.radio("Workplace Model", ["Remote", "Hybrid", "On-site"],
                              horizontal=True)

        st.markdown("---")

        # ── Compensation ──────────────────────────────────────────────────
        st.markdown("""<p style="color:#60a5fa;font-weight:600;font-size:0.85rem;
                        margin-bottom:4px;text-transform:uppercase;letter-spacing:.05em;">
                        Compensation</p>""", unsafe_allow_html=True)

        s1, s2, s3 = st.columns(3)
        with s1:
            salary_min = st.number_input("Min Salary ($)", value=80000, step=5000)
        with s2:
            salary_max = st.number_input("Max Salary ($)", value=150000, step=5000)
        with s3:
            currency = st.selectbox("Currency", ["USD", "EUR", "GBP", "CAD"])

        show_salary = st.checkbox("Display salary range publicly", value=True)

        st.markdown("---")

        # ── Requirements ──────────────────────────────────────────────────
        st.markdown("""<p style="color:#60a5fa;font-weight:600;font-size:0.85rem;
                        margin-bottom:4px;text-transform:uppercase;letter-spacing:.05em;">
                        Requirements</p>""", unsafe_allow_html=True)

        c1, c2 = st.columns(2)
        with c1:
            experience = st.selectbox("Experience Level *",
                                      ["Entry (0-2 yrs)", "Mid (2-5 yrs)",
                                       "Senior (5-8 yrs)", "Staff (8+ yrs)"])
        with c2:
            education = st.selectbox("Education",
                                     ["Any", "B.S.", "M.S.", "Ph.D.", "Bootcamp OK"])

        skills = st.multiselect(
            "Required Skills *",
            options=SKILLS_POOL,
            default=["Python", "SQL", "Docker"],
        )
        nice_skills = st.multiselect(
            "Nice-to-have Skills",
            options=SKILLS_POOL,
            default=["Kubernetes"],
        )

        st.markdown("---")

        # ── Description ───────────────────────────────────────────────────
        st.markdown("""<p style="color:#60a5fa;font-weight:600;font-size:0.85rem;
                        margin-bottom:4px;text-transform:uppercase;letter-spacing:.05em;">
                        Job Description</p>""", unsafe_allow_html=True)

        description = st.text_area(
            "Full Job Description *",
            placeholder=(
                "Describe the role, responsibilities, team, and what success "
                "looks like in the first 90 days…"
            ),
            height=200,
        )

        benefits = st.text_area(
            "Benefits & Perks",
            placeholder="Health insurance, 401k, unlimited PTO, home-office stipend…",
            height=80,
        )

        st.markdown("---")

        # ── Settings ──────────────────────────────────────────────────────
        st.markdown("""<p style="color:#60a5fa;font-weight:600;font-size:0.85rem;
                        margin-bottom:4px;text-transform:uppercase;letter-spacing:.05em;">
                        Posting Settings</p>""", unsafe_allow_html=True)

        c_a, c_b = st.columns(2)
        with c_a:
            deadline  = st.date_input("Application Deadline")
            auto_rank = st.checkbox("Enable AI Candidate Auto-Ranking", value=True)
        with c_b:
            slots     = st.number_input("Number of Openings", value=1, min_value=1)
            screening = st.checkbox("Require screening questions", value=False)

        st.markdown("<br>", unsafe_allow_html=True)

        submitted = st.form_submit_button("🚀 Publish Job Posting", use_container_width=True)

        if submitted:
            errors = []
            if not title:        errors.append("Job Title is required.")
            if not description:  errors.append("Job Description is required.")
            if not skills:       errors.append("At least one required skill must be selected.")
            if salary_max <= salary_min:
                errors.append("Max salary must be greater than min salary.")

            if errors:
                for e in errors:
                    st.error(f"❌ {e}")
            else:
                st.success(
                    f"✅ **{title}** at **{company}** has been published successfully!"
                )
                st.balloons()
                st.markdown(f"""
                <div style="background:#111827;border:1px solid #1e3a5f;
                            border-radius:12px;padding:20px;margin-top:16px;">
                    <h4 style="color:#f1f5f9;margin:0 0 12px;">Job Posting Summary</h4>
                    <table style="width:100%;color:#94a3b8;font-size:0.85rem;">
                        <tr><td style="padding:4px 0;"><b style="color:#f1f5f9;">Role:</b></td>
                            <td>{title} · {dept}</td></tr>
                        <tr><td style="padding:4px 0;"><b style="color:#f1f5f9;">Company:</b></td>
                            <td>{company}</td></tr>
                        <tr><td style="padding:4px 0;"><b style="color:#f1f5f9;">Location:</b></td>
                            <td>{location} ({workplace})</td></tr>
                        <tr><td style="padding:4px 0;"><b style="color:#f1f5f9;">Salary:</b></td>
                            <td>{currency} ${salary_min:,} – ${salary_max:,}</td></tr>
                        <tr><td style="padding:4px 0;"><b style="color:#f1f5f9;">Skills:</b></td>
                            <td>{", ".join(skills)}</td></tr>
                        <tr><td style="padding:4px 0;"><b style="color:#f1f5f9;">Openings:</b></td>
                            <td>{slots}</td></tr>
                    </table>
                </div>
                """, unsafe_allow_html=True)
