# Nava Udyog — New Job, New Start. 🇮🇳

[![Next.js](https://img.shields.io/badge/Next.js-16.2.6-black?style=flat&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.4-blue?style=flat&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL%20%2B%20Auth-green?style=flat&logo=supabase)](https://supabase.com/)

---

## 1. Project Overview

**Nava Udyog** ("New Enterprise") is a high-performance, mobile-first employment platform designed specifically for India's blue-collar and grey-collar workforce. The platform connects skilled and semi-skilled workers (drivers, warehouse coordinators, construction workers, technicians, sales representatives, housekeeping and manufacturing staff) directly with verified businesses across India.

### Key Value Propositions
- **Skills-as-Profile**: Job seekers register without requiring an uploaded resume; qualifications, trades, experience, and certifications form an instant structured profile.
- **One-Tap Quick Apply**: Workers apply to verified listings in a single click, transmitting their structured profile directly to employer dashboards.
- **Employer Hiring Command Center**: Employers post jobs, track applicants via an interactive drag-and-drop Kanban pipeline (`applied` → `reviewing` → `interview` → `hired` → `rejected`), and contact candidates directly via WhatsApp and phone calls.
- **Admin Oversight**: Comprehensive platform metrics, job moderation controls, and searchable worker and business directories.
- **Enterprise Security**: Row-Level Security (RLS) enforced at the PostgreSQL database level, coupled with Next.js edge route protection.

---

## 2. Technology Stack

### Core Framework & Runtime
- **Next.js 16.2.6**: React framework with App Router, Server Components (RSC), and Server Actions.
- **React 19.2.4 & React DOM 19.2.4**: Modern concurrent React rendering engine.
- **TypeScript 5.x**: End-to-end type safety across client components, server actions, and database schemas.

### Database & Authentication
- **Supabase PostgreSQL**: Relational database with automated timestamps, foreign key cascades, and performance indexes.
- **Supabase Auth**: Secure email/password authentication, user metadata triggers, and session tokens.
- **Supabase Storage**: S3-compatible cloud object storage for employer company logos.
- **Row-Level Security (RLS)**: Fine-grained access control policies guaranteeing strict tenant isolation.

### UI & Styling
- **Tailwind CSS v4**: Utility-first CSS engine with modern `@theme inline` configuration.
- **Lucide React**: Clean, lightweight icon suite.
- **@dnd-kit**: Accessible drag-and-drop toolkit (`@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`) powering the employer Kanban board.
- **Sonner**: Toast notification system.
- **Brand Identity Tokens**: Navy (`#1976D2`), Amber (`#FF6F00`), and Soft Blue (`#E3F2FD`).

---

## 3. Project Architecture

The application adopts a hybrid Server-Side Rendering (SSR) and Client-Component architecture:

```
┌─────────────────────────────────────────────────────────────┐
│                      Client Browser                         │
│               (Responsive Mobile / Desktop)                 │
└──────────────────────────────┬──────────────────────────────┘
                               │
                        ┌──────▼──────┐
                        │Middleware.ts│  (Edge Auth & Role Routing)
                        └──────┬──────┘
                               │
            ┌──────────────────┼──────────────────┐
            │                  │                  │
    ┌───────▼────────┐  ┌──────▼───────┐  ┌───────▼────────┐
    │ Server Pages   │  │Server Actions│  │ Client View    │
    │ (SSR / RSC)    │  │ (Form Posts) │  │ (Interactivity)│
    └───────┬────────┘  └──────┬───────┘  └───────┬────────┘
            │                  │                  │
            └──────────────────┼──────────────────┘
                               │
                     ┌─────────▼─────────┐
                     │ Supabase Client   │
                     │  (SSR / Browser)  │
                     └─────────┬─────────┘
                               │
            ┌──────────────────┼──────────────────┐
            │                  │                  │
    ┌───────▼────────┐  ┌──────▼───────┐  ┌───────▼────────┐
    │  PostgreSQL    │  │Auth Service  │  │ Storage Bucket │
    │ (Tables + RLS) │  │  (JWT / DB)  │  │(employer-logos)│
    └────────────────┘  └──────────────┘  └────────────────┘
```

### Route Access Control Matrix
| Route Group | Path Pattern | Accessible By | Enforcement Mechanism |
|---|---|---|---|
| Public | `/`, `/jobs`, `/jobs/[id]`, `/auth/*` | All visitors | Public |
| Job Seeker | `/dashboard/employee/**`, `/profile/employee` | Role: `employee` | `middleware.ts` + RLS |
| Employer | `/dashboard/employer/**`, `/profile/employer` | Role: `employer` | `middleware.ts` + RLS |
| Platform Admin | `/dashboard/admin/**` | Role: `admin` | `middleware.ts` + RLS (`is_admin()`) |

---

## 4. Repository Structure

```
navaudyog/
├── app/
│   ├── auth/
│   │   ├── login/page.tsx                  # Sign in page
│   │   └── register/page.tsx               # Role-based registration page
│   ├── dashboard/
│   │   ├── admin/
│   │   │   ├── employees/                  # Admin employee directory
│   │   │   ├── employers/                  # Admin employer directory
│   │   │   ├── jobs/                       # Admin job moderation queue
│   │   │   └── page.tsx                    # Admin platform overview metrics
│   │   ├── employee/page.tsx               # Job seeker dashboard (applied/saved jobs)
│   │   └── employer/
│   │       ├── applicants/                 # Applicant Kanban board & detailed candidate views
│   │       ├── jobs/                       # Employer job listings & job creation
│   │       └── page.tsx                    # Employer dashboard command center
│   ├── jobs/
│   │   ├── [id]/page.tsx                   # Public job details page & quick apply
│   │   └── page.tsx                        # Public searchable job listings
│   ├── profile/
│   │   ├── employee/page.tsx               # Employee comprehensive profile setup
│   │   └── employer/page.tsx               # Employer company profile & logo upload
│   ├── favicon.ico
│   ├── globals.css                         # Global CSS & Tailwind design tokens
│   ├── landing.css                         # Landing page responsive styles
│   ├── layout.tsx                          # Root layout with AuthProvider & Toaster
│   └── page.tsx                            # Landing page
├── components/
│   ├── ui/
│   │   └── sonner.tsx                      # Toast notification component
│   ├── BottomNav.tsx                       # Responsive mobile bottom navigation
│   ├── CategoryBadge.tsx                   # Job industry category badge
│   ├── JobCard.tsx                         # Reusable job card with verified badge & logo
│   ├── Logo.tsx                            # Optimized brand logo component
│   ├── Navbar.tsx                          # Desktop & mobile responsive header
│   ├── StatusBadge.tsx                     # Application status badge
│   └── theme-provider.tsx                  # Next-themes wrapper
├── context/
│   └── AuthContext.tsx                     # Authentication state & session manager
├── lib/
│   ├── supabase/
│   │   ├── client.ts                       # Browser Supabase client
│   │   └── server.ts                       # Server Supabase client (cookie-backed)
│   ├── constants.ts                        # Categories, roles, statuses, brand constants
│   └── utils.ts                            # Class merge utilities
├── public/
│   └── logo.png                            # Official brand logo
├── scripts/
│   ├── inspect-db.js                       # Terminal database inspection utility
│   └── run-migrations.js                   # Automated Supabase SQL migration runner
├── supabase/
│   └── migrations/
│       ├── 001_initial_schema.sql          # Core tables, RLS policies, triggers, indexes
│       ├── 002_employee_details.sql        # Extended employee profile, education & experience
│       ├── 003_applicant_rls.sql           # Employer access policies for applicants
│       └── 004_employer_logos.sql          # Logo upload storage bucket & RLS policies
├── components.json                         # shadcn/ui configuration
├── eslint.config.mjs                       # Flat ESLint configuration
├── middleware.ts                           # Role-based edge authentication middleware
├── next.config.ts                          # Next.js build & image remote patterns configuration
├── package.json                            # Project dependencies & npm scripts
├── postcss.config.mjs                      # PostCSS plugins
├── tsconfig.json                           # TypeScript compiler configuration
└── README.md                               # Consolidated project documentation
```

---

## 5. Prerequisites

Before installing and running Nava Udyog, ensure your environment meets the following requirements:

- **Node.js**: v18.18.0 or newer (v20+ recommended).
- **npm**: v9.0.0 or newer (or compatible package manager).
- **Supabase Account**: An active Supabase project with PostgreSQL and Auth enabled.
- **Git**: Installed for version control.

---

## 6. Installation Instructions

1. Clone or navigate into the repository:
   ```bash
   cd navaudyog
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

---

## 7. Frontend Setup

The frontend runs via Next.js App Router and requires no build step for local development.

1. Ensure dependencies are installed:
   ```bash
   npm install
   ```
2. Confirm font fallbacks and asset paths resolve cleanly.
3. Start the local development server:
   ```bash
   npm run dev
   ```
4. Access the web interface at `http://localhost:3000`.

---

## 8. Backend Setup

The application backend is built upon Supabase (PostgreSQL, Auth, Storage, and Edge RPC).

1. Create a project in [Supabase Console](https://supabase.com).
2. Retrieve your project URL and anonymous public key from **Project Settings → API**.
3. Create a `.env.local` file in the project root (see Section 9).
4. Run the database migrations (see Section 10).

---

## 9. Environment Variables

Create `.env.local` in the `navaudyog` folder with the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Optional: Service Role Key (used only for running scripts/run-migrations.js)
# SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

> [!IMPORTANT]
> Never commit `.env.local` or service role keys to version control. The repository `.gitignore` automatically excludes all `.env*.local` files.

---

## 10. Database Configuration

The database schema is organized into versioned migrations inside `supabase/migrations/`:

| Migration File | Description |
|---|---|
| `001_initial_schema.sql` | Creates `profiles`, `employee_profiles`, `employer_profiles`, `jobs`, `applications`, `saved_jobs` tables with Row-Level Security, indexes, and user creation triggers. |
| `002_employee_details.sql` | Adds extended profile attributes to `employee_profiles` and introduces `education_qualifications` and `work_experiences` tables. |
| `003_applicant_rls.sql` | Defines RLS policies permitting employers to inspect applicant details and educational background for their jobs. |
| `004_employer_logos.sql` | Adds `logo_url` to `employer_profiles` and creates the `employer-logos` storage bucket with upload/read RLS policies. |

### Executing Migrations

**Option A (Supabase SQL Editor — Recommended):**
Open each migration file in sequential order (`001` → `004`) in your Supabase Dashboard SQL Editor and execute them.

**Option B (Automated Migration Script):**
If you have configured `SUPABASE_SERVICE_ROLE_KEY`:
```bash
npm run migrate:supabase
```

---

## 11. API Overview

Nava Udyog relies on Supabase client and Server Actions for data exchange:

### Public Endpoints / Queries
- `jobs`: Filterable by `query` (title search), `category`, `location`, `pay_type`. Only records where `status = 'active'` are returned publicly.
- `employer_profiles`: Publicly queryable for verified company details.

### Authenticated Job Seeker Endpoints
- `applications.insert`: Quick apply action binding `job_id` and `employee_id`.
- `applications.select`: Query applications filtered to `auth.uid() = employee_id`.
- `saved_jobs.select / insert / delete`: Manage bookmarked positions.
- `employee_profiles.upsert`: Update candidate details, languages, skills, and declaration.

### Authenticated Employer Endpoints
- `jobs.insert / update`: Create and manage employer jobs (`draft` / `active` / `closed`).
- `applications.select`: Query applicants for jobs owned by the employer.
- `applications.update`: Move applicant status across Kanban columns (`applied`, `reviewing`, `interview`, `hired`, `rejected`).
- `storage.upload`: Upload company logos to `employer-logos` bucket.

### Platform Admin Endpoints
- Metrics aggregation: Exact counts of registered job seekers, employers, active jobs, and total applications.
- Moderation queue: Job status updates (`active` / `closed`).

---

## 12. Development Commands

| Command | Purpose |
|---|---|
| `npm run dev` | Launches the local development server at `http://localhost:3000` |
| `npm run build` | Compiles an optimized Next.js production build |
| `npm run start` | Starts the production server after building |
| `npm run lint` | Runs ESLint across the codebase |
| `npm run db:view` | Inspects database tables and counts from the terminal |
| `npm run migrate:supabase` | Executes all pending SQL migrations against Supabase |

---

## 13. Build Instructions

To build Nava Udyog for production:

```bash
npm run build
```

This runs Next.js build compilation with Turbopack, validates TypeScript types, generates static pages, and creates the optimized output in `.next/`.

To test the compiled build locally:
```bash
npm run start
```

---

## 14. Testing Instructions

### Automated Verification
1. **Lint Check**:
   ```bash
   npm run lint
   ```
   Ensures 0 errors across all code files.

2. **Build Validation**:
   ```bash
   npm run build
   ```
   Ensures full TypeScript compile success and page prerendering.

3. **Database Health**:
   ```bash
   npm run db:view
   ```
   Verifies database connectivity, table accessibility, and sample data.

### Manual Workflow Verification
1. **Job Browsing**: Navigate to `/jobs` — verify filters (category, pay type, search) and click into a job detail page (`/jobs/[id]`).
2. **Job Seeker Registration**:
   - Register at `/auth/register` choosing "Job Seeker".
   - Complete candidate profile at `/profile/employee`.
   - Apply to an active job from `/jobs/[id]`.
   - Verify application appears in `/dashboard/employee`.
3. **Employer Registration & Posting**:
   - Register at `/auth/register` choosing "Employer".
   - Complete company profile at `/profile/employer`.
   - Post a job from `/dashboard/employer/jobs/new`.
   - Verify job appears on `/dashboard/employer/jobs`.
   - Open `/dashboard/employer/applicants` and test dragging candidate cards between columns.
4. **Admin Dashboard**:
   - Sign in with an account having `role: 'admin'`.
   - Verify metrics on `/dashboard/admin`.
   - Verify employee directory (`/dashboard/admin/employees`) and employer directory (`/dashboard/admin/employers`).

---

## 15. Deployment Instructions

### Vercel Deployment (Recommended)
1. Push repository code to GitHub or GitLab.
2. In the Vercel dashboard, click **Add New Project** and select the repository.
3. Configure the Project Settings:
   - **Framework Preset**: Next.js
   - **Root Directory**: `navaudyog`
4. Add Environment Variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Click **Deploy**. Vercel will build and deploy edge routes worldwide.

### Self-Hosted / Docker
1. Build the standalone Next.js image using Node 20+.
2. Pass environment variables via container configuration.
3. Expose port `3000` and launch with `next start`.

---

## 16. Known Limitations

- **Font Pre-fetching in Air-gapped Environments**: Google Fonts via `next/font/google` requires internet connectivity during production builds. For strictly offline/isolated build environments, system font fallbacks defined in `app/globals.css` are utilized.
- **Dynamic Image Optimization**: Remote employer logos stored in Supabase storage are loaded with domain patterns whitelisted in `next.config.ts`.
- **Admin Assignment**: Platform admin users are designated directly in the `profiles` table by setting `role = 'admin'` via database management or SQL query.

---

## License

Copyright © 2026 Nava Udyog. All rights reserved. Made in India 🇮🇳.
