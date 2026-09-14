import React, { useEffect, useState, useMemo } from 'react';
import api from '../../services/api';
import { Modal } from '../../components/common/Modal';
import { EmptyState } from '../../components/common/EmptyState';
import { DocumentUploadZone } from '../../components/common/DocumentUploadZone';
import {
  FileCheck2,
  Plus,
  Trash2,
  FolderGit2,
  Award,
  Briefcase,
  GraduationCap,
  ExternalLink,
  CheckCircle2,
  Clock,
  XCircle,
  Trophy,
  BookOpen,
  FileText,
  Sparkles,
  Eye,
  ShieldCheck,
  Calendar,
  Building2,
  TrendingUp,
  Tag,
  Medal,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const StudentPortfolio: React.FC = () => {
  const [portfolio, setPortfolio] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    'ALL' | 'ACADEMIC_REPORTS' | 'CERTIFICATIONS' | 'ACHIEVEMENTS' | 'SKILLS' | 'PROJECTS' | 'INTERNSHIPS' | 'EDUCATION' | 'TRAINING' | 'ASSESSMENTS' | 'RESUME'
  >('ALL');

  // Preview Document Modal State
  const [previewDocUrl, setPreviewDocUrl] = useState<string | null>(null);
  const [previewDocTitle, setPreviewDocTitle] = useState<string>('');
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  // Quick Action Modal Type
  const [modalType, setModalType] = useState<
    'PROJECT' | 'CERT' | 'INTERN' | 'EDU' | 'SKILL' | 'ACHIEV' | 'ACAD_REPORT' | 'TRAIN' | 'RESUME' | 'PUBLIC_PREVIEW' | null
  >(null);

  // Forms
  const [projectForm, setProjectForm] = useState({ title: '', description: '', technologies: '', projectUrl: '', repoUrl: '' });
  const [certForm, setCertForm] = useState({ title: '', issuingOrganization: '', certificateType: 'Industry Certification', issueDate: '', credentialUrl: '', certificateDocUrl: '', skillsCovered: '' });
  const [acadReportForm, setAcadReportForm] = useState({ reportType: 'SEMESTER_MARKSHEET', academicYear: '2024-2025', semester: 'Semester 4', cgpa: '', percentage: '', documentUrl: '', description: '' });
  const [achievForm, setAchievForm] = useState({ title: '', achievementType: 'Academic Award & Gold Medal', level: 'National', position: '1st Place / Gold Medal / Winner', issuer: '', date: '', description: '', documentUrl: '' });
  const [internForm, setInternForm] = useState({ companyName: '', role: '', startDate: '', endDate: '', description: '', certificateUrl: '' });
  const [eduForm, setEduForm] = useState({ institution: '', degree: '', fieldOfStudy: '', startYear: '2023', endYear: '2027', grade: '' });
  const [skillForm, setSkillForm] = useState({ skillId: '', skillName: '', proficiencyLevel: 'INTERMEDIATE' });
  const [trainForm, setTrainForm] = useState({ title: '', provider: '', duration: '', certificateUrl: '' });
  const [resumeForm, setResumeForm] = useState({ resumeUrl: '' });

  const fetchPortfolio = () => {
    setLoading(true);
    api
      .get('/student/portfolio')
      .then((res) => {
        setPortfolio(res.data);
        if (res.data?.resumeUrl) {
          setResumeForm({ resumeUrl: res.data.resumeUrl });
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const handleOpenDocPreview = (url: string, title: string) => {
    const fullUrl = url.startsWith('http') ? url : `http://localhost:5000${url}`;
    setPreviewDocUrl(fullUrl);
    setPreviewDocTitle(title);
    setIsPreviewModalOpen(true);
  };

  // Mutators
  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/student/portfolio/projects', projectForm);
      setModalType(null);
      setProjectForm({ title: '', description: '', technologies: '', projectUrl: '', repoUrl: '' });
      fetchPortfolio();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to add project.');
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (!window.confirm('Delete this project?')) return;
    try {
      await api.delete(`/student/portfolio/projects/${id}`);
      fetchPortfolio();
    } catch (err: any) {
      alert('Failed to delete project.');
    }
  };

  const handleAddCert = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/student/certifications', certForm);
      setModalType(null);
      setCertForm({ title: '', issuingOrganization: '', certificateType: 'Industry Certification', issueDate: '', credentialUrl: '', certificateDocUrl: '', skillsCovered: '' });
      fetchPortfolio();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to add certification.');
    }
  };

  const handleDeleteCert = async (id: string) => {
    if (!window.confirm('Delete this certification?')) return;
    try {
      await api.delete(`/student/certifications/${id}`);
      fetchPortfolio();
    } catch (err: any) {
      alert('Failed to delete certification.');
    }
  };

  const handleAddAcadReport = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/student/academic-reports', acadReportForm);
      setModalType(null);
      setAcadReportForm({ reportType: 'SEMESTER_MARKSHEET', academicYear: '2024-2025', semester: 'Semester 4', cgpa: '', percentage: '', documentUrl: '', description: '' });
      fetchPortfolio();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to add academic report.');
    }
  };

  const handleDeleteAcadReport = async (id: string) => {
    if (!window.confirm('Delete this academic report?')) return;
    try {
      await api.delete(`/student/academic-reports/${id}`);
      fetchPortfolio();
    } catch (err: any) {
      alert('Failed to delete academic report.');
    }
  };

  const handleAddAchiev = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/student/achievements', achievForm);
      setModalType(null);
      setAchievForm({ title: '', achievementType: 'Academic Award & Gold Medal', level: 'National', position: '1st Place / Gold Medal / Winner', issuer: '', date: '', description: '', documentUrl: '' });
      fetchPortfolio();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to add achievement.');
    }
  };

  const handleDeleteAchiev = async (id: string) => {
    if (!window.confirm('Delete this achievement?')) return;
    try {
      await api.delete(`/student/achievements/${id}`);
      fetchPortfolio();
    } catch (err: any) {
      alert('Failed to delete achievement.');
    }
  };

  const handleAddIntern = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/student/portfolio/internships', internForm);
      setModalType(null);
      setInternForm({ companyName: '', role: '', startDate: '', endDate: '', description: '', certificateUrl: '' });
      fetchPortfolio();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to add internship.');
    }
  };

  const handleDeleteIntern = async (id: string) => {
    if (!window.confirm('Delete this internship?')) return;
    try {
      await api.delete(`/student/portfolio/internships/${id}`);
      fetchPortfolio();
    } catch (err: any) {
      alert('Failed to delete internship.');
    }
  };

  const handleAddEdu = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/student/portfolio/education', eduForm);
      setModalType(null);
      setEduForm({ institution: '', degree: '', fieldOfStudy: '', startYear: '2023', endYear: '2027', grade: '' });
      fetchPortfolio();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to add education.');
    }
  };

  const handleDeleteEdu = async (id: string) => {
    if (!window.confirm('Delete this education record?')) return;
    try {
      await api.delete(`/student/portfolio/education/${id}`);
      fetchPortfolio();
    } catch (err: any) {
      alert('Failed to delete education.');
    }
  };

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/student/portfolio/skills', skillForm);
      setModalType(null);
      setSkillForm({ skillId: '', skillName: '', proficiencyLevel: 'INTERMEDIATE' });
      fetchPortfolio();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to add skill.');
    }
  };

  const handleDeleteSkill = async (id: string) => {
    if (!window.confirm('Remove this skill from your portfolio?')) return;
    try {
      await api.delete(`/student/portfolio/skills/${id}`);
      fetchPortfolio();
    } catch (err: any) {
      alert('Failed to remove skill.');
    }
  };

  const handleUpdateResume = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.put('/student/portfolio/resume', resumeForm);
      setModalType(null);
      fetchPortfolio();
      alert('Resume updated successfully. Status is Pending Verification.');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update resume.');
    }
  };

  // Verification Badge Renderer
  const renderVerificationBadge = (status?: string, remarks?: string) => {
    const s = status || 'PENDING';
    if (s === 'VERIFIED') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-2.5 py-0.5 rounded-full shadow-xs">
          <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
          ✓ VERIFIED
        </span>
      );
    }
    if (s === 'REJECTED') {
      return (
        <div className="flex flex-col items-end gap-0.5">
          <span
            title={remarks || 'Rejected by institution verification authority.'}
            className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 px-2.5 py-0.5 rounded-full shadow-xs"
          >
            <XCircle className="w-3 h-3 text-rose-600 dark:text-rose-400" />
            ✕ REJECTED
          </span>
          {remarks && (
            <span className="text-[10px] text-rose-600 dark:text-rose-400 max-w-[180px] truncate text-right font-medium">
              Note: {remarks}
            </span>
          )}
        </div>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 px-2.5 py-0.5 rounded-full shadow-xs">
        <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400" />
        ⏱ PENDING
      </span>
    );
  };

  // Dynamic Metrics & Completeness
  const metrics = useMemo(() => {
    if (!portfolio) return { total: 0, verified: 0, pending: 0, completion: 0, verifiedCertificates: 0, verifiedReports: 0, verifiedSkills: 0 };
    const items: Array<{ verificationStatus?: string }> = [
      ...(portfolio.educations || []),
      ...(portfolio.academicReports || []),
      ...(portfolio.skillProfiles || []),
      ...(portfolio.certificates || []),
      ...(portfolio.projects || []),
      ...(portfolio.internships || []),
      ...(portfolio.achievements || []),
      ...(portfolio.trainings || []),
      ...(portfolio.courseCertificates || []),
    ];

    if (portfolio.resumeUrl) {
      items.push({ verificationStatus: portfolio.resumeVerificationStatus || 'PENDING' });
    }

    const total = items.length;
    const verified = items.filter((i) => i.verificationStatus === 'VERIFIED').length;
    const pending = items.filter((i) => !i.verificationStatus || i.verificationStatus === 'PENDING').length;

    // Dynamic Completeness
    const basicScore = portfolio.fullName && portfolio.degree && portfolio.institutionName ? 15 : 5;
    const acadScore = (portfolio.educations?.length > 0 || portfolio.cgpa) ? 15 : 0;
    const skillScore = Math.min(20, (portfolio.skillProfiles?.length || 0) * 7);
    const certScore = Math.min(15, (portfolio.certificates?.length || 0) * 8);
    const reportScore = (portfolio.academicReports?.length || 0) > 0 ? 10 : 0;
    const achievScore = (portfolio.achievements?.length || 0) > 0 ? 10 : 0;
    const expScore = Math.min(15, ((portfolio.projects?.length || 0) + (portfolio.internships?.length || 0)) * 8);

    const completion = Math.min(100, Math.max(15, basicScore + acadScore + skillScore + certScore + reportScore + achievScore + expScore));

    const verifiedCertificates = (portfolio.certificates || []).filter((c: any) => c.verificationStatus === 'VERIFIED').length +
      (portfolio.courseCertificates || []).filter((cc: any) => cc.verificationStatus === 'VERIFIED').length;

    const verifiedReports = (portfolio.academicReports || []).filter((r: any) => r.verificationStatus === 'VERIFIED').length;
    const verifiedSkills = (portfolio.skillProfiles || []).filter((s: any) => s.verificationStatus === 'VERIFIED' || s.verified).length;

    return { total, verified, pending, completion, verifiedCertificates, verifiedReports, verifiedSkills };
  }, [portfolio]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-3">
        <div className="w-9 h-9 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
        <p className="text-xs text-slate-500 font-medium">Loading verified digital portfolio...</p>
      </div>
    );
  }

  return (
    <div className="space-y-7 max-w-6xl mx-auto pb-12">
      {/* Portfolio Hero Card */}
      <div className="bg-white dark:bg-[#121824] rounded-3xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-600 to-emerald-600 flex items-center justify-center text-white font-black text-2xl shadow-md shrink-0">
              {portfolio?.fullName ? portfolio.fullName.charAt(0).toUpperCase() : 'S'}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  {portfolio?.fullName || 'Student Digital Portfolio'}
                </h1>
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
                  <ShieldCheck className="w-3.5 h-3.5" /> Verified Document Record
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                <span>{portfolio?.degree || 'Degree Program'}</span>
                <span>•</span>
                <span>{portfolio?.department || 'Department'}</span>
                <span>•</span>
                <span>{portfolio?.institutionName || 'Educational Institution'}</span>
                {portfolio?.cgpa && (
                  <>
                    <span>•</span>
                    <span className="font-bold text-brand-600 dark:text-brand-400">Cumulative CGPA: {portfolio.cgpa}</span>
                  </>
                )}
                {portfolio?.currentYear && (
                  <>
                    <span>•</span>
                    <span>Year {portfolio.currentYear}</span>
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setModalType('PUBLIC_PREVIEW')}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors border border-slate-200 dark:border-slate-700"
            >
              <Eye className="w-3.5 h-3.5" /> Recruiter Preview
            </button>
            <Link
              to="/student/certifications"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl transition-colors shadow-sm"
            >
              <Award className="w-3.5 h-3.5" /> Manage Certificates
            </Link>
          </div>
        </div>

        {/* Dynamic Profile Completeness Bar */}
        <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
              Portfolio Completeness & Document Verification
            </span>
            <span className="text-xs font-black text-brand-600 dark:text-brand-400">{metrics.completion}%</span>
          </div>
          <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-brand-600 to-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${metrics.completion}%` }}
            />
          </div>
          <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-2">
            <span>Verified Credentials: <strong>{metrics.verifiedCertificates}</strong></span>
            <span>Academic Marksheets: <strong>{portfolio?.academicReports?.length || 0}</strong></span>
            <span>Verified Skills: <strong>{metrics.verifiedSkills}</strong></span>
            <span>Achievements: <strong>{portfolio?.achievements?.length || 0}</strong></span>
          </div>
        </div>

        {/* Verification Overview Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-5">
          <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-100 dark:border-slate-800">
            <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Items</p>
            <p className="text-xl font-black text-slate-900 dark:text-white mt-0.5">{metrics.total}</p>
          </div>
          <div className="p-3 bg-emerald-50/70 dark:bg-emerald-950/40 rounded-2xl border border-emerald-100 dark:border-emerald-800">
            <p className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Verified
            </p>
            <p className="text-xl font-black text-emerald-900 dark:text-emerald-300 mt-0.5">{metrics.verified}</p>
          </div>
          <div className="p-3 bg-amber-50/70 dark:bg-amber-950/40 rounded-2xl border border-amber-100 dark:border-amber-800">
            <p className="text-[10px] font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1">
              <Clock className="w-3 h-3" /> Pending Audit
            </p>
            <p className="text-xl font-black text-amber-900 dark:text-amber-300 mt-0.5">{metrics.pending}</p>
          </div>
          <div className="p-3 bg-brand-50/70 dark:bg-brand-950/40 rounded-2xl border border-brand-100 dark:border-brand-800">
            <p className="text-[10px] font-semibold text-brand-700 dark:text-brand-400 uppercase tracking-wider flex items-center gap-1">
              <GraduationCap className="w-3 h-3" /> Marksheets
            </p>
            <p className="text-xl font-black text-brand-900 dark:text-brand-300 mt-0.5">{portfolio?.academicReports?.length || 0}</p>
          </div>
          <div className="p-3 bg-purple-50/70 dark:bg-purple-950/40 rounded-2xl border border-purple-100 dark:border-purple-800 col-span-2 sm:col-span-1">
            <p className="text-[10px] font-semibold text-purple-700 dark:text-purple-400 uppercase tracking-wider flex items-center gap-1">
              <Award className="w-3 h-3" /> Certifications
            </p>
            <p className="text-xl font-black text-purple-900 dark:text-purple-300 mt-0.5">
              {(portfolio?.certificates?.length || 0) + (portfolio?.courseCertificates?.length || 0)}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold scrollbar-none">
        {[
          { key: 'ALL', label: 'All Showcase' },
          { key: 'CERTIFICATIONS', label: `Certifications (${(portfolio?.certificates?.length || 0) + (portfolio?.courseCertificates?.length || 0)})` },
          { key: 'ACADEMIC_REPORTS', label: `Academic Reports (${portfolio?.academicReports?.length || 0})` },
          { key: 'ACHIEVEMENTS', label: `Achievements (${portfolio?.achievements?.length || 0})` },
          { key: 'SKILLS', label: `Skills (${portfolio?.skillProfiles?.length || 0})` },
          { key: 'PROJECTS', label: `Projects (${portfolio?.projects?.length || 0})` },
          { key: 'INTERNSHIPS', label: `Internships (${portfolio?.internships?.length || 0})` },
          { key: 'EDUCATION', label: `Education (${portfolio?.educations?.length || 0})` },
          { key: 'ASSESSMENTS', label: `Assessments (${portfolio?.assessmentAttempts?.length || 0})` },
          { key: 'RESUME', label: 'Resume File' },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-3.5 py-2 rounded-xl whitespace-nowrap transition-all ${
              activeTab === tab.key
                ? 'bg-brand-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* SECTION: Certifications */}
      {(activeTab === 'ALL' || activeTab === 'CERTIFICATIONS') && (
        <div className="bg-white dark:bg-[#121824] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Certifications & Licenses</h2>
            </div>
            <div className="flex items-center gap-2">
              <Link
                to="/student/certifications"
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 rounded-xl transition-colors"
              >
                View Full Page <ChevronRight className="w-3.5 h-3.5" />
              </Link>
              <button
                type="button"
                onClick={() => setModalType('CERT')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 rounded-xl transition-colors border border-purple-200 dark:border-purple-800"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Certificate
              </button>
            </div>
          </div>

          {((portfolio?.certificates && portfolio.certificates.length > 0) || (portfolio?.courseCertificates && portfolio.courseCertificates.length > 0)) ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {portfolio?.courseCertificates?.map((cc: any) => (
                <div
                  key={cc.id}
                  className="p-4 rounded-xl border border-brand-200 dark:border-brand-800/80 bg-brand-50/20 dark:bg-brand-950/20 flex flex-col justify-between space-y-3"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-brand-700 dark:text-brand-300 uppercase tracking-wider bg-brand-50 dark:bg-brand-900/40 px-2 py-0.5 rounded border border-brand-200 dark:border-brand-800 mb-1">
                          <Award className="w-3 h-3" /> Learning Hub Course Certificate
                        </span>
                        <h3 className="text-xs font-bold text-slate-900 dark:text-white">{cc.courseTitle || cc.course?.title}</h3>
                      </div>
                      {renderVerificationBadge(cc.verificationStatus, cc.remarks)}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Provider: <strong>{cc.providerName || cc.course?.providerName}</strong></p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Code: <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{cc.certificateCode}</span></p>
                  </div>
                  <div className="pt-2 border-t border-brand-100 dark:border-brand-900/60 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 dark:text-slate-400">Issued {new Date(cc.issueDate).toLocaleDateString()}</span>
                    <span className="font-semibold text-brand-600 dark:text-brand-400">✓ Verified Completion</span>
                  </div>
                </div>
              ))}

              {portfolio?.certificates?.map((c: any) => (
                <div
                  key={c.id}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0c121e] flex flex-col justify-between space-y-3"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        {c.certificateType && (
                          <span className="inline-block text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-0.5">
                            {c.certificateType}
                          </span>
                        )}
                        <h3 className="text-xs font-bold text-slate-900 dark:text-white">{c.title}</h3>
                      </div>
                      {renderVerificationBadge(c.verificationStatus, c.remarks)}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">{c.issuingOrganization}</p>
                    {c.issueDate && <p className="text-[11px] text-slate-400 mt-1">Issued: {c.issueDate}</p>}
                    {c.skillsCovered && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {c.skillsCovered.split(',').slice(0, 3).map((s: string, idx: number) => (
                          <span key={idx} className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-[10px] font-medium rounded text-slate-600 dark:text-slate-300">
                            {s.trim()}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {c.certificateDocUrl && (
                        <button
                          type="button"
                          onClick={() => handleOpenDocPreview(c.certificateDocUrl, c.title)}
                          className="text-[11px] font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
                        >
                          <FileText className="w-3 h-3" /> View Document
                        </button>
                      )}
                      {c.credentialUrl && (
                        <a
                          href={c.credentialUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] text-slate-500 dark:text-slate-400 hover:underline flex items-center gap-1"
                        >
                          <ExternalLink className="w-3 h-3" /> Link
                        </a>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteCert(c.id)}
                      className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Award}
              title="No certifications logged yet"
              description="Upload certificates with proof documents to earn institutional verification."
              actionText="Add Certification"
              onAction={() => setModalType('CERT')}
            />
          )}
        </div>
      )}

      {/* SECTION: Academic Reports & Mark Sheets */}
      {(activeTab === 'ALL' || activeTab === 'ACADEMIC_REPORTS') && (
        <div className="bg-white dark:bg-[#121824] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-brand-600 dark:text-brand-400" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Academic Reports & Semester Mark Sheets</h2>
            </div>
            <div className="flex items-center gap-2">
              <Link
                to="/student/academic-reports"
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 rounded-xl transition-colors"
              >
                Manage Reports <ChevronRight className="w-3.5 h-3.5" />
              </Link>
              <button
                type="button"
                onClick={() => setModalType('ACAD_REPORT')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-brand-700 dark:text-brand-300 bg-brand-50 dark:bg-brand-950/60 hover:bg-brand-100 rounded-xl transition-colors border border-brand-200 dark:border-brand-800"
              >
                <Plus className="w-3.5 h-3.5" />
                Upload Mark Sheet
              </button>
            </div>
          </div>

          {portfolio?.academicReports && portfolio.academicReports.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {portfolio.academicReports.map((ar: any) => (
                <div
                  key={ar.id}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0c121e] flex flex-col justify-between space-y-3"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="inline-block text-[10px] font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider mb-0.5">
                          {ar.semester} ({ar.academicYear})
                        </span>
                        <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                          {ar.reportType.replace(/_/g, ' ')}
                        </h3>
                      </div>
                      {renderVerificationBadge(ar.verificationStatus, ar.remarks)}
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-xs">
                      {ar.cgpa !== null && ar.cgpa !== undefined && (
                        <div>
                          <span className="text-[11px] text-slate-500">CGPA/SGPA:</span>{' '}
                          <strong className="text-brand-600 dark:text-brand-400">{ar.cgpa}</strong>
                        </div>
                      )}
                      {ar.percentage !== null && ar.percentage !== undefined && (
                        <div>
                          <span className="text-[11px] text-slate-500">Percentage:</span>{' '}
                          <strong className="text-slate-800 dark:text-slate-200">{ar.percentage}%</strong>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
                    {ar.documentUrl ? (
                      <button
                        type="button"
                        onClick={() => handleOpenDocPreview(ar.documentUrl, `${ar.semester} Mark Sheet`)}
                        className="text-[11px] font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
                      >
                        <FileText className="w-3 h-3" /> View Stamped Mark Sheet
                      </button>
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">No document</span>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDeleteAcadReport(ar.id)}
                      className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={GraduationCap}
              title="No academic mark sheets uploaded"
              description="Upload your semester mark sheets and grade reports for verified academic standing."
              actionText="Upload Mark Sheet"
              onAction={() => setModalType('ACAD_REPORT')}
            />
          )}
        </div>
      )}

      {/* SECTION: Achievements & Awards */}
      {(activeTab === 'ALL' || activeTab === 'ACHIEVEMENTS') && (
        <div className="bg-white dark:bg-[#121824] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Honors & Achievements</h2>
            </div>
            <div className="flex items-center gap-2">
              <Link
                to="/student/achievements"
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 rounded-xl transition-colors"
              >
                Manage Awards <ChevronRight className="w-3.5 h-3.5" />
              </Link>
              <button
                type="button"
                onClick={() => setModalType('ACHIEV')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 rounded-xl transition-colors border border-amber-200 dark:border-amber-800"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Achievement
              </button>
            </div>
          </div>

          {portfolio?.achievements && portfolio.achievements.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {portfolio.achievements.map((ach: any) => (
                <div
                  key={ach.id}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0c121e] flex flex-col justify-between space-y-3"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        {ach.level && (
                          <span className="inline-block text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-0.5">
                            {ach.level} LEVEL
                          </span>
                        )}
                        <h3 className="text-xs font-bold text-slate-900 dark:text-white">{ach.title}</h3>
                      </div>
                      {renderVerificationBadge(ach.verificationStatus, ach.remarks)}
                    </div>
                    {ach.position && (
                      <p className="text-[11px] font-semibold text-brand-700 dark:text-brand-300 mt-1 flex items-center gap-1">
                        <Medal className="w-3 h-3 text-brand-500" /> {ach.position}
                      </p>
                    )}
                    {ach.issuer && <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{ach.issuer}</p>}
                    {ach.description && <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">{ach.description}</p>}
                  </div>

                  <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
                    {ach.documentUrl ? (
                      <button
                        type="button"
                        onClick={() => handleOpenDocPreview(ach.documentUrl, ach.title)}
                        className="text-[11px] font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
                      >
                        <FileText className="w-3 h-3" /> View Evidence Document
                      </button>
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">No document</span>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDeleteAchiev(ach.id)}
                      className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Trophy}
              title="No achievements logged"
              description="Record awards, hackathons, publications, or competitive recognitions."
              actionText="Add Achievement"
              onAction={() => setModalType('ACHIEV')}
            />
          )}
        </div>
      )}

      {/* SECTION: Skills */}
      {(activeTab === 'ALL' || activeTab === 'SKILLS') && (
        <div className="bg-white dark:bg-[#121824] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Skills & Assessment Evidence</h2>
            </div>
            <button
              type="button"
              onClick={() => setModalType('SKILL')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 rounded-xl transition-colors border border-emerald-200 dark:border-emerald-800"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Skill
            </button>
          </div>

          {portfolio?.skillProfiles && portfolio.skillProfiles.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {portfolio.skillProfiles.map((sp: any) => (
                <div
                  key={sp.id}
                  className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0c121e] flex flex-col justify-between space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 dark:text-white">{sp.skill?.name}</h3>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">
                        {sp.skill?.category?.name || 'Domain Competency'}
                      </span>
                    </div>
                    {renderVerificationBadge(sp.verificationStatus, sp.remarks)}
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/80 dark:border-slate-800">
                    <span className="inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      Level: {sp.proficiencyLevel}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteSkill(sp.id)}
                      className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                      title="Remove skill"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Sparkles}
              title="No skills recorded yet"
              description="Self-report your clinical, botanical, or pharmacological proficiencies."
              actionText="Add Skill"
              onAction={() => setModalType('SKILL')}
            />
          )}
        </div>
      )}

      {/* SECTION: Projects */}
      {(activeTab === 'ALL' || activeTab === 'PROJECTS') && (
        <div className="bg-white dark:bg-[#121824] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FolderGit2 className="w-5 h-5 text-brand-600 dark:text-brand-400" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Technical & Capstone Projects</h2>
            </div>
            <button
              type="button"
              onClick={() => setModalType('PROJECT')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-brand-700 dark:text-brand-300 bg-brand-50 dark:bg-brand-950/60 hover:bg-brand-100 rounded-xl transition-colors border border-brand-200 dark:border-brand-800"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Project
            </button>
          </div>

          {portfolio?.projects && portfolio.projects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {portfolio.projects.map((proj: any) => (
                <div
                  key={proj.id}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0c121e] flex flex-col justify-between space-y-3"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-xs font-bold text-slate-900 dark:text-white">{proj.title}</h3>
                      {renderVerificationBadge(proj.verificationStatus, proj.remarks)}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">{proj.description}</p>
                    {proj.technologies && (
                      <p className="text-[11px] text-brand-700 dark:text-brand-300 font-medium mt-2">
                        Stack / Methods: {proj.technologies}
                      </p>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {proj.projectUrl && (
                        <a
                          href={proj.projectUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1 font-medium"
                        >
                          <ExternalLink className="w-3 h-3" /> Live Link
                        </a>
                      )}
                      {proj.repoUrl && (
                        <a
                          href={proj.repoUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] text-slate-600 dark:text-slate-400 hover:underline flex items-center gap-1 font-medium"
                        >
                          <ExternalLink className="w-3 h-3" /> Repository
                        </a>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteProject(proj.id)}
                      className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={FolderGit2}
              title="No projects logged yet"
              description="Add research, clinical, or formulations projects."
              actionText="Add Project"
              onAction={() => setModalType('PROJECT')}
            />
          )}
        </div>
      )}

      {/* SECTION: Internships */}
      {(activeTab === 'ALL' || activeTab === 'INTERNSHIPS') && (
        <div className="bg-white dark:bg-[#121824] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Internship Experiences</h2>
            </div>
            <button
              type="button"
              onClick={() => setModalType('INTERN')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 rounded-xl transition-colors border border-emerald-200 dark:border-emerald-800"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Experience
            </button>
          </div>

          {portfolio?.internships && portfolio.internships.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {portfolio.internships.map((exp: any) => (
                <div
                  key={exp.id}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0c121e] flex flex-col justify-between space-y-3"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-xs font-bold text-slate-900 dark:text-white">{exp.role}</h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">{exp.companyName}</p>
                      </div>
                      {renderVerificationBadge(exp.verificationStatus, exp.remarks)}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      {exp.startDate} - {exp.endDate || 'Present'}
                    </p>
                    {exp.description && <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">{exp.description}</p>}
                  </div>

                  <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
                    {exp.certificateUrl ? (
                      <button
                        type="button"
                        onClick={() => handleOpenDocPreview(exp.certificateUrl, `${exp.role} Certificate`)}
                        className="text-[11px] font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
                      >
                        <FileText className="w-3 h-3" /> View Certificate
                      </button>
                    ) : (
                      <span />
                    )}
                    <button
                      type="button"
                      onClick={() => handleDeleteIntern(exp.id)}
                      className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Briefcase}
              title="No previous internships logged"
              description="Add hospital training or pharmaceutical internship roles."
              actionText="Add Experience"
              onAction={() => setModalType('INTERN')}
            />
          )}
        </div>
      )}

      {/* SECTION: Assessment Results */}
      {(activeTab === 'ALL' || activeTab === 'ASSESSMENTS') && (
        <div className="bg-white dark:bg-[#121824] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileCheck2 className="w-5 h-5 text-brand-600 dark:text-brand-400" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Verified Skill Assessments</h2>
            </div>
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
              Automated Evaluation
            </span>
          </div>

          {portfolio?.assessmentAttempts && portfolio.assessmentAttempts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {portfolio.assessmentAttempts.map((att: any) => (
                <div
                  key={att.id}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0c121e] flex flex-col justify-between space-y-3"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                        {att.assessment?.title || 'Skill Assessment'}
                      </h3>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          att.passed
                            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                            : 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300'
                        }`}
                      >
                        {att.passed ? '✓ PASSED (≥75%)' : 'ATTEMPTED'}
                      </span>
                    </div>
                    <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">{Math.round(att.percentage)}%</p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Score: {att.score} / {att.totalScore} pts
                    </p>
                    {att.completedAt && (
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Completed: {new Date(att.completedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={FileCheck2}
              title="No assessments completed yet"
              description="Complete skill assessments to validate your competencies with official score percentages."
            />
          )}
        </div>
      )}

      {/* SECTION: Education History */}
      {(activeTab === 'ALL' || activeTab === 'EDUCATION') && (
        <div className="bg-white dark:bg-[#121824] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Education Background</h2>
            </div>
            <button
              type="button"
              onClick={() => setModalType('EDU')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 rounded-xl transition-colors border border-blue-200 dark:border-blue-800"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Education
            </button>
          </div>

          {portfolio?.educations && portfolio.educations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {portfolio.educations.map((edu: any) => (
                <div
                  key={edu.id}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0c121e] flex flex-col justify-between space-y-3"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                        {edu.degree} in {edu.fieldOfStudy}
                      </h3>
                      {renderVerificationBadge(edu.verificationStatus, edu.remarks)}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-medium">{edu.institution}</p>
                    <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {edu.startYear} - {edu.endYear || 'Present'} {edu.grade ? `• Grade: ${edu.grade}` : ''}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-end">
                    <button
                      type="button"
                      onClick={() => handleDeleteEdu(edu.id)}
                      className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={GraduationCap}
              title="No education records logged"
              description="Add your degree programs and academic background."
              actionText="Add Education"
              onAction={() => setModalType('EDU')}
            />
          )}
        </div>
      )}

      {/* SECTION: Resume File */}
      {(activeTab === 'ALL' || activeTab === 'RESUME') && (
        <div className="bg-white dark:bg-[#121824] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Curriculum Vitae / Resume</h2>
            </div>
            <button
              type="button"
              onClick={() => setModalType('RESUME')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 rounded-xl transition-colors border border-indigo-200 dark:border-indigo-800"
            >
              <Plus className="w-3.5 h-3.5" />
              {portfolio?.resumeUrl ? 'Update Resume' : 'Add Resume'}
            </button>
          </div>

          {portfolio?.resumeUrl ? (
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0c121e] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">Active Verified Resume</span>
                  {renderVerificationBadge(portfolio.resumeVerificationStatus, portfolio.resumeRemarks)}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 break-all">{portfolio.resumeUrl}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleOpenDocPreview(portfolio.resumeUrl, `${portfolio.fullName} - Resume`)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs"
                >
                  <FileText className="w-3.5 h-3.5" /> Preview Resume
                </button>
              </div>
            </div>
          ) : (
            <EmptyState
              icon={FileText}
              title="No resume uploaded yet"
              description="Upload your resume document for institutional placement screening."
              actionText="Add Resume"
              onAction={() => setModalType('RESUME')}
            />
          )}
        </div>
      )}

      {/* ================= MODALS ================= */}

      {/* Add Project Modal */}
      <Modal isOpen={modalType === 'PROJECT'} onClose={() => setModalType(null)} title="Add Technical Project">
        <form onSubmit={handleAddProject} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Project Title *</label>
            <input
              type="text"
              required
              value={projectForm.title}
              onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
              placeholder="e.g. Standardization of Ashwagandha Formulations"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Description *</label>
            <textarea
              rows={3}
              required
              value={projectForm.description}
              onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
              placeholder="Objectives, extraction procedures, chromatography..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Technologies / Methods Used</label>
            <input
              type="text"
              value={projectForm.technologies}
              onChange={(e) => setProjectForm({ ...projectForm, technologies: e.target.value })}
              placeholder="TLC, HPLC, Spectrophotometry"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Live Demo / Paper URL</label>
              <input
                type="url"
                value={projectForm.projectUrl}
                onChange={(e) => setProjectForm({ ...projectForm, projectUrl: e.target.value })}
                placeholder="https://..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Repository / Drive URL</label>
              <input
                type="url"
                value={projectForm.repoUrl}
                onChange={(e) => setProjectForm({ ...projectForm, repoUrl: e.target.value })}
                placeholder="https://..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setModalType(null)}
              className="px-4 py-2 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-xs"
            >
              Save Project
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Cert Modal */}
      <Modal isOpen={modalType === 'CERT'} onClose={() => setModalType(null)} title="Add Certification">
        <form onSubmit={handleAddCert} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Certificate Title *</label>
            <input
              type="text"
              required
              value={certForm.title}
              onChange={(e) => setCertForm({ ...certForm, title: e.target.value })}
              placeholder="e.g. Good Clinical Practice (GCP) Certification"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Issuing Organization *</label>
              <input
                type="text"
                required
                value={certForm.issuingOrganization}
                onChange={(e) => setCertForm({ ...certForm, issuingOrganization: e.target.value })}
                placeholder="e.g. AYUSH Council, NPTEL"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Issue Date</label>
              <input
                type="text"
                value={certForm.issueDate}
                onChange={(e) => setCertForm({ ...certForm, issueDate: e.target.value })}
                placeholder="e.g. August 2025"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>
          <DocumentUploadZone
            fileUrl={certForm.certificateDocUrl}
            onUploadSuccess={(url) => setCertForm({ ...certForm, certificateDocUrl: url })}
            onRemove={() => setCertForm({ ...certForm, certificateDocUrl: '' })}
            label="Upload Certificate Document"
          />
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setModalType(null)}
              className="px-4 py-2 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-xs"
            >
              Submit Certificate
            </button>
          </div>
        </form>
      </Modal>

      {/* Upload Academic Report Modal */}
      <Modal isOpen={modalType === 'ACAD_REPORT'} onClose={() => setModalType(null)} title="Upload Semester Mark Sheet">
        <form onSubmit={handleAddAcadReport} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Semester *</label>
              <input
                type="text"
                required
                value={acadReportForm.semester}
                onChange={(e) => setAcadReportForm({ ...acadReportForm, semester: e.target.value })}
                placeholder="e.g. Semester 4"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Academic Year *</label>
              <input
                type="text"
                required
                value={acadReportForm.academicYear}
                onChange={(e) => setAcadReportForm({ ...acadReportForm, academicYear: e.target.value })}
                placeholder="e.g. 2024-2025"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">CGPA / SGPA</label>
              <input
                type="number"
                step="0.01"
                value={acadReportForm.cgpa}
                onChange={(e) => setAcadReportForm({ ...acadReportForm, cgpa: e.target.value })}
                placeholder="e.g. 8.6"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Percentage (%)</label>
              <input
                type="number"
                step="0.1"
                value={acadReportForm.percentage}
                onChange={(e) => setAcadReportForm({ ...acadReportForm, percentage: e.target.value })}
                placeholder="e.g. 86.0"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>
          <DocumentUploadZone
            fileUrl={acadReportForm.documentUrl}
            onUploadSuccess={(url) => setAcadReportForm({ ...acadReportForm, documentUrl: url })}
            onRemove={() => setAcadReportForm({ ...acadReportForm, documentUrl: '' })}
            label="Upload Mark Sheet Document (PDF / Image)"
            required={true}
          />
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setModalType(null)}
              className="px-4 py-2 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-xs"
            >
              Submit Mark Sheet
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Achievement Modal */}
      <Modal isOpen={modalType === 'ACHIEV'} onClose={() => setModalType(null)} title="Add Achievement / Honor">
        <form onSubmit={handleAddAchiev} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Achievement Title *</label>
            <input
              type="text"
              required
              value={achievForm.title}
              onChange={(e) => setAchievForm({ ...achievForm, title: e.target.value })}
              placeholder="e.g. National Ayurveda Presentation Award"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Level</label>
              <input
                type="text"
                value={achievForm.level}
                onChange={(e) => setAchievForm({ ...achievForm, level: e.target.value })}
                placeholder="National, State, University"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Position / Rank</label>
              <input
                type="text"
                value={achievForm.position}
                onChange={(e) => setAchievForm({ ...achievForm, position: e.target.value })}
                placeholder="1st Place, Gold Medal"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>
          <DocumentUploadZone
            fileUrl={achievForm.documentUrl}
            onUploadSuccess={(url) => setAchievForm({ ...achievForm, documentUrl: url })}
            onRemove={() => setAchievForm({ ...achievForm, documentUrl: '' })}
            label="Upload Award Proof / Certificate"
          />
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setModalType(null)}
              className="px-4 py-2 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs"
            >
              Save Achievement
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Skill Modal */}
      <Modal isOpen={modalType === 'SKILL'} onClose={() => setModalType(null)} title="Add Skill">
        <form onSubmit={handleAddSkill} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Skill Name *</label>
            <input
              type="text"
              required
              value={skillForm.skillName}
              onChange={(e) => setSkillForm({ ...skillForm, skillName: e.target.value })}
              placeholder="e.g. Panchakarma, Pharmacognosy, Data Analysis"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Proficiency Level</label>
            <select
              value={skillForm.proficiencyLevel}
              onChange={(e) => setSkillForm({ ...skillForm, proficiencyLevel: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
            >
              <option value="BEGINNER">BEGINNER</option>
              <option value="INTERMEDIATE">INTERMEDIATE</option>
              <option value="ADVANCED">ADVANCED</option>
              <option value="EXPERT">EXPERT</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setModalType(null)}
              className="px-4 py-2 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-xs"
            >
              Add Skill
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Education Modal */}
      <Modal isOpen={modalType === 'EDU'} onClose={() => setModalType(null)} title="Add Education Record">
        <form onSubmit={handleAddEdu} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Institution Name *</label>
            <input
              type="text"
              required
              value={eduForm.institution}
              onChange={(e) => setEduForm({ ...eduForm, institution: e.target.value })}
              placeholder="e.g. Sri Dhanvantari Ayurveda College"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Degree *</label>
              <input
                type="text"
                required
                value={eduForm.degree}
                onChange={(e) => setEduForm({ ...eduForm, degree: e.target.value })}
                placeholder="BAMS, MD, B.Sc"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Field of Study *</label>
              <input
                type="text"
                required
                value={eduForm.fieldOfStudy}
                onChange={(e) => setEduForm({ ...eduForm, fieldOfStudy: e.target.value })}
                placeholder="Ayurvedic Medicine & Surgery"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Start Year *</label>
              <input
                type="number"
                required
                value={eduForm.startYear}
                onChange={(e) => setEduForm({ ...eduForm, startYear: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">End Year</label>
              <input
                type="number"
                value={eduForm.endYear}
                onChange={(e) => setEduForm({ ...eduForm, endYear: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Grade / CGPA</label>
              <input
                type="text"
                value={eduForm.grade}
                onChange={(e) => setEduForm({ ...eduForm, grade: e.target.value })}
                placeholder="8.6 CGPA"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setModalType(null)}
              className="px-4 py-2 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs"
            >
              Save Education
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Internship Modal */}
      <Modal isOpen={modalType === 'INTERN'} onClose={() => setModalType(null)} title="Add Internship Experience">
        <form onSubmit={handleAddIntern} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Company / Hospital *</label>
              <input
                type="text"
                required
                value={internForm.companyName}
                onChange={(e) => setInternForm({ ...internForm, companyName: e.target.value })}
                placeholder="e.g. Dhanvantari Wellness"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Role / Position *</label>
              <input
                type="text"
                required
                value={internForm.role}
                onChange={(e) => setInternForm({ ...internForm, role: e.target.value })}
                placeholder="e.g. Clinical Ayurveda Intern"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Start Date *</label>
              <input
                type="text"
                required
                value={internForm.startDate}
                onChange={(e) => setInternForm({ ...internForm, startDate: e.target.value })}
                placeholder="e.g. June 2025"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">End Date</label>
              <input
                type="text"
                value={internForm.endDate}
                onChange={(e) => setInternForm({ ...internForm, endDate: e.target.value })}
                placeholder="e.g. August 2025"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Description</label>
            <textarea
              rows={3}
              value={internForm.description}
              onChange={(e) => setInternForm({ ...internForm, description: e.target.value })}
              placeholder="Clinical responsibilities, formulations prepared, patient intake..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
            />
          </div>
          <DocumentUploadZone
            fileUrl={internForm.certificateUrl}
            onUploadSuccess={(url) => setInternForm({ ...internForm, certificateUrl: url })}
            onRemove={() => setInternForm({ ...internForm, certificateUrl: '' })}
            label="Upload Internship Completion Proof"
          />
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setModalType(null)}
              className="px-4 py-2 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs"
            >
              Save Experience
            </button>
          </div>
        </form>
      </Modal>

      {/* Manage Resume Modal */}
      <Modal isOpen={modalType === 'RESUME'} onClose={() => setModalType(null)} title="Manage Resume Document">
        <form onSubmit={handleUpdateResume} className="space-y-4">
          <DocumentUploadZone
            fileUrl={resumeForm.resumeUrl}
            onUploadSuccess={(url) => setResumeForm({ resumeUrl: url })}
            onRemove={() => setResumeForm({ resumeUrl: '' })}
            label="Upload Official Resume (PDF)"
            required={true}
            helperText="Upload your latest academic / clinical resume (PDF format recommended, Max 5MB)."
          />
          <p className="text-[11px] text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 p-2.5 rounded-xl border border-amber-200 dark:border-amber-800">
            * Updating your resume will submit it to your institution for placement review.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setModalType(null)}
              className="px-4 py-2 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-xs"
            >
              Save Resume
            </button>
          </div>
        </form>
      </Modal>

      {/* Document Preview Modal */}
      <Modal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        title={previewDocTitle || 'Verified Document Preview'}
      >
        <div className="space-y-4">
          {previewDocUrl && (
            <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 min-h-[400px] flex items-center justify-center">
              {previewDocUrl.toLowerCase().includes('.pdf') ? (
                <iframe
                  src={previewDocUrl}
                  title="Document Preview"
                  className="w-full h-[550px] border-0 rounded-xl"
                />
              ) : (
                <img
                  src={previewDocUrl}
                  alt="Verified Document"
                  className="max-h-[550px] max-w-full object-contain mx-auto rounded-xl p-2"
                />
              )}
            </div>
          )}
          <div className="flex items-center justify-between pt-2">
            <a
              href={previewDocUrl || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Open in New Tab
            </a>
            <button
              type="button"
              onClick={() => setIsPreviewModalOpen(false)}
              className="px-4 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>

      {/* Recruiter / Public Preview Modal */}
      <Modal
        isOpen={modalType === 'PUBLIC_PREVIEW'}
        onClose={() => setModalType(null)}
        title="Public Portfolio View (Recruiter & Academician Perspective)"
      >
        <div className="space-y-6 max-h-[75vh] overflow-y-auto pr-1">
          <div className="p-4 bg-slate-50 dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-brand-600 text-white font-black text-xl flex items-center justify-center">
                {portfolio?.fullName ? portfolio.fullName.charAt(0).toUpperCase() : 'S'}
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">{portfolio?.fullName}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {portfolio?.degree} in {portfolio?.department} • {portfolio?.institutionName}
                </p>
              </div>
            </div>
            {portfolio?.resumeUrl && (
              <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Verified Resume:</span>
                <button
                  type="button"
                  onClick={() => handleOpenDocPreview(portfolio.resumeUrl, `${portfolio.fullName} - Resume`)}
                  className="text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1 font-medium"
                >
                  <ExternalLink className="w-3 h-3" /> View Verified Resume
                </button>
              </div>
            )}
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">
              Verified Credentials & Certifications ({metrics.verifiedCertificates})
            </h4>
            <div className="space-y-2">
              {portfolio?.certificates?.filter((c: any) => c.verificationStatus === 'VERIFIED').map((c: any) => (
                <div key={c.id} className="p-3 bg-white dark:bg-[#121824] rounded-xl border border-slate-200 dark:border-slate-800 text-xs flex justify-between items-center">
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">{c.title}</p>
                    <p className="text-slate-500">{c.issuingOrganization} • {c.issueDate}</p>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-200">
                    ✓ VERIFIED
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">
              Semester Academic Records & Transcripts ({portfolio?.academicReports?.length || 0})
            </h4>
            <div className="space-y-2">
              {portfolio?.academicReports?.map((ar: any) => (
                <div key={ar.id} className="p-3 bg-white dark:bg-[#121824] rounded-xl border border-slate-200 dark:border-slate-800 text-xs flex justify-between items-center">
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">{ar.semester} ({ar.academicYear})</p>
                    <p className="text-slate-500">CGPA: {ar.cgpa || 'N/A'} • Percentage: {ar.percentage ? `${ar.percentage}%` : 'N/A'}</p>
                  </div>
                  {renderVerificationBadge(ar.verificationStatus)}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-2 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setModalType(null)}
              className="px-5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl"
            >
              Close Preview
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
