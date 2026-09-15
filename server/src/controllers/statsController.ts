import { Request, Response } from 'express';
import prisma from '../config/db';
import { getPublicPlatformStats } from '../services/analyticsService';
import { getPlatformWeights } from '../services/matchingEngine';
import { AuthRequest } from '../middleware/authMiddleware';

export const getPublicStats = async (_req: Request, res: Response): Promise<void> => {
  try {
    const stats = await getPublicPlatformStats();
    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch platform statistics.' });
  }
};

export const getWeights = async (_req: Request, res: Response): Promise<void> => {
  try {
    const weights = await getPlatformWeights();
    res.json(weights);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch matching weights.' });
  }
};

export const updateWeights = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { skillWeight, assessmentWeight, cgpaWeight, academicWeight } = req.body;

    const total =
      parseFloat(skillWeight) +
      parseFloat(assessmentWeight) +
      parseFloat(cgpaWeight) +
      parseFloat(academicWeight);

    if (Math.abs(total - 1.0) > 0.05) {
      res.status(400).json({ message: 'Weights must sum to approximately 1.0 (100%).' });
      return;
    }

    const value = JSON.stringify({
      skillWeight: parseFloat(skillWeight),
      assessmentWeight: parseFloat(assessmentWeight),
      cgpaWeight: parseFloat(cgpaWeight),
      academicWeight: parseFloat(academicWeight),
    });

    const setting = await prisma.platformSetting.upsert({
      where: { key: 'MATCHING_WEIGHTS' },
      update: { value },
      create: {
        key: 'MATCHING_WEIGHTS',
        value,
        description: 'Configurable weights for the SkillBridge matching algorithm',
      },
    });

    res.json({ message: 'Matching weights updated successfully.', setting });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to update weights.' });
  }
};

export const inspectStudents = async (_req: Request, res: Response): Promise<void> => {
  try {
    const students = await prisma.user.findMany({
      where: { role: 'STUDENT' },
      select: {
        id: true,
        email: true,
        createdAt: true,
        studentProfile: {
          select: {
            id: true,
            fullName: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
    res.json({ count: students.length, students });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to inspect students.' });
  }
};

export const deleteTargetedTestStudents = async (_req: Request, res: Response): Promise<void> => {
  try {
    const targetUserIds = [
      '244cf80a-cd78-44e7-9268-933e7974b51b',
      '925c9c9a-3d2a-43d7-a35c-87d4cf62d21b',
      'bfc26f9e-1212-4655-8b8a-5777c73c4625',
      '9e7167dc-09e5-4710-b817-844a73b12b6f',
      '4f2e032e-c4ad-411d-a9d4-d271ca251fce',
    ];

    await prisma.$transaction(async (tx) => {
      // Find all profile IDs
      const profiles = await tx.studentProfile.findMany({
        where: { userId: { in: targetUserIds } },
        select: { id: true, userId: true },
      });
      const profileIds = profiles.map((p) => p.id);

      if (profileIds.length > 0) {
        await tx.studentSkillProfile.deleteMany({ where: { studentId: { in: profileIds } } });
        await tx.studentSubSkillScore.deleteMany({ where: { studentId: { in: profileIds } } });
        await tx.skillEvidence.deleteMany({ where: { studentId: { in: profileIds } } });
        await tx.skillProgressSnapshot.deleteMany({ where: { studentId: { in: profileIds } } });
        await tx.assessmentAttempt.deleteMany({ where: { studentId: { in: profileIds } } });
        await tx.application.deleteMany({ where: { studentId: { in: profileIds } } });
        await tx.learningEnrollment.deleteMany({ where: { studentId: { in: profileIds } } });
        await tx.mentorshipRequest.deleteMany({ where: { studentId: { in: profileIds } } });
        await tx.studentEducation.deleteMany({ where: { studentId: { in: profileIds } } });
        await tx.studentCertification.deleteMany({ where: { studentId: { in: profileIds } } });
        await tx.studentAcademicReport.deleteMany({ where: { studentId: { in: profileIds } } });
        await tx.studentProject.deleteMany({ where: { studentId: { in: profileIds } } });
        await tx.studentInternshipExperience.deleteMany({ where: { studentId: { in: profileIds } } });
        await tx.studentAchievement.deleteMany({ where: { studentId: { in: profileIds } } });
        await tx.studentTraining.deleteMany({ where: { studentId: { in: profileIds } } });
        await tx.collaborationApplication.deleteMany({ where: { studentId: { in: profileIds } } });
        await tx.courseEnrollment.deleteMany({ where: { studentId: { in: profileIds } } });
        await tx.courseCertificate.deleteMany({ where: { studentId: { in: profileIds } } });
        await tx.learningRoadmap.deleteMany({ where: { studentId: { in: profileIds } } });
        await tx.studentProfile.deleteMany({ where: { id: { in: profileIds } } });
      }

      await tx.notification.deleteMany({ where: { userId: { in: targetUserIds } } });
      await tx.auditLog.deleteMany({ where: { userId: { in: targetUserIds } } });
      await tx.oTPVerification.deleteMany({ where: { userId: { in: targetUserIds } } });

      await tx.user.deleteMany({
        where: {
          id: { in: targetUserIds },
          role: 'STUDENT',
        },
      });
    });

    res.json({
      success: true,
      message: `Successfully deleted exactly ${targetUserIds.length} target student accounts.`,
      deletedUserIds: targetUserIds,
    });
  } catch (error: any) {
    console.error('deleteTargetedTestStudents error:', error);
    res.status(500).json({ message: error.message || 'Failed to delete target students.' });
  }
};



