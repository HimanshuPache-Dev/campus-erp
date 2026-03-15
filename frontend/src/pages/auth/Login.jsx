import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, LogIn, Shield, Users, GraduationCap, ArrowRight, ArrowLeft, Key, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

// Demo credentials (for development only - remove in production):
// Admin: admin@campus.com / admin123
// Faculty: dr.patil@campus.com / faculty123  
// Student: rahul.sharma@campus.edu / student123

const roles = [
  { id: 'admin', title: 'Administrator', icon: Shield, gradient: 'from-purple-600 via-violet-600 to-purple-700', description: 'Full system access & management' },
  { id: 'faculty', title: 'Faculty', icon: Users, gradient: 'from-blue-600 via-sky-600 to-blue-700', description: 'Manage courses, attendance & grades' },
  { id: 'student', title: 'Student', icon: GraduationCap, gradient: 'from-green-600 via-emerald-600 to-green-700', description: 'View attendance, results & fees' },
];

const roleColors = {
  admin: { ring: 'focus:ring-purple-500', btn: 'from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700' },
  faculty: { ring: 'focus:ring-blue-500', btn: 'from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700' },
  student: { ring: 'focus:ring-green-500', btn: 'from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700' },
};

const Login = () => {
  const [selectedRole, setSelectedRole] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showSecretInput, setShowSecretInput] = useState(false);
  const [secretKey, setSecretKey] = useState('');
  const [registerData, setRegisterData] = useState({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '' });
  const { login } = useAuth();

  const particles = Array.from({ length: 16 }, (_, i) => ({
    width: `${Math.random() * 220 + 40}px`,
    height: `${Math.random() * 220 + 40}px`,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    animationDelay: `${Math.random() * 6}s`,
    animationDuration: `${Math.random() * 8 + 8}s`,
  }));

  const handleRoleSelect = (role) => { setSelectedRole(role); setEmail(''); setPassword(''); setShowSecretInput(false); };
  const handleBack = () => { setSelectedRole(null); setShowRegister(false); setShowSecretInput(false); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) { toast.error('Please fill in all fields'); return; }
    setLoading(true);
    await login(email, password);
    setLoading(false);
  };

  const handleSecretKeySubmit = () => {
    const validSecretKey = import.meta.env.VITE_ADMIN_SECRET_KEY || 'BCPCADMIN99';
    if (secretKey === validSecretKey) { setShowRegister(true); setShowSecretInput(false); toast.success('Secret key verified!'); }
    else toast.error('Invalid secret key');
    setSecretKey('');
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!registerData.firstName || !registerData.lastName || !registerData.email || !registerData.password) { toast.error('Fill all fields'); return; }
    if (registerData.password !== registerData.confirmPassword) { toast.error('Passwords do not match'); return; }
    if (registerData.password.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: registerData.email, password: registerData.password, first_name: registerData.firstName, last_name: registerData.lastName, role: 'admin' }),
      });
      const data = await res.json();
      if (res.ok) { toast.success('Admin registered! You can now login.'); setShowRegister(false); setSelectedRole('admin'); setRegisterData({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '' }); }
      else toast.error(data.error || 'Registration failed');
    } catch { toast.error('Failed to connect to server'); }
    finally { setLoading(false); }
  };

  const fillDemo = () => {
    const r = roles.find(r => r.id === selectedRole);
    if (r) { setEmail(r.demo); setPassword(r.pass); }
  };

  const colors = selectedRole ? roleColors[selectedRole] : null;

  return (
    <div className="min-h-screen flex items-center justify-center animated-bg py-12 px-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((p, i) => (
          <div key={i} className="absolute rounded-full bg-white/5 animate-float" style={p} />
        ))}
      </div>
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse-glow pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-600/15 rounded-full blur-3xl animate-pulse-glow delay-1000 pointer-events-none" />

      <div className="max-w-md w-full relative z-10">
        <motion.div initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur-xl opacity-60 animate-pulse-glow" />
              <div className="relative w-16 h-16 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl flex items-center justify-center shadow-glow-purple">
                <GraduationCap className="h-9 w-9 text-white" />
              </div>
            </div>
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight">CampusERP</h1>
          <p className="text-purple-200/80 mt-2 text-sm font-medium">Intelligent College Management System</p>
        </motion.div>

        <AnimatePresence mode="wait">
          {!selectedRole && !showRegister && (
            <motion.div key="roles" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }} className="space-y-3">
              <p className="text-center text-white/50 text-sm mb-5">Select your role to continue</p>
              {roles.map((role, i) => {
                const Icon = role.icon;
                return (
                  <motion.button key={role.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                    whileHover={{ scale: 1.02, x: 4 }} whileTap={{ scale: 0.98 }}
                    onClick={() => handleRoleSelect(role.id)}
                    className={`w-full group relative overflow-hidden rounded-2xl bg-gradient-to-r ${role.gradient} p-px hover:shadow-lg transition-all duration-300`}>
                    <div className="relative bg-white/10 backdrop-blur-sm rounded-2xl p-5 hover:bg-white/15 transition-all flex items-center space-x-4">
                      <div className="p-3 bg-white/20 rounded-xl group-hover:scale-110 transition-transform flex-shrink-0">
                        <Icon className="h-7 w-7 text-white" />
                      </div>
                      <div className="flex-1 text-left">
                        <h3 className="text-lg font-bold text-white">{role.title}</h3>
                        <p className="text-sm text-white/70">{role.description}</p>
                      </div>
                      <ArrowRight className="h-5 w-5 text-white/50 group-hover:text-white group-hover:translate-x-1 transition-all" />
                    </div>
                  </motion.button>
                );
              })}
            </motion.div>
          )}

          {selectedRole && !showRegister && (
            <motion.div key="login" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}
              className="glass rounded-2xl p-8 shadow-glass-dark">
              <div className="flex items-center justify-between mb-6">
                <button onClick={handleBack} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors">
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <h3 className="text-lg font-bold text-white capitalize">{selectedRole} Login</h3>
                <div className="w-8" />
              </div>

              <button type="button" onClick={fillDemo}
                className="w-full mb-4 py-2 text-xs font-medium text-white/60 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/10">
                Fill demo credentials
              </button>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1.5">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                      className={`w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 ${colors.ring} focus:border-transparent transition-all`}
                      placeholder="Enter your email" required />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1.5">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                    <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                      className={`w-full pl-10 pr-10 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 ${colors.ring} focus:border-transparent transition-all`}
                      placeholder="Enter your password" required />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <motion.button type="submit" disabled={loading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  className={`w-full py-3 px-4 bg-gradient-to-r ${colors.btn} text-white font-semibold rounded-xl transition-all flex items-center justify-center space-x-2 disabled:opacity-60 shadow-lg`}>
                  {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><LogIn className="h-4 w-4" /><span>Sign In</span></>}
                </motion.button>
              </form>

              {selectedRole === 'admin' && (
                <div className="mt-4 text-center">
                  {!showSecretInput ? (
                    <button onClick={() => setShowSecretInput(true)} className="text-xs text-white/40 hover:text-white/70 flex items-center justify-center space-x-1 mx-auto transition-colors">
                      <Key className="h-3 w-3" /><span>Register new admin</span>
                    </button>
                  ) : (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
                      <div className="flex space-x-2">
                        <input type="password" value={secretKey} onChange={e => setSecretKey(e.target.value)} placeholder="Enter secret key"
                          className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-purple-400"
                          onKeyDown={e => e.key === 'Enter' && handleSecretKeySubmit()} />
                        <button onClick={handleSecretKeySubmit} className="px-3 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors">Verify</button>
                      </div>
                      <button onClick={() => setShowSecretInput(false)} className="text-xs text-white/40 hover:text-white/60">Cancel</button>
                    </motion.div>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {showRegister && (
            <motion.div key="register" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}
              className="glass rounded-2xl p-8 shadow-glass-dark">
              <div className="flex items-center justify-between mb-6">
                <button onClick={() => setShowRegister(false)} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors">
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <h3 className="text-lg font-bold text-white">Admin Registration</h3>
                <div className="w-8" />
              </div>
              <form onSubmit={handleRegister} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-white/70 mb-1">First Name</label>
                    <input type="text" value={registerData.firstName} onChange={e => setRegisterData({...registerData, firstName: e.target.value})}
                      className="w-full px-3 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white text-sm placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-400" placeholder="John" required />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-white/70 mb-1">Last Name</label>
                    <input type="text" value={registerData.lastName} onChange={e => setRegisterData({...registerData, lastName: e.target.value})}
                      className="w-full px-3 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white text-sm placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-400" placeholder="Doe" required />
                  </div>
                </div>
                {['email', 'password', 'confirmPassword'].map(field => (
                  <div key={field}>
                    <label className="block text-xs font-medium text-white/70 mb-1 capitalize">{field === 'confirmPassword' ? 'Confirm Password' : field.charAt(0).toUpperCase() + field.slice(1)}</label>
                    <input type={field.includes('assword') ? 'password' : 'email'} value={registerData[field]} onChange={e => setRegisterData({...registerData, [field]: e.target.value})}
                      className="w-full px-3 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white text-sm placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-400"
                      placeholder={field === 'email' ? 'admin@campus.com' : field === 'password' ? 'Min 8 characters' : 'Re-enter password'} required />
                  </div>
                ))}
                <motion.button type="submit" disabled={loading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  className="w-full py-3 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white font-semibold rounded-xl transition-all flex items-center justify-center disabled:opacity-60">
                  {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Create Admin Account'}
                </motion.button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        <p className="text-center text-white/25 text-xs mt-6">© 2025 CampusERP • BCPC College</p>
      </div>
    </div>
  );
};

export default Login;
