const { supabase } = require('./config/supabase');

async function verifyTables() {
  console.log('🔍 Verifying Supabase Tables...\n');

  const tables = [
    'users',
    'student_details',
    'faculty_details',
    'courses',
    'course_assignments',
    'student_enrollments',
    'attendance',
    'results',
    'fees',
    'notifications'
  ];

  for (const table of tables) {
    try {
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.log(`❌ ${table}: ${error.message}`);
      } else {
        console.log(`✅ ${table}: ${count || 0} records`);
      }
    } catch (err) {
      console.log(`❌ ${table}: ${err.message}`);
    }
  }

  console.log('\n✨ Verification complete!');
  process.exit(0);
}

verifyTables();
