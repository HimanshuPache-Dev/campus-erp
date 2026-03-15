const { supabaseAdmin } = require('./config/supabase');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const db = supabaseAdmin; // Use service role to bypass RLS

async function upsertUser(userData) {
  const { data: existing } = await db.from('users').select('id').eq('email', userData.email).maybeSingle();
  if (existing) return existing;
  const { data, error } = await db.from('users').insert([userData]).select().single();
  if (error) throw error;
  return data;
}

async function seedDatabase() {
  console.log('🌱 Seeding CampusERP database...\n');

  try {
    // ==================== ADMIN ====================
    console.log('👤 Creating admin...');
    const adminHash = await bcrypt.hash('admin123', 10);
    await upsertUser({ email: 'admin@campus.com', password_hash: adminHash, first_name: 'Admin', last_name: 'User', role: 'admin', department: 'Administration', is_active: true });
    console.log('  ✅ Admin: admin@campus.com / admin123');

    // ==================== FACULTY ====================
    console.log('\n👨‍🏫 Creating faculty...');
    const facultyHash = await bcrypt.hash('faculty123', 10);
    const facultyList = [
      { email: 'dr.patil@campus.com', first_name: 'Dr. Rajesh', last_name: 'Patil', department: 'Computer Engineering', employee_id: 'FAC2024001', qualification: 'Ph.D. Computer Science', specialization: 'Data Structures, Algorithms', exp: 8 },
      { email: 'prof.kulkarni@campus.com', first_name: 'Prof. Sunita', last_name: 'Kulkarni', department: 'Electronics', employee_id: 'FAC2024002', qualification: 'M.Tech Electronics', specialization: 'Digital Electronics, VLSI', exp: 5 },
      { email: 'dr.deshmukh@campus.com', first_name: 'Dr. Anil', last_name: 'Deshmukh', department: 'Mechanical', employee_id: 'FAC2024003', qualification: 'Ph.D. Mechanical Engineering', specialization: 'Thermodynamics', exp: 12 },
      { email: 'prof.joshi@campus.com', first_name: 'Prof. Meera', last_name: 'Joshi', department: 'Information Technology', employee_id: 'FAC2024004', qualification: 'M.Tech IT', specialization: 'Web Development, Databases', exp: 6 },
    ];
    const createdFaculty = [];
    for (const f of facultyList) {
      const fUser = await upsertUser({ email: f.email, password_hash: facultyHash, first_name: f.first_name, last_name: f.last_name, role: 'faculty', department: f.department, is_active: true });
      const { data: existDet } = await db.from('faculty_details').select('id').eq('employee_id', f.employee_id).maybeSingle();
      if (!existDet) {
        await db.from('faculty_details').insert([{ user_id: fUser.id, employee_id: f.employee_id, qualification: f.qualification, specialization: f.specialization, joining_date: '2024-01-15', experience_years: f.exp }]);
      }
      createdFaculty.push(fUser);
      console.log(`  ✅ ${f.first_name} ${f.last_name}: ${f.email} / faculty123`);
    }

    // ==================== STUDENTS ====================
    console.log('\n🎓 Creating students...');
    const studentHash = await bcrypt.hash('student123', 10);
    const studentList = [
      { email: 'rahul.sharma@campus.edu', first_name: 'Rahul', last_name: 'Sharma', dept: 'Computer Engineering', enroll: 'CP2024001', sem: 3, batch: 2024 },
      { email: 'priya.patel@campus.edu', first_name: 'Priya', last_name: 'Patel', dept: 'Computer Engineering', enroll: 'CP2024002', sem: 3, batch: 2024 },
      { email: 'amit.kumar@campus.edu', first_name: 'Amit', last_name: 'Kumar', dept: 'Information Technology', enroll: 'IT2024003', sem: 3, batch: 2024 },
      { email: 'neha.singh@campus.edu', first_name: 'Neha', last_name: 'Singh', dept: 'Information Technology', enroll: 'IT2024004', sem: 3, batch: 2024 },
      { email: 'vikram.mehta@campus.edu', first_name: 'Vikram', last_name: 'Mehta', dept: 'Electronics', enroll: 'EC2023005', sem: 5, batch: 2023 },
      { email: 'pooja.desai@campus.edu', first_name: 'Pooja', last_name: 'Desai', dept: 'Electronics', enroll: 'EC2023006', sem: 5, batch: 2023 },
      { email: 'suresh.yadav@campus.edu', first_name: 'Suresh', last_name: 'Yadav', dept: 'Mechanical', enroll: 'ME2023007', sem: 5, batch: 2023 },
      { email: 'anjali.gupta@campus.edu', first_name: 'Anjali', last_name: 'Gupta', dept: 'Mechanical', enroll: 'ME2023008', sem: 5, batch: 2023 },
    ];
    const createdStudents = [];
    for (const s of studentList) {
      const sUser = await upsertUser({ email: s.email, password_hash: studentHash, first_name: s.first_name, last_name: s.last_name, role: 'student', department: s.dept, is_active: true });
      const { data: existDet } = await db.from('student_details').select('id').eq('enrollment_number', s.enroll).maybeSingle();
      if (!existDet) {
        await db.from('student_details').insert([{ user_id: sUser.id, enrollment_number: s.enroll, current_semester: s.sem, batch_year: s.batch, admission_date: `${s.batch}-07-01` }]);
      }
      createdStudents.push(sUser);
      console.log(`  ✅ ${s.first_name} ${s.last_name}: ${s.email} / student123`);
    }

    // ==================== COURSES ====================
    console.log('\n📚 Creating courses...');
    const courseList = [
      { course_code: 'CP301', course_name: 'Data Structures', department: 'Computer Engineering', semester: 3, credits: 4 },
      { course_code: 'CP302', course_name: 'Algorithms', department: 'Computer Engineering', semester: 3, credits: 4 },
      { course_code: 'CP303', course_name: 'Database Management', department: 'Computer Engineering', semester: 3, credits: 3 },
      { course_code: 'IT301', course_name: 'Web Development', department: 'Information Technology', semester: 3, credits: 4 },
      { course_code: 'EC501', course_name: 'Digital Signal Processing', department: 'Electronics', semester: 5, credits: 4 },
      { course_code: 'ME501', course_name: 'Machine Design', department: 'Mechanical', semester: 5, credits: 4 },
      { course_code: 'MA101', course_name: 'Engineering Mathematics I', department: 'Common', semester: 1, credits: 4 },
      { course_code: 'PH101', course_name: 'Applied Physics', department: 'Common', semester: 1, credits: 3 },
    ];
    const createdCourses = [];
    for (const c of courseList) {
      const { data: existing } = await db.from('courses').select('id').eq('course_code', c.course_code).maybeSingle();
      if (existing) { createdCourses.push(existing); console.log(`  ⏭️  ${c.course_code}: already exists`); continue; }
      const { data: course, error: cErr } = await db.from('courses').insert([c]).select().single();
      if (cErr) { console.error(`  ❌ ${c.course_code}: ${cErr.message}`); continue; }
      createdCourses.push(course);
      console.log(`  ✅ ${c.course_code}: ${c.course_name}`);
    }

    // ==================== FEES ====================
    console.log('\n💰 Creating fee records...');
    const feeTypes = [
      { fee_type: 'Tuition Fee', amount: 45000, status: 'paid' },
      { fee_type: 'Development Fee', amount: 8000, status: 'paid' },
      { fee_type: 'Laboratory Fee', amount: 5000, status: 'pending' },
      { fee_type: 'Exam Fee', amount: 2000, status: 'pending' },
    ];
    for (const student of createdStudents.slice(0, 5)) {
      for (const fee of feeTypes) {
        const { data: existFee } = await db.from('fees').select('id').eq('student_id', student.id).eq('fee_type', fee.fee_type).maybeSingle();
        if (!existFee) {
          await db.from('fees').insert([{ student_id: student.id, fee_type: fee.fee_type, amount: fee.amount, due_date: '2026-03-31', status: fee.status, paid_date: fee.status === 'paid' ? '2026-01-15' : null, academic_year: '2025-26', semester_type: 'Winter' }]);
        }
      }
    }
    console.log('  ✅ Fee records created');

    // ==================== NOTIFICATIONS ====================
    console.log('\n🔔 Creating notifications...');
    const { data: existNotif } = await db.from('notifications').select('id').eq('is_global', true).limit(1).maybeSingle();
    if (!existNotif) {
      await db.from('notifications').insert([
        { title: 'Welcome to CampusERP', message: 'Your account has been set up. Explore the dashboard!', type: 'success', is_global: true },
        { title: 'Fee Payment Reminder', message: 'Last date for fee payment is March 31, 2026.', type: 'warning', is_global: true },
        { title: 'Exam Schedule Released', message: 'Mid-term exam schedule has been published.', type: 'info', is_global: true },
      ]);
    }
    console.log('  ✅ Notifications created');

    console.log('\n🎉 Database seeded successfully!\n');
    console.log('📋 Login Credentials:');
    console.log('  Admin:   admin@campus.com / admin123');
    console.log('  Faculty: dr.patil@campus.com / faculty123');
    console.log('  Student: rahul.sharma@campus.edu / student123');

  } catch (error) {
    console.error('\n❌ Seeding failed:', error.message);
    process.exit(1);
  }
}

seedDatabase();
