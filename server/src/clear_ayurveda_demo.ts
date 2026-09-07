import prisma from './config/db';

async function clearAyurvedaDemo() {
  console.log('==================================================================');
  console.log('🧹 CLEARING AYURVEDA DEMO DATA FROM DATABASE');
  console.log('==================================================================\n');

  try {
    // 1. Find all demo users
    const demoUsers = await prisma.user.findMany({
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
    await prisma.courseCertificate.deleteMany({
      where: {
        OR: [
          { certificateCode: { startsWith: 'AYU-DEMO-' } },
          { certificateCode: { startsWith: 'AYU-CERT-' } },
          { studentId: { in: demoStudentIds } },
        ],
      },
    });

    await prisma.courseLessonProgress.deleteMany({
      where: {
        enrollment: {
          studentId: { in: demoStudentIds },
        },
      },
    });

    await prisma.courseEnrollment.deleteMany({
      where: { studentId: { in: demoStudentIds } },
    });

    // Delete courses created by demo users
    const demoCourses = await prisma.course.findMany({
      where: {
        providerId: { in: demoUserIds },
      },
      select: { id: true },
    });
    const demoCourseIds = demoCourses.map((c) => c.id);

    if (demoCourseIds.length > 0) {
      await prisma.courseLesson.deleteMany({
        where: { module: { courseId: { in: demoCourseIds } } },
      });
      await prisma.courseModule.deleteMany({
        where: { courseId: { in: demoCourseIds } },
      });
      await prisma.courseSkill.deleteMany({
        where: { courseId: { in: demoCourseIds } },
      });
      await prisma.course.deleteMany({
        where: { id: { in: demoCourseIds } },
      });
    }

    // Delete collaborations & applications
    await prisma.collaborationFeedback.deleteMany({});
    await prisma.collaborationApplication.deleteMany({
      where: {
        OR: [
          { studentId: { in: demoStudentIds } },
          { academicianId: { in: demoAcademicianIds } },
          { institutionId: { in: demoInstitutionIds } },
        ],
      },
    });
    await prisma.collaboration.deleteMany({
      where: { initiatorId: { in: demoUserIds } },
    });

    // Delete opportunities & applications
    const demoOpportunities = await prisma.opportunity.findMany({
      where: {
        industryId: { in: demoIndustryIds },
      },
      select: { id: true },
    });
    const demoOppIds = demoOpportunities.map((o) => o.id);

    await prisma.interview.deleteMany({
      where: { application: { opportunityId: { in: demoOppIds } } },
    });
    await prisma.applicationStatusHistory.deleteMany({
      where: { application: { opportunityId: { in: demoOppIds } } },
    });
    await prisma.application.deleteMany({
      where: {
        OR: [
          { opportunityId: { in: demoOppIds } },
          { studentId: { in: demoStudentIds } },
        ],
      },
    });
    await prisma.opportunitySkill.deleteMany({
      where: { opportunityId: { in: demoOppIds } },
    });
    await prisma.opportunity.deleteMany({
      where: { id: { in: demoOppIds } },
    });

    // Delete student portfolio entries
    await prisma.studentSkillProfile.deleteMany({
      where: { studentId: { in: demoStudentIds } },
    });
    await prisma.studentEducation.deleteMany({
      where: { studentId: { in: demoStudentIds } },
    });
    await prisma.studentCertification.deleteMany({
      where: { studentId: { in: demoStudentIds } },
    });
    await prisma.studentProject.deleteMany({
      where: { studentId: { in: demoStudentIds } },
    });
    await prisma.studentInternshipExperience.deleteMany({
      where: { studentId: { in: demoStudentIds } },
    });
    await prisma.studentAchievement.deleteMany({
      where: { studentId: { in: demoStudentIds } },
    });
    await prisma.studentTraining.deleteMany({
      where: { studentId: { in: demoStudentIds } },
    });
    await prisma.assessmentResponse.deleteMany({
      where: { attempt: { studentId: { in: demoStudentIds } } },
    });
    await prisma.assessmentAttempt.deleteMany({
      where: { studentId: { in: demoStudentIds } },
    });

    // Delete user profiles & accounts
    await prisma.studentProfile.deleteMany({
      where: { userId: { in: demoUserIds } },
    });
    await prisma.academicianProfile.deleteMany({
      where: { userId: { in: demoUserIds } },
    });
    await prisma.industryProfile.deleteMany({
      where: { userId: { in: demoUserIds } },
    });
    await prisma.institutionProfile.deleteMany({
      where: { userId: { in: demoUserIds } },
    });
    await prisma.notification.deleteMany({
      where: { userId: { in: demoUserIds } },
    });
    await prisma.auditLog.deleteMany({
      where: { userId: { in: demoUserIds } },
    });

    const deletedUsers = await prisma.user.deleteMany({
      where: { id: { in: demoUserIds } },
    });

    console.log(`\n✅ Cleared ${deletedUsers.count} demo user accounts and all associated data.`);
    console.log('Platform is now reset for fresh registrations or re-seeding.\n');
  } catch (error) {
    console.error('❌ Error clearing demo data:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

clearAyurvedaDemo();
