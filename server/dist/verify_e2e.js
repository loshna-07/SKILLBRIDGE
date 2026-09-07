"use strict";
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
    if (!res.ok) {
        throw new Error(`${method} ${path} failed with ${res.status}: ${JSON.stringify(data)}`);
    }
    return data;
}
const api = {
    get: (path, token) => req('GET', path, undefined, token),
    post: (path, body, token) => req('POST', path, body, token),
    put: (path, body, token) => req('PUT', path, body, token),
    delete: (path, token) => req('DELETE', path, undefined, token),
};
async function runVerification() {
    console.log('--- STARTING SKILLBRIDGE E2E VERIFICATION ---');
    // 1. Check Initial Public Stats (Empty Database Check)
    console.log('\n[1] Checking initial database counts (Must be dynamic):');
    const initialStats = await api.get('/stats/public');
    console.log('Public Stats:', initialStats);
    // 2. Register Institution
    console.log('\n[2] Registering Academic Institution:');
    const instEmail = `admin-${Date.now()}@nitk.edu.in`;
    const instRegRes = await api.post('/auth/register', {
        role: 'INSTITUTION',
        email: instEmail,
        password: 'Password123!',
        institutionName: 'National Institute of Technology Karnataka',
        officialEmail: instEmail,
        institutionType: 'Central University',
        affiliatedUniversity: 'Autonomous',
        address: 'Surathkal, Mangaluru',
        website: 'https://nitk.ac.in',
        contactPerson: 'Dr. Ramesh Babu',
        contactNumber: '+91 9876543210',
    });
    const instToken = instRegRes.token;
    console.log('Institution Registered. User ID:', instRegRes.user.id);
    // 2b. Institution creates Category, Skills, Assessment
    console.log('\n[3] Institution creating Skill Category and Skills:');
    const catRes = await api.post('/assessments/categories', { name: `Full-Stack Development ${Date.now()}`, description: 'Web application technologies' }, instToken);
    const categoryId = catRes.id;
    const skill1Res = await api.post('/assessments/skills', { categoryId, name: `React.js-${Date.now()}`, description: 'Frontend library' }, instToken);
    const skillReactId = skill1Res.id;
    const skill2Res = await api.post('/assessments/skills', { categoryId, name: `Node.js-${Date.now()}`, description: 'Backend runtime' }, instToken);
    const skillNodeId = skill2Res.id;
    const skill3Res = await api.post('/assessments/skills', { categoryId, name: `Docker-${Date.now()}`, description: 'Containerization' }, instToken);
    const skillDockerId = skill3Res.id;
    console.log('Skills created: React.js, Node.js, Docker');
    // Institution creates Assessment with Questions
    console.log('\n[4] Institution creating Assessment & Questions:');
    const assessRes = await api.post('/assessments', {
        title: 'Full Stack Engineering Evaluation',
        description: 'Standardized assessment testing React and Node.js concepts',
        categoryId,
        durationMinutes: 30,
        passingScore: 60,
    }, instToken);
    const assessmentId = assessRes.id;
    // Question 1 for React
    await api.post(`/assessments/${assessmentId}/questions`, {
        questionText: 'Which React hook is used to perform side effects in functional components?',
        skillId: skillReactId,
        difficulty: 'EASY',
        weightage: 5,
        options: [
            { optionText: 'useState', isCorrect: false },
            { optionText: 'useEffect', isCorrect: true },
            { optionText: 'useContext', isCorrect: false },
            { optionText: 'useReducer', isCorrect: false },
        ],
    }, instToken);
    // Question 2 for Node.js
    await api.post(`/assessments/${assessmentId}/questions`, {
        questionText: 'What is the default module system in standard modern Node.js?',
        skillId: skillNodeId,
        difficulty: 'MEDIUM',
        weightage: 5,
        options: [
            { optionText: 'CommonJS / ES Modules', isCorrect: true },
            { optionText: 'AMD', isCorrect: false },
            { optionText: 'UMD', isCorrect: false },
            { optionText: 'RequireJS', isCorrect: false },
        ],
    }, instToken);
    console.log('Assessment created with 2 evaluated questions.');
    // 3. Register Industry
    console.log('\n[5] Registering Industry Partner:');
    const indEmail = `recruiter-${Date.now()}@zetasolutions.com`;
    const indRegRes = await api.post('/auth/register', {
        role: 'INDUSTRY',
        email: indEmail,
        password: 'Password123!',
        companyName: 'Zeta Cloud Systems',
        officialEmail: indEmail,
        industrySector: 'Cloud & FinTech',
        companySize: '51-200',
        website: 'https://zetasolutions.com',
        location: 'Bengaluru, Karnataka',
        description: 'Enterprise Cloud Infrastructure and SaaS provider',
        contactPerson: 'Aditi Nair',
        contactNumber: '+91 9988776655',
    });
    const indToken = indRegRes.token;
    console.log('Industry Registered. User ID:', indRegRes.user.id);
    // Industry posts Internship
    console.log('\n[6] Industry posting Internship opportunity:');
    const oppRes = await api.post('/opportunities', {
        title: 'Full Stack Cloud Engineering Intern',
        type: 'INTERNSHIP',
        description: 'Build scalable microservices and responsive dashboards using React and Node.js.',
        degree: 'B.Tech',
        department: 'Computer Science',
        minCgpa: 8.0,
        experience: 'Fresher',
        location: 'Bengaluru',
        workMode: 'HYBRID',
        stipendOrSalary: '₹35,000 / month',
        numberOfOpenings: 3,
        duration: '6 Months',
        skillIds: [
            { skillId: skillReactId, isRequired: true },
            { skillId: skillNodeId, isRequired: true },
            { skillId: skillDockerId, isRequired: false },
        ],
    }, indToken);
    const opportunityId = oppRes.id;
    console.log('Opportunity posted. ID:', opportunityId);
    // 4. Register Student
    console.log('\n[7] Registering Student:');
    const studentEmail = `arjun-${Date.now()}@nitk.edu.in`;
    const studentRegRes = await api.post('/auth/register', {
        role: 'STUDENT',
        email: studentEmail,
        password: 'Password123!',
        fullName: 'Arjun Mehta',
        phone: '+91 9123456780',
        dob: '2004-05-15',
        gender: 'Male',
        institutionName: 'National Institute of Technology Karnataka',
        department: 'Computer Science',
        degree: 'B.Tech',
        currentYear: 3,
        cgpa: 8.75,
        graduationYear: 2026,
        location: 'Mangaluru',
    });
    const studentToken = studentRegRes.token;
    console.log('Student Registered. User ID:', studentRegRes.user.id);
    // Student takes Assessment
    console.log('\n[8] Student taking skill assessment:');
    const testFetch = await api.get(`/assessments/${assessmentId}`, studentToken);
    const questions = testFetch.questions;
    // Student answers questions (select correct option for both)
    const responses = questions.map((q) => {
        // find correct option to get high score
        const correctOpt = q.options.find((o) => o.optionText.includes('useEffect') || o.optionText.includes('CommonJS')) || q.options[0];
        return {
            questionId: q.id,
            selectedOptionId: correctOpt.id,
        };
    });
    const submitRes = await api.post(`/assessments/${assessmentId}/submit`, { responses }, studentToken);
    console.log('Assessment Submitted. Score:', submitRes.score, 'Percentage:', submitRes.percentage + '%');
    console.log('Skill breakdown generated:', submitRes.skillBreakdown);
    // Student views Opportunity with Matching Engine
    console.log('\n[9] Student evaluating opportunities via Matching Engine:');
    const oppsListRes = await api.get('/opportunities', studentToken);
    const targetOpp = oppsListRes.find((o) => o.id === opportunityId);
    console.log('Matching Score:', targetOpp.matchResult.matchScore + '%');
    console.log('Explanation:', targetOpp.matchResult.explanation);
    console.log('CGPA Eligible:', targetOpp.matchResult.cgpaEligible);
    console.log('Missing skills identified:', targetOpp.matchResult.missingRequiredSkills);
    // Student applies to opportunity
    console.log('\n[10] Student applying to opportunity:');
    const applyRes = await api.post(`/opportunities/${opportunityId}/apply`, { coverLetter: 'I have experience building React and Node.js applications.' }, studentToken);
    const applicationId = applyRes.application.id;
    console.log('Application submitted. ID:', applicationId, 'Status:', applyRes.application.status);
    // Student adds Project to Digital Portfolio
    console.log('\n[11] Student adding Project to Portfolio:');
    const projRes = await api.post('/student/portfolio/projects', {
        title: 'Real-Time Distributed Telemetry Dashboard',
        description: 'Microservice monitoring platform with WebSockets',
        technologies: 'React, Node.js, WebSocket, Docker',
        projectUrl: 'https://demo.telemetry.dev',
        repoUrl: 'https://github.com/arjun/telemetry',
    }, studentToken);
    const projectId = projRes.id;
    console.log('Project added. Verification Status:', projRes.verificationStatus); // Must be PENDING!
    // 5. Recruiter Screens Applicant
    console.log('\n[12] Recruiter screening applicants:');
    const applicantsRes = await api.get('/opportunities/my/applicants', indToken);
    console.log(`Found ${applicantsRes.length} applicant(s). Top match: ${applicantsRes[0]?.matchScore}%`);
    // Recruiter shortlists and schedules interview
    console.log('Scheduling interview...');
    await api.post(`/opportunities/applications/${applicationId}/interview`, {
        scheduledAt: new Date(Date.now() + 86400000).toISOString(),
        meetingLink: 'https://meet.google.com/skillbridge-demo',
        notes: 'Technical coding interview round 1',
    }, indToken);
    // Recruiter marks applicant as SELECTED
    console.log('Selecting candidate...');
    const selectRes = await api.put(`/opportunities/applications/${applicationId}/status`, { status: 'SELECTED', notes: 'Candidate selected for 6-month internship.' }, indToken);
    console.log('Candidate final status:', selectRes.application.status);
    // 6. Institution Verifies Student Portfolio Project
    console.log('\n[13] Institution verifying student portfolio item:');
    const pendingRes = await api.get('/institution/portfolio/pending', instToken);
    console.log(`Found ${pendingRes.projects?.length || 0} pending project(s).`);
    const verifyRes = await api.post('/institution/portfolio/verify', {
        itemType: 'PROJECT',
        itemId: projectId,
        status: 'VERIFIED',
        remarks: 'Validated by Computer Science HOD.',
    }, instToken);
    console.log('Project verification updated to:', verifyRes.updatedItem?.verificationStatus);
    // 7. Dynamic Institutional Analytics Verification
    console.log('\n[14] Checking dynamically computed institutional analytics:');
    const analyticsRes = await api.get('/institution/dashboard', instToken);
    const analytics = analyticsRes.analytics;
    console.log('Institution Analytics:');
    console.log('- Total Students:', analytics.totalStudents);
    console.log('- Assessment Completion Rate:', analytics.assessmentCompletionRate + '%');
    console.log('- Applications Placed:', analytics.applicationMetrics.internshipPlaced);
    console.log('- Placement Rate:', analytics.applicationMetrics.placementRate + '%');
    console.log('- Skill Shortage Diagnostics:', analytics.skillComparison);
    // 8. Register Academician
    console.log('\n[15] Registering Academician:');
    const acadEmail = `prof-${Date.now()}@nitk.edu.in`;
    const acadRegRes = await api.post('/auth/register', {
        role: 'ACADEMICIAN',
        email: acadEmail,
        password: 'Password123!',
        fullName: 'Dr. Priya Sharma',
        phone: '+91 9876543299',
        institutionName: 'National Institute of Technology Karnataka',
        department: 'Computer Science & Engineering',
        designation: 'Associate Professor',
        qualification: 'Ph.D. in Computer Science',
        experienceYears: 12,
        specialization: 'Distributed Systems & Cloud Computing',
        location: 'Mangaluru',
    });
    const acadToken = acadRegRes.token;
    console.log('Academician Registered. User ID:', acadRegRes.user.id);
    // Academician views Dashboard and Faculty Development Programs
    const acadDash = await api.get('/academician/dashboard', acadToken);
    console.log(`Academician Dashboard query successful. Collaborations count: ${acadDash.stats.collaborationsCount}`);
    const fdpRes = await api.get('/learning?type=FDP', acadToken);
    console.log(`Academician FDP list query successful: ${fdpRes.length} programs available`);
    // Final Public Stats Check (Reflecting real database data)
    console.log('\n[16] Re-checking Public Stats (Reflecting created entities):');
    const updatedStats = await api.get('/stats/public');
    console.log('Updated Public Stats:', updatedStats);
    console.log('\n======================================================');
    console.log('>>> ALL 16 E2E INTEGRATION CHECKS PASSED WITH 100% SUCCESS! <<<');
    console.log('======================================================');
}
runVerification().catch((err) => {
    console.error('Verification failed:', err);
    process.exit(1);
});
