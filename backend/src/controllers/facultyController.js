const db = require('../services/db.service');
const { supabase } = require('../config/supabase');

const getFaculty = async (req, res) => {
  try {
    const faculty = await db.getFaculty();
    res.json(faculty);
  } catch (error) {
    console.error('Get faculty error:', error);
    res.status(500).json({ error: 'Failed to fetch faculty' });
  }
};

const getFacultyById = async (req, res) => {
  try {
    const { id } = req.params;
    const faculty = await db.getFacultyById(id);
    
    if (!faculty) {
      return res.status(404).json({ error: 'Faculty not found' });
    }
    
    res.json(faculty);
  } catch (error) {
    console.error('Get faculty error:', error);
    res.status(500).json({ error: 'Failed to fetch faculty' });
  }
};

const createFaculty = async (req, res) => {
  try {
    const facultyData = req.body;
    
    // Validate required fields
    if (!facultyData.email || !facultyData.first_name || !facultyData.last_name) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if email already exists
    const existingUser = await db.getUserByEmail(facultyData.email);
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // Prepare user data
    const userData = {
      email: facultyData.email,
      password_hash: 'temporary_password', // In real app, hash this
      first_name: facultyData.first_name,
      last_name: facultyData.last_name,
      role: 'faculty',
      department: facultyData.department,
      phone: facultyData.phone,
      address: facultyData.address,
      date_of_birth: facultyData.date_of_birth,
      gender: facultyData.gender,
      is_active: true
    };

    // Create user first
    const user = await db.createUser(userData);

    // Prepare faculty details
    const detailsData = {
      user_id: user.id,
      employee_id: facultyData.employee_id,
      qualification: facultyData.qualification,
      specialization: facultyData.specialization,
      joining_date: facultyData.joining_date || new Date(),
      experience_years: facultyData.experience_years || 0
    };

    const { data: details, error } = await supabase
      .from('faculty_details')
      .insert([detailsData])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ ...user, faculty_details: details });
  } catch (error) {
    console.error('Create faculty error:', error);
    res.status(500).json({ error: 'Failed to create faculty' });
  }
};

const updateFaculty = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const faculty = await db.getFacultyById(id);
    if (!faculty) {
      return res.status(404).json({ error: 'Faculty not found' });
    }

    // Update user data
    const userUpdates = {
      first_name: updates.first_name,
      last_name: updates.last_name,
      phone: updates.phone,
      address: updates.address,
      department: updates.department
    };

    const updatedUser = await db.updateUser(id, userUpdates);
    res.json(updatedUser);
  } catch (error) {
    console.error('Update faculty error:', error);
    res.status(500).json({ error: 'Failed to update faculty' });
  }
};

const deleteFaculty = async (req, res) => {
  try {
    const { id } = req.params;
    
    const faculty = await db.getFacultyById(id);
    if (!faculty) {
      return res.status(404).json({ error: 'Faculty not found' });
    }

    await db.deleteUser(id);
    res.json({ message: 'Faculty deleted successfully' });
  } catch (error) {
    console.error('Delete faculty error:', error);
    res.status(500).json({ error: 'Failed to delete faculty' });
  }
};

const getFacultyCourses = async (req, res) => {
  try {
    const { id } = req.params;
    const { semester, academicYear } = req.query;
    
    const courses = await db.getFacultyCourses(id, semester, academicYear);
    res.json(courses);
  } catch (error) {
    console.error('Get faculty courses error:', error);
    res.status(500).json({ error: 'Failed to fetch faculty courses' });
  }
};

module.exports = {
  getFaculty,
  getFacultyById,
  createFaculty,
  updateFaculty,
  deleteFaculty,
  getFacultyCourses
};