import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { supabase } from '../config/supabase';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Check for existing session on mount
  useEffect(() => {
    const loadUser = () => {
      try {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        
        console.log('🔍 Auth Check - Token:', token ? 'exists' : 'none');
        console.log('🔍 Auth Check - Stored User:', storedUser);
        
        if (token && storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          console.log('✅ User restored:', parsedUser);
        } else {
          console.log('ℹ️ No stored user found');
        }
      } catch (error) {
        console.error('❌ Error loading user:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (email, password) => {
    try {
      setLoading(true);
      console.log('📝 Login attempt for:', email);
      
      // Query users table directly from Supabase
      const { data: users, error: queryError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .eq('is_active', true)
        .single();

      if (queryError || !users) {
        console.error('❌ User not found:', queryError);
        toast.error('Invalid email or password');
        setLoading(false);
        return { success: false };
      }

      // Simple password validation
      // For demo: admin123, faculty123, student123
      const validPasswords = {
        'admin': 'admin123',
        'faculty': 'faculty123',
        'student': 'student123'
      };

      if (password !== validPasswords[users.role]) {
        console.error('❌ Invalid password');
        toast.error('Invalid email or password');
        setLoading(false);
        return { success: false };
      }

      console.log('✅ User authenticated:', users);
      
      // Check if password reset is required
      if (users.password_reset_required) {
        console.log('🔒 Password reset required for user');
        
        // Store user data temporarily
        const userData = {
          id: users.id,
          email: users.email,
          firstName: users.first_name,
          lastName: users.last_name,
          role: users.role,
          department: users.department
        };
        
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', 'supabase-session');
        setUser(userData);
        
        toast.info('Please change your password to continue');
        navigate('/change-password', { replace: true });
        setLoading(false);
        return { success: true, passwordResetRequired: true };
      }
      
      // Store user data
      const userData = {
        id: users.id,
        email: users.email,
        firstName: users.first_name,
        lastName: users.last_name,
        role: users.role,
        department: users.department
      };
      
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', 'supabase-session'); // Placeholder token
      
      // Update state
      setUser(userData);
      
      toast.success('Login successful!');
      console.log('✅ Login successful');
      
      // Navigate based on role
      if (userData.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else if (userData.role === 'faculty') {
        navigate('/faculty/dashboard', { replace: true });
      } else {
        navigate('/student/dashboard', { replace: true });
      }
      
      setLoading(false);
      return { success: true };
    } catch (error) {
      console.error('❌ Login error:', error);
      toast.error('Login failed. Please try again.');
      setLoading(false);
      return { success: false };
    }
  };
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login', { replace: true });
    toast.success('Logged out successfully');
  };

  const value = {
    user,
    login,
    logout,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isFaculty: user?.role === 'faculty',
    isStudent: user?.role === 'student'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};