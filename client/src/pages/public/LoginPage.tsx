import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Navbar } from '../../components/common/Navbar';
import {
  Sparkles,
  ArrowRight,
  Lock,
  Mail,
  Phone,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  ArrowLeft,
  GraduationCap,
  Briefcase,
  School,
  Building2,
  KeyRound,
  ShieldCheck,
  Zap,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { user, isLoading, requestOtp, verifyOtp, resendOtp, login, getRoleDashboardPath } = useAuth();
  const navigate = useNavigate();

  // Mode: 'OTP' (default) or 'PASSWORD'
  const [authMode, setAuthMode] = useState<'OTP' | 'PASSWORD'>('OTP');
  // Sub-step for OTP: 1 = Identifier, 2 = Verify OTP
  const [step, setStep] = useState<1 | 2>(1);

  // Form states
  const [identifier, setIdentifier] = useState('');
  const [maskedIdentifier, setMaskedIdentifier] = useState('');
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [password, setPassword] = useState('');

  // UI status
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [devNotice, setDevNotice] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState<number>(0);
  const [attemptsRemaining, setAttemptsRemaining] = useState<number | null>(null);

  // OTP inputs refs for auto-focus
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Active session check: If already logged in, redirect directly to dashboard
  useEffect(() => {
    if (!isLoading && user) {
      navigate(getRoleDashboardPath(), { replace: true });
    }
  }, [user, isLoading, navigate, getRoleDashboardPath]);

  // Resend cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // Quick Persona selection
  const personas = [
    {
      role: 'STUDENT',
      label: 'Student',
      name: 'Priya Sharma',
      email: 'priya.engineering@demo.platform.com',
      icon: GraduationCap,
      color: 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-800 dark:bg-sky-950/40 dark:text-sky-300',
    },
    {
      role: 'ACADEMICIAN',
      label: 'Faculty',
      name: 'Dr. Suresh Kumar',
      email: 'suresh.academician@demo.edu',
      icon: School,
      color: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300',
    },
    {
      role: 'INDUSTRY',
      label: 'Industry',
      name: 'Embedded Systems Labs',
      email: 'hr@embeddedlabs.demo',
      icon: Briefcase,
      color: 'border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-800 dark:bg-purple-950/40 dark:text-purple-300',
    },
    {
      role: 'INSTITUTION',
      label: 'Institution',
      name: 'Sri Dhanvantari College',
      email: 'admin.dhanvantari@demo.ayurveda.com',
      icon: Building2,
      color: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300',
    },
  ];

  const handleSelectPersona = (email: string) => {
    setIdentifier(email);
    setError(null);
  };

  // Step 1: Submit Identifier to Request OTP
  const handleRequestOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanIdentifier = identifier.trim();
    if (!cleanIdentifier) {
      setError('Please enter your registered email address or mobile number.');
      return;
    }

    setError(null);
    setSuccessMsg(null);
    setSubmitting(true);

    const res = await requestOtp(cleanIdentifier);
    setSubmitting(false);

    if (res.success) {
      setMaskedIdentifier(res.maskedIdentifier || cleanIdentifier);
      setDevOtp(res.devOtp || null);
      setDevNotice(res.devOtpNotice || null);
      setCooldown(res.cooldownSeconds || 30);
      setOtpDigits(['', '', '', '', '', '']);
      setStep(2);
      setSuccessMsg(res.message || 'Verification code sent successfully.');
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    } else {
      setError(res.message || 'Failed to request OTP. Please verify your details.');
    }
  };

  // Handle individual OTP digit input
  const handleOtpChange = (index: number, value: string) => {
    // If user pasted multi-character string
    if (value.length > 1) {
      const cleanDigits = value.replace(/\D/g, '').slice(0, 6).split('');
      const newDigits = [...otpDigits];
      cleanDigits.forEach((digit, i) => {
        if (i < 6) newDigits[i] = digit;
      });
      setOtpDigits(newDigits);
      const nextFocus = Math.min(cleanDigits.length, 5);
      inputRefs.current[nextFocus]?.focus();

      // If full 6 digits filled by paste, trigger verify
      if (cleanDigits.length === 6) {
        triggerVerification(newDigits.join(''));
      }
      return;
    }

    const digit = value.replace(/\D/g, '');
    const newDigits = [...otpDigits];
    newDigits[index] = digit;
    setOtpDigits(newDigits);

    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // If last box filled, check if all 6 digits are complete
    if (digit && index === 5) {
      const fullCode = newDigits.join('');
      if (fullCode.length === 6) {
        triggerVerification(fullCode);
      }
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pastedData) return;

    const newDigits = ['', '', '', '', '', ''];
    pastedData.split('').forEach((char, idx) => {
      newDigits[idx] = char;
    });
    setOtpDigits(newDigits);

    const nextIndex = Math.min(pastedData.length, 5);
    inputRefs.current[nextIndex]?.focus();

    if (pastedData.length === 6) {
      triggerVerification(pastedData);
    }
  };

  // Step 2: Trigger Verification
  const triggerVerification = async (codeToVerify?: string) => {
    const code = codeToVerify || otpDigits.join('');
    if (code.length < 6) {
      setError('Please enter all 6 digits of the verification code.');
      return;
    }

    setError(null);
    setSubmitting(true);

    const res = await verifyOtp(identifier.trim(), code);
    setSubmitting(false);

    if (res.success && res.user) {
      navigate(getRoleDashboardPath(res.user.role), { replace: true });
    } else {
      setError(res.message || 'Invalid verification code.');
      if (typeof res.attemptsRemaining === 'number') {
        setAttemptsRemaining(res.attemptsRemaining);
      }
    }
  };

  const handleVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    triggerVerification();
  };

  // Resend OTP handler
  const handleResendOtp = async () => {
    if (cooldown > 0 || submitting) return;

    setError(null);
    setSubmitting(true);
    const res = await resendOtp(identifier.trim());
    setSubmitting(false);

    if (res.success) {
      setDevOtp(res.devOtp || null);
      setDevNotice(res.devOtpNotice || null);
      setCooldown(res.cooldownSeconds || 30);
      setSuccessMsg(res.message || 'A new verification code has been sent.');
      setOtpDigits(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } else {
      setError(res.message || 'Failed to resend code.');
      if (res.cooldownSeconds) {
        setCooldown(res.cooldownSeconds);
      }
    }
  };

  // Auto-fill Dev OTP helper
  const handleAutofillDevOtp = () => {
    if (!devOtp) return;
    const digits = devOtp.split('').slice(0, 6);
    setOtpDigits(digits);
    triggerVerification(devOtp);
  };

  // Fallback: Classic Password Login
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const result = await login(identifier.trim(), password);
    setSubmitting(false);

    if (result.success) {
      navigate(getRoleDashboardPath(), { replace: true });
    } else {
      setError(result.message || 'Login failed. Please check your credentials.');
    }
  };

  // If still checking active session on mount, show crisp loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 max-w-sm w-full text-center shadow-lg">
            <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center mx-auto mb-4 animate-pulse">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">Connecting to SkillBridge</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Verifying your active session...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans transition-colors duration-200">
      <Navbar />

      <div className="flex-1 flex items-center justify-center px-4 py-8 md:py-12">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-black/50 transition-colors">
          
          {/* Header & Flow Indicator */}
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center mx-auto mb-3 border border-brand-100 dark:border-brand-900/50 shadow-sm">
              {authMode === 'OTP' ? (
                step === 1 ? <KeyRound className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />
              ) : (
                <Lock className="w-6 h-6" />
              )}
            </div>

            <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              {authMode === 'PASSWORD'
                ? 'Sign in with Password'
                : step === 1
                ? 'Sign in to SkillBridge'
                : 'Enter Verification Code'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {authMode === 'PASSWORD'
                ? 'Enter your credentials to access your portal.'
                : step === 1
                ? 'Passwordless login via secure one-time verification code.'
                : `We've sent a 6-digit code to ${maskedIdentifier || 'your account'}`}
            </p>

            {/* Step Progress Indicators */}
            {authMode === 'OTP' && (
              <div className="flex items-center justify-center gap-2 mt-4">
                <div className={`flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                  step === 1
                    ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/70 dark:text-brand-300 border border-brand-200 dark:border-brand-800'
                    : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                }`}>
                  <span className="w-4 h-4 rounded-full bg-brand-600 text-white flex items-center justify-center text-[9px]">1</span>
                  Account
                </div>
                <div className="w-6 h-0.5 bg-slate-200 dark:bg-slate-700" />
                <div className={`flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                  step === 2
                    ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/70 dark:text-brand-300 border border-brand-200 dark:border-brand-800'
                    : 'text-slate-400 dark:text-slate-600'
                }`}>
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] ${
                    step === 2 ? 'bg-brand-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                  }`}>2</span>
                  Verify OTP
                </div>
              </div>
            )}
          </div>

          {/* Alert Messages */}
          {error && (
            <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-start gap-3 text-xs text-rose-700 dark:text-rose-300 animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
              <div>
                <p className="font-semibold">{error}</p>
                {attemptsRemaining !== null && attemptsRemaining >= 0 && (
                  <p className="text-[11px] text-rose-600/80 dark:text-rose-400/80 mt-0.5">
                    {attemptsRemaining} attempt{attemptsRemaining === 1 ? '' : 's'} remaining before lockout.
                  </p>
                )}
              </div>
            </div>
          )}

          {successMsg && !error && (
            <div className="mb-5 p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 flex items-center gap-3 text-xs text-emerald-700 dark:text-emerald-300 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Dev Mode Banner (Available in Development Mode) */}
          {devOtp && step === 2 && authMode === 'OTP' && (
            <div className="mb-5 p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-800 dark:text-amber-200 flex items-center justify-between gap-2 shadow-sm">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <div>
                  <span className="font-semibold">Dev Mode Code: </span>
                  <span className="font-mono tracking-widest font-bold text-sm text-slate-900 dark:text-white bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-700 ml-1">
                    {devOtp}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleAutofillDevOtp}
                className="px-2.5 py-1 text-[11px] font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-lg shadow-sm transition-colors shrink-0"
              >
                Auto-fill
              </button>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 1: IDENTIFIER ENTRY (OTP MODE) */}
          {/* ========================================================================= */}
          {authMode === 'OTP' && step === 1 && (
            <div className="space-y-5">
              {/* Quick Persona Picker */}
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  Quick Select Demo Role
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {personas.map((p) => {
                    const Icon = p.icon;
                    const isSelected = identifier.toLowerCase() === p.email.toLowerCase();
                    return (
                      <button
                        key={p.role}
                        type="button"
                        onClick={() => handleSelectPersona(p.email)}
                        className={`p-2.5 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                          isSelected
                            ? 'border-brand-500 ring-2 ring-brand-500/20 bg-brand-50/50 dark:bg-brand-950/40'
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/60 dark:bg-slate-800/40'
                        }`}
                      >
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border ${p.color}`}>
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{p.label}</p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{p.name}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Form Input */}
              <form onSubmit={handleRequestOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Registered Email or Mobile Number
                  </label>
                  <div className="relative">
                    <div className="absolute left-3.5 top-3 text-slate-400 dark:text-slate-500">
                      {identifier.includes('@') ? (
                        <Mail className="w-4 h-4" />
                      ) : (
                        <Phone className="w-4 h-4" />
                      )}
                    </div>
                    <input
                      type="text"
                      required
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="e.g. priya.sharma@institution.edu or 9876543210"
                      className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting || !identifier.trim()}
                  className="w-full py-3 px-4 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all shadow-md shadow-brand-500/20 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Sending Verification Code...
                    </>
                  ) : (
                    <>
                      Get Verification Code
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Alternative Password Login Toggle */}
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('PASSWORD');
                    setError(null);
                  }}
                  className="text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors inline-flex items-center gap-1.5"
                >
                  <Lock className="w-3.5 h-3.5" />
                  Sign in with Password instead
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 2: OTP VERIFICATION ENTRY */}
          {/* ========================================================================= */}
          {authMode === 'OTP' && step === 2 && (
            <form onSubmit={handleVerifySubmit} className="space-y-6">
              <div>
                <label className="block text-center text-xs font-semibold text-slate-700 dark:text-slate-300 mb-3">
                  Enter 6-Digit Code
                </label>

                {/* 6-box input */}
                <div className="flex items-center justify-center gap-2 sm:gap-3" onPaste={handleOtpPaste}>
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => {
                        inputRefs.current[idx] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      className="w-11 h-13 sm:w-12 sm:h-14 text-center text-lg sm:text-xl font-bold rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/90 dark:bg-slate-800 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-all"
                    />
                  ))}
                </div>
              </div>

              {/* Resend & Cooldown Info */}
              <div className="flex items-center justify-between text-xs px-1">
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setError(null);
                    setDevOtp(null);
                  }}
                  className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-medium inline-flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Change Email / Number
                </button>

                {cooldown > 0 ? (
                  <span className="text-slate-400 dark:text-slate-500 font-medium tabular-nums">
                    Resend code in {cooldown}s
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={submitting}
                    className="text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 font-semibold inline-flex items-center gap-1"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${submitting ? 'animate-spin' : ''}`} />
                    Resend Code
                  </button>
                )}
              </div>

              <button
                type="submit"
                disabled={submitting || otpDigits.join('').length < 6}
                className="w-full py-3 px-4 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all shadow-md shadow-brand-500/20 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Verifying Code...
                  </>
                ) : (
                  <>
                    Verify & Access Dashboard
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* ========================================================================= */}
          {/* STEP 3: FALLBACK PASSWORD LOGIN */}
          {/* ========================================================================= */}
          {authMode === 'PASSWORD' && (
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="name@institution.edu or name@company.com"
                    className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting || !identifier || !password}
                className="w-full py-3 px-4 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all shadow-md shadow-brand-500/20 flex items-center justify-center gap-2 mt-2"
              >
                {submitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  <>
                    Sign In with Password
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('OTP');
                    setStep(1);
                    setError(null);
                  }}
                  className="text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors inline-flex items-center gap-1.5"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  Use Passwordless OTP Login instead
                </button>
              </div>
            </form>
          )}

          {/* Footer Registration Link */}
          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Don't have an account yet?{' '}
              <Link to="/register" className="font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300">
                Register as Student, Industry, Faculty, or Institution
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

