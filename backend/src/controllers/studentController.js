const db = require('../services/db.service');

const getStudents = async (req, res) => {
  try {
    const students = await db.getStudents();
    res.json(students);
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
};

const getStudentById = async (req, res) => {
  try {
    const { id } = req.params;
    const student = await db.getStudentById(id);
    
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    res.json(student);
  } catch (error) {
    console.error('Get student error:', error);
    res.status(500).json({ error: 'Failed to fetch student' });
  }
};

const createStudent = async (req, res) => {
  try {
    const studentData = req.body;
    
    // Validate required fields
    if (!studentData.email || !studentData.first_name || !studentData.last_name) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if email already exists
    const existingUser = await db.getUserByEmail(studentData.email);
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // Prepare user data
    const userData = {
      email: studentData.email,
      password_hash: 'temporary_password', // In real app, hash this
      first_name: studentData.first_name,
      last_name: studentData.last_name,
      role: 'student',
      department: studentData.department,
      phone: studentData.phone,
      address: studentData.address,
      date_of_birth: studentData.date_of_birth,
      gender: studentData.gender,
      is_active: true
    };

    // Prepare student details
    const detailsData = {
      enrollment_number: studentData.enrollment_number,
      current_semester: studentData.current_semester,
      batch_year: studentData.batch_year,
      guardian_name: studentData.guardian_name,
      guardian_phone: studentData.guardian_phone,
      guardian_email: studentData.guardian_email,
      admission_date: studentData.admission_date || new Date()
    };

    const student = await db.createStudent(userData, detailsData);
    res.status(201).json(student);
  } catch (error) {
    console.error('Create student error:', error);
    res.status(500).json({ error: 'Failed to create student' });
  }
};

const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const student = await db.getStudentById(id);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
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
    console.error('Update student error:', error);
    res.status(500).json({ error: 'Failed to update student' });
  }
};

const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;
    
    const student = await db.getStudentById(id);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    await db.deleteUser(id);
    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    console.error('Delete student error:', error);
    res.status(500).json({ error: 'Failed to delete student' });
  }
};

module.exports = {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent
};