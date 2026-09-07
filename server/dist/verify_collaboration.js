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
async function main() {
    console.log('========================================================================');
    console.log('>>> PHASE 11: ACADEMIA-INDUSTRY COLLABORATION VERIFICATION <<<');
    console.log('========================================================================\n');
    try {
        // 0. Clean prior test artifacts
        console.log('[Step 0] Cleaning database to ensure pristine state...');
        await cleanDb();
        console.log('✔ Clean database verified.\n');
        // 1. Register 4 roles
        console.log('[Step 1] Registering 4 stakeholder accounts...');
        const indReg = await req('POST', '/auth/register', {
            email: 'industry_collab@ayurtech.com',
            password: 'Password123!',
            role: 'INDUSTRY',
            companyName: 'AyurTech Bio-Pharmaceuticals',
            officialEmail: 'industry_collab@ayurtech.com',
            industrySector: 'Pharmaceutical Analytics',
            location: 'Bangalore, India',
        });
        if (!indReg.ok)
            throw new Error('Failed to register Industry account: ' + JSON.stringify(indReg.data));
        const indToken = indReg.data.token;
        const acadReg = await req('POST', '/auth/register', {
            email: 'prof_sharma@ayurveda.edu',
            password: 'Password123!',
            role: 'ACADEMICIAN',
            fullName: 'Prof. Rajesh Sharma',
            institutionName: 'National Institute of Ayurveda',
            department: 'Dravyaguna (Pharmacology)',
            designation: 'Professor & Head',
        });
        if (!acadReg.ok)
            throw new Error('Failed to register Academician account: ' + JSON.stringify(acadReg.data));
        const acadToken = acadReg.data.token;
        const studReg = await req('POST', '/auth/register', {
            email: 'arjun_student@ayurveda.edu',
            password: 'Password123!',
            role: 'STUDENT',
            fullName: 'Arjun Verma',
            institutionName: 'National Institute of Ayurveda',
            department: 'Dravyaguna (Pharmacology)',
            degree: 'BAMS',
            graduationYear: 2026,
        });
        if (!studReg.ok)
            throw new Error('Failed to register Student account: ' + JSON.stringify(studReg.data));
        const studToken = studReg.data.token;
        const instReg = await req('POST', '/auth/register', {
            email: 'admin@ayurveda.edu',
            password: 'Password123!',
            role: 'INSTITUTION',
            institutionName: 'National Institute of Ayurveda',
            officialEmail: 'admin@ayurveda.edu',
            institutionType: 'University',
            affiliatedUniversity: 'Ministry of Ayush',
        });
        if (!instReg.ok)
            throw new Error('Failed to register Institution account: ' + JSON.stringify(instReg.data));
        const instToken = instReg.data.token;
        console.log('✔ 4 stakeholder accounts registered successfully.\n');
        // 2. Create Collaboration initiatives across all 8 required types
        console.log('[Step 2] Creating collaboration initiatives across all 8 required types...');
        // Industry creates: LIVE_PROJECT, WORKSHOP, INNOVATION_CHALLENGE, MENTORSHIP
        const liveProjectRes = await req('POST', '/collaboration', {
            title: 'Ayurvedic Formulation Analytics Dashboard',
            type: 'LIVE_PROJECT',
            description: 'Design and build an interactive data visualization dashboard for clinical trial stability analysis.',
            targetAudience: 'BAMS and Bioinformatics Students',
            mode: 'HYBRID',
            duration: '12 Weeks',
            budget: 'INR 1,50,000',
            remunerationOrStipend: 'INR 15,000 / month',
            eligibilityCriteria: 'Familiarity with data analysis and herbal formulations.',
        }, indToken);
        if (!liveProjectRes.ok)
            throw new Error('Failed to create LIVE_PROJECT: ' + JSON.stringify(liveProjectRes.data));
        const liveProjectId = liveProjectRes.data.collaboration.id;
        const workshopRes = await req('POST', '/collaboration', {
            title: 'Modern Pharmacovigilance & Safety Monitoring',
            type: 'WORKSHOP',
            description: 'Hands-on practical workshop covering adverse event reporting in herbal and ayurvedic drug development.',
            targetAudience: 'Faculty and Postgraduate Scholars',
            mode: 'ONLINE',
            duration: '3 Days',
            budget: 'INR 75,000',
        }, indToken);
        if (!workshopRes.ok)
            throw new Error('Failed to create WORKSHOP: ' + JSON.stringify(workshopRes.data));
        const workshopId = workshopRes.data.collaboration.id;
        const challengeRes = await req('POST', '/collaboration', {
            title: 'Herb Identification AI Hackathon',
            type: 'INNOVATION_CHALLENGE',
            description: 'Develop computer vision models to distinguish rare medicinal herbs from counterfeit species.',
            targetAudience: 'Students and Research Scholars',
            mode: 'HYBRID',
            duration: '4 Weeks',
            budget: 'INR 2,00,000 prize pool',
        }, indToken);
        if (!challengeRes.ok)
            throw new Error('Failed to create INNOVATION_CHALLENGE: ' + JSON.stringify(challengeRes.data));
        const challengeId = challengeRes.data.collaboration.id;
        const mentorshipRes = await req('POST', '/collaboration', {
            title: 'Clinical Research Mentorship Series',
            type: 'MENTORSHIP',
            description: 'One-on-one executive mentorship from chief pharmacologist on career pathways in herbal pharmaceuticals.',
            targetAudience: 'Final Year Students',
            mode: 'ONLINE',
            duration: '6 Months',
        }, indToken);
        if (!mentorshipRes.ok)
            throw new Error('Failed to create MENTORSHIP: ' + JSON.stringify(mentorshipRes.data));
        const mentorshipId = mentorshipRes.data.collaboration.id;
        // Academician creates: RESEARCH_PROJECT, CONSULTANCY
        const researchRes = await req('POST', '/collaboration', {
            title: 'Phytochemical Synergistic Screening Study',
            type: 'RESEARCH_PROJECT',
            description: 'Joint laboratory investigation of polyphenolic extraction efficiency and antimicrobial potency.',
            targetAudience: 'Industry R&D Teams & Co-investigators',
            mode: 'HYBRID',
            duration: '1 Year',
            budget: 'INR 5,00,000',
        }, acadToken);
        if (!researchRes.ok)
            throw new Error('Failed to create RESEARCH_PROJECT: ' + JSON.stringify(researchRes.data));
        const researchId = researchRes.data.collaboration.id;
        const consultancyRes = await req('POST', '/collaboration', {
            title: 'Clinical Trial Protocol Standardization',
            type: 'CONSULTANCY',
            description: 'Faculty advisory services for designing GCP-compliant randomized trials for novel herbal formulations.',
            targetAudience: 'Ayurvedic Drug Manufacturers',
            mode: 'HYBRID',
            duration: '3 Months',
            remunerationOrStipend: 'INR 50,000 Honorarium',
        }, acadToken);
        if (!consultancyRes.ok)
            throw new Error('Failed to create CONSULTANCY: ' + JSON.stringify(consultancyRes.data));
        const consultancyId = consultancyRes.data.collaboration.id;
        // Institution creates: INDUSTRY_VISIT, GUEST_LECTURE
        const visitRes = await req('POST', '/collaboration', {
            title: 'Good Manufacturing Practices Facility Visit',
            type: 'INDUSTRY_VISIT',
            description: 'Educational site visit to automated herbal extraction and encapsulation plant.',
            targetAudience: 'Undergraduate Batch (50 Students)',
            mode: 'OFFLINE',
            location: 'Bangalore Plant Unit',
            duration: '1 Day',
        }, instToken);
        if (!visitRes.ok)
            throw new Error('Failed to create INDUSTRY_VISIT: ' + JSON.stringify(visitRes.data));
        const visitId = visitRes.data.collaboration.id;
        const lectureRes = await req('POST', '/collaboration', {
            title: 'Global Regulatory Affairs in Herbal Medicine',
            type: 'GUEST_LECTURE',
            description: 'Expert address on US-FDA and EMA compliance pathways for traditional botanical medicine.',
            targetAudience: 'Institution Faculty and Students',
            mode: 'ONLINE',
            duration: '2 Hours',
        }, instToken);
        if (!lectureRes.ok)
            throw new Error('Failed to create GUEST_LECTURE: ' + JSON.stringify(lectureRes.data));
        const lectureId = lectureRes.data.collaboration.id;
        // Verify all 8 distinct types in database
        const allCollabsDb = await db_1.default.collaboration.findMany();
        const distinctTypes = new Set(allCollabsDb.map((c) => c.type));
        console.log(`✔ Created ${allCollabsDb.length} collaboration initiatives across ${distinctTypes.size} unique types.`);
        const expectedTypes = [
            'MENTORSHIP',
            'WORKSHOP',
            'GUEST_LECTURE',
            'LIVE_PROJECT',
            'INNOVATION_CHALLENGE',
            'RESEARCH_PROJECT',
            'CONSULTANCY',
            'INDUSTRY_VISIT',
        ];
        for (const t of expectedTypes) {
            if (!distinctTypes.has(t)) {
                throw new Error(`Expected type ${t} was not found in database!`);
            }
            console.log(`   - ${t}: Verified in database`);
        }
        console.log('✔ All 8 required collaboration types confirmed in database.\n');
        // 3. Test Browse & Search
        console.log('[Step 3] Testing Browse and Search API...');
        // A. Filter by type
        const liveProjectQuery = await req('GET', '/collaboration?type=LIVE_PROJECT', undefined, studToken);
        if (!liveProjectQuery.ok || liveProjectQuery.data.length !== 1 || liveProjectQuery.data[0].id !== liveProjectId) {
            throw new Error('Type filter for LIVE_PROJECT failed');
        }
        console.log('✔ Filter by type (LIVE_PROJECT): 1 result matched');
        // B. Search by keyword
        const searchQuery = await req('GET', '/collaboration?search=Pharmacovigilance', undefined, studToken);
        if (!searchQuery.ok || searchQuery.data.length !== 1 || searchQuery.data[0].id !== workshopId) {
            throw new Error('Keyword search failed to locate workshop');
        }
        console.log('✔ Search by keyword ("Pharmacovigilance"): 1 result matched');
        // C. Filter by mode
        const offlineQuery = await req('GET', '/collaboration?mode=OFFLINE', undefined, studToken);
        if (!offlineQuery.ok || offlineQuery.data.length !== 1 || offlineQuery.data[0].id !== visitId) {
            throw new Error('Mode filter for OFFLINE failed');
        }
        console.log('✔ Filter by mode (OFFLINE): 1 result matched');
        // D. Empty state search
        const emptyQuery = await req('GET', '/collaboration?search=QuantumPhysics123', undefined, studToken);
        if (!emptyQuery.ok || emptyQuery.data.length !== 0) {
            throw new Error('Expected 0 results for nonexistent query');
        }
        console.log('✔ Empty search returns empty array.\n');
        // 4. Test Apply to Collaboration
        console.log('[Step 4] Testing Application lifecycle (Student & Academician apply)...');
        // Student applies to LIVE_PROJECT
        const studApplyRes = await req('POST', `/collaboration/${liveProjectId}/apply`, { proposal: 'I have strong analytical skills in Ayurvedic herbs and wish to contribute.' }, studToken);
        if (!studApplyRes.ok)
            throw new Error('Student failed to apply to LIVE_PROJECT: ' + JSON.stringify(studApplyRes.data));
        const studAppId = studApplyRes.data.application.id;
        console.log(`✔ Student applied to LIVE_PROJECT (Application ID: ${studAppId})`);
        // Student applies to INNOVATION_CHALLENGE
        const studApplyRes2 = await req('POST', `/collaboration/${challengeId}/apply`, { proposal: 'Interested in AI computer vision for herbal species authentication.' }, studToken);
        if (!studApplyRes2.ok)
            throw new Error('Student failed to apply to challenge: ' + JSON.stringify(studApplyRes2.data));
        console.log('✔ Student applied to INNOVATION_CHALLENGE');
        // Academician applies to WORKSHOP
        const acadApplyRes = await req('POST', `/collaboration/${workshopId}/apply`, { proposal: 'I would like to participate in safety monitoring and pharmacovigilance modules.' }, acadToken);
        if (!acadApplyRes.ok)
            throw new Error('Academician failed to apply to workshop: ' + JSON.stringify(acadApplyRes.data));
        const acadAppId = acadApplyRes.data.application.id;
        console.log(`✔ Academician applied to WORKSHOP (Application ID: ${acadAppId})`);
        // Prevent duplicate apply
        const dupRes = await req('POST', `/collaboration/${liveProjectId}/apply`, { proposal: 'Applying again' }, studToken);
        if (dupRes.status !== 400) {
            throw new Error('Duplicate application check failed: second application was not blocked');
        }
        console.log('✔ Duplicate application correctly rejected with status 400.\n');
        // 5. Test Accept / Reject
        console.log('[Step 5] Testing Initiator review and Accept/Reject status update...');
        // Initiator views applicants for LIVE_PROJECT
        const applicantsRes = await req('GET', `/collaboration/${liveProjectId}/applicants`, undefined, indToken);
        if (!applicantsRes.ok || applicantsRes.data.length !== 1 || applicantsRes.data[0].id !== studAppId) {
            throw new Error('Initiator failed to see applicant in list');
        }
        console.log(`✔ Initiator verified applicant list (Found ${applicantsRes.data.length} candidate)`);
        // Accept student's application
        const acceptRes = await req('PUT', `/collaboration/applications/${studAppId}/status`, { status: 'ACCEPTED' }, indToken);
        if (!acceptRes.ok || acceptRes.data.application.status !== 'ACCEPTED') {
            throw new Error('Application status was not updated to ACCEPTED');
        }
        console.log('✔ Student application updated to ACCEPTED');
        // Reject academician application on workshop to verify REJECTED path
        const rejectRes = await req('PUT', `/collaboration/applications/${acadAppId}/status`, { status: 'REJECTED' }, indToken);
        if (!rejectRes.ok || rejectRes.data.application.status !== 'REJECTED') {
            throw new Error('Application status was not updated to REJECTED');
        }
        console.log('✔ Academician application updated to REJECTED.\n');
        // 6. Test Track My Applications
        console.log('[Step 6] Testing Track My Applications...');
        const myAppsRes = await req('GET', '/collaboration/my/applications', undefined, studToken);
        if (!myAppsRes.ok || myAppsRes.data.length !== 2) {
            throw new Error(`Expected 2 tracked applications for student, found ${myAppsRes.data?.length}`);
        }
        const liveProjectApp = myAppsRes.data.find((a) => a.collaborationId === liveProjectId);
        if (!liveProjectApp || liveProjectApp.status !== 'ACCEPTED') {
            throw new Error('Tracked application did not show ACCEPTED status');
        }
        console.log('✔ Student tracking confirms 2 applications with live status ACCEPTED/APPLIED');
        // Initiator tracking
        const myCreatedRes = await req('GET', '/collaboration/my/created', undefined, indToken);
        if (!myCreatedRes.ok || myCreatedRes.data.length !== 4) {
            throw new Error(`Expected 4 created collaborations for industry, found ${myCreatedRes.data?.length}`);
        }
        console.log('✔ Industry tracking confirms 4 created initiatives with applicant breakdowns.\n');
        // 7. Test Feedback & Rating
        console.log('[Step 7] Testing Collaboration Feedback & Ratings...');
        const feedbackRes = await req('POST', `/collaboration/${liveProjectId}/feedback`, {
            rating: 5,
            comments: 'Exceptional industry mentorship and practical exposure to real pharmaceutical analytics!',
            applicationId: studAppId,
        }, studToken);
        if (!feedbackRes.ok || feedbackRes.data.feedback.rating !== 5) {
            throw new Error('Failed to submit 5-star feedback: ' + JSON.stringify(feedbackRes.data));
        }
        console.log('✔ Student submitted 5-star rating and qualitative testimonial');
        // Retrieve feedback
        const getFeedbackRes = await req('GET', `/collaboration/${liveProjectId}/feedback`, undefined, studToken);
        if (!getFeedbackRes.ok ||
            getFeedbackRes.data.count !== 1 ||
            getFeedbackRes.data.averageRating !== 5 ||
            !getFeedbackRes.data.feedbacks[0].comments.includes('Exceptional')) {
            throw new Error('Feedback retrieval verification failed');
        }
        console.log('✔ Verified feedback list, review content, and 5.0 average rating.\n');
        // 8. Test Dashboard Integration
        console.log('[Step 8] Testing Dashboard Integration across Stakeholders...');
        // Student dashboard
        const studDash = await req('GET', '/student/dashboard', undefined, studToken);
        if (!studDash.ok || studDash.data.collaborationsCount !== 2) {
            throw new Error(`Expected collaborationsCount == 2 on student dashboard, got ${studDash.data?.collaborationsCount}`);
        }
        console.log(`✔ Student dashboard includes collaborationsCount: ${studDash.data.collaborationsCount}`);
        // Academician dashboard
        const acadDash = await req('GET', '/academician/dashboard', undefined, acadToken);
        const totalOpps = acadDash.data?.stats?.totalOpportunities ?? acadDash.data?.totalOpportunities;
        if (!acadDash.ok || totalOpps !== 8) {
            throw new Error(`Expected totalOpportunities == 8 on academician dashboard, got ${totalOpps}`);
        }
        console.log(`✔ Academician dashboard reflects totalOpportunities: ${totalOpps}`);
        // Institution Intelligence
        const instDash = await req('GET', '/institution/intelligence', undefined, instToken);
        const collabMetrics = instDash.data?.dimensions?.industryCollaboration;
        if (!instDash.ok || !collabMetrics || collabMetrics.totalCollaborations !== 8) {
            throw new Error(`Expected 8 total collaborations in institution intelligence, got ${collabMetrics?.totalCollaborations}`);
        }
        console.log(`✔ Institution Intelligence reflects 8 total collaborations and accepted engagements: ${collabMetrics.acceptedEngagements}\n`);
        // 9. Teardown and clean database
        console.log('[Step 9] Cleaning up test data and verifying clean database state...');
        await cleanDb();
        const remainingUsers = await db_1.default.user.count();
        const remainingCollabs = await db_1.default.collaboration.count();
        const remainingApps = await db_1.default.collaborationApplication.count();
        const remainingFeedbacks = await db_1.default.collaborationFeedback.count();
        if (remainingUsers !== 0 ||
            remainingCollabs !== 0 ||
            remainingApps !== 0 ||
            remainingFeedbacks !== 0) {
            throw new Error('Database cleanup was incomplete!');
        }
        console.log('✔ Clean database state verified (0 users, 0 collaborations, 0 applications, 0 feedbacks).\n');
        console.log('========================================================================');
        console.log('🎉 ALL 10 COLLABORATION TESTS PASSED SUCCESSFULLY!');
        console.log('========================================================================');
    }
    catch (error) {
        console.error('❌ Verification failed:', error.message);
        process.exit(1);
    }
    finally {
        await db_1.default.$disconnect();
    }
}
main();
