/*
 Run migrations against Supabase using the service_role key.

 Usage:
   Set env vars in your shell or create a .env file (NOT committed):
     SUPABASE_URL=https://your-project.supabase.co
     SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

   Then run:
     node scripts/run-migrations.js

 This script reads SQL files in `supabase/migrations` in lexicographic order
 and executes each via the Supabase SQL query endpoint using the
 service_role key (admin privilege). Use with care.
*/

const fs = require('fs')
const path = require('path')
const fetch = require('node-fetch')

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars')
  process.exit(1)
}

const migrationsDir = path.join(__dirname, '..', 'supabase', 'migrations')

async function runSql(sql) {
  const url = `${SUPABASE_URL}/rest/v1/rpc/pg_execute_sql`
  // If pg_execute_sql RPC is not available, fall back to /rpc or SQL editor endpoint
  // Many projects expose `sql` via the SQL Editor only; this approach uses
  // the PostgREST RPC endpoint which may not exist. If it fails, we call
  // the SQL editor REST endpoint via /sql.

  // Try SQL editor endpoint
  const sqlEndpoint = `${SUPABASE_URL}/sql`
  const res = await fetch(sqlEndpoint, {
    method: 'POST',
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/sql',
    },
    body: sql,
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`SQL execution failed: ${res.status} ${res.statusText} ${text}`)
  }

  return res.text()
}

async function main() {
  const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort()
  for (const file of files) {
    const p = path.join(migrationsDir, file)
    console.log('Running', file)
    const sql = fs.readFileSync(p, 'utf8')
    try {
      const out = await runSql(sql)
      console.log('OK:', file)
    } catch (err) {
      console.error('Failed:', file)
      console.error(err.message)
      process.exit(1)
    }
  }
  console.log('All migrations executed')
}

main()
