import bcrypt from 'bcryptjs';
import prisma from './config/db';
import { calculateOpportunityMatch } from './services/matchingEngine';
import { getStudentSkillEvidenceProfile } from './services/evidenceService';

async function verifySihDemo() {
  console.log('==================================================================');
  console.log('🔍 VERIFYING SIH DEMO ECOSYSTEM HEALTH & FUNCTIONALITY');
  console.log('==================================================================\n');

  let passedTests = 0;
  let totalTests = 14;

  const testAccounts = [
    { email: 'aarav.demo@skillbridge.edu', role: 'STUDENT', name: 'Aarav Sharma' },
    { email: 'ananya.demo@skillbridge.edu', role: 'STUDENT', name: 'Ananya Iyer' },
    { email: 'rahul.demo@skillbridge.edu', role: 'STUDENT', name: 'Rahul Verma' },
    { email: 'anjali.academician.demo@skillbridge.edu', role: 'ACADEMICIAN', name: 'Dr. Anjali Menon' },
    { email: 'sushruta.demo@skillbridge.edu', role: 'INSTITUTION', name: 'Sushruta Institute' },
    { email: 'ayuresearch.industry.demo@skillbridge.edu', role: 'INDUSTRY', name: 'AyurResearch Labs' },
  ];

  // 1. Student accounts can log in (password verification check)
  console.log('1. Checking Student Login Credentials...');
  const studentUser = await prisma.user.findUnique({ where: { email: 'aarav.demo@skillbridge.edu' } });
  const studentPasswordValid = studentUser && await bcrypt.compare('Demo@12345', studentUser.passwordHash);
  if (studentPasswordValid && studentUser?.role === 'STUDENT') {
    console.log('   [PASS] Student login credential valid (Aarav Sharma)');
    passedTests++;
  } else {
    console.log('   [FAIL] Student login check failed');
  }

  // 2. Academician accounts can log in
  console.log('2. Checking Academician Login Credentials...');
  const acadUser = await prisma.user.findUnique({ where: { email: 'anjali.academician.demo@skillbridge.edu' } });
  const acadPasswordValid = acadUser && await bcrypt.compare('Demo@12345', acadUser.passwordHash);
  if (acadPasswordValid && acadUser?.role === 'ACADEMICIAN') {
    console.log('   [PASS] Academician login credential valid (Dr. Anjali Menon)');
    passedTests++;
  } else {
    console.log('   [FAIL] Academician login check failed');
  }

  // 3. Institution accounts can log in
  console.log('3. Checking Institution Login Credentials...');
  const instUser = await prisma.user.findUnique({ where: { email: 'sushruta.demo@skillbridge.edu' } });
  const instPasswordValid = instUser && await bcrypt.compare('Demo@12345', instUser.passwordHash);
  if (instPasswordValid && instUser?.role === 'INSTITUTION') {
    console.log('   [PASS] Institution login credential valid (Sushruta Institute)');
    passedTests++;
  } else {
    console.log('   [FAIL] Institution login check failed');
  }

  // 4. Industry accounts can log in
  console.log('4. Checking Industry Login Credentials...');
  const indUser = await prisma.user.findUnique({ where: { email: 'ayuresearch.industry.demo@skillbridge.edu' } });
  const indPasswordValid = indUser && await bcrypt.compare('Demo@12345', indUser.passwordHash);
  if (indPasswordValid && indUser?.role === 'INDUSTRY') {
    console.log('   [PASS] Industry login credential valid (AyurResearch Labs)');
    passedTests++;
  } else {
    console.log('   [FAIL] Industry login check failed');
  }

  // 5. Student -> Institution relationship
  console.log('5. Checking Student -> Institution Relationship...');
  const aaravProfile = await prisma.studentProfile.findUnique({
    where: { userId: studentUser!.id },
    include: { institution: true },
  });
  if (aaravProfile && aaravProfile.institution && aaravProfile.institution.institutionName === 'Sushruta Institute of Ayurvedic Sciences') {
    console.log(`   [PASS] Student linked to: ${aaravProfile.institution.institutionName}`);
    passedTests++;
  } else {
    console.log('   [FAIL] Student -> Institution link failed');
  }

  // 6. Academician -> Institution relationship
  console.log('6. Checking Academician -> Institution Relationship...');
  const anjaliProfile = await prisma.academicianProfile.findUnique({
    where: { userId: acadUser!.id },
    include: { institution: true },
  });
  if (anjaliProfile && anjaliProfile.institution && anjaliProfile.institution.institutionName === 'Sushruta Institute of Ayurvedic Sciences') {
    console.log(`   [PASS] Academician linked to: ${anjaliProfile.institution.institutionName}`);
    passedTests++;
  } else {
    console.log('   [FAIL] Academician -> Institution link failed');
  }

  // 7. Industry <-> Institution partnerships
  console.log('7. Checking Industry <-> Institution Partnerships...');
  const partnerships = await prisma.industryInstitutionPartnership.findMany({
    where: { status: 'APPROVED' },
    include: { industry: true, institution: true },
  });
  if (partnerships.length >= 5) {
    console.log(`   [PASS] ${partnerships.length} verified active partnerships verified`);
    passedTests++;
  } else {
    console.log(`   [FAIL] Found only ${partnerships.length} partnerships`);
  }

  // 8. Industry -> Opportunity
  console.log('8. Checking Industry -> Opportunity Linking...');
  const ayurResOpp = await prisma.opportunity.findFirst({
    where: { title: 'Clinical Research Intern - Ayurveda' },
    include: { industry: true, skills: { include: { skill: true } } },
  });
  if (ayurResOpp && ayurResOpp.industry.companyName === 'AyurResearch Labs') {
    console.log(`   [PASS] Opportunity "${ayurResOpp.title}" linked to ${ayurResOpp.industry.companyName}`);
    passedTests++;
  } else {
    console.log('   [FAIL] Opportunity link failed');
  }

  // 9. Opportunity -> Student Matching
  console.log('9. Checking Opportunity -> Student Matching Algorithm...');
  if (aaravProfile && ayurResOpp) {
    const match = await calculateOpportunityMatch(aaravProfile.id, ayurResOpp.id);
    if (match.matchPercentage >= 90 && match.matchPercentage <= 95) {
      console.log(`   [PASS] Aarav Sharma match score = ${match.matchPercentage}% (within target 90-95%)`);
      passedTests++;
    } else {
      console.log(`   [FAIL] Aarav Sharma match score = ${match.matchPercentage}% (expected 90-95%)`);
    }
  } else {
    console.log('   [FAIL] Missing student or opportunity profile for match calculation');
  }

  // 10. Student -> Application
  console.log('10. Checking Student -> Application Record...');
  const application = await prisma.application.findFirst({
    where: { studentId: aaravProfile!.id, opportunityId: ayurResOpp!.id },
    include: { student: true, opportunity: true, history: true },
  });
  if (application && application.status === 'SHORTLISTED') {
    console.log(`   [PASS] Application verified (Status: ${application.status}, Match: ${application.matchScore}%, Assessment: ${application.assessmentScore}%)`);
    passedTests++;
  } else {
    console.log('   [FAIL] Application record not found or status incorrect');
  }

  // 11. Assessment -> Skill Progress
  console.log('11. Checking Assessment Attempts & Granular Sub-skills...');
  const attempts = await prisma.assessmentAttempt.findMany({
    where: { studentId: aaravProfile!.id },
    include: { assessment: true },
  });
  const subSkillScores = await prisma.studentSubSkillScore.findMany({
    where: { studentId: aaravProfile!.id },
    include: { subSkill: true },
  });
  if (attempts.length >= 2 && subSkillScores.length >= 7) {
    console.log(`   [PASS] Found ${attempts.length} assessment attempts and ${subSkillScores.length} sub-skill scores for Aarav`);
    passedTests++;
  } else {
    console.log(`   [FAIL] Expected at least 2 attempts and 7 sub-skills (Found: ${attempts.length} attempts, ${subSkillScores.length} sub-skills)`);
  }

  // 12. Evidence -> Skill Verification
  console.log('12. Checking 5-Tier Evidence Lifecycle for Dravyaguna...');
  const evidenceSummary = await getStudentSkillEvidenceProfile(aaravProfile!.id);
  const dravyaEvidence = evidenceSummary.find((e) => e.skillName === 'Dravyaguna');
  if (dravyaEvidence && dravyaEvidence.evidenceCount >= 5 && dravyaEvidence.evidenceStrength === 'HIGH') {
    console.log(`   [PASS] 5-Tier Evidence verified for Dravyaguna (Level: ${dravyaEvidence.highestEvidenceLevel}, Strength: ${dravyaEvidence.evidenceStrength}, Items: ${dravyaEvidence.evidenceCount})`);
    passedTests++;
  } else {
    console.log('   [FAIL] 5-Tier Evidence verification failed for Dravyaguna');
  }

  // 13. Industry Validation
  console.log('13. Checking Industry Validated Assessment Evidence...');
  const indValidation = await prisma.skillEvidence.findFirst({
    where: { studentId: aaravProfile!.id, evidenceType: 'INDUSTRY_VALIDATED' },
  });
  if (indValidation && indValidation.score === 91) {
    console.log(`   [PASS] Industry validation verified (Score: ${indValidation.score}%, Issuer: ${indValidation.issuer})`);
    passedTests++;
  } else {
    console.log('   [FAIL] Industry validation record not found or score mismatch');
  }

  // 14. Progress Tracking Data Integrity
  console.log('14. Checking Progress Tracking Data Aggregate...');
  const studentSkills = await prisma.studentSkillProfile.findMany({
    where: { studentId: aaravProfile!.id },
  });
  const courseEnrollments = await prisma.courseEnrollment.findMany({
    where: { studentId: aaravProfile!.id },
  });
  const roadmaps = await prisma.learningRoadmap.findMany({
    where: { studentId: aaravProfile!.id },
    include: { steps: true },
  });
  if (studentSkills.length >= 6 && courseEnrollments.length >= 3 && roadmaps.length >= 1 && roadmaps[0].steps.length >= 5) {
    console.log(`   [PASS] Progress Tracking aggregate verified: ${studentSkills.length} skills, ${courseEnrollments.length} courses, ${roadmaps[0].steps.length} roadmap steps`);
    passedTests++;
  } else {
    console.log('   [FAIL] Progress tracking aggregate check failed');
  }

  console.log('\n==================================================================');
  console.log(`SUMMARY: ${passedTests}/${totalTests} TESTS PASSED SUCCESSFULLY!`);
  console.log('==================================================================');
}

if (require.main === module) {
  verifySihDemo()
    .catch((err) => {
      console.error('Verification failed:', err);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
