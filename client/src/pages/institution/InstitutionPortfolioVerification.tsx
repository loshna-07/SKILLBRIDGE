import React, { useEffect, useState, useMemo } from 'react';
import api from '../../services/api';
import { EmptyState } from '../../components/common/EmptyState';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import {
  FileCheck2,
  FolderGit2,
  Award,
  Briefcase,
  GraduationCap,
  Sparkles,
  Trophy,
  BookOpen,
  FileText,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Eye,
  Calendar,
  Building2,
  Filter,
  CheckSquare,
  Search,
} from 'lucide-react';

export const InstitutionPortfolioVerification: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Verification modal
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [itemType, setItemType] = useState<string>('CERTIFICATION');
  const [targetStatus, setTargetStatus] = useState<'VERIFIED' | 'REJECTED'>('VERIFIED');
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Document preview modal
  const [previewDocUrl, setPreviewDocUrl] = useState<string | null>(null);
  const [previewDocTitle, setPreviewDocTitle] = useState<string>('');
  const [previewModalOpen, setPreviewModalOpen] = useState(false);

  const fetchPending = () => {
    setLoading(true);
    api
      .get('/institution/portfolio/pending')
      .then((res) => {
        const rawData = res.data;
        if (Array.isArray(rawData)) {
          setItems(rawData);
        } else if (rawData && typeof rawData === 'object') {
          // If categorized object, flatten with itemType
          const flattened: any[] = [];
          Object.entries(rawData).forEach(([key, val]) => {
            if (Array.isArray(val)) {
              const mappedType = key.toUpperCase().replace(/S$/, '');
              val.forEach((item) => flattened.push({ ...item, itemType: item.itemType || mappedType }));
            }
          });
          setItems(flattened);
        }
      })
      .catch((err) => console.error('Failed to load pending items', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleOpenAction = (item: any, type: string, status: 'VERIFIED' | 'REJECTED') => {
    setSelectedItem(item);
    setItemType(item.itemType || type);
    setTargetStatus(status);
    setRemarks(status === 'VERIFIED' ? 'Verified against institutional academic records.' : 'Incomplete or unclear documentation provided.');
    setVerifyModalOpen(true);
  };

  const handleOpenDocPreview = (url: string, title: string) => {
    const fullUrl = url.startsWith('http') ? url : `http://localhost:5000${url}`;
    setPreviewDocUrl(fullUrl);
    setPreviewDocTitle(title);
    setPreviewModalOpen(true);
  };

  const handleSubmitVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    setSubmitting(true);
    try {
      await api.post('/institution/portfolio/verify', {
        itemType: selectedItem.itemType || itemType,
        itemId: selectedItem.id,
        status: targetStatus,
        remarks,
      });
      setVerifyModalOpen(false);
      fetchPending();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update verification.');
    } finally {
      setSubmitting(false);
    }
  };

  const categories = useMemo(() => {
    const counts: Record<string, number> = {
      ALL: items.length,
      CERTIFICATION: 0,
      ACADEMIC_REPORT: 0,
      ACHIEVEMENT: 0,
      SKILL: 0,
      PROJECT: 0,
      INTERNSHIP: 0,
      EDUCATION: 0,
      RESUME: 0,
    };

    items.forEach((item) => {
      const t = item.itemType || 'OTHER';
      if (counts[t] !== undefined) {
        counts[t]++;
      }
    });

    return counts;
  }, [items]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesCategory = activeCategory === 'ALL' || item.itemType === activeCategory;
      const query = searchQuery.toLowerCase();
      const studentName = item.student?.fullName || item.fullName || '';
      const title = item.title || item.degree || item.role || item.semester || '';
      const issuer = item.issuingOrganization || item.institution || item.companyName || '';
      const matchesSearch =
        !searchQuery ||
        studentName.toLowerCase().includes(query) ||
        title.toLowerCase().includes(query) ||
        issuer.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [items, activeCategory, searchQuery]);

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'CERTIFICATION':
        return <Award className="w-5 h-5 text-purple-600 dark:text-purple-400" />;
      case 'ACADEMIC_REPORT':
        return <GraduationCap className="w-5 h-5 text-brand-600 dark:text-brand-400" />;
      case 'ACHIEVEMENT':
        return <Trophy className="w-5 h-5 text-amber-600 dark:text-amber-400" />;
      case 'SKILL':
        return <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />;
      case 'PROJECT':
        return <FolderGit2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
      case 'INTERNSHIP':
        return <Briefcase className="w-5 h-5 text-teal-600 dark:text-teal-400" />;
      case 'RESUME':
        return <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />;
      default:
        return <FileCheck2 className="w-5 h-5 text-slate-600 dark:text-slate-400" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-9 h-9 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-white dark:bg-[#121824] border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 mb-2">
            <CheckSquare className="w-3.5 h-3.5" />
            Institutional Audit Portal
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Student Portfolio Verification</h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
            Official review interface. Inspect student submitted mark sheets, external certifications, research awards, and verified skill claims before granting official digital badges.
          </p>
        </div>
        <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/80 px-4 py-2 rounded-xl border border-emerald-200 dark:border-emerald-800 shrink-0">
          {items.length} Total Pending Review
        </span>
      </div>

      {/* Filter and Category Tabs */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-[#121824] p-3 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { key: 'ALL', label: `All (${categories.ALL})` },
            { key: 'CERTIFICATION', label: `Certificates (${categories.CERTIFICATION})` },
            { key: 'ACADEMIC_REPORT', label: `Marksheets (${categories.ACADEMIC_REPORT})` },
            { key: 'ACHIEVEMENT', label: `Awards (${categories.ACHIEVEMENT})` },
            { key: 'SKILL', label: `Skills (${categories.SKILL})` },
            { key: 'PROJECT', label: `Projects (${categories.PROJECT})` },
            { key: 'INTERNSHIP', label: `Internships (${categories.INTERNSHIP})` },
            { key: 'RESUME', label: `Resumes (${categories.RESUME})` },
          ].map((cat) => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0 ${
                activeCategory === cat.key
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search student, title, issuer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Items List */}
      {filteredItems.length === 0 ? (
        <EmptyState
          icon={FileCheck2}
          title={searchQuery ? 'No matching audit items found' : 'All items verified'}
          description={
            searchQuery
              ? `No pending submissions match "${searchQuery}".`
              : 'No pending student certificates or documents currently require institutional audit.'
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredItems.map((item) => {
            const studentName = item.student?.fullName || item.fullName || 'Student';
            const studentDept = item.student?.department || item.department || 'BAMS';
            const studentDegree = item.student?.degree || item.degree || '';
            const rawDocUrl = item.fileUrl || item.certificateDocUrl || item.documentUrl || item.resumeUrl || item.certificateUrl;

            return (
              <div
                key={item.id}
                className="bg-white dark:bg-[#121824] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 mt-0.5">
                        {getItemIcon(item.itemType)}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            {item.itemType?.replace(/_/g, ' ')}
                          </span>
                        </div>
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm leading-snug">
                          {item.title || item.degree || item.role || item.semester || 'Submitted Credential'}
                        </h3>
                        <p className="text-xs text-brand-600 dark:text-brand-400 font-semibold mt-0.5">
                          Student: {studentName} ({studentDegree} - {studentDept})
                        </p>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-0.5 rounded-full border border-amber-200 dark:border-amber-800 shrink-0">
                      Pending
                    </span>
                  </div>

                  {item.description && (
                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mt-1">
                      {item.description}
                    </p>
                  )}

                  <div className="space-y-1 mt-3 text-xs text-slate-600 dark:text-slate-400">
                    {item.issuingOrganization && (
                      <p>Issuer / Authority: <strong>{item.issuingOrganization}</strong></p>
                    )}
                    {item.institution && item.institution !== studentDept && (
                      <p>Institution: <strong>{item.institution}</strong></p>
                    )}
                    {item.academicYear && (
                      <p>Academic Year: <strong>{item.academicYear}</strong> {item.yearOfStudy ? `(${item.yearOfStudy})` : ''}</p>
                    )}
                    {item.cgpa !== undefined && item.cgpa !== null && (
                      <p>Claimed CGPA: <strong>{item.cgpa}</strong> {item.percentage ? `(${item.percentage}%)` : ''}</p>
                    )}
                    {item.level && (
                      <p>Competition Level: <strong>{item.level}</strong> {item.position ? `• Rank: ${item.position}` : ''}</p>
                    )}
                    {item.skillsCovered && (
                      <p className="text-[11px] text-slate-500">Skills: {item.skillsCovered}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    {rawDocUrl ? (
                      <button
                        type="button"
                        onClick={() => handleOpenDocPreview(rawDocUrl, `${studentName} - Document Evidence`)}
                        className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 hover:bg-brand-100 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Inspect Document
                      </button>
                    ) : item.credentialUrl ? (
                      <a
                        href={item.credentialUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:underline"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> External URL
                      </a>
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">No document file</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenAction(item, item.itemType, 'VERIFIED')}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Verify
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenAction(item, item.itemType, 'REJECTED')}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 rounded-xl border border-rose-200 dark:border-rose-800 transition-colors"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Verification Decision Modal */}
      <Modal
        isOpen={verifyModalOpen}
        onClose={() => setVerifyModalOpen(false)}
        title={`Institutional Verification Decision: ${targetStatus}`}
      >
        <form onSubmit={handleSubmitVerification} className="space-y-4">
          <p className="text-xs text-slate-600 dark:text-slate-400">
            You are setting the status for student{' '}
            <strong className="text-slate-900 dark:text-white">
              {selectedItem?.student?.fullName || selectedItem?.fullName || 'Student'}
            </strong>{' '}
            ({selectedItem?.itemType?.replace(/_/g, ' ')}) as{' '}
            <strong className={targetStatus === 'VERIFIED' ? 'text-emerald-600' : 'text-rose-600'}>
              {targetStatus}
            </strong>
            .
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Verification Remarks / Auditor Notes (Visible to Student)
            </label>
            <textarea
              rows={3}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Provide verification justification, roll number match, or reason if rejected..."
              className="w-full p-3 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setVerifyModalOpen(false)}
              className="px-4 py-2 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={`px-5 py-2 text-xs font-semibold text-white rounded-xl shadow-sm ${
                targetStatus === 'VERIFIED'
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-rose-600 hover:bg-rose-700'
              }`}
            >
              {submitting ? 'Submitting...' : `Confirm ${targetStatus}`}
            </button>
          </div>
        </form>
      </Modal>

      {/* Document Preview Modal */}
      <Modal
        isOpen={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
        title={previewDocTitle || 'Submitted Document Preview'}
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
                  alt="Document Proof"
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
              onClick={() => setPreviewModalOpen(false)}
              className="px-4 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
