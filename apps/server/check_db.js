const { createClient } = require('@supabase/supabase-js');

const url = 'https://vlpaszzbebgrfppklqml.supabase.co';
const key = 'sb_secret_vnet6vBBxmFN9YvAE287RA_UORmiJ0i';
const supabase = createClient(url, key);

async function check() {
  const { data, error } = await supabase.from('profiles').select('username, password, role');
  if (error) {
    console.error('ERROR:', error);
  } else {
    console.log('PROFILES:', JSON.stringify(data, null, 2));
  }
}

check();
