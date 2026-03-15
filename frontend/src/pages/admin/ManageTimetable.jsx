import React, { useState, useEffect } from 'react';
import { supabase } from '../../config/supabase';
import { Calendar, Clock, MapPin, User, Plus, Edit, Trash2, Save, X } from 'lucide-react';
import toast from 'react-hot-toast';

const ManageTimetable = () => {
  const [loading, setLoading] = useState(true);
  const [slots, setSlots] = useState([]);
  const [courses, setCourses] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);
  const [selectedSemester, setSelectedSemester] = useState(1);

  const [formData, setFormData] = useState({
    course_id: '',
    faculty_id: '',
    day_of_week: 'Monday',
    start_time: '09:00',
    end_time: '10:00',
    room_number: '',
    semester: 1,
    academic_year: '2025-26',
    semester_type: 'Winter'
  });

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const timeSlots = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'];

  useEffect(() => {
    fetchData();
  }, [selectedSemester]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [slotsRes, coursesRes, facultyRes] = await Promise.all([
        supabase.from('timetable_slots').select(`
          *,
          courses(course_code, course_name),
          users:faculty_id(first_name, last_name)
        `).eq('semester', selectedSemester).eq('is_active', true),
        supabase.from('courses').select('*').eq('semester', selectedSemester).eq('is_active', true),
        supabase.from('users').select('id, first_name, last_name, department').eq('role', 'faculty')
      ]);

      setSlots(slotsRes.data || []);
      setCourses(coursesRes.data || []);
      setFaculty(facultyRes.data || []);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingSlot) {
        const { error } = await supabase
          .from('timetable_slots')
          .update(formData)
          .eq('id', editingSlot.id);
        if (error) throw error;
        toast.success('Slot updated successfully');
      } else {
        const { error } = await supabase
          .from('timetable_slots')
          .insert([formData]);
        if (error) throw error;
        toast.success('Slot added successfully');
      }
      setShowAddModal(false);
      setEditingSlot(null);
      resetForm();
      fetchData();
    } catch (error) {
      toast.error(error.message || 'Failed to save slot');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this timetable slot?')) return;
    try {
      const { error } = await supabase
        .from('timetable_slots')
        .delete()
        .eq('id', id);
      if (error) throw error;
      toast.success('Slot deleted');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete slot');
    }
  };

  const handleEdit = (slot) => {
    setEditingSlot(slot);
    setFormData({
      course_id: slot.course_id,
      faculty_id: slot.faculty_id,
      day_of_week: slot.day_of_week,
      start_time: slot.start_time,
      end_time: slot.end_time,
      room_number: slot.room_number,
      semester: slot.semester,
      academic_year: slot.academic_year,
      semester_type: slot.semester_type
    });
    setShowAddModal(true);
  };

  const resetForm = () => {
    setFormData({
      course_id: '',
      faculty_id: '',
      day_of_week: 'Monday',
      start_time: '09:00',
      end_time: '10:00',
      room_number: '',
      semester: selectedSemester,
      academic_year: '2025-26',
      semester_type: 'Winter'
    });
  };

  const getSlotForDayTime = (day, time) => {
    return slots.find(s => 
      s.day_of_week === day && 
      s.start_time === time + ':00'
    );
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Manage Timetable</h1>
          <p className="text-gray-600">Create and manage class schedules</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowAddModal(true); }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus className="h-5 w-5" />
          Add Slot
        </button>
      </div>

      {/* Semester Filter */}
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
          <button
            key={sem}
            onClick={() => setSelectedSemester(sem)}
            className={`px-4 py-2 rounded-lg ${
              selectedSemester === sem
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Sem {sem}
          </button>
        ))}
      </div>

      {/* Timetable Grid */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50">
              <th className="border p-3 text-left font-semibold">Time</th>
              {days.map(day => (
                <th key={day} className="border p-3 text-left font-semibold">{day}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {timeSlots.map(time => (
              <tr key={time}>
                <td className="border p-3 font-medium bg-gray-50">{time}</td>
                {days.map(day => {
                  const slot = getSlotForDayTime(day, time);
                  return (
                    <td key={day} className="border p-2">
                      {slot ? (
                        <div className="bg-blue-50 p-2 rounded border-l-4 border-blue-500">
                          <div className="font-semibold text-sm">{slot.courses?.course_code}</div>
                          <div className="text-xs text-gray-600">{slot.courses?.course_name}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            <User className="h-3 w-3 inline mr-1" />
                            {slot.users?.first_name} {slot.users?.last_name}
                          </div>
                          <div className="text-xs text-gray-500">
                            <MapPin className="h-3 w-3 inline mr-1" />
                            {slot.room_number}
                          </div>
                          <div className="flex gap-1 mt-2">
                            <button
                              onClick={() => handleEdit(slot)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(slot.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-gray-400 text-center text-sm">-</div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {editingSlot ? 'Edit' : 'Add'} Timetable Slot
              </h2>
              <button onClick={() => { setShowAddModal(false); setEditingSlot(null); }}>
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Course</label>
                <select
                  value={formData.course_id}
                  onChange={(e) => setFormData({...formData, course_id: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                >
                  <option value="">Select Course</option>
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.course_code} - {c.course_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Faculty</label>
                <select
                  value={formData.faculty_id}
                  onChange={(e) => setFormData({...formData, faculty_id: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                >
                  <option value="">Select Faculty</option>
                  {faculty.map(f => (
                    <option key={f.id} value={f.id}>
                      {f.first_name} {f.last_name} ({f.department})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Day</label>
                <select
                  value={formData.day_of_week}
                  onChange={(e) => setFormData({...formData, day_of_week: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                >
                  {days.map(day => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Start Time</label>
                  <input
                    type="time"
                    value={formData.start_time}
                    onChange={(e) => setFormData({...formData, start_time: e.target.value})}
                    className="w-full border rounded-lg px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">End Time</label>
                  <input
                    type="time"
                    value={formData.end_time}
                    onChange={(e) => setFormData({...formData, end_time: e.target.value})}
                    className="w-full border rounded-lg px-3 py-2"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Room Number</label>
                <input
                  type="text"
                  value={formData.room_number}
                  onChange={(e) => setFormData({...formData, room_number: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="e.g., Room 101"
                  required
                />
              </div>

              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => { setShowAddModal(false); setEditingSlot(null); }}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Save className="h-4 w-4 inline mr-2" />
                  {editingSlot ? 'Update' : 'Add'} Slot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageTimetable;
