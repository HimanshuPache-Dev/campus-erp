import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import toast from 'react-hot-toast';

// ⚡ ONE HOOK TO RULE THEM ALL - This replaces ALL static data in your entire app!
export const useDatabaseData = () => {
  const [data, setData] = useState({
    // Core data
    students: [],
    faculty: [],
    courses: [],
    attendance: [],
    results: [],
    fees: [],
    
    // Dashboard stats
    stats: {
      totalStudents: 0,
      totalFaculty: 0,
      totalCourses: 0,
      presentToday: 0,
      pendingFees: 0,
      totalRevenue: 0
    },
    
    // Auto-generated alerts
    alerts: [],
    
    // UI states
    loading: true,
    error: null,
    lastUpdated: null
  });

  // Fetch ALL data from database
  const fetchAllData = async () => {
    try {
      console.log('📡 Fetching all data from Supabase...');
      
      // Fetch everything in PARALLEL (super fast!)
      const [
        studentsRes,
        facultyRes,
        coursesRes,
        attendanceRes,
        resultsRes,
        feesRes
      ] = await Promise.all([
        // Students with their details
        supabase
          .from('users')
          .select(`
            *,
            student_details (
              enrollment_number,
              current_semester,
              batch_year,
              guardian_name,
              guardian_phone
            )
          `)
          .eq('role', 'student')
          .order('created_at', { ascending: false }),
        
        // Faculty with their details
        supabase
          .from('users')
          .select(`
            *,
            faculty_details (*)
          `)
          .eq('role', 'faculty'),
        
        // All courses
        supabase
          .from('courses')
          .select('*'),
        
        // Today's attendance
        supabase
          .from('attendance')
          .select(`
            *,
            users!student_id (first_name, last_name, email),
            courses (course_name, course_code)
          `)
          .eq('date', new Date().toISOString().split('T')[0]),
        
        // Recent results
        supabase
          .from('results')
          .select(`
            *,
            users!student_id (first_name, last_name),
            courses (course_name, course_code)
          `)
          .order('created_at', { ascending: false })
          .limit(100),
        
        // Pending fees
        supabase
          .from('fees')
          .select(`
            *,
            users!student_id (first_name, last_name, email)
          `)
          .in('status', ['pending', 'overdue'])
      ]);

      // Check for errors
      if (studentsRes.error) throw studentsRes.error;
      if (facultyRes.error) throw facultyRes.error;
      if (coursesRes.error) throw coursesRes.error;
      if (attendanceRes.error) throw attendanceRes.error;
      if (resultsRes.error) throw resultsRes.error;
      if (feesRes.error) throw feesRes.error;

      // Calculate real-time stats
      const totalStudents = studentsRes.data?.length || 0;
      const totalFaculty = facultyRes.data?.length || 0;
      const totalCourses = coursesRes.data?.length || 0;
      const presentToday = attendanceRes.data?.filter(a => a.status === 'present').length || 0;
      const pendingFees = feesRes.data?.reduce((sum, f) => sum + (f.amount || 0), 0) || 0;
      
      // Calculate revenue (paid fees)
      const { data: paidFees } = await supabase
        .from('fees')
        .select('amount')
        .eq('status', 'paid');
      const totalRevenue = paidFees?.reduce((sum, f) => sum + (f.amount || 0), 0) || 0;

      // Generate alerts from real data
      const alerts = generateAlerts(
        attendanceRes.data || [],
        feesRes.data || [],
        coursesRes.data || [],
        studentsRes.data || []
      );

      // Update state with ALL data
      setData({
        students: studentsRes.data || [],
        faculty: facultyRes.data || [],
        courses: coursesRes.data || [],
        attendance: attendanceRes.data || [],
        results: resultsRes.data || [],
        fees: feesRes.data || [],
        stats: {
          totalStudents,
          totalFaculty,
          totalCourses,
          presentToday,
          pendingFees,
          totalRevenue
        },
        alerts,
        loading: false,
        error: null,
        lastUpdated: new Date().toISOString()
      });

      console.log('✅ All data fetched successfully!');

    } catch (error) {
      console.error('❌ Error fetching data:', error);
      setData(prev => ({
        ...prev,
        loading: false,
        error: error.message
      }));
      toast.error('Failed to load data from database');
    }
  };

  // Auto-generate alerts - NO STATIC DATA!
  const generateAlerts = (attendance, fees, courses, students) => {
    const alerts = [];

    // 1. Low attendance alerts
    const studentAttendance = {};
    attendance.forEach(record => {
      if (!studentAttendance[record.student_id]) {
        studentAttendance[record.student_id] = { total: 0, present: 0 };
      }
      studentAttendance[record.student_id].total++;
      if (record.status === 'present') {
        studentAttendance[record.student_id].present++;
      }
    });

    const lowAttendanceCount = Object.values(studentAttendance).filter(
      d => (d.present / d.total) * 100 < 75
    ).length;

    if (lowAttendanceCount > 0) {
      alerts.push({
        id: `attendance-${Date.now()}`,
        title: '⚠️ Low Attendance Alert',
        message: `${lowAttendanceCount} students have attendance below 75%`,
        type: 'attendance',
        priority: 'high',
        count: lowAttendanceCount,
        actionable: true,
        timestamp: new Date().toISOString()
      });
    }

    // 2. Fee payment alerts
    if (fees.length > 0) {
      alerts.push({
        id: `fee-${Date.now()}`,
        title: '💰 Fee Payment Due',
        message: `${fees.length} students have pending fees. Total: ₹${fees.reduce((sum, f) => sum + f.amount, 0).toLocaleString()}`,
        type: 'fee',
        priority: 'high',
        count: fees.length,
        actionable: true,
        timestamp: new Date().toISOString()
      });
    }

    // 3. Unassigned courses alerts
    const unassignedCourses = courses.filter(c => !c.faculty_id).length;
    if (unassignedCourses > 0) {
      alerts.push({
        id: `course-${Date.now()}`,
        title: '📚 Unassigned Courses',
        message: `${unassignedCourses} courses have no faculty assigned`,
        type: 'course',
        priority: 'medium',
        count: unassignedCourses,
        actionable: true,
        timestamp: new Date().toISOString()
      });
    }

    // 4. New enrollments alert (last 7 days)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const newEnrollments = students.filter(s => 
      new Date(s.created_at) > weekAgo
    ).length;

    if (newEnrollments > 0) {
      alerts.push({
        id: `enrollment-${Date.now()}`,
        title: '🎓 New Enrollments',
        message: `${newEnrollments} new students enrolled in the last 7 days`,
        type: 'enrollment',
        priority: 'low',
        count: newEnrollments,
        actionable: false,
        timestamp: new Date().toISOString()
      });
    }

    return alerts;
  };

  // Refresh data manually
  const refreshData = () => {
    setData(prev => ({ ...prev, loading: true }));
    fetchAllData();
  };

  // Initial fetch
  useEffect(() => {
    fetchAllData();
  }, []);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      fetchAllData();
    }, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  return {
    ...data,
    refreshData
  };
};