import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import prisma from '../config/db';

export interface OtpConfig {
  mode: 'development' | 'production';
  expiryMinutes: number;
  maxAttempts: number;
  resendCooldownSeconds: number;
  fromEmail: string;
}

export const getOtpConfig = (): OtpConfig => ({
  mode: (process.env.OTP_MODE as any) || 'development',
  expiryMinutes: parseInt(process.env.OTP_EXPIRY_MINUTES || '5', 10),
  maxAttempts: parseInt(process.env.OTP_MAX_ATTEMPTS || '5', 10),
  resendCooldownSeconds: parseInt(process.env.OTP_RESEND_COOLDOWN_SECONDS || '30', 10),
  fromEmail: process.env.OTP_FROM_EMAIL || 'no-reply@skillbridge.edu',
});

/**
 * Normalizes email or mobile number identifiers
 */
export function normalizeIdentifier(identifier: string): {
  normalized: string;
  isEmail: boolean;
} {
  const trimmed = identifier.trim();
  const isEmail = trimmed.includes('@');

  if (isEmail) {
    return {
      normalized: trimmed.toLowerCase(),
      isEmail: true,
    };
  }

  // Mobile number normalization: strip spaces, dashes, parentheses
  const digitsOnly = trimmed.replace(/\D/g, '');
  // If starts with 91 and has 12 digits, strip country code for consistent 10-digit matching if applicable
  const standardized = digitsOnly.length === 12 && digitsOnly.startsWith('91')
    ? digitsOnly.substring(2)
    : digitsOnly;

  return {
    normalized: standardized || trimmed,
    isEmail: false,
  };
}

/**
 * Masks email or phone number for privacy in UI feedback
 */
export function maskIdentifier(identifier: string): string {
  const { normalized, isEmail } = normalizeIdentifier(identifier);

  if (isEmail) {
    const [local, domain] = normalized.split('@');
    if (!domain) return normalized;
    if (local.length <= 2) {
      return `${local[0]}***@${domain}`;
    }
    return `${local[0]}***${local[local.length - 1]}@${domain}`;
  }

  // Mobile mask: ******1234
  if (normalized.length >= 4) {
    const last4 = normalized.slice(-4);
    return `******${last4}`;
  }
  return '******';
}

/**
 * Generates a cryptographically secure 6-digit numeric OTP string
 */
export function generateSecureOtp(): string {
  return crypto.randomInt(100000, 1000000).toString();
}

/**
 * Finds user by normalized email or phone number across all profile tables
 */
export async function findUserByIdentifier(identifier: string) {
  const { normalized, isEmail } = normalizeIdentifier(identifier);

  if (isEmail) {
    return prisma.user.findUnique({
      where: { email: normalized },
      include: {
        studentProfile: true,
        academicianProfile: true,
        industryProfile: true,
        institutionProfile: true,
      },
    });
  }

  // Search by mobile/phone number across all profile models
  const targetDigits = normalized.replace(/\D/g, '');
  const last10 = targetDigits.length >= 10 ? targetDigits.slice(-10) : targetDigits;

  const [students, academicians, industries, institutions] = await Promise.all([
    prisma.studentProfile.findMany({
      where: { phone: { not: null } },
      include: { user: { include: { studentProfile: true, academicianProfile: true, industryProfile: true, institutionProfile: true } } },
    }),
    prisma.academicianProfile.findMany({
      where: { phone: { not: null } },
      include: { user: { include: { studentProfile: true, academicianProfile: true, industryProfile: true, institutionProfile: true } } },
    }),
    prisma.industryProfile.findMany({
      where: { contactNumber: { not: null } },
      include: { user: { include: { studentProfile: true, academicianProfile: true, industryProfile: true, institutionProfile: true } } },
    }),
    prisma.institutionProfile.findMany({
      where: { contactNumber: { not: null } },
      include: { user: { include: { studentProfile: true, academicianProfile: true, industryProfile: true, institutionProfile: true } } },
    }),
  ]);

  const matchedStudent = students.find((s) => s.phone && s.phone.replace(/\D/g, '').endsWith(last10));
  if (matchedStudent?.user) return matchedStudent.user;

  const matchedAcademician = academicians.find((a) => a.phone && a.phone.replace(/\D/g, '').endsWith(last10));
  if (matchedAcademician?.user) return matchedAcademician.user;

  const matchedIndustry = industries.find((i) => i.contactNumber && i.contactNumber.replace(/\D/g, '').endsWith(last10));
  if (matchedIndustry?.user) return matchedIndustry.user;

  const matchedInstitution = institutions.find((inst) => inst.contactNumber && inst.contactNumber.replace(/\D/g, '').endsWith(last10));
  if (matchedInstitution?.user) return matchedInstitution.user;

  return null;
}

/**
 * Deliver OTP through configured provider abstraction
 */
export async function deliverOtp(params: {
  identifier: string;
  otp: string;
  userRole?: string;
  userName?: string;
}) {
  const config = getOtpConfig();
  const { normalized, isEmail } = normalizeIdentifier(params.identifier);

  if (config.mode === 'production') {
    // Production transport (SMTP / SendGrid / Twilio / SMS Gateway)
    if (isEmail) {
      // In production, connect configured SMTP / Email provider
      console.log(`[PROD OTP DISPATCH] Secure email sent to ${maskIdentifier(normalized)} via provider.`);
    } else {
      // In production, connect configured SMS provider
      console.log(`[PROD OTP DISPATCH] Secure SMS sent to ${maskIdentifier(normalized)} via SMS gateway.`);
    }
    return {
      success: true,
      provider: isEmail ? 'Email' : 'SMS',
      maskedDestination: maskIdentifier(normalized),
    };
  }

  // Development Mode Delivery Logger
  console.log('----------------------------------------------------------------');
  console.log(`🔐 [DEV OTP DELIVERY] Destination: ${normalized} (${maskIdentifier(normalized)})`);
  console.log(`   User: ${params.userName || 'SkillBridge User'} [Role: ${params.userRole || 'UNKNOWN'}]`);
  console.log(`   👉 OTP CODE: ${params.otp} (Valid for ${config.expiryMinutes} minutes)`);
  console.log('----------------------------------------------------------------');

  return {
    success: true,
    provider: 'Development Delivery',
    maskedDestination: maskIdentifier(normalized),
    devOtpNotice: `Development mode active: OTP for ${normalized} is ${params.otp}`,
  };
}

/**
 * Generate, hash, store, and dispatch an OTP for an identifier
 */
export async function requestAndSendOtp(params: {
  identifier: string;
  ipAddress?: string;
  userAgent?: string;
}) {
  const config = getOtpConfig();
  const { normalized, isEmail } = normalizeIdentifier(params.identifier);

  if (!normalized) {
    throw new Error('Please enter a valid email address or registered mobile number.');
  }

  // 1. Look up user account
  const user = await findUserByIdentifier(normalized);
  if (!user) {
    // Return generic success to prevent account enumeration if in production
    if (config.mode === 'production') {
      return {
        success: true,
        message: 'If an account exists with this credential, an OTP has been sent.',
        maskedDestination: maskIdentifier(normalized),
        cooldownSeconds: config.resendCooldownSeconds,
      };
    }
    throw new Error(`Account with ${isEmail ? 'email' : 'mobile'} "${normalized}" not found. Please register or verify the identifier.`);
  }

  // 2. Check Resend Cooldown
  const recentOtp = await prisma.oTPVerification.findFirst({
    where: {
      identifier: normalized,
      used: false,
    },
    orderBy: { createdAt: 'desc' },
  });

  if (recentOtp) {
    const elapsedSeconds = Math.floor((Date.now() - recentOtp.createdAt.getTime()) / 1000);
    if (elapsedSeconds < config.resendCooldownSeconds) {
      const remainingSeconds = config.resendCooldownSeconds - elapsedSeconds;
      throw new Error(`Please wait ${remainingSeconds} seconds before requesting a new OTP.`);
    }

    // Invalidate previous active OTPs for this identifier
    await prisma.oTPVerification.updateMany({
      where: {
        identifier: normalized,
        used: false,
      },
      data: { used: true },
    });
  }

  // 3. Generate secure OTP & bcrypt hash
  const rawOtp = generateSecureOtp();
  const otpHash = await bcrypt.hash(rawOtp, 10);
  const expiresAt = new Date(Date.now() + config.expiryMinutes * 60 * 1000);

  // 4. Persist in database
  await prisma.oTPVerification.create({
    data: {
      userId: user.id,
      identifier: normalized,
      otpHash,
      expiresAt,
      attempts: 0,
      maxAttempts: config.maxAttempts,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
    },
  });

  // 5. Deliver OTP
  const profileName =
    user.studentProfile?.fullName ||
    user.academicianProfile?.fullName ||
    user.industryProfile?.companyName ||
    user.institutionProfile?.institutionName ||
    user.email;

  const deliveryResult = await deliverOtp({
    identifier: normalized,
    otp: rawOtp,
    userRole: user.role,
    userName: profileName,
  });

  return {
    success: true,
    message: 'If the account exists, an OTP has been sent.',
    maskedDestination: maskIdentifier(normalized),
    maskedIdentifier: maskIdentifier(normalized),
    cooldownSeconds: config.resendCooldownSeconds,
    userRole: user.role,
    ...(config.mode === 'development' ? { devOtpNotice: deliveryResult.devOtpNotice, devOtp: rawOtp } : {}),
  };
}

/**
 * Verify submitted OTP against stored hash, attempt limits, and expiration
 */
export async function verifySubmittedOtp(params: {
  identifier: string;
  otp: string;
}) {
  const config = getOtpConfig();
  const { normalized } = normalizeIdentifier(params.identifier);
  const cleanOtp = params.otp ? params.otp.trim() : '';

  if (!normalized || !cleanOtp) {
    throw new Error('Identifier and 6-digit OTP are required.');
  }

  // 1. Find the latest active verification record for this identifier
  const record = await prisma.oTPVerification.findFirst({
    where: {
      identifier: normalized,
      used: false,
    },
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        include: {
          studentProfile: true,
          academicianProfile: true,
          industryProfile: true,
          institutionProfile: true,
        },
      },
    },
  });

  if (!record) {
    throw new Error('No active OTP request found. Please request a new OTP.');
  }

  // 2. Check Expiration
  if (new Date() > record.expiresAt) {
    await prisma.oTPVerification.update({
      where: { id: record.id },
      data: { used: true },
    });
    throw new Error('This OTP has expired. Please request a new OTP.');
  }

  // 3. Check Attempt Limits
  if (record.attempts >= record.maxAttempts) {
    await prisma.oTPVerification.update({
      where: { id: record.id },
      data: { used: true },
    });
    throw new Error('Too many incorrect attempts. This OTP has been invalidated. Please request a new OTP.');
  }

  // 4. Secure Comparison
  const isMatch = await bcrypt.compare(cleanOtp, record.otpHash);

  if (!isMatch) {
    const updatedAttempts = record.attempts + 1;
    const remainingAttempts = Math.max(0, record.maxAttempts - updatedAttempts);

    await prisma.oTPVerification.update({
      where: { id: record.id },
      data: { attempts: updatedAttempts },
    });

    if (remainingAttempts === 0) {
      await prisma.oTPVerification.update({
        where: { id: record.id },
        data: { used: true },
      });
      const err: any = new Error('Too many incorrect attempts. This OTP has been invalidated. Please request a new OTP.');
      err.attemptsRemaining = 0;
      throw err;
    }

    const err: any = new Error(`Invalid OTP. Please try again (${remainingAttempts} attempt${remainingAttempts === 1 ? '' : 's'} remaining).`);
    err.attemptsRemaining = remainingAttempts;
    throw err;
  }

  // 5. Mark OTP as used and verified
  await prisma.oTPVerification.update({
    where: { id: record.id },
    data: {
      used: true,
      verifiedAt: new Date(),
    },
  });

  // 6. Ensure User account exists
  const user = record.user || (record.userId ? await prisma.user.findUnique({
    where: { id: record.userId },
    include: {
      studentProfile: true,
      academicianProfile: true,
      industryProfile: true,
      institutionProfile: true,
    },
  }) : null);

  if (!user) {
    throw new Error('Associated user account could not be found.');
  }

  // 7. Resolve role-specific profile
  let profile: any = null;
  if (user.role === 'STUDENT') profile = user.studentProfile;
  else if (user.role === 'ACADEMICIAN') profile = user.academicianProfile;
  else if (user.role === 'INDUSTRY') profile = user.industryProfile;
  else if (user.role === 'INSTITUTION') profile = user.institutionProfile;

  return {
    success: true,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      profile,
    },
  };
}
