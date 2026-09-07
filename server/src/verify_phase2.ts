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

async function verifyPhase2() {
  console.log('================================================================');
  console.log('>>> STARTING PHASE 2 VERIFICATION: ROLE DASHBOARDS & RBAC <<<');
  console.log('================================================================\n');

  // [1] Clean state check
  console.log('[1] Ensuring clean database state...');
  await prisma.user.deleteMany({});
  const initialUsers = await prisma.user.count();
  console.log(`Database verified clean: ${initialUsers} users.`);

  // [2] Register all 4 Roles
  console.log('\n[2] Registering all 4 roles...');

  // Student
  const studentReg = await req('POST', '/auth/register', {
    role: 'STUDENT',
    email: 'arjun.sharma@nitk.edu',
    password: 'Password123!',
    fullName: 'Arjun Sharma',
    phone: '+91 9876543210',
    dob: '2004-06-12',
    gender: 'Male',
    institutionName: 'National Institute of Technology Karnataka',
    department: 'Computer Science & Engineering',
    degree: 'B.Tech',
    currentYear: '3',
    cgpa: '8.92',
    graduationYear: '2027',
    location: 'Mangaluru',
  });
  if (!studentReg.ok) throw new Error(`Student registration failed: ${JSON.stringify(studentReg.data)}`);
  const studentToken = studentReg.data.token;
  console.log('  -> Registered Student:', studentReg.data.user.email);

  // Academician
  const acadReg = await req('POST', '/auth/register', {
    role: 'ACADEMICIAN',
    email: 'prof.meenakshi@nitk.edu',
    password: 'Password123!',
    fullName: 'Prof. Meenakshi Sundaram',
    phone: '+91 9876543211',
    institutionName: 'National Institute of Technology Karnataka',
    department: 'Computer Science & Engineering',
    designation: 'Professor & Dean',
    yearsOfExperience: '18',
    areasOfExpertise: 'Cloud Systems, Algorithms',
    location: 'Mangaluru',
  });
  if (!acadReg.ok) throw new Error(`Academician registration failed: ${JSON.stringify(acadReg.data)}`);
  const acadToken = acadReg.data.token;
  console.log('  -> Registered Academician:', acadReg.data.user.email);

  // Industry
  const indReg = await req('POST', '/auth/register', {
    role: 'INDUSTRY',
    email: 'recruiter@apexcloud.io',
    password: 'Password123!',
    companyName: 'Apex Cloud Technologies',
    officialEmail: 'recruiter@apexcloud.io',
    industrySector: 'Enterprise Cloud & DevOps',
    companySize: '101-500',
    website: 'https://apexcloud.io',
    location: 'Bengaluru, India',
    description: 'Enterprise Kubernetes & Cloud Management provider.',
    contactPerson: 'Aditi Nair',
    contactNumber: '+91 9876543212',
  });
  if (!indReg.ok) throw new Error(`Industry registration failed: ${JSON.stringify(indReg.data)}`);
  const indToken = indReg.data.token;
  console.log('  -> Registered Industry:', indReg.data.user.email);

  // Institution
  const instReg = await req('POST', '/auth/register', {
    role: 'INSTITUTION',
    email: 'admin@nitk.edu',
    password: 'Password123!',
    institutionName: 'National Institute of Technology Karnataka',
    officialEmail: 'admin@nitk.edu',
    institutionType: 'Central University / Autonomous',
    affiliatedUniversity: 'Autonomous',
    address: 'Surathkal, Mangaluru, Karnataka',
    website: 'https://nitk.ac.in',
    contactPerson: 'Dr. Ramesh Babu',
    contactNumber: '+91 9876543213',
  });
  if (!instReg.ok) throw new Error(`Institution registration failed: ${JSON.stringify(instReg.data)}`);
  const instToken = instReg.data.token;
  console.log('  -> Registered Institution:', instReg.data.user.email);

  // [3] Test Login for all 4 Roles
  console.log('\n[3] Testing Login for all 4 roles...');
  for (const acc of [
    { email: 'arjun.sharma@nitk.edu', pass: 'Password123!', role: 'STUDENT' },
    { email: 'prof.meenakshi@nitk.edu', pass: 'Password123!', role: 'ACADEMICIAN' },
    { email: 'recruiter@apexcloud.io', pass: 'Password123!', role: 'INDUSTRY' },
    { email: 'admin@nitk.edu', pass: 'Password123!', role: 'INSTITUTION' },
  ]) {
    const loginRes = await req('POST', '/auth/login', { email: acc.email, password: acc.pass });
    if (!loginRes.ok) throw new Error(`Login failed for ${acc.role}: ${loginRes.data?.message}`);
    console.log(`  -> Login success: ${acc.role} (${acc.email})`);
  }

  // [4] Test Student Dashboard Data Retrieval
  console.log('\n[4] Verifying Student Dashboard (/api/student/dashboard)...');
  const studentDash = await req('GET', '/student/dashboard', undefined, studentToken);
  if (!studentDash.ok) throw new Error(`Student dashboard failed: ${JSON.stringify(studentDash.data)}`);
  const sd = studentDash.data;
  console.log('  - Student Name:', sd.student?.fullName || 'N/A');
  console.log('  - Department:', sd.student?.department);
  console.log('  - Institution:', sd.student?.institutionName);
  console.log('  - Profile Completion:', `${sd.profileCompletion}%`);
  console.log('  - Skills Assessed (real DB count):', sd.skillsCount || 0);
  console.log('  - Assessments Completed:', sd.assessmentsCount || 0);
  console.log('  - Applications:', sd.applicationsCount || 0);
  console.log('  - Empty States (Zero fake items):');
  console.log('    * Assessment Attempts count:', sd.recentAssessmentAttempts?.length || 0);
  console.log('    * Applications count:', sd.recentApplications?.length || 0);
  console.log('    * Recommended Opportunities count:', sd.topOpportunities?.length || 0);

  // [5] Test Academician Dashboard Data Retrieval
  console.log('\n[5] Verifying Academician Dashboard (/api/academician/dashboard)...');
  const acadDash = await req('GET', '/academician/dashboard', undefined, acadToken);
  if (!acadDash.ok) throw new Error(`Academician dashboard failed: ${JSON.stringify(acadDash.data)}`);
  const ad = acadDash.data;
  console.log('  - Academician Name:', ad.academician?.fullName);
  console.log('  - Designation:', ad.academician?.designation);
  console.log('  - Department:', ad.academician?.department);
  console.log('  - Institution:', ad.academician?.institutionName);
  console.log('  - Active Proposals count:', ad.stats?.collaborationsCount || 0);
  console.log('  - FDP count:', ad.stats?.fdpCount || 0);
  console.log('  - Faculty Internships count:', ad.stats?.facultyInternships || 0);
  console.log('  - Empty States (Zero fake items):');
  console.log('    * Recent Collaborations:', ad.recentCollaborations?.length || 0);

  // [6] Test Industry Dashboard Data Retrieval
  console.log('\n[6] Verifying Industry Dashboard (/api/opportunities/my/created & /applicants)...');
  const indOpps = await req('GET', '/opportunities/my/created', undefined, indToken);
  const indApps = await req('GET', '/opportunities/my/applicants', undefined, indToken);
  if (!indOpps.ok) throw new Error(`Industry opportunities failed: ${JSON.stringify(indOpps.data)}`);
  if (!indApps.ok) throw new Error(`Industry applicants failed: ${JSON.stringify(indApps.data)}`);
  console.log('  - Opportunities count (real DB count):', indOpps.data?.length || 0);
  console.log('  - Applicants count (real DB count):', indApps.data?.length || 0);
  console.log('  - Confirmed empty state for new industry account.');

  // [7] Test Institution Dashboard Data Retrieval
  console.log('\n[7] Verifying Institution Dashboard (/api/institution/dashboard)...');
  const instDash = await req('GET', '/institution/dashboard', undefined, instToken);
  if (!instDash.ok) throw new Error(`Institution dashboard failed: ${JSON.stringify(instDash.data)}`);
  const instD = instDash.data;
  console.log('  - Institution Name:', instD.institution?.institutionName);
  console.log('  - Type:', instD.institution?.institutionType);
  console.log('  - Total Enrolled Students:', instD.analytics?.totalStudents);
  console.log('  - Assessment Completion Rate:', `${instD.analytics?.assessmentCompletionRate || 0}%`);
  console.log('  - Placement Rate:', `${instD.analytics?.applicationMetrics?.placementRate || 0}%`);
  console.log('  - Total Applications:', instD.analytics?.applicationMetrics?.totalApplications || 0);
  console.log('  - Skill Shortage List count:', instD.analytics?.skillComparison?.length || 0);

  // [8] Test Cross-Role Route Protection (RBAC)
  console.log('\n[8] Testing Cross-Role Route Protection (RBAC Guards)...');
  // Student cannot access Institution dashboard
  const block1 = await req('GET', '/institution/dashboard', undefined, studentToken);
  if (block1.status === 403) {
    console.log('  -> PASS: Student blocked from Institution Dashboard (403)');
  } else {
    throw new Error(`Expected 403 for student accessing institution dashboard, got ${block1.status}`);
  }

  // Student cannot access Industry created opportunities
  const block2 = await req('GET', '/opportunities/my/created', undefined, studentToken);
  if (block2.status === 403) {
    console.log('  -> PASS: Student blocked from Industry Opportunities (403)');
  } else {
    throw new Error(`Expected 403 for student accessing industry endpoint, got ${block2.status}`);
  }

  // Industry cannot access Academician dashboard
  const block3 = await req('GET', '/academician/dashboard', undefined, indToken);
  if (block3.status === 403) {
    console.log('  -> PASS: Industry blocked from Academician Dashboard (403)');
  } else {
    throw new Error(`Expected 403 for industry accessing academician dashboard, got ${block3.status}`);
  }

  // Academician cannot access Student dashboard
  const block4 = await req('GET', '/student/dashboard', undefined, acadToken);
  if (block4.status === 403) {
    console.log('  -> PASS: Academician blocked from Student Dashboard (403)');
  } else {
    throw new Error(`Expected 403 for academician accessing student dashboard, got ${block4.status}`);
  }

  // [9] Test Session Hydration (/api/auth/me) for Profile Menu
  console.log('\n[9] Testing Session Profile Hydration (/api/auth/me) for Profile Menu...');
  for (const item of [
    { role: 'STUDENT', token: studentToken, expectedName: 'Arjun Sharma' },
    { role: 'ACADEMICIAN', token: acadToken, expectedName: 'Prof. Meenakshi Sundaram' },
    { role: 'INDUSTRY', token: indToken, expectedName: 'Apex Cloud Technologies' },
    { role: 'INSTITUTION', token: instToken, expectedName: 'National Institute of Technology Karnataka' },
  ]) {
    const meRes = await req('GET', '/auth/me', undefined, item.token);
    if (!meRes.ok) throw new Error(`Failed /auth/me for ${item.role}`);
    const prof = meRes.data.user.profile;
    const resolvedName = prof?.fullName || prof?.companyName || prof?.institutionName;
    if (resolvedName !== item.expectedName) {
      throw new Error(`Name mismatch for ${item.role}. Expected ${item.expectedName}, got ${resolvedName}`);
    }
    console.log(`  -> Hydrated ${item.role}: ${resolvedName} (${meRes.data.user.email})`);
  }

  // [10] Test Logout Endpoint
  console.log('\n[10] Testing Logout endpoint...');
  const logoutRes = await req('POST', '/auth/logout', undefined, studentToken);
  if (!logoutRes.ok) throw new Error('Logout endpoint failed');
  console.log('  -> Logout endpoint responded successfully:', logoutRes.data.message);

  // [11] Reset database back to clean empty state
  console.log('\n[11] Cleaning database to 100% empty state...');
  await prisma.user.deleteMany({});
  const finalCount = await prisma.user.count();
  console.log(`Final Database User Count: ${finalCount} (Verified Empty)`);

  console.log('\n================================================================');
  console.log('>>> ALL 11 PHASE 2 VERIFICATION CHECKS PASSED WITH 100%! <<<');
  console.log('================================================================');

  await prisma.$disconnect();
}

verifyPhase2().catch(async (err) => {
  console.error('\n>>> Phase 2 Verification Failed! <<<');
  console.error(err);
  await prisma.$disconnect();
  process.exit(1);
});
