const { supabase } = require('./src/config/supabase');

async function testStudents() {
  console.log('🔍 Testing students API...');
  
  const { data, error } = await supabase
    .from('users')
    .select(`
      *,
      student_details (*)
    `)
    .eq('role', 'student');

  if (error) {
    console.log('❌ Error:', error);
  } else {
    console.log('✅ Students found:', data.length);
    console.log('📊 Student data:', JSON.stringify(data, null, 2));
  }
}

testStudents();