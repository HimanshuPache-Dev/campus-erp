import { useState, useEffect, useCallback } from 'react';
import { studentsAPI, facultyAPI, coursesAPI, attendanceAPI, feesAPI, dashboardAPI } from '../services/api';
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

      const [studentsRes, facultyRes, coursesRes, stats] = await Promise.all([
        studentsAPI.getAll().catch(() => ({ students: [] })),
        facultyAPI.getAll().catch(() => ({ faculty: [] })),
        coursesAPI.getAll().catch(() => ({ courses: [] })),
        dashboardAPI.getStats().catch(() => ({
          totalStudents: 0, totalFaculty: 0, totalCourses: 0,
          pendingFees: 0, presentToday: 0, totalRevenue: 0
        }))
      ]);
      const students = studentsRes.students || [];
      const faculty = facultyRes.faculty || [];
      const courses = coursesRes.courses || [];

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
        students: students || [],
        faculty: faculty || [],
        courses: courses || [],
        attendance: [],
        fees: [],
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
      // Only show toast if it's not an auth error (user might not be logged in yet)
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
