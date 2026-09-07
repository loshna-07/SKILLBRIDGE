"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteEducation = exports.addEducation = exports.deleteInternshipExperience = exports.addInternshipExperience = exports.deleteCertification = exports.addCertification = exports.deleteProject = exports.addProject = exports.getStudentPortfolio = exports.withdrawApplication = exports.getStudentApplications = exports.getStudentSkills = exports.updateStudentProfile = exports.getStudentProfile = exports.getStudentDashboard = void 0;
const db_1 = __importDefault(require("../config/db"));
const matchingEngine_1 = require("../services/matchingEngine");
const recommendationEngine_1 = require("../services/recommendationEngine");
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
                skillProfiles: { include: { skill: true } },
                assessmentAttempts: {
                    orderBy: { startedAt: 'desc' },
                    take: 5,
                    include: { assessment: true },
                },
                applications: {
                    orderBy: { appliedAt: 'desc' },
                    take: 5,
                    include: {
                        opportunity: {
                            include: { industry: true },
                        },
                    },
                },
                educations: true,
                certificates: true,
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
        // Get learning recommendations based on real skill gaps
        const recommendations = await (0, recommendationEngine_1.getStudentLearningRecommendations)(student.id);
        // Fetch published opportunities and run matching engine
        const publishedOpportunities = await db_1.default.opportunity.findMany({
            where: { isPublished: true },
            include: {
                industry: true,
                skills: { include: { skill: true } },
            },
            take: 6,
        });
        const matchedOpportunities = await Promise.all(publishedOpportunities.map(async (opp) => {
            const matchResult = await (0, matchingEngine_1.calculateOpportunityMatch)(student.id, opp.id);
            return {
                ...opp,
                matchResult,
            };
        }));
        // Sort by match score descending
        matchedOpportunities.sort((a, b) => b.matchResult.matchScore - a.matchResult.matchScore);
        // Portfolio items count
        const portfolioCount = student.educations.length +
            student.certificates.length +
            student.projects.length +
            student.internships.length +
            student.achievements.length;
        res.json({
            profileCompletion,
            avgSkillScore,
            skillsCount: student.skillProfiles.length,
            assessmentsCount: student.assessmentAttempts.length,
            applicationsCount: student.applications.length,
            portfolioCount,
            recentAssessments: student.assessmentAttempts,
            recentApplications: student.applications,
            recommendations: recommendations.slice(0, 4),
            topOpportunities: matchedOpportunities.slice(0, 4),
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
const addCertification = async (req, res) => {
    try {
        const student = await db_1.default.studentProfile.findUnique({ where: { userId: req.user.id } });
        if (!student) {
            res.status(404).json({ message: 'Student profile not found.' });
            return;
        }
        const { title, issuingOrganization, issueDate, credentialUrl } = req.body;
        if (!title || !issuingOrganization) {
            res.status(400).json({ message: 'Title and issuing organization are required.' });
            return;
        }
        const cert = await db_1.default.studentCertification.create({
            data: {
                studentId: student.id,
                title,
                issuingOrganization,
                issueDate,
                credentialUrl,
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
const deleteCertification = async (req, res) => {
    try {
        const id = req.params.id;
        await db_1.default.studentCertification.delete({ where: { id } });
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
