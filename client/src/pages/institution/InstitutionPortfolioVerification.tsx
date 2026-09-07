import React, { useEffect, useState } from 'react';
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
} from 'lucide-react';

export const InstitutionPortfolioVerification: React.FC = () => {
  const [data, setData] = useState<any>({
    projects: [],
    certificates: [],
    internships: [],
    educations: [],
    achievements: [],
    trainings: [],
    skills: [],
    resumes: [],
  });
  const [loading, setLoading] = useState(true);

  // Verification modal
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [itemType, setItemType] = useState<
    'PROJECT' | 'CERTIFICATION' | 'INTERNSHIP' | 'EDUCATION' | 'ACHIEVEMENT' | 'TRAINING' | 'SKILL' | 'RESUME'
  >('PROJECT');
  const [targetStatus, setTargetStatus] = useState<'VERIFIED' | 'REJECTED'>('VERIFIED');
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchPending = () => {
    setLoading(true);
    api
      .get('/institution/portfolio/pending')
      .then((res) => setData(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleOpenAction = (item: any, type: any, status: 'VERIFIED' | 'REJECTED') => {
    setSelectedItem(item);
    setItemType(type);
    setTargetStatus(status);
    setRemarks(status === 'VERIFIED' ? 'Verified against academic records.' : 'Incomplete documentation.');
    setVerifyModalOpen(true);
  };

  const handleSubmitVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    setSubmitting(true);
    try {
      await api.post('/institution/portfolio/verify', {
        itemType,
        itemId: selectedItem.id,
        status: targetStatus,
        remarks,
      });
      alert(`Item successfully marked as ${targetStatus}!`);
      setVerifyModalOpen(false);
      fetchPending();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update verification.');
    } finally {
      setSubmitting(false);
    }
  };

  const totalPending =
    (data.projects?.length || 0) +
    (data.certificates?.length || 0) +
    (data.internships?.length || 0) +
    (data.educations?.length || 0) +
    (data.achievements?.length || 0) +
    (data.trainings?.length || 0) +
    (data.skills?.length || 0) +
    (data.resumes?.length || 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Student Portfolio Verification</h1>
            <p className="text-xs text-slate-500 mt-1">
              Authorized academic audit interface. Review submitted projects, certificates, skills, and experiences before granting verified badges.
            </p>
          </div>
          <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            {totalPending} Pending Review
          </span>
        </div>
      </div>

      {totalPending === 0 ? (
        <EmptyState
          icon={FileCheck2}
          title="No pending portfolio verifications"
          description="All student projects, certifications, skills, and academic experiences are currently up to date."
        />
      ) : (
        <div className="space-y-8">
          {/* Pending Resumes */}
          {data.resumes && data.resumes.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                <h2 className="text-base font-bold text-slate-900">Resumes / CVs ({data.resumes.length})</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.resumes.map((resItem: any) => (
                  <div
                    key={resItem.id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-xs font-bold text-slate-900">{resItem.fullName}</h3>
                        <Badge variant="warning" size="sm">
                          Pending Review
                        </Badge>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {resItem.degree} - {resItem.department}
                      </p>
                      <p className="text-xs text-slate-600 mt-1 truncate">Document: {resItem.resumeUrl}</p>
                    </div>

                    <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                      <a
                        href={resItem.resumeUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-brand-600 hover:underline flex items-center gap-1 font-medium"
                      >
                        <ExternalLink className="w-3 h-3" /> View Resume
                      </a>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenAction(resItem, 'RESUME', 'VERIFIED')}
                          className="px-2.5 py-1 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg"
                        >
                          Verify
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenAction(resItem, 'RESUME', 'REJECTED')}
                          className="px-2.5 py-1 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-200"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pending Education */}
          {data.educations && data.educations.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-blue-600" />
                <h2 className="text-base font-bold text-slate-900">Education ({data.educations.length})</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.educations.map((edu: any) => (
                  <div
                    key={edu.id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-xs font-bold text-slate-900">
                          {edu.degree} in {edu.fieldOfStudy}
                        </h3>
                        <Badge variant="warning" size="sm">
                          Pending
                        </Badge>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        By: <strong>{edu.student?.fullName}</strong> ({edu.student?.department})
                      </p>
                      <p className="text-xs text-slate-600 mt-1">{edu.institution}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {edu.startYear} - {edu.endYear || 'Present'} {edu.grade ? `• Grade: ${edu.grade}` : ''}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-200 flex justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleOpenAction(edu, 'EDUCATION', 'VERIFIED')}
                        className="px-2.5 py-1 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg"
                      >
                        Verify
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenAction(edu, 'EDUCATION', 'REJECTED')}
                        className="px-2.5 py-1 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-200"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pending Skills */}
          {data.skills && data.skills.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-600" />
                <h2 className="text-base font-bold text-slate-900">Skills ({data.skills.length})</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.skills.map((sp: any) => (
                  <div
                    key={sp.id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-xs font-bold text-slate-900">{sp.skill?.name}</h3>
                        <Badge variant="warning" size="sm">
                          Pending
                        </Badge>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        By: <strong>{sp.student?.fullName}</strong> ({sp.student?.department})
                      </p>
                      <p className="text-xs text-emerald-700 mt-1 font-semibold">
                        Proficiency: {sp.proficiencyLevel}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-200 flex justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleOpenAction(sp, 'SKILL', 'VERIFIED')}
                        className="px-2.5 py-1 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg"
                      >
                        Verify
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenAction(sp, 'SKILL', 'REJECTED')}
                        className="px-2.5 py-1 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-200"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pending Projects */}
          {data.projects && data.projects.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <FolderGit2 className="w-5 h-5 text-brand-600" />
                <h2 className="text-base font-bold text-slate-900">Projects ({data.projects.length})</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.projects.map((proj: any) => (
                  <div
                    key={proj.id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-xs font-bold text-slate-900">{proj.title}</h3>
                        <Badge variant="warning" size="sm">
                          Pending
                        </Badge>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        By: <strong>{proj.student?.fullName}</strong> ({proj.student?.department})
                      </p>
                      <p className="text-xs text-slate-600 mt-2 leading-relaxed">{proj.description}</p>
                      {proj.technologies && (
                        <p className="text-[11px] text-brand-700 font-medium mt-1.5">
                          Stack: {proj.technologies}
                        </p>
                      )}
                    </div>

                    <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {proj.projectUrl && (
                          <a
                            href={proj.projectUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[11px] text-brand-600 hover:underline flex items-center gap-1"
                          >
                            <ExternalLink className="w-3 h-3" /> Demo
                          </a>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenAction(proj, 'PROJECT', 'VERIFIED')}
                          className="px-2.5 py-1 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg"
                        >
                          Verify
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenAction(proj, 'PROJECT', 'REJECTED')}
                          className="px-2.5 py-1 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-200"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pending Certifications */}
          {data.certificates && data.certificates.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-purple-600" />
                <h2 className="text-base font-bold text-slate-900">
                  Certifications ({data.certificates.length})
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.certificates.map((cert: any) => (
                  <div
                    key={cert.id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-xs font-bold text-slate-900">{cert.title}</h3>
                        <Badge variant="warning" size="sm">
                          Pending
                        </Badge>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        By: <strong>{cert.student?.fullName}</strong> ({cert.student?.department})
                      </p>
                      <p className="text-xs text-slate-600 mt-1">Provider: {cert.issuingOrganization}</p>
                    </div>

                    <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                      {cert.credentialUrl ? (
                        <a
                          href={cert.credentialUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] text-brand-600 hover:underline flex items-center gap-1"
                        >
                          <ExternalLink className="w-3 h-3" /> View Credential
                        </a>
                      ) : (
                        <span />
                      )}

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenAction(cert, 'CERTIFICATION', 'VERIFIED')}
                          className="px-2.5 py-1 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg"
                        >
                          Verify
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenAction(cert, 'CERTIFICATION', 'REJECTED')}
                          className="px-2.5 py-1 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-200"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pending Internships */}
          {data.internships && data.internships.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-emerald-600" />
                <h2 className="text-base font-bold text-slate-900">
                  Internships ({data.internships.length})
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.internships.map((exp: any) => (
                  <div
                    key={exp.id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-xs font-bold text-slate-900">{exp.role}</h3>
                        <Badge variant="warning" size="sm">
                          Pending
                        </Badge>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        By: <strong>{exp.student?.fullName}</strong> ({exp.student?.department})
                      </p>
                      <p className="text-xs text-slate-600 mt-1 font-medium">{exp.companyName}</p>
                    </div>

                    <div className="pt-2 border-t border-slate-200 flex justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleOpenAction(exp, 'INTERNSHIP', 'VERIFIED')}
                        className="px-2.5 py-1 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg"
                      >
                        Verify
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenAction(exp, 'INTERNSHIP', 'REJECTED')}
                        className="px-2.5 py-1 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-200"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pending Achievements */}
          {data.achievements && data.achievements.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-600" />
                <h2 className="text-base font-bold text-slate-900">
                  Achievements ({data.achievements.length})
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.achievements.map((ach: any) => (
                  <div
                    key={ach.id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-xs font-bold text-slate-900">{ach.title}</h3>
                        <Badge variant="warning" size="sm">
                          Pending
                        </Badge>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        By: <strong>{ach.student?.fullName}</strong> ({ach.student?.department})
                      </p>
                      <p className="text-xs text-amber-700 mt-1 font-semibold">{ach.category}</p>
                    </div>

                    <div className="pt-2 border-t border-slate-200 flex justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleOpenAction(ach, 'ACHIEVEMENT', 'VERIFIED')}
                        className="px-2.5 py-1 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg"
                      >
                        Verify
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenAction(ach, 'ACHIEVEMENT', 'REJECTED')}
                        className="px-2.5 py-1 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-200"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pending Trainings */}
          {data.trainings && data.trainings.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-teal-600" />
                <h2 className="text-base font-bold text-slate-900">
                  Workshops & Training ({data.trainings.length})
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.trainings.map((tr: any) => (
                  <div
                    key={tr.id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-xs font-bold text-slate-900">{tr.title}</h3>
                        <Badge variant="warning" size="sm">
                          Pending
                        </Badge>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        By: <strong>{tr.student?.fullName}</strong> ({tr.student?.department})
                      </p>
                      <p className="text-xs text-teal-700 mt-1 font-semibold">{tr.provider}</p>
                    </div>

                    <div className="pt-2 border-t border-slate-200 flex justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleOpenAction(tr, 'TRAINING', 'VERIFIED')}
                        className="px-2.5 py-1 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg"
                      >
                        Verify
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenAction(tr, 'TRAINING', 'REJECTED')}
                        className="px-2.5 py-1 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-200"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Verification Modal */}
      <Modal
        isOpen={verifyModalOpen}
        onClose={() => setVerifyModalOpen(false)}
        title={`Audit Decision: ${targetStatus}`}
      >
        <form onSubmit={handleSubmitVerification} className="space-y-4">
          <p className="text-xs text-slate-600">
            You are marking this portfolio item for student{' '}
            <strong className="text-slate-900">
              {selectedItem?.student?.fullName || selectedItem?.fullName}
            </strong>{' '}
            as{' '}
            <strong className={targetStatus === 'VERIFIED' ? 'text-emerald-700' : 'text-rose-700'}>
              {targetStatus}
            </strong>
            .
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Audit Remarks / Reason
            </label>
            <textarea
              rows={3}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full p-3 text-xs rounded-xl border border-slate-200"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setVerifyModalOpen(false)}
              className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-xl"
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
              Confirm {targetStatus}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
