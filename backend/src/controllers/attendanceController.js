const db = require('../services/db.service');
const { supabase } = require('../config/supabase');

const markAttendance = async (req, res) => {
  try {
    const attendanceData = req.body;
    
    // Validate required fields
    if (!attendanceData.student_id || !attendanceData.course_id || !attendanceData.status) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const attendance = await db.markAttendance({
      ...attendanceData,
      faculty_id: req.userId,
      marked_at: new Date()
    });

    res.status(201).json(attendance);
  } catch (error) {
    console.error('Mark attendance error:', error);
    res.status(500).json({ error: 'Failed to mark attendance' });
  }
};

const markBulkAttendance = async (req, res) => {
  try {
    const { attendance_list, course_id, date } = req.body;
    
    if (!attendance_list || !Array.isArray(attendance_list) || attendance_list.length === 0) {
      return res.status(400).json({ error: 'Invalid attendance list' });
    }

    // Prepare bulk data
    const bulkData = attendance_list.map(item => ({
      student_id: item.student_id,
      course_id,
      faculty_id: req.userId,
      date: date || new Date().toISOString().split('T')[0],
      status: item.status,
      marked_at: new Date()
    }));

    const attendance = await db.markBulkAttendance(bulkData);
    res.status(201).json(attendance);
  } catch (error) {
    console.error('Bulk attendance error:', error);
    res.status(500).json({ error: 'Failed to mark bulk attendance' });
  }
};

const getAttendanceByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { date } = req.query;
    
    const attendance = await db.getAttendanceByCourse(courseId, date);
    res.json(attendance);
  } catch (error) {
    console.error('Get attendance error:', error);
    res.status(500).json({ error: 'Failed to fetch attendance' });
  }
};

const getAttendanceByStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { semester, academicYear } = req.query;
    
    const attendance = await db.getAttendanceByStudent(studentId, semester, academicYear);
    
    // Calculate statistics
    const total = attendance.length;
    const present = attendance.filter(a => a.status === 'present').length;
    const absent = attendance.filter(a => a.status === 'absent').length;
    const late = attendance.filter(a => a.status === 'late').length;
    const percentage = total > 0 ? ((present / total) * 100).toFixed(1) : 0;

    res.json({
      records: attendance,
      summary: { total, present, absent, late, percentage }
    });
  } catch (error) {
    console.error('Get student attendance error:', error);
    res.status(500).json({ error: 'Failed to fetch student attendance' });
  }
};

const getTodayAttendance = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    // Get all attendance for today
    const { data, error } = await supabase
      .from('attendance')
      .select(`
        *,
        users:student_id (first_name, last_name, email),
        courses (course_name, course_code)
      `)
      .eq('date', today);
    
    if (error) throw error;

    // Group by course
    const byCourse = data.reduce((acc, item) => {
      const courseCode = item.courses.course_code;
      if (!acc[courseCode]) {
        acc[courseCode] = {
          course: item.courses,
          total: 0,
          present: 0,
          absent: 0,
          late: 0
        };
      }
      acc[courseCode].total++;
      acc[courseCode][item.status]++;
      return acc;
    }, {});

    res.json({
      date: today,
      total: data.length,
      byCourse: Object.values(byCourse),
      records: data
    });
  } catch (error) {
    console.error('Get today attendance error:', error);
    res.status(500).json({ error: 'Failed to fetch today attendance' });
  }
};

module.exports = {
  markAttendance,
  markBulkAttendance,
  getAttendanceByCourse,
  getAttendanceByStudent,
  getTodayAttendance
};