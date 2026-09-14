import React, { useEffect, useState, useMemo } from 'react';
import api from '../../services/api';
import { Modal } from '../../components/common/Modal';
import { EmptyState } from '../../components/common/EmptyState';
import { DocumentUploadZone } from '../../components/common/DocumentUploadZone';
import {
  GraduationCap,
  Plus,
  Trash2,
  Edit3,
  ExternalLink,
  CheckCircle2,
  Clock,
  XCircle,
  FileText,
  Calendar,
  Search,
  Building2,
  TrendingUp,
  Award,
  Info,
} from 'lucide-react';

interface AcademicReport {
  id: string;
  reportType: string;
  academicYear: string;
  semester: string;
  institution?: string | null;
  degree?: string | null;
  department?: string | null;
  yearOfStudy?: string | null;
  cgpa?: number | null;
  percentage?: number | null;
  description?: string | null;
  documentUrl?: string | null;
  verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
  remarks?: string | null;
  createdAt: string;
}

const REPORT_TYPES = [
  { value: 'SEMESTER_MARKSHEET', label: 'Semester Mark Sheet' },
  { value: 'TRANSCRIPT', label: 'Official Transcript' },
  { value: 'GRADE_REPORT', label: 'Term / Grade Report' },
  { value: 'ANNUAL_REPORT', label: 'Annual Academic Report' },
  { value: 'PROVISIONAL_CERTIFICATE', label: 'Provisional Degree Certificate' },
];

const SEMESTERS = [
  'Semester 1',
  'Semester 2',
  'Semester 3',
  'Semester 4',
  'Semester 5',
  'Semester 6',
  'Semester 7',
  'Semester 8',
  'Annual (1st Year)',
  'Annual (2nd Year)',
  'Annual (3rd Year)',
  'Annual (4th Year)',
];

const YEARS_OF_STUDY = ['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year / Internship'];

export const StudentAcademicReports: React.FC = () => {
  const [reports, setReports] = useState<AcademicReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [previewDocUrl, setPreviewDocUrl] = useState<string | null>(null);
  const [previewDocTitle, setPreviewDocTitle] = useState<string>('');
  const [editingReport, setEditingReport] = useState<AcademicReport | null>(null);
  const [activeTab, setActiveTab] = useState<'ALL' | 'PENDING' | 'VERIFIED' | 'REJECTED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const [form, setForm] = useState({
    reportType: 'SEMESTER_MARKSHEET',
    academicYear: '2024-2025',
    semester: 'Semester 4',
    institution: '',
    degree: '',
    department: '',
    yearOfStudy: '2nd Year',
    cgpa: '',
    percentage: '',
    description: '',
    documentUrl: '',
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = () => {
    setLoading(true);
    api
      .get('/student/academic-reports')
      .then((res) => setReports(res.data || []))
      .catch((err) => console.error('Failed to load academic reports', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleOpenAdd = () => {
    setEditingReport(null);
    setForm({
      reportType: 'SEMESTER_MARKSHEET',
      academicYear: '2024-2025',
      semester: 'Semester 4',
      institution: '',
      degree: '',
      department: '',
      yearOfStudy: '2nd Year',
      cgpa: '',
      percentage: '',
      description: '',
      documentUrl: '',
    });
    setError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (report: AcademicReport) => {
    setEditingReport(report);
    setForm({
      reportType: report.reportType || 'SEMESTER_MARKSHEET',
      academicYear: report.academicYear,
      semester: report.semester,
      institution: report.institution || '',
      degree: report.degree || '',
      department: report.department || '',
      yearOfStudy: report.yearOfStudy || '2nd Year',
      cgpa: report.cgpa !== null && report.cgpa !== undefined ? String(report.cgpa) : '',
      percentage: report.percentage !== null && report.percentage !== undefined ? String(report.percentage) : '',
      description: report.description || '',
      documentUrl: report.documentUrl || '',
    });
    setError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.academicYear.trim() || !form.semester.trim()) {
      setError('Academic year and semester are required.');
      return;
    }
    if (!form.documentUrl) {
      setError('Please upload the official mark sheet / transcript document.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      if (editingReport) {
        await api.put(`/student/academic-reports/${editingReport.id}`, form);
      } else {
        await api.post('/student/academic-reports', form);
      }
      setIsModalOpen(false);
      fetchReports();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save academic report.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to remove this academic report?')) return;
    try {
      await api.delete(`/student/academic-reports/${id}`);
      fetchReports();
    } catch (err) {
      console.error('Failed to delete academic report', err);
    }
  };

  const handleOpenPreview = (url: string, title: string) => {
    setPreviewDocUrl(url);
    setPreviewDocTitle(title);
    setIsPreviewModalOpen(true);
  };

  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      const matchesTab = activeTab === 'ALL' || r.verificationStatus === activeTab;
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        r.semester.toLowerCase().includes(query) ||
        r.academicYear.toLowerCase().includes(query) ||
        r.reportType.toLowerCase().includes(query) ||
        (r.institution && r.institution.toLowerCase().includes(query));
      return matchesTab && matchesSearch;
    });
  }, [reports, activeTab, searchQuery]);

  const stats = useMemo(() => {
    const verifiedReports = reports.filter((r) => r.verificationStatus === 'VERIFIED');
    const validCgpas = reports.map((r) => r.cgpa).filter((c): c is number => c !== null && c !== undefined && c > 0);
    const avgCgpa = validCgpas.length > 0 ? (validCgpas.reduce((a, b) => a + b, 0) / validCgpas.length).toFixed(2) : 'N/A';

    return {
      total: reports.length,
      verified: verifiedReports.length,
      pending: reports.filter((r) => r.verificationStatus === 'PENDING').length,
      rejected: reports.filter((r) => r.verificationStatus === 'REJECTED').length,
      avgCgpa,
    };
  }, [reports]);

  const getStatusBadge = (status: string) => {
    if (status === 'VERIFIED') {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          ✓ VERIFIED
        </span>
      );
    }
    if (status === 'REJECTED') {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/30">
          <XCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
          ✕ REJECTED
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30">
        <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
        ⏱ PENDING REVIEW
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-white dark:bg-[#121824] border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 border border-brand-200 dark:border-brand-800 mb-2">
            <GraduationCap className="w-3.5 h-3.5" />
            Verified Academic Records
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Academic Reports & Transcripts</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
            Upload semester mark sheets, official transcripts, and grade reports. Institutional verification validates your academic credentials for recruiters and research fellowships.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-medium rounded-xl shadow-sm transition-all shrink-0 hover:shadow-brand-500/25"
        >
          <Plus className="w-4 h-4" />
          Upload Academic Report
        </button>
      </div>

      {/* Metrics Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div
          onClick={() => setActiveTab('ALL')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            activeTab === 'ALL'
              ? 'bg-brand-50/70 border-brand-300 dark:bg-brand-950/40 dark:border-brand-700'
              : 'bg-white dark:bg-[#121824] border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Reports</span>
            <GraduationCap className="w-4 h-4 text-brand-600 dark:text-brand-400" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1.5">{stats.total}</p>
        </div>

        <div
          onClick={() => setActiveTab('VERIFIED')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            activeTab === 'VERIFIED'
              ? 'bg-emerald-50/70 border-emerald-300 dark:bg-emerald-950/40 dark:border-emerald-700'
              : 'bg-white dark:bg-[#121824] border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Verified Marksheets</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1.5">{stats.verified}</p>
        </div>

        <div className="p-4 rounded-xl border bg-white dark:bg-[#121824] border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-brand-600 dark:text-brand-400">Average CGPA / SGPA</span>
            <TrendingUp className="w-4 h-4 text-brand-600 dark:text-brand-400" />
          </div>
          <p className="text-2xl font-bold text-brand-600 dark:text-brand-400 mt-1.5">{stats.avgCgpa}</p>
        </div>

        <div
          onClick={() => setActiveTab('PENDING')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            activeTab === 'PENDING'
              ? 'bg-amber-50/70 border-amber-300 dark:bg-amber-950/40 dark:border-amber-700'
              : 'bg-white dark:bg-[#121824] border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">Pending Review</span>
            <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1.5">{stats.pending}</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-[#121824] p-3 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          {(['ALL', 'PENDING', 'VERIFIED', 'REJECTED'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0 ${
                activeTab === tab
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {tab === 'ALL'
                ? `All Reports (${stats.total})`
                : tab === 'PENDING'
                ? `Pending (${stats.pending})`
                : tab === 'VERIFIED'
                ? `Verified (${stats.verified})`
                : `Rejected (${stats.rejected})`}
            </button>
          ))}
        </div>

        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search semester, academic year..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Reports List */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
        </div>
      ) : filteredReports.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title={searchQuery ? 'No matching reports found' : 'No academic reports uploaded yet'}
          description={
            searchQuery
              ? `No academic report matches "${searchQuery}".`
              : 'Upload your semester mark sheets and grade transcripts to verify your academic performance.'
          }
          actionText={!searchQuery ? 'Upload Academic Report' : undefined}
          onAction={!searchQuery ? handleOpenAdd : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredReports.map((report) => {
            const rawDocUrl = report.documentUrl;
            const fullDocUrl = rawDocUrl
              ? rawDocUrl.startsWith('http')
                ? rawDocUrl
                : `http://localhost:5000${rawDocUrl}`
              : null;

            const typeLabel =
              REPORT_TYPES.find((t) => t.value === report.reportType)?.label ||
              report.reportType.replace(/_/g, ' ');

            return (
              <div
                key={report.id}
                className="bg-white dark:bg-[#121824] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-start gap-3">
                      <div className="w-11 h-11 rounded-xl bg-brand-50 dark:bg-brand-950/60 border border-brand-100 dark:border-brand-800 flex items-center justify-center text-brand-600 dark:text-brand-400 shrink-0 mt-0.5">
                        <GraduationCap className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300">
                            {report.semester}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            {typeLabel}
                          </span>
                        </div>
                        <h3 className="font-bold text-slate-900 dark:text-white text-base leading-snug">
                          {report.semester} Mark Sheet ({report.academicYear})
                        </h3>
                        <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          <span>{report.institution || 'Ayurveda Medical College'}</span>
                        </div>
                      </div>
                    </div>
                    <div>{getStatusBadge(report.verificationStatus)}</div>
                  </div>

                  {/* Academic Metrics Row */}
                  <div className="grid grid-cols-2 gap-2 my-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80">
                    <div>
                      <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">CGPA / SGPA:</span>
                      <p className="text-base font-bold text-brand-600 dark:text-brand-400">
                        {report.cgpa !== null && report.cgpa !== undefined ? report.cgpa.toFixed(2) : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Percentage:</span>
                      <p className="text-base font-bold text-slate-900 dark:text-white">
                        {report.percentage !== null && report.percentage !== undefined ? `${report.percentage}%` : 'N/A'}
                      </p>
                    </div>
                  </div>

                  {report.description && (
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 line-clamp-2">
                      {report.description}
                    </p>
                  )}

                  <div className="space-y-1.5 mt-3 text-xs text-slate-600 dark:text-slate-400">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>Academic Year: <strong>{report.academicYear}</strong> {report.yearOfStudy ? `• ${report.yearOfStudy}` : ''}</span>
                    </div>

                    {report.remarks && (
                      <div className={`p-2.5 rounded-lg border text-xs mt-3 ${
                        report.verificationStatus === 'VERIFIED'
                          ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                          : 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300'
                      }`}>
                        <div className="flex items-start gap-1.5">
                          <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                          <div>
                            <strong>Verifier Remarks:</strong> {report.remarks}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    {fullDocUrl ? (
                      <button
                        type="button"
                        onClick={() => handleOpenPreview(fullDocUrl, `${report.semester} Mark Sheet`)}
                        className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 hover:bg-brand-100 dark:hover:bg-brand-900/60 transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        View Mark Sheet
                      </button>
                    ) : (
                      <span className="text-xs text-slate-400 italic">No document attached</span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEdit(report)}
                      className="p-1.5 text-slate-500 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                      title="Edit Academic Report"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(report.id)}
                      className="p-1.5 text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors"
                      title="Delete Academic Report"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingReport ? 'Edit Academic Report' : 'Upload Academic Report / Mark Sheet'}
      >
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 text-xs rounded-xl border border-red-200 dark:border-red-800">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Report Type <span className="text-red-500">*</span>
              </label>
              <select
                value={form.reportType}
                onChange={(e) => setForm({ ...form, reportType: e.target.value })}
                className="w-full px-3.5 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 focus:outline-none"
              >
                {REPORT_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Semester / Academic Term <span className="text-red-500">*</span>
              </label>
              <select
                value={form.semester}
                onChange={(e) => setForm({ ...form, semester: e.target.value })}
                className="w-full px-3.5 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 focus:outline-none"
              >
                {SEMESTERS.map((sem) => (
                  <option key={sem} value={sem}>
                    {sem}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Academic Year <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 2024-2025"
                value={form.academicYear}
                onChange={(e) => setForm({ ...form, academicYear: e.target.value })}
                className="w-full px-3.5 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Year of Study
              </label>
              <select
                value={form.yearOfStudy}
                onChange={(e) => setForm({ ...form, yearOfStudy: e.target.value })}
                className="w-full px-3.5 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 focus:outline-none"
              >
                {YEARS_OF_STUDY.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                SGPA / CGPA (e.g. 8.6)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="10"
                placeholder="e.g. 8.6"
                value={form.cgpa}
                onChange={(e) => setForm({ ...form, cgpa: e.target.value })}
                className="w-full px-3.5 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Percentage (% equivalent)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                placeholder="e.g. 86.0"
                value={form.percentage}
                onChange={(e) => setForm({ ...form, percentage: e.target.value })}
                className="w-full px-3.5 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Remarks / Highlights (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Distinction in Dravyaguna & Panchakarma clinical evaluation"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-3.5 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 focus:outline-none resize-none"
            />
          </div>

          {/* Document Upload */}
          <div className="pt-1">
            <DocumentUploadZone
              fileUrl={form.documentUrl}
              onUploadSuccess={(url) => setForm({ ...form, documentUrl: url })}
              onRemove={() => setForm({ ...form, documentUrl: '' })}
              label="Upload Official Mark Sheet / Transcript (PDF or Image)"
              required={true}
              helperText="Upload official stamped mark sheet or university transcript (Max 5MB)."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 disabled:opacity-50 rounded-xl transition-colors"
            >
              {saving ? 'Uploading...' : editingReport ? 'Update Mark Sheet' : 'Submit for Verification'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Document Preview Modal */}
      <Modal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        title={previewDocTitle || 'Academic Document Preview'}
      >
        <div className="space-y-4">
          {previewDocUrl && (
            <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 min-h-[400px] flex items-center justify-center">
              {previewDocUrl.toLowerCase().includes('.pdf') ? (
                <iframe
                  src={previewDocUrl}
                  title="Mark Sheet PDF Preview"
                  className="w-full h-[550px] border-0 rounded-xl"
                />
              ) : (
                <img
                  src={previewDocUrl}
                  alt="Academic Document"
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
    </div>
  );
};
