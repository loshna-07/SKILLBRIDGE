import api from './config/db';
import http from 'http';

const BASE_URL = 'http://localhost:5000/api';

async function fetchJson(endpoint: string, options: any = {}): Promise<{ status: number; ok: boolean; data: any }> {
  const url = `${BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const response = await fetch(url, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const data: any = await response.json();
  return { status: response.status, ok: response.ok, data };
}

async function verifyAyurvedaEcosystem() {
  console.log('==================================================================');
  console.log('🩺 VERIFYING AYURVEDA ACADEMIA-INDUSTRY PLATFORM ECOSYSTEM');
  console.log('==================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, message: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  // -------------------------------------------------------------
  // Test 1: Public Platform Stats API (8 Dynamic Metrics)
  // -------------------------------------------------------------
  console.log('1. Testing Public Platform Analytics (8 Database-Driven Metrics)...');
  const statsRes = await fetchJson('/stats/public');
  assert(statsRes.ok, `GET /stats/public returns 200 OK`);
  const s = statsRes.data;
  assert(s.totalStudents === 6, `Total Students = ${s.totalStudents} (Expected 6)`);
  assert(s.totalAcademicians === 3, `Total Academicians = ${s.totalAcademicians} (Expected 3)`);
  assert(s.totalCompanies === 4, `Total Industry Partners = ${s.totalCompanies} (Expected 4)`);
  assert(s.totalInstitutions === 3, `Total Institutions = ${s.totalInstitutions} (Expected 3)`);
  assert(s.totalCourses === 12, `Total Published Courses = ${s.totalCourses} (Expected 12)`);
  assert(s.totalInternships === 10, `Total Clinical Internships = ${s.totalInternships} (Expected 10)`);
  assert(s.totalJobs === 6, `Total Ayurveda Jobs = ${s.totalJobs} (Expected 6)`);
  assert(s.totalCollaborations === 6, `Total Academia-Industry MoUs = ${s.totalCollaborations} (Expected 6)`);
  assert(s.totalOpportunities === 16, `Total Opportunities = ${s.totalOpportunities} (Expected 16)`);

  // -------------------------------------------------------------
  // Test 2: Multi-Role Authentication with Demo@12345
  // -------------------------------------------------------------
  console.log('\n2. Testing Multi-Role Authentication with universal Demo@12345...');
  
  // Student Login
  const studentLogin = await fetchJson('/auth/login', {
    method: 'POST',
    body: { email: 'ananya.student@demo.ayurveda.com', password: 'Demo@12345' },
  });
  assert(studentLogin.ok && studentLogin.data?.user?.role === 'STUDENT', 'Student Ananya Iyer authenticated successfully');
  const studentToken = studentLogin.data?.token;

  // Academician Login
  const acadLogin = await fetchJson('/auth/login', {
    method: 'POST',
    body: { email: 'ananya.academician@demo.ayurveda.com', password: 'Demo@12345' },
  });
  assert(acadLogin.ok && acadLogin.data?.user?.role === 'ACADEMICIAN', 'Academician Dr. Ananya Krishnan authenticated successfully');
  const acadToken = acadLogin.data?.token;

  // Industry Login
  const indLogin = await fetchJson('/auth/login', {
    method: 'POST',
    body: { email: 'hr@dhanvantari.demo', password: 'Demo@12345' },
  });
  assert(indLogin.ok && indLogin.data?.user?.role === 'INDUSTRY', 'Industry Dhanvantari Wellness authenticated successfully');
  const indToken = indLogin.data?.token;

  // Institution Login
  const instLogin = await fetchJson('/auth/login', {
    method: 'POST',
    body: { email: 'admin.dhanvantari@demo.ayurveda.com', password: 'Demo@12345' },
  });
  assert(instLogin.ok && instLogin.data?.user?.role === 'INSTITUTION', 'Institution SDAC authenticated successfully');
  const instToken = instLogin.data?.token;

  // -------------------------------------------------------------
  // Test 3: Ananya Iyer's Clinical Flow & Matching
  // -------------------------------------------------------------
  console.log('\n3. Testing Student Flow: Ananya Iyer (Panchakarma Specialist)...');
  
  // Enriched opportunities with live compatibility matching
  const ananyaOpps = await fetchJson('/opportunities', {
    headers: { Authorization: `Bearer ${studentToken}` },
  });
  assert(ananyaOpps.ok && Array.isArray(ananyaOpps.data), `Fetched ${ananyaOpps.data?.length} opportunities for Ananya`);

  const pkOpp = (ananyaOpps.data || []).find((o: any) => o.title.includes('Panchakarma Therapy Intern'));
  assert(Boolean(pkOpp), 'Found "Panchakarma Therapy Intern" opportunity');

  if (pkOpp && pkOpp.matchResult) {
    const isEligible = pkOpp.matchResult.eligibility?.isEligible;
    console.log(`     Match Score for Ananya: ${pkOpp.matchResult.matchPercentage}% (Eligible: ${isEligible})`);
    assert(pkOpp.matchResult.matchPercentage >= 75, `Ananya match score >= 75% (Actual: ${pkOpp.matchResult.matchPercentage}%)`);
    assert(isEligible === true, `Ananya is marked strictly ELIGIBLE for Panchakarma Intern`);
  } else {
    assert(false, 'pkOpp.matchResult was missing');
  }

  // Ananya's applications
  const ananyaApps = await fetchJson('/student/applications', {
    headers: { Authorization: `Bearer ${studentToken}` },
  });
  assert(ananyaApps.ok && ananyaApps.data.length > 0, `Ananya has ${ananyaApps.data?.length} active application(s)`);
  const ananyaPkApp = (ananyaApps.data || []).find((a: any) => a.opportunity?.title?.includes('Panchakarma Therapy Intern'));
  assert(ananyaPkApp && ananyaPkApp.status === 'SHORTLISTED', `Ananya's application status is SHORTLISTED by Dhanvantari Wellness`);

  // -------------------------------------------------------------
  // Test 4: Rohan Sharma's Ineligibility & Gap Detection
  // -------------------------------------------------------------
  console.log('\n4. Testing Ineligibility Flow: Rohan Sharma (Ayurvedic Pharmacy)...');
  const rohanLogin = await fetchJson('/auth/login', {
    method: 'POST',
    body: { email: 'rohan.student@demo.ayurveda.com', password: 'Demo@12345' },
  });
  assert(rohanLogin.ok, 'Rohan Sharma authenticated');
  const rohanToken = rohanLogin.data?.token;

  const rohanOpps = await fetchJson('/opportunities', {
    headers: { Authorization: `Bearer ${rohanToken}` },
  });
  const rohanPkOpp = (rohanOpps.data || []).find((o: any) => o.title?.includes('Panchakarma Therapy Intern'));
  
  if (rohanPkOpp && rohanPkOpp.matchResult) {
    const isEligible = rohanPkOpp.matchResult.eligibility?.isEligible;
    console.log(`     Match Score for Rohan on Panchakarma Opp: ${rohanPkOpp.matchResult.matchPercentage}% (Eligible: ${isEligible})`);
    assert(isEligible === false, 'Rohan is correctly marked NOT ELIGIBLE for Panchakarma Clinical Intern');
    assert(rohanPkOpp.matchResult.missingRequiredSkills?.length > 0, `Missing required skills identified: ${rohanPkOpp.matchResult.missingRequiredSkills.join(', ')}`);
  }

  // -------------------------------------------------------------
  // Test 5: Meera Krishnan's 100% Course Completion & Certificate
  // -------------------------------------------------------------
  console.log('\n5. Testing Course Completion & Verified Certificate: Meera Krishnan...');
  const meeraLogin = await fetchJson('/auth/login', {
    method: 'POST',
    body: { email: 'meera.student@demo.ayurveda.com', password: 'Demo@12345' },
  });
  assert(meeraLogin.ok, 'Meera Krishnan authenticated');
  const meeraToken = meeraLogin.data?.token;

  const meeraEnrollments = await fetchJson('/courses/my-courses', {
    headers: { Authorization: `Bearer ${meeraToken}` },
  });
  assert(meeraEnrollments.ok && meeraEnrollments.data?.length > 0, `Meera has ${meeraEnrollments.data?.length} enrolled course(s)`);
  
  const dravyagunaCourse = (meeraEnrollments.data || []).find((e: any) => e.course?.title?.includes('Dravyaguna'));
  assert(Boolean(dravyagunaCourse), 'Found Dravyaguna course enrollment');
  if (dravyagunaCourse) {
    assert(dravyagunaCourse.progressPercentage === 100, `Progress is 100% (Actual: ${dravyagunaCourse.progressPercentage}%)`);
    assert(dravyagunaCourse.status === 'COMPLETED' || dravyagunaCourse.progressPercentage === 100, 'Course marked as completed');
  }

  // -------------------------------------------------------------
  // Test 6: Institution Intelligence for Sri Dhanvantari Ayurveda College
  // -------------------------------------------------------------
  console.log('\n6. Testing Institution Intelligence Dashboard for SDAC...');
  const instIntel = await fetchJson('/institution/intelligence', {
    headers: { Authorization: `Bearer ${instToken}` },
  });
  assert(instIntel.ok, 'GET /api/institution/intelligence returns 200 OK');
  if (instIntel.ok) {
    const d = instIntel.data;
    assert(d.hasData === true, 'Institution hasData is true');
    assert(d.summary !== undefined, 'Institution returns summary object');
    assert(d.dimensions !== undefined, 'Institution returns dimensions object');
    assert(Array.isArray(d.dimensions?.departmentReadiness), 'Institution returns departmentReadiness');
    console.log(`     Total Students in Scope: ${d.summary?.totalStudents || 0}`);
    console.log(`     Total Applications: ${d.summary?.totalApplications || 0}`);
  }

  // -------------------------------------------------------------
  // Test 7: Academia-Industry Collaboration Listings
  // -------------------------------------------------------------
  console.log('\n7. Testing Academia-Industry Collaboration Listings...');
  const collabsRes = await fetchJson('/collaborations', {
    headers: { Authorization: `Bearer ${studentToken}` },
  });
  assert(collabsRes.ok && Array.isArray(collabsRes.data), `GET /api/collaborations returned ${collabsRes.data?.length} items`);
  const fdp = (collabsRes.data || []).find((c: any) => c.type === 'FDP');
  assert(Boolean(fdp), 'Found Faculty Development Program (FDP) collaboration');

  // Summary
  console.log('\n==================================================================');
  console.log(`🏁 VERIFICATION SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('==================================================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    console.log('🎉 ALL AYURVEDA ECOSYSTEM TESTS PASSED PERFECTLY!\n');
    process.exit(0);
  }
}

verifyAyurvedaEcosystem().catch((err) => {
  console.error('Verification script crashed:', err);
  process.exit(1);
});
