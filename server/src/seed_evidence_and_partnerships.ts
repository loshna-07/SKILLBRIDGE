import prisma from './config/db';

export async function seedEvidenceAndPartnerships() {
  console.log('🔗 SEEDING INSTITUTIONAL HIERARCHY, PARTNERSHIPS & 5-TIER SKILL EVIDENCE...');

  // 1. Fetch all institutions
  const institutions = await prisma.institutionProfile.findMany({
    include: { user: true },
  });
  const instMap = new Map<string, string>(); // institutionName -> profileId
  institutions.forEach((inst) => {
    instMap.set(inst.institutionName, inst.id);
  });

  // 2. Fetch all industry partners
  const industries = await prisma.industryProfile.findMany({
    include: { user: true },
  });
  const indMap = new Map<string, string>(); // companyName -> profileId
  industries.forEach((ind) => {
    indMap.set(ind.companyName, ind.id);
  });

  // 3. Fetch all skills
  const skills = await prisma.skill.findMany();
  const skillMap = new Map<string, string>(); // skillName -> skillId
  skills.forEach((s) => {
    skillMap.set(s.name, s.id);
  });

  // 4. Update Academicians with institutionId
  const academicians = await prisma.academicianProfile.findMany();
  for (const acad of academicians) {
    let instId = instMap.get(acad.institutionName);
    if (!instId) {
      // Fuzzy match
      for (const [name, id] of instMap.entries()) {
        if (acad.institutionName.toLowerCase().includes(name.toLowerCase()) || name.toLowerCase().includes(acad.institutionName.toLowerCase())) {
          instId = id;
          break;
        }
      }
    }
    if (instId) {
      await prisma.academicianProfile.update({
        where: { id: acad.id },
        data: {
          institutionId: instId,
          accountStatus: 'APPROVED',
          isVerified: true,
        },
      });
    }
  }

  // 5. Update Students with institutionId
  const students = await prisma.studentProfile.findMany({
    include: {
      skillProfiles: true,
      certificates: true,
      assessmentAttempts: true,
      user: true,
    },
  });

  for (const stu of students) {
    let instId = instMap.get(stu.institutionName);
    if (!instId) {
      for (const [name, id] of instMap.entries()) {
        if (stu.institutionName.toLowerCase().includes(name.toLowerCase()) || name.toLowerCase().includes(stu.institutionName.toLowerCase())) {
          instId = id;
          break;
        }
      }
    }
    if (instId) {
      await prisma.studentProfile.update({
        where: { id: stu.id },
        data: {
          institutionId: instId,
          accountStatus: 'APPROVED',
          isVerified: true,
        },
      });
    }
  }

  // 6. Seed Industry-Institution Partnerships
  console.log('🤝 Seeding Official Industry-Institution Partnerships...');
  const partnershipsData = [
    {
      company: 'Dhanvantari Wellness Pvt Ltd',
      institution: 'Sri Dhanvantari Ayurveda College',
      status: 'APPROVED',
      partnershipType: 'ACADEMIC_INDUSTRY_MOU',
      proposalNote: 'Comprehensive 3-year clinical Panchakarma training, internship pipeline, and resident physician recruitment MoU.',
    },
    {
      company: 'Kerala Herbal Sciences',
      institution: 'Kerala Ayurveda Research Institute',
      status: 'APPROVED',
      partnershipType: 'R_AND_D_COLLAB',
      proposalNote: 'Joint phytochemical standardization lab, postgraduate thesis co-supervision, and herbal drug testing agreement.',
    },
    {
      company: 'Ayurveda Life Sciences',
      institution: 'South Indian Institute of Ayurveda',
      status: 'APPROVED',
      partnershipType: 'CLINICAL_RESEARCH',
      proposalNote: 'Integrative GCP-compliant clinical trial collaboration and biostatistical fellowship program.',
    },
    {
      company: 'TechNova Solutions',
      institution: 'SSN Engineering College',
      status: 'APPROVED',
      partnershipType: 'PLACEMENT_PARTNER',
      proposalNote: 'Annual campus tech recruitment, hackathon sponsorship, and cloud computing curriculum advisory MoU.',
    },
    {
      company: 'Embedded Systems Labs',
      institution: 'SSN Engineering College',
      status: 'APPROVED',
      partnershipType: 'INTERNSHIP_MOU',
      proposalNote: 'Embedded firmware and IoT rapid prototyping summer internship pipeline agreement.',
    },
    {
      company: 'FinEdge Consulting',
      institution: 'South India Commerce Institute',
      status: 'APPROVED',
      partnershipType: 'PLACEMENT_PARTNER',
      proposalNote: 'Corporate financial analytics, valuation modeling internship and placement partnership.',
    },
    {
      company: 'Prana Ayurveda Wellness',
      institution: 'Sri Dhanvantari Ayurveda College',
      status: 'PENDING',
      partnershipType: 'CLINICAL_TRAINING',
      proposalNote: 'Proposed wellness consultant residency and lifestyle medicine practicum awaiting dean approval.',
    },
  ];

  for (const p of partnershipsData) {
    const indId = indMap.get(p.company);
    const instId = instMap.get(p.institution);
    if (indId && instId) {
      await prisma.industryInstitutionPartnership.upsert({
        where: {
          industryId_institutionId: {
            industryId: indId,
            institutionId: instId,
          },
        },
        update: {
          status: p.status,
          partnershipType: p.partnershipType,
          proposalNote: p.proposalNote,
          respondedAt: p.status === 'APPROVED' ? new Date() : null,
        },
        create: {
          industryId: indId,
          institutionId: instId,
          status: p.status,
          partnershipType: p.partnershipType,
          proposalNote: p.proposalNote,
          requestedAt: new Date(Date.now() - 86400000 * 30),
          respondedAt: p.status === 'APPROVED' ? new Date(Date.now() - 86400000 * 15) : null,
        },
      });
    }
  }

  // 7. Seed 5-Tier Skill Evidence for Students
  console.log('🏅 Seeding 5-Tier Skill Evidence records...');
  
  // Clear existing evidence
  await prisma.skillEvidence.deleteMany({});

  for (const stu of students) {
    const sdacInstId = instMap.get('Sri Dhanvantari Ayurveda College') || institutions[0]?.id;
    const dhanvantariIndId = indMap.get('Dhanvantari Wellness Pvt Ltd') || industries[0]?.id;

    // Check if Ananya
    if (stu.fullName.includes('Ananya') || stu.user?.email.includes('ananya')) {
      console.log(`  -> Seeding full 5-tier evidence matrix for ${stu.fullName}...`);

      const panchaSkillId = skillMap.get('Panchakarma');
      const abhyangaSkillId = skillMap.get('Abhyanga');
      const ayuFundSkillId = skillMap.get('Ayurvedic Fundamentals');
      const ayuDiagSkillId = skillMap.get('Ayurvedic Diagnosis');
      const nadiSkillId = skillMap.get('Nadi Pariksha');
      const dravyaSkillId = skillMap.get('Dravyaguna');
      const swedanaSkillId = skillMap.get('Swedana');

      // 1. CREDENTIAL_VERIFIED (Panchakarma)
      if (panchaSkillId) {
        await prisma.skillEvidence.create({
          data: {
            studentId: stu.id,
            skillId: panchaSkillId,
            evidenceType: 'CREDENTIAL_VERIFIED',
            status: 'VERIFIED',
            score: 92,
            sourceName: 'Certificate in Panchakarma Fundamentals',
            issuer: 'National Academy of Panchakarma',
            credentialId: 'AYU-DEMO-001',
            documentUrl: 'https://documents.ayurveda.demo/panchakarma-cert-ananya.pdf',
            verifiedById: sdacInstId,
            verifiedAt: new Date(Date.now() - 86400000 * 45),
            remarks: 'Verified by HOD Dr. Ananya Krishnan after clinical logbook review.',
            evidenceDate: new Date(Date.now() - 86400000 * 45),
          },
        });
      }

      // 2. INDUSTRY_VALIDATED (Abhyanga)
      if (abhyangaSkillId) {
        await prisma.skillEvidence.create({
          data: {
            studentId: stu.id,
            skillId: abhyangaSkillId,
            evidenceType: 'INDUSTRY_VALIDATED',
            status: 'VALIDATED',
            score: 87,
            sourceName: 'Dhanvantari Wellness Practical Assessment',
            issuer: 'Dhanvantari Wellness Pvt Ltd',
            sourceId: dhanvantariIndId,
            documentUrl: 'https://documents.ayurveda.demo/dhanvantari-assessment-report.pdf',
            remarks: 'Demonstrated superior Marma alignment and synchronized Abhyanga strokes during clinical opportunity assessment.',
            evidenceDate: new Date(Date.now() - 86400000 * 10),
          },
        });
      }

      // 3. SKILL_ASSESSED (Ayurvedic Fundamentals & Ayurvedic Diagnosis)
      if (ayuFundSkillId) {
        await prisma.skillEvidence.create({
          data: {
            studentId: stu.id,
            skillId: ayuFundSkillId,
            evidenceType: 'SKILL_ASSESSED',
            status: 'COMPLETED',
            score: 94,
            sourceName: 'SkillBridge Foundation Assessment',
            issuer: 'SkillBridge Assessment Engine',
            remarks: 'Scored 94% on standardized Tridosha & Dhatu Siddhanta question bank.',
            evidenceDate: new Date(Date.now() - 86400000 * 20),
          },
        });
      }

      if (ayuDiagSkillId) {
        await prisma.skillEvidence.create({
          data: {
            studentId: stu.id,
            skillId: ayuDiagSkillId,
            evidenceType: 'SKILL_ASSESSED',
            status: 'COMPLETED',
            score: 85,
            sourceName: 'Clinical Diagnosis Assessment',
            issuer: 'SkillBridge Assessment Engine',
            remarks: 'Scored 85% on Ashtavidha Pariksha differential diagnostic case simulations.',
            evidenceDate: new Date(Date.now() - 86400000 * 15),
          },
        });
      }

      // 4. EVIDENCE_PROVIDED (Nadi Pariksha)
      if (nadiSkillId) {
        await prisma.skillEvidence.create({
          data: {
            studentId: stu.id,
            skillId: nadiSkillId,
            evidenceType: 'EVIDENCE_PROVIDED',
            status: 'PENDING',
            score: 82,
            sourceName: 'Certificate in Nadi Pariksha & Pulse Diagnostics',
            issuer: 'Ayush Clinical Diagnostics Board',
            credentialId: 'AYU-DEMO-009',
            documentUrl: 'https://documents.ayurveda.demo/nadi-pariksha-cert.pdf',
            remarks: 'Uploaded marksheet and course completion certificate. Awaiting institutional academician verification.',
            evidenceDate: new Date(Date.now() - 86400000 * 5),
          },
        });
      }

      // 5. SELF_DECLARED (Dravyaguna)
      if (dravyaSkillId) {
        await prisma.skillEvidence.create({
          data: {
            studentId: stu.id,
            skillId: dravyaSkillId,
            evidenceType: 'SELF_DECLARED',
            status: 'PENDING',
            sourceName: 'Student Self-Declaration',
            remarks: 'Self-declared during profile onboarding based on coursework completion.',
            evidenceDate: new Date(Date.now() - 86400000 * 60),
          },
        });
      }

      // Swedana (CREDENTIAL_VERIFIED)
      if (swedanaSkillId) {
        await prisma.skillEvidence.create({
          data: {
            studentId: stu.id,
            skillId: swedanaSkillId,
            evidenceType: 'CREDENTIAL_VERIFIED',
            status: 'VERIFIED',
            score: 88,
            sourceName: 'Certificate in Panchakarma Fundamentals',
            issuer: 'National Academy of Panchakarma',
            credentialId: 'AYU-DEMO-001',
            verifiedById: sdacInstId,
            verifiedAt: new Date(Date.now() - 86400000 * 45),
            remarks: 'Verified practical competency in Bashpa and Patra Pinda Sweda.',
            evidenceDate: new Date(Date.now() - 86400000 * 45),
          },
        });
      }
    } else {
      // For all other students, seed evidence for their existing declared skills
      for (const sp of stu.skillProfiles) {
        const skill = skills.find((s) => s.id === sp.skillId);
        if (!skill) continue;

        let evType = 'SELF_DECLARED';
        let status = 'PENDING';
        let score = sp.scorePercentage || 75;
        let issuer = 'Self-Declared';
        let sourceName = 'Student Profile';

        if (sp.verified) {
          evType = 'CREDENTIAL_VERIFIED';
          status = 'VERIFIED';
          issuer = stu.institutionName || 'Academic Institution';
          sourceName = `${skill.name} Academic Evaluation`;
        } else if (sp.scorePercentage > 85) {
          evType = 'SKILL_ASSESSED';
          status = 'COMPLETED';
          issuer = 'SkillBridge Assessment Engine';
          sourceName = `${skill.name} Standardized Assessment`;
        }

        await prisma.skillEvidence.create({
          data: {
            studentId: stu.id,
            skillId: sp.skillId,
            evidenceType: evType,
            status,
            score,
            sourceName,
            issuer,
            remarks: `Evidence entry for ${skill.name}`,
            evidenceDate: new Date(Date.now() - 86400000 * Math.floor(Math.random() * 30 + 5)),
          },
        });
      }
    }
  }

  console.log('✅ Institutional Hierarchy, Partnerships & 5-Tier Evidence Seeded Successfully!');
}

if (require.main === module) {
  seedEvidenceAndPartnerships()
    .then(async () => {
      await prisma.$disconnect();
      process.exit(0);
    })
    .catch(async (err) => {
      console.error('❌ Error during evidence seeding:', err);
      await prisma.$disconnect();
      process.exit(1);
    });
}

export default seedEvidenceAndPartnerships;
