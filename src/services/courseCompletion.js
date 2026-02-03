// =====================================================
// COURSE COMPLETION SERVICE
// File: src/services/courseCompletion.js
// Purpose: Validate and track course completion status
// =====================================================

import { supabase } from '@/services/supabaseClient';
import { CURRICULUM_DATA } from '@/data/curriculum'; // Import all curricula

/**
 * Course Completion Service
 * Handles validation of lesson/quiz completion and tracks progress
 */

// Map course IDs to curriculum data
const COURSE_MAP = {
    'c': CURRICULUM_DATA.c,
    'cpp': CURRICULUM_DATA.cpp,
    'java': CURRICULUM_DATA.java,
    'javascript': CURRICULUM_DATA.javascript,
    'python': CURRICULUM_DATA.python,
    'typescript': CURRICULUM_DATA.typescript,
    'sql': CURRICULUM_DATA.sql,
    'htmlcss': CURRICULUM_DATA.htmlcss,
    'fullstack': CURRICULUM_DATA.fullstack,
    'dsa': CURRICULUM_DATA.dsa
};

/**
 * Get total number of lessons in a course
 */
export const getTotalLessons = (courseId) => {
    const curriculum = COURSE_MAP[courseId.toLowerCase()];
    if (!curriculum) return 0;

    // Handle both single level and multi-level curricula
    if (Array.isArray(curriculum.lessons)) {
        return curriculum.lessons.length;
    }

    // Multi-level curricula (JavaScript has levels, etc.)
    if (curriculum.levels) {
        return curriculum.levels.reduce((total, level) => {
            return total + (level.lessons ? level.lessons.length : 0);
        }, 0);
    }

    return 0;
};

/**
 * Get total number of quizzes in a course
 */
export const getTotalQuizzes = (courseId) => {
    const curriculum = COURSE_MAP[courseId.toLowerCase()];
    if (!curriculum) return 0;

    let total = 0;

    const countQuizzes = (lessons) => {
        return lessons.reduce((count, lesson) => {
            return count + (lesson.quizQuestions ? lesson.quizQuestions.length : 0);
        }, 0);
    };

    if (Array.isArray(curriculum.lessons)) {
        total = countQuizzes(curriculum.lessons);
    }

    if (curriculum.levels) {
        curriculum.levels.forEach(level => {
            if (level.lessons) {
                total += countQuizzes(level.lessons);
            }
        });
    }

    return total;
};

/**
 * Get all lessons for a course (flattened)
 */
export const getAllLessons = (courseId) => {
    const curriculum = COURSE_MAP[courseId.toLowerCase()];
    if (!curriculum) return [];

    let lessons = [];

    if (Array.isArray(curriculum.lessons)) {
        lessons = curriculum.lessons;
    }

    if (curriculum.levels) {
        curriculum.levels.forEach(level => {
            if (level.lessons) {
                lessons = [...lessons, ...level.lessons];
            }
        });
    }

    return lessons;
};

/**
 * Get all quiz questions for a course
 */
export const getAllQuizzes = (courseId) => {
    const lessons = getAllLessons(courseId);
    const quizzes = [];

    lessons.forEach(lesson => {
        if (lesson.quizQuestions) {
            lesson.quizQuestions.forEach(question => {
                quizzes.push({
                    lessonId: lesson.id,
                    lessonTitle: lesson.title,
                    ...question
                });
            });
        }
    });

    return quizzes;
};

/**
 * Initialize course progress tracking for a user
 */
export const initializeCourseProgress = async (userId, courseId, courseName) => {
    try {
        const totalLessons = getTotalLessons(courseId);
        const totalQuizzes = getTotalQuizzes(courseId);

        const { data, error } = await supabase
            .from('user_course_progress')
            .upsert([
                {
                    user_id: userId,
                    course_id: courseId,
                    completed_lessons: 0,
                    total_lessons: totalLessons,
                    completed_quizzes: 0,
                    total_quizzes: totalQuizzes,
                    quiz_passed: false,
                    is_course_complete: false
                }
            ], {
                onConflict: 'user_id,course_id'
            })
            .select()
            .single();

        if (error) throw error;
        return { success: true, data };

    } catch (err) {
        console.error('Error initializing course progress:', err);
        return { success: false, error: err.message };
    }
};

/**
 * Update lesson completion for user
 */
export const markLessonComplete = async (userId, courseId, lessonId) => {
    try {
        // First, get current progress
        const { data: progress, error: fetchError } = await supabase
            .from('user_course_progress')
            .select('completed_lessons, total_lessons')
            .eq('user_id', userId)
            .eq('course_id', courseId)
            .single();

        if (fetchError) throw fetchError;

        // Increment completed lessons
        const newCompletedLessons = (progress.completed_lessons || 0) + 1;

        // Update progress
        const { data, error } = await supabase
            .from('user_course_progress')
            .update({
                completed_lessons: newCompletedLessons
            })
            .eq('user_id', userId)
            .eq('course_id', courseId)
            .select()
            .single();

        if (error) throw error;
        return { success: true, data };

    } catch (err) {
        console.error('Error marking lesson complete:', err);
        return { success: false, error: err.message };
    }
};

/**
 * Update quiz completion for user
 */
export const markQuizComplete = async (userId, courseId, lessonId, score, totalQuestions) => {
    try {
        // Calculate if quiz passed (assuming 70% is passing)
        const passThreshold = 0.7;
        const quizPassed = (score / totalQuestions) >= passThreshold;

        // Get current progress
        const { data: progress, error: fetchError } = await supabase
            .from('user_course_progress')
            .select('completed_quizzes, total_quizzes')
            .eq('user_id', userId)
            .eq('course_id', courseId)
            .single();

        if (fetchError) throw fetchError;

        // Increment completed quizzes
        const newCompletedQuizzes = (progress.completed_quizzes || 0) + 1;

        // Update progress
        const { data, error } = await supabase
            .from('user_course_progress')
            .update({
                completed_quizzes: newCompletedQuizzes,
                quiz_passed: quizPassed
            })
            .eq('user_id', userId)
            .eq('course_id', courseId)
            .select()
            .single();

        if (error) throw error;
        return { success: true, data, quizPassed };

    } catch (err) {
        console.error('Error marking quiz complete:', err);
        return { success: false, error: err.message };
    }
};

/**
 * Check if course is complete
 * Requirements: All lessons completed AND all quizzes passed
 */
export const checkCourseCompletion = async (userId, courseId) => {
    try {
        const { data, error } = await supabase
            .from('user_course_progress')
            .select('*')
            .eq('user_id', userId)
            .eq('course_id', courseId)
            .single();

        if (error && error.code !== 'PGRST116') {
            throw error;
        }

        if (!data) {
            return {
                complete: false,
                lessonsComplete: false,
                quizzesComplete: false,
                progress: 0,
                message: 'Course not started'
            };
        }

        const lessonsComplete = data.completed_lessons >= data.total_lessons;
        const quizzesComplete = data.completed_quizzes >= data.total_quizzes && data.quiz_passed;
        const isComplete = lessonsComplete && quizzesComplete;

        // Calculate overall progress percentage
        const lessonProgress = (data.completed_lessons / data.total_lessons) * 100;
        const quizProgress = (data.completed_quizzes / data.total_quizzes) * 100;
        const overallProgress = Math.round((lessonProgress + quizProgress) / 2);

        return {
            complete: isComplete,
            lessonsComplete,
            quizzesComplete,
            completedLessons: data.completed_lessons,
            totalLessons: data.total_lessons,
            completedQuizzes: data.completed_quizzes,
            totalQuizzes: data.total_quizzes,
            progress: overallProgress,
            completionDate: data.completion_date,
            message: isComplete ? 'Course completed! You have mastered this subject.' : 'Course in progress'
        };

    } catch (err) {
        console.error('Error checking course completion:', err);
        return {
            complete: false,
            error: err.message
        };
    }
};

/**
 * Get user's progress for a course
 */
export const getUserCourseProgress = async (userId, courseId) => {
    try {
        const { data, error } = await supabase
            .from('user_course_progress')
            .select('*')
            .eq('user_id', userId)
            .eq('course_id', courseId)
            .single();

        if (error && error.code !== 'PGRST116') {
            throw error;
        }

        return data || null;

    } catch (err) {
        console.error('Error fetching user course progress:', err);
        return null;
    }
};

/**
 * Get user's progress for all courses
 */
export const getUserAllProgress = async (userId) => {
    try {
        const { data, error } = await supabase
            .from('user_course_progress')
            .select('*')
            .eq('user_id', userId)
            .order('updated_at', { ascending: false });

        if (error) throw error;

        // Enhance with completion status
        return (data || []).map(progress => ({
            ...progress,
            completionPercentage: Math.round(
                ((progress.completed_lessons / progress.total_lessons) * 100 +
                    (progress.completed_quizzes / progress.total_quizzes) * 100) / 2
            )
        }));

    } catch (err) {
        console.error('Error fetching user progress:', err);
        return [];
    }
};

/**
 * Mark course as complete (sets completion date)
 */
export const markCourseAsComplete = async (userId, courseId) => {
    try {
        const { data, error } = await supabase
            .from('user_course_progress')
            .update({
                is_course_complete: true,
                completion_date: new Date().toISOString()
            })
            .eq('user_id', userId)
            .eq('course_id', courseId)
            .select()
            .single();

        if (error) throw error;
        return { success: true, data };

    } catch (err) {
        console.error('Error marking course complete:', err);
        return { success: false, error: err.message };
    }
};

/**
 * Reset course progress (admin function)
 */
export const resetCourseProgress = async (userId, courseId) => {
    try {
        const totalLessons = getTotalLessons(courseId);
        const totalQuizzes = getTotalQuizzes(courseId);

        const { data, error } = await supabase
            .from('user_course_progress')
            .update({
                completed_lessons: 0,
                completed_quizzes: 0,
                quiz_passed: false,
                is_course_complete: false,
                completion_date: null
            })
            .eq('user_id', userId)
            .eq('course_id', courseId)
            .select()
            .single();

        if (error) throw error;
        return { success: true, data };

    } catch (err) {
        console.error('Error resetting course progress:', err);
        return { success: false, error: err.message };
    }
};

/**
 * Get completion statistics for admin dashboard
 */
export const getCompletionStats = async () => {
    try {
        // Total users who completed courses
        const { data: completedCourses, error: error1 } = await supabase
            .from('user_course_progress')
            .select('count', { count: 'exact' })
            .eq('is_course_complete', true);

        // Total certificates issued (Deprecated)
        // const { data: certificates, error: error2 } = await supabase
        //     .from('certificates')
        //     .select('count', { count: 'exact' });

        if (error1) throw new Error('Failed to fetch stats');

        return {
            completedCourses: completedCourses?.count || 0,
            certificatesIssued: 0 // certificates?.count || 0
        };

    } catch (err) {
        console.error('Error fetching completion stats:', err);
        return { completedCourses: 0, certificatesIssued: 0 };
    }
};

export default {
    getTotalLessons,
    getTotalQuizzes,
    getAllLessons,
    getAllQuizzes,
    initializeCourseProgress,
    markLessonComplete,
    markQuizComplete,
    checkCourseCompletion,
    getUserCourseProgress,
    getUserAllProgress,
    markCourseAsComplete,
    resetCourseProgress,
    getCompletionStats
};

/**
 * USAGE EXAMPLE:
 * 
 * import * as courseCompletion from '@/services/courseCompletion';
 * 
 * // When user starts a course
 * await courseCompletion.initializeCourseProgress(userId, 'javascript', 'JavaScript Complete');
 * 
 * // When user completes a lesson
 * await courseCompletion.markLessonComplete(userId, 'javascript', 'js-1-1');
 * 
 * // When user completes a quiz
 * await courseCompletion.markQuizComplete(userId, 'javascript', 'js-1-1', 8, 10); // 8/10 correct
 * 
 * // Check if course is complete
 * const completion = await courseCompletion.checkCourseCompletion(userId, 'javascript');
 * if (completion.complete) {
 *     console.log('Course completed! You have mastered this subject.');
 * }
 * 
 * COMPLETION REQUIREMENTS:
 * ✅ All lessons completed (completed_lessons >= total_lessons)
 * ✅ All quizzes passed (score >= 70%)
 * ✅ Timestamp recorded (completion_date)
 */
