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
async function verifyInstitutionIntelligence() {
    console.log('========================================================================');
    console.log('>>> VERIFYING INSTITUTION INTELLIGENCE DASHBOARD: 9 DIMENSIONS <<<');
    console.log('========================================================================\n');
    // 1. Health check
    console.log('[1] Checking backend health endpoint...');
    const health = await req('GET', '/health');
    if (!health.ok)
        throw new Error('Backend health check failed');
    console.log('  -> Health status: OK');
    // 2. Initial clean state check
    console.log('\n[2] Ensuring database starts 100% clean and empty...');
    await db_1.default.auditLog.deleteMany({});
    await db_1.default.collaborationApplication.deleteMany({});
    await db_1.default.collaboration.deleteMany({});
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
    await db_1.default.studentProfile.deleteMany({});
    await db_1.default.academicianProfile.deleteMany({});
    await db_1.default.industryProfile.deleteMany({});
    await db_1.default.institutionProfile.deleteMany({});
    await db_1.default.user.deleteMany({});
    const initialUserCount = await db_1.default.user.count();
    console.log(`  -> Initial User Count: ${initialUserCount} (Must be 0)`);
    if (initialUserCount !== 0)
        throw new Error('Database is not empty at start!');
    // 3. Register Institution account to test empty state response
    console.log('\n[3] Registering Institution and checking empty state behavior...');
    const instReg = await req('POST', '/auth/register', {
        name: 'AIIA Administrator',
        email: 'intelligence.dean@aiia.gov.in',
        password: 'Password123!',
        role: 'INSTITUTION',
        institutionName: 'All India Institute of Ayurveda',
        officialEmail: 'intelligence.dean@aiia.gov.in',
        institutionType: 'Apex National Institute',
    });
    if (!instReg.ok)
        throw new Error(`Institution registration failed: ${JSON.stringify(instReg.data)}`);
    const instToken = instReg.data.token;
    const emptyIntelRes = await req('GET', '/institution/intelligence', undefined, instToken);
    if (!emptyIntelRes.ok)
        throw new Error(`Intelligence endpoint failed: ${JSON.stringify(emptyIntelRes.data)}`);
    console.log('  -> Empty Database Response hasData:', emptyIntelRes.data.hasData);
    console.log('  -> Total Students:', emptyIntelRes.data.summary.totalStudents);
    if (emptyIntelRes.data.summary.totalStudents !== 0) {
        throw new Error('Expected 0 total students in empty state!');
    }
    // 4. Register Industry, Academician, and Students across 2 departments & 2 cohorts
    console.log('\n[4] Registering test accounts across multiple departments and cohorts...');
    // Industry Partner
    const indReg = await req('POST', '/auth/register', {
        name: 'Dabur Pharma HR',
        email: 'recruitment.pharma@dabur.com',
        password: 'Password123!',
        role: 'INDUSTRY',
        companyName: 'Dabur Life Sciences',
        officialEmail: 'recruitment.pharma@dabur.com',
        industrySector: 'Ayurvedic Pharmaceuticals',
        location: 'Ghaziabad, NCR',
    });
    if (!indReg.ok)
        throw new Error(`Industry registration failed: ${JSON.stringify(indReg.data)}`);
    const indToken = indReg.data.token;
    const industryId = indReg.data.user.id;
    // Academician
    const acadReg = await req('POST', '/auth/register', {
        name: 'Dr. Ramesh Vaidya',
        fullName: 'Dr. Ramesh Vaidya',
        email: 'ramesh.vaidya@aiia.gov.in',
        password: 'Password123!',
        role: 'ACADEMICIAN',
        institutionName: 'All India Institute of Ayurveda',
        department: 'Dravyaguna',
        designation: 'Professor & Head',
        yearsOfExperience: 18,
    });
    if (!acadReg.ok)
        throw new Error(`Academician registration failed: ${JSON.stringify(acadReg.data)}`);
    const acadToken = acadReg.data.token;
    // Student 1: Dravyaguna Department, Cohort 2025
    const s1Reg = await req('POST', '/auth/register', {
        name: 'Rajesh Kumar',
        fullName: 'Rajesh Kumar',
        email: 'rajesh.kumar@aiia.gov.in',
        password: 'Password123!',
        role: 'STUDENT',
        department: 'Dravyaguna',
        degree: 'MD (Ayurveda)',
        institutionName: 'All India Institute of Ayurveda',
        graduationYear: 2025,
        cgpa: 8.8,
    });
    if (!s1Reg.ok)
        throw new Error(`Student 1 failed: ${JSON.stringify(s1Reg.data)}`);
    const s1Token = s1Reg.data.token;
    // Student 2: Dravyaguna Department, Cohort 2026
    const s2Reg = await req('POST', '/auth/register', {
        name: 'Priya Patel',
        fullName: 'Priya Patel',
        email: 'priya.patel@aiia.gov.in',
        password: 'Password123!',
        role: 'STUDENT',
        department: 'Dravyaguna',
        degree: 'BAMS',
        institutionName: 'All India Institute of Ayurveda',
        graduationYear: 2026,
        cgpa: 8.2,
    });
    if (!s2Reg.ok)
        throw new Error(`Student 2 failed: ${JSON.stringify(s2Reg.data)}`);
    const s2Token = s2Reg.data.token;
    // Student 3: Kayachikitsa Department, Cohort 2025
    const s3Reg = await req('POST', '/auth/register', {
        name: 'Amit Verma',
        fullName: 'Amit Verma',
        email: 'amit.verma@aiia.gov.in',
        password: 'Password123!',
        role: 'STUDENT',
        department: 'Kayachikitsa',
        degree: 'MD (Ayurveda)',
        institutionName: 'All India Institute of Ayurveda',
        graduationYear: 2025,
        cgpa: 9.1,
    });
    if (!s3Reg.ok)
        throw new Error(`Student 3 failed: ${JSON.stringify(s3Reg.data)}`);
    const s3Token = s3Reg.data.token;
    console.log('  -> Registered 3 students across 2 departments (Dravyaguna, Kayachikitsa) and 2 cohorts (2025, 2026).');
    // 5. Seed Skills and Assessments in Database
    console.log('\n[5] Seeding real skill categories, skills, and student skill profiles...');
    const category = await db_1.default.skillCategory.create({
        data: {
            name: 'Phytochemistry & Standardization',
            description: 'Herbal analysis, chromatography, and drug validation.',
        },
    });
    const skillHPLC = await db_1.default.skill.create({
        data: {
            name: 'High-Performance Liquid Chromatography (HPLC)',
            categoryId: category.id,
            description: 'Analytical chromatography separation of chemical markers.',
        },
    });
    const skillStandardization = await db_1.default.skill.create({
        data: {
            name: 'Standardization of Herbal Extracts',
            categoryId: category.id,
            description: 'WHO and Pharmacopoeial botanical drug standardization.',
        },
    });
    const skillClinical = await db_1.default.skill.create({
        data: {
            name: 'Clinical Pharmacology & Protocols',
            categoryId: category.id,
            description: 'Design of double-blind Ayurvedic clinical trials.',
        },
    });
    // Assign Student Skills with varying proficiency
    const s1Profile = await db_1.default.studentProfile.findFirst({ where: { user: { email: 'rajesh.kumar@aiia.gov.in' } } });
    const s2Profile = await db_1.default.studentProfile.findFirst({ where: { user: { email: 'priya.patel@aiia.gov.in' } } });
    const s3Profile = await db_1.default.studentProfile.findFirst({ where: { user: { email: 'amit.verma@aiia.gov.in' } } });
    await db_1.default.studentSkillProfile.createMany({
        data: [
            { studentId: s1Profile.id, skillId: skillHPLC.id, proficiencyLevel: 'EXPERT', verified: true },
            { studentId: s1Profile.id, skillId: skillStandardization.id, proficiencyLevel: 'ADVANCED', verified: true },
            { studentId: s2Profile.id, skillId: skillHPLC.id, proficiencyLevel: 'INTERMEDIATE', verified: false },
            { studentId: s3Profile.id, skillId: skillClinical.id, proficiencyLevel: 'EXPERT', verified: true },
        ],
    });
    // Seed Assessments and Attempts
    const assessment = await db_1.default.assessment.create({
        data: {
            categoryId: category.id,
            title: 'Advanced Phytochemistry Certification Exam',
            description: 'Standardized assessment on chromatographic methods.',
            durationMinutes: 30,
            passingScore: 60,
        },
    });
    await db_1.default.assessmentAttempt.createMany({
        data: [
            {
                studentId: s1Profile.id,
                assessmentId: assessment.id,
                score: 90,
                totalScore: 100,
                percentage: 90,
                passed: true,
                completedAt: new Date(),
            },
            {
                studentId: s3Profile.id,
                assessmentId: assessment.id,
                score: 80,
                totalScore: 100,
                percentage: 80,
                passed: true,
                completedAt: new Date(),
            },
        ],
    });
    console.log('  -> Seeded 3 skills, 4 student skill profiles, and 2 completed assessment attempts.');
    // 6. Industry Posts Opportunities
    console.log('\n[6] Industry creates Internship and Job opportunities with skill requirements...');
    const indProfile = await db_1.default.industryProfile.findFirst({ where: { user: { email: 'recruitment.pharma@dabur.com' } } });
    // Opportunity 1: INTERNSHIP
    const oppInternship = await db_1.default.opportunity.create({
        data: {
            industryId: indProfile.id,
            title: 'Ayurvedic Phytochemistry R&D Internship',
            type: 'INTERNSHIP',
            description: 'Summer industrial training in HPLC and standardized botanical extract validation.',
            workMode: 'HYBRID',
            location: 'Ghaziabad R&D Lab',
            duration: '3 Months',
            isPublished: true,
            skills: {
                create: [
                    { skillId: skillHPLC.id, isRequired: true },
                    { skillId: skillStandardization.id, isRequired: true },
                ],
            },
        },
    });
    // Opportunity 2: JOB
    const oppJob = await db_1.default.opportunity.create({
        data: {
            industryId: indProfile.id,
            title: 'Clinical Research Physician - Ayurveda',
            type: 'JOB',
            description: 'Lead GCP-compliant multi-center trials for classical Ayurvedic formulations.',
            workMode: 'ON_SITE',
            location: 'Ghaziabad, NCR',
            isPublished: true,
            skills: {
                create: [
                    { skillId: skillClinical.id, isRequired: true },
                    { skillId: skillStandardization.id, isRequired: false },
                ],
            },
        },
    });
    console.log('  -> Posted 1 Internship and 1 Job opportunity with required skills.');
    // 7. Students Apply & Move through Recruitment Funnel
    console.log('\n[7] Students apply and progress through the recruitment funnel...');
    // Student 1 applies to Internship -> SHORTLISTED -> SELECTED
    const app1 = await db_1.default.application.create({
        data: {
            studentId: s1Profile.id,
            opportunityId: oppInternship.id,
            status: 'SELECTED',
            appliedAt: new Date(),
        },
    });
    // Student 2 applies to Internship -> APPLIED
    await db_1.default.application.create({
        data: {
            studentId: s2Profile.id,
            opportunityId: oppInternship.id,
            status: 'APPLIED',
            appliedAt: new Date(),
        },
    });
    // Student 3 applies to Job -> SHORTLISTED -> INTERVIEW
    await db_1.default.application.create({
        data: {
            studentId: s3Profile.id,
            opportunityId: oppJob.id,
            status: 'INTERVIEW',
            appliedAt: new Date(),
        },
    });
    console.log('  -> Established 3-stage recruitment pipeline (1 Selected, 1 Interview, 1 Applied).');
    // 8. Learning Programs & Industry Collaboration
    console.log('\n[8] Creating Learning Programs and Industry Collaborations...');
    const workshop = await db_1.default.learningProgram.create({
        data: {
            providerId: industryId,
            providerRole: 'INDUSTRY',
            title: 'HPTLC Fingerprinting Masterclass',
            type: 'WORKSHOP',
            description: 'Practical training on high-performance thin-layer chromatography.',
            isPublished: true,
        },
    });
    await db_1.default.learningEnrollment.create({
        data: {
            studentId: s1Profile.id,
            programId: workshop.id,
            status: 'COMPLETED',
        },
    });
    await db_1.default.collaboration.create({
        data: {
            initiatorId: industryId,
            initiatorRole: 'INDUSTRY',
            title: 'Academic-Corporate Diabetes Trial Collaboration',
            type: 'RESEARCH',
            description: 'Joint research on anti-diabetic herbal formulations.',
            status: 'OPEN',
            mode: 'HYBRID',
        },
    });
    console.log('  -> Learning Program enrollment and Industry Collaboration created.');
    // 9. Verify All 9 Intelligence Dimensions
    console.log('\n[9] Fetching Institution Intelligence Analytics and validating all 9 dimensions...');
    const intelRes = await req('GET', '/institution/intelligence', undefined, instToken);
    if (!intelRes.ok)
        throw new Error(`Intelligence API failed: ${JSON.stringify(intelRes.data)}`);
    const { dimensions, summary, filters } = intelRes.data;
    // Validate Summary
    console.log('  -> Total Students:', summary.totalStudents);
    console.log('  -> Assessed Students Count:', summary.overallAssessedStudents);
    console.log('  -> Overall Avg Score:', summary.overallAvgScore + '%');
    console.log('  -> Total Applications:', summary.totalApplications);
    console.log('  -> Placement Rate:', summary.placementRate + '%');
    if (summary.totalStudents !== 3 || summary.overallAssessedStudents !== 2) {
        throw new Error('Summary metrics mismatch!');
    }
    // Dimension 1: Student Skill Distribution
    console.log('\n  [D1] Student Skill Distribution:');
    const prof = dimensions.studentSkillDistribution.proficiencyCounts;
    console.log(`     EXPERT: ${prof.EXPERT}, ADVANCED: ${prof.ADVANCED}, INTERMEDIATE: ${prof.INTERMEDIATE}, BEGINNER: ${prof.BEGINNER}`);
    if (prof.EXPERT !== 2 || prof.ADVANCED !== 1 || prof.INTERMEDIATE !== 1) {
        throw new Error('Proficiency count mismatch in Dimension 1');
    }
    // Dimension 2: Skill Gaps (Supply vs Demand)
    console.log('\n  [D2] Skill Gaps (Supply vs Demand):');
    const gaps = dimensions.skillGaps.allSkillGaps;
    console.log(`     Total Skills Evaluated: ${gaps.length}`);
    const stdGap = gaps.find((g) => g.skill === 'Standardization of Herbal Extracts');
    console.log(`     Standardization Demand: ${stdGap?.industryDemand}, Supply: ${stdGap?.studentCount}, Gap: ${stdGap?.gap}`);
    if (!stdGap || stdGap.industryDemand !== 2 || stdGap.studentCount !== 1 || stdGap.gap !== 1) {
        throw new Error('Skill gap calculation mismatch for Standardization in Dimension 2');
    }
    // Dimension 3: Industry Skill Demand
    console.log('\n  [D3] Industry Skill Demand:');
    const topDemand = dimensions.industrySkillDemand.topInDemandSkills;
    console.log(`     Top Demanded Skills: ${topDemand.map((d) => `${d.skill} (${d.totalDemand})`).join(', ')}`);
    if (topDemand.length === 0 || topDemand[0].totalDemand < 1) {
        throw new Error('Industry skill demand mismatch in Dimension 3');
    }
    // Dimension 4: Internship Applications
    console.log('\n  [D4] Internship Applications:');
    const internApps = dimensions.internshipApplications;
    console.log(`     Total Internship Apps: ${internApps.totalApplications}`);
    console.log(`     Status: APPLIED=${internApps.statusBreakdown.APPLIED}, SELECTED=${internApps.statusBreakdown.SELECTED}`);
    if (internApps.totalApplications !== 2 || internApps.statusBreakdown.SELECTED !== 1) {
        throw new Error('Internship applications mismatch in Dimension 4');
    }
    // Dimension 5: Internship Selection
    console.log('\n  [D5] Internship Selection:');
    const internSel = dimensions.internshipSelection;
    console.log(`     Selected Count: ${internSel.selectedCount}, Selection Rate: ${internSel.selectionRate}%`);
    if (internSel.selectedCount !== 1 || internSel.selectionRate !== 50) {
        throw new Error('Internship selection rate mismatch in Dimension 5');
    }
    // Dimension 6: Placement Pipeline Funnel
    console.log('\n  [D6] Placement Pipeline Funnel:');
    const pipeline = dimensions.placementPipeline;
    for (const s of pipeline.stages) {
        console.log(`     ${s.stage}: ${s.count} (${s.percentage}%)`);
    }
    if (pipeline.stages[0].count !== 3 || // Applied
        pipeline.stages[1].count !== 2 || // Shortlisted
        pipeline.stages[2].count !== 2 || // Interview
        pipeline.stages[3].count !== 1 // Selected
    ) {
        throw new Error('Pipeline funnel stage counts mismatch in Dimension 6');
    }
    // Dimension 7: Learning Participation
    console.log('\n  [D7] Learning Participation:');
    const lp = dimensions.learningParticipation;
    console.log(`     Total Enrollments: ${lp.totalEnrollments}, Completed: ${lp.byStatus.COMPLETED}`);
    if (lp.totalEnrollments !== 1 || lp.byStatus.COMPLETED !== 1) {
        throw new Error('Learning participation mismatch in Dimension 7');
    }
    // Dimension 8: Industry Collaboration
    console.log('\n  [D8] Industry Collaboration:');
    const ic = dimensions.industryCollaboration;
    console.log(`     Total Collaborations: ${ic.totalCollaborations}`);
    if (ic.totalCollaborations !== 1) {
        throw new Error('Industry collaboration count mismatch in Dimension 8');
    }
    // Dimension 9: Department-Wise Readiness
    console.log('\n  [D9] Department-Wise Readiness Matrix:');
    const dr = dimensions.departmentReadiness;
    for (const dept of dr) {
        console.log(`     ${dept.department}: Students=${dept.studentCount}, Assessed=${dept.assessmentRate}%, AvgScore=${dept.avgScore}%, Selected=${dept.selectedCount}, ReadinessIndex=${dept.readinessIndex}/100`);
    }
    if (dr.length !== 2) {
        throw new Error('Expected 2 departments in readiness matrix');
    }
    // 10. Test Dynamic Reactive Filtering
    console.log('\n[10] Testing dynamic reactive filters...');
    // 10a. Filter by Department = Dravyaguna
    const deptFilterRes = await req('GET', '/institution/intelligence?department=Dravyaguna', undefined, instToken);
    if (!deptFilterRes.ok)
        throw new Error('Department filter request failed');
    const dravyagunaStudents = deptFilterRes.data.summary.totalStudents;
    console.log(`  -> Filter [department=Dravyaguna]: Scoped Students = ${dravyagunaStudents} (Expected 2)`);
    if (dravyagunaStudents !== 2)
        throw new Error('Department filter did not scope students correctly');
    // 10b. Filter by Cohort = 2026
    const cohortFilterRes = await req('GET', '/institution/intelligence?cohort=2026', undefined, instToken);
    if (!cohortFilterRes.ok)
        throw new Error('Cohort filter request failed');
    const cohort2026Students = cohortFilterRes.data.summary.totalStudents;
    console.log(`  -> Filter [cohort=2026]: Scoped Students = ${cohort2026Students} (Expected 1)`);
    if (cohort2026Students !== 1)
        throw new Error('Cohort filter did not scope students correctly');
    // 10c. Filter by Opportunity Type = INTERNSHIP
    const oppTypeFilterRes = await req('GET', '/institution/intelligence?opportunityType=INTERNSHIP', undefined, instToken);
    if (!oppTypeFilterRes.ok)
        throw new Error('OpportunityType filter request failed');
    const internshipFunnelApps = oppTypeFilterRes.data.dimensions.placementPipeline.totalApplications;
    console.log(`  -> Filter [opportunityType=INTERNSHIP]: Pipeline Apps = ${internshipFunnelApps} (Expected 2)`);
    if (internshipFunnelApps !== 2)
        throw new Error('OpportunityType filter mismatch');
    // 11. Teardown: Purge all test records and verify empty database
    console.log('\n[11] Teardown: Purging all records to return database to 100% clean and empty state...');
    await db_1.default.auditLog.deleteMany({});
    await db_1.default.collaborationApplication.deleteMany({});
    await db_1.default.collaboration.deleteMany({});
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
    await db_1.default.studentProfile.deleteMany({});
    await db_1.default.academicianProfile.deleteMany({});
    await db_1.default.industryProfile.deleteMany({});
    await db_1.default.institutionProfile.deleteMany({});
    await db_1.default.user.deleteMany({});
    const finalUsers = await db_1.default.user.count();
    const finalOpps = await db_1.default.opportunity.count();
    const finalApps = await db_1.default.application.count();
    console.log(`  -> Final Database State: Users = ${finalUsers}, Opportunities = ${finalOpps}, Applications = ${finalApps}`);
    if (finalUsers !== 0 || finalOpps !== 0 || finalApps !== 0) {
        throw new Error('Database is not clean and empty after teardown!');
    }
    console.log('\n========================================================================');
    console.log('>>> INSTITUTION INTELLIGENCE VERIFICATION COMPLETED (11/11 PASSED) <<<');
    console.log('========================================================================\n');
}
verifyInstitutionIntelligence()
    .then(() => process.exit(0))
    .catch((err) => {
    console.error('\n❌ Institution Intelligence Verification Failed:', err);
    process.exit(1);
});
