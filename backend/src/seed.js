const { supabase } = require('./config/supabase');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function seedDatabase() {
  console.log('🌱 Seeding database...');

  try {
    // Create admin user
    const { data: admin, error: adminError } = await supabase
      .from('users')
      .insert([{
        email: 'admin@campus.com',
        password_hash: 'admin123', // In real app, hash this
        first_name: 'Admin',
        last_name: 'User',
        role: 'admin',
        department: 'Administration',
        is_active: true
      }])
      .select()
      .single();

    if (adminError) throw adminError;
    console.log('✅ Admin created');

    // Create faculty
    const { data: faculty1, error: facultyError } = await supabase
      .from('users')
      .insert([{
        email: 'dr.patil@campus.com',
        password_hash: 'faculty123',
        first_name: 'Dr.',
        last_name: 'Patil',
        role: 'faculty',
        department: 'Computer Engineering',
        is_active: true
      }])
      .select()
      .single();

    if (facultyError) throw facultyError;
    console.log('✅ Faculty created');

    // Add faculty details
    await supabase
      .from('faculty_details')
      .insert([{
        user_id: faculty1.id,
        employee_id: 'FAC2024001',
        qualification: 'Ph.D. Computer Science',
        specialization: 'Data Structures, Algorithms',
        joining_date: '2024-01-15',
        experience_years: 8
      }]);

    // Create students
    const students = [
      {
        email: 'rahul.sharma@campus.edu',
        first_name: 'Rahul',
        last_name: 'Sharma',
        department: 'Computer Engineering',
        enrollment: 'CP2024001',
        semester: 3
      },
      {
        email: 'priya.patel@campus.edu',
        first_name: 'Priya',
        last_name: 'Patel',
        department: 'Computer Engineering',
        enrollment: 'CP2024002',
        semester: 3
      },
      {
        email: 'amit.kumar@campus.edu',
        first_name: 'Amit',
        last_name: 'Kumar',
        department: 'Information Technology',
        enrollment: 'IT2024003',
        semester: 3
      }
    ];

    for (const s of students) {
      const { data: user, error } = await supabase
        .from('users')
        .insert([{
          email: s.email,
          password_hash: 'student123',
          first_name: s.first_name,
          last_name: s.last_name,
          role: 'student',
          department: s.department,
          is_active: true
        }])
        .select()
        .single();

      if (error) throw error;

      await supabase
        .from('student_details')
        .insert([{
          user_id: user.id,
          enrollment_number: s.enrollment,
          current_semester: s.semester,
          batch_year: 2024,
          admission_date: '2024-07-01'
        }]);
    }
    console.log('✅ Students created');

    // Create courses
    const courses = [
      {
        course_code: 'CP301',
        course_name: 'Data Structures',
        department: 'Computer Engineering',
        semester: 3,
        credits: 4
      },
      {
        course_code: 'CP302',
        course_name: 'Algorithms',
        department: 'Computer Engineering',
        semester: 3,
        credits: 4
      },
      {
        course_code: 'IT401',
        course_name: 'Network Security',
        department: 'Information Technology',
        semester: 5,
        credits: 3
      }
    ];

    for (const c of courses) {
      await supabase
        .from('courses')
        .insert([c]);
    }
    console.log('✅ Courses created');

    console.log('🎉 Database seeded successfully!');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
  }
}

seedDatabase();