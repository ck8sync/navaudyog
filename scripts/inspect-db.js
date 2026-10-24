// scripts/inspect-db.js
// Utility script to inspect Supabase database entries from the terminal.
// Usage:
//   node scripts/inspect-db.js             (overview of all tables)
//   node scripts/inspect-db.js jobs        (detailed view of jobs)
//   node scripts/inspect-db.js applications (detailed view of applications)
//   node scripts/inspect-db.js employers   (detailed view of employer profiles)

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load .env.local manually if dotenv is not globally loaded
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  content.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let value = match[2] || '';
      value = value.trim().replace(/^['"]|['"]$/g, '');
      process.env[key] = value;
    }
  });
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function main() {
  const tableArg = process.argv[2]?.toLowerCase();
  const authEmail = process.argv[3];
  const authPassword = process.argv[4] || 'Password123!';

  let client = supabase;
  if (authEmail) {
    const userClient = createClient(SUPABASE_URL, SUPABASE_KEY);
    const { data: authData, error: authError } = await userClient.auth.signInWithPassword({
      email: authEmail,
      password: authPassword,
    });
    if (authError) {
      console.warn(`⚠️ Could not log in as ${authEmail}: ${authError.message}`);
    } else {
      console.log(`🔑 Authenticated as: ${authEmail} (ID: ${authData.user.id})`);
      client = userClient;
    }
  }

  console.log('\n================ NAVAUDYOG DATABASE INSPECTOR ================');
  console.log(`Supabase Project: ${SUPABASE_URL}\n`);

  if (!tableArg) {
    // Show high-level summary
    const { count: jobsCount } = await client.from('jobs').select('*', { count: 'exact', head: true });
    const { count: appsCount } = await client.from('applications').select('*', { count: 'exact', head: true });
    const { count: employersCount } = await client.from('employer_profiles').select('*', { count: 'exact', head: true });

    console.log('📊 TABLE OVERVIEW:');
    console.log(` - jobs:               ${jobsCount ?? 'N/A'} records`);
    console.log(` - applications:       ${appsCount ?? '0 (RLS protected - provide user email to view)'} records`);
    console.log(` - employer_profiles:  ${employersCount ?? 'N/A'} records`);

    console.log('\n📋 RECENT JOBS (Latest 5):');
    const { data: jobs } = await client.from('jobs').select('id, title, location, category, pay_amount, status, created_at').order('created_at', { ascending: false }).limit(5);
    console.table(jobs?.map(j => ({
      ID: j.id.slice(0, 8) + '...',
      Title: j.title,
      Location: j.location,
      Category: j.category,
      Pay: '₹' + j.pay_amount,
      Status: j.status,
      Posted: new Date(j.created_at).toLocaleDateString()
    })));

    console.log('\n📥 RECENT APPLICATIONS (Latest 5):');
    const { data: apps } = await client.from('applications').select('id, job_id, employee_id, status, note, created_at').order('created_at', { ascending: false }).limit(5);
    console.table(apps?.map(a => ({
      ID: a.id.slice(0, 8) + '...',
      JobID: a.job_id.slice(0, 8) + '...',
      EmployeeID: a.employee_id.slice(0, 8) + '...',
      Status: a.status,
      Note: (a.note || '').slice(0, 30) + '...',
      Applied: new Date(a.created_at).toLocaleDateString()
    })));

    console.log('\n💡 Tip: Run specific table queries using:');
    console.log('   node scripts/inspect-db.js jobs');
    console.log('   node scripts/inspect-db.js applications <email> <password>');
    console.log('   node scripts/inspect-db.js employers');
    return;
  }

  if (tableArg === 'jobs') {
    const { data, error } = await client.from('jobs').select('*').order('created_at', { ascending: false });
    if (error) return console.error('Error:', error.message);
    console.log(`\n📌 All Jobs (${data.length}):`);
    console.dir(data, { depth: null });
  } else if (tableArg === 'applications' || tableArg === 'apps') {
    const { data, error } = await client.from('applications').select('*').order('created_at', { ascending: false });
    if (error) return console.error('Error:', error.message);
    console.log(`\n📌 All Applications (${data.length}):`);
    console.dir(data, { depth: null });
  } else if (tableArg === 'employers') {
    const { data, error } = await client.from('employer_profiles').select('*');
    if (error) return console.error('Error:', error.message);
    console.log(`\n📌 All Employer Profiles (${data.length}):`);
    console.dir(data, { depth: null });
  } else {
    const { data, error } = await client.from(tableArg).select('*').limit(20);
    if (error) return console.error('Error:', error.message);
    console.log(`\n📌 Table '${tableArg}' (${data.length} records):`);
    console.dir(data, { depth: null });
  }
}

main().catch(console.error);
