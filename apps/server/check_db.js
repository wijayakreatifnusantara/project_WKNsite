const { createClient } = require('@supabase/supabase-js');

require('dotenv').config();
const url = process.env.SUPABASE_URL || 'https://vlpaszzbebgrfppklqml.supabase.co';
const key = process.env.SUPABASE_KEY;
if (!key) {
  console.error("ERROR: SUPABASE_KEY environment variable is not defined.");
}
const supabase = createClient(url, key || '');

async function check() {
  const { data, error } = await supabase.from('profiles').select('username, password, role');
  if (error) {
    console.error('ERROR:', error);
  } else {
    console.log('PROFILES:', JSON.stringify(data, null, 2));
  }
}

check();
