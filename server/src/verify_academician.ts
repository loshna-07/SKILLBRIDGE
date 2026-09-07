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

async function verifyAcademicianPortal() {
  console.log('========================================================================');
  console.log('>>> VERIFYING ACADEMICIAN PORTAL: ALL 9 MODULES & WORKFLOWS <<<');
  console.log('========================================================================\n');

  // 1. Health check
  console.log('[1] Checking backend health endpoint...');
  const health = await req('GET', '/health');
  if (!health.ok) throw new Error('Backend health check failed');
  console.log('  -> Health status: OK');

  // 2. Ensure initial clean state
  console.log('\n[2] Ensuring database starts 100% clean and empty...');
  await prisma.auditLog.deleteMany({});
  await prisma.collaborationApplication.deleteMany({});
  await prisma.collaboration.deleteMany({});
  await prisma.interview.deleteMany({});
  await prisma.applicationStatusHistory.deleteMany({});
  await prisma.application.deleteMany({});
  await prisma.opportunitySkill.deleteMany({});
  await prisma.opportunity.deleteMany({});
  await prisma.learningEnrollment.deleteMany({});
  await prisma.learningProgramSkill.deleteMany({});
  await prisma.learningProgram.deleteMany({});
  await prisma.assessmentResponse.deleteMany({});
  await prisma.assessmentAttempt.deleteMany({});
  await prisma.studentSkillProfile.deleteMany({});
  await prisma.questionOption.deleteMany({});
  await prisma.question.deleteMany({});
  await prisma.assessment.deleteMany({});
  await prisma.skill.deleteMany({});
  await prisma.skillCategory.deleteMany({});
  await prisma.studentEducation.deleteMany({});
  await prisma.studentCertification.deleteMany({});
  await prisma.studentProject.deleteMany({});
  await prisma.studentInternshipExperience.deleteMany({});
  await prisma.studentProfile.deleteMany({});
  await prisma.academicianProfile.deleteMany({});
  await prisma.industryProfile.deleteMany({});
  await prisma.institutionProfile.deleteMany({});
  await prisma.user.deleteMany({});

  const initialUserCount = await prisma.user.count();
  const initialCollabCount = await prisma.collaboration.count();
  const initialCollabAppCount = await prisma.collaborationApplication.count();
  console.log(`  -> Initial Users: ${initialUserCount}, Collaborations: ${initialCollabCount}, Applications: ${initialCollabAppCount}`);
  if (initialUserCount !== 0 || initialCollabCount !== 0 || initialCollabAppCount !== 0) {
    throw new Error('Database is not empty at start!');
  }

  // 3. Register 3 users: Academician, Industry, Institution
  console.log('\n[3] Registering 3 roles: Academician, Industry, Institution...');

  // Academician
  const acadReg = await req('POST', '/auth/register', {
    name: 'Dr. Anand Sharma',
    fullName: 'Dr. Anand Sharma',
    email: 'dr.sharma@ayurveda.edu',
    password: 'Password123!',
    role: 'ACADEMICIAN',
    phone: '+91 9876543210',
    institutionName: 'National Institute of Ayurveda',
    department: 'Dravyaguna Vijnana (Phytopharmacology)',
    designation: 'Associate Professor',
    yearsOfExperience: 12,
    areasOfExpertise: 'Herbal Standardization, Chromatography, Phytochemistry',
    location: 'Jaipur, Rajasthan',
  });
  if (!acadReg.ok) throw new Error(`Academician registration failed: ${JSON.stringify(acadReg.data)}`);
  const acadToken = acadReg.data.token;
  console.log('  -> Academician registered successfully: Dr. Anand Sharma');

  // Industry
  const indReg = await req('POST', '/auth/register', {
    name: 'Dabur R&D Director',
    email: 'rnd.director@dabur.com',
    password: 'Password123!',
    role: 'INDUSTRY',
    companyName: 'Dabur India Research & Development',
    officialEmail: 'rnd.director@dabur.com',
    industrySector: 'Ayurvedic Pharmaceuticals & R&D',
    companySize: '5000+ Employees',
    location: 'Ghaziabad, NCR',
    description: 'Pioneering evidence-based Ayurvedic medicine and phytochemistry research.',
  });
  if (!indReg.ok) throw new Error(`Industry registration failed: ${JSON.stringify(indReg.data)}`);
  const indToken = indReg.data.token;
  console.log('  -> Industry registered successfully: Dabur R&D Director');

  // Institution
  const instReg = await req('POST', '/auth/register', {
    name: 'All India Institute of Ayurveda',
    email: 'dean.collaboration@aiia.gov.in',
    password: 'Password123!',
    role: 'INSTITUTION',
    institutionName: 'All India Institute of Ayurveda (AIIA)',
    officialEmail: 'dean.collaboration@aiia.gov.in',
    institutionType: 'Apex Autonomous Institute',
    address: 'Sarita Vihar, New Delhi',
  });
  if (!instReg.ok) throw new Error(`Institution registration failed: ${JSON.stringify(instReg.data)}`);
  const instToken = instReg.data.token;
  console.log('  -> Institution registered successfully: AIIA Dean');

  // 4. Create Opportunities across all 9 required modules
  console.log('\n[4] Creating opportunities for all 9 required modules...');

  const modulesToCreate = [
    {
      token: indToken,
      body: {
        title: 'Summer Faculty Immersion in Ayurvedic Phytochemistry',
        type: 'FACULTY_INTERNSHIP',
        description: 'Spend an 8-week sabbatical at Dabur Central R&D facility researching standardized chromatographic fractions.',
        targetAudience: 'Dravyaguna and Rasashastra Faculty',
        location: 'Ghaziabad R&D Center',
        mode: 'OFFLINE',
        duration: '8 Weeks',
        remunerationOrStipend: 'INR 60,000 / month',
        eligibilityCriteria: 'PhD or MD in Ayurveda with minimum 5 years teaching/research experience.',
      },
    },
    {
      token: indToken,
      body: {
        title: 'Hands-on HPLC & Mass Spectrometry Training for Faculty',
        type: 'INDUSTRIAL_TRAINING',
        description: 'Advanced industrial instrumentation training for academic faculty in modern analytical techniques.',
        targetAudience: 'Pharmacy and Ayurveda Faculty',
        location: 'Dabur Analytical Lab',
        mode: 'HYBRID',
        duration: '3 Weeks',
        remunerationOrStipend: 'Full Sponsorship + Lodging',
        eligibilityCriteria: 'Faculty involved in postgraduate research labs.',
      },
    },
    {
      token: instToken,
      body: {
        title: 'National FDP on Evidence-Based Herbal Standardization',
        type: 'FDP',
        description: 'Ministry-sponsored Faculty Development Program covering WHO guidelines for herbal drug validation.',
        targetAudience: 'All Ayurveda Academicians',
        location: 'AIIA Campus, New Delhi',
        mode: 'HYBRID',
        duration: '2 Weeks',
        remunerationOrStipend: 'Certificate + TA/DA',
        eligibilityCriteria: 'Recognized university faculty.',
      },
    },
    {
      token: acadToken,
      body: {
        title: 'Formulation Stability Testing & Toxicological Profiling Consultancy',
        type: 'CONSULTANCY',
        description: 'Offering specialized consultancy to pharmaceutical manufacturers on shelf-life acceleration studies.',
        targetAudience: 'Ayurvedic Drug Manufacturers',
        location: 'Jaipur, Rajasthan',
        mode: 'ONLINE',
        duration: 'Ongoing / Milestone based',
        remunerationOrStipend: 'Consultancy Retainer: INR 1.5 Lakhs / formulation',
        eligibilityCriteria: 'Open to licensed GMP manufacturing units.',
      },
    },
    {
      token: acadToken,
      body: {
        title: 'Clinical Trial Collaboration for Polyherbal Anti-Diabetic Formulations',
        type: 'RESEARCH',
        description: 'Academic team seeking industry co-sponsor for randomized double-blind clinical trial of Nishamalaki compound.',
        targetAudience: 'Pharmaceutical R&D & Clinical Research Organizations',
        location: 'Jaipur & Partner Sites',
        mode: 'HYBRID',
        duration: '12 Months',
        remunerationOrStipend: 'Joint Grant Application (INR 25 Lakhs)',
        eligibilityCriteria: 'Partners with ethical clearance and R&D infrastructure.',
      },
    },
    {
      token: indToken,
      body: {
        title: 'Good Agricultural and Collection Practices (GACP) Workshop',
        type: 'WORKSHOP',
        description: 'Interactive workshop on geo-tagging and sustainable harvesting of endangered Himalayan medicinal flora.',
        targetAudience: 'Botany and Pharmacognosy Faculty',
        location: 'Rishikesh Field Station',
        mode: 'OFFLINE',
        duration: '4 Days',
        remunerationOrStipend: 'Certificate of Competence',
        eligibilityCriteria: 'Faculty and doctoral research supervisors.',
      },
    },
    {
      token: instToken,
      body: {
        title: 'Distinguished Lecture Series on Charaka Samhita Therapeutics',
        type: 'GUEST_LECTURE',
        description: 'Inviting senior academicians for delivered keynote guest lectures to post-graduate scholars.',
        targetAudience: 'Senior Ayurvedic Scholars & Practitioners',
        location: 'Virtual Classroom',
        mode: 'ONLINE',
        duration: '3 Sessions (2 hrs each)',
        remunerationOrStipend: 'Honorarium: INR 10,000 / session',
        eligibilityCriteria: 'Professor or HOD with published commentaries.',
      },
    },
    {
      token: indToken,
      body: {
        title: 'Industry Mentorship for Faculty Commercialization Projects',
        type: 'MENTORSHIP',
        description: 'Pairing faculty innovators with senior corporate R&D leaders to guide technology transfer and patent licensing.',
        targetAudience: 'Faculty Patent Holders & Innovators',
        location: 'Remote',
        mode: 'ONLINE',
        duration: '6 Months (Bi-weekly sessions)',
        remunerationOrStipend: 'Pro-bono Corporate Mentorship',
        eligibilityCriteria: 'Faculty with patent filed or granted.',
      },
    },
    {
      token: indToken,
      body: {
        title: 'AI-Driven Herb Identification Model Live Industry Project',
        type: 'LIVE_PROJECT',
        description: 'Collaborative project between Dabur AI Lab and University faculty to build computer vision model for dry herb raw material inspection.',
        targetAudience: 'Interdisciplinary Faculty (Ayurveda + Computer Science)',
        location: 'Hybrid',
        mode: 'HYBRID',
        duration: '6 Months',
        remunerationOrStipend: 'INR 1.8 Lakhs Faculty Project Grant',
        eligibilityCriteria: 'Knowledge of Ayurvedic raw drugs and computer vision workflows.',
      },
    },
  ];

  const createdOpportunities: any[] = [];

  for (const mod of modulesToCreate) {
    const res = await req('POST', '/academician/opportunities', mod.body, mod.token);
    if (!res.ok) {
      throw new Error(`Failed to create ${mod.body.type}: ${JSON.stringify(res.data)}`);
    }
    createdOpportunities.push(res.data.opportunity);
    console.log(`  -> Created [${mod.body.type}]: "${mod.body.title}" (ID: ${res.data.opportunity.id})`);
  }

  // 5. Academician Browses, Searches, and Filters Opportunities
  console.log('\n[5] Testing Browse, Search, and Filtering capabilities...');

  // 5a. Browse all opportunities
  const allOpps = await req('GET', '/academician/opportunities', undefined, acadToken);
  if (!allOpps.ok || allOpps.data.length !== 9) {
    throw new Error(`Expected 9 opportunities, got ${allOpps.data?.length}`);
  }
  console.log(`  -> Browse all: Found ${allOpps.data.length} opportunities across all 9 modules.`);

  // 5b. Filter by module type
  const fdpOpps = await req('GET', '/academician/opportunities?type=FDP', undefined, acadToken);
  if (!fdpOpps.ok || fdpOpps.data.length !== 1 || fdpOpps.data[0].type !== 'FDP') {
    throw new Error(`FDP filter failed: ${JSON.stringify(fdpOpps.data)}`);
  }
  console.log(`  -> Filter by Type=FDP: Correctly returned 1 opportunity ("${fdpOpps.data[0].title}")`);

  // 5c. Filter by mode
  const hybridOpps = await req('GET', '/academician/opportunities?mode=HYBRID', undefined, acadToken);
  if (!hybridOpps.ok || hybridOpps.data.length < 1) {
    throw new Error(`Mode filter failed: ${JSON.stringify(hybridOpps.data)}`);
  }
  console.log(`  -> Filter by Mode=HYBRID: Found ${hybridOpps.data.length} hybrid opportunities.`);

  // 5d. Search by keyword
  const searchRes = await req('GET', '/academician/opportunities?search=Phytochemistry', undefined, acadToken);
  if (!searchRes.ok || searchRes.data.length < 1) {
    throw new Error(`Search failed: ${JSON.stringify(searchRes.data)}`);
  }
  console.log(`  -> Keyword Search "Phytochemistry": Found ${searchRes.data.length} matching opportunities.`);

  // 6. Academician Applies / Registers for Opportunities
  console.log('\n[6] Testing Academician Application and Registration flow...');

  const facultyInternship = createdOpportunities.find((o) => o.type === 'FACULTY_INTERNSHIP');
  const fdpOpportunity = createdOpportunities.find((o) => o.type === 'FDP');

  // Apply to Faculty Internship
  const applyInternship = await req(
    'POST',
    `/academician/opportunities/${facultyInternship.id}/apply`,
    {
      proposal:
        'I have 12 years of research experience in TLC/HPTLC fingerprinting of Ayurvedic herbs. I aim to utilize this sabbatical to standardize volatile markers in Dashamoola raw materials.',
    },
    acadToken
  );
  if (!applyInternship.ok) {
    throw new Error(`Application to internship failed: ${JSON.stringify(applyInternship.data)}`);
  }
  console.log('  -> Applied to Faculty Internship successfully with proposal.');

  // Apply to FDP
  const applyFdp = await req(
    'POST',
    `/academician/opportunities/${fdpOpportunity.id}/apply`,
    {
      proposal: 'Seeking to incorporate modern spectroscopic methodologies into our university PG curriculum.',
    },
    acadToken
  );
  if (!applyFdp.ok) {
    throw new Error(`Application to FDP failed: ${JSON.stringify(applyFdp.data)}`);
  }
  console.log('  -> Registered for National FDP successfully.');

  // Verify duplicate application prevention
  console.log('\n[7] Verifying duplicate application prevention...');
  const duplicateApply = await req(
    'POST',
    `/academician/opportunities/${facultyInternship.id}/apply`,
    { proposal: 'Duplicate attempt' },
    acadToken
  );
  if (duplicateApply.status !== 400) {
    throw new Error(`Expected 400 Bad Request on duplicate apply, got ${duplicateApply.status}`);
  }
  console.log(`  -> Correctly rejected duplicate application with message: "${duplicateApply.data.message}"`);

  // 8. Track Participations
  console.log('\n[8] Verifying Academician Participation Tracking...');
  const participations = await req('GET', '/academician/participations', undefined, acadToken);
  if (!participations.ok || participations.data.length !== 2) {
    throw new Error(`Expected 2 participations, got ${participations.data?.length}`);
  }
  console.log(`  -> Retrieved ${participations.data.length} active participations with live initiator info and status.`);

  // 9. Dashboard verification
  console.log('\n[9] Verifying Academician Dashboard Aggregations...');
  const dashboard = await req('GET', '/academician/dashboard', undefined, acadToken);
  if (!dashboard.ok) throw new Error(`Dashboard failed: ${JSON.stringify(dashboard.data)}`);
  const stats = dashboard.data.stats;
  console.log('  -> Dashboard Live Stats:');
  console.log(`     Total Opportunities: ${stats.totalOpportunities}`);
  console.log(`     My Participations: ${stats.myParticipationsCount}`);
  console.log(`     Faculty Internships: ${stats.facultyInternships}`);
  console.log(`     Industrial Training: ${stats.industrialTraining}`);
  console.log(`     FDPs: ${stats.fdpCount}`);
  console.log(`     Consultancies: ${stats.consultancyCount}`);
  console.log(`     Research Collabs: ${stats.researchCount}`);
  console.log(`     Workshops: ${stats.workshopCount}`);
  console.log(`     Guest Lectures: ${stats.guestLectureCount}`);
  console.log(`     Mentorship: ${stats.mentorshipCount}`);
  console.log(`     Live Projects: ${stats.liveProjectCount}`);

  if (stats.totalOpportunities !== 9 || stats.myParticipationsCount !== 2) {
    throw new Error('Dashboard stats do not match expected database records');
  }

  // 10. Industry Screens Applicants & Updates Status
  console.log('\n[10] Verifying Recruiter / Partner Applicant Screening & Status Management...');
  const applicantsRes = await req(
    'GET',
    `/academician/opportunities/${facultyInternship.id}/applicants`,
    undefined,
    indToken
  );
  if (!applicantsRes.ok || !Array.isArray(applicantsRes.data) || applicantsRes.data.length !== 1) {
    throw new Error(`Expected 1 applicant, got status ${applicantsRes.status}: ${JSON.stringify(applicantsRes.data)}`);
  }
  const applicantRecord = applicantsRes.data[0];
  console.log(`  -> Partner found applicant: ${applicantRecord.academician.fullName} (Status: ${applicantRecord.status})`);

  // Update status to ACCEPTED
  const updateStatusRes = await req(
    'PUT',
    `/academician/applications/${applicantRecord.id}/status`,
    { status: 'ACCEPTED' },
    indToken
  );
  if (!updateStatusRes.ok) {
    throw new Error(`Update status failed: ${JSON.stringify(updateStatusRes.data)}`);
  }
  console.log(`  -> Partner updated applicant status to ACCEPTED.`);

  // Verify status is reflected in academician's participations
  const updatedParticipations = await req('GET', '/academician/participations', undefined, acadToken);
  const acceptedPart = updatedParticipations.data.find((p: any) => p.collaborationId === facultyInternship.id);
  if (acceptedPart?.status !== 'ACCEPTED') {
    throw new Error(`Expected status ACCEPTED, found: ${acceptedPart?.status}`);
  }
  console.log(`  -> Academician sees updated status: "${acceptedPart.status}" for Faculty Internship.`);

  // 11. Academician Withdraws Application
  console.log('\n[11] Testing Application Withdrawal...');
  const withdrawRes = await req(
    'POST',
    `/academician/participations/${fdpOpportunity.id}/withdraw`,
    undefined,
    acadToken
  );
  if (!withdrawRes.ok) {
    throw new Error(`Withdraw failed: ${JSON.stringify(withdrawRes.data)}`);
  }
  console.log(`  -> Application for FDP withdrawn successfully.`);

  const postWithdrawParticipations = await req('GET', '/academician/participations', undefined, acadToken);
  const withdrawnPart = postWithdrawParticipations.data.find((p: any) => p.collaborationId === fdpOpportunity.id);
  if (withdrawnPart?.status !== 'WITHDRAWN') {
    throw new Error(`Expected status WITHDRAWN, found: ${withdrawnPart?.status}`);
  }
  console.log(`  -> Academician confirmed status is now WITHDRAWN.`);

  // 12. Creator Updates and Deletes Opportunity
  console.log('\n[12] Testing Opportunity Edit and Delete operations...');
  const consultancyOpp = createdOpportunities.find((o) => o.type === 'CONSULTANCY');

  // Edit Opportunity
  const editRes = await req(
    'PUT',
    `/academician/opportunities/${consultancyOpp.id}`,
    {
      description: 'Updated description: Specialized accelerated shelf-life studies and pesticide residue analysis.',
      budget: 'INR 2.0 Lakhs / formulation',
    },
    acadToken
  );
  if (!editRes.ok) {
    throw new Error(`Opportunity edit failed: ${JSON.stringify(editRes.data)}`);
  }
  console.log('  -> Opportunity updated successfully by creator.');

  // Delete Opportunity
  const deleteRes = await req(
    'DELETE',
    `/academician/opportunities/${consultancyOpp.id}`,
    undefined,
    acadToken
  );
  if (!deleteRes.ok) {
    throw new Error(`Opportunity deletion failed: ${JSON.stringify(deleteRes.data)}`);
  }
  console.log('  -> Opportunity deleted successfully by creator.');

  // Verify count is now 8
  const remainingOpps = await req('GET', '/academician/opportunities', undefined, acadToken);
  if (remainingOpps.data.length !== 8) {
    throw new Error(`Expected 8 remaining opportunities, got ${remainingOpps.data.length}`);
  }
  console.log(`  -> Verified remaining opportunities count: ${remainingOpps.data.length}.`);

  // 13. Audit Log verification
  console.log('\n[13] Verifying Audit Logs for compliance...');
  const logs = await prisma.auditLog.findMany({
    where: {
      action: {
        in: [
          'CREATE_ACADEMICIAN_OPPORTUNITY',
          'APPLY_ACADEMICIAN_OPPORTUNITY',
          'UPDATE_ACADEMICIAN_APPLICATION_STATUS',
          'DELETE_ACADEMICIAN_OPPORTUNITY',
        ],
      },
    },
  });
  console.log(`  -> Total relevant audit log records created: ${logs.length}`);
  if (logs.length < 4) {
    throw new Error('Audit logs missing for actions!');
  }

  // 14. Teardown & Clean Database
  console.log('\n[14] Teardown: Purging all test records to leave database 100% clean and empty...');
  await prisma.auditLog.deleteMany({});
  await prisma.collaborationApplication.deleteMany({});
  await prisma.collaboration.deleteMany({});
  await prisma.interview.deleteMany({});
  await prisma.applicationStatusHistory.deleteMany({});
  await prisma.application.deleteMany({});
  await prisma.opportunitySkill.deleteMany({});
  await prisma.opportunity.deleteMany({});
  await prisma.learningEnrollment.deleteMany({});
  await prisma.learningProgramSkill.deleteMany({});
  await prisma.learningProgram.deleteMany({});
  await prisma.assessmentResponse.deleteMany({});
  await prisma.assessmentAttempt.deleteMany({});
  await prisma.studentSkillProfile.deleteMany({});
  await prisma.questionOption.deleteMany({});
  await prisma.question.deleteMany({});
  await prisma.assessment.deleteMany({});
  await prisma.skill.deleteMany({});
  await prisma.skillCategory.deleteMany({});
  await prisma.studentEducation.deleteMany({});
  await prisma.studentCertification.deleteMany({});
  await prisma.studentProject.deleteMany({});
  await prisma.studentInternshipExperience.deleteMany({});
  await prisma.studentProfile.deleteMany({});
  await prisma.academicianProfile.deleteMany({});
  await prisma.industryProfile.deleteMany({});
  await prisma.institutionProfile.deleteMany({});
  await prisma.user.deleteMany({});

  const finalUsers = await prisma.user.count();
  const finalCollabs = await prisma.collaboration.count();
  const finalApps = await prisma.collaborationApplication.count();
  console.log(`  -> Final Database State: Users = ${finalUsers}, Collaborations = ${finalCollabs}, Applications = ${finalApps}`);
  if (finalUsers !== 0 || finalCollabs !== 0 || finalApps !== 0) {
    throw new Error('Database is NOT empty after teardown!');
  }

  console.log('\n========================================================================');
  console.log('>>> ACADEMICIAN PORTAL VERIFICATION COMPLETED SUCCESSFULLY (14/14) <<<');
  console.log('========================================================================\n');
}

verifyAcademicianPortal()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('\n❌ Academician Portal Verification Failed:', err);
    process.exit(1);
  });
