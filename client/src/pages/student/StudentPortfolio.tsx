import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { EmptyState } from '../../components/common/EmptyState';
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
} from 'lucide-react';

export const StudentPortfolio: React.FC = () => {
  const [portfolio, setPortfolio] = useState<any>(null);
  const [availableSkills, setAvailableSkills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    'ALL' | 'EDUCATION' | 'SKILLS' | 'PROJECTS' | 'CERTIFICATIONS' | 'INTERNSHIPS' | 'ACHIEVEMENTS' | 'TRAINING' | 'ASSESSMENTS' | 'RESUME'
  >('ALL');

  // Modal type
  const [modalType, setModalType] = useState<
    'PROJECT' | 'CERT' | 'INTERN' | 'EDU' | 'SKILL' | 'ACHIEV' | 'TRAIN' | 'RESUME' | 'PREVIEW' | null
  >(null);

  // Form states
  const [projectForm, setProjectForm] = useState({
    title: '',
    description: '',
    technologies: '',
    projectUrl: '',
    repoUrl: '',
  });
  const [certForm, setCertForm] = useState({
    title: '',
    issuingOrganization: '',
    issueDate: '',
    credentialUrl: '',
  });
  const [internForm, setInternForm] = useState({
    companyName: '',
    role: '',
    startDate: '',
    endDate: '',
    description: '',
    certificateUrl: '',
  });
  const [eduForm, setEduForm] = useState({
    institution: '',
    degree: '',
    fieldOfStudy: '',
    startYear: '2023',
    endYear: '2027',
    grade: '',
  });
  const [skillForm, setSkillForm] = useState({
    skillId: '',
    skillName: '',
    proficiencyLevel: 'INTERMEDIATE',
  });
  const [achievForm, setAchievForm] = useState({
    title: '',
    category: 'Competition / Hackathon',
    date: '',
    description: '',
  });
  const [trainForm, setTrainForm] = useState({
    title: '',
    provider: '',
    duration: '',
    certificateUrl: '',
  });
  const [resumeForm, setResumeForm] = useState({
    resumeUrl: '',
  });

  const fetchPortfolio = () => {
    setLoading(true);
    Promise.all([api.get('/student/portfolio'), api.get('/skills').catch(() => ({ data: [] }))])
      .then(([portfolioRes, skillsRes]) => {
        setPortfolio(portfolioRes.data);
        if (portfolioRes.data?.resumeUrl) {
          setResumeForm({ resumeUrl: portfolioRes.data.resumeUrl });
        }
        setAvailableSkills(skillsRes.data || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPortfolio();
  }, []);

  // Form Handlers
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
      await api.post('/student/portfolio/certifications', certForm);
      setModalType(null);
      setCertForm({ title: '', issuingOrganization: '', issueDate: '', credentialUrl: '' });
      fetchPortfolio();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to add certification.');
    }
  };

  const handleDeleteCert = async (id: string) => {
    if (!window.confirm('Delete this certification?')) return;
    try {
      await api.delete(`/student/portfolio/certifications/${id}`);
      fetchPortfolio();
    } catch (err: any) {
      alert('Failed to delete certification.');
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

  const handleAddAchievement = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/student/portfolio/achievements', achievForm);
      setModalType(null);
      setAchievForm({ title: '', category: 'Competition / Hackathon', date: '', description: '' });
      fetchPortfolio();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to add achievement.');
    }
  };

  const handleDeleteAchievement = async (id: string) => {
    if (!window.confirm('Delete this achievement?')) return;
    try {
      await api.delete(`/student/portfolio/achievements/${id}`);
      fetchPortfolio();
    } catch (err: any) {
      alert('Failed to delete achievement.');
    }
  };

  const handleAddTraining = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/student/portfolio/trainings', trainForm);
      setModalType(null);
      setTrainForm({ title: '', provider: '', duration: '', certificateUrl: '' });
      fetchPortfolio();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to add training.');
    }
  };

  const handleDeleteTraining = async (id: string) => {
    if (!window.confirm('Delete this training record?')) return;
    try {
      await api.delete(`/student/portfolio/trainings/${id}`);
      fetchPortfolio();
    } catch (err: any) {
      alert('Failed to delete training.');
    }
  };

  const handleUpdateResume = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.put('/student/portfolio/resume', resumeForm);
      setModalType(null);
      fetchPortfolio();
      alert('Resume updated. It is now Pending Verification.');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update resume.');
    }
  };

  // Verification Badge Renderer
  const renderVerificationBadge = (status?: string, remarks?: string) => {
    const s = status || 'PENDING';
    switch (s) {
      case 'VERIFIED':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full shadow-xs">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Verified
          </span>
        );
      case 'REJECTED':
        return (
          <div className="flex flex-col items-end gap-1">
            <span
              title={remarks || 'Rejected by institution verification authority.'}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full shadow-xs"
            >
              <XCircle className="w-3 h-3 text-rose-600" />
              Rejected
            </span>
            {remarks && (
              <span className="text-[10px] text-rose-600 max-w-[180px] truncate text-right font-medium">
                Note: {remarks}
              </span>
            )}
          </div>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full shadow-xs">
            <Clock className="w-3 h-3 text-amber-600 animate-pulse" />
            Pending Verification
          </span>
        );
    }
  };

  // Compute Verification Counts
  const computeStats = () => {
    if (!portfolio) return { total: 0, verified: 0, pending: 0, rejected: 0, rate: 0 };
    const items: Array<{ verificationStatus?: string }> = [
      ...(portfolio.educations || []),
      ...(portfolio.skillProfiles || []),
      ...(portfolio.certificates || []),
      ...(portfolio.projects || []),
      ...(portfolio.internships || []),
      ...(portfolio.achievements || []),
      ...(portfolio.trainings || []),
    ];

    if (portfolio.resumeUrl) {
      items.push({ verificationStatus: portfolio.resumeVerificationStatus || 'PENDING' });
    }

    const total = items.length;
    const verified = items.filter((i) => i.verificationStatus === 'VERIFIED').length;
    const rejected = items.filter((i) => i.verificationStatus === 'REJECTED').length;
    const pending = items.filter(
      (i) => !i.verificationStatus || i.verificationStatus === 'PENDING'
    ).length;
    const rate = total > 0 ? Math.round((verified / total) * 100) : 0;

    return { total, verified, pending, rejected, rate };
  };

  const stats = computeStats();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-3">
        <div className="w-9 h-9 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
        <p className="text-xs text-slate-500 font-medium">Loading digital portfolio...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Portfolio Hero Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 md:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-600 to-emerald-600 flex items-center justify-center text-white font-black text-2xl shadow-md">
              {portfolio?.fullName ? portfolio.fullName.charAt(0).toUpperCase() : 'S'}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                  {portfolio?.fullName || 'Student Portfolio'}
                </h1>
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200">
                  <ShieldCheck className="w-3.5 h-3.5" /> Digital Verified ID
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                <span>{portfolio?.degree || 'Degree Program'}</span>
                <span>•</span>
                <span>{portfolio?.department || 'Department'}</span>
                <span>•</span>
                <span>{portfolio?.institutionName || 'Educational Institution'}</span>
                {portfolio?.cgpa && (
                  <>
                    <span>•</span>
                    <span className="font-bold text-slate-700">CGPA: {portfolio.cgpa}</span>
                  </>
                )}
                {portfolio?.graduationYear && (
                  <>
                    <span>•</span>
                    <span>Class of {portfolio.graduationYear}</span>
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setModalType('PREVIEW')}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors border border-slate-200"
            >
              <Eye className="w-3.5 h-3.5 text-slate-600" /> Public Preview
            </button>
            <button
              type="button"
              onClick={() => setModalType('RESUME')}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl transition-colors shadow-sm"
            >
              <FileText className="w-3.5 h-3.5" /> Manage Resume
            </button>
          </div>
        </div>

        {/* Verification Overview Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-6 pt-6 border-t border-slate-100">
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Records</p>
            <p className="text-xl font-black text-slate-900 mt-0.5">{stats.total}</p>
          </div>
          <div className="p-3 bg-emerald-50/70 rounded-2xl border border-emerald-100">
            <p className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Verified
            </p>
            <p className="text-xl font-black text-emerald-900 mt-0.5">{stats.verified}</p>
          </div>
          <div className="p-3 bg-amber-50/70 rounded-2xl border border-amber-100">
            <p className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider flex items-center gap-1">
              <Clock className="w-3 h-3" /> Pending
            </p>
            <p className="text-xl font-black text-amber-900 mt-0.5">{stats.pending}</p>
          </div>
          <div className="p-3 bg-rose-50/70 rounded-2xl border border-rose-100">
            <p className="text-[11px] font-semibold text-rose-700 uppercase tracking-wider flex items-center gap-1">
              <XCircle className="w-3 h-3" /> Rejected
            </p>
            <p className="text-xl font-black text-rose-900 mt-0.5">{stats.rejected}</p>
          </div>
          <div className="p-3 bg-brand-50/70 rounded-2xl border border-brand-100 col-span-2 sm:col-span-1">
            <p className="text-[11px] font-semibold text-brand-700 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Verified Rate
            </p>
            <p className="text-xl font-black text-brand-900 mt-0.5">{stats.rate}%</p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-200 text-xs font-semibold scrollbar-none">
        {[
          { key: 'ALL', label: 'All Dimensions' },
          { key: 'RESUME', label: 'Resume' },
          { key: 'EDUCATION', label: `Education (${portfolio?.educations?.length || 0})` },
          { key: 'SKILLS', label: `Skills (${portfolio?.skillProfiles?.length || 0})` },
          { key: 'CERTIFICATIONS', label: `Certifications (${portfolio?.certificates?.length || 0})` },
          { key: 'PROJECTS', label: `Projects (${portfolio?.projects?.length || 0})` },
          { key: 'INTERNSHIPS', label: `Internships (${portfolio?.internships?.length || 0})` },
          { key: 'ACHIEVEMENTS', label: `Achievements (${portfolio?.achievements?.length || 0})` },
          { key: 'TRAINING', label: `Training (${portfolio?.trainings?.length || 0})` },
          { key: 'ASSESSMENTS', label: `Assessments (${portfolio?.assessmentAttempts?.length || 0})` },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-3.5 py-2 rounded-xl whitespace-nowrap transition-all ${
              activeTab === tab.key
                ? 'bg-brand-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* SECTION: Resume */}
      {(activeTab === 'ALL' || activeTab === 'RESUME') && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-600" />
              <h2 className="text-base font-bold text-slate-900">Official Curriculum Vitae / Resume</h2>
            </div>
            <button
              type="button"
              onClick={() => setModalType('RESUME')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors border border-indigo-200"
            >
              <Plus className="w-3.5 h-3.5" />
              {portfolio?.resumeUrl ? 'Update Resume' : 'Add Resume'}
            </button>
          </div>

          {portfolio?.resumeUrl ? (
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900">Active Resume File</span>
                  {renderVerificationBadge(portfolio.resumeVerificationStatus, portfolio.resumeRemarks)}
                </div>
                <p className="text-xs text-slate-500 break-all">{portfolio.resumeUrl}</p>
                {portfolio.resumeRemarks && (
                  <p className="text-[11px] text-rose-600 font-medium mt-1">
                    Auditor feedback: {portfolio.resumeRemarks}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={portfolio.resumeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> View / Download Document
                </a>
              </div>
            </div>
          ) : (
            <EmptyState
              icon={FileText}
              title="No resume uploaded yet"
              description="Upload or link your verified curriculum vitae to showcase your qualifications to recruiters and partner hospitals."
              actionText="Add Resume"
              onAction={() => setModalType('RESUME')}
            />
          )}
        </div>
      )}

      {/* SECTION: Education */}
      {(activeTab === 'ALL' || activeTab === 'EDUCATION') && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-blue-600" />
              <h2 className="text-base font-bold text-slate-900">Education & Academic History</h2>
            </div>
            <button
              type="button"
              onClick={() => setModalType('EDU')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors border border-blue-200"
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
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between space-y-3"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-xs font-bold text-slate-900">
                        {edu.degree} in {edu.fieldOfStudy}
                      </h3>
                      {renderVerificationBadge(edu.verificationStatus, edu.remarks)}
                    </div>
                    <p className="text-xs text-slate-600 mt-1 font-medium">{edu.institution}</p>
                    <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {edu.startYear} - {edu.endYear || 'Present'} {edu.grade ? `• Grade: ${edu.grade}` : ''}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-200/80 flex items-center justify-end">
                    <button
                      type="button"
                      onClick={() => handleDeleteEdu(edu.id)}
                      className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                      title="Delete education record"
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
              description="Add your undergraduate, graduate, or secondary academic credentials to your verified digital record."
              actionText="Add Education"
              onAction={() => setModalType('EDU')}
            />
          )}
        </div>
      )}

      {/* SECTION: Skills */}
      {(activeTab === 'ALL' || activeTab === 'SKILLS') && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-600" />
              <h2 className="text-base font-bold text-slate-900">Skills & Competencies</h2>
            </div>
            <button
              type="button"
              onClick={() => setModalType('SKILL')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors border border-emerald-200"
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
                  className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-xs font-bold text-slate-900">{sp.skill?.name}</h3>
                      <span className="text-[10px] text-slate-500">
                        {sp.skill?.category?.name || 'Domain Competency'}
                      </span>
                    </div>
                    {renderVerificationBadge(sp.verificationStatus, sp.remarks)}
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/80">
                    <span className="inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
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
              description="Self-report your clinical, botanical, or pharmacological proficiencies. Skills remain Pending until validated by audits or assessments."
              actionText="Add Skill"
              onAction={() => setModalType('SKILL')}
            />
          )}
        </div>
      )}

      {/* SECTION: Projects */}
      {(activeTab === 'ALL' || activeTab === 'PROJECTS') && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FolderGit2 className="w-5 h-5 text-brand-600" />
              <h2 className="text-base font-bold text-slate-900">Technical & Capstone Projects</h2>
            </div>
            <button
              type="button"
              onClick={() => setModalType('PROJECT')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-brand-700 bg-brand-50 hover:bg-brand-100 rounded-xl transition-colors border border-brand-200"
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
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between space-y-3"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-xs font-bold text-slate-900">{proj.title}</h3>
                      {renderVerificationBadge(proj.verificationStatus, proj.remarks)}
                    </div>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{proj.description}</p>
                    {proj.technologies && (
                      <p className="text-[11px] text-brand-700 font-medium mt-2">
                        Stack / Methods: {proj.technologies}
                      </p>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {proj.projectUrl && (
                        <a
                          href={proj.projectUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] text-brand-600 hover:underline flex items-center gap-1 font-medium"
                        >
                          <ExternalLink className="w-3 h-3" /> Live Demo
                        </a>
                      )}
                      {proj.repoUrl && (
                        <a
                          href={proj.repoUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] text-slate-600 hover:underline flex items-center gap-1 font-medium"
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
              description="Add academic, research, or clinical formulation projects to showcase your practical knowledge."
              actionText="Add Project"
              onAction={() => setModalType('PROJECT')}
            />
          )}
        </div>
      )}

      {/* SECTION: Certifications */}
      {(activeTab === 'ALL' || activeTab === 'CERTIFICATIONS') && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-purple-600" />
              <h2 className="text-base font-bold text-slate-900">Certifications & Licenses</h2>
            </div>
            <button
              type="button"
              onClick={() => setModalType('CERT')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors border border-purple-200"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Certification
            </button>
          </div>

          {((portfolio?.certificates && portfolio.certificates.length > 0) || (portfolio?.courseCertificates && portfolio.courseCertificates.length > 0)) ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {portfolio?.courseCertificates?.map((cc: any) => (
                <div
                  key={cc.id}
                  className="p-4 rounded-xl border border-brand-200 bg-brand-50/30 flex flex-col justify-between space-y-3"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-brand-700 uppercase tracking-wider bg-brand-50 px-2 py-0.5 rounded border border-brand-200 mb-1">
                          <Award className="w-3 h-3 text-brand-600" /> Learning Hub Certificate
                        </span>
                        <h3 className="text-xs font-bold text-slate-900">{cc.courseTitle || cc.course?.title}</h3>
                      </div>
                      {renderVerificationBadge(cc.verificationStatus, cc.remarks)}
                    </div>
                    <p className="text-xs text-slate-600 mt-1">Provider: {cc.providerName || cc.course?.providerName}</p>
                    <p className="text-[11px] text-slate-400 mt-1">Code: <span className="font-mono font-bold text-slate-700">{cc.certificateCode}</span></p>
                  </div>
                  <div className="pt-2 border-t border-brand-100 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Issued {new Date(cc.issueDate).toLocaleDateString()}</span>
                    <span className="font-semibold text-brand-600">Verified Course</span>
                  </div>
                </div>
              ))}

              {portfolio?.certificates?.map((c: any) => (
                <div
                  key={c.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between space-y-3"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-xs font-bold text-slate-900">{c.title}</h3>
                      {renderVerificationBadge(c.verificationStatus, c.remarks)}
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">{c.issuingOrganization}</p>
                    {c.issueDate && <p className="text-[11px] text-slate-400 mt-1">Issued: {c.issueDate}</p>}
                  </div>

                  <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between">
                    {c.credentialUrl ? (
                      <a
                        href={c.credentialUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-brand-600 hover:underline flex items-center gap-1 font-medium"
                      >
                        <ExternalLink className="w-3 h-3" /> Credential URL
                      </a>
                    ) : (
                      <span />
                    )}
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
              description="Log certificates from AYUSH, NPTEL, Coursera, or industry councils for institutional validation."
              actionText="Add Certification"
              onAction={() => setModalType('CERT')}
            />
          )}
        </div>
      )}

      {/* SECTION: Internships */}
      {(activeTab === 'ALL' || activeTab === 'INTERNSHIPS') && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-emerald-600" />
              <h2 className="text-base font-bold text-slate-900">Internship Experiences</h2>
            </div>
            <button
              type="button"
              onClick={() => setModalType('INTERN')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors border border-emerald-200"
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
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between space-y-3"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-xs font-bold text-slate-900">{exp.role}</h3>
                        <p className="text-xs text-slate-600 font-medium">{exp.companyName}</p>
                      </div>
                      {renderVerificationBadge(exp.verificationStatus, exp.remarks)}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      {exp.startDate} - {exp.endDate || 'Present'}
                    </p>
                    {exp.description && <p className="text-xs text-slate-600 mt-2">{exp.description}</p>}
                  </div>

                  <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between">
                    {exp.certificateUrl ? (
                      <a
                        href={exp.certificateUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-brand-600 hover:underline flex items-center gap-1 font-medium"
                      >
                        <ExternalLink className="w-3 h-3" /> Certificate of Completion
                      </a>
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
              description="Add hospital training or pharmaceutical internship roles to strengthen your professional profile."
              actionText="Add Experience"
              onAction={() => setModalType('INTERN')}
            />
          )}
        </div>
      )}

      {/* SECTION: Achievements */}
      {(activeTab === 'ALL' || activeTab === 'ACHIEVEMENTS') && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-600" />
              <h2 className="text-base font-bold text-slate-900">Honors & Achievements</h2>
            </div>
            <button
              type="button"
              onClick={() => setModalType('ACHIEV')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-xl transition-colors border border-amber-200"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Achievement
            </button>
          </div>

          {portfolio?.achievements && portfolio.achievements.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {portfolio.achievements.map((ach: any) => (
                <div
                  key={ach.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between space-y-3"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-xs font-bold text-slate-900">{ach.title}</h3>
                        {ach.category && <p className="text-[11px] text-amber-700 font-semibold">{ach.category}</p>}
                      </div>
                      {renderVerificationBadge(ach.verificationStatus, ach.remarks)}
                    </div>
                    {ach.date && <p className="text-[11px] text-slate-400 mt-1">Date: {ach.date}</p>}
                    {ach.description && <p className="text-xs text-slate-600 mt-2">{ach.description}</p>}
                  </div>

                  <div className="pt-2 border-t border-slate-200/80 flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleDeleteAchievement(ach.id)}
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
              description="Record awards, hackathons, publications, or competitive recognitions to distinguish yourself."
              actionText="Add Achievement"
              onAction={() => setModalType('ACHIEV')}
            />
          )}
        </div>
      )}

      {/* SECTION: Training */}
      {(activeTab === 'ALL' || activeTab === 'TRAINING') && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-teal-600" />
              <h2 className="text-base font-bold text-slate-900">Workshops & Industrial Training</h2>
            </div>
            <button
              type="button"
              onClick={() => setModalType('TRAIN')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-xl transition-colors border border-teal-200"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Training
            </button>
          </div>

          {portfolio?.trainings && portfolio.trainings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {portfolio.trainings.map((tr: any) => (
                <div
                  key={tr.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between space-y-3"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-xs font-bold text-slate-900">{tr.title}</h3>
                        <p className="text-xs text-teal-700 font-semibold">{tr.provider}</p>
                      </div>
                      {renderVerificationBadge(tr.verificationStatus, tr.remarks)}
                    </div>
                    {tr.duration && <p className="text-[11px] text-slate-400 mt-1">Duration: {tr.duration}</p>}
                  </div>

                  <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between">
                    {tr.certificateUrl ? (
                      <a
                        href={tr.certificateUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-brand-600 hover:underline flex items-center gap-1 font-medium"
                      >
                        <ExternalLink className="w-3 h-3" /> Certificate Link
                      </a>
                    ) : (
                      <span />
                    )}
                    <button
                      type="button"
                      onClick={() => handleDeleteTraining(tr.id)}
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
              icon={BookOpen}
              title="No training programs logged"
              description="Add clinical bootcamps, analytical instrumentation training, or faculty-led workshops."
              actionText="Add Training"
              onAction={() => setModalType('TRAIN')}
            />
          )}
        </div>
      )}

      {/* SECTION: Assessment Results */}
      {(activeTab === 'ALL' || activeTab === 'ASSESSMENTS') && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileCheck2 className="w-5 h-5 text-brand-600" />
              <h2 className="text-base font-bold text-slate-900">Verified Assessment Results</h2>
            </div>
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
              System Evaluated
            </span>
          </div>

          {portfolio?.assessmentAttempts && portfolio.assessmentAttempts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {portfolio.assessmentAttempts.map((att: any) => (
                <div
                  key={att.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between space-y-3"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-xs font-bold text-slate-900">
                        {att.assessment?.title || 'Skill Assessment'}
                      </h3>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          att.passed
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {att.passed ? 'PASSED' : 'ATTEMPTED'}
                      </span>
                    </div>
                    <p className="text-2xl font-black text-slate-900 mt-2">{Math.round(att.percentage)}%</p>
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
              description="Complete skill assessments to validate your competencies with automated score percentages."
            />
          )}
        </div>
      )}

      {/* ================= MODALS ================= */}

      {/* Add Project Modal */}
      <Modal isOpen={modalType === 'PROJECT'} onClose={() => setModalType(null)} title="Add Technical Project">
        <form onSubmit={handleAddProject} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Project Title *</label>
            <input
              type="text"
              required
              value={projectForm.title}
              onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
              placeholder="e.g., Standardization of Ashwagandha Formulations"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Description *</label>
            <textarea
              rows={3}
              required
              value={projectForm.description}
              onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
              placeholder="Objectives, extraction procedures, chromatographic evaluations..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Technologies / Methods Used</label>
            <input
              type="text"
              value={projectForm.technologies}
              onChange={(e) => setProjectForm({ ...projectForm, technologies: e.target.value })}
              placeholder="TLC, HPLC, Spectrophotometry, Phytochemical Screening"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Live Demo / Paper URL</label>
              <input
                type="url"
                value={projectForm.projectUrl}
                onChange={(e) => setProjectForm({ ...projectForm, projectUrl: e.target.value })}
                placeholder="https://..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Repository / Drive URL</label>
              <input
                type="url"
                value={projectForm.repoUrl}
                onChange={(e) => setProjectForm({ ...projectForm, repoUrl: e.target.value })}
                placeholder="https://..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
              />
            </div>
          </div>
          <p className="text-[11px] text-amber-600 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
            * Note: New entries start strictly as <strong>Pending Verification</strong> until validated by your institution.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setModalType(null)}
              className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-xl font-medium"
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
            <label className="block text-xs font-semibold text-slate-700 mb-1">Certificate Title *</label>
            <input
              type="text"
              required
              value={certForm.title}
              onChange={(e) => setCertForm({ ...certForm, title: e.target.value })}
              placeholder="e.g., Certificate in Good Clinical Practice (GCP)"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Issuing Organization *</label>
            <input
              type="text"
              required
              value={certForm.issuingOrganization}
              onChange={(e) => setCertForm({ ...certForm, issuingOrganization: e.target.value })}
              placeholder="e.g., Ministry of AYUSH / CCRAS"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Issue Date</label>
              <input
                type="text"
                value={certForm.issueDate}
                onChange={(e) => setCertForm({ ...certForm, issueDate: e.target.value })}
                placeholder="MM/YYYY"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Credential URL</label>
              <input
                type="url"
                value={certForm.credentialUrl}
                onChange={(e) => setCertForm({ ...certForm, credentialUrl: e.target.value })}
                placeholder="https://..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
              />
            </div>
          </div>
          <p className="text-[11px] text-amber-600 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
            * Note: New certifications start as <strong>Pending Verification</strong>.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setModalType(null)}
              className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-xs"
            >
              Save Certification
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Internship Modal */}
      <Modal isOpen={modalType === 'INTERN'} onClose={() => setModalType(null)} title="Add Internship Experience">
        <form onSubmit={handleAddIntern} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Company / Hospital *</label>
              <input
                type="text"
                required
                value={internForm.companyName}
                onChange={(e) => setInternForm({ ...internForm, companyName: e.target.value })}
                placeholder="e.g., Arya Vaidya Sala Kottakkal"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Role / Designation *</label>
              <input
                type="text"
                required
                value={internForm.role}
                onChange={(e) => setInternForm({ ...internForm, role: e.target.value })}
                placeholder="e.g., Clinical Pharmacology Intern"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Start Date *</label>
              <input
                type="text"
                required
                value={internForm.startDate}
                onChange={(e) => setInternForm({ ...internForm, startDate: e.target.value })}
                placeholder="e.g., Jan 2025"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">End Date</label>
              <input
                type="text"
                value={internForm.endDate}
                onChange={(e) => setInternForm({ ...internForm, endDate: e.target.value })}
                placeholder="e.g., June 2025 or Present"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Certificate / Verification URL</label>
            <input
              type="url"
              value={internForm.certificateUrl}
              onChange={(e) => setInternForm({ ...internForm, certificateUrl: e.target.value })}
              placeholder="https://..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
            <textarea
              rows={3}
              value={internForm.description}
              onChange={(e) => setInternForm({ ...internForm, description: e.target.value })}
              placeholder="Responsibilities, clinical rotation details, patient case studies..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
            />
          </div>
          <p className="text-[11px] text-amber-600 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
            * Note: New entries start strictly as <strong>Pending Verification</strong>.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setModalType(null)}
              className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-xl"
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

      {/* Add Education Modal */}
      <Modal isOpen={modalType === 'EDU'} onClose={() => setModalType(null)} title="Add Education Record">
        <form onSubmit={handleAddEdu} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Institution Name *</label>
            <input
              type="text"
              required
              value={eduForm.institution}
              onChange={(e) => setEduForm({ ...eduForm, institution: e.target.value })}
              placeholder="e.g., SSN Engineering College / National Institute of Technology / Sri Dhanvantari College"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Degree *</label>
              <input
                type="text"
                required
                value={eduForm.degree}
                onChange={(e) => setEduForm({ ...eduForm, degree: e.target.value })}
                placeholder="BAMS / MD (Ayu)"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Field of Study *</label>
              <input
                type="text"
                required
                value={eduForm.fieldOfStudy}
                onChange={(e) => setEduForm({ ...eduForm, fieldOfStudy: e.target.value })}
                placeholder="Dravyaguna / Kayachikitsa"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Start Year *</label>
              <input
                type="number"
                required
                value={eduForm.startYear}
                onChange={(e) => setEduForm({ ...eduForm, startYear: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">End Year</label>
              <input
                type="number"
                value={eduForm.endYear}
                onChange={(e) => setEduForm({ ...eduForm, endYear: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Grade / CGPA</label>
              <input
                type="text"
                value={eduForm.grade}
                onChange={(e) => setEduForm({ ...eduForm, grade: e.target.value })}
                placeholder="8.5 / 10"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
              />
            </div>
          </div>
          <p className="text-[11px] text-amber-600 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
            * Note: New academic entries start as <strong>Pending Verification</strong> until confirmed by institution registrar.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setModalType(null)}
              className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-xl"
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

      {/* Add Skill Modal */}
      <Modal isOpen={modalType === 'SKILL'} onClose={() => setModalType(null)} title="Add Skill to Profile">
        <form onSubmit={handleAddSkill} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Select Existing Skill</label>
            <select
              value={skillForm.skillId}
              onChange={(e) => setSkillForm({ ...skillForm, skillId: e.target.value, skillName: '' })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
            >
              <option value="">-- Choose from catalog or enter below --</option>
              {availableSkills.map((sk: any) => (
                <option key={sk.id} value={sk.id}>
                  {sk.name} ({sk.category?.name || 'Category'})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Or Enter New Skill Name</label>
            <input
              type="text"
              value={skillForm.skillName}
              onChange={(e) => setSkillForm({ ...skillForm, skillName: e.target.value, skillId: '' })}
              placeholder="e.g., Panchakarma Therapy, Herbarium Preparation"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Proficiency Level *</label>
            <select
              value={skillForm.proficiencyLevel}
              onChange={(e) => setSkillForm({ ...skillForm, proficiencyLevel: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
            >
              <option value="BEGINNER">BEGINNER - Basic comprehension</option>
              <option value="INTERMEDIATE">INTERMEDIATE - Practical working proficiency</option>
              <option value="ADVANCED">ADVANCED - Comprehensive mastery</option>
              <option value="EXPERT">EXPERT - Clinical authority</option>
            </select>
          </div>
          <p className="text-[11px] text-amber-600 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
            * Note: All added skills start strictly as <strong>Pending Verification</strong> until approved.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setModalType(null)}
              className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs"
            >
              Save Skill
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Achievement Modal */}
      <Modal isOpen={modalType === 'ACHIEV'} onClose={() => setModalType(null)} title="Add Honor or Achievement">
        <form onSubmit={handleAddAchievement} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Achievement Title *</label>
            <input
              type="text"
              required
              value={achievForm.title}
              onChange={(e) => setAchievForm({ ...achievForm, title: e.target.value })}
              placeholder="e.g., 1st Place at National AYUSH Innovation Conclave"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
              <input
                type="text"
                value={achievForm.category}
                onChange={(e) => setAchievForm({ ...achievForm, category: e.target.value })}
                placeholder="Hackathon, Research, Academic Honor"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Date</label>
              <input
                type="text"
                value={achievForm.date}
                onChange={(e) => setAchievForm({ ...achievForm, date: e.target.value })}
                placeholder="e.g., March 2025"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
            <textarea
              rows={3}
              value={achievForm.description}
              onChange={(e) => setAchievForm({ ...achievForm, description: e.target.value })}
              placeholder="Details on scope, organizing body, outcomes..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
            />
          </div>
          <p className="text-[11px] text-amber-600 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
            * Note: New achievements start as <strong>Pending Verification</strong>.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setModalType(null)}
              className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-xl"
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

      {/* Add Training Modal */}
      <Modal isOpen={modalType === 'TRAIN'} onClose={() => setModalType(null)} title="Add Training / Workshop">
        <form onSubmit={handleAddTraining} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Training Title *</label>
            <input
              type="text"
              required
              value={trainForm.title}
              onChange={(e) => setTrainForm({ ...trainForm, title: e.target.value })}
              placeholder="e.g., Advanced HPLC and Phytochemical Fingerprinting"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Provider / Organization *</label>
              <input
                type="text"
                required
                value={trainForm.provider}
                onChange={(e) => setTrainForm({ ...trainForm, provider: e.target.value })}
                placeholder="e.g., CSIR-CDRI Lucknow"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Duration</label>
              <input
                type="text"
                value={trainForm.duration}
                onChange={(e) => setTrainForm({ ...trainForm, duration: e.target.value })}
                placeholder="e.g., 4 Weeks, 30 Hours"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Certificate URL</label>
            <input
              type="url"
              value={trainForm.certificateUrl}
              onChange={(e) => setTrainForm({ ...trainForm, certificateUrl: e.target.value })}
              placeholder="https://..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
            />
          </div>
          <p className="text-[11px] text-amber-600 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
            * Note: New training records start as <strong>Pending Verification</strong>.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setModalType(null)}
              className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-xs"
            >
              Save Training
            </button>
          </div>
        </form>
      </Modal>

      {/* Manage Resume Modal */}
      <Modal isOpen={modalType === 'RESUME'} onClose={() => setModalType(null)} title="Manage Resume / Curriculum Vitae">
        <form onSubmit={handleUpdateResume} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Resume Document URL *</label>
            <input
              type="url"
              required
              value={resumeForm.resumeUrl}
              onChange={(e) => setResumeForm({ ...resumeForm, resumeUrl: e.target.value })}
              placeholder="https://cloud.example.com/resumes/my_resume.pdf"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Provide a direct link to your PDF, hosted document, or cloud drive resume.
            </p>
          </div>

          <p className="text-[11px] text-amber-600 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
            * Updating your resume resets its status to <strong>Pending Verification</strong> until your institution approves it.
          </p>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setModalType(null)}
              className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-xl"
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

      {/* Shareable Public Preview Modal */}
      <Modal
        isOpen={modalType === 'PREVIEW'}
        onClose={() => setModalType(null)}
        title="Public Portfolio Preview (Recruiter View)"
      >
        <div className="space-y-6 max-h-[75vh] overflow-y-auto pr-1">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-brand-600 text-white font-black text-xl flex items-center justify-center">
                {portfolio?.fullName ? portfolio.fullName.charAt(0).toUpperCase() : 'S'}
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">{portfolio?.fullName}</h3>
                <p className="text-xs text-slate-500">
                  {portfolio?.degree} in {portfolio?.department} • {portfolio?.institutionName}
                </p>
              </div>
            </div>
            {portfolio?.resumeUrl && (
              <div className="mt-3 pt-3 border-t border-slate-200/80 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">Resume:</span>
                <a
                  href={portfolio.resumeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-brand-600 hover:underline flex items-center gap-1 font-medium"
                >
                  <ExternalLink className="w-3 h-3" /> View Verified Resume
                </a>
              </div>
            )}
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">Verified Skills</h4>
            <div className="flex flex-wrap gap-1.5">
              {portfolio?.skillProfiles?.map((sp: any) => (
                <span
                  key={sp.id}
                  className={`text-xs px-2.5 py-1 rounded-full border ${
                    sp.verificationStatus === 'VERIFIED'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200 font-bold'
                      : 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}
                >
                  {sp.skill?.name} • {sp.proficiencyLevel} ({sp.verificationStatus || 'PENDING'})
                </span>
              ))}
              {(!portfolio?.skillProfiles || portfolio.skillProfiles.length === 0) && (
                <span className="text-xs text-slate-400">No skills listed yet.</span>
              )}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">Academic & Experience Timeline</h4>
            <div className="space-y-2">
              {portfolio?.educations?.map((edu: any) => (
                <div key={edu.id} className="p-3 bg-white rounded-xl border border-slate-200 text-xs flex justify-between">
                  <div>
                    <p className="font-bold text-slate-800">{edu.degree} - {edu.fieldOfStudy}</p>
                    <p className="text-slate-500">{edu.institution} ({edu.startYear} - {edu.endYear || 'Present'})</p>
                  </div>
                  {renderVerificationBadge(edu.verificationStatus)}
                </div>
              ))}
              {portfolio?.projects?.map((proj: any) => (
                <div key={proj.id} className="p-3 bg-white rounded-xl border border-slate-200 text-xs flex justify-between">
                  <div>
                    <p className="font-bold text-slate-800">{proj.title}</p>
                    <p className="text-slate-500">{proj.technologies}</p>
                  </div>
                  {renderVerificationBadge(proj.verificationStatus)}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setModalType(null)}
              className="px-5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl"
            >
              Close Preview
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
