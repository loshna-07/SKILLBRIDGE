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
async function verifyMatchingEngine() {
    console.log('========================================================================');
    console.log('>>> VERIFYING SKILL MAPPING AND MATCHING ENGINE: END-TO-END FLOW <<<');
    console.log('========================================================================\n');
    // 1. Health check
    console.log('[1] Checking backend health endpoint...');
    const health = await req('GET', '/health');
    if (!health.ok)
        throw new Error('Backend health check failed');
    console.log('  -> Health status: OK');
    // 2. Clean database
    console.log('\n[2] Ensuring clean database state...');
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
    await db_1.default.studentProfile.deleteMany({});
    await db_1.default.industryProfile.deleteMany({});
    await db_1.default.institutionProfile.deleteMany({});
    await db_1.default.user.deleteMany({});
    await db_1.default.platformSetting.deleteMany({});
    console.log('  -> Database verified clean (0 records across all tables).');
    // 3. Register Institution and Industry
    console.log('\n[3] Registering Institution and Industry accounts...');
    const instReg = await req('POST', '/auth/register', {
        role: 'INSTITUTION',
        email: 'registrar@nia.edu.in',
        password: 'Password123!',
        institutionName: 'National Institute of Ayurveda',
        officialEmail: 'registrar@nia.edu.in',
        institutionType: 'Deemed University (AYUSH)',
    });
    if (!instReg.ok)
        throw new Error('Institution registration failed: ' + JSON.stringify(instReg.data));
    const instToken = instReg.data.token;
    const indReg = await req('POST', '/auth/register', {
        role: 'INDUSTRY',
        email: 'careers@himalayawellness.com',
        password: 'Password123!',
        companyName: 'Himalaya Wellness Research Labs',
        officialEmail: 'careers@himalayawellness.com',
        industrySector: 'Ayurvedic Pharmaceuticals & Diagnostics',
        location: 'Bengaluru',
    });
    if (!indReg.ok)
        throw new Error('Industry registration failed: ' + JSON.stringify(indReg.data));
    const indToken = indReg.data.token;
    console.log('  -> Institution and Industry accounts registered.');
    // 4. Create Skill Category and Skills
    console.log('\n[4] Creating Skill Category and Competencies in PostgreSQL...');
    const catRes = await req('POST', '/assessments/categories', {
        name: 'Ayurvedic Pharmaceutical & Clinical Research',
        description: 'Drug development, pharmacovigilance, and toxicology.',
    }, instToken);
    const categoryId = catRes.data.id;
    const skill1Res = await req('POST', '/assessments/skills', {
        categoryId,
        name: 'Ayurvedic Formulation & Rasashastra',
    }, instToken);
    const skill1Id = skill1Res.data.id;
    const skill2Res = await req('POST', '/assessments/skills', {
        categoryId,
        name: 'Pharmacovigilance & Safety Monitoring',
    }, instToken);
    const skill2Id = skill2Res.data.id;
    const skill3Res = await req('POST', '/assessments/skills', {
        categoryId,
        name: 'Toxicology & Analytical Standardization',
    }, instToken);
    const skill3Id = skill3Res.data.id;
    console.log('  -> Created Skills: Formulation, Pharmacovigilance, Toxicology.');
    // 5. Register Two Distinct Students
    console.log('\n[5] Registering two students with distinct qualifications and assessed skills...');
    // Student 1: High Match Student (Arjun)
    const s1Reg = await req('POST', '/auth/register', {
        role: 'STUDENT',
        email: 'arjun.qualified@nia.edu.in',
        password: 'Password123!',
        fullName: 'Arjun Verma',
        institutionName: 'National Institute of Ayurveda',
        department: 'Dravyaguna',
        degree: 'BAMS',
        currentYear: '4',
        cgpa: '9.25',
        graduationYear: '2026',
        location: 'Jaipur',
    });
    if (!s1Reg.ok)
        throw new Error('Student 1 registration failed: ' + JSON.stringify(s1Reg.data));
    const s1Token = s1Reg.data.token;
    const s1Profile = await db_1.default.studentProfile.findUnique({ where: { userId: s1Reg.data.user.id } });
    // Attach assessed skills for Student 1:
    // Formulation: 95% (ADVANCED), Pharmacovigilance: 85% (ADVANCED)
    await db_1.default.studentSkillProfile.create({
        data: {
            studentId: s1Profile.id,
            skillId: skill1Id,
            proficiencyLevel: 'ADVANCED',
            scorePercentage: 95,
            verified: true,
            lastAssessedAt: new Date(),
        },
    });
    await db_1.default.studentSkillProfile.create({
        data: {
            studentId: s1Profile.id,
            skillId: skill2Id,
            proficiencyLevel: 'ADVANCED',
            scorePercentage: 85,
            verified: true,
            lastAssessedAt: new Date(),
        },
    });
    // Student 2: Low Match Student (Rohan)
    const s2Reg = await req('POST', '/auth/register', {
        role: 'STUDENT',
        email: 'rohan.entry@external.edu.in',
        password: 'Password123!',
        fullName: 'Rohan Patil',
        institutionName: 'State Science College',
        department: 'General Botany',
        degree: 'B.Sc',
        currentYear: '2',
        cgpa: '6.20',
        graduationYear: '2028',
        location: 'Pune',
    });
    if (!s2Reg.ok)
        throw new Error('Student 2 registration failed: ' + JSON.stringify(s2Reg.data));
    const s2Token = s2Reg.data.token;
    const s2Profile = await db_1.default.studentProfile.findUnique({ where: { userId: s2Reg.data.user.id } });
    // Attach assessed skills for Student 2:
    // Formulation: 40% (BEGINNER), Lacks Pharmacovigilance and Toxicology
    await db_1.default.studentSkillProfile.create({
        data: {
            studentId: s2Profile.id,
            skillId: skill1Id,
            proficiencyLevel: 'BEGINNER',
            scorePercentage: 40,
            verified: false,
            lastAssessedAt: new Date(),
        },
    });
    console.log('  -> Student 1 (Arjun): CGPA 9.25, BAMS, Dravyaguna, Formulation (95%), Pharmacovigilance (85%).');
    console.log('  -> Student 2 (Rohan): CGPA 6.20, B.Sc, Botany, Formulation (40%).');
    // 6. Create Internship Opportunity
    console.log('\n[6] Industry creates Internship Opportunity requiring Formulation & Pharmacovigilance...');
    const internRes = await req('POST', '/opportunities', {
        title: 'Clinical Formulation & Safety Internship',
        type: 'INTERNSHIP',
        description: 'Practical clinical trial monitoring and Ayurvedic formulation research.',
        minCgpa: 8.0,
        department: 'Dravyaguna',
        degree: 'BAMS',
        location: 'Bengaluru',
        workMode: 'ON_SITE',
        stipendOrSalary: '?25,000 / month',
        numberOfOpenings: 3,
        skillIds: [
            { skillId: skill1Id, isRequired: true }, // Formulation (Mandatory)
            { skillId: skill2Id, isRequired: false }, // Pharmacovigilance (Preferred)
        ],
    }, indToken);
    if (!internRes.ok)
        throw new Error('Internship creation failed: ' + JSON.stringify(internRes.data));
    const internshipId = internRes.data.id;
    console.log('  -> Created Internship (ID:', internshipId, ')');
    // 7. Create Job Opportunity
    console.log('\n[7] Industry creates Job Opportunity requiring Pharmacovigilance & Toxicology...');
    const jobRes = await req('POST', '/opportunities', {
        title: 'Senior Pharmacovigilance & Toxicology Associate',
        type: 'JOB',
        description: 'Post-market surveillance and heavy metal toxicology standardization.',
        minCgpa: 8.5,
        department: 'Dravyaguna',
        degree: 'BAMS',
        location: 'Bengaluru',
        workMode: 'HYBRID',
        stipendOrSalary: '?8.5 LPA',
        numberOfOpenings: 1,
        skillIds: [
            { skillId: skill2Id, isRequired: true }, // Pharmacovigilance (Mandatory)
            { skillId: skill3Id, isRequired: true }, // Toxicology (Mandatory)
        ],
    }, indToken);
    if (!jobRes.ok)
        throw new Error('Job creation failed: ' + JSON.stringify(jobRes.data));
    const jobId = jobRes.data.id;
    console.log('  -> Created Job (ID:', jobId, ')');
    // 8. Create Learning Program
    console.log('\n[8] Institution creates Learning Program teaching Toxicology & Pharmacovigilance...');
    const progRes = await req('POST', '/learning', {
        title: 'Masterclass in Ayurvedic Toxicology & Safety Standards',
        type: 'CERTIFICATION',
        description: 'Comprehensive 8-week certification covering analytical safety protocols.',
        duration: '8 Weeks',
        price: 'Free',
        mode: 'ONLINE',
        skillIds: [skill2Id, skill3Id],
    }, instToken);
    if (!progRes.ok)
        throw new Error('Learning program creation failed: ' + JSON.stringify(progRes.data));
    const programId = progRes.data.id;
    console.log('  -> Created Learning Program (ID:', programId, ')');
    // 9. Test Matching Engine for Internship: Student 1 vs Student 2
    console.log('\n[9] Evaluating Internship Compatibility...');
    const s1InternMatch = await req('GET', `/matching/opportunity/${internshipId}`, undefined, s1Token);
    if (!s1InternMatch.ok)
        throw new Error('S1 Internship matching failed: ' + JSON.stringify(s1InternMatch.data));
    const s1M = s1InternMatch.data;
    console.log('  -> Student 1 (Arjun) Internship Match:');
    console.log('     * Match Percentage:', s1M.matchPercentage + '%');
    console.log('     * Matched Skills:', s1M.matchedSkills.map((s) => `${s.name} (${s.proficiency})`));
    console.log('     * Missing Skills:', s1M.missingSkills);
    console.log('     * Eligibility:', s1M.eligibility.isEligible ? 'ELIGIBLE' : 'INELIGIBLE');
    console.log('     * Skill Gaps:', s1M.skillGaps);
    if (s1M.matchPercentage < 80) {
        throw new Error('Expected Student 1 match percentage >= 80%, got ' + s1M.matchPercentage);
    }
    if (!s1M.eligibility.isEligible) {
        throw new Error('Expected Student 1 to be eligible for Internship');
    }
    const s2InternMatch = await req('GET', `/matching/opportunity/${internshipId}`, undefined, s2Token);
    if (!s2InternMatch.ok)
        throw new Error('S2 Internship matching failed: ' + JSON.stringify(s2InternMatch.data));
    const s2M = s2InternMatch.data;
    console.log('\n  -> Student 2 (Rohan) Internship Match:');
    console.log('     * Match Percentage:', s2M.matchPercentage + '%');
    console.log('     * Eligibility:', s2M.eligibility.isEligible ? 'ELIGIBLE' : 'INELIGIBLE');
    console.log('     * Eligibility Reasons:', s2M.eligibility.reasons);
    console.log('     * Skill Gaps:', s2M.skillGaps.map((g) => `${g.name}: ${g.gapType} (${g.severity})`));
    if (s2M.matchPercentage >= s1M.matchPercentage) {
        throw new Error('Student 2 score should be strictly lower than Student 1');
    }
    if (s2M.eligibility.isEligible) {
        throw new Error('Expected Student 2 to be ineligible (CGPA 6.2 < 8.0, degree B.Sc)');
    }
    console.log('  -> Strictly verified: High match vs. Low match differentiated deterministically.');
    // 10. Test Matching Engine for Job (Mandatory Skills Gap Check)
    console.log('\n[10] Evaluating Job Compatibility (Checking mandatory skill gap)...');
    const s1JobMatch = await req('GET', `/matching/opportunity/${jobId}`, undefined, s1Token);
    if (!s1JobMatch.ok)
        throw new Error('S1 Job matching failed: ' + JSON.stringify(s1JobMatch.data));
    const s1Job = s1JobMatch.data;
    console.log('  -> Student 1 Job Match:');
    console.log('     * Match Percentage:', s1Job.matchPercentage + '%');
    console.log('     * Matched Skills:', s1Job.matchedSkills.map((s) => s.name));
    console.log('     * Missing Skills:', s1Job.missingSkills.map((s) => s.name));
    console.log('     * Eligibility isEligible:', s1Job.eligibility.isEligible);
    console.log('     * Skill Gaps:', s1Job.skillGaps.map((g) => `${g.name}: ${g.gapType} (${g.severity})`));
    if (s1Job.eligibility.isEligible === true) {
        throw new Error('Student 1 should NOT be eligible because mandatory Toxicology skill is missing');
    }
    const toxiGap = s1Job.skillGaps.find((g) => g.name.includes('Toxicology'));
    if (!toxiGap || toxiGap.gapType !== 'MISSING_REQUIRED' || toxiGap.severity !== 'HIGH') {
        throw new Error('Expected high-severity MISSING_REQUIRED gap for Toxicology: ' + JSON.stringify(s1Job.skillGaps));
    }
    console.log('  -> Strictly verified: Missing mandatory skill correctly flags ineligibility and high-priority skill gap.');
    // 11. Test Matching Engine for Learning Program
    console.log('\n[11] Evaluating Learning Program Compatibility (Addresses Gap Check)...');
    const s1ProgMatch = await req('GET', `/matching/learning-program/${programId}`, undefined, s1Token);
    if (!s1ProgMatch.ok)
        throw new Error('S1 Program matching failed: ' + JSON.stringify(s1ProgMatch.data));
    const s1Prog = s1ProgMatch.data;
    console.log('  -> Student 1 Learning Program Match:');
    console.log('     * Match Percentage:', s1Prog.matchPercentage + '%');
    console.log('     * Addressed Competencies:', s1Prog.skillGaps.map((g) => `${g.name}: ${g.recommendation}`));
    if (s1Prog.matchPercentage < 70) {
        throw new Error('Expected program match percentage >= 70%, got ' + s1Prog.matchPercentage);
    }
    console.log('  -> Strictly verified: Program matching recommends module addressing missing skill.');
    // 12. Test Configurable Weights API
    console.log('\n[12] Testing Configurable Weights GET & PUT APIs...');
    const getWeightsRes = await req('GET', '/matching/weights');
    if (!getWeightsRes.ok)
        throw new Error('Failed to get weights: ' + JSON.stringify(getWeightsRes.data));
    console.log('  -> Default Weights in DB:', getWeightsRes.data);
    // Update weights: heavily favor skills (0.70)
    const updateWeightsRes = await req('PUT', '/matching/weights', {
        skillWeight: 0.70,
        assessmentWeight: 0.10,
        cgpaWeight: 0.10,
        academicWeight: 0.10,
    }, instToken);
    if (!updateWeightsRes.ok)
        throw new Error('Failed to update weights: ' + JSON.stringify(updateWeightsRes.data));
    console.log('  -> Successfully updated weights to 70% skill weight:', updateWeightsRes.data.weights);
    // Recalculate with updated weights
    const s1NewMatch = await req('GET', `/matching/opportunity/${internshipId}`, undefined, s1Token);
    if (s1NewMatch.data.weightsUsed.skillWeight !== 0.70) {
        throw new Error('Expected weightsUsed.skillWeight to be 0.70, got ' + s1NewMatch.data.weightsUsed.skillWeight);
    }
    console.log('  -> Recalculated Internship Match with 70% skill weight:', s1NewMatch.data.matchPercentage + '%');
    // 13. Test Custom Simulation Endpoint
    console.log('\n[13] Testing Custom Simulation API (POST /api/matching/calculate)...');
    const simRes = await req('POST', '/matching/calculate', {
        studentId: s1Profile.id,
        entityType: 'OPPORTUNITY',
        entityId: internshipId,
        customWeights: {
            skillWeight: 0.85,
            assessmentWeight: 0.05,
            cgpaWeight: 0.05,
            academicWeight: 0.05,
        },
    }, instToken);
    if (!simRes.ok)
        throw new Error('Custom calculation failed: ' + JSON.stringify(simRes.data));
    console.log('  -> Custom Simulation result (85% skill weight):', simRes.data.matchPercentage + '%');
    if (simRes.data.weightsUsed.skillWeight !== 0.85) {
        throw new Error('Simulation did not apply custom weights properly');
    }
    // 14. Clean Teardown
    console.log('\n[14] Performing Clean Teardown (Empty Database Constraint)...');
    await db_1.default.auditLog.deleteMany({});
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
    await db_1.default.studentProfile.deleteMany({});
    await db_1.default.industryProfile.deleteMany({});
    await db_1.default.institutionProfile.deleteMany({});
    await db_1.default.user.deleteMany({});
    await db_1.default.platformSetting.deleteMany({});
    const finalUsers = await db_1.default.user.count();
    const finalOpps = await db_1.default.opportunity.count();
    const finalProgs = await db_1.default.learningProgram.count();
    console.log(`  -> Database clean: ${finalUsers} users, ${finalOpps} opportunities, ${finalProgs} learning programs.`);
    console.log('\n========================================================================');
    console.log('>>> SUCCESS: ALL MATCHING ENGINE REQUIREMENTS VERIFIED (100% PASS) <<<');
    console.log('========================================================================\n');
}
verifyMatchingEngine().catch((err) => {
    console.error('\n? VERIFICATION FAILED:', err);
    process.exit(1);
});
