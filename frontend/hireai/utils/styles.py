"""
Global CSS styles for HireAI platform.
Provides dark mode SaaS design with custom component styling.
"""

GLOBAL_CSS = """
<style>
    /* ── Base & Reset ───────────────────────────────────────────── */
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

    html, body, [class*="css"] {
        font-family: 'Inter', sans-serif;
    }

    /* Dark background for the whole app */
    .stApp {
        background: #0a0e1a;
        color: #e2e8f0;
    }

    /* Hide default Streamlit menu & footer */
    #MainMenu { visibility: hidden; }
    footer    { visibility: hidden; }
    header    { visibility: hidden; }

    /* ── Sidebar ────────────────────────────────────────────────── */
    [data-testid="stSidebar"] {
        background: linear-gradient(180deg, #0f1629 0%, #0a0e1a 100%);
        border-right: 1px solid #1e2d4a;
    }
    [data-testid="stSidebar"] .stRadio label {
        color: #94a3b8 !important;
        font-size: 0.9rem;
        padding: 6px 0;
        cursor: pointer;
        transition: color 0.2s;
    }
    [data-testid="stSidebar"] .stRadio label:hover {
        color: #60a5fa !important;
    }

    /* ── Metric Cards ───────────────────────────────────────────── */
    [data-testid="metric-container"] {
        background: linear-gradient(135deg, #111827 0%, #1a2744 100%);
        border: 1px solid #1e3a5f;
        border-radius: 12px;
        padding: 20px;
        box-shadow: 0 4px 24px rgba(0,0,0,0.4);
    }
    [data-testid="metric-container"] label {
        color: #94a3b8 !important;
        font-size: 0.8rem !important;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }
    [data-testid="metric-container"] [data-testid="stMetricValue"] {
        color: #f1f5f9 !important;
        font-size: 2rem !important;
        font-weight: 700;
    }
    [data-testid="metric-container"] [data-testid="stMetricDelta"] {
        font-size: 0.8rem !important;
    }

    /* ── Buttons ────────────────────────────────────────────────── */
    .stButton > button {
        background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
        color: #fff;
        border: none;
        border-radius: 8px;
        padding: 10px 24px;
        font-weight: 600;
        font-size: 0.9rem;
        transition: all 0.2s;
        box-shadow: 0 4px 12px rgba(37,99,235,0.3);
    }
    .stButton > button:hover {
        background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
        box-shadow: 0 6px 20px rgba(37,99,235,0.5);
        transform: translateY(-1px);
    }
    .stButton > button:active { transform: translateY(0); }

    /* ── Inputs ─────────────────────────────────────────────────── */
    .stTextInput > div > div > input,
    .stTextArea > div > div > textarea,
    .stSelectbox > div > div > select {
        background: #111827 !important;
        border: 1px solid #1e3a5f !important;
        border-radius: 8px !important;
        color: #e2e8f0 !important;
        font-size: 0.9rem;
    }
    .stTextInput > div > div > input:focus,
    .stTextArea > div > div > textarea:focus {
        border-color: #2563eb !important;
        box-shadow: 0 0 0 3px rgba(37,99,235,0.15) !important;
    }

    /* ── DataFrames / Tables ────────────────────────────────────── */
    .stDataFrame {
        border: 1px solid #1e3a5f !important;
        border-radius: 12px !important;
        overflow: hidden;
    }
    .stDataFrame thead th {
        background: #0f1629 !important;
        color: #94a3b8 !important;
        font-size: 0.78rem;
        text-transform: uppercase;
        letter-spacing: 0.04em;
    }
    .stDataFrame tbody tr:hover td { background: #1a2744 !important; }

    /* ── Progress Bar ───────────────────────────────────────────── */
    .stProgress > div > div > div > div {
        background: linear-gradient(90deg, #2563eb, #7c3aed) !important;
        border-radius: 99px;
    }

    /* ── File Uploader ──────────────────────────────────────────── */
    [data-testid="stFileUploader"] {
        background: #111827;
        border: 2px dashed #1e3a5f;
        border-radius: 12px;
        padding: 20px;
        transition: border-color 0.2s;
    }
    [data-testid="stFileUploader"]:hover { border-color: #2563eb; }

    /* ── Tabs ───────────────────────────────────────────────────── */
    .stTabs [data-baseweb="tab-list"] {
        background: #111827;
        border-radius: 10px;
        padding: 4px;
        gap: 4px;
    }
    .stTabs [data-baseweb="tab"] {
        color: #94a3b8;
        border-radius: 8px;
        font-size: 0.85rem;
        font-weight: 500;
        padding: 8px 16px;
    }
    .stTabs [aria-selected="true"] {
        background: #2563eb !important;
        color: #fff !important;
    }

    /* ── Alerts / Info boxes ────────────────────────────────────── */
    .stAlert { border-radius: 10px !important; }

    /* ── Divider ────────────────────────────────────────────────── */
    hr { border-color: #1e2d4a !important; }
</style>
"""

# ── Reusable HTML card components ──────────────────────────────────────────

def card(title: str, value: str, subtitle: str = "", color: str = "#2563eb") -> str:
    """Returns an HTML KPI card."""
    return f"""
    <div style="
        background: linear-gradient(135deg, #111827 0%, #1a2744 100%);
        border: 1px solid #1e3a5f;
        border-left: 4px solid {color};
        border-radius: 12px;
        padding: 20px 24px;
        margin-bottom: 12px;
        box-shadow: 0 4px 24px rgba(0,0,0,0.3);
    ">
        <p style="color:#94a3b8;font-size:0.78rem;font-weight:600;
                  text-transform:uppercase;letter-spacing:0.05em;margin:0 0 6px;">
            {title}
        </p>
        <p style="color:#f1f5f9;font-size:2rem;font-weight:700;margin:0 0 4px;">
            {value}
        </p>
        <p style="color:#64748b;font-size:0.8rem;margin:0;">{subtitle}</p>
    </div>
    """


def section_header(title: str, subtitle: str = "") -> str:
    """Returns an HTML section heading."""
    return f"""
    <div style="margin-bottom:24px;">
        <h2 style="color:#f1f5f9;font-size:1.5rem;font-weight:700;margin:0 0 6px;">
            {title}
        </h2>
        <p style="color:#64748b;font-size:0.9rem;margin:0;">{subtitle}</p>
    </div>
    """


def badge(text: str, color: str = "#2563eb") -> str:
    """Returns an HTML inline badge."""
    return (
        f'<span style="background:{color}22;color:{color};border:1px solid {color}44;'
        f'border-radius:99px;padding:2px 10px;font-size:0.75rem;font-weight:600;">'
        f'{text}</span>'
    )


def hero_gradient() -> str:
    """Full-width hero gradient banner."""
    return """
    <div style="
        background: linear-gradient(135deg, #0f1629 0%, #1a1040 50%, #0f1629 100%);
        border: 1px solid #1e3a5f;
        border-radius: 16px;
        padding: 60px 40px;
        text-align: center;
        margin-bottom: 32px;
        position: relative;
        overflow: hidden;
    ">
        <div style="
            position:absolute;top:-40%;left:-10%;
            width:500px;height:500px;
            background:radial-gradient(circle,rgba(37,99,235,0.15),transparent 70%);
            pointer-events:none;
        "></div>
        <div style="
            position:absolute;bottom:-40%;right:-10%;
            width:400px;height:400px;
            background:radial-gradient(circle,rgba(124,58,237,0.12),transparent 70%);
            pointer-events:none;
        "></div>
        <span style="
            background:rgba(37,99,235,0.15);
            color:#60a5fa;
            border:1px solid rgba(37,99,235,0.3);
            border-radius:99px;
            padding:4px 16px;
            font-size:0.8rem;
            font-weight:600;
            letter-spacing:0.05em;
        ">✦ AI-POWERED RECRUITMENT</span>
        <h1 style="
            color:#f1f5f9;
            font-size:3.2rem;
            font-weight:800;
            margin:20px 0 16px;
            line-height:1.15;
        ">Hire Smarter with <span style="
            background:linear-gradient(90deg,#3b82f6,#8b5cf6);
            -webkit-background-clip:text;
            -webkit-text-fill-color:transparent;
        ">AI</span></h1>
        <p style="color:#94a3b8;font-size:1.1rem;max-width:560px;margin:0 auto 32px;">
            Automate resume screening, rank candidates by fit, and close roles
            faster than ever — powered by cutting-edge AI.
        </p>
    </div>
    """
