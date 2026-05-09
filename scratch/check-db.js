const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkConnection() {
  console.log('Checking connection to:', supabaseUrl);
  
  // Check for profiles table
  const { error: profilesError } = await supabase.from('profiles').select('id').limit(1);
  if (profilesError) {
    console.error('Profiles table check failed:', profilesError.message);
  } else {
    console.log('Profiles table exists.');
  }

  // Check for jobs table
  const { error: jobsError } = await supabase.from('jobs').select('id').limit(1);
  if (jobsError) {
    console.error('Jobs table check failed:', jobsError.message);
  } else {
    console.log('Jobs table exists.');
  }

  // Check for specific user from the request
  const userId = 'cfc9ce01-bc62-47d3-9827-c816e2aa687e';
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (profileError) {
    console.error('Error fetching profile for user ' + userId + ':', profileError);
  } else {
    console.log('Profile found for user:', profile);
  }
}

checkConnection();
