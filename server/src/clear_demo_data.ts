import prisma from './config/db';

export async function clearDemoData() {
  console.log('🧹 Starting safe demo data purge...');

  try {
    // 1. Identify all demo users
    const demoUsers = await prisma.user.findMany({
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

    const realUsersCount = await prisma.user.count({
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
      await prisma.user.deleteMany({});
    } else {
      // Selective demo-only purge to safeguard real users
      const demoUserIds = demoUsers.map((u) => u.id);
      const demoStudentIds = demoUsers.map((u) => u.studentProfile?.id).filter(Boolean) as string[];
      const demoIndustryIds = demoUsers.map((u) => u.industryProfile?.id).filter(Boolean) as string[];

      // Delete demo student records
      if (demoStudentIds.length > 0) {
        await prisma.courseCertificate.deleteMany({ where: { studentId: { in: demoStudentIds } } });
        await prisma.courseEnrollment.deleteMany({ where: { studentId: { in: demoStudentIds } } });
        await prisma.application.deleteMany({ where: { studentId: { in: demoStudentIds } } });
        await prisma.studentSkillProfile.deleteMany({ where: { studentId: { in: demoStudentIds } } });
        await prisma.mentorshipRequest.deleteMany({ where: { studentId: { in: demoStudentIds } } });
        await prisma.collaborationApplication.deleteMany({ where: { studentId: { in: demoStudentIds } } });
      }

      // Delete demo industry opportunities
      if (demoIndustryIds.length > 0) {
        await prisma.opportunity.deleteMany({ where: { industryId: { in: demoIndustryIds } } });
        await prisma.mentorshipProgram.deleteMany({ where: { mentorId: { in: demoIndustryIds } } });
      }

      // Delete demo courses and collaborations
      if (demoUserIds.length > 0) {
        await prisma.course.deleteMany({ where: { providerId: { in: demoUserIds } } });
        await prisma.collaboration.deleteMany({ where: { initiatorId: { in: demoUserIds } } });
        await prisma.user.deleteMany({ where: { id: { in: demoUserIds } } });
      }
    }

    console.log('✅ Demo data purge completed cleanly! Real users preserved.');
  } catch (error) {
    console.error('❌ Error during demo data purge:', error);
    throw error;
  }
}

if (require.main === module) {
  clearDemoData()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export default clearDemoData;
