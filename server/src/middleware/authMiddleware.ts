import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../config/db';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    profileId?: string;
  };
}

const JWT_SECRET = process.env.JWT_SECRET || 'skillbridge_secret_fallback_key';

export const authenticateUser = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ message: 'Authentication required. No token provided.' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string; role: string };

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: {
        studentProfile: { select: { id: true } },
        academicianProfile: { select: { id: true } },
        industryProfile: { select: { id: true } },
        institutionProfile: { select: { id: true } },
      },
    });

    if (!user) {
      res.status(401).json({ message: 'User account no longer exists.' });
      return;
    }

    let profileId: string | undefined;
    if (user.role === 'STUDENT') profileId = user.studentProfile?.id;
    else if (user.role === 'ACADEMICIAN') profileId = user.academicianProfile?.id;
    else if (user.role === 'INDUSTRY') profileId = user.industryProfile?.id;
    else if (user.role === 'INSTITUTION') profileId = user.institutionProfile?.id;

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      profileId,
    };

    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token.' });
  }
};

export const optionalAuthenticateUser = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string; role: string };

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: {
        studentProfile: { select: { id: true } },
        academicianProfile: { select: { id: true } },
        industryProfile: { select: { id: true } },
        institutionProfile: { select: { id: true } },
      },
    });

    if (user) {
      let profileId: string | undefined;
      if (user.role === 'STUDENT') profileId = user.studentProfile?.id;
      else if (user.role === 'ACADEMICIAN') profileId = user.academicianProfile?.id;
      else if (user.role === 'INDUSTRY') profileId = user.industryProfile?.id;
      else if (user.role === 'INSTITUTION') profileId = user.institutionProfile?.id;

      req.user = {
        id: user.id,
        email: user.email,
        role: user.role,
        profileId,
      };
    }
    next();
  } catch (error) {
    next();
  }
};

export const authorizeRoles = (...allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required.' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        message: `Access denied. Role '${req.user.role}' is not authorized to access this resource.`,
      });
      return;
    }

    next();
  };
};
