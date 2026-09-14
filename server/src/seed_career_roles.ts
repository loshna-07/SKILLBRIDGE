import prisma from './config/db';

export async function seedCareerRolesAndDependencies() {
  console.log('🌱 Seeding Career Roles, Role Skills, and Prerequisite Dependencies...');

  // 1. Fetch all subskills to build name-to-id mapping
  const allSubSkills = await prisma.skillSubSkill.findMany({
    include: { skill: true },
  });

  const subSkillMap = new Map<string, string>();
  allSubSkills.forEach((s) => {
    subSkillMap.set(s.name, s.id);
    subSkillMap.set(`${s.skill.name}::${s.name}`, s.id);
  });

  // 2. Define Career Roles & their granular competency benchmarks
  const careerRolesData = [
    {
      name: 'Embedded Systems Engineer',
      domain: 'ENGINEERING',
      description: 'Designs, develops, and tests low-level firmware, microcontroller peripherals, and hardware-software embedded systems.',
      targetReadiness: 80.0,
      skills: [
        { name: 'Core Syntax & Logic', isRequired: true, minScore: 70.0, weight: 1.0, importanceOrder: 1 },
        { name: 'Pointers & Memory', isRequired: true, minScore: 75.0, weight: 1.5, importanceOrder: 2 },
        { name: 'Data Structures', isRequired: true, minScore: 75.0, weight: 1.2, importanceOrder: 3 },
        { name: 'Register Configuration', isRequired: true, minScore: 80.0, weight: 1.8, importanceOrder: 4 },
        { name: 'Peripherals & Timers', isRequired: true, minScore: 80.0, weight: 1.8, importanceOrder: 5 },
        { name: 'Interrupts & Watchdog', isRequired: true, minScore: 75.0, weight: 1.4, importanceOrder: 6 },
        { name: 'IoT Protocols', isRequired: false, minScore: 70.0, weight: 0.8, importanceOrder: 7 },
        { name: 'Edge Telemetry', isRequired: false, minScore: 70.0, weight: 0.8, importanceOrder: 8 },
      ],
    },
    {
      name: 'Full Stack Developer',
      domain: 'ENGINEERING',
      description: 'Builds end-to-end web applications with modern frontend reactive architectures, backend RESTful microservices, and databases.',
      targetReadiness: 80.0,
      skills: [
        { name: 'Components & Hooks', isRequired: true, minScore: 80.0, weight: 1.5, importanceOrder: 1 },
        { name: 'Architecture & State', isRequired: true, minScore: 75.0, weight: 1.3, importanceOrder: 2 },
        { name: 'Runtime & Asynchrony', isRequired: true, minScore: 80.0, weight: 1.5, importanceOrder: 3 },
        { name: 'REST APIs & Security', isRequired: true, minScore: 80.0, weight: 1.5, importanceOrder: 4 },
        { name: 'IoT Protocols', isRequired: false, minScore: 65.0, weight: 0.7, importanceOrder: 5 },
      ],
    },
    {
      name: 'IoT Engineer',
      domain: 'ENGINEERING',
      description: 'Specializes in smart edge telemetry, sensor network integration, communication protocols (MQTT/CoAP), and cloud IoT ingestion.',
      targetReadiness: 80.0,
      skills: [
        { name: 'IoT Protocols', isRequired: true, minScore: 85.0, weight: 1.8, importanceOrder: 1 },
        { name: 'Edge Telemetry', isRequired: true, minScore: 80.0, weight: 1.6, importanceOrder: 2 },
        { name: 'Register Configuration', isRequired: true, minScore: 75.0, weight: 1.2, importanceOrder: 3 },
        { name: 'Peripherals & Timers', isRequired: true, minScore: 75.0, weight: 1.2, importanceOrder: 4 },
        { name: 'Runtime & Asynchrony', isRequired: false, minScore: 70.0, weight: 0.8, importanceOrder: 5 },
      ],
    },
    {
      name: 'Ayurvedic Clinical Researcher',
      domain: 'AYURVEDA',
      description: 'Coordinates and executes evidence-based clinical trials, AYUSH GCP ethical compliance, data integrity, and peer-reviewed scientific publications.',
      targetReadiness: 80.0,
      skills: [
        { name: 'Research Methodology', isRequired: true, minScore: 80.0, weight: 1.6, importanceOrder: 1 },
        { name: 'AYUSH GCP & Ethics', isRequired: true, minScore: 85.0, weight: 1.8, importanceOrder: 2 },
        { name: 'Data Collection', isRequired: true, minScore: 75.0, weight: 1.2, importanceOrder: 3 },
        { name: 'Descriptive & Inferential Stats', isRequired: true, minScore: 75.0, weight: 1.2, importanceOrder: 4 },
        { name: 'Clinical Trial Analytics', isRequired: true, minScore: 80.0, weight: 1.4, importanceOrder: 5 },
        { name: 'Case Reporting & CARE Guidelines', isRequired: true, minScore: 75.0, weight: 1.0, importanceOrder: 6 },
        { name: 'Manuscript Drafting', isRequired: true, minScore: 75.0, weight: 1.2, importanceOrder: 7 },
        { name: 'EHR & Health Informatics', isRequired: false, minScore: 70.0, weight: 0.8, importanceOrder: 8 },
      ],
    },
    {
      name: 'Panchakarma Specialist',
      domain: 'AYURVEDA',
      description: 'Master practitioner of classical Ayurvedic shodhana detoxification therapies, Purvakarma preparation, and Nadi Pariksha diagnosis.',
      targetReadiness: 80.0,
      skills: [
        { name: 'Purvakarma Protocols', isRequired: true, minScore: 85.0, weight: 1.6, importanceOrder: 1 },
        { name: 'Procedure Knowledge', isRequired: true, minScore: 85.0, weight: 1.8, importanceOrder: 2 },
        { name: 'Safety Protocols', isRequired: true, minScore: 80.0, weight: 1.4, importanceOrder: 3 },
        { name: 'Nadi Pariksha', isRequired: true, minScore: 80.0, weight: 1.3, importanceOrder: 4 },
        { name: 'Tridosha Theory', isRequired: true, minScore: 80.0, weight: 1.0, importanceOrder: 5 },
      ],
    },
    {
      name: 'Ayurvedic Wellness Consultant',
      domain: 'AYURVEDA',
      description: 'Guides personalized holistic wellness, Dinacharya seasonal routines, Prakriti dietary planning, and preventative lifestyle therapies.',
      targetReadiness: 80.0,
      skills: [
        { name: 'Tridosha Theory', isRequired: true, minScore: 85.0, weight: 1.6, importanceOrder: 1 },
        { name: 'Dhatu Siddhanta', isRequired: true, minScore: 80.0, weight: 1.3, importanceOrder: 2 },
        { name: 'Ashtavidha Pariksha', isRequired: true, minScore: 75.0, weight: 1.2, importanceOrder: 3 },
        { name: 'Rasa Panchaka', isRequired: true, minScore: 75.0, weight: 1.1, importanceOrder: 4 },
        { name: 'EHR & Health Informatics', isRequired: false, minScore: 70.0, weight: 0.8, importanceOrder: 5 },
      ],
    },
    {
      name: 'Financial Analyst',
      domain: 'COMMERCE',
      description: 'Conducts quantitative financial modeling, discounted cash flow (DCF) corporate valuation, statement reconciliations, and investment analysis.',
      targetReadiness: 80.0,
      skills: [
        { name: 'Ratio Analysis', isRequired: true, minScore: 85.0, weight: 1.6, importanceOrder: 1 },
        { name: 'Corporate Valuation', isRequired: true, minScore: 85.0, weight: 1.8, importanceOrder: 2 },
        { name: 'Financial Statements', isRequired: true, minScore: 80.0, weight: 1.4, importanceOrder: 3 },
        { name: 'Double Entry & Ledger', isRequired: true, minScore: 75.0, weight: 1.0, importanceOrder: 4 },
      ],
    },
    {
      name: 'Digital Marketing Executive',
      domain: 'COMMERCE',
      description: 'Leads growth marketing, technical SEO audits, multi-channel paid ad campaigns (Meta/Google), and conversion funnel optimization.',
      targetReadiness: 80.0,
      skills: [
        { name: 'SEO & Performance', isRequired: true, minScore: 85.0, weight: 1.6, importanceOrder: 1 },
        { name: 'Paid Campaigns & Analytics', isRequired: true, minScore: 85.0, weight: 1.8, importanceOrder: 2 },
        { name: 'Ratio Analysis', isRequired: false, minScore: 70.0, weight: 0.8, importanceOrder: 3 },
      ],
    },
  ];

  const createdRolesMap = new Map<string, string>();

  for (const roleDef of careerRolesData) {
    const role = await prisma.careerRole.upsert({
      where: { name: roleDef.name },
      update: {
        domain: roleDef.domain,
        description: roleDef.description,
        targetReadiness: roleDef.targetReadiness,
      },
      create: {
        name: roleDef.name,
        domain: roleDef.domain,
        description: roleDef.description,
        targetReadiness: roleDef.targetReadiness,
      },
    });

    createdRolesMap.set(role.name, role.id);

    // Upsert CareerRoleSkill benchmarks
    for (const skillDef of roleDef.skills) {
      const subSkillId = subSkillMap.get(skillDef.name);
      if (!subSkillId) {
        console.warn(`⚠️ Subskill "${skillDef.name}" not found in map, skipping for role ${role.name}`);
        continue;
      }

      await prisma.careerRoleSkill.upsert({
        where: {
          careerRoleId_subSkillId: {
            careerRoleId: role.id,
            subSkillId,
          },
        },
        update: {
          isRequired: skillDef.isRequired,
          minScore: skillDef.minScore,
          weight: skillDef.weight,
          importanceOrder: skillDef.importanceOrder,
        },
        create: {
          careerRoleId: role.id,
          subSkillId,
          isRequired: skillDef.isRequired,
          minScore: skillDef.minScore,
          weight: skillDef.weight,
          importanceOrder: skillDef.importanceOrder,
        },
      });
    }
  }

  // 3. Seed Skill Dependencies (Prerequisite Chains)
  const dependencyData = [
    // C Programming & Embedded C
    { subSkill: 'Pointers & Memory', prereq: 'Core Syntax & Logic', minScore: 60.0 },
    { subSkill: 'Data Structures', prereq: 'Pointers & Memory', minScore: 65.0 },
    { subSkill: 'Register Configuration', prereq: 'Pointers & Memory', minScore: 65.0 },
    { subSkill: 'Peripherals & Timers', prereq: 'Register Configuration', minScore: 65.0 },
    { subSkill: 'Interrupts & Watchdog', prereq: 'Register Configuration', minScore: 65.0 },

    // IoT
    { subSkill: 'Edge Telemetry', prereq: 'IoT Protocols', minScore: 60.0 },

    // Web / React / Node
    { subSkill: 'Architecture & State', prereq: 'Components & Hooks', minScore: 65.0 },
    { subSkill: 'REST APIs & Security', prereq: 'Runtime & Asynchrony', minScore: 65.0 },

    // Ayurveda Clinical Research
    { subSkill: 'Clinical Trial Analytics', prereq: 'Descriptive & Inferential Stats', minScore: 60.0 },
    { subSkill: 'AYUSH GCP & Ethics', prereq: 'Research Methodology', minScore: 60.0 },
    { subSkill: 'Manuscript Drafting', prereq: 'Case Reporting & CARE Guidelines', minScore: 60.0 },

    // Ayurveda Panchakarma & Clinical Diagnosis
    { subSkill: 'Procedure Knowledge', prereq: 'Purvakarma Protocols', minScore: 65.0 },
    { subSkill: 'Ashtavidha Pariksha', prereq: 'Tridosha Theory', minScore: 60.0 },
    { subSkill: 'Nadi Pariksha', prereq: 'Tridosha Theory', minScore: 60.0 },

    // Commerce
    { subSkill: 'Corporate Valuation', prereq: 'Ratio Analysis', minScore: 65.0 },
    { subSkill: 'Paid Campaigns & Analytics', prereq: 'SEO & Performance', minScore: 60.0 },
  ];

  for (const dep of dependencyData) {
    const subSkillId = subSkillMap.get(dep.subSkill);
    const prereqId = subSkillMap.get(dep.prereq);

    if (!subSkillId || !prereqId) {
      console.warn(`⚠️ Could not map dependency: ${dep.subSkill} -> ${dep.prereq}`);
      continue;
    }

    await prisma.skillDependency.upsert({
      where: {
        subSkillId_prerequisiteSubSkillId: {
          subSkillId,
          prerequisiteSubSkillId: prereqId,
        },
      },
      update: {
        minPrerequisiteScore: dep.minScore,
      },
      create: {
        subSkillId,
        prerequisiteSubSkillId: prereqId,
        minPrerequisiteScore: dep.minScore,
      },
    });
  }

  // 4. Update student profiles with matching target roles
  const studentTargetMappings = [
    { email: 'priya.engineering@demo.platform.com', roleName: 'Embedded Systems Engineer' },
    { email: 'rahul.engineering@demo.platform.com', roleName: 'Full Stack Developer' },
    { email: 'arjun.student2@demo.platform.com', roleName: 'Ayurvedic Clinical Researcher' },
    { email: 'ananya.student@demo.platform.com', roleName: 'Panchakarma Specialist' },
    { email: 'kavya.student@demo.platform.com', roleName: 'Ayurvedic Wellness Consultant' },
    { email: 'sneha.commerce@demo.platform.com', roleName: 'Financial Analyst' },
    { email: 'aditya.commerce@demo.platform.com', roleName: 'Digital Marketing Executive' },
  ];

  for (const st of studentTargetMappings) {
    const roleId = createdRolesMap.get(st.roleName);
    if (!roleId) continue;

    const user = await prisma.user.findUnique({
      where: { email: st.email },
      include: { studentProfile: true },
    });

    if (user?.studentProfile) {
      await prisma.studentProfile.update({
        where: { id: user.studentProfile.id },
        data: {
          targetRoleId: roleId,
          targetCareer: st.roleName,
        },
      });
    }
  }

  console.log('✅ Career Roles, Role Skills, Dependencies & Student Targets seeded successfully!');
}

if (require.main === module) {
  seedCareerRolesAndDependencies()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
