import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vlpaszzbebgrfppklqml.supabase.co';
const supabaseAnonKey = 'sb_publishable_hNO1hqX8FN2ejpyZe1oYJA_qvbkgEUy';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkData() {
  console.log('--- DIAGNOSTIC START ---');
  const { data, error } = await supabase.from('employees').select('*').limit(1);
  
  if (error) {
    console.error('ERROR FETCHING:', error.message);
  } else if (data && data.length > 0) {
    console.log('SUCCESS: Data found!');
    console.log('COLUMNS:', Object.keys(data[0]));
    console.log('FIRST ROW SAMPLE:', data[0]);
  } else {
    console.log('EMPTY: Table "employees" exists but has 0 records.');
  }
  console.log('--- DIAGNOSTIC END ---');
}

checkData();
