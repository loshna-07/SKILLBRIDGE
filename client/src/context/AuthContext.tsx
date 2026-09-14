import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { User, UserRole } from '../types';

interface RequestOtpResult {
  success: boolean;
  message?: string;
  maskedIdentifier?: string;
  devOtp?: string;
  devOtpNotice?: string;
  cooldownSeconds?: number;
  isNewUser?: boolean;
}

interface VerifyOtpResult {
  success: boolean;
  message?: string;
  user?: User;
  attemptsRemaining?: number;
}

interface ResendOtpResult {
  success: boolean;
  message?: string;
  devOtp?: string;
  devOtpNotice?: string;
  cooldownSeconds?: number;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  requestOtp: (identifier: string) => Promise<RequestOtpResult>;
  verifyOtp: (identifier: string, otp: string) => Promise<VerifyOtpResult>;
  resendOtp: (identifier: string) => Promise<ResendOtpResult>;
  register: (role: UserRole, data: any) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  getRoleDashboardPath: (role?: UserRole) => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('skillbridge_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const getRoleDashboardPath = (role?: UserRole): string => {
    const targetRole = role || user?.role;
    switch (targetRole) {
      case 'STUDENT':
        return '/student/dashboard';
      case 'INDUSTRY':
        return '/industry/dashboard';
      case 'ACADEMICIAN':
        return '/academician/dashboard';
      case 'INSTITUTION':
        return '/institution/dashboard';
      default:
        return '/';
    }
  };

  const refreshUser = async () => {
    const storedToken = localStorage.getItem('skillbridge_token');
    if (!storedToken) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const res = await api.get('/auth/me');
      if (res.data?.user) {
        setUser(res.data.user);
      } else {
        setUser(null);
        setToken(null);
        localStorage.removeItem('skillbridge_token');
      }
    } catch (err) {
      setUser(null);
      setToken(null);
      localStorage.removeItem('skillbridge_token');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const requestOtp = async (identifier: string): Promise<RequestOtpResult> => {
    try {
      const res = await api.post('/auth/request-otp', { identifier });
      return {
        success: true,
        message: res.data.message,
        maskedIdentifier: res.data.maskedIdentifier,
        devOtp: res.data.devOtp,
        devOtpNotice: res.data.devOtpNotice,
        cooldownSeconds: res.data.cooldownSeconds,
        isNewUser: res.data.isNewUser,
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.response?.data?.message || 'Failed to generate OTP. Please try again.',
      };
    }
  };

  const verifyOtp = async (identifier: string, otp: string): Promise<VerifyOtpResult> => {
    try {
      const res = await api.post('/auth/verify-otp', { identifier, otp });
      const { token: newToken, user: newUser } = res.data;

      localStorage.setItem('skillbridge_token', newToken);
      setToken(newToken);
      setUser(newUser);
      return {
        success: true,
        user: newUser,
        message: res.data.message,
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.response?.data?.message || 'Invalid or expired OTP.',
        attemptsRemaining: err.response?.data?.attemptsRemaining,
      };
    }
  };

  const resendOtp = async (identifier: string): Promise<ResendOtpResult> => {
    try {
      const res = await api.post('/auth/resend-otp', { identifier });
      return {
        success: true,
        message: res.data.message,
        devOtp: res.data.devOtp,
        devOtpNotice: res.data.devOtpNotice,
        cooldownSeconds: res.data.cooldownSeconds,
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.response?.data?.message || 'Failed to resend OTP.',
        cooldownSeconds: err.response?.data?.cooldownSeconds,
      };
    }
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const res = await api.post('/auth/login', { email, password });
      const { token: newToken, user: newUser } = res.data;

      localStorage.setItem('skillbridge_token', newToken);
      setToken(newToken);
      setUser(newUser);
      return { success: true };
    } catch (err: any) {
      return {
        success: false,
        message: err.response?.data?.message || 'Login failed. Please check your credentials.',
      };
    }
  };

  const register = async (role: UserRole, formData: any): Promise<{ success: boolean; message?: string }> => {
    try {
      const res = await api.post('/auth/register', { role, ...formData });
      const { token: newToken, user: newUser } = res.data;

      localStorage.setItem('skillbridge_token', newToken);
      setToken(newToken);
      setUser(newUser);
      return { success: true };
    } catch (err: any) {
      return {
        success: false,
        message: err.response?.data?.message || 'Registration failed.',
      };
    }
  };

  const logout = () => {
    api.post('/auth/logout').catch(() => {});
    localStorage.removeItem('skillbridge_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        requestOtp,
        verifyOtp,
        resendOtp,
        register,
        logout,
        refreshUser,
        getRoleDashboardPath,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
