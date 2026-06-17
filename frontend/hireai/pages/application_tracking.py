"""
Application Tracking Page – Kanban-style columns for each hiring stage.
"""

import streamlit as st
from utils.auth  import require_login
from utils.data  import get_applications
from utils.styles import section_header


# Stage colours
STAGE_META = {
    "Applied":   {"color": "#3b82f6", "icon": "📬"},
    "Screening": {"color": "#8b5cf6", "icon": "🔍"},
    "Interview": {"color": "#f59e0b", "icon": "🎤"},
    "Offer":     {"color": "#10b981", "icon": "📩"},
    "Hired":     {"color": "#22c55e", "icon": "🎉"},
}


def _kanban_card(item: dict, color: str) -> str:
    return f"""
    <div style="background:#111827;border:1px solid #1e3a5f;
                border-left:3px solid {color};border-radius:10px;
                padding:14px;margin-bottom:10px;">
        <p style="color:#f1f5f9;font-weight:600;font-size:0.88rem;margin:0 0 2px;">
            {item['name']}
        </p>
        <p style="color:#60a5fa;font-size:0.78rem;margin:0 0 6px;">
            {item['role']}
        </p>
        <p style="color:#64748b;font-size:0.75rem;margin:0 0 6px;">
            🏢 {item['company']}
        </p>
        <div style="display:flex;justify-content:space-between;align-items:center;">
            <span style="color:#64748b;font-size:0.72rem;">📅 {item['date']}</span>
            <span style="background:{color}22;color:{color};border:1px solid {color}44;
                         border-radius:99px;padding:2px 8px;font-size:0.7rem;
                         font-weight:600;">{item['score']}%</span>
        </div>
    </div>
    """


def render() -> None:
    if not require_login(["candidate"]):
        return

    st.markdown(section_header(
        "📋 Application Tracker",
        "Track the status of every job you've applied to.",
    ), unsafe_allow_html=True)

    apps = get_applications()

    # ── Summary KPIs ─────────────────────────────────────────────────────
    cols = st.columns(5)
    for col, (stage, meta) in zip(cols, STAGE_META.items()):
        with col:
            count = len(apps.get(stage, []))
            st.markdown(f"""
            <div style="background:#111827;border:1px solid #1e3a5f;
                        border-top:3px solid {meta['color']};border-radius:12px;
                        padding:16px;text-align:center;margin-bottom:16px;">
                <div style="font-size:1.5rem;">{meta['icon']}</div>
                <div style="color:{meta['color']};font-size:1.6rem;font-weight:700;">
                    {count}
                </div>
                <div style="color:#94a3b8;font-size:0.78rem;font-weight:600;
                            text-transform:uppercase;letter-spacing:.04em;">
                    {stage}
                </div>
            </div>
            """, unsafe_allow_html=True)

    st.markdown("---")

    # ── Kanban columns ────────────────────────────────────────────────────
    kanban_cols = st.columns(5)

    for col, (stage, meta) in zip(kanban_cols, STAGE_META.items()):
        with col:
            # Column header
            st.markdown(f"""
            <div style="background:linear-gradient(135deg,{meta['color']}22,transparent);
                        border:1px solid {meta['color']}44;border-radius:10px;
                        padding:10px 14px;margin-bottom:12px;text-align:center;">
                <span style="font-size:1.1rem;">{meta['icon']}</span>
                <span style="color:{meta['color']};font-weight:600;font-size:0.9rem;
                             margin-left:6px;">{stage}</span>
            </div>
            """, unsafe_allow_html=True)

            items = apps.get(stage, [])
            if not items:
                st.markdown("""
                <div style="border:1px dashed #1e3a5f;border-radius:10px;
                            padding:24px;text-align:center;color:#475569;
                            font-size:0.8rem;">No applications</div>
                """, unsafe_allow_html=True)
            else:
                for item in items:
                    st.markdown(
                        _kanban_card(item, meta["color"]),
                        unsafe_allow_html=True,
                    )

    st.markdown("<br>", unsafe_allow_html=True)

    # ── Tips ──────────────────────────────────────────────────────────────
    st.markdown("""
    <div style="background:rgba(37,99,235,0.08);border:1px solid rgba(37,99,235,0.2);
                border-radius:12px;padding:16px 20px;">
        <p style="color:#60a5fa;font-weight:600;margin:0 0 6px;">💡 Pro Tips</p>
        <ul style="color:#94a3b8;font-size:0.85rem;margin:0;padding-left:20px;
                   line-height:1.8;">
            <li>Follow up 5–7 days after applying if you haven't heard back.</li>
            <li>Prepare a STAR-format answer for every bullet in your experience section.</li>
            <li>Research the company's engineering blog before interviews.</li>
        </ul>
    </div>
    """, unsafe_allow_html=True)
