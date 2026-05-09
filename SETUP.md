# Navaudyog Setup Guide

## Quick Start (5 Minutes)

### Step 1: Get Supabase Credentials
1. Create a Supabase account at https://supabase.com
2. Create a new project
3. Go to Project Settings → API Keys
4. Copy `Project URL` and `Anon Key`

### Step 2: Configure Environment Variables
Edit `.env.local` in the project root:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### Step 3: Run Database Migration
1. In Supabase dashboard, go to SQL Editor
2. Create a new query
3. Copy entire contents of `supabase-migration.sql`
4. Execute the query

### Step 4: Start Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Complete User Flow Testing

### Test 1: Register as Job Seeker

**Steps:**
1. Go to `http://localhost:3000`
2. Click "Sign Up"
3. Select "I am a Job Seeker" tab
4. Fill in:
   - Full Name: "John Doe"
   - Email: "john@example.com"
   - Password: "password123"
   - Phone: "9876543210"
5. Click "Create Account"
6. Redirected to `/profile/employee`

**Profile Setup:**
1. Select City: "Mumbai"
2. Check Job Categories: "Construction & Labour", "Manufacturing & Factory"
3. Experience: "1-2 years"
4. Pay Preference: "Daily Wage"
5. Availability: "Immediately"
6. Languages: Check "Hindi", "English"
7. Click "Complete Profile"
8. Redirected to `/dashboard/employee`

**Dashboard:**
- Should see "No applications yet" initially
- Click "Browse Jobs" to go to `/jobs`

### Test 2: Register as Employer

**Steps:**
1. Go to `http://localhost:3000`
2. Click "Sign Up"
3. Select "I am an Employer" tab
4. Fill in:
   - Full Name: "Jane Smith"
   - Email: "jane@company.com"
   - Password: "password123"
   - Phone: "9123456789"
5. Click "Create Account"
6. Redirected to `/profile/employer`

**Profile Setup:**
1. Company Name: "BuildCo Construction"
2. Company Type: "Factory"
3. Locations: "Mumbai, Delhi"
4. Contact Phone: "9123456789"
5. About Company: "Leading construction company in India"
6. Click "Complete Profile"
7. Redirected to `/dashboard/employer`

**Post a Job:**
1. Click "Post New Job"
2. Fill form:
   - Job Title: "Mason Helper"
   - Category: "Construction & Labour"
   - Location: "Mumbai"
   - Openings: "5"
   - Pay Amount: "500"
   - Pay Type: "Daily Wage"
   - Description: "Help with brick laying and site work"
   - Status: "Publish Now"
3. Click "Post Job"
4. Job appears in your job listings

### Test 3: Browse & Apply to Jobs

**As Job Seeker:**
1. Log out (or use private browser)
2. Go to `/jobs` (or click "Browse Jobs" on homepage)
3. Job posted by employer should appear
4. Click "View Details"
5. Click "Apply Now"
6. Add optional note (max 200 chars)
7. Click "Submit"
8. Should see success toast

**View Application:**
1. Go to `/dashboard/employee`
2. Application should appear in "Application History"
3. Status: "applied" (blue badge)

### Test 4: Employer Kanban Board

**As Employer:**
1. Go to `/dashboard/employer/applicants`
2. See Kanban board with 5 columns
3. Application card in "Applied" column
4. Click "Call" or "WhatsApp" buttons to contact

**Drag Application:**
1. Drag application card from "Applied" to "Reviewing"
2. Application status updates in real-time
3. Verify in Supabase: applications table, status changed

### Test 5: Admin Dashboard

**Setup Admin User:**
1. In Supabase, go to Authentication → Users
2. Find an existing user
3. Go to SQL Editor, run:
```sql
UPDATE profiles SET role = 'admin' WHERE id = 'user-id-here';
```

**Access Admin:**
1. Log out and log in as admin
2. Should be redirected to `/dashboard/admin`
3. See metric cards with counts
4. Click "Employees" → see all employee data
5. Click "Employers" → see all employer data
6. Click "Jobs" → see job moderation queue

---

## Troubleshooting

### Issue: "Cannot find Supabase credentials"
- Check `.env.local` exists in project root
- Verify URLs and keys are correct
- Restart dev server: `npm run dev`

### Issue: RLS policy errors
- Ensure all SQL migrations ran successfully
- Check Supabase Auth is enabled
- Verify user is logged in

### Issue: Job postings not appearing
- Ensure job status is "active" (not "draft")
- Check employer_id matches logged-in user
- Clear browser cache and refresh

### Issue: Drag-and-drop not working
- Ensure @dnd-kit packages installed: `npm list @dnd-kit/core`
- Check browser console for JS errors
- Try in different browser

---

## Deployment to Vercel

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Initial Navaudyog commit"
git branch -M main
git remote add origin https://github.com/your-username/navaudyog.git
git push -u origin main
```

### Step 2: Connect to Vercel
1. Go to https://vercel.com/new
2. Connect GitHub account
3. Select `navaudyog` repository
4. Click "Import"

### Step 3: Add Environment Variables
1. In Vercel, go to Settings → Environment Variables
2. Add:
   - Key: `NEXT_PUBLIC_SUPABASE_URL`
   - Value: Your Supabase URL
   - Key: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Value: Your Supabase Anon Key
3. Click "Save"

### Step 4: Deploy
Click "Deploy" button. Your site will be live in ~1 minute!

---

## API Documentation

### Key Endpoints (Server Components)

#### GET /jobs
- Fetches all active jobs with employer info
- Parameters: None
- Response: Array of job objects

#### GET /jobs/[id]
- Fetches single job detail
- Parameters: `id` (job UUID)
- Response: Job object with employer_profiles

#### GET /dashboard/employee
- Employee application history and saved jobs
- Auth: Only accessible to role='employee'
- Response: Applications and saved jobs

#### GET /dashboard/employer/applicants
- Kanban board of applicants
- Auth: Only accessible to role='employer'
- Response: Applications grouped by status

---

## Database Structure

### profiles
```
id (uuid, PK) → auth.users
role (text) → 'employee' | 'employer' | 'admin'
full_name (text)
phone (text)
created_at (timestamptz)
```

### employee_profiles
```
id (uuid, PK) → profiles
city (text)
job_categories (text[])
years_experience (text)
pay_preference (text)
availability (text)
languages (text[])
```

### employer_profiles
```
id (uuid, PK) → profiles
company_name (text)
company_type (text)
locations (text[])
description (text)
contact_phone (text)
```

### jobs
```
id (uuid, PK)
employer_id (uuid, FK) → profiles
title (text)
category (text)
location (text)
pay_amount (integer)
pay_type (text)
openings (integer)
description (text)
status (text) → 'draft' | 'active' | 'closed'
created_at (timestamptz)
```

### applications
```
id (uuid, PK)
job_id (uuid, FK) → jobs
employee_id (uuid, FK) → profiles
status (text) → 'applied' | 'reviewing' | 'interview' | 'hired' | 'rejected'
note (text)
created_at (timestamptz)
UNIQUE(job_id, employee_id)
```

### saved_jobs
```
id (uuid, PK)
employee_id (uuid, FK) → profiles
job_id (uuid, FK) → jobs
created_at (timestamptz)
UNIQUE(employee_id, job_id)
```

---

## Brand Colors & Design

### Color Palette
- **Primary**: `#1A237E` (Navy Blue)
- **Accent**: `#FF6F00` (Amber)
- **Background**: `#F9FAFB` (Gray 50)
- **Text**: `#111827` (Gray 900)

### Typography
- **Logo**: "NAVAUDYOG" in bold navy
- **Tagline**: "New Job, New Start." in italic amber
- **Badge**: "Made in India 🇮🇳"

---

## Performance Tips

1. **Use Server Components** for data fetching (reduces JS bundle)
2. **Enable Supabase Caching** for frequently accessed data
3. **Add Database Indexes** on foreign keys and status columns
4. **Optimize Images** in public/ folder
5. **Use React.lazy()** for code splitting

---

## Security Checklist

- [ ] Supabase RLS policies enabled on all tables
- [ ] Auth middleware protecting all `/dashboard` routes
- [ ] Env variables never committed to git (use .gitignore)
- [ ] CORS configured in Supabase for deployed domain
- [ ] SQL injection prevented (using Supabase client library)
- [ ] XSS prevented (Next.js sanitization + React escaping)
- [ ] Sensitive data (phone, email) only visible to admin/owner

---

## FAQ

**Q: How do I reset my password?**
A: Not implemented in MVP. Use Supabase Auth UI or manually reset in dashboard.

**Q: Can I export applicant data?**
A: Not in MVP. Admin can manually copy from table.

**Q: How do I delete my account?**
A: Not implemented. Contact admin.

**Q: Can employers see other employers' applicants?**
A: No, RLS prevents cross-access. Each employer only sees their own.

**Q: What happens if a job gets too many applications?**
A: No limit in MVP. Consider adding pagination for production.

---

## Support & Issues

- GitHub Issues: Create issue with [BUG] or [FEATURE] prefix
- Documentation: See README.md
- Supabase Docs: https://supabase.com/docs
- Next.js Docs: https://nextjs.org/docs

---

**Navaudyog — New Job, New Start. 🇮🇳 Made in India**
