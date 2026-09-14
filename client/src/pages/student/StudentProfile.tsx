import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Modal } from '../../components/common/Modal';
import { DocumentUploadZone } from '../../components/common/DocumentUploadZone';
import {
  User,
  GraduationCap,
  FileCheck2,
  Award,
  FolderGit2,
  Trophy,
  Upload,
  CheckCircle2,
  AlertCircle,
  Clock,
  ExternalLink,
  Plus,
  Trash2,
  Save,
  Building2,
  ShieldCheck,
  Sparkles,
  Zap,
  TrendingUp,
  FileText,
  BadgeCheck,
  Search,
  Eye,
} from 'lucide-react';

export const StudentProfile: React.FC = () => {
  const { refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'BASIC' | 'ACADEMIC' | 'CERTIFICATES' | 'SKILLS' | 'PROJECTS' | 'ACHIEVEMENTS'>('BASIC');
  const [portfolio, setPortfolio] = useState<any>(null);
  const [evidenceProfile, setEvidenceProfile] = useState<any[]>([]);
  const [evidenceTimeline, setEvidenceTimeline] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modals state
  const [modalType, setModalType] = useState<'PROJECT' | 'CERT' | 'ACAD_REPORT' | 'ACHIEV' | 'SKILL' | 'EVIDENCE_DETAIL' | 'DOC_PREVIEW' | null>(null);
  const [selectedEvidenceDetail, setSelectedEvidenceDetail] = useState<any | null>(null);
  const [previewDocUrl, setPreviewDocUrl] = useState<string | null>(null);
  const [previewDocTitle, setPreviewDocTitle] = useState<string>('');

  // Form states
  const [basicForm, setBasicForm] = useState<any>({});
  const [projectForm, setProjectForm] = useState({ title: '', description: '', technologies: '', projectUrl: '', repoUrl: '' });
  const [certForm, setCertForm] = useState({ title: '', issuingOrganization: '', certificateType: 'Industry Certification', issueDate: '', credentialUrl: '', certificateDocUrl: '', skillsCovered: '' });
  const [acadReportForm, setAcadReportForm] = useState({ reportType: 'SEMESTER_MARKSHEET', academicYear: '2024-2025', semester: 'Semester 4', cgpa: '', percentage: '', documentUrl: '', description: '' });
  const [achievForm, setAchievForm] = useState({ title: '', achievementType: 'Academic Award & Gold Medal', level: 'National', position: '1st Place / Gold Medal / Winner', issuer: '', date: '', description: '', documentUrl: '' });
  const [skillForm, setSkillForm] = useState({ skillName: '', proficiencyLevel: 'INTERMEDIATE' });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [portRes, evProfRes, evTimeRes] = await Promise.all([
        api.get('/student/portfolio'),
        api.get('/student/evidence-profile').catch(() => ({ data: [] })),
        api.get('/student/evidence-timeline').catch(() => ({ data: [] })),
      ]);
      setPortfolio(portRes.data);
      setBasicForm(portRes.data || {});
      setEvidenceProfile(Array.isArray(evProfRes.data) ? evProfRes.data : []);
      setEvidenceTimeline(Array.isArray(evTimeRes.data) ? evTimeRes.data : []);
    } catch (err: any) {
      console.error('Failed to load portfolio data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveBasic = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      await api.put('/student/profile', basicForm);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      await refreshUser();
      fetchData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update profile.' });
    } finally {
      setSaving(false);
    }
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    setUploadingResume(true);
    setMessage(null);

    try {
      const res = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setBasicForm({ ...basicForm, resumeUrl: res.data.fileUrl });
      await api.put('/student/profile', { ...basicForm, resumeUrl: res.data.fileUrl });
      setMessage({ type: 'success', text: 'Resume uploaded and saved successfully!' });
      fetchData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to upload resume.' });
    } finally {
      setUploadingResume(false);
    }
  };

  // Add Item Handlers
  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/student/portfolio/projects', projectForm);
      setModalType(null);
      setProjectForm({ title: '', description: '', technologies: '', projectUrl: '', repoUrl: '' });
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to add project.');
    }
  };

  const handleAddCert = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/student/certifications', certForm);
      setModalType(null);
      setCertForm({ title: '', issuingOrganization: '', certificateType: 'Industry Certification', issueDate: '', credentialUrl: '', certificateDocUrl: '', skillsCovered: '' });
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to add certificate.');
    }
  };

  const handleAddAcadReport = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/student/academic-reports', acadReportForm);
      setModalType(null);
      setAcadReportForm({ reportType: 'SEMESTER_MARKSHEET', academicYear: '2024-2025', semester: 'Semester 4', cgpa: '', percentage: '', documentUrl: '', description: '' });
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to add academic report.');
    }
  };

  const handleAddAchiev = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/student/achievements', achievForm);
      setModalType(null);
      setAchievForm({ title: '', achievementType: 'Academic Award & Gold Medal', level: 'National', position: '1st Place / Gold Medal / Winner', issuer: '', date: '', description: '', documentUrl: '' });
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to add achievement.');
    }
  };

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/student/skills', {
        skillName: skillForm.skillName,
        proficiencyLevel: skillForm.proficiencyLevel,
      });
      setModalType(null);
      setSkillForm({ skillName: '', proficiencyLevel: 'INTERMEDIATE' });
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to add skill.');
    }
  };

  // Delete Item Handlers
  const handleDeleteItem = async (endpoint: string, id: string) => {
    if (!window.confirm('Are you sure you want to remove this item?')) return;
    try {
      await api.delete(`${endpoint}/${id}`);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to remove item.');
    }
  };

  const openDocPreview = (url: string, title: string) => {
    const fullUrl = url.startsWith('http') ? url : `http://localhost:5000${url}`;
    setPreviewDocUrl(fullUrl);
    setPreviewDocTitle(title);
    setModalType('DOC_PREVIEW');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
      </div>
    );
  }

  // Calculate profile completion score
  const filledBasic = [
    portfolio?.fullName,
    portfolio?.institutionName,
    portfolio?.department,
    portfolio?.degree,
    portfolio?.phone,
    portfolio?.bio,
    portfolio?.resumeUrl,
  ].filter(Boolean).length;
  const basicPct = Math.round((filledBasic / 7) * 20);
  const certPct = (portfolio?.certificates?.length || 0) > 0 ? 20 : 0;
  const skillPct = (portfolio?.skillProfiles?.length || 0) > 0 ? 20 : 0;
  const acadPct = (portfolio?.academicReports?.length || 0) > 0 || portfolio?.cgpa ? 15 : 0;
  const projPct = (portfolio?.projects?.length || 0) > 0 ? 15 : 0;
  const achievPct = (portfolio?.achievements?.length || 0) > 0 ? 10 : 0;
  const totalCompletion = Math.min(100, basicPct + certPct + skillPct + acadPct + projPct + achievPct);

  // Institution verification badge status
  const institutionStatus = portfolio?.accountStatus || (portfolio?.isVerified ? 'APPROVED' : 'PENDING');

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* 1. Header Banner & Profile Completion Gauge */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-brand-600 text-white flex items-center justify-center text-2xl font-bold shadow-md shadow-brand-500/20">
              {portfolio?.fullName ? portfolio.fullName.charAt(0).toUpperCase() : 'S'}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                  {portfolio?.fullName || 'Student Profile'}
                </h1>
                {/* Institution Affiliation Badge */}
                {institutionStatus === 'APPROVED' ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Verified by {portfolio?.institutionName || 'Institution'}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    Institution Affiliation: Pending Approval
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {portfolio?.degree || 'Degree'} &bull; {portfolio?.department || 'Department'} &bull; {portfolio?.institutionName || 'Institution'}
              </p>
            </div>
          </div>

          {/* Completion Meter */}
          <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/60 min-w-[240px]">
            <div className="relative w-12 h-12 flex items-center justify-center">
              <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-200 dark:text-slate-700"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-brand-600 dark:text-brand-400 transition-all duration-1000 ease-out"
                  strokeDasharray={`${totalCompletion}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute text-xs font-bold text-slate-800 dark:text-white">{totalCompletion}%</span>
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">Profile Strength</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                {totalCompletion >= 80 ? 'Comprehensive & Verified' : 'Complete tabs to reach 100%'}
              </div>
            </div>
          </div>
        </div>

        {/* 6 Tabs Navigation */}
        <div className="flex items-center gap-2 mt-8 overflow-x-auto pb-2 border-b border-slate-200 dark:border-slate-800 scrollbar-none">
          <button
            onClick={() => setActiveTab('BASIC')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeTab === 'BASIC'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            1. Basic & Affiliation
          </button>
          <button
            onClick={() => setActiveTab('ACADEMIC')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeTab === 'ACADEMIC'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            2. Academic Reports ({portfolio?.academicReports?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('CERTIFICATES')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeTab === 'CERTIFICATES'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <FileCheck2 className="w-3.5 h-3.5" />
            3. Certificates ({portfolio?.certificates?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('SKILLS')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeTab === 'SKILLS'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            4. Skills & Evidence ({evidenceProfile.length || portfolio?.skillProfiles?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('PROJECTS')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeTab === 'PROJECTS'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <FolderGit2 className="w-3.5 h-3.5" />
            5. Projects & Internships ({portfolio?.projects?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('ACHIEVEMENTS')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeTab === 'ACHIEVEMENTS'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            6. Achievements ({portfolio?.achievements?.length || 0})
          </button>
        </div>
      </div>

      {message && (
        <div
          className={`p-4 rounded-2xl text-xs flex items-center gap-3 border ${
            message.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
              : 'bg-rose-50 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* TAB 1: BASIC INFO */}
      {activeTab === 'BASIC' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-dashed border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-brand-100 dark:bg-brand-950 text-brand-600 dark:text-brand-400 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white">Official Resume / Curriculum Vitae</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {basicForm.resumeUrl ? (
                    <button
                      type="button"
                      onClick={() => openDocPreview(basicForm.resumeUrl, 'Resume / CV')}
                      className="text-brand-600 dark:text-brand-400 hover:underline font-semibold inline-flex items-center gap-1"
                    >
                      <Eye className="w-3 h-3" /> View Uploaded Resume
                    </button>
                  ) : (
                    'No resume uploaded yet (PDF or DOCX format, max 10MB)'
                  )}
                </p>
              </div>
            </div>

            <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-brand-700 dark:text-brand-300 bg-white dark:bg-slate-800 hover:bg-brand-50 dark:hover:bg-slate-700 border border-brand-200 dark:border-brand-700 rounded-xl shadow-sm transition-all">
              <Upload className="w-3.5 h-3.5" />
              {uploadingResume ? 'Uploading...' : basicForm.resumeUrl ? 'Replace Resume' : 'Upload Resume'}
              <input type="file" accept=".pdf,.doc,.docx" onChange={handleResumeUpload} className="hidden" />
            </label>
          </div>

          <form onSubmit={handleSaveBasic} className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800 pb-2">
                Personal & Contact Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={basicForm.fullName || ''}
                    onChange={(e) => setBasicForm({ ...basicForm, fullName: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={basicForm.phone || ''}
                    onChange={(e) => setBasicForm({ ...basicForm, phone: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Gender</label>
                  <select
                    value={basicForm.gender || 'Female'}
                    onChange={(e) => setBasicForm({ ...basicForm, gender: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Location</label>
                  <input
                    type="text"
                    value={basicForm.location || ''}
                    onChange={(e) => setBasicForm({ ...basicForm, location: e.target.value })}
                    placeholder="e.g., Bengaluru, Karnataka"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={basicForm.dob || ''}
                    onChange={(e) => setBasicForm({ ...basicForm, dob: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800 pb-2">
                Institution Affiliation & Academic Program
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Affiliated Institution Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={basicForm.institutionName || ''}
                      onChange={(e) => setBasicForm({ ...basicForm, institutionName: e.target.value })}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                    <div className="absolute right-3 top-2.5">
                      {institutionStatus === 'APPROVED' ? (
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Clock className="w-4 h-4 text-amber-500" />
                      )}
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Degree Program</label>
                  <input
                    type="text"
                    value={basicForm.degree || ''}
                    onChange={(e) => setBasicForm({ ...basicForm, degree: e.target.value })}
                    placeholder="e.g., BAMS / B.Tech / B.Sc"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Department</label>
                  <input
                    type="text"
                    value={basicForm.department || ''}
                    onChange={(e) => setBasicForm({ ...basicForm, department: e.target.value })}
                    placeholder="e.g., Kayachikitsa & Panchakarma"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Current Year</label>
                  <select
                    value={basicForm.currentYear || '4'}
                    onChange={(e) => setBasicForm({ ...basicForm, currentYear: parseInt(e.target.value, 10) })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="1">1st Year</option>
                    <option value="2">2nd Year</option>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year (Final Year)</option>
                    <option value="5">Internship Year</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Cumulative CGPA</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    value={basicForm.cgpa || ''}
                    onChange={(e) => setBasicForm({ ...basicForm, cgpa: parseFloat(e.target.value) })}
                    placeholder="e.g., 8.60"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800 pb-2">
                Bio & Career Direction
              </h3>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Professional Bio</label>
                <textarea
                  rows={3}
                  value={basicForm.bio || ''}
                  onChange={(e) => setBasicForm({ ...basicForm, bio: e.target.value })}
                  placeholder="Summarize your academic focus, research interests, and clinical/technical aspirations..."
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Career Interests & Target Disciplines
                </label>
                <input
                  type="text"
                  value={basicForm.careerInterests || ''}
                  onChange={(e) => setBasicForm({ ...basicForm, careerInterests: e.target.value })}
                  placeholder="e.g., Clinical Research Associate, Panchakarma Specialist, Regulatory Affairs"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save Profile Changes'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 2: ACADEMIC */}
      {activeTab === 'ACADEMIC' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Academic Reports & Semester Marksheets</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Official institutional transcripts, grade reports, and semester marksheets verified by faculty.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setModalType('ACAD_REPORT')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Marksheet / Report
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {portfolio?.academicReports?.map((report: any) => (
              <div
                key={report.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs">
                      {report.semester?.replace('Semester ', 'S') || 'S'}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">{report.semester} Marksheet</h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Academic Year: {report.academicYear}
                      </p>
                    </div>
                  </div>
                  {report.verificationStatus === 'VERIFIED' ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" /> Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                      <Clock className="w-3 h-3 text-amber-600" /> Pending Verification
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="text-slate-400 dark:text-slate-500 text-[11px]">SGPA / CGPA:</span>
                    <p className="font-bold text-slate-900 dark:text-white">{report.cgpa ? `${report.cgpa} / 10.0` : 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 dark:text-slate-500 text-[11px]">Percentage:</span>
                    <p className="font-bold text-slate-900 dark:text-white">{report.percentage ? `${report.percentage}%` : 'N/A'}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  {report.documentUrl ? (
                    <button
                      type="button"
                      onClick={() => openDocPreview(report.documentUrl, `${report.semester} Marksheet`)}
                      className="text-brand-600 dark:text-brand-400 text-xs font-semibold hover:underline inline-flex items-center gap-1"
                    >
                      <Eye className="w-3 h-3" /> View Transcript Document
                    </button>
                  ) : (
                    <span className="text-[11px] text-slate-400">No document attached</span>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDeleteItem('/student/academic-reports', report.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: CERTIFICATES */}
      {activeTab === 'CERTIFICATES' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Credentials & Course Certifications</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Verified credentials feed directly into the Evidence-Based Skill Verification System.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setModalType('CERT')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Certificate
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {portfolio?.certificates?.map((cert: any) => (
              <div
                key={cert.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                      <FileCheck2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">{cert.title}</h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">{cert.issuingOrganization}</p>
                    </div>
                  </div>
                  {cert.verificationStatus === 'VERIFIED' ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" /> Credential Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                      <Clock className="w-3 h-3 text-blue-600" /> Evidence Provided
                    </span>
                  )}
                </div>

                {cert.skillsCovered && (
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-1.5">
                    {cert.skillsCovered.split(',').map((s: string, idx: number) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                      >
                        {s.trim()}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between pt-2">
                  {cert.certificateDocUrl ? (
                    <button
                      type="button"
                      onClick={() => openDocPreview(cert.certificateDocUrl, cert.title)}
                      className="text-brand-600 dark:text-brand-400 text-xs font-semibold hover:underline inline-flex items-center gap-1"
                    >
                      <Eye className="w-3 h-3" /> View Certificate
                    </button>
                  ) : (
                    <span className="text-[11px] text-slate-400">No doc attached</span>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDeleteItem('/student/certifications', cert.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: SKILLS & EVIDENCE */}
      {activeTab === 'SKILLS' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Evidence-Based Skill Intelligence</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Skills categorized across 5 distinct verification tiers with confidence strength indicators.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setModalType('SKILL')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              Declare New Skill
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex flex-wrap items-center gap-3 text-xs">
            <span className="font-bold text-slate-700 dark:text-slate-300">Evidence Levels:</span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
              1. Self-Declared
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300">
              2. Evidence Provided
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
              3. Credential Verified
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300">
              4. Skill Assessed
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
              5. Industry Validated
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {evidenceProfile.map((skillItem: any) => {
              const strength = skillItem.evidenceStrength || 'LOW';
              const strengthColor =
                strength === 'HIGH'
                  ? 'bg-emerald-500 text-white'
                  : strength === 'MEDIUM'
                  ? 'bg-blue-500 text-white'
                  : 'bg-slate-400 text-white';

              return (
                <div
                  key={skillItem.skillId}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">{skillItem.skillName}</h4>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${strengthColor}`}>
                          {strength} CONFIDENCE
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">{skillItem.categoryName}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedEvidenceDetail(skillItem);
                        setModalType('EVIDENCE_DETAIL');
                      }}
                      className="px-3 py-1 bg-brand-50 dark:bg-brand-950/60 hover:bg-brand-100 text-brand-700 dark:text-brand-300 text-xs font-semibold rounded-lg transition-all"
                    >
                      View Evidence ({skillItem.evidenceList?.length || 0})
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold">Claimed Level</span>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">{skillItem.claimedLevel || 'Advanced'}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold">Measured Score</span>
                      <p className="font-bold text-brand-600 dark:text-brand-400">
                        {skillItem.measuredScore !== null ? `${skillItem.measuredScore}%` : 'Pending Assessment'}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-1">
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Verified Evidence Sources:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {skillItem.evidenceList?.map((ev: any) => {
                        const badgeStyle =
                          ev.evidenceType === 'INDUSTRY_VALIDATED'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300'
                            : ev.evidenceType === 'SKILL_ASSESSED'
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border-purple-300'
                            : ev.evidenceType === 'CREDENTIAL_VERIFIED'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300'
                            : ev.evidenceType === 'EVIDENCE_PROVIDED'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-300'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300';

                        return (
                          <span
                            key={ev.id}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold border ${badgeStyle}`}
                          >
                            <ShieldCheck className="w-3 h-3" />
                            {ev.evidenceType.replace(/_/g, ' ')}
                            {ev.score ? ` (${ev.score}%)` : ''}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {evidenceTimeline.length > 0 && (
            <div className="mt-8 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-brand-600" />
                Chronological Skill Verification Journey
              </h3>
              <div className="space-y-3">
                {evidenceTimeline.map((item: any, idx: number) => (
                  <div
                    key={item.id || idx}
                    className="flex items-start gap-4 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/60"
                  >
                    <div className="w-7 h-7 rounded-lg bg-brand-100 dark:bg-brand-950 text-brand-600 dark:text-brand-400 flex items-center justify-center shrink-0 font-bold text-xs">
                      {idx + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          {item.skillName} &bull; {item.evidenceType.replace(/_/g, ' ')}
                        </span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500">
                          {new Date(item.evidenceDate).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
                        {item.sourceName} {item.score ? `(Score: ${item.score}%)` : ''} &bull; Status: {item.status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 5: PROJECTS */}
      {activeTab === 'PROJECTS' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Applied Projects & Clinical Internships</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Showcase practical research dossiers, engineering systems, and hospital ward case studies.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setModalType('PROJECT')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Project
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {portfolio?.projects?.map((proj: any) => (
              <div
                key={proj.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                      <FolderGit2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">{proj.title}</h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">{proj.technologies}</p>
                    </div>
                  </div>
                  {proj.verificationStatus === 'VERIFIED' ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" /> Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                      <Clock className="w-3 h-3 text-amber-600" /> Under Review
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3">{proj.description}</p>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                  {proj.projectUrl || proj.repoUrl ? (
                    <a
                      href={proj.projectUrl || proj.repoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-brand-600 dark:text-brand-400 text-xs font-semibold hover:underline inline-flex items-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3" /> External Repository
                    </a>
                  ) : (
                    <span className="text-[11px] text-slate-400">No link attached</span>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDeleteItem('/student/portfolio/projects', proj.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: ACHIEVEMENTS */}
      {activeTab === 'ACHIEVEMENTS' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Honors, Awards & Competitions</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Recognitions from Ministry competitions, university rank awards, and national symposiums.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setModalType('ACHIEV')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Achievement
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {portfolio?.achievements?.map((ach: any) => (
              <div
                key={ach.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                      <Trophy className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">{ach.title}</h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">{ach.issuer} &bull; {ach.level} Level</p>
                    </div>
                  </div>
                  {ach.verificationStatus === 'VERIFIED' ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" /> Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                      <Clock className="w-3 h-3 text-amber-600" /> Pending Review
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300">{ach.description}</p>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                  {ach.documentUrl ? (
                    <button
                      type="button"
                      onClick={() => openDocPreview(ach.documentUrl, ach.title)}
                      className="text-brand-600 dark:text-brand-400 text-xs font-semibold hover:underline inline-flex items-center gap-1"
                    >
                      <Eye className="w-3 h-3" /> View Award Citation
                    </button>
                  ) : (
                    <span className="text-[11px] text-slate-400">No citation doc</span>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDeleteItem('/student/achievements', ach.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODALS */}
      <Modal isOpen={modalType === 'PROJECT'} onClose={() => setModalType(null)} title="Add Practical Project">
        <form onSubmit={handleAddProject} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Project Title *</label>
            <input
              type="text"
              required
              value={projectForm.title}
              onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
              placeholder="e.g., Ayurvedic Panchakarma Clinical Efficacy Protocol"
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Technologies / Core Competencies *</label>
            <input
              type="text"
              required
              value={projectForm.technologies}
              onChange={(e) => setProjectForm({ ...projectForm, technologies: e.target.value })}
              placeholder="e.g., Panchakarma SOPs, CTRI Protocol, Biostatistics, SPSS"
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Description *</label>
            <textarea
              rows={3}
              required
              value={projectForm.description}
              onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
              placeholder="Describe objectives, clinical methodology, statistical findings..."
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Live / Research URL</label>
              <input
                type="url"
                value={projectForm.projectUrl}
                onChange={(e) => setProjectForm({ ...projectForm, projectUrl: e.target.value })}
                placeholder="https://..."
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Repository URL</label>
              <input
                type="url"
                value={projectForm.repoUrl}
                onChange={(e) => setProjectForm({ ...projectForm, repoUrl: e.target.value })}
                placeholder="https://github.com/..."
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setModalType(null)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl"
            >
              Save Project
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={modalType === 'CERT'} onClose={() => setModalType(null)} title="Add Course Certificate / Credential">
        <form onSubmit={handleAddCert} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Certificate Title *</label>
            <input
              type="text"
              required
              value={certForm.title}
              onChange={(e) => setCertForm({ ...certForm, title: e.target.value })}
              placeholder="e.g., Certificate in AYUSH Good Clinical Practice (GCP)"
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Issuing Organization *</label>
            <input
              type="text"
              required
              value={certForm.issuingOrganization}
              onChange={(e) => setCertForm({ ...certForm, issuingOrganization: e.target.value })}
              placeholder="e.g., Patanjali Research Foundation / CDSCO"
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Skills Covered (comma separated)</label>
            <input
              type="text"
              value={certForm.skillsCovered}
              onChange={(e) => setCertForm({ ...certForm, skillsCovered: e.target.value })}
              placeholder="e.g., Clinical Trial Protocol, Ethics Committee, Biostatistics"
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Upload Certificate Document</label>
            <DocumentUploadZone
              onUploadSuccess={(url: string) => setCertForm({ ...certForm, certificateDocUrl: url })}
              fileUrl={certForm.certificateDocUrl}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setModalType(null)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl"
            >
              Submit Credential
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={modalType === 'ACAD_REPORT'} onClose={() => setModalType(null)} title="Add Semester Marksheet / Academic Transcript">
        <form onSubmit={handleAddAcadReport} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Academic Year *</label>
              <input
                type="text"
                required
                value={acadReportForm.academicYear}
                onChange={(e) => setAcadReportForm({ ...acadReportForm, academicYear: e.target.value })}
                placeholder="2024-2025"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Semester *</label>
              <select
                value={acadReportForm.semester}
                onChange={(e) => setAcadReportForm({ ...acadReportForm, semester: e.target.value })}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="Semester 1">Semester 1</option>
                <option value="Semester 2">Semester 2</option>
                <option value="Semester 3">Semester 3</option>
                <option value="Semester 4">Semester 4</option>
                <option value="Semester 5">Semester 5</option>
                <option value="Semester 6">Semester 6</option>
                <option value="Semester 7">Semester 7</option>
                <option value="Semester 8">Semester 8</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">SGPA / CGPA</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="10"
                value={acadReportForm.cgpa}
                onChange={(e) => setAcadReportForm({ ...acadReportForm, cgpa: e.target.value })}
                placeholder="8.65"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Percentage (%)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={acadReportForm.percentage}
                onChange={(e) => setAcadReportForm({ ...acadReportForm, percentage: e.target.value })}
                placeholder="86.5"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Upload Marksheet Document</label>
            <DocumentUploadZone
              onUploadSuccess={(url: string) => setAcadReportForm({ ...acadReportForm, documentUrl: url })}
              fileUrl={acadReportForm.documentUrl}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setModalType(null)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl"
            >
              Save Marksheet
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={modalType === 'ACHIEV'} onClose={() => setModalType(null)} title="Add Honor or Achievement">
        <form onSubmit={handleAddAchiev} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Award Title *</label>
            <input
              type="text"
              required
              value={achievForm.title}
              onChange={(e) => setAchievForm({ ...achievForm, title: e.target.value })}
              placeholder="e.g., National AYUSH Research Conclave Gold Medal"
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Issuing Body *</label>
              <input
                type="text"
                required
                value={achievForm.issuer}
                onChange={(e) => setAchievForm({ ...achievForm, issuer: e.target.value })}
                placeholder="e.g., Ministry of Ayush"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Level</label>
              <select
                value={achievForm.level}
                onChange={(e) => setAchievForm({ ...achievForm, level: e.target.value })}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="National">National</option>
                <option value="State">State</option>
                <option value="University">University</option>
                <option value="International">International</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Description</label>
            <textarea
              rows={2}
              value={achievForm.description}
              onChange={(e) => setAchievForm({ ...achievForm, description: e.target.value })}
              placeholder="Award details, citation, or paper presentation topic..."
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Award Certificate / Citation</label>
            <DocumentUploadZone
              onUploadSuccess={(url: string) => setAchievForm({ ...achievForm, documentUrl: url })}
              fileUrl={achievForm.documentUrl}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setModalType(null)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl"
            >
              Save Achievement
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={modalType === 'SKILL'} onClose={() => setModalType(null)} title="Declare New Skill">
        <form onSubmit={handleAddSkill} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Skill Name *</label>
            <input
              type="text"
              required
              value={skillForm.skillName}
              onChange={(e) => setSkillForm({ ...skillForm, skillName: e.target.value })}
              placeholder="e.g., Panchakarma Clinical Research"
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Self-Declared Proficiency Level</label>
            <select
              value={skillForm.proficiencyLevel}
              onChange={(e) => setSkillForm({ ...skillForm, proficiencyLevel: e.target.value })}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              <option value="BEGINNER">Beginner</option>
              <option value="INTERMEDIATE">Intermediate</option>
              <option value="ADVANCED">Advanced</option>
              <option value="EXPERT">Expert</option>
            </select>
          </div>
          <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 text-[11px]">
            Declared skills enter Level 1 (Self-Declared). You can elevate this skill to Level 3 or 4 by uploading verified certificates or completing SkillBridge Assessments.
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setModalType(null)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl"
            >
              Declare Skill
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={modalType === 'EVIDENCE_DETAIL'}
        onClose={() => setModalType(null)}
        title={`Evidence Profile: ${selectedEvidenceDetail?.skillName || 'Skill'}`}
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold">Overall Evidence Strength</span>
              <p className="font-extrabold text-sm text-brand-600 dark:text-brand-400">
                {selectedEvidenceDetail?.evidenceStrength} CONFIDENCE
              </p>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold">Verified Evidence Items</span>
              <p className="font-bold text-slate-800 dark:text-white">
                {selectedEvidenceDetail?.evidenceList?.length || 0} Records
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Evidence Records & Verification Sources
            </h4>
            {selectedEvidenceDetail?.evidenceList?.map((ev: any, idx: number) => (
              <div
                key={ev.id || idx}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-brand-600" />
                    {ev.evidenceType.replace(/_/g, ' ')}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                    Status: {ev.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 dark:text-slate-300">
                  <div>
                    <span className="text-slate-400">Source / Assessor:</span>
                    <p className="font-semibold">{ev.sourceName}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Date Logged:</span>
                    <p className="font-semibold">{new Date(ev.evidenceDate).toLocaleDateString()}</p>
                  </div>
                  {ev.score !== null && (
                    <div>
                      <span className="text-slate-400">Measured Score:</span>
                      <p className="font-bold text-emerald-600 dark:text-emerald-400">{ev.score}%</p>
                    </div>
                  )}
                  {ev.credentialId && (
                    <div>
                      <span className="text-slate-400">Credential ID:</span>
                      <p className="font-mono text-[10px]">{ev.credentialId}</p>
                    </div>
                  )}
                </div>

                {ev.remarks && (
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 italic bg-slate-50 dark:bg-slate-900/50 p-2 rounded-lg">
                    {ev.remarks}
                  </p>
                )}

                {ev.documentUrl && (
                  <button
                    type="button"
                    onClick={() => openDocPreview(ev.documentUrl, `${selectedEvidenceDetail.skillName} Evidence`)}
                    className="text-brand-600 dark:text-brand-400 text-xs font-semibold hover:underline inline-flex items-center gap-1 pt-1"
                  >
                    <Eye className="w-3 h-3" /> View Verified Credential Document
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={() => setModalType(null)}
              className="px-5 py-2 text-xs font-bold text-white bg-slate-800 hover:bg-slate-900 rounded-xl"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={modalType === 'DOC_PREVIEW'}
        onClose={() => setModalType(null)}
        title={`Document Preview: ${previewDocTitle}`}
      >
        <div className="space-y-4">
          {previewDocUrl && (
            <div className="w-full h-96 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              {previewDocUrl.endsWith('.pdf') ? (
                <iframe src={previewDocUrl} className="w-full h-full" title={previewDocTitle} />
              ) : (
                <img src={previewDocUrl} alt={previewDocTitle} className="max-h-full max-w-full object-contain" />
              )}
            </div>
          )}
          <div className="flex items-center justify-between">
            <a
              href={previewDocUrl || '#'}
              target="_blank"
              rel="noreferrer"
              className="text-brand-600 dark:text-brand-400 text-xs font-semibold hover:underline inline-flex items-center gap-1"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Open in New Tab
            </a>
            <button
              type="button"
              onClick={() => setModalType(null)}
              className="px-4 py-2 text-xs font-bold text-white bg-slate-800 hover:bg-slate-900 rounded-xl"
            >
              Close Preview
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
