// =====================================================
// CERTIFICATE GENERATION HOOK
// File: src/hooks/useCertificate.js
// Purpose: Custom hook for generating and managing certificates
// =====================================================

import { useState } from 'react';
import { supabase } from '@/services/supabaseClient';

/**
 * Custom hook for certificate generation
 * 
 * Returns:
 *   - generateCertificate: async function to create certificate
 *   - certificates: array of user's certificates
 *   - isLoading: boolean indicating loading state
 *   - error: error message if generation failed
 *   - success: success message if generation succeeded
 *   - fetchUserCertificates: function to refresh certificates list
 */

export const useCertificate = (userId) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [certificates, setCertificates] = useState([]);

    /**
     * Generate unique certificate number
     * Format: GENSPARK-{COURSE}-{YEAR}-{RANDOM}
     * Example: GENSPARK-JAVASCRIPT-2024-X7K9L2
     */
    const generateCertificateNumber = (courseId) => {
        const year = new Date().getFullYear();
        const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
        const courseCode = courseId.toUpperCase().substring(0, 12);
        return `GENSPARK-${courseCode}-${year}-${randomPart}`;
    };

    /**
     * Check if certificate already exists for user and course
     */
    const checkExistingCertificate = async (courseId) => {
        try {
            const { data, error } = await supabase
                .from('certificates')
                .select('id, certificate_number')
                .eq('user_id', userId)
                .eq('course_id', courseId)
                .single();

            if (error && error.code !== 'PGRST116') {
                // PGRST116 = no rows returned (expected for first time)
                throw error;
            }

            return data; // null if no certificate exists
        } catch (err) {
            console.error('Error checking existing certificate:', err);
            return null;
        }
    };

    /**
     * Verify course completion (all lessons + quizzes passed)
     * This function checks the user_course_progress table
     */
    const verifyCourseCompletion = async (courseId) => {
        try {
            const { data, error } = await supabase
                .from('user_course_progress')
                .select('*')
                .eq('user_id', userId)
                .eq('course_id', courseId)
                .single();

            if (error) {
                throw error;
            }

            // Check if all requirements met
            if (!data || !data.is_course_complete) {
                return {
                    complete: false,
                    reason: 'Course not completed. All lessons and quizzes must be finished.'
                };
            }

            return { complete: true };
        } catch (err) {
            console.error('Error verifying course completion:', err);
            return {
                complete: false,
                reason: 'Unable to verify course completion.'
            };
        }
    };

    /**
     * Fetch user's existing certificates from database
     */
    const fetchUserCertificates = async () => {
        try {
            setIsLoading(true);
            setError(null);

            if (!userId) {
                setCertificates([]);
                return;
            }

            const { data, error } = await supabase
                .from('certificates')
                .select('*')
                .eq('user_id', userId)
                .order('issued_at', { ascending: false });

            if (error) throw error;

            setCertificates(data || []);
            return data;
        } catch (err) {
            console.error('Error fetching certificates:', err);
            setError(err.message);
            setCertificates([]);
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Main function: Generate new certificate
     * 
     * Parameters:
     *   - courseId: string (e.g., 'javascript')
     *   - courseName: string (e.g., 'JavaScript Complete')
     *   - userName: string (user's full name)
     * 
     * Returns: { success: boolean, data: certificateData, error: string }
     */
    const generateCertificate = async (courseId, courseName, userName) => {
        setIsLoading(true);
        setError(null);
        setSuccess(null);

        try {
            // 1. VALIDATION
            // ================================================
            if (!userId) {
                throw new Error('User not authenticated. Please log in.');
            }

            if (!courseId || !courseName || !userName) {
                throw new Error('Missing required certificate information.');
            }

            // 2. CHECK FOR EXISTING CERTIFICATE
            // ================================================
            const existing = await checkExistingCertificate(courseId);
            if (existing) {
                const msg = `You already have a certificate for ${courseName}. Certificate #${existing.certificate_number}`;
                setError(msg);
                setIsLoading(false);
                return {
                    success: false,
                    error: msg,
                    existingCertificate: existing
                };
            }

            // 3. VERIFY COURSE COMPLETION
            // ================================================
            const completion = await verifyCourseCompletion(courseId);
            if (!completion.complete) {
                setError(completion.reason);
                setIsLoading(false);
                return {
                    success: false,
                    error: completion.reason
                };
            }

            // 4. GENERATE CERTIFICATE NUMBER
            // ================================================
            const certificateNumber = generateCertificateNumber(courseId);

            // 5. INSERT INTO DATABASE
            // ================================================
            const { data, error } = await supabase
                .from('certificates')
                .insert([
                    {
                        user_id: userId,
                        course_id: courseId,
                        course_name: courseName,
                        user_name: userName,
                        certificate_number: certificateNumber,
                        certificate_data: {
                            generated_at: new Date().toISOString(),
                            platform: 'GenSpark',
                            version: '1.0'
                        }
                    }
                ])
                .select()
                .single();

            if (error) {
                // Handle duplicate error specifically
                if (error.code === '23505') {
                    throw new Error(`Certificate already exists for this course (Duplicate key violation).`);
                }
                throw error;
            }

            // 6. SUCCESS - UPDATE STATE AND REFETCH
            // ================================================
            const successMsg = `Certificate generated successfully! Certificate #${certificateNumber}`;
            setSuccess(successMsg);

            // Refetch certificates to update list
            await fetchUserCertificates();

            setIsLoading(false);
            return {
                success: true,
                data,
                message: successMsg
            };

        } catch (err) {
            console.error('Error generating certificate:', err);
            const errorMsg = err.message || 'An unexpected error occurred while generating the certificate.';
            setError(errorMsg);
            setIsLoading(false);
            return {
                success: false,
                error: errorMsg
            };
        }
    };

    /**
     * Delete certificate (admin/user function - restricted by RLS)
     * Note: RLS prevents this, but function available for testing
     */
    const deleteCertificate = async (certificateId) => {
        try {
            setIsLoading(true);
            const { error } = await supabase
                .from('certificates')
                .delete()
                .eq('id', certificateId)
                .eq('user_id', userId);

            if (error) throw error;

            // Refetch after deletion
            await fetchUserCertificates();
            setSuccess('Certificate deleted successfully.');
            return { success: true };

        } catch (err) {
            const errorMsg = err.message || 'Failed to delete certificate.';
            setError(errorMsg);
            return { success: false, error: errorMsg };
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Get specific certificate details
     */
    const getCertificateDetails = async (certificateId) => {
        try {
            const { data, error } = await supabase
                .from('certificates')
                .select('*')
                .eq('id', certificateId)
                .eq('user_id', userId)
                .single();

            if (error) throw error;

            return data;
        } catch (err) {
            console.error('Error fetching certificate details:', err);
            return null;
        }
    };

    /**
     * Share certificate (generate verification link)
     */
    const getShareableLink = (certificateNumber) => {
        return `${window.location.origin}/verify/${certificateNumber}`;
    };

    return {
        generateCertificate,
        fetchUserCertificates,
        deleteCertificate,
        getCertificateDetails,
        getShareableLink,
        certificates,
        isLoading,
        error,
        success
    };
};

/**
 * USAGE EXAMPLE:
 * 
 * import { useCertificate } from '@/hooks/useCertificate';
 * import { useAuth } from '@/hooks/useAuth';
 * 
 * export function CourseCompletionPage() {
 *     const { user } = useAuth();
 *     const {
 *         generateCertificate,
 *         isLoading,
 *         error,
 *         success
 *     } = useCertificate(user?.id);
 * 
 *     const handleGenerateCertificate = async () => {
 *         const result = await generateCertificate(
 *             'javascript',
 *             'JavaScript Complete',
 *             user?.user_metadata?.full_name || user?.email
 *         );
 * 
 *         if (result.success) {
 *             alert('Certificate generated!');
 *             // Show certificate preview
 *         } else {
 *             alert(`Error: ${result.error}`);
 *         }
 *     };
 * 
 *     return (
 *         <div>
 *             <h2>Congratulations!</h2>
 *             {error && <div className="error">{error}</div>}
 *             {success && <div className="success">{success}</div>}
 *             <button
 *                 onClick={handleGenerateCertificate}
 *                 disabled={isLoading}
 *             >
 *                 {isLoading ? 'Generating...' : 'Generate Certificate'}
 *             </button>
 *         </div>
 *     );
 * }
 * 
 * FEATURES:
 * ✅ Prevents duplicate certificates (checks database first)
 * ✅ Verifies course completion before issuing
 * ✅ Unique certificate numbers with anti-spoofing format
 * ✅ Comprehensive error handling
 * ✅ Loading and success states
 * ✅ Refetches certificates after generation
 * ✅ Shareable verification links
 * ✅ Full user authentication integration
 */
