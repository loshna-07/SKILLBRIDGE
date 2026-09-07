"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("./config/db"));
const BASE_URL = 'http://localhost:5000/api';
async function req(method, path, body, token) {
    const headers = {
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
async function verifyLearningModule() {
    console.log('========================================================================');
    console.log('>>> VERIFYING LEARNING PROGRAMS & SKILL GAP RECOMMENDATIONS MODULE <<<');
    console.log('========================================================================\n');
    // 1. Check backend health
    console.log('[1] Checking backend API health...');
    const health = await req('GET', '/health');
    if (!health.ok)
        throw new Error('Backend health check failed');
    console.log('  -> Health status: OK');
    // 2. Ensure initial clean state
    console.log('\n[2] Verifying initial clean database state (must start empty)...');
    await db_1.default.auditLog.deleteMany({});
    await db_1.default.interview.deleteMany({});
    await db_1.default.applicationStatusHistory.deleteMany({});
    await db_1.default.application.deleteMany({});
    await db_1.default.opportunitySkill.deleteMany({});
    await db_1.default.opportunity.deleteMany({});
    await db_1.default.learningEnrollment.deleteMany({});
    await db_1.default.learningProgramSkill.deleteMany({});
    await db_1.default.learningProgram.deleteMany({});
    await db_1.default.assessmentResponse.deleteMany({});
    await db_1.default.assessmentAttempt.deleteMany({});
    await db_1.default.studentSkillProfile.deleteMany({});
    await db_1.default.questionOption.deleteMany({});
    await db_1.default.question.deleteMany({});
    await db_1.default.assessment.deleteMany({});
    await db_1.default.skill.deleteMany({});
    await db_1.default.skillCategory.deleteMany({});
    await db_1.default.studentEducation.deleteMany({});
    await db_1.default.studentCertification.deleteMany({});
    await db_1.default.studentProject.deleteMany({});
    await db_1.default.studentInternshipExperience.deleteMany({});
    await db_1.default.collaboration.deleteMany({});
    await db_1.default.studentProfile.deleteMany({});
    await db_1.default.academicianProfile.deleteMany({});
    await db_1.default.industryProfile.deleteMany({});
    await db_1.default.institutionProfile.deleteMany({});
    await db_1.default.user.deleteMany({});
    const userCount = await db_1.default.user.count();
    const progCount = await db_1.default.learningProgram.count();
    console.log(`  -> Initial users in DB: ${userCount}, programs: ${progCount}`);
    if (userCount !== 0 || progCount !== 0) {
        throw new Error('Database is not starting empty.');
    }
    // 3. Register Industry User
    console.log('\n[3] Registering Industry Partner...');
    const industryReg = await req('POST', '/auth/register', {
        role: 'INDUSTRY',
        email: 'learning@himalaya-wellness.com',
        password: 'Password@123',
        companyName: 'Himalaya Wellness & Phytomedicine Institute',
        officialEmail: 'learning@himalaya-wellness.com',
        industrySector: 'Phytopharmaceuticals',
        companySize: '1000+',
        website: 'https://himalayawellness.com',
        location: 'Bangalore, India',
        description: 'Global pioneer in herbal healthcare and scientific botanical formulations.',
        contactPerson: 'Dr. Neha Kulkarni',
        contactNumber: '+91 99887 76655',
    });
    if (!industryReg.ok || !industryReg.data?.token) {
        throw new Error(`Industry registration failed: ${JSON.stringify(industryReg.data)}`);
    }
    const industryToken = industryReg.data.token;
    console.log('  -> Industry registered successfully with JWT token.');
    // 4. Seed Verified Competencies (Skills Covered)
    console.log('\n[4] Creating Skill Taxonomy in PostgreSQL...');
    const category = await db_1.default.skillCategory.create({
        data: {
            name: 'Botanical Sciences & Drug Standardization',
            description: 'Phytomedicine quality, analytical testing, and regulatory processes.',
        },
    });
    const skillA = await db_1.default.skill.create({
        data: {
            categoryId: category.id,
            name: 'Ayurvedic Drug Formulation',
            description: 'Standardized extraction, herbal decoction, and rasashastra preparations.',
        },
    });
    const skillB = await db_1.default.skill.create({
        data: {
            categoryId: category.id,
            name: 'Phytochemical Analysis',
            description: 'HPTLC, spectrophotometric characterization, and bioactive quantification.',
        },
    });
    const skillC = await db_1.default.skill.create({
        data: {
            categoryId: category.id,
            name: 'Good Laboratory Practice (GLP)',
            description: 'Standard operating procedures, quality documentation, and laboratory safety compliance.',
        },
    });
    console.log(`  -> Seeded Skills:`);
    console.log(`     - Skill A: ${skillA.name} (${skillA.id})`);
    console.log(`     - Skill B: ${skillB.name} (${skillB.id})`);
    console.log(`     - Skill C: ${skillC.name} (${skillC.id})`);
    // 5. Industry creates Learning Programs across ALL 5 types with Skills Covered
    console.log('\n[5] Industry creates Learning Programs for all 5 required types...');
    // Program 1: TRAINING (teaches Skill A)
    const pTraining = await req('POST', '/learning', {
        title: 'Industrial Herbal Formulation Training',
        type: 'TRAINING',
        description: 'Hands-on practical industrial training in modern herbal manufacturing units.',
        duration: '4 Weeks',
        mode: 'HYBRID',
        price: 'Free / Sponsored',
        startDate: 'October 2026',
        skillIds: [skillA.id],
    }, industryToken);
    if (!pTraining.ok)
        throw new Error(`Failed to create Training: ${JSON.stringify(pTraining.data)}`);
    console.log(`  -> 1. TRAINING created: "${pTraining.data.title}" (teaches ${pTraining.data.skills?.map((s) => s.skill.name).join(', ')})`);
    // Program 2: CERTIFICATION (teaches Skill B)
    const pCert = await req('POST', '/learning', {
        title: 'Advanced Phytochemical Analysis & HPTLC Certification',
        type: 'CERTIFICATION',
        description: 'Certified industry masterclass on chromatographical standardization of medicinal herbs.',
        duration: '6 Weeks',
        mode: 'ONLINE',
        price: 'Free',
        startDate: 'November 2026',
        skillIds: [skillB.id],
    }, industryToken);
    if (!pCert.ok)
        throw new Error(`Failed to create Certification: ${JSON.stringify(pCert.data)}`);
    console.log(`  -> 2. CERTIFICATION created: "${pCert.data.title}" (teaches ${pCert.data.skills?.map((s) => s.skill.name).join(', ')})`);
    // Program 3: WORKSHOP (teaches Skill C)
    const pWorkshop = await req('POST', '/learning', {
        title: 'GLP Standards & Analytical Documentation Workshop',
        type: 'WORKSHOP',
        description: 'Interactive two-day intensive workshop on regulatory audits and laboratory safety.',
        duration: '2 Days (16 Hours)',
        mode: 'OFFLINE',
        price: 'Free',
        startDate: 'October 15, 2026',
        skillIds: [skillC.id],
    }, industryToken);
    if (!pWorkshop.ok)
        throw new Error(`Failed to create Workshop: ${JSON.stringify(pWorkshop.data)}`);
    console.log(`  -> 3. WORKSHOP created: "${pWorkshop.data.title}" (teaches ${pWorkshop.data.skills?.map((s) => s.skill.name).join(', ')})`);
    // Program 4: BOOTCAMP (teaches Skill A + Skill B)
    const pBootcamp = await req('POST', '/learning', {
        title: 'Standardized Phytomedicine & Formulation Bootcamp',
        type: 'BOOTCAMP',
        description: 'Comprehensive 8-week bootcamp covering end-to-end drug extraction, formulation, and analytical validation.',
        duration: '8 Weeks',
        mode: 'HYBRID',
        price: 'Scholarship Available',
        startDate: 'December 2026',
        skillIds: [skillA.id, skillB.id],
    }, industryToken);
    if (!pBootcamp.ok)
        throw new Error(`Failed to create Bootcamp: ${JSON.stringify(pBootcamp.data)}`);
    console.log(`  -> 4. BOOTCAMP created: "${pBootcamp.data.title}" (teaches ${pBootcamp.data.skills?.map((s) => s.skill.name).join(', ')})`);
    // Program 5: MENTORSHIP (teaches Skill C)
    const pMentorship = await req('POST', '/learning', {
        title: 'Executive Quality & Compliance Mentorship',
        type: 'MENTORSHIP',
        description: '1-on-1 mentorship with Himalaya Chief Scientists in Good Laboratory Practice and regulatory compliance.',
        duration: '3 Months',
        mode: 'ONLINE',
        price: 'Free',
        startDate: 'Rolling',
        skillIds: [skillC.id],
    }, industryToken);
    if (!pMentorship.ok)
        throw new Error(`Failed to create Mentorship: ${JSON.stringify(pMentorship.data)}`);
    console.log(`  -> 5. MENTORSHIP created: "${pMentorship.data.title}" (teaches ${pMentorship.data.skills?.map((s) => s.skill.name).join(', ')})`);
    // 6. Verify Industry Provider Management
    console.log('\n[6] Testing Industry Provider Management endpoints...');
    const myCreated = await req('GET', '/learning/my/created', undefined, industryToken);
    if (!myCreated.ok || !Array.isArray(myCreated.data) || myCreated.data.length !== 5) {
        throw new Error(`Expected 5 created programs, got: ${myCreated.data?.length}`);
    }
    console.log(`  -> Industry correctly retrieved ${myCreated.data.length} created programs.`);
    // Edit Bootcamp duration
    const updateRes = await req('PUT', `/learning/${pBootcamp.data.id}`, {
        duration: '10 Weeks Intensive',
        description: 'Updated 10-week comprehensive intensive bootcamp.',
    }, industryToken);
    if (!updateRes.ok || updateRes.data.duration !== '10 Weeks Intensive') {
        throw new Error(`Failed to update program: ${JSON.stringify(updateRes.data)}`);
    }
    console.log('  -> Industry updated Bootcamp duration to: "10 Weeks Intensive".');
    // 7. Register Student
    console.log('\n[7] Registering Student Candidate...');
    const studentReg = await req('POST', '/auth/register', {
        role: 'STUDENT',
        email: 'kavya.student@ayurveda.ac.in',
        password: 'Password@123',
        fullName: 'Kavya Nair',
        phone: '+91 98765 12345',
        dob: '2002-08-20',
        gender: 'Female',
        institutionName: 'Government Ayurveda College',
        department: 'Ayurvedic Medicine & Surgery',
        degree: 'BAMS',
        currentYear: 4,
        cgpa: 8.4,
        graduationYear: 2026,
        location: 'Kerala, India',
    });
    if (!studentReg.ok || !studentReg.data?.token) {
        throw new Error(`Student registration failed: ${JSON.stringify(studentReg.data)}`);
    }
    const studentToken = studentReg.data.token;
    const studentUserId = studentReg.data.user.id;
    const studentProfile = await db_1.default.studentProfile.findUnique({ where: { userId: studentUserId } });
    if (!studentProfile)
        throw new Error('Student profile missing');
    console.log(`  -> Student registered: ${studentProfile.fullName}`);
    // 8. Generate Realistic Skill Gaps for the Student
    console.log('\n[8] Generating Realistic Student Skill Gaps (Performance Deficit + Market Demand Deficit)...');
    // Gap 1 (Performance Gap): Student took Skill A (Formulation) but scored low (42% < 60%)
    await db_1.default.studentSkillProfile.create({
        data: {
            studentId: studentProfile.id,
            skillId: skillA.id,
            proficiencyLevel: 'BEGINNER',
            scorePercentage: 42,
            verified: true,
            lastAssessedAt: new Date(),
        },
    });
    console.log('  -> Performance Gap Created: Ayurvedic Drug Formulation (Score: 42% < 60% benchmark)');
    // Gap 2 (Market Demand Gap): Industry creates an opportunity requiring Skill B (Phytochemical Analysis)
    const industryOpp = await req('POST', '/opportunities', {
        title: 'Junior Phytochemist Trainee',
        type: 'INTERNSHIP',
        description: 'Requires analytical chemistry and HPTLC testing.',
        skillIds: [{ skillId: skillB.id, isRequired: true }],
    }, industryToken);
    if (!industryOpp.ok)
        throw new Error('Failed to create opportunity');
    console.log('  -> Market Demand Gap Created: Phytochemical Analysis (demanded by active industry internship)');
    // 9. Connect to Skill Gap Analysis: Verify Real Database Recommendations
    console.log('\n[9] Querying Student Skill Gap Analysis & Verifying Real DB Program Recommendations...');
    const skillGapRes = await req('GET', '/student/skill-gap', undefined, studentToken);
    if (!skillGapRes.ok || !Array.isArray(skillGapRes.data?.skillGaps)) {
        throw new Error(`Skill gap analysis failed: ${JSON.stringify(skillGapRes.data)}`);
    }
    const { skillGaps, recommendedPrograms } = skillGapRes.data;
    console.log(`  -> Identified Skill Gaps Count: ${skillGaps.length}`);
    skillGaps.forEach((g, i) => {
        console.log(`     ${i + 1}. [${g.gapType}] ${g.skillName} (Current: ${g.currentScore}%, Target: ${g.targetScore}%)`);
        console.log(`        Targeted DB Programs Attached: ${g.recommendedPrograms?.map((p) => p.title).join(' | ')}`);
    });
    const gapSkillNames = skillGaps.map((g) => g.skillName);
    if (!gapSkillNames.includes(skillA.name) || !gapSkillNames.includes(skillB.name)) {
        throw new Error('Skill gaps did not accurately detect both Skill A and Skill B!');
    }
    // Verify overall recommendedPrograms from actual database
    console.log(`\n  -> Overall Database-Driven Recommended Programs Count: ${recommendedPrograms?.length}`);
    recommendedPrograms.forEach((p, idx) => {
        console.log(`     ${idx + 1}. [${p.type}] "${p.title}" - Bridges Gaps: [${p.addressedGaps.join(', ')}]`);
    });
    if (!recommendedPrograms || recommendedPrograms.length === 0) {
        throw new Error('Expected recommended programs from database, got 0!');
    }
    // Verify that the Bootcamp (which bridges BOTH gaps) is ranked #1
    if (recommendedPrograms[0].id !== pBootcamp.data.id) {
        throw new Error(`Expected Bootcamp to be ranked #1 as it addresses both gaps, but found: ${recommendedPrograms[0].title}`);
    }
    console.log('  -> Ranked #1: Bootcamp correctly prioritized because it addresses multiple identified gaps.');
    // Verify that programs NOT teaching any gap skills (Mentorship & Workshop teaching only Skill C) are NOT falsely recommended
    const recommendedIds = recommendedPrograms.map((p) => p.id);
    if (recommendedIds.includes(pWorkshop.data.id) || recommendedIds.includes(pMentorship.data.id)) {
        throw new Error('Programs teaching unrelated skills (Skill C) were incorrectly included in recommendations!');
    }
    console.log('  -> Negative Verification: Programs teaching non-gap skills were excluded from recommendations.');
    // 10. Student Browsing, Filtering & Search
    console.log('\n[10] Testing Student Browsing, Filtering, and Search...');
    // Browse all programs
    const allProgsRes = await req('GET', '/learning', undefined, studentToken);
    if (!allProgsRes.ok || allProgsRes.data.length !== 5) {
        throw new Error(`Expected 5 total published programs, got ${allProgsRes.data?.length}`);
    }
    console.log(`  -> Browse All: Returned ${allProgsRes.data.length} programs.`);
    // Filter by Type: BOOTCAMP
    const bootcampFilterRes = await req('GET', '/learning?type=BOOTCAMP', undefined, studentToken);
    if (!bootcampFilterRes.ok || bootcampFilterRes.data.length !== 1 || bootcampFilterRes.data[0].type !== 'BOOTCAMP') {
        throw new Error('Filtering by BOOTCAMP failed');
    }
    console.log(`  -> Filter by BOOTCAMP: Returned 1 program ("${bootcampFilterRes.data[0].title}").`);
    // Filter by Recommendations: recommendations=true
    const recFilterRes = await req('GET', '/learning?recommendations=true', undefined, studentToken);
    if (!recFilterRes.ok || recFilterRes.data.length !== 3) {
        throw new Error(`Expected 3 gap-addressing programs in recommended filter, got ${recFilterRes.data?.length}`);
    }
    console.log(`  -> Filter by Recommendations (recommendations=true): Returned ${recFilterRes.data.length} programs.`);
    // Search by Keyword: "Phytochemical"
    const searchRes = await req('GET', '/learning?search=Phytochemical', undefined, studentToken);
    if (!searchRes.ok || searchRes.data.length < 2) {
        throw new Error(`Search for 'Phytochemical' expected >= 2 results, got ${searchRes.data?.length}`);
    }
    console.log(`  -> Search by Keyword ("Phytochemical"): Returned ${searchRes.data.length} matching programs.`);
    // 11. Student Views Details & Enrolls
    console.log('\n[11] Student views program details and registers...');
    const detailRes = await req('GET', `/learning/${pBootcamp.data.id}`, undefined, studentToken);
    if (!detailRes.ok || detailRes.data.isEnrolled !== false) {
        throw new Error('Initial program details isEnrolled should be false');
    }
    console.log(`  -> Viewed program: "${detailRes.data.title}", Mode: ${detailRes.data.mode}, isEnrolled: ${detailRes.data.isEnrolled}`);
    const enrollRes = await req('POST', `/learning/${pBootcamp.data.id}/enroll`, {}, studentToken);
    if (!enrollRes.ok || enrollRes.data.enrollment?.status !== 'ENROLLED') {
        throw new Error(`Enrollment failed: ${JSON.stringify(enrollRes.data)}`);
    }
    console.log(`  -> Successfully enrolled! Enrollment ID: ${enrollRes.data.enrollment.id}, Status: ${enrollRes.data.enrollment.status}`);
    // Prevent duplicate enrollment
    const dupEnrollRes = await req('POST', `/learning/${pBootcamp.data.id}/enroll`, {}, studentToken);
    if (dupEnrollRes.status !== 400) {
        throw new Error('Duplicate enrollment was not prevented!');
    }
    console.log('  -> Duplicate enrollment rejected (400 Bad Request).');
    // Verify student view reflects isEnrolled: true
    const afterEnrollDetail = await req('GET', `/learning/${pBootcamp.data.id}`, undefined, studentToken);
    if (!afterEnrollDetail.data.isEnrolled) {
        throw new Error('Program details did not reflect isEnrolled: true');
    }
    console.log('  -> Verified program details now shows isEnrolled: true.');
    // Student checks enrolled list
    const myEnrollments = await req('GET', '/learning/my/enrollments', undefined, studentToken);
    if (!myEnrollments.ok || myEnrollments.data.length !== 1) {
        throw new Error('Student enrollments list did not return enrolled program');
    }
    console.log(`  -> Student /learning/my/enrollments verified: 1 enrolled program.`);
    // Industry checks participant counter
    const industryCheck = await req('GET', '/learning/my/created', undefined, industryToken);
    const enrolledBootcamp = industryCheck.data.find((p) => p.id === pBootcamp.data.id);
    if (enrolledBootcamp?._count?.enrollments !== 1) {
        throw new Error(`Expected industry enrollments count to be 1, got ${enrolledBootcamp?._count?.enrollments}`);
    }
    console.log(`  -> Industry view verified: Bootcamp enrollments count incremented to 1.`);
    // 12. Program Deletion & Cascade Test
    console.log('\n[12] Testing Program Deletion & Cascading...');
    const tempProg = await req('POST', '/learning', {
        title: 'Temporary Deletion Test Program',
        type: 'WORKSHOP',
        description: 'Testing deletion.',
        skillIds: [skillC.id],
    }, industryToken);
    if (!tempProg.ok)
        throw new Error('Failed to create temp program');
    const deleteRes = await req('DELETE', `/learning/${tempProg.data.id}`, undefined, industryToken);
    if (!deleteRes.ok)
        throw new Error('Failed to delete program');
    console.log('  -> Program successfully deleted.');
    // 13. Teardown & Clean Database State
    console.log('\n[13] Tearing down test entities and verifying clean empty database...');
    await db_1.default.auditLog.deleteMany({});
    await db_1.default.interview.deleteMany({});
    await db_1.default.applicationStatusHistory.deleteMany({});
    await db_1.default.application.deleteMany({});
    await db_1.default.opportunitySkill.deleteMany({});
    await db_1.default.opportunity.deleteMany({});
    await db_1.default.learningEnrollment.deleteMany({});
    await db_1.default.learningProgramSkill.deleteMany({});
    await db_1.default.learningProgram.deleteMany({});
    await db_1.default.studentSkillProfile.deleteMany({});
    await db_1.default.skill.deleteMany({});
    await db_1.default.skillCategory.deleteMany({});
    await db_1.default.studentProfile.deleteMany({});
    await db_1.default.industryProfile.deleteMany({});
    await db_1.default.user.deleteMany({});
    const finalUsers = await db_1.default.user.count();
    const finalProgs = await db_1.default.learningProgram.count();
    const finalEnrollments = await db_1.default.learningEnrollment.count();
    console.log(`  -> Final Users in DB: ${finalUsers}`);
    console.log(`  -> Final Learning Programs in DB: ${finalProgs}`);
    console.log(`  -> Final Enrollments in DB: ${finalEnrollments}`);
    if (finalUsers !== 0 || finalProgs !== 0 || finalEnrollments !== 0) {
        throw new Error('Database teardown did not restore 0 clean state.');
    }
    console.log('\n========================================================================');
    console.log('>>> ALL LEARNING PROGRAM & SKILL GAP REQUIREMENTS VERIFIED (100%) <<<');
    console.log('========================================================================\n');
}
verifyLearningModule()
    .catch((err) => {
    console.error('\n❌ LEARNING MODULE VERIFICATION FAILED:', err);
    process.exit(1);
})
    .finally(async () => {
    await db_1.default.$disconnect();
});
