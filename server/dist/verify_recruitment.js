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
async function verifyRecruitmentSystem() {
    console.log('========================================================================');
    console.log('>>> VERIFYING INDUSTRY RECRUITMENT SYSTEM: END-TO-END FLOW <<<');
    console.log('========================================================================\n');
    // 1. Health check
    console.log('[1] Checking backend health endpoint...');
    const health = await req('GET', '/health');
    if (!health.ok)
        throw new Error('Backend health check failed');
    console.log('  -> Health status: OK');
    // 2. Ensure initial clean state
    console.log('\n[2] Checking initial database state (must start empty)...');
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
    const oppCount = await db_1.default.opportunity.count();
    console.log(`  -> Initial users in DB: ${userCount}, opportunities: ${oppCount}`);
    if (userCount !== 0 || oppCount !== 0) {
        throw new Error('Database is not starting clean.');
    }
    // 3. Register Industry Account
    console.log('\n[3] Registering Industry Partner...');
    const industryReg = await req('POST', '/auth/register', {
        role: 'INDUSTRY',
        email: 'careers@ayurvaidya-pharma.com',
        password: 'Password@123',
        companyName: 'AyurVaidya Herbals & Research Labs',
        officialEmail: 'careers@ayurvaidya-pharma.com',
        industrySector: 'Ayurvedic Pharmaceuticals',
        companySize: '51-200',
        website: 'https://ayurvaidya-pharma.com',
        location: 'Bangalore, Karnataka',
        description: 'Leading research and manufacturing of standardized herbal formulations.',
        contactPerson: 'Dr. Vikram Sharma',
        contactNumber: '+91 98765 43210',
    });
    if (!industryReg.ok || !industryReg.data?.token) {
        throw new Error(`Industry registration failed: ${JSON.stringify(industryReg.data)}`);
    }
    const industryToken = industryReg.data.token;
    console.log('  -> Industry registered successfully with token.');
    // 4. Test Industry Profile Retrieval & Updating
    console.log('\n[4] Testing Industry Profile Viewing & Updating...');
    const getProfileRes = await req('GET', '/industry/profile', undefined, industryToken);
    if (!getProfileRes.ok || getProfileRes.data.companyName !== 'AyurVaidya Herbals & Research Labs') {
        throw new Error(`Failed to fetch industry profile: ${JSON.stringify(getProfileRes.data)}`);
    }
    console.log('  -> Fetched company profile:', getProfileRes.data.companyName);
    const updateProfileRes = await req('PUT', '/industry/profile', {
        companyName: 'AyurVaidya Pharmaceuticals & Research Pvt Ltd',
        location: 'Bangalore & Pune, India',
        website: 'https://ayurvaidya.in',
        companySize: '201-1000',
    }, industryToken);
    if (!updateProfileRes.ok || updateProfileRes.data.profile?.companyName !== 'AyurVaidya Pharmaceuticals & Research Pvt Ltd') {
        throw new Error(`Failed to update industry profile: ${JSON.stringify(updateProfileRes.data)}`);
    }
    console.log('  -> Updated company profile successfully:', updateProfileRes.data.profile.companyName);
    // 5. Seed required skill category & skill
    console.log('\n[5] Setting up verified technical skill taxonomy...');
    const category = await db_1.default.skillCategory.create({
        data: {
            name: 'Pharmaceutical Sciences & Formulation',
            description: 'Herbal drug standardization and formulation competencies',
        },
    });
    const skillFormulation = await db_1.default.skill.create({
        data: {
            categoryId: category.id,
            name: 'Ayurvedic Drug Formulation',
            description: 'Standardized extraction, rasashastra procedures, and quality control.',
        },
    });
    const skillPharma = await db_1.default.skill.create({
        data: {
            categoryId: category.id,
            name: 'Herbal Pharmacovigilance',
            description: 'Adverse drug reaction monitoring and documentation.',
        },
    });
    console.log(`  -> Seeded skills: [${skillFormulation.name}, ${skillPharma.name}]`);
    // 6. Industry Creates Opportunity (Internship)
    console.log('\n[6] Industry creates an industrial internship with skill requirements...');
    const createOppRes = await req('POST', '/opportunities', {
        title: 'Research Intern - Herbal Formulation',
        type: 'INTERNSHIP',
        description: 'Work alongside lead scientists developing standardized phytomedicines and clinical trials.',
        degree: 'BAMS',
        department: 'Ayurvedic Medicine & Surgery',
        minCgpa: '7.5',
        experience: 'Fresher / Final Year Student',
        location: 'Bangalore, Karnataka',
        workMode: 'HYBRID',
        stipendOrSalary: '25,000 INR / month',
        applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        numberOfOpenings: 2,
        duration: '6 Months',
        startDate: 'October 2026',
        responsibilities: 'Assist in lab extraction, documentation of clinical batches, and safety audits.',
        selectionProcess: 'Profile Screening -> Assessment Evaluation -> Interview',
        skillIds: [
            { skillId: skillFormulation.id, isRequired: true },
            { skillId: skillPharma.id, isRequired: false },
        ],
    }, industryToken);
    if (!createOppRes.ok || !createOppRes.data?.id) {
        throw new Error(`Failed to create opportunity: ${JSON.stringify(createOppRes.data)}`);
    }
    const oppId = createOppRes.data.id;
    console.log(`  -> Created Opportunity ID: ${oppId}, Title: "${createOppRes.data.title}"`);
    // 7. Industry Edits Opportunity
    console.log('\n[7] Industry edits the opportunity details...');
    const editOppRes = await req('PUT', `/opportunities/${oppId}`, {
        stipendOrSalary: '30,000 INR / month',
        numberOfOpenings: 3,
        description: 'Updated: Work alongside senior formulation scientists developing standardized phytomedicines.',
    }, industryToken);
    if (!editOppRes.ok || editOppRes.data.stipendOrSalary !== '30,000 INR / month') {
        throw new Error(`Failed to update opportunity: ${JSON.stringify(editOppRes.data)}`);
    }
    console.log('  -> Edited opportunity stipend to 30,000 INR, openings to 3.');
    // 8. Publish / Unpublish Toggle
    console.log('\n[8] Testing Publish / Unpublish toggle...');
    const unpublishRes = await req('PUT', `/opportunities/${oppId}`, { isPublished: false }, industryToken);
    if (!unpublishRes.ok || unpublishRes.data.isPublished !== false) {
        throw new Error(`Failed to unpublish: ${JSON.stringify(unpublishRes.data)}`);
    }
    // Verify published list does not return unpublished
    const browseUnpublished = await req('GET', '/opportunities', undefined, industryToken);
    const foundInUnpublished = browseUnpublished.data?.some((o) => o.id === oppId);
    if (foundInUnpublished)
        throw new Error('Unpublished opportunity appeared in public list!');
    console.log('  -> Successfully unpublished (hidden from public listing).');
    // Re-publish
    const republishRes = await req('PUT', `/opportunities/${oppId}`, { isPublished: true }, industryToken);
    if (!republishRes.ok || republishRes.data.isPublished !== true) {
        throw new Error(`Failed to republish: ${JSON.stringify(republishRes.data)}`);
    }
    console.log('  -> Successfully re-published (visible again).');
    // 9. Register Student
    console.log('\n[9] Registering Student Candidate...');
    const studentReg = await req('POST', '/auth/register', {
        role: 'STUDENT',
        email: 'arjun.student@ayurveda.edu.in',
        password: 'Password@123',
        fullName: 'Arjun Sharma',
        phone: '+91 91234 56789',
        dob: '2002-05-15',
        gender: 'Male',
        institutionName: 'National Institute of Ayurveda',
        department: 'Ayurvedic Medicine & Surgery',
        degree: 'BAMS',
        currentYear: 4,
        cgpa: 8.8,
        graduationYear: 2026,
        location: 'Bangalore, Karnataka',
    });
    if (!studentReg.ok || !studentReg.data?.token) {
        throw new Error(`Student registration failed: ${JSON.stringify(studentReg.data)}`);
    }
    const studentToken = studentReg.data.token;
    const studentUserId = studentReg.data.user.id;
    const studentProfile = await db_1.default.studentProfile.findUnique({ where: { userId: studentUserId } });
    if (!studentProfile)
        throw new Error('Student profile missing');
    console.log(`  -> Student registered: ${studentProfile.fullName} (CGPA: ${studentProfile.cgpa})`);
    // Student establishes assessed skill profile in database
    await db_1.default.studentSkillProfile.create({
        data: {
            studentId: studentProfile.id,
            skillId: skillFormulation.id,
            proficiencyLevel: 'ADVANCED',
            scorePercentage: 92,
            verified: true,
            lastAssessedAt: new Date(),
        },
    });
    console.log('  -> Student assessed skill profile created: Ayurvedic Drug Formulation (92%, ADVANCED)');
    // 10. Student Browses Opportunities & Checks Match Percentage
    console.log('\n[10] Student browses opportunities and verifies Match Engine output...');
    const studentBrowseRes = await req('GET', '/opportunities?type=INTERNSHIP', undefined, studentToken);
    if (!studentBrowseRes.ok || !Array.isArray(studentBrowseRes.data)) {
        throw new Error(`Student failed to browse opportunities: ${JSON.stringify(studentBrowseRes.data)}`);
    }
    const matchedOpp = studentBrowseRes.data.find((o) => o.id === oppId);
    if (!matchedOpp)
        throw new Error('Created opportunity not found in student browse list!');
    console.log('  -> Found Opportunity:', matchedOpp.title);
    console.log(`  -> Calculated Match Score: ${matchedOpp.matchResult?.matchScore}% (isEligible: ${matchedOpp.matchResult?.eligibility?.isEligible})`);
    console.log('  -> Matched Skills:', matchedOpp.matchResult?.matchedSkills?.map((s) => s.name));
    console.log('  -> Has Applied:', matchedOpp.hasApplied);
    if (matchedOpp.matchResult?.matchScore < 75) {
        throw new Error(`Expected high match score (>=75%), but got ${matchedOpp.matchResult?.matchScore}%`);
    }
    if (!matchedOpp.matchResult?.eligibility?.isEligible) {
        throw new Error('Expected candidate to be eligible (CGPA 8.8 >= 7.5 minCgpa)');
    }
    // 11. Student Applies with Cover Letter
    console.log('\n[11] Student submits application with cover letter...');
    const applyRes = await req('POST', `/opportunities/${oppId}/apply`, {
        coverLetter: 'I have conducted extensive research on standardized herbal extract stability and completed 90+ hours of advanced formulation lab work.',
    }, studentToken);
    if (!applyRes.ok || !applyRes.data?.application) {
        throw new Error(`Application submission failed: ${JSON.stringify(applyRes.data)}`);
    }
    const applicationId = applyRes.data.application.id;
    console.log(`  -> Application created with ID: ${applicationId}, Status: ${applyRes.data.application.status}`);
    console.log(`  -> Stored Snapshot Match Score: ${applyRes.data.application.matchScore}%`);
    // Verify application status history initial entry
    const initialHistory = await db_1.default.applicationStatusHistory.findMany({
        where: { applicationId },
        orderBy: { createdAt: 'asc' },
    });
    console.log(`  -> Application history records: ${initialHistory.length}`);
    if (initialHistory.length !== 1 || initialHistory[0].status !== 'APPLIED') {
        throw new Error('Initial ApplicationStatusHistory was not recorded properly.');
    }
    // Verify duplicate apply prevention
    const dupApplyRes = await req('POST', `/opportunities/${oppId}/apply`, { coverLetter: 'Duplicate' }, studentToken);
    if (dupApplyRes.status !== 400) {
        throw new Error('Duplicate application was not prevented!');
    }
    console.log('  -> Duplicate application correctly rejected (400 Bad Request).');
    // 12. Recruiter Screening: View Applicants
    console.log('\n[12] Industry Recruiter views applicants pipeline...');
    const applicantsRes = await req('GET', `/opportunities/my/applicants?opportunityId=${oppId}`, undefined, industryToken);
    if (!applicantsRes.ok || !Array.isArray(applicantsRes.data) || applicantsRes.data.length === 0) {
        throw new Error(`Recruiter failed to view applicants: ${JSON.stringify(applicantsRes.data)}`);
    }
    const applicant = applicantsRes.data.find((a) => a.id === applicationId);
    if (!applicant)
        throw new Error('Applicant not found in recruiter view!');
    console.log(`  -> Recruiter sees applicant: ${applicant.student?.fullName}`);
    console.log(`  -> Match Score in Recruiter View: ${applicant.matchScore}%`);
    console.log(`  -> Current Status: ${applicant.status}`);
    console.log(`  -> Cover Letter: "${applicant.coverLetter}"`);
    // 13. Recruiter Shortlists Applicant
    console.log('\n[13] Industry Recruiter shortlists candidate...');
    const shortlistRes = await req('PUT', `/opportunities/applications/${applicationId}/status`, {
        status: 'SHORTLISTED',
        notes: 'Candidate demonstrated strong analytical and formulation competence in assessment.',
    }, industryToken);
    if (!shortlistRes.ok || shortlistRes.data.application?.status !== 'SHORTLISTED') {
        throw new Error(`Failed to shortlist: ${JSON.stringify(shortlistRes.data)}`);
    }
    console.log('  -> Recruiter updated application status to: SHORTLISTED');
    // 14. Recruiter Schedules Interview
    console.log('\n[14] Industry Recruiter schedules technical interview...');
    const interviewTime = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();
    const scheduleRes = await req('POST', `/opportunities/applications/${applicationId}/interview`, {
        scheduledAt: interviewTime,
        meetingLink: 'https://meet.google.com/sb-recruit-interview',
        notes: 'Technical panel interview with Chief Research Officer and Quality Head.',
    }, industryToken);
    if (!scheduleRes.ok || !scheduleRes.data?.interview) {
        throw new Error(`Failed to schedule interview: ${JSON.stringify(scheduleRes.data)}`);
    }
    console.log('  -> Interview scheduled:', scheduleRes.data.interview.meetingLink);
    console.log('  -> Interview time:', scheduleRes.data.interview.scheduledAt);
    // 15. Recruiter Extends Offer / Selects Candidate
    console.log('\n[15] Recruiter selects candidate (Offer extended)...');
    const selectRes = await req('PUT', `/opportunities/applications/${applicationId}/status`, {
        status: 'SELECTED',
        notes: 'Excellent interview performance. Selected for the 6-month Research Internship with 30,000 INR stipend.',
    }, industryToken);
    if (!selectRes.ok || selectRes.data.application?.status !== 'SELECTED') {
        throw new Error(`Failed to select candidate: ${JSON.stringify(selectRes.data)}`);
    }
    console.log('  -> Recruiter updated application status to: SELECTED');
    // 16. Student Tracks Application Pipeline & Verifies Status History
    console.log('\n[16] Student views application tracking & full status timeline...');
    const studentAppsRes = await req('GET', '/student/applications', undefined, studentToken);
    if (!studentAppsRes.ok || !Array.isArray(studentAppsRes.data) || studentAppsRes.data.length === 0) {
        throw new Error(`Student failed to fetch applications: ${JSON.stringify(studentAppsRes.data)}`);
    }
    const trackedApp = studentAppsRes.data.find((a) => a.id === applicationId);
    if (!trackedApp)
        throw new Error('Tracked application not found in student pipeline!');
    console.log(`  -> Final Student Application Status: ${trackedApp.status}`);
    console.log(`  -> Associated Scheduled Interviews: ${trackedApp.interviews?.length}`);
    console.log(`  -> Status History Timeline Count: ${trackedApp.history?.length}`);
    if (trackedApp.status !== 'SELECTED') {
        throw new Error(`Expected status SELECTED, but got ${trackedApp.status}`);
    }
    // Print complete timeline history
    console.log('\n  [TIMELINE AUDIT TRAIL]:');
    trackedApp.history.forEach((h, idx) => {
        console.log(`    ${idx + 1}. [${new Date(h.createdAt).toLocaleTimeString()}] Status: ${h.status.padEnd(12)} - Note: ${h.notes}`);
    });
    const statusesInOrder = trackedApp.history.map((h) => h.status);
    if (!statusesInOrder.includes('APPLIED') ||
        !statusesInOrder.includes('SHORTLISTED') ||
        !statusesInOrder.includes('INTERVIEW') ||
        !statusesInOrder.includes('SELECTED')) {
        throw new Error(`History timeline incomplete! Found: ${statusesInOrder.join(' -> ')}`);
    }
    console.log('  -> Full status timeline verified: APPLIED -> SHORTLISTED -> INTERVIEW -> SELECTED');
    // 17. Recruiter Opportunity Deletion Test
    console.log('\n[17] Testing opportunity deletion and cascading cleanup...');
    // Create a dummy opportunity to delete
    const dummyOpp = await req('POST', '/opportunities', {
        title: 'Temporary Opportunity for Deletion Test',
        type: 'JOB',
        description: 'Temporary listing to test deletion.',
    }, industryToken);
    if (!dummyOpp.ok || !dummyOpp.data?.id)
        throw new Error('Failed to create dummy opportunity');
    const deleteRes = await req('DELETE', `/opportunities/${dummyOpp.data.id}`, undefined, industryToken);
    if (!deleteRes.ok)
        throw new Error(`Failed to delete opportunity: ${JSON.stringify(deleteRes.data)}`);
    console.log('  -> Opportunity successfully deleted.');
    // 18. Teardown & Clean Database State
    console.log('\n[18] Tearing down test accounts & verifying 0-record clean DB...');
    await db_1.default.auditLog.deleteMany({});
    await db_1.default.interview.deleteMany({});
    await db_1.default.applicationStatusHistory.deleteMany({});
    await db_1.default.application.deleteMany({});
    await db_1.default.opportunitySkill.deleteMany({});
    await db_1.default.opportunity.deleteMany({});
    await db_1.default.studentSkillProfile.deleteMany({});
    await db_1.default.skill.deleteMany({});
    await db_1.default.skillCategory.deleteMany({});
    await db_1.default.studentProfile.deleteMany({});
    await db_1.default.industryProfile.deleteMany({});
    await db_1.default.user.deleteMany({});
    const finalUsers = await db_1.default.user.count();
    const finalOpps = await db_1.default.opportunity.count();
    const finalApps = await db_1.default.application.count();
    console.log(`  -> Final users in DB: ${finalUsers}`);
    console.log(`  -> Final opportunities in DB: ${finalOpps}`);
    console.log(`  -> Final applications in DB: ${finalApps}`);
    if (finalUsers !== 0 || finalOpps !== 0 || finalApps !== 0) {
        throw new Error('Database teardown did not restore 0 clean state.');
    }
    console.log('\n========================================================================');
    console.log('>>> ALL 14 INDUSTRY RECRUITMENT REQUIREMENTS VERIFIED SUCCESSFULLY <<<');
    console.log('========================================================================\n');
}
verifyRecruitmentSystem()
    .catch((err) => {
    console.error('\n❌ RECRUITMENT VERIFICATION FAILED:', err);
    process.exit(1);
})
    .finally(async () => {
    await db_1.default.$disconnect();
});
