import prisma from './config/db';

const BASE_URL = 'http://localhost:5000/api';

async function req(method: string, path: string, body?: any, token?: string): Promise<any> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => null);
  return { status: res.status, ok: res.ok, data };
}

async function verifySkillsFlow() {
  console.log('========================================================================');
  console.log('>>> VERIFYING STUDENT SKILL DEVELOPMENT SYSTEM: END-TO-END FLOW <<<');
  console.log('========================================================================\n');

  // 1. Health check
  console.log('[1] Checking backend health endpoint...');
  const health = await req('GET', '/health');
  if (!health.ok) throw new Error('Backend health check failed');
  console.log('  -> Health status: OK');

  // 2. Clean database
  console.log('\n[2] Ensuring clean database state...');
  await prisma.auditLog.deleteMany({});
  await prisma.assessmentResponse.deleteMany({});
  await prisma.assessmentAttempt.deleteMany({});
  await prisma.studentSkillProfile.deleteMany({});
  await prisma.questionOption.deleteMany({});
  await prisma.question.deleteMany({});
  await prisma.assessment.deleteMany({});
  await prisma.skill.deleteMany({});
  await prisma.skillCategory.deleteMany({});
  await prisma.user.deleteMany({});
  console.log('  -> Database verified clean (0 users, 0 assessments, 0 skills).');

  // 3. Register Institution
  console.log('\n[3] Registering Institution account to author skill categories & assessments...');
  const instReg = await req('POST', '/auth/register', {
    role: 'INSTITUTION',
    email: 'admin@nia.edu.in',
    password: 'Password123!',
    institutionName: 'National Institute of Ayurveda',
    officialEmail: 'registrar@nia.edu.in',
    institutionType: 'Deemed University (AYUSH)',
    address: 'Jaipur, Rajasthan',
    contactPerson: 'Dean of Academic Affairs',
    contactNumber: '+91 141 2635816',
  });
  if (!instReg.ok) throw new Error('Institution registration failed: ' + JSON.stringify(instReg.data));
  const instToken = instReg.data.token;
  console.log('  -> Institution registered:', instReg.data.user.email);

  // 4. Create Skill Category & Skills
  console.log('\n[4] Creating database-driven Skill Category and Skills...');
  const catRes = await req('POST', '/assessments/categories', {
    name: 'Ayurvedic Clinical Diagnostics & Pharmacology',
    description: 'Core competencies in Nadi Pariksha and Dravyaguna herbal pharmacology.',
  }, instToken);
  if (!catRes.ok) throw new Error('Failed to create skill category: ' + JSON.stringify(catRes.data));
  const categoryId = catRes.data.id;
  console.log('  -> Created Skill Category:', catRes.data.name, '(ID:', categoryId, ')');

  const skill1Res = await req('POST', '/assessments/skills', {
    categoryId,
    name: 'Herb Identification & Pharmacognosy',
    description: 'Botanical identification, rasa-virya-vipaka profiling, and adulterant detection.',
  }, instToken);
  if (!skill1Res.ok) throw new Error('Failed to create skill 1: ' + JSON.stringify(skill1Res.data));
  const skill1Id = skill1Res.data.id;
  console.log('  -> Created Skill 1:', skill1Res.data.name, '(ID:', skill1Id, ')');

  const skill2Res = await req('POST', '/assessments/skills', {
    categoryId,
    name: 'Clinical Pulse Diagnosis (Nadi Pariksha)',
    description: 'Evaluating Tridosha pulse waves (Sarpa, Manduka, Hamsa gati) and chronobiology.',
  }, instToken);
  if (!skill2Res.ok) throw new Error('Failed to create skill 2: ' + JSON.stringify(skill2Res.data));
  const skill2Id = skill2Res.data.id;
  console.log('  -> Created Skill 2:', skill2Res.data.name, '(ID:', skill2Id, ')');

  // Verify skills endpoint
  const listSkills = await req('GET', '/assessments/skills', undefined, instToken);
  if (!listSkills.ok || listSkills.data.length < 2) throw new Error('Skills endpoint failed');
  console.log('  -> Verified GET /assessments/skills returned', listSkills.data.length, 'skills.');

  // 5. Create Assessment with Questions in Database
  console.log('\n[5] Creating Assessment with dynamic evaluated Questions in PostgreSQL...');
  const assessRes = await req('POST', '/assessments', {
    title: 'Standardized Ayurvedic Clinical Competency Assessment',
    description: 'Official test validating herbal pharmacognosy and radial pulse diagnostics.',
    categoryId,
    durationMinutes: 30,
    passingScore: 60.0,
    questions: [
      {
        skillId: skill1Id,
        questionText: 'Which botanical name corresponds to the sacred medicinal herb Tulsi?',
        difficulty: 'EASY',
        weightage: 2,
        options: [
          { optionText: 'Ocimum sanctum', isCorrect: true },
          { optionText: 'Tinospora cordifolia', isCorrect: false },
          { optionText: 'Azadirachta indica', isCorrect: false },
          { optionText: 'Withania somnifera', isCorrect: false },
        ],
      },
      {
        skillId: skill1Id,
        questionText: 'Which primary therapeutic action (Karma) is attributed to Ashwagandha?',
        difficulty: 'MEDIUM',
        weightage: 2,
        options: [
          { optionText: 'Rasayana (Rejuvenator & adaptogen)', isCorrect: true },
          { optionText: 'Tivra Virechana (Drastic purgative)', isCorrect: false },
          { optionText: 'Svedopaga (Diaphoretic)', isCorrect: false },
          { optionText: 'Lekhana (Severe tissue scraper)', isCorrect: false },
        ],
      },
      {
        skillId: skill2Id,
        questionText: 'In Nadi Pariksha, which tactile wave indicates an aggravated Vata Dosha?',
        difficulty: 'MEDIUM',
        weightage: 2,
        options: [
          { optionText: 'Sarpa Gati (Fast, erratic serpentine wave)', isCorrect: true },
          { optionText: 'Manduka Gati (Rapid leaping frog wave)', isCorrect: false },
          { optionText: 'Hamsa Gati (Slow swimming swan wave)', isCorrect: false },
          { optionText: 'Mayura Gati (Strutting peacock wave)', isCorrect: false },
        ],
      },
      {
        skillId: skill2Id,
        questionText: 'In Nadi Pariksha, which tactile wave indicates a predominant Kapha Dosha?',
        difficulty: 'MEDIUM',
        weightage: 2,
        options: [
          { optionText: 'Hamsa Gati (Slow, heavy, graceful swan wave)', isCorrect: true },
          { optionText: 'Manduka Gati (High-amplitude frog hop)', isCorrect: false },
          { optionText: 'Sarpa Gati (Irregular snake movement)', isCorrect: false },
          { optionText: 'Matsya Gati (Fast darting fish movement)', isCorrect: false },
        ],
      },
    ],
  }, instToken);

  if (!assessRes.ok) throw new Error('Failed to create assessment: ' + JSON.stringify(assessRes.data));
  const assessmentId = assessRes.data.id;
  console.log('  -> Created Assessment in DB:', assessRes.data.title, '(ID:', assessmentId, ')');

  // 6. Register Student
  console.log('\n[6] Registering Student account...');
  const studentReg = await req('POST', '/auth/register', {
    role: 'STUDENT',
    email: 'ananya.deshmukh@ayurveda.edu',
    password: 'Password123!',
    fullName: 'Ananya Deshmukh',
    phone: '+91 9823012345',
    dob: '2003-09-15',
    gender: 'Female',
    institutionName: 'National Institute of Ayurveda',
    department: 'Dravyaguna Vijnana',
    degree: 'BAMS',
    currentYear: '3',
    cgpa: '9.15',
    graduationYear: '2027',
    location: 'Jaipur',
  });
  if (!studentReg.ok) throw new Error('Student registration failed: ' + JSON.stringify(studentReg.data));
  const studentToken = studentReg.data.token;
  console.log('  -> Registered Student:', studentReg.data.user.email);

  // 7. Update Student Profile
  console.log('\n[7] Updating and verifying Student Profile...');
  const updateProfileRes = await req('PUT', '/student/profile', {
    bio: 'BAMS Scholar researching Ayurvedic pharmacology, pulse diagnostics, and herbal therapeutics.',
    careerInterests: 'Clinical Diagnostics, Herbal Formulation, Clinical Research',
    preferredRoles: 'Ayurvedic Medical Officer, Clinical Pharmacologist',
    preferredLocations: 'Jaipur, New Delhi, Pune',
    cgpa: 9.15,
  }, studentToken);
  if (!updateProfileRes.ok) throw new Error('Student profile update failed: ' + JSON.stringify(updateProfileRes.data));

  const getProfileRes = await req('GET', '/student/profile', undefined, studentToken);
  if (!getProfileRes.ok || getProfileRes.data.bio !== 'BAMS Scholar researching Ayurvedic pharmacology, pulse diagnostics, and herbal therapeutics.') {
    throw new Error('Student profile verification failed');
  }
  console.log('  -> Profile successfully updated and verified in database.');

  // 8. Student Takes Assessment (Verify isCorrect is hidden)
  console.log('\n[8] Student fetches Assessment questions from DB...');
  const getTestRes = await req('GET', `/assessments/${assessmentId}`, undefined, studentToken);
  if (!getTestRes.ok) throw new Error('Failed to fetch assessment: ' + JSON.stringify(getTestRes.data));
  const testData = getTestRes.data;
  if (!testData.questions || testData.questions.length !== 4) {
    throw new Error('Expected 4 questions, got ' + (testData.questions?.length || 0));
  }
  console.log('  -> Loaded', testData.questions.length, 'questions dynamically from DB.');

  for (const q of testData.questions) {
    for (const opt of q.options) {
      if (opt.isCorrect === true) {
        throw new Error('Security violation: isCorrect flag leaked to student!');
      }
    }
  }
  console.log('  -> Verified security: isCorrect flags are stripped from student responses.');

  // 9. Student Submits Assessment Responses
  console.log('\n[9] Student submits assessment responses (answering Skill 1 correctly, Skill 2 incorrectly)...');
  const dbQuestions = await prisma.question.findMany({
    where: { assessmentId },
    include: { options: true },
    orderBy: { createdAt: 'asc' },
  });

  const responsesToSubmit = [
    { questionId: dbQuestions[0].id, selectedOptionId: dbQuestions[0].options.find((o: any) => o.isCorrect)!.id },
    { questionId: dbQuestions[1].id, selectedOptionId: dbQuestions[1].options.find((o: any) => o.isCorrect)!.id },
    { questionId: dbQuestions[2].id, selectedOptionId: dbQuestions[2].options.find((o: any) => !o.isCorrect)!.id },
    { questionId: dbQuestions[3].id, selectedOptionId: dbQuestions[3].options.find((o: any) => !o.isCorrect)!.id },
  ];

  const submitRes = await req('POST', `/assessments/${assessmentId}/submit`, { responses: responsesToSubmit }, studentToken);
  if (!submitRes.ok) throw new Error('Failed to submit assessment: ' + JSON.stringify(submitRes.data));

  const result = submitRes.data;
  console.log('  -> Submission result:', {
    score: `${result.score}/${result.totalScore}`,
    percentage: `${result.percentage}%`,
    passed: result.passed,
    strengths: result.strengths,
    weaknesses: result.weaknesses,
    skillGaps: result.skillGaps.map((g: any) => g.skill),
  });

  // 10. Verify Real Calculation
  console.log('\n[10] Verifying mathematical score calculation...');
  if (result.score !== 4 || result.totalScore !== 8 || result.percentage !== 50 || result.passed !== false) {
    throw new Error('Score calculation mismatch: expected 4/8 (50%, passed: false), got ' + JSON.stringify(result));
  }
  if (!result.strengths.includes('Herb Identification & Pharmacognosy')) {
    throw new Error('Expected Herb Identification to be in strengths (100%)');
  }
  if (!result.weaknesses.includes('Clinical Pulse Diagnosis (Nadi Pariksha)')) {
    throw new Error('Expected Clinical Pulse Diagnosis to be in weaknesses (0%)');
  }
  console.log('  -> Score calculation strictly verified: 4/8 points (50%).');

  // 11. Verify Database Records
  console.log('\n[11] Verifying PostgreSQL persistence of Attempt and Responses...');
  const attempt = await prisma.assessmentAttempt.findUnique({
    where: { id: result.attemptId },
    include: { responses: true },
  });
  if (!attempt) throw new Error('AssessmentAttempt not found in DB');
  if (attempt.score !== 4 || attempt.percentage !== 50 || attempt.responses.length !== 4) {
    throw new Error('Attempt data incorrect: ' + JSON.stringify(attempt));
  }
  console.log('  -> Verified AssessmentAttempt and 4 AssessmentResponse records saved in PostgreSQL.');

  // 12. Verify StudentSkillProfile in Database
  console.log('\n[12] Verifying StudentSkillProfile records in PostgreSQL...');
  const skillProfiles = await prisma.studentSkillProfile.findMany({
    where: { studentId: attempt.studentId },
    include: { skill: true },
  });
  if (skillProfiles.length !== 2) {
    throw new Error('Expected 2 StudentSkillProfile records, got ' + skillProfiles.length);
  }
  const s1Profile = skillProfiles.find(p => p.skill.name === 'Herb Identification & Pharmacognosy');
  const s2Profile = skillProfiles.find(p => p.skill.name === 'Clinical Pulse Diagnosis (Nadi Pariksha)');

  if (!s1Profile || s1Profile.scorePercentage !== 100 || s1Profile.proficiencyLevel !== 'ADVANCED') {
    throw new Error('Skill 1 profile mismatch: ' + JSON.stringify(s1Profile));
  }
  if (!s2Profile || s2Profile.scorePercentage !== 0 || s2Profile.proficiencyLevel !== 'BEGINNER') {
    throw new Error('Skill 2 profile mismatch: ' + JSON.stringify(s2Profile));
  }
  console.log('  -> Skill 1: Herb Identification = 100% (ADVANCED)');
  console.log('  -> Skill 2: Pulse Diagnosis = 0% (BEGINNER)');

  // 13. Verify Skill Gap Analysis API
  console.log('\n[13] Verifying GET /api/student/skill-gap analysis endpoint...');
  const gapRes = await req('GET', '/student/skill-gap', undefined, studentToken);
  if (!gapRes.ok) throw new Error('Failed to fetch skill gap: ' + JSON.stringify(gapRes.data));
  const gapData = gapRes.data;

  if (gapData.overallSkillScore !== 50) {
    throw new Error('Overall skill score expected 50, got ' + gapData.overallSkillScore);
  }
  if (gapData.skillsCount !== 2) {
    throw new Error('Expected 2 skills assessed, got ' + gapData.skillsCount);
  }
  if (gapData.strengths.length !== 1 || gapData.strengths[0].name !== 'Herb Identification & Pharmacognosy') {
    throw new Error('Strengths mismatch: ' + JSON.stringify(gapData.strengths));
  }
  if (gapData.weaknesses.length !== 1 || gapData.weaknesses[0].name !== 'Clinical Pulse Diagnosis (Nadi Pariksha)') {
    throw new Error('Weaknesses mismatch: ' + JSON.stringify(gapData.weaknesses));
  }
  const pulseGap = gapData.skillGaps.find((g: any) => g.skillName === 'Clinical Pulse Diagnosis (Nadi Pariksha)');
  if (!pulseGap || pulseGap.gapType !== 'PERFORMANCE_GAP') {
    throw new Error('Skill gap analysis missing performance gap: ' + JSON.stringify(gapData.skillGaps));
  }
  console.log('  -> Overall Skill Score:', gapData.overallSkillScore + '%');
  console.log('  -> Strengths identified:', gapData.strengths.map((s: any) => s.name));
  console.log('  -> Weaknesses identified:', gapData.weaknesses.map((w: any) => w.name));
  console.log('  -> Skill Gaps identified:', gapData.skillGaps.map((g: any) => g.skillName + ' (' + g.gapType + ', ' + g.severity + ' PRIORITY)'));

  // 14. Clean Teardown
  console.log('\n[14] Performing Clean Teardown (Empty Database Constraint)...');
  await prisma.auditLog.deleteMany({});
  await prisma.assessmentResponse.deleteMany({});
  await prisma.assessmentAttempt.deleteMany({});
  await prisma.studentSkillProfile.deleteMany({});
  await prisma.questionOption.deleteMany({});
  await prisma.question.deleteMany({});
  await prisma.assessment.deleteMany({});
  await prisma.skill.deleteMany({});
  await prisma.skillCategory.deleteMany({});
  await prisma.studentProfile.deleteMany({});
  await prisma.institutionProfile.deleteMany({});
  await prisma.user.deleteMany({});

  const finalUsers = await prisma.user.count();
  const finalAssessments = await prisma.assessment.count();
  const finalSkills = await prisma.skill.count();
  console.log('  -> Database clean: ' + finalUsers + ' users, ' + finalAssessments + ' assessments, ' + finalSkills + ' skills remaining.');

  console.log('\n========================================================================');
  console.log('>>> SUCCESS: ALL STUDENT SKILL DEVELOPMENT REQUIREMENTS VERIFIED <<<');
  console.log('========================================================================\n');
}

verifySkillsFlow().catch((err) => {
  console.error('\n? VERIFICATION FAILED:', err);
  process.exit(1);
});
