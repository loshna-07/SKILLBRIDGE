"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("./config/db"));
const API_BASE = 'http://localhost:5000/api';
const api = {
    get: async (url, config) => {
        const res = await fetch(url, { method: 'GET', headers: config?.headers });
        const data = await res.json().catch(() => null);
        if (!res.ok) {
            const err = new Error(data?.message || res.statusText);
            err.response = { status: res.status, data };
            throw err;
        }
        return { status: res.status, data };
    },
    post: async (url, body, config) => {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...(config?.headers || {}) },
            body: body ? JSON.stringify(body) : undefined,
        });
        const data = await res.json().catch(() => null);
        if (!res.ok) {
            const err = new Error(data?.message || res.statusText);
            err.response = { status: res.status, data };
            throw err;
        }
        return { status: res.status, data };
    },
    put: async (url, body, config) => {
        const res = await fetch(url, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', ...(config?.headers || {}) },
            body: body ? JSON.stringify(body) : undefined,
        });
        const data = await res.json().catch(() => null);
        if (!res.ok) {
            const err = new Error(data?.message || res.statusText);
            err.response = { status: res.status, data };
            throw err;
        }
        return { status: res.status, data };
    },
    delete: async (url, config) => {
        const res = await fetch(url, { method: 'DELETE', headers: config?.headers });
        const data = await res.json().catch(() => null);
        if (!res.ok) {
            const err = new Error(data?.message || res.statusText);
            err.response = { status: res.status, data };
            throw err;
        }
        return { status: res.status, data };
    },
};
async function runCareerDashboardVerification() {
    console.log('=================================================================');
    console.log('  PERSONALIZED CAREER & SKILL DASHBOARD E2E VERIFICATION SUITE   ');
    console.log('=================================================================');
    try {
        // 0. Clean DB Setup
        console.log('\n[STEP 1] Database Purge & Empty State Verification');
        await db_1.default.courseCertificate.deleteMany({});
        await db_1.default.courseLessonProgress.deleteMany({});
        await db_1.default.courseEnrollment.deleteMany({});
        await db_1.default.courseLesson.deleteMany({});
        await db_1.default.courseModule.deleteMany({});
        await db_1.default.courseSkill.deleteMany({});
        await db_1.default.course.deleteMany({});
        await db_1.default.applicationStatusHistory.deleteMany({});
        await db_1.default.application.deleteMany({});
        await db_1.default.opportunitySkill.deleteMany({});
        await db_1.default.opportunity.deleteMany({});
        await db_1.default.studentSkillProfile.deleteMany({});
        await db_1.default.studentCertification.deleteMany({});
        await db_1.default.skill.deleteMany({});
        await db_1.default.skillCategory.deleteMany({});
        await db_1.default.studentProfile.deleteMany({});
        await db_1.default.academicianProfile.deleteMany({});
        await db_1.default.industryProfile.deleteMany({});
        await db_1.default.institutionProfile.deleteMany({});
        await db_1.default.auditLog.deleteMany({});
        await db_1.default.user.deleteMany({});
        // 1. Register Actors
        console.log('\n[STEP 2] Register Actors (Student, Academician, Industry)');
        const studentRes = await api.post(`${API_BASE}/auth/register`, {
            role: 'STUDENT',
            email: 'alex.student@ayurveda.edu',
            password: 'Password@123',
            fullName: 'Alex Johnson',
            institutionName: 'National Institute of Ayurveda',
            department: 'Dravyaguna',
            degree: 'BAMS',
            cgpa: '8.4',
        });
        const studentToken = studentRes.data.token;
        console.log('  PASS: Student registered (Degree: BAMS, Dept: Dravyaguna, CGPA: 8.4)');
        const industryRes = await api.post(`${API_BASE}/auth/register`, {
            role: 'INDUSTRY',
            email: 'talent@techcorp-ayur.com',
            password: 'Password@123',
            fullName: 'Talent Lead',
            companyName: 'TechCorp Health & Ayurveda',
            officialEmail: 'talent@techcorp-ayur.com',
            industrySector: 'HealthTech & Bio-Informatics',
        });
        const indToken = industryRes.data.token;
        console.log('  PASS: Industry partner registered.');
        const acadRes = await api.post(`${API_BASE}/auth/register`, {
            role: 'ACADEMICIAN',
            email: 'prof.kumar@ayurveda.edu',
            password: 'Password@123',
            fullName: 'Prof. S. Kumar',
            institutionName: 'National Institute of Ayurveda',
            department: 'Dravyaguna',
            designation: 'Professor',
        });
        const acadToken = acadRes.data.token;
        console.log('  PASS: Academician registered.');
        // 2. Empty Profile Experience Check
        console.log('\n[STEP 3] Empty Profile Experience Check');
        const emptyDash = await api.get(`${API_BASE}/student/dashboard`, {
            headers: { Authorization: `Bearer ${studentToken}` },
        });
        if (emptyDash.data.skills.length === 0 &&
            emptyDash.data.careerInterests.length === 0 &&
            emptyDash.data.certifications.length === 0 &&
            emptyDash.data.recommendedCourses.length === 0 &&
            emptyDash.data.recommendedOpportunities.length === 0) {
            console.log('  PASS: Clean empty state confirmed. Zero fake default skills or courses.');
        }
        else {
            throw new Error('Empty dashboard returned non-empty data!');
        }
        // 3. Student Manually Adds Skills & Edits Proficiency
        console.log('\n[STEP 4] My Skills CRUD (Manual Add, Edit Proficiency, Delete)');
        const s1 = await api.post(`${API_BASE}/student/skills`, { skillName: 'JavaScript', categoryName: 'Programming', proficiencyLevel: 'ADVANCED' }, { headers: { Authorization: `Bearer ${studentToken}` } });
        const s2 = await api.post(`${API_BASE}/student/skills`, { skillName: 'React', categoryName: 'Frontend', proficiencyLevel: 'INTERMEDIATE' }, { headers: { Authorization: `Bearer ${studentToken}` } });
        const s3 = await api.post(`${API_BASE}/student/skills`, { skillName: 'SQL', categoryName: 'Databases', proficiencyLevel: 'INTERMEDIATE' }, { headers: { Authorization: `Bearer ${studentToken}` } });
        console.log('  PASS: Added 3 skills (JavaScript: ADVANCED, React: INTERMEDIATE, SQL: INTERMEDIATE).');
        // Update React proficiency to ADVANCED
        const updatedReact = await api.put(`${API_BASE}/student/skills/${s2.data.id}`, { proficiencyLevel: 'ADVANCED' }, { headers: { Authorization: `Bearer ${studentToken}` } });
        if (updatedReact.data.proficiencyLevel === 'ADVANCED') {
            console.log('  PASS: Updated React proficiency to ADVANCED.');
        }
        else {
            throw new Error('Failed to update skill proficiency.');
        }
        // 4. Student Sets Career Interests
        console.log('\n[STEP 5] Career Interests Management');
        const setInterests = await api.put(`${API_BASE}/student/interests`, { careerInterests: ['Full Stack Development', 'Cloud Computing'] }, { headers: { Authorization: `Bearer ${studentToken}` } });
        console.log('  PASS: Career interests set:', setInterests.data.careerInterests.join(', '));
        const getInterests = await api.get(`${API_BASE}/student/interests`, {
            headers: { Authorization: `Bearer ${studentToken}` },
        });
        if (getInterests.data.careerInterests.includes('Full Stack Development')) {
            console.log('  PASS: Career interests persisted and retrieved.');
        }
        else {
            throw new Error('Failed to retrieve career interests.');
        }
        // 5. Student Uploads Certification
        console.log('\n[STEP 6] Student Certifications Management');
        const certRes = await api.post(`${API_BASE}/student/certifications`, {
            title: 'Full Stack Web Specialist Certificate',
            issuingOrganization: 'Meta & Coursera',
            issueDate: 'January 2026',
            credentialId: 'META-FSW-98124',
            skillsCovered: 'React, JavaScript, SQL',
        }, { headers: { Authorization: `Bearer ${studentToken}` } });
        if (certRes.data.verificationStatus === 'PENDING') {
            console.log('  PASS: Certification created in PENDING verification status.');
        }
        else {
            throw new Error('Certification should be in PENDING status.');
        }
        // 6. Create Skills in Taxonomy for Opportunities
        const nodeSkill = await db_1.default.skill.create({
            data: {
                name: 'Node.js',
                categoryId: s1.data.skill.categoryId,
                description: 'Server-side JavaScript runtime',
            },
        });
        const dockerSkill = await db_1.default.skill.create({
            data: {
                name: 'Docker',
                categoryId: s1.data.skill.categoryId,
                description: 'Containerization engine',
            },
        });
        // 7. Industry Creates Opportunities (Eligible vs Ineligible)
        console.log('\n[STEP 7] Industry Creates Opportunities (Eligible vs Ineligible Scenarios)');
        // Opp 1: Student is fully ELIGIBLE (has JS & React at ADVANCED, degree/dept match, CGPA >= 7.5)
        const opp1Res = await api.post(`${API_BASE}/opportunities`, {
            title: 'Full Stack Web Developer Intern',
            type: 'INTERNSHIP',
            description: 'Full stack development role working on healthcare dashboards.',
            degree: 'BAMS',
            department: 'Dravyaguna',
            minCgpa: 7.5,
            skillIds: [
                { skillId: s1.data.skillId, isRequired: true }, // JavaScript
                { skillId: s2.data.skillId, isRequired: true }, // React
            ],
        }, { headers: { Authorization: `Bearer ${indToken}` } });
        const opp1Id = opp1Res.data.id;
        console.log('  PASS: Created Opportunity 1 (Requires JS & React, Min CGPA 7.5)');
        // Opp 2: Student is NOT ELIGIBLE (Missing required Node.js and Docker)
        const opp2Res = await api.post(`${API_BASE}/opportunities`, {
            title: 'Cloud Backend Engineer',
            type: 'JOB',
            description: 'Design backend APIs and deploy microservices.',
            degree: 'BAMS',
            minCgpa: 7.0,
            skillIds: [
                { skillId: nodeSkill.id, isRequired: true },
                { skillId: dockerSkill.id, isRequired: true },
            ],
        }, { headers: { Authorization: `Bearer ${indToken}` } });
        const opp2Id = opp2Res.data.id;
        console.log('  PASS: Created Opportunity 2 (Requires Node.js & Docker - Missing from student)');
        // Opp 3: Student is NOT ELIGIBLE due to High CGPA requirement (Requires 9.5, student has 8.4)
        const opp3Res = await api.post(`${API_BASE}/opportunities`, {
            title: 'Principal Research Scientist',
            type: 'JOB',
            description: 'Leading analytical drug validation experiments.',
            degree: 'BAMS',
            minCgpa: 9.5,
            skillIds: [{ skillId: s1.data.skillId, isRequired: true }],
        }, { headers: { Authorization: `Bearer ${indToken}` } });
        const opp3Id = opp3Res.data.id;
        console.log('  PASS: Created Opportunity 3 (Requires CGPA 9.5 - Student CGPA is 8.4)');
        // 8. Academician Publishes Course Teaching Gap Skill (Node.js)
        console.log('\n[STEP 8] Course Publication & Dynamic Course Recommendation');
        const courseRes = await api.post(`${API_BASE}/courses`, {
            title: 'Mastering Node.js Backend Microservices & REST APIs',
            description: 'Complete backend course covering Node.js, Express, and databases.',
            category: 'Backend Development',
            skillLevel: 'INTERMEDIATE',
            duration: '4 Weeks',
            mode: 'ONLINE',
            certificateAvailable: true,
            status: 'PUBLISHED',
            skillIds: [nodeSkill.id],
        }, { headers: { Authorization: `Bearer ${acadToken}` } });
        console.log('  PASS: Published Course teaching gap skill (Node.js).');
        // 9. Evaluate Dashboard Personalization & Eligibility
        console.log('\n[STEP 9] Real-Time Dashboard Evaluation & Strict Eligibility Verification');
        const dashRes = await api.get(`${API_BASE}/student/dashboard`, {
            headers: { Authorization: `Bearer ${studentToken}` },
        });
        const dash = dashRes.data;
        // Verify Recommended Skills
        console.log('  [Check Recommended Skills]');
        const recNode = dash.recommendedSkills.find((r) => r.skillName === 'Node.js');
        if (recNode && recNode.opportunityCount >= 1) {
            console.log(`    PASS: Node.js recommended (Real DB Count: ${recNode.opportunityCount} openings).`);
            console.log(`    Reason: ${recNode.reason}`);
        }
        else {
            throw new Error('Node.js not recommended properly.');
        }
        // Verify Recommended Courses
        console.log('  [Check Recommended Courses]');
        if (dash.recommendedCourses.length > 0) {
            const topCourse = dash.recommendedCourses[0];
            console.log(`    PASS: Course Recommended: "${topCourse.course.title}"`);
            console.log(`    Reason: ${topCourse.reason}`);
        }
        else {
            throw new Error('Recommended courses list was empty.');
        }
        // Verify Recommended Opportunities & Eligibility Distinctions
        console.log('  [Check Opportunity Eligibility Distinctions]');
        const opp1Match = dash.recommendedOpportunities.find((o) => o.id === opp1Id);
        const opp2Match = dash.recommendedOpportunities.find((o) => o.id === opp2Id);
        const opp3Match = dash.recommendedOpportunities.find((o) => o.id === opp3Id);
        if (opp1Match?.matchResult?.eligibility?.isEligible === true) {
            console.log(`    PASS: Opportunity 1 -> ELIGIBLE (${opp1Match.matchResult.matchPercentage}% match)`);
        }
        else {
            throw new Error('Opportunity 1 should be ELIGIBLE.');
        }
        if (opp2Match?.matchResult?.eligibility?.isEligible === false) {
            console.log(`    PASS: Opportunity 2 -> NOT ELIGIBLE (${opp2Match.matchResult.matchPercentage}% match)`);
            console.log(`    Ineligible Reasons: ${opp2Match.matchResult.eligibility.ineligibleReasons.join(' | ')}`);
        }
        else {
            throw new Error('Opportunity 2 should be NOT ELIGIBLE.');
        }
        if (opp3Match?.matchResult?.eligibility?.isEligible === false) {
            console.log(`    PASS: Opportunity 3 -> NOT ELIGIBLE (CGPA below 9.5)`);
            console.log(`    Ineligible Reasons: ${opp3Match.matchResult.eligibility.ineligibleReasons.join(' | ')}`);
        }
        else {
            throw new Error('Opportunity 3 should be NOT ELIGIBLE.');
        }
        // 10. Strict Backend Apply Submission Enforcement
        console.log('\n[STEP 10] Backend Application Submission Enforcement');
        // Applying to eligible opp1 -> Must SUCCEED
        const apply1 = await api.post(`${API_BASE}/opportunities/${opp1Id}/apply`, { coverLetter: 'I am excited to apply with my strong React and JS background.' }, { headers: { Authorization: `Bearer ${studentToken}` } });
        if (apply1.data.application?.status === 'APPLIED' || apply1.data.status === 'APPLIED') {
            console.log('  PASS: Applied to Opportunity 1 successfully (Status: APPLIED).');
        }
        else {
            throw new Error('Application submission for eligible opportunity failed.');
        }
        // Applying to ineligible opp2 -> Must be REJECTED with HTTP 403
        try {
            await api.post(`${API_BASE}/opportunities/${opp2Id}/apply`, { coverLetter: 'Attempting to apply without required skills' }, { headers: { Authorization: `Bearer ${studentToken}` } });
            throw new Error('FAILED: Ineligible student was allowed to apply (Backend enforcement failure).');
        }
        catch (err) {
            if (err.response && err.response.status === 403) {
                console.log('  PASS: Backend strictly blocked application for ineligible Opportunity 2 (HTTP 403).');
                console.log(`    Server rejection: ${err.response.data.message}`);
            }
            else {
                throw err;
            }
        }
        // Applying to ineligible opp3 -> Must be REJECTED with HTTP 403
        try {
            await api.post(`${API_BASE}/opportunities/${opp3Id}/apply`, { coverLetter: 'Attempting to apply with low CGPA' }, { headers: { Authorization: `Bearer ${studentToken}` } });
            throw new Error('FAILED: Ineligible student was allowed to apply with low CGPA.');
        }
        catch (err) {
            if (err.response && err.response.status === 403) {
                console.log('  PASS: Backend strictly blocked application for Opportunity 3 due to CGPA (HTTP 403).');
            }
            else {
                throw err;
            }
        }
        console.log('\n=================================================================');
        console.log('  ALL CAREER & SKILL DASHBOARD TESTS PASSED WITH 100% SUCCESS!   ');
        console.log('=================================================================');
    }
    catch (err) {
        console.error('\nTEST FAILED:', err.response?.data || err.message);
        process.exit(1);
    }
    finally {
        await db_1.default.$disconnect();
    }
}
runCareerDashboardVerification();
