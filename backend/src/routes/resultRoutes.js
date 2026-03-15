const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');
const { authenticate } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

// Get all results (with optional filters)
router.get('/', async (req, res) => {
  try {
    const { student_id, course_id, semester, academic_year } = req.query;
    
    console.log('📊 Fetching results with filters:', { student_id, course_id, semester, academic_year });
    
    let query = supabase
      .from('results')
      .select(`
        *,
        users:student_id (first_name, last_name, email),
        courses (course_name, course_code, credits)
      `);
    
    if (student_id) query = query.eq('student_id', student_id);
    if (course_id) query = query.eq('course_id', course_id);
    if (semester) query = query.eq('semester_type', semester);
    if (academic_year) query = query.eq('academic_year', academic_year);
    
    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Get results error:', error);
    res.status(500).json({ error: 'Failed to fetch results' });
  }
});

// Get result by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from('results')
      .select(`
        *,
        users:student_id (first_name, last_name, email),
        courses (course_name, course_code, credits)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Get result error:', error);
    res.status(500).json({ error: 'Failed to fetch result' });
  }
});

// Get results by student
router.get('/student/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    
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
    res.json(data);
  } catch (error) {
    console.error('Get student results error:', error);
    res.status(500).json({ error: 'Failed to fetch student results' });
  }
});

// Get results by course
router.get('/course/:courseId', async (req, res) => {
  try {
    const { courseId } = req.params;
    const { semester, academic_year } = req.query;
    
    let query = supabase
      .from('results')
      .select(`
        *,
        users:student_id (first_name, last_name, email)
      `)
      .eq('course_id', courseId);
    
    if (semester) query = query.eq('semester_type', semester);
    if (academic_year) query = query.eq('academic_year', academic_year);
    
    const { data, error } = await query;

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Get course results error:', error);
    res.status(500).json({ error: 'Failed to fetch course results' });
  }
});

// Add single result
router.post('/', async (req, res) => {
  try {
    const resultData = req.body;
    
    // Calculate grade based on marks
    const percentage = (resultData.marks_obtained / resultData.total_marks) * 100;
    let grade = 'F';
    let gradePoint = 0;

    if (percentage >= 90) { grade = 'A+'; gradePoint = 10; }
    else if (percentage >= 80) { grade = 'A'; gradePoint = 9; }
    else if (percentage >= 70) { grade = 'B+'; gradePoint = 8; }
    else if (percentage >= 60) { grade = 'B'; gradePoint = 7; }
    else if (percentage >= 50) { grade = 'C+'; gradePoint = 6; }
    else if (percentage >= 40) { grade = 'C'; gradePoint = 5; }

    const { data, error } = await supabase
      .from('results')
      .insert([{
        ...resultData,
        grade,
        grade_point: gradePoint,
        declared_at: new Date()
      }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    console.error('Add result error:', error);
    res.status(500).json({ error: 'Failed to add result' });
  }
});

// Add bulk results
router.post('/bulk', async (req, res) => {
  try {
    const { results } = req.body;
    
    if (!results || !Array.isArray(results) || results.length === 0) {
      return res.status(400).json({ error: 'Invalid results list' });
    }

    // Process each result with grade calculation
    const processedResults = results.map(result => {
      const percentage = (result.marks_obtained / result.total_marks) * 100;
      let grade = 'F';
      let gradePoint = 0;

      if (percentage >= 90) { grade = 'A+'; gradePoint = 10; }
      else if (percentage >= 80) { grade = 'A'; gradePoint = 9; }
      else if (percentage >= 70) { grade = 'B+'; gradePoint = 8; }
      else if (percentage >= 60) { grade = 'B'; gradePoint = 7; }
      else if (percentage >= 50) { grade = 'C+'; gradePoint = 6; }
      else if (percentage >= 40) { grade = 'C'; gradePoint = 5; }

      return {
        ...result,
        grade,
        grade_point: gradePoint,
        declared_at: new Date()
      };
    });

    const { data, error } = await supabase
      .from('results')
      .insert(processedResults)
      .select();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    console.error('Bulk results error:', error);
    res.status(500).json({ error: 'Failed to add bulk results' });
  }
});

// Update result
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const { data, error } = await supabase
      .from('results')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Update result error:', error);
    res.status(500).json({ error: 'Failed to update result' });
  }
});

// Delete result
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { error } = await supabase
      .from('results')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ message: 'Result deleted successfully' });
  } catch (error) {
    console.error('Delete result error:', error);
    res.status(500).json({ error: 'Failed to delete result' });
  }
});

// Publish results (mark as approved)
router.post('/publish', async (req, res) => {
  try {
    const { course_id, semester, academic_year } = req.body;
    
    const { error } = await supabase
      .from('results')
      .update({ is_approved: true })
      .eq('course_id', course_id)
      .eq('semester_type', semester)
      .eq('academic_year', academic_year);

    if (error) throw error;
    res.json({ message: 'Results published successfully' });
  } catch (error) {
    console.error('Publish results error:', error);
    res.status(500).json({ error: 'Failed to publish results' });
  }
});

module.exports = router;