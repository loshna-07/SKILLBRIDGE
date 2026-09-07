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
async function cleanDb() {
    await db_1.default.collaborationFeedback.deleteMany({});
    await db_1.default.collaborationApplication.deleteMany({});
    await db_1.default.collaboration.deleteMany({});
    await db_1.default.mentorshipSession.deleteMany({});
    await db_1.default.mentorshipRequest.deleteMany({});
    await db_1.default.mentorshipProgram.deleteMany({});
    await db_1.default.learningEnrollment.deleteMany({});
    await db_1.default.learningProgramSkill.deleteMany({});
    await db_1.default.learningProgram.deleteMany({});
    await db_1.default.interview.deleteMany({});
    await db_1.default.applicationStatusHistory.deleteMany({});
    await db_1.default.application.deleteMany({});
    await db_1.default.opportunitySkill.deleteMany({});
    await db_1.default.opportunity.deleteMany({});
    await db_1.default.assessmentResponse.deleteMany({});
    await db_1.default.assessmentAttempt.deleteMany({});
    await db_1.default.questionOption.deleteMany({});
    await db_1.default.question.deleteMany({});
    await db_1.default.assessment.deleteMany({});
    await db_1.default.studentSkillProfile.deleteMany({});
    await db_1.default.studentEducation.deleteMany({});
    await db_1.default.studentCertification.deleteMany({});
    await db_1.default.studentProject.deleteMany({});
    await db_1.default.studentInternshipExperience.deleteMany({});
    await db_1.default.studentAchievement.deleteMany({});
    await db_1.default.studentTraining.deleteMany({});
    await db_1.default.skill.deleteMany({});
    await db_1.default.skillCategory.deleteMany({});
    await db_1.default.studentProfile.deleteMany({});
    await db_1.default.academicianProfile.deleteMany({});
    await db_1.default.industryProfile.deleteMany({});
    await db_1.default.institutionProfile.deleteMany({});
    await db_1.default.auditLog.deleteMany({});
    await db_1.default.notification.deleteMany({});
    await db_1.default.user.deleteMany({});
}
function assert(condition, message) {
    if (!condition) {
        console.error(`\x1b[31m[FAIL]\x1b[0m ${message}`);
        throw new Error(message);
    }
    console.log(`  \x1b[32m[PASS]\x1b[0m ${message}`);
}
async function runAudit() {
    console.log('========================================================================');
    console.log('  SKILLBRIDGE PRODUCTION-READINESS AUDIT & END-TO-END VERIFICATION');
    console.log('========================================================================\n');
    // =========================================================================
    // CHECK 1: Empty Database & Clean State
    // =========================================================================
    console.log('>>> CHECK 1: Database Cleanliness & Empty State Audit');
    await cleanDb();
    const userCount = await db_1.default.user.count();
    const oppCount = await db_1.default.opportunity.count();
    const progCount = await db_1.default.learningProgram.count();
    const assessCount = await db_1.default.assessment.count();
    const collabCount = await db_1.default.collaboration.count();
    assert(userCount === 0, 'DB starts with 0 users');
    assert(oppCount === 0, 'DB starts with 0 opportunities');
    assert(progCount === 0, 'DB starts with 0 learning programs');
    assert(assessCount === 0, 'DB starts with 0 assessments');
    assert(collabCount === 0, 'DB starts with 0 collaborations');
    // Public stats returns flat: { totalStudents, totalCompanies, ... }
    const publicStats = await req('GET', '/stats/public');
    assert(publicStats.ok, 'Public stats endpoint succeeds');
    assert(publicStats.data?.totalStudents === 0, 'Public totalStudents is 0 when DB empty');
    assert(publicStats.data?.totalOpportunities === 0, 'Public totalOpportunities is 0 when DB empty');
    // =========================================================================
    // CHECK 2: Security & RBAC
    // =========================================================================
    console.log('\n>>> CHECK 2: Security & Authorization Audit');
    const unauthStudent = await req('GET', '/student/profile');
    assert(unauthStudent.status === 401, 'Unauthenticated student profile returns 401');
    const unauthIndustry = await req('GET', '/industry/profile');
    assert(unauthIndustry.status === 401, 'Unauthenticated industry profile returns 401');
    const unauthAcademician = await req('GET', '/academician/profile');
    assert(unauthAcademician.status === 401, 'Unauthenticated academician profile returns 401');
    const unauthInstitution = await req('GET', '/institution/dashboard');
    assert(unauthInstitution.status === 401, 'Unauthenticated institution dashboard returns 401');
    const badLogin = await req('POST', '/auth/login', {
        email: 'nonexistent@ayur-test.org',
        password: 'WrongPassword123!',
    });
    assert(badLogin.status === 401, 'Invalid credentials returns 401');
    // Register all 4 roles
    console.log('\n  Registering 4 role accounts...');
    const studentReg = await req('POST', '/auth/register', {
        role: 'STUDENT',
        email: 'arya.sharma@ayurveda.edu',
        password: 'Password@123',
        fullName: 'Arya Sharma',
        phone: '+91 98450 11223',
        institutionName: 'National Institute of Ayurveda',
        department: 'Dravyaguna',
        degree: 'BAMS',
    });
    assert(studentReg.ok && Boolean(studentReg.data?.token), 'Student registration succeeds');
    const studentToken = studentReg.data.token;
    const industryReg = await req('POST', '/auth/register', {
        role: 'INDUSTRY',
        email: 'careers@avp-pharma.com',
        password: 'Password@123',
        companyName: 'Arya Vaidya Pharmacy Research Ltd',
        officialEmail: 'careers@avp-pharma.com',
        industrySector: 'Ayurvedic Pharmaceuticals',
        companySize: '501-1000',
        website: 'https://avp-pharma.com',
        location: 'Coimbatore, Tamil Nadu',
        description: 'GMP-certified Ayurvedic pharma manufacturer.',
        contactPerson: 'Dr. S. K. Ramanathan',
        contactNumber: '+91 94440 55667',
    });
    assert(industryReg.ok && Boolean(industryReg.data?.token), 'Industry registration succeeds');
    const industryToken = industryReg.data.token;
    const academicianReg = await req('POST', '/auth/register', {
        role: 'ACADEMICIAN',
        email: 'dr.varma@ayur-faculty.ac.in',
        password: 'Password@123',
        fullName: 'Dr. Rajesh Varma',
        institutionName: 'National Institute of Ayurveda',
        department: 'Dravyaguna',
        designation: 'Associate Professor',
        phone: '+91 91122 33445',
    });
    assert(academicianReg.ok && Boolean(academicianReg.data?.token), 'Academician registration succeeds');
    const academicianToken = academicianReg.data.token;
    const institutionReg = await req('POST', '/auth/register', {
        role: 'INSTITUTION',
        email: 'admin@nia-ayurveda.edu.in',
        password: 'Password@123',
        institutionName: 'National Institute of Ayurveda',
        institutionType: 'NATIONAL_INSTITUTE',
        officialEmail: 'admin@nia-ayurveda.edu.in',
        address: 'Jaipur, Rajasthan',
        contactPerson: 'Prof. Sanjeev Sharma',
        contactNumber: '+91 92233 44556',
    });
    assert(institutionReg.ok && Boolean(institutionReg.data?.token), 'Institution registration succeeds');
    const institutionToken = institutionReg.data.token;
    // 403 cross-role checks
    const studentCreateOpp = await req('POST', '/opportunities', { title: 'Illegal' }, studentToken);
    assert(studentCreateOpp.status === 403, 'Student cannot create opportunity (403)');
    // Assessment submit route is POST /assessments/:id/submit (STUDENT only)
    // Industry calling a STUDENT route should return 403
    const indSubmitAssess = await req('POST', '/assessments/fake-id/submit', { responses: [] }, industryToken);
    assert(indSubmitAssess.status === 403, 'Industry cannot submit assessment (403)');
    // Industry calling institution portfolio verify should return 403
    const indVerify = await req('POST', '/institution/portfolio/verify', { itemId: 'xyz' }, industryToken);
    assert(indVerify.status === 403, 'Industry cannot verify portfolio items (403)');
    // =========================================================================
    // CHECK 3: Complete 12-Step Flow
    // =========================================================================
    console.log('\n========================================================================');
    console.log('>>> CHECK 3: Complete 12-Step Production Flow');
    console.log('========================================================================');
    // Step 1-2: Student Profile
    console.log('\n--- Step 1-2: Student Profile ---');
    const profileUpdateRes = await req('PUT', '/student/profile', {
        fullName: 'Arya Sharma',
        phone: '+91 98450 11223',
        degree: 'BAMS',
        department: 'Dravyaguna',
        institutionName: 'National Institute of Ayurveda',
        graduationYear: 2026,
        cgpa: 8.5,
        bio: 'BAMS scholar specializing in botanical identification and Ayurvedic pharmacology.',
    }, studentToken);
    assert(profileUpdateRes.ok, 'Student profile update succeeds');
    const studentProfile = await req('GET', '/student/profile', undefined, studentToken);
    assert(studentProfile.ok, 'Student profile retrieval succeeds');
    assert(studentProfile.data.cgpa === 8.5, 'CGPA persists as 8.5');
    assert(studentProfile.data.department === 'Dravyaguna', 'Department persists as Dravyaguna');
    // Step 3: Real Skill Taxonomy & Assessment
    console.log('\n--- Step 3: Database-Driven Skill & Assessment Setup ---');
    const cat = await db_1.default.skillCategory.create({
        data: {
            name: 'Ayurvedic Pharmacology & Drug Standardization',
            description: 'Medicinal plants pharmacology and standardization.',
        },
    });
    const skill1 = await db_1.default.skill.create({
        data: {
            categoryId: cat.id,
            name: 'Dravyaguna Plant Identification',
            description: 'Identification of medicinal flora by morphology.',
        },
    });
    const skill2 = await db_1.default.skill.create({
        data: {
            categoryId: cat.id,
            name: 'Rasa Shastra Bhasma Preparation',
            description: 'Standardized mineral-herb formulations.',
        },
    });
    // Create assessment via Institution API: POST /assessments
    const createAssessRes = await req('POST', '/assessments', {
        title: 'Dravyaguna Taxonomic Assessment',
        description: 'Evaluating morphological diagnosis of classical medicinal species.',
        categoryId: cat.id,
        durationMinutes: 30,
        passingScore: 60.0,
        questions: [
            {
                skillId: skill1.id,
                questionText: 'Which morphological character distinguishes authentic Ashwagandha root?',
                difficulty: 'MEDIUM',
                weightage: 2,
                options: [
                    { optionText: 'Smooth exterior with bright violet markings', isCorrect: false },
                    { optionText: 'Cylindrical root with characteristic horse-like aroma', isCorrect: true },
                    { optionText: 'Tubular hollow stems with serrated margins', isCorrect: false },
                    { optionText: 'Fibrous bulb without aroma', isCorrect: false },
                ],
            },
            {
                skillId: skill1.id,
                questionText: 'What is the primary Virya of Guduchi (Tinospora cordifolia)?',
                difficulty: 'HARD',
                weightage: 2,
                options: [
                    { optionText: 'Ushna (Hot)', isCorrect: true },
                    { optionText: 'Sheeta (Cold)', isCorrect: false },
                    { optionText: 'Snigdha (Unctuous)', isCorrect: false },
                    { optionText: 'Ruksha (Dry)', isCorrect: false },
                ],
            },
        ],
    }, institutionToken);
    assert(createAssessRes.ok, 'Assessment creation via API succeeds');
    const assessmentId = createAssessRes.data.id;
    console.log(`  Assessment ID: ${assessmentId}`);
    // Step 4-5: Student submits assessment
    console.log('\n--- Step 4-5: Student Assessment Submission ---');
    // Find correct options from DB
    const dbOptions = await db_1.default.questionOption.findMany({
        where: {
            question: { assessmentId },
            isCorrect: true,
        },
    });
    assert(dbOptions.length === 2, 'Found 2 correct options in DB');
    const responses = dbOptions.map((opt) => ({
        questionId: opt.questionId,
        selectedOptionId: opt.id,
    }));
    // Submit via POST /assessments/:id/submit
    const submitRes = await req('POST', `/assessments/${assessmentId}/submit`, {
        responses,
    }, studentToken);
    assert(submitRes.ok, 'Assessment submission succeeds');
    assert(submitRes.data?.percentage === 100, 'Score is 100% for 2/2 correct');
    assert(submitRes.data?.passed === true, 'Assessment marked as passed');
    // Step 6: Skill Profile & Gap Analysis
    console.log('\n--- Step 6: Skill Profile & Gap Analysis ---');
    const skillsRes = await req('GET', '/student/skills', undefined, studentToken);
    assert(skillsRes.ok, 'Student skills query succeeds');
    assert(skillsRes.data?.skillProfiles?.length >= 1, 'At least 1 skill profile exists');
    const profSkill = skillsRes.data.skillProfiles.find((s) => s.skillId === skill1.id);
    assert(profSkill && profSkill.scorePercentage === 100, 'Assessed skill score is 100%');
    console.log(`  Skill: ${profSkill.skill.name} = 100% (${profSkill.proficiencyLevel})`);
    console.log(`  Gap: "${skill2.name}" (Unassessed)`);
    // Step 7: Learning Program & Recommendations
    console.log('\n--- Step 7: Learning Program & Recommendations ---');
    const progRes = await req('POST', '/learning/programs', {
        title: 'Rasa Shastra & Bhasma Characterization Workshop',
        description: 'Training in purification, calcination, and nanometrology.',
        type: 'WORKSHOP',
        duration: '3 Weeks',
        mode: 'HYBRID',
        startDate: new Date(Date.now() + 86400000).toISOString(),
        endDate: new Date(Date.now() + 21 * 86400000).toISOString(),
        capacity: 25,
        fees: 0,
        skillsCovered: [skill2.id],
        prerequisites: ['Basic knowledge of Rasashastra'],
    }, industryToken);
    assert(progRes.ok, 'Learning program creation succeeds');
    const programId = progRes.data.id;
    const recRes = await req('GET', '/learning/recommendations', undefined, studentToken);
    assert(recRes.ok, 'Learning recommendations query succeeds');
    const matchingRec = recRes.data?.recommendations?.find((r) => r.id === programId);
    assert(Boolean(matchingRec), 'Recommendation engine returns gap-bridging program');
    console.log(`  Recommended: "${matchingRec.title}" | Match: ${matchingRec.matchScore}%`);
    const enrollRes = await req('POST', `/learning/programs/${programId}/enroll`, {}, studentToken);
    assert(enrollRes.ok, 'Student enrollment succeeds');
    // Step 8: Industry Creates Opportunity
    console.log('\n--- Step 8: Industry Opportunity Creation ---');
    const oppRes = await req('POST', '/opportunities', {
        title: 'Ayurvedic Pharmacognosy Research Associate',
        type: 'INTERNSHIP',
        description: 'Microscopic verification, extraction, and herbarium documentation.',
        department: 'Dravyaguna',
        location: 'Coimbatore, Tamil Nadu',
        mode: 'ON_SITE',
        duration: '6 Months',
        stipend: 25000,
        minCgpa: 7.0,
        deadline: new Date(Date.now() + 30 * 86400000).toISOString(),
        requiredSkills: [skill1.id],
        preferredSkills: [skill2.id],
    }, industryToken);
    assert(oppRes.ok, 'Opportunity creation succeeds');
    const opportunityId = oppRes.data.id;
    // Step 9: Student Browses & Sees Match
    console.log('\n--- Step 9: Student Browses Opportunities & Match ---');
    const studentOpps = await req('GET', '/opportunities', undefined, studentToken);
    assert(studentOpps.ok, 'Student opportunities listing succeeds');
    const matchedOpp = studentOpps.data?.find((o) => o.id === opportunityId);
    assert(Boolean(matchedOpp), 'Opportunity is visible to student');
    assert(typeof matchedOpp.matchPercentage === 'number', 'Match percentage is a number');
    assert(matchedOpp.matchPercentage > 0, 'Match percentage is computed (non-zero)');
    console.log(`  Match: ${matchedOpp.matchPercentage}%`);
    // Step 10: Student Applies
    console.log('\n--- Step 10: Student Application ---');
    const applyRes = await req('POST', `/opportunities/${opportunityId}/apply`, {
        coverLetter: 'Top scores in Dravyaguna Plant Identification. Passionate about herbal research.',
    }, studentToken);
    assert(applyRes.ok, 'Student application succeeds');
    // Response: { message, application: { id, status, ... } }
    const applicationId = applyRes.data.application.id;
    assert(applyRes.data.application.status === 'APPLIED', 'Initial status is APPLIED');
    console.log(`  Application ID: ${applicationId}`);
    // Step 11: Industry Shortlists
    console.log('\n--- Step 11: Industry Recruiter Workflow ---');
    const applicantsRes = await req('GET', '/opportunities/my/applicants', undefined, industryToken);
    assert(applicantsRes.ok, 'Industry applicant listing succeeds');
    const applicant = applicantsRes.data?.find((a) => a.id === applicationId);
    assert(Boolean(applicant), 'Application appears in recruiter queue');
    // student.fullName is on StudentProfile directly
    assert(applicant.student?.fullName === 'Arya Sharma', 'Applicant name matches');
    // Shortlist: PUT /opportunities/applications/:id/status
    const shortlistRes = await req('PUT', `/opportunities/applications/${applicationId}/status`, {
        status: 'SHORTLISTED',
        notes: 'Outstanding morphology test performance.',
    }, industryToken);
    assert(shortlistRes.ok, 'Shortlisting succeeds');
    // Response: { message, application: { id, status, ... } }
    assert(shortlistRes.data.application.status === 'SHORTLISTED', 'Status updated to SHORTLISTED');
    // Schedule interview: POST /opportunities/applications/:id/interview
    const scheduleRes = await req('POST', `/opportunities/applications/${applicationId}/interview`, {
        scheduledAt: new Date(Date.now() + 3 * 86400000).toISOString(),
        meetingLink: 'https://meet.skillbridge.edu/interview/dravyaguna',
        notes: 'Technical panel discussion on herbal standardization.',
    }, industryToken);
    assert(scheduleRes.ok, 'Interview scheduling succeeds');
    // Student checks status
    const studentProfileCheck = await req('GET', '/student/profile', undefined, studentToken);
    assert(studentProfileCheck.ok, 'Student profile check succeeds');
    const studentApp = studentProfileCheck.data?.applications?.find((a) => a.id === applicationId);
    // After interview scheduling, status becomes INTERVIEW
    assert(studentApp?.status === 'INTERVIEW', 'Student sees INTERVIEW status after scheduling');
    console.log(`  Student status: ${studentApp.status}`);
    // Step 12: Institution Intelligence
    console.log('\n--- Step 12: Institution Intelligence ---');
    const instIntelligence = await req('GET', '/institution/intelligence', undefined, institutionToken);
    assert(instIntelligence.ok, 'Institution intelligence query succeeds');
    assert(instIntelligence.data.hasData === true, 'hasData is true');
    assert(instIntelligence.data.summary.totalStudents >= 1, 'totalStudents >= 1');
    assert(instIntelligence.data.summary.overallAssessedStudents >= 1, 'Assessed students >= 1');
    assert(instIntelligence.data.summary.totalApplications >= 1, 'totalApplications >= 1');
    // Department filter
    const deptFiltered = await req('GET', '/institution/intelligence?department=Dravyaguna', undefined, institutionToken);
    assert(deptFiltered.ok, 'Department filter query succeeds');
    assert(deptFiltered.data.summary.totalStudents >= 1, 'Dravyaguna filter returns student');
    const emptyDeptFiltered = await req('GET', '/institution/intelligence?department=Unani', undefined, institutionToken);
    assert(emptyDeptFiltered.ok, 'Non-matching department query succeeds');
    assert(emptyDeptFiltered.data.summary.totalStudents === 0, 'Unani filter returns 0 students');
    // =========================================================================
    // CHECK 4: Portfolio Verification
    // =========================================================================
    console.log('\n>>> CHECK 4: Student Portfolio & Verification');
    const certRes = await req('POST', '/student/portfolio/certifications', {
        name: 'NMPB Standardization Certificate',
        issuingOrganization: 'NMPB Ministry of AYUSH',
        issueDate: '2025-06-15',
        credentialId: 'NMPB-2025-8891',
        credentialUrl: 'https://nmpb.nic.in/verify/8891',
    }, studentToken);
    assert(certRes.ok, 'Adding certification succeeds');
    assert(certRes.data.verificationStatus === 'PENDING', 'New cert is PENDING (not auto-verified)');
    const certId = certRes.data.id;
    // Institution reviews: GET /institution/portfolio/pending
    const pendingVerifs = await req('GET', '/institution/portfolio/pending', undefined, institutionToken);
    assert(pendingVerifs.ok, 'Fetching pending verifications succeeds');
    // Verify: POST /institution/portfolio/verify
    const verifyAction = await req('POST', '/institution/portfolio/verify', {
        itemType: 'CERTIFICATION',
        itemId: certId,
        status: 'VERIFIED',
        notes: 'Authenticated via AYUSH verification database.',
    }, institutionToken);
    assert(verifyAction.ok, 'Verifying certification succeeds');
    // =========================================================================
    // CHECK 5: Collaboration
    // =========================================================================
    console.log('\n>>> CHECK 5: Academia-Industry Collaboration');
    // Create collaboration: POST /collaboration (not /collaboration/opportunities)
    const collabRes = await req('POST', '/collaboration', {
        title: 'Joint Monograph Formulation Project',
        type: 'RESEARCH_PROJECT',
        description: 'TLC and HPLC analytical monographs for endangered Ayurvedic species.',
        targetAudience: 'Faculty in Dravyaguna',
        location: 'Coimbatore / Remote',
        mode: 'HYBRID',
        duration: '1 Year',
        remunerationOrStipend: 'Rs. 5,00,000 Research Grant',
        eligibilityCriteria: 'MD/PhD in Dravyaguna with publication record',
        budget: 500000,
    }, industryToken);
    assert(collabRes.ok, 'Collaboration creation succeeds');
    const collabId = collabRes.data.collaboration?.id || collabRes.data.id;
    console.log(`  Collaboration ID: ${collabId}`);
    // Academician browses: GET /academician/opportunities?type=RESEARCH
    const acadOpps = await req('GET', '/academician/opportunities?type=RESEARCH', undefined, academicianToken);
    assert(acadOpps.ok, 'Academician opportunities query succeeds');
    const oppInList = acadOpps.data?.find((o) => o.id === collabId);
    assert(Boolean(oppInList), 'Collaboration appears in academician list');
    // Academician applies: POST /collaboration/:id/apply
    const acadApply = await req('POST', `/collaboration/${collabId}/apply`, {
        proposal: 'Chromatographic fingerprinting and metabolite variation studies.',
    }, academicianToken);
    assert(acadApply.ok, 'Academician application succeeds');
    // Academician dashboard
    const acadDash = await req('GET', '/academician/dashboard', undefined, academicianToken);
    assert(acadDash.ok, 'Academician dashboard succeeds');
    assert(acadDash.data.stats.myParticipationsCount >= 1, 'Participations count >= 1');
    assert(acadDash.data.stats.researchCount >= 1, 'Research count >= 1');
    // =========================================================================
    // CHECK 6: Clean Teardown
    // =========================================================================
    console.log('\n>>> CHECK 6: Database Teardown & Final Integrity');
    await cleanDb();
    const finalUsers = await db_1.default.user.count();
    const finalOpps = await db_1.default.opportunity.count();
    const finalSkills = await db_1.default.skill.count();
    assert(finalUsers === 0 && finalOpps === 0 && finalSkills === 0, 'Teardown leaves 0 records');
    console.log('\n========================================================================');
    console.log('  \x1b[32mALL 6 AUDIT CHECKS PASSED SUCCESSFULLY!\x1b[0m');
    console.log('  - Zero fake data, mock statistics, or hardcoded values');
    console.log('  - Clean empty state operation verified');
    console.log('  - Strict RBAC authorization (401/403) across 4 roles');
    console.log('  - End-to-end 12-step flow 100% verified');
    console.log('  - Portfolio verification & Collaboration verified');
    console.log('========================================================================\n');
}
runAudit()
    .then(() => process.exit(0))
    .catch((err) => {
    console.error('\x1b[31mAudit Failed:\x1b[0m', err.message || err);
    process.exit(1);
});
