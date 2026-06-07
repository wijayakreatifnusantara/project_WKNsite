const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'E:/project_WKNsite/apps/server/.env' });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

async function main() {
  const { data, error } = await supabase.from('leave_requests').select('*').limit(1);
  if (error) console.error(error);
  else if (data && data.length > 0) console.log(Object.keys(data[0]));
  else console.log("No data");
}
main();
