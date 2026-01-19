/**
 * Delete all users from Supabase database
 * Usage: npx ts-node scripts/deleteAllUsers.ts
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://aoiagnnkhaswpmhbobhd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFvaWFnbm5raGFzd3BtaGJvYmhkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY3ODU0MTUsImV4cCI6MjA4MjM2MTQxNX0.ZYGTcqoIp8SPMCMO_6VQa9pmj_dqoHv6qrsK8DXD3ls';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function deleteAllUsers() {
  try {
    console.log('🗑️  Starting to delete all users...');

    // Get all users
    const { data: users, error: fetchError } = await supabase
      .from('users')
      .select('id');

    if (fetchError) {
      console.error('❌ Error fetching users:', fetchError);
      return;
    }

    if (!users || users.length === 0) {
      console.log('✅ No users found to delete');
      return;
    }

    console.log(`📊 Found ${users.length} users to delete`);

    // Delete all users
    const { error: deleteError } = await supabase
      .from('users')
      .delete()
      .neq('id', ''); // Delete all rows

    if (deleteError) {
      console.error('❌ Error deleting users:', deleteError);
      return;
    }

    console.log(`✅ Successfully deleted ${users.length} users!`);

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

deleteAllUsers();
