# Navaudyog Architecture Documentation

## System Overview

Navaudyog is a mobile-first, role-based job portal built with modern web technologies following a **3-hour MVP sprint** principle. The architecture prioritizes:

1. **Speed** — Minimal overhead, focus on core features
2. **Simplicity** — Clear separation of concerns
3. **Scalability** — Modular components and database design
4. **Security** — Row-Level Security (RLS) and auth middleware

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      Browser / Mobile                    │
│                  (Next.js Client Components)              │
└──────────────────────┬──────────────────────────────────┘
                       │
                ┌──────▼──────┐
                │  Middleware │
                │  (Auth + RLS)│
                └──────┬──────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
   ┌────▼────┐    ┌───▼────┐    ┌───▼──────┐
   │ SSR Page │    │ API    │    │  Client  │
   │ (Server) │    │ Route  │    │Component │
   └────┬────┘    └───┬────┘    └───┬──────┘
        │             │             │
        └─────────────┼─────────────┘
                      │
            ┌─────────▼─────────┐
            │ Supabase Client   │
            │ (Auth + DB)       │
            └─────────┬─────────┘
                      │
        ┌─────────────┼─────────────┐
        │             │             │
   ┌────▼──────┐ ┌───▼────┐  ┌────▼──────┐
   │ PostgreSQL│ │  Auth  │  │ Storage   │
   │ Database  │ │ Service│  │ (Files)   │
   └───────────┘ └────────┘  └───────────┘
```

---

## Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | Next.js 14 (App Router) | SSR, streaming, API routes |
| Language | TypeScript | Type safety, developer experience |
| Styling | Tailwind CSS + shadcn/ui | Responsive, accessible components |
| State | React Context + Server Components | Auth, session management |
| Backend | Supabase PostgreSQL | Database, RLS policies |
| Auth | Supabase Auth | Email/password, JWT tokens |
| DragDrop | @dnd-kit | Kanban board drag-and-drop |
| Charts | Recharts | Analytics visualization |
| Icons | Lucide React | Consistent icon library |
| Deployment | Vercel | Global edge functions, CDN |

---

## Authentication Flow

### 1. Registration (Sign Up)

```
User Form (Email, Password, Role)
        ↓
Auth.signUp() via Supabase
        ↓
User Created in auth.users
        ↓
Insert into profiles table (role = 'employee' or 'employer')
        ↓
Redirect to /profile/[role] for setup
```

### 2. Profile Setup

```
Employee/Employer Setup Form
        ↓
Upsert to employee_profiles or employer_profiles
        ↓
Redirect to /dashboard/[role]
```

### 3. Session Management

```
Login Form (Email, Password)
        ↓
Auth.signInWithPassword()
        ↓
JWT Token stored in secure HttpOnly cookie (via @supabase/ssr)
        ↓
Middleware refreshes token on every request
        ↓
getUser() returns user + profile role
        ↓
Role-based redirect to /dashboard/[role]
```

### 4. Logout

```
signOut()
        ↓
Clear auth cookies
        ↓
Redirect to /auth/login
```

---

## Role-Based Access Control (RBAC)

### Roles & Permissions

| Role | Paths | Permissions |
|------|-------|-----------|
| **employee** | `/dashboard/employee/*` | Browse jobs, apply, view applications, save jobs |
| **employer** | `/dashboard/employer/*` | Post jobs, view applicants, drag-update status |
| **admin** | `/dashboard/admin/*` | View all data, analytics, moderation |

### Middleware Enforcement

Located in [middleware.ts](middleware.ts):

```typescript
// For each protected route, check:
1. User logged in? → If no, redirect /auth/login
2. Profile role matches route? → If no, redirect /auth/login
3. Allow or block request
```

### Row-Level Security (RLS)

Implemented in Supabase PostgreSQL:

```sql
-- Example: profiles table
CREATE POLICY "own profile" ON profiles
  FOR ALL USING (auth.uid() = id);

CREATE POLICY "admin reads all" ON profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
```

---

## Data Flow Architecture

### 1. Server Components (SSR)

Used for:
- Initial page load data fetching
- Admin dashboards (all data)
- Public job listings

```typescript
// app/jobs/page.tsx
export default async function JobsPage() {
  const supabase = createClient() // server client
  const { data: jobs } = await supabase
    .from('jobs')
    .select('*, employer_profiles(company_name)')
    .eq('status', 'active')
  return <div>{/* render jobs */}</div>
}
```

**Advantages:**
- Data fetched on server (no client JS overhead)
- SQL queries execute server-side (faster)
- API keys never exposed to browser
- Better SEO (HTML with content pre-rendered)

### 2. Client Components ('use client')

Used for:
- Forms with client-side validation
- Interactive features (drag-drop, modals)
- Real-time updates

```typescript
// app/auth/login/page.tsx
'use client'
const supabase = createClient() // browser client
await supabase.auth.signInWithPassword(...)
```

**Advantages:**
- Instant form feedback
- Interactive UI without page reloads
- Client-side state management (useState)

### 3. Auth Context (Global State)

```typescript
// context/AuthContext.tsx
export const useAuth() {
  return {
    user,        // Supabase Auth user
    profile,     // Role, name, phone from profiles table
    dashboardPath, // computed: /dashboard/[role]
    signOut,     // logout function
    loading,     // initial session loading state
  }
}
```

Used in layouts and components to check auth state without re-fetching.

---

## Database Schema & Relationships

### Entity-Relationship Diagram

```
auth.users (Supabase Auth)
   │
   ├── id (PK)
   └── email
        │
        ▼
profiles (PK: id)
   │
   ├── role: 'employee' | 'employer' | 'admin'
   ├── full_name
   └── phone
        │
        ├───────────────────────┬─────────────────────┐
        │                       │                     │
        ▼                       ▼                     ▼
   employee_profiles       employer_profiles        jobs (FK: employer_id)
   ├── city                ├── company_name         ├── title
   ├── job_categories      ├── company_type         ├── category
   ├── years_experience    ├── locations            ├── location
   ├── pay_preference      └── description          ├── pay_amount
   ├── availability                                  ├── pay_type
   └── languages                                     ├── openings
                                                     ├── description
                                                     └── status
                                                          │
                                                          ▼
                                                    applications
                                                    ├── job_id (FK)
                                                    ├── employee_id (FK)
                                                    ├── status
                                                    └── note
                                                    
saved_jobs
├── employee_id (FK)
└── job_id (FK)
```

### Normalization

- **1NF**: Atomic values (no nested objects in columns)
- **2NF**: All non-key attributes depend on entire PK
- **3NF**: No transitive dependencies
- **Denormalization**: Minimal (only counts on read-heavy queries)

---

## Kanban Board Architecture

### Real-Time Status Updates

```
User drags card
   ↓
onDragEnd() fires
   ↓
Extract: application_id + new_status
   ↓
optimisticUpdate (client state)
   ↓
ASYNC: Supabase UPDATE applications
   ↓
RLS policy checks: employer owns this job
   ↓
DB updates status
   ↓
Response confirms
```

### State Management

Uses **local state** + **async Supabase**:

```typescript
const [applications, setApplications] = useState([])

// Optimistic update
setApplications(apps => 
  apps.map(a => a.id === draggedId ? { ...a, status: newStatus } : a)
)

// Fire async update
await supabase.from('applications').update({ status: newStatus })
```

Benefits:
- No flickering UI
- Works offline initially
- Consistent on failure

---

## Component Hierarchy

```
RootLayout (with AuthProvider)
├── Navbar (future)
├── BottomNav (mobile, future)
└── {page}
    ├── SignUp / Login (client components with forms)
    ├── JobBrowser (SSR with filters)
    ├── EmployeeDashboard (SSR with Server Components for data)
    │   ├── ApplicationTable (server-rendered)
    │   └── SavedJobsList (server-rendered)
    ├── EmployerDashboard (SSR)
    │   ├── JobForm (client component)
    │   └── KanbanBoard (client component)
    │       ├── KanbanColumn (client, @dnd-kit)
    │       └── KanbanCard (client, draggable)
    └── AdminDashboard (SSR, admin-only)
        ├── MetricCards (server-rendered counts)
        ├── EmployeeTable (server-rendered)
        └── AnalyticsChart (future: Recharts)
```

---

## API Design

### Server-Side Data Fetching

All data fetching uses **server.ts client** (never browser client for sensitive queries):

```typescript
// lib/supabase/server.ts
export async function createClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { cookies: { ... } } // handles auth cookies
  )
}
```

### Query Patterns

#### 1. Fetch Jobs with Employer Info
```typescript
const { data } = await supabase
  .from('jobs')
  .select('*, employer_profiles(company_name)')
  .eq('status', 'active')
```

#### 2. Fetch Applications for Employer
```typescript
const { data } = await supabase
  .from('applications')
  .select(`
    *,
    profiles(full_name, phone),
    employee_profiles(city, years_experience),
    jobs(title)
  `)
  .in('job_id', employerJobIds)
```

#### 3. Admin: Get All Data
```typescript
const { data: employees } = await supabase
  .from('profiles')
  .select('*, employee_profiles(*)')
  .eq('role', 'employee')
  // RLS allows admin to see all
```

---

## Error Handling

### Client-Side Errors

```typescript
const { error } = await supabase.auth.signUp(...)
if (error) {
  setError(error.message)  // Show in UI
  console.error(error)     // Log for debugging
}
```

### Server-Side Errors

```typescript
try {
  const { data, error } = await supabase.from(...).select(...)
  if (error) throw error
} catch (error) {
  console.error('DB Error:', error)
  return <ErrorBoundary />
}
```

### RLS Policy Violations

If user tries to access data outside their role/ownership:
- Supabase returns 0 rows or 401 Unauthorized
- Middleware catches and redirects to /auth/login
- No sensitive data leakage

---

## Performance Optimization

### Server-Side Rendering (SSR)

- Pages like `/jobs` and `/dashboard/employee` are SSR
- Data fetched on server, HTML pre-rendered
- Client receives ready-to-display HTML
- Reduces JS bundle and improves Core Web Vitals

### Code Splitting

- 'use client' components are code-split automatically
- Large modals load on-demand
- Reduces initial bundle ~30%

### Database Indexes

```sql
CREATE INDEX idx_jobs_employer_id ON jobs(employer_id);
CREATE INDEX idx_applications_employee_id ON applications(employee_id);
CREATE INDEX idx_saved_jobs_employee_id ON saved_jobs(employee_id);
```

### Query Optimization

- Select only needed columns (not `SELECT *`)
- Use `.single()` for guaranteed 1-row results
- Eager load related tables in `.select()` to avoid N+1

---

## Security Measures

### 1. Authentication
- Supabase Auth: Email/password + JWT tokens
- Secure HttpOnly cookies (no JS access)
- Token refresh on every middleware execution

### 2. Authorization
- Middleware enforces role routes
- Supabase RLS policies enforce data access
- Users can only see/modify their own data

### 3. SQL Injection Prevention
- Never use string concatenation for SQL
- Use Supabase client library (parameterized queries)
- Example ✓: `.eq('id', user.id)`
- Example ✗: `.where('id = ' + user.id)`

### 4. XSS Prevention
- React escapes all text by default
- User input in `<textarea>` auto-escaped
- No `dangerouslySetInnerHTML` used

### 5. CSRF Protection
- Next.js built-in CSRF protection
- Cookies SameSite=Lax by default

### 6. Sensitive Data
- Phone numbers only shown to authorized parties:
  - Employer can see applicant phone
  - Employee can see job poster (via employer profile)
  - Admin can see all
- RLS policies enforce this

---

## Deployment Architecture

### Local Development
```
User → http://localhost:3000 → Next.js Dev Server
                                    ↓
                            Supabase (staging or prod)
```

### Production (Vercel)
```
User → CDN (Edge Location) → Vercel Edge Functions
                                     ↓
                             Next.js App (Serverless)
                                     ↓
                             Supabase PostgreSQL
```

**Why Vercel:**
- Automatic deployments on git push
- Edge functions run code near users
- Automatic HTTPS, domain, CI/CD
- Scales to zero (no idle costs)

---

## Monitoring & Logging

### Development
- Browser console for client errors
- Terminal logs for server-side errors
- Network tab for API calls
- Chrome DevTools for performance

### Production
- Vercel Monitoring: Automatic error tracking
- Supabase Logs: Query performance, RLS denials
- Sentry (future): Centralized error tracking

---

## Scaling Considerations

### Current MVP
- Supports ~100-1000 concurrent users
- No caching layer
- Single database region

### For Scale (Future)
1. Add **Redis** for session/cache
2. Add **CDN** for static assets
3. Add **database read replicas** for read-heavy queries
4. Implement **API rate limiting**
5. Add **background jobs** for email notifications
6. Implement **search indexing** (Algolia or Meilisearch)

---

## Development Workflow

### Adding a New Feature

1. **Create Branch**
   ```bash
   git checkout -b feature/kanban-export
   ```

2. **Implement Component**
   - Create file: `app/dashboard/employer/KanbanExport.tsx`
   - Write server/client component code
   - Add types if needed

3. **Add Database Migration** (if needed)
   - Update `.sql` migration file
   - Run in Supabase SQL editor

4. **Test Locally**
   ```bash
   npm run dev
   # Test at http://localhost:3000
   ```

5. **Commit & Push**
   ```bash
   git commit -m "feat: add kanban export to CSV"
   git push origin feature/kanban-export
   ```

6. **Create Pull Request**
   - GitHub PR review
   - Merge to main
   - Vercel auto-deploys to production

---

## File Naming Conventions

- **Pages**: `page.tsx` (Next.js convention)
- **Layouts**: `layout.tsx`
- **Components**: `PascalCase.tsx`
- **Utilities**: `camelCase.ts`
- **Types**: `types.ts` or inline
- **Constants**: `UPPER_SNAKE_CASE`

---

## Troubleshooting Guide

| Error | Cause | Solution |
|-------|-------|----------|
| 401 Unauthorized | Auth token expired | Middleware refreshes token; clear cookies |
| 403 Forbidden | RLS policy violation | Check user role and table permissions |
| No data returned | Wrong filter | Verify `.eq()` conditions and RLS policies |
| Drag-drop not working | Missing @dnd-kit | Run `npm install @dnd-kit/core @dnd-kit/sortable` |
| Env vars undefined | `.env.local` missing | Create file with `NEXT_PUBLIC_SUPABASE_*` vars |

---

## Glossary

- **SSR**: Server-Side Rendering (HTML generated on server)
- **CSR**: Client-Side Rendering (HTML generated in browser)
- **RLS**: Row-Level Security (database-level access control)
- **JWT**: JSON Web Token (stateless auth token)
- **Middleware**: Function that runs on every request (auth, logging)
- **Drag-Drop**: Interactive mouse/touch feature (Kanban)
- **Optimistic Update**: Update UI before confirming with server

---

**Navaudyog — Architecture designed for MVP speed and production readiness. 🇮🇳**
