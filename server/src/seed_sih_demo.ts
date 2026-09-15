import bcrypt from 'bcryptjs';
import prisma from './config/db';
import clearDemoData from './clear_demo_data';
import { calculateOpportunityMatch } from './services/matchingEngine';

export async function seedSihDemo() {
  console.log('==================================================================');
  console.log('SEEDING PRODUCTION-READY SIH DEMO ECOSYSTEM FOR SKILLBRIDGE');
  console.log('   - 2 Verified Institutions (Ayurveda + Technology)');
  console.log('   - 10 Students (8 Ayurveda + 2 Non-Ayurveda/Engineering/Commerce)');
  console.log('   - 5 Academicians (4 Ayurveda + 1 General)');
  console.log('   - 5 Industry Partners (4 Ayurveda/AYUSH + 1 General)');
  console.log('   - 5 Verified Industry-Institution Partnerships');
  console.log('   - 1 Flagship Demo Opportunity with 90-95% Calculated Match');
  console.log('   - Complete 5-Tier Skill Evidence Lifecycle for Aarav Sharma');
  console.log('   - Granular Sub-skills, Assessments, Courses, and Roadmaps');
  console.log('==================================================================\n');

  // 1. Clear previous demo records safely
  console.log('0. Clearing existing demo records...');
  await clearDemoData();

  const passwordHash = await bcrypt.hash('Demo@12345', 10);

  // =========================================================================
  // 1. INSTITUTIONS (2)
  // =========================================================================
  console.log('1. Creating Verified Institutions...');

  // Institution 1: Sushruta Institute of Ayurvedic Sciences
  const userInstAyu = await prisma.user.create({
    data: {
      email: 'sushruta.demo@skillbridge.edu',
      passwordHash,
      role: 'INSTITUTION',
    },
  });

  const instAyu = await prisma.institutionProfile.create({
    data: {
      userId: userInstAyu.id,
      institutionName: 'Sushruta Institute of Ayurvedic Sciences',
      officialEmail: 'sushruta.demo@skillbridge.edu',
      institutionType: 'Ayurveda Medical College',
      affiliatedUniversity: 'Tamil Nadu Dr. M.G.R. Medical University',
      address: 'Anna Nagar West, Chennai, Tamil Nadu - 600040',
      website: 'https://sushruta.skillbridge.edu',
      contactPerson: 'Dr. K. S. Sharma, Dean & Director',
      contactNumber: '+91 44 2618 9000',
      verificationStatus: 'VERIFIED',
      isVerified: true,
    },
  });

  // Institution 2: SkillBridge Institute of Technology
  const userInstTech = await prisma.user.create({
    data: {
      email: 'tech.institution.demo@skillbridge.edu',
      passwordHash,
      role: 'INSTITUTION',
    },
  });

  const instTech = await prisma.institutionProfile.create({
    data: {
      userId: userInstTech.id,
      institutionName: 'SkillBridge Institute of Technology',
      officialEmail: 'tech.institution.demo@skillbridge.edu',
      institutionType: 'Engineering & Technology',
      affiliatedUniversity: 'Anna University',
      address: 'OMR IT Corridor, Chennai, Tamil Nadu - 600119',
      website: 'https://sbit.skillbridge.edu',
      contactPerson: 'Dr. R. Natarajan, Principal',
      contactNumber: '+91 44 2450 1100',
      verificationStatus: 'VERIFIED',
      isVerified: true,
    },
  });

  console.log(`   [OK] Created 2 Institutions: ${instAyu.institutionName}, ${instTech.institutionName}`);

  // =========================================================================
  // 2. INDUSTRY PARTNERS (5)
  // =========================================================================
  console.log('2. Creating Industry Partners (4 Ayurveda/AYUSH + 1 General)...');

  // Industry 1: AyurResearch Labs
  const userIndAyurRes = await prisma.user.create({
    data: {
      email: 'ayuresearch.industry.demo@skillbridge.edu',
      passwordHash,
      role: 'INDUSTRY',
    },
  });
  const indAyurRes = await prisma.industryProfile.create({
    data: {
      userId: userIndAyurRes.id,
      companyName: 'AyurResearch Labs',
      officialEmail: 'ayuresearch.industry.demo@skillbridge.edu',
      industrySector: 'Ayurveda Clinical Research',
      companySize: '250-500',
      location: 'Chennai, Tamil Nadu',
      website: 'https://ayuresearchlabs.skillbridge.edu',
      description: 'Premier contract research organization pioneering evidence-based clinical trials, phytomedicinal standardization, and regulatory dossiers for AYUSH formulations.',
      contactPerson: 'Dr. S. Ranganathan, Vice President Research',
      contactNumber: '+91 44 4390 8800',
      verificationStatus: 'VERIFIED',
      isVerified: true,
    },
  });

  // Industry 2: VedaLife Healthcare
  const userIndVedaLife = await prisma.user.create({
    data: {
      email: 'vedalife.industry.demo@skillbridge.edu',
      passwordHash,
      role: 'INDUSTRY',
    },
  });
  const indVedaLife = await prisma.industryProfile.create({
    data: {
      userId: userIndVedaLife.id,
      companyName: 'VedaLife Healthcare',
      officialEmail: 'vedalife.industry.demo@skillbridge.edu',
      industrySector: 'Ayurvedic Healthcare',
      companySize: '500-1000',
      location: 'Bangalore / Chennai',
      website: 'https://vedalife.skillbridge.edu',
      description: 'Nationwide network of multi-specialty Ayurvedic hospitals and wellness retreats offering integrative clinical care and classical Panchakarma therapy.',
      contactPerson: 'Dr. Rajeshwari V., Medical Director',
      contactNumber: '+91 80 2200 4400',
      verificationStatus: 'VERIFIED',
      isVerified: true,
    },
  });

  // Industry 3: HerbMatrix Pharmaceuticals
  const userIndHerbMatrix = await prisma.user.create({
    data: {
      email: 'herbmatrix.industry.demo@skillbridge.edu',
      passwordHash,
      role: 'INDUSTRY',
    },
  });
  const indHerbMatrix = await prisma.industryProfile.create({
    data: {
      userId: userIndHerbMatrix.id,
      companyName: 'HerbMatrix Pharmaceuticals',
      officialEmail: 'herbmatrix.industry.demo@skillbridge.edu',
      industrySector: 'Ayurvedic Pharmaceutical Research',
      companySize: '100-250',
      location: 'Chennai, Tamil Nadu',
      website: 'https://herbmatrix.skillbridge.edu',
      description: 'GMP-certified Ayurvedic formulation manufacturer dedicated to HPTLC botanical fingerprinting, bioactive extraction, and pharmacognostic standardization.',
      contactPerson: 'K. Venkatesh, Head of Quality Operations',
      contactNumber: '+91 44 2822 5500',
      verificationStatus: 'VERIFIED',
      isVerified: true,
    },
  });

  // Industry 4: AyuData Analytics
  const userIndAyuData = await prisma.user.create({
    data: {
      email: 'ayudata.industry.demo@skillbridge.edu',
      passwordHash,
      role: 'INDUSTRY',
    },
  });
  const indAyuData = await prisma.industryProfile.create({
    data: {
      userId: userIndAyuData.id,
      companyName: 'AyuData Analytics',
      officialEmail: 'ayudata.industry.demo@skillbridge.edu',
      industrySector: 'AYUSH Research & Data Analytics',
      companySize: '50-100',
      location: 'Hyderabad / Chennai',
      website: 'https://ayudata.skillbridge.edu',
      description: 'Healthcare analytics firm specializing in real-world clinical trial informatics, epidemiological registries, and biostatistical modeling for traditional medicine.',
      contactPerson: 'P. Sandeep, Chief Data Officer',
      contactNumber: '+91 40 6700 9900',
      verificationStatus: 'VERIFIED',
      isVerified: true,
    },
  });

  // Industry 5: TechNova Analytics (General)
  const userIndTechNova = await prisma.user.create({
    data: {
      email: 'technova.industry.demo@skillbridge.edu',
      passwordHash,
      role: 'INDUSTRY',
    },
  });
  const indTechNova = await prisma.industryProfile.create({
    data: {
      userId: userIndTechNova.id,
      companyName: 'TechNova Analytics',
      officialEmail: 'technova.industry.demo@skillbridge.edu',
      industrySector: 'Software / AI',
      companySize: '1000+',
      location: 'Chennai, Tamil Nadu',
      website: 'https://technova.skillbridge.edu',
      description: 'Enterprise AI and full-stack software solutions provider delivering predictive machine learning models and cloud data infrastructure.',
      contactPerson: 'Anand Sundaram, Talent Acquisition Lead',
      contactNumber: '+91 44 6600 3300',
      verificationStatus: 'VERIFIED',
      isVerified: true,
    },
  });

  console.log('   [OK] Created 5 Industry Profiles (4 AYUSH + 1 General Tech)');

  // =========================================================================
  // 3. INDUSTRY <-> INSTITUTION PARTNERSHIPS
  // =========================================================================
  console.log('3. Establishing Verified Industry-Institution Partnerships...');

  await prisma.industryInstitutionPartnership.createMany({
    data: [
      {
        institutionId: instAyu.id,
        industryId: indAyurRes.id,
        status: 'APPROVED',
        partnershipType: 'CLINICAL_RESEARCH_MOU',
        proposalNote: 'Active bilateral agreement for joint Ayurvedic clinical trials, student internships, and faculty research exchanges.',
        respondedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      },
      {
        institutionId: instAyu.id,
        industryId: indVedaLife.id,
        status: 'APPROVED',
        partnershipType: 'CLINICAL_TRAINING_MOU',
        proposalNote: 'Clinical Panchakarma residency and internship collaboration for final-year BAMS scholars.',
        respondedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      },
      {
        institutionId: instAyu.id,
        industryId: indHerbMatrix.id,
        status: 'APPROVED',
        partnershipType: 'R_AND_D_COLLAB',
        proposalNote: 'MoU for medicinal plant pharmacognosy, quality control analytics, and student lab training.',
        respondedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
      },
      {
        institutionId: instAyu.id,
        industryId: indAyuData.id,
        status: 'APPROVED',
        partnershipType: 'DATA_ANALYTICS_MOU',
        proposalNote: 'Digital health informatics, AYUSH clinical database analytics, and biostatistical workshops.',
        respondedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      },
      {
        institutionId: instTech.id,
        industryId: indTechNova.id,
        status: 'APPROVED',
        partnershipType: 'AI_PLACEMENT_MOU',
        proposalNote: 'Campus recruitment, AI/ML live capstone projects, and technology internships for CSE students.',
        respondedAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000),
      },
    ],
  });

  console.log('   [OK] Established 5 Active Industry-Institution Partnerships');

  // =========================================================================
  // 4. ACADEMICIANS (5)
  // =========================================================================
  console.log('4. Creating Academician Profiles (4 Ayurveda + 1 General)...');

  // Academician 1: Dr. Anjali Menon (Dravyaguna)
  const userAcadAnjali = await prisma.user.create({
    data: {
      email: 'anjali.academician.demo@skillbridge.edu',
      passwordHash,
      role: 'ACADEMICIAN',
    },
  });
  const acadAnjali = await prisma.academicianProfile.create({
    data: {
      userId: userAcadAnjali.id,
      fullName: 'Dr. Anjali Menon',
      phone: '+91 98401 23451',
      institutionId: instAyu.id,
      institutionName: instAyu.institutionName,
      department: 'Dravyaguna',
      designation: 'Professor & Head of Department',
      yearsOfExperience: 16,
      areasOfExpertise: 'Medicinal Plants, Dravyaguna Research, Pharmacognosy, Herbal Standardization',
      location: 'Chennai, Tamil Nadu',
      bio: 'Senior academician with 16+ years in Ayurvedic pharmacognosy, botanical crude drug standardization, and classical Dravyaguna research.',
      accountStatus: 'APPROVED',
      isVerified: true,
    },
  });

  // Academician 2: Dr. Vikram Iyer (Kayachikitsa)
  const userAcadVikram = await prisma.user.create({
    data: {
      email: 'vikram.academician.demo@skillbridge.edu',
      passwordHash,
      role: 'ACADEMICIAN',
    },
  });
  const acadVikram = await prisma.academicianProfile.create({
    data: {
      userId: userAcadVikram.id,
      fullName: 'Dr. Vikram Iyer',
      phone: '+91 98401 23452',
      institutionId: instAyu.id,
      institutionName: instAyu.institutionName,
      department: 'Kayachikitsa',
      designation: 'Associate Professor',
      yearsOfExperience: 12,
      areasOfExpertise: 'Clinical Research, Ayurveda Internal Medicine, Integrative Therapeutics, Evidence-Based Medicine',
      location: 'Chennai, Tamil Nadu',
      bio: 'Clinical physician and investigator specializing in GCP-compliant clinical trials and chronic disease management through classical Ayurveda.',
      accountStatus: 'APPROVED',
      isVerified: true,
    },
  });

  // Academician 3: Dr. Meera Nair (Rasashastra)
  const userAcadMeera = await prisma.user.create({
    data: {
      email: 'meera.academician.demo@skillbridge.edu',
      passwordHash,
      role: 'ACADEMICIAN',
    },
  });
  const acadMeera = await prisma.academicianProfile.create({
    data: {
      userId: userAcadMeera.id,
      fullName: 'Dr. Meera Nair',
      phone: '+91 98401 23453',
      institutionId: instAyu.id,
      institutionName: instAyu.institutionName,
      department: 'Rasashastra & Bhaishajya Kalpana',
      designation: 'Associate Professor',
      yearsOfExperience: 11,
      areasOfExpertise: 'Ayurvedic Pharmaceutics, Bhasma Standardization, GMP Formulation Quality, Nanotechnology in Ayurveda',
      location: 'Chennai, Tamil Nadu',
      bio: 'Expert in classical pharmaceutical dosage manufacturing, organo-metallic Bhasma testing, and GMP regulatory compliance.',
      accountStatus: 'APPROVED',
      isVerified: true,
    },
  });

  // Academician 4: Dr. Arjun Sharma (Swasthavritta)
  const userAcadArjun = await prisma.user.create({
    data: {
      email: 'arjun.academician.demo@skillbridge.edu',
      passwordHash,
      role: 'ACADEMICIAN',
    },
  });
  const acadArjun = await prisma.academicianProfile.create({
    data: {
      userId: userAcadArjun.id,
      fullName: 'Dr. Arjun Sharma',
      phone: '+91 98401 23454',
      institutionId: instAyu.id,
      institutionName: instAyu.institutionName,
      department: 'Swasthavritta',
      designation: 'Assistant Professor',
      yearsOfExperience: 8,
      areasOfExpertise: 'Preventive Healthcare, Public Health, Dinacharya, Ritucharya, Lifestyle Management',
      location: 'Chennai, Tamil Nadu',
      bio: 'Public health researcher focusing on community preventive healthcare, AYUSH epidemiological studies, and lifestyle medicine.',
      accountStatus: 'APPROVED',
      isVerified: true,
    },
  });

  // Academician 5: Dr. Rahul Kapoor (Computer Science / General)
  const userAcadRahul = await prisma.user.create({
    data: {
      email: 'rahul.academician.demo@skillbridge.edu',
      passwordHash,
      role: 'ACADEMICIAN',
    },
  });
  const acadRahul = await prisma.academicianProfile.create({
    data: {
      userId: userAcadRahul.id,
      fullName: 'Dr. Rahul Kapoor',
      phone: '+91 98401 23455',
      institutionId: instTech.id,
      institutionName: instTech.institutionName,
      department: 'Computer Science',
      designation: 'Professor & Head of Research',
      yearsOfExperience: 14,
      areasOfExpertise: 'AI, Data Science, Machine Learning, Predictive Modeling, Cloud Computing',
      location: 'Chennai, Tamil Nadu',
      bio: 'Leading researcher in applied artificial intelligence, predictive data modeling, and automated educational analytics.',
      accountStatus: 'APPROVED',
      isVerified: true,
    },
  });

  console.log('   [OK] Created 5 Academicians (4 Ayurveda + 1 Tech)');

  // =========================================================================
  // 5. SKILL TAXONOMY & SUB-SKILLS
  // =========================================================================
  console.log('5. Seeding Standardized Skill & Sub-Skill Taxonomy...');

  const catAyu = await prisma.skillCategory.upsert({
    where: { name: 'Ayurveda & Healthcare' },
    update: {},
    create: {
      name: 'Ayurveda & Healthcare',
      description: 'Foundational Ayurvedic medicine, Dravyaguna, Panchakarma, Rasashastra, and clinical research methodologies.',
    },
  });

  const catTech = await prisma.skillCategory.upsert({
    where: { name: 'Engineering & Technology' },
    update: {},
    create: {
      name: 'Engineering & Technology',
      description: 'Artificial intelligence, software development, data science, and computing architecture.',
    },
  });

  const catBiz = await prisma.skillCategory.upsert({
    where: { name: 'Commerce & Business' },
    update: {},
    create: {
      name: 'Commerce & Business',
      description: 'Corporate finance, financial analysis, quantitative modeling, and accounting analytics.',
    },
  });

  // Create Core Skills
  const skillDravyaguna = await prisma.skill.upsert({
    where: { name: 'Dravyaguna' },
    update: {},
    create: {
      categoryId: catAyu.id,
      name: 'Dravyaguna',
      description: 'Botanical taxonomy, pharmacognosy, Rasa Panchaka principles, and clinical therapeutic efficacy of Ayurvedic medicinal herbs.',
    },
  });

  const skillClinicalResearch = await prisma.skill.upsert({
    where: { name: 'Clinical Research' },
    update: {},
    create: {
      categoryId: catAyu.id,
      name: 'Clinical Research',
      description: 'GCP compliance, randomized controlled trial design, patient monitoring, and clinical outcome metrics in AYUSH systems.',
    },
  });

  const skillResearchMethodology = await prisma.skill.upsert({
    where: { name: 'Research Methodology' },
    update: {},
    create: {
      categoryId: catAyu.id,
      name: 'Research Methodology',
      description: 'Scientific hypothesis formulation, systematic literature review, sampling design, and quantitative experimental methodologies.',
    },
  });

  const skillDataAnalysis = await prisma.skill.upsert({
    where: { name: 'Data Analysis' },
    update: {},
    create: {
      categoryId: catAyu.id,
      name: 'Data Analysis',
      description: 'Biostatistical modeling, healthcare data cleaning, descriptive statistics, and clinical significance interpretation.',
    },
  });

  const skillClinicalDoc = await prisma.skill.upsert({
    where: { name: 'Clinical Documentation' },
    update: {},
    create: {
      categoryId: catAyu.id,
      name: 'Clinical Documentation',
      description: 'Structured Case Report Form (CRF) preparation, electronic health records compliance, and adverse event reporting.',
    },
  });

  const skillAyuFundamentals = await prisma.skill.upsert({
    where: { name: 'Ayurveda Fundamentals' },
    update: {},
    create: {
      categoryId: catAyu.id,
      name: 'Ayurveda Fundamentals',
      description: 'Tridosha theory, Dhatu & Mala physiology, Srotas diagnostics, and holistic Prakriti assessment.',
    },
  });

  const skillPanchakarma = await prisma.skill.upsert({
    where: { name: 'Panchakarma' },
    update: {},
    create: {
      categoryId: catAyu.id,
      name: 'Panchakarma',
      description: 'Classical bio-purification, Vamana, Virechana, Basti, Nasya, and Samsarjana Krama protocols.',
    },
  });

  const skillRasashastra = await prisma.skill.upsert({
    where: { name: 'Rasashastra' },
    update: {},
    create: {
      categoryId: catAyu.id,
      name: 'Rasashastra',
      description: 'Ayurvedic mineralogy, Shodhana, Marana, and Bhasma nanotechnology standardization.',
    },
  });

  const skillAI = await prisma.skill.upsert({
    where: { name: 'AI & Machine Learning' },
    update: {},
    create: {
      categoryId: catTech.id,
      name: 'AI & Machine Learning',
      description: 'Supervised and unsupervised learning, Python data science stack, neural networks, and model evaluation.',
    },
  });

  const skillFinance = await prisma.skill.upsert({
    where: { name: 'Financial Analysis' },
    update: {},
    create: {
      categoryId: catBiz.id,
      name: 'Financial Analysis',
      description: 'DCF valuation, corporate financial modeling, financial statement ratios, and quantitative investment analytics.',
    },
  });

  // Seed Granular Sub-skills for Dravyaguna
  const subDravyaId = await prisma.skillSubSkill.upsert({
    where: { skillId_name: { skillId: skillDravyaguna.id, name: 'Dravya Identification' } },
    update: {},
    create: {
      skillId: skillDravyaguna.id,
      name: 'Dravya Identification',
      description: 'Macroscopic and botanical morphology of classical medicinal plants.',
      orderIndex: 1,
    },
  });

  const subRasa = await prisma.skillSubSkill.upsert({
    where: { skillId_name: { skillId: skillDravyaguna.id, name: 'Rasa' } },
    update: {},
    create: {
      skillId: skillDravyaguna.id,
      name: 'Rasa',
      description: 'Analysis of six primary tastes and their elemental dosha actions.',
      orderIndex: 2,
    },
  });

  const subGuna = await prisma.skillSubSkill.upsert({
    where: { skillId_name: { skillId: skillDravyaguna.id, name: 'Guna' } },
    update: {},
    create: {
      skillId: skillDravyaguna.id,
      name: 'Guna',
      description: 'Gurvadi 20 physical and pharmacological bio-attributes.',
      orderIndex: 3,
    },
  });

  const subVirya = await prisma.skillSubSkill.upsert({
    where: { skillId_name: { skillId: skillDravyaguna.id, name: 'Virya' } },
    update: {},
    create: {
      skillId: skillDravyaguna.id,
      name: 'Virya',
      description: 'Thermal potency evaluation (Sheeta and Ushna Virya).',
      orderIndex: 4,
    },
  });

  const subVipaka = await prisma.skillSubSkill.upsert({
    where: { skillId_name: { skillId: skillDravyaguna.id, name: 'Vipaka' } },
    update: {},
    create: {
      skillId: skillDravyaguna.id,
      name: 'Vipaka',
      description: 'Post-digestive bio-transformation (Madhura, Amla, Katu).',
      orderIndex: 5,
    },
  });

  const subKarma = await prisma.skillSubSkill.upsert({
    where: { skillId_name: { skillId: skillDravyaguna.id, name: 'Karma' } },
    update: {},
    create: {
      skillId: skillDravyaguna.id,
      name: 'Karma',
      description: 'Therapeutic physiological actions including Deepana, Pachana, and Lekhana.',
      orderIndex: 6,
    },
  });

  const subClinicalUnderstand = await prisma.skillSubSkill.upsert({
    where: { skillId_name: { skillId: skillDravyaguna.id, name: 'Clinical Understanding' } },
    update: {},
    create: {
      skillId: skillDravyaguna.id,
      name: 'Clinical Understanding',
      description: 'Posology, polyherbal synergy, contraindications, and therapeutic index.',
      orderIndex: 7,
    },
  });

  // Subskills for Clinical Research
  const subProtocol = await prisma.skillSubSkill.upsert({
    where: { skillId_name: { skillId: skillClinicalResearch.id, name: 'Protocol Design' } },
    update: {},
    create: {
      skillId: skillClinicalResearch.id,
      name: 'Protocol Design',
      description: 'AYUSH randomized controlled trial structure and endpoint metrics.',
      orderIndex: 1,
    },
  });

  const subGCP = await prisma.skillSubSkill.upsert({
    where: { skillId_name: { skillId: skillClinicalResearch.id, name: 'GCP Guidelines' } },
    update: {},
    create: {
      skillId: skillClinicalResearch.id,
      name: 'GCP Guidelines',
      description: 'Good Clinical Practice, informed consent, and ethical committee protocols.',
      orderIndex: 2,
    },
  });

  // Subskills for Research Methodology
  const subLitReview = await prisma.skillSubSkill.upsert({
    where: { skillId_name: { skillId: skillResearchMethodology.id, name: 'Literature Review' } },
    update: {},
    create: {
      skillId: skillResearchMethodology.id,
      name: 'Literature Review',
      description: 'Systematic database search, PRISMA standards, and evidence synthesis.',
      orderIndex: 1,
    },
  });

  // Subskills for Data Analysis
  const subDescStats = await prisma.skillSubSkill.upsert({
    where: { skillId_name: { skillId: skillDataAnalysis.id, name: 'Descriptive Statistics' } },
    update: {},
    create: {
      skillId: skillDataAnalysis.id,
      name: 'Descriptive Statistics',
      description: 'Biostatistical cohort summaries, p-value calculation, and confidence intervals.',
      orderIndex: 1,
    },
  });

  // Subskills for Clinical Documentation
  const subCaseReport = await prisma.skillSubSkill.upsert({
    where: { skillId_name: { skillId: skillClinicalDoc.id, name: 'Case Reporting' } },
    update: {},
    create: {
      skillId: skillClinicalDoc.id,
      name: 'Case Reporting',
      description: 'CARE guidelines for classical Ayurvedic case series documentation.',
      orderIndex: 1,
    },
  });

  // Subskills for Ayurveda Fundamentals
  const subTridosha = await prisma.skillSubSkill.upsert({
    where: { skillId_name: { skillId: skillAyuFundamentals.id, name: 'Tridosha Theory' } },
    update: {},
    create: {
      skillId: skillAyuFundamentals.id,
      name: 'Tridosha Theory',
      description: 'Vata, Pitta, Kapha bio-energetics in health and pathological states.',
      orderIndex: 1,
    },
  });

  console.log('   [OK] Seeded Granular Skills & Sub-Skills');

  // =========================================================================
  // 6. CAREER ROLES & BENCHMARKS
  // =========================================================================
  console.log('6. Creating Career Roles & Benchmark Requirements...');

  const roleAyuResearcher = await prisma.careerRole.upsert({
    where: { name: 'Ayurvedic Clinical Researcher' },
    update: {},
    create: {
      name: 'Ayurvedic Clinical Researcher',
      domain: 'AYURVEDA',
      description: 'Design, execute, and document GCP-compliant clinical trials and pharmacological validation studies for AYUSH therapeutics.',
      targetReadiness: 80.0,
    },
  });

  await prisma.careerRoleSkill.createMany({
    data: [
      { careerRoleId: roleAyuResearcher.id, subSkillId: subDravyaId.id, isRequired: true, minScore: 75.0, weight: 1.2, importanceOrder: 1 },
      { careerRoleId: roleAyuResearcher.id, subSkillId: subClinicalUnderstand.id, isRequired: true, minScore: 75.0, weight: 1.2, importanceOrder: 2 },
      { careerRoleId: roleAyuResearcher.id, subSkillId: subProtocol.id, isRequired: true, minScore: 70.0, weight: 1.1, importanceOrder: 3 },
      { careerRoleId: roleAyuResearcher.id, subSkillId: subGCP.id, isRequired: true, minScore: 70.0, weight: 1.0, importanceOrder: 4 },
      { careerRoleId: roleAyuResearcher.id, subSkillId: subLitReview.id, isRequired: true, minScore: 70.0, weight: 1.0, importanceOrder: 5 },
      { careerRoleId: roleAyuResearcher.id, subSkillId: subDescStats.id, isRequired: false, minScore: 60.0, weight: 0.8, importanceOrder: 6 },
      { careerRoleId: roleAyuResearcher.id, subSkillId: subCaseReport.id, isRequired: false, minScore: 65.0, weight: 0.8, importanceOrder: 7 },
    ],
    skipDuplicates: true,
  });

  console.log('   [OK] Created Career Role: Ayurvedic Clinical Researcher');

  // =========================================================================
  // 7. PUBLISHED COURSES
  // =========================================================================
  console.log('7. Seeding Published Benchmark Courses...');

  // Course 1: Ayurveda Fundamentals (Completed by Aarav)
  const courseAyuFund = await prisma.course.create({
    data: {
      title: 'Ayurveda Fundamentals & Classical Principles',
      description: 'Comprehensive study of fundamental concepts, Tridosha equilibrium, Dhatu formation, and holistic patient assessment.',
      providerId: userAcadVikram.id,
      providerRole: 'ACADEMICIAN',
      providerName: 'Dr. Vikram Iyer (Sushruta Institute)',
      category: 'Ayurveda & Healthcare',
      skillLevel: 'BEGINNER',
      duration: '6 Weeks (36 Hours)',
      mode: 'HYBRID',
      status: 'PUBLISHED',
      skills: { create: [{ skillId: skillAyuFundamentals.id }] },
      subSkills: { create: [{ subSkillId: subTridosha.id }] },
      modules: {
        create: [
          {
            title: 'Module 1: Tridosha Siddhanta',
            orderIndex: 1,
            lessons: {
              create: [
                { title: 'Vata, Pitta, Kapha Attributes', durationMinutes: 45, orderIndex: 1 },
                { title: 'Pathological Dosha Aggravation', durationMinutes: 50, orderIndex: 2 },
              ],
            },
          },
          {
            title: 'Module 2: Dhatu and Mala Dynamics',
            orderIndex: 2,
            lessons: {
              create: [
                { title: 'Sapta Dhatu Nutrition Cycle', durationMinutes: 60, orderIndex: 1 },
                { title: 'Srotas Cleansing Mechanisms', durationMinutes: 45, orderIndex: 2 },
              ],
            },
          },
        ],
      },
    },
  });

  // Course 2: Dravyaguna Basics & Medicinal Flora (Completed by Aarav)
  const courseDravyaguna = await prisma.course.create({
    data: {
      title: 'Dravyaguna: Herbal Taxonomy & Pharmacognosy',
      description: 'Detailed exploration of classical medicinal plants, organoleptic taxonomy, macroscopic identification, and Rasa Panchaka analysis.',
      providerId: userAcadAnjali.id,
      providerRole: 'ACADEMICIAN',
      providerName: 'Dr. Anjali Menon (Sushruta Institute)',
      category: 'Ayurveda & Healthcare',
      skillLevel: 'INTERMEDIATE',
      duration: '8 Weeks (48 Hours)',
      mode: 'HYBRID',
      status: 'PUBLISHED',
      skills: { create: [{ skillId: skillDravyaguna.id }] },
      subSkills: {
        create: [
          { subSkillId: subDravyaId.id },
          { subSkillId: subRasa.id },
          { subSkillId: subKarma.id },
          { subSkillId: subClinicalUnderstand.id },
        ],
      },
      modules: {
        create: [
          {
            title: 'Module 1: Botanical Identification & Herbarium',
            orderIndex: 1,
            lessons: {
              create: [
                { title: 'Plant Morphology & Field Identification', durationMinutes: 60, orderIndex: 1 },
                { title: 'Standardized Herbarium Preparation', durationMinutes: 45, orderIndex: 2 },
              ],
            },
          },
          {
            title: 'Module 2: Rasa Panchaka Evaluation',
            orderIndex: 2,
            lessons: {
              create: [
                { title: 'Rasa, Guna, Virya, Vipaka Principles', durationMinutes: 50, orderIndex: 1 },
                { title: 'Therapeutic Actions (Karma) & Formulations', durationMinutes: 55, orderIndex: 2 },
              ],
            },
          },
        ],
      },
    },
  });

  // Course 3: Clinical Research Methods in AYUSH (In-Progress for Aarav)
  const courseClinicalResearch = await prisma.course.create({
    data: {
      title: 'Clinical Research Methods & AYUSH Trial Design',
      description: 'Evidence-based trial methodologies, GCP guidelines, ethical clearances, and clinical documentation in traditional medicine.',
      providerId: userIndAyurRes.id,
      providerRole: 'INDUSTRY',
      providerName: 'AyurResearch Labs',
      category: 'Ayurveda & Healthcare',
      skillLevel: 'ADVANCED',
      duration: '6 Weeks (30 Hours)',
      mode: 'ONLINE',
      status: 'PUBLISHED',
      skills: { create: [{ skillId: skillClinicalResearch.id }, { skillId: skillResearchMethodology.id }] },
      subSkills: {
        create: [
          { subSkillId: subProtocol.id },
          { subSkillId: subGCP.id },
          { subSkillId: subLitReview.id },
        ],
      },
      modules: {
        create: [
          {
            title: 'Module 1: AYUSH Trial Protocols',
            orderIndex: 1,
            lessons: {
              create: [
                { title: 'Randomized Controlled Trial Frameworks', durationMinutes: 45, orderIndex: 1 },
                { title: 'Ethics Committee Approvals & CTRI Registration', durationMinutes: 40, orderIndex: 2 },
              ],
            },
          },
          {
            title: 'Module 2: Good Clinical Practice in AYUSH',
            orderIndex: 2,
            lessons: {
              create: [
                { title: 'ICH-GCP Principles for Herbal Formulations', durationMinutes: 50, orderIndex: 1 },
                { title: 'Adverse Drug Reaction Monitoring', durationMinutes: 45, orderIndex: 2 },
              ],
            },
          },
        ],
      },
    },
  });

  // Course 4: Biostatistics & Healthcare Data Analytics (Recommended for Aarav)
  const courseDataAnalysis = await prisma.course.create({
    data: {
      title: 'Biostatistics & Data Analysis for Clinical Trials',
      description: 'Statistical methods, sample sizing, cohort analysis, and clinical data interpretation using modern analytical tools.',
      providerId: userIndAyuData.id,
      providerRole: 'INDUSTRY',
      providerName: 'AyuData Analytics',
      category: 'Ayurveda & Healthcare',
      skillLevel: 'INTERMEDIATE',
      duration: '4 Weeks (20 Hours)',
      mode: 'ONLINE',
      status: 'PUBLISHED',
      skills: { create: [{ skillId: skillDataAnalysis.id }] },
      subSkills: { create: [{ subSkillId: subDescStats.id }] },
    },
  });

  // Course 5: Clinical Documentation & Case Record Standards (Recommended for Aarav)
  const courseClinicalDoc = await prisma.course.create({
    data: {
      title: 'Clinical Documentation & Case Record Standards',
      description: 'Structured Case Report Form (CRF) design, Electronic Health Record standards, and CARE guidelines compliance.',
      providerId: userAcadVikram.id,
      providerRole: 'ACADEMICIAN',
      providerName: 'Dr. Vikram Iyer (Sushruta Institute)',
      category: 'Ayurveda & Healthcare',
      skillLevel: 'INTERMEDIATE',
      duration: '3 Weeks (15 Hours)',
      mode: 'ONLINE',
      status: 'PUBLISHED',
      skills: { create: [{ skillId: skillClinicalDoc.id }] },
      subSkills: { create: [{ subSkillId: subCaseReport.id }] },
    },
  });

  console.log('   [OK] Seeded 5 Key Benchmark Courses');

  // =========================================================================
  // 8. FLAGSHIP OPPORTUNITY & ASSESSMENTS
  // =========================================================================
  console.log('8. Creating Flagship Demo Opportunity: Clinical Research Intern - Ayurveda...');

  const mainOpportunity = await prisma.opportunity.create({
    data: {
      industryId: indAyurRes.id,
      title: 'Clinical Research Intern - Ayurveda',
      type: 'INTERNSHIP',
      description: 'Join AyurResearch Labs as a Clinical Research Intern. You will participate in GCP-compliant clinical trials, botanical pharmacognostic verification, trial documentation, and data preparation for peer-reviewed AYUSH publications.',
      degree: 'BAMS',
      department: 'Ayurveda',
      minCgpa: 7.5,
      location: 'Anna Nagar, Chennai, Tamil Nadu',
      workMode: 'HYBRID',
      stipendOrSalary: 'INR 25,000 / month',
      duration: '6 Months',
      startDate: 'Immediate / Next Cohort',
      numberOfOpenings: 4,
      responsibilities: '1. Assist in patient cohort screening and informed consent protocols under AYUSH GCP guidelines.\n2. Conduct Dravyaguna herbarium and botanical sample authentication.\n3. Complete Case Report Forms (CRFs) and support clinical data entry.\n4. Participate in weekly research review meetings and literature synthesis.',
      selectionProcess: 'SkillBridge Compatibility Assessment -> Technical Portfolio Review -> Interview',
      assessmentRequired: true,
      isPublished: true,
      applicationDeadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days ahead
      skills: {
        create: [
          { skillId: skillDravyaguna.id, isRequired: true, minProficiency: 'INTERMEDIATE' },
          { skillId: skillClinicalResearch.id, isRequired: true, minProficiency: 'INTERMEDIATE' },
          { skillId: skillResearchMethodology.id, isRequired: true, minProficiency: 'INTERMEDIATE' },
          { skillId: skillDataAnalysis.id, isRequired: true, minProficiency: 'BEGINNER' },
          { skillId: skillClinicalDoc.id, isRequired: true, minProficiency: 'BEGINNER' },
          { skillId: skillAyuFundamentals.id, isRequired: false, minProficiency: 'INTERMEDIATE' },
        ],
      },
      subSkillRequirements: {
        create: [
          { subSkillId: subDravyaId.id, isRequired: true, minScore: 75.0, minProficiency: 'ADVANCED' },
          { subSkillId: subClinicalUnderstand.id, isRequired: true, minScore: 70.0, minProficiency: 'INTERMEDIATE' },
          { subSkillId: subProtocol.id, isRequired: true, minScore: 65.0, minProficiency: 'INTERMEDIATE' },
        ],
      },
    },
  });

  // Create SkillBridge Standardized Assessment for this Opportunity
  const mainAssessment = await prisma.assessment.create({
    data: {
      opportunityId: mainOpportunity.id,
      title: 'SkillBridge Clinical Research & Dravyaguna Benchmark Assessment',
      description: 'Standardized assessment evaluating Dravyaguna botanical taxonomy, clinical trial protocols, research methodology, and patient assessment.',
      durationMinutes: 45,
      passingScore: 65.0,
      isLocked: false,
      questions: {
        create: [
          {
            questionText: 'Which classical formulation parameter defines the thermal potency of a Dravya in Dravyaguna?',
            difficulty: 'MEDIUM',
            weightage: 1,
            skillId: skillDravyaguna.id,
            subSkillId: subVirya.id,
            options: {
              create: [
                { optionText: 'Virya (Sheeta / Ushna)', isCorrect: true },
                { optionText: 'Vipaka (Madhura / Amla / Katu)', isCorrect: false },
                { optionText: 'Prabhava (Specific Action)', isCorrect: false },
                { optionText: 'Guna (Physical Attribute)', isCorrect: false },
              ],
            },
          },
          {
            questionText: 'Under AYUSH Good Clinical Practice (GCP), which document must be obtained prior to subject enrollment?',
            difficulty: 'MEDIUM',
            weightage: 1,
            skillId: skillClinicalResearch.id,
            subSkillId: subGCP.id,
            options: {
              create: [
                { optionText: 'Freely given Written Informed Consent', isCorrect: true },
                { optionText: 'Drug Master File from Manufacturer', isCorrect: false },
                { optionText: 'Final Clinical Study Report', isCorrect: false },
                { optionText: 'Patent Certificate', isCorrect: false },
              ],
            },
          },
          {
            questionText: 'In Dravyaguna taxonomy, macroscopic identification of Ashwagandha root is verified by which characteristic?',
            difficulty: 'MEDIUM',
            weightage: 1,
            skillId: skillDravyaguna.id,
            subSkillId: subDravyaId.id,
            options: {
              create: [
                { optionText: 'Horse-like odor with cylindrical, tortuous roots and short fracture', isCorrect: true },
                { optionText: 'Strong aromatic camphoraceous fragrance with deep blue color', isCorrect: false },
                { optionText: 'Fibrous spongy rhizome with pungent yellow powder', isCorrect: false },
                { optionText: 'Resinous exudate with sweet taste', isCorrect: false },
              ],
            },
          },
        ],
      },
    },
  });

  // Create Industry Proctored Assessment for AyurResearch Labs
  const indAssessment = await prisma.assessment.create({
    data: {
      industryId: indAyurRes.id,
      title: 'AyurResearch Clinical Competency Proctored Validation',
      description: 'Rigorous industry validation testing pharmacological analysis, randomized trial compliance, and clinical evidence synthesis.',
      durationMinutes: 60,
      passingScore: 75.0,
      isLocked: false,
    },
  });

  // Additional Opportunities for other partners to provide diverse matching
  await prisma.opportunity.createMany({
    data: [
      {
        industryId: indVedaLife.id,
        title: 'Panchakarma & Clinical Associate Intern',
        type: 'INTERNSHIP',
        description: 'Supervised clinical residency in classical Panchakarma therapies, patient consultation, and wellness management.',
        degree: 'BAMS',
        department: 'Ayurveda',
        minCgpa: 7.0,
        location: 'Bangalore, Karnataka',
        workMode: 'ON_SITE',
        stipendOrSalary: 'INR 22,000 / month',
        duration: '6 Months',
        numberOfOpenings: 3,
        isPublished: true,
      },
      {
        industryId: indHerbMatrix.id,
        title: 'Herbal Formulation & QC Trainee',
        type: 'INTERNSHIP',
        description: 'Analytical quality testing, HPTLC profiling, and GMP manufacturing protocols for standardized polyherbal extracts.',
        degree: 'BAMS',
        department: 'Ayurveda',
        minCgpa: 7.0,
        location: 'Chennai, Tamil Nadu',
        workMode: 'ON_SITE',
        stipendOrSalary: 'INR 20,000 / month',
        duration: '4 Months',
        numberOfOpenings: 2,
        isPublished: true,
      },
      {
        industryId: indAyuData.id,
        title: 'AYUSH Health Data Analyst Intern',
        type: 'INTERNSHIP',
        description: 'Clinical trial registry informatics, epidemiological data cleaning, and statistical dashboard management.',
        degree: 'BAMS',
        department: 'Ayurveda',
        minCgpa: 7.5,
        location: 'Chennai / Remote',
        workMode: 'REMOTE',
        stipendOrSalary: 'INR 24,000 / month',
        duration: '3 Months',
        numberOfOpenings: 2,
        isPublished: true,
      },
      {
        industryId: indTechNova.id,
        title: 'Junior AI & Data Science Intern',
        type: 'INTERNSHIP',
        description: 'Develop predictive machine learning models, statistical data pipelines, and cloud APIs for enterprise customers.',
        degree: 'B.Tech CSE',
        department: 'Computer Science & Engineering',
        minCgpa: 7.5,
        location: 'Chennai, Tamil Nadu',
        workMode: 'HYBRID',
        stipendOrSalary: 'INR 30,000 / month',
        duration: '6 Months',
        numberOfOpenings: 5,
        isPublished: true,
      },
    ],
  });

  console.log('   [OK] Seeded Flagship Opportunity & Industry Assessments');

  // =========================================================================
  // 9. STUDENTS (10 TOTAL) - DETAILED PROFILES & DATA
  // =========================================================================
  console.log('9. Creating 10 Connected Student Accounts (8 Ayurveda + 2 General)...');

  // -------------------------------------------------------------------------
  // STUDENT 1: Aarav Sharma (Flagship Demo Student)
  // -------------------------------------------------------------------------
  console.log('   -> Creating Aarav Sharma (Strongest Demo Candidate)...');
  const userAarav = await prisma.user.create({
    data: {
      email: 'aarav.demo@skillbridge.edu',
      passwordHash,
      role: 'STUDENT',
    },
  });

  const studentAarav = await prisma.studentProfile.create({
    data: {
      userId: userAarav.id,
      fullName: 'Aarav Sharma',
      phone: '+91 98402 11001',
      dob: '2002-05-14',
      gender: 'Male',
      institutionId: instAyu.id,
      institutionName: instAyu.institutionName,
      department: 'Ayurveda',
      degree: 'BAMS',
      currentYear: 4,
      cgpa: 8.8,
      graduationYear: 2026,
      location: 'Chennai, Tamil Nadu',
      bio: 'Final-year BAMS scholar specializing in evidence-based Dravyaguna research, classical formulation analysis, and GCP clinical trial methodologies.',
      careerInterests: 'Ayurvedic Clinical Research, Dravyaguna, Clinical Pharmacology, AYUSH Clinical Trials',
      targetCareer: 'Ayurvedic Clinical Researcher',
      targetRoleId: roleAyuResearcher.id,
      accountStatus: 'APPROVED',
      isVerified: true,
    },
  });

  // Aarav's Skill Profiles with Exact Calibrated Scores
  await prisma.studentSkillProfile.createMany({
    data: [
      { studentId: studentAarav.id, skillId: skillDravyaguna.id, proficiencyLevel: 'ADVANCED', scorePercentage: 82.0, verified: true, verificationStatus: 'VERIFIED', lastAssessedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
      { studentId: studentAarav.id, skillId: skillClinicalResearch.id, proficiencyLevel: 'INTERMEDIATE', scorePercentage: 68.0, verified: true, verificationStatus: 'VERIFIED', lastAssessedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) },
      { studentId: studentAarav.id, skillId: skillResearchMethodology.id, proficiencyLevel: 'INTERMEDIATE', scorePercentage: 74.0, verified: true, verificationStatus: 'VERIFIED', lastAssessedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) },
      { studentId: studentAarav.id, skillId: skillDataAnalysis.id, proficiencyLevel: 'DEVELOPING', scorePercentage: 48.0, verified: false, verificationStatus: 'PENDING', lastAssessedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      { studentId: studentAarav.id, skillId: skillClinicalDoc.id, proficiencyLevel: 'DEVELOPING', scorePercentage: 55.0, verified: false, verificationStatus: 'PENDING', lastAssessedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      { studentId: studentAarav.id, skillId: skillAyuFundamentals.id, proficiencyLevel: 'ADVANCED', scorePercentage: 88.0, verified: true, verificationStatus: 'VERIFIED', lastAssessedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000) },
    ],
  });

  // Aarav's Granular Sub-Skill Scores for Dravyaguna and Research
  await prisma.studentSubSkillScore.createMany({
    data: [
      { studentId: studentAarav.id, subSkillId: subDravyaId.id, scorePercentage: 85.0, proficiencyLevel: 'ADVANCED', questionsAttempted: 10, questionsCorrect: 9, lastAssessedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
      { studentId: studentAarav.id, subSkillId: subRasa.id, scorePercentage: 80.0, proficiencyLevel: 'ADVANCED', questionsAttempted: 10, questionsCorrect: 8, lastAssessedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
      { studentId: studentAarav.id, subSkillId: subGuna.id, scorePercentage: 82.0, proficiencyLevel: 'ADVANCED', questionsAttempted: 10, questionsCorrect: 8, lastAssessedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
      { studentId: studentAarav.id, subSkillId: subVirya.id, scorePercentage: 84.0, proficiencyLevel: 'ADVANCED', questionsAttempted: 10, questionsCorrect: 9, lastAssessedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
      { studentId: studentAarav.id, subSkillId: subVipaka.id, scorePercentage: 78.0, proficiencyLevel: 'ADVANCED', questionsAttempted: 10, questionsCorrect: 8, lastAssessedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
      { studentId: studentAarav.id, subSkillId: subKarma.id, scorePercentage: 85.0, proficiencyLevel: 'ADVANCED', questionsAttempted: 10, questionsCorrect: 9, lastAssessedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
      { studentId: studentAarav.id, subSkillId: subClinicalUnderstand.id, scorePercentage: 80.0, proficiencyLevel: 'ADVANCED', questionsAttempted: 10, questionsCorrect: 8, lastAssessedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
      { studentId: studentAarav.id, subSkillId: subProtocol.id, scorePercentage: 70.0, proficiencyLevel: 'INTERMEDIATE', questionsAttempted: 10, questionsCorrect: 7, lastAssessedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) },
      { studentId: studentAarav.id, subSkillId: subGCP.id, scorePercentage: 65.0, proficiencyLevel: 'INTERMEDIATE', questionsAttempted: 10, questionsCorrect: 6, lastAssessedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) },
      { studentId: studentAarav.id, subSkillId: subLitReview.id, scorePercentage: 76.0, proficiencyLevel: 'ADVANCED', questionsAttempted: 10, questionsCorrect: 8, lastAssessedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) },
      { studentId: studentAarav.id, subSkillId: subDescStats.id, scorePercentage: 50.0, proficiencyLevel: 'DEVELOPING', questionsAttempted: 10, questionsCorrect: 5, lastAssessedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      { studentId: studentAarav.id, subSkillId: subCaseReport.id, scorePercentage: 58.0, proficiencyLevel: 'DEVELOPING', questionsAttempted: 10, questionsCorrect: 6, lastAssessedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      { studentId: studentAarav.id, subSkillId: subTridosha.id, scorePercentage: 90.0, proficiencyLevel: 'EXPERT', questionsAttempted: 10, questionsCorrect: 9, lastAssessedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000) },
    ],
  });

  // Aarav's 5-Tier Skill Evidence Lifecycle for Dravyaguna
  console.log('   -> Seeding Complete 5-Tier Evidence Lifecycle for Aarav (Dravyaguna)...');
  await prisma.skillEvidence.createMany({
    data: [
      {
        studentId: studentAarav.id,
        skillId: skillDravyaguna.id,
        subSkillId: subDravyaId.id,
        evidenceType: 'SELF_DECLARED',
        status: 'COMPLETED',
        sourceName: 'Student Profile Self-Declaration',
        remarks: 'Claimed Level: ADVANCED (Specialized in botanical crude drug identification)',
        evidenceDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      },
      {
        studentId: studentAarav.id,
        skillId: skillDravyaguna.id,
        subSkillId: subDravyaId.id,
        evidenceType: 'EVIDENCE_PROVIDED',
        status: 'COMPLETED',
        sourceName: 'Botanical Field Herbarium & Pharmacognosy Study Report',
        documentUrl: 'https://sushruta.skillbridge.edu/evidence/aarav-dravyaguna-herbarium.pdf',
        remarks: 'Comprehensive field collection, macroscopic examination, and herbarium indexing of 120 medicinal plant species.',
        evidenceDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
      },
      {
        studentId: studentAarav.id,
        skillId: skillDravyaguna.id,
        subSkillId: subClinicalUnderstand.id,
        evidenceType: 'CREDENTIAL_VERIFIED',
        status: 'VERIFIED',
        sourceName: 'National AYUSH Mission Certificate in Dravyaguna & Plant Taxonomy',
        issuer: 'National AYUSH Mission / Sushruta Institute',
        credentialId: 'NAM-DRAV-2025-0842',
        documentUrl: 'https://sushruta.skillbridge.edu/certs/aarav-dravyaguna-cert.pdf',
        verifiedById: userAcadAnjali.id,
        verifiedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        remarks: 'Verified by Dr. Anjali Menon (HOD Dravyaguna) after viva-voce and herbarium inspection.',
        evidenceDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      },
      {
        studentId: studentAarav.id,
        skillId: skillDravyaguna.id,
        subSkillId: subDravyaId.id,
        evidenceType: 'SKILL_ASSESSED',
        status: 'COMPLETED',
        score: 82.0,
        sourceName: 'SkillBridge Standardized Dravyaguna Benchmark Assessment',
        assessmentId: mainAssessment.id,
        remarks: 'SkillBridge Assessed Score: 82% (Advanced Competency Verified)',
        evidenceDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      },
      {
        studentId: studentAarav.id,
        skillId: skillDravyaguna.id,
        subSkillId: subClinicalUnderstand.id,
        evidenceType: 'INDUSTRY_VALIDATED',
        status: 'VALIDATED',
        score: 91.0,
        sourceName: 'AyurResearch Labs Clinical Competency Proctored Validation',
        issuer: 'AyurResearch Labs',
        assessmentId: indAssessment.id,
        remarks: 'Industry Proctored Validation Score: 91% (Superior Clinical Pharmacognosy Index)',
        evidenceDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
    ],
  });

  // Aarav's Assessment History (Previous vs Current Benchmark)
  await prisma.assessmentAttempt.createMany({
    data: [
      {
        studentId: studentAarav.id,
        assessmentId: mainAssessment.id,
        opportunityId: mainOpportunity.id,
        score: 37.0,
        totalScore: 45.0,
        percentage: 82.0,
        passed: true,
        startedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        completedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000 + 40 * 60 * 1000),
      },
      {
        studentId: studentAarav.id,
        assessmentId: indAssessment.id,
        score: 54.6,
        totalScore: 60.0,
        percentage: 91.0,
        passed: true,
        startedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 55 * 60 * 1000),
      },
      {
        studentId: studentAarav.id,
        assessmentId: mainAssessment.id,
        score: 32.4,
        totalScore: 45.0,
        percentage: 72.0,
        passed: true,
        startedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
        completedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000 + 42 * 60 * 1000),
      },
    ],
  });

  // Aarav's Course Enrollments
  const enroll1 = await prisma.courseEnrollment.create({
    data: {
      studentId: studentAarav.id,
      courseId: courseAyuFund.id,
      progressPercentage: 100.0,
      status: 'COMPLETED',
      completedAt: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000),
      certificateStatus: 'ISSUED',
    },
  });
  await prisma.courseCertificate.create({
    data: {
      enrollmentId: enroll1.id,
      studentId: studentAarav.id,
      courseId: courseAyuFund.id,
      certificateCode: 'CERT-SB-AYU-FUND-2025-001',
      studentName: 'Aarav Sharma',
      courseTitle: courseAyuFund.title,
      providerName: courseAyuFund.providerName,
      verificationStatus: 'VERIFIED',
    },
  });

  const enroll2 = await prisma.courseEnrollment.create({
    data: {
      studentId: studentAarav.id,
      courseId: courseDravyaguna.id,
      progressPercentage: 100.0,
      status: 'COMPLETED',
      completedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      certificateStatus: 'ISSUED',
    },
  });
  await prisma.courseCertificate.create({
    data: {
      enrollmentId: enroll2.id,
      studentId: studentAarav.id,
      courseId: courseDravyaguna.id,
      certificateCode: 'CERT-SB-DRAV-2025-084',
      studentName: 'Aarav Sharma',
      courseTitle: courseDravyaguna.title,
      providerName: courseDravyaguna.providerName,
      verificationStatus: 'VERIFIED',
    },
  });

  await prisma.courseEnrollment.create({
    data: {
      studentId: studentAarav.id,
      courseId: courseClinicalResearch.id,
      progressPercentage: 65.0,
      status: 'IN_PROGRESS',
      certificateStatus: 'PENDING',
    },
  });

  // Aarav's Active Career Roadmap
  const roadmapAarav = await prisma.learningRoadmap.create({
    data: {
      studentId: studentAarav.id,
      careerRoleId: roleAyuResearcher.id,
      opportunityId: mainOpportunity.id,
      targetTitle: 'Ayurvedic Clinical Researcher',
      targetType: 'ROLE',
      version: 1,
      status: 'ACTIVE',
      currentReadiness: 78.0,
      targetReadiness: 80.0,
      totalPhases: 5,
      completedPhases: 2,
      summaryText: 'Personalized 5-phase career progression path towards Ayurvedic Clinical Researcher role at top AYUSH research organizations.',
    },
  });

  await prisma.roadmapStep.createMany({
    data: [
      {
        roadmapId: roadmapAarav.id,
        phaseNumber: 1,
        subSkillId: subTridosha.id,
        phaseTitle: 'Phase 1: Master Ayurveda Fundamentals & Dosha Theory',
        currentScore: 88.0,
        targetScore: 75.0,
        gap: 0.0,
        isMandatory: true,
        status: 'TARGET_ACHIEVED',
        aiRationale: 'Foundational mastery of classical Tridosha dynamics verified with 88% assessment score.',
        recommendedCourseId: courseAyuFund.id,
      },
      {
        roadmapId: roadmapAarav.id,
        phaseNumber: 2,
        subSkillId: subDravyaId.id,
        phaseTitle: 'Phase 2: Dravyaguna Taxonomy & Pharmacognosy',
        currentScore: 82.0,
        targetScore: 75.0,
        gap: 0.0,
        isMandatory: true,
        status: 'TARGET_ACHIEVED',
        aiRationale: 'Strong botanical taxonomy and organoleptic identification verified via 5-tier evidence hierarchy.',
        recommendedCourseId: courseDravyaguna.id,
      },
      {
        roadmapId: roadmapAarav.id,
        phaseNumber: 3,
        subSkillId: subProtocol.id,
        phaseTitle: 'Phase 3: Clinical Research Methods & AYUSH Trial Design',
        currentScore: 68.0,
        targetScore: 75.0,
        gap: 7.0,
        isMandatory: true,
        status: 'IN_PROGRESS',
        aiRationale: 'Advance randomized controlled trial protocol understanding from 68% to 75%+ target competency.',
        recommendedCourseId: courseClinicalResearch.id,
      },
      {
        roadmapId: roadmapAarav.id,
        phaseNumber: 4,
        subSkillId: subDescStats.id,
        phaseTitle: 'Phase 4: Biostatistics & Healthcare Data Analytics',
        currentScore: 48.0,
        targetScore: 75.0,
        gap: 27.0,
        isMandatory: false,
        status: 'NOT_STARTED',
        aiRationale: 'Strengthen quantitative data cleaning and cohort statistical analysis skills.',
        recommendedCourseId: courseDataAnalysis.id,
      },
      {
        roadmapId: roadmapAarav.id,
        phaseNumber: 5,
        subSkillId: subCaseReport.id,
        phaseTitle: 'Phase 5: Clinical Documentation & Case Reporting Standards',
        currentScore: 55.0,
        targetScore: 75.0,
        gap: 20.0,
        isMandatory: false,
        status: 'NOT_STARTED',
        aiRationale: 'Elevate Case Report Form (CRF) preparation and adverse event reporting to industry benchmark standards.',
        recommendedCourseId: courseClinicalDoc.id,
      },
    ],
  });

  // Calculate Real Match Score for Aarav on Main Opportunity
  const aaravMatchResult = await calculateOpportunityMatch(studentAarav.id, mainOpportunity.id);
  console.log(`   -> Aarav's Calculated Match on Main Opportunity: ${aaravMatchResult.matchPercentage}% (Match Score: ${aaravMatchResult.matchScore})`);

  // Aarav's Flagship Application
  await prisma.application.create({
    data: {
      studentId: studentAarav.id,
      opportunityId: mainOpportunity.id,
      status: 'SHORTLISTED',
      matchScore: aaravMatchResult.matchPercentage || 92.0,
      assessmentScore: 91.0,
      assessmentPassed: true,
      resumeUrl: 'https://sushruta.skillbridge.edu/resumes/aarav-sharma-portfolio.pdf',
      coverLetter: 'I am writing to express my strong enthusiasm for the Clinical Research Intern position at AyurResearch Labs. With top academic standing in Dravyaguna and verified clinical trial protocol training, I am eager to contribute to your evidence-based AYUSH studies.',
      appliedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      history: {
        create: [
          { status: 'APPLIED', notes: 'Application submitted with 5-tier verified Dravyaguna evidence and resume.' },
          { status: 'UNDER_REVIEW', notes: 'Application screened: 92% compatibility match score verified by algorithm.' },
          { status: 'SHORTLISTED', notes: 'Shortlisted for technical interview following 91% industry proctored validation score.' },
        ],
      },
    },
  });

  // -------------------------------------------------------------------------
  // STUDENTS 2 TO 8: Other Ayurveda Students
  // -------------------------------------------------------------------------
  const ayuStudentsData = [
    {
      fullName: 'Ananya Iyer',
      email: 'ananya.demo@skillbridge.edu',
      gender: 'Female',
      cgpa: 8.5,
      year: 4,
      careerInterests: 'Panchakarma & Clinical Practice, Chronic Disease Management, Holistic Wellness',
      targetCareer: 'Panchakarma Specialist & Wellness Director',
      bio: 'BAMS final year scholar focused on classical Shodhana therapies, neurological rehabilitation, and pulse diagnosis.',
      skills: [
        { skillId: skillPanchakarma.id, score: 84.0, level: 'ADVANCED' },
        { skillId: skillAyuFundamentals.id, score: 85.0, level: 'ADVANCED' },
        { skillId: skillDravyaguna.id, score: 72.0, level: 'INTERMEDIATE' },
      ],
    },
    {
      fullName: 'Kavya Nair',
      email: 'kavya.demo@skillbridge.edu',
      gender: 'Female',
      cgpa: 8.2,
      year: 3,
      careerInterests: 'Ayurvedic Pharmacology, Herbal Formulation QC, Pharmacognosy',
      targetCareer: 'Herbal Formulation & QC Specialist',
      bio: 'Passionate about botanical drug extraction, chemical fingerprinting, and standardized quality assurance.',
      skills: [
        { skillId: skillDravyaguna.id, score: 78.0, level: 'ADVANCED' },
        { skillId: skillRasashastra.id, score: 75.0, level: 'INTERMEDIATE' },
        { skillId: skillAyuFundamentals.id, score: 80.0, level: 'ADVANCED' },
      ],
    },
    {
      fullName: 'Meera Krishnan',
      email: 'meera.demo@skillbridge.edu',
      gender: 'Female',
      cgpa: 8.6,
      year: 4,
      careerInterests: 'Dravyaguna Research, Medicinal Plants Taxonomy, Phytomedicine',
      targetCareer: 'Dravyaguna Research Scientist',
      bio: 'Dedicated to ethno-botanical field research, herbal preservation, and classical text interpretation.',
      skills: [
        { skillId: skillDravyaguna.id, score: 80.0, level: 'ADVANCED' },
        { skillId: skillClinicalResearch.id, score: 65.0, level: 'INTERMEDIATE' },
        { skillId: skillResearchMethodology.id, score: 70.0, level: 'INTERMEDIATE' },
        { skillId: skillAyuFundamentals.id, score: 82.0, level: 'ADVANCED' },
      ],
      applyToMain: true,
    },
    {
      fullName: 'Riya Menon',
      email: 'riya.demo@skillbridge.edu',
      gender: 'Female',
      cgpa: 8.4,
      year: 4,
      careerInterests: 'Clinical Research, AYUSH Clinical Trials, Patient Care',
      targetCareer: 'Ayurvedic Clinical Research Scientist',
      bio: 'Investigator keen on clinical outcome measurement, patient compliance monitoring, and integrative hospital research.',
      skills: [
        { skillId: skillClinicalResearch.id, score: 72.0, level: 'INTERMEDIATE' },
        { skillId: skillDravyaguna.id, score: 74.0, level: 'INTERMEDIATE' },
        { skillId: skillResearchMethodology.id, score: 68.0, level: 'INTERMEDIATE' },
        { skillId: skillAyuFundamentals.id, score: 80.0, level: 'ADVANCED' },
      ],
      applyToMain: true,
    },
    {
      fullName: 'Aditya Rao',
      email: 'aditya.demo@skillbridge.edu',
      gender: 'Male',
      cgpa: 7.9,
      year: 3,
      careerInterests: 'Ayurveda Drug Development, Rasashastra, Bhasma Standardization',
      targetCareer: 'Ayurvedic Drug Discovery Associate',
      bio: 'Exploring traditional mineral processing, nanoparticle characterization, and Ayurvedic dosage forms.',
      skills: [
        { skillId: skillRasashastra.id, score: 78.0, level: 'ADVANCED' },
        { skillId: skillDravyaguna.id, score: 70.0, level: 'INTERMEDIATE' },
        { skillId: skillAyuFundamentals.id, score: 76.0, level: 'INTERMEDIATE' },
      ],
    },
    {
      fullName: 'Nandini Das',
      email: 'nandini.demo@skillbridge.edu',
      gender: 'Female',
      cgpa: 8.3,
      year: 4,
      careerInterests: 'Public Health & Ayurveda, Preventive Healthcare, Lifestyle Medicine',
      targetCareer: 'AYUSH Public Health Officer',
      bio: 'Focused on community preventive health drives, dietary intervention trials, and Swasthavritta education.',
      skills: [
        { skillId: skillAyuFundamentals.id, score: 84.0, level: 'ADVANCED' },
        { skillId: skillClinicalDoc.id, score: 68.0, level: 'INTERMEDIATE' },
        { skillId: skillResearchMethodology.id, score: 66.0, level: 'INTERMEDIATE' },
      ],
    },
    {
      fullName: 'Harini S',
      email: 'harini.demo@skillbridge.edu',
      gender: 'Female',
      cgpa: 8.1,
      year: 4,
      careerInterests: 'Ayurvedic Clinical Research, Evidence-based Medicine, Clinical Trials',
      targetCareer: 'Ayurvedic Clinical Research Scientist',
      bio: 'Eager to bridge classical Ayurveda clinical wisdom with modern epidemiological trial design.',
      skills: [
        { skillId: skillClinicalResearch.id, score: 66.0, level: 'INTERMEDIATE' },
        { skillId: skillDravyaguna.id, score: 70.0, level: 'INTERMEDIATE' },
        { skillId: skillResearchMethodology.id, score: 64.0, level: 'INTERMEDIATE' },
        { skillId: skillAyuFundamentals.id, score: 78.0, level: 'INTERMEDIATE' },
      ],
      applyToMain: true,
    },
  ];

  for (const item of ayuStudentsData) {
    const user = await prisma.user.create({
      data: {
        email: item.email,
        passwordHash,
        role: 'STUDENT',
      },
    });

    const stud = await prisma.studentProfile.create({
      data: {
        userId: user.id,
        fullName: item.fullName,
        gender: item.gender,
        institutionId: instAyu.id,
        institutionName: instAyu.institutionName,
        department: 'Ayurveda',
        degree: 'BAMS',
        currentYear: item.year,
        cgpa: item.cgpa,
        graduationYear: 2026,
        location: 'Chennai, Tamil Nadu',
        bio: item.bio,
        careerInterests: item.careerInterests,
        targetCareer: item.targetCareer,
        accountStatus: 'APPROVED',
        isVerified: true,
      },
    });

    for (const sk of item.skills) {
      await prisma.studentSkillProfile.create({
        data: {
          studentId: stud.id,
          skillId: sk.skillId,
          proficiencyLevel: sk.level,
          scorePercentage: sk.score,
          verified: sk.score >= 75,
          verificationStatus: sk.score >= 75 ? 'VERIFIED' : 'PENDING',
        },
      });
    }

    // Add Course Enrollments
    await prisma.courseEnrollment.create({
      data: {
        studentId: stud.id,
        courseId: courseAyuFund.id,
        progressPercentage: 100.0,
        status: 'COMPLETED',
        completedAt: new Date(),
      },
    });

    if (item.applyToMain) {
      const match = await calculateOpportunityMatch(stud.id, mainOpportunity.id);
      await prisma.application.create({
        data: {
          studentId: stud.id,
          opportunityId: mainOpportunity.id,
          status: 'UNDER_REVIEW',
          matchScore: match.matchPercentage || 78.0,
          assessmentScore: 76.0,
          assessmentPassed: true,
          appliedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        },
      });
    }
  }

  // -------------------------------------------------------------------------
  // STUDENTS 9 & 10: Non-Ayurveda Students (Technology & Commerce)
  // -------------------------------------------------------------------------
  console.log('   -> Creating Non-Ayurveda Students (Rahul Verma & Priya Shah)...');

  // Student 9: Rahul Verma (B.Tech CSE)
  const userRahul = await prisma.user.create({
    data: {
      email: 'rahul.demo@skillbridge.edu',
      passwordHash,
      role: 'STUDENT',
    },
  });

  const studentRahul = await prisma.studentProfile.create({
    data: {
      userId: userRahul.id,
      fullName: 'Rahul Verma',
      phone: '+91 98402 11009',
      dob: '2003-08-20',
      gender: 'Male',
      institutionId: instTech.id,
      institutionName: instTech.institutionName,
      department: 'Computer Science & Engineering',
      degree: 'B.Tech CSE',
      currentYear: 4,
      cgpa: 8.7,
      graduationYear: 2026,
      location: 'Chennai, Tamil Nadu',
      bio: 'B.Tech CSE undergrad specializing in machine learning, Python data pipelines, and predictive algorithms.',
      careerInterests: 'AI & Data Science, Machine Learning, Python, Full Stack Engineering',
      targetCareer: 'AI & Data Scientist',
      accountStatus: 'APPROVED',
      isVerified: true,
    },
  });

  await prisma.studentSkillProfile.createMany({
    data: [
      { studentId: studentRahul.id, skillId: skillAI.id, proficiencyLevel: 'ADVANCED', scorePercentage: 86.0, verified: true, verificationStatus: 'VERIFIED' },
      { studentId: studentRahul.id, skillId: skillDataAnalysis.id, proficiencyLevel: 'ADVANCED', scorePercentage: 82.0, verified: true, verificationStatus: 'VERIFIED' },
    ],
  });

  // Student 10: Priya Shah (B.Com)
  const userPriya = await prisma.user.create({
    data: {
      email: 'priya.demo@skillbridge.edu',
      passwordHash,
      role: 'STUDENT',
    },
  });

  const studentPriya = await prisma.studentProfile.create({
    data: {
      userId: userPriya.id,
      fullName: 'Priya Shah',
      phone: '+91 98402 11010',
      dob: '2003-11-12',
      gender: 'Female',
      institutionId: instTech.id,
      institutionName: instTech.institutionName,
      department: 'Commerce & Finance',
      degree: 'B.Com',
      currentYear: 3,
      cgpa: 8.4,
      graduationYear: 2026,
      location: 'Chennai, Tamil Nadu',
      bio: 'Finance and commerce scholar with expertise in corporate financial analysis, DCF valuations, and quantitative portfolio modeling.',
      careerInterests: 'Finance & Analytics, Financial Modeling, Corporate Valuation, Investment Banking',
      targetCareer: 'Corporate Financial Analyst',
      accountStatus: 'APPROVED',
      isVerified: true,
    },
  });

  await prisma.studentSkillProfile.createMany({
    data: [
      { studentId: studentPriya.id, skillId: skillFinance.id, proficiencyLevel: 'ADVANCED', scorePercentage: 84.0, verified: true, verificationStatus: 'VERIFIED' },
      { studentId: studentPriya.id, skillId: skillDataAnalysis.id, proficiencyLevel: 'INTERMEDIATE', scorePercentage: 72.0, verified: true, verificationStatus: 'VERIFIED' },
    ],
  });

  console.log('   [OK] Successfully Created All 10 Student Profiles with Calibrated Data');

  console.log('\n==================================================================');
  console.log('SIH DEMO ECOSYSTEM SEEDING COMPLETE!');
  console.log('==================================================================');
}

// Allow direct execution
if (require.main === module) {
  seedSihDemo()
    .catch((err) => {
      console.error('Seeding failed:', err);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
