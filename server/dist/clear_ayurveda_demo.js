"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("./config/db"));
async function clearAyurvedaDemo() {
    console.log('==================================================================');
    console.log('🧹 CLEARING AYURVEDA DEMO DATA FROM DATABASE');
    console.log('==================================================================\n');
    try {
        // 1. Find all demo users
        const demoUsers = await db_1.default.user.findMany({
            where: {
                OR: [
                    { email: { endsWith: '@demo.ayurveda.com' } },
                    { email: { endsWith: '@demo.skillbridge.com' } },
                    { email: { contains: 'demo' } },
                    { email: { contains: 'ayurveda.com' } },
                ],
            },
            include: {
                studentProfile: true,
                academicianProfile: true,
                industryProfile: true,
                institutionProfile: true,
            },
        });
        const demoUserIds = demoUsers.map((u) => u.id);
        const demoStudentIds = demoUsers.flatMap((u) => (u.studentProfile ? [u.studentProfile.id] : []));
        const demoAcademicianIds = demoUsers.flatMap((u) => (u.academicianProfile ? [u.academicianProfile.id] : []));
        const demoIndustryIds = demoUsers.flatMap((u) => (u.industryProfile ? [u.industryProfile.id] : []));
        const demoInstitutionIds = demoUsers.flatMap((u) => (u.institutionProfile ? [u.institutionProfile.id] : []));
        console.log(`Found ${demoUsers.length} demo users to clear.`);
        // 2. Delete dependent records for demo entities
        console.log('Deleting demo course certificates & progress...');
        await db_1.default.courseCertificate.deleteMany({
            where: {
                OR: [
                    { certificateCode: { startsWith: 'AYU-DEMO-' } },
                    { certificateCode: { startsWith: 'AYU-CERT-' } },
                    { studentId: { in: demoStudentIds } },
                ],
            },
        });
        await db_1.default.courseLessonProgress.deleteMany({
            where: {
                enrollment: {
                    studentId: { in: demoStudentIds },
                },
            },
        });
        await db_1.default.courseEnrollment.deleteMany({
            where: { studentId: { in: demoStudentIds } },
        });
        // Delete courses created by demo users
        const demoCourses = await db_1.default.course.findMany({
            where: {
                providerId: { in: demoUserIds },
            },
            select: { id: true },
        });
        const demoCourseIds = demoCourses.map((c) => c.id);
        if (demoCourseIds.length > 0) {
            await db_1.default.courseLesson.deleteMany({
                where: { module: { courseId: { in: demoCourseIds } } },
            });
            await db_1.default.courseModule.deleteMany({
                where: { courseId: { in: demoCourseIds } },
            });
            await db_1.default.courseSkill.deleteMany({
                where: { courseId: { in: demoCourseIds } },
            });
            await db_1.default.course.deleteMany({
                where: { id: { in: demoCourseIds } },
            });
        }
        // Delete collaborations & applications
        await db_1.default.collaborationFeedback.deleteMany({});
        await db_1.default.collaborationApplication.deleteMany({
            where: {
                OR: [
                    { studentId: { in: demoStudentIds } },
                    { academicianId: { in: demoAcademicianIds } },
                    { institutionId: { in: demoInstitutionIds } },
                ],
            },
        });
        await db_1.default.collaboration.deleteMany({
            where: { initiatorId: { in: demoUserIds } },
        });
        // Delete opportunities & applications
        const demoOpportunities = await db_1.default.opportunity.findMany({
            where: {
                industryId: { in: demoIndustryIds },
            },
            select: { id: true },
        });
        const demoOppIds = demoOpportunities.map((o) => o.id);
        await db_1.default.interview.deleteMany({
            where: { application: { opportunityId: { in: demoOppIds } } },
        });
        await db_1.default.applicationStatusHistory.deleteMany({
            where: { application: { opportunityId: { in: demoOppIds } } },
        });
        await db_1.default.application.deleteMany({
            where: {
                OR: [
                    { opportunityId: { in: demoOppIds } },
                    { studentId: { in: demoStudentIds } },
                ],
            },
        });
        await db_1.default.opportunitySkill.deleteMany({
            where: { opportunityId: { in: demoOppIds } },
        });
        await db_1.default.opportunity.deleteMany({
            where: { id: { in: demoOppIds } },
        });
        // Delete student portfolio entries
        await db_1.default.studentSkillProfile.deleteMany({
            where: { studentId: { in: demoStudentIds } },
        });
        await db_1.default.studentEducation.deleteMany({
            where: { studentId: { in: demoStudentIds } },
        });
        await db_1.default.studentCertification.deleteMany({
            where: { studentId: { in: demoStudentIds } },
        });
        await db_1.default.studentProject.deleteMany({
            where: { studentId: { in: demoStudentIds } },
        });
        await db_1.default.studentInternshipExperience.deleteMany({
            where: { studentId: { in: demoStudentIds } },
        });
        await db_1.default.studentAchievement.deleteMany({
            where: { studentId: { in: demoStudentIds } },
        });
        await db_1.default.studentTraining.deleteMany({
            where: { studentId: { in: demoStudentIds } },
        });
        await db_1.default.assessmentResponse.deleteMany({
            where: { attempt: { studentId: { in: demoStudentIds } } },
        });
        await db_1.default.assessmentAttempt.deleteMany({
            where: { studentId: { in: demoStudentIds } },
        });
        // Delete user profiles & accounts
        await db_1.default.studentProfile.deleteMany({
            where: { userId: { in: demoUserIds } },
        });
        await db_1.default.academicianProfile.deleteMany({
            where: { userId: { in: demoUserIds } },
        });
        await db_1.default.industryProfile.deleteMany({
            where: { userId: { in: demoUserIds } },
        });
        await db_1.default.institutionProfile.deleteMany({
            where: { userId: { in: demoUserIds } },
        });
        await db_1.default.notification.deleteMany({
            where: { userId: { in: demoUserIds } },
        });
        await db_1.default.auditLog.deleteMany({
            where: { userId: { in: demoUserIds } },
        });
        const deletedUsers = await db_1.default.user.deleteMany({
            where: { id: { in: demoUserIds } },
        });
        console.log(`\n✅ Cleared ${deletedUsers.count} demo user accounts and all associated data.`);
        console.log('Platform is now reset for fresh registrations or re-seeding.\n');
    }
    catch (error) {
        console.error('❌ Error clearing demo data:', error);
        process.exit(1);
    }
    finally {
        await db_1.default.$disconnect();
    }
}
clearAyurvedaDemo();
