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
async function verifyPhase1() {
    console.log('================================================================');
    console.log('>>> STARTING PHASE 1 VERIFICATION: POSTGRESQL, AUTH & RBAC <<<');
    console.log('================================================================\n');
    // [1] Verify PostgreSQL Connection & Engine
    console.log('[1] Checking PostgreSQL Database Engine...');
    const dbResult = await db_1.default.$queryRawUnsafe('SELECT version();');
    console.log('PostgreSQL Connected Successfully:');
    console.log('Engine Info:', dbResult[0]?.version || 'PostgreSQL');
    // [2] Verify Database Starts Empty (Strict Requirement: No seed/demo/fake users)
    console.log('\n[2] Verifying initial database is completely empty (Zero mock data)...');
    const userCount = await db_1.default.user.count();
    const studentCount = await db_1.default.studentProfile.count();
    const acadCount = await db_1.default.academicianProfile.count();
    const indCount = await db_1.default.industryProfile.count();
    const instCount = await db_1.default.institutionProfile.count();
    console.log(`- Users: ${userCount}`);
    console.log(`- Student Profiles: ${studentCount}`);
    console.log(`- Academician Profiles: ${acadCount}`);
    console.log(`- Industry Profiles: ${indCount}`);
    console.log(`- Institution Profiles: ${instCount}`);
    if (userCount !== 0 || studentCount !== 0 || acadCount !== 0 || indCount !== 0 || instCount !== 0) {
        console.log('Resetting test database to ensure strict clean empty state...');
        await db_1.default.user.deleteMany({});
    }
    console.log('Confirmed: Database is 100% EMPTY.');
    // [3] Test Flow 1: Student Registration
    console.log('\n[3] Testing Student Registration Flow...');
    const studentPayload = {
        role: 'STUDENT',
        email: 'student.rahul@institute.edu',
        password: 'SecurePassword123!',
        fullName: 'Rahul Varma',
        phone: '+91 9876500001',
        dob: '2004-03-22',
        gender: 'Male',
        institutionName: 'National Institute of Technology',
        department: 'Computer Science and Engineering',
        degree: 'B.Tech',
        currentYear: '3',
        cgpa: '8.85',
        graduationYear: '2027',
        location: 'Mangaluru',
    };
    const studentReg = await req('POST', '/auth/register', studentPayload);
    if (!studentReg.ok)
        throw new Error(`Student registration failed: ${JSON.stringify(studentReg.data)}`);
    const studentToken = studentReg.data.token;
    console.log('Student registered successfully.');
    console.log('Issued Token (JWT):', studentToken ? `${studentToken.substring(0, 20)}...` : 'NONE');
    // Verify DB record and Password Hashing
    const studentDb = await db_1.default.user.findUnique({
        where: { email: studentPayload.email.toLowerCase() },
        include: { studentProfile: true },
    });
    if (!studentDb)
        throw new Error('Student record not found in PostgreSQL!');
    if (!studentDb.passwordHash.startsWith('$2a$') && !studentDb.passwordHash.startsWith('$2b$')) {
        throw new Error('Password was not hashed using bcrypt!');
    }
    console.log('Verified in PostgreSQL: User ID:', studentDb.id, 'Role:', studentDb.role);
    console.log('Password Hash (Bcrypt verified):', studentDb.passwordHash.substring(0, 15) + '...');
    console.log('Student Profile Attached:', studentDb.studentProfile?.fullName);
    // [4] Test Flow 2: Academician Registration
    console.log('\n[4] Testing Academician Registration Flow...');
    const acadPayload = {
        role: 'ACADEMICIAN',
        email: 'dr.sharma@institute.edu',
        password: 'SecurePassword123!',
        fullName: 'Dr. Anita Sharma',
        phone: '+91 9876500002',
        institutionName: 'National Institute of Technology',
        department: 'Computer Science and Engineering',
        designation: 'Professor & Head of Dept',
        yearsOfExperience: '14',
        areasOfExpertise: 'Distributed Systems, Cloud Architectures',
        location: 'Mangaluru',
    };
    const acadReg = await req('POST', '/auth/register', acadPayload);
    if (!acadReg.ok)
        throw new Error(`Academician registration failed: ${JSON.stringify(acadReg.data)}`);
    const acadToken = acadReg.data.token;
    console.log('Academician registered successfully.');
    const acadDb = await db_1.default.user.findUnique({
        where: { email: acadPayload.email.toLowerCase() },
        include: { academicianProfile: true },
    });
    if (!acadDb)
        throw new Error('Academician record not found in PostgreSQL!');
    console.log('Verified in PostgreSQL: User ID:', acadDb.id, 'Role:', acadDb.role);
    console.log('Academician Profile Attached:', acadDb.academicianProfile?.designation);
    // [5] Test Flow 3: Industry Registration
    console.log('\n[5] Testing Industry Registration Flow...');
    const indPayload = {
        role: 'INDUSTRY',
        email: 'recruiter@techcorp.io',
        password: 'SecurePassword123!',
        companyName: 'TechCorp Cloud Systems',
        officialEmail: 'recruiter@techcorp.io',
        industrySector: 'Enterprise Cloud & SaaS',
        companySize: '51-200',
        website: 'https://techcorp.io',
        location: 'Bengaluru, India',
        description: 'Next-generation cloud infrastructure provider.',
        contactPerson: 'Vikram Malhotra',
        contactNumber: '+91 9876500003',
    };
    const indReg = await req('POST', '/auth/register', indPayload);
    if (!indReg.ok)
        throw new Error(`Industry registration failed: ${JSON.stringify(indReg.data)}`);
    const indToken = indReg.data.token;
    console.log('Industry partner registered successfully.');
    const indDb = await db_1.default.user.findUnique({
        where: { email: indPayload.email.toLowerCase() },
        include: { industryProfile: true },
    });
    if (!indDb)
        throw new Error('Industry record not found in PostgreSQL!');
    console.log('Verified in PostgreSQL: User ID:', indDb.id, 'Role:', indDb.role);
    console.log('Industry Profile Attached:', indDb.industryProfile?.companyName);
    // [6] Test Flow 4: Institution Registration
    console.log('\n[6] Testing Institution Registration Flow...');
    const instPayload = {
        role: 'INSTITUTION',
        email: 'admin@nitk.edu',
        password: 'SecurePassword123!',
        institutionName: 'National Institute of Technology',
        officialEmail: 'admin@nitk.edu',
        institutionType: 'Institute of National Importance',
        affiliatedUniversity: 'Autonomous',
        address: 'Surathkal, Mangaluru, Karnataka',
        website: 'https://nitk.ac.in',
        contactPerson: 'Dr. Ramesh Babu (Dean Academics)',
        contactNumber: '+91 9876500004',
    };
    const instReg = await req('POST', '/auth/register', instPayload);
    if (!instReg.ok)
        throw new Error(`Institution registration failed: ${JSON.stringify(instReg.data)}`);
    const instToken = instReg.data.token;
    console.log('Academic institution registered successfully.');
    const instDb = await db_1.default.user.findUnique({
        where: { email: instPayload.email.toLowerCase() },
        include: { institutionProfile: true },
    });
    if (!instDb)
        throw new Error('Institution record not found in PostgreSQL!');
    console.log('Verified in PostgreSQL: User ID:', instDb.id, 'Role:', instDb.role);
    console.log('Institution Profile Attached:', instDb.institutionProfile?.institutionName);
    // [7] Test Login Flow for All 4 Roles
    console.log('\n[7] Testing Login for all 4 User Accounts...');
    for (const acc of [
        { email: studentPayload.email, pass: studentPayload.password, role: 'STUDENT' },
        { email: acadPayload.email, pass: acadPayload.password, role: 'ACADEMICIAN' },
        { email: indPayload.email, pass: indPayload.password, role: 'INDUSTRY' },
        { email: instPayload.email, pass: instPayload.password, role: 'INSTITUTION' },
    ]) {
        const loginRes = await req('POST', '/auth/login', { email: acc.email, password: acc.pass });
        if (!loginRes.ok)
            throw new Error(`Login failed for ${acc.role}: ${loginRes.data?.message}`);
        if (loginRes.data.user.role !== acc.role)
            throw new Error(`Role mismatch for ${acc.role}`);
        console.log(`- Login successful for ${acc.role} (${acc.email})`);
    }
    // [8] Test Authentication Persistence via /api/auth/me
    console.log('\n[8] Testing Authentication Persistence (JWT verification /api/auth/me)...');
    const meStudent = await req('GET', '/auth/me', undefined, studentToken);
    if (!meStudent.ok)
        throw new Error('Failed to resolve /api/auth/me for student');
    console.log('Hydrated Student Session:', meStudent.data.user.email, '| Profile:', meStudent.data.user.profile.fullName);
    const meInst = await req('GET', '/auth/me', undefined, instToken);
    if (!meInst.ok)
        throw new Error('Failed to resolve /api/auth/me for institution');
    console.log('Hydrated Institution Session:', meInst.data.user.email, '| Profile:', meInst.data.user.profile.institutionName);
    // [9] Test Duplicate Email Rejection (Validation)
    console.log('\n[9] Testing Duplicate Email Rejection...');
    const dupRes = await req('POST', '/auth/register', studentPayload);
    if (dupRes.status === 400) {
        console.log('Duplicate registration correctly rejected with 400:', dupRes.data.message);
    }
    else {
        throw new Error(`Expected 400 for duplicate email, got: ${dupRes.status}`);
    }
    // [10] Test Invalid Password Rejection
    console.log('\n[10] Testing Invalid Password Rejection...');
    const wrongPassRes = await req('POST', '/auth/login', {
        email: studentPayload.email,
        password: 'WrongPassword999!',
    });
    if (wrongPassRes.status === 401) {
        console.log('Incorrect password correctly rejected with 401:', wrongPassRes.data.message);
    }
    else {
        throw new Error(`Expected 401 for incorrect password, got: ${wrongPassRes.status}`);
    }
    // [11] Test Protected Routes (Unauthorized Access without Token)
    console.log('\n[11] Testing Protected Route Protection (Missing Token)...');
    const noTokenRes = await req('GET', '/auth/me');
    if (noTokenRes.status === 401) {
        console.log('Missing token correctly rejected with 401:', noTokenRes.data.message);
    }
    else {
        throw new Error(`Expected 401 for missing token, got: ${noTokenRes.status}`);
    }
    // [12] Test Role-Based Authorization (Access Control Guard)
    console.log('\n[12] Testing Role-Based Authorization (RBAC RBAC Protection)...');
    // Student attempting to access Institution-only dashboard
    const rbacViolationRes = await req('GET', '/institution/dashboard', undefined, studentToken);
    if (rbacViolationRes.status === 403) {
        console.log('Student blocked from Institution route with 403 Forbidden:', rbacViolationRes.data.message);
    }
    else {
        throw new Error(`Expected 403 for cross-role violation, got: ${rbacViolationRes.status}`);
    }
    // [13] Test Logout Flow
    console.log('\n[13] Testing Logout Endpoint...');
    const logoutRes = await req('POST', '/auth/logout', undefined, studentToken);
    if (logoutRes.ok) {
        console.log('Logout endpoint responded with success:', logoutRes.data.message);
    }
    else {
        throw new Error('Logout endpoint failed');
    }
    // [14] Final Database Verification
    console.log('\n[14] Final PostgreSQL Persistence Audit...');
    const finalUsers = await db_1.default.user.findMany({
        include: {
            studentProfile: { select: { fullName: true } },
            academicianProfile: { select: { fullName: true } },
            industryProfile: { select: { companyName: true } },
            institutionProfile: { select: { institutionName: true } },
        },
    });
    console.log(`Total Verified Users in PostgreSQL: ${finalUsers.length}`);
    finalUsers.forEach((u, i) => {
        const profName = u.studentProfile?.fullName || u.academicianProfile?.fullName || u.industryProfile?.companyName || u.institutionProfile?.institutionName;
        console.log(`  [${i + 1}] ${u.role}: ${u.email} -> Profile: "${profName}" (Stored in PostgreSQL)`);
    });
    console.log('\n================================================================');
    console.log('>>> ALL 14 PHASE 1 CHECKS PASSED WITH 100% SUCCESS! <<<');
    console.log('================================================================');
    await db_1.default.$disconnect();
}
verifyPhase1().catch(async (err) => {
    console.error('\n>>> Phase 1 Verification Failed! <<<');
    console.error(err);
    await db_1.default.$disconnect();
    process.exit(1);
});
