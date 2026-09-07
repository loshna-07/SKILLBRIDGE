import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  User,
  CheckSquare,
  Award,
  Briefcase,
  BookOpen,
  Send,
  FileCheck2,
  Users,
  PlusCircle,
  Building,
  GraduationCap,
  TrendingUp,
  School,
  FileText,
  BadgePercent,
  CalendarCheck,
  Sparkles,
  X,
} from 'lucide-react';

interface SidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, onCloseMobile }) => {
  const { user } = useAuth();

  if (!user) return null;

  const studentLinks = [
    { to: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/student/skills', label: 'My Skills', icon: Award },
    { to: '/student/certifications', label: 'Certifications', icon: FileCheck2 },
    { to: '/student/profile', label: 'Profile', icon: User },
    { to: '/student/assessment', label: 'Skill Assessments', icon: CheckSquare },
    { to: '/student/skill-mapping', label: 'Skill Mapping & Pathways', icon: TrendingUp },
    { to: '/student/courses', label: 'Learning Hub', icon: BookOpen },
    { to: '/student/my-courses', label: 'My Enrolled Courses', icon: GraduationCap },
    { to: '/student/internships', label: 'Internships', icon: Briefcase },
    { to: '/student/jobs', label: 'Jobs', icon: Briefcase },
    { to: '/student/applications', label: 'My Applications', icon: Send },
    { to: '/student/portfolio', label: 'Digital Portfolio', icon: FileText },
    { to: '/student/collaboration', label: 'Mentorship & Collab', icon: Users },
  ];

  const industryLinks = [
    { to: '/industry/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/industry/profile', label: 'Company Profile', icon: Building },
    { to: '/industry/courses', label: 'Course Hub', icon: GraduationCap },
    { to: '/industry/opportunities', label: 'Manage Postings', icon: Briefcase },
    { to: '/industry/opportunities/create', label: 'Post Opportunity', icon: PlusCircle },
    { to: '/industry/applicants', label: 'Applicant Pipeline', icon: Users },
    { to: '/industry/learning-programs', label: 'Training Programs', icon: BookOpen },
    { to: '/industry/mentorship', label: 'Mentorship Hub', icon: Users },
    { to: '/industry/collaboration', label: 'Academia Collab', icon: CalendarCheck },
  ];

  const academicianLinks = [
    { to: '/academician/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/academician/profile', label: 'Faculty Profile', icon: User },
    { to: '/academician/courses', label: 'Course Hub', icon: GraduationCap },
    { to: '/academician/opportunities', label: 'Collaboration Hub', icon: Sparkles },
    { to: '/academician/participations', label: 'My Participations', icon: CheckSquare },
    { to: '/academician/opportunities?type=FACULTY_INTERNSHIP', label: 'Faculty Internships', icon: Briefcase },
    { to: '/academician/opportunities?type=INDUSTRIAL_TRAINING', label: 'Industrial Training', icon: Building },
    { to: '/academician/opportunities?type=FDP', label: 'FDPs & Training', icon: BookOpen },
    { to: '/academician/opportunities?type=CONSULTANCY', label: 'Consultancy', icon: FileText },
    { to: '/academician/opportunities?type=RESEARCH', label: 'Research Collab', icon: TrendingUp },
    { to: '/academician/opportunities?type=WORKSHOP', label: 'Workshops', icon: CalendarCheck },
    { to: '/academician/opportunities?type=MENTORSHIP', label: 'Mentorship', icon: Users },
  ];

  const institutionLinks = [
    { to: '/institution/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/institution/students', label: 'Student Directory', icon: GraduationCap },
    { to: '/institution/academicians', label: 'Faculty Directory', icon: School },
    { to: '/institution/courses', label: 'Course Hub', icon: GraduationCap },
    { to: '/institution/verify-portfolio', label: 'Verify Portfolios', icon: FileCheck2 },
    { to: '/institution/skills', label: 'Skill Gap Analytics', icon: Award },
    { to: '/institution/internships', label: 'Internship Tracking', icon: Briefcase },
    { to: '/institution/placements', label: 'Placement Drives', icon: BadgePercent },
    { to: '/institution/analytics', label: 'Live Analytics', icon: TrendingUp },
    { to: '/institution/collaboration', label: 'Industry MoUs', icon: Building },
  ];

  let links = studentLinks;
  if (user.role === 'INDUSTRY') links = industryLinks;
  else if (user.role === 'ACADEMICIAN') links = academicianLinks;
  else if (user.role === 'INSTITUTION') links = institutionLinks;

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-30 md:hidden animate-in fade-in duration-200"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Navigation Container */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 p-4 flex flex-col justify-between shrink-0 transition-transform duration-300 ease-in-out
          md:static md:translate-x-0 md:min-h-[calc(100vh-4rem)]
          ${mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'}
        `}
      >
        <div className="space-y-1">
          {/* Mobile Header with close button */}
          <div className="flex items-center justify-between px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            <span>{user.role} Navigation</span>
            <button
              onClick={onCloseMobile}
              className="p-1 text-slate-400 hover:text-slate-700 md:hidden rounded-lg hover:bg-slate-100"
              aria-label="Close Sidebar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-0.5">
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={onCloseMobile}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 text-xs font-semibold rounded-xl transition-all ${
                      isActive
                        ? 'bg-brand-50 text-brand-700 font-bold shadow-sm shadow-brand-500/10'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{link.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Footer Brand info */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500 mt-6">
          <p className="font-semibold text-slate-700">SkillBridge Portal</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Academia-Industry Collaboration</p>
        </div>
      </aside>
    </>
  );
};
