"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStudentSkillAssessmentsController = exports.getStudentRecommendedJobRolesController = exports.getStudentRecommendedIndustriesController = exports.getStudentSkillMappingController = exports.getStudentSkillProfileController = exports.getOpportunityMatchDetails = exports.getStudentRecommendedCollaborations = exports.getStudentRecommendedMentors = exports.getStudentSkillGaps = exports.getStudentSkillsToLearn = exports.updateStudentInterests = exports.getStudentInterests = exports.getStudentRecommendedJobs = exports.getStudentRecommendedInternships = exports.getStudentRecommendedCourses = exports.getStudentRecommendedSkills = exports.getStudentPersonalizedRecommendations = exports.getPublicPortfolio = exports.updateResume = exports.deleteTraining = exports.addTraining = exports.deleteAchievement = exports.addAchievement = exports.deleteStudentSkill = exports.updateStudentSkill = exports.addStudentSkill = exports.deleteEducation = exports.addEducation = exports.deleteInternshipExperience = exports.addInternshipExperience = exports.deleteCertification = exports.updateCertification = exports.addCertification = exports.getStudentCertifications = exports.deleteProject = exports.addProject = exports.getStudentPortfolio = exports.withdrawApplication = exports.getStudentApplications = exports.getStudentSkillGapAnalysis = exports.getStudentSkills = exports.updateStudentProfile = exports.getStudentProfile = exports.getStudentDashboard = void 0;
const db_1 = __importDefault(require("../config/db"));
const matchingEngine_1 = require("../services/matchingEngine");
const personalizationService_1 = require("../services/personalizationService");
// Calculate student profile completion %
const calculateProfileCompletion = (profile) => {
    if (!profile)
        return 0;
    const fields = [
        profile.fullName,
        profile.institutionName,
        profile.department,
        profile.degree,
        profile.phone,
        profile.dob,
        profile.gender,
        profile.cgpa,
        profile.currentYear,
        profile.graduationYear,
        profile.location,
        profile.bio,
        profile.resumeUrl,
        profile.careerInterests,
        profile.preferredRoles,
    ];
    const filled = fields.filter((f) => f !== null && f !== undefined && f !== '').length;
    return Math.round((filled / fields.length) * 100);
};
// Student Dashboard Summary
const getStudentDashboard = async (req, res) => {
    try {
        const student = await db_1.default.studentProfile.findUnique({
            where: { userId: req.user.id },
            include: {
                skillProfiles: {
                    include: {
                        skill: {
                            include: { category: true },
                        },
                    },
                },
                assessmentAttempts: {
                    orderBy: { startedAt: 'desc' },
                    take: 5,
                    include: { assessment: true },
                },
                applications: {
                    orderBy: { appliedAt: 'desc' },
                    include: {
                        opportunity: {
                            include: { industry: true, skills: { include: { skill: true } }, assessment: true },
                        },
                    },
                },
                educations: true,
                certificates: {
                    orderBy: { createdAt: 'desc' },
                },
                projects: true,
                internships: true,
                achievements: true,
            },
        });
        if (!student) {
            res.status(404).json({ message: 'Student profile not found.' });
            return;
        }
        const profileCompletion = calculateProfileCompletion(student);
        // Calculate average skill score
        const avgSkillScore = student.skillProfiles.length > 0
            ? Math.round(student.skillProfiles.reduce((sum, s) => sum + s.scorePercentage, 0) /
                student.skillProfiles.length)
            : 0;
        // Career interests list
        const careerInterests = student.careerInterests
            ? student.careerInterests.split(',').map((s) => s.trim()).filter(Boolean)
            : [];
        // Strong skills vs Skills to improve
        const strongSkills = student.skillProfiles
            .filter((s) => s.proficiencyLevel === 'ADVANCED' || s.proficiencyLevel === 'EXPERT' || s.scorePercentage >= 70)
            .map((s) => ({
            id: s.id,
            skillId: s.skillId,
            name: s.skill.name,
            category: s.skill.category?.name || 'General',
            proficiencyLevel: s.proficiencyLevel,
            scorePercentage: s.scorePercentage,
            verificationStatus: s.verificationStatus,
        }));
        const skillsToImprove = student.skillProfiles
            .filter((s) => s.proficiencyLevel === 'BEGINNER' || (s.scorePercentage > 0 && s.scorePercentage < 60))
            .map((s) => ({
            id: s.id,
            skillId: s.skillId,
            name: s.skill.name,
            category: s.skill.category?.name || 'General',
            proficiencyLevel: s.proficiencyLevel,
            scorePercentage: s.scorePercentage,
            verificationStatus: s.verificationStatus,
        }));
        // Domain-scoped personalized recommendations & meaningful skill gaps
        const personalization = await (0, personalizationService_1.getStudentRecommendations)(student.id);
        const [collabApplications, activeCollaborationsCount] = await Promise.all([
            db_1.default.collaborationApplication.findMany({
                where: { studentId: student.id },
                include: { collaboration: true },
                orderBy: { appliedAt: 'desc' },
                take: 5,
            }),
            db_1.default.collaborationApplication.count({
                where: { studentId: student.id },
            }),
        ]);
        res.json({
            student: {
                id: student.id,
                fullName: student.fullName,
                department: student.department,
                institutionName: student.institutionName,
                degree: student.degree,
                currentYear: student.currentYear,
                graduationYear: student.graduationYear,
                cgpa: student.cgpa,
                careerInterests: student.careerInterests,
                preferredRoles: student.preferredRoles,
            },
            domain: personalization.domain,
            domainDisplayName: personalization.domainDisplayName,
            profileCompletion,
            avgSkillScore,
            skills: student.skillProfiles.map((s) => ({
                id: s.id,
                skillId: s.skillId,
                name: s.skill.name,
                category: s.skill.category?.name || 'General',
                proficiencyLevel: s.proficiencyLevel,
                scorePercentage: s.scorePercentage,
                verificationStatus: s.verificationStatus,
            })),
            careerInterests,
            certifications: student.certificates,
            skillAnalysis: {
                strongSkills,
                skillsToImprove,
                skillGaps: personalization.skillGaps.map((g) => g.skillName),
                skillGapItems: personalization.skillGaps,
                recommendedSkills: personalization.recommendedSkills,
            },
            primaryCareerInterest: personalization.primaryCareerInterest,
            secondaryCareerInterests: personalization.secondaryCareerInterests,
            skillsToLearnNext: personalization.skillsToLearnNext,
            recommendedSkills: personalization.recommendedSkills,
            recommendedCourses: personalization.recommendedCourses,
            recommendedInternships: personalization.recommendedInternships,
            recommendedJobs: personalization.recommendedJobs,
            recommendedMentors: personalization.recommendedMentors,
            recommendedCollaborations: personalization.recommendedCollaborations,
            recommendedOpportunities: [
                ...personalization.recommendedInternships.map((i) => ({
                    ...i.opportunity,
                    matchResult: i.matchResult,
                    isEligible: i.isEligible,
                    ineligibleReasons: i.ineligibleReasons,
                    goodMatchReasons: i.goodMatchReasons,
                    matchedSkills: i.matchedSkills,
                    unmatchedSkills: i.unmatchedSkills,
                    hasApplied: i.hasApplied,
                    applicationStatus: i.applicationStatus,
                    recommendationReason: i.recommendationReason,
                })),
                ...personalization.recommendedJobs.map((j) => ({
                    ...j.opportunity,
                    matchResult: j.matchResult,
                    isEligible: j.isEligible,
                    ineligibleReasons: j.ineligibleReasons,
                    goodMatchReasons: j.goodMatchReasons,
                    matchedSkills: j.matchedSkills,
                    unmatchedSkills: j.unmatchedSkills,
                    hasApplied: j.hasApplied,
                    applicationStatus: j.applicationStatus,
                    recommendationReason: j.recommendationReason,
                })),
            ].slice(0, 8),
            applications: student.applications,
            stats: {
                skillsCount: student.skillProfiles.length,
                assessmentsCount: student.assessmentAttempts.length,
                applicationsCount: student.applications.length,
                collaborationsCount: activeCollaborationsCount,
                certificationsCount: student.certificates.length,
            },
            recentCollaborations: collabApplications,
            recentAssessments: student.assessmentAttempts,
            recentApplications: student.applications,
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Failed to fetch student dashboard.' });
    }
};
exports.getStudentDashboard = getStudentDashboard;
// Get Full Profile
const getStudentProfile = async (req, res) => {
    try {
        const student = await db_1.default.studentProfile.findUnique({
            where: { userId: req.user.id },
            include: {
                skillProfiles: { include: { skill: true } },
            },
        });
        if (!student) {
            res.status(404).json({ message: 'Student profile not found.' });
            return;
        }
        res.json(student);
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Failed to fetch student profile.' });
    }
};
exports.getStudentProfile = getStudentProfile;
// Update Profile
const updateStudentProfile = async (req, res) => {
    try {
        const { fullName, phone, dob, gender, institutionName, department, degree, currentYear, cgpa, graduationYear, location, bio, careerInterests, preferredRoles, preferredLocations, resumeUrl, } = req.body;
        const updated = await db_1.default.studentProfile.update({
            where: { userId: req.user.id },
            data: {
                fullName,
                phone,
                dob,
                gender,
                institutionName,
                department,
                degree,
                currentYear: currentYear ? parseInt(currentYear, 10) : undefined,
                cgpa: cgpa ? parseFloat(cgpa) : undefined,
                graduationYear: graduationYear ? parseInt(graduationYear, 10) : undefined,
                location,
                bio,
                careerInterests,
                preferredRoles,
                preferredLocations,
                resumeUrl,
            },
        });
        res.json({ message: 'Profile updated successfully.', profile: updated });
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Failed to update profile.' });
    }
};
exports.updateStudentProfile = updateStudentProfile;
// Get Student Skills
const getStudentSkills = async (req, res) => {
    try {
        const student = await db_1.default.studentProfile.findUnique({
            where: { userId: req.user.id },
            include: {
                skillProfiles: {
                    include: { skill: { include: { category: true } } },
                },
            },
        });
        if (!student) {
            res.status(404).json({ message: 'Student profile not found.' });
            return;
        }
        res.json(student.skillProfiles);
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Failed to fetch skills.' });
    }
};
exports.getStudentSkills = getStudentSkills;
// Get Student Skill Gap Analysis
const getStudentSkillGapAnalysis = async (req, res) => {
    try {
        const student = await db_1.default.studentProfile.findUnique({
            where: { userId: req.user.id },
            include: {
                skillProfiles: {
                    include: { skill: { include: { category: true } } },
                },
                assessmentAttempts: {
                    orderBy: { startedAt: 'desc' },
                    include: { assessment: true },
                },
            },
        });
        if (!student) {
            res.status(404).json({ message: 'Student profile not found.' });
            return;
        }
        const totalSkills = student.skillProfiles.length;
        const overallSkillScore = totalSkills > 0
            ? Math.round(student.skillProfiles.reduce((sum, s) => sum + s.scorePercentage, 0) / totalSkills)
            : 0;
        // Strengths: skills with score >= 70%
        const strengths = student.skillProfiles
            .filter((s) => s.scorePercentage >= 70)
            .map((s) => ({
            id: s.id,
            skillId: s.skillId,
            name: s.skill.name,
            category: s.skill.category?.name || 'General',
            scorePercentage: s.scorePercentage,
            proficiencyLevel: s.proficiencyLevel,
            verified: s.verified,
            lastAssessedAt: s.lastAssessedAt,
        }));
        // Weaknesses: skills with score < 60%
        const weaknesses = student.skillProfiles
            .filter((s) => s.scorePercentage < 60)
            .map((s) => ({
            id: s.id,
            skillId: s.skillId,
            name: s.skill.name,
            category: s.skill.category?.name || 'General',
            scorePercentage: s.scorePercentage,
            proficiencyLevel: s.proficiencyLevel,
            verified: s.verified,
            lastAssessedAt: s.lastAssessedAt,
        }));
        // Find industry demand to detect missing market skills
        const existingSkillIds = new Set(student.skillProfiles.map((s) => s.skillId));
        const publishedOpportunities = await db_1.default.opportunity.findMany({
            where: { isPublished: true },
            include: {
                skills: { include: { skill: { include: { category: true } } } },
            },
        });
        const marketDemandMap = new Map();
        for (const opp of publishedOpportunities) {
            for (const os of opp.skills) {
                if (!existingSkillIds.has(os.skillId)) {
                    if (!marketDemandMap.has(os.skillId)) {
                        marketDemandMap.set(os.skillId, { skill: os.skill, count: 0, isRequired: false });
                    }
                    const entry = marketDemandMap.get(os.skillId);
                    entry.count += 1;
                    if (os.isRequired)
                        entry.isRequired = true;
                }
            }
        }
        // Build skill gaps:
        // 1. Performance gaps: assessed skills with score < 60%
        // 2. Market demand gaps: skills demanded by opportunities that student hasn't assessed
        const skillGaps = [];
        // Add performance gaps
        for (const weak of weaknesses) {
            skillGaps.push({
                skillId: weak.skillId,
                skillName: weak.name,
                category: weak.category,
                gapType: 'PERFORMANCE_GAP',
                severity: weak.scorePercentage < 40 ? 'HIGH' : 'MEDIUM',
                currentScore: weak.scorePercentage,
                targetScore: 70,
                explanation: `Assessed score of ${weak.scorePercentage}% is below the proficiency benchmark (60%).`,
                actionRecommendation: `Retake assessment or complete specialized modules to elevate proficiency.`,
            });
        }
        // Add market demand gaps
        for (const [sId, demand] of marketDemandMap.entries()) {
            skillGaps.push({
                skillId: sId,
                skillName: demand.skill.name,
                category: demand.skill.category?.name || 'Industry Demand',
                gapType: 'MARKET_DEMAND_GAP',
                severity: demand.isRequired ? 'HIGH' : 'MEDIUM',
                currentScore: 0,
                targetScore: 70,
                explanation: `Required or preferred in ${demand.count} active industry opportunity posting(s) but not yet validated in your profile.`,
                actionRecommendation: `Take the ${demand.skill.name} assessment or enroll in an affiliated learning program.`,
            });
        }
        // Collect all gap skill IDs (performance deficits + market opportunity demands)
        const allGapSkillIds = new Set();
        weaknesses.forEach((w) => allGapSkillIds.add(w.skillId));
        marketDemandMap.forEach((_val, sId) => allGapSkillIds.add(sId));
        // Query actual published Learning Programs from PostgreSQL that teach any of these gap skills
        const matchingPrograms = await db_1.default.learningProgram.findMany({
            where: {
                isPublished: true,
                skills: {
                    some: {
                        skillId: { in: Array.from(allGapSkillIds) },
                    },
                },
            },
            include: {
                skills: {
                    include: {
                        skill: {
                            include: { category: true },
                        },
                    },
                },
                _count: { select: { enrollments: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
        // Attach targeted learning programs to each specific skill gap
        const enrichedSkillGaps = skillGaps.map((gap) => {
            const targetedPrograms = matchingPrograms.filter((p) => p.skills.some((s) => s.skillId === gap.skillId));
            return {
                ...gap,
                recommendedPrograms: targetedPrograms.map((p) => ({
                    id: p.id,
                    title: p.title,
                    type: p.type,
                    mode: p.mode,
                    duration: p.duration,
                    price: p.price,
                    skills: p.skills.map((s) => s.skill.name),
                })),
            };
        });
        // Rank overall recommended learning programs by number of gaps addressed
        const rankedRecommendedPrograms = matchingPrograms
            .map((p) => {
            const addressedGaps = p.skills
                .filter((s) => allGapSkillIds.has(s.skillId))
                .map((s) => s.skill.name);
            return {
                id: p.id,
                title: p.title,
                type: p.type,
                description: p.description,
                duration: p.duration,
                mode: p.mode,
                price: p.price,
                startDate: p.startDate,
                addressedGaps,
                skills: p.skills.map((s) => ({
                    id: s.skillId,
                    name: s.skill.name,
                    category: s.skill.category?.name,
                })),
                enrollmentsCount: p._count.enrollments,
            };
        })
            .sort((a, b) => b.addressedGaps.length - a.addressedGaps.length);
        res.json({
            overallSkillScore,
            skillsCount: totalSkills,
            strengths,
            weaknesses,
            skillGaps: enrichedSkillGaps,
            recommendedPrograms: rankedRecommendedPrograms,
            skillProfiles: student.skillProfiles,
            recentAttempts: student.assessmentAttempts.slice(0, 5),
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Failed to fetch skill gap analysis.' });
    }
};
exports.getStudentSkillGapAnalysis = getStudentSkillGapAnalysis;
// Get Student Applications
const getStudentApplications = async (req, res) => {
    try {
        const student = await db_1.default.studentProfile.findUnique({
            where: { userId: req.user.id },
        });
        if (!student) {
            res.status(404).json({ message: 'Student not found.' });
            return;
        }
        const applications = await db_1.default.application.findMany({
            where: { studentId: student.id },
            include: {
                opportunity: {
                    include: {
                        industry: true,
                        skills: { include: { skill: true } },
                    },
                },
                history: { orderBy: { createdAt: 'desc' } },
                interviews: { orderBy: { scheduledAt: 'asc' } },
            },
            orderBy: { appliedAt: 'desc' },
        });
        res.json(applications);
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Failed to fetch applications.' });
    }
};
exports.getStudentApplications = getStudentApplications;
// Withdraw Application
const withdrawApplication = async (req, res) => {
    try {
        const id = req.params.id;
        const student = await db_1.default.studentProfile.findUnique({
            where: { userId: req.user.id },
        });
        const application = await db_1.default.application.findUnique({
            where: { id },
        });
        if (!application || application.studentId !== student?.id) {
            res.status(404).json({ message: 'Application not found or unauthorized.' });
            return;
        }
        if (['SELECTED', 'REJECTED', 'WITHDRAWN'].includes(application.status)) {
            res.status(400).json({ message: `Cannot withdraw application in '${application.status}' state.` });
            return;
        }
        const updated = await db_1.default.$transaction(async (tx) => {
            const app = await tx.application.update({
                where: { id },
                data: { status: 'WITHDRAWN' },
            });
            await tx.applicationStatusHistory.create({
                data: {
                    applicationId: id,
                    status: 'WITHDRAWN',
                    notes: 'Withdrawn by student.',
                    changedById: req.user.id,
                },
            });
            return app;
        });
        res.json({ message: 'Application successfully withdrawn.', application: updated });
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Failed to withdraw application.' });
    }
};
exports.withdrawApplication = withdrawApplication;
// Full Digital Portfolio
const getStudentPortfolio = async (req, res) => {
    try {
        const student = await db_1.default.studentProfile.findUnique({
            where: { userId: req.user.id },
            include: {
                educations: { orderBy: { startYear: 'desc' } },
                certificates: { orderBy: { createdAt: 'desc' } },
                projects: { orderBy: { createdAt: 'desc' } },
                internships: { orderBy: { createdAt: 'desc' } },
                achievements: { orderBy: { createdAt: 'desc' } },
                trainings: { orderBy: { createdAt: 'desc' } },
                skillProfiles: {
                    include: { skill: { include: { category: true } } },
                    orderBy: { createdAt: 'desc' },
                },
                assessmentAttempts: {
                    include: { assessment: true },
                    orderBy: { completedAt: 'desc' },
                },
                courseCertificates: {
                    include: { course: true },
                    orderBy: { issueDate: 'desc' },
                },
            },
        });
        if (!student) {
            res.status(404).json({ message: 'Student profile not found.' });
            return;
        }
        res.json(student);
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Failed to fetch portfolio.' });
    }
};
exports.getStudentPortfolio = getStudentPortfolio;
// Portfolio Item Mutators
const addProject = async (req, res) => {
    try {
        const student = await db_1.default.studentProfile.findUnique({ where: { userId: req.user.id } });
        if (!student) {
            res.status(404).json({ message: 'Student profile not found.' });
            return;
        }
        const { title, description, technologies, projectUrl, repoUrl } = req.body;
        if (!title || !description) {
            res.status(400).json({ message: 'Title and description are required.' });
            return;
        }
        const project = await db_1.default.studentProject.create({
            data: {
                studentId: student.id,
                title,
                description,
                technologies,
                projectUrl,
                repoUrl,
                verificationStatus: 'PENDING',
            },
        });
        res.status(201).json(project);
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Failed to add project.' });
    }
};
exports.addProject = addProject;
const deleteProject = async (req, res) => {
    try {
        const id = req.params.id;
        await db_1.default.studentProject.delete({ where: { id } });
        res.json({ message: 'Project removed.' });
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Failed to delete project.' });
    }
};
exports.deleteProject = deleteProject;
// Student Certifications Management
const getStudentCertifications = async (req, res) => {
    try {
        const student = await db_1.default.studentProfile.findUnique({ where: { userId: req.user.id } });
        if (!student) {
            res.status(404).json({ message: 'Student profile not found.' });
            return;
        }
        const certs = await db_1.default.studentCertification.findMany({
            where: { studentId: student.id },
            orderBy: { createdAt: 'desc' },
        });
        res.json(certs);
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Failed to fetch certifications.' });
    }
};
exports.getStudentCertifications = getStudentCertifications;
const addCertification = async (req, res) => {
    try {
        const student = await db_1.default.studentProfile.findUnique({ where: { userId: req.user.id } });
        if (!student) {
            res.status(404).json({ message: 'Student profile not found.' });
            return;
        }
        const { title, name, issuingOrganization, issueDate, expiryDate, credentialId, credentialUrl, certificateDocUrl, skillsCovered, } = req.body;
        const certTitle = title || name;
        if (!certTitle || !issuingOrganization) {
            res.status(400).json({ message: 'Certification title and issuing organization are required.' });
            return;
        }
        const cert = await db_1.default.studentCertification.create({
            data: {
                studentId: student.id,
                title: certTitle,
                issuingOrganization,
                issueDate: issueDate || null,
                expiryDate: expiryDate || null,
                credentialId: credentialId || null,
                credentialUrl: credentialUrl || null,
                certificateDocUrl: certificateDocUrl || null,
                skillsCovered: Array.isArray(skillsCovered) ? skillsCovered.join(', ') : skillsCovered || null,
                verificationStatus: 'PENDING',
            },
        });
        res.status(201).json(cert);
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Failed to add certification.' });
    }
};
exports.addCertification = addCertification;
const updateCertification = async (req, res) => {
    try {
        const id = req.params.id;
        const student = await db_1.default.studentProfile.findUnique({ where: { userId: req.user.id } });
        if (!student) {
            res.status(404).json({ message: 'Student profile not found.' });
            return;
        }
        const { title, name, issuingOrganization, issueDate, expiryDate, credentialId, credentialUrl, certificateDocUrl, skillsCovered, } = req.body;
        const updated = await db_1.default.studentCertification.update({
            where: { id },
            data: {
                title: title || name,
                issuingOrganization,
                issueDate: issueDate || null,
                expiryDate: expiryDate || null,
                credentialId: credentialId || null,
                credentialUrl: credentialUrl || null,
                certificateDocUrl: certificateDocUrl || null,
                skillsCovered: Array.isArray(skillsCovered) ? skillsCovered.join(', ') : skillsCovered || null,
                verificationStatus: 'PENDING',
                verifiedById: null,
                verifiedAt: null,
            },
        });
        res.json(updated);
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Failed to update certification.' });
    }
};
exports.updateCertification = updateCertification;
const deleteCertification = async (req, res) => {
    try {
        const id = req.params.id;
        const student = await db_1.default.studentProfile.findUnique({ where: { userId: req.user.id } });
        if (!student) {
            res.status(404).json({ message: 'Student profile not found.' });
            return;
        }
        await db_1.default.studentCertification.deleteMany({
            where: {
                id,
                studentId: student.id,
            },
        });
        res.json({ message: 'Certification removed.' });
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Failed to delete certification.' });
    }
};
exports.deleteCertification = deleteCertification;
const addInternshipExperience = async (req, res) => {
    try {
        const student = await db_1.default.studentProfile.findUnique({ where: { userId: req.user.id } });
        if (!student) {
            res.status(404).json({ message: 'Student profile not found.' });
            return;
        }
        const { companyName, role, startDate, endDate, description, certificateUrl } = req.body;
        if (!companyName || !role || !startDate) {
            res.status(400).json({ message: 'Company name, role, and start date are required.' });
            return;
        }
        const exp = await db_1.default.studentInternshipExperience.create({
            data: {
                studentId: student.id,
                companyName,
                role,
                startDate,
                endDate,
                description,
                certificateUrl,
                verificationStatus: 'PENDING',
            },
        });
        res.status(201).json(exp);
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Failed to add internship experience.' });
    }
};
exports.addInternshipExperience = addInternshipExperience;
const deleteInternshipExperience = async (req, res) => {
    try {
        const id = req.params.id;
        await db_1.default.studentInternshipExperience.delete({ where: { id } });
        res.json({ message: 'Internship experience removed.' });
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Failed to delete internship experience.' });
    }
};
exports.deleteInternshipExperience = deleteInternshipExperience;
const addEducation = async (req, res) => {
    try {
        const student = await db_1.default.studentProfile.findUnique({ where: { userId: req.user.id } });
        if (!student) {
            res.status(404).json({ message: 'Student profile not found.' });
            return;
        }
        const { institution, degree, fieldOfStudy, startYear, endYear, grade } = req.body;
        if (!institution || !degree || !fieldOfStudy || !startYear) {
            res.status(400).json({ message: 'Institution, degree, field of study, and start year are required.' });
            return;
        }
        const edu = await db_1.default.studentEducation.create({
            data: {
                studentId: student.id,
                institution,
                degree,
                fieldOfStudy,
                startYear: parseInt(startYear, 10),
                endYear: endYear ? parseInt(endYear, 10) : null,
                grade,
                verificationStatus: 'PENDING',
            },
        });
        res.status(201).json(edu);
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Failed to add education.' });
    }
};
exports.addEducation = addEducation;
const deleteEducation = async (req, res) => {
    try {
        const id = req.params.id;
        await db_1.default.studentEducation.delete({ where: { id } });
        res.json({ message: 'Education removed.' });
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Failed to delete education.' });
    }
};
exports.deleteEducation = deleteEducation;
// Student Skills Management
const addStudentSkill = async (req, res) => {
    try {
        const student = await db_1.default.studentProfile.findUnique({ where: { userId: req.user.id } });
        if (!student) {
            res.status(404).json({ message: 'Student profile not found.' });
            return;
        }
        const { skillId, skillName, categoryId, proficiencyLevel = 'BEGINNER' } = req.body;
        let targetSkillId = skillId;
        if (!targetSkillId && skillName) {
            let existingSkill = await db_1.default.skill.findUnique({ where: { name: skillName } });
            if (!existingSkill) {
                let catId = categoryId;
                if (!catId) {
                    let defaultCat = await db_1.default.skillCategory.findFirst();
                    if (!defaultCat) {
                        defaultCat = await db_1.default.skillCategory.create({
                            data: { name: 'General Skills', description: 'General skills category' },
                        });
                    }
                    catId = defaultCat.id;
                }
                existingSkill = await db_1.default.skill.create({
                    data: {
                        name: skillName,
                        categoryId: catId,
                    },
                });
            }
            targetSkillId = existingSkill.id;
        }
        if (!targetSkillId) {
            res.status(400).json({ message: 'Skill ID or skill name is required.' });
            return;
        }
        // Upsert or create StudentSkillProfile with verificationStatus: 'PENDING', verified: false
        const skillProfile = await db_1.default.studentSkillProfile.upsert({
            where: {
                studentId_skillId: {
                    studentId: student.id,
                    skillId: targetSkillId,
                },
            },
            create: {
                studentId: student.id,
                skillId: targetSkillId,
                proficiencyLevel,
                scorePercentage: 0,
                verificationStatus: 'PENDING',
                verified: false,
            },
            update: {
                proficiencyLevel,
                verificationStatus: 'PENDING',
                verified: false,
                remarks: null,
            },
            include: {
                skill: { include: { category: true } },
            },
        });
        res.status(201).json(skillProfile);
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Failed to add skill.' });
    }
};
exports.addStudentSkill = addStudentSkill;
const updateStudentSkill = async (req, res) => {
    try {
        const id = req.params.id;
        const { proficiencyLevel } = req.body;
        const student = await db_1.default.studentProfile.findUnique({ where: { userId: req.user.id } });
        if (!student) {
            res.status(404).json({ message: 'Student profile not found.' });
            return;
        }
        const updated = await db_1.default.studentSkillProfile.update({
            where: { id },
            data: {
                proficiencyLevel,
                verificationStatus: 'PENDING',
                verified: false,
            },
            include: {
                skill: { include: { category: true } },
            },
        });
        res.json(updated);
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Failed to update skill.' });
    }
};
exports.updateStudentSkill = updateStudentSkill;
const deleteStudentSkill = async (req, res) => {
    try {
        const id = req.params.id;
        const student = await db_1.default.studentProfile.findUnique({ where: { userId: req.user.id } });
        if (!student) {
            res.status(404).json({ message: 'Student profile not found.' });
            return;
        }
        await db_1.default.studentSkillProfile.deleteMany({
            where: {
                id,
                studentId: student.id,
            },
        });
        res.json({ message: 'Skill removed from profile.' });
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Failed to delete skill.' });
    }
};
exports.deleteStudentSkill = deleteStudentSkill;
// Achievements Management
const addAchievement = async (req, res) => {
    try {
        const student = await db_1.default.studentProfile.findUnique({ where: { userId: req.user.id } });
        if (!student) {
            res.status(404).json({ message: 'Student profile not found.' });
            return;
        }
        const { title, category, date, description } = req.body;
        if (!title) {
            res.status(400).json({ message: 'Title is required.' });
            return;
        }
        const achievement = await db_1.default.studentAchievement.create({
            data: {
                studentId: student.id,
                title,
                category,
                date,
                description,
                verificationStatus: 'PENDING',
            },
        });
        res.status(201).json(achievement);
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Failed to add achievement.' });
    }
};
exports.addAchievement = addAchievement;
const deleteAchievement = async (req, res) => {
    try {
        const id = req.params.id;
        const student = await db_1.default.studentProfile.findUnique({ where: { userId: req.user.id } });
        if (!student) {
            res.status(404).json({ message: 'Student profile not found.' });
            return;
        }
        await db_1.default.studentAchievement.deleteMany({
            where: { id, studentId: student.id },
        });
        res.json({ message: 'Achievement removed.' });
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Failed to delete achievement.' });
    }
};
exports.deleteAchievement = deleteAchievement;
// Training Management
const addTraining = async (req, res) => {
    try {
        const student = await db_1.default.studentProfile.findUnique({ where: { userId: req.user.id } });
        if (!student) {
            res.status(404).json({ message: 'Student profile not found.' });
            return;
        }
        const { title, provider, duration, certificateUrl } = req.body;
        if (!title || !provider) {
            res.status(400).json({ message: 'Title and provider are required.' });
            return;
        }
        const training = await db_1.default.studentTraining.create({
            data: {
                studentId: student.id,
                title,
                provider,
                duration,
                certificateUrl,
                verificationStatus: 'PENDING',
            },
        });
        res.status(201).json(training);
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Failed to add training.' });
    }
};
exports.addTraining = addTraining;
const deleteTraining = async (req, res) => {
    try {
        const id = req.params.id;
        const student = await db_1.default.studentProfile.findUnique({ where: { userId: req.user.id } });
        if (!student) {
            res.status(404).json({ message: 'Student profile not found.' });
            return;
        }
        await db_1.default.studentTraining.deleteMany({
            where: { id, studentId: student.id },
        });
        res.json({ message: 'Training removed.' });
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Failed to delete training.' });
    }
};
exports.deleteTraining = deleteTraining;
// Resume Management
const updateResume = async (req, res) => {
    try {
        const student = await db_1.default.studentProfile.findUnique({ where: { userId: req.user.id } });
        if (!student) {
            res.status(404).json({ message: 'Student profile not found.' });
            return;
        }
        const { resumeUrl } = req.body;
        const updated = await db_1.default.studentProfile.update({
            where: { id: student.id },
            data: {
                resumeUrl,
                resumeVerificationStatus: 'PENDING',
                resumeRemarks: null,
            },
        });
        res.json({ message: 'Resume updated successfully.', profile: updated });
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Failed to update resume.' });
    }
};
exports.updateResume = updateResume;
// Public Showcase Portfolio
const getPublicPortfolio = async (req, res) => {
    try {
        const { id } = req.params;
        const student = await db_1.default.studentProfile.findFirst({
            where: {
                OR: [{ id }, { userId: id }],
            },
            include: {
                user: { select: { email: true, role: true } },
                educations: { orderBy: { startYear: 'desc' } },
                certificates: { orderBy: { createdAt: 'desc' } },
                projects: { orderBy: { createdAt: 'desc' } },
                internships: { orderBy: { createdAt: 'desc' } },
                achievements: { orderBy: { createdAt: 'desc' } },
                trainings: { orderBy: { createdAt: 'desc' } },
                skillProfiles: {
                    include: { skill: { include: { category: true } } },
                    orderBy: { createdAt: 'desc' },
                },
                assessmentAttempts: {
                    include: { assessment: true },
                    orderBy: { completedAt: 'desc' },
                },
                courseCertificates: {
                    where: { verificationStatus: 'VERIFIED' },
                    include: { course: true },
                    orderBy: { issueDate: 'desc' },
                },
            },
        });
        if (!student) {
            res.status(404).json({ message: 'Student portfolio not found.' });
            return;
        }
        res.json(student);
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Failed to fetch public portfolio.' });
    }
};
exports.getPublicPortfolio = getPublicPortfolio;
// --------------------------------------------------------------------------
// PERSONALIZATION & RECOMMENDATIONS HANDLERS
// --------------------------------------------------------------------------
const getStudentPersonalizedRecommendations = async (req, res) => {
    try {
        const student = await db_1.default.studentProfile.findUnique({
            where: { userId: req.user.id },
        });
        if (!student) {
            res.status(404).json({ message: 'Student profile not found.' });
            return;
        }
        const payload = await (0, personalizationService_1.getStudentRecommendations)(student.id);
        res.json(payload);
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Failed to fetch recommendations.' });
    }
};
exports.getStudentPersonalizedRecommendations = getStudentPersonalizedRecommendations;
const getStudentRecommendedSkills = async (req, res) => {
    try {
        const student = await db_1.default.studentProfile.findUnique({
            where: { userId: req.user.id },
        });
        if (!student) {
            res.status(404).json({ message: 'Student profile not found.' });
            return;
        }
        const payload = await (0, personalizationService_1.getStudentRecommendations)(student.id);
        res.json(payload.recommendedSkills);
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Failed to fetch recommended skills.' });
    }
};
exports.getStudentRecommendedSkills = getStudentRecommendedSkills;
const getStudentRecommendedCourses = async (req, res) => {
    try {
        const student = await db_1.default.studentProfile.findUnique({
            where: { userId: req.user.id },
        });
        if (!student) {
            res.status(404).json({ message: 'Student profile not found.' });
            return;
        }
        const payload = await (0, personalizationService_1.getStudentRecommendations)(student.id);
        res.json(payload.recommendedCourses);
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Failed to fetch recommended courses.' });
    }
};
exports.getStudentRecommendedCourses = getStudentRecommendedCourses;
const getStudentRecommendedInternships = async (req, res) => {
    try {
        const student = await db_1.default.studentProfile.findUnique({
            where: { userId: req.user.id },
        });
        if (!student) {
            res.status(404).json({ message: 'Student profile not found.' });
            return;
        }
        const payload = await (0, personalizationService_1.getStudentRecommendations)(student.id);
        res.json(payload.recommendedInternships);
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Failed to fetch recommended internships.' });
    }
};
exports.getStudentRecommendedInternships = getStudentRecommendedInternships;
const getStudentRecommendedJobs = async (req, res) => {
    try {
        const student = await db_1.default.studentProfile.findUnique({
            where: { userId: req.user.id },
        });
        if (!student) {
            res.status(404).json({ message: 'Student profile not found.' });
            return;
        }
        const payload = await (0, personalizationService_1.getStudentRecommendations)(student.id);
        res.json(payload.recommendedJobs);
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Failed to fetch recommended jobs.' });
    }
};
exports.getStudentRecommendedJobs = getStudentRecommendedJobs;
const getStudentInterests = async (req, res) => {
    try {
        const student = await db_1.default.studentProfile.findUnique({
            where: { userId: req.user.id },
        });
        if (!student) {
            res.status(404).json({ message: 'Student profile not found.' });
            return;
        }
        res.json({
            careerInterests: student.careerInterests
                ? student.careerInterests.split(',').map((s) => s.trim()).filter(Boolean)
                : [],
            preferredRoles: student.preferredRoles
                ? student.preferredRoles.split(',').map((s) => s.trim()).filter(Boolean)
                : [],
            preferredLocations: student.preferredLocations
                ? student.preferredLocations.split(',').map((s) => s.trim()).filter(Boolean)
                : [],
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Failed to fetch career interests.' });
    }
};
exports.getStudentInterests = getStudentInterests;
const updateStudentInterests = async (req, res) => {
    try {
        const { careerInterests, preferredRoles, preferredLocations } = req.body;
        const formattedInterests = Array.isArray(careerInterests)
            ? careerInterests.join(', ')
            : careerInterests;
        const formattedRoles = Array.isArray(preferredRoles)
            ? preferredRoles.join(', ')
            : preferredRoles;
        const formattedLocations = Array.isArray(preferredLocations)
            ? preferredLocations.join(', ')
            : preferredLocations;
        const student = await db_1.default.studentProfile.update({
            where: { userId: req.user.id },
            data: {
                careerInterests: formattedInterests !== undefined ? formattedInterests : undefined,
                preferredRoles: formattedRoles !== undefined ? formattedRoles : undefined,
                preferredLocations: formattedLocations !== undefined ? formattedLocations : undefined,
            },
        });
        const recommendations = await (0, personalizationService_1.getStudentRecommendations)(student.id);
        res.json({
            message: 'Career interests updated successfully.',
            student,
            recommendations,
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Failed to update career interests.' });
    }
};
exports.updateStudentInterests = updateStudentInterests;
const getStudentSkillsToLearn = async (req, res) => {
    try {
        const student = await db_1.default.studentProfile.findUnique({
            where: { userId: req.user.id },
        });
        if (!student) {
            res.status(404).json({ message: 'Student profile not found.' });
            return;
        }
        const payload = await (0, personalizationService_1.getStudentRecommendations)(student.id);
        res.json(payload.skillsToLearnNext);
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Failed to fetch skills to learn next.' });
    }
};
exports.getStudentSkillsToLearn = getStudentSkillsToLearn;
const getStudentSkillGaps = async (req, res) => {
    try {
        const student = await db_1.default.studentProfile.findUnique({
            where: { userId: req.user.id },
        });
        if (!student) {
            res.status(404).json({ message: 'Student profile not found.' });
            return;
        }
        const payload = await (0, personalizationService_1.getStudentRecommendations)(student.id);
        res.json(payload.skillGaps);
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Failed to fetch skill gaps.' });
    }
};
exports.getStudentSkillGaps = getStudentSkillGaps;
const getStudentRecommendedMentors = async (req, res) => {
    try {
        const student = await db_1.default.studentProfile.findUnique({
            where: { userId: req.user.id },
        });
        if (!student) {
            res.status(404).json({ message: 'Student profile not found.' });
            return;
        }
        const payload = await (0, personalizationService_1.getStudentRecommendations)(student.id);
        res.json(payload.recommendedMentors);
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Failed to fetch recommended mentors.' });
    }
};
exports.getStudentRecommendedMentors = getStudentRecommendedMentors;
const getStudentRecommendedCollaborations = async (req, res) => {
    try {
        const student = await db_1.default.studentProfile.findUnique({
            where: { userId: req.user.id },
        });
        if (!student) {
            res.status(404).json({ message: 'Student profile not found.' });
            return;
        }
        const payload = await (0, personalizationService_1.getStudentRecommendations)(student.id);
        res.json(payload.recommendedCollaborations);
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Failed to fetch recommended collaborations.' });
    }
};
exports.getStudentRecommendedCollaborations = getStudentRecommendedCollaborations;
const getOpportunityMatchDetails = async (req, res) => {
    try {
        const opportunityId = req.params.id;
        const student = await db_1.default.studentProfile.findUnique({
            where: { userId: req.user.id },
            include: {
                skillProfiles: { include: { skill: true } },
            },
        });
        if (!student) {
            res.status(404).json({ message: 'Student profile not found.' });
            return;
        }
        const opportunity = await db_1.default.opportunity.findUnique({
            where: { id: opportunityId },
            include: {
                industry: true,
                skills: { include: { skill: true } },
            },
        });
        if (!opportunity) {
            res.status(404).json({ message: 'Opportunity not found.' });
            return;
        }
        const matchResult = await (0, matchingEngine_1.calculateOpportunityMatch)(student.id, opportunity.id);
        const PROFICIENCY_RANK = {
            BEGINNER: 1,
            INTERMEDIATE: 2,
            ADVANCED: 3,
            EXPERT: 4,
        };
        const studentSkillMap = new Map();
        student.skillProfiles.forEach((sp) => {
            studentSkillMap.set(sp.skillId, sp.proficiencyLevel || 'BEGINNER');
        });
        const matchedSkills = [];
        const partiallyMatchedSkills = [];
        const unmatchedSkills = [];
        for (const os of opportunity.skills) {
            const studentProficiency = studentSkillMap.get(os.skillId);
            const reqProf = os.minProficiency || 'INTERMEDIATE';
            const reqRank = PROFICIENCY_RANK[reqProf] || 2;
            if (studentProficiency) {
                const studentRank = PROFICIENCY_RANK[studentProficiency] || 1;
                if (studentRank >= reqRank) {
                    matchedSkills.push({
                        name: os.skill.name,
                        requiredLevel: reqProf,
                        studentLevel: studentProficiency,
                        matchType: 'FULL',
                    });
                }
                else {
                    matchedSkills.push({
                        name: os.skill.name,
                        requiredLevel: reqProf,
                        studentLevel: studentProficiency,
                        matchType: 'PARTIAL',
                    });
                    partiallyMatchedSkills.push({
                        name: os.skill.name,
                        requiredLevel: reqProf,
                        studentLevel: studentProficiency,
                    });
                }
            }
            else {
                unmatchedSkills.push({
                    name: os.skill.name,
                    requiredLevel: reqProf,
                    isRequired: os.isRequired,
                });
            }
        }
        res.json({
            opportunityId: opportunity.id,
            title: opportunity.title,
            companyName: opportunity.industry.companyName,
            type: opportunity.type,
            compatibilityPercentage: matchResult.matchScore,
            isEligible: matchResult.eligibility.isEligible,
            eligibility: matchResult.eligibility,
            ineligibleReasons: matchResult.eligibility.ineligibleReasons || [],
            goodMatchReasons: matchResult.eligibility.goodMatchReasons || [],
            matchedSkills,
            partiallyMatchedSkills,
            unmatchedSkills,
            breakdown: matchResult.breakdown,
            explanation: matchResult.explanation,
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Failed to fetch match details.' });
    }
};
exports.getOpportunityMatchDetails = getOpportunityMatchDetails;
// --------------------------------------------------------------------------
// SKILL PROFILE, SKILL MAPPING, INDUSTRIES & JOB ROLES CONTROLLERS
// --------------------------------------------------------------------------
const getStudentSkillProfileController = async (req, res) => {
    try {
        const student = await db_1.default.studentProfile.findUnique({
            where: { userId: req.user.id },
        });
        if (!student) {
            res.status(404).json({ message: 'Student profile not found.' });
            return;
        }
        const profile = await (0, personalizationService_1.getStudentSkillProfile)(student.id);
        res.json(profile);
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Failed to fetch skill profile.' });
    }
};
exports.getStudentSkillProfileController = getStudentSkillProfileController;
const getStudentSkillMappingController = async (req, res) => {
    try {
        const student = await db_1.default.studentProfile.findUnique({
            where: { userId: req.user.id },
        });
        if (!student) {
            res.status(404).json({ message: 'Student profile not found.' });
            return;
        }
        const mapping = await (0, personalizationService_1.getStudentSkillMapping)(student.id);
        res.json(mapping);
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Failed to fetch skill mapping.' });
    }
};
exports.getStudentSkillMappingController = getStudentSkillMappingController;
const getStudentRecommendedIndustriesController = async (req, res) => {
    try {
        const student = await db_1.default.studentProfile.findUnique({
            where: { userId: req.user.id },
        });
        if (!student) {
            res.status(404).json({ message: 'Student profile not found.' });
            return;
        }
        const industries = await (0, personalizationService_1.getRecommendedIndustries)(student.id);
        res.json(industries);
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Failed to fetch recommended industries.' });
    }
};
exports.getStudentRecommendedIndustriesController = getStudentRecommendedIndustriesController;
const getStudentRecommendedJobRolesController = async (req, res) => {
    try {
        const student = await db_1.default.studentProfile.findUnique({
            where: { userId: req.user.id },
        });
        if (!student) {
            res.status(404).json({ message: 'Student profile not found.' });
            return;
        }
        const jobRoles = await (0, personalizationService_1.getRecommendedJobRoles)(student.id);
        res.json(jobRoles);
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Failed to fetch recommended job roles.' });
    }
};
exports.getStudentRecommendedJobRolesController = getStudentRecommendedJobRolesController;
const getStudentSkillAssessmentsController = async (req, res) => {
    try {
        const student = await db_1.default.studentProfile.findUnique({
            where: { userId: req.user.id },
        });
        if (!student) {
            res.status(404).json({ message: 'Student profile not found.' });
            return;
        }
        const studentDomain = (0, personalizationService_1.resolveDomain)({
            department: student.department,
            degree: student.degree,
            institutionName: student.institutionName,
            careerInterests: student.careerInterests,
        });
        const assessments = await db_1.default.assessment.findMany({
            include: {
                category: true,
                questions: { select: { id: true, skillId: true, difficulty: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
        const attempts = await db_1.default.assessmentAttempt.findMany({
            where: { studentId: student.id },
            orderBy: { startedAt: 'desc' },
        });
        const enhanced = assessments.map((ass) => {
            const latestAttempt = attempts.find((att) => att.assessmentId === ass.id) || null;
            const assDomain = (0, personalizationService_1.resolveDomain)({
                category: ass.category?.name,
                title: ass.title + ' ' + (ass.description || ''),
            });
            const isDomainMatch = assDomain === studentDomain || assDomain === 'GENERAL';
            return {
                id: ass.id,
                title: ass.title,
                description: ass.description,
                category: ass.category?.name || 'General',
                domain: assDomain,
                isDomainMatch,
                durationMinutes: ass.durationMinutes,
                passingScore: ass.passingScore,
                questionsCount: ass.questions.length,
                latestAttempt,
            };
        });
        // Sort domain-matching assessments first
        enhanced.sort((a, b) => (b.isDomainMatch ? 1 : 0) - (a.isDomainMatch ? 1 : 0));
        res.json(enhanced);
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Failed to fetch student assessments.' });
    }
};
exports.getStudentSkillAssessmentsController = getStudentSkillAssessmentsController;
