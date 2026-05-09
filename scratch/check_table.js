const { createClient } = require('@supabase/supabase-js');

const url = 'https://vlpaszzbebgrfppklqml.supabase.co';
const key = 'sb_secret_vnet6vBBxmFN9YvAE287RA_UORmiJ0i';
const supabase = createClient(url, key);

async function check() {
  const { data, error } = await supabase.from('payroll_history').select('*').limit(1);
  if (error) {
    if (error.code === 'PGRST116') {
      console.log('TABLE_MISSING');
    } else {
      console.error('ERROR:', error);
    }
  } else {
    console.log('TABLE_EXISTS');
  }
}

check();
