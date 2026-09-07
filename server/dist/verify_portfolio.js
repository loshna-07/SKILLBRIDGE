"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("./config/db"));
const API_URL = 'http://localhost:5000/api';
async function req(method, endpoint, body, token) {
    const headers = { 'Content-Type': 'application/json' };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    const res = await fetch(`${API_URL}${endpoint}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json().catch(() => null);
    return { status: res.status, ok: res.ok, data };
}
async function verifyPortfolio() {
    console.log('====================================================');
    console.log('STEP 1: Verify Initial Clean State in Database');
    console.log('====================================================');
    // Purge any lingering records to guarantee clean start
    await db_1.default.auditLog.deleteMany({});
    await db_1.default.notification.deleteMany({});
    await db_1.default.mentorshipSession.deleteMany({});
    await db_1.default.mentorshipRequest.deleteMany({});
    await db_1.default.mentorshipProgram.deleteMany({});
    await db_1.default.collaborationApplication.deleteMany({});
    await db_1.default.collaboration.deleteMany({});
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
    await db_1.default.user.deleteMany({});
    const userCount = await db_1.default.user.count();
    const eduCount = await db_1.default.studentEducation.count();
    const projCount = await db_1.default.studentProject.count();
    console.log(`Database verified clean. Users: ${userCount}, Educations: ${eduCount}, Projects: ${projCount}`);
    if (userCount !== 0)
        throw new Error('Database is not clean at start!');
    console.log('\n====================================================');
    console.log('STEP 2: Register Test Accounts');
    console.log('====================================================');
    // 1. Student
    const studentRes = await req('POST', '/auth/register', {
        email: 'portfolio.student@ayurveda.edu',
        password: 'Password123!',
        role: 'STUDENT',
        fullName: 'Ananya Sharma',
        institutionName: 'National Institute of Ayurveda Jaipur',
        department: 'Dravyaguna Vigyana',
        degree: 'BAMS',
        cgpa: 8.8,
        graduationYear: 2026,
        currentYear: 4,
    });
    const studentToken = studentRes.data.token;
    const studentUser = studentRes.data.user;
    const studentProfile = await db_1.default.studentProfile.findUnique({ where: { userId: studentUser.id } });
    const studentProfileId = studentProfile.id;
    console.log(`Student registered: ${studentUser.email} (Profile ID: ${studentProfileId})`);
    // 2. Institution Admin
    const institutionRes = await req('POST', '/auth/register', {
        email: 'portfolio.institution@ayurveda.edu',
        password: 'Password123!',
        role: 'INSTITUTION',
        institutionName: 'National Institute of Ayurveda Jaipur',
        officialEmail: 'registrar@nia.edu',
        institutionType: 'GOVERNMENT',
    });
    const instToken = institutionRes.data.token;
    console.log(`Institution registered: ${institutionRes.data.user.email}`);
    // 3. Industry Recruiter
    const industryRes = await req('POST', '/auth/register', {
        email: 'portfolio.industry@ayurveda.edu',
        password: 'Password123!',
        role: 'INDUSTRY',
        companyName: 'Himalaya Wellness Research Labs',
        officialEmail: 'careers@himalaya.com',
        industrySector: 'Pharmaceutical',
    });
    console.log(`Industry recruiter registered: ${industryRes.data.user.email}`);
    console.log('\n====================================================');
    console.log('STEP 3: Seed Reference Skills and Assessment');
    console.log('====================================================');
    const category = await db_1.default.skillCategory.create({
        data: {
            name: 'Phytochemistry & Botanical Sciences',
            description: 'Herbal analysis, taxonomy, and standardization',
        },
    });
    const skill1 = await db_1.default.skill.create({
        data: {
            name: 'Herbal Extraction & Standardization',
            categoryId: category.id,
        },
    });
    const skill2 = await db_1.default.skill.create({
        data: {
            name: 'Ayurvedic Pulse Diagnosis (Nadi Pariksha)',
            categoryId: category.id,
        },
    });
    console.log(`Created skills: "${skill1.name}" & "${skill2.name}"`);
    // Create an Assessment for skill1
    const assessment = await db_1.default.assessment.create({
        data: {
            title: 'Phytochemical Standardization Assessment',
            categoryId: category.id,
            durationMinutes: 20,
            passingScore: 60.0,
            questions: {
                create: [
                    {
                        questionText: 'Which chromatographic method is primarily used for fingerprinting of herbal raw materials?',
                        skillId: skill1.id,
                        difficulty: 'MEDIUM',
                        weightage: 1,
                        options: {
                            create: [
                                { optionText: 'HPTLC', isCorrect: true },
                                { optionText: 'Paper Chromatography', isCorrect: false },
                                { optionText: 'Simple Distillation', isCorrect: false },
                            ],
                        },
                    },
                ],
            },
        },
        include: {
            questions: {
                include: { options: true },
            },
        },
    });
    console.log(`Created assessment: "${assessment.title}" with ${assessment.questions.length} question(s)`);
    console.log('\n====================================================');
    console.log('STEP 4: Student Takes Assessment & Completed Attempt');
    console.log('====================================================');
    const q = assessment.questions[0];
    const correctOption = q.options.find((o) => o.isCorrect);
    const submitRes = await req('POST', `/assessments/${assessment.id}/submit`, {
        responses: [
            {
                questionId: q.id,
                selectedOptionId: correctOption.id,
            },
        ],
    }, studentToken);
    console.log(`Assessment submitted. Score: ${submitRes.data.percentage}%, Passed: ${submitRes.data.passed}`);
    if (!submitRes.data.passed)
        throw new Error('Expected assessment to pass!');
    // Strict Rule Check: Ensure StudentSkillProfile created by assessment is NOT automatically verified!
    const assessedSkillProfile = await db_1.default.studentSkillProfile.findFirst({
        where: { studentId: studentProfileId, skillId: skill1.id },
    });
    console.log(`Skill profile from assessment: verified=${assessedSkillProfile?.verified}, verificationStatus=${assessedSkillProfile?.verificationStatus}`);
    if (assessedSkillProfile?.verified === true) {
        throw new Error('STRICT RULE VIOLATION: Skill was automatically marked as verified=true upon assessment!');
    }
    if (assessedSkillProfile?.verificationStatus !== 'PENDING') {
        throw new Error(`STRICT RULE VIOLATION: Expected verificationStatus 'PENDING', got ${assessedSkillProfile?.verificationStatus}`);
    }
    console.log('Verified: Assessment completed, but skill verification status strictly remains PENDING!');
    console.log('\n====================================================');
    console.log('STEP 5: Student Populates All Other Portfolio Sections');
    console.log('====================================================');
    // 1. Education
    const eduRes = await req('POST', '/student/portfolio/education', {
        institution: 'National Institute of Ayurveda',
        degree: 'BAMS',
        fieldOfStudy: 'Ayurvedic Medicine & Surgery',
        startYear: 2021,
        endYear: 2026,
        grade: '8.8 CGPA',
    }, studentToken);
    console.log(`[1] Education added: ${eduRes.data.degree}, status=${eduRes.data.verificationStatus}`);
    if (eduRes.data.verificationStatus !== 'PENDING')
        throw new Error('Education not PENDING!');
    // 2. Skill self-addition
    const skillRes = await req('POST', '/student/portfolio/skills', {
        skillId: skill2.id,
        proficiencyLevel: 'INTERMEDIATE',
    }, studentToken);
    console.log(`[2] Skill added: ${skillRes.data.skill.name}, verified=${skillRes.data.verified}, status=${skillRes.data.verificationStatus}`);
    if (skillRes.data.verificationStatus !== 'PENDING' || skillRes.data.verified === true) {
        throw new Error('Skill self-addition must start as PENDING and unverified!');
    }
    // 3. Certification
    const certRes = await req('POST', '/student/portfolio/certifications', {
        title: 'Certified Ayurvedic Pharmacologist',
        issuingOrganization: 'Ministry of AYUSH Council',
        issueDate: '01/2025',
        credentialUrl: 'https://credentials.ayush.gov.in/verify/AYU-9921',
    }, studentToken);
    console.log(`[3] Certification added: ${certRes.data.title}, status=${certRes.data.verificationStatus}`);
    if (certRes.data.verificationStatus !== 'PENDING')
        throw new Error('Certification not PENDING!');
    // 4. Project
    const projRes = await req('POST', '/student/portfolio/projects', {
        title: 'Automated Herb Standardization using Spectrophotometry',
        description: 'Fingerprinting bioactive withanoides from Withania somnifera using TLC and UV spectrophotometry.',
        technologies: 'Spectrophotometry, HPTLC, Statistical Quality Control',
        projectUrl: 'https://ayush-research.org/demos/standardization',
        repoUrl: 'https://github.com/ayurveda/standardization-tool',
    }, studentToken);
    console.log(`[4] Project added: ${projRes.data.title}, status=${projRes.data.verificationStatus}`);
    if (projRes.data.verificationStatus !== 'PENDING')
        throw new Error('Project not PENDING!');
    // 5. Internship
    const internRes = await req('POST', '/student/portfolio/internships', {
        companyName: 'Patanjali Research Foundation',
        role: 'Clinical Research & Pharmacology Intern',
        startDate: 'Jan 2025',
        endDate: 'June 2025',
        description: 'Participated in multicentric clinical trials for herbal immunomodulators.',
        certificateUrl: 'https://patanjali.org/certificates/intern_102.pdf',
    }, studentToken);
    console.log(`[5] Internship added: ${internRes.data.role}, status=${internRes.data.verificationStatus}`);
    if (internRes.data.verificationStatus !== 'PENDING')
        throw new Error('Internship not PENDING!');
    // 6. Achievement
    const achievRes = await req('POST', '/student/portfolio/achievements', {
        title: '1st Prize - National AYUSH Research Conclave',
        category: 'Research Competition',
        date: 'Feb 2025',
        description: 'Best original clinical poster presentation on Dravyaguna phytotherapeutics.',
    }, studentToken);
    console.log(`[6] Achievement added: ${achievRes.data.title}, status=${achievRes.data.verificationStatus}`);
    if (achievRes.data.verificationStatus !== 'PENDING')
        throw new Error('Achievement not PENDING!');
    // 7. Training
    const trainRes = await req('POST', '/student/portfolio/trainings', {
        title: 'Good Clinical Laboratory Practices (GCLP) Workshop',
        provider: 'CSIR-Central Drug Research Institute',
        duration: '40 Contact Hours',
        certificateUrl: 'https://cdri.res.in/gclp/certificates/8821',
    }, studentToken);
    console.log(`[7] Training added: ${trainRes.data.title}, status=${trainRes.data.verificationStatus}`);
    if (trainRes.data.verificationStatus !== 'PENDING')
        throw new Error('Training not PENDING!');
    // 8. Resume
    const resumeRes = await req('PUT', '/student/portfolio/resume', {
        resumeUrl: 'https://ayurveda-cloud.org/resumes/student_portfolio.pdf',
    }, studentToken);
    console.log(`[8] Resume updated: ${resumeRes.data.profile.resumeUrl}, status=${resumeRes.data.profile.resumeVerificationStatus}`);
    if (resumeRes.data.profile.resumeVerificationStatus !== 'PENDING')
        throw new Error('Resume not PENDING!');
    console.log('\n====================================================');
    console.log('STEP 6: Verify Comprehensive Student Portfolio');
    console.log('====================================================');
    const portfolioRes = await req('GET', '/student/portfolio', undefined, studentToken);
    const port = portfolioRes.data;
    console.log(`Portfolio retrieved for ${port.fullName}:`);
    console.log(`- Educations: ${port.educations.length} (status: ${port.educations[0].verificationStatus})`);
    console.log(`- Skills: ${port.skillProfiles.length} (statuses: ${port.skillProfiles.map((s) => s.verificationStatus).join(', ')})`);
    console.log(`- Certifications: ${port.certificates.length} (status: ${port.certificates[0].verificationStatus})`);
    console.log(`- Projects: ${port.projects.length} (status: ${port.projects[0].verificationStatus})`);
    console.log(`- Internships: ${port.internships.length} (status: ${port.internships[0].verificationStatus})`);
    console.log(`- Achievements: ${port.achievements.length} (status: ${port.achievements[0].verificationStatus})`);
    console.log(`- Trainings: ${port.trainings.length} (status: ${port.trainings[0].verificationStatus})`);
    console.log(`- Assessment Attempts: ${port.assessmentAttempts.length} (Score: ${port.assessmentAttempts[0].percentage}%)`);
    console.log(`- Resume URL: ${port.resumeUrl} (status: ${port.resumeVerificationStatus})`);
    // Check all 9 components are present
    if (port.educations.length !== 1)
        throw new Error('Expected 1 education');
    if (port.skillProfiles.length !== 2)
        throw new Error('Expected 2 skill profiles');
    if (port.certificates.length !== 1)
        throw new Error('Expected 1 certificate');
    if (port.projects.length !== 1)
        throw new Error('Expected 1 project');
    if (port.internships.length !== 1)
        throw new Error('Expected 1 internship');
    if (port.achievements.length !== 1)
        throw new Error('Expected 1 achievement');
    if (port.trainings.length !== 1)
        throw new Error('Expected 1 training');
    if (port.assessmentAttempts.length !== 1)
        throw new Error('Expected 1 assessment attempt');
    if (!port.resumeUrl)
        throw new Error('Expected resume URL');
    // Verify zero automatic verifications
    const allStatuses = [
        port.educations[0].verificationStatus,
        ...port.skillProfiles.map((s) => s.verificationStatus),
        port.certificates[0].verificationStatus,
        port.projects[0].verificationStatus,
        port.internships[0].verificationStatus,
        port.achievements[0].verificationStatus,
        port.trainings[0].verificationStatus,
        port.resumeVerificationStatus,
    ];
    for (const s of allStatuses) {
        if (s !== 'PENDING') {
            throw new Error(`STRICT RULE VIOLATION: Item found with status '${s}' instead of 'PENDING'!`);
        }
    }
    console.log('Confirmed: ZERO items were automatically marked as verified!');
    console.log('\n====================================================');
    console.log('STEP 7: Institution Audits and Verifies Items');
    console.log('====================================================');
    const pendingRes = await req('GET', '/institution/portfolio/pending', undefined, instToken);
    console.log('Institution pending queue:');
    console.log(`- Projects: ${pendingRes.data.projects.length}`);
    console.log(`- Certifications: ${pendingRes.data.certificates.length}`);
    console.log(`- Internships: ${pendingRes.data.internships.length}`);
    console.log(`- Educations: ${pendingRes.data.educations.length}`);
    console.log(`- Achievements: ${pendingRes.data.achievements.length}`);
    console.log(`- Trainings: ${pendingRes.data.trainings.length}`);
    console.log(`- Skills: ${pendingRes.data.skills.length}`);
    console.log(`- Resumes: ${pendingRes.data.resumes.length}`);
    // Verify Education
    await req('POST', '/institution/portfolio/verify', {
        itemType: 'EDUCATION',
        itemId: port.educations[0].id,
        status: 'VERIFIED',
        remarks: 'Verified against university registrar archives.',
    }, instToken);
    console.log('Education successfully verified.');
    // Verify Project
    await req('POST', '/institution/portfolio/verify', {
        itemType: 'PROJECT',
        itemId: port.projects[0].id,
        status: 'VERIFIED',
        remarks: 'Lab report and prototype verified by faculty advisor.',
    }, instToken);
    console.log('Project successfully verified.');
    // Verify Skill (skill2)
    const skillProfileToVerify = port.skillProfiles.find((s) => s.skillId === skill2.id);
    await req('POST', '/institution/portfolio/verify', {
        itemType: 'SKILL',
        itemId: skillProfileToVerify.id,
        status: 'VERIFIED',
        remarks: 'Clinical competencies tested and validated.',
    }, instToken);
    console.log('Skill successfully verified.');
    // Verify Training
    await req('POST', '/institution/portfolio/verify', {
        itemType: 'TRAINING',
        itemId: port.trainings[0].id,
        status: 'VERIFIED',
        remarks: 'CSIR certification authenticated.',
    }, instToken);
    console.log('Training successfully verified.');
    // Verify Resume
    await req('POST', '/institution/portfolio/verify', {
        itemType: 'RESUME',
        itemId: port.id,
        status: 'VERIFIED',
        remarks: 'Official CV verified by academic dean.',
    }, instToken);
    console.log('Resume successfully verified.');
    // REJECT Certification (e.g. Broken URL)
    await req('POST', '/institution/portfolio/verify', {
        itemType: 'CERTIFICATION',
        itemId: port.certificates[0].id,
        status: 'REJECTED',
        remarks: 'Credential URL is not publicly accessible. Please re-upload public link.',
    }, instToken);
    console.log('Certification successfully rejected with remarks.');
    // (Leave Achievement as PENDING to test multi-state)
    console.log('\n====================================================');
    console.log('STEP 8: Assert Verification States Reflected in Portfolio');
    console.log('====================================================');
    const updatedPortRes = await req('GET', '/student/portfolio', undefined, studentToken);
    const upPort = updatedPortRes.data;
    // Education should be VERIFIED
    console.log(`Education verificationStatus: ${upPort.educations[0].verificationStatus}`);
    if (upPort.educations[0].verificationStatus !== 'VERIFIED')
        throw new Error('Expected Education to be VERIFIED');
    // Project should be VERIFIED
    console.log(`Project verificationStatus: ${upPort.projects[0].verificationStatus}`);
    if (upPort.projects[0].verificationStatus !== 'VERIFIED')
        throw new Error('Expected Project to be VERIFIED');
    // Skill2 should be VERIFIED and verified: true
    const verifiedSkill = upPort.skillProfiles.find((s) => s.skillId === skill2.id);
    console.log(`Skill2 verificationStatus: ${verifiedSkill.verificationStatus}, verified: ${verifiedSkill.verified}`);
    if (verifiedSkill.verificationStatus !== 'VERIFIED' || verifiedSkill.verified !== true) {
        throw new Error('Expected Skill2 to be VERIFIED with verified=true');
    }
    // Training should be VERIFIED
    console.log(`Training verificationStatus: ${upPort.trainings[0].verificationStatus}`);
    if (upPort.trainings[0].verificationStatus !== 'VERIFIED')
        throw new Error('Expected Training to be VERIFIED');
    // Resume should be VERIFIED
    console.log(`Resume verificationStatus: ${upPort.resumeVerificationStatus}`);
    if (upPort.resumeVerificationStatus !== 'VERIFIED')
        throw new Error('Expected Resume to be VERIFIED');
    // Certification should be REJECTED with remarks
    console.log(`Certification verificationStatus: ${upPort.certificates[0].verificationStatus}, remarks: "${upPort.certificates[0].remarks}"`);
    if (upPort.certificates[0].verificationStatus !== 'REJECTED')
        throw new Error('Expected Certification to be REJECTED');
    if (!upPort.certificates[0].remarks?.includes('not publicly accessible')) {
        throw new Error('Rejection remarks missing on certification!');
    }
    // Achievement should still be PENDING
    console.log(`Achievement verificationStatus: ${upPort.achievements[0].verificationStatus}`);
    if (upPort.achievements[0].verificationStatus !== 'PENDING')
        throw new Error('Expected Achievement to remain PENDING');
    console.log('All 3 verification states (VERIFIED, REJECTED, PENDING) verified with actual DB data!');
    console.log('\n====================================================');
    console.log('STEP 9: Student Deletion & Public Showcase View');
    console.log('====================================================');
    // Student deletes rejected certification
    await req('DELETE', `/student/portfolio/certifications/${upPort.certificates[0].id}`, undefined, studentToken);
    console.log('Deleted rejected certification.');
    // Student deletes skill1
    const skill1Profile = upPort.skillProfiles.find((s) => s.skillId === skill1.id);
    await req('DELETE', `/student/portfolio/skills/${skill1Profile.id}`, undefined, studentToken);
    console.log('Deleted skill1 profile.');
    // Recruiter views public portfolio
    const publicRes = await req('GET', `/student/portfolio/public/${studentProfileId}`);
    console.log(`Public portfolio for ${publicRes.data.fullName}:`);
    console.log(`- Educations: ${publicRes.data.educations.length}`);
    console.log(`- Skills: ${publicRes.data.skillProfiles.length}`);
    console.log(`- Certificates: ${publicRes.data.certificates.length} (asserted 0 after deletion)`);
    if (publicRes.data.certificates.length !== 0)
        throw new Error('Deleted certificate still in portfolio!');
    if (publicRes.data.skillProfiles.length !== 1)
        throw new Error('Deleted skill still in portfolio!');
    console.log('\n====================================================');
    console.log('STEP 10: Teardown & Final Database Cleanliness Check');
    console.log('====================================================');
    await db_1.default.auditLog.deleteMany({});
    await db_1.default.notification.deleteMany({});
    await db_1.default.mentorshipSession.deleteMany({});
    await db_1.default.mentorshipRequest.deleteMany({});
    await db_1.default.mentorshipProgram.deleteMany({});
    await db_1.default.collaborationApplication.deleteMany({});
    await db_1.default.collaboration.deleteMany({});
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
    await db_1.default.user.deleteMany({});
    const finalUsers = await db_1.default.user.count();
    const finalEdu = await db_1.default.studentEducation.count();
    const finalSkills = await db_1.default.skill.count();
    console.log(`Final DB Counts -> Users: ${finalUsers}, Educations: ${finalEdu}, Skills: ${finalSkills}`);
    if (finalUsers !== 0 || finalEdu !== 0 || finalSkills !== 0) {
        throw new Error('Database is not clean after teardown!');
    }
    console.log('\n====================================================');
    console.log('ALL STUDENT DIGITAL PORTFOLIO VERIFICATIONS PASSED (10/10)!');
    console.log('====================================================\n');
}
verifyPortfolio()
    .catch((err) => {
    console.error('VERIFICATION FAILED:', err.message || err);
    process.exit(1);
})
    .finally(async () => {
    await db_1.default.$disconnect();
});
