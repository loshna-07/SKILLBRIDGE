import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Modal } from '../../components/common/Modal';
import { EmptyState } from '../../components/common/EmptyState';
import {
  Award,
  Plus,
  Trash2,
  Edit2,
  ExternalLink,
  CheckCircle2,
  Clock,
  XCircle,
  FileText,
  Calendar,
} from 'lucide-react';

interface Certification {
  id: string;
  title: string;
  issuingOrganization: string;
  issueDate?: string | null;
  expiryDate?: string | null;
  credentialId?: string | null;
  credentialUrl?: string | null;
  certificateDocUrl?: string | null;
  skillsCovered?: string | null;
  verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
  remarks?: string | null;
  createdAt: string;
}

export const StudentCertifications: React.FC = () => {
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCert, setEditingCert] = useState<Certification | null>(null);

  const [form, setForm] = useState({
    title: '',
    issuingOrganization: '',
    issueDate: '',
    expiryDate: '',
    credentialId: '',
    credentialUrl: '',
    certificateDocUrl: '',
    skillsCovered: '',
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCertifications = () => {
    setLoading(true);
    api
      .get('/student/certifications')
      .then((res) => setCertifications(res.data || []))
      .catch((err) => console.error('Failed to load certifications', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCertifications();
  }, []);

  const handleOpenAdd = () => {
    setEditingCert(null);
    setForm({
      title: '',
      issuingOrganization: '',
      issueDate: '',
      expiryDate: '',
      credentialId: '',
      credentialUrl: '',
      certificateDocUrl: '',
      skillsCovered: '',
    });
    setError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cert: Certification) => {
    setEditingCert(cert);
    setForm({
      title: cert.title,
      issuingOrganization: cert.issuingOrganization,
      issueDate: cert.issueDate || '',
      expiryDate: cert.expiryDate || '',
      credentialId: cert.credentialId || '',
      credentialUrl: cert.credentialUrl || '',
      certificateDocUrl: cert.certificateDocUrl || '',
      skillsCovered: cert.skillsCovered || '',
    });
    setError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.issuingOrganization.trim()) {
      setError('Certification title and issuing organization are required.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      if (editingCert) {
        await api.put(`/student/certifications/${editingCert.id}`, form);
      } else {
        await api.post('/student/certifications', form);
      }
      setIsModalOpen(false);
      fetchCertifications();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save certification.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to remove this certification?')) return;
    try {
      await api.delete(`/student/certifications/${id}`);
      fetchCertifications();
    } catch (err) {
      console.error('Failed to delete certification', err);
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === 'VERIFIED') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          Verified
        </span>
      );
    }
    if (status === 'REJECTED') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
          <XCircle className="w-3.5 h-3.5 text-red-600" />
          Rejected
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
        <Clock className="w-3.5 h-3.5 text-amber-600" />
        Pending Verification
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-brand-50 text-brand-700 border border-brand-200 mb-2">
            <Award className="w-3.5 h-3.5" />
            Verified Credentials
          </div>
          <h1 className="text-2xl font-bold text-slate-900">My Certifications</h1>
          <p className="text-sm text-slate-600 mt-1">
            Upload and manage professional certifications and licenses. Verified certificates enhance your opportunity matching.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-medium rounded-xl shadow-sm transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add Certification
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
        </div>
      ) : certifications.length === 0 ? (
        <EmptyState
          icon={Award}
          title="No certifications uploaded yet."
          description="Add certifications you have earned from recognized institutions or online learning providers."
          actionText="Add Your First Certification"
          onAction={handleOpenAdd}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {certifications.map((cert) => (
            <div
              key={cert.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-600 shrink-0">
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 text-base">{cert.title}</h3>
                      <p className="text-sm font-medium text-slate-600">{cert.issuingOrganization}</p>
                    </div>
                  </div>
                  {getStatusBadge(cert.verificationStatus)}
                </div>

                <div className="space-y-2 mt-4 text-xs text-slate-600">
                  {cert.issueDate && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>Issued: {cert.issueDate} {cert.expiryDate ? `• Expires: ${cert.expiryDate}` : ''}</span>
                    </div>
                  )}

                  {cert.credentialId && (
                    <div className="flex items-center gap-2">
                      <FileText className="w-3.5 h-3.5 text-slate-400" />
                      <span>Credential ID: <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">{cert.credentialId}</code></span>
                    </div>
                  )}

                  {cert.skillsCovered && (
                    <div className="pt-2">
                      <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                        Skills Covered
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {cert.skillsCovered.split(',').map((skill, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md text-[11px] font-medium"
                          >
                            {skill.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {cert.remarks && (
                    <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs mt-3">
                      <strong>Verification Note:</strong> {cert.remarks}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100">
                <div className="flex items-center gap-3">
                  {cert.credentialUrl && (
                    <a
                      href={cert.credentialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Verify Link
                    </a>
                  )}
                  {cert.certificateDocUrl && (
                    <a
                      href={cert.certificateDocUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      View Document
                    </a>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEdit(cert)}
                    className="p-1.5 text-slate-500 hover:text-brand-600 hover:bg-slate-100 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(cert.id)}
                    className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCert ? 'Edit Certification' : 'Add New Certification'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Certification Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. AWS Certified Solutions Architect, Full Stack Web Bootcamp"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Issuing Organization <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Amazon Web Services, Coursera, AYUSH Research Board"
              value={form.issuingOrganization}
              onChange={(e) => setForm({ ...form, issuingOrganization: e.target.value })}
              className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Issue Date</label>
              <input
                type="text"
                placeholder="e.g. May 2025"
                value={form.issueDate}
                onChange={(e) => setForm({ ...form, issueDate: e.target.value })}
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Expiry Date (Optional)</label>
              <input
                type="text"
                placeholder="e.g. May 2028 or No Expiry"
                value={form.expiryDate}
                onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Credential ID (Optional)</label>
            <input
              type="text"
              placeholder="e.g. CERT-8942-AYUSH"
              value={form.credentialId}
              onChange={(e) => setForm({ ...form, credentialId: e.target.value })}
              className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Credential Verification URL (Optional)</label>
            <input
              type="url"
              placeholder="https://coursera.org/verify/..."
              value={form.credentialUrl}
              onChange={(e) => setForm({ ...form, credentialUrl: e.target.value })}
              className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Document / Certificate URL (Optional)</label>
            <input
              type="url"
              placeholder="https://drive.google.com/... or https://..."
              value={form.certificateDocUrl}
              onChange={(e) => setForm({ ...form, certificateDocUrl: e.target.value })}
              className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Skills Associated with Certificate</label>
            <input
              type="text"
              placeholder="e.g. React, Node.js, Pharmacognosy, Analytical Chemistry (comma-separated)"
              value={form.skillsCovered}
              onChange={(e) => setForm({ ...form, skillsCovered: e.target.value })}
              className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 disabled:opacity-50 rounded-xl transition-colors"
            >
              {saving ? 'Saving...' : editingCert ? 'Update Certificate' : 'Save Certificate'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
