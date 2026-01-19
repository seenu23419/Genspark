import { supabaseDB } from './supabaseService';
import { User, Certificate } from '../types';

class CertificateService {
  /**
   * Generate a unique certificate ID
   */
  generateCertificateId(courseId: string = 'GEN'): string {
    const prefix = 'GS';
    const course = courseId.toUpperCase();
    const year = new Date().getFullYear();
    const randomPart = Math.random().toString(36).substring(2, 7).toUpperCase();
    return `${prefix}-${course}-${year}-${randomPart}`;
  }

  /**
   * Check if user is eligible for certificate
   */
  async isUserEligibleForCertificate(userId: string, courseId: string): Promise<boolean> {
    try {
      const { data, error } = await supabaseDB.supabase
        .from('users')
        .select('id')
        .eq('id', userId)
        .single();

      if (error || !data) return false;
      return true;
    } catch (error) {
      console.error('Error checking user eligibility for certificate:', error);
      return false;
    }
  }

  /**
   * Create a certificate record in the database
   */
  async createCertificate(
    userId: string,
    courseId: string,
    courseName: string,
    mentorName: string
  ): Promise<Certificate> {
    try {
      // Eligibility is now checked by the caller for efficiency

      // Generate unique certificate ID
      const certificateId = this.generateCertificateId(courseId);
      const completionDate = new Date().toISOString();

      // Create certificate record
      const certificateData = {
        user_id: userId,
        course_name: courseName,
        mentor_name: mentorName,
        completion_date: completionDate,
        certificate_id: certificateId,
        created_at: completionDate
      };

      const { data, error } = await supabaseDB.supabase
        .from('certificates')
        .insert([certificateData])
        .select()
        .single();

      if (error) throw error;

      return data as Certificate;
    } catch (error) {
      console.error('Error creating certificate:', error);
      throw error;
    }
  }

  /**
   * Get user's certificates
   */
  async getUserCertificates(userId: string): Promise<Certificate[]> {
    try {
      const { data, error } = await supabaseDB.supabase
        .from('certificates')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data as Certificate[];
    } catch (error) {
      console.error('Error getting user certificates:', error);
      throw error;
    }
  }

  /**
   * Verify a certificate by ID
   */
  async verifyCertificate(certificateId: string): Promise<Certificate | null> {
    try {
      const { data, error } = await supabaseDB.supabase
        .from('certificates')
        .select(`
          *,
          users!user_id (name, email)
        `)
        .eq('certificate_id', certificateId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }

      return data as Certificate;
    } catch (error) {
      console.error('Error verifying certificate:', error);
      throw error;
    }
  }

  /**
   * Check if a course is completed by the user
   */
  async isCourseCompleted(userId: string, courseId: string, justCompletedLessonId?: string): Promise<boolean> {
    try {
      // Get user's completed lessons from user_progress table
      const { data: progress, error: progressError } = await supabaseDB.supabase
        .from('user_progress')
        .select('lesson_id')
        .eq('user_id', userId)
        .eq('status', 'completed');

      if (progressError) throw progressError;

      const completedLessonIds = progress?.map(p => p.lesson_id) || [];

      // Add the lesson just completed in case DB hasn't synced yet
      if (justCompletedLessonId && !completedLessonIds.includes(justCompletedLessonId)) {
        completedLessonIds.push(justCompletedLessonId);
      }

      console.log('Checking course completion for user:', userId, 'course:', courseId);
      console.log('User completed lessons:', completedLessonIds);

      const coursePrefix = courseId.charAt(0).toLowerCase();
      const userCompletedInCourse = completedLessonIds.filter(id => {
        const lessonPrefix = id.charAt(0).toLowerCase();
        return lessonPrefix === coursePrefix;
      }).length;

      console.log('Lessons completed in course', courseId, ':', userCompletedInCourse);

      // For the 'c' course, we require completion of the final certification lesson (c41)
      if (courseId.toLowerCase() === 'c') {
        return completedLessonIds.includes('c41');
      }

      // For other courses, use a basic threshold
      return userCompletedInCourse >= 3;
    } catch (error) {
      console.error('Error checking course completion:', error);
      return false;
    }
  }

  /**
   * Get total lesson count for a course
   */
  private getCourseLessonsCount(courseId: string): number {
    const courseLessonCounts: Record<string, number> = {
      'c': 41,
      'java': 60,
      'python': 80,
      'javascript': 90,
      'cpp': 55,
      'sql': 30,
      'htmlcss': 40,
      'dsa': 100,
      'fullstack': 120
    };
    return courseLessonCounts[courseId] || 0;
  }

  /**
   * Check if user already has a certificate for this course
   */
  async getCertificateForCourse(userId: string, courseName: string): Promise<Certificate | null> {
    try {
      const { data, error } = await supabaseDB.supabase
        .from('certificates')
        .select('*')
        .eq('user_id', userId)
        .ilike('course_name', `%${courseName}%`)
        .maybeSingle();

      if (error) throw error;
      return data as Certificate;
    } catch (error) {
      console.error('Error getting existing certificate:', error);
      return null;
    }
  }

  /**
   * Generate certificate for completed course
   */
  async generateCertificateForCourse(userId: string, courseId: string, courseName: string, justCompletedLessonId?: string): Promise<Certificate | null> {
    try {
      // Check if user is eligible for certificate
      const isEligible = await this.isUserEligibleForCertificate(userId, courseId);
      if (!isEligible) {
        console.log('User is not eligible for certificate');
        return null;
      }

      // Check if course is completed
      const isCompleted = await this.isCourseCompleted(userId, courseId, justCompletedLessonId);
      console.log('Course completion status for', courseId, ':', isCompleted);
      if (!isCompleted) {
        console.log('Course is not completed');
        return null;
      }

      // Check if certificate already exists
      const existingCert = await this.getCertificateForCourse(userId, courseName);
      if (existingCert) {
        console.log('Certificate already exists for this course');
        return existingCert;
      }

      // Create certificate
      const certificate = await this.createCertificate(userId, courseId, courseName, 'GenSpark Mentor');

      return certificate;
    } catch (error) {
      console.error('Error generating certificate for course:', error);
      throw error;
    }
  }
}

export const certificateService = new CertificateService();