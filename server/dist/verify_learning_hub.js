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
    patch: async (url, body, config) => {
        const res = await fetch(url, {
            method: 'PATCH',
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
async function runLearningHubVerification() {
    console.log('=====================================================');
    console.log('   SKILLBRIDGE LEARNING HUB E2E VERIFICATION SUITE   ');
    console.log('=====================================================');
    try {
        // 0. Clean database setup
        await db_1.default.courseCertificate.deleteMany({});
        await db_1.default.courseLessonProgress.deleteMany({});
        await db_1.default.courseEnrollment.deleteMany({});
        await db_1.default.courseLesson.deleteMany({});
        await db_1.default.courseModule.deleteMany({});
        await db_1.default.courseSkill.deleteMany({});
        await db_1.default.course.deleteMany({});
        await db_1.default.studentSkillProfile.deleteMany({});
        await db_1.default.skill.deleteMany({});
        await db_1.default.skillCategory.deleteMany({});
        await db_1.default.studentProfile.deleteMany({});
        await db_1.default.academicianProfile.deleteMany({});
        await db_1.default.industryProfile.deleteMany({});
        await db_1.default.institutionProfile.deleteMany({});
        await db_1.default.auditLog.deleteMany({});
        await db_1.default.user.deleteMany({});
        console.log('\n[CHECK 1] Clean Database & Empty Course Catalog State');
        const emptyCoursesRes = await api.get(`${API_BASE}/courses`);
        if (Array.isArray(emptyCoursesRes.data) && emptyCoursesRes.data.length === 0) {
            console.log('  PASS: Public courses endpoint returns empty array for clean database.');
        }
        else {
            throw new Error('Course endpoint did not return empty array initially.');
        }
        // Register 4 test actors
        console.log('\n[CHECK 2] User Registration & Role Enforcement');
        const studentRes = await api.post(`${API_BASE}/auth/register`, {
            role: 'STUDENT',
            email: 'learner.arjun@ayurveda.edu',
            password: 'Password@123',
            fullName: 'Arjun Verma',
            institutionName: 'National Institute of Ayurveda',
            department: 'Dravyaguna',
            degree: 'BAMS',
            cgpa: '8.4',
        });
        const studentToken = studentRes.data.token;
        console.log('  PASS: Student registered successfully.');
        const academicianRes = await api.post(`${API_BASE}/auth/register`, {
            role: 'ACADEMICIAN',
            email: 'dr.sharma@ayurveda.edu',
            password: 'Password@123',
            fullName: 'Dr. Ramesh Sharma',
            institutionName: 'National Institute of Ayurveda',
            department: 'Dravyaguna Vigyan',
            designation: 'Associate Professor',
        });
        const acadToken = academicianRes.data.token;
        console.log('  PASS: Academician registered successfully.');
        const industryRes = await api.post(`${API_BASE}/auth/register`, {
            role: 'INDUSTRY',
            email: 'director@dabur-research.com',
            password: 'Password@123',
            fullName: 'Director Dabur',
            companyName: 'Dabur Herbal Research',
            officialEmail: 'director@dabur-research.com',
            industrySector: 'Ayurvedic Pharmaceuticals',
        });
        const indToken = industryRes.data.token;
        console.log('  PASS: Industry partner registered successfully.');
        // 2b. RBAC: Student must NOT be able to create courses (403)
        try {
            await api.post(`${API_BASE}/courses`, {
                title: 'Unauthorized Student Course',
                description: 'Students cannot publish courses',
                category: 'Test',
                duration: '1 Week',
            }, { headers: { Authorization: `Bearer ${studentToken}` } });
            throw new Error('FAILED: Student was allowed to create a course (RBAC failure).');
        }
        catch (err) {
            if (err.response && err.response.status === 403) {
                console.log('  PASS: Student forbidden from creating courses (HTTP 403 enforced).');
            }
            else {
                throw err;
            }
        }
        // 3. Create Skills Taxonomy
        console.log('\n[CHECK 3] Taxonomy & Skill Gap Setup');
        const skillCat = await db_1.default.skillCategory.create({
            data: { name: 'Ayurvedic Pharmacognosy', description: 'Drug identification and testing' },
        });
        const skill1 = await db_1.default.skill.create({
            data: { categoryId: skillCat.id, name: 'HPTLC Fingerprinting', description: 'Chromatographic purity testing' },
        });
        const skill2 = await db_1.default.skill.create({
            data: { categoryId: skillCat.id, name: 'Heavy Metal Profiling', description: 'Toxicological and safety assay' },
        });
        console.log('  PASS: Skills created:', skill1.name, ',', skill2.name);
        // Give student a gap in skill1 (e.g. score < 60%)
        const studentProfile = await db_1.default.studentProfile.findFirst({ where: { user: { email: 'learner.arjun@ayurveda.edu' } } });
        await db_1.default.studentSkillProfile.create({
            data: {
                studentId: studentProfile.id,
                skillId: skill1.id,
                proficiencyLevel: 'BEGINNER',
                scorePercentage: 40.0,
            },
        });
        console.log('  PASS: Student competency evaluated with gap in HPTLC Fingerprinting (40% score).');
        // 4. Provider Creates Course in DRAFT
        console.log('\n[CHECK 4] Course Authoring, Syllabus Builder & Lifecycle');
        const createCourseRes = await api.post(`${API_BASE}/courses`, {
            title: 'Masterclass in HPTLC Standardization & Quality Control',
            description: 'Comprehensive laboratory course covering botanical extract testing and heavy metal profiling.',
            category: 'Pharmacognosy',
            skillLevel: 'INTERMEDIATE',
            duration: '4 Weeks',
            mode: 'ONLINE',
            prerequisites: 'Basic knowledge of Ayurvedic formulation principles.',
            learningOutcomes: '1. Standardize herbal extracts\n2. Detect adulterants using HPTLC',
            certificateAvailable: true,
            status: 'DRAFT',
            skillIds: [skill1.id, skill2.id],
        }, { headers: { Authorization: `Bearer ${acadToken}` } });
        const courseId = createCourseRes.data.course.id;
        console.log('  PASS: Course created in DRAFT state by Academician. ID:', courseId);
        // Verify DRAFT course is not in public catalog
        const pubCheck1 = await api.get(`${API_BASE}/courses`);
        if (pubCheck1.data.length === 0) {
            console.log('  PASS: DRAFT course is hidden from public catalog.');
        }
        else {
            throw new Error('DRAFT course was visible in public catalog.');
        }
        // Add Modules & Lessons
        const mod1Res = await api.post(`${API_BASE}/courses/${courseId}/modules`, { title: 'Module 1: Principles of Chromatographic Extraction' }, { headers: { Authorization: `Bearer ${acadToken}` } });
        const mod1Id = mod1Res.data.module.id;
        const lesson1Res = await api.post(`${API_BASE}/courses/${courseId}/modules/${mod1Id}/lessons`, { title: 'Sample Preparation & Solvent Selection', content: 'Detailed lecture notes on polar vs non-polar solvents.', durationMinutes: 20 }, { headers: { Authorization: `Bearer ${acadToken}` } });
        const lesson1Id = lesson1Res.data.lesson.id;
        const lesson2Res = await api.post(`${API_BASE}/courses/${courseId}/modules/${mod1Id}/lessons`, { title: 'TLC Plate Development & Visualization', content: 'Drying and derivatization with vanillin-sulfuric acid reagent.', durationMinutes: 25 }, { headers: { Authorization: `Bearer ${acadToken}` } });
        const lesson2Id = lesson2Res.data.lesson.id;
        const mod2Res = await api.post(`${API_BASE}/courses/${courseId}/modules`, { title: 'Module 2: Spectral Analysis & Verification' }, { headers: { Authorization: `Bearer ${acadToken}` } });
        const mod2Id = mod2Res.data.module.id;
        const lesson3Res = await api.post(`${API_BASE}/courses/${courseId}/modules/${mod2Id}/lessons`, { title: 'Densitometric Scanning at UV 254nm & 366nm', content: 'Peak identification and Rf value calculation.', durationMinutes: 30 }, { headers: { Authorization: `Bearer ${acadToken}` } });
        const lesson3Id = lesson3Res.data.lesson.id;
        const lesson4Res = await api.post(`${API_BASE}/courses/${courseId}/modules/${mod2Id}/lessons`, { title: 'Final Quality Audit & Certification Review', content: 'Documentation for AYUSH compliance.', durationMinutes: 15 }, { headers: { Authorization: `Bearer ${acadToken}` } });
        const lesson4Id = lesson4Res.data.lesson.id;
        console.log('  PASS: 2 Modules & 4 Lessons successfully added to course curriculum.');
        // Publish the course
        await api.patch(`${API_BASE}/courses/${courseId}/status`, { status: 'PUBLISHED' }, { headers: { Authorization: `Bearer ${acadToken}` } });
        console.log('  PASS: Course status transitioned to PUBLISHED.');
        // Verify course is now in catalog
        const pubCheck2 = await api.get(`${API_BASE}/courses`);
        if (pubCheck2.data.length === 1 && pubCheck2.data[0].id === courseId) {
            console.log('  PASS: Course is now discoverable in public catalog (Total Lessons: 4).');
        }
        else {
            throw new Error('Published course not appearing in catalog.');
        }
        // 5. Skill Gap Recommendations
        console.log('\n[CHECK 5] Skill Gap Recommendation Engine');
        const recRes = await api.get(`${API_BASE}/courses/recommendations`, {
            headers: { Authorization: `Bearer ${studentToken}` },
        });
        if (recRes.data.recommendations && recRes.data.recommendations.length > 0) {
            const topRec = recRes.data.recommendations[0];
            console.log('  PASS: Recommendation generated successfully:');
            console.log(`    - Course: ${topRec.course.title}`);
            console.log(`    - Match: ${topRec.matchPercentage}%`);
            console.log(`    - Reason: ${topRec.reason}`);
            console.log(`    - Addressed Gaps: ${topRec.addressedGaps.join(', ')}`);
        }
        else {
            throw new Error('Recommendation engine failed to match student gap.');
        }
        // 6. Student Enrollment
        console.log('\n[CHECK 6] Student Course Enrollment');
        const enrollRes = await api.post(`${API_BASE}/courses/${courseId}/enroll`, {}, { headers: { Authorization: `Bearer ${studentToken}` } });
        console.log('  PASS: Student successfully enrolled in course.');
        // Verify enrolled courses list
        const myCoursesRes = await api.get(`${API_BASE}/courses/my/enrolled`, {
            headers: { Authorization: `Bearer ${studentToken}` },
        });
        if (myCoursesRes.data.length === 1 && myCoursesRes.data[0].progressPercentage === 0) {
            console.log('  PASS: Enrolled course listed in My Courses with 0% initial progress.');
        }
        else {
            throw new Error('My Courses did not reflect new enrollment properly.');
        }
        // 7. Interactive Lesson Progress & Dynamic Calculation
        console.log('\n[CHECK 7] Dynamic Lesson Progress Calculation');
        // Complete Lesson 1 (1/4 = 25%)
        const p1 = await api.post(`${API_BASE}/courses/${courseId}/lessons/${lesson1Id}/toggle`, { isCompleted: true }, { headers: { Authorization: `Bearer ${studentToken}` } });
        console.log(`  PASS: Completed Lesson 1 -> Progress: ${p1.data.progressPercentage}% (Expected 25%)`);
        if (p1.data.progressPercentage !== 25)
            throw new Error('Progress calculation error on step 1.');
        // Complete Lesson 2 (2/4 = 50%)
        const p2 = await api.post(`${API_BASE}/courses/${courseId}/lessons/${lesson2Id}/toggle`, { isCompleted: true }, { headers: { Authorization: `Bearer ${studentToken}` } });
        console.log(`  PASS: Completed Lesson 2 -> Progress: ${p2.data.progressPercentage}% (Expected 50%)`);
        if (p2.data.progressPercentage !== 50)
            throw new Error('Progress calculation error on step 2.');
        // Complete Lesson 3 (3/4 = 75%)
        const p3 = await api.post(`${API_BASE}/courses/${courseId}/lessons/${lesson3Id}/toggle`, { isCompleted: true }, { headers: { Authorization: `Bearer ${studentToken}` } });
        console.log(`  PASS: Completed Lesson 3 -> Progress: ${p3.data.progressPercentage}% (Expected 75%)`);
        if (p3.data.progressPercentage !== 75)
            throw new Error('Progress calculation error on step 3.');
        // Complete Lesson 4 (4/4 = 100%)
        const p4 = await api.post(`${API_BASE}/courses/${courseId}/lessons/${lesson4Id}/toggle`, { isCompleted: true }, { headers: { Authorization: `Bearer ${studentToken}` } });
        console.log(`  PASS: Completed Lesson 4 -> Progress: ${p4.data.progressPercentage}% (Expected 100% - COMPLETED)`);
        if (p4.data.progressPercentage !== 100 || !p4.data.isCompleted) {
            throw new Error('Course should be marked 100% completed.');
        }
        // 8. Certificate Generation & Verification
        console.log('\n[CHECK 8] Certificate Request & Provider Approval');
        const certReqRes = await api.post(`${API_BASE}/courses/${courseId}/certificate/request`, {}, { headers: { Authorization: `Bearer ${studentToken}` } });
        const cert = certReqRes.data.certificate;
        console.log('  PASS: Certificate request generated:');
        console.log(`    - Code: ${cert.certificateCode}`);
        console.log(`    - Initial Status: ${cert.verificationStatus} (Expected: PENDING)`);
        if (cert.verificationStatus !== 'PENDING')
            throw new Error('Certificate was not in PENDING status.');
        // Academician checks participants and approves
        const partRes = await api.get(`${API_BASE}/courses/${courseId}/participants`, {
            headers: { Authorization: `Bearer ${acadToken}` },
        });
        if (partRes.data.length === 1 && partRes.data[0].certificate?.id === cert.id) {
            console.log('  PASS: Provider successfully retrieved enrolled student with pending certificate.');
        }
        else {
            throw new Error('Provider could not see certificate in participants roster.');
        }
        // Approve Certificate
        const approveRes = await api.post(`${API_BASE}/courses/${courseId}/certificates/${cert.id}/approve`, { status: 'VERIFIED', remarks: 'All laboratory assays verified with excellence.' }, { headers: { Authorization: `Bearer ${acadToken}` } });
        console.log('  PASS: Provider approved certificate -> Status:', approveRes.data.certificate.verificationStatus);
        if (approveRes.data.certificate.verificationStatus !== 'VERIFIED') {
            throw new Error('Certificate approval failed.');
        }
        // 9. Digital Portfolio Integration
        console.log('\n[CHECK 9] Digital Portfolio Integration');
        const portfolioRes = await api.get(`${API_BASE}/student/portfolio`, {
            headers: { Authorization: `Bearer ${studentToken}` },
        });
        if (portfolioRes.data.courseCertificates && portfolioRes.data.courseCertificates.length > 0) {
            const pCert = portfolioRes.data.courseCertificates[0];
            console.log('  PASS: Verified Course Certificate automatically present in Student Digital Portfolio:');
            console.log(`    - Course Title: ${pCert.courseTitle}`);
            console.log(`    - Certificate Code: ${pCert.certificateCode}`);
            console.log(`    - Verification Status: ${pCert.verificationStatus}`);
        }
        else {
            throw new Error('Verified course certificate was missing from Digital Portfolio.');
        }
        console.log('\n=====================================================');
        console.log('   ALL 9 LEARNING HUB CHECKS PASSED WITH 100% SUCCESS! ');
        console.log('=====================================================');
    }
    catch (err) {
        console.error('\nVERIFICATION FAILED:', err.response?.data || err.message);
        process.exit(1);
    }
    finally {
        await db_1.default.$disconnect();
    }
}
runLearningHubVerification();
