"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.scheduleInterview = exports.updateApplicationStatus = exports.getOpportunityApplicants = exports.applyToOpportunity = exports.getMyOpportunities = exports.deleteOpportunity = exports.updateOpportunity = exports.createOpportunity = exports.getOpportunityById = exports.getOpportunities = void 0;
const db_1 = __importDefault(require("../config/db"));
const matchingEngine_1 = require("../services/matchingEngine");
// Browse Opportunities (with live matching score if Student)
const getOpportunities = async (req, res) => {
    try {
        const { type, department, search } = req.query;
        const whereClause = { isPublished: true };
        if (type && typeof type === 'string' && type !== 'ALL') {
            whereClause.type = type;
        }
        if (department && typeof department === 'string') {
            whereClause.department = { contains: department };
        }
        if (search && typeof search === 'string') {
            whereClause.OR = [
                { title: { contains: search } },
                { description: { contains: search } },
                { location: { contains: search } },
                { industry: { companyName: { contains: search } } },
            ];
        }
        const opportunities = await db_1.default.opportunity.findMany({
            where: whereClause,
            include: {
                industry: {
                    select: {
                        id: true,
                        companyName: true,
                        industrySector: true,
                        location: true,
                        logoUrl: true,
                    },
                },
                skills: {
                    include: { skill: true },
                },
                _count: { select: { applications: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
        let studentId = null;
        if (req.user?.role === 'STUDENT') {
            const student = await db_1.default.studentProfile.findUnique({
                where: { userId: req.user.id },
            });
            studentId = student?.id || null;
        }
        // Attach match result if student
        const enhanced = await Promise.all(opportunities.map(async (opp) => {
            let matchResult = null;
            let hasApplied = false;
            let applicationStatus = null;
            if (studentId) {
                matchResult = await (0, matchingEngine_1.calculateOpportunityMatch)(studentId, opp.id);
                const application = await db_1.default.application.findUnique({
                    where: {
                        studentId_opportunityId: {
                            studentId,
                            opportunityId: opp.id,
                        },
                    },
                    select: { id: true, status: true },
                });
                if (application) {
                    hasApplied = true;
                    applicationStatus = application.status;
                }
            }
            return {
                ...opp,
                matchResult,
                hasApplied,
                applicationStatus,
            };
        }));
        // If student, sort by match score descending
        if (studentId) {
            enhanced.sort((a, b) => (b.matchResult?.matchScore || 0) - (a.matchResult?.matchScore || 0));
        }
        res.json(enhanced);
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Failed to fetch opportunities.' });
    }
};
exports.getOpportunities = getOpportunities;
// Single Opportunity Details
const getOpportunityById = async (req, res) => {
    try {
        const id = req.params.id;
        const opp = await db_1.default.opportunity.findUnique({
            where: { id },
            include: {
                industry: true,
                skills: {
                    include: { skill: true },
                },
                _count: { select: { applications: true } },
            },
        });
        if (!opp) {
            res.status(404).json({ message: 'Opportunity not found.' });
            return;
        }
        let matchResult = null;
        let application = null;
        if (req.user?.role === 'STUDENT') {
            const student = await db_1.default.studentProfile.findUnique({
                where: { userId: req.user.id },
            });
            if (student) {
                matchResult = await (0, matchingEngine_1.calculateOpportunityMatch)(student.id, opp.id);
                application = await db_1.default.application.findUnique({
                    where: {
                        studentId_opportunityId: {
                            studentId: student.id,
                            opportunityId: opp.id,
                        },
                    },
                    include: {
                        history: { orderBy: { createdAt: 'desc' } },
                        interviews: true,
                    },
                });
            }
        }
        res.json({
            ...opp,
            matchResult,
            application,
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Failed to fetch opportunity details.' });
    }
};
exports.getOpportunityById = getOpportunityById;
// Create Opportunity (Industry)
const createOpportunity = async (req, res) => {
    try {
        const industry = await db_1.default.industryProfile.findUnique({
            where: { userId: req.user.id },
        });
        if (!industry) {
            res.status(404).json({ message: 'Industry profile not found.' });
            return;
        }
        const { title, type, description, degree, department, minCgpa, experience, location, workMode, stipendOrSalary, applicationDeadline, numberOfOpenings, duration, startDate, responsibilities, selectionProcess, skillIds, // array of { skillId: string, isRequired: boolean }
         } = req.body;
        if (!title || !type || !description) {
            res.status(400).json({ message: 'Title, opportunity type, and description are required.' });
            return;
        }
        const opp = await db_1.default.$transaction(async (tx) => {
            const created = await tx.opportunity.create({
                data: {
                    industryId: industry.id,
                    title,
                    type,
                    description,
                    degree,
                    department,
                    minCgpa: minCgpa ? parseFloat(minCgpa) : null,
                    experience,
                    location,
                    workMode: workMode || 'ON_SITE',
                    stipendOrSalary,
                    applicationDeadline: applicationDeadline ? new Date(applicationDeadline) : null,
                    numberOfOpenings: numberOfOpenings ? parseInt(numberOfOpenings, 10) : 1,
                    duration,
                    startDate,
                    responsibilities,
                    selectionProcess,
                    isPublished: true,
                },
            });
            if (Array.isArray(skillIds) && skillIds.length > 0) {
                for (const s of skillIds) {
                    await tx.opportunitySkill.create({
                        data: {
                            opportunityId: created.id,
                            skillId: typeof s === 'string' ? s : s.skillId,
                            isRequired: typeof s === 'object' && s.isRequired !== undefined ? Boolean(s.isRequired) : true,
                        },
                    });
                }
            }
            await tx.auditLog.create({
                data: {
                    userId: req.user.id,
                    action: 'OPPORTUNITY_CREATED',
                    entityType: 'Opportunity',
                    entityId: created.id,
                    details: JSON.stringify({ title, type }),
                },
            });
            return created;
        });
        res.status(201).json(opp);
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Failed to create opportunity.' });
    }
};
exports.createOpportunity = createOpportunity;
// Edit Opportunity
const updateOpportunity = async (req, res) => {
    try {
        const id = req.params.id;
        const industry = await db_1.default.industryProfile.findUnique({
            where: { userId: req.user.id },
        });
        const opp = await db_1.default.opportunity.findUnique({ where: { id } });
        if (!opp || opp.industryId !== industry?.id) {
            res.status(403).json({ message: 'Unauthorized to edit this opportunity.' });
            return;
        }
        const { title, type, description, degree, department, minCgpa, experience, location, workMode, stipendOrSalary, applicationDeadline, numberOfOpenings, duration, startDate, responsibilities, selectionProcess, isPublished, } = req.body;
        const updated = await db_1.default.opportunity.update({
            where: { id },
            data: {
                title,
                type,
                description,
                degree,
                department,
                minCgpa: minCgpa !== undefined ? (minCgpa ? parseFloat(minCgpa) : null) : undefined,
                experience,
                location,
                workMode,
                stipendOrSalary,
                applicationDeadline: applicationDeadline ? new Date(applicationDeadline) : undefined,
                numberOfOpenings: numberOfOpenings ? parseInt(numberOfOpenings, 10) : undefined,
                duration,
                startDate,
                responsibilities,
                selectionProcess,
                isPublished: isPublished !== undefined ? Boolean(isPublished) : undefined,
            },
        });
        res.json(updated);
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Failed to update opportunity.' });
    }
};
exports.updateOpportunity = updateOpportunity;
// Delete Opportunity
const deleteOpportunity = async (req, res) => {
    try {
        const id = req.params.id;
        const industry = await db_1.default.industryProfile.findUnique({
            where: { userId: req.user.id },
        });
        const opp = await db_1.default.opportunity.findUnique({ where: { id } });
        if (!opp || opp.industryId !== industry?.id) {
            res.status(403).json({ message: 'Unauthorized to delete this opportunity.' });
            return;
        }
        await db_1.default.opportunity.delete({ where: { id } });
        res.json({ message: 'Opportunity successfully deleted.' });
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Failed to delete opportunity.' });
    }
};
exports.deleteOpportunity = deleteOpportunity;
// Get My Created Opportunities (Industry)
const getMyOpportunities = async (req, res) => {
    try {
        const industry = await db_1.default.industryProfile.findUnique({
            where: { userId: req.user.id },
        });
        if (!industry) {
            res.status(404).json({ message: 'Industry profile not found.' });
            return;
        }
        const opportunities = await db_1.default.opportunity.findMany({
            where: { industryId: industry.id },
            include: {
                skills: { include: { skill: true } },
                _count: { select: { applications: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
        res.json(opportunities);
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Failed to fetch opportunities.' });
    }
};
exports.getMyOpportunities = getMyOpportunities;
// Apply to Opportunity (Student)
const applyToOpportunity = async (req, res) => {
    try {
        const opportunityId = req.params.id;
        const { resumeUrl, coverLetter } = req.body;
        const student = await db_1.default.studentProfile.findUnique({
            where: { userId: req.user.id },
        });
        if (!student) {
            res.status(404).json({ message: 'Student profile not found.' });
            return;
        }
        const opp = await db_1.default.opportunity.findUnique({
            where: { id: opportunityId },
        });
        if (!opp || !opp.isPublished) {
            res.status(404).json({ message: 'Opportunity is closed or not available.' });
            return;
        }
        // Check if already applied
        const existing = await db_1.default.application.findUnique({
            where: {
                studentId_opportunityId: {
                    studentId: student.id,
                    opportunityId,
                },
            },
        });
        if (existing) {
            res.status(400).json({ message: 'You have already applied for this opportunity.' });
            return;
        }
        // Calculate match score snapshot
        const match = await (0, matchingEngine_1.calculateOpportunityMatch)(student.id, opportunityId);
        const application = await db_1.default.$transaction(async (tx) => {
            const created = await tx.application.create({
                data: {
                    studentId: student.id,
                    opportunityId,
                    resumeUrl: resumeUrl || student.resumeUrl,
                    coverLetter,
                    matchScore: match.matchScore,
                    status: 'APPLIED',
                },
            });
            await tx.applicationStatusHistory.create({
                data: {
                    applicationId: created.id,
                    status: 'APPLIED',
                    notes: `Application submitted with match score of ${match.matchScore}%.`,
                    changedById: req.user.id,
                },
            });
            await tx.auditLog.create({
                data: {
                    userId: req.user.id,
                    action: 'APPLICATION_SUBMITTED',
                    entityType: 'Application',
                    entityId: created.id,
                    details: JSON.stringify({ opportunityId, matchScore: match.matchScore }),
                },
            });
            return created;
        });
        res.status(201).json({
            message: 'Application submitted successfully.',
            application,
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Failed to submit application.' });
    }
};
exports.applyToOpportunity = applyToOpportunity;
// Recruiter Screening: View Applicants
const getOpportunityApplicants = async (req, res) => {
    try {
        const { opportunityId } = req.query;
        const industry = await db_1.default.industryProfile.findUnique({
            where: { userId: req.user.id },
        });
        if (!industry) {
            res.status(404).json({ message: 'Industry profile not found.' });
            return;
        }
        const whereClause = {
            opportunity: { industryId: industry.id },
        };
        if (opportunityId && typeof opportunityId === 'string' && opportunityId !== 'ALL') {
            whereClause.opportunityId = opportunityId;
        }
        const applications = await db_1.default.application.findMany({
            where: whereClause,
            include: {
                student: {
                    include: {
                        skillProfiles: { include: { skill: true } },
                    },
                },
                opportunity: {
                    select: {
                        id: true,
                        title: true,
                        type: true,
                        department: true,
                    },
                },
                history: { orderBy: { createdAt: 'desc' } },
                interviews: { orderBy: { scheduledAt: 'desc' } },
            },
            orderBy: { matchScore: 'desc' },
        });
        res.json(applications);
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Failed to fetch applicants.' });
    }
};
exports.getOpportunityApplicants = getOpportunityApplicants;
// Recruiter: Update Application Status
const updateApplicationStatus = async (req, res) => {
    try {
        const id = req.params.id;
        const { status, notes } = req.body;
        const validStatuses = [
            'APPLIED',
            'UNDER_REVIEW',
            'SHORTLISTED',
            'INTERVIEW',
            'SELECTED',
            'REJECTED',
            'WITHDRAWN',
        ];
        if (!validStatuses.includes(status)) {
            res.status(400).json({ message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
            return;
        }
        const industry = await db_1.default.industryProfile.findUnique({
            where: { userId: req.user.id },
        });
        const application = await db_1.default.application.findUnique({
            where: { id },
            include: { opportunity: true },
        });
        if (!application || application.opportunity.industryId !== industry?.id) {
            res.status(403).json({ message: 'Unauthorized to modify this application.' });
            return;
        }
        const updated = await db_1.default.$transaction(async (tx) => {
            const app = await tx.application.update({
                where: { id },
                data: { status },
            });
            await tx.applicationStatusHistory.create({
                data: {
                    applicationId: id,
                    status,
                    notes: notes || `Status updated to ${status} by recruiter.`,
                    changedById: req.user.id,
                },
            });
            await tx.auditLog.create({
                data: {
                    userId: req.user.id,
                    action: 'APPLICATION_STATUS_UPDATED',
                    entityType: 'Application',
                    entityId: id,
                    details: JSON.stringify({ status, notes }),
                },
            });
            return app;
        });
        res.json({ message: `Application status updated to ${status}.`, application: updated });
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Failed to update application status.' });
    }
};
exports.updateApplicationStatus = updateApplicationStatus;
// Recruiter: Schedule Interview
const scheduleInterview = async (req, res) => {
    try {
        const id = req.params.id; // applicationId
        const { scheduledAt, meetingLink, notes } = req.body;
        if (!scheduledAt) {
            res.status(400).json({ message: 'Scheduled date and time is required.' });
            return;
        }
        const industry = await db_1.default.industryProfile.findUnique({
            where: { userId: req.user.id },
        });
        const application = await db_1.default.application.findUnique({
            where: { id },
            include: { opportunity: true },
        });
        if (!application || application.opportunity.industryId !== industry?.id) {
            res.status(403).json({ message: 'Unauthorized to schedule interview for this application.' });
            return;
        }
        const result = await db_1.default.$transaction(async (tx) => {
            const interview = await tx.interview.create({
                data: {
                    applicationId: id,
                    scheduledAt: new Date(scheduledAt),
                    meetingLink,
                    notes,
                    status: 'SCHEDULED',
                },
            });
            // Advance status to INTERVIEW if not already
            await tx.application.update({
                where: { id },
                data: { status: 'INTERVIEW' },
            });
            await tx.applicationStatusHistory.create({
                data: {
                    applicationId: id,
                    status: 'INTERVIEW',
                    notes: `Interview scheduled for ${new Date(scheduledAt).toLocaleString()}`,
                    changedById: req.user.id,
                },
            });
            return interview;
        });
        res.status(201).json({ message: 'Interview scheduled successfully.', interview: result });
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Failed to schedule interview.' });
    }
};
exports.scheduleInterview = scheduleInterview;
