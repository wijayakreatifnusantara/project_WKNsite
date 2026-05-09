const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://vlpaszzbebgrfppklqml.supabase.co";
const supabaseAnonKey = "sb_secret_vnet6vBBxmFN9YvAE287RA_UORmiJ0i"; // Using the secret from server util if it's actually the key

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
  const { data, error } = await supabase.from('employees').select('*').limit(1);
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Columns:', Object.keys(data[0] || {}));
    console.log('Sample data:', data[0]);
  }
}

check();
