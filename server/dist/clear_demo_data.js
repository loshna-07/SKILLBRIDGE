"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearDemoData = clearDemoData;
const db_1 = __importDefault(require("./config/db"));
async function clearDemoData() {
    console.log('🧹 Starting safe demo data purge...');
    try {
        // 1. Identify all demo users
        const demoUsers = await db_1.default.user.findMany({
            where: {
                OR: [
                    { email: { contains: 'demo', mode: 'insensitive' } },
                    { email: { endsWith: '.demo' } },
                ],
            },
            include: {
                studentProfile: true,
                academicianProfile: true,
                industryProfile: true,
                institutionProfile: true,
            },
        });
        const realUsersCount = await db_1.default.user.count({
            where: {
                AND: [
                    { NOT: { email: { contains: 'demo', mode: 'insensitive' } } },
                    { NOT: { email: { endsWith: '.demo' } } },
                ],
            },
        });
        console.log(`Found ${demoUsers.length} demo users and ${realUsersCount} real users.`);
        if (realUsersCount === 0) {
            // Clean wholesale purge for development / demo resets
            await db_1.default.courseCertificate.deleteMany({});
            await db_1.default.courseLessonProgress.deleteMany({});
            await db_1.default.courseEnrollment.deleteMany({});
            await db_1.default.courseLesson.deleteMany({});
            await db_1.default.courseModule.deleteMany({});
            await db_1.default.courseSkill.deleteMany({});
            await db_1.default.course.deleteMany({});
            await db_1.default.collaborationFeedback.deleteMany({});
            await db_1.default.collaborationApplication.deleteMany({});
            await db_1.default.collaboration.deleteMany({});
            await db_1.default.mentorshipSession.deleteMany({});
            await db_1.default.mentorshipRequest.deleteMany({});
            await db_1.default.mentorshipProgram.deleteMany({});
            await db_1.default.learningEnrollment.deleteMany({});
            await db_1.default.learningProgramSkill.deleteMany({});
            await db_1.default.learningProgram.deleteMany({});
            await db_1.default.interview.deleteMany({});
            await db_1.default.applicationStatusHistory.deleteMany({});
            await db_1.default.application.deleteMany({});
            await db_1.default.opportunitySkill.deleteMany({});
            await db_1.default.opportunity.deleteMany({});
            await db_1.default.assessmentResponse.deleteMany({});
            await db_1.default.assessmentAttempt.deleteMany({});
            await db_1.default.questionOption.deleteMany({});
            await db_1.default.question.deleteMany({});
            await db_1.default.assessment.deleteMany({});
            await db_1.default.studentSkillProfile.deleteMany({});
            await db_1.default.studentEducation.deleteMany({});
            await db_1.default.studentCertification.deleteMany({});
            await db_1.default.studentProject.deleteMany({});
            await db_1.default.studentInternshipExperience.deleteMany({});
            await db_1.default.studentAchievement.deleteMany({});
            await db_1.default.studentTraining.deleteMany({});
            await db_1.default.skill.deleteMany({});
            await db_1.default.skillCategory.deleteMany({});
            await db_1.default.studentProfile.deleteMany({});
            await db_1.default.academicianProfile.deleteMany({});
            await db_1.default.industryProfile.deleteMany({});
            await db_1.default.institutionProfile.deleteMany({});
            await db_1.default.auditLog.deleteMany({});
            await db_1.default.notification.deleteMany({});
            await db_1.default.user.deleteMany({});
        }
        else {
            // Selective demo-only purge to safeguard real users
            const demoUserIds = demoUsers.map((u) => u.id);
            const demoStudentIds = demoUsers.map((u) => u.studentProfile?.id).filter(Boolean);
            const demoIndustryIds = demoUsers.map((u) => u.industryProfile?.id).filter(Boolean);
            // Delete demo student records
            if (demoStudentIds.length > 0) {
                await db_1.default.courseCertificate.deleteMany({ where: { studentId: { in: demoStudentIds } } });
                await db_1.default.courseEnrollment.deleteMany({ where: { studentId: { in: demoStudentIds } } });
                await db_1.default.application.deleteMany({ where: { studentId: { in: demoStudentIds } } });
                await db_1.default.studentSkillProfile.deleteMany({ where: { studentId: { in: demoStudentIds } } });
                await db_1.default.mentorshipRequest.deleteMany({ where: { studentId: { in: demoStudentIds } } });
                await db_1.default.collaborationApplication.deleteMany({ where: { studentId: { in: demoStudentIds } } });
            }
            // Delete demo industry opportunities
            if (demoIndustryIds.length > 0) {
                await db_1.default.opportunity.deleteMany({ where: { industryId: { in: demoIndustryIds } } });
                await db_1.default.mentorshipProgram.deleteMany({ where: { mentorId: { in: demoIndustryIds } } });
            }
            // Delete demo courses and collaborations
            if (demoUserIds.length > 0) {
                await db_1.default.course.deleteMany({ where: { providerId: { in: demoUserIds } } });
                await db_1.default.collaboration.deleteMany({ where: { initiatorId: { in: demoUserIds } } });
                await db_1.default.user.deleteMany({ where: { id: { in: demoUserIds } } });
            }
        }
        console.log('✅ Demo data purge completed cleanly! Real users preserved.');
    }
    catch (error) {
        console.error('❌ Error during demo data purge:', error);
        throw error;
    }
}
if (require.main === module) {
    clearDemoData()
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
}
exports.default = clearDemoData;
