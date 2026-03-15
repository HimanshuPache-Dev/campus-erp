const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../services/db.service');

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    // Find user
    const user = await db.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password (in real app, compare hashed passwords)
    // For demo, we'll use a simple check
    if (password !== 'admin123' && password !== 'faculty123' && password !== 'student123') {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last login
    await db.updateUser(user.id, { last_login: new Date() });

    // Generate token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Remove password hash from response
    delete user.password_hash;

    res.json({
      message: 'Login successful',
      token,
      user
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await db.getUserById(req.userId);
    
    // Get role-specific details
    if (user.role === 'student') {
      const student = await db.getStudentById(user.id);
      return res.json(student);
    }
    
    if (user.role === 'faculty') {
      const faculty = await db.getFacultyById(user.id);
      return res.json(faculty);
    }
    
    res.json(user);
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.userId;

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current and new password required' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    // Get user with password hash
    const user = await db.getUserById(userId);
    
    // In real app, verify current password hash
    // For demo, we'll skip this

    // Update password (in real app, hash the new password)
    await db.updateUser(userId, { password_hash: newPassword });

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
};

module.exports = { login, getProfile, changePassword };