const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');
const { authenticate } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

// Get today's attendance summary
router.get('/today', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    console.log('📅 Fetching attendance for date:', today);
    
    const { data, error } = await supabase
      .from('attendance')
      .select(`
        *,
        users:student_id (first_name, last_name, email, department),
        courses (course_name, course_code)
      `)
      .eq('date', today);

    if (error) {
      console.error('❌ Supabase error:', error);
      throw error;
    }

    // Group by course
    const byCourse = {};
    data.forEach(item => {
      const courseId = item.course_id;
      if (!byCourse[courseId]) {
        byCourse[courseId] = {
          course: item.courses,
          total: 0,
          present: 0,
          absent: 0,
          late: 0
        };
      }
      byCourse[courseId].total++;
      byCourse[courseId][item.status]++;
    });

    res.json({
      date: today,
      total: data.length,
      byCourse: Object.values(byCourse),
      records: data
    });
  } catch (error) {
    console.error('❌ Get today attendance error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch today attendance',
      details: error.message 
    });
  }
});

// Mark attendance
router.post('/', async (req, res) => {
  try {
    const attendanceData = req.body;
    
    const { data, error } = await supabase
      .from('attendance')
      .insert([{
        ...attendanceData,
        faculty_id: req.userId,
        marked_at: new Date()
      }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    console.error('Mark attendance error:', error);
    res.status(500).json({ error: 'Failed to mark attendance' });
  }
});

// Get attendance by course
router.get('/course/:courseId', async (req, res) => {
  try {
    const { courseId } = req.params;
    const { date } = req.query;
    
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
    res.json(data);
  } catch (error) {
    console.error('Get attendance error:', error);
    res.status(500).json({ error: 'Failed to fetch attendance' });
  }
});

// Get attendance by student
router.get('/student/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const { semester, academicYear } = req.query;
    
    let query = supabase
      .from('attendance')
      .select(`
        *,
        courses (course_name, course_code)
      `)
      .eq('student_id', studentId);
    
    if (semester) query = query.eq('semester_type', semester);
    if (academicYear) query = query.eq('academic_year', academicYear);
    
    const { data, error } = await query.order('date', { ascending: false });
    
    if (error) throw error;
    
    // Calculate statistics
    const total = data.length;
    const present = data.filter(a => a.status === 'present').length;
    const absent = data.filter(a => a.status === 'absent').length;
    const late = data.filter(a => a.status === 'late').length;
    const percentage = total > 0 ? ((present / total) * 100).toFixed(1) : 0;

    res.json({
      records: data,
      summary: { total, present, absent, late, percentage }
    });
  } catch (error) {
    console.error('Get student attendance error:', error);
    res.status(500).json({ error: 'Failed to fetch student attendance' });
  }
});

// Mark bulk attendance
router.post('/bulk', async (req, res) => {
  try {
    const { attendance_list } = req.body;
    
    if (!attendance_list || !Array.isArray(attendance_list) || attendance_list.length === 0) {
      return res.status(400).json({ error: 'Invalid attendance list' });
    }

    const bulkData = attendance_list.map(item => ({
      student_id: item.student_id,
      course_id: item.course_id,
      faculty_id: req.userId,
      date: item.date || new Date().toISOString().split('T')[0],
      status: item.status,
      semester_type: item.semester_type,
      academic_year: item.academic_year,
      marked_at: new Date()
    }));

    const { data, error } = await supabase
      .from('attendance')
      .insert(bulkData)
      .select();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    console.error('Bulk attendance error:', error);
    res.status(500).json({ error: 'Failed to mark bulk attendance' });
  }
});

module.exports = router;