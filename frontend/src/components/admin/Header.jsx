import React, { useState, useRef, useEffect } from 'react';
import { Menu, Sun, Moon, Bell, Search, ChevronDown, LogOut, User, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useSemester } from '../../context/SemesterContext';
import { supabase } from '../../config/supabase';

const Header = ({ setSidebarOpen, darkMode, setDarkMode }) => {
  const { user, logout } = useAuth();
  const { semester, academicYear } = useSemester();
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [notifs, setNotifs] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const profileRef = useRef(null);
  const notifRef = useRef(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user?.id)
          .eq('is_read', false)
          .order('created_at', { ascending: false })
          .limit(5);
        
        if (!error && data) {
          setNotifs(data);
          setUnreadCount(data.length);
        }
      } catch (err) {
        console.error('Error fetching notifications:', err);
      }
    };

    if (user?.id) {
      fetchNotifications();
    }
  }, [user]);

  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifs(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const markRead = async (id) => {
    try {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id);
      
      setNotifs(n => n.filter(x => x.id !== id));
      setUnreadCount(c => Math.max(0, c - 1));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const dm = darkMode;

  return (
    <header className={`sticky top-0 z-40 h-16 flex items-center justify-between px-4 sm:px-6 border-b transition-all duration-300 ${dm ? 'bg-gray-950/90 border-white/5 backdrop-blur-xl' : 'bg-white/90 border-gray-100 backdrop-blur-xl'} shadow-sm`}>
      <div className="flex items-center space-x-3">
        <button onClick={() => setSidebarOpen(true)} className={`lg:hidden p-2 rounded-xl transition-colors ${dm ? 'text-gray-400 hover:text-white hover:bg-white/10' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}`}>
          <Menu className="h-5 w-5" />
        </button>
        <div className={`hidden lg:flex items-center space-x-2 px-3 py-2 rounded-xl border transition-all ${dm ? 'bg-white/5 border-white/10 text-gray-300' : 'bg-gray-50 border-gray-200 text-gray-500'}`}>
          <Search className="h-4 w-4 flex-shrink-0" />
          <input type="text" placeholder="Search students, faculty, courses..." className="bg-transparent text-sm outline-none w-64 placeholder-current" />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <span className={`hidden sm:inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${semester === 'Winter' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'}`}>
          {semester} {academicYear}
        </span>

        <button onClick={() => setDarkMode(!dm)} className={`p-2 rounded-xl transition-colors ${dm ? 'text-yellow-400 hover:bg-white/10' : 'text-gray-500 hover:bg-gray-100'}`}>
          {dm ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>

        <div ref={notifRef} className="relative">
          <button onClick={() => setShowNotifs(!showNotifs)} className={`relative p-2 rounded-xl transition-colors ${dm ? 'text-gray-400 hover:text-white hover:bg-white/10' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}`}>
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
          <AnimatePresence>
            {showNotifs && (
              <motion.div initial={{ opacity: 0, y: 8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.95 }} transition={{ duration: 0.15 }}
                className={`absolute right-0 mt-2 w-80 rounded-2xl shadow-xl border overflow-hidden z-50 ${dm ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-100'}`}>
                <div className={`px-4 py-3 border-b ${dm ? 'border-gray-700' : 'border-gray-100'}`}>
                  <p className={`font-semibold text-sm ${dm ? 'text-white' : 'text-gray-900'}`}>Notifications</p>
                </div>
                {notifs.length === 0 ? (
                  <div className="px-4 py-6 text-center">
                    <Bell className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-400">All caught up!</p>
                  </div>
                ) : notifs.map(n => (
                  <div key={n.id} onClick={() => markRead(n.id)}
                    className={`px-4 py-3 border-b last:border-0 flex items-start space-x-3 hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer transition-colors ${dm ? 'border-gray-800' : 'border-gray-50'}`}>
                    <div className="w-2 h-2 rounded-full bg-admin-500 mt-1.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${dm ? 'text-white' : 'text-gray-900'}`}>{n.title}</p>
                      <p className={`text-xs truncate ${dm ? 'text-gray-400' : 'text-gray-500'}`}>{n.message}</p>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div ref={profileRef} className="relative">
          <button onClick={() => setShowProfile(!showProfile)} className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl transition-colors ${dm ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}>
            <div className="w-8 h-8 bg-gradient-to-br from-admin-500 to-violet-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'A'}
            </div>
            <div className="hidden md:block text-left">
              <p className={`text-sm font-semibold leading-none ${dm ? 'text-white' : 'text-gray-900'}`}>{user?.name?.split(' ')[0] || 'Admin'}</p>
              <p className={`text-xs mt-0.5 ${dm ? 'text-gray-400' : 'text-gray-500'}`}>Administrator</p>
            </div>
            <ChevronDown className={`h-4 w-4 hidden md:block transition-transform ${showProfile ? 'rotate-180' : ''} ${dm ? 'text-gray-400' : 'text-gray-400'}`} />
          </button>
          <AnimatePresence>
            {showProfile && (
              <motion.div initial={{ opacity: 0, y: 8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.95 }} transition={{ duration: 0.15 }}
                className={`absolute right-0 mt-2 w-52 rounded-2xl shadow-xl border overflow-hidden z-50 ${dm ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-100'}`}>
                <div className={`px-4 py-3 border-b ${dm ? 'border-gray-700' : 'border-gray-100'}`}>
                  <p className={`font-semibold text-sm ${dm ? 'text-white' : 'text-gray-900'}`}>{user?.name || 'Admin'}</p>
                  <p className={`text-xs ${dm ? 'text-gray-400' : 'text-gray-500'}`}>{user?.email}</p>
                </div>
                <div className="p-1">
                  <button className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-sm transition-colors ${dm ? 'text-gray-300 hover:bg-white/10' : 'text-gray-700 hover:bg-gray-50'}`}>
                    <User className="h-4 w-4" /><span>Profile</span>
                  </button>
                  <button className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-sm transition-colors ${dm ? 'text-gray-300 hover:bg-white/10' : 'text-gray-700 hover:bg-gray-50'}`}>
                    <Settings className="h-4 w-4" /><span>Settings</span>
                  </button>
                  <button onClick={logout} className="w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                    <LogOut className="h-4 w-4" /><span>Logout</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};

export default Header;
