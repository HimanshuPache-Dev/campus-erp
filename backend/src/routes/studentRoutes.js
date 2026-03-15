const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');
const { authenticate } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

// Get all students with their details
router.get('/', async (req, res) => {
  try {
    console.log('📚 Fetching all students...');
    
    const { data, error } = await supabase
      .from('users')
      .select(`
        *,
        student_details (*)
      `)
      .eq('role', 'student');

    if (error) {
      console.error('❌ Supabase error:', error);
      throw error;
    }

    console.log(`✅ Found ${data?.length || 0} students`);
    
    // Transform data to include semester in main object
    const transformedData = data.map(student => ({
      ...student,
      currentSemester: student.student_details?.current_semester || 1,
      enrollment_number: student.student_details?.enrollment_number,
      batch_year: student.student_details?.batch_year
    }));

    res.json(transformedData);
  } catch (error) {
    console.error('❌ Get students error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch students',
      details: error.message 
    });
  }
});

// Get student by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
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
    
    const transformedData = {
      ...data,
      currentSemester: data.student_details?.current_semester || 1,
      enrollment_number: data.student_details?.enrollment_number,
      batch_year: data.student_details?.batch_year
    };

    res.json(transformedData);
  } catch (error) {
    console.error('Get student error:', error);
    res.status(500).json({ error: 'Failed to fetch student' });
  }
});

module.exports = router;