import prisma from './config/db';

async function purgeAllRecords() {
  console.log('--- Starting Complete Database Purge ---');

  await prisma.courseCertificate.deleteMany({});
  await prisma.courseLessonProgress.deleteMany({});
  await prisma.courseEnrollment.deleteMany({});
  await prisma.courseLesson.deleteMany({});
  await prisma.courseModule.deleteMany({});
  await prisma.courseSkill.deleteMany({});
  await prisma.course.deleteMany({});
  await prisma.collaborationFeedback.deleteMany({});
  await prisma.collaborationApplication.deleteMany({});
  await prisma.collaboration.deleteMany({});
  await prisma.mentorshipSession.deleteMany({});
  await prisma.mentorshipRequest.deleteMany({});
  await prisma.mentorshipProgram.deleteMany({});
  await prisma.learningEnrollment.deleteMany({});
  await prisma.learningProgramSkill.deleteMany({});
  await prisma.learningProgram.deleteMany({});
  await prisma.interview.deleteMany({});
  await prisma.applicationStatusHistory.deleteMany({});
  await prisma.application.deleteMany({});
  await prisma.opportunitySkill.deleteMany({});
  await prisma.opportunity.deleteMany({});
  await prisma.assessmentResponse.deleteMany({});
  await prisma.assessmentAttempt.deleteMany({});
  await prisma.questionOption.deleteMany({});
  await prisma.question.deleteMany({});
  await prisma.assessment.deleteMany({});
  await prisma.studentSkillProfile.deleteMany({});
  await prisma.studentEducation.deleteMany({});
  await prisma.studentCertification.deleteMany({});
  await prisma.studentProject.deleteMany({});
  await prisma.studentInternshipExperience.deleteMany({});
  await prisma.studentAchievement.deleteMany({});
  await prisma.studentTraining.deleteMany({});
  await prisma.skill.deleteMany({});
  await prisma.skillCategory.deleteMany({});
  await prisma.studentProfile.deleteMany({});
  await prisma.academicianProfile.deleteMany({});
  await prisma.industryProfile.deleteMany({});
  await prisma.institutionProfile.deleteMany({});
  await prisma.auditLog.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.platformSetting.deleteMany({});
  await prisma.user.deleteMany({});

  const [
    userCount,
    studentCount,
    industryCount,
    academicianCount,
    institutionCount,
    oppCount,
    progCount,
    assessCount,
    collabCount,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.studentProfile.count(),
    prisma.industryProfile.count(),
    prisma.academicianProfile.count(),
    prisma.institutionProfile.count(),
    prisma.opportunity.count(),
    prisma.learningProgram.count(),
    prisma.assessment.count(),
    prisma.collaboration.count(),
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

  if (
    userCount === 0 &&
    studentCount === 0 &&
    industryCount === 0 &&
    academicianCount === 0 &&
    institutionCount === 0 &&
    oppCount === 0
  ) {
    console.log('SUCCESS: All test/demo records removed safely. Database is 100% clean.');
  } else {
    console.error('ERROR: Residual records found in database.');
    process.exit(1);
  }

  await prisma.$disconnect();
}

purgeAllRecords().catch((err) => {
  console.error('Purge failed:', err);
  process.exit(1);
});
