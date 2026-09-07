import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  Sparkles,
  LogOut,
  User as UserIcon,
  Building2,
  GraduationCap,
  Briefcase,
  School,
  ChevronDown,
  LayoutDashboard,
  Menu,
  X,
  Sun,
  Moon,
} from 'lucide-react';
import { Badge } from './Badge';
import { NotificationBell } from './NotificationBell';

interface NavbarProps {
  onToggleMobileSidebar?: () => void;
  isMobileSidebarOpen?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  onToggleMobileSidebar,
  isMobileSidebarOpen,
}) => {
  const { user, logout, getRoleDashboardPath } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Close profile menu on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    setProfileMenuOpen(false);
    logout();
    navigate('/login');
  };

  const getRoleIcon = () => {
    switch (user?.role) {
      case 'STUDENT':
        return <GraduationCap className="w-3.5 h-3.5" />;
      case 'INDUSTRY':
        return <Briefcase className="w-3.5 h-3.5" />;
      case 'ACADEMICIAN':
        return <Building2 className="w-3.5 h-3.5" />;
      case 'INSTITUTION':
        return <School className="w-3.5 h-3.5" />;
      default:
        return <UserIcon className="w-3.5 h-3.5" />;
    }
  };

  const getRoleBadgeVariant = () => {
    switch (user?.role) {
      case 'STUDENT':
        return 'info';
      case 'INDUSTRY':
        return 'purple';
      case 'ACADEMICIAN':
        return 'warning';
      case 'INSTITUTION':
        return 'success';
      default:
        return 'default';
    }
  };

  const getAvatarGradient = () => {
    switch (user?.role) {
      case 'STUDENT':
        return 'from-sky-500 to-brand-600';
      case 'INDUSTRY':
        return 'from-purple-500 to-indigo-600';
      case 'ACADEMICIAN':
        return 'from-amber-500 to-orange-600';
      case 'INSTITUTION':
        return 'from-emerald-500 to-teal-600';
      default:
        return 'from-slate-500 to-slate-700';
    }
  };

  const getUserDisplayName = () => {
    if (!user) return '';
    return (
      user.profile?.fullName ||
      user.profile?.companyName ||
      user.profile?.institutionName ||
      user.email.split('@')[0]
    );
  };

  const getUserInitials = () => {
    const name = getUserDisplayName();
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const getProfilePath = () => {
    switch (user?.role) {
      case 'STUDENT':
        return '/student/profile';
      case 'INDUSTRY':
        return '/industry/profile';
      case 'ACADEMICIAN':
        return '/academician/profile';
      case 'INSTITUTION':
        return '/institution/dashboard';
      default:
        return '/';
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand & Mobile Hamburger */}
        <div className="flex items-center gap-3">
          {user && onToggleMobileSidebar && (
            <button
              onClick={onToggleMobileSidebar}
              className="p-2 -ml-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl md:hidden transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              {isMobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          )}

          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-sky-400 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-lg text-slate-900 tracking-tight">SkillBridge</span>
                <span className="text-[10px] uppercase font-bold tracking-widest bg-brand-50 text-brand-600 px-1.5 py-0.5 rounded border border-brand-200">
                  PORTAL
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                Bridging Academia & Industry Through Skills
              </p>
            </div>
          </Link>
        </div>

        {/* Navigation Actions */}
        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              {/* Direct Dashboard Link */}
              <Link
                to={getRoleDashboardPath()}
                className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-brand-700 bg-brand-50 hover:bg-brand-100 rounded-lg transition-colors border border-brand-200"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                Dashboard
              </Link>

              {/* Role Badge */}
              <div className="hidden sm:block">
                <Badge variant={getRoleBadgeVariant() as any}>
                  {getRoleIcon()}
                  {user.role}
                </Badge>
              </div>

              {/* Theme Toggle */}
              <button
                type="button"
                onClick={toggleTheme}
                className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none"
                title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {theme === 'dark' ? (
                  <Sun className="w-4 h-4 text-amber-400 animate-in spin-in-45 duration-200" />
                ) : (
                  <Moon className="w-4 h-4 text-slate-600 dark:text-slate-300 animate-in spin-in-45 duration-200" />
                )}
              </button>

              {/* In-App Notifications */}
              <NotificationBell />

              {/* Profile Menu Dropdown */}
              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-2xl hover:bg-slate-100 transition-all border border-transparent hover:border-slate-200 focus:outline-none"
                  aria-expanded={profileMenuOpen}
                  aria-haspopup="true"
                >
                  {/* Avatar with Initials */}
                  <div
                    className={`w-9 h-9 rounded-xl bg-gradient-to-br ${getAvatarGradient()} flex items-center justify-center text-white font-bold text-xs shadow-sm`}
                  >
                    {getUserInitials()}
                  </div>
                  <div className="text-left hidden lg:block pr-1">
                    <p className="text-xs font-semibold text-slate-900 leading-tight max-w-[140px] truncate">
                      {getUserDisplayName()}
                    </p>
                    <p className="text-[10px] text-slate-500 max-w-[140px] truncate">
                      {user.email}
                    </p>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                      profileMenuOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* Dropdown Menu Container */}
                {profileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    {/* Header in dropdown */}
                    <div className="px-4 py-3 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {getUserDisplayName()}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">{user.email}</p>
                      <div className="mt-2">
                        <Badge variant={getRoleBadgeVariant() as any}>
                          {getRoleIcon()}
                          {user.role}
                        </Badge>
                      </div>
                    </div>

                    {/* Navigation Items */}
                    <div className="py-1">
                      <Link
                        to={getRoleDashboardPath()}
                        onClick={() => setProfileMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-brand-600 transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4 text-slate-400" />
                        Dashboard
                      </Link>

                      <Link
                        to={getProfilePath()}
                        onClick={() => setProfileMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-brand-600 transition-colors"
                      >
                        <UserIcon className="w-4 h-4 text-slate-400" />
                        My Profile
                      </Link>
                    </div>

                    {/* Divider & Logout Action */}
                    <div className="pt-1 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4 text-rose-500" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-xl transition-colors shadow-sm shadow-brand-500/20"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
