const { supabase } = require('../config/supabase');

class DatabaseService {
  // ==================== USERS ====================
  async getUsers() {
    const { data, error } = await supabase
      .from('users')
      .select('*');
    if (error) throw error;
    return data;
  }

  async getUserById(id) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  }

  async getUserByEmail(email) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  async createUser(userData) {
    const { data, error } = await supabase
      .from('users')
      .insert([userData])
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async updateUser(id, updates) {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async deleteUser(id) {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  }

  // ==================== STUDENTS ====================
  async getStudents() {
    const { data, error } = await supabase
      .from('users')
      .select(`
        *,
        student_details (*)
      `)
      .eq('role', 'student');
    if (error) throw error;
    return data;
  }

  async getStudentById(id) {
    const { data, error } = await supabase
      .from('users')
      .select(`
        *,
        student_details (*)
      `)
      .eq('id', id)
      .eq('role', 'student')
      .single();
    if (error) throw error;
    return data;
  }

  async createStudent(studentData, detailsData) {
    // Start a transaction by using multiple operations
    const user = await this.createUser(studentData);
    
    const { data: details, error } = await supabase
      .from('student_details')
      .insert([{ ...detailsData, user_id: user.id }])
      .select()
      .single();
    
    if (error) {
      // Rollback by deleting the user
      await this.deleteUser(user.id);
      throw error;
    }
    
    return { ...user, student_details: details };
  }

  // ==================== FACULTY ====================
  async getFaculty() {
    const { data, error } = await supabase
      .from('users')
      .select(`
        *,
        faculty_details (*)
      `)
      .eq('role', 'faculty');
    if (error) throw error;
    return data;
  }

  async getFacultyById(id) {
    const { data, error } = await supabase
      .from('users')
      .select(`
        *,
        faculty_details (*)
      `)
      .eq('id', id)
      .eq('role', 'faculty')
      .single();
    if (error) throw error;
    return data;
  }

  // ==================== COURSES ====================
  async getCourses() {
    const { data, error } = await supabase
      .from('courses')
      .select('*');
    if (error) throw error;
    return data;
  }

  async getCourseById(id) {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  }

  async createCourse(courseData) {
    const { data, error } = await supabase
      .from('courses')
      .insert([courseData])
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async updateCourse(id, updates) {
    const { data, error } = await supabase
      .from('courses')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async deleteCourse(id) {
    const { error } = await supabase
      .from('courses')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  }

  // ==================== COURSE ASSIGNMENTS ====================
  async assignFacultyToCourse(assignmentData) {
    const { data, error } = await supabase
      .from('course_assignments')
      .insert([assignmentData])
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async getFacultyCourses(facultyId) {
    const { data, error } = await supabase
      .from('course_assignments')
      .select(`
        *,
        courses (*)
      `)
      .eq('faculty_id', facultyId)
      .eq('is_active', true);
    if (error) throw error;
    return data;
  }

  // ==================== STUDENT ENROLLMENTS ====================
  async enrollStudent(enrollmentData) {
    const { data, error } = await supabase
      .from('student_enrollments')
      .insert([enrollmentData])
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async getStudentCourses(studentId) {
    const { data, error } = await supabase
      .from('student_enrollments')
      .select(`
        *,
        courses (*)
      `)
      .eq('student_id', studentId)
      .eq('is_completed', false);
    if (error) throw error;
    return data;
  }

  // ==================== ATTENDANCE ====================
  async markAttendance(attendanceData) {
    const { data, error } = await supabase
      .from('attendance')
      .insert([attendanceData])
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async markBulkAttendance(attendanceList) {
    const { data, error } = await supabase
      .from('attendance')
      .insert(attendanceList)
      .select();
    if (error) throw error;
    return data;
  }

  async getAttendanceByCourse(courseId, date) {
    let query = supabase
      .from('attendance')
      .select(`
        *,
        users:student_id (first_name, last_name, email)
      `)
      .eq('course_id', courseId);
    
    if (date) {
      query = query.eq('date', date);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  async getAttendanceByStudent(studentId, semester, academicYear) {
    let query = supabase
      .from('attendance')
      .select(`
        *,
        courses (course_name, course_code)
      `)
      .eq('student_id', studentId);
    
    if (semester) query = query.eq('semester_type', semester);
    if (academicYear) query = query.eq('academic_year', academicYear);
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  // ==================== RESULTS ====================
  async addResult(resultData) {
    const { data, error } = await supabase
      .from('results')
      .insert([resultData])
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async getResultsByStudent(studentId) {
    const { data, error } = await supabase
      .from('results')
      .select(`
        *,
        courses (course_name, course_code, credits)
      `)
      .eq('student_id', studentId)
      .order('semester_type', { ascending: false })
      .order('academic_year', { ascending: false });
    if (error) throw error;
    return data;
  }

  async getResultsByCourse(courseId, semester, academicYear) {
    let query = supabase
      .from('results')
      .select(`
        *,
        users:student_id (first_name, last_name, email)
      `)
      .eq('course_id', courseId);
    
    if (semester) query = query.eq('semester_type', semester);
    if (academicYear) query = query.eq('academic_year', academicYear);
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  // ==================== FEES ====================
  async addFee(feeData) {
    const { data, error } = await supabase
      .from('fees')
      .insert([feeData])
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async getFeesByStudent(studentId) {
    const { data, error } = await supabase
      .from('fees')
      .select('*')
      .eq('student_id', studentId)
      .order('due_date', { ascending: true });
    if (error) throw error;
    return data;
  }

  async updateFeeStatus(id, status, paidDate, paymentMethod) {
    const { data, error } = await supabase
      .from('fees')
      .update({ 
        status, 
        paid_date: paidDate,
        payment_method: paymentMethod
      })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  // ==================== NOTIFICATIONS ====================
  async createNotification(notificationData) {
    const { data, error } = await supabase
      .from('notifications')
      .insert([notificationData])
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async createBulkNotifications(notificationsList) {
    const { data, error } = await supabase
      .from('notifications')
      .insert(notificationsList)
      .select();
    if (error) throw error;
    return data;
  }

  async getUserNotifications(userId, onlyUnread = false) {
    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .or(`is_global.eq.true`)
      .order('created_at', { ascending: false });
    
    if (onlyUnread) {
      query = query.eq('is_read', false);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  async markNotificationAsRead(id) {
    const { data, error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async markAllNotificationsAsRead(userId) {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId);
    if (error) throw error;
    return true;
  }
}

module.exports = new DatabaseService();