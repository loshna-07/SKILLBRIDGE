import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Navbar } from '../../components/common/Navbar';
import { UserRole } from '../../types';
import {
  GraduationCap,
  Building2,
  Briefcase,
  School,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<UserRole>('STUDENT');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { register, getRoleDashboardPath } = useAuth();
  const navigate = useNavigate();

  // Student Form State
  const [studentForm, setStudentForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    dob: '',
    gender: 'Male',
    institutionName: '',
    department: '',
    degree: '',
    currentYear: '3',
    cgpa: '',
    graduationYear: '2027',
    location: '',
  });

  // Academician Form State
  const [academicianForm, setAcademicianForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    institutionName: '',
    department: '',
    designation: '',
    yearsOfExperience: '5',
    areasOfExpertise: '',
    location: '',
  });

  // Industry Form State
  const [industryForm, setIndustryForm] = useState({
    companyName: '',
    officialEmail: '',
    password: '',
    confirmPassword: '',
    industrySector: '',
    companySize: '51-200',
    website: '',
    location: '',
    description: '',
    contactPerson: '',
    contactNumber: '',
  });

  // Institution Form State
  const [institutionForm, setInstitutionForm] = useState({
    institutionName: '',
    officialEmail: '',
    password: '',
    confirmPassword: '',
    institutionType: 'Autonomous College',
    affiliatedUniversity: '',
    address: '',
    website: '',
    contactPerson: '',
    contactNumber: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    let payload: any = {};
    if (selectedRole === 'STUDENT') {
      if (studentForm.password !== studentForm.confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
      payload = studentForm;
    } else if (selectedRole === 'ACADEMICIAN') {
      if (academicianForm.password !== academicianForm.confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
      payload = academicianForm;
    } else if (selectedRole === 'INDUSTRY') {
      if (industryForm.password !== industryForm.confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
      payload = {
        ...industryForm,
        email: industryForm.officialEmail,
      };
    } else if (selectedRole === 'INSTITUTION') {
      if (institutionForm.password !== institutionForm.confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
      payload = {
        ...institutionForm,
        email: institutionForm.officialEmail,
      };
    }

    setLoading(true);
    const result = await register(selectedRole, payload);
    setLoading(false);

    if (result.success) {
      navigate(getRoleDashboardPath(selectedRole));
    } else {
      setError(result.message || 'Registration failed.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />

      <div className="flex-1 max-w-4xl w-full mx-auto px-4 py-12">
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xl shadow-slate-200/50">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Create Your SkillBridge Account</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-2">
              Select your role to unlock targeted skill mapping, recruitment, and academic collaboration tools.
            </p>
          </div>

          {/* Role Selection Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            <button
              type="button"
              onClick={() => setSelectedRole('STUDENT')}
              className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all ${
                selectedRole === 'STUDENT'
                  ? 'border-brand-600 bg-brand-50/70 text-brand-700 shadow-sm ring-2 ring-brand-600/20'
                  : 'border-slate-200 hover:border-slate-300 text-slate-600'
              }`}
            >
              <GraduationCap className="w-6 h-6" />
              <span className="text-xs font-bold">Student</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedRole('INDUSTRY')}
              className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all ${
                selectedRole === 'INDUSTRY'
                  ? 'border-purple-600 bg-purple-50/70 text-purple-700 shadow-sm ring-2 ring-purple-600/20'
                  : 'border-slate-200 hover:border-slate-300 text-slate-600'
              }`}
            >
              <Briefcase className="w-6 h-6" />
              <span className="text-xs font-bold">Industry</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedRole('ACADEMICIAN')}
              className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all ${
                selectedRole === 'ACADEMICIAN'
                  ? 'border-amber-600 bg-amber-50/70 text-amber-700 shadow-sm ring-2 ring-amber-600/20'
                  : 'border-slate-200 hover:border-slate-300 text-slate-600'
              }`}
            >
              <Building2 className="w-6 h-6" />
              <span className="text-xs font-bold">Academician</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedRole('INSTITUTION')}
              className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all ${
                selectedRole === 'INSTITUTION'
                  ? 'border-emerald-600 bg-emerald-50/70 text-emerald-700 shadow-sm ring-2 ring-emerald-600/20'
                  : 'border-slate-200 hover:border-slate-300 text-slate-600'
              }`}
            >
              <School className="w-6 h-6" />
              <span className="text-xs font-bold">Institution</span>
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-3 text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Student Registration Fields */}
            {selectedRole === 'STUDENT' && (
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b pb-2">
                  Student Academic & Personal Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={studentForm.fullName}
                      onChange={(e) => setStudentForm({ ...studentForm, fullName: e.target.value })}
                      placeholder="e.g., Aarav Sharma"
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={studentForm.email}
                      onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
                      placeholder="student@college.edu"
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Password *</label>
                    <input
                      type="password"
                      required
                      value={studentForm.password}
                      onChange={(e) => setStudentForm({ ...studentForm, password: e.target.value })}
                      placeholder="••••••••"
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Confirm Password *</label>
                    <input
                      type="password"
                      required
                      value={studentForm.confirmPassword}
                      onChange={(e) => setStudentForm({ ...studentForm, confirmPassword: e.target.value })}
                      placeholder="••••••••"
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      value={studentForm.phone}
                      onChange={(e) => setStudentForm({ ...studentForm, phone: e.target.value })}
                      placeholder="+91 9876543210"
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Date of Birth</label>
                    <input
                      type="date"
                      value={studentForm.dob}
                      onChange={(e) => setStudentForm({ ...studentForm, dob: e.target.value })}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Gender</label>
                    <select
                      value={studentForm.gender}
                      onChange={(e) => setStudentForm({ ...studentForm, gender: e.target.value })}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Institution Name *</label>
                    <input
                      type="text"
                      required
                      value={studentForm.institutionName}
                      onChange={(e) => setStudentForm({ ...studentForm, institutionName: e.target.value })}
                      placeholder="e.g., IIT Delhi / NIT Trichy"
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Department *</label>
                    <input
                      type="text"
                      required
                      value={studentForm.department}
                      onChange={(e) => setStudentForm({ ...studentForm, department: e.target.value })}
                      placeholder="e.g., Computer Science and Engineering"
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Degree *</label>
                    <input
                      type="text"
                      required
                      value={studentForm.degree}
                      onChange={(e) => setStudentForm({ ...studentForm, degree: e.target.value })}
                      placeholder="e.g., B.Tech / B.E."
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Current Year</label>
                    <select
                      value={studentForm.currentYear}
                      onChange={(e) => setStudentForm({ ...studentForm, currentYear: e.target.value })}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                    >
                      <option value="1">1st Year</option>
                      <option value="2">2nd Year</option>
                      <option value="3">3rd Year</option>
                      <option value="4">4th Year</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">CGPA (out of 10)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="10"
                      value={studentForm.cgpa}
                      onChange={(e) => setStudentForm({ ...studentForm, cgpa: e.target.value })}
                      placeholder="e.g., 8.65"
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Graduation Year</label>
                    <input
                      type="number"
                      value={studentForm.graduationYear}
                      onChange={(e) => setStudentForm({ ...studentForm, graduationYear: e.target.value })}
                      placeholder="2027"
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Location</label>
                    <input
                      type="text"
                      value={studentForm.location}
                      onChange={(e) => setStudentForm({ ...studentForm, location: e.target.value })}
                      placeholder="City, State"
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Academician Registration Fields */}
            {selectedRole === 'ACADEMICIAN' && (
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b pb-2">
                  Faculty Academician Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={academicianForm.fullName}
                      onChange={(e) => setAcademicianForm({ ...academicianForm, fullName: e.target.value })}
                      placeholder="Dr. Rajesh Kumar"
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={academicianForm.email}
                      onChange={(e) => setAcademicianForm({ ...academicianForm, email: e.target.value })}
                      placeholder="faculty@university.edu"
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Password *</label>
                    <input
                      type="password"
                      required
                      value={academicianForm.password}
                      onChange={(e) => setAcademicianForm({ ...academicianForm, password: e.target.value })}
                      placeholder="••••••••"
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Confirm Password *</label>
                    <input
                      type="password"
                      required
                      value={academicianForm.confirmPassword}
                      onChange={(e) => setAcademicianForm({ ...academicianForm, confirmPassword: e.target.value })}
                      placeholder="••••••••"
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      value={academicianForm.phone}
                      onChange={(e) => setAcademicianForm({ ...academicianForm, phone: e.target.value })}
                      placeholder="+91 9876543210"
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Institution Name *</label>
                    <input
                      type="text"
                      required
                      value={academicianForm.institutionName}
                      onChange={(e) => setAcademicianForm({ ...academicianForm, institutionName: e.target.value })}
                      placeholder="e.g., Delhi Technological University"
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Department *</label>
                    <input
                      type="text"
                      required
                      value={academicianForm.department}
                      onChange={(e) => setAcademicianForm({ ...academicianForm, department: e.target.value })}
                      placeholder="e.g., Information Technology"
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Designation *</label>
                    <input
                      type="text"
                      required
                      value={academicianForm.designation}
                      onChange={(e) => setAcademicianForm({ ...academicianForm, designation: e.target.value })}
                      placeholder="e.g., Associate Professor & HOD"
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Years of Experience</label>
                    <input
                      type="number"
                      value={academicianForm.yearsOfExperience}
                      onChange={(e) => setAcademicianForm({ ...academicianForm, yearsOfExperience: e.target.value })}
                      placeholder="8"
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Areas of Expertise</label>
                    <input
                      type="text"
                      value={academicianForm.areasOfExpertise}
                      onChange={(e) => setAcademicianForm({ ...academicianForm, areasOfExpertise: e.target.value })}
                      placeholder="e.g., Cloud Computing, AI, VLSI"
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Location</label>
                    <input
                      type="text"
                      value={academicianForm.location}
                      onChange={(e) => setAcademicianForm({ ...academicianForm, location: e.target.value })}
                      placeholder="City, State"
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Industry Registration Fields */}
            {selectedRole === 'INDUSTRY' && (
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b pb-2">
                  Company & Recruiter Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Company Name *</label>
                    <input
                      type="text"
                      required
                      value={industryForm.companyName}
                      onChange={(e) => setIndustryForm({ ...industryForm, companyName: e.target.value })}
                      placeholder="e.g., TechNova Solutions Pvt Ltd"
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Official Company Email *</label>
                    <input
                      type="email"
                      required
                      value={industryForm.officialEmail}
                      onChange={(e) => setIndustryForm({ ...industryForm, officialEmail: e.target.value })}
                      placeholder="careers@company.com"
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Password *</label>
                    <input
                      type="password"
                      required
                      value={industryForm.password}
                      onChange={(e) => setIndustryForm({ ...industryForm, password: e.target.value })}
                      placeholder="••••••••"
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Confirm Password *</label>
                    <input
                      type="password"
                      required
                      value={industryForm.confirmPassword}
                      onChange={(e) => setIndustryForm({ ...industryForm, confirmPassword: e.target.value })}
                      placeholder="••••••••"
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Industry Sector *</label>
                    <input
                      type="text"
                      required
                      value={industryForm.industrySector}
                      onChange={(e) => setIndustryForm({ ...industryForm, industrySector: e.target.value })}
                      placeholder="e.g., Software Engineering, FinTech, Healthcare"
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Company Size</label>
                    <select
                      value={industryForm.companySize}
                      onChange={(e) => setIndustryForm({ ...industryForm, companySize: e.target.value })}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                    >
                      <option value="1-10">1-10 Employees (Startup)</option>
                      <option value="11-50">11-50 Employees</option>
                      <option value="51-200">51-200 Employees (Mid-size)</option>
                      <option value="201-1000">201-1000 Employees</option>
                      <option value="1000+">1000+ Employees (Enterprise)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Company Website</label>
                    <input
                      type="url"
                      value={industryForm.website}
                      onChange={(e) => setIndustryForm({ ...industryForm, website: e.target.value })}
                      placeholder="https://company.com"
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Location</label>
                    <input
                      type="text"
                      value={industryForm.location}
                      onChange={(e) => setIndustryForm({ ...industryForm, location: e.target.value })}
                      placeholder="Bengaluru, Karnataka"
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Person</label>
                    <input
                      type="text"
                      value={industryForm.contactPerson}
                      onChange={(e) => setIndustryForm({ ...industryForm, contactPerson: e.target.value })}
                      placeholder="Priya Verma (HR Lead)"
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Number</label>
                    <input
                      type="tel"
                      value={industryForm.contactNumber}
                      onChange={(e) => setIndustryForm({ ...industryForm, contactNumber: e.target.value })}
                      placeholder="+91 9876543210"
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Company Description</label>
                    <textarea
                      rows={3}
                      value={industryForm.description}
                      onChange={(e) => setIndustryForm({ ...industryForm, description: e.target.value })}
                      placeholder="Brief overview of company focus, technologies, and products..."
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Institution Registration Fields */}
            {selectedRole === 'INSTITUTION' && (
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b pb-2">
                  Academic Institution Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Institution Name *</label>
                    <input
                      type="text"
                      required
                      value={institutionForm.institutionName}
                      onChange={(e) => setInstitutionForm({ ...institutionForm, institutionName: e.target.value })}
                      placeholder="e.g., National Institute of Technology"
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Official Email *</label>
                    <input
                      type="email"
                      required
                      value={institutionForm.officialEmail}
                      onChange={(e) => setInstitutionForm({ ...institutionForm, officialEmail: e.target.value })}
                      placeholder="registrar@nit.edu"
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Password *</label>
                    <input
                      type="password"
                      required
                      value={institutionForm.password}
                      onChange={(e) => setInstitutionForm({ ...institutionForm, password: e.target.value })}
                      placeholder="••••••••"
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Confirm Password *</label>
                    <input
                      type="password"
                      required
                      value={institutionForm.confirmPassword}
                      onChange={(e) => setInstitutionForm({ ...institutionForm, confirmPassword: e.target.value })}
                      placeholder="••••••••"
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Institution Type *</label>
                    <select
                      value={institutionForm.institutionType}
                      onChange={(e) => setInstitutionForm({ ...institutionForm, institutionType: e.target.value })}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                    >
                      <option value="Central University">Central University</option>
                      <option value="State University">State University</option>
                      <option value="Deemed University">Deemed University</option>
                      <option value="Autonomous College">Autonomous College</option>
                      <option value="Affiliated Engineering College">Affiliated Engineering College</option>
                      <option value="Polytechnic Institute">Polytechnic Institute</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Affiliated University</label>
                    <input
                      type="text"
                      value={institutionForm.affiliatedUniversity}
                      onChange={(e) => setInstitutionForm({ ...institutionForm, affiliatedUniversity: e.target.value })}
                      placeholder="e.g., Anna University / VTU"
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Campus Address</label>
                    <input
                      type="text"
                      value={institutionForm.address}
                      onChange={(e) => setInstitutionForm({ ...institutionForm, address: e.target.value })}
                      placeholder="Campus Avenue, City, State, PIN"
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Official Website</label>
                    <input
                      type="url"
                      value={institutionForm.website}
                      onChange={(e) => setInstitutionForm({ ...institutionForm, website: e.target.value })}
                      placeholder="https://institute.edu.in"
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Placement/Contact Officer</label>
                    <input
                      type="text"
                      value={institutionForm.contactPerson}
                      onChange={(e) => setInstitutionForm({ ...institutionForm, contactPerson: e.target.value })}
                      placeholder="Dr. S. Raman (Dean of Placement)"
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Number</label>
                    <input
                      type="tel"
                      value={institutionForm.contactNumber}
                      onChange={(e) => setInstitutionForm({ ...institutionForm, contactNumber: e.target.value })}
                      placeholder="+91 9876543210"
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200"
                    />
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 disabled:opacity-50 rounded-xl transition-all shadow-md shadow-brand-500/20 flex items-center justify-center gap-2 mt-6"
            >
              {loading ? 'Creating Account...' : `Register as ${selectedRole.toLowerCase()}`}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-700">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
