# Navaudyog Deployment & Verification Checklist

## Pre-Deployment Verification

### Code Quality
- [ ] No console.log() statements left in production code
- [ ] TypeScript compilation: `npm run build` succeeds with 0 errors
- [ ] No unused imports or variables
- [ ] All routes protected with proper auth checks
- [ ] Error handling on all Supabase queries
- [ ] Mobile-responsive design tested at 375px, 768px, 1280px

### Authentication & Security
- [ ] Middleware.ts correctly checks roles
- [ ] RLS policies enabled on all tables
- [ ] env variables not committed to git
- [ ] Supabase API keys use anon key only (service key secure)
- [ ] Login/register flows tested end-to-end
- [ ] Token refresh mechanism tested

### Database
- [ ] All SQL migrations run successfully
- [ ] Foreign key relationships verified
- [ ] Indexes created on frequently queried columns
- [ ] RLS policies tested (user can't access others' data)
- [ ] Counts and joins query correctly

### Features Tested

#### 1. Authentication
- [ ] Register as Job Seeker
- [ ] Register as Employer
- [ ] Register as Admin (manual insert)
- [ ] Login with correct credentials
- [ ] Login with wrong credentials (error shown)
- [ ] Logout clears session
- [ ] Can't access /dashboard without login

#### 2. Job Seeker Features
- [ ] Complete employee profile setup
- [ ] Browse all active jobs
- [ ] Filter jobs by category
- [ ] View job details
- [ ] Apply to job with note
- [ ] View application status
- [ ] See saved jobs
- [ ] Can't see other users' applications

#### 3. Employer Features
- [ ] Complete employer profile setup
- [ ] Post new job (draft)
- [ ] Publish job (status → active)
- [ ] View own job listings
- [ ] See applicant count
- [ ] View Kanban board
- [ ] Drag applicants between columns
- [ ] Contact applicant via Call/WhatsApp
- [ ] Can't see other employers' jobs

#### 4. Admin Features
- [ ] View metric cards (correct counts)
- [ ] Access employee data table
- [ ] Access employer data table
- [ ] Access job moderation queue
- [ ] Can see ALL data

#### 5. UI/UX
- [ ] Landing page loads
- [ ] Navigation clear and intuitive
- [ ] Forms have proper validation
- [ ] Error messages shown on failures
- [ ] Success toasts appear
- [ ] Buttons disabled during loading
- [ ] No layout shift during loading
- [ ] Responsive on mobile

### Performance
- [ ] Lighthouse score > 80 (Performance)
- [ ] First Contentful Paint < 2s
- [ ] Largest Contentful Paint < 2.5s
- [ ] Cumulative Layout Shift < 0.1
- [ ] No N+1 query problems

---

## Deployment Steps (Vercel)

### Step 1: Initialize Git Repository
```bash
cd navaudyog
git init
git add .
git commit -m "Initial Navaudyog commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/navaudyog.git
git push -u origin main
```

### Step 2: Create Supabase Project

1. Go to https://supabase.com/dashboard
2. Create new project
   - Name: "navaudyog"
   - Database password: Generate strong password
   - Region: Choose closest to your users
3. Wait for project to initialize (2-3 minutes)

### Step 3: Run Database Migration

1. In Supabase dashboard, go to **SQL Editor**
2. Create new query
3. Copy entire contents of `supabase-migration.sql`
4. Click **Execute**
5. Verify tables created: Check **Table Editor** → All 6 tables exist

### Step 4: Get Supabase Credentials

1. Go to **Settings → API**
2. Copy:
   - `Project URL` (looks like: `https://xxxxx.supabase.co`)
   - `Anon key` (public key, safe for client)
3. Save these for next step

### Step 5: Connect Vercel

1. Go to https://vercel.com/new
2. Select **GitHub** (or GitLab/Bitbucket)
3. Authorize Vercel to access your GitHub account
4. Find & click **navaudyog** repository
5. Click **Import**

### Step 6: Configure Environment Variables

1. In Vercel project settings, go to **Environment Variables**
2. Add two variables:
   - **Name**: `NEXT_PUBLIC_SUPABASE_URL`
   - **Value**: Your Supabase Project URL
   - Click **Add**
   
3. Add another:
   - **Name**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **Value**: Your Supabase Anon Key
   - Click **Add**

4. Make sure **Production** environment is selected

### Step 7: Deploy

1. Click **Deploy** button
2. Wait for build to complete (3-5 minutes)
3. You'll see green checkmark when done
4. Copy the deployment URL
5. Click link to visit your live site

### Step 8: Test on Production

```
https://your-deployment.vercel.app
```

Repeat all feature tests from checklist above on production URL.

---

## Post-Deployment

### Monitor for Issues

1. **Check Vercel Logs**
   - Go to Vercel project → **Deployments**
   - Click latest deployment → **Logs**
   - Look for errors

2. **Check Supabase Logs**
   - Go to Supabase project → **Database → Logs**
   - Monitor for RLS policy violations
   - Check query performance

3. **Set Up Error Monitoring** (Optional)
   - Install Sentry: `npm install @sentry/nextjs`
   - Configure in `next.config.ts`
   - Monitor errors in production

### Custom Domain (Optional)

1. In Vercel project → **Domains**
2. Add your custom domain (e.g., `navaudyog.com`)
3. Follow DNS setup instructions for your registrar
4. Wait for DNS propagation (5-30 minutes)

### Continuous Deployment

From now on:
1. Make changes locally
2. Commit: `git commit -m "feat: ..."`
3. Push: `git push origin main`
4. Vercel automatically builds & deploys

---

## Scaling for Production

### Database Backups

In Supabase dashboard:
1. Go to **Settings → Backups**
2. Enable **Automated backups** (daily)
3. Keep at least 7-day retention

### Database Connection Pooling

For high traffic (future):
1. Supabase → **Database → Connection pooling**
2. Enable with "Session" mode
3. This prevents connection exhaustion

### Rate Limiting (Future)

Add to middleware.ts if needed:
```typescript
// Limit API calls per IP
if (requestsFromIP > 100) {
  return new Response('Too Many Requests', { status: 429 })
}
```

### Content Delivery Network (CDN)

Vercel automatically uses:
- Global CDN for static assets
- Edge functions for API routes
- No additional setup needed

---

## Rollback Procedure

If deployment has critical issues:

### Option 1: Revert on Vercel
1. Go to Vercel project → **Deployments**
2. Find previous working deployment
3. Click **Redeploy**
4. Will instantly roll back to that version

### Option 2: Revert on GitHub
```bash
git revert HEAD  # Creates new commit that undoes last change
git push origin main  # Vercel auto-deploys reverted code
```

---

## Monitoring & Maintenance

### Daily
- [ ] Check Vercel deployment status (green icon)
- [ ] Monitor Supabase logs for errors
- [ ] Spot-check 1-2 user flows

### Weekly
- [ ] Review database query performance
- [ ] Check uptime monitoring
- [ ] Test on mobile device
- [ ] Review auth failures (potential attacks)

### Monthly
- [ ] Backup database manually
- [ ] Review storage usage
- [ ] Update dependencies: `npm update`
- [ ] Analyze user metrics

### Quarterly
- [ ] Security audit of RLS policies
- [ ] Database optimization review
- [ ] Plan next features based on usage

---

## Troubleshooting Production Issues

### Issue: "Supabase connection refused"
**Cause**: Env variables not set in Vercel
**Fix**:
1. Vercel → Settings → Environment Variables
2. Verify both `NEXT_PUBLIC_SUPABASE_*` vars exist
3. Redeploy project

### Issue: "RLS policy violation"
**Cause**: User accessing data they don't own
**Fix**:
1. Check Supabase logs
2. Verify RLS policy is correct
3. Check middleware role validation
4. May need to rerun migration

### Issue: "Jobs not appearing"
**Cause**: Jobs stuck in "draft" status
**Fix**:
1. Check job status in Supabase → Table Editor → jobs
2. If needed, manually update: `UPDATE jobs SET status='active'`
3. Clear browser cache and refresh

### Issue: "Slow page load"
**Cause**: Inefficient database queries
**Fix**:
1. Check Supabase query performance
2. Verify indexes exist on FK columns
3. Reduce `.select('*')` to only needed columns
4. Consider caching frequent queries

### Issue: "Drag-drop not working"
**Cause**: JS error or missing library
**Fix**:
1. Check browser console for errors
2. Verify `@dnd-kit` packages installed
3. Clear browser cache
4. Try in different browser

---

## Analytics Setup (Optional)

Add Google Analytics:
```bash
npm install @next/bundle-analyzer
```

In `next.config.ts`:
```typescript
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

export default withBundleAnalyzer({
  // config
})
```

Then: `ANALYZE=true npm run build`

---

## Security Checklist (Post-Launch)

- [ ] SSL certificate active (Vercel handles this)
- [ ] CORS configured properly
- [ ] Rate limiting implemented (prevent brute force)
- [ ] No hardcoded secrets in code
- [ ] Regular dependency updates: `npm audit`
- [ ] Passwords use bcrypt (Supabase Auth handles this)
- [ ] API keys rotated periodically
- [ ] Database backups tested (can restore)
- [ ] Access logs monitored
- [ ] User data protected (GDPR compliance)

---

## Support & Escalation

### For Supabase Issues
- Check docs: https://supabase.com/docs
- GitHub Issues: https://github.com/supabase/supabase/issues
- Support: https://supabase.com/support

### For Vercel Issues
- Check docs: https://vercel.com/docs
- GitHub Issues: https://github.com/vercel/next.js/issues
- Support: https://vercel.com/support

### For Application Issues
- Review SETUP.md and ARCHITECTURE.md
- Check GitHub Issues in your repo
- Create new GitHub Issue with [BUG] tag

---

## Performance Optimization Commands

```bash
# Analyze bundle size
npm run build
npm run build -- --profile

# Check for unused dependencies
npm install -g depcheck
depcheck

# Security audit
npm audit
npm audit fix --force

# Type checking
npx tsc --noEmit

# Linting
npm run lint
```

---

## Useful Vercel CLI Commands

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy from command line
vercel deploy --prod

# View logs
vercel logs

# Check status
vercel status
```

---

## Final Verification Checklist

Before marking as "Production Ready":

- [ ] All features tested on production URL
- [ ] No browser console errors
- [ ] Mobile responsive verified
- [ ] Load time acceptable (< 3s)
- [ ] Database backups enabled
- [ ] Error monitoring configured
- [ ] Team trained on deployment process
- [ ] Runbook documented
- [ ] On-call rotation established
- [ ] Client sign-off obtained

---

## Success Criteria

Launch is successful when:

✅ **Users can sign up, complete profile, post/apply to jobs**
✅ **Employers can manage applicants via Kanban board**
✅ **Admin can view all data without errors**
✅ **Site loads in < 3s on 4G connection**
✅ **No critical bugs blocking core workflows**
✅ **99.9% uptime achieved**

---

## Post-Launch Communication

1. **Email users**: "Navaudyog is now live!"
2. **Share link**: Production URL
3. **Social media**: Announce launch
4. **Monitor feedback**: Respond to issues quickly
5. **Plan next features**: Based on usage data

---

**Navaudyog is now ready for production deployment! 🚀**

**Made in India 🇮🇳 | New Job, New Start.**
