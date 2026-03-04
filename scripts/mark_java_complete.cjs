
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://ljejqqkkacqravcpruac.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxqZWpxcWtrYWNxcmF2Y3BydWFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIwMzkyODcsImV4cCI6MjA4NzYxNTI4N30.bK8kNlpBhNdi4TVzqSzeCCdjXrqO2Rb4KScM0e6_JOw';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const email = 'genspark007@gmail.com';
const javaJsonPath = path.join(__dirname, '../data/curriculum/java.json');

async function markJavaComplete() {
    try {
        console.log(`Searching for user: ${email}...`);
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('id, completed_lesson_ids')
            .eq('email', email)
            .single();

        if (userError || !user) {
            console.error('User not found:', userError);
            return;
        }

        console.log(`Found user ID: ${user.id}`);

        const javaData = JSON.parse(fs.readFileSync(javaJsonPath, 'utf8'));
        const javaLessonIds = [];
        javaData.forEach(module => {
            module.lessons.forEach(lesson => {
                javaLessonIds.push(lesson.id);
            });
        });

        console.log(`Found ${javaLessonIds.length} Java lessons.`);

        // Merge with existing completed lessons
        const currentCompleted = user.completed_lesson_ids || [];
        const updatedCompleted = [...new Set([...currentCompleted, ...javaLessonIds])];

        console.log(`Updating completed_lesson_ids for user ${user.id}...`);
        const { error: updateError } = await supabase
            .from('users')
            .update({ completed_lesson_ids: updatedCompleted })
            .eq('id', user.id);

        if (updateError) {
            console.error('Error updating users table:', updateError);
        } else {
            console.log('Successfully updated users table.');
        }

        // Now update user_progress table
        console.log('Updating user_progress table...');
        const progressUpserts = javaLessonIds.map(id => ({
            user_id: user.id,
            lesson_id: id,
            status: 'completed',
            completed_at: new Date().toISOString()
        }));

        const { error: progressError } = await supabase
            .from('user_progress')
            .upsert(progressUpserts, { onConflict: 'user_id, lesson_id' });

        if (progressError) {
            console.error('Error updating user_progress:', progressError);
        } else {
            console.log('Successfully updated user_progress.');
        }

        console.log('Java Mastery Complete!');
    } catch (err) {
        console.error('Unexpected error:', err);
    }
}

markJavaComplete();
