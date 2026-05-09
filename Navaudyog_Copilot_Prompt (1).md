# Navaudyog — GitHub Copilot Master Development Prompt
> **"New Job, New Start." | Made in India 🇮🇳**
> Blue & Grey Collar Job Portal | 3-Hour MVP Sprint

---

## 🧠 PROJECT CONTEXT (Read First)

You are building **Navaudyog**, India's blue and grey collar job portal. This is a 3-hour MVP sprint. Every decision must favour speed, simplicity, and mobile-first UX.

**Tagline:** "New Job, New Start."
**Made in India 🇮🇳**

**Stack:** Next.js 14 (TypeScript), Tailwind CSS, Supabase (Auth + PostgreSQL + Storage), shadcn/ui, @dnd-kit/core, Recharts, Vercel deployment.

---

### 👥 Roles & Route Paths

Every file you create must be role-aware. Use the table below as the authoritative reference for which role owns which path. Middleware enforces this — never render a page without confirming the session role matches.

| Role | Value in DB | Post-login Redirect | Dashboard Root | Profile Setup Path |
|------|-------------|---------------------|----------------|--------------------|
| Job Seeker | `employee` | `/dashboard/employee` | `/dashboard/employee` | `/profile/employee` |
| Employer | `employer` | `/dashboard/employer` | `/dashboard/employer` | `/profile/employer` |
| Admin | `admin` | `/dashboard/admin` | `/dashboard/admin` | N/A (seeded manually) |

#### Role-based path ownership:

```
/dashboard/employee/**        → role: 'employee' only
  /dashboard/employee         → Application history, saved jobs, profile summary
  /dashboard/employee/profile → Edit employee profile

/dashboard/employer/**        → role: 'employer' only
  /dashboard/employer         → Employer home / overview
  /dashboard/employer/jobs    → My job listings
  /dashboard/employer/jobs/new → Post a new job
  /dashboard/employer/applicants → Kanban board (all applicants)
  /dashboard/employer/applicants/[applicationId] → Single applicant detail

/dashboard/admin/**           → role: 'admin' only
  /dashboard/admin            → Analytics dashboard
  /dashboard/admin/employees  → All employee data table
  /dashboard/admin/employers  → All employer data table
  /dashboard/admin/jobs       → Job moderation queue

/profile/employee             → role: 'employee' (first-time setup, also editable later)
/profile/employer             → role: 'employer' (first-time setup, also editable later)

PUBLIC (no auth required):
  /                           → Landing page
  /jobs                       → Browse all active jobs
  /jobs/[id]                  → Job detail (apply requires auth)
  /auth/login                 → Login
  /auth/register              → Register
```

#### Role guard pattern (use in every protected page):
```typescript
// At the top of every dashboard page (server component):
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

const supabase = createClient()
const { data: { user } } = await supabase.auth.getUser()
if (!user) redirect('/auth/login')

const { data: profile } = await supabase
  .from('profiles')
  .select('role')
  .eq('id', user.id)
  .single()

if (profile?.role !== 'employee') redirect('/auth/login') // change role per page
```

---

**Three user roles:**
- `employee` — job seeker (no resume required; profile-only). Paths: `/dashboard/employee/**`, `/profile/employee`
- `employer` — auto-approved on signup, posts jobs, tracks applicants via Kanban. Paths: `/dashboard/employer/**`, `/profile/employer`
- `admin` — sees ALL data, manages users, views analytics. Paths: `/dashboard/admin/**`

---

## ⚡ PHASE 1 — Foundation & Auth (~30 min)

### Task 1.1 — Project Scaffold
```
Create a Next.js 14 project with TypeScript, Tailwind CSS, App Router, and shadcn/ui.
Install dependencies: @supabase/supabase-js @supabase/ssr @dnd-kit/core @dnd-kit/sortable recharts lucide-react
Create .env.local with: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY placeholders.
```

### Task 1.2 — Supabase Client Setup
```
Create lib/supabase/client.ts — browser Supabase client using createBrowserClient from @supabase/ssr.
Create lib/supabase/server.ts — server Supabase client using createServerClient from @supabase/ssr with cookie handling for Next.js App Router.
Create middleware.ts at root — refresh session on every request, protect routes by role (see Role Path table in PROJECT CONTEXT):
  - /dashboard/employee/** → role must be 'employee'  → redirect to /auth/login if not
  - /dashboard/employer/** → role must be 'employer'  → redirect to /auth/login if not
  - /dashboard/admin/**    → role must be 'admin'     → redirect to /auth/login if not
  - /profile/employee      → role must be 'employee'
  - /profile/employer      → role must be 'employer'
  - Public routes (no auth): /, /jobs, /jobs/[id], /auth/login, /auth/register
Read role from profiles table (id = auth user id, role column).
After login, always redirect to /dashboard/[role] — never to a generic /dashboard.
```

### Task 1.3 — Auth Pages
```
Create app/auth/login/page.tsx:
- Email + Password fields, large inputs (mobile-first)
- "Login" button, link to register
- On success: redirect to /dashboard/[role] based on profile.role
- Show toast on error

Create app/auth/register/page.tsx:
- Two tabs or toggle: "I am a Job Seeker" | "I am an Employer"
- Common fields: Full Name, Email, Password, Phone Number
- On submit: call supabase.auth.signUp(), then insert into profiles table with role='employee' or role='employer'
- Employer: auto-approved (no extra step needed, just insert with role='employer')
- Redirect to profile setup after registration
```

### Task 1.4 — Landing Page
```
Create app/page.tsx — Navaudyog landing page with:
- Header: "NAVAUDYOG" logo in deep navy (#1A237E), tagline "New Job, New Start." in amber (#FF6F00)
- "Made in India 🇮🇳" badge
- Hero: "Find your next job in India's growing industries" — large CTA buttons: "Browse Jobs" and "Post a Job"
- 6 job category cards with icons: Construction, Manufacturing, Delivery, Security, Retail, Driver
- Simple footer with Made in India note and tagline "New Job, New Start."
- Colors: primary #1A237E (navy), accent #FF6F00 (amber), bg white/gray-50
- Mobile-first, fully responsive
```

### Task 1.5 — Context / Session Hook
```
Create context/AuthContext.tsx:
- Provides: user, profile (with role), loading, signOut, dashboardPath
- dashboardPath is a computed helper: 
    role === 'employee' → '/dashboard/employee'
    role === 'employer' → '/dashboard/employer'
    role === 'admin'    → '/dashboard/admin'
- Fetches profile from profiles table on mount
- Wraps entire app in app/layout.tsx
- Export a useAuth() hook for use in any client component
- Role is always read from profiles.role (DB source of truth), never from localStorage or client state alone
```

---

## ⚡ PHASE 2 — Database Schema & Profiles (~30 min)

### Task 2.1 — Supabase SQL Migration
```sql
-- Run this in Supabase SQL editor --

-- PROFILES (one per auth user)
create table profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  role text not null check (role in ('employee', 'employer', 'admin')),
  full_name text not null,
  phone text not null,
  created_at timestamptz default now()
);

-- EMPLOYEE PROFILES
create table employee_profiles (
  id uuid references profiles(id) on delete cascade primary key,
  city text not null,
  job_categories text[] not null default '{}',
  years_experience text not null default '0', -- '0','1-2','3-5','5+'
  pay_preference text not null default 'Any', -- 'Daily','Weekly','Monthly','Any'
  availability text not null default 'Immediately', -- 'Immediately','1 week','1 month'
  languages text[] not null default '{}'
);

-- EMPLOYER PROFILES
create table employer_profiles (
  id uuid references profiles(id) on delete cascade primary key,
  company_name text not null,
  company_type text not null, -- 'Factory','Contractor','Agency','Direct Employer'
  locations text[] not null default '{}',
  description text,
  contact_phone text not null
);

-- JOBS
create table jobs (
  id uuid default gen_random_uuid() primary key,
  employer_id uuid references profiles(id) on delete cascade not null,
  title text not null,
  category text not null,
  location text not null,
  pay_amount integer not null,
  pay_type text not null, -- 'Daily','Weekly','Monthly','Contract'
  openings integer not null default 1,
  description text not null,
  status text not null default 'draft' check (status in ('draft','active','closed')),
  created_at timestamptz default now()
);

-- APPLICATIONS
create table applications (
  id uuid default gen_random_uuid() primary key,
  job_id uuid references jobs(id) on delete cascade not null,
  employee_id uuid references profiles(id) on delete cascade not null,
  status text not null default 'applied' check (status in ('applied','reviewing','interview','hired','rejected')),
  note text,
  created_at timestamptz default now(),
  unique(job_id, employee_id)
);

-- SAVED JOBS
create table saved_jobs (
  id uuid default gen_random_uuid() primary key,
  employee_id uuid references profiles(id) on delete cascade not null,
  job_id uuid references jobs(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(employee_id, job_id)
);

-- AUTO-INSERT PROFILE TRIGGER
create or replace function handle_new_user() returns trigger as $$
begin
  -- profile inserted from client after signup; trigger is a safety net
  return new;
end;
$$ language plpgsql security definer;

-- RLS POLICIES
alter table profiles enable row level security;
alter table employee_profiles enable row level security;
alter table employer_profiles enable row level security;
alter table jobs enable row level security;
alter table applications enable row level security;
alter table saved_jobs enable row level security;

-- profiles: users read/write own; admin reads all
create policy "own profile" on profiles for all using (auth.uid() = id);
create policy "admin reads all profiles" on profiles for select using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- employee_profiles: own only; admin reads all
create policy "own employee profile" on employee_profiles for all using (auth.uid() = id);
create policy "admin reads employee profiles" on employee_profiles for select using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- employer_profiles: own only; admin reads all
create policy "own employer profile" on employer_profiles for all using (auth.uid() = id);
create policy "admin reads employer profiles" on employer_profiles for select using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- jobs: public read active; employer manages own; admin reads all
create policy "public read active jobs" on jobs for select using (status = 'active');
create policy "employer manages own jobs" on jobs for all using (auth.uid() = employer_id);
create policy "admin reads all jobs" on jobs for select using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- applications: employee manages own; employer reads for their jobs; admin reads all
create policy "employee manages own applications" on applications for all using (auth.uid() = employee_id);
create policy "employer reads own job applications" on applications for select using (
  exists (select 1 from jobs where id = job_id and employer_id = auth.uid())
);
create policy "employer updates application status" on applications for update using (
  exists (select 1 from jobs where id = job_id and employer_id = auth.uid())
);
create policy "admin reads all applications" on applications for select using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- saved_jobs: employee manages own
create policy "employee manages saved jobs" on saved_jobs for all using (auth.uid() = employee_id);
```

### Task 2.2 — Employee Profile Setup Page
```
Create app/profile/employee/page.tsx:
Form fields (all required except languages):
1. City — text input with placeholder "e.g. Mumbai, Delhi, Pune"
2. Job Categories — multi-select checkboxes (Construction & Labour, Manufacturing & Factory, Delivery & Logistics, Security & Housekeeping, Retail & Sales, Driver & Transport)
3. Years of Experience — radio or select: "No experience", "1-2 years", "3-5 years", "5+ years"
4. Preferred Pay Type — radio: "Daily Wage", "Weekly", "Monthly Salary", "Any"
5. Available to Join — radio: "Immediately", "Within 1 week", "Within 1 month"
6. Languages Spoken — checkboxes: Hindi, English, Tamil, Telugu, Kannada, Bengali, Marathi, Other

On submit: upsert into employee_profiles table.
Show success toast, redirect to /dashboard/employee.
NO resume upload field anywhere.
```

### Task 2.3 — Employer Profile Setup Page
```
Create app/profile/employer/page.tsx:
Form fields:
1. Company Name — text input
2. Company Type — select: Factory, Contractor, Agency, Direct Employer
3. City / Location(s) — text input (comma separated or tag input)
4. Contact Phone — tel input (pre-fill from profiles.phone)
5. About Company — textarea (optional, max 500 chars)

On submit: upsert into employer_profiles table.
Show success toast, redirect to /dashboard/employer.
```

---

## ⚡ PHASE 3 — Job Posting & Discovery (~30 min)

### Task 3.1 — Employee: Browse Jobs Page
```
Create app/jobs/page.tsx — SSR page:
- Fetch all jobs with status='active' including employer_profiles (company_name)
- Left sidebar or top bar filters:
  * Category (multi-select checkboxes)
  * Location (text search)
  * Pay Type (Daily/Weekly/Monthly)
  * Min Pay Amount (number input)
- Job cards showing: Job Title, Company Name, Location, Pay (amount + type), Category badge, "X openings", Posted date
- Each card links to /jobs/[id]
- "Save" bookmark icon on each card (toggles saved_jobs)
- Fully mobile-responsive grid
```

### Task 3.2 — Job Detail Page
```
Create app/jobs/[id]/page.tsx — SSR:
- Show full job details: title, company, location, pay, openings, description, posted date
- "Apply Now" button — if not logged in, redirect to /auth/login
- If already applied: show status badge ("Applied", "Interview Scheduled", etc.)
- If logged in as employee: one-tap apply modal with optional note field (max 200 chars)
- On apply: insert into applications table
```

### Task 3.3 — Employer: Post a Job
```
Create app/dashboard/employer/jobs/new/page.tsx:
Form fields:
1. Job Title — text input (e.g. "Delivery Boy", "Mason Helper")
2. Category — select from 6 categories
3. Location — text input
4. Number of Openings — number input (default 1)
5. Pay Amount — number input
6. Pay Type — select: Daily Wage, Weekly, Monthly, Per Contract
7. Job Description — textarea (what is the work, timings, requirements — plain language)
8. Start Date — date picker (optional)
9. Status — radio: Save as Draft | Publish Now

On submit: insert into jobs table.
Show toast, redirect to /dashboard/employer/jobs.
```

### Task 3.4 — Employer: Job Listings Dashboard
```
Create app/dashboard/employer/jobs/page.tsx:
- Table of employer's own jobs: Title, Category, Location, Pay, Openings, Status, Applicants count, Actions
- Actions: Edit, Deactivate (set status='closed'), View Applicants
- "Post New Job" button prominent at top
- Status badge: Draft (gray), Active (green), Closed (red)
```

---

## ⚡ PHASE 4 — Applications & Tracking (~40 min)

### Task 4.1 — Employee: Application History
```
Create app/dashboard/employee/page.tsx:
- Section 1: Application History
  * Table/cards showing: Job Title, Company, Applied Date, Status badge
  * Status colours: Applied=blue, Reviewing=yellow, Interview=purple, Hired=green, Rejected=red
- Section 2: Saved Jobs
  * List of bookmarked jobs with quick Apply button
- Section 3: Profile summary with "Edit Profile" link
```

### Task 4.2 — Employer: Kanban Board
```
Create app/dashboard/employer/applicants/page.tsx:
Kanban board with 5 columns:
  - Applied | Reviewing | Interview Scheduled | Hired | Rejected

Each column contains application cards.
Each card shows:
  - Candidate full name
  - City
  - Experience level
  - Job title they applied for
  - Applied date
  - "Call" button — shows phone number in a modal/tooltip (reveals profiles.phone)
  - "WhatsApp" button — links to https://wa.me/91{phone}?text=Hi, I saw your application on Navaudyog
  - Short note if provided

Drag-and-drop using @dnd-kit/core:
  - Dragging a card between columns updates applications.status in Supabase
  - Optimistic UI update (update local state first, then sync)

Use employer_id filter — employer only sees applicants for their own jobs.
```

### Task 4.3 — Employer: Application Detail View
```
Create app/dashboard/employer/applicants/[applicationId]/page.tsx:
Full candidate profile view:
- Name, Phone, City
- Job Categories, Experience, Availability, Pay Preference
- Languages Spoken
- Note left with application
- Status dropdown to change status
- Call button + WhatsApp button
- Back to Kanban link
```

---

## ⚡ PHASE 5 — Admin & Polish (~30 min)

### Task 5.1 — Admin: Employee Data Table
```
Create app/dashboard/admin/employees/page.tsx:
Full data table with ALL employee data (admin can see everything):
Columns: Full Name | Phone | City | Job Categories | Experience | Pay Preference | Availability | Joined | Status | Actions

Actions per row: View Full Profile | Ban User (set a banned flag or delete) | Promote to Admin

Search bar across name, phone, city.
Filter by category, experience, status.
Export to CSV button.
```

### Task 5.2 — Admin: Employer Data Table
```
Create app/dashboard/admin/employers/page.tsx:
Full data table with ALL employer data:
Columns: Company Name | Type | Contact Person | Phone | Locations | Jobs Posted | Active Jobs | Joined | Actions

Actions: View Profile | Ban | View All Jobs
Search and filter controls.
```

### Task 5.3 — Admin: Job Moderation Queue
```
Create app/dashboard/admin/jobs/page.tsx:
Table of all jobs (all statuses):
Columns: Title | Company | Category | Location | Pay | Openings | Status | Posted | Actions
Actions: Approve (set active), Reject (set closed), View Detail
Filter by status: All / Draft / Active / Closed
```

### Task 5.4 — Admin: Analytics Dashboard
```
Create app/dashboard/admin/page.tsx:
Metric cards (top row):
- Total Employees registered
- Total Employers registered  
- Total Active Job Postings
- Total Applications Submitted
- Application Success Rate (Hired / Total * 100)%

Charts (use Recharts):
- Line chart: New signups per day (last 30 days) — employees vs employers
- Bar chart: Applications by job category
- Pie chart: Application status breakdown

All data fetched server-side from Supabase with admin RLS.
```

### Task 5.5 — UX Polish
```
Add across all pages:
1. Loading skeletons — use shadcn/ui Skeleton component on all data-fetching pages
2. Toast notifications — use shadcn/ui Toaster for success/error on all form submits
3. Empty states — illustrated empty state when no jobs, no applications, no applicants
4. Error boundaries — graceful error pages
5. 404 page — friendly "Page not found" with link to home
6. Responsive check — test all pages at 375px (mobile), 768px (tablet), 1280px (desktop)
7. Navigation:
   - Top nav for desktop with role-based links
   - Bottom tab nav for mobile (employee: Browse, Applications, Saved, Profile)
   - Employer mobile nav: Post Job, Applicants, My Jobs, Profile
8. Navaudyog branding:
   - Logo: "NAVAUDYOG" in #1A237E bold
   - Tagline: "New Job, New Start." in #FF6F00 italic
   - "Made in India 🇮🇳" in every footer
   - Favicon: "N" in navy blue
```

---

## 🗂️ FILE STRUCTURE

```
navaudyog/
├── app/
│   ├── layout.tsx                        # Root layout with AuthContext + Toaster
│   ├── page.tsx                          # Landing page
│   ├── auth/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── profile/
│   │   ├── employee/page.tsx             # Employee profile setup
│   │   └── employer/page.tsx             # Employer profile setup
│   ├── jobs/
│   │   ├── page.tsx                      # Browse jobs (SSR)
│   │   └── [id]/page.tsx                 # Job detail + apply
│   └── dashboard/
│       ├── employee/
│       │   └── page.tsx                  # Applications + saved jobs
│       ├── employer/
│       │   ├── page.tsx                  # Employer home
│       │   ├── jobs/
│       │   │   ├── page.tsx              # Job listings
│       │   │   └── new/page.tsx          # Post job form
│       │   └── applicants/
│       │       ├── page.tsx              # Kanban board
│       │       └── [applicationId]/page.tsx
│       └── admin/
│           ├── page.tsx                  # Analytics dashboard
│           ├── employees/page.tsx
│           ├── employers/page.tsx
│           └── jobs/page.tsx
├── components/
│   ├── ui/                               # shadcn components
│   ├── JobCard.tsx
│   ├── KanbanBoard.tsx
│   ├── KanbanCard.tsx
│   ├── CategoryBadge.tsx
│   ├── StatusBadge.tsx
│   ├── Navbar.tsx
│   ├── BottomNav.tsx
│   └── AdminSidebar.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   └── server.ts
│   └── constants.ts                      # JOB_CATEGORIES, PAY_TYPES, etc.
├── context/
│   └── AuthContext.tsx
├── middleware.ts
└── .env.local
```

---

## 📋 CONSTANTS (lib/constants.ts)

```typescript
export const JOB_CATEGORIES = [
  "Construction & Labour",
  "Manufacturing & Factory",
  "Delivery & Logistics",
  "Security & Housekeeping",
  "Retail & Sales",
  "Driver & Transport",
] as const;

export const PAY_TYPES = ["Daily Wage", "Weekly", "Monthly Salary", "Per Contract"] as const;

export const EXPERIENCE_OPTIONS = ["No experience", "1-2 years", "3-5 years", "5+years"] as const;

export const AVAILABILITY_OPTIONS = ["Immediately", "Within 1 week", "Within 1 month"] as const;

export const COMPANY_TYPES = ["Factory", "Contractor", "Agency", "Direct Employer"] as const;

export const APPLICATION_STATUSES = ["applied", "reviewing", "interview", "hired", "rejected"] as const;

export const KANBAN_COLUMNS = [
  { id: "applied", label: "Applied", color: "bg-blue-100 border-blue-300" },
  { id: "reviewing", label: "Reviewing", color: "bg-yellow-100 border-yellow-300" },
  { id: "interview", label: "Interview Scheduled", color: "bg-purple-100 border-purple-300" },
  { id: "hired", label: "Hired", color: "bg-green-100 border-green-300" },
  { id: "rejected", label: "Rejected", color: "bg-red-100 border-red-300" },
] as const;

export const BRAND = {
  primary: "#1A237E",
  accent: "#FF6F00",
  tagline: "New Job, New Start.",
  name: "Navaudyog",
};

export const ROLE_PATHS: Record<string, string> = {
  employee: "/dashboard/employee",
  employer: "/dashboard/employer",
  admin: "/dashboard/admin",
};
```

---

## 🎨 TAILWIND COLOR CONFIG (tailwind.config.ts)

```typescript
theme: {
  extend: {
    colors: {
      brand: {
        DEFAULT: '#1A237E',
        light: '#E8EAF6',
      },
      accent: {
        DEFAULT: '#FF6F00',
        light: '#FFF3E0',
      }
    }
  }
}
```

---

## ✅ COPILOT USAGE TIPS FOR THIS SPRINT

1. **Start each file** by typing the file path as a comment — Copilot will read context from nearby files.
2. **Use inline comments** to direct generation: `// Fetch all active jobs with employer company_name joined`
3. **Type the function signature** and let Copilot complete the body.
4. **For forms**, type the field name and Copilot will suggest the full shadcn/ui Input + Label pattern.
5. **For Supabase queries**, type `const { data, error } = await supabase.from('jobs')` and Copilot will suggest `.select()`, `.eq()`, etc.
6. **For the Kanban**, type the @dnd-kit imports and Copilot will scaffold DndContext + SortableContext.
7. **Always verify RLS** — after Copilot generates a query, confirm the logged-in user's role is correctly checked.

---

## 🚀 DEPLOYMENT CHECKLIST

- [ ] Push to GitHub
- [ ] Connect repo to Vercel
- [ ] Add env vars in Vercel: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
- [ ] Run SQL migration in Supabase SQL editor
- [ ] Test register as Employee → complete profile → browse jobs → apply
- [ ] Test register as Employer → complete profile → post job → view Kanban
- [ ] Test admin login → check employee/employer tables show all data
- [ ] Verify RLS: employee cannot see other employee's phone numbers
- [ ] Mobile check at 375px on Chrome DevTools

---

*Navaudyog — New Job, New Start. 🇮🇳*
*Made in India | Built for India's real workforce*
