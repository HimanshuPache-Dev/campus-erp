import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

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
    
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
    const response = await fetch(`${apiUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    console.log('📥 Login response:', data);

    if (!response.ok) {
      toast.error(data.error || 'Login failed');
      setLoading(false);
      return { success: false };
    }
    
    // Store token and user
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    
    // Update state
    setUser(data.user);
    
    toast.success('Login successful!');
    console.log('✅ Login successful, token stored:', data.token.substring(0, 20) + '...');
    
    // Navigate based on role
    if (data.user.role === 'admin') {
      navigate('/admin/dashboard', { replace: true });
    } else if (data.user.role === 'faculty') {
      navigate('/faculty/dashboard', { replace: true });
    } else {
      navigate('/student/dashboard', { replace: true });
    }
    
    setLoading(false);
    return { success: true };
  } catch (error) {
    console.error('❌ Login error:', error);
    toast.error('Failed to connect to server');
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