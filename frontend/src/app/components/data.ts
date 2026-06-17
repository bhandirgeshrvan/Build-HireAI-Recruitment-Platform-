// ── Types ──────────────────────────────────────────────────────────────────
export type Role = 'candidate' | 'recruiter' | 'admin'

export interface User {
  name: string
  email: string
  role: Role
}

export interface Job {
  id: number
  title: string
  company: string
  location: string
  salary_min: number
  salary_max: number
  type: 'Full-time' | 'Part-time' | 'Contract'
  experience: string
  skills: string[]
  posted_days: number
  applicants: number
  match_score: number
  status: 'Active' | 'Closed'
}

export interface Candidate {
  id: number
  name: string
  email: string
  role: string
  experience: number
  education: string
  skills: string[]
  match_score: number
  location: string
  status: 'Applied' | 'Screening' | 'Interview' | 'Offer' | 'Hired'
  salary_exp: number
}

export interface KanbanCard {
  name: string
  role: string
  company: string
  score: number
  date: string
}

// ── Constants ─────────────────────────────────────────────────────────────
export const SKILLS_POOL = [
  'Python', 'JavaScript', 'React', 'Node.js', 'SQL', 'PostgreSQL',
  'AWS', 'Docker', 'Kubernetes', 'Machine Learning', 'TensorFlow',
  'FastAPI', 'Django', 'TypeScript', 'Go', 'Java', 'Spring Boot',
  'GraphQL', 'Redis', 'MongoDB', 'Spark', 'Kafka', 'CI/CD',
  'Terraform', 'Figma', 'Product Management', 'Data Analysis',
]

export const COMPANIES = [
  'Google', 'Microsoft', 'Amazon', 'Meta', 'Apple', 'Netflix',
  'Stripe', 'Shopify', 'Airbnb', 'Uber', 'Lyft', 'Dropbox',
  'Salesforce', 'HubSpot', 'Atlassian', 'GitHub', 'GitLab',
]

export const LOCATIONS = [
  'San Francisco, CA', 'New York, NY', 'Austin, TX', 'Seattle, WA',
  'Boston, MA', 'Chicago, IL', 'Los Angeles, CA', 'Remote',
  'Denver, CO', 'Atlanta, GA',
]

export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

// ── Jobs data ─────────────────────────────────────────────────────────────
export const JOBS: Job[] = [
  { id: 1,  title: 'Senior Software Engineer', company: 'Stripe',     location: 'San Francisco, CA', salary_min: 150000, salary_max: 220000, type: 'Full-time', experience: '5-8 yrs', skills: ['Python', 'Go', 'Kubernetes'], posted_days: 2,  applicants: 127, match_score: 96, status: 'Active' },
  { id: 2,  title: 'ML Engineer',              company: 'Google',      location: 'Remote',            salary_min: 160000, salary_max: 240000, type: 'Full-time', experience: '5-8 yrs', skills: ['Python', 'TensorFlow', 'Spark'], posted_days: 4, applicants: 203, match_score: 91, status: 'Active' },
  { id: 3,  title: 'Full Stack Developer',     company: 'Shopify',     location: 'New York, NY',      salary_min: 120000, salary_max: 180000, type: 'Full-time', experience: '2-5 yrs', skills: ['React', 'Node.js', 'PostgreSQL'], posted_days: 1, applicants: 89, match_score: 88, status: 'Active' },
  { id: 4,  title: 'DevOps Engineer',          company: 'Airbnb',      location: 'Seattle, WA',       salary_min: 130000, salary_max: 190000, type: 'Full-time', experience: '2-5 yrs', skills: ['Docker', 'Kubernetes', 'Terraform'], posted_days: 6, applicants: 64, match_score: 84, status: 'Active' },
  { id: 5,  title: 'Data Scientist',           company: 'Netflix',     location: 'Los Angeles, CA',   salary_min: 140000, salary_max: 210000, type: 'Full-time', experience: '2-5 yrs', skills: ['Python', 'SQL', 'Machine Learning'], posted_days: 3, applicants: 156, match_score: 82, status: 'Active' },
  { id: 6,  title: 'Backend Engineer',         company: 'Amazon',      location: 'Austin, TX',        salary_min: 125000, salary_max: 195000, type: 'Full-time', experience: '2-5 yrs', skills: ['Java', 'Spring Boot', 'AWS'], posted_days: 8, applicants: 211, match_score: 79, status: 'Active' },
  { id: 7,  title: 'Frontend Engineer',        company: 'Meta',        location: 'Remote',            salary_min: 110000, salary_max: 175000, type: 'Full-time', experience: '0-2 yrs', skills: ['React', 'TypeScript', 'GraphQL'], posted_days: 5, applicants: 318, match_score: 77, status: 'Active' },
  { id: 8,  title: 'Cloud Architect',          company: 'Microsoft',   location: 'Boston, MA',        salary_min: 170000, salary_max: 250000, type: 'Full-time', experience: '8+ yrs',  skills: ['AWS', 'Terraform', 'Kubernetes'], posted_days: 12, applicants: 47, match_score: 75, status: 'Active' },
  { id: 9,  title: 'Product Manager',          company: 'HubSpot',     location: 'Chicago, IL',       salary_min: 115000, salary_max: 170000, type: 'Full-time', experience: '2-5 yrs', skills: ['Product Management', 'Data Analysis', 'Figma'], posted_days: 7, applicants: 134, match_score: 73, status: 'Active' },
  { id: 10, title: 'Security Engineer',        company: 'GitLab',      location: 'Remote',            salary_min: 135000, salary_max: 200000, type: 'Full-time', experience: '5-8 yrs', skills: ['Python', 'Kubernetes', 'CI/CD'], posted_days: 9, applicants: 58, match_score: 71, status: 'Active' },
  { id: 11, title: 'Engineering Manager',      company: 'Dropbox',     location: 'Denver, CO',        salary_min: 160000, salary_max: 230000, type: 'Full-time', experience: '8+ yrs',  skills: ['Product Management', 'Python', 'AWS'], posted_days: 14, applicants: 43, match_score: 68, status: 'Active' },
  { id: 12, title: 'QA Engineer',              company: 'Atlassian',   location: 'Atlanta, GA',       salary_min: 90000,  salary_max: 140000, type: 'Full-time', experience: '0-2 yrs', skills: ['Python', 'JavaScript', 'CI/CD'], posted_days: 3, applicants: 77, match_score: 65, status: 'Active' },
  { id: 13, title: 'Full Stack Developer',     company: 'Salesforce',  location: 'New York, NY',      salary_min: 110000, salary_max: 165000, type: 'Contract', experience: '2-5 yrs', skills: ['React', 'Node.js', 'SQL'], posted_days: 2, applicants: 92, match_score: 62, status: 'Active' },
  { id: 14, title: 'Data Scientist',           company: 'Uber',        location: 'San Francisco, CA', salary_min: 130000, salary_max: 195000, type: 'Full-time', experience: '2-5 yrs', skills: ['Python', 'Spark', 'Machine Learning'], posted_days: 11, applicants: 168, match_score: 60, status: 'Active' },
  { id: 15, title: 'Backend Engineer',         company: 'Lyft',        location: 'Remote',            salary_min: 120000, salary_max: 180000, type: 'Full-time', experience: '2-5 yrs', skills: ['Go', 'Kafka', 'PostgreSQL'], posted_days: 6, applicants: 85, match_score: 58, status: 'Closed' },
]

// ── Candidates data ───────────────────────────────────────────────────────
export const CANDIDATES: Candidate[] = [
  { id: 1,  name: 'Alex Johnson',      email: 'alex.j@email.com',    role: 'Senior Software Engineer', experience: 7,  education: 'M.S. CS',   skills: ['Python', 'Go', 'Kubernetes', 'AWS', 'PostgreSQL'], match_score: 96, location: 'San Francisco, CA', status: 'Interview', salary_exp: 185000 },
  { id: 2,  name: 'Maria Garcia',      email: 'maria.g@email.com',   role: 'ML Engineer',              experience: 5,  education: 'Ph.D',      skills: ['Python', 'TensorFlow', 'Spark', 'AWS', 'SQL'],     match_score: 94, location: 'Remote',            status: 'Offer',     salary_exp: 195000 },
  { id: 3,  name: 'James Wilson',      email: 'james.w@email.com',   role: 'Full Stack Developer',     experience: 4,  education: 'B.S. CS',   skills: ['React', 'Node.js', 'PostgreSQL', 'Docker'],         match_score: 91, location: 'New York, NY',      status: 'Interview', salary_exp: 155000 },
  { id: 4,  name: 'Sarah Chen',        email: 'sarah.c@email.com',   role: 'DevOps Engineer',          experience: 6,  education: 'B.S. EE',   skills: ['Kubernetes', 'Terraform', 'Docker', 'AWS'],         match_score: 89, location: 'Seattle, WA',       status: 'Screening', salary_exp: 165000 },
  { id: 5,  name: 'David Kim',         email: 'david.k@email.com',   role: 'Data Scientist',           experience: 3,  education: 'M.S. CS',   skills: ['Python', 'SQL', 'Machine Learning', 'Spark'],       match_score: 87, location: 'Los Angeles, CA',   status: 'Applied',   salary_exp: 145000 },
  { id: 6,  name: 'Emily Rodriguez',   email: 'emily.r@email.com',   role: 'Frontend Engineer',        experience: 3,  education: 'B.S. CS',   skills: ['React', 'TypeScript', 'GraphQL', 'Node.js'],        match_score: 85, location: 'Remote',            status: 'Screening', salary_exp: 135000 },
  { id: 7,  name: 'Michael Brown',     email: 'michael.b@email.com', role: 'Backend Engineer',         experience: 5,  education: 'B.S. EE',   skills: ['Java', 'Spring Boot', 'AWS', 'PostgreSQL'],         match_score: 83, location: 'Austin, TX',        status: 'Interview', salary_exp: 155000 },
  { id: 8,  name: 'Ashley Davis',      email: 'ashley.d@email.com',  role: 'Cloud Architect',          experience: 9,  education: 'M.S. CS',   skills: ['AWS', 'Terraform', 'Kubernetes', 'Go'],              match_score: 81, location: 'Boston, MA',        status: 'Offer',     salary_exp: 210000 },
  { id: 9,  name: 'Daniel Martinez',   email: 'daniel.m@email.com',  role: 'Product Manager',          experience: 4,  education: 'MBA',       skills: ['Product Management', 'Data Analysis', 'Figma'],     match_score: 78, location: 'Chicago, IL',       status: 'Screening', salary_exp: 145000 },
  { id: 10, name: 'Jessica Thompson',  email: 'jessica.t@email.com', role: 'Security Engineer',        experience: 6,  education: 'B.S. CS',   skills: ['Python', 'Kubernetes', 'CI/CD', 'Docker'],           match_score: 76, location: 'Remote',            status: 'Applied',   salary_exp: 165000 },
  { id: 11, name: 'Ryan Lee',          email: 'ryan.l@email.com',    role: 'Engineering Manager',      experience: 10, education: 'M.S. CS',   skills: ['Python', 'AWS', 'Product Management'],               match_score: 74, location: 'Denver, CO',        status: 'Hired',     salary_exp: 215000 },
  { id: 12, name: 'Amanda Taylor',     email: 'amanda.t@email.com',  role: 'QA Engineer',              experience: 2,  education: 'B.S. CS',   skills: ['Python', 'JavaScript', 'CI/CD'],                     match_score: 72, location: 'Atlanta, GA',       status: 'Applied',   salary_exp: 110000 },
  { id: 13, name: 'Kevin Patel',       email: 'kevin.p@email.com',   role: 'Full Stack Developer',     experience: 3,  education: 'B.S. CS',   skills: ['React', 'Node.js', 'SQL', 'Docker'],                 match_score: 70, location: 'New York, NY',      status: 'Screening', salary_exp: 130000 },
  { id: 14, name: 'Natalie White',     email: 'natalie.w@email.com', role: 'Data Scientist',           experience: 4,  education: 'M.S. CS',   skills: ['Python', 'Spark', 'Machine Learning', 'SQL'],        match_score: 68, location: 'San Francisco, CA', status: 'Applied',   salary_exp: 150000 },
  { id: 15, name: 'Chris Harris',      email: 'chris.h@email.com',   role: 'Backend Engineer',         experience: 5,  education: 'B.S. EE',   skills: ['Go', 'Kafka', 'PostgreSQL', 'Docker'],               match_score: 65, location: 'Remote',            status: 'Interview', salary_exp: 155000 },
]

// ── Kanban data ───────────────────────────────────────────────────────────
export const KANBAN: Record<string, KanbanCard[]> = {
  Applied: [
    { name: 'David Kim',       role: 'Data Scientist',    company: 'Netflix',   score: 87, date: '2024-06-01' },
    { name: 'Jessica T.',      role: 'Security Engineer', company: 'GitLab',    score: 76, date: '2024-06-03' },
    { name: 'Amanda Taylor',   role: 'QA Engineer',       company: 'Atlassian', score: 72, date: '2024-06-05' },
    { name: 'Natalie White',   role: 'Data Scientist',    company: 'Uber',      score: 68, date: '2024-06-06' },
  ],
  Screening: [
    { name: 'Sarah Chen',      role: 'DevOps Engineer',   company: 'Airbnb',    score: 89, date: '2024-05-28' },
    { name: 'Emily Rodriguez', role: 'Frontend Engineer', company: 'Meta',      score: 85, date: '2024-05-30' },
    { name: 'Daniel Martinez', role: 'Product Manager',   company: 'HubSpot',   score: 78, date: '2024-06-01' },
    { name: 'Kevin Patel',     role: 'Full Stack Dev',    company: 'Shopify',   score: 70, date: '2024-06-04' },
  ],
  Interview: [
    { name: 'Alex Johnson',    role: 'Senior SWE',        company: 'Stripe',    score: 96, date: '2024-05-25' },
    { name: 'James Wilson',    role: 'Full Stack Dev',    company: 'Shopify',   score: 91, date: '2024-05-26' },
    { name: 'Michael Brown',   role: 'Backend Engineer',  company: 'Amazon',    score: 83, date: '2024-05-27' },
    { name: 'Chris Harris',    role: 'Backend Engineer',  company: 'Lyft',      score: 65, date: '2024-05-29' },
  ],
  Offer: [
    { name: 'Maria Garcia',    role: 'ML Engineer',       company: 'Google',    score: 94, date: '2024-05-20' },
    { name: 'Ashley Davis',    role: 'Cloud Architect',   company: 'Microsoft', score: 81, date: '2024-05-22' },
  ],
  Hired: [
    { name: 'Ryan Lee',        role: 'Eng. Manager',      company: 'Dropbox',   score: 74, date: '2024-05-15' },
  ],
}

// ── Analytics data ────────────────────────────────────────────────────────
export const MONTHLY_DATA = [
  { month: 'Jan', applications: 45,  hires: 5,  revenue: 28000 },
  { month: 'Feb', applications: 52,  hires: 6,  revenue: 31000 },
  { month: 'Mar', applications: 61,  hires: 7,  revenue: 35000 },
  { month: 'Apr', applications: 74,  hires: 8,  revenue: 38000 },
  { month: 'May', applications: 68,  hires: 7,  revenue: 41000 },
  { month: 'Jun', applications: 83,  hires: 9,  revenue: 44000 },
  { month: 'Jul', applications: 91,  hires: 10, revenue: 42000 },
  { month: 'Aug', applications: 87,  hires: 9,  revenue: 45000 },
  { month: 'Sep', applications: 95,  hires: 11, revenue: 48000 },
  { month: 'Oct', applications: 102, hires: 12, revenue: 51000 },
  { month: 'Nov', applications: 115, hires: 13, revenue: 55000 },
  { month: 'Dec', applications: 128, hires: 15, revenue: 58000 },
]

export const FUNNEL_DATA = [
  { stage: 'Applications', count: 1200, fill: '#2563eb' },
  { stage: 'Screened',     count: 720,  fill: '#7c3aed' },
  { stage: 'Interviews',   count: 320,  fill: '#f59e0b' },
  { stage: 'Offers',       count: 95,   fill: '#10b981' },
  { stage: 'Hired',        count: 68,   fill: '#22c55e' },
]

export const SOURCES_DATA = [
  { source: 'LinkedIn',     count: 420 },
  { source: 'Indeed',       count: 310 },
  { source: 'Referral',     count: 185 },
  { source: 'Company Site', count: 145 },
  { source: 'GitHub',       count: 90  },
  { source: 'Other',        count: 50  },
]

export const TIME_TO_HIRE = [
  { dept: 'Engineering', days: 28 },
  { dept: 'Product',     days: 22 },
  { dept: 'Design',      days: 19 },
  { dept: 'Sales',       days: 31 },
  { dept: 'Marketing',   days: 25 },
  { dept: 'Data',        days: 24 },
]

export const SUCCESS_RATE = [
  { month: 'Jan', rate: 18 }, { month: 'Feb', rate: 20 },
  { month: 'Mar', rate: 22 }, { month: 'Apr', rate: 19 },
  { month: 'May', rate: 24 }, { month: 'Jun', rate: 23 },
  { month: 'Jul', rate: 21 }, { month: 'Aug', rate: 25 },
  { month: 'Sep', rate: 27 }, { month: 'Oct', rate: 26 },
  { month: 'Nov', rate: 28 }, { month: 'Dec', rate: 30 },
]

// ── Admin stats ───────────────────────────────────────────────────────────
export const ADMIN_STATS = {
  total_users:     4821,
  recruiters:       342,
  candidates:      4479,
  jobs_posted:     1253,
  active_jobs:      487,
  applications:   18904,
  hires:            682,
  monthly_revenue: 48500,
  arr:            582000,
  churn_rate:        2.3,
}

// ── Admin dashboard ────────────────────────────────────────────────────────
export const SUBSCRIPTION_TIERS = [
  { tier: 'Free',       users: 1842, price: '$0/mo',   color: '#94a3b8' },
  { tier: 'Starter',    users: 896,  price: '$49/mo',  color: '#6366f1' },
  { tier: 'Growth',     users: 312,  price: '$149/mo', color: '#8b5cf6' },
  { tier: 'Enterprise', users: 92,   price: '$499/mo', color: '#f59e0b' },
]

export const HEALTH_METRICS = [
  { label: 'API Uptime',        value: '99.98%', pct: 99.98, color: '#10b981' },
  { label: 'Avg Response Time', value: '142 ms', pct: 85,    color: '#6366f1' },
  { label: 'DB CPU Usage',      value: '34%',    pct: 34,    color: '#f59e0b' },
  { label: 'Error Rate',        value: '0.02%',  pct: 2,     color: '#10b981' },
]

// ── Recruiter dashboard ────────────────────────────────────────────────────
export const WEEKLY_APPLICATIONS = [
  { day: 'Mon', apps: 42 }, { day: 'Tue', apps: 58 },
  { day: 'Wed', apps: 51 }, { day: 'Thu', apps: 73 },
  { day: 'Fri', apps: 67 }, { day: 'Sat', apps: 29 },
  { day: 'Sun', apps: 18 },
]

export const DEPT_HIRES = [
  { dept: 'Eng',     hires: 8 },
  { dept: 'Product', hires: 3 },
  { dept: 'Design',  hires: 2 },
  { dept: 'Sales',   hires: 4 },
  { dept: 'Data',    hires: 2 },
]

export const RECRUITER_FUNNEL = [
  { stage: 'Applied',   count: 387, color: '#6366f1' },
  { stage: 'Screened',  count: 210, color: '#8b5cf6' },
  { stage: 'Interview', count: 86,  color: '#f59e0b' },
  { stage: 'Offer',     count: 28,  color: '#10b981' },
  { stage: 'Hired',     count: 19,  color: '#22c55e' },
]

export const TODAY_SCHEDULE = [
  { time: '10:00 AM', name: 'Alex Johnson', role: 'Senior SWE',     round: 'Technical Round', color: '#6366f1' },
  { time: '11:30 AM', name: 'Maria Garcia', role: 'Data Scientist',  round: 'Final Round',     color: '#10b981' },
  { time: '02:00 PM', name: 'James Wilson', role: 'DevOps Engineer', round: 'Technical Round', color: '#8b5cf6' },
  { time: '04:00 PM', name: 'Sarah Chen',   role: 'PM',              round: 'Culture Fit',     color: '#f59e0b' },
]

// ── Candidate dashboard ────────────────────────────────────────────────────
export const INTERVIEWS = [
  { company: 'Stripe',  role: 'Senior SWE',    time: 'Tomorrow, 2:00 PM',   color: '#10b981' },
  { company: 'Shopify', role: 'Backend Eng.',   time: 'Thu, Jun 20 @ 10 AM', color: '#6366f1' },
  { company: 'Airbnb',  role: 'Full Stack Dev', time: 'Fri, Jun 21 @ 3 PM',  color: '#8b5cf6' },
  { company: 'Netflix', role: 'Platform Eng.',  time: 'Pending Schedule',     color: '#f59e0b' },
]

export const PROFILE_TODOS = [
  { done: true,  label: 'Work experience added' },
  { done: true,  label: 'Skills listed' },
  { done: true,  label: 'Education filled' },
  { done: false, label: 'Upload resume' },
  { done: false, label: 'Add portfolio link' },
]

// ── Resume parser ──────────────────────────────────────────────────────────
export const SAMPLE_RESUME = {
  name: 'Alex Johnson', email: 'alex.johnson@email.com',
  phone: '+1 (555) 867-5309', location: 'San Francisco, CA',
  summary: 'Senior Software Engineer with 7+ years of experience building scalable distributed systems. Passionate about ML infrastructure and developer tooling.',
  score: 87,
  breakdown: [
    { label: 'Skills Match',          val: 92 },
    { label: 'Experience Relevance',  val: 88 },
    { label: 'Education Fit',         val: 75 },
    { label: 'Resume Formatting',     val: 85 },
    { label: 'Keywords Optimisation', val: 78 },
  ],
  skills: {
    technical: ['Python', 'Go', 'Kubernetes', 'AWS', 'PostgreSQL', 'Redis', 'Kafka', 'Docker', 'Terraform'],
    soft:      ['Leadership', 'Communication', 'Problem Solving', 'Agile', 'Mentoring'],
  },
  experience: [
    {
      title: 'Senior Software Engineer', company: 'Stripe', dates: 'Jan 2021 – Present',
      bullets: [
        'Led migration of payment pipeline to event-driven architecture (Kafka), reducing latency by 40%.',
        'Mentored 4 junior engineers and conducted 50+ technical interviews.',
        'Designed multi-region failover system with 99.99% uptime for $2B/day transactions.',
      ],
    },
    {
      title: 'Software Engineer', company: 'Airbnb', dates: 'Jun 2018 – Dec 2020',
      bullets: [
        'Built and maintained search ranking service serving 50M requests/day.',
        'Reduced infrastructure cost by 30% via spot-instance auto-scaling on AWS.',
      ],
    },
  ],
  education: [
    { degree: 'M.S. Computer Science', school: 'Stanford University', year: '2018', gpa: '3.9' },
    { degree: 'B.S. Computer Science', school: 'UC Berkeley',         year: '2016', gpa: '3.7' },
  ],
  certifications: [
    'AWS Solutions Architect – Professional',
    'Certified Kubernetes Administrator (CKA)',
  ],
}

// ── Analytics diversity ────────────────────────────────────────────────────
export const DIVERSITY_STATS = [
  { label: 'Gender Balance',   val: '48% / 52%', sub: 'Female / Male',        color: '#6366f1' },
  { label: 'Underrepresented', val: '34%',        sub: 'of new hires',          color: '#8b5cf6' },
  { label: 'Remote Hires',     val: '61%',        sub: 'of total hires',        color: '#10b981' },
  { label: 'Referral Hires',   val: '22%',        sub: 'via employee referral', color: '#f59e0b' },
]

// ── Auth demo users ────────────────────────────────────────────────────────
export type DBUser = { password: string; role: Role; name: string }
export const DEMO_USERS: Record<string, DBUser> = {
  'candidate@hireai.com': { password: 'demo123', role: 'candidate', name: 'Alex Johnson' },
  'recruiter@hireai.com': { password: 'demo123', role: 'recruiter', name: 'Sarah Chen' },
  'admin@hireai.com':     { password: 'demo123', role: 'admin',     name: 'Admin User' },
}
