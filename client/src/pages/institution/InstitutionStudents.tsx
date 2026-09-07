import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { EmptyState } from '../../components/common/EmptyState';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import {
  GraduationCap,
  Search,
  Award,
  BookOpen,
  Send,
  Filter,
  Eye,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  Layers,
  Sparkles,
  Calendar,
  X,
} from 'lucide-react';

export const InstitutionStudents: React.FC = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [year, setYear] = useState('');
  const [minCgpa, setMinCgpa] = useState('');
  const [skill, setSkill] = useState('');

  // Selected Student Profile Modal
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [studentDetail, setStudentDetail] = useState<any | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchStudents = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (department) params.append('department', department);
    if (year) params.append('year', year);
    if (minCgpa) params.append('minCgpa', minCgpa);
    if (skill) params.append('skill', skill);

    api
      .get(`/institution/students?${params.toString()}`)
      .then((res) => setStudents(res.data))
      .catch((err) => console.error('Failed to load institution students:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchStudents();
  }, [search, department, year, minCgpa, skill]);

  const handleOpenStudent = async (studentId: string) => {
    setSelectedStudentId(studentId);
    setDetailLoading(true);
    setIsModalOpen(true);
    try {
      const res = await api.get(`/institution/students/${studentId}`);
      setStudentDetail(res.data);
    } catch (err) {
      console.error('Failed to fetch student details:', err);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleClearFilters = () => {
    setSearch('');
    setDepartment('');
    setYear('');
    setMinCgpa('');
    setSkill('');
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Student Talent Directory</h1>
          <p className="text-xs text-slate-500 mt-1">
            Scoped to your enrolled students with multi-attribute filtering, skill scores, and deep-dive verification.
          </p>
        </div>
      </div>

      {/* Multi-Attribute Filter Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-emerald-600" />
            Filter Directory
          </span>
          {(search || department || year || minCgpa || skill) && (
            <button
              onClick={handleClearFilters}
              className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline"
            >
              Clear All Filters
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Keyword Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search name or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          {/* Department / Branch Filter */}
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white"
          >
            <option value="">All Departments</option>
            <option value="Kayachikitsa">Kayachikitsa</option>
            <option value="Dravyaguna">Dravyaguna</option>
            <option value="Panchakarma">Panchakarma</option>
            <option value="Swasthavritta">Swasthavritta</option>
            <option value="Shalya Tantra">Shalya Tantra</option>
            <option value="Computer Science">Computer Science & Eng</option>
            <option value="Electronics">Electronics & Comm Eng</option>
            <option value="Commerce">Commerce & Accounting</option>
          </select>

          {/* Year of Study */}
          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white"
          >
            <option value="">All Years</option>
            <option value="1">1st Year</option>
            <option value="2">2nd Year</option>
            <option value="3">3rd Year</option>
            <option value="4">4th Year</option>
            <option value="5">5th Year (Internship)</option>
          </select>

          {/* Min CGPA */}
          <select
            value={minCgpa}
            onChange={(e) => setMinCgpa(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white"
          >
            <option value="">Any CGPA</option>
            <option value="7.0">CGPA 7.0 & Above</option>
            <option value="7.5">CGPA 7.5 & Above</option>
            <option value="8.0">CGPA 8.0 & Above</option>
            <option value="8.5">CGPA 8.5 & Above</option>
            <option value="9.0">CGPA 9.0 & Above</option>
          </select>

          {/* Specific Skill */}
          <input
            type="text"
            placeholder="Filter by skill..."
            value={skill}
            onChange={(e) => setSkill(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Student List Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
        </div>
      ) : students.length > 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-4">Student</th>
                  <th className="p-4">Department & Degree</th>
                  <th className="p-4">Year & CGPA</th>
                  <th className="p-4">Skills Assessed</th>
                  <th className="p-4">Avg Score</th>
                  <th className="p-4">Applications</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 font-bold text-slate-900">
                      <div>{s.fullName}</div>
                      <div className="text-[11px] font-normal text-slate-400">{s.user?.email}</div>
                    </td>
                    <td className="p-4 text-slate-600">
                      <div className="font-semibold text-slate-800">{s.degree}</div>
                      <div className="text-[11px] text-slate-500">{s.department}</div>
                    </td>
                    <td className="p-4 text-slate-500">
                      <span className="font-semibold text-slate-700">Year {s.currentYear || 'N/A'}</span>
                      <div className="text-[11px] text-emerald-700 font-bold">CGPA: {s.cgpa || 'N/A'}</div>
                    </td>
                    <td className="p-4">
                      <span className="font-semibold text-slate-700">{s.skillsCount} Skills</span>
                    </td>
                    <td className="p-4">
                      <span className="font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        {s.avgScore}%
                      </span>
                    </td>
                    <td className="p-4 text-slate-600 font-semibold">{s.applicationsCount}</td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleOpenStudent(s.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs border border-emerald-200 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Deep Dive
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <EmptyState
          icon={GraduationCap}
          title="No students match the selected filters"
          description="Try broadening your department, year, or CGPA filter criteria."
        />
      )}

      {/* Student Profile Deep-Dive Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={studentDetail ? `${studentDetail.fullName} • Academic Profile` : 'Student Details'}
        maxWidth="2xl"
      >
        {detailLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
          </div>
        ) : studentDetail ? (
          <div className="space-y-6 pt-2">
            {/* Header info */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">{studentDetail.fullName}</h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  {studentDetail.degree} &bull; {studentDetail.department}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Year {studentDetail.currentYear} &bull; Roll: {studentDetail.rollNumber || 'N/A'}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="px-3 py-1.5 rounded-xl bg-white border border-emerald-200 text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">CGPA</span>
                  <span className="text-base font-black text-emerald-700">{studentDetail.cgpa || 'N/A'}</span>
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-white border border-blue-200 text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Avg Score</span>
                  <span className="text-base font-black text-blue-700">{studentDetail.avgScore}%</span>
                </div>
              </div>
            </div>

            {/* Career Interests */}
            {studentDetail.careerInterests && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                  Target Career Interests
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {studentDetail.careerInterests.split(',').map((ci: string, idx: number) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-800 border border-purple-200 text-xs font-semibold"
                    >
                      {ci.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Verified Skills */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-emerald-600" />
                Verified Competencies & Skills ({studentDetail.skillProfiles?.length || 0})
              </h4>
              {studentDetail.skillProfiles?.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No skills recorded yet.</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {studentDetail.skillProfiles.map((sp: any) => (
                    <div
                      key={sp.id}
                      className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between"
                    >
                      <div>
                        <span className="text-xs font-bold text-slate-900 block truncate">{sp.skill?.name}</span>
                        <span className="text-[10px] font-semibold text-slate-500">{sp.proficiencyLevel}</span>
                      </div>
                      {sp.scorePercentage && (
                        <span className="text-[11px] font-bold text-emerald-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                          {sp.scorePercentage}%
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Certifications */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-amber-600" />
                Certifications ({studentDetail.certifications?.length || 0})
              </h4>
              {studentDetail.certifications?.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No uploaded certifications.</p>
              ) : (
                <div className="space-y-2">
                  {studentDetail.certifications.map((cert: any) => (
                    <div
                      key={cert.id}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-bold text-slate-900 block">{cert.title}</span>
                        <span className="text-slate-500 text-[11px]">{cert.issuingOrganization}</span>
                      </div>
                      <Badge
                        variant={cert.verificationStatus === 'VERIFIED' ? 'success' : 'warning'}
                        size="sm"
                      >
                        {cert.verificationStatus}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Applications & Placement History */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-blue-600" />
                Application & Recruitment Track ({studentDetail.applications?.length || 0})
              </h4>
              {studentDetail.applications?.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No applications submitted yet.</p>
              ) : (
                <div className="space-y-2">
                  {studentDetail.applications.map((app: any) => (
                    <div
                      key={app.id}
                      className="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-bold text-slate-900 block">{app.opportunity?.title}</span>
                        <span className="text-slate-500 text-[11px]">
                          {app.opportunity?.industry?.companyName} &bull; {app.opportunity?.type}
                        </span>
                      </div>
                      <span
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${
                          app.status === 'SELECTED'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : app.status === 'SHORTLISTED'
                            ? 'bg-sky-50 text-sky-800 border-sky-200'
                            : app.status === 'REJECTED'
                            ? 'bg-rose-50 text-rose-800 border-rose-200'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        {app.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
};
