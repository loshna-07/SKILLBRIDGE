"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const db_1 = __importDefault(require("./config/db"));
async function seedAyurvedaDemo() {
    console.log('==================================================================');
    console.log('🌿 SEEDING AYURVEDA ACADEMIA-INDUSTRY PLATFORM DEMO DATA');
    console.log('==================================================================\n');
    // Purge any existing records cleanly first
    console.log('0. Clearing existing test data to ensure clean slate...');
    await db_1.default.courseCertificate.deleteMany({});
    await db_1.default.courseLessonProgress.deleteMany({});
    await db_1.default.courseEnrollment.deleteMany({});
    await db_1.default.courseLesson.deleteMany({});
    await db_1.default.courseModule.deleteMany({});
    await db_1.default.courseSkill.deleteMany({});
    await db_1.default.course.deleteMany({});
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
    const passwordHash = await bcryptjs_1.default.hash('Demo@12345', 10);
    // ---------------------------------------------------------
    // 1. Ayurveda Skill Categories and Skills Taxonomy
    // ---------------------------------------------------------
    console.log('1. Seeding Ayurveda Skill Taxonomy (8 Categories, 40+ Skills)...');
    const categoriesData = [
        {
            name: 'Ayurveda Fundamentals',
            description: 'Foundational philosophies, tridosha theory, panchamahabhuta, and classical Sanskrit terminology.',
            skills: [
                { name: 'Ayurvedic Fundamentals', description: 'Core principles of Ayurveda, dosha-dhatu-mala equilibrium, and holistic health concepts' },
                { name: 'Tridosha Theory', description: 'Physiological, psychological, and pathological functions of Vata, Pitta, and Kapha' },
                { name: 'Panchamahabhuta', description: 'Five-element theory and its expression in human anatomy, physiology, and pharmacology' },
                { name: 'Prakriti Assessment', description: 'Phenotypic and constitution analysis for personalized medicine and lifestyle' },
                { name: 'Vikriti Assessment', description: 'Diagnosis of dynamic pathological doshic imbalances and systemic deviations' },
                { name: 'Sanskrit', description: 'Classical Sanskrit grammar, chanting, and interpretation of Ayurvedic Samhitas' },
            ],
        },
        {
            name: 'Clinical Ayurveda',
            description: 'Clinical internal medicine, diagnostics, pulse examination, and specialized therapeutic branches.',
            skills: [
                { name: 'Kayachikitsa', description: 'General internal medicine, systemic pathology management, and metabolic disorder treatments' },
                { name: 'Ayurvedic Diagnosis', description: 'Ashtavidha and Dashavidha Pariksha clinical diagnostics and differential prognosis' },
                { name: 'Nadi Pariksha', description: 'Classical pulse examination for subtle doshic assessment, organ health, and chronobiology' },
                { name: 'Patient Counselling', description: 'Ahara, Vihara, and Manasika counselling for patient adherence and mind-body wellbeing' },
                { name: 'Clinical Documentation', description: 'Systematic Ayurvedic case reporting, protocol logging, and clinical outcome metrics' },
                { name: 'Shalya Tantra', description: 'Surgical and para-surgical techniques including Kshara Sutra and Jalaukavacharana' },
                { name: 'Shalakya Tantra', description: 'ENT, ophthalmology, and head/neck disorders in classical Ayurvedic medicine' },
                { name: 'Kaumarabhritya', description: 'Ayurvedic pediatrics, neonatal care, and developmental disorders' },
                { name: 'Prasuti Tantra', description: 'Ayurvedic obstetrics, antenatal care, and Garbhini Paricharya regimens' },
                { name: 'Stri Roga', description: 'Ayurvedic gynecology, hormonal imbalance management, and female reproductive health' },
            ],
        },
        {
            name: 'Panchakarma',
            description: 'Five purification and detoxification therapies, pre-procedures, and post-cleansing regimens.',
            skills: [
                { name: 'Panchakarma', description: 'Comprehensive knowledge of Sodhana therapies, indications, and clinical management' },
                { name: 'Abhyanga', description: 'Therapeutic synchronized medicated oil massage techniques and Marma point stimulation' },
                { name: 'Swedana', description: 'Sudation therapies including Bashpa, Nadi, and Patra Pinda Sweda protocols' },
                { name: 'Vamana', description: 'Therapeutic emesis protocol for Kapha-predominant disorders and metabolic cleansing' },
                { name: 'Virechana', description: 'Therapeutic purgation protocols for Pitta and Rakta systemic purification' },
                { name: 'Basti', description: 'Medicated enema therapy (Niruha & Anuvasana) for Vata neurological and degenerative disorders' },
                { name: 'Nasya', description: 'Nasal administration of medicated oils and powders for Urdhwajatrugata disorders' },
                { name: 'Raktamokshana', description: 'Therapeutic blood-letting using leech therapy (Jalauka) and Siravyadha' },
            ],
        },
        {
            name: 'Dravyaguna',
            description: 'Materia medica, medicinal plant identification, pharmacognosy, and herbal pharmacology.',
            skills: [
                { name: 'Dravyaguna', description: 'Pharmacological action of Ayurvedic drugs, Rasa-Guna-Virya-Vipaka-Prabhava matrix' },
                { name: 'Medicinal Plants', description: 'Botanical taxonomy, habitat identification, cultivation, and sustainable harvesting' },
                { name: 'Herbal Identification', description: 'Macroscopic and microscopic authentication of raw botanical herbs and crude drugs' },
                { name: 'Pharmacognosy', description: 'Phytochemical screening, active constituent assaying, and herb standardization' },
                { name: 'Herbal Medicine', description: 'Therapeutic application of single and polyherbal extracts for acute and chronic conditions' },
                { name: 'Herbal Formulations', description: 'Compounding botanical extracts into syrups, powders, oils, and decoctions' },
            ],
        },
        {
            name: 'Ayurvedic Pharmacy',
            description: 'Pharmaceutics, mineral alchemy (Rasashastra), formulation science (Bhaishajya Kalpana), and GMP.',
            skills: [
                { name: 'Rasashastra', description: 'Processing of minerals, metals, Bhasma preparation, and Sodhana-Marana techniques' },
                { name: 'Bhaishajya Kalpana', description: 'Classical pharmaceutical preparation of Asava, Arishta, Avaleha, Ghrita, and Taila' },
                { name: 'Ayurvedic Formulations', description: 'Standard operating procedures for scalable commercial manufacturing of Ayurvedic medicine' },
                { name: 'Pharmaceutical Processing', description: 'Industrial grinding, extraction, filtration, tablet compression, and sterile packaging' },
                { name: 'Quality Control', description: 'Heavy metal testing, microbial limits, aflatoxin screening, and stability testing' },
                { name: 'GMP', description: 'Schedule T Good Manufacturing Practices compliance for Ayurvedic manufacturing facilities' },
            ],
        },
        {
            name: 'Research',
            description: 'Evidence-based Ayurveda, clinical trials, biostatistics, and biomedical research publications.',
            skills: [
                { name: 'Clinical Research', description: 'Design and execution of GCP-compliant integrative clinical trials in Ayurveda' },
                { name: 'Research Methodology', description: 'Observational studies, randomized controlled trials, and protocol writing' },
                { name: 'Clinical Trials', description: 'Patient recruitment, CTRI registration, monitoring, and adverse event reporting' },
                { name: 'Biostatistics', description: 'Parametric and non-parametric hypothesis testing, SPSS/R analysis for healthcare' },
                { name: 'Scientific Writing', description: 'Manuscript preparation, peer-reviewed journal publishing, and evidence synthesis' },
                { name: 'Data Analysis', description: 'Health informatics, patient registry statistics, and quantitative data analysis' },
            ],
        },
        {
            name: 'Wellness & Lifestyle',
            description: 'Preventive healthcare, Swasthavritta, therapeutic Yoga, and personalized Ayurvedic nutrition.',
            skills: [
                { name: 'Yoga', description: 'Therapeutic Asana, Pranayama, and Shatkarma protocols for chronic lifestyle disease reversal' },
                { name: 'Swasthavritta', description: 'Dinacharya (daily regimen), Ritucharya (seasonal regimen), and Sadvritta mental hygiene' },
                { name: 'Lifestyle Counselling', description: 'Behavioral modification and circadian rhythm alignment based on individual Prakriti' },
                { name: 'Ayurvedic Nutrition', description: 'Ahara Vidhi Vidhana, dietary compatibility (Viruddhahara), and therapeutic cooking' },
                { name: 'Preventive Healthcare', description: 'Rasayana rejuvenation therapy, immune modulation, and community wellness' },
            ],
        },
        {
            name: 'Digital Ayurveda',
            description: 'Health informatics, electronic health records, telemedicine, and healthcare analytics.',
            skills: [
                { name: 'Digital Health', description: 'Tele-consultation platforms, remote patient monitoring, and Ayush digital mission' },
                { name: 'Electronic Health Records', description: 'Standardized Namaste & ICD-11 coding for Ayurvedic patient documentation' },
                { name: 'Healthcare Data Management', description: 'Secure patient record storage, HIPAA compliance, and data retrieval' },
                { name: 'Medical Documentation', description: 'Structured clinical case taking and digital discharge summary compilation' },
                { name: 'Healthcare Analytics', description: 'Epidemiological trends, treatment outcome analysis, and clinical decision support' },
            ],
        },
    ];
    const skillMap = new Map(); // skillName -> skillId
    const categoryMap = new Map();
    for (const catData of categoriesData) {
        const category = await db_1.default.skillCategory.create({
            data: {
                name: catData.name,
                description: catData.description,
            },
        });
        categoryMap.set(catData.name, category.id);
        for (const s of catData.skills) {
            const skill = await db_1.default.skill.create({
                data: {
                    name: s.name,
                    description: s.description,
                    categoryId: category.id,
                },
            });
            skillMap.set(s.name, skill.id);
        }
    }
    // ---------------------------------------------------------
    // 2. Ayurveda Skill Assessments & Question Banks
    // ---------------------------------------------------------
    console.log('2. Seeding Ayurveda Skill Assessments & Question Banks...');
    const clinicalAssessCat = categoryMap.get('Clinical Ayurveda');
    const clinicalAssessment = await db_1.default.assessment.create({
        data: {
            title: 'Clinical Ayurveda & Diagnostic Competency Assessment',
            description: 'Standardized evaluation of Kayachikitsa, Ashtavidha Pariksha, Nadi Pariksha, and clinical differential diagnosis.',
            categoryId: clinicalAssessCat,
            durationMinutes: 30,
            passingScore: 60.0,
            questions: {
                create: [
                    {
                        questionText: 'In Ashtavidha Pariksha, which examination method is primary for assessing the subtle state of Tridosha and Dhatu status?',
                        difficulty: 'MEDIUM',
                        weightage: 2,
                        skillId: skillMap.get('Nadi Pariksha'),
                        options: {
                            create: [
                                { optionText: 'Mala Pariksha (Stool Examination)', isCorrect: false },
                                { optionText: 'Nadi Pariksha (Pulse Examination)', isCorrect: true },
                                { optionText: 'Drik Pariksha (Eye Examination)', isCorrect: false },
                                { optionText: 'Akriti Pariksha (Physical Appearance)', isCorrect: false },
                            ],
                        },
                    },
                    {
                        questionText: 'Which Ayurvedic cardinal principle defines the manifestation of disease through six progressive stages of pathogenesis?',
                        difficulty: 'EASY',
                        weightage: 1,
                        skillId: skillMap.get('Ayurvedic Diagnosis'),
                        options: {
                            create: [
                                { optionText: 'Shat Kriya Kala', isCorrect: true },
                                { optionText: 'Saptavidha Aharavidhi', isCorrect: false },
                                { optionText: 'Pancha Kosha Viveka', isCorrect: false },
                                { optionText: 'Trimala Prakopana', isCorrect: false },
                            ],
                        },
                    },
                    {
                        questionText: 'In Kayachikitsa management of Amavata (Rheumatoid Arthritis), which therapeutic principle is considered paramount initially?',
                        difficulty: 'MEDIUM',
                        weightage: 2,
                        skillId: skillMap.get('Kayachikitsa'),
                        options: {
                            create: [
                                { optionText: 'Brimhana and heavy Snehana therapies immediately', isCorrect: false },
                                { optionText: 'Langhana, Deepana-Pachana, and Ruksha Sweda to digest Ama', isCorrect: true },
                                { optionText: 'Immediate surgical excision', isCorrect: false },
                                { optionText: 'Cold water application and heavy dairy intake', isCorrect: false },
                            ],
                        },
                    },
                ],
            },
        },
    });
    const panchaAssessCat = categoryMap.get('Panchakarma');
    const panchaAssessment = await db_1.default.assessment.create({
        data: {
            title: 'Panchakarma Principles & Protocols Assessment',
            description: 'Comprehensive evaluation of Purvakarma (Snehana-Swedana), Pradhanakarma (5 purification procedures), and Paschatkarma.',
            categoryId: panchaAssessCat,
            durationMinutes: 30,
            passingScore: 60.0,
            questions: {
                create: [
                    {
                        questionText: 'Which classical Panchakarma procedure is specifically indicated as the supreme treatment for Vata Dosha vitiation?',
                        difficulty: 'EASY',
                        weightage: 1,
                        skillId: skillMap.get('Basti'),
                        options: {
                            create: [
                                { optionText: 'Basti Karma (Medicated Enemas)', isCorrect: true },
                                { optionText: 'Vamana Karma', isCorrect: false },
                                { optionText: 'Raktamokshana', isCorrect: false },
                                { optionText: 'Nasya Karma', isCorrect: false },
                            ],
                        },
                    },
                    {
                        questionText: 'During Snehapana (internal oleation), what is the definitive clinical indicator of complete internal oleation (Samyak Snigdha Lakshana)?',
                        difficulty: 'HARD',
                        weightage: 2,
                        skillId: skillMap.get('Panchakarma'),
                        options: {
                            create: [
                                { optionText: 'Vatanulomana, Deeptagni, Asamhata Varchas, and Snehodvega', isCorrect: true },
                                { optionText: 'High fever and severe tachycardia', isCorrect: false },
                                { optionText: 'Extreme dryness of skin and severe constipation', isCorrect: false },
                                { optionText: 'Excessive weight gain within 24 hours', isCorrect: false },
                            ],
                        },
                    },
                ],
            },
        },
    });
    // ---------------------------------------------------------
    // 3. Ayurveda Institutions (3 Accounts)
    // ---------------------------------------------------------
    console.log('3. Seeding Ayurveda Institution Accounts...');
    const dhanvantariInst = await db_1.default.user.create({
        data: {
            email: 'admin.dhanvantari@demo.ayurveda.com',
            passwordHash,
            role: 'INSTITUTION',
            institutionProfile: {
                create: {
                    institutionName: 'Sri Dhanvantari Ayurveda College',
                    officialEmail: 'admin.dhanvantari@demo.ayurveda.com',
                    institutionType: 'Ayurveda Medical College & Hospital',
                    affiliatedUniversity: 'The Tamil Nadu Dr. M.G.R. Medical University',
                    address: 'Dhanvantari Nagar, Poonamallee High Road, Chennai, Tamil Nadu 600056',
                    website: 'https://dhanvantari-ayurveda.demo',
                    contactPerson: 'Dr. S. K. Subramanian (Principal & Dean)',
                    contactNumber: '+91 44 2688 1234',
                },
            },
        },
        include: { institutionProfile: true },
    });
    const siiaInst = await db_1.default.user.create({
        data: {
            email: 'admin.siia@demo.ayurveda.com',
            passwordHash,
            role: 'INSTITUTION',
            institutionProfile: {
                create: {
                    institutionName: 'South Indian Institute of Ayurveda',
                    officialEmail: 'admin.siia@demo.ayurveda.com',
                    institutionType: 'Ayurveda Medical College',
                    affiliatedUniversity: 'Kerala University of Health Sciences & MGR',
                    address: 'Western Ghats Bio-Reserve Campus, Coimbatore, Tamil Nadu 641105',
                    website: 'https://siia-ayurveda.demo',
                    contactPerson: 'Dr. C. P. Namboodiri (Director)',
                    contactNumber: '+91 422 2987 654',
                },
            },
        },
        include: { institutionProfile: true },
    });
    const kariInst = await db_1.default.user.create({
        data: {
            email: 'admin.kari@demo.ayurveda.com',
            passwordHash,
            role: 'INSTITUTION',
            institutionProfile: {
                create: {
                    institutionName: 'Kerala Ayurveda Research Institute',
                    officialEmail: 'admin.kari@demo.ayurveda.com',
                    institutionType: 'Ayurveda Research & PG Institute',
                    affiliatedUniversity: 'Kerala University of Health Sciences',
                    address: 'Herbal Valley Research Complex, Kochi, Kerala 682024',
                    website: 'https://kari-research.demo',
                    contactPerson: 'Dr. K. Jayasree (Dean of Research)',
                    contactNumber: '+91 484 2555 789',
                },
            },
        },
        include: { institutionProfile: true },
    });
    // ---------------------------------------------------------
    // 4. Ayurveda Academicians (3 Accounts)
    // ---------------------------------------------------------
    console.log('4. Seeding Ayurveda Academician Accounts...');
    const acadAnanya = await db_1.default.user.create({
        data: {
            email: 'ananya.academician@demo.ayurveda.com',
            passwordHash,
            role: 'ACADEMICIAN',
            academicianProfile: {
                create: {
                    fullName: 'Dr. Ananya Krishnan',
                    phone: '+91 98401 54321',
                    institutionName: 'Sri Dhanvantari Ayurveda College',
                    department: 'Kayachikitsa',
                    designation: 'Associate Professor',
                    yearsOfExperience: 14,
                    areasOfExpertise: 'Kayachikitsa, Panchakarma, Ayurvedic Diagnosis, Clinical Ayurveda',
                    location: 'Chennai, Tamil Nadu',
                    bio: 'Senior Ayurvedic physician and academician specializing in chronic autoimmune disorders, Nadi Pariksha pulse diagnostics, and evidence-based Kayachikitsa clinical protocols.',
                },
            },
        },
        include: { academicianProfile: true },
    });
    const acadRavi = await db_1.default.user.create({
        data: {
            email: 'ravi.academician@demo.ayurveda.com',
            passwordHash,
            role: 'ACADEMICIAN',
            academicianProfile: {
                create: {
                    fullName: 'Dr. Ravi Narayanan',
                    phone: '+91 94440 12389',
                    institutionName: 'South Indian Institute of Ayurveda',
                    department: 'Dravyaguna',
                    designation: 'Professor',
                    yearsOfExperience: 19,
                    areasOfExpertise: 'Dravyaguna, Medicinal Plants, Herbal Medicine, Pharmacognosy',
                    location: 'Coimbatore, Tamil Nadu',
                    bio: 'Renowned pharmacognosist and Dravyaguna department chair with two decades of field research in Western Ghats ethnobotany and Ayurvedic phytomedicine standardization.',
                },
            },
        },
        include: { academicianProfile: true },
    });
    const acadMeenakshi = await db_1.default.user.create({
        data: {
            email: 'meenakshi.academician@demo.ayurveda.com',
            passwordHash,
            role: 'ACADEMICIAN',
            academicianProfile: {
                create: {
                    fullName: 'Dr. Meenakshi Menon',
                    phone: '+91 97455 67890',
                    institutionName: 'Kerala Ayurveda Research Institute',
                    department: 'Rasashastra & Bhaishajya Kalpana',
                    designation: 'Professor',
                    yearsOfExperience: 16,
                    areasOfExpertise: 'Rasashastra, Bhaishajya Kalpana, Ayurvedic Pharmacy, Quality Control',
                    location: 'Kochi, Kerala',
                    bio: 'Eminent pharmaceutical researcher guiding postgraduate thesis work on Bhasma nanotechnology, pharmaceutical processing controls, and GMP quality assurance in Ayurveda.',
                },
            },
        },
        include: { academicianProfile: true },
    });
    // ---------------------------------------------------------
    // 5. Ayurveda Industry Partners (4 Accounts)
    // ---------------------------------------------------------
    console.log('5. Seeding Ayurveda Industry Partners...');
    const indDhanvantari = await db_1.default.user.create({
        data: {
            email: 'hr@dhanvantari.demo',
            passwordHash,
            role: 'INDUSTRY',
            industryProfile: {
                create: {
                    companyName: 'Dhanvantari Wellness Pvt Ltd',
                    officialEmail: 'hr@dhanvantari.demo',
                    industrySector: 'Ayurvedic Healthcare & Wellness',
                    companySize: '100-250 employees',
                    website: 'https://dhanvantariwellness.demo',
                    location: 'Chennai, Tamil Nadu',
                    description: 'Premier network of authentic Ayurvedic hospitals and luxury wellness retreats specializing in classical Panchakarma therapies, stress reversal, and preventive healthcare.',
                    contactPerson: 'Suresh Varier (Head of Human Resources)',
                    contactNumber: '+91 44 4900 1122',
                },
            },
        },
        include: { industryProfile: true },
    });
    const indKeralaHerbal = await db_1.default.user.create({
        data: {
            email: 'hr@keralaherbal.demo',
            passwordHash,
            role: 'INDUSTRY',
            industryProfile: {
                create: {
                    companyName: 'Kerala Herbal Sciences',
                    officialEmail: 'hr@keralaherbal.demo',
                    industrySector: 'Ayurvedic Pharmaceuticals',
                    companySize: '250-500 employees',
                    website: 'https://keralaherbal.demo',
                    location: 'Kochi, Kerala',
                    description: 'Leading GMP-certified Ayurvedic pharmaceutical enterprise manufacturing standardized herbal extracts, classical Kashayams, and research-backed therapeutic polyherbal formulations.',
                    contactPerson: 'Radhika Pillai (Director of Talent & QC)',
                    contactNumber: '+91 484 2800 3344',
                },
            },
        },
        include: { industryProfile: true },
    });
    const indAyurvedaLife = await db_1.default.user.create({
        data: {
            email: 'hr@ayurvedalife.demo',
            passwordHash,
            role: 'INDUSTRY',
            industryProfile: {
                create: {
                    companyName: 'Ayurveda Life Sciences',
                    officialEmail: 'hr@ayurvedalife.demo',
                    industrySector: 'Ayurvedic Research & Pharmaceuticals',
                    companySize: '50-100 employees',
                    website: 'https://ayurvedalifesciences.demo',
                    location: 'Bengaluru, Karnataka',
                    description: 'Biopharmaceutical research laboratory conducting GCP-compliant clinical trials, botanical drug discovery, and digital health technology integrations in traditional Indian medicine.',
                    contactPerson: 'Dr. Vivek Bhatt (Head of Clinical Operations)',
                    contactNumber: '+91 80 4321 8899',
                },
            },
        },
        include: { industryProfile: true },
    });
    const indPranaWellness = await db_1.default.user.create({
        data: {
            email: 'hr@pranaayurveda.demo',
            passwordHash,
            role: 'INDUSTRY',
            industryProfile: {
                create: {
                    companyName: 'Prana Ayurveda Wellness',
                    officialEmail: 'hr@pranaayurveda.demo',
                    industrySector: 'Ayurveda Wellness & Lifestyle',
                    companySize: '50-100 employees',
                    website: 'https://pranaayurveda.demo',
                    location: 'Hyderabad, Telangana',
                    description: 'Integrative lifestyle healthcare centers delivering customized Yoga therapeutics, Prakriti-specific nutrition regimens, and circadian wellness coaching across major metropolitan centers.',
                    contactPerson: 'Anandita Roy (Chief Wellness Officer)',
                    contactNumber: '+91 40 6712 3456',
                },
            },
        },
        include: { industryProfile: true },
    });
    // ---------------------------------------------------------
    // 6. Ayurveda Students (6 Accounts)
    // ---------------------------------------------------------
    console.log('6. Seeding 6 Ayurveda Student Profiles, Portfolios & Declared Skills...');
    // Student 1: Ananya Iyer (Panchakarma & Clinical Ayurveda Focus)
    const studentAnanya = await db_1.default.user.create({
        data: {
            email: 'ananya.student@demo.ayurveda.com',
            passwordHash,
            role: 'STUDENT',
            studentProfile: {
                create: {
                    fullName: 'Ananya Iyer',
                    phone: '+91 98412 34567',
                    institutionName: 'Sri Dhanvantari Ayurveda College',
                    department: 'Panchakarma & Clinical Medicine',
                    degree: 'BAMS',
                    currentYear: 4,
                    cgpa: 8.2,
                    graduationYear: 2026,
                    location: 'Chennai, Tamil Nadu',
                    careerInterests: 'Panchakarma, Clinical Ayurveda, Ayurvedic Wellness',
                    preferredRoles: 'Panchakarma Physician, Clinical Resident, Ayurvedic Wellness Consultant',
                    preferredLocations: 'Chennai, Bengaluru, Kochi',
                    bio: 'Fourth-year BAMS student passionate about classical Panchakarma detoxification protocols, pulse-based diagnosis, and therapeutic lifestyle medicine.',
                    educations: {
                        create: {
                            institution: 'Sri Dhanvantari Ayurveda College',
                            degree: 'BAMS (Bachelor of Ayurvedic Medicine and Surgery)',
                            fieldOfStudy: 'Ayurveda & Panchakarma',
                            startYear: 2022,
                            endYear: 2026,
                            grade: '8.2 CGPA',
                            verificationStatus: 'VERIFIED',
                        },
                    },
                    certificates: {
                        create: [
                            {
                                title: 'Certificate in Panchakarma Fundamentals',
                                issuingOrganization: 'National Academy of Panchakarma',
                                issueDate: '2025-08-15',
                                credentialId: 'AYU-DEMO-001',
                                verificationStatus: 'VERIFIED',
                                skillsCovered: 'Panchakarma, Abhyanga, Swedana',
                            },
                            {
                                title: 'Certificate in Nadi Pariksha & Pulse Diagnosis',
                                issuingOrganization: 'Ayush Clinical Diagnostics Board',
                                issueDate: '2025-11-20',
                                credentialId: 'AYU-DEMO-009',
                                verificationStatus: 'PENDING',
                                skillsCovered: 'Nadi Pariksha, Ayurvedic Diagnosis',
                            },
                        ],
                    },
                    projects: {
                        create: {
                            title: 'Clinical Documentation System for Panchakarma',
                            description: 'Standardized digital protocol recording Purvakarma Snehapana dosage titration, vital tracking, and Samyak Snigdha signs.',
                            technologies: 'Panchakarma, Clinical Documentation, Digital Health',
                            projectUrl: 'https://panchakarma-protocols.ayurveda.demo',
                            verificationStatus: 'VERIFIED',
                        },
                    },
                    skillProfiles: {
                        create: [
                            { skillId: skillMap.get('Panchakarma'), proficiencyLevel: 'ADVANCED', scorePercentage: 92, verified: true, verificationStatus: 'VERIFIED' },
                            { skillId: skillMap.get('Abhyanga'), proficiencyLevel: 'ADVANCED', scorePercentage: 90, verified: true, verificationStatus: 'VERIFIED' },
                            { skillId: skillMap.get('Swedana'), proficiencyLevel: 'ADVANCED', scorePercentage: 88, verified: true, verificationStatus: 'VERIFIED' },
                            { skillId: skillMap.get('Nadi Pariksha'), proficiencyLevel: 'INTERMEDIATE', scorePercentage: 82, verified: true, verificationStatus: 'VERIFIED' },
                            { skillId: skillMap.get('Patient Counselling'), proficiencyLevel: 'INTERMEDIATE', scorePercentage: 80, verified: true, verificationStatus: 'VERIFIED' },
                            { skillId: skillMap.get('Clinical Documentation'), proficiencyLevel: 'ADVANCED', scorePercentage: 92, verified: true, verificationStatus: 'VERIFIED' },
                            { skillId: skillMap.get('Ayurvedic Fundamentals'), proficiencyLevel: 'ADVANCED', scorePercentage: 94, verified: true, verificationStatus: 'VERIFIED' },
                            { skillId: skillMap.get('Ayurvedic Diagnosis'), proficiencyLevel: 'INTERMEDIATE', scorePercentage: 82, verified: true, verificationStatus: 'VERIFIED' },
                            { skillId: skillMap.get('Dravyaguna'), proficiencyLevel: 'INTERMEDIATE', scorePercentage: 75, verified: true, verificationStatus: 'VERIFIED' },
                        ],
                    },
                    assessmentAttempts: {
                        create: {
                            assessmentId: clinicalAssessment.id,
                            score: 88,
                            totalScore: 100,
                            percentage: 88,
                            passed: true,
                            startedAt: new Date(Date.now() - 86400000 * 3),
                            completedAt: new Date(Date.now() - 86400000 * 3 + 1500000),
                        },
                    },
                },
            },
        },
        include: { studentProfile: true },
    });
    // Student 2: Arjun Menon (Kayachikitsa & Clinical Research Focus)
    const studentArjun = await db_1.default.user.create({
        data: {
            email: 'arjun.student@demo.ayurveda.com',
            passwordHash,
            role: 'STUDENT',
            studentProfile: {
                create: {
                    fullName: 'Arjun Menon',
                    phone: '+91 97461 23890',
                    institutionName: 'South Indian Institute of Ayurveda',
                    department: 'Kayachikitsa & Research',
                    degree: 'BAMS',
                    currentYear: 5,
                    cgpa: 8.6,
                    graduationYear: 2025,
                    location: 'Kochi, Kerala',
                    careerInterests: 'Kayachikitsa, Clinical Research, Integrative Healthcare',
                    preferredRoles: 'Clinical Research Associate, Resident Physician, Integrative Health Specialist',
                    preferredLocations: 'Kochi, Bengaluru, Thiruvananthapuram',
                    bio: 'Final-year BAMS intern with deep interests in randomized Ayurvedic clinical trials, internal medicine (Kayachikitsa), and evidence-based oncology adjuvant care.',
                    educations: {
                        create: {
                            institution: 'South Indian Institute of Ayurveda',
                            degree: 'BAMS',
                            fieldOfStudy: 'Kayachikitsa & Integrative Medicine',
                            startYear: 2020,
                            endYear: 2025,
                            grade: '8.6 CGPA',
                            verificationStatus: 'VERIFIED',
                        },
                    },
                    certificates: {
                        create: [
                            {
                                title: 'Certificate in Clinical Research Methodology',
                                issuingOrganization: 'Council for Ayurvedic Scientific Research',
                                issueDate: '2025-06-10',
                                credentialId: 'AYU-DEMO-004',
                                verificationStatus: 'VERIFIED',
                                skillsCovered: 'Clinical Research, Research Methodology',
                            },
                        ],
                    },
                    projects: {
                        create: {
                            title: 'Comparative Clinical Study on Madhumeha Glycemic Control',
                            description: 'Observational cohort study analyzing Nishamalaki and Shilajatu adjunct therapies in type-2 diabetes management.',
                            technologies: 'Kayachikitsa, Clinical Research, Data Analysis',
                            verificationStatus: 'VERIFIED',
                        },
                    },
                    skillProfiles: {
                        create: [
                            { skillId: skillMap.get('Kayachikitsa'), proficiencyLevel: 'ADVANCED', scorePercentage: 92, verified: true, verificationStatus: 'VERIFIED' },
                            { skillId: skillMap.get('Ayurvedic Diagnosis'), proficiencyLevel: 'ADVANCED', scorePercentage: 88, verified: true, verificationStatus: 'VERIFIED' },
                            { skillId: skillMap.get('Clinical Research'), proficiencyLevel: 'ADVANCED', scorePercentage: 86, verified: true, verificationStatus: 'VERIFIED' },
                            { skillId: skillMap.get('Research Methodology'), proficiencyLevel: 'ADVANCED', scorePercentage: 85, verified: true, verificationStatus: 'VERIFIED' },
                            { skillId: skillMap.get('Clinical Trials'), proficiencyLevel: 'INTERMEDIATE', scorePercentage: 82, verified: true, verificationStatus: 'VERIFIED' },
                            { skillId: skillMap.get('Biostatistics'), proficiencyLevel: 'INTERMEDIATE', scorePercentage: 78, verified: true, verificationStatus: 'VERIFIED' },
                            { skillId: skillMap.get('Scientific Writing'), proficiencyLevel: 'INTERMEDIATE', scorePercentage: 80, verified: true, verificationStatus: 'VERIFIED' },
                        ],
                    },
                },
            },
        },
        include: { studentProfile: true },
    });
    // Student 3: Meera Krishnan (Dravyaguna & Herbal Medicine Star - 100% Course + Verified Cert)
    const studentMeera = await db_1.default.user.create({
        data: {
            email: 'meera.student@demo.ayurveda.com',
            passwordHash,
            role: 'STUDENT',
            studentProfile: {
                create: {
                    fullName: 'Meera Krishnan',
                    phone: '+91 96541 78901',
                    institutionName: 'Sri Dhanvantari Ayurveda College',
                    department: 'Dravyaguna & Herbal Pharmacology',
                    degree: 'BAMS',
                    currentYear: 3,
                    cgpa: 7.9,
                    graduationYear: 2027,
                    location: 'Chennai, Tamil Nadu',
                    careerInterests: 'Dravyaguna, Herbal Medicine, Medicinal Plants',
                    preferredRoles: 'Herbal Drug Analyst, Dravyaguna Research Assistant, Botanist',
                    preferredLocations: 'Chennai, Kochi, Coimbatore',
                    bio: 'Third-year BAMS scholar specializing in botanical field identification, herbarium preservation, phytochemical screening, and Dravyaguna pharmacology.',
                    educations: {
                        create: {
                            institution: 'Sri Dhanvantari Ayurveda College',
                            degree: 'BAMS',
                            fieldOfStudy: 'Dravyaguna & Pharmacognosy',
                            startYear: 2023,
                            endYear: 2027,
                            grade: '7.9 CGPA',
                            verificationStatus: 'VERIFIED',
                        },
                    },
                    certificates: {
                        create: [
                            {
                                title: 'Certificate in Dravyaguna & Plant Identification',
                                issuingOrganization: 'Botanical Survey & Ayurvedic Pharmacopoeia',
                                issueDate: '2025-07-25',
                                credentialId: 'AYU-DEMO-002',
                                verificationStatus: 'VERIFIED',
                                skillsCovered: 'Dravyaguna, Medicinal Plants, Herbal Identification',
                            },
                            {
                                title: 'Certificate in Herbal Medicine Standardization',
                                issuingOrganization: 'Phytomedicine Quality Forum',
                                issueDate: '2025-10-18',
                                credentialId: 'AYU-DEMO-006',
                                verificationStatus: 'PENDING',
                                skillsCovered: 'Herbal Medicine, Pharmacognosy',
                            },
                        ],
                    },
                    projects: {
                        create: {
                            title: 'Study of Medicinal Plants Used in Traditional Ayurveda',
                            description: 'Taxonomical documentation and morphological authentication of 50 classical Rasayana herbs from the Nilgiri Biosphere.',
                            technologies: 'Dravyaguna, Medicinal Plants, Research Methodology',
                            projectUrl: 'https://nilgiri-herbs.ayurveda.demo',
                            verificationStatus: 'VERIFIED',
                        },
                    },
                    skillProfiles: {
                        create: [
                            { skillId: skillMap.get('Dravyaguna'), proficiencyLevel: 'ADVANCED', scorePercentage: 95, verified: true, verificationStatus: 'VERIFIED' },
                            { skillId: skillMap.get('Medicinal Plants'), proficiencyLevel: 'ADVANCED', scorePercentage: 92, verified: true, verificationStatus: 'VERIFIED' },
                            { skillId: skillMap.get('Herbal Identification'), proficiencyLevel: 'ADVANCED', scorePercentage: 90, verified: true, verificationStatus: 'VERIFIED' },
                            { skillId: skillMap.get('Pharmacognosy'), proficiencyLevel: 'ADVANCED', scorePercentage: 88, verified: true, verificationStatus: 'VERIFIED' },
                            { skillId: skillMap.get('Herbal Medicine'), proficiencyLevel: 'INTERMEDIATE', scorePercentage: 84, verified: true, verificationStatus: 'VERIFIED' },
                            { skillId: skillMap.get('Herbal Formulations'), proficiencyLevel: 'INTERMEDIATE', scorePercentage: 80, verified: true, verificationStatus: 'VERIFIED' },
                            { skillId: skillMap.get('Ayurvedic Fundamentals'), proficiencyLevel: 'ADVANCED', scorePercentage: 90, verified: true, verificationStatus: 'VERIFIED' },
                        ],
                    },
                },
            },
        },
        include: { studentProfile: true },
    });
    // Student 4: Rohan Sharma (Rasashastra & Ayurvedic Pharmacy Focus)
    const studentRohan = await db_1.default.user.create({
        data: {
            email: 'rohan.student@demo.ayurveda.com',
            passwordHash,
            role: 'STUDENT',
            studentProfile: {
                create: {
                    fullName: 'Rohan Sharma',
                    phone: '+91 97891 45678',
                    institutionName: 'South Indian Institute of Ayurveda',
                    department: 'Rasashastra & Bhaishajya Kalpana',
                    degree: 'BAMS',
                    currentYear: 4,
                    cgpa: 7.6,
                    graduationYear: 2026,
                    location: 'Coimbatore, Tamil Nadu',
                    careerInterests: 'Ayurvedic Pharmacy, Rasashastra, Bhaishajya Kalpana, Quality Control',
                    preferredRoles: 'Ayurvedic Pharmacy Production Executive, QC Chemist, Formulation Associate',
                    preferredLocations: 'Coimbatore, Kochi, Chennai',
                    bio: 'Fourth-year student dedicated to classical formulation science, mineral Bhasma preparation, quality standardization, and GMP pharmaceutical controls.',
                    educations: {
                        create: {
                            institution: 'South Indian Institute of Ayurveda',
                            degree: 'BAMS',
                            fieldOfStudy: 'Rasashastra & Ayurvedic Pharmaceutics',
                            startYear: 2022,
                            endYear: 2026,
                            grade: '7.6 CGPA',
                            verificationStatus: 'VERIFIED',
                        },
                    },
                    certificates: {
                        create: [
                            {
                                title: 'Certificate in Ayurvedic Pharmacy & GMP',
                                issuingOrganization: 'Ayush Pharmaceutical Standards Council',
                                issueDate: '2025-05-14',
                                credentialId: 'AYU-DEMO-007',
                                verificationStatus: 'VERIFIED',
                                skillsCovered: 'Rasashastra, Bhaishajya Kalpana, Quality Control',
                            },
                        ],
                    },
                    projects: {
                        create: {
                            title: 'Standardization of a Herbal Wellness Formulation',
                            description: 'Physicochemical evaluation, TLC profiling, and microbial testing of classical Triphala Kwatha formulations.',
                            technologies: 'Dravyaguna, Herbal Medicine, Research Methodology, Quality Control',
                            verificationStatus: 'VERIFIED',
                        },
                    },
                    skillProfiles: {
                        create: [
                            { skillId: skillMap.get('Rasashastra'), proficiencyLevel: 'ADVANCED', scorePercentage: 90, verified: true, verificationStatus: 'VERIFIED' },
                            { skillId: skillMap.get('Bhaishajya Kalpana'), proficiencyLevel: 'ADVANCED', scorePercentage: 88, verified: true, verificationStatus: 'VERIFIED' },
                            { skillId: skillMap.get('Quality Control'), proficiencyLevel: 'INTERMEDIATE', scorePercentage: 80, verified: true, verificationStatus: 'VERIFIED' },
                            { skillId: skillMap.get('GMP'), proficiencyLevel: 'INTERMEDIATE', scorePercentage: 78, verified: true, verificationStatus: 'VERIFIED' },
                            { skillId: skillMap.get('Ayurvedic Formulations'), proficiencyLevel: 'INTERMEDIATE', scorePercentage: 76, verified: true, verificationStatus: 'VERIFIED' },
                        ],
                    },
                },
            },
        },
        include: { studentProfile: true },
    });
    // Student 5: Kavya Nair (Yoga & Swasthavritta Focus)
    const studentKavya = await db_1.default.user.create({
        data: {
            email: 'kavya.student@demo.ayurveda.com',
            passwordHash,
            role: 'STUDENT',
            studentProfile: {
                create: {
                    fullName: 'Kavya Nair',
                    phone: '+91 94471 23456',
                    institutionName: 'Kerala Ayurveda Research Institute',
                    department: 'Swasthavritta & Yoga',
                    degree: 'BAMS',
                    currentYear: 5,
                    cgpa: 8.4,
                    graduationYear: 2025,
                    location: 'Kochi, Kerala',
                    careerInterests: 'Yoga, Lifestyle Medicine, Preventive Healthcare, Ayurvedic Nutrition',
                    preferredRoles: 'Ayurvedic Wellness Consultant, Yoga Physician, Lifestyle Coach',
                    preferredLocations: 'Kochi, Hyderabad, Bengaluru, Chennai',
                    bio: 'Final-year scholar combining therapeutic Yoga, Swasthavritta daily regimens, and Prakriti-specific Ayurvedic dietary therapy for lifestyle disorder prevention.',
                    educations: {
                        create: {
                            institution: 'Kerala Ayurveda Research Institute',
                            degree: 'BAMS',
                            fieldOfStudy: 'Swasthavritta & Yoga Therapy',
                            startYear: 2020,
                            endYear: 2025,
                            grade: '8.4 CGPA',
                            verificationStatus: 'VERIFIED',
                        },
                    },
                    certificates: {
                        create: [
                            {
                                title: 'Certificate in Ayurvedic Nutrition',
                                issuingOrganization: 'Ayush Dietetics & Nutrition Society',
                                issueDate: '2025-09-05',
                                credentialId: 'AYU-DEMO-005',
                                verificationStatus: 'VERIFIED',
                                skillsCovered: 'Ayurvedic Nutrition, Swasthavritta',
                            },
                        ],
                    },
                    projects: {
                        create: {
                            title: 'Clinical Efficacy of Dinacharya Protocol in Metabolic Syndrome',
                            description: 'Prospective trial observing lipid profile and BMI changes in 40 patients following classical Dinacharya and Yoga interventions.',
                            technologies: 'Swasthavritta, Yoga, Clinical Research',
                            verificationStatus: 'VERIFIED',
                        },
                    },
                    skillProfiles: {
                        create: [
                            { skillId: skillMap.get('Yoga'), proficiencyLevel: 'ADVANCED', scorePercentage: 94, verified: true, verificationStatus: 'VERIFIED' },
                            { skillId: skillMap.get('Swasthavritta'), proficiencyLevel: 'ADVANCED', scorePercentage: 92, verified: true, verificationStatus: 'VERIFIED' },
                            { skillId: skillMap.get('Lifestyle Counselling'), proficiencyLevel: 'ADVANCED', scorePercentage: 88, verified: true, verificationStatus: 'VERIFIED' },
                            { skillId: skillMap.get('Ayurvedic Nutrition'), proficiencyLevel: 'ADVANCED', scorePercentage: 86, verified: true, verificationStatus: 'VERIFIED' },
                            { skillId: skillMap.get('Preventive Healthcare'), proficiencyLevel: 'INTERMEDIATE', scorePercentage: 82, verified: true, verificationStatus: 'VERIFIED' },
                        ],
                    },
                },
            },
        },
        include: { studentProfile: true },
    });
    // Student 6: Vishal Reddy (Digital Ayurveda & Health Informatics Focus)
    const studentVishal = await db_1.default.user.create({
        data: {
            email: 'vishal.student@demo.ayurveda.com',
            passwordHash,
            role: 'STUDENT',
            studentProfile: {
                create: {
                    fullName: 'Vishal Reddy',
                    phone: '+91 98841 67890',
                    institutionName: 'Sri Dhanvantari Ayurveda College',
                    department: 'Ayurvedic Healthcare Technology',
                    degree: 'BAMS',
                    currentYear: 4,
                    cgpa: 8.0,
                    graduationYear: 2026,
                    location: 'Chennai, Tamil Nadu',
                    careerInterests: 'Digital Health, Healthcare Analytics, EHR Systems',
                    preferredRoles: 'Ayurvedic Health Informatics Specialist, Clinical Data Associate',
                    preferredLocations: 'Bengaluru, Hyderabad, Chennai',
                    bio: 'Tech-enthusiast BAMS student combining clinical Ayurvedic medicine with sensor-based diagnostics, Namaste portal coding, and electronic healthcare record management.',
                    educations: {
                        create: {
                            institution: 'Sri Dhanvantari Ayurveda College',
                            degree: 'BAMS',
                            fieldOfStudy: 'Ayurvedic Medicine & Health Informatics',
                            startYear: 2022,
                            endYear: 2026,
                            grade: '8.0 CGPA',
                            verificationStatus: 'VERIFIED',
                        },
                    },
                    certificates: {
                        create: [
                            {
                                title: 'Certificate in Digital Health & Ayush Informatics',
                                issuingOrganization: 'National Ayush Digital Mission',
                                issueDate: '2025-12-01',
                                credentialId: 'AYU-DEMO-008',
                                verificationStatus: 'VERIFIED',
                                skillsCovered: 'Digital Health, Electronic Health Records',
                            },
                        ],
                    },
                    projects: {
                        create: {
                            title: 'Mobile Pulse Waveform Analysis for Nadi Pariksha',
                            description: 'Prototype optical sensor algorithm mapping radial pulse arterial pressure waves to classical Vata-Pitta-Kapha gati.',
                            technologies: 'Digital Health, Nadi Pariksha, Data Analysis',
                            verificationStatus: 'VERIFIED',
                        },
                    },
                    skillProfiles: {
                        create: [
                            { skillId: skillMap.get('Digital Health'), proficiencyLevel: 'ADVANCED', scorePercentage: 90, verified: true, verificationStatus: 'VERIFIED' },
                            { skillId: skillMap.get('Electronic Health Records'), proficiencyLevel: 'ADVANCED', scorePercentage: 88, verified: true, verificationStatus: 'VERIFIED' },
                            { skillId: skillMap.get('Healthcare Data Management'), proficiencyLevel: 'ADVANCED', scorePercentage: 85, verified: true, verificationStatus: 'VERIFIED' },
                            { skillId: skillMap.get('Clinical Documentation'), proficiencyLevel: 'INTERMEDIATE', scorePercentage: 82, verified: true, verificationStatus: 'VERIFIED' },
                            { skillId: skillMap.get('Healthcare Analytics'), proficiencyLevel: 'INTERMEDIATE', scorePercentage: 78, verified: true, verificationStatus: 'VERIFIED' },
                        ],
                    },
                },
            },
        },
        include: { studentProfile: true },
    });
    // ---------------------------------------------------------
    // 7. Ayurveda Skill Development Hub (12 Published Courses)
    // ---------------------------------------------------------
    console.log('7. Seeding 12 Realistic Ayurveda Courses with Modules & Lesson Syllabi...');
    // Course 1: Foundations of Ayurveda
    const course1 = await db_1.default.course.create({
        data: {
            title: 'Foundations of Ayurveda',
            description: 'Comprehensive introduction to classical Ayurvedic cosmology, Tridosha physiology, Panchamahabhuta dynamics, and Prakriti constitutional analysis.',
            providerId: dhanvantariInst.id,
            providerRole: 'INSTITUTION',
            providerName: 'Sri Dhanvantari Ayurveda College',
            category: 'Ayurveda Fundamentals',
            skillLevel: 'BEGINNER',
            duration: '6 Weeks',
            mode: 'ONLINE',
            prerequisites: 'Basic knowledge of human biology and high school science.',
            learningOutcomes: 'Understand doshic balance, determine individual Prakriti, analyze basic Vikriti deviations, and apply fundamental Ayurvedic wellness principles.',
            certificateAvailable: true,
            status: 'PUBLISHED',
            skills: {
                create: [
                    { skillId: skillMap.get('Ayurvedic Fundamentals') },
                    { skillId: skillMap.get('Tridosha Theory') },
                    { skillId: skillMap.get('Prakriti Assessment') },
                ],
            },
            modules: {
                create: [
                    {
                        title: 'Module 1: Cosmic Principles & Panchamahabhuta',
                        orderIndex: 1,
                        lessons: {
                            create: [
                                { title: 'Padartha Vijnana & Five Element Philosophy', durationMinutes: 45, orderIndex: 1, content: 'Detailed analysis of Akasha, Vayu, Agni, Jala, and Prithvi interactions.' },
                                { title: 'Tridosha Genesis and Biological Attributes (Gunas)', durationMinutes: 50, orderIndex: 2, content: 'Physical, psychological, and seasonal fluctuations of Vata, Pitta, and Kapha.' },
                            ],
                        },
                    },
                    {
                        title: 'Module 2: Constitutional Prakriti Examination',
                        orderIndex: 2,
                        lessons: {
                            create: [
                                { title: 'Physical & Psychological Traits of Doshic Types', durationMinutes: 55, orderIndex: 3, content: 'Structured methodology for questionnaire and clinical phenotype assessment.' },
                                { title: 'Vikriti: Recognizing Early Pathological Imbalance', durationMinutes: 45, orderIndex: 4, content: 'Distinguishing baseline constitutional Prakriti from acute dosha aggravation.' },
                            ],
                        },
                    },
                ],
            },
        },
        include: { modules: { include: { lessons: true } } },
    });
    // Course 2: Clinical Ayurveda and Ayurvedic Diagnosis
    const course2 = await db_1.default.course.create({
        data: {
            title: 'Clinical Ayurveda and Ayurvedic Diagnosis',
            description: 'Advanced diagnostic masterclass covering Ashtavidha Pariksha, Nadi Pariksha pulse examination, Roga-Rogi Pareeksha, and Kayachikitsa internal medicine protocols.',
            providerId: acadAnanya.id,
            providerRole: 'ACADEMICIAN',
            providerName: 'Dr. Ananya Krishnan',
            category: 'Clinical Ayurveda',
            skillLevel: 'INTERMEDIATE',
            duration: '8 Weeks',
            mode: 'HYBRID',
            prerequisites: 'Foundational Ayurvedic physiology and anatomy coursework.',
            learningOutcomes: 'Perform Ashtavidha clinical diagnostics, interpret subtle pulse signals, conduct patient interviews, and formulate evidence-backed Kayachikitsa plans.',
            certificateAvailable: true,
            status: 'PUBLISHED',
            skills: {
                create: [
                    { skillId: skillMap.get('Kayachikitsa') },
                    { skillId: skillMap.get('Ayurvedic Diagnosis') },
                    { skillId: skillMap.get('Nadi Pariksha') },
                ],
            },
            modules: {
                create: [
                    {
                        title: 'Module 1: Classical Diagnostic Framework (Pariksha Vijnana)',
                        orderIndex: 1,
                        lessons: {
                            create: [
                                { title: 'Ashtavidha Pariksha: Diagnostic Protocol', durationMinutes: 50, orderIndex: 1, content: 'Detailed examination of Nadi, Mutra, Mala, Jihwa, Shabda, Sparsha, Drik, and Akriti.' },
                                { title: 'Samprapti Ghataka: Deconstructing Pathogenesis', durationMinutes: 45, orderIndex: 2, content: 'Mapping Dosha, Dushya, Srotas, and Agni in disease manifestation.' },
                            ],
                        },
                    },
                    {
                        title: 'Module 2: Practical Nadi Pariksha & Pulse Diagnostics',
                        orderIndex: 2,
                        lessons: {
                            create: [
                                { title: 'Finger Placement, Pressure Levels & Gati Identification', durationMinutes: 60, orderIndex: 3, content: 'Sarpa, Manduka, Hamsa, and mixed pulse waveforms in clinical practice.' },
                                { title: 'Kayachikitsa Prescription Architecture & Monitoring', durationMinutes: 55, orderIndex: 4, content: 'Selecting Shamana formulations and managing acute systemic conditions.' },
                            ],
                        },
                    },
                ],
            },
        },
        include: { modules: { include: { lessons: true } } },
    });
    // Course 3: Panchakarma Therapy and Clinical Practice
    const course3 = await db_1.default.course.create({
        data: {
            title: 'Panchakarma Therapy and Clinical Practice',
            description: 'Hands-on clinical training in classical detoxification therapies, pre-procedures (Abhyanga & Swedana), Vamana, Virechana, Basti administration, and post-cleansing Samsarjana Krama.',
            providerId: indDhanvantari.id,
            providerRole: 'INDUSTRY',
            providerName: 'Dhanvantari Wellness Pvt Ltd',
            category: 'Panchakarma',
            skillLevel: 'ADVANCED',
            duration: '10 Weeks',
            mode: 'OFFLINE',
            prerequisites: 'BAMS undergraduate student or qualified Ayurvedic physician.',
            learningOutcomes: 'Master clinical execution of Abhyanga, Swedana, and Basti therapies, evaluate Snehana endpoints, and manage panchakarma complications safely.',
            certificateAvailable: true,
            status: 'PUBLISHED',
            skills: {
                create: [
                    { skillId: skillMap.get('Panchakarma') },
                    { skillId: skillMap.get('Abhyanga') },
                    { skillId: skillMap.get('Swedana') },
                ],
            },
            modules: {
                create: [
                    {
                        title: 'Module 1: Snehana, Swedana & Pre-Cleansing Regimens',
                        orderIndex: 1,
                        lessons: {
                            create: [
                                { title: 'Therapeutic Synchronized Abhyanga & Marma Stimulation', durationMinutes: 60, orderIndex: 1, content: 'Techniques, medicated oil selection, pressure gradients, and anatomical pathways.' },
                                { title: 'Bashpa, Nadi & Patra Pinda Swedana Operations', durationMinutes: 55, orderIndex: 2, content: 'Thermal therapies, bolus preparations, temperature monitoring, and safety.' },
                            ],
                        },
                    },
                    {
                        title: 'Module 2: Pradhana Karma (Basti, Vamana, Virechana) & Dietetics',
                        orderIndex: 2,
                        lessons: {
                            create: [
                                { title: 'Basti Preparation, Catheterization & Post-Care', durationMinutes: 65, orderIndex: 3, content: 'Compounding Niruha and Anuvasana emulsions and managing retention times.' },
                                { title: 'Samsarjana Krama & Patient Re-nourishment Protocols', durationMinutes: 50, orderIndex: 4, content: 'Graded Peya-Vilepi dietary re-introduction to reignite Jatharagni.' },
                            ],
                        },
                    },
                ],
            },
        },
        include: { modules: { include: { lessons: true } } },
    });
    // Course 4: Dravyaguna and Medicinal Plant Identification
    const course4 = await db_1.default.course.create({
        data: {
            title: 'Dravyaguna and Medicinal Plant Identification',
            description: 'Field botany, pharmacognostic authentication, taxonomy of classical Western Ghats flora, and Ayurvedic pharmacology (Rasa-Guna-Virya-Vipaka).',
            providerId: acadRavi.id,
            providerRole: 'ACADEMICIAN',
            providerName: 'Dr. Ravi Narayanan',
            category: 'Dravyaguna',
            skillLevel: 'INTERMEDIATE',
            duration: '6 Weeks',
            mode: 'HYBRID',
            certificateAvailable: true,
            status: 'PUBLISHED',
            skills: {
                create: [
                    { skillId: skillMap.get('Dravyaguna') },
                    { skillId: skillMap.get('Medicinal Plants') },
                    { skillId: skillMap.get('Herbal Identification') },
                ],
            },
            modules: {
                create: [
                    {
                        title: 'Module 1: Botanical Identification & Taxonomy',
                        orderIndex: 1,
                        lessons: {
                            create: [
                                { title: 'Morphological & Macroscopic Crude Herb Authentication', durationMinutes: 50, orderIndex: 1, content: 'Distinguishing genuine medicinal species from common adulterants.' },
                                { title: 'Ethnobotany & Sustainable Wildcrafting Guidelines', durationMinutes: 45, orderIndex: 2, content: 'Seasonal gathering times (Ritu Samgrahana) for maximum phytoconstituent potency.' },
                            ],
                        },
                    },
                    {
                        title: 'Module 2: Dravyaguna Pharmacological Matrix',
                        orderIndex: 2,
                        lessons: {
                            create: [
                                { title: 'Rasa, Guna, Virya, Vipaka, and Prabhava Actions', durationMinutes: 55, orderIndex: 3, content: 'Predicting clinical drug action through classical Ayurvedic energetics.' },
                                { title: 'Major Botanical Families in Ayurvedic Formulations', durationMinutes: 50, orderIndex: 4, content: 'In-depth study of Zingiberaceae, Fabaceae, Solanaceae, and Asteraceae herbs.' },
                            ],
                        },
                    },
                ],
            },
        },
        include: { modules: { include: { lessons: true } } },
    });
    // Course 5: Herbal Medicine and Formulation Development
    const course5 = await db_1.default.course.create({
        data: {
            title: 'Herbal Medicine and Formulation Development',
            description: 'Industrial manufacturing of standardized phytomedicines, decoction extractions, hydro-alcoholic extracts, and quality testing.',
            providerId: indKeralaHerbal.id,
            providerRole: 'INDUSTRY',
            providerName: 'Kerala Herbal Sciences',
            category: 'Dravyaguna',
            skillLevel: 'INTERMEDIATE',
            duration: '8 Weeks',
            mode: 'ONLINE',
            certificateAvailable: true,
            status: 'PUBLISHED',
            skills: {
                create: [
                    { skillId: skillMap.get('Herbal Medicine') },
                    { skillId: skillMap.get('Herbal Formulations') },
                    { skillId: skillMap.get('Pharmacognosy') },
                ],
            },
            modules: {
                create: {
                    title: 'Module 1: Extraction Technologies & Formulation Standardization',
                    orderIndex: 1,
                    lessons: {
                        create: [
                            { title: 'Supercritical CO2 and Hydro-alcoholic Extraction Methods', durationMinutes: 50, orderIndex: 1, content: 'Maximizing bio-active marker retention during commercial processing.' },
                            { title: 'TLC / HPTLC Fingerprinting for Polyherbal Synergies', durationMinutes: 55, orderIndex: 2, content: 'Quality markers, retention factors, and standardization benchmarks.' },
                        ],
                    },
                },
            },
        },
    });
    // Course 6: Rasashastra and Bhaishajya Kalpana
    const course6 = await db_1.default.course.create({
        data: {
            title: 'Rasashastra and Bhaishajya Kalpana',
            description: 'Mastery over pharmaceutical mineral processing (Sodhana, Marana), Bhasma synthesis, Asava-Arishta fermentation, and Medicated Ghritas.',
            providerId: acadMeenakshi.id,
            providerRole: 'ACADEMICIAN',
            providerName: 'Dr. Meenakshi Menon',
            category: 'Ayurvedic Pharmacy',
            skillLevel: 'ADVANCED',
            duration: '12 Weeks',
            mode: 'HYBRID',
            certificateAvailable: true,
            status: 'PUBLISHED',
            skills: {
                create: [
                    { skillId: skillMap.get('Rasashastra') },
                    { skillId: skillMap.get('Bhaishajya Kalpana') },
                    { skillId: skillMap.get('Ayurvedic Formulations') },
                ],
            },
            modules: {
                create: {
                    title: 'Module 1: Mineral Sodhana, Marana & Bhasma Characterization',
                    orderIndex: 1,
                    lessons: {
                        create: [
                            { title: 'Parada Samskaras and Mineral Detoxification', durationMinutes: 60, orderIndex: 1, content: 'Classical purificatory procedures using herbal decoctions and sour media.' },
                            { title: 'Bhasma Pariksha: Classical & Modern Nanoparticle Assays', durationMinutes: 65, orderIndex: 2, content: 'Varitaratwa, Rekhapurnatwa, XRD, SEM, and TEM nanoparticle analysis.' },
                        ],
                    },
                },
            },
        },
    });
    // Course 7: Ayurvedic Pharmacy and Quality Control
    const course7 = await db_1.default.course.create({
        data: {
            title: 'Ayurvedic Pharmacy and Quality Control',
            description: 'Industrial pharmaceutical operations, heavy metal limits, microbiological assaying, shelf-life stability, and Schedule T GMP compliance.',
            providerId: indKeralaHerbal.id,
            providerRole: 'INDUSTRY',
            providerName: 'Kerala Herbal Sciences',
            category: 'Ayurvedic Pharmacy',
            skillLevel: 'ADVANCED',
            duration: '8 Weeks',
            mode: 'HYBRID',
            certificateAvailable: true,
            status: 'PUBLISHED',
            skills: {
                create: [
                    { skillId: skillMap.get('Ayurvedic Formulations') },
                    { skillId: skillMap.get('Quality Control') },
                    { skillId: skillMap.get('GMP') },
                ],
            },
            modules: {
                create: {
                    title: 'Module 1: GMP Guidelines & Analytical Quality Assurance',
                    orderIndex: 1,
                    lessons: {
                        create: [
                            { title: 'Schedule T Requirements for Ayurvedic Manufacturing', durationMinutes: 50, orderIndex: 1, content: 'Plant layout, HVAC air handling, hygiene barriers, and documentation.' },
                            { title: 'Heavy Metal, Aflatoxin & Microbial Limit Testing', durationMinutes: 55, orderIndex: 2, content: 'ICP-MS and AAS analysis ensuring export compliance and safety.' },
                        ],
                    },
                },
            },
        },
    });
    // Course 8: Clinical Research in Ayurveda
    const course8 = await db_1.default.course.create({
        data: {
            title: 'Clinical Research in Ayurveda',
            description: 'Designing Good Clinical Practice (GCP) compliant clinical trials for Ayurvedic formulations, CTRI registration, and patient consent ethics.',
            providerId: indAyurvedaLife.id,
            providerRole: 'INDUSTRY',
            providerName: 'Ayurveda Life Sciences',
            category: 'Research',
            skillLevel: 'INTERMEDIATE',
            duration: '10 Weeks',
            mode: 'ONLINE',
            certificateAvailable: true,
            status: 'PUBLISHED',
            skills: {
                create: [
                    { skillId: skillMap.get('Clinical Research') },
                    { skillId: skillMap.get('Clinical Trials') },
                    { skillId: skillMap.get('Research Methodology') },
                ],
            },
            modules: {
                create: [
                    {
                        title: 'Module 1: Study Protocols & GCP Guidelines',
                        orderIndex: 1,
                        lessons: {
                            create: [
                                { title: 'Designing Randomized Double-Blind Ayurvedic Trials', durationMinutes: 50, orderIndex: 1, content: 'Placebo selection, blinding herbs, and primary endpoint definitions.' },
                                { title: 'Ethical Clearances, CTRI Registration & Consent Forms', durationMinutes: 45, orderIndex: 2, content: 'IEC submissions, patient safety, and regulatory paperwork.' },
                            ],
                        },
                    },
                    {
                        title: 'Module 2: Clinical Trial Execution & Data Monitoring',
                        orderIndex: 2,
                        lessons: {
                            create: [
                                { title: 'Case Report Form (CRF) Design & Patient Tracking', durationMinutes: 50, orderIndex: 3, content: 'Standardizing subjective dosha changes and objective biomarker labs.' },
                                { title: 'Adverse Event Reporting & Pharmacovigilance for Ayush', durationMinutes: 45, orderIndex: 4, content: 'Monitoring drug-herb interactions and signal detection.' },
                                { title: 'Clinical Trial Data Lock & Audit Preparation', durationMinutes: 40, orderIndex: 5, content: 'Ensuring audit-ready data integrity and GCP compliance.' },
                            ],
                        },
                    },
                ],
            },
        },
        include: { modules: { include: { lessons: true } } },
    });
    // Course 9: Biostatistics for Ayurvedic Research
    const course9 = await db_1.default.course.create({
        data: {
            title: 'Biostatistics for Ayurvedic Research',
            description: 'Applied statistical analysis for Ayurvedic clinical datasets: parametric/non-parametric tests, sample size estimation, and SPSS/R software tools.',
            providerId: kariInst.id,
            providerRole: 'INSTITUTION',
            providerName: 'Kerala Ayurveda Research Institute',
            category: 'Research',
            skillLevel: 'INTERMEDIATE',
            duration: '6 Weeks',
            mode: 'ONLINE',
            certificateAvailable: true,
            status: 'PUBLISHED',
            skills: {
                create: [
                    { skillId: skillMap.get('Biostatistics') },
                    { skillId: skillMap.get('Data Analysis') },
                    { skillId: skillMap.get('Research Methodology') },
                ],
            },
            modules: {
                create: {
                    title: 'Module 1: Hypothesis Testing & Medical Statistics',
                    orderIndex: 1,
                    lessons: {
                        create: [
                            { title: 'Sample Size Calculation & Statistical Power in Clinical Trials', durationMinutes: 45, orderIndex: 1, content: 'Confidence intervals, alpha levels, and effect size projections.' },
                            { title: 'Chi-Square, T-Tests, ANOVA, and Wilcoxon Rank Tests', durationMinutes: 50, orderIndex: 2, content: 'Selecting appropriate statistical tests for categorical and continuous Ayush data.' },
                        ],
                    },
                },
            },
        },
    });
    // Course 10: Ayurveda, Yoga and Lifestyle Medicine
    const course10 = await db_1.default.course.create({
        data: {
            title: 'Ayurveda, Yoga and Lifestyle Medicine',
            description: 'Integration of therapeutic Yoga, Swasthavritta circadian regimens, Dinacharya, Ritucharya, and individualized Ayurvedic nutritional coaching.',
            providerId: indPranaWellness.id,
            providerRole: 'INDUSTRY',
            providerName: 'Prana Ayurveda Wellness',
            category: 'Wellness & Lifestyle',
            skillLevel: 'BEGINNER',
            duration: '6 Weeks',
            mode: 'ONLINE',
            certificateAvailable: true,
            status: 'PUBLISHED',
            skills: {
                create: [
                    { skillId: skillMap.get('Yoga') },
                    { skillId: skillMap.get('Lifestyle Counselling') },
                    { skillId: skillMap.get('Ayurvedic Nutrition') },
                ],
            },
            modules: {
                create: {
                    title: 'Module 1: Circadian Living & Therapeutic Nutrition',
                    orderIndex: 1,
                    lessons: {
                        create: [
                            { title: 'Dinacharya: Daily Regimens for Doshic Balance', durationMinutes: 40, orderIndex: 1, content: 'Brahma Muhurta waking, tongue scraping, Kavala-Gandusha, and Abhyanga.' },
                            { title: 'Ahara Vidhi: Food Combining & Gut Microbiome Equilibrium', durationMinutes: 45, orderIndex: 2, content: 'Preventing Viruddhahara and prescribing customized diets by Prakriti.' },
                        ],
                    },
                },
            },
        },
    });
    // Course 11: Digital Health for Ayurveda Professionals
    const course11 = await db_1.default.course.create({
        data: {
            title: 'Digital Health for Ayurveda Professionals',
            description: 'Ayush National Electronic Health Records, Namaste Portal integration, telemedicine clinical etiquette, and medical data security.',
            providerId: indAyurvedaLife.id,
            providerRole: 'INDUSTRY',
            providerName: 'Ayurveda Life Sciences',
            category: 'Digital Ayurveda',
            skillLevel: 'INTERMEDIATE',
            duration: '5 Weeks',
            mode: 'ONLINE',
            certificateAvailable: true,
            status: 'PUBLISHED',
            skills: {
                create: [
                    { skillId: skillMap.get('Digital Health') },
                    { skillId: skillMap.get('Healthcare Data Management') },
                    { skillId: skillMap.get('Electronic Health Records') },
                ],
            },
            modules: {
                create: {
                    title: 'Module 1: Health Informatics & Standardized Medical Records',
                    orderIndex: 1,
                    lessons: {
                        create: [
                            { title: 'Ayush Grid & NAMASTE Terminology Coding', durationMinutes: 45, orderIndex: 1, content: 'Standardizing Ayurvedic disease diagnoses for national electronic health data.' },
                            { title: 'Tele-Health Platforms & Digital Consultation Workflows', durationMinutes: 40, orderIndex: 2, content: 'Consent capturing, remote pulse analysis caveats, and digital prescription safety.' },
                        ],
                    },
                },
            },
        },
    });
    // Course 12: Scientific Writing and Research Publication in Ayurveda
    const course12 = await db_1.default.course.create({
        data: {
            title: 'Scientific Writing and Research Publication in Ayurveda',
            description: 'Manuscript structure, CARE guidelines for Ayurvedic case reports, CONSORT extensions for herbal trials, and navigating indexed peer review.',
            providerId: kariInst.id,
            providerRole: 'INSTITUTION',
            providerName: 'Kerala Ayurveda Research Institute',
            category: 'Research',
            skillLevel: 'INTERMEDIATE',
            duration: '4 Weeks',
            mode: 'ONLINE',
            certificateAvailable: true,
            status: 'PUBLISHED',
            skills: {
                create: [
                    { skillId: skillMap.get('Scientific Writing') },
                    { skillId: skillMap.get('Research Methodology') },
                    { skillId: skillMap.get('Clinical Research') },
                ],
            },
            modules: {
                create: {
                    title: 'Module 1: Writing High-Impact Peer Reviewed Papers',
                    orderIndex: 1,
                    lessons: {
                        create: [
                            { title: 'Structuring Ayurvedic Case Reports Following CARE Standards', durationMinutes: 45, orderIndex: 1, content: 'Presenting Ayurvedic clinical history, interventions, and timelines for medical journals.' },
                            { title: 'Responding to Peer Review & Overcoming Publication Bias', durationMinutes: 40, orderIndex: 2, content: 'Navigating Scopus/PubMed indexed editorial queries with evidence.' },
                        ],
                    },
                },
            },
        },
    });
    // ---------------------------------------------------------
    // 8. Course Enrollments, Dynamic Progress & Verified Certificates
    // ---------------------------------------------------------
    console.log('8. Seeding Dynamic Student Enrollments, Lesson Progress & Issued Certificates...');
    // Ananya Iyer -> Enrolled in Course 3 (Panchakarma Therapy) -> 3 of 4 lessons completed (75%)
    const c3Lessons = course3.modules.flatMap((m) => m.lessons);
    const ananyaEnrollment = await db_1.default.courseEnrollment.create({
        data: {
            studentId: studentAnanya.studentProfile.id,
            courseId: course3.id,
            progressPercentage: 75.0,
            status: 'IN_PROGRESS',
            enrolledAt: new Date(Date.now() - 86400000 * 20),
            lessonProgress: {
                create: [
                    { lessonId: c3Lessons[0].id, isCompleted: true, completedAt: new Date(Date.now() - 86400000 * 15) },
                    { lessonId: c3Lessons[1].id, isCompleted: true, completedAt: new Date(Date.now() - 86400000 * 10) },
                    { lessonId: c3Lessons[2].id, isCompleted: true, completedAt: new Date(Date.now() - 86400000 * 3) },
                    { lessonId: c3Lessons[3].id, isCompleted: false },
                ],
            },
        },
    });
    // Ananya Iyer -> Also enrolled in Course 2 (Clinical Ayurveda) -> 40% (2 of 5 lessons completed)
    const c2Lessons = course2.modules.flatMap((m) => m.lessons);
    await db_1.default.courseEnrollment.create({
        data: {
            studentId: studentAnanya.studentProfile.id,
            courseId: course2.id,
            progressPercentage: 50.0,
            status: 'IN_PROGRESS',
            enrolledAt: new Date(Date.now() - 86400000 * 25),
            lessonProgress: {
                create: [
                    { lessonId: c2Lessons[0].id, isCompleted: true, completedAt: new Date(Date.now() - 86400000 * 18) },
                    { lessonId: c2Lessons[1].id, isCompleted: true, completedAt: new Date(Date.now() - 86400000 * 12) },
                    { lessonId: c2Lessons[2].id, isCompleted: false },
                    { lessonId: c2Lessons[3].id, isCompleted: false },
                ],
            },
        },
    });
    // Arjun Menon -> Enrolled in Course 8 (Clinical Research in Ayurveda) -> 80% (4 of 5 lessons completed)
    const c8Lessons = course8.modules.flatMap((m) => m.lessons);
    await db_1.default.courseEnrollment.create({
        data: {
            studentId: studentArjun.studentProfile.id,
            courseId: course8.id,
            progressPercentage: 80.0,
            status: 'IN_PROGRESS',
            enrolledAt: new Date(Date.now() - 86400000 * 18),
            lessonProgress: {
                create: [
                    { lessonId: c8Lessons[0].id, isCompleted: true, completedAt: new Date(Date.now() - 86400000 * 14) },
                    { lessonId: c8Lessons[1].id, isCompleted: true, completedAt: new Date(Date.now() - 86400000 * 10) },
                    { lessonId: c8Lessons[2].id, isCompleted: true, completedAt: new Date(Date.now() - 86400000 * 6) },
                    { lessonId: c8Lessons[3].id, isCompleted: true, completedAt: new Date(Date.now() - 86400000 * 2) },
                    { lessonId: c8Lessons[4].id, isCompleted: false },
                ],
            },
        },
    });
    // Meera Krishnan -> Enrolled in Course 4 (Dravyaguna) -> 100% (4 of 4 completed) + Verified Certificate
    const c4Lessons = course4.modules.flatMap((m) => m.lessons);
    const meeraEnrollment = await db_1.default.courseEnrollment.create({
        data: {
            studentId: studentMeera.studentProfile.id,
            courseId: course4.id,
            progressPercentage: 100.0,
            status: 'COMPLETED',
            completedAt: new Date(Date.now() - 86400000 * 5),
            certificateStatus: 'ISSUED',
            enrolledAt: new Date(Date.now() - 86400000 * 30),
            lessonProgress: {
                create: c4Lessons.map((l) => ({
                    lessonId: l.id,
                    isCompleted: true,
                    completedAt: new Date(Date.now() - 86400000 * 6),
                })),
            },
        },
    });
    await db_1.default.courseCertificate.create({
        data: {
            enrollmentId: meeraEnrollment.id,
            studentId: studentMeera.studentProfile.id,
            courseId: course4.id,
            certificateCode: 'AYU-CERT-DRAVYA-2026-MEERA',
            studentName: 'Meera Krishnan',
            courseTitle: 'Dravyaguna and Medicinal Plant Identification',
            providerName: 'Dr. Ravi Narayanan',
            issueDate: new Date(Date.now() - 86400000 * 5),
            verificationStatus: 'VERIFIED',
            verifiedById: acadRavi.id,
            verifiedAt: new Date(Date.now() - 86400000 * 4),
            remarks: 'Demonstrated exceptional competence in Western Ghats medicinal botanical identification and Dravyaguna pharmacology.',
        },
    });
    // Rohan Sharma -> Enrolled in Course 7 (Ayurvedic Pharmacy) -> 60%
    await db_1.default.courseEnrollment.create({
        data: {
            studentId: studentRohan.studentProfile.id,
            courseId: course7.id,
            progressPercentage: 60.0,
            status: 'IN_PROGRESS',
            enrolledAt: new Date(Date.now() - 86400000 * 15),
        },
    });
    // Kavya Nair -> Enrolled in Course 10 (Ayurveda & Yoga) -> 90%
    await db_1.default.courseEnrollment.create({
        data: {
            studentId: studentKavya.studentProfile.id,
            courseId: course10.id,
            progressPercentage: 90.0,
            status: 'IN_PROGRESS',
            enrolledAt: new Date(Date.now() - 86400000 * 22),
        },
    });
    // Vishal Reddy -> Enrolled in Course 11 (Digital Health) -> 60%
    await db_1.default.courseEnrollment.create({
        data: {
            studentId: studentVishal.studentProfile.id,
            courseId: course11.id,
            progressPercentage: 60.0,
            status: 'IN_PROGRESS',
            enrolledAt: new Date(Date.now() - 86400000 * 12),
        },
    });
    // ---------------------------------------------------------
    // 9. Ayurveda Internships (10 Opportunities)
    // ---------------------------------------------------------
    console.log('9. Seeding 10 Ayurveda Internship Postings...');
    // Internship 1: Panchakarma Therapy Intern (Dhanvantari Wellness)
    // Required: Panchakarma (Intermediate), Abhyanga (Beginner), Swedana (Beginner) | Degree: BAMS | CGPA: 7.0+
    // -> Ananya is fully ELIGIBLE (has Panchakarma Int, Abhyanga & Swedana via cert/course, CGPA 8.2 >= 7.0, BAMS)
    const opp1 = await db_1.default.opportunity.create({
        data: {
            industryId: indDhanvantari.industryProfile.id,
            title: 'Panchakarma Therapy Intern',
            type: 'INTERNSHIP',
            description: 'Join our flagship clinical hospital in Chennai to assist senior Vaidyas in administering classical Purvakarma, Abhyanga, and specialized Panchakarma detox therapies.',
            degree: 'BAMS',
            department: 'Panchakarma & Clinical Medicine',
            minCgpa: 7.0,
            experience: 'Final Year BAMS Student / Intern',
            location: 'Chennai, Tamil Nadu',
            workMode: 'ON_SITE',
            stipendOrSalary: 'INR 20,000 / month',
            duration: '3 Months',
            startDate: '2026-05-01',
            numberOfOpenings: 4,
            responsibilities: 'Assist in patient pre-procedure assessment, administer therapeutic Abhyanga & Swedana, monitor Snehapana vitals, and maintain clinical case documentation.',
            selectionProcess: 'Profile Screening -> Clinical Scenario Round -> Practical Vitals Assessment Interview',
            isPublished: true,
            applicationDeadline: new Date(Date.now() + 86400000 * 45),
            skills: {
                create: [
                    { skillId: skillMap.get('Panchakarma'), isRequired: true, minProficiency: 'INTERMEDIATE' },
                    { skillId: skillMap.get('Abhyanga'), isRequired: true, minProficiency: 'BEGINNER' },
                    { skillId: skillMap.get('Swedana'), isRequired: true, minProficiency: 'BEGINNER' },
                    { skillId: skillMap.get('Patient Counselling'), isRequired: false, minProficiency: 'BEGINNER' },
                ],
            },
        },
    });
    // Internship 2: Ayurvedic Clinical Research Intern (Ayurveda Life Sciences)
    // Required: Clinical Research (Intermediate), Research Methodology (Intermediate), Scientific Writing (Beginner) | CGPA: 7.5+
    // -> Arjun Menon is fully ELIGIBLE (has Clinical Research Int, Research Methodology Int, CGPA 8.6 >= 7.5)
    const opp2 = await db_1.default.opportunity.create({
        data: {
            industryId: indAyurvedaLife.industryProfile.id,
            title: 'Ayurvedic Clinical Research Intern',
            type: 'INTERNSHIP',
            description: 'Assist clinical research coordinators in managing GCP-compliant randomized clinical trials on Ayurvedic formulations for metabolic disorders.',
            degree: 'BAMS',
            minCgpa: 7.5,
            experience: 'Final Year BAMS / PG Scholar',
            location: 'Bengaluru, Karnataka',
            workMode: 'HYBRID',
            stipendOrSalary: 'INR 22,000 / month',
            duration: '6 Months',
            numberOfOpenings: 3,
            isPublished: true,
            applicationDeadline: new Date(Date.now() + 86400000 * 30),
            skills: {
                create: [
                    { skillId: skillMap.get('Clinical Research'), isRequired: true, minProficiency: 'INTERMEDIATE' },
                    { skillId: skillMap.get('Research Methodology'), isRequired: true, minProficiency: 'INTERMEDIATE' },
                    { skillId: skillMap.get('Scientific Writing'), isRequired: true, minProficiency: 'BEGINNER' },
                ],
            },
        },
    });
    // Internship 3: Herbal Medicine Research Intern (Kerala Herbal Sciences)
    // Required: Dravyaguna (Advanced), Medicinal Plants (Intermediate), Herbal Medicine (Intermediate)
    // -> Meera Krishnan is fully ELIGIBLE (Dravyaguna Adv, Medicinal Plants Int, CGPA 7.9)
    const opp3 = await db_1.default.opportunity.create({
        data: {
            industryId: indKeralaHerbal.industryProfile.id,
            title: 'Herbal Medicine Research Intern',
            type: 'INTERNSHIP',
            description: 'Conduct laboratory authentication, phytochemical extraction profiling, and standardization assays on tropical medicinal herbs.',
            degree: 'BAMS',
            department: 'Dravyaguna & Herbal Pharmacology',
            minCgpa: 7.5,
            location: 'Kochi, Kerala',
            workMode: 'ON_SITE',
            stipendOrSalary: 'INR 20,000 / month',
            duration: '6 Months',
            numberOfOpenings: 2,
            isPublished: true,
            applicationDeadline: new Date(Date.now() + 86400000 * 40),
            skills: {
                create: [
                    { skillId: skillMap.get('Dravyaguna'), isRequired: true, minProficiency: 'ADVANCED' },
                    { skillId: skillMap.get('Medicinal Plants'), isRequired: true, minProficiency: 'INTERMEDIATE' },
                    { skillId: skillMap.get('Herbal Medicine'), isRequired: true, minProficiency: 'INTERMEDIATE' },
                ],
            },
        },
    });
    // Internship 4: Ayurvedic Pharmacy Intern (Kerala Herbal Sciences)
    // Required: Bhaishajya Kalpana (Intermediate), Ayurvedic Formulations (Beginner), Quality Control (Beginner)
    // -> Rohan Sharma is fully ELIGIBLE (Bhaishajya Kalpana Int, Formulations Beg, QC Beg)
    const opp4 = await db_1.default.opportunity.create({
        data: {
            industryId: indKeralaHerbal.industryProfile.id,
            title: 'Ayurvedic Pharmacy Intern',
            type: 'INTERNSHIP',
            description: 'Hands-on training in industrial classical Kashayam boiling, Asava-Arishta fermentation monitoring, and tablet compression operations.',
            degree: 'BAMS',
            department: 'Rasashastra & Bhaishajya Kalpana',
            minCgpa: 7.0,
            location: 'Kochi, Kerala',
            workMode: 'ON_SITE',
            stipendOrSalary: 'INR 18,000 / month',
            duration: '4 Months',
            numberOfOpenings: 3,
            isPublished: true,
            applicationDeadline: new Date(Date.now() + 86400000 * 35),
            skills: {
                create: [
                    { skillId: skillMap.get('Bhaishajya Kalpana'), isRequired: true, minProficiency: 'INTERMEDIATE' },
                    { skillId: skillMap.get('Ayurvedic Formulations'), isRequired: true, minProficiency: 'BEGINNER' },
                    { skillId: skillMap.get('Quality Control'), isRequired: true, minProficiency: 'BEGINNER' },
                ],
            },
        },
    });
    // Internship 5: Clinical Ayurveda Intern (Sri Dhanvantari Ayurveda College)
    const opp5 = await db_1.default.opportunity.create({
        data: {
            industryId: indDhanvantari.industryProfile.id,
            title: 'Clinical Ayurveda Intern',
            type: 'INTERNSHIP',
            description: 'OPD and IPD clinical rotations managing metabolic, gastrointestinal, and musculoskeletal cases under senior faculty Vaidyas.',
            degree: 'BAMS',
            minCgpa: 8.0,
            location: 'Chennai, Tamil Nadu',
            workMode: 'ON_SITE',
            stipendOrSalary: 'INR 15,000 / month',
            duration: '6 Months',
            numberOfOpenings: 5,
            isPublished: true,
            applicationDeadline: new Date(Date.now() + 86400000 * 25),
            skills: {
                create: [
                    { skillId: skillMap.get('Kayachikitsa'), isRequired: true, minProficiency: 'ADVANCED' },
                    { skillId: skillMap.get('Ayurvedic Diagnosis'), isRequired: true, minProficiency: 'ADVANCED' },
                ],
            },
        },
    });
    // Internship 6: Medicinal Plant Research Intern (Kerala Ayurveda Research Institute)
    const opp6 = await db_1.default.opportunity.create({
        data: {
            industryId: indKeralaHerbal.industryProfile.id,
            title: 'Medicinal Plant Research Intern',
            type: 'INTERNSHIP',
            description: 'Botanical field surveys in the Nilgiri Biosphere, herbarium cataloging, and crude drug TLC fingerprinting assays.',
            degree: 'BAMS',
            minCgpa: 7.0,
            location: 'Kochi, Kerala',
            workMode: 'HYBRID',
            stipendOrSalary: 'INR 18,000 / month',
            duration: '4 Months',
            numberOfOpenings: 2,
            isPublished: true,
            applicationDeadline: new Date(Date.now() + 86400000 * 30),
            skills: {
                create: [
                    { skillId: skillMap.get('Dravyaguna'), isRequired: true, minProficiency: 'INTERMEDIATE' },
                    { skillId: skillMap.get('Medicinal Plants'), isRequired: true, minProficiency: 'INTERMEDIATE' },
                    { skillId: skillMap.get('Pharmacognosy'), isRequired: true, minProficiency: 'BEGINNER' },
                ],
            },
        },
    });
    // Internship 7: Yoga and Wellness Intern (Prana Ayurveda Wellness)
    // -> Kavya Nair is fully ELIGIBLE (Yoga Adv, Swasthavritta Adv, Lifestyle Counselling Int, Nutrition Int)
    const opp7 = await db_1.default.opportunity.create({
        data: {
            industryId: indPranaWellness.industryProfile.id,
            title: 'Yoga and Wellness Intern',
            type: 'INTERNSHIP',
            description: 'Deliver structured therapeutic Yoga routines, conduct Prakriti-based dietary counselling, and coordinate wellness retreats.',
            degree: 'BAMS',
            minCgpa: 7.5,
            location: 'Hyderabad, Telangana',
            workMode: 'ON_SITE',
            stipendOrSalary: 'INR 20,000 / month',
            duration: '6 Months',
            numberOfOpenings: 3,
            isPublished: true,
            applicationDeadline: new Date(Date.now() + 86400000 * 30),
            skills: {
                create: [
                    { skillId: skillMap.get('Yoga'), isRequired: true, minProficiency: 'ADVANCED' },
                    { skillId: skillMap.get('Lifestyle Counselling'), isRequired: true, minProficiency: 'INTERMEDIATE' },
                    { skillId: skillMap.get('Ayurvedic Nutrition'), isRequired: true, minProficiency: 'INTERMEDIATE' },
                ],
            },
        },
    });
    // Internship 8: Digital Ayurveda Intern (Ayurveda Life Sciences)
    // -> Vishal Reddy is ELIGIBLE
    const opp8 = await db_1.default.opportunity.create({
        data: {
            industryId: indAyurvedaLife.industryProfile.id,
            title: 'Digital Ayurveda Intern',
            type: 'INTERNSHIP',
            description: 'Support development of electronic medical record templates mapping classical Ayurvedic terminology to Namaste portal coding standards.',
            degree: 'BAMS',
            minCgpa: 7.5,
            location: 'Remote',
            workMode: 'REMOTE',
            stipendOrSalary: 'INR 22,000 / month',
            duration: '6 Months',
            numberOfOpenings: 2,
            isPublished: true,
            applicationDeadline: new Date(Date.now() + 86400000 * 45),
            skills: {
                create: [
                    { skillId: skillMap.get('Digital Health'), isRequired: true, minProficiency: 'BEGINNER' },
                    { skillId: skillMap.get('Medical Documentation'), isRequired: true, minProficiency: 'BEGINNER' },
                    { skillId: skillMap.get('Healthcare Data Management'), isRequired: true, minProficiency: 'BEGINNER' },
                ],
            },
        },
    });
    // Internship 9: Panchakarma Research Intern (Dhanvantari Wellness)
    const opp9 = await db_1.default.opportunity.create({
        data: {
            industryId: indDhanvantari.industryProfile.id,
            title: 'Panchakarma Research Intern',
            type: 'INTERNSHIP',
            description: 'Clinical outcome monitoring on Basti therapy for lumbar spondylosis and chronic pain management in an inpatient clinical setting.',
            degree: 'BAMS',
            minCgpa: 8.0,
            location: 'Chennai, Tamil Nadu',
            workMode: 'ON_SITE',
            stipendOrSalary: 'INR 25,000 / month',
            duration: '6 Months',
            numberOfOpenings: 2,
            isPublished: true,
            applicationDeadline: new Date(Date.now() + 86400000 * 40),
            skills: {
                create: [
                    { skillId: skillMap.get('Panchakarma'), isRequired: true, minProficiency: 'ADVANCED' },
                    { skillId: skillMap.get('Clinical Research'), isRequired: true, minProficiency: 'INTERMEDIATE' },
                    { skillId: skillMap.get('Research Methodology'), isRequired: true, minProficiency: 'INTERMEDIATE' },
                ],
            },
        },
    });
    // Internship 10: Ayurvedic Formulation Development Intern (Kerala Herbal Sciences)
    const opp10 = await db_1.default.opportunity.create({
        data: {
            industryId: indKeralaHerbal.industryProfile.id,
            title: 'Ayurvedic Formulation Development Intern',
            type: 'INTERNSHIP',
            description: 'Formulation research and development of novel herbal chewable tablets, standardized Kwatha granules, and shelf-life stability testing.',
            degree: 'BAMS',
            minCgpa: 7.5,
            location: 'Kochi, Kerala',
            workMode: 'ON_SITE',
            stipendOrSalary: 'INR 20,000 / month',
            duration: '6 Months',
            numberOfOpenings: 2,
            isPublished: true,
            applicationDeadline: new Date(Date.now() + 86400000 * 30),
            skills: {
                create: [
                    { skillId: skillMap.get('Herbal Formulations'), isRequired: true, minProficiency: 'INTERMEDIATE' },
                    { skillId: skillMap.get('Bhaishajya Kalpana'), isRequired: true, minProficiency: 'INTERMEDIATE' },
                    { skillId: skillMap.get('Quality Control'), isRequired: true, minProficiency: 'BEGINNER' },
                ],
            },
        },
    });
    // ---------------------------------------------------------
    // 10. Ayurveda Entry-Level Jobs (6 Postings)
    // ---------------------------------------------------------
    console.log('10. Seeding 6 Entry-Level Ayurveda Job Postings...');
    const job1 = await db_1.default.opportunity.create({
        data: {
            industryId: indDhanvantari.industryProfile.id,
            title: 'Junior Ayurveda Clinical Associate',
            type: 'JOB',
            description: 'Full-time clinical resident managing OPD consultations, constitutional Prakriti evaluations, and formulating personalized herbal and lifestyle regimens.',
            degree: 'BAMS',
            department: 'Clinical Medicine',
            minCgpa: 7.5,
            experience: '0-2 Years / Fresh BAMS Graduate',
            location: 'Chennai, Tamil Nadu',
            workMode: 'ON_SITE',
            stipendOrSalary: 'INR 6.5 - 9.0 LPA',
            numberOfOpenings: 3,
            isPublished: true,
            applicationDeadline: new Date(Date.now() + 86400000 * 60),
            skills: {
                create: [
                    { skillId: skillMap.get('Ayurvedic Diagnosis'), isRequired: true, minProficiency: 'ADVANCED' },
                    { skillId: skillMap.get('Kayachikitsa'), isRequired: true, minProficiency: 'ADVANCED' },
                    { skillId: skillMap.get('Patient Counselling'), isRequired: false, minProficiency: 'INTERMEDIATE' },
                ],
            },
        },
    });
    const job2 = await db_1.default.opportunity.create({
        data: {
            industryId: indPranaWellness.industryProfile.id,
            title: 'Ayurvedic Wellness Consultant',
            type: 'JOB',
            description: 'Lead client wellness journeys integrating individualized Prakriti assessments, therapeutic Yoga plans, circadian rhythm coaching, and nutritional counseling.',
            degree: 'BAMS',
            minCgpa: 7.5,
            experience: '0-2 Years',
            location: 'Hyderabad, Telangana',
            workMode: 'HYBRID',
            stipendOrSalary: 'INR 6.0 - 8.5 LPA',
            numberOfOpenings: 2,
            isPublished: true,
            applicationDeadline: new Date(Date.now() + 86400000 * 45),
            skills: {
                create: [
                    { skillId: skillMap.get('Lifestyle Counselling'), isRequired: true, minProficiency: 'ADVANCED' },
                    { skillId: skillMap.get('Yoga'), isRequired: true, minProficiency: 'ADVANCED' },
                    { skillId: skillMap.get('Ayurvedic Nutrition'), isRequired: true, minProficiency: 'INTERMEDIATE' },
                ],
            },
        },
    });
    const job3 = await db_1.default.opportunity.create({
        data: {
            industryId: indAyurvedaLife.industryProfile.id,
            title: 'Ayurvedic Research Associate',
            type: 'JOB',
            description: 'Coordinate multi-center randomized clinical trials, draft ethical submissions, supervise CTRI trial registry data, and publish scientific manuscripts.',
            degree: 'BAMS',
            minCgpa: 8.0,
            experience: '0-2 Years',
            location: 'Bengaluru, Karnataka',
            workMode: 'HYBRID',
            stipendOrSalary: 'INR 7.5 - 10.5 LPA',
            numberOfOpenings: 2,
            isPublished: true,
            applicationDeadline: new Date(Date.now() + 86400000 * 50),
            skills: {
                create: [
                    { skillId: skillMap.get('Clinical Research'), isRequired: true, minProficiency: 'ADVANCED' },
                    { skillId: skillMap.get('Research Methodology'), isRequired: true, minProficiency: 'ADVANCED' },
                    { skillId: skillMap.get('Scientific Writing'), isRequired: true, minProficiency: 'INTERMEDIATE' },
                ],
            },
        },
    });
    const job4 = await db_1.default.opportunity.create({
        data: {
            industryId: indKeralaHerbal.industryProfile.id,
            title: 'Herbal Research Associate',
            type: 'JOB',
            description: 'Phytochemical analysis, botanical extract standardization, chromatographic fingerprinting, and pharmacognostic authentication of raw materials.',
            degree: 'BAMS',
            minCgpa: 7.5,
            location: 'Kochi, Kerala',
            workMode: 'ON_SITE',
            stipendOrSalary: 'INR 7.0 - 9.5 LPA',
            numberOfOpenings: 2,
            isPublished: true,
            applicationDeadline: new Date(Date.now() + 86400000 * 40),
            skills: {
                create: [
                    { skillId: skillMap.get('Dravyaguna'), isRequired: true, minProficiency: 'ADVANCED' },
                    { skillId: skillMap.get('Medicinal Plants'), isRequired: true, minProficiency: 'ADVANCED' },
                    { skillId: skillMap.get('Herbal Medicine'), isRequired: true, minProficiency: 'ADVANCED' },
                ],
            },
        },
    });
    const job5 = await db_1.default.opportunity.create({
        data: {
            industryId: indKeralaHerbal.industryProfile.id,
            title: 'Ayurvedic Quality Control Associate',
            type: 'JOB',
            description: 'Lead quality testing operations ensuring Schedule T GMP compliance, heavy metal limit tests, microbial count assays, and formulation stability.',
            degree: 'BAMS / B.Pharm (Ayurveda)',
            minCgpa: 7.5,
            location: 'Kochi, Kerala',
            workMode: 'ON_SITE',
            stipendOrSalary: 'INR 6.5 - 9.0 LPA',
            numberOfOpenings: 2,
            isPublished: true,
            applicationDeadline: new Date(Date.now() + 86400000 * 35),
            skills: {
                create: [
                    { skillId: skillMap.get('Quality Control'), isRequired: true, minProficiency: 'ADVANCED' },
                    { skillId: skillMap.get('Ayurvedic Formulations'), isRequired: true, minProficiency: 'ADVANCED' },
                    { skillId: skillMap.get('GMP'), isRequired: true, minProficiency: 'INTERMEDIATE' },
                ],
            },
        },
    });
    const job6 = await db_1.default.opportunity.create({
        data: {
            industryId: indDhanvantari.industryProfile.id,
            title: 'Panchakarma Therapy Associate',
            type: 'JOB',
            description: 'Supervise hospital Panchakarma theaters, plan customized Snehana-Swedana protocols, administer specialized Basti regimes, and track patient recovery.',
            degree: 'BAMS',
            minCgpa: 7.5,
            location: 'Chennai, Tamil Nadu',
            workMode: 'ON_SITE',
            stipendOrSalary: 'INR 7.0 - 9.5 LPA',
            numberOfOpenings: 2,
            isPublished: true,
            applicationDeadline: new Date(Date.now() + 86400000 * 45),
            skills: {
                create: [
                    { skillId: skillMap.get('Panchakarma'), isRequired: true, minProficiency: 'ADVANCED' },
                    { skillId: skillMap.get('Abhyanga'), isRequired: true, minProficiency: 'ADVANCED' },
                    { skillId: skillMap.get('Swedana'), isRequired: true, minProficiency: 'ADVANCED' },
                ],
            },
        },
    });
    // ---------------------------------------------------------
    // 11. Student Applications (12-15 Realistic Records)
    // ---------------------------------------------------------
    console.log('11. Seeding Realistic Application Records & Recruitment Status History...');
    // Ananya Iyer -> Panchakarma Therapy Intern (SHORTLISTED)
    await db_1.default.application.create({
        data: {
            studentId: studentAnanya.studentProfile.id,
            opportunityId: opp1.id,
            status: 'SHORTLISTED',
            matchScore: 91.0,
            appliedAt: new Date(Date.now() - 86400000 * 7),
            coverLetter: 'I am a 4th-year BAMS student with completed practical modules in classical Panchakarma, Abhyanga, and Swedana therapy.',
            history: {
                create: [
                    { status: 'APPLIED', notes: 'Application submitted via student portal', createdAt: new Date(Date.now() - 86400000 * 7) },
                    { status: 'UNDER_REVIEW', notes: 'Academic qualifications and CGPA 8.2 verified', createdAt: new Date(Date.now() - 86400000 * 4) },
                    { status: 'SHORTLISTED', notes: 'High skill match in Panchakarma protocols', createdAt: new Date(Date.now() - 86400000 * 2) },
                ],
            },
        },
    });
    // Ananya Iyer -> Clinical Ayurveda Intern (INTERVIEW)
    await db_1.default.application.create({
        data: {
            studentId: studentAnanya.studentProfile.id,
            opportunityId: opp5.id,
            status: 'INTERVIEW',
            matchScore: 88.0,
            appliedAt: new Date(Date.now() - 86400000 * 6),
            history: {
                create: [
                    { status: 'APPLIED', createdAt: new Date(Date.now() - 86400000 * 6) },
                    { status: 'SHORTLISTED', createdAt: new Date(Date.now() - 86400000 * 3) },
                    { status: 'INTERVIEW', notes: 'Scheduled clinical case round with Senior Vaidya', createdAt: new Date(Date.now() - 86400000 * 1) },
                ],
            },
            interviews: {
                create: {
                    scheduledAt: new Date(Date.now() + 86400000 * 3),
                    meetingLink: 'https://meet.ayurveda.demo/ananya-clinical-interview',
                    notes: 'Round 1: Clinical Case Presentation on Amavata management.',
                    status: 'SCHEDULED',
                },
            },
        },
    });
    // Arjun Menon -> Ayurvedic Clinical Research Intern (UNDER_REVIEW)
    await db_1.default.application.create({
        data: {
            studentId: studentArjun.studentProfile.id,
            opportunityId: opp2.id,
            status: 'UNDER_REVIEW',
            matchScore: 92.0,
            appliedAt: new Date(Date.now() - 86400000 * 5),
        },
    });
    // Arjun Menon -> Ayurvedic Research Associate (APPLIED)
    await db_1.default.application.create({
        data: {
            studentId: studentArjun.studentProfile.id,
            opportunityId: job3.id,
            status: 'APPLIED',
            matchScore: 89.0,
            appliedAt: new Date(Date.now() - 86400000 * 3),
        },
    });
    // Meera Krishnan -> Herbal Medicine Research Intern (INTERVIEW)
    await db_1.default.application.create({
        data: {
            studentId: studentMeera.studentProfile.id,
            opportunityId: opp3.id,
            status: 'INTERVIEW',
            matchScore: 96.0,
            appliedAt: new Date(Date.now() - 86400000 * 8),
            coverLetter: 'Certified in Dravyaguna plant authentication with verified digital certificate.',
            history: {
                create: [
                    { status: 'APPLIED', createdAt: new Date(Date.now() - 86400000 * 8) },
                    { status: 'SHORTLISTED', createdAt: new Date(Date.now() - 86400000 * 4) },
                    { status: 'INTERVIEW', notes: 'Botanical identification & HPTLC assay interview scheduled', createdAt: new Date(Date.now() - 86400000 * 1) },
                ],
            },
            interviews: {
                create: {
                    scheduledAt: new Date(Date.now() + 86400000 * 2),
                    meetingLink: 'https://meet.ayurveda.demo/meera-dravyaguna-interview',
                    status: 'SCHEDULED',
                },
            },
        },
    });
    // Meera Krishnan -> Medicinal Plant Research Intern (SELECTED!)
    await db_1.default.application.create({
        data: {
            studentId: studentMeera.studentProfile.id,
            opportunityId: opp6.id,
            status: 'SELECTED',
            matchScore: 94.0,
            appliedAt: new Date(Date.now() - 86400000 * 14),
            history: {
                create: [
                    { status: 'APPLIED', createdAt: new Date(Date.now() - 86400000 * 14) },
                    { status: 'SHORTLISTED', createdAt: new Date(Date.now() - 86400000 * 9) },
                    { status: 'INTERVIEW', createdAt: new Date(Date.now() - 86400000 * 5) },
                    { status: 'SELECTED', notes: 'Formal internship offer extended for Nilgiri botanical study project.', createdAt: new Date(Date.now() - 86400000 * 1) },
                ],
            },
        },
    });
    // Rohan Sharma -> Ayurvedic Pharmacy Intern (APPLIED)
    await db_1.default.application.create({
        data: {
            studentId: studentRohan.studentProfile.id,
            opportunityId: opp4.id,
            status: 'APPLIED',
            matchScore: 84.0,
            appliedAt: new Date(Date.now() - 86400000 * 4),
        },
    });
    // Rohan Sharma -> Ayurvedic Formulation Development Intern (UNDER_REVIEW)
    await db_1.default.application.create({
        data: {
            studentId: studentRohan.studentProfile.id,
            opportunityId: opp10.id,
            status: 'UNDER_REVIEW',
            matchScore: 80.0,
            appliedAt: new Date(Date.now() - 86400000 * 3),
        },
    });
    // Kavya Nair -> Yoga and Wellness Intern (SELECTED!)
    await db_1.default.application.create({
        data: {
            studentId: studentKavya.studentProfile.id,
            opportunityId: opp7.id,
            status: 'SELECTED',
            matchScore: 97.0,
            appliedAt: new Date(Date.now() - 86400000 * 12),
            history: {
                create: [
                    { status: 'APPLIED', createdAt: new Date(Date.now() - 86400000 * 12) },
                    { status: 'SHORTLISTED', createdAt: new Date(Date.now() - 86400000 * 8) },
                    { status: 'INTERVIEW', createdAt: new Date(Date.now() - 86400000 * 4) },
                    { status: 'SELECTED', notes: 'Offer letter generated for Ayurvedic Wellness Consultant Residency.', createdAt: new Date(Date.now() - 86400000 * 1) },
                ],
            },
        },
    });
    // Kavya Nair -> Ayurvedic Wellness Consultant (INTERVIEW)
    await db_1.default.application.create({
        data: {
            studentId: studentKavya.studentProfile.id,
            opportunityId: job2.id,
            status: 'INTERVIEW',
            matchScore: 95.0,
            appliedAt: new Date(Date.now() - 86400000 * 6),
        },
    });
    // Vishal Reddy -> Digital Ayurveda Intern (UNDER_REVIEW)
    await db_1.default.application.create({
        data: {
            studentId: studentVishal.studentProfile.id,
            opportunityId: opp8.id,
            status: 'UNDER_REVIEW',
            matchScore: 88.0,
            appliedAt: new Date(Date.now() - 86400000 * 5),
        },
    });
    // Vishal Reddy -> Ayurvedic Research Associate (APPLIED)
    await db_1.default.application.create({
        data: {
            studentId: studentVishal.studentProfile.id,
            opportunityId: job3.id,
            status: 'APPLIED',
            matchScore: 87.0,
            appliedAt: new Date(Date.now() - 86400000 * 2),
        },
    });
    // ---------------------------------------------------------
    // 12. Academia-Industry Collaborations (6 Items)
    // ---------------------------------------------------------
    console.log('12. Seeding 6 Academia-Industry Collaborations & MoUs...');
    // 1. Industry Guest Lecture
    await db_1.default.collaboration.create({
        data: {
            initiatorId: indDhanvantari.id,
            initiatorRole: 'INDUSTRY',
            title: 'Career Opportunities in the Ayurvedic Wellness Industry',
            type: 'GUEST_LECTURE',
            description: 'Interactive industry guest lecture detailing emerging clinical career pathways, Panchakarma residency standards, and wellness center management for BAMS graduates.',
            targetAudience: 'Final Year BAMS Students & Interns',
            location: 'Chennai, Tamil Nadu',
            mode: 'HYBRID',
            duration: '1 Day (3 Hours)',
            remunerationOrStipend: 'Sponsored by Dhanvantari Wellness',
            status: 'COMPLETED',
            startDate: '2026-02-15',
            endDate: '2026-02-15',
        },
    });
    // 2. Workshop
    await db_1.default.collaboration.create({
        data: {
            initiatorId: indAyurvedaLife.id,
            initiatorRole: 'INDUSTRY',
            title: 'Modern Approaches to Clinical Research in Ayurveda',
            type: 'WORKSHOP',
            description: 'Hands-on clinical research workshop focusing on GCP guidelines, double-blind study design in polyherbal formulations, and electronic data capture.',
            targetAudience: 'Ayurveda Academicians, PG Scholars & Senior BAMS Students',
            location: 'Bengaluru, Karnataka',
            mode: 'HYBRID',
            duration: '3 Days',
            status: 'OPEN',
            startDate: '2026-03-20',
            endDate: '2026-03-22',
            applications: {
                create: {
                    applicantRole: 'ACADEMICIAN',
                    academicianId: acadAnanya.academicianProfile.id,
                    proposal: 'Participating to incorporate standardized clinical trial protocols into 4th year Kayachikitsa coursework.',
                    status: 'ACCEPTED',
                },
            },
        },
    });
    // 3. Industry-Academia Project
    await db_1.default.collaboration.create({
        data: {
            initiatorId: indKeralaHerbal.id,
            initiatorRole: 'INDUSTRY',
            title: 'Herbal Product Quality Standardization Joint Project',
            type: 'RESEARCH',
            description: 'Joint laboratory project establishing spectroscopic quality benchmarks and active marker TLC fingerprints for endangered Western Ghats medicinal flora.',
            targetAudience: 'Dravyaguna Faculty & Postgraduates',
            location: 'Coimbatore, Tamil Nadu',
            mode: 'HYBRID',
            duration: '12 Months',
            budget: 'INR 4,50,000',
            remunerationOrStipend: 'INR 4,50,000 Research Grant',
            status: 'IN_PROGRESS',
            startDate: '2026-01-01',
            endDate: '2026-12-31',
            applications: {
                create: {
                    applicantRole: 'ACADEMICIAN',
                    academicianId: acadRavi.academicianProfile.id,
                    proposal: 'Leading the taxonomical collection and HPLC fingerprinting of 20 high-value anti-inflammatory plants.',
                    status: 'ACCEPTED',
                },
            },
        },
    });
    // 4. Mentorship Program Collaboration
    await db_1.default.collaboration.create({
        data: {
            initiatorId: indPranaWellness.id,
            initiatorRole: 'INDUSTRY',
            title: 'Career Mentorship & Clinical Transition for BAMS Students',
            type: 'MENTORSHIP',
            description: '1-on-1 career navigation for aspiring integrative lifestyle physicians, Panchakarma consultants, and wellness entrepreneurs.',
            targetAudience: 'Final Year BAMS Students & Interns',
            location: 'Hyderabad, Telangana',
            mode: 'ONLINE',
            duration: '3 Months',
            status: 'OPEN',
            startDate: '2026-03-01',
            endDate: '2026-05-31',
            applications: {
                create: {
                    applicantRole: 'STUDENT',
                    studentId: studentAnanya.studentProfile.id,
                    proposal: 'Seeking guidance on setting up an evidence-based clinical Panchakarma center.',
                    status: 'ACCEPTED',
                },
            },
        },
    });
    await db_1.default.mentorshipProgram.create({
        data: {
            mentorId: indPranaWellness.industryProfile.id,
            title: 'Career Mentorship for BAMS Students',
            description: '1-on-1 career navigation for aspiring integrative lifestyle physicians, Panchakarma consultants, and wellness entrepreneurs.',
            maxMentees: 6,
            expertiseAreas: 'Yoga Therapy, Ayurvedic Nutrition, Lifestyle Medicine, Career Transition',
            isAccepting: true,
            requests: {
                create: {
                    studentId: studentAnanya.studentProfile.id,
                    message: 'Seeking guidance on setting up an evidence-based clinical Panchakarma center.',
                    status: 'ACCEPTED',
                    sessions: {
                        create: {
                            topic: 'Panchakarma Center Infrastructure & Clinical SOPs',
                            scheduledAt: new Date(Date.now() + 86400000 * 4),
                            meetingLink: 'https://meet.ayurveda.demo/mentor-session-ananya',
                            status: 'SCHEDULED',
                        },
                    },
                },
            },
        },
    });
    // 5. Innovation Challenge
    await db_1.default.collaboration.create({
        data: {
            initiatorId: kariInst.id,
            initiatorRole: 'INSTITUTION',
            title: 'Digital Solutions for Ayurveda Healthcare Hackathon',
            type: 'LIVE_PROJECT',
            description: 'Inter-institutional innovation challenge developing digital pulse sensors, Prakriti assessment algorithms, and mobile herbal identification apps.',
            targetAudience: 'Ayurveda Students, Bio-engineers & HealthTech Startups',
            location: 'Kochi, Kerala',
            mode: 'HYBRID',
            duration: '48 Hours Hackathon + 1 Month Incubation',
            budget: 'INR 2,00,000 Prize Pool',
            status: 'OPEN',
            startDate: '2026-04-10',
            endDate: '2026-05-10',
            applications: {
                create: {
                    applicantRole: 'STUDENT',
                    studentId: studentVishal.studentProfile.id,
                    proposal: 'AI-assisted Nadi Pariksha waveform classification using mobile sensor inputs.',
                    status: 'ACCEPTED',
                },
            },
        },
    });
    // 6. Faculty Development Program (FDP)
    await db_1.default.collaboration.create({
        data: {
            initiatorId: indAyurvedaLife.id,
            initiatorRole: 'INDUSTRY',
            title: 'Emerging Trends in Ayurvedic Clinical Research FDP',
            type: 'FDP',
            description: '2-week intensive Faculty Development Program equipping teaching professors with modern biostatistical methodologies, manuscript publishing skills, and regulatory insight.',
            targetAudience: 'Ayurveda Teaching Faculty & Department Heads',
            location: 'Bengaluru, Karnataka',
            mode: 'ONLINE',
            duration: '2 Weeks',
            remunerationOrStipend: 'INR 1,50,000 Program Sponsorship',
            status: 'OPEN',
            startDate: '2026-03-15',
            endDate: '2026-03-30',
            applications: {
                create: {
                    applicantRole: 'ACADEMICIAN',
                    academicianId: acadMeenakshi.academicianProfile.id,
                    proposal: 'Participating to update department syllabus with modern stability testing protocols.',
                    status: 'UNDER_REVIEW',
                },
            },
        },
    });
    console.log('\n==================================================================');
    console.log('🎉 AYURVEDA DEMO DATA SEEDED SUCCESSFULLY!');
    console.log('==================================================================');
    console.log('✓ 6 Ayurveda Students: Ananya (Panchakarma), Arjun (Kayachikitsa), Meera (Dravyaguna), Rohan (Pharmacy), Kavya (Yoga), Vishal (Research)');
    console.log('✓ 3 Academicians: Dr. Ananya Krishnan (SDAC), Dr. Ravi Narayanan (SIIA), Dr. Meenakshi Menon (KARI)');
    console.log('✓ 3 Institutions: Sri Dhanvantari Ayurveda College, South Indian Inst. of Ayurveda, Kerala Ayurveda Research Inst.');
    console.log('✓ 4 Industry Organizations: Dhanvantari Wellness, Kerala Herbal Sciences, Ayurveda Life Sciences, Prana Ayurveda Wellness');
    console.log('✓ 12 Published Ayurveda Courses with authentic curriculum modules & lessons');
    console.log('✓ 16 Active Opportunities: 10 Internships + 6 High-Value Professional Jobs');
    console.log('✓ Real dynamic course progress (Meera @ 100% with verified cert, Ananya @ 75%, Arjun @ 80%, Kavya @ 90%)');
    console.log('✓ 6 Academia-Industry Collaborations (Guest Lectures, Workshops, Joint Projects, Mentorships, FDPs)');
    console.log('✓ Complete recruitment lifecycle (APPLIED, UNDER_REVIEW, SHORTLISTED, INTERVIEW, SELECTED)');
    console.log('==================================================================\n');
    await db_1.default.$disconnect();
}
seedAyurvedaDemo().catch((err) => {
    console.error('❌ Error during Ayurveda demo data seeding:', err);
    process.exit(1);
});
