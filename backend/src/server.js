const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');
const facultyRoutes = require('./routes/facultyRoutes');
const courseRoutes = require('./routes/courseRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const resultRoutes = require('./routes/resultRoutes');
const feeRoutes = require('./routes/feeRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3001', 'http://localhost:4173'],
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/faculty', facultyRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/results', resultRoutes);
app.use('/api/fees', feeRoutes);
app.use('/api/notifications', notificationRoutes);

// Dashboard stats endpoint
app.get('/api/dashboard/stats', require('./middleware/auth').authenticate, async (req, res) => {
  try {
    const { supabase } = require('./config/supabase');

    const [studentsRes, facultyRes, coursesRes, feesRes, attendanceRes] = await Promise.all([
      supabase.from('users').select('id', { count: 'exact', head: true }).eq('role', 'student').eq('is_active', true),
      supabase.from('users').select('id', { count: 'exact', head: true }).eq('role', 'faculty').eq('is_active', true),
      supabase.from('courses').select('id', { count: 'exact', head: true }).eq('is_active', true),
      supabase.from('fees').select('amount').in('status', ['pending', 'overdue']),
      supabase.from('attendance').select('status').eq('date', new Date().toISOString().split('T')[0])
    ]);

    const pendingFees = (feesRes.data || []).reduce((sum, f) => sum + (f.amount || 0), 0);
    const presentToday = (attendanceRes.data || []).filter(a => a.status === 'present').length;

    res.json({
      totalStudents: studentsRes.count || 0,
      totalFaculty: facultyRes.count || 0,
      totalCourses: coursesRes.count || 0,
      pendingFees,
      presentToday,
      totalRevenue: 0
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'CampusERP Backend is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.stack);
  res.status(500).json({ error: 'Something went wrong!', message: err.message });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`✅ CampusERP Backend running on http://localhost:${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
});

process.on('unhandledRejection', (err) => {
  console.log('❌ Unhandled Rejection:', err.message);
});
