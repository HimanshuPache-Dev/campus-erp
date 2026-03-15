import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../config/supabase';
import toast from 'react-hot-toast';

export const useDatabaseData = () => {
  const [data, setData] = useState({
    students: [],
    faculty: [],
    courses: [],
    attendance: [],
    fees: [],
    stats: {
      totalStudents: 0,
      totalFaculty: 0,
      totalCourses: 0,
      presentToday: 0,
      pendingFees: 0,
      totalRevenue: 0
    },
    alerts: [],
    loading: true,
    error: null,
    lastUpdated: null
  });

  const fetchAllData = useCallback(async () => {
    try {
      setData(prev => ({ ...prev, loading: true, error: null }));

      // Fetch data from Supabase
      const [studentsRes, facultyRes, coursesRes, feesRes] = await Promise.all([
        supabase.from('users').select('*, student_details(*)').eq('role', 'student').limit(100),
        supabase.from('users').select('*, faculty_details(*)').eq('role', 'faculty').limit(100),
        supabase.from('courses').select('*').eq('is_active', true).limit(100),
        supabase.from('fees').select('*').eq('payment_status', 'pending')
      ]);

      const students = studentsRes.data || [];
      const faculty = facultyRes.data || [];
      const courses = coursesRes.data || [];
      const pendingFees = feesRes.data || [];

      // Calculate stats
      const totalPendingAmount = pendingFees.reduce((sum, fee) => sum + (fee.amount - (fee.amount_paid || 0)), 0);

      const stats = {
        totalStudents: students.length,
        totalFaculty: faculty.length,
        totalCourses: courses.length,
        pendingFees: totalPendingAmount,
        presentToday: 0, // Can be calculated from attendance table
        totalRevenue: 0 // Can be calculated from fees table
      };

      // Auto-generate alerts from data
      const alerts = [];
      if (stats.pendingFees > 0) {
        alerts.push({
          id: 'fees',
          title: 'Pending Fees',
          message: `₹${stats.pendingFees.toLocaleString()} in pending fees`,
          type: 'warning'
        });
      }

      setData({
        students,
        faculty,
        courses,
        attendance: [],
        fees: pendingFees,
        stats,
        alerts,
        loading: false,
        error: null,
        lastUpdated: new Date()
      });
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setData(prev => ({
        ...prev,
        loading: false,
        error: error.message
      }));
      // Only show toast if it's not an auth error
      if (!error.message?.includes('Authentication')) {
        toast.error('Failed to load data');
      }
    }
  }, []);

  useEffect(() => {
    fetchAllData();
    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchAllData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchAllData]);

  return { ...data, refreshData: fetchAllData };
};
