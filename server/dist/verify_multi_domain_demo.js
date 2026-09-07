"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Native fetch used in Node 18+
let passedTests = 0;
let failedTests = 0;
function assert(condition, message) {
    if (condition) {
        console.log(`  ✅ PASS: ${message}`);
        passedTests++;
    }
    else {
        console.error(`  ❌ FAIL: ${message}`);
        failedTests++;
    }
}
async function login(email, expectedRole) {
    const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: 'Demo@12345' }),
    });
    const data = await res.json();
    assert(res.status === 200, `Login successful for ${email}`);
    assert(data?.user?.role === expectedRole, `Role is ${expectedRole} (Actual: ${data?.user?.role})`);
    return { res, data };
}
async function runVerification() {
    console.log('==================================================================');
    console.log('🧪 VERIFYING MULTI-DOMAIN ACADEMIA-INDUSTRY DEMO ECOSYSTEM');
    console.log('   (6 Academicians, 5 Institutions, 7 Industry Partners, 10 Students)');
    console.log('==================================================================\n');
    // 1. Platform Public Analytics
    console.log('1. Testing Public Platform Analytics (Live Database Records)...');
    const statsRes = await fetch('http://localhost:5000/api/stats/public');
    assert(statsRes.status === 200, 'GET /api/stats/public returns 200 OK');
    const stats = await statsRes.json();
    assert(stats.totalStudents >= 10, `Total Students >= 10 (Actual: ${stats.totalStudents})`);
    assert(stats.totalAcademicians >= 6, `Total Academicians >= 6 (Actual: ${stats.totalAcademicians})`);
    assert(stats.totalCompanies >= 7, `Total Industry Partners >= 7 (Actual: ${stats.totalCompanies})`);
    assert(stats.totalInstitutions >= 5, `Total Partner Institutions >= 5 (Actual: ${stats.totalInstitutions})`);
    assert(stats.totalCourses >= 18, `Total Published Courses >= 18 (Actual: ${stats.totalCourses})`);
    assert(stats.totalInternships >= 15, `Total Internships >= 15 (Actual: ${stats.totalInternships})`);
    assert(stats.totalJobs >= 9, `Total Job Opportunities >= 9 (Actual: ${stats.totalJobs})`);
    assert(stats.totalCollaborations >= 10, `Total Collaborations / MoUs >= 10 (Actual: ${stats.totalCollaborations})`);
    assert(stats.totalOpportunities >= 24, `Total Opportunities >= 24 (Actual: ${stats.totalOpportunities})`);
    // 2. Multi-Role Authentication with Universal Demo@12345
    console.log('\n2. Testing Multi-Role Authentication with Universal Demo@12345...');
    // Academicians (6)
    const acadAnanyaAuth = await login('ananya.academician@demo.ayurveda.com', 'ACADEMICIAN');
    const acadRaviAuth = await login('ravi.academician@demo.ayurveda.com', 'ACADEMICIAN');
    const acadMeenakshiAuth = await login('meenakshi.academician@demo.ayurveda.com', 'ACADEMICIAN');
    const acadSureshAuth = await login('suresh.academician@demo.edu', 'ACADEMICIAN');
    const acadPriyaAuth = await login('priya.academician@demo.edu', 'ACADEMICIAN');
    const acadKarthikAuth = await login('karthik.academician@demo.edu', 'ACADEMICIAN');
    // Institutions (5)
    const instDhanAuth = await login('admin.dhanvantari@demo.ayurveda.com', 'INSTITUTION');
    const instSIIAAuth = await login('admin.siia@demo.ayurveda.com', 'INSTITUTION');
    const instKARIAuth = await login('admin.kari@demo.ayurveda.com', 'INSTITUTION');
    const instSSNAuth = await login('admin.ssn@demo.edu', 'INSTITUTION');
    const instSICIAuth = await login('admin.commerce@demo.edu', 'INSTITUTION');
    // Industry (7)
    const indDhanAuth = await login('hr@dhanvantari.demo', 'INDUSTRY');
    const indKeralaAuth = await login('hr@keralaherbal.demo', 'INDUSTRY');
    const indAyuLifeAuth = await login('hr@ayurvedalife.demo', 'INDUSTRY');
    const indPranaAuth = await login('hr@pranaayurveda.demo', 'INDUSTRY');
    const indTechNovaAuth = await login('hr@technovademo.com', 'INDUSTRY');
    const indEmbeddedAuth = await login('hr@embeddedlabs.demo', 'INDUSTRY');
    const indFinEdgeAuth = await login('hr@finedge.demo', 'INDUSTRY');
    // Students (Selected)
    const stuAnanyaAuth = await login('ananya.student@demo.platform.com', 'STUDENT');
    const stuMeeraAuth = await login('meera.student@demo.platform.com', 'STUDENT');
    const stuRahulAuth = await login('rahul.engineering@demo.platform.com', 'STUDENT');
    const stuPriyaAuth = await login('priya.engineering@demo.platform.com', 'STUDENT');
    const stuSnehaAuth = await login('sneha.commerce@demo.platform.com', 'STUDENT');
    // 3. Verify Academician Courses in Catalog
    console.log('\n3. Testing Academician Courses in Learning Hub...');
    const coursesRes = await fetch('http://localhost:5000/api/courses');
    assert(coursesRes.status === 200, 'GET /api/courses returns 200 OK');
    const coursesData = await coursesRes.json();
    const allCourses = Array.isArray(coursesData) ? coursesData : coursesData.courses || [];
    const checkCourse = (titleSub, providerSub) => {
        const c = allCourses.find((x) => (x.title || '').includes(titleSub));
        assert(Boolean(c), `Found course: "${titleSub}"`);
        if (c) {
            assert((c.providerName || '').includes(providerSub), `Provider contains "${providerSub}" (Actual: ${c.providerName})`);
        }
    };
    checkCourse('Clinical Ayurveda and Diagnosis', 'Dr. Ananya Krishnan');
    checkCourse('Dravyaguna and Medicinal Plants', 'Dr. Ravi Narayanan');
    checkCourse('Ayurvedic Pharmacy and Formulation Science', 'Dr. Meenakshi Menon');
    checkCourse('Embedded Systems Fundamentals', 'Dr. Suresh Kumar');
    checkCourse('Full Stack Web Development', 'Dr. Priya Raman');
    checkCourse('Financial Analysis and Business Analytics', 'Dr. Karthik Rao');
    // 4. Verify Industry Opportunities
    console.log('\n4. Testing Industry Opportunities across Domains...');
    const oppsRes = await fetch('http://localhost:5000/api/opportunities', {
        headers: { Authorization: `Bearer ${stuAnanyaAuth.data.token}` },
    });
    assert(oppsRes.status === 200, 'GET /api/opportunities returns 200 OK');
    const oppsData = await oppsRes.json();
    const opportunities = Array.isArray(oppsData) ? oppsData : oppsData.opportunities || [];
    const checkOpp = (titleSub, type) => {
        const o = opportunities.find((x) => (x.title || '').includes(titleSub) && x.type === type);
        assert(Boolean(o), `Found ${type}: "${titleSub}"`);
    };
    // Ayurveda Internships & Jobs
    checkOpp('Panchakarma Therapy Intern', 'INTERNSHIP');
    checkOpp('Clinical Research Intern', 'INTERNSHIP');
    checkOpp('Herbal Medicine Research Intern', 'INTERNSHIP');
    checkOpp('Junior Ayurveda Clinical Associate', 'JOB');
    checkOpp('Ayurvedic Research Associate', 'JOB');
    // Engineering Internships & Jobs
    checkOpp('Embedded Systems Intern', 'INTERNSHIP');
    checkOpp('Full Stack Development Intern', 'INTERNSHIP');
    checkOpp('Junior Full Stack Developer', 'JOB');
    checkOpp('Embedded Systems Engineer', 'JOB');
    // Commerce Internships & Jobs
    checkOpp('Financial Analysis Intern', 'INTERNSHIP');
    checkOpp('Digital Marketing Intern', 'INTERNSHIP');
    checkOpp('Junior Financial Analyst', 'JOB');
    // 5. Verify Student Match & Portfolio
    console.log('\n5. Testing Student Match and Verified Certifications...');
    // Meera Krishnan 100% course progress
    const meeraCoursesRes = await fetch('http://localhost:5000/api/courses/my-courses', {
        headers: { Authorization: `Bearer ${stuMeeraAuth.data.token}` },
    });
    const meeraCourses = await meeraCoursesRes.json();
    const meeraCourseList = Array.isArray(meeraCourses) ? meeraCourses : meeraCourses.courses || [];
    const meeraDravya = meeraCourseList.find((c) => (c.title || c.course?.title || '').includes('Dravyaguna'));
    assert(Boolean(meeraDravya), 'Found Dravyaguna in Meera portfolio');
    assert(Number(meeraDravya?.progressPercentage ?? 0) === 100, 'Meera progress is 100%');
    // Priya Sharma 100% course progress
    const priyaCoursesRes = await fetch('http://localhost:5000/api/courses/my-courses', {
        headers: { Authorization: `Bearer ${stuPriyaAuth.data.token}` },
    });
    const priyaCourses = await priyaCoursesRes.json();
    const priyaCourseList = Array.isArray(priyaCourses) ? priyaCourses : priyaCourses.courses || [];
    const priyaEmbed = priyaCourseList.find((c) => (c.title || c.course?.title || '').includes('Embedded Systems'));
    assert(Boolean(priyaEmbed), 'Found Embedded Systems in Priya portfolio');
    assert(Number(priyaEmbed?.progressPercentage ?? 0) === 100, 'Priya progress is 100%');
    // Sneha Patel 100% course progress
    const snehaCoursesRes = await fetch('http://localhost:5000/api/courses/my-courses', {
        headers: { Authorization: `Bearer ${stuSnehaAuth.data.token}` },
    });
    const snehaCourses = await snehaCoursesRes.json();
    const snehaCourseList = Array.isArray(snehaCourses) ? snehaCourses : snehaCourses.courses || [];
    const snehaFin = snehaCourseList.find((c) => (c.title || c.course?.title || '').includes('Financial Analysis'));
    assert(Boolean(snehaFin), 'Found Financial Analysis in Sneha portfolio');
    assert(Number(snehaFin?.progressPercentage ?? 0) === 100, 'Sneha progress is 100%');
    // 6. Institutional Intelligence across Institutions
    console.log('\n6. Testing Multi-Institution Intelligence Dashboards...');
    const checkInstIntel = async (token, instName) => {
        const intelRes = await fetch('http://localhost:5000/api/institution/intelligence', {
            headers: { Authorization: `Bearer ${token}` },
        });
        assert(intelRes.status === 200, `GET /api/institution/intelligence returns 200 for ${instName}`);
        const intelData = await intelRes.json();
        assert(Boolean(intelData.hasData), `${instName} intelligence reports active students`);
    };
    await checkInstIntel(instDhanAuth.data.token, 'Sri Dhanvantari Ayurveda College');
    await checkInstIntel(instSIIAAuth.data.token, 'South Indian Institute of Ayurveda');
    await checkInstIntel(instKARIAuth.data.token, 'Kerala Ayurveda Research Institute');
    await checkInstIntel(instSSNAuth.data.token, 'SSN Engineering College');
    await checkInstIntel(instSICIAuth.data.token, 'South India Commerce Institute');
    // 7. Collaborations API
    console.log('\n7. Testing Multi-Discipline Collaborations Listing...');
    const collabRes = await fetch('http://localhost:5000/api/collaborations', {
        headers: { Authorization: `Bearer ${stuAnanyaAuth.data.token}` },
    });
    assert(collabRes.status === 200, 'GET /api/collaborations returns 200 OK');
    const collabData = await collabRes.json();
    const collabs = Array.isArray(collabData) ? collabData : collabData.collaborations || [];
    assert(collabs.length >= 10, `Total active collaborations >= 10 (Actual: ${collabs.length})`);
    console.log('\n==================================================================');
    console.log(`🏁 VERIFICATION SUMMARY: ${passedTests} PASSED, ${failedTests} FAILED`);
    console.log('==================================================================');
    if (failedTests > 0) {
        console.error('❌ Some tests failed.');
        process.exit(1);
    }
    else {
        console.log('🎉 ALL MULTI-DOMAIN DEMO DATA TESTS PASSED PERFECTLY!');
    }
}
if (require.main === module) {
    runVerification().catch((err) => {
        console.error('❌ Verification script failed:', err);
        process.exit(1);
    });
}
exports.default = runVerification;
