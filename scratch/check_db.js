const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://vlpaszzbebgrfppklqml.supabase.co";
const supabaseAnonKey = "sb_secret_vnet6vBBxmFN9YvAE287RA_UORmiJ0i"; // Using the secret from server util if it's actually the key

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
  const { data, error } = await supabase.from('employees').select('id, name, department_id, departments(name)').not('department_id', 'is', null);
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Employees with departments:', data);
  }
}

check();
