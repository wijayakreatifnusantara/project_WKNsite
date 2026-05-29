import { createClient } from '@supabase/supabase-js';
import CryptoJS from 'crypto-js';

const supabaseUrl = 'https://vlpaszzbebgrfppklqml.supabase.co';
const supabaseKey = 'sb_publishable_hNO1hqX8FN2ejpyZe1oYJA_qvbkgEUy';
const supabase = createClient(supabaseUrl, supabaseKey);

async function migratePasswords() {
  console.log('Fetching all employees...');
  const { data: employees, error: fetchError } = await supabase
    .from('employees')
    .select('id, mobile_password');

  if (fetchError) {
    console.error('Error fetching employees:', fetchError);
    return;
  }

  console.log(`Found ${employees.length} employees. Migrating passwords...`);
  
  let successCount = 0;
  let failCount = 0;

  for (const emp of employees) {
    if (!emp.mobile_password) continue;
    
    // Check if it's already a hash (SHA256 hashes are 64 characters hex)
    const isHex = /^[0-9a-fA-F]{64}$/.test(emp.mobile_password);
    if (isHex) {
      console.log(`Employee ${emp.id} already hashed. Skipping.`);
      continue;
    }

    const hashedPass = CryptoJS.SHA256(emp.mobile_password).toString();
    const { error: updateError } = await supabase
      .from('employees')
      .update({ mobile_password: hashedPass })
      .eq('id', emp.id);

    if (updateError) {
      console.error(`Failed to update ${emp.id}:`, updateError.message);
      failCount++;
    } else {
      console.log(`Successfully updated ${emp.id}`);
      successCount++;
    }
  }

  console.log('Migration finished!');
  console.log(`Successfully migrated: ${successCount}`);
  console.log(`Failed: ${failCount}`);
}

migratePasswords();
