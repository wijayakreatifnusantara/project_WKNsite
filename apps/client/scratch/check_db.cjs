const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://vlpaszzbebgrfppklqml.supabase.co';
const supabaseKey = 'sb_publishable_hNO1hqX8FN2ejpyZe1oYJA_qvbkgEUy';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkEmployees() {
  const { data, error } = await supabase.from('employees').select('id, employee_id, name').limit(1);
  if (error) {
    console.error("ERROR:", error);
  } else {
    console.log("DATA:", JSON.stringify(data, null, 2));
  }
}

checkEmployees();
