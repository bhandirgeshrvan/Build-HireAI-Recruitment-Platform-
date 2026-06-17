"""
Job Search Page – search bar, filters, job cards, apply button.
"""

import streamlit as st
import pandas as pd
from utils.data  import get_jobs, LOCATIONS, JOB_TITLES
from utils.styles import section_header


def _job_card(job: dict) -> str:
    score_color = (
        "#10b981" if job["match_score"] >= 80
        else "#f59e0b" if job["match_score"] >= 60
        else "#ef4444"
    )
    type_color = {
        "Full-time": "#2563eb",
        "Part-time": "#8b5cf6",
        "Contract":  "#f59e0b",
    }.get(job["type"], "#64748b")

    return f"""
    <div style="background:#111827;border:1px solid #1e3a5f;border-radius:14px;
                padding:20px;margin-bottom:14px;transition:border-color .2s;">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;">
            <div style="flex:1;">
                <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
                    <h3 style="color:#f1f5f9;font-size:1rem;font-weight:600;margin:0;">
                        {job['title']}
                    </h3>
                    <span style="background:{type_color}22;color:{type_color};
                                 border:1px solid {type_color}44;border-radius:99px;
                                 padding:2px 10px;font-size:0.72rem;font-weight:600;">
                        {job['type']}
                    </span>
                </div>
                <p style="color:#60a5fa;font-size:0.85rem;margin:4px 0 8px;">
                    🏢 {job['company']}  &nbsp;·&nbsp;  📍 {job['location']}
                </p>
                <p style="color:#64748b;font-size:0.8rem;margin:0 0 8px;">
                    💰 ${job['salary_min']:,} – ${job['salary_max']:,}
                    &nbsp;·&nbsp;  🕐 {job['experience']}
                    &nbsp;·&nbsp;  👥 {job['applicants']} applicants
                    &nbsp;·&nbsp;  📅 {job['posted_days']}d ago
                </p>
                <p style="color:#475569;font-size:0.78rem;margin:0;">
                    🔧 {job['skills']}
                </p>
            </div>
            <div style="text-align:right;min-width:80px;padding-left:16px;">
                <div style="color:{score_color};font-size:1.5rem;font-weight:700;">
                    {job['match_score']}%
                </div>
                <div style="color:{score_color};font-size:0.72rem;font-weight:500;">
                    Match
                </div>
            </div>
        </div>
    </div>
    """


def render() -> None:
    st.markdown(section_header(
        "🔍 Job Search",
        "Find your next opportunity from thousands of AI-matched listings.",
    ), unsafe_allow_html=True)

    # ── Search + filter bar ───────────────────────────────────────────────
    search_col, loc_col, type_col, exp_col = st.columns([3, 2, 1.5, 1.5])

    with search_col:
        query = st.text_input("Search jobs, companies, skills…",
                              placeholder="e.g. Senior Python Engineer")
    with loc_col:
        location = st.selectbox("Location",
                                ["All Locations"] + LOCATIONS)
    with type_col:
        job_type = st.selectbox("Type",
                                ["All", "Full-time", "Part-time", "Contract"])
    with exp_col:
        experience = st.selectbox("Experience",
                                  ["All", "0-2 yrs", "2-5 yrs", "5-8 yrs", "8+ yrs"])

    # Salary slider
    sal_col1, sal_col2 = st.columns([3, 1])
    with sal_col1:
        salary_range = st.slider(
            "Salary Range ($K)",
            min_value=50, max_value=400,
            value=(80, 250), step=10,
        )
    with sal_col2:
        sort_by = st.selectbox("Sort by", ["Match Score", "Salary", "Posted Date"])

    st.markdown("<br>", unsafe_allow_html=True)

    # ── Load & filter data ────────────────────────────────────────────────
    jobs = get_jobs(40)

    # Apply filters
    if query:
        mask = (
            jobs["title"].str.contains(query, case=False, na=False) |
            jobs["company"].str.contains(query, case=False, na=False) |
            jobs["skills"].str.contains(query, case=False, na=False)
        )
        jobs = jobs[mask]

    if location != "All Locations":
        jobs = jobs[jobs["location"] == location]

    if job_type != "All":
        jobs = jobs[jobs["type"] == job_type]

    if experience != "All":
        jobs = jobs[jobs["experience"] == experience]

    jobs = jobs[
        (jobs["salary_min"] / 1000 >= salary_range[0]) &
        (jobs["salary_max"] / 1000 <= salary_range[1])
    ]

    # Sort
    sort_map = {
        "Match Score":   "match_score",
        "Salary":        "salary_max",
        "Posted Date":   "posted_days",
    }
    jobs = jobs.sort_values(sort_map[sort_by],
                             ascending=(sort_by == "Posted Date"))

    # ── Results header ────────────────────────────────────────────────────
    st.markdown(f"""
    <p style="color:#94a3b8;font-size:0.88rem;margin-bottom:16px;">
        Showing <b style="color:#f1f5f9;">{len(jobs)}</b> jobs
    </p>
    """, unsafe_allow_html=True)

    if jobs.empty:
        st.info("🔍 No jobs found matching your criteria. Try broadening your filters.")
        return

    # ── Render job cards ──────────────────────────────────────────────────
    for _, job in jobs.iterrows():
        st.markdown(_job_card(job.to_dict()), unsafe_allow_html=True)

        btn_col1, btn_col2, _ = st.columns([1, 1, 4])
        with btn_col1:
            if st.button("⚡ Quick Apply", key=f"apply_{job['id']}"):
                st.success(f"✅ Applied to **{job['title']}** at **{job['company']}**!")
        with btn_col2:
            if st.button("🔖 Save", key=f"save_{job['id']}"):
                st.info("💾 Job saved to your list.")
