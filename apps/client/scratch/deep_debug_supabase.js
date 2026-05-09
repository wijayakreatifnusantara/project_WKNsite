import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vlpaszzbebgrfppklqml.supabase.co';
const supabaseAnonKey = 'sb_publishable_hNO1hqX8FN2ejpyZe1oYJA_qvbkgEUy';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function deepDiagnostic() {
  console.log('--- 🔍 DEEP DATABASE DIAGNOSTIC START ---');
  
  // 1. Check Profiles
  console.log('\n[1] Checking "profiles" table...');
  const { data: profiles, error: pError } = await supabase.from('profiles').select('*').limit(3);
  if (pError) console.error('Profiles Error:', pError.message);
  else {
    console.log('Profiles Sample:', profiles);
    console.log('Columns in profiles:', Object.keys(profiles[0] || {}));
  }

  // 2. Check Role Permissions
  console.log('\n[2] Checking "role_permissions" table...');
  const { data: perms, error: rError } = await supabase.from('role_permissions').select('*').limit(5);
  if (rError) console.error('Role Permissions Error:', rError.message);
  else {
    console.log('Role Permissions Sample:', perms);
    console.log('Columns in role_permissions:', Object.keys(perms[0] || {}));
  }

  // 3. Test Search Logic
  const testEmail = 'adianto@wijayakn.com';
  console.log(`\n[3] Testing search logic for: ${testEmail}`);
  const { data: searchResult } = await supabase
    .from('profiles')
    .select('*')
    .or(`username.ilike.${testEmail},email.ilike.${testEmail},full_name.ilike.%${testEmail.split('@')[0]}%`)
    .maybeSingle();
  
  if (searchResult) {
    console.log('SEARCH SUCCESS: Found profile!', searchResult);
  } else {
    console.log('SEARCH FAILED: Profile not found with current logic.');
  }

  console.log('\n--- 🔍 DEEP DATABASE DIAGNOSTIC END ---');
}

deepDiagnostic();
