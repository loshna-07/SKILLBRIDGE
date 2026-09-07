"use strict";
const API_BASE = 'http://localhost:5000/api';
async function request(url, options = {}) {
    const res = await fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(options.headers || {}),
        },
        body: options.body ? JSON.stringify(options.body) : undefined,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
        const error = new Error(data.message || `HTTP ${res.status}`);
        error.status = res.status;
        error.data = data;
        throw error;
    }
    return data;
}
async function verifyDemoData() {
    console.log('====================================================');
    console.log('🧪 RUNNING DEMO DATA END-TO-END VERIFICATION');
    console.log('====================================================\n');
    let passed = 0;
    let failed = 0;
    function assert(condition, label) {
        if (condition) {
            console.log(`✅ PASS: ${label}`);
            passed++;
        }
        else {
            console.error(`❌ FAIL: ${label}`);
            failed++;
        }
    }
    try {
        // 1. Check Public Stats
        console.log('\n--- 1. Verifying Public Platform Stats ---');
        const stats = await request(`${API_BASE}/stats/public`);
        console.log('Public Stats:', stats);
        assert(stats.totalStudents === 5, `Total Students Registered = 5 (Got ${stats.totalStudents})`);
        assert(stats.totalCompanies === 3, `Total Industry Partners = 3 (Got ${stats.totalCompanies})`);
        assert(stats.totalInstitutions === 2, `Total Partner Institutions = 2 (Got ${stats.totalInstitutions})`);
        assert(stats.totalOpportunities >= 14, `Total Active Opportunities >= 14 (Got ${stats.totalOpportunities})`);
        // 2. Test Logins for all 4 Roles
        console.log('\n--- 2. Verifying Role-Based Authentication & Tokens ---');
        // Student Login
        const priyaLogin = await request(`${API_BASE}/auth/login`, {
            method: 'POST',
            body: {
                email: 'priya.sharma@demo.skillbridge.com',
                password: 'Demo@12345',
            },
        });
        assert(priyaLogin.user.role === 'STUDENT', 'Student Priya Sharma login succeeded');
        const priyaToken = priyaLogin.token;
        // Academician Login
        const ananyaLogin = await request(`${API_BASE}/auth/login`, {
            method: 'POST',
            body: {
                email: 'ananya.krishnan@demo.skillbridge.com',
                password: 'Demo@12345',
            },
        });
        assert(ananyaLogin.user.role === 'ACADEMICIAN', 'Academician Dr. Ananya Krishnan login succeeded');
        // Industry Login
        const technovaLogin = await request(`${API_BASE}/auth/login`, {
            method: 'POST',
            body: {
                email: 'recruitment@technova.demo',
                password: 'Demo@12345',
            },
        });
        assert(technovaLogin.user.role === 'INDUSTRY', 'Industry TechNova login succeeded');
        // Institution Login
        const citLogin = await request(`${API_BASE}/auth/login`, {
            method: 'POST',
            body: {
                email: 'admin@cit.demo',
                password: 'Demo@12345',
            },
        });
        assert(citLogin.user.role === 'INSTITUTION', 'Institution CIT login succeeded');
        // 3. Test Student Personalized Career & Skill Dashboard
        console.log('\n--- 3. Verifying Student Career & Skill Dashboard ---');
        const dashboard = await request(`${API_BASE}/student/dashboard`, {
            headers: { Authorization: `Bearer ${priyaToken}` },
        });
        console.log(`Priya Skills count: ${dashboard.skills?.length}`);
        console.log(`Priya Career Interests: ${dashboard.careerInterests?.join(', ')}`);
        console.log(`Priya Recommended Courses count: ${dashboard.recommendedCourses?.length}`);
        console.log(`Priya Recommended Opportunities count: ${dashboard.recommendedOpportunities?.length}`);
        assert(dashboard.skills.length >= 6, 'Priya has >= 6 skills tracked');
        assert(dashboard.certifications.length >= 1, 'Priya has certifications tracked');
        assert(dashboard.recommendedSkills.length > 0, 'Personalized recommended skills generated');
        assert(dashboard.recommendedCourses.length > 0, 'Personalized recommended courses generated');
        assert(dashboard.recommendedOpportunities.length > 0, 'Personalized recommended opportunities generated');
        // 4. Test Opportunity Match & Strict Eligibility Calculations
        console.log('\n--- 4. Verifying Strict Eligibility & Matching Engine ---');
        // Priya Opportunities (all 14 opportunities)
        const priyaOpps = await request(`${API_BASE}/opportunities`, {
            headers: { Authorization: `Bearer ${priyaToken}` },
        });
        const priyaFullStackMatch = priyaOpps.find((o) => o.title.includes('Full Stack Web Developer Intern'));
        assert(priyaFullStackMatch !== undefined, 'Found Full Stack Web Developer Intern in opportunity list');
        if (priyaFullStackMatch) {
            assert(priyaFullStackMatch.matchResult?.eligibility?.isEligible === true, 'Priya is strictly ELIGIBLE for Full Stack Intern');
            assert(priyaFullStackMatch.matchResult?.matchPercentage >= 80, `High match percentage (Got ${priyaFullStackMatch.matchResult?.matchPercentage}%)`);
        }
        // Rahul Login & Opportunity Match Check
        const rahulLogin = await request(`${API_BASE}/auth/login`, {
            method: 'POST',
            body: {
                email: 'rahul.kumar@demo.skillbridge.com',
                password: 'Demo@12345',
            },
        });
        const rahulToken = rahulLogin.token;
        const rahulOpps = await request(`${API_BASE}/opportunities`, {
            headers: { Authorization: `Bearer ${rahulToken}` },
        });
        const rahulCloudMatch = rahulOpps.find((o) => o.title.includes('Cloud & DevOps Engineering Intern'));
        assert(rahulCloudMatch !== undefined, 'Found Cloud & DevOps Intern in Rahul opportunity list');
        if (rahulCloudMatch) {
            assert(rahulCloudMatch.matchResult?.eligibility?.isEligible === false, 'Rahul is NOT ELIGIBLE for Cloud Intern (low CGPA & missing skills)');
            assert(rahulCloudMatch.matchResult?.eligibility?.ineligibleReasons?.length > 0, `Explicit rejection reasons provided: ${rahulCloudMatch.matchResult?.eligibility?.ineligibleReasons?.join(' | ')}`);
        }
        // 5. Test Course Catalog & Enrolled Progress
        console.log('\n--- 5. Verifying Course Catalog & Enrolled Progress ---');
        const coursesData = await request(`${API_BASE}/courses`);
        assert(Array.isArray(coursesData) && coursesData.length >= 10, `Course catalog contains >= 10 courses (Got ${coursesData?.length})`);
        // Meera Krishnan Course Completion & Certificate
        const meeraLogin = await request(`${API_BASE}/auth/login`, {
            method: 'POST',
            body: {
                email: 'meera.krishnan@demo.skillbridge.com',
                password: 'Demo@12345',
            },
        });
        const meeraToken = meeraLogin.token;
        const meeraEnrolled = await request(`${API_BASE}/courses/my/enrolled`, {
            headers: { Authorization: `Bearer ${meeraToken}` },
        });
        assert(Array.isArray(meeraEnrolled) && meeraEnrolled.length >= 1, 'Meera has enrolled courses');
        const completedCourse = meeraEnrolled.find((e) => e.progressPercentage === 100);
        assert(completedCourse !== undefined, 'Meera has 100% completed course');
        if (completedCourse) {
            assert(completedCourse.certificate !== null, 'Course certificate object exists');
            assert(completedCourse.certificate?.certificateCode === 'SKB-CERT-ML-2026-MEERA', `Certificate code verified (${completedCourse.certificate?.certificateCode})`);
            assert(completedCourse.certificate?.verificationStatus === 'VERIFIED', 'Certificate is VERIFIED');
        }
        // 6. Test Institution Intelligence Analytics
        console.log('\n--- 6. Verifying Institution Intelligence & Placement Pipeline ---');
        const intel = await request(`${API_BASE}/institution/intelligence`, {
            headers: { Authorization: `Bearer ${citLogin.token}` },
        });
        assert(intel.hasData === true, 'Institution intelligence contains rich demo data');
        assert(intel.dimensions.studentSkillDistribution.totalSkillsTracked > 0, 'Skill distribution calculated');
        assert(intel.dimensions.placementPipeline.stages.length === 4, 'Placement pipeline funnel calculated');
        console.log('\n====================================================');
        console.log(`📊 FINAL RESULT: ${passed} PASSED, ${failed} FAILED`);
        console.log('====================================================\n');
        if (failed > 0) {
            process.exit(1);
        }
    }
    catch (error) {
        console.error('❌ Verification script encountered an exception:', error.data || error.message);
        process.exit(1);
    }
}
verifyDemoData();
