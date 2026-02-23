import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const PROJECT_URL = 'https://aoiagnnkhaswpmhbobhd.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFvaWFnbm5raGFzd3BtaGJvYmhkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY3ODU0MTUsImV4cCI6MjA4MjM2MTQxNX0.ZYGTcqoIp8SPMCMO_6VQa9pmj_dqoHv6qrsK8DXD3ls';
const TARGET_EMAIL = 'genspark007@gmail.com';

const supabase = createClient(PROJECT_URL, ANON_KEY);

async function run() {
    console.log(`Starting process for ${TARGET_EMAIL}...`);

    // 1. Get User ID
    const { data: user, error: userError } = await supabase
        .from('users')
        .select('id, completed_lesson_ids, unlocked_lesson_ids')
        .eq('email', TARGET_EMAIL)
        .single();

    if (userError || !user) {
        console.error('Error finding user:', userError?.message || 'User not found');
        return;
    }
    console.log(`Found user: ${user.id}`);

    // 2. Extract Lesson IDs from c.json
    const cJsonPath = 'c:/Users/DELL/OneDrive/Desktop/gens/data/curriculum/c.json';
    const cData = JSON.parse(fs.readFileSync(cJsonPath, 'utf8'));
    const allCLessonIds = [];
    cData.forEach(level => {
        if (level.lessons) {
            level.lessons.forEach(lesson => {
                allCLessonIds.push(lesson.id);
            });
        }
    });

    console.log(`Extracted ${allCLessonIds.length} C lesson IDs.`);

    // 3. Update Profile (users table)
    const newCompleted = [...new Set([...(user.completed_lesson_ids || []), ...allCLessonIds])];
    const newUnlocked = [...new Set([...(user.unlocked_lesson_ids || []), ...allCLessonIds, 'c1'])];

    const { error: updateError } = await supabase
        .from('users')
        .update({
            completed_lesson_ids: newCompleted,
            unlocked_lesson_ids: newUnlocked
        })
        .eq('id', user.id);

    if (updateError) {
        console.error('Error updating user profile:', updateError.message);
    } else {
        console.log('Successfully updated user profile arrays.');
    }

    // 4. Bulk Upsert Progress (user_progress table)
    const progressData = allCLessonIds.map(lessonId => ({
        user_id: user.id,
        lesson_id: lessonId,
        status: 'completed',
        completed_at: new Date().toISOString()
    }));

    const { error: progressError } = await supabase
        .from('user_progress')
        .upsert(progressData, { onConflict: 'user_id, lesson_id' });

    if (progressError) {
        console.error('Error updating user_progress:', progressError.message);
    } else {
        console.log('Successfully upserted all lessons to user_progress.');
    }

    console.log('Process completed successfully!');
}

run().catch(err => {
    console.error('Fatal error:', err);
});
