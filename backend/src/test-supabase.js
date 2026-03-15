const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function testConnection() {
  console.log('🔍 Testing Supabase Connection...');
  console.log('URL:', process.env.SUPABASE_URL);
  
  try {
    // Try a simple query to check connection
    const { data, error } = await supabase
      .from('users')
      .select('count', { count: 'exact', head: true });
    
    if (error) {
      console.log('❌ Connection failed:', error.message);
      console.log('📝 Make sure your tables are created in Supabase');
    } else {
      console.log('✅ Successfully connected to Supabase!');
      console.log('📊 Database is ready');
    }
  } catch (err) {
    console.log('❌ Error:', err.message);
    console.log('💡 Check if your SUPABASE_URL and SUPABASE_ANON_KEY are correct in .env file');
  }
}

testConnection();