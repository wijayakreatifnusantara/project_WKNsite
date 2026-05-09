const { createClient } = require('@supabase/supabase-js');

const url = 'https://vlpaszzbebgrfppklqml.supabase.co';
const key = 'sb_secret_vnet6vBBxmFN9YvAE287RA_UORmiJ0i';
const supabase = createClient(url, key);

async function checkSchema() {
  const { data, error } = await supabase.from('attendance').select('*').limit(1);
  if (error) {
    console.error('ERROR:', error);
  } else if (data && data.length > 0) {
    console.log('ATTENDANCE_KEYS:', Object.keys(data[0]));
    console.log('SAMPLE_RECORD:', JSON.stringify(data[0], null, 2));
  } else {
    console.log('NO_DATA_IN_ATTENDANCE');
  }
}

checkSchema();
