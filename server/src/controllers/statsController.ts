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
