import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  BookOpen,
  Plus,
  Users,
  Award,
  Edit3,
  Trash2,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  FileText,
  Clock,
  Laptop,
  PlayCircle,
  PlusCircle,
  CheckSquare,
  Sparkles,
  Tag,
} from 'lucide-react';
import { EmptyState } from '../../components/common/EmptyState';

interface CourseProviderHubProps {
  providerRoleTitle: string;
  providerRole: 'ACADEMICIAN' | 'INSTITUTION' | 'INDUSTRY';
}

export const CourseProviderHub: React.FC<CourseProviderHubProps> = ({
  providerRoleTitle,
  providerRole,
}) => {
  const [activeTab, setActiveTab] = useState<'MY_COURSES' | 'CREATE' | 'PARTICIPANTS'>('MY_COURSES');
  const [courses, setCourses] = useState<any[]>([]);
  const [skillsTaxonomy, setSkillsTaxonomy] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State for Course Creation
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Computer Science');
  const [skillLevel, setSkillLevel] = useState('ALL_LEVELS');
  const [duration, setDuration] = useState('4 Weeks');
  const [mode, setMode] = useState('ONLINE');
  const [prerequisites, setPrerequisites] = useState('');
  const [learningOutcomes, setLearningOutcomes] = useState('');
  const [maxParticipants, setMaxParticipants] = useState('');
  const [certificateAvailable, setCertificateAvailable] = useState(true);
  const [selectedSkillIds, setSelectedSkillIds] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Syllabus Builder Modal State
  const [syllabusCourse, setSyllabusCourse] = useState<any>(null);
  const [newModuleTitle, setNewModuleTitle] = useState('');
  const [newModuleDesc, setNewModuleDesc] = useState('');
  const [activeModuleForLesson, setActiveModuleForLesson] = useState<string | null>(null);
  const [newLessonTitle, setNewLessonTitle] = useState('');
  const [newLessonContent, setNewLessonContent] = useState('');
  const [newLessonVideo, setNewLessonVideo] = useState('');
  const [newLessonDuration, setNewLessonDuration] = useState('15');

  // Participants / Certificate Approval State
  const [selectedCourseForParticipants, setSelectedCourseForParticipants] = useState<string>('');
  const [participants, setParticipants] = useState<any[]>([]);
  const [partLoading, setPartLoading] = useState(false);

  useEffect(() => {
    fetchMyCourses();
    fetchSkillsTaxonomy();
  }, []);

  useEffect(() => {
    if (selectedCourseForParticipants) {
      fetchParticipants(selectedCourseForParticipants);
    }
  }, [selectedCourseForParticipants]);

  const fetchMyCourses = async () => {
    try {
      setLoading(true);
      const res = await api.get('/courses/my/created');
      setCourses(res.data);
      if (res.data.length > 0 && !selectedCourseForParticipants) {
        setSelectedCourseForParticipants(res.data[0].id);
      }
    } catch (err) {
      console.error('Failed to load provider courses', err);
    } finally {
      setLoading(false)
    }
  };

  const fetchSkillsTaxonomy = async () => {
    try {
      const res = await api.get('/matching/skills');
      setSkillsTaxonomy(res.data || []);
    } catch (err) {
      console.error('Failed to load skills taxonomy', err);
    }
  };

  const fetchParticipants = async (courseId: string) => {
    try {
      setPartLoading(true);
      const res = await api.get('/courses/' + courseId + '/participants');
      setParticipants(res.data || []);
    } catch (err) {
      console.error('Failed to load participants', err);
    } finally {
      setPartLoading(false);
    }
  };

  const handleCreateCourse = async (publishNow: boolean) => {
    if (!title || !description || !category || !duration) {
      alert('Title, description, category, and duration are required.');
      return;
    }

    try {
      setSubmitting(true);
      await api.post('/courses', {
        title,
        description,
        category,
        skillLevel,
        duration,
        mode,
        prerequisites: prerequisites || undefined,
        learningOutcomes: learningOutcomes || undefined,
        maxParticipants: maxParticipants ? parseInt(maxParticipants, 10) : undefined,
        certificateAvailable,
        status: publishNow ? 'PUBLISHED' : 'DRAFT',
        skillIds: selectedSkillIds,
      });

      // Reset form
      setTitle('');
      setDescription('');
      setPrerequisites('');
      setLearningOutcomes('');
      setMaxParticipants('');
      setSelectedSkillIds([]);
      setActiveTab('MY_COURSES');
      fetchMyCourses();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create course.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (courseId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    try {
      await api.patch('/courses/' + courseId + '/status', { status: nextStatus });
      fetchMyCourses();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update course status.');
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm('Are you sure you want to permanently delete this course and all its modules?')) return;
    try {
      await api.delete('/courses/' + courseId);
      fetchMyCourses();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete course.');
    }
  };

  const openSyllabusModal = async (course: any) => {
    try {
      const res = await api.get('/courses/' + course.id);
      setSyllabusCourse(res.data);
    } catch (err) {
      setSyllabusCourse(course);
    }
  };

  const handleAddModule = async () => {
    if (!syllabusCourse || !newModuleTitle) return;
    try {
      await api.post('/courses/' + syllabusCourse.id + '/modules', {
        title: newModuleTitle,
        description: newModuleDesc || undefined,
      });
      setNewModuleTitle('');
      setNewModuleDesc('');
      openSyllabusModal(syllabusCourse);
      fetchMyCourses();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to add module.');
    }
  };

  const handleDeleteModule = async (moduleId: string) => {
    if (!confirm('Delete this module and all lessons inside it?')) return;
    try {
      await api.delete('/courses/' + syllabusCourse.id + '/modules/' + moduleId);
      openSyllabusModal(syllabusCourse);
      fetchMyCourses();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete module.');
    }
  };

  const handleAddLesson = async (moduleId: string) => {
    if (!syllabusCourse || !newLessonTitle) return;
    try {
      await api.post('/courses/' + syllabusCourse.id + '/modules/' + moduleId + '/lessons', {
        title: newLessonTitle,
        content: newLessonContent || undefined,
        videoUrl: newLessonVideo || undefined,
        durationMinutes: newLessonDuration ? parseInt(newLessonDuration, 10) : undefined,
      });
      setNewLessonTitle('');
      setNewLessonContent('');
      setNewLessonVideo('');
      setActiveModuleForLesson(null);
      openSyllabusModal(syllabusCourse);
      fetchMyCourses();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to add lesson.');
    }
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (!confirm('Delete this lesson?')) return;
    try {
      await api.delete('/courses/' + syllabusCourse.id + '/lessons/' + lessonId);
      openSyllabusModal(syllabusCourse);
      fetchMyCourses();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete lesson.');
    }
  };

  const handleApproveCertificate = async (courseId: string, certId: string, status: 'VERIFIED' | 'REJECTED') => {
    try {
      await api.post('/courses/' + courseId + '/certificates/' + certId + '/approve', { status });
      fetchParticipants(courseId);
      fetchMyCourses();
      alert('Certificate marked as ' + status);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update certificate verification.');
    }
  };

  const toggleSkillSelection = (skillId: string) => {
    setSelectedSkillIds((prev) =>
      prev.includes(skillId) ? prev.filter((id) => id !== skillId) : [...prev, skillId]
    );
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-brand-50 border border-brand-200 text-brand-700 mb-2">
            <BookOpen className="w-3.5 h-3.5" /> Course Provider Portal
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{providerRoleTitle} Course Hub</h1>
          <p className="text-xs text-slate-500 mt-1">
            Author structured courses, design modular syllabus lessons, and issue verified credentials.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-200 self-start md:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('MY_COURSES')}
            className={'px-4 py-2 text-xs font-bold rounded-xl transition-all ' + (activeTab === 'MY_COURSES' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900')}
          >
            My Courses ({courses.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('CREATE')}
            className={'px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ' + (activeTab === 'CREATE' ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900')}
          >
            <Plus className="w-3.5 h-3.5" /> Author New Course
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('PARTICIPANTS')}
            className={'px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ' + (activeTab === 'PARTICIPANTS' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900')}
          >
            <Users className="w-3.5 h-3.5" /> Enrolled Students
          </button>
        </div>
      </div>

      {/* TAB 1: MY COURSES */}
      {activeTab === 'MY_COURSES' && (
        <div>
          {loading ? (
            <div className="py-12 text-center text-xs text-slate-500 font-medium">Loading your courses...</div>
          ) : courses.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title="You have not created any courses yet."
              description="Publish certified curriculums to help students bridge their skill gaps and prepare for industry placements."
              actionText="Author Your First Course"
              onAction={() => setActiveTab('CREATE')}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => {
                const isPublished = course.status === 'PUBLISHED';
                return (
                  <div
                    key={course.id}
                    className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className={'px-2.5 py-0.5 rounded-full text-[10px] font-bold ' + (isPublished ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-700 border border-slate-200')}>
                          {course.status}
                        </span>
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          {course.category}
                        </span>
                      </div>

                      <h3 className="font-bold text-base text-slate-900 line-clamp-2 mb-2">
                        {course.title}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4">
                        {course.description}
                      </p>

                      <div className="grid grid-cols-2 gap-2 p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs mb-4">
                        <div>
                          <span className="text-[10px] text-slate-400 block">Syllabus</span>
                          <span className="font-bold text-slate-800">{course.totalModules} Mod &bull; {course.totalLessons} Lessons</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block">Students</span>
                          <span className="font-bold text-brand-600">{course.stats?.totalEnrolled || 0} Enrolled</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => openSyllabusModal(course)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-brand-700 bg-brand-50 hover:bg-brand-100 rounded-xl transition-colors border border-brand-200"
                      >
                        <FileText className="w-3.5 h-3.5" /> Manage Syllabus
                      </button>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(course.id, course.status)}
                          title={isPublished ? 'Unpublish' : 'Publish'}
                          className={'p-2 rounded-xl border transition-colors ' + (isPublished ? 'text-amber-600 border-amber-200 bg-amber-50 hover:bg-amber-100' : 'text-emerald-600 border-emerald-200 bg-emerald-50 hover:bg-emerald-100')}
                        >
                          {isPublished ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCourse(course.id)}
                          title="Delete Course"
                          className="p-2 text-rose-600 border border-rose-200 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors"
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
        </div>
      )}

      {/* TAB 2: AUTHOR NEW COURSE */}
      {activeTab === 'CREATE' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm max-w-4xl mx-auto space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-bold text-slate-900">Author New Course Curriculum</h2>
            <p className="text-xs text-slate-500 mt-1">Fill out the course parameters and link relevant skills from the taxonomy.</p>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1.5">Course Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Advanced Clinical Pharmacology & Pharmacognosy"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1.5">Course Overview & Description *</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide a clear summary of what this course offers..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="font-bold text-slate-700 block mb-1.5">Category *</label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g., Pharmacology, Clinical Practice"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1.5">Skill Level</label>
                <select
                  value={skillLevel}
                  onChange={(e) => setSkillLevel(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                >
                  <option value="ALL_LEVELS">All Skill Levels</option>
                  <option value="BEGINNER">Beginner</option>
                  <option value="INTERMEDIATE">Intermediate</option>
                  <option value="ADVANCED">Advanced</option>
                </select>
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1.5">Duration *</label>
                <input
                  type="text"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="e.g., 6 Weeks, 30 Hours"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-slate-700 block mb-1.5">Delivery Mode</label>
                <select
                  value={mode}
                  onChange={(e) => setMode(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                >
                  <option value="ONLINE">Online</option>
                  <option value="OFFLINE">Offline / Classroom</option>
                  <option value="HYBRID">Hybrid</option>
                </select>
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1.5">Max Capacity (Optional)</label>
                <input
                  type="number"
                  value={maxParticipants}
                  onChange={(e) => setMaxParticipants(e.target.value)}
                  placeholder="e.g., 50"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1.5">Prerequisites (Optional)</label>
              <textarea
                rows={2}
                value={prerequisites}
                onChange={(e) => setPrerequisites(e.target.value)}
                placeholder="e.g., Basic understanding of organic chemistry and medicinal botanicals..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1.5">Key Learning Outcomes (Optional)</label>
              <textarea
                rows={2}
                value={learningOutcomes}
                onChange={(e) => setLearningOutcomes(e.target.value)}
                placeholder="e.g., 1. Formulate standardized extracts\n2. Perform chromatographic analysis..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>

            {/* Skills Tag Selector */}
            <div>
              <label className="font-bold text-slate-700 block mb-1.5">Skills Covered in this Course</label>
              <p className="text-[11px] text-slate-500 mb-2">Select skills to connect this course to student Skill Gap recommendations.</p>
              <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-3 rounded-2xl bg-slate-50 border border-slate-200">
                {skillsTaxonomy.length === 0 ? (
                  <span className="text-[11px] text-slate-400">No skills defined in system taxonomy.</span>
                ) : (
                  skillsTaxonomy.map((s) => {
                    const isSelected = selectedSkillIds.includes(s.id);
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => toggleSkillSelection(s.id)}
                        className={'inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ' + (isSelected ? 'bg-brand-600 text-white shadow-sm' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100')}
                      >
                        <Tag className="w-3 h-3" /> {s.name}
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => handleCreateCourse(false)}
                disabled={submitting}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all"
              >
                Save as Draft
              </button>
              <button
                type="button"
                onClick={() => handleCreateCourse(true)}
                disabled={submitting}
                className="px-6 py-2.5 rounded-xl text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 transition-all shadow-md shadow-brand-500/20"
              >
                {submitting ? 'Creating...' : 'Publish Course'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ENROLLED PARTICIPANTS & CERTIFICATE APPROVALS */}
      {activeTab === 'PARTICIPANTS' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Enrolled Students & Certificate Approvals</h2>
              <p className="text-xs text-slate-500">Verify student completion metrics and issue official certificates.</p>
            </div>

            <select
              value={selectedCourseForParticipants}
              onChange={(e) => setSelectedCourseForParticipants(e.target.value)}
              className="px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-white font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          </div>

          {partLoading ? (
            <div className="py-12 text-center text-xs text-slate-500 font-medium">Loading enrolled participants...</div>
          ) : participants.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No students enrolled in this course yet."
              description="Ensure your course is published so students can discover and register for it."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-4">Student Name</th>
                    <th className="py-3 px-4">Institution / Dept</th>
                    <th className="py-3 px-4">Progress</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Certificate Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {participants.map((p) => {
                    const isDone = p.progressPercentage === 100;
                    const cert = p.certificate;
                    return (
                      <tr key={p.id} className="hover:bg-slate-50/50">
                        <td className="py-3 px-4 font-bold text-slate-900">{p.student.fullName}</td>
                        <td className="py-3 px-4 text-slate-600">{p.student.institutionName} &bull; {p.student.department}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-2 rounded-full bg-slate-100 overflow-hidden">
                              <div
                                className={'h-full rounded-full ' + (isDone ? 'bg-emerald-500' : 'bg-brand-600')}
                                style={{ width: p.progressPercentage + '%' }}
                              />
                            </div>
                            <span className="font-bold text-[11px]">{p.progressPercentage}%</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={'px-2.5 py-0.5 rounded-full text-[10px] font-bold ' + (isDone ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-700')}>
                            {p.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {cert ? (
                            <div className="flex items-center gap-2">
                              {cert.verificationStatus === 'VERIFIED' ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                  <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                                </span>
                              ) : (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => handleApproveCertificate(selectedCourseForParticipants, cert.id, 'VERIFIED')}
                                    className="px-2.5 py-1 text-[10px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors"
                                  >
                                    Approve & Verify
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleApproveCertificate(selectedCourseForParticipants, cert.id, 'REJECTED')}
                                    className="px-2.5 py-1 text-[10px] font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors border border-rose-200"
                                  >
                                    Reject
                                  </button>
                                </>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-400 text-[11px]">No Request</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* SYLLABUS BUILDER MODAL */}
      {syllabusCourse && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 border border-slate-200 shadow-2xl relative space-y-6 max-h-[85vh] overflow-y-auto animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-bold text-brand-600 uppercase tracking-wider block">Curriculum Syllabus Builder</span>
                <h3 className="text-lg font-bold text-slate-900">{syllabusCourse.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSyllabusCourse(null)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100"
              >
                &times;
              </button>
            </div>

            {/* Add Module Form */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <h4 className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5 text-brand-600" /> Add New Syllabus Module
              </h4>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newModuleTitle}
                  onChange={(e) => setNewModuleTitle(e.target.value)}
                  placeholder="Module Title (e.g. Unit 1: Principles of Standardization)"
                  className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
                <button
                  type="button"
                  onClick={handleAddModule}
                  className="px-4 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl transition-all shadow-sm"
                >
                  Add Module
                </button>
              </div>
            </div>

            {/* Modules List */}
            <div className="space-y-4">
              {!syllabusCourse.modules || syllabusCourse.modules.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">No modules created yet. Add a module above to get started.</p>
              ) : (
                syllabusCourse.modules.map((m: any, mIdx: number) => (
                  <div key={m.id} className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3 shadow-xs">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-brand-600 uppercase tracking-wider block">Module {mIdx + 1}</span>
                        <h5 className="font-bold text-xs text-slate-900">{m.title}</h5>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteModule(m.id)}
                        className="p-1 text-rose-500 hover:text-rose-700 text-xs font-semibold"
                      >
                        Delete Module
                      </button>
                    </div>

                    {/* Lessons in Module */}
                    <div className="divide-y divide-slate-100 bg-slate-50/50 rounded-xl p-2 border border-slate-100 text-xs space-y-1">
                      {m.lessons && m.lessons.length > 0 ? (
                        m.lessons.map((l: any, lIdx: number) => (
                          <div key={l.id} className="py-2 px-2 flex items-center justify-between hover:bg-white rounded-lg">
                            <div className="flex items-center gap-2">
                              <PlayCircle className="w-3.5 h-3.5 text-slate-400" />
                              <span>{lIdx + 1}. {l.title}</span>
                              {l.durationMinutes && <span className="text-[10px] text-slate-400">({l.durationMinutes}m)</span>}
                            </div>
                            <button
                              type="button"
                              onClick={() => handleDeleteLesson(l.id)}
                              className="text-rose-500 hover:text-rose-700 text-[10px] font-bold"
                            >
                              Remove
                            </button>
                          </div>
                        ))
                      ) : (
                        <p className="text-[11px] text-slate-400 p-2">No lessons in this module yet.</p>
                      )}
                    </div>

                    {/* Add Lesson to Module Toggle */}
                    {activeModuleForLesson === m.id ? (
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                        <input
                          type="text"
                          value={newLessonTitle}
                          onChange={(e) => setNewLessonTitle(e.target.value)}
                          placeholder="Lesson Title *"
                          className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                        />
                        <textarea
                          rows={2}
                          value={newLessonContent}
                          onChange={(e) => setNewLessonContent(e.target.value)}
                          placeholder="Lesson Study Notes / Syllabus Text"
                          className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                        />
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newLessonVideo}
                            onChange={(e) => setNewLessonVideo(e.target.value)}
                            placeholder="Video URL (Optional)"
                            className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                          />
                          <input
                            type="number"
                            value={newLessonDuration}
                            onChange={(e) => setNewLessonDuration(e.target.value)}
                            placeholder="Minutes"
                            className="w-20 px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                          />
                        </div>
                        <div className="flex justify-end gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => setActiveModuleForLesson(null)}
                            className="px-3 py-1 text-xs text-slate-600 hover:text-slate-800"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAddLesson(m.id)}
                            className="px-4 py-1 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-lg shadow-sm"
                          >
                            Save Lesson
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setActiveModuleForLesson(m.id);
                          setNewLessonTitle('');
                          setNewLessonContent('');
                        }}
                        className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
                      >
                        <PlusCircle className="w-3.5 h-3.5" /> Add Lesson to this Module
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>

            <button
              type="button"
              onClick={() => setSyllabusCourse(null)}
              className="w-full py-2.5 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-900 rounded-xl transition-all"
            >
              Done & Close Builder
            </button>
          </div>
        </div>
      )}
    </div>
  );
};