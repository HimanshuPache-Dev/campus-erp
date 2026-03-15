import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSemester } from '../../context/SemesterContext';
import { supabase } from '../../services/supabase';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  BookOpen,
  GraduationCap,
  Award,
  Briefcase,
  Heart,
  Upload,
  Camera,
  FileText,
  Save,
  ArrowLeft,
  Users,
  CreditCard,
  AlertCircle,
  CheckSquare,
  Globe,
  Languages,
  Star,
  Clock
} from 'lucide-react';
import toast from 'react-hot-toast';

const AddFaculty = () => {
  const navigate = useNavigate();
  const { semester, academicYear } = useSemester();
  const [activeTab, setActiveTab] = useState('personal');
  const [imagePreview, setImagePreview] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    const { data } = await supabase.from('users').select('department').eq('role', 'faculty').not('department', 'is', null);
    if (data) {
      const unique = [...new Set(data.map(d => d.department))].sort();
      setDepartments(unique.length > 0 ? unique : ['Computer Engineering', 'Information Technology', 'Electronics Engineering', 'Mechanical Engineering', 'Civil Engineering', 'Electrical Engineering']);
    }
    setLoading(false);
  };

  // Form state for all sections
  const [formData, setFormData] = useState({
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
      passportNumber: '',
    },
    
    // Contact Information
    contactInfo: {
      personalEmail: '',
      officialEmail: '',
      personalPhone: '',
      officialPhone: '',
      alternatePhone: '',
      presentAddress: '',
      presentCity: '',
      presentState: '',
      presentPincode: '',
      permanentAddress: '',
      permanentCity: '',
      permanentState: '',
      permanentPincode: '',
    },
    
    // Employee Information
    employeeInfo: {
      employeeId: '',
      department: 'Computer Engineering',
      designation: 'Assistant Professor',
      joiningDate: new Date().toISOString().split('T')[0],
      employmentType: 'permanent',
      employeeStatus: 'active',
      reportingTo: '',
      workLocation: 'Main Campus',
    },
    
    // Qualification Information
    qualificationInfo: {
      // 10th Details
      tenthBoard: '',
      tenthSchool: '',
      tenthYear: '',
      tenthPercentage: '',
      
      // 12th Details
      twelfthBoard: '',
      twelfthCollege: '',
      twelfthYear: '',
      twelfthPercentage: '',
      twelfthStream: '',
      
      // Diploma (if applicable)
      diplomaBoard: '',
      diplomaCollege: '',
      diplomaYear: '',
      diplomaPercentage: '',
      diplomaBranch: '',
      
      // Undergraduate (Bachelor's)
      ugDegree: 'B.E.',
      ugSpecialization: '',
      ugUniversity: '',
      ugCollege: '',
      ugYear: '',
      ugPercentage: '',
      ugClass: '',
      
      // Postgraduate (Master's)
      pgDegree: '',
      pgSpecialization: '',
      pgUniversity: '',
      pgCollege: '',
      pgYear: '',
      pgPercentage: '',
      pgClass: '',
      
      // Doctorate (Ph.D)
      phdTitle: '',
      phdUniversity: '',
      phdYear: '',
      phdGuide: '',
      phdStatus: 'completed',
      
      // Other Qualifications
      otherQualifications: [],
    },
    
    // Experience Information
    experienceInfo: {
      totalExperience: '',
      teachingExperience: '',
      industryExperience: '',
      researchExperience: '',
      currentOrganization: '',
      previousOrganizations: [],
      certifications: [],
      achievements: [],
    },
    
    // Professional Information
    professionalInfo: {
      areasOfExpertise: [],
      subjectsCanTeach: [],
      researchInterests: [],
      publications: [],
      conferences: [],
      workshops: [],
      professionalMemberships: [],
      languagesKnown: [],
    },
    
    // Bank Information
    bankInfo: {
      accountHolder: '',
      bankName: '',
      branchName: '',
      accountNumber: '',
      ifscCode: '',
      upiId: '',
    },
    
    // Document Information
    documentInfo: {
      documents: []
    },
    
    // Emergency Contact
    emergencyInfo: {
      contactName: '',
      relation: '',
      phone: '',
      email: '',
      address: '',
    }
  });

  const designations = [
    'Professor',
    'Associate Professor',
    'Assistant Professor',
    'Senior Lecturer',
    'Lecturer',
    'Visiting Faculty',
    'Guest Faculty',
    'Lab Instructor',
    'Workshop Instructor'
  ];

  const employmentTypes = [
    'permanent',
    'contractual',
    'visiting',
    'guest',
    'adhoc',
    'probation'
  ];

  const ugDegrees = [
    'B.E.',
    'B.Tech',
    'B.Sc',
    'B.Com',
    'B.A',
    'BCA',
    'BBA',
    'Diploma'
  ];

  const pgDegrees = [
    'M.E.',
    'M.Tech',
    'M.Sc',
    'M.Com',
    'M.A',
    'MCA',
    'MBA',
    'MS'
  ];

  const genders = ['male', 'female', 'other'];
  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
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
    setDocuments([...documents, ...files]);
    toast.success(`${files.length} document(s) uploaded`);
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

  // Handle array fields (expertise, subjects, etc.)
  const handleArrayChange = (section, field, value) => {
    const items = value.split(',').map(item => item.trim());
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: items
      }
    }));
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.employeeInfo.employeeId || !formData.personalInfo.firstName || !formData.personalInfo.lastName) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Validate email
    if (!formData.contactInfo.officialEmail) {
      toast.error('Official email is required');
      return;
    }

    // Validate qualification
    if (!formData.qualificationInfo.ugDegree || !formData.qualificationInfo.ugPercentage) {
      toast.error('Please fill in undergraduate qualification details');
      return;
    }

    console.log('Form Data:', formData);
    console.log('Documents:', documents);
    console.log('Faculty Image:', imagePreview);

    toast.success('Faculty added successfully!');
    navigate('/admin/faculty');
  };

  const tabs = [
    { id: 'personal', label: 'Personal', icon: User },
    { id: 'contact', label: 'Contact', icon: Phone },
    { id: 'employee', label: 'Employee', icon: Briefcase },
    { id: 'qualification', label: 'Qualifications', icon: GraduationCap },
    { id: 'experience', label: 'Experience', icon: Clock },
    { id: 'professional', label: 'Professional', icon: Award },
    { id: 'bank', label: 'Bank Details', icon: CreditCard },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'emergency', label: 'Emergency', icon: AlertCircle },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/admin/faculty')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Add New Faculty</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Fill in the faculty details for {semester} {academicYear} semester
            </p>
          </div>
        </div>
        <button
          onClick={handleSubmit}
          className="inline-flex items-center px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Save className="h-4 w-4 mr-2" />
          Save Faculty
        </button>
      </div>

      {/* Faculty Image Upload */}
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
            <label className="absolute bottom-0 right-0 p-1.5 bg-primary-600 text-white rounded-full cursor-pointer hover:bg-primary-700 transition-colors">
              <Upload className="h-4 w-4" />
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            </label>
          </div>
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white">Faculty Photo</h3>
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
                  className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-6">
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
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Passport Number
                  </label>
                  <input
                    type="text"
                    value={formData.personalInfo.passportNumber}
                    onChange={(e) => handleInputChange('personalInfo', 'passportNumber', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="If applicable"
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
                    Personal Email
                  </label>
                  <input
                    type="email"
                    value={formData.contactInfo.personalEmail}
                    onChange={(e) => handleInputChange('contactInfo', 'personalEmail', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="personal@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Official Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.contactInfo.officialEmail}
                    onChange={(e) => handleInputChange('contactInfo', 'officialEmail', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="faculty@college.edu"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Personal Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.contactInfo.personalPhone}
                    onChange={(e) => handleInputChange('contactInfo', 'personalPhone', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="9876543210"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Official Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.contactInfo.officialPhone}
                    onChange={(e) => handleInputChange('contactInfo', 'officialPhone', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="9876543210"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Alternate Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.contactInfo.alternatePhone}
                    onChange={(e) => handleInputChange('contactInfo', 'alternatePhone', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="9876543210"
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
                  />
                </div>
              </div>
            </div>
          )}

          {/* Employee Information Tab */}
          {activeTab === 'employee' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Employee Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Employee ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.employeeInfo.employeeId}
                    onChange={(e) => handleInputChange('employeeInfo', 'employeeId', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="e.g., FAC2024001"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Department <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.employeeInfo.department}
                    onChange={(e) => handleInputChange('employeeInfo', 'department', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Designation <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.employeeInfo.designation}
                    onChange={(e) => handleInputChange('employeeInfo', 'designation', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    {designations.map(des => (
                      <option key={des} value={des}>{des}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Joining Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.employeeInfo.joiningDate}
                    onChange={(e) => handleInputChange('employeeInfo', 'joiningDate', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Employment Type
                  </label>
                  <select
                    value={formData.employeeInfo.employmentType}
                    onChange={(e) => handleInputChange('employeeInfo', 'employmentType', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    {employmentTypes.map(type => (
                      <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Employee Status
                  </label>
                  <select
                    value={formData.employeeInfo.employeeStatus}
                    onChange={(e) => handleInputChange('employeeInfo', 'employeeStatus', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="active">Active</option>
                    <option value="probation">On Probation</option>
                    <option value="leave">On Leave</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Reporting To
                  </label>
                  <input
                    type="text"
                    value={formData.employeeInfo.reportingTo}
                    onChange={(e) => handleInputChange('employeeInfo', 'reportingTo', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="HOD Name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Work Location
                  </label>
                  <input
                    type="text"
                    value={formData.employeeInfo.workLocation}
                    onChange={(e) => handleInputChange('employeeInfo', 'workLocation', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Qualifications Tab */}
          {activeTab === 'qualification' && (
            <div className="space-y-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Educational Qualifications</h3>
              
              {/* 10th Details */}
              <div className="p-6 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-700">
                <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4">10th Standard</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Board
                    </label>
                    <input
                      type="text"
                      value={formData.qualificationInfo.tenthBoard}
                      onChange={(e) => handleInputChange('qualificationInfo', 'tenthBoard', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      School Name
                    </label>
                    <input
                      type="text"
                      value={formData.qualificationInfo.tenthSchool}
                      onChange={(e) => handleInputChange('qualificationInfo', 'tenthSchool', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Year of Passing
                    </label>
                    <input
                      type="text"
                      value={formData.qualificationInfo.tenthYear}
                      onChange={(e) => handleInputChange('qualificationInfo', 'tenthYear', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Percentage
                    </label>
                    <input
                      type="text"
                      value={formData.qualificationInfo.tenthPercentage}
                      onChange={(e) => handleInputChange('qualificationInfo', 'tenthPercentage', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* 12th Details */}
              <div className="p-6 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-700">
                <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4">12th / HSC</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Board
                    </label>
                    <input
                      type="text"
                      value={formData.qualificationInfo.twelfthBoard}
                      onChange={(e) => handleInputChange('qualificationInfo', 'twelfthBoard', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      College Name
                    </label>
                    <input
                      type="text"
                      value={formData.qualificationInfo.twelfthCollege}
                      onChange={(e) => handleInputChange('qualificationInfo', 'twelfthCollege', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Stream
                    </label>
                    <input
                      type="text"
                      value={formData.qualificationInfo.twelfthStream}
                      onChange={(e) => handleInputChange('qualificationInfo', 'twelfthStream', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Year of Passing
                    </label>
                    <input
                      type="text"
                      value={formData.qualificationInfo.twelfthYear}
                      onChange={(e) => handleInputChange('qualificationInfo', 'twelfthYear', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Percentage
                    </label>
                    <input
                      type="text"
                      value={formData.qualificationInfo.twelfthPercentage}
                      onChange={(e) => handleInputChange('qualificationInfo', 'twelfthPercentage', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Diploma (Optional) */}
              <div className="p-6 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-md font-semibold text-gray-900 dark:text-white">Diploma (if applicable)</h4>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Add Diploma</span>
                  </label>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Board/University
                    </label>
                    <input
                      type="text"
                      value={formData.qualificationInfo.diplomaBoard}
                      onChange={(e) => handleInputChange('qualificationInfo', 'diplomaBoard', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      College Name
                    </label>
                    <input
                      type="text"
                      value={formData.qualificationInfo.diplomaCollege}
                      onChange={(e) => handleInputChange('qualificationInfo', 'diplomaCollege', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Branch
                    </label>
                    <input
                      type="text"
                      value={formData.qualificationInfo.diplomaBranch}
                      onChange={(e) => handleInputChange('qualificationInfo', 'diplomaBranch', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Year of Passing
                    </label>
                    <input
                      type="text"
                      value={formData.qualificationInfo.diplomaYear}
                      onChange={(e) => handleInputChange('qualificationInfo', 'diplomaYear', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Percentage
                    </label>
                    <input
                      type="text"
                      value={formData.qualificationInfo.diplomaPercentage}
                      onChange={(e) => handleInputChange('qualificationInfo', 'diplomaPercentage', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Undergraduate (Bachelor's) */}
              <div className="p-6 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-700">
                <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4">Bachelor's Degree <span className="text-red-500">*</span></h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Degree
                    </label>
                    <select
                      value={formData.qualificationInfo.ugDegree}
                      onChange={(e) => handleInputChange('qualificationInfo', 'ugDegree', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    >
                      {ugDegrees.map(deg => (
                        <option key={deg} value={deg}>{deg}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Specialization
                    </label>
                    <input
                      type="text"
                      value={formData.qualificationInfo.ugSpecialization}
                      onChange={(e) => handleInputChange('qualificationInfo', 'ugSpecialization', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="e.g., Computer Science"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      University
                    </label>
                    <input
                      type="text"
                      value={formData.qualificationInfo.ugUniversity}
                      onChange={(e) => handleInputChange('qualificationInfo', 'ugUniversity', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      College
                    </label>
                    <input
                      type="text"
                      value={formData.qualificationInfo.ugCollege}
                      onChange={(e) => handleInputChange('qualificationInfo', 'ugCollege', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Year of Passing
                    </label>
                    <input
                      type="text"
                      value={formData.qualificationInfo.ugYear}
                      onChange={(e) => handleInputChange('qualificationInfo', 'ugYear', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Percentage/CGPA
                    </label>
                    <input
                      type="text"
                      value={formData.qualificationInfo.ugPercentage}
                      onChange={(e) => handleInputChange('qualificationInfo', 'ugPercentage', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Class/Grade
                    </label>
                    <input
                      type="text"
                      value={formData.qualificationInfo.ugClass}
                      onChange={(e) => handleInputChange('qualificationInfo', 'ugClass', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="First Class / Distinction"
                    />
                  </div>
                </div>
              </div>

              {/* Postgraduate (Master's) */}
              <div className="p-6 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-md font-semibold text-gray-900 dark:text-white">Master's Degree</h4>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Add Master's</span>
                  </label>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Degree
                    </label>
                    <select
                      value={formData.qualificationInfo.pgDegree}
                      onChange={(e) => handleInputChange('qualificationInfo', 'pgDegree', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    >
                      <option value="">Select Degree</option>
                      {pgDegrees.map(deg => (
                        <option key={deg} value={deg}>{deg}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Specialization
                    </label>
                    <input
                      type="text"
                      value={formData.qualificationInfo.pgSpecialization}
                      onChange={(e) => handleInputChange('qualificationInfo', 'pgSpecialization', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      University
                    </label>
                    <input
                      type="text"
                      value={formData.qualificationInfo.pgUniversity}
                      onChange={(e) => handleInputChange('qualificationInfo', 'pgUniversity', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      College
                    </label>
                    <input
                      type="text"
                      value={formData.qualificationInfo.pgCollege}
                      onChange={(e) => handleInputChange('qualificationInfo', 'pgCollege', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Year of Passing
                    </label>
                    <input
                      type="text"
                      value={formData.qualificationInfo.pgYear}
                      onChange={(e) => handleInputChange('qualificationInfo', 'pgYear', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Percentage/CGPA
                    </label>
                    <input
                      type="text"
                      value={formData.qualificationInfo.pgPercentage}
                      onChange={(e) => handleInputChange('qualificationInfo', 'pgPercentage', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Class/Grade
                    </label>
                    <input
                      type="text"
                      value={formData.qualificationInfo.pgClass}
                      onChange={(e) => handleInputChange('qualificationInfo', 'pgClass', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Ph.D */}
              <div className="p-6 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-md font-semibold text-gray-900 dark:text-white">Doctorate (Ph.D)</h4>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Add Ph.D</span>
                  </label>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Thesis Title
                    </label>
                    <input
                      type="text"
                      value={formData.qualificationInfo.phdTitle}
                      onChange={(e) => handleInputChange('qualificationInfo', 'phdTitle', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      University
                    </label>
                    <input
                      type="text"
                      value={formData.qualificationInfo.phdUniversity}
                      onChange={(e) => handleInputChange('qualificationInfo', 'phdUniversity', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Year of Award
                    </label>
                    <input
                      type="text"
                      value={formData.qualificationInfo.phdYear}
                      onChange={(e) => handleInputChange('qualificationInfo', 'phdYear', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Guide Name
                    </label>
                    <input
                      type="text"
                      value={formData.qualificationInfo.phdGuide}
                      onChange={(e) => handleInputChange('qualificationInfo', 'phdGuide', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Status
                    </label>
                    <select
                      value={formData.qualificationInfo.phdStatus}
                      onChange={(e) => handleInputChange('qualificationInfo', 'phdStatus', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    >
                      <option value="completed">Completed</option>
                      <option value="pursuing">Pursuing</option>
                      <option value="submitted">Thesis Submitted</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Experience Tab */}
          {activeTab === 'experience' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Experience Details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Total Experience (Years)
                  </label>
                  <input
                    type="text"
                    value={formData.experienceInfo.totalExperience}
                    onChange={(e) => handleInputChange('experienceInfo', 'totalExperience', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="e.g., 10"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Teaching Experience
                  </label>
                  <input
                    type="text"
                    value={formData.experienceInfo.teachingExperience}
                    onChange={(e) => handleInputChange('experienceInfo', 'teachingExperience', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Industry Experience
                  </label>
                  <input
                    type="text"
                    value={formData.experienceInfo.industryExperience}
                    onChange={(e) => handleInputChange('experienceInfo', 'industryExperience', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Research Experience
                  </label>
                  <input
                    type="text"
                    value={formData.experienceInfo.researchExperience}
                    onChange={(e) => handleInputChange('experienceInfo', 'researchExperience', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Current Organization
                </label>
                <input
                  type="text"
                  value={formData.experienceInfo.currentOrganization}
                  onChange={(e) => handleInputChange('experienceInfo', 'currentOrganization', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Previous Organizations (comma separated)
                </label>
                <textarea
                  value={formData.experienceInfo.previousOrganizations.join(', ')}
                  onChange={(e) => handleArrayChange('experienceInfo', 'previousOrganizations', e.target.value)}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Org1, Org2, Org3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Certifications (comma separated)
                </label>
                <textarea
                  value={formData.experienceInfo.certifications.join(', ')}
                  onChange={(e) => handleArrayChange('experienceInfo', 'certifications', e.target.value)}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Cert1, Cert2, Cert3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Achievements/Awards (comma separated)
                </label>
                <textarea
                  value={formData.experienceInfo.achievements.join(', ')}
                  onChange={(e) => handleArrayChange('experienceInfo', 'achievements', e.target.value)}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Award1, Award2, Award3"
                />
              </div>
            </div>
          )}

          {/* Professional Information Tab */}
          {activeTab === 'professional' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Professional Information</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Areas of Expertise (comma separated)
                </label>
                <textarea
                  value={formData.professionalInfo.areasOfExpertise.join(', ')}
                  onChange={(e) => handleArrayChange('professionalInfo', 'areasOfExpertise', e.target.value)}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="AI, ML, Networks, Programming"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Subjects Can Teach (comma separated)
                </label>
                <textarea
                  value={formData.professionalInfo.subjectsCanTeach.join(', ')}
                  onChange={(e) => handleArrayChange('professionalInfo', 'subjectsCanTeach', e.target.value)}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Data Structures, Algorithms, DBMS"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Research Interests (comma separated)
                </label>
                <textarea
                  value={formData.professionalInfo.researchInterests.join(', ')}
                  onChange={(e) => handleArrayChange('professionalInfo', 'researchInterests', e.target.value)}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Research Area1, Area2, Area3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Publications (comma separated)
                </label>
                <textarea
                  value={formData.professionalInfo.publications.join(', ')}
                  onChange={(e) => handleArrayChange('professionalInfo', 'publications', e.target.value)}
                  rows="4"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Paper1, Paper2, Paper3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Conferences Attended (comma separated)
                </label>
                <textarea
                  value={formData.professionalInfo.conferences.join(', ')}
                  onChange={(e) => handleArrayChange('professionalInfo', 'conferences', e.target.value)}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Conf1, Conf2, Conf3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Workshops/FDPs Attended (comma separated)
                </label>
                <textarea
                  value={formData.professionalInfo.workshops.join(', ')}
                  onChange={(e) => handleArrayChange('professionalInfo', 'workshops', e.target.value)}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Workshop1, Workshop2, Workshop3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Professional Memberships (comma separated)
                </label>
                <textarea
                  value={formData.professionalInfo.professionalMemberships.join(', ')}
                  onChange={(e) => handleArrayChange('professionalInfo', 'professionalMemberships', e.target.value)}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="IEEE, ACM, ISTE"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Languages Known (comma separated)
                </label>
                <input
                  type="text"
                  value={formData.professionalInfo.languagesKnown.join(', ')}
                  onChange={(e) => handleArrayChange('professionalInfo', 'languagesKnown', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="English, Hindi, Marathi"
                />
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
                    placeholder="faculty@okhdfcbank"
                  />
                </div>
              </div>

              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                * Bank details are required for salary disbursement
              </p>
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
                />
                <label
                  htmlFor="document-upload"
                  className="cursor-pointer inline-flex flex-col items-center"
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
                        <button className="text-red-600 hover:text-red-700 text-sm">Remove</button>
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
                    'Educational Certificates (10th, 12th)',
                    'Degree Certificates (UG, PG, PhD)',
                    'Experience Certificates',
                    'PAN Card',
                    'Aadhar Card',
                    'Passport Size Photos',
                    'Latest Resume/CV',
                    'Research Publications (if any)',
                    'Certification Copies',
                    'Achievement/Award Certificates'
                  ].map((doc, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input type="checkbox" className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{doc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Emergency Contact Tab */}
          {activeTab === 'emergency' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Emergency Contact</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Contact Person Name
                  </label>
                  <input
                    type="text"
                    value={formData.emergencyInfo.contactName}
                    onChange={(e) => handleInputChange('emergencyInfo', 'contactName', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Relation
                  </label>
                  <input
                    type="text"
                    value={formData.emergencyInfo.relation}
                    onChange={(e) => handleInputChange('emergencyInfo', 'relation', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Spouse/Parent/Sibling"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.emergencyInfo.phone}
                    onChange={(e) => handleInputChange('emergencyInfo', 'phone', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.emergencyInfo.email}
                    onChange={(e) => handleInputChange('emergencyInfo', 'email', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Address
                  </label>
                  <textarea
                    value={formData.emergencyInfo.address}
                    onChange={(e) => handleInputChange('emergencyInfo', 'address', e.target.value)}
                    rows="2"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              <p className="text-sm text-red-500 dark:text-red-400 mt-2">
                * Emergency contact should be someone not living with the faculty
              </p>
            </div>
          )}
        </div>

        {/* Form Actions */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/admin/faculty')}
            className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Save Faculty
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddFaculty;