const db = require('../services/db.service');
const { supabase } = require('../config/supabase');

const addResult = async (req, res) => {
  try {
    const resultData = req.body;
    
    // Validate required fields
    if (!resultData.student_id || !resultData.course_id || !resultData.marks_obtained) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

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

    const result = await db.addResult({
      ...resultData,
      faculty_id: req.userId,
      grade,
      grade_point: gradePoint,
      declared_at: new Date()
    });

    res.status(201).json(result);
  } catch (error) {
    console.error('Add result error:', error);
    res.status(500).json({ error: 'Failed to add result' });
  }
};

const addBulkResults = async (req, res) => {
  try {
    const { results, course_id, exam_type, semester_type, academic_year } = req.body;
    
    if (!results || !Array.isArray(results) || results.length === 0) {
      return res.status(400).json({ error: 'Invalid results list' });
    }

    // Prepare bulk data with grade calculation
    const bulkData = results.map(item => {
      const percentage = (item.marks_obtained / item.total_marks) * 100;
      let grade = 'F';
      let gradePoint = 0;

      if (percentage >= 90) { grade = 'A+'; gradePoint = 10; }
      else if (percentage >= 80) { grade = 'A'; gradePoint = 9; }
      else if (percentage >= 70) { grade = 'B+'; gradePoint = 8; }
      else if (percentage >= 60) { grade = 'B'; gradePoint = 7; }
      else if (percentage >= 50) { grade = 'C+'; gradePoint = 6; }
      else if (percentage >= 40) { grade = 'C'; gradePoint = 5; }

      return {
        student_id: item.student_id,
        course_id,
        faculty_id: req.userId,
        marks_obtained: item.marks_obtained,
        total_marks: item.total_marks,
        grade,
        grade_point: gradePoint,
        exam_type,
        semester_type,
        academic_year,
        declared_at: new Date()
      };
    });

    const { data, error } = await supabase
      .from('results')
      .insert(bulkData)
      .select();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    console.error('Bulk results error:', error);
    res.status(500).json({ error: 'Failed to add bulk results' });
  }
};

const getStudentResults = async (req, res) => {
  try {
    const { studentId } = req.params;
    
    const results = await db.getResultsByStudent(studentId);
    
    // Calculate SGPA and CGPA
    let totalCredits = 0;
    let totalGradePoints = 0;
    const semesterWise = {};

    results.forEach(result => {
      const sem = `${result.semester_type} ${result.academic_year}`;
      if (!semesterWise[sem]) {
        semesterWise[sem] = {
          results: [],
          totalCredits: 0,
          totalPoints: 0
        };
      }
      
      const credits = result.courses?.credits || 0;
      semesterWise[sem].results.push(result);
      semesterWise[sem].totalCredits += credits;
      semesterWise[sem].totalPoints += (result.grade_point * credits);
      
      totalCredits += credits;
      totalGradePoints += (result.grade_point * credits);
    });

    // Calculate SGPA for each semester
    const semesters = Object.entries(semesterWise).map(([sem, data]) => ({
      semester: sem,
      sgpa: data.totalCredits > 0 ? (data.totalPoints / data.totalCredits).toFixed(2) : 0,
      results: data.results
    }));

    const cgpa = totalCredits > 0 ? (totalGradePoints / totalCredits).toFixed(2) : 0;

    res.json({
      results,
      semesters,
      cgpa
    });
  } catch (error) {
    console.error('Get student results error:', error);
    res.status(500).json({ error: 'Failed to fetch student results' });
  }
};

const getCourseResults = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { semester, academicYear } = req.query;
    
    const results = await db.getResultsByCourse(courseId, semester, academicYear);
    
    // Calculate statistics
    const total = results.length;
    const passed = results.filter(r => r.grade !== 'F').length;
    const failed = results.filter(r => r.grade === 'F').length;
    const passPercentage = total > 0 ? ((passed / total) * 100).toFixed(1) : 0;
    
    const avgMarks = results.reduce((sum, r) => sum + r.marks_obtained, 0) / total || 0;

    res.json({
      results,
      summary: {
        total,
        passed,
        failed,
        passPercentage,
        avgMarks: avgMarks.toFixed(1)
      }
    });
  } catch (error) {
    console.error('Get course results error:', error);
    res.status(500).json({ error: 'Failed to fetch course results' });
  }
};

const publishResults = async (req, res) => {
  try {
    const { courseId, semester, academicYear } = req.body;
    
    // Update results to approved
    const { error } = await supabase
      .from('results')
      .update({ is_approved: true })
      .eq('course_id', courseId)
      .eq('semester_type', semester)
      .eq('academic_year', academicYear);

    if (error) throw error;

    // Create notifications for students
    const { data: results } = await supabase
      .from('results')
      .select('student_id')
      .eq('course_id', courseId)
      .eq('semester_type', semester)
      .eq('academic_year', academicYear);

    const notifications = results.map(r => ({
      user_id: r.student_id,
      title: 'Results Published',
      message: `Results for course have been published`,
      type: 'success',
      is_global: false
    }));

    await supabase.from('notifications').insert(notifications);

    res.json({ message: 'Results published successfully' });
  } catch (error) {
    console.error('Publish results error:', error);
    res.status(500).json({ error: 'Failed to publish results' });
  }
};

module.exports = {
  addResult,
  addBulkResults,
  getStudentResults,
  getCourseResults,
  publishResults
};