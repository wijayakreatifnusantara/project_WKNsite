const { createClient } = require('@supabase/supabase-client');

const supabase = createClient(
  "https://vlpaszzbebgrfppklqml.supabase.co",
  "sb_secret_vnet6vBBxmFN9YvAE287RA_UORmiJ0i"
);

async function checkData() {
  const { data: employees, count: eCount } = await supabase.from('employees').select('*', { count: 'exact' });
  const { data: attendance, count: aCount } = await supabase.from('attendance').select('*', { count: 'exact' });
  
  console.log('Employee count:', eCount);
  console.log('Attendance count:', aCount);
  
  if (attendance && attendance.length > 0) {
    console.log('Sample attendance:', attendance[0]);
  }
}

checkData();
