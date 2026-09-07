import { Response } from 'express';
import prisma from '../config/db';
import { AuthRequest } from '../middleware/authMiddleware';

// Get Industry Profile
export const getIndustryProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const profile = await prisma.industryProfile.findUnique({
      where: { userId: req.user!.id },
      include: {
        user: {
          select: { id: true, email: true, role: true, createdAt: true },
        },
        opportunities: {
          include: {
            skills: { include: { skill: true } },
            _count: { select: { applications: true } },
          },
        },
      },
    });

    if (!profile) {
      res.status(404).json({ message: 'Industry profile not found.' });
      return;
    }

    res.json(profile);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch industry profile.' });
  }
};

// Update Industry Profile
export const updateIndustryProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
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
      logoUrl,
    } = req.body;

    const existing = await prisma.industryProfile.findUnique({
      where: { userId: req.user!.id },
    });

    if (!existing) {
      res.status(404).json({ message: 'Industry profile not found.' });
      return;
    }

    const updated = await prisma.$transaction(async (tx) => {
      const profile = await tx.industryProfile.update({
        where: { userId: req.user!.id },
        data: {
          companyName: companyName !== undefined ? companyName : undefined,
          officialEmail: officialEmail !== undefined ? officialEmail : undefined,
          industrySector: industrySector !== undefined ? industrySector : undefined,
          companySize: companySize !== undefined ? companySize : undefined,
          website: website !== undefined ? website : undefined,
          location: location !== undefined ? location : undefined,
          description: description !== undefined ? description : undefined,
          contactPerson: contactPerson !== undefined ? contactPerson : undefined,
          contactNumber: contactNumber !== undefined ? contactNumber : undefined,
          logoUrl: logoUrl !== undefined ? logoUrl : undefined,
        },
      });

      await tx.auditLog.create({
        data: {
          userId: req.user!.id,
          action: 'INDUSTRY_PROFILE_UPDATED',
          entityType: 'IndustryProfile',
          entityId: profile.id,
          details: JSON.stringify({ companyName: profile.companyName }),
        },
      });

      return profile;
    });

    res.json({ message: 'Industry profile updated successfully.', profile: updated });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to update industry profile.' });
  }
};

// Get Recommended Candidates for Industry Active Postings
export const getIndustryRecommendedCandidatesController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const industry = await prisma.industryProfile.findUnique({
      where: { userId: req.user!.id },
    });

    if (!industry) {
      res.status(404).json({ message: 'Industry profile not found.' });
      return;
    }

    const { getIndustryRecommendedCandidates } = await import('../services/personalizationService');
    const result = await getIndustryRecommendedCandidates(industry.id, req.query.opportunityId as string);

    res.json(result);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch recommended candidates.' });
  }
};

// Get General Industry Recommendations
export const getIndustryRecommendationsController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const industry = await prisma.industryProfile.findUnique({
      where: { userId: req.user!.id },
    });

    if (!industry) {
      res.status(404).json({ message: 'Industry profile not found.' });
      return;
    }

    const { getIndustryRecommendedCandidates } = await import('../services/personalizationService');
    const candidates = await getIndustryRecommendedCandidates(industry.id);

    res.json({
      industry,
      recommendedCandidates: candidates.candidates,
      domain: candidates.industryDomain,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch industry recommendations.' });
  }
};
