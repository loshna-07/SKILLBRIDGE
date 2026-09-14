import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/db';
import { AuthRequest } from '../middleware/authMiddleware';
import {
  requestAndSendOtp,
  verifySubmittedOtp,
} from '../services/otpService';

const JWT_SECRET = process.env.JWT_SECRET || 'skillbridge_secret_fallback_key';

const generateToken = (userId: string, email: string, role: string) => {
  return jwt.sign({ id: userId, email, role }, JWT_SECRET, { expiresIn: '7d' });
};

// Register User (Role-Specific)
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { role, email, password } = req.body;

    if (!role || !email || !password) {
      res.status(400).json({ message: 'Role, email, and password are required.' });
      return;
    }

    const validRoles = ['STUDENT', 'ACADEMICIAN', 'INDUSTRY', 'INSTITUTION'];
    if (!validRoles.includes(role)) {
      res.status(400).json({ message: `Invalid role. Must be one of: ${validRoles.join(', ')}` });
      return;
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existingUser) {
      res.status(400).json({ message: 'An account with this email already exists.' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // Create User along with role-specific profile in a transaction
    const newUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: email.toLowerCase().trim(),
          passwordHash,
          role,
        },
      });

      if (role === 'STUDENT') {
        const {
          fullName,
          phone,
          dob,
          gender,
          institutionId,
          institutionName,
          department,
          degree,
          currentYear,
          cgpa,
          graduationYear,
          location,
        } = req.body;

        if (!fullName || (!institutionName && !institutionId) || !department || !degree) {
          throw new Error('Full name, institution, department, and degree are required for student registration.');
        }

        let resolvedInstitutionId = institutionId || null;
        let resolvedInstitutionName = institutionName || '';

        if (resolvedInstitutionId) {
          const inst = await tx.institutionProfile.findUnique({ where: { id: resolvedInstitutionId } });
          if (inst) resolvedInstitutionName = inst.institutionName;
        } else if (resolvedInstitutionName) {
          const inst = await tx.institutionProfile.findFirst({
            where: { institutionName: { contains: resolvedInstitutionName, mode: 'insensitive' } },
          });
          if (inst) resolvedInstitutionId = inst.id;
        }

        await tx.studentProfile.create({
          data: {
            userId: user.id,
            fullName,
            phone,
            dob,
            gender,
            institutionId: resolvedInstitutionId,
            institutionName: resolvedInstitutionName,
            department,
            degree,
            currentYear: currentYear ? parseInt(currentYear, 10) : null,
            cgpa: cgpa ? parseFloat(cgpa) : null,
            graduationYear: graduationYear ? parseInt(graduationYear, 10) : null,
            location,
            accountStatus: 'PENDING',
            isVerified: false,
          },
        });
      } else if (role === 'ACADEMICIAN') {
        const {
          fullName,
          phone,
          institutionId,
          institutionName,
          department,
          designation,
          yearsOfExperience,
          areasOfExpertise,
          location,
        } = req.body;

        if (!fullName || (!institutionName && !institutionId) || !department || !designation) {
          throw new Error('Full name, institution, department, and designation are required for academician registration.');
        }

        let resolvedInstitutionId = institutionId || null;
        let resolvedInstitutionName = institutionName || '';

        if (resolvedInstitutionId) {
          const inst = await tx.institutionProfile.findUnique({ where: { id: resolvedInstitutionId } });
          if (inst) resolvedInstitutionName = inst.institutionName;
        } else if (resolvedInstitutionName) {
          const inst = await tx.institutionProfile.findFirst({
            where: { institutionName: { contains: resolvedInstitutionName, mode: 'insensitive' } },
          });
          if (inst) resolvedInstitutionId = inst.id;
        }

        await tx.academicianProfile.create({
          data: {
            userId: user.id,
            fullName,
            phone,
            institutionId: resolvedInstitutionId,
            institutionName: resolvedInstitutionName,
            department,
            designation,
            yearsOfExperience: yearsOfExperience ? parseInt(yearsOfExperience, 10) : null,
            areasOfExpertise,
            location,
            accountStatus: 'PENDING',
            isVerified: false,
          },
        });
      } else if (role === 'INDUSTRY') {
        const {
          companyName,
          officialEmail,
          industrySector,
          companySize,
          website,
          location,
          description,
          contactPerson,
          contactNumber,
        } = req.body;

        if (!companyName || !officialEmail || !industrySector) {
          throw new Error('Company name, official email, and industry sector are required for industry registration.');
        }

        await tx.industryProfile.create({
          data: {
            userId: user.id,
            companyName,
            officialEmail,
            industrySector,
            companySize,
            website,
            location,
            description,
            contactPerson,
            contactNumber,
          },
        });
      } else if (role === 'INSTITUTION') {
        const {
          institutionName,
          officialEmail,
          institutionType,
          affiliatedUniversity,
          address,
          website,
          contactPerson,
          contactNumber,
        } = req.body;

        if (!institutionName || !officialEmail || !institutionType) {
          throw new Error('Institution name, official email, and institution type are required for institution registration.');
        }

        await tx.institutionProfile.create({
          data: {
            userId: user.id,
            institutionName,
            officialEmail,
            institutionType,
            affiliatedUniversity,
            address,
            website,
            contactPerson,
            contactNumber,
          },
        });
      }

      // Record Audit Log
      await tx.auditLog.create({
        data: {
          userId: user.id,
          action: 'USER_REGISTERED',
          entityType: 'User',
          entityId: user.id,
          details: JSON.stringify({ role, email: user.email }),
        },
      });

      return user;
    });

    const token = generateToken(newUser.id, newUser.email, newUser.role);

    res.status(201).json({
      message: 'Registration successful.',
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Registration failed.' });
  }
};

// Login
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: 'Email and password are required.' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: {
        studentProfile: true,
        academicianProfile: true,
        industryProfile: true,
        institutionProfile: true,
      },
    });

    if (!user) {
      res.status(401).json({ message: 'Invalid email or password.' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ message: 'Invalid email or password.' });
      return;
    }

    const token = generateToken(user.id, user.email, user.role);

    let profile: any = null;
    if (user.role === 'STUDENT') profile = user.studentProfile;
    else if (user.role === 'ACADEMICIAN') profile = user.academicianProfile;
    else if (user.role === 'INDUSTRY') profile = user.industryProfile;
    else if (user.role === 'INSTITUTION') profile = user.institutionProfile;

    res.json({
      message: 'Login successful.',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        profile,
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Login failed.' });
  }
};

// Current authenticated user
export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated.' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        studentProfile: true,
        academicianProfile: true,
        industryProfile: true,
        institutionProfile: true,
      },
    });

    if (!user) {
      res.status(404).json({ message: 'User not found.' });
      return;
    }

    let profile: any = null;
    if (user.role === 'STUDENT') profile = user.studentProfile;
    else if (user.role === 'ACADEMICIAN') profile = user.academicianProfile;
    else if (user.role === 'INDUSTRY') profile = user.industryProfile;
    else if (user.role === 'INSTITUTION') profile = user.institutionProfile;

    res.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        profile,
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch user details.' });
  }
};

// Logout
export const logout = async (req: AuthRequest, res: Response): Promise<void> => {
  res.json({ message: 'Logout successful.' });
};

// =========================================================================
// SECURE OTP-BASED AUTHENTICATION CONTROLLERS
// =========================================================================

// Request 6-digit OTP for Email / Mobile
export const requestOtp = async (req: Request, res: Response): Promise<void> => {
  try {
    const { identifier } = req.body;

    if (!identifier || typeof identifier !== 'string' || !identifier.trim()) {
      res.status(400).json({ success: false, message: 'Please enter your registered email address or mobile number.' });
      return;
    }

    const result = await requestAndSendOtp({
      identifier: identifier.trim(),
      ipAddress: req.ip || req.socket.remoteAddress,
      userAgent: req.headers['user-agent'],
    });

    res.json(result);
  } catch (error: any) {
    const isNotFound = error.message && error.message.includes('not found');
    res.status(isNotFound ? 404 : 400).json({ success: false, message: error.message || 'Failed to send OTP.' });
  }
};

// Verify 6-digit OTP and Issue Authenticated JWT Session
export const verifyOtp = async (req: Request, res: Response): Promise<void> => {
  try {
    const { identifier, otp } = req.body;

    if (!identifier || !otp) {
      res.status(400).json({ success: false, message: 'Email/Mobile identifier and 6-digit OTP are required.' });
      return;
    }

    const result = await verifySubmittedOtp({
      identifier: identifier.trim(),
      otp: otp.toString().trim(),
    });

    const user = result.user;
    const token = generateToken(user.id, user.email, user.role);

    // Record login audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'USER_LOGIN_OTP',
        entityType: 'User',
        entityId: user.id,
        details: JSON.stringify({
          role: user.role,
          email: user.email,
          authMethod: 'OTP',
          ip: req.ip,
        }),
      },
    }).catch(() => {});

    res.json({
      success: true,
      message: 'OTP verified successfully. Authenticated session created.',
      token,
      user,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to verify OTP.',
      attemptsRemaining: error.attemptsRemaining,
    });
  }
};

// Resend OTP with Cooldown Protection
export const resendOtp = async (req: Request, res: Response): Promise<void> => {
  try {
    const { identifier } = req.body;

    if (!identifier || typeof identifier !== 'string' || !identifier.trim()) {
      res.status(400).json({ success: false, message: 'Please enter your registered email address or mobile number.' });
      return;
    }

    const result = await requestAndSendOtp({
      identifier: identifier.trim(),
      ipAddress: req.ip || req.socket.remoteAddress,
      userAgent: req.headers['user-agent'],
    });

    res.json({
      ...result,
      message: 'A fresh OTP has been dispatched to your registered credential.',
    });
  } catch (error: any) {
    const isNotFound = error.message && error.message.includes('not found');
    res.status(isNotFound ? 404 : 400).json({ success: false, message: error.message || 'Failed to resend OTP.' });
  }
};

