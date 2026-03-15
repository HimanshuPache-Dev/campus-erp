const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

const handleResponse = async (res) => {
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
};

export const api = {
  get: (path) => fetch(`${BASE_URL}${path}`, { headers: getHeaders() }).then(handleResponse),
  post: (path, body) => fetch(`${BASE_URL}${path}`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(body) }).then(handleResponse),
  put: (path, body) => fetch(`${BASE_URL}${path}`, { method: 'PUT', headers: getHeaders(), body: JSON.stringify(body) }).then(handleResponse),
  delete: (path) => fetch(`${BASE_URL}${path}`, { method: 'DELETE', headers: getHeaders() }).then(handleResponse),
};

// Auth
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (data) => api.post('/auth/register', data),
  getProfile: () => api.get('/auth/profile'),
  changePassword: (data) => api.post('/auth/change-password', data),
};

// Students
export const studentsAPI = {
  getAll: () => api.get('/students'),
  getById: (id) => api.get(`/students/${id}`),
  create: (data) => api.post('/students', data),
  update: (id, data) => api.put(`/students/${id}`, data),
  delete: (id) => api.delete(`/students/${id}`),
};

// Faculty
export const facultyAPI = {
  getAll: () => api.get('/faculty'),
  getById: (id) => api.get(`/faculty/${id}`),
  create: (data) => api.post('/faculty', data),
  update: (id, data) => api.put(`/faculty/${id}`, data),
  delete: (id) => api.delete(`/faculty/${id}`),
  getCourses: (id) => api.get(`/faculty/${id}/courses`),
};

// Courses
export const coursesAPI = {
  getAll: (params = '') => api.get(`/courses${params}`),
  getById: (id) => api.get(`/courses/${id}`),
  create: (data) => api.post('/courses', data),
  update: (id, data) => api.put(`/courses/${id}`, data),
  delete: (id) => api.delete(`/courses/${id}`),
  assignFaculty: (id, data) => api.post(`/courses/${id}/assign-faculty`, data),
};

// Attendance
export const attendanceAPI = {
  getToday: () => api.get('/attendance/today'),
  getByCourse: (courseId, date) => api.get(`/attendance/course/${courseId}${date ? `?date=${date}` : ''}`),
  getByStudent: (studentId, params = '') => api.get(`/attendance/student/${studentId}${params}`),
  mark: (data) => api.post('/attendance', data),
  markBulk: (data) => api.post('/attendance/bulk', data),
};

// Results
export const resultsAPI = {
  getAll: (params = '') => api.get(`/results${params}`),
  getByStudent: (studentId) => api.get(`/results/student/${studentId}`),
  getByCourse: (courseId, params = '') => api.get(`/results/course/${courseId}${params}`),
  add: (data) => api.post('/results', data),
  addBulk: (data) => api.post('/results/bulk', data),
  update: (id, data) => api.put(`/results/${id}`, data),
  delete: (id) => api.delete(`/results/${id}`),
  publish: (data) => api.post('/results/publish', data),
};

// Fees
export const feesAPI = {
  getPending: () => api.get('/fees/pending'),
  getByStudent: (studentId) => api.get(`/fees/student/${studentId}`),
  add: (data) => api.post('/fees', data),
  updateStatus: (id, data) => api.put(`/fees/${id}`, data),
  getReport: (params = '') => api.get(`/fees/report${params}`),
};

// Notifications
export const notificationsAPI = {
  getAll: (unread = false) => api.get(`/notifications${unread ? '?unread=true' : ''}`),
  create: (data) => api.post('/notifications', data),
  markRead: (id) => api.put(`/notifications/${id}/read`, {}),
  markAllRead: () => api.put('/notifications/read-all', {}),
  delete: (id) => api.delete(`/notifications/${id}`),
};

// Dashboard
export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
};
