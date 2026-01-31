
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Fix for __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- CONFIGURATION ---
const TARGET_EMAIL = 'seenu@gmail.com';
const SUPABASE_URL = 'https://aoiagnnkhaswpmhbobhd.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFvaWFnbm5raGFzd3BtaGJvYmhkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY3ODU0MTUsImV4cCI6MjA4MjM2MTQxNX0.ZYGTcqoIp8SPMCMO_6VQa9pmj_dqoHv6qrsK8DXD3ls'; // Taken from supabaseService.ts

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function main() {
    console.log(`Starting C Language Completion for: ${TARGET_EMAIL}`);

    // 1. Get User ID
    const { data: users, error: userError } = await supabase
        .from('users')
        .select('id, completed_lesson_ids')
        .eq('email', TARGET_EMAIL);

    if (userError || !users || users.length === 0) {
        console.error('❌ User not found or error:', userError);
        return;
    }

    const user = users[0];
    console.log(`✅ User Found: ${user.id}`);

    // 2. Initial Setup - Read C Curriculum
    const cJsonPath = path.resolve(__dirname, '../data/curriculum/c.json');
    let cContent;
    try {
        cContent = JSON.parse(fs.readFileSync(cJsonPath, 'utf8'));
    } catch (e) {
        console.error('❌ Failed to read c.json:', e.message);
        return;
    }

    // Extract all Lesson IDs
    const cLessonIds = [];
    cContent.forEach(level => {
        if (level.lessons) {
            level.lessons.forEach(lesson => cLessonIds.push(lesson.id));
        }
    });
    console.log(`Found ${cLessonIds.length} C Lessons.`);

    // 3. Update User Profile (completed_lesson_ids)
    let currentCompleted = user.completed_lesson_ids || [];
    // Merge and deduplicate
    const newCompleted = [...new Set([...currentCompleted, ...cLessonIds])];

    const { error: updateError } = await supabase
        .from('users')
        .update({ completed_lesson_ids: newCompleted })
        .eq('id', user.id);

    if (updateError) {
        console.error('❌ Failed to update user profile:', updateError);
    } else {
        console.log(`✅ Updated users table with ${newCompleted.length} total completed lessons.`);
    }

    // 4. Upsert into user_progress table (Batching)
    console.log('Upserting lessons to user_progress...');
    const lessonUpdates = cLessonIds.map(lid => ({
        user_id: user.id,
        lesson_id: lid,
        status: 'completed',
        completed_at: new Date().toISOString()
    }));

    // Perform in chunks of 50 to be safe
    const chunkSize = 50;
    for (let i = 0; i < lessonUpdates.length; i += chunkSize) {
        const chunk = lessonUpdates.slice(i, i + chunkSize);
        const { error: progressError } = await supabase
            .from('user_progress')
            .upsert(chunk, { onConflict: 'user_id, lesson_id' });

        if (progressError) console.error(`❌ Error upserting chunk ${i}:`, progressError);
        else console.log(`   Processed chunk ${i / chunkSize + 1}`);
    }

    // 5. Practice Problems
    console.log('--- Processing Practice Problems ---');
    // We need to read practice_content.json OR infer. The prompt mentioned "complete c language totaly".
    // I previously saw "public/practice/topic_patterns.json" which had C code.
    // I also saw "public/practice_content.json" in step 9, which is huge.
    // I'll assume we should grab all problems that have "c" in "starter_codes" from practice_content.json if possible, 
    // BUT, that file is huge.
    // A smarter approach given the file size: Read "public/practice_content.json"

    const practicePath = path.resolve(__dirname, '../public/practice_content.json');
    let practiceContent;
    try {
        practiceContent = JSON.parse(fs.readFileSync(practicePath, 'utf8'));
    } catch (e) {
        console.error('❌ Failed to read practice_content.json:', e.message);
        return;
    }

    const problems = practiceContent.problems || [];
    const cProblems = problems.filter(p => p.starter_codes && p.starter_codes.c); // Filter for C problems
    console.log(`Found ${cProblems.length} C Practice Problems.`);

    const practiceUpdates = cProblems.map(p => ({
        user_id: user.id,
        challenge_id: p.id,
        status: 'completed',
        language_used: 'c',
        attempts_count: 1,
        code_snapshot: p.starter_codes.c, // Just use starter code as snapshot
        completed_at: new Date().toISOString(),
        last_attempt_at: new Date().toISOString()
    }));

    // Upsert practice in chunks
    for (let i = 0; i < practiceUpdates.length; i += chunkSize) {
        const chunk = practiceUpdates.slice(i, i + chunkSize);
        const { error: pracError } = await supabase
            .from('practice_progress')
            .upsert(chunk, { onConflict: 'user_id, challenge_id' });

        if (pracError) console.error(`❌ Error upserting practice chunk ${i}:`, pracError);
        else console.log(`   Processed practice chunk ${i / chunkSize + 1}`);
    }

    console.log('✅ C Language Completion Script Finished.');
}

main();
