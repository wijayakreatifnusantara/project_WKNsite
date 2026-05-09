import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vlpaszzbebgrfppklqml.supabase.co';
const supabaseAnonKey = 'sb_publishable_hNO1hqX8FN2ejpyZe1oYJA_qvbkgEUy';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function scanTables() {
  console.log('--- 🛡️ GLOBAL TABLE SCAN START ---');
  
  // List of tables to check
  const tables = ['profiles', 'users', 'user_profiles', 'accounts', 'employees', 'karyawan'];
  
  for (const table of tables) {
    const { data, error, count } = await supabase.from(table).select('*', { count: 'exact' }).limit(1);
    if (!error) {
      console.log(`[FOUND] Table "${table}": ${count || 0} records found.`);
      if (data && data.length > 0) {
        console.log(`Columns in ${table}:`, Object.keys(data[0]));
      }
    }
  }

  console.log('--- 🛡️ GLOBAL TABLE SCAN END ---');
}

scanTables();
