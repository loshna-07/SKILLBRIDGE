"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("./config/db"));
async function purgeAllRecords() {
    console.log('--- Starting Complete Database Purge ---');
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
    await db_1.default.platformSetting.deleteMany({});
    await db_1.default.user.deleteMany({});
    const [userCount, studentCount, industryCount, academicianCount, institutionCount, oppCount, progCount, assessCount, collabCount,] = await Promise.all([
        db_1.default.user.count(),
        db_1.default.studentProfile.count(),
        db_1.default.industryProfile.count(),
        db_1.default.academicianProfile.count(),
        db_1.default.institutionProfile.count(),
        db_1.default.opportunity.count(),
        db_1.default.learningProgram.count(),
        db_1.default.assessment.count(),
        db_1.default.collaboration.count(),
    ]);
    console.log('--- Database Purge Verification ---');
    console.log(`Users in DB: ${userCount}`);
    console.log(`Students in DB: ${studentCount}`);
    console.log(`Industry Profiles in DB: ${industryCount}`);
    console.log(`Academicians in DB: ${academicianCount}`);
    console.log(`Institutions in DB: ${institutionCount}`);
    console.log(`Opportunities in DB: ${oppCount}`);
    console.log(`Learning Programs in DB: ${progCount}`);
    console.log(`Assessments in DB: ${assessCount}`);
    console.log(`Collaborations in DB: ${collabCount}`);
    if (userCount === 0 &&
        studentCount === 0 &&
        industryCount === 0 &&
        academicianCount === 0 &&
        institutionCount === 0 &&
        oppCount === 0) {
        console.log('SUCCESS: All test/demo records removed safely. Database is 100% clean.');
    }
    else {
        console.error('ERROR: Residual records found in database.');
        process.exit(1);
    }
    await db_1.default.$disconnect();
}
purgeAllRecords().catch((err) => {
    console.error('Purge failed:', err);
    process.exit(1);
});
