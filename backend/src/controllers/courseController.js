const db = require('../services/db.service');
const { supabase } = require('../config/supabase');

const getCourses = async (req, res) => {
  try {
    const { department, semester } = req.query;
    let courses = await db.getCourses();
    
    // Apply filters if provided
    if (department) {
      courses = courses.filter(c => c.department === department);
    }
    if (semester) {
      courses = courses.filter(c => c.semester === parseInt(semester));
    }
    
    res.json(courses);
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
};

const getCourseById = async (req, res) => {
  try {
    const { id } = req.params;
    const course = await db.getCourseById(id);
    
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }
    
    // Get assigned faculty
    const { data: assignments } = await supabase
      .from('course_assignments')
      .select(`
        *,
        users:faculty_id (first_name, last_name, email)
      `)
      .eq('course_id', id)
      .eq('is_active', true);
    
    // Get enrolled students
    const { data: enrollments } = await supabase
      .from('student_enrollments')
      .select('count', { count: 'exact', head: true })
      .eq('course_id', id)
      .eq('is_completed', false);
    
    res.json({
      ...course,
      faculty: assignments || [],
      enrolled_students: enrollments?.length || 0
    });
  } catch (error) {
    console.error('Get course error:', error);
    res.status(500).json({ error: 'Failed to fetch course' });
  }
};

const createCourse = async (req, res) => {
  try {
    const courseData = req.body;
    
    // Validate required fields
    if (!courseData.course_code || !courseData.course_name || !courseData.department) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if course code already exists
    const existingCourse = await db.getCourseByCode(courseData.course_code);
    if (existingCourse) {
      return res.status(400).json({ error: 'Course code already exists' });
    }

    const course = await db.createCourse(courseData);
    res.status(201).json(course);
  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({ error: 'Failed to create course' });
  }
};

const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const course = await db.getCourseById(id);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    const updatedCourse = await db.updateCourse(id, updates);
    res.json(updatedCourse);
  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({ error: 'Failed to update course' });
  }
};

const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;
    
    const course = await db.getCourseById(id);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    await db.deleteCourse(id);
    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({ error: 'Failed to delete course' });
  }
};

const assignFaculty = async (req, res) => {
  try {
    const { id } = req.params;
    const { faculty_id, academic_year, semester_type } = req.body;

    const assignment = await db.assignFacultyToCourse({
      course_id: id,
      faculty_id,
      academic_year,
      semester_type,
      is_active: true
    });

    res.status(201).json(assignment);
  } catch (error) {
    console.error('Assign faculty error:', error);
    res.status(500).json({ error: 'Failed to assign faculty' });
  }
};

const getCourseFaculty = async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from('course_assignments')
      .select(`
        *,
        users:faculty_id (first_name, last_name, email, department)
      `)
      .eq('course_id', id)
      .eq('is_active', true);
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Get course faculty error:', error);
    res.status(500).json({ error: 'Failed to fetch course faculty' });
  }
};

module.exports = {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  assignFaculty,
  getCourseFaculty
};