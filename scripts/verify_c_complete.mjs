import { createClient } from '@supabase/supabase-js';

const PROJECT_URL = 'https://aoiagnnkhaswpmhbobhd.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFvaWFnbm5raGFzd3BtaGJvYmhkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY3ODU0MTUsImV4cCI6MjA4MjM2MTQxNX0.ZYGTcqoIp8SPMCMO_6VQa9pmj_dqoHv6qrsK8DXD3ls';
const TARGET_EMAIL = 'genspark007@gmail.com';

const supabase = createClient(PROJECT_URL, ANON_KEY);

async function verify() {
    console.log(`Verifying progress for ${TARGET_EMAIL}...`);

    // 1. Get User Data
    const { data: user, error: userError } = await supabase
        .from('users')
        .select('id, completed_lesson_ids')
        .eq('email', TARGET_EMAIL)
        .single();

    if (userError || !user) {
        console.error('Error finding user:', userError?.message || 'User not found');
        return;
    }

    console.log(`User ID: ${user.id}`);
    console.log(`Completed Lesson Count (in users table): ${user.completed_lesson_ids?.length || 0}`);

    // 2. Get Progress Data
    const { data: progress, error: progressError } = await supabase
        .from('user_progress')
        .select('lesson_id, status')
        .eq('user_id', user.id)
        .eq('status', 'completed');

    if (progressError) {
        console.error('Error fetching progress:', progressError.message);
    } else {
        console.log(`Completed Lesson Count (in user_progress table): ${progress.length}`);

        const cLessons = progress.filter(p => p.lesson_id.startsWith('c'));
        console.log(`C Lessons completed: ${cLessons.length}`);
    }

    if (user.completed_lesson_ids?.length >= 41 && progress.length >= 41) {
        console.log('VERIFICATION SUCCESS: All lessons marked completed.');
    } else {
        console.log('VERIFICATION FAILED: Lesson count mismatch.');
    }
}

verify().catch(err => {
    console.error('Fatal error:', err);
});
