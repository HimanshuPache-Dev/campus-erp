import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSemester } from '../../context/SemesterContext';
import { studentsAPI } from '../../services/api';
import { supabase } from '../../services/supabase';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  BookOpen,
  GraduationCap,
  Hash,
  Upload,
  Camera,
  FileText,
  Save,
  ArrowLeft,
  Users,
  Award,
  CreditCard,
  Heart,
  Briefcase,
  AlertCircle,
  CheckSquare,
  X,
  Loader
} from 'lucide-react';
import toast from 'react-hot-toast';

const AddStudent = () => {
  const navigate = useNavigate();
  const { semester, academicYear } = useSemester();
  const [activeTab, setActiveTab] = useState('basic');
  const [imagePreview, setImagePreview] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    const { data } = await supabase.from('users').select('department').eq('role', 'student').not('department', 'is', null);
    if (data) {
      const unique = [...new Set(data.map(d => d.department))].sort();
      setDepartments(unique.length > 0 ? unique : ['Computer Engineering', 'Information Technology', 'Electronics Engineering', 'Mechanical Engineering', 'Civil Engineering', 'Electrical Engineering']);
    }
    setLoading(false);
  };

  // State for 10th and 12th checkboxes
  const [has10th, setHas10th] = useState(false);
  const [has12th, setHas12th] = useState(false);

  // Form state for all sections
  const [formData, setFormData] = useState({
    // Basic Information
    basicInfo: {
      enrollmentNo: '',
      rollNo: '',
      course: 'Computer Engineering',
      semester: '1',
      batch: `${academicYear}-${parseInt(academicYear) + 1}`,
      admissionDate: new Date().toISOString().split('T')[0],
      admissionType: 'Regular',
    },
    
    // Personal Information
    personalInfo: {
      firstName: '',
      middleName: '',
      lastName: '',
      dateOfBirth: '',
      gender: 'male',
      bloodGroup: 'O+',
      nationality: 'Indian',
      religion: 'Hindu',
      caste: 'General',
      aadharNumber: '',
      panNumber: '',
    },
    
    // Contact Information
    contactInfo: {
      studentEmail: '',
      studentPhone: '',
      studentAlternatePhone: '',
      presentAddress: '',
      presentCity: '',
      presentState: '',
      presentPincode: '',
      permanentAddress: '',
      permanentCity: '',
      permanentState: '',
      permanentPincode: '',
    },
    
    // Parent Information
    parentInfo: {
      fatherName: '',
      fatherOccupation: '',
      fatherPhone: '',
      fatherEmail: '',
      motherName: '',
      motherOccupation: '',
      motherPhone: '',
      motherEmail: '',
      guardianName: '',
      guardianRelation: '',
      guardianPhone: '',
      guardianEmail: '',
      annualIncome: '',
    },
    
    // 10th Details
    tenthInfo: {
      board: '',
      schoolName: '',
      passingYear: '',
      rollNumber: '',
      marksObtained: '',
      totalMarks: '',
      percentage: '',
      grade: '',
    },
    
    // 12th Details
    twelfthInfo: {
      board: '',
      collegeName: '',
      passingYear: '',
      rollNumber: '',
      marksObtained: '',
      totalMarks: '',
      percentage: '',
      grade: '',
      stream: '',
    },
    
    // Other Information
    otherInfo: {
      hostelRequired: 'no',
      scholarshipApplied: 'no',
      scholarshipType: '',
      sportsQuota: 'no',
      sportsDetails: '',
      medicalConditions: '',
      allergies: '',
      emergencyContact: '',
      emergencyRelation: '',
      emergencyPhone: '',
    },
    
    // Bank Information
    bankInfo: {
      accountHolder: '',
      bankName: '',
      branchName: '',
      accountNumber: '',
      ifscCode: '',
      upiId: '',
    }
  });

  const semesters = [1, 2, 3, 4, 5, 6];
  const genders = ['male', 'female', 'other'];
  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const admissionTypes = ['Regular', 'Lateral Entry', 'Management Quota', 'Sports Quota'];

  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Image size must be less than 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      toast.success('Image uploaded successfully');
    }
  };

  // Handle document upload
  const handleDocumentUpload = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => file.size <= 5 * 1024 * 1024);
    
    if (validFiles.length !== files.length) {
      toast.error('Some files exceed 5MB limit and were skipped');
    }
    
    setDocuments([...documents, ...validFiles]);
    toast.success(`${validFiles.length} document(s) uploaded`);
  };

  // Handle input changes
  const handleInputChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  // Calculate percentage automatically
  const calculatePercentage = (obtained, total, section) => {
    if (obtained && total) {
      const percentage = ((parseFloat(obtained) / parseFloat(total)) * 100).toFixed(2);
      handleInputChange(section, 'percentage', percentage);
    }
  };

  // Remove document
  const removeDocument = (index) => {
    setDocuments(documents.filter((_, i) => i !== index));
    toast.success('Document removed');
  };

  // Validate form
  const validateForm = () => {
    // Basic Info validation
    if (!formData.basicInfo.enrollmentNo) {
      toast.error('Enrollment number is required');
      return false;
    }
    if (!formData.basicInfo.rollNo) {
      toast.error('Roll number is required');
      return false;
    }

    // Personal Info validation
    if (!formData.personalInfo.firstName) {
      toast.error('First name is required');
      return false;
    }
    if (!formData.personalInfo.lastName) {
      toast.error('Last name is required');
      return false;
    }
    if (!formData.personalInfo.dateOfBirth) {
      toast.error('Date of birth is required');
      return false;
    }

    // Contact Info validation
    if (!formData.contactInfo.studentEmail) {
      toast.error('Student email is required');
      return false;
    }
    if (!formData.contactInfo.studentPhone) {
      toast.error('Phone number is required');
      return false;
    }

    // Parent Info validation
    if (!formData.parentInfo.fatherName) {
      toast.error('Father name is required');
      return false;
    }
    if (!formData.parentInfo.fatherPhone) {
      toast.error('Father phone is required');
      return false;
    }
    if (!formData.parentInfo.motherName) {
      toast.error('Mother name is required');
      return false;
    }
    if (!formData.parentInfo.motherPhone) {
      toast.error('Mother phone is required');
      return false;
    }

    // 10th validation if checked
    if (has10th) {
      if (!formData.tenthInfo.board) {
        toast.error('10th board is required');
        return false;
      }
      if (!formData.tenthInfo.passingYear) {
        toast.error('10th passing year is required');
        return false;
      }
      if (!formData.tenthInfo.percentage) {
        toast.error('10th percentage is required');
        return false;
      }
    }

    // 12th validation if checked
    if (has12th) {
      if (!formData.twelfthInfo.board) {
        toast.error('12th board is required');
        return false;
      }
      if (!formData.twelfthInfo.passingYear) {
        toast.error('12th passing year is required');
        return false;
      }
      if (!formData.twelfthInfo.percentage) {
        toast.error('12th percentage is required');
        return false;
      }
    }

    return true;
  };

  // Prepare data for API
  const prepareStudentData = () => {
    // Create user data for users table
    const userData = {
      email: formData.contactInfo.studentEmail,
      password_hash: 'student123', // Default password - should be changed on first login
      first_name: formData.personalInfo.firstName,
      last_name: formData.personalInfo.lastName,
      role: 'student',
      department: formData.basicInfo.course,
      phone: formData.contactInfo.studentPhone,
      address: formData.contactInfo.presentAddress,
      date_of_birth: formData.personalInfo.dateOfBirth,
      gender: formData.personalInfo.gender,
      is_active: true
    };

    // Create student details for student_details table
    const studentDetailsData = {
      enrollment_number: formData.basicInfo.enrollmentNo,
      current_semester: parseInt(formData.basicInfo.semester),
      batch_year: parseInt(academicYear),
      guardian_name: formData.parentInfo.fatherName,
      guardian_phone: formData.parentInfo.fatherPhone,
      guardian_email: formData.parentInfo.fatherEmail,
      admission_date: formData.basicInfo.admissionDate
    };

    // Combine all data
    return {
      ...userData,
      student_details: studentDetailsData,
      // Add other sections as metadata or separate tables later
      metadata: {
        rollNo: formData.basicInfo.rollNo,
        admissionType: formData.basicInfo.admissionType,
        middleName: formData.personalInfo.middleName,
        bloodGroup: formData.personalInfo.bloodGroup,
        nationality: formData.personalInfo.nationality,
        religion: formData.personalInfo.religion,
        caste: formData.personalInfo.caste,
        aadharNumber: formData.personalInfo.aadharNumber,
        panNumber: formData.personalInfo.panNumber,
        alternatePhone: formData.contactInfo.studentAlternatePhone,
        permanentAddress: formData.contactInfo.permanentAddress,
        permanentCity: formData.contactInfo.permanentCity,
        permanentState: formData.contactInfo.permanentState,
        permanentPincode: formData.contactInfo.permanentPincode,
        fatherOccupation: formData.parentInfo.fatherOccupation,
        fatherEmail: formData.parentInfo.fatherEmail,
        motherOccupation: formData.parentInfo.motherOccupation,
        motherEmail: formData.parentInfo.motherEmail,
        guardianName: formData.parentInfo.guardianName,
        guardianRelation: formData.parentInfo.guardianRelation,
        guardianPhone: formData.parentInfo.guardianPhone,
        guardianEmail: formData.parentInfo.guardianEmail,
        annualIncome: formData.parentInfo.annualIncome,
        tenthInfo: has10th ? formData.tenthInfo : null,
        twelfthInfo: has12th ? formData.twelfthInfo : null,
        hostelRequired: formData.otherInfo.hostelRequired,
        scholarshipApplied: formData.otherInfo.scholarshipApplied,
        scholarshipType: formData.otherInfo.scholarshipType,
        sportsQuota: formData.otherInfo.sportsQuota,
        sportsDetails: formData.otherInfo.sportsDetails,
        medicalConditions: formData.otherInfo.medicalConditions,
        allergies: formData.otherInfo.allergies,
        emergencyContact: formData.otherInfo.emergencyContact,
        emergencyRelation: formData.otherInfo.emergencyRelation,
        emergencyPhone: formData.otherInfo.emergencyPhone,
        bankInfo: formData.bankInfo
      }
    };
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      const studentData = prepareStudentData();
      console.log('📤 Submitting student data:', studentData);

      // Call API to create student
      const response = await studentsAPI.create(studentData);
      
      console.log('✅ Student created:', response.data);
      
      // Upload documents if any (you'll need a separate API for documents)
      if (documents.length > 0) {
        // Upload documents logic here
        // You might need a separate API endpoint for document upload
        console.log('📎 Documents to upload:', documents);
        toast.success('Documents will be uploaded separately');
      }

      // Upload image if any
      if (imagePreview) {
        // Upload image logic here
        console.log('🖼️ Image to upload');
      }

      toast.success('Student added successfully!');
      navigate('/admin/students');
    } catch (error) {
      console.error('❌ Error creating student:', error);
      
      // Handle specific error cases
      if (error.response?.status === 409) {
        toast.error('Enrollment number or email already exists');
      } else if (error.response?.status === 400) {
        toast.error(error.response.data?.error || 'Invalid data provided');
      } else {
        toast.error('Failed to add student. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: GraduationCap },
    { id: 'personal', label: 'Personal', icon: User },
    { id: 'contact', label: 'Contact', icon: Phone },
    { id: 'parent', label: 'Parent Info', icon: Users },
    { id: 'academic', label: 'Academic', icon: BookOpen },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'bank', label: 'Bank Details', icon: CreditCard },
    { id: 'other', label: 'Other Info', icon: Award },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/admin/students')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            disabled={submitting}
          >
            <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Add New Student</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Fill in the student details for {semester} {academicYear} semester
            </p>
          </div>
        </div>
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="inline-flex items-center px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? (
            <>
              <Loader className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Student
            </>
          )}
        </button>
      </div>

      {/* Student Image Upload */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center space-x-6">
          <div className="relative">
            <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center overflow-hidden">
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <Camera className="h-8 w-8 text-gray-400" />
              )}
            </div>
            <label className="absolute bottom-0 right-0 p-1.5 bg-primary-600 text-white rounded-full cursor-pointer hover:bg-primary-700 transition-colors disabled:opacity-50">
              <Upload className="h-4 w-4" />
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleImageUpload}
                disabled={submitting}
              />
            </label>
          </div>
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white">Student Photo</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Upload a clear passport size photo (JPG, PNG, max 2MB)
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
          <div className="flex">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  disabled={submitting}
                  className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  } ${submitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-6">
          {/* Basic Information Tab */}
          {activeTab === 'basic' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Basic Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Enrollment Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.basicInfo.enrollmentNo}
                    onChange={(e) => handleInputChange('basicInfo', 'enrollmentNo', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="e.g., CP2024001"
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Roll Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.basicInfo.rollNo}
                    onChange={(e) => handleInputChange('basicInfo', 'rollNo', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="e.g., 101"
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Course <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.basicInfo.course}
                    onChange={(e) => handleInputChange('basicInfo', 'course', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    disabled={submitting}
                  >
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Semester <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.basicInfo.semester}
                    onChange={(e) => handleInputChange('basicInfo', 'semester', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    disabled={submitting}
                  >
                    {semesters.map(sem => (
                      <option key={sem} value={sem}>Semester {sem}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Batch
                  </label>
                  <input
                    type="text"
                    value={formData.basicInfo.batch}
                    readOnly
                    className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-600 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400"
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Admission Date
                  </label>
                  <input
                    type="date"
                    value={formData.basicInfo.admissionDate}
                    onChange={(e) => handleInputChange('basicInfo', 'admissionDate', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Admission Type
                  </label>
                  <select
                    value={formData.basicInfo.admissionType}
                    onChange={(e) => handleInputChange('basicInfo', 'admissionType', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    disabled={submitting}
                  >
                    {admissionTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Personal Information Tab */}
          {activeTab === 'personal' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Personal Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.personalInfo.firstName}
                    onChange={(e) => handleInputChange('personalInfo', 'firstName', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Enter first name"
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Middle Name
                  </label>
                  <input
                    type="text"
                    value={formData.personalInfo.middleName}
                    onChange={(e) => handleInputChange('personalInfo', 'middleName', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Enter middle name"
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.personalInfo.lastName}
                    onChange={(e) => handleInputChange('personalInfo', 'lastName', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Enter last name"
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Date of Birth <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.personalInfo.dateOfBirth}
                    onChange={(e) => handleInputChange('personalInfo', 'dateOfBirth', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Gender
                  </label>
                  <select
                    value={formData.personalInfo.gender}
                    onChange={(e) => handleInputChange('personalInfo', 'gender', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    disabled={submitting}
                  >
                    {genders.map(gender => (
                      <option key={gender} value={gender}>{gender.charAt(0).toUpperCase() + gender.slice(1)}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Blood Group
                  </label>
                  <select
                    value={formData.personalInfo.bloodGroup}
                    onChange={(e) => handleInputChange('personalInfo', 'bloodGroup', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    disabled={submitting}
                  >
                    {bloodGroups.map(bg => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nationality
                  </label>
                  <input
                    type="text"
                    value={formData.personalInfo.nationality}
                    onChange={(e) => handleInputChange('personalInfo', 'nationality', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Religion
                  </label>
                  <input
                    type="text"
                    value={formData.personalInfo.religion}
                    onChange={(e) => handleInputChange('personalInfo', 'religion', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Caste Category
                  </label>
                  <input
                    type="text"
                    value={formData.personalInfo.caste}
                    onChange={(e) => handleInputChange('personalInfo', 'caste', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Aadhar Number
                  </label>
                  <input
                    type="text"
                    value={formData.personalInfo.aadharNumber}
                    onChange={(e) => handleInputChange('personalInfo', 'aadharNumber', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="XXXX-XXXX-XXXX"
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    PAN Number
                  </label>
                  <input
                    type="text"
                    value={formData.personalInfo.panNumber}
                    onChange={(e) => handleInputChange('personalInfo', 'panNumber', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="ABCDE1234F"
                    disabled={submitting}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Contact Information Tab */}
          {activeTab === 'contact' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Contact Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Student Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.contactInfo.studentEmail}
                    onChange={(e) => handleInputChange('contactInfo', 'studentEmail', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="student@example.com"
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.contactInfo.studentPhone}
                    onChange={(e) => handleInputChange('contactInfo', 'studentPhone', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="9876543210"
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Alternate Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.contactInfo.studentAlternatePhone}
                    onChange={(e) => handleInputChange('contactInfo', 'studentAlternatePhone', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="9876543210"
                    disabled={submitting}
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Present Address
                  </label>
                  <textarea
                    value={formData.contactInfo.presentAddress}
                    onChange={(e) => handleInputChange('contactInfo', 'presentAddress', e.target.value)}
                    rows="2"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Enter present address"
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    value={formData.contactInfo.presentCity}
                    onChange={(e) => handleInputChange('contactInfo', 'presentCity', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    State
                  </label>
                  <input
                    type="text"
                    value={formData.contactInfo.presentState}
                    onChange={(e) => handleInputChange('contactInfo', 'presentState', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Pincode
                  </label>
                  <input
                    type="text"
                    value={formData.contactInfo.presentPincode}
                    onChange={(e) => handleInputChange('contactInfo', 'presentPincode', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    disabled={submitting}
                  />
                </div>
              </div>

              <div className="pt-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      if (e.target.checked) {
                        handleInputChange('contactInfo', 'permanentAddress', formData.contactInfo.presentAddress);
                        handleInputChange('contactInfo', 'permanentCity', formData.contactInfo.presentCity);
                        handleInputChange('contactInfo', 'permanentState', formData.contactInfo.presentState);
                        handleInputChange('contactInfo', 'permanentPincode', formData.contactInfo.presentPincode);
                      }
                    }}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    disabled={submitting}
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Same as present address</span>
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Permanent Address
                  </label>
                  <textarea
                    value={formData.contactInfo.permanentAddress}
                    onChange={(e) => handleInputChange('contactInfo', 'permanentAddress', e.target.value)}
                    rows="2"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    value={formData.contactInfo.permanentCity}
                    onChange={(e) => handleInputChange('contactInfo', 'permanentCity', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    State
                  </label>
                  <input
                    type="text"
                    value={formData.contactInfo.permanentState}
                    onChange={(e) => handleInputChange('contactInfo', 'permanentState', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Pincode
                  </label>
                  <input
                    type="text"
                    value={formData.contactInfo.permanentPincode}
                    onChange={(e) => handleInputChange('contactInfo', 'permanentPincode', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    disabled={submitting}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Parent Information Tab */}
          {activeTab === 'parent' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Parent / Guardian Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Father's Information */}
                <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <h4 className="font-medium text-gray-900 dark:text-white flex items-center">
                    <Users className="h-4 w-4 mr-2" />
                    Father's Information
                  </h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Father's Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.parentInfo.fatherName}
                      onChange={(e) => handleInputChange('parentInfo', 'fatherName', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      disabled={submitting}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Occupation
                    </label>
                    <input
                      type="text"
                      value={formData.parentInfo.fatherOccupation}
                      onChange={(e) => handleInputChange('parentInfo', 'fatherOccupation', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      disabled={submitting}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Mobile Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={formData.parentInfo.fatherPhone}
                      onChange={(e) => handleInputChange('parentInfo', 'fatherPhone', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      disabled={submitting}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.parentInfo.fatherEmail}
                      onChange={(e) => handleInputChange('parentInfo', 'fatherEmail', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      disabled={submitting}
                    />
                  </div>
                </div>

                {/* Mother's Information */}
                <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <h4 className="font-medium text-gray-900 dark:text-white flex items-center">
                    <Heart className="h-4 w-4 mr-2" />
                    Mother's Information
                  </h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Mother's Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.parentInfo.motherName}
                      onChange={(e) => handleInputChange('parentInfo', 'motherName', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      disabled={submitting}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Occupation
                    </label>
                    <input
                      type="text"
                      value={formData.parentInfo.motherOccupation}
                      onChange={(e) => handleInputChange('parentInfo', 'motherOccupation', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      disabled={submitting}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Mobile Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={formData.parentInfo.motherPhone}
                      onChange={(e) => handleInputChange('parentInfo', 'motherPhone', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      disabled={submitting}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.parentInfo.motherEmail}
                      onChange={(e) => handleInputChange('parentInfo', 'motherEmail', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      disabled={submitting}
                    />
                  </div>
                </div>
              </div>

              {/* Guardian Information */}
              <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <h4 className="font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                  <Briefcase className="h-4 w-4 mr-2" />
                  Guardian Information (if different from parents)
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Guardian Name
                    </label>
                    <input
                      type="text"
                      value={formData.parentInfo.guardianName}
                      onChange={(e) => handleInputChange('parentInfo', 'guardianName', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      disabled={submitting}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Relation
                    </label>
                    <input
                      type="text"
                      value={formData.parentInfo.guardianRelation}
                      onChange={(e) => handleInputChange('parentInfo', 'guardianRelation', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      disabled={submitting}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={formData.parentInfo.guardianPhone}
                      onChange={(e) => handleInputChange('parentInfo', 'guardianPhone', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      disabled={submitting}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.parentInfo.guardianEmail}
                      onChange={(e) => handleInputChange('parentInfo', 'guardianEmail', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      disabled={submitting}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Annual Family Income
                    </label>
                    <input
                      type="text"
                      value={formData.parentInfo.annualIncome}
                      onChange={(e) => handleInputChange('parentInfo', 'annualIncome', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="e.g., 500000"
                      disabled={submitting}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Academic Tab - 10th & 12th Details */}
          {activeTab === 'academic' && (
            <div className="space-y-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Academic Qualifications</h3>
              
              {/* 10th Standard Section */}
              <div className="p-6 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <CheckSquare className="h-5 w-5 text-primary-600" />
                    <h4 className="text-md font-semibold text-gray-900 dark:text-white">10th Standard Details</h4>
                  </div>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={has10th}
                      onChange={(e) => setHas10th(e.target.checked)}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 h-4 w-4"
                      disabled={submitting}
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Include 10th Details</span>
                  </label>
                </div>

                {has10th && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Board Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.tenthInfo.board}
                        onChange={(e) => handleInputChange('tenthInfo', 'board', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        placeholder="e.g., Maharashtra State Board"
                        disabled={submitting}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        School Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.tenthInfo.schoolName}
                        onChange={(e) => handleInputChange('tenthInfo', 'schoolName', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        disabled={submitting}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Passing Year <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.tenthInfo.passingYear}
                        onChange={(e) => handleInputChange('tenthInfo', 'passingYear', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        placeholder="e.g., 2020"
                        disabled={submitting}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Roll Number
                      </label>
                      <input
                        type="text"
                        value={formData.tenthInfo.rollNumber}
                        onChange={(e) => handleInputChange('tenthInfo', 'rollNumber', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        disabled={submitting}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Marks Obtained
                      </label>
                      <input
                        type="number"
                        value={formData.tenthInfo.marksObtained}
                        onChange={(e) => {
                          handleInputChange('tenthInfo', 'marksObtained', e.target.value);
                          calculatePercentage(e.target.value, formData.tenthInfo.totalMarks, 'tenthInfo');
                        }}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        disabled={submitting}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Total Marks
                      </label>
                      <input
                        type="number"
                        value={formData.tenthInfo.totalMarks}
                        onChange={(e) => {
                          handleInputChange('tenthInfo', 'totalMarks', e.target.value);
                          calculatePercentage(formData.tenthInfo.marksObtained, e.target.value, 'tenthInfo');
                        }}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        disabled={submitting}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Percentage <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.tenthInfo.percentage}
                        readOnly
                        className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-600 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
                        placeholder="Auto-calculated"
                        disabled={submitting}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Grade
                      </label>
                      <input
                        type="text"
                        value={formData.tenthInfo.grade}
                        onChange={(e) => handleInputChange('tenthInfo', 'grade', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        placeholder="e.g., A, B, etc."
                        disabled={submitting}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* 12th Standard Section */}
              <div className="p-6 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <CheckSquare className="h-5 w-5 text-primary-600" />
                    <h4 className="text-md font-semibold text-gray-900 dark:text-white">12th Standard / Diploma Details</h4>
                  </div>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={has12th}
                      onChange={(e) => setHas12th(e.target.checked)}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 h-4 w-4"
                      disabled={submitting}
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Include 12th Details</span>
                  </label>
                </div>

                {has12th && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Board/University <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.twelfthInfo.board}
                        onChange={(e) => handleInputChange('twelfthInfo', 'board', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        placeholder="e.g., Maharashtra State Board"
                        disabled={submitting}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        College/School Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.twelfthInfo.collegeName}
                        onChange={(e) => handleInputChange('twelfthInfo', 'collegeName', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        disabled={submitting}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Stream
                      </label>
                      <input
                        type="text"
                        value={formData.twelfthInfo.stream}
                        onChange={(e) => handleInputChange('twelfthInfo', 'stream', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        placeholder="e.g., Science, Commerce"
                        disabled={submitting}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Passing Year <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.twelfthInfo.passingYear}
                        onChange={(e) => handleInputChange('twelfthInfo', 'passingYear', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        placeholder="e.g., 2022"
                        disabled={submitting}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Roll Number
                      </label>
                      <input
                        type="text"
                        value={formData.twelfthInfo.rollNumber}
                        onChange={(e) => handleInputChange('twelfthInfo', 'rollNumber', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        disabled={submitting}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Marks Obtained
                      </label>
                      <input
                        type="number"
                        value={formData.twelfthInfo.marksObtained}
                        onChange={(e) => {
                          handleInputChange('twelfthInfo', 'marksObtained', e.target.value);
                          calculatePercentage(e.target.value, formData.twelfthInfo.totalMarks, 'twelfthInfo');
                        }}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        disabled={submitting}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Total Marks
                      </label>
                      <input
                        type="number"
                        value={formData.twelfthInfo.totalMarks}
                        onChange={(e) => {
                          handleInputChange('twelfthInfo', 'totalMarks', e.target.value);
                          calculatePercentage(formData.twelfthInfo.marksObtained, e.target.value, 'twelfthInfo');
                        }}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        disabled={submitting}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Percentage <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.twelfthInfo.percentage}
                        readOnly
                        className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-600 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
                        placeholder="Auto-calculated"
                        disabled={submitting}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Grade
                      </label>
                      <input
                        type="text"
                        value={formData.twelfthInfo.grade}
                        onChange={(e) => handleInputChange('twelfthInfo', 'grade', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        placeholder="e.g., A, B, etc."
                        disabled={submitting}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Documents Tab */}
          {activeTab === 'documents' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Document Upload</h3>
              
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                <input
                  type="file"
                  multiple
                  onChange={handleDocumentUpload}
                  className="hidden"
                  id="document-upload"
                  disabled={submitting}
                />
                <label
                  htmlFor="document-upload"
                  className={`cursor-pointer inline-flex flex-col items-center ${submitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <Upload className="h-12 w-12 text-gray-400 mb-3" />
                  <p className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                    Upload Documents
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    Supported: PDF, JPG, PNG (Max 5MB each)
                  </p>
                </label>
              </div>

              {/* Document List */}
              {documents.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">Uploaded Documents</h4>
                  <div className="space-y-2">
                    {documents.map((doc, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <div className="flex items-center">
                          <FileText className="h-5 w-5 text-gray-400 mr-3" />
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{doc.name}</p>
                            <p className="text-xs text-gray-500">{(doc.size / 1024).toFixed(2)} KB</p>
                          </div>
                        </div>
                        <button
                          onClick={() => removeDocument(index)}
                          className="text-red-600 hover:text-red-700 text-sm"
                          disabled={submitting}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Required Documents Checklist */}
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-3">Required Documents</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {[
                    '10th Marksheet',
                    '12th Marksheet',
                    'Transfer Certificate',
                    'Migration Certificate',
                    'Caste Certificate (if applicable)',
                    'Income Certificate',
                    'Aadhar Card',
                    'PAN Card',
                    'Passport Size Photos',
                  ].map((doc, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input type="checkbox" className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" disabled={submitting} />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{doc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Bank Details Tab */}
          {activeTab === 'bank' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Bank Account Details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Account Holder Name
                  </label>
                  <input
                    type="text"
                    value={formData.bankInfo.accountHolder}
                    onChange={(e) => handleInputChange('bankInfo', 'accountHolder', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Bank Name
                  </label>
                  <input
                    type="text"
                    value={formData.bankInfo.bankName}
                    onChange={(e) => handleInputChange('bankInfo', 'bankName', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Branch Name
                  </label>
                  <input
                    type="text"
                    value={formData.bankInfo.branchName}
                    onChange={(e) => handleInputChange('bankInfo', 'branchName', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Account Number
                  </label>
                  <input
                    type="text"
                    value={formData.bankInfo.accountNumber}
                    onChange={(e) => handleInputChange('bankInfo', 'accountNumber', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    IFSC Code
                  </label>
                  <input
                    type="text"
                    value={formData.bankInfo.ifscCode}
                    onChange={(e) => handleInputChange('bankInfo', 'ifscCode', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    UPI ID
                  </label>
                  <input
                    type="text"
                    value={formData.bankInfo.upiId}
                    onChange={(e) => handleInputChange('bankInfo', 'upiId', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="example@okhdfcbank"
                    disabled={submitting}
                  />
                </div>
              </div>

              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                * Bank details are required for fee refunds and scholarship disbursements
              </p>
            </div>
          )}

          {/* Other Information Tab */}
          {activeTab === 'other' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Additional Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900 dark:text-white">Hostel & Scholarship</h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Hostel Required?
                    </label>
                    <select
                      value={formData.otherInfo.hostelRequired}
                      onChange={(e) => handleInputChange('otherInfo', 'hostelRequired', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      disabled={submitting}
                    >
                      <option value="no">No</option>
                      <option value="yes">Yes</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Scholarship Applied?
                    </label>
                    <select
                      value={formData.otherInfo.scholarshipApplied}
                      onChange={(e) => handleInputChange('otherInfo', 'scholarshipApplied', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      disabled={submitting}
                    >
                      <option value="no">No</option>
                      <option value="yes">Yes</option>
                    </select>
                  </div>

                  {formData.otherInfo.scholarshipApplied === 'yes' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Scholarship Type
                      </label>
                      <input
                        type="text"
                        value={formData.otherInfo.scholarshipType}
                        onChange={(e) => handleInputChange('otherInfo', 'scholarshipType', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        placeholder="e.g., Merit, Caste-based"
                        disabled={submitting}
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900 dark:text-white">Extra Curricular</h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Sports Quota?
                    </label>
                    <select
                      value={formData.otherInfo.sportsQuota}
                      onChange={(e) => handleInputChange('otherInfo', 'sportsQuota', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      disabled={submitting}
                    >
                      <option value="no">No</option>
                      <option value="yes">Yes</option>
                    </select>
                  </div>

                  {formData.otherInfo.sportsQuota === 'yes' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Sports Details
                      </label>
                      <input
                        type="text"
                        value={formData.otherInfo.sportsDetails}
                        onChange={(e) => handleInputChange('otherInfo', 'sportsDetails', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        placeholder="e.g., Cricket, Football"
                        disabled={submitting}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Medical Information */}
              <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <h4 className="font-medium text-gray-900 dark:text-white mb-4">Medical Information</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Medical Conditions
                    </label>
                    <textarea
                      value={formData.otherInfo.medicalConditions}
                      onChange={(e) => handleInputChange('otherInfo', 'medicalConditions', e.target.value)}
                      rows="3"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="Any medical conditions we should know about"
                      disabled={submitting}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Allergies
                    </label>
                    <textarea
                      value={formData.otherInfo.allergies}
                      onChange={(e) => handleInputChange('otherInfo', 'allergies', e.target.value)}
                      rows="3"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="Any allergies"
                      disabled={submitting}
                    />
                  </div>
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <h4 className="font-medium text-red-800 dark:text-red-300 mb-4 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Emergency Contact (Different from Parents)
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Contact Person
                    </label>
                    <input
                      type="text"
                      value={formData.otherInfo.emergencyContact}
                      onChange={(e) => handleInputChange('otherInfo', 'emergencyContact', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      disabled={submitting}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Relation
                    </label>
                    <input
                      type="text"
                      value={formData.otherInfo.emergencyRelation}
                      onChange={(e) => handleInputChange('otherInfo', 'emergencyRelation', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      disabled={submitting}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={formData.otherInfo.emergencyPhone}
                      onChange={(e) => handleInputChange('otherInfo', 'emergencyPhone', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      disabled={submitting}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Form Actions */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/admin/students')}
            className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center"
          >
            {submitting ? (
              <>
                <Loader className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Student'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddStudent;