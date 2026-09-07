import { Request, Response } from 'express';
import prisma from '../config/db';
import { AuthRequest } from '../middleware/authMiddleware';
import {
  calculateOpportunityMatch,
  calculateLearningProgramMatch,
  getPlatformWeights,
  MatchingWeights,
} from '../services/matchingEngine';

// Get Current Configured Platform Weights
export const getWeights = async (_req: Request, res: Response): Promise<void> => {
  try {
    const weights = await getPlatformWeights();
    res.json(weights);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch matching weights.' });
  }
};

// Update Configurable Platform Weights (Institution / Academician)
export const updateWeights = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { skillWeight, assessmentWeight, cgpaWeight, academicWeight } = req.body;

    const sW = parseFloat(skillWeight);
    const aW = parseFloat(assessmentWeight);
    const cW = parseFloat(cgpaWeight);
    const acW = parseFloat(academicWeight);

    if (isNaN(sW) || isNaN(aW) || isNaN(cW) || isNaN(acW)) {
      res.status(400).json({ message: 'All four weights must be valid numbers.' });
      return;
    }

    const total = sW + aW + cW + acW;
    if (Math.abs(total - 1.0) > 0.05) {
      res.status(400).json({ message: `Weights must sum to 1.0 (current sum: ${total.toFixed(2)}).` });
      return;
    }

    const value = JSON.stringify({
      skillWeight: sW,
      assessmentWeight: aW,
      cgpaWeight: cW,
      academicWeight: acW,
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

    res.json({
      message: 'Matching weights updated successfully.',
      weights: JSON.parse(setting.value),
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to update matching weights.' });
  }
};

// Match Opportunity (Internship or Job)
export const matchOpportunity = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const opportunityId = req.params.id as string;
    let studentId = req.query.studentId as string;

    if (!studentId) {
      if (req.user?.role !== 'STUDENT') {
        res.status(400).json({ message: 'studentId query param is required for non-student roles.' });
        return;
      }
      const student = await prisma.studentProfile.findUnique({
        where: { userId: req.user.id },
      });
      if (!student) {
        res.status(404).json({ message: 'Student profile not found.' });
        return;
      }
      studentId = student.id;
    }

    const result = await calculateOpportunityMatch(studentId, opportunityId);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to calculate opportunity match.' });
  }
};

// Match Learning Program
export const matchLearningProgram = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const programId = req.params.id as string;
    let studentId = req.query.studentId as string;

    if (!studentId) {
      if (req.user?.role !== 'STUDENT') {
        res.status(400).json({ message: 'studentId query param is required for non-student roles.' });
        return;
      }
      const student = await prisma.studentProfile.findUnique({
        where: { userId: req.user.id },
      });
      if (!student) {
        res.status(404).json({ message: 'Student profile not found.' });
        return;
      }
      studentId = student.id;
    }

    const result = await calculateLearningProgramMatch(studentId, programId);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to calculate learning program match.' });
  }
};

// Unified Custom Simulation / Calculation Endpoint
export const calculateCustomMatch = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { studentId, entityType, entityId, customWeights } = req.body;

    let targetStudentId = studentId;
    if (!targetStudentId) {
      if (req.user?.role === 'STUDENT') {
        const student = await prisma.studentProfile.findUnique({
          where: { userId: req.user.id },
        });
        targetStudentId = student?.id;
      }
    }

    if (!targetStudentId || !entityType || !entityId) {
      res.status(400).json({ message: 'studentId, entityType, and entityId are required.' });
      return;
    }

    if (entityType === 'OPPORTUNITY' || entityType === 'INTERNSHIP' || entityType === 'JOB') {
      const result = await calculateOpportunityMatch(targetStudentId, entityId, customWeights);
      res.json(result);
    } else if (entityType === 'LEARNING_PROGRAM') {
      const result = await calculateLearningProgramMatch(targetStudentId, entityId, customWeights);
      res.json(result);
    } else {
      res.status(400).json({ message: `Unsupported entityType: ${entityType}. Use 'OPPORTUNITY' or 'LEARNING_PROGRAM'.` });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to execute custom match calculation.' });
  }
};
