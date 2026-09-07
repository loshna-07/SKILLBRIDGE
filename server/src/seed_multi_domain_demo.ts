import bcrypt from 'bcryptjs';
import prisma from './config/db';
import clearDemoData from './clear_demo_data';

async function seedMultiDomainDemo() {
  console.log('==================================================================');
  console.log('🌱 SEEDING MULTI-DOMAIN ACADEMIA-INDUSTRY PLATFORM DEMO DATA');
  console.log('   - 6 Academicians across Ayurveda, Engineering, Commerce');
  console.log('   - 5 Institutions across Ayurveda, Engineering, Commerce');
  console.log('   - 7 Industry Partners across Ayurveda, Engineering, Commerce');
  console.log('   - 10 Students with Realistic Skill Profiles & Targets');
  console.log('   - 18 Published Courses (Academician, Institution, Industry)');
  console.log('   - 24 Opportunities (15 Internships + 9 Jobs)');
  console.log('   - 10 Collaborations / MoUs / Activities');
  console.log('==================================================================\n');

  // 1. Purge previous demo data cleanly
  console.log('0. Clearing existing demo records...');
  await clearDemoData();

  const passwordHash = await bcrypt.hash('Demo@12345', 10);

  // ---------------------------------------------------------
  // 1. Multi-Domain Skill Taxonomy
  // ---------------------------------------------------------
  console.log('1. Seeding Multi-Disciplinary Skill Taxonomy...');

  const catAyuFund = await prisma.skillCategory.upsert({
    where: { name: 'Ayurveda & Healthcare' },
    update: {},
    create: {
      name: 'Ayurveda & Healthcare',
      description: 'Foundational Ayurvedic medicine, Panchakarma, Dravyaguna, and clinical therapeutics.',
    },
  });

  const catEngTech = await prisma.skillCategory.upsert({
    where: { name: 'Engineering & Technology' },
    update: {},
    create: {
      name: 'Engineering & Technology',
      description: 'Full stack software engineering, embedded firmware, IoT hardware, and cloud computing.',
    },
  });

  const catComBiz = await prisma.skillCategory.upsert({
    where: { name: 'Commerce & Business' },
    update: {},
    create: {
      name: 'Commerce & Business',
      description: 'Corporate financial analysis, accounting, business analytics, and digital marketing.',
    },
  });

  const skillsData = [
    // Ayurveda & Healthcare
    { name: 'Ayurvedic Fundamentals', categoryId: catAyuFund.id, description: 'Core principles of Ayurveda, Tridosha theory, and holistic anatomy.' },
    { name: 'Ayurvedic Diagnosis', categoryId: catAyuFund.id, description: 'Clinical examination, Ashtavidha Pariksha, and Roganidana prognosis.' },
    { name: 'Panchakarma', categoryId: catAyuFund.id, description: 'Five classical purification and detoxification therapeutic protocols.' },
    { name: 'Abhyanga', categoryId: catAyuFund.id, description: 'Therapeutic medicated oil application and Marma point stimulation.' },
    { name: 'Swedana', categoryId: catAyuFund.id, description: 'Therapeutic sudation protocols including Bashpa and Nadi Sweda.' },
    { name: 'Basti', categoryId: catAyuFund.id, description: 'Medicated enema therapy for Vata and degenerative neurological disorders.' },
    { name: 'Shirodhara', categoryId: catAyuFund.id, description: 'Continuous pouring of medicated liquids on the forehead for mind-body balance.' },
    { name: 'Dravyaguna', categoryId: catAyuFund.id, description: 'Ayurvedic herbal drug taxonomy, pharmacognosy, and Rasa Panchaka analysis.' },
    { name: 'Medicinal Plants', categoryId: catAyuFund.id, description: 'Botanical identification, field herbarium, and crude drug standardization.' },
    { name: 'Herbal Medicine', categoryId: catAyuFund.id, description: 'Phytochemical extraction, herbal active biomarkers, and formulation testing.' },
    { name: 'Pharmacognosy', categoryId: catAyuFund.id, description: 'Microscopic, macroscopic, and chromatographic evaluation of botanical drugs.' },
    { name: 'Rasashastra', categoryId: catAyuFund.id, description: 'Ayurvedic mineralogy, Shodhana, Marana, and Bhasma nanotechnology.' },
    { name: 'Bhaishajya Kalpana', categoryId: catAyuFund.id, description: 'Classical pharmaceutical dosage manufacturing and GMP quality controls.' },
    { name: 'Quality Control', categoryId: catAyuFund.id, description: 'Analytical testing, heavy metal limits, and stability standards in AYUSH pharma.' },
    { name: 'Clinical Research', categoryId: catAyuFund.id, description: 'Evidence-based trial design, AYUSH GCP guidelines, and ethical compliance.' },
    { name: 'Research Methodology', categoryId: catAyuFund.id, description: 'Systematic study design, hypothesis testing, and clinical outcome metrics.' },
    { name: 'Kayachikitsa', categoryId: catAyuFund.id, description: 'General internal medicine, chronic pathology, and metabolic management.' },
    { name: 'Scientific Writing', categoryId: catAyuFund.id, description: 'Clinical case reporting, peer-reviewed manuscript drafting, and regulatory dossiers.' },
    { name: 'Yoga', categoryId: catAyuFund.id, description: 'Therapeutic asana, pranayama, and yogic physiological rehabilitation.' },
    { name: 'Lifestyle Counselling', categoryId: catAyuFund.id, description: 'Dinacharya, Ritucharya, and psychological counseling for preventive health.' },
    { name: 'Nutrition', categoryId: catAyuFund.id, description: 'Pathya-Apathya Ahara therapy and personalized dosha dietary planning.' },
    { name: 'Biostatistics', categoryId: catAyuFund.id, description: 'Healthcare data analysis, sample sizing, and clinical significance modeling.' },
    { name: 'Digital Health', categoryId: catAyuFund.id, description: 'EHR platforms, tele-consultations, and AYUSH digital health informatics.' },
    { name: 'Patient Assessment', categoryId: catAyuFund.id, description: 'Comprehensive clinical patient assessment and pulse diagnosis.' },
    { name: 'Herbal Identification', categoryId: catAyuFund.id, description: 'Botanical identification of live and dried medicinal herbs.' },
    { name: 'Ayurvedic Pharmacy', categoryId: catAyuFund.id, description: 'Preparation and dispensing of classical Ayurvedic medicines.' },

    // Engineering & Technology
    { name: 'C', categoryId: catEngTech.id, description: 'Low-level procedural programming and memory management.' },
    { name: 'Embedded C', categoryId: catEngTech.id, description: 'Microcontroller register-level firmware programming and peripheral interfacing.' },
    { name: 'Arduino', categoryId: catEngTech.id, description: 'Rapid prototyping with Arduino boards, shields, and sensor libraries.' },
    { name: 'IoT', categoryId: catEngTech.id, description: 'Internet of Things protocols, MQTT, telemetry streams, and edge computing.' },
    { name: 'Sensors', categoryId: catEngTech.id, description: 'Analog/digital sensor interfacing, signal conditioning, and calibration.' },
    { name: 'Digital Electronics', categoryId: catEngTech.id, description: 'Logic gates, sequential circuits, timing diagrams, and microcontroller architecture.' },
    { name: 'Microcontrollers', categoryId: catEngTech.id, description: 'ARM Cortex, 8051, and ESP32 microcontroller architectures.' },
    { name: 'HTML', categoryId: catEngTech.id, description: 'Semantic markup and web page structuring.' },
    { name: 'CSS', categoryId: catEngTech.id, description: 'Modern responsive styling, Flexbox, Grid, and Tailwind CSS.' },
    { name: 'JavaScript', categoryId: catEngTech.id, description: 'Modern ES6+ JavaScript, asynchronous workflows, and DOM operations.' },
    { name: 'React', categoryId: catEngTech.id, description: 'Component-based reactive UI architecture, state hooks, and routing.' },
    { name: 'Node.js', categoryId: catEngTech.id, description: 'Asynchronous backend runtime, Express RESTful microservices, and middleware.' },
    { name: 'SQL', categoryId: catEngTech.id, description: 'Relational database schema modeling, queries, joins, and indexing.' },
    { name: 'Git', categoryId: catEngTech.id, description: 'Version control workflows, branching, merging, and collaboration.' },
    { name: 'Cloud Computing', categoryId: catEngTech.id, description: 'Cloud infrastructure, AWS/GCP services, server deployment, and virtualization.' },
    { name: 'Linux', categoryId: catEngTech.id, description: 'Linux system administration, shell scripting, and server configuration.' },
    { name: 'Networking', categoryId: catEngTech.id, description: 'TCP/IP, HTTP/HTTPS, DNS, and network protocol fundamentals.' },
    { name: 'DevOps', categoryId: catEngTech.id, description: 'Continuous integration and deployment pipelines, containerization, and monitoring.' },

    // Commerce & Business
    { name: 'Accounting', categoryId: catComBiz.id, description: 'Double-entry bookkeeping, ledger reconciliations, and financial accounting standards.' },
    { name: 'Financial Analysis', categoryId: catComBiz.id, description: 'Ratio analysis, corporate valuation, DCF modeling, and financial statements.' },
    { name: 'Excel', categoryId: catComBiz.id, description: 'Advanced Excel formulas, financial modeling, PivotTables, and data visualizations.' },
    { name: 'Business Analytics', categoryId: catComBiz.id, description: 'Quantitative business performance modeling and data-driven decision making.' },
    { name: 'Marketing', categoryId: catComBiz.id, description: 'Core marketing principles, buyer personas, market segmentation, and value proposition.' },
    { name: 'Digital Marketing', categoryId: catComBiz.id, description: 'Performance marketing, SEO, paid social media campaigns, and conversion funnels.' },
    { name: 'Communication', categoryId: catComBiz.id, description: 'Professional corporate communications, executive presentations, and negotiation.' },
    { name: 'Business Management', categoryId: catComBiz.id, description: 'Organizational behavior, operational management, and project execution.' },
    { name: 'Business Strategy', categoryId: catComBiz.id, description: 'Competitive positioning, market entry strategy, and revenue growth frameworks.' },
  ];

  const skillMap = new Map<string, string>();
  for (const s of skillsData) {
    const created = await prisma.skill.upsert({
      where: { name: s.name },
      update: { categoryId: s.categoryId, description: s.description },
      create: {
        name: s.name,
        categoryId: s.categoryId,
        description: s.description,
      },
    });
    skillMap.set(s.name, created.id);
  }

  // ---------------------------------------------------------
  // 2. Partner Institutions (5 total across 3 disciplines)
  // ---------------------------------------------------------
  console.log('2. Seeding 5 Multi-Discipline Partner Institutions...');

  // Ayurveda Institution 1: Sri Dhanvantari Ayurveda College
  const instDhanvantari: any = await prisma.user.create({
    data: {
      email: 'admin.dhanvantari@demo.ayurveda.com',
      passwordHash,
      role: 'INSTITUTION',
      institutionProfile: {
        create: {
          institutionName: 'Sri Dhanvantari Ayurveda College',
          officialEmail: 'admin.dhanvantari@demo.ayurveda.com',
          institutionType: 'Ayurveda Medical College',
          affiliatedUniversity: 'Tamil Nadu Dr. M.G.R. Medical University',
          address: 'Chennai, Tamil Nadu',
          website: 'https://www.demo-ayurveda-college.edu',
          contactPerson: 'Dr. Lakshmi Narayanan',
          contactNumber: '9000000201',
        },
      },
    },
    include: { institutionProfile: true },
  });

  // Ayurveda Institution 2: South Indian Institute of Ayurveda
  const instSIIA: any = await prisma.user.create({
    data: {
      email: 'admin.siia@demo.ayurveda.com',
      passwordHash,
      role: 'INSTITUTION',
      institutionProfile: {
        create: {
          institutionName: 'South Indian Institute of Ayurveda',
          officialEmail: 'admin.siia@demo.ayurveda.com',
          institutionType: 'Ayurveda Medical College',
          affiliatedUniversity: 'State Health Sciences University',
          address: 'Coimbatore, Tamil Nadu',
          website: 'https://www.demo-siia.edu',
          contactPerson: 'Dr. Hari Menon',
          contactNumber: '9000000202',
        },
      },
    },
    include: { institutionProfile: true },
  });

  // Ayurveda Institution 3: Kerala Ayurveda Research Institute
  const instKARI: any = await prisma.user.create({
    data: {
      email: 'admin.kari@demo.ayurveda.com',
      passwordHash,
      role: 'INSTITUTION',
      institutionProfile: {
        create: {
          institutionName: 'Kerala Ayurveda Research Institute',
          officialEmail: 'admin.kari@demo.ayurveda.com',
          institutionType: 'Research Institute',
          affiliatedUniversity: 'Kerala Health Sciences',
          address: 'Kochi, Kerala',
          website: 'https://www.demo-kari.org',
          contactPerson: 'Dr. Meera Nair',
          contactNumber: '9000000203',
        },
      },
    },
    include: { institutionProfile: true },
  });

  // Engineering Institution: SSN Engineering College
  const instSSN: any = await prisma.user.create({
    data: {
      email: 'admin.ssn@demo.edu',
      passwordHash,
      role: 'INSTITUTION',
      institutionProfile: {
        create: {
          institutionName: 'SSN Engineering College',
          officialEmail: 'admin.ssn@demo.edu',
          institutionType: 'Engineering College',
          affiliatedUniversity: 'Anna University',
          address: 'Chennai, Tamil Nadu',
          website: 'https://www.demo-ssn.edu',
          contactPerson: 'Dr. Ramesh Kumar',
          contactNumber: '9000000204',
        },
      },
    },
    include: { institutionProfile: true },
  });

  // Commerce Institution: South India Commerce Institute
  const instSICI: any = await prisma.user.create({
    data: {
      email: 'admin.commerce@demo.edu',
      passwordHash,
      role: 'INSTITUTION',
      institutionProfile: {
        create: {
          institutionName: 'South India Commerce Institute',
          officialEmail: 'admin.commerce@demo.edu',
          institutionType: 'Commerce College',
          affiliatedUniversity: 'State University',
          address: 'Bengaluru, Karnataka',
          website: 'https://www.demo-commerce.edu',
          contactPerson: 'Dr. Kavitha Rao',
          contactNumber: '9000000205',
        },
      },
    },
    include: { institutionProfile: true },
  });

  // ---------------------------------------------------------
  // 3. Academicians (6 total across 3 disciplines)
  // ---------------------------------------------------------
  console.log('3. Seeding 6 Multi-Discipline Academicians...');

  // Ayurveda 1: Dr. Ananya Krishnan
  const acadAnanya: any = await prisma.user.create({
    data: {
      email: 'ananya.academician@demo.ayurveda.com',
      passwordHash,
      role: 'ACADEMICIAN',
      academicianProfile: {
        create: {
          fullName: 'Dr. Ananya Krishnan',
          phone: '9000000101',
          institutionName: 'Sri Dhanvantari Ayurveda College',
          department: 'Kayachikitsa',
          designation: 'Assistant Professor',
          yearsOfExperience: 7,
          areasOfExpertise: 'Kayachikitsa, Clinical Ayurveda, Ayurvedic Diagnosis, Clinical Research',
          location: 'Chennai, Tamil Nadu',
          bio: 'Assistant Professor of Kayachikitsa specializing in clinical diagnosis, evidence-based therapies, and patient assessment protocols.',
        },
      },
    },
    include: { academicianProfile: true },
  });

  // Ayurveda 2: Dr. Ravi Narayanan
  const acadRavi: any = await prisma.user.create({
    data: {
      email: 'ravi.academician@demo.ayurveda.com',
      passwordHash,
      role: 'ACADEMICIAN',
      academicianProfile: {
        create: {
          fullName: 'Dr. Ravi Narayanan',
          phone: '9000000102',
          institutionName: 'South Indian Institute of Ayurveda',
          department: 'Dravyaguna',
          designation: 'Associate Professor',
          yearsOfExperience: 10,
          areasOfExpertise: 'Dravyaguna, Medicinal Plants, Herbal Medicine, Pharmacognosy',
          location: 'Coimbatore, Tamil Nadu',
          bio: 'Associate Professor of Dravyaguna with expertise in medicinal plant taxonomy, herbal standardization, and pharmacognosy research.',
        },
      },
    },
    include: { academicianProfile: true },
  });

  // Ayurveda 3: Dr. Meenakshi Menon
  const acadMeenakshi: any = await prisma.user.create({
    data: {
      email: 'meenakshi.academician@demo.ayurveda.com',
      passwordHash,
      role: 'ACADEMICIAN',
      academicianProfile: {
        create: {
          fullName: 'Dr. Meenakshi Menon',
          phone: '9000000103',
          institutionName: 'Kerala Ayurveda Research Institute',
          department: 'Rasashastra and Bhaishajya Kalpana',
          designation: 'Professor',
          yearsOfExperience: 12,
          areasOfExpertise: 'Rasashastra, Bhaishajya Kalpana, Ayurvedic Pharmacy, Quality Control',
          location: 'Kochi, Kerala',
          bio: 'Professor of Rasashastra and Bhaishajya Kalpana leading research in Ayurvedic pharmacy, classical formulation science, and quality assurance.',
        },
      },
    },
    include: { academicianProfile: true },
  });

  // Engineering 1: Dr. Suresh Kumar
  const acadSuresh: any = await prisma.user.create({
    data: {
      email: 'suresh.academician@demo.edu',
      passwordHash,
      role: 'ACADEMICIAN',
      academicianProfile: {
        create: {
          fullName: 'Dr. Suresh Kumar',
          phone: '9000000104',
          institutionName: 'SSN Engineering College',
          department: 'Electronics and Communication Engineering',
          designation: 'Associate Professor',
          yearsOfExperience: 9,
          areasOfExpertise: 'Embedded Systems, IoT, Digital Electronics, Microcontrollers',
          location: 'Chennai, Tamil Nadu',
          bio: 'Associate Professor in ECE specializing in embedded firmware development, Arduino microcontroller architectures, and IoT sensor interfaces.',
        },
      },
    },
    include: { academicianProfile: true },
  });

  // Engineering 2: Dr. Priya Raman
  const acadPriyaRaman: any = await prisma.user.create({
    data: {
      email: 'priya.academician@demo.edu',
      passwordHash,
      role: 'ACADEMICIAN',
      academicianProfile: {
        create: {
          fullName: 'Dr. Priya Raman',
          phone: '9000000105',
          institutionName: 'SSN Engineering College',
          department: 'Computer Science and Engineering',
          designation: 'Assistant Professor',
          yearsOfExperience: 6,
          areasOfExpertise: 'Full Stack Development, React, Node.js, Cloud Computing, Database Systems',
          location: 'Chennai, Tamil Nadu',
          bio: 'Assistant Professor in CSE focusing on scalable web applications, React frontends, Node.js microservices, and database design.',
        },
      },
    },
    include: { academicianProfile: true },
  });

  // Commerce: Dr. Karthik Rao
  const acadKarthik: any = await prisma.user.create({
    data: {
      email: 'karthik.academician@demo.edu',
      passwordHash,
      role: 'ACADEMICIAN',
      academicianProfile: {
        create: {
          fullName: 'Dr. Karthik Rao',
          phone: '9000000106',
          institutionName: 'South India Commerce Institute',
          department: 'Commerce',
          designation: 'Associate Professor',
          yearsOfExperience: 8,
          areasOfExpertise: 'Financial Analysis, Accounting, Business Analytics, Digital Marketing',
          location: 'Bengaluru, Karnataka',
          bio: 'Associate Professor in Commerce with deep industry experience in financial modeling, business analytics, and digital marketing strategies.',
        },
      },
    },
    include: { academicianProfile: true },
  });

  // ---------------------------------------------------------
  // 4. Industry Corporate Partners (7 total across 3 disciplines)
  // ---------------------------------------------------------
  console.log('4. Seeding 7 Multi-Discipline Industry Partners...');

  // Ayurveda Industry 1: Dhanvantari Wellness Pvt Ltd
  const indDhanvantari: any = await prisma.user.create({
    data: {
      email: 'hr@dhanvantari.demo',
      passwordHash,
      role: 'INDUSTRY',
      industryProfile: {
        create: {
          companyName: 'Dhanvantari Wellness Pvt Ltd',
          officialEmail: 'hr@dhanvantari.demo',
          industrySector: 'Ayurveda Healthcare & Wellness',
          companySize: '201-500',
          location: 'Chennai, Tamil Nadu',
          website: 'https://www.dhanvantari-demo.com',
          contactPerson: 'Arjun Mehta',
          contactNumber: '9000000301',
          description: 'Premier Ayurveda healthcare, Panchakarma wellness center network, and clinical treatment provider.',
        },
      },
    },
    include: { industryProfile: true },
  });

  // Ayurveda Industry 2: Kerala Herbal Sciences
  const indKeralaHerbal: any = await prisma.user.create({
    data: {
      email: 'hr@keralaherbal.demo',
      passwordHash,
      role: 'INDUSTRY',
      industryProfile: {
        create: {
          companyName: 'Kerala Herbal Sciences',
          officialEmail: 'hr@keralaherbal.demo',
          industrySector: 'Ayurvedic Pharmaceuticals',
          companySize: '51-200',
          location: 'Kochi, Kerala',
          website: 'https://www.keralaherbal-demo.com',
          contactPerson: 'Neha Menon',
          contactNumber: '9000000302',
          description: 'GMP-certified Ayurvedic pharmaceutical manufacturer specializing in herbal medicines, crude drug standardization, and botanical R&D.',
        },
      },
    },
    include: { industryProfile: true },
  });

  // Ayurveda Industry 3: Ayurveda Life Sciences
  const indAyurvedaLife: any = await prisma.user.create({
    data: {
      email: 'hr@ayurvedalife.demo',
      passwordHash,
      role: 'INDUSTRY',
      industryProfile: {
        create: {
          companyName: 'Ayurveda Life Sciences',
          officialEmail: 'hr@ayurvedalife.demo',
          industrySector: 'Healthcare Research & Pharmaceuticals',
          companySize: '201-500',
          location: 'Bengaluru, Karnataka',
          website: 'https://www.ayurvedalife-demo.com',
          contactPerson: 'Rohit Sharma',
          contactNumber: '9000000303',
          description: 'Clinical research organization and pharmaceutical development enterprise bridging classical AYUSH formulations and modern trials.',
        },
      },
    },
    include: { industryProfile: true },
  });

  // Ayurveda Industry 4: Prana Ayurveda Wellness
  const indPrana: any = await prisma.user.create({
    data: {
      email: 'hr@pranaayurveda.demo',
      passwordHash,
      role: 'INDUSTRY',
      industryProfile: {
        create: {
          companyName: 'Prana Ayurveda Wellness',
          officialEmail: 'hr@pranaayurveda.demo',
          industrySector: 'Wellness & Preventive Healthcare',
          companySize: '51-200',
          location: 'Hyderabad, Telangana',
          website: 'https://www.prana-demo.com',
          contactPerson: 'Anjali Rao',
          contactNumber: '9000000304',
          description: 'Specialized holistic wellness and preventive lifestyle medicine center offering personalized dietary and therapeutic programs.',
        },
      },
    },
    include: { industryProfile: true },
  });

  // Engineering Industry 1: TechNova Solutions
  const indTechNova: any = await prisma.user.create({
    data: {
      email: 'hr@technovademo.com',
      passwordHash,
      role: 'INDUSTRY',
      industryProfile: {
        create: {
          companyName: 'TechNova Solutions',
          officialEmail: 'hr@technovademo.com',
          industrySector: 'Software & Cloud Technology',
          companySize: '201-500',
          location: 'Bengaluru, Karnataka',
          website: 'https://www.technova-demo.com',
          contactPerson: 'Arjun Mehta',
          contactNumber: '9000000305',
          description: 'Enterprise software engineering, full stack web development, and cloud transformation solutions partner.',
        },
      },
    },
    include: { industryProfile: true },
  });

  // Engineering Industry 2: Embedded Systems Labs
  const indEmbeddedLabs: any = await prisma.user.create({
    data: {
      email: 'hr@embeddedlabs.demo',
      passwordHash,
      role: 'INDUSTRY',
      industryProfile: {
        create: {
          companyName: 'Embedded Systems Labs',
          officialEmail: 'hr@embeddedlabs.demo',
          industrySector: 'Embedded Systems & IoT',
          companySize: '51-200',
          location: 'Chennai, Tamil Nadu',
          website: 'https://www.embeddedlabs-demo.com',
          contactPerson: 'Vivek Kumar',
          contactNumber: '9000000306',
          description: 'Specialized electronics R&D and firmware engineering lab developing IoT sensors, embedded controllers, and industrial hardware.',
        },
      },
    },
    include: { industryProfile: true },
  });

  // Commerce Industry: FinEdge Consulting
  const indFinEdge: any = await prisma.user.create({
    data: {
      email: 'hr@finedge.demo',
      passwordHash,
      role: 'INDUSTRY',
      industryProfile: {
        create: {
          companyName: 'FinEdge Consulting',
          officialEmail: 'hr@finedge.demo',
          industrySector: 'Finance & Business Consulting',
          companySize: '51-200',
          location: 'Bengaluru, Karnataka',
          website: 'https://www.finedge-demo.com',
          contactPerson: 'Sneha Rao',
          contactNumber: '9000000307',
          description: 'Boutique financial advisory firm specializing in corporate valuation, financial modeling, and business analytics.',
        },
      },
    },
    include: { industryProfile: true },
  });

  // ---------------------------------------------------------
  // 5. Students across 3 Disciplines (10 total)
  // ---------------------------------------------------------
  console.log('5. Seeding 10 Students with Realistic Skill Profiles...');

  // Student 1: Ananya Iyer (Ayurveda - Panchakarma Consultant Target)
  const stuAnanya: any = await prisma.user.create({
    data: {
      email: 'ananya.student@demo.platform.com',
      passwordHash,
      role: 'STUDENT',
      studentProfile: {
        create: {
          fullName: 'Ananya Iyer',
          phone: '+91 98401 11223',
          dob: '2002-05-14',
          gender: 'Female',
          institutionName: 'Sri Dhanvantari Ayurveda College',
          department: 'Kayachikitsa / Panchakarma',
          degree: 'BAMS',
          currentYear: 4,
          cgpa: 8.85,
          graduationYear: 2026,
          location: 'Chennai, Tamil Nadu',
          bio: 'Final year BAMS student passionate about clinical Panchakarma protocols, Nadi Pariksha pulse analysis, and classical detoxification therapies.',
          careerInterests: 'Panchakarma, Ayurvedic Clinical Practice, Integrative Healthcare',
          preferredRoles: 'Panchakarma Consultant, Ayurvedic Clinical Associate',
          preferredLocations: 'Chennai, Bengaluru, Coimbatore',
        },
      },
    },
    include: { studentProfile: true },
  });

  // Student 2: Arjun Menon (Ayurveda - Clinical Researcher Target)
  const stuArjun: any = await prisma.user.create({
    data: {
      email: 'arjun.student2@demo.platform.com',
      passwordHash,
      role: 'STUDENT',
      studentProfile: {
        create: {
          fullName: 'Arjun Menon',
          phone: '+91 98402 22334',
          dob: '2001-08-22',
          gender: 'Male',
          institutionName: 'Sri Dhanvantari Ayurveda College',
          department: 'Kayachikitsa',
          degree: 'BAMS',
          currentYear: 5,
          cgpa: 8.65,
          graduationYear: 2026,
          location: 'Chennai, Tamil Nadu',
          bio: 'Interning BAMS physician dedicated to evidence-based Ayurvedic research, GCP trial methodologies, and pharmacological case studies.',
          careerInterests: 'Ayurvedic Clinical Research, Trial Coordination, Pharmacovigilance',
          preferredRoles: 'Ayurvedic Clinical Researcher, Research Associate',
          preferredLocations: 'Chennai, Bengaluru, Kochi',
        },
      },
    },
    include: { studentProfile: true },
  });

  // Student 3: Meera Krishnan (Ayurveda - Dravyaguna & Herbology Target)
  const stuMeera: any = await prisma.user.create({
    data: {
      email: 'meera.student@demo.platform.com',
      passwordHash,
      role: 'STUDENT',
      studentProfile: {
        create: {
          fullName: 'Meera Krishnan',
          phone: '+91 98403 33445',
          dob: '2003-02-18',
          gender: 'Female',
          institutionName: 'Sri Dhanvantari Ayurveda College',
          department: 'Dravyaguna',
          degree: 'BAMS',
          currentYear: 3,
          cgpa: 9.15,
          graduationYear: 2027,
          location: 'Chennai, Tamil Nadu',
          bio: 'High-performing 3rd-year BAMS student with deep botanical knowledge in Dravyaguna, medicinal plant standardization, and herbal formulations.',
          careerInterests: 'Dravyaguna, Herbal Drug Standardization, Botanical Research',
          preferredRoles: 'Herbal Medicine Research Intern, Dravyaguna Specialist',
          preferredLocations: 'Chennai, Kochi, Coimbatore',
        },
      },
    },
    include: { studentProfile: true },
  });

  // Student 4: Rohan Sharma (Ayurveda - Ayurvedic Pharmacy Target)
  const stuRohan: any = await prisma.user.create({
    data: {
      email: 'rohan.student@demo.platform.com',
      passwordHash,
      role: 'STUDENT',
      studentProfile: {
        create: {
          fullName: 'Rohan Sharma',
          phone: '+91 98404 44556',
          dob: '2002-11-09',
          gender: 'Male',
          institutionName: 'South Indian Institute of Ayurveda',
          department: 'Rasashastra and Bhaishajya Kalpana',
          degree: 'BAMS',
          currentYear: 4,
          cgpa: 8.45,
          graduationYear: 2026,
          location: 'Coimbatore, Tamil Nadu',
          bio: 'Passionate about Ayurvedic pharmaceutical manufacturing, Bhasma nanotechnology, and GMP quality assurance in classical AYUSH preparations.',
          careerInterests: 'Ayurvedic Pharmacy, Rasashastra, Quality Control',
          preferredRoles: 'Ayurvedic Pharmacy Intern, Formulation QC Specialist',
          preferredLocations: 'Coimbatore, Kochi, Chennai',
        },
      },
    },
    include: { studentProfile: true },
  });

  // Student 5: Kavya Nair (Ayurveda - Swasthavritta & Yoga Target)
  const stuKavya: any = await prisma.user.create({
    data: {
      email: 'kavya.student@demo.platform.com',
      passwordHash,
      role: 'STUDENT',
      studentProfile: {
        create: {
          fullName: 'Kavya Nair',
          phone: '+91 98405 55667',
          dob: '2001-09-30',
          gender: 'Female',
          institutionName: 'South Indian Institute of Ayurveda',
          department: 'Swasthavritta',
          degree: 'BAMS',
          currentYear: 5,
          cgpa: 8.92,
          graduationYear: 2026,
          location: 'Coimbatore, Tamil Nadu',
          bio: 'Focusing on preventive healthcare, therapeutic yoga protocols, personalized Dinacharya lifestyle counseling, and dietary management.',
          careerInterests: 'Swasthavritta, Yoga Therapy, Preventive Wellness',
          preferredRoles: 'Wellness Consultant, Lifestyle Physician',
          preferredLocations: 'Coimbatore, Hyderabad, Bengaluru',
        },
      },
    },
    include: { studentProfile: true },
  });

  // Student 6: Vishal Reddy (Ayurveda - Digital Health Target)
  const stuVishal: any = await prisma.user.create({
    data: {
      email: 'vishal.student@demo.platform.com',
      passwordHash,
      role: 'STUDENT',
      studentProfile: {
        create: {
          fullName: 'Vishal Reddy',
          phone: '+91 98406 66778',
          dob: '2002-04-12',
          gender: 'Male',
          institutionName: 'Kerala Ayurveda Research Institute',
          department: 'Samhita & Siddhanta',
          degree: 'BAMS',
          currentYear: 4,
          cgpa: 8.25,
          graduationYear: 2026,
          location: 'Kochi, Kerala',
          bio: 'Blending traditional Ayurvedic clinical knowledge with digital health record systems, AYUSH informatics, and biostatistical analysis.',
          careerInterests: 'Digital Health, Medical Informatics, Clinical Documentation',
          preferredRoles: 'Healthcare Documentation Intern, AYUSH Informatics Trainee',
          preferredLocations: 'Kochi, Bengaluru, Chennai',
        },
      },
    },
    include: { studentProfile: true },
  });

  // Student 7: Priya Sharma (Engineering - Embedded & IoT Target)
  const stuPriya: any = await prisma.user.create({
    data: {
      email: 'priya.engineering@demo.platform.com',
      passwordHash,
      role: 'STUDENT',
      studentProfile: {
        create: {
          fullName: 'Priya Sharma',
          phone: '+91 98407 77889',
          dob: '2003-07-15',
          gender: 'Female',
          institutionName: 'SSN Engineering College',
          department: 'Electronics and Communication Engineering',
          degree: 'B.E. ECE',
          currentYear: 3,
          cgpa: 8.95,
          graduationYear: 2027,
          location: 'Chennai, Tamil Nadu',
          bio: 'Electronics engineer specialized in Embedded C firmware, ARM Cortex microcontrollers, Arduino prototyping, and connected IoT smart sensors.',
          careerInterests: 'Embedded Systems, IoT Hardware, Firmware Engineering',
          preferredRoles: 'Embedded Systems Intern, IoT Development Intern',
          preferredLocations: 'Chennai, Bengaluru, Hyderabad',
        },
      },
    },
    include: { studentProfile: true },
  });

  // Student 8: Rahul Kumar (Engineering - Full Stack Web Dev Target)
  const stuRahul: any = await prisma.user.create({
    data: {
      email: 'rahul.engineering@demo.platform.com',
      passwordHash,
      role: 'STUDENT',
      studentProfile: {
        create: {
          fullName: 'Rahul Kumar',
          phone: '+91 98408 88990',
          dob: '2002-03-25',
          gender: 'Male',
          institutionName: 'SSN Engineering College',
          department: 'Computer Science and Engineering',
          degree: 'B.Tech CSE',
          currentYear: 4,
          cgpa: 8.75,
          graduationYear: 2026,
          location: 'Chennai, Tamil Nadu',
          bio: 'Full Stack engineer proficient in TypeScript, React, Node.js, Express, PostgreSQL, Prisma, and scalable cloud microservice architectures.',
          careerInterests: 'Full Stack Web Development, Cloud Architecture, Distributed Systems',
          preferredRoles: 'Full Stack Development Intern, Junior Full Stack Developer',
          preferredLocations: 'Chennai, Bengaluru, Hyderabad',
        },
      },
    },
    include: { studentProfile: true },
  });

  // Student 9: Sneha Patel (Commerce - Financial Analysis Target)
  const stuSneha: any = await prisma.user.create({
    data: {
      email: 'sneha.commerce@demo.platform.com',
      passwordHash,
      role: 'STUDENT',
      studentProfile: {
        create: {
          fullName: 'Sneha Patel',
          phone: '+91 98409 99001',
          dob: '2003-01-10',
          gender: 'Female',
          institutionName: 'South India Commerce Institute',
          department: 'Commerce & Financial Studies',
          degree: 'B.Com',
          currentYear: 3,
          cgpa: 9.35,
          graduationYear: 2026,
          location: 'Bengaluru, Karnataka',
          bio: 'Finance major with deep analytical skills in DCF corporate valuation, advanced Excel modeling, financial statement ratios, and business intelligence.',
          careerInterests: 'Corporate Finance, Financial Modeling, Equity Valuation',
          preferredRoles: 'Financial Analysis Intern, Junior Financial Analyst',
          preferredLocations: 'Bengaluru, Mumbai, Chennai',
        },
      },
    },
    include: { studentProfile: true },
  });

  // Student 10: Aditya Rao (Commerce - Digital Marketing Target)
  const stuAditya: any = await prisma.user.create({
    data: {
      email: 'aditya.commerce@demo.platform.com',
      passwordHash,
      role: 'STUDENT',
      studentProfile: {
        create: {
          fullName: 'Aditya Rao',
          phone: '+91 98410 00112',
          dob: '2004-06-19',
          gender: 'Male',
          institutionName: 'South India Commerce Institute',
          department: 'Commerce & Management',
          degree: 'B.Com',
          currentYear: 2,
          cgpa: 8.50,
          graduationYear: 2027,
          location: 'Bengaluru, Karnataka',
          bio: 'Creative commerce student specializing in digital growth marketing, paid acquisition campaigns, SEO performance, and market analytics.',
          careerInterests: 'Digital Marketing, Growth Strategy, Brand Management',
          preferredRoles: 'Digital Marketing Intern, Digital Marketing Associate',
          preferredLocations: 'Bengaluru, Hyderabad, Chennai',
        },
      },
    },
    include: { studentProfile: true },
  });

  // Helper to add student skills
  const addStudentSkill = async (studentId: string, skillName: string, level: string, score: number) => {
    const sId = skillMap.get(skillName);
    if (!sId) return;
    await prisma.studentSkillProfile.create({
      data: {
        studentId,
        skillId: sId,
        proficiencyLevel: level,
        scorePercentage: score,
        verified: score >= 80,
        verificationStatus: score >= 80 ? 'VERIFIED' : 'PENDING',
        lastAssessedAt: new Date(),
      },
    });
  };

  // Assign Student Skills
  await addStudentSkill(stuAnanya.studentProfile.id, 'Ayurvedic Fundamentals', 'EXPERT', 90);
  await addStudentSkill(stuAnanya.studentProfile.id, 'Ayurvedic Diagnosis', 'ADVANCED', 85);
  await addStudentSkill(stuAnanya.studentProfile.id, 'Panchakarma', 'ADVANCED', 80);
  await addStudentSkill(stuAnanya.studentProfile.id, 'Abhyanga', 'ADVANCED', 80);
  await addStudentSkill(stuAnanya.studentProfile.id, 'Swedana', 'BEGINNER', 40);

  await addStudentSkill(stuArjun.studentProfile.id, 'Kayachikitsa', 'ADVANCED', 85);
  await addStudentSkill(stuArjun.studentProfile.id, 'Clinical Research', 'ADVANCED', 80);
  await addStudentSkill(stuArjun.studentProfile.id, 'Research Methodology', 'ADVANCED', 85);
  await addStudentSkill(stuArjun.studentProfile.id, 'Biostatistics', 'INTERMEDIATE', 75);

  await addStudentSkill(stuMeera.studentProfile.id, 'Dravyaguna', 'EXPERT', 90);
  await addStudentSkill(stuMeera.studentProfile.id, 'Medicinal Plants', 'ADVANCED', 85);
  await addStudentSkill(stuMeera.studentProfile.id, 'Herbal Medicine', 'ADVANCED', 85);
  await addStudentSkill(stuMeera.studentProfile.id, 'Pharmacognosy', 'ADVANCED', 80);

  await addStudentSkill(stuRohan.studentProfile.id, 'Rasashastra', 'ADVANCED', 80);
  await addStudentSkill(stuRohan.studentProfile.id, 'Bhaishajya Kalpana', 'ADVANCED', 85);
  await addStudentSkill(stuRohan.studentProfile.id, 'Ayurvedic Pharmacy', 'ADVANCED', 85);
  await addStudentSkill(stuRohan.studentProfile.id, 'Quality Control', 'ADVANCED', 80);

  await addStudentSkill(stuKavya.studentProfile.id, 'Yoga', 'EXPERT', 90);
  await addStudentSkill(stuKavya.studentProfile.id, 'Lifestyle Counselling', 'ADVANCED', 85);
  await addStudentSkill(stuKavya.studentProfile.id, 'Nutrition', 'ADVANCED', 85);
  await addStudentSkill(stuKavya.studentProfile.id, 'Ayurvedic Fundamentals', 'ADVANCED', 80);

  await addStudentSkill(stuVishal.studentProfile.id, 'Digital Health', 'ADVANCED', 85);
  await addStudentSkill(stuVishal.studentProfile.id, 'Biostatistics', 'ADVANCED', 80);
  await addStudentSkill(stuVishal.studentProfile.id, 'Scientific Writing', 'ADVANCED', 80);
  await addStudentSkill(stuVishal.studentProfile.id, 'Clinical Research', 'INTERMEDIATE', 75);

  await addStudentSkill(stuPriya.studentProfile.id, 'C', 'ADVANCED', 85);
  await addStudentSkill(stuPriya.studentProfile.id, 'Embedded C', 'EXPERT', 90);
  await addStudentSkill(stuPriya.studentProfile.id, 'Arduino', 'ADVANCED', 85);
  await addStudentSkill(stuPriya.studentProfile.id, 'Digital Electronics', 'ADVANCED', 85);
  await addStudentSkill(stuPriya.studentProfile.id, 'IoT', 'ADVANCED', 85);

  await addStudentSkill(stuRahul.studentProfile.id, 'JavaScript', 'ADVANCED', 85);
  await addStudentSkill(stuRahul.studentProfile.id, 'React', 'EXPERT', 90);
  await addStudentSkill(stuRahul.studentProfile.id, 'Node.js', 'ADVANCED', 85);
  await addStudentSkill(stuRahul.studentProfile.id, 'SQL', 'ADVANCED', 80);
  await addStudentSkill(stuRahul.studentProfile.id, 'Git', 'ADVANCED', 80);

  await addStudentSkill(stuSneha.studentProfile.id, 'Accounting', 'EXPERT', 90);
  await addStudentSkill(stuSneha.studentProfile.id, 'Financial Analysis', 'EXPERT', 95);
  await addStudentSkill(stuSneha.studentProfile.id, 'Excel', 'EXPERT', 90);
  await addStudentSkill(stuSneha.studentProfile.id, 'Business Analytics', 'ADVANCED', 85);

  await addStudentSkill(stuAditya.studentProfile.id, 'Marketing', 'ADVANCED', 85);
  await addStudentSkill(stuAditya.studentProfile.id, 'Digital Marketing', 'EXPERT', 90);
  await addStudentSkill(stuAditya.studentProfile.id, 'Communication', 'ADVANCED', 85);
  await addStudentSkill(stuAditya.studentProfile.id, 'Business Management', 'ADVANCED', 80);

  // ---------------------------------------------------------
  // 6. Courses across Disciplines (18 total courses)
  // ---------------------------------------------------------
  console.log('6. Seeding 18 Published Courses...');

  const createCourse = async (params: {
    title: string;
    description: string;
    providerId: string;
    providerRole: string;
    providerName: string;
    category: string;
    skillLevel: string;
    duration: string;
    mode: string;
    skills: string[];
    modules: { title: string; orderIndex: number; lessons: { title: string; content: string }[] }[];
  }) => {
    const course = await prisma.course.create({
      data: {
        title: params.title,
        description: params.description,
        providerId: params.providerId,
        providerRole: params.providerRole,
        providerName: params.providerName,
        category: params.category,
        skillLevel: params.skillLevel,
        duration: params.duration,
        mode: params.mode,
        status: 'PUBLISHED',
        certificateAvailable: true,
        skills: {
          create: params.skills
            .map((s) => {
              const id = skillMap.get(s);
              return id ? { skillId: id } : null;
            })
            .filter(Boolean) as any[],
        },
        modules: {
          create: params.modules.map((m) => ({
            title: m.title,
            orderIndex: m.orderIndex,
            lessons: {
              create: m.lessons.map((l, lIdx) => ({
                title: l.title,
                content: l.content,
                orderIndex: lIdx,
                durationMinutes: 45,
              })),
            },
          })),
        },
      },
      include: { modules: { include: { lessons: true } } },
    });
    return course;
  };

  // Course 1: Clinical Ayurveda and Diagnosis (Dr. Ananya Krishnan)
  const courseAyuDiag = await createCourse({
    title: 'Clinical Ayurveda and Diagnosis',
    description: 'Comprehensive clinical diagnosis methodology covering Roganidana, Ashtavidha Pariksha pulse examination, and bedside patient assessment.',
    providerId: acadAnanya.id,
    providerRole: 'ACADEMICIAN',
    providerName: 'Dr. Ananya Krishnan (Sri Dhanvantari Ayurveda College)',
    category: 'Ayurveda & Healthcare',
    skillLevel: 'INTERMEDIATE',
    duration: '6 weeks',
    mode: 'ONLINE',
    skills: ['Ayurvedic Diagnosis', 'Clinical Ayurveda', 'Patient Assessment', 'Ayurvedic Fundamentals'],
    modules: [
      {
        title: 'Module 1: Ashtavidha Pariksha & Clinical Examination',
        orderIndex: 0,
        lessons: [
          { title: 'Nadi Pariksha Principles & Pulse Diagnostic Techniques', content: 'Comprehensive examination of radial pulse characteristics and Vata-Pitta-Kapha variations.' },
          { title: 'Sparsha, Roopa, and Bedside Clinical Metrics', content: 'Evaluating tactile feedback, complexion, tongue coating (Jihwa), and physiological vital signs.' },
        ],
      },
      {
        title: 'Module 2: Differential Diagnosis in Roganidana',
        orderIndex: 1,
        lessons: [
          { title: 'Shat Kriya Kala & Disease Pathogenesis Stages', content: 'Detailed clinical timeline from Sanchaya to Bheda in chronic diseases.' },
          { title: 'Differentiating Vata Vyadhi vs Autoimmune Manifestations', content: 'Differential diagnosis protocols for rheumatic, neurodegenerative, and metabolic disorders.' },
        ],
      },
    ],
  });

  // Course 2: Dravyaguna and Medicinal Plants (Dr. Ravi Narayanan)
  const courseDravya = await createCourse({
    title: 'Dravyaguna and Medicinal Plants',
    description: 'Advanced pharmacology of Ayurvedic medicinal flora, Rasa Panchaka therapeutic modeling, and crude drug taxonomy.',
    providerId: acadRavi.id,
    providerRole: 'ACADEMICIAN',
    providerName: 'Dr. Ravi Narayanan (South Indian Institute of Ayurveda)',
    category: 'Ayurveda & Healthcare',
    skillLevel: 'INTERMEDIATE',
    duration: '5 weeks',
    mode: 'HYBRID',
    skills: ['Dravyaguna', 'Medicinal Plants', 'Herbal Identification', 'Herbal Medicine'],
    modules: [
      {
        title: 'Module 1: Principles of Rasa Panchaka & Karma',
        orderIndex: 0,
        lessons: [
          { title: 'Rasa, Guna, Veerya, Vipaka & Prabhava Interactions', content: 'Pharmacological foundations of Ayurvedic single drugs and compound actions.' },
          { title: 'Botanical Herbarium & Field Plant Identification', content: 'Macroscopic and microscopic taxonomy of authentic medicinal flora in the Western Ghats.' },
        ],
      },
      {
        title: 'Module 2: Standardisation & Phytochemical Screening',
        orderIndex: 1,
        lessons: [
          { title: 'Thin-Layer Chromatography (TLC) of Herbal Actives', content: 'Standardizing active biomarker levels in crude drug samples.' },
          { title: 'Heavy Metal Limits & AYUSH Pharmacopoeial Standards', content: 'Ensuring botanical drug safety against microbial contaminants and adulterants.' },
        ],
      },
    ],
  });

  // Course 3: Ayurvedic Pharmacy and Formulation Science (Dr. Meenakshi Menon)
  const coursePharmacy = await createCourse({
    title: 'Ayurvedic Pharmacy and Formulation Science',
    description: 'Classical Bhaishajya Kalpana manufacturing techniques, mineral Shodhana, and GMP quality assurance in AYUSH manufacturing.',
    providerId: acadMeenakshi.id,
    providerRole: 'ACADEMICIAN',
    providerName: 'Dr. Meenakshi Menon (Kerala Ayurveda Research Institute)',
    category: 'Ayurveda & Healthcare',
    skillLevel: 'ADVANCED',
    duration: '8 weeks',
    mode: 'HYBRID',
    skills: ['Ayurvedic Pharmacy', 'Bhaishajya Kalpana', 'Quality Control', 'Rasashastra'],
    modules: [
      {
        title: 'Module 1: Classical Shodhana & Nanoparticle Bhasma Kalpana',
        orderIndex: 0,
        lessons: [
          { title: 'Purification Protocols (Shodhana) of Metals & Minerals', content: 'Standard operating procedures for mineral processing and detoxifying crude minerals.' },
          { title: 'Marana & Incineration Protocols for Bhasma Nanoparticles', content: 'Thermal transformation cycles and particle size reduction characterization.' },
        ],
      },
      {
        title: 'Module 2: Solid, Liquid & Ointment Dosage Forms',
        orderIndex: 1,
        lessons: [
          { title: 'Asava, Arishta & Medicated Ghrita Formulations', content: 'Natural fermentation processes and lipid-soluble active extractions.' },
          { title: 'AYUSH GMP, Heavy Metal Testing & Stability', content: 'Ensuring manufacturing compliance, shelf-life validation, and quality certification.' },
        ],
      },
    ],
  });

  // Course 4: Embedded Systems Fundamentals (Dr. Suresh Kumar)
  const courseEmbedded = await createCourse({
    title: 'Embedded Systems Fundamentals',
    description: 'Hands-on embedded firmware development, Arduino microcontroller architectures, peripheral interfacing, and register-level programming in C.',
    providerId: acadSuresh.id,
    providerRole: 'ACADEMICIAN',
    providerName: 'Dr. Suresh Kumar (SSN Engineering College)',
    category: 'Engineering & Technology',
    skillLevel: 'BEGINNER',
    duration: '6 weeks',
    mode: 'ONLINE',
    skills: ['Embedded C', 'Arduino', 'Digital Electronics', 'Microcontrollers'],
    modules: [
      {
        title: 'Module 1: Microcontroller Architecture & Memory Mapping',
        orderIndex: 0,
        lessons: [
          { title: 'Harvard vs Von Neumann Architecture & Registers', content: 'Understanding CPU registers, RAM, Flash memory, and boot sequences.' },
          { title: 'GPIO Configuration & Bitwise Operations in Embedded C', content: 'Direct register manipulation for high-speed input/output toggling.' },
        ],
      },
      {
        title: 'Module 2: Timers, Interrupts & Communication Protocols',
        orderIndex: 1,
        lessons: [
          { title: 'Hardware Interrupts & Timer PWM Waveform Generation', content: 'Writing interrupt service routines (ISR) and PWM motor controls.' },
          { title: 'Serial Protocols: UART, SPI & I2C Sensor Interfacing', content: 'Connecting digital temperature, accelerometer, and display peripherals.' },
        ],
      },
    ],
  });

  // Course 5: Full Stack Web Development (Dr. Priya Raman)
  const courseFullStack = await createCourse({
    title: 'Full Stack Web Development',
    description: 'Modern full-stack web application engineering from responsive React user interfaces to scalable Node.js REST microservices and SQL databases.',
    providerId: acadPriyaRaman.id,
    providerRole: 'ACADEMICIAN',
    providerName: 'Dr. Priya Raman (SSN Engineering College)',
    category: 'Engineering & Technology',
    skillLevel: 'INTERMEDIATE',
    duration: '8 weeks',
    mode: 'ONLINE',
    skills: ['JavaScript', 'React', 'Node.js', 'SQL'],
    modules: [
      {
        title: 'Module 1: Modern JavaScript ES6+ & TypeScript Essentials',
        orderIndex: 0,
        lessons: [
          { title: 'Asynchronous JavaScript: Promises, Async/Await & Event Loop', content: 'Mastering non-blocking execution, closures, and type safety.' },
          { title: 'Component Architecture & State Hooks in React', content: 'Building modular components, custom hooks, and context state management.' },
        ],
      },
      {
        title: 'Module 2: Backend REST APIs & Relational Database Design',
        orderIndex: 1,
        lessons: [
          { title: 'Express Middleware & JWT Authentication Security', content: 'Architecting secure RESTful endpoints, CORS, and role-based guards.' },
          { title: 'PostgreSQL Modeling, Joins, and Prisma ORM Migrations', content: 'Designing normalized relational schemas and database indexes.' },
        ],
      },
    ],
  });

  // Course 6: Financial Analysis and Business Analytics (Dr. Karthik Rao)
  const courseFinance = await createCourse({
    title: 'Financial Analysis and Business Analytics',
    description: 'Corporate financial statement analysis, discounted cash flow (DCF) valuation models, advanced Excel techniques, and data analytics.',
    providerId: acadKarthik.id,
    providerRole: 'ACADEMICIAN',
    providerName: 'Dr. Karthik Rao (South India Commerce Institute)',
    category: 'Commerce & Business',
    skillLevel: 'INTERMEDIATE',
    duration: '6 weeks',
    mode: 'ONLINE',
    skills: ['Financial Analysis', 'Excel', 'Business Analytics', 'Accounting'],
    modules: [
      {
        title: 'Module 1: Financial Statement Analysis & Ratio Metrics',
        orderIndex: 0,
        lessons: [
          { title: 'Income Statement, Balance Sheet & Cash Flow Modeling', content: 'Three-statement financial modeling and DuPont ratio breakdown.' },
          { title: 'Advanced Excel Financial Functions & Pivot Modeling', content: 'INDEX-MATCH, XLOOKUP, sensitivity tables, and scenario analysis.' },
        ],
      },
      {
        title: 'Module 2: Corporate Valuation & Business Analytics KPIs',
        orderIndex: 1,
        lessons: [
          { title: 'Discounted Cash Flow (DCF) & WACC Calculations', content: 'Enterprise value estimation, terminal growth rates, and cost of capital.' },
          { title: 'Business Performance Dashboards & Predictive KPIs', content: 'Creating executive analytics visualizations and variance analysis.' },
        ],
      },
    ],
  });

  // Additional 12 Courses across Domains to reach 18 courses
  await createCourse({
    title: 'Panchakarma Clinical Protocols & Detoxification',
    description: 'In-depth therapeutic protocols for Snehana, Swedana, Vamana, Virechana, and Basti in hospital settings.',
    providerId: indDhanvantari.id,
    providerRole: 'INDUSTRY',
    providerName: 'Dhanvantari Wellness Pvt Ltd',
    category: 'Ayurveda & Healthcare',
    skillLevel: 'INTERMEDIATE',
    duration: '6 weeks',
    mode: 'HYBRID',
    skills: ['Panchakarma', 'Abhyanga', 'Swedana', 'Basti'],
    modules: [{ title: 'Therapeutic Snehana and Swedana Protocols', orderIndex: 0, lessons: [{ title: 'Classical Snehana Therapy', content: 'Internal and external oleation methods.' }] }],
  });

  await createCourse({
    title: 'Herbal Drug Quality Assurance & GMP Standards',
    description: 'Standardization, batch documentation, and AYUSH regulatory compliance in herbal pharmaceuticals.',
    providerId: indKeralaHerbal.id,
    providerRole: 'INDUSTRY',
    providerName: 'Kerala Herbal Sciences',
    category: 'Ayurveda & Healthcare',
    skillLevel: 'ADVANCED',
    duration: '6 weeks',
    mode: 'HYBRID',
    skills: ['Quality Control', 'Herbal Medicine', 'Ayurvedic Pharmacy', 'Pharmacognosy'],
    modules: [{ title: 'Phytochemical QC Methods', orderIndex: 0, lessons: [{ title: 'Spectroscopic QC Standards', content: 'UV-Vis and HPTLC testing standards.' }] }],
  });

  await createCourse({
    title: 'Evidence-Based Clinical Trial Design in AYUSH',
    description: 'Good Clinical Practice (GCP) guidelines, protocol design, ethical clearances, and biostatistical analysis in Ayurveda trials.',
    providerId: indAyurvedaLife.id,
    providerRole: 'INDUSTRY',
    providerName: 'Ayurveda Life Sciences',
    category: 'Ayurveda & Healthcare',
    skillLevel: 'ADVANCED',
    duration: '7 weeks',
    mode: 'ONLINE',
    skills: ['Clinical Research', 'Research Methodology', 'Biostatistics', 'Scientific Writing'],
    modules: [{ title: 'AYUSH GCP Guidelines', orderIndex: 0, lessons: [{ title: 'Ethics & Consent in Trials', content: 'Human ethical standards in clinical studies.' }] }],
  });

  await createCourse({
    title: 'Ayurvedic Nutrition, Pathya & Lifestyle Management',
    description: 'Preventive healthcare dietary planning, seasonal routines (Ritucharya), and therapeutic cooking principles.',
    providerId: indPrana.id,
    providerRole: 'INDUSTRY',
    providerName: 'Prana Ayurveda Wellness',
    category: 'Ayurveda & Healthcare',
    skillLevel: 'BEGINNER',
    duration: '4 weeks',
    mode: 'ONLINE',
    skills: ['Nutrition', 'Lifestyle Counselling', 'Ayurvedic Fundamentals'],
    modules: [{ title: 'Personalized Dosha Dietetics', orderIndex: 0, lessons: [{ title: 'Ahara Parinamakarabhava', content: 'Digestion and dietary metabolism.' }] }],
  });

  await createCourse({
    title: 'Ayurvedic Hospital Administration & Clinical Operations',
    description: 'Managing inpatient Panchakarma wards, patient care pathways, and clinical records.',
    providerId: instDhanvantari.id,
    providerRole: 'INSTITUTION',
    providerName: 'Sri Dhanvantari Ayurveda College',
    category: 'Ayurveda & Healthcare',
    skillLevel: 'INTERMEDIATE',
    duration: '5 weeks',
    mode: 'HYBRID',
    skills: ['Ayurvedic Fundamentals', 'Clinical Research', 'Quality Control'],
    modules: [{ title: 'IPD/OPD Operations', orderIndex: 0, lessons: [{ title: 'Clinical Governance', content: 'Standards for hospital ward administration.' }] }],
  });

  await createCourse({
    title: 'Medicinal Plant Cultivation & Sustainable Agrotechniques',
    description: 'Good Agricultural and Collection Practices (GACP) for endangered Ayurvedic botanical species.',
    providerId: instSIIA.id,
    providerRole: 'INSTITUTION',
    providerName: 'South Indian Institute of Ayurveda',
    category: 'Ayurveda & Healthcare',
    skillLevel: 'BEGINNER',
    duration: '4 weeks',
    mode: 'OFFLINE',
    skills: ['Medicinal Plants', 'Dravyaguna'],
    modules: [{ title: 'GACP Protocols', orderIndex: 0, lessons: [{ title: 'Organic Cultivation', content: 'Harvesting timings and soil management.' }] }],
  });

  await createCourse({
    title: 'Therapeutic Yoga & Rehabilitation Sciences',
    description: 'Customized yoga asana and pranayama protocols for musculoskeletal and metabolic rehabilitation.',
    providerId: instSIIA.id,
    providerRole: 'INSTITUTION',
    providerName: 'South Indian Institute of Ayurveda',
    category: 'Ayurveda & Healthcare',
    skillLevel: 'INTERMEDIATE',
    duration: '5 weeks',
    mode: 'ONLINE',
    skills: ['Yoga', 'Lifestyle Counselling', 'Ayurvedic Fundamentals'],
    modules: [{ title: 'Yoga Anatomy & Asana Therapeutics', orderIndex: 0, lessons: [{ title: 'Pranayama Protocols', content: 'Autonomic nervous system regulation.' }] }],
  });

  await createCourse({
    title: 'Ayurvedic Informatics & EHR Platform Engineering',
    description: 'Designing electronic health record systems tailored to Ayurvedic diagnostic and prescription paradigms.',
    providerId: instKARI.id,
    providerRole: 'INSTITUTION',
    providerName: 'Kerala Ayurveda Research Institute',
    category: 'Ayurveda & Healthcare',
    skillLevel: 'INTERMEDIATE',
    duration: '6 weeks',
    mode: 'ONLINE',
    skills: ['Digital Health', 'Biostatistics', 'Scientific Writing'],
    modules: [{ title: 'AYUSH EHR Standards', orderIndex: 0, lessons: [{ title: 'Standard Terminology NAMASTE Portal', content: 'Integration with national AYUSH registry.' }] }],
  });

  await createCourse({
    title: 'Classical Nadi Pariksha Masterclass',
    description: 'Pulse diagnosis masterclass for assessing subtle sub-dosha imbalances and prognostic evaluation.',
    providerId: instDhanvantari.id,
    providerRole: 'INSTITUTION',
    providerName: 'Sri Dhanvantari Ayurveda College',
    category: 'Ayurveda & Healthcare',
    skillLevel: 'ADVANCED',
    duration: '4 weeks',
    mode: 'HYBRID',
    skills: ['Ayurvedic Diagnosis', 'Ayurvedic Fundamentals', 'Patient Assessment'],
    modules: [{ title: 'Sub-dosha Nadi Patterns', orderIndex: 0, lessons: [{ title: 'Gati and Velocity in Nadi', content: 'Interpreting Sarpa, Mandooka, and Hamsa gati.' }] }],
  });

  await createCourse({
    title: 'IoT Sensor Networks & Cloud Telemetry',
    description: 'Industrial IoT edge computing, MQTT telemetry, sensor interfacing, and cloud ingestion pipelines.',
    providerId: indEmbeddedLabs.id,
    providerRole: 'INDUSTRY',
    providerName: 'Embedded Systems Labs',
    category: 'Engineering & Technology',
    skillLevel: 'INTERMEDIATE',
    duration: '6 weeks',
    mode: 'ONLINE',
    skills: ['IoT', 'Embedded C', 'Sensors', 'Digital Electronics'],
    modules: [{ title: 'Wireless Sensor Protocols', orderIndex: 0, lessons: [{ title: 'MQTT Telemetry Streams', content: 'Publish-subscribe messaging for connected hardware.' }] }],
  });

  await createCourse({
    title: 'Cloud Infrastructure & Microservices Architecture',
    description: 'Containerization, Docker, Kubernetes, CI/CD pipelines, and cloud service deployment.',
    providerId: indTechNova.id,
    providerRole: 'INDUSTRY',
    providerName: 'TechNova Solutions',
    category: 'Engineering & Technology',
    skillLevel: 'ADVANCED',
    duration: '7 weeks',
    mode: 'ONLINE',
    skills: ['Cloud Computing', 'Linux', 'Node.js', 'DevOps'],
    modules: [{ title: 'Docker Containerization', orderIndex: 0, lessons: [{ title: 'Container Orchestration', content: 'Deploying multi-tier cloud applications.' }] }],
  });

  await createCourse({
    title: 'Digital Marketing & Growth Funnel Optimization',
    description: 'Search engine optimization, performance marketing, conversion rate optimization, and brand growth.',
    providerId: indFinEdge.id,
    providerRole: 'INDUSTRY',
    providerName: 'FinEdge Consulting',
    category: 'Commerce & Business',
    skillLevel: 'BEGINNER',
    duration: '5 weeks',
    mode: 'ONLINE',
    skills: ['Digital Marketing', 'Marketing', 'Communication', 'Business Analytics'],
    modules: [{ title: 'Performance Funnels', orderIndex: 0, lessons: [{ title: 'CAC & LTV Optimization', content: 'Measuring user acquisition economics.' }] }],
  });

  // ---------------------------------------------------------
  // 7. Enrollments and Certificates for Demo Students
  // ---------------------------------------------------------
  console.log('7. Seeding Student Course Enrollments and Certificates...');

  // Meera Krishnan completed Dravyaguna course (100%) -> Certificate
  const meeraEnrollment = await prisma.courseEnrollment.create({
    data: {
      studentId: stuMeera.studentProfile.id,
      courseId: courseDravya.id,
      progressPercentage: 100,
      status: 'COMPLETED',
      completedAt: new Date(),
      certificateStatus: 'ISSUED',
    },
  });

  for (const m of courseDravya.modules) {
    for (const l of m.lessons) {
      await prisma.courseLessonProgress.create({
        data: {
          enrollmentId: meeraEnrollment.id,
          lessonId: l.id,
          isCompleted: true,
          completedAt: new Date(),
        },
      });
    }
  }

  await prisma.courseCertificate.create({
    data: {
      enrollmentId: meeraEnrollment.id,
      studentId: stuMeera.studentProfile.id,
      courseId: courseDravya.id,
      certificateCode: 'CERT-AYU-DRAVYA-2026',
      studentName: 'Meera Krishnan',
      courseTitle: courseDravya.title,
      providerName: courseDravya.providerName,
      verificationStatus: 'VERIFIED',
      verifiedAt: new Date(),
      remarks: 'Successfully completed 100% course requirements with distinction.',
    },
  });

  // Priya Sharma completed Embedded Systems course (100%) -> Certificate
  const priyaEnrollment = await prisma.courseEnrollment.create({
    data: {
      studentId: stuPriya.studentProfile.id,
      courseId: courseEmbedded.id,
      progressPercentage: 100,
      status: 'COMPLETED',
      completedAt: new Date(),
      certificateStatus: 'ISSUED',
    },
  });

  for (const m of courseEmbedded.modules) {
    for (const l of m.lessons) {
      await prisma.courseLessonProgress.create({
        data: {
          enrollmentId: priyaEnrollment.id,
          lessonId: l.id,
          isCompleted: true,
          completedAt: new Date(),
        },
      });
    }
  }

  await prisma.courseCertificate.create({
    data: {
      enrollmentId: priyaEnrollment.id,
      studentId: stuPriya.studentProfile.id,
      courseId: courseEmbedded.id,
      certificateCode: 'CERT-ENG-EMBED-2026',
      studentName: 'Priya Sharma',
      courseTitle: courseEmbedded.title,
      providerName: courseEmbedded.providerName,
      verificationStatus: 'VERIFIED',
      verifiedAt: new Date(),
      remarks: 'Verified completion of embedded C microcontrollers and IoT hardware programming.',
    },
  });

  // Sneha Patel completed Financial Analysis course (100%) -> Certificate
  const snehaEnrollment = await prisma.courseEnrollment.create({
    data: {
      studentId: stuSneha.studentProfile.id,
      courseId: courseFinance.id,
      progressPercentage: 100,
      status: 'COMPLETED',
      completedAt: new Date(),
      certificateStatus: 'ISSUED',
    },
  });

  for (const m of courseFinance.modules) {
    for (const l of m.lessons) {
      await prisma.courseLessonProgress.create({
        data: {
          enrollmentId: snehaEnrollment.id,
          lessonId: l.id,
          isCompleted: true,
          completedAt: new Date(),
        },
      });
    }
  }

  await prisma.courseCertificate.create({
    data: {
      enrollmentId: snehaEnrollment.id,
      studentId: stuSneha.studentProfile.id,
      courseId: courseFinance.id,
      certificateCode: 'CERT-COM-FIN-2026',
      studentName: 'Sneha Patel',
      courseTitle: courseFinance.title,
      providerName: courseFinance.providerName,
      verificationStatus: 'VERIFIED',
      verifiedAt: new Date(),
      remarks: 'Demonstrated mastery in corporate valuation, DCF modeling, and business analytics.',
    },
  });

  // Ananya Iyer enrolled in Clinical Ayurveda (65% progress)
  await prisma.courseEnrollment.create({
    data: {
      studentId: stuAnanya.studentProfile.id,
      courseId: courseAyuDiag.id,
      progressPercentage: 65,
      status: 'IN_PROGRESS',
      certificateStatus: 'NONE',
    },
  });

  // Rahul Kumar enrolled in Full Stack (75% progress)
  await prisma.courseEnrollment.create({
    data: {
      studentId: stuRahul.studentProfile.id,
      courseId: courseFullStack.id,
      progressPercentage: 75,
      status: 'IN_PROGRESS',
      certificateStatus: 'NONE',
    },
  });

  // ---------------------------------------------------------
  // 8. Industry Opportunities (24 total: 15 Internships + 9 Jobs)
  // ---------------------------------------------------------
  console.log('8. Seeding 24 Opportunities across 3 Disciplines...');

  const createOpp = async (params: {
    industryId: string;
    title: string;
    type: string;
    description: string;
    degree: string;
    department: string;
    minCgpa: number;
    experience: string;
    location: string;
    workMode: string;
    stipendOrSalary: string;
    duration: string;
    responsibilities: string;
    selectionProcess: string;
    skills: { name: string; minProficiency: string; isRequired: boolean }[];
  }) => {
    const opp = await prisma.opportunity.create({
      data: {
        industryId: params.industryId,
        title: params.title,
        type: params.type,
        description: params.description,
        degree: params.degree,
        department: params.department,
        minCgpa: params.minCgpa,
        experience: params.experience,
        location: params.location,
        workMode: params.workMode,
        stipendOrSalary: params.stipendOrSalary,
        duration: params.duration,
        responsibilities: params.responsibilities,
        selectionProcess: params.selectionProcess,
        isPublished: true,
        numberOfOpenings: 3,
        applicationDeadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        skills: {
          create: params.skills
            .map((s) => {
              const id = skillMap.get(s.name);
              return id
                ? {
                    skillId: id,
                    minProficiency: s.minProficiency,
                    isRequired: s.isRequired,
                  }
                : null;
            })
            .filter(Boolean) as any[],
        },
      },
    });
    return opp;
  };

  // --- 15 INTERNSHIPS ---
  // Ayurveda Internships (9)
  const oppPanchaIntern = await createOpp({
    industryId: indDhanvantari.industryProfile.id,
    title: 'Panchakarma Therapy Intern',
    type: 'INTERNSHIP',
    description: 'Assist senior Ayurvedic consultants in conducting inpatient and outpatient Panchakarma therapies, Abhyanga, and patient wellness tracking.',
    degree: 'BAMS',
    department: 'Kayachikitsa / Panchakarma',
    minCgpa: 7.5,
    experience: 'Fresher / Final Year',
    location: 'Chennai, Tamil Nadu',
    workMode: 'ON_SITE',
    stipendOrSalary: 'INR 18,000 / month',
    duration: '6 Months',
    responsibilities: 'Administer classical external oleation and sudation therapies under consultant supervision.',
    selectionProcess: 'Clinical Skill Evaluation & Interview',
    skills: [
      { name: 'Panchakarma', minProficiency: 'INTERMEDIATE', isRequired: true },
      { name: 'Abhyanga', minProficiency: 'INTERMEDIATE', isRequired: true },
      { name: 'Swedana', minProficiency: 'INTERMEDIATE', isRequired: true },
      { name: 'Ayurvedic Diagnosis', minProficiency: 'BEGINNER', isRequired: false },
    ],
  });

  const oppClinResearchIntern = await createOpp({
    industryId: indAyurvedaLife.industryProfile.id,
    title: 'Clinical Research Intern',
    type: 'INTERNSHIP',
    description: 'Collaborate with clinical investigators on AYUSH clinical trial documentation, data collection, and GCP compliance.',
    degree: 'BAMS / M.Sc Life Sciences',
    department: 'Kayachikitsa / Clinical Research',
    minCgpa: 7.5,
    experience: 'Fresher',
    location: 'Bengaluru, Karnataka',
    workMode: 'HYBRID',
    stipendOrSalary: 'INR 20,000 / month',
    duration: '6 Months',
    responsibilities: 'Patient case record form (CRF) maintenance, clinical adverse event logging, and protocol adherence.',
    selectionProcess: 'Research Methodology Test & Interview',
    skills: [
      { name: 'Clinical Research', minProficiency: 'INTERMEDIATE', isRequired: true },
      { name: 'Research Methodology', minProficiency: 'INTERMEDIATE', isRequired: true },
      { name: 'Biostatistics', minProficiency: 'BEGINNER', isRequired: false },
    ],
  });

  const oppHerbalMedIntern = await createOpp({
    industryId: indKeralaHerbal.industryProfile.id,
    title: 'Herbal Medicine Research Intern',
    type: 'INTERNSHIP',
    description: 'Phytochemical extraction, active biomarker screening, and raw material standardization in an R&D laboratory.',
    degree: 'BAMS / B.Pharm (Ayurveda)',
    department: 'Dravyaguna / Bhaishajya Kalpana',
    minCgpa: 7.5,
    experience: 'Fresher',
    location: 'Kochi, Kerala',
    workMode: 'ON_SITE',
    stipendOrSalary: 'INR 16,000 / month',
    duration: '6 Months',
    responsibilities: 'Conduct chromatography, TLC testing, and herbal formulation stability profiling.',
    selectionProcess: 'Technical Assessment & Interview',
    skills: [
      { name: 'Dravyaguna', minProficiency: 'INTERMEDIATE', isRequired: true },
      { name: 'Medicinal Plants', minProficiency: 'INTERMEDIATE', isRequired: true },
      { name: 'Herbal Medicine', minProficiency: 'INTERMEDIATE', isRequired: true },
    ],
  });

  const oppAyuPharmIntern = await createOpp({
    industryId: indKeralaHerbal.industryProfile.id,
    title: 'Ayurvedic Pharmacy Intern',
    type: 'INTERNSHIP',
    description: 'Hands-on training in classical Ayurvedic formulation manufacturing, Bhasma processing, and GMP quality standards.',
    degree: 'BAMS / B.Pharm (Ayurveda)',
    department: 'Rasashastra and Bhaishajya Kalpana',
    minCgpa: 7.0,
    experience: 'Fresher',
    location: 'Kochi, Kerala',
    workMode: 'ON_SITE',
    stipendOrSalary: 'INR 15,000 / month',
    duration: '6 Months',
    responsibilities: 'Assist production officers in tablet punching, decoction boiling, and batch record validation.',
    selectionProcess: 'Aptitude & Technical Round',
    skills: [
      { name: 'Rasashastra', minProficiency: 'INTERMEDIATE', isRequired: true },
      { name: 'Bhaishajya Kalpana', minProficiency: 'INTERMEDIATE', isRequired: true },
      { name: 'Ayurvedic Pharmacy', minProficiency: 'INTERMEDIATE', isRequired: true },
      { name: 'Quality Control', minProficiency: 'BEGINNER', isRequired: false },
    ],
  });

  const oppClinAyuIntern = await createOpp({
    industryId: indDhanvantari.industryProfile.id,
    title: 'Clinical Ayurveda Intern',
    type: 'INTERNSHIP',
    description: 'General outpatient consultation shadowing, patient case history documentation, and classical prescribing.',
    degree: 'BAMS',
    department: 'Kayachikitsa',
    minCgpa: 7.5,
    experience: 'Final Year / Intern',
    location: 'Chennai, Tamil Nadu',
    workMode: 'ON_SITE',
    stipendOrSalary: 'INR 18,000 / month',
    duration: '6 Months',
    responsibilities: 'Record Rogi Pariksha and Roganidana charts for outpatient patients.',
    selectionProcess: 'Clinical Diagnostic Case Study',
    skills: [
      { name: 'Ayurvedic Fundamentals', minProficiency: 'INTERMEDIATE', isRequired: true },
      { name: 'Ayurvedic Diagnosis', minProficiency: 'INTERMEDIATE', isRequired: true },
      { name: 'Kayachikitsa', minProficiency: 'BEGINNER', isRequired: false },
    ],
  });

  const oppMedPlantIntern = await createOpp({
    industryId: indKeralaHerbal.industryProfile.id,
    title: 'Medicinal Plant Research Intern',
    type: 'INTERNSHIP',
    description: 'Botanical field identification, taxonomical voucher curation, and raw herb authentication.',
    degree: 'BAMS / B.Sc Botany',
    department: 'Dravyaguna',
    minCgpa: 7.0,
    experience: 'Fresher',
    location: 'Kochi, Kerala',
    workMode: 'HYBRID',
    stipendOrSalary: 'INR 15,000 / month',
    duration: '6 Months',
    responsibilities: 'Herbarium specimen preparation and field survey sample collections.',
    selectionProcess: 'Botanical Identification Practical Test',
    skills: [
      { name: 'Medicinal Plants', minProficiency: 'INTERMEDIATE', isRequired: true },
      { name: 'Dravyaguna', minProficiency: 'INTERMEDIATE', isRequired: true },
      { name: 'Pharmacognosy', minProficiency: 'BEGINNER', isRequired: false },
    ],
  });

  const oppWellnessConsultIntern = await createOpp({
    industryId: indPrana.industryProfile.id,
    title: 'Wellness Consultant Intern',
    type: 'INTERNSHIP',
    description: 'Guidance on lifestyle management, Dinacharya routines, therapeutic yoga scheduling, and dietary planning.',
    degree: 'BAMS / BNYS',
    department: 'Swasthavritta & Yoga',
    minCgpa: 7.0,
    experience: 'Fresher',
    location: 'Hyderabad, Telangana',
    workMode: 'ON_SITE',
    stipendOrSalary: 'INR 16,000 / month',
    duration: '6 Months',
    responsibilities: 'Conduct client wellness evaluations and guide daily yoga and nutrition regimens.',
    selectionProcess: 'Personal Interview & Counseling Demonstration',
    skills: [
      { name: 'Yoga', minProficiency: 'INTERMEDIATE', isRequired: true },
      { name: 'Lifestyle Counselling', minProficiency: 'INTERMEDIATE', isRequired: true },
      { name: 'Nutrition', minProficiency: 'INTERMEDIATE', isRequired: true },
    ],
  });

  const oppHealthDocIntern = await createOpp({
    industryId: indAyurvedaLife.industryProfile.id,
    title: 'Healthcare Documentation Intern',
    type: 'INTERNSHIP',
    description: 'Electronic health record charting, clinical case report drafting, and healthcare data taxonomy.',
    degree: 'BAMS / Health Informatics',
    department: 'Samhita / Digital Health',
    minCgpa: 7.0,
    experience: 'Fresher',
    location: 'Bengaluru, Karnataka',
    workMode: 'REMOTE',
    stipendOrSalary: 'INR 14,000 / month',
    duration: '4 Months',
    responsibilities: 'Structured digital charting of Ayurvedic case records into electronic database.',
    selectionProcess: 'Medical Writing & Data Entry Task',
    skills: [
      { name: 'Digital Health', minProficiency: 'INTERMEDIATE', isRequired: true },
      { name: 'Scientific Writing', minProficiency: 'INTERMEDIATE', isRequired: true },
      { name: 'Biostatistics', minProficiency: 'BEGINNER', isRequired: false },
    ],
  });

  const oppFormulationResIntern = await createOpp({
    industryId: indKeralaHerbal.industryProfile.id,
    title: 'Ayurvedic Formulation Research Intern',
    type: 'INTERNSHIP',
    description: 'Laboratory pilot batch formulation testing, viscosity analysis, and stability validation.',
    degree: 'BAMS / M.Pharm Ayurveda',
    department: 'Rasashastra and Bhaishajya Kalpana',
    minCgpa: 7.5,
    experience: 'Fresher',
    location: 'Kochi, Kerala',
    workMode: 'ON_SITE',
    stipendOrSalary: 'INR 17,000 / month',
    duration: '6 Months',
    responsibilities: 'Execute dosage trial batches and record organoleptic parameter logs.',
    selectionProcess: 'Lab Practical & Interview',
    skills: [
      { name: 'Bhaishajya Kalpana', minProficiency: 'INTERMEDIATE', isRequired: true },
      { name: 'Quality Control', minProficiency: 'INTERMEDIATE', isRequired: true },
      { name: 'Herbal Medicine', minProficiency: 'BEGINNER', isRequired: false },
    ],
  });

  // Engineering Internships (4)
  const oppEmbeddedIntern = await createOpp({
    industryId: indEmbeddedLabs.industryProfile.id,
    title: 'Embedded Systems Intern',
    type: 'INTERNSHIP',
    description: 'Design and test microcontroller firmware in Embedded C, interface analog sensors, and debug UART/SPI communications.',
    degree: 'B.E. / B.Tech (ECE / EEE / CSE)',
    department: 'Electronics / Computer Science',
    minCgpa: 7.5,
    experience: 'Fresher',
    location: 'Chennai, Tamil Nadu',
    workMode: 'ON_SITE',
    stipendOrSalary: 'INR 22,000 / month',
    duration: '6 Months',
    responsibilities: 'Write modular C drivers for STM32 and Arduino microcontrollers.',
    selectionProcess: 'Firmware Coding Test & Hardware Design Round',
    skills: [
      { name: 'Embedded C', minProficiency: 'INTERMEDIATE', isRequired: true },
      { name: 'Arduino', minProficiency: 'INTERMEDIATE', isRequired: true },
      { name: 'Digital Electronics', minProficiency: 'INTERMEDIATE', isRequired: true },
    ],
  });

  const oppIoTIntern = await createOpp({
    industryId: indEmbeddedLabs.industryProfile.id,
    title: 'IoT Development Intern',
    type: 'INTERNSHIP',
    description: 'Develop connected smart edge nodes, integrate MQTT telemetry protocols, and bridge sensor hardware to cloud gateways.',
    degree: 'B.E. / B.Tech (ECE / CSE)',
    department: 'Electronics / IoT',
    minCgpa: 7.5,
    experience: 'Fresher',
    location: 'Chennai, Tamil Nadu',
    workMode: 'HYBRID',
    stipendOrSalary: 'INR 20,000 / month',
    duration: '6 Months',
    responsibilities: 'Implement telemetry protocols and calibrate smart sensor clusters.',
    selectionProcess: 'IoT Architecture Assignment & Interview',
    skills: [
      { name: 'IoT', minProficiency: 'INTERMEDIATE', isRequired: true },
      { name: 'Embedded C', minProficiency: 'INTERMEDIATE', isRequired: true },
      { name: 'Sensors', minProficiency: 'INTERMEDIATE', isRequired: true },
    ],
  });

  const oppFullStackIntern = await createOpp({
    industryId: indTechNova.industryProfile.id,
    title: 'Full Stack Development Intern',
    type: 'INTERNSHIP',
    description: 'Build full-featured web applications using React, TypeScript, Node.js REST APIs, and PostgreSQL database migrations.',
    degree: 'B.Tech / B.E. (CSE / IT)',
    department: 'Computer Science',
    minCgpa: 7.5,
    experience: 'Fresher',
    location: 'Bengaluru, Karnataka',
    workMode: 'HYBRID',
    stipendOrSalary: 'INR 25,000 / month',
    duration: '6 Months',
    responsibilities: 'Develop frontend user interfaces in React and write scalable Express backend APIs.',
    selectionProcess: 'Live Coding Challenge & Technical Interview',
    skills: [
      { name: 'JavaScript', minProficiency: 'INTERMEDIATE', isRequired: true },
      { name: 'React', minProficiency: 'INTERMEDIATE', isRequired: true },
      { name: 'Node.js', minProficiency: 'INTERMEDIATE', isRequired: true },
      { name: 'SQL', minProficiency: 'BEGINNER', isRequired: false },
    ],
  });

  const oppCloudIntern = await createOpp({
    industryId: indTechNova.industryProfile.id,
    title: 'Cloud Engineering Intern',
    type: 'INTERNSHIP',
    description: 'Support cloud deployments, Docker containerization, CI/CD pipeline automation, and server monitoring.',
    degree: 'B.Tech / B.E. (CSE / IT)',
    department: 'Computer Science / Cloud',
    minCgpa: 7.5,
    experience: 'Fresher',
    location: 'Bengaluru, Karnataka',
    workMode: 'REMOTE',
    stipendOrSalary: 'INR 24,000 / month',
    duration: '6 Months',
    responsibilities: 'Maintain cloud server environments and configure continuous delivery workflows.',
    selectionProcess: 'Cloud Architecture & Linux Fundamentals',
    skills: [
      { name: 'Cloud Computing', minProficiency: 'INTERMEDIATE', isRequired: true },
      { name: 'Linux', minProficiency: 'INTERMEDIATE', isRequired: true },
      { name: 'DevOps', minProficiency: 'BEGINNER', isRequired: false },
    ],
  });

  // Commerce Internships (2)
  const oppFinAnalystIntern = await createOpp({
    industryId: indFinEdge.industryProfile.id,
    title: 'Financial Analysis Intern',
    type: 'INTERNSHIP',
    description: 'Perform corporate valuation models, three-statement financial modeling in Excel, and equity research analysis.',
    degree: 'B.Com / BBA / MBA Finance',
    department: 'Commerce & Finance',
    minCgpa: 8.0,
    experience: 'Fresher',
    location: 'Bengaluru, Karnataka',
    workMode: 'HYBRID',
    stipendOrSalary: 'INR 22,000 / month',
    duration: '6 Months',
    responsibilities: 'Build DCF valuation sheets and conduct industry financial ratio benchmarking.',
    selectionProcess: 'Financial Modeling Case Study & Interview',
    skills: [
      { name: 'Financial Analysis', minProficiency: 'ADVANCED', isRequired: true },
      { name: 'Excel', minProficiency: 'ADVANCED', isRequired: true },
      { name: 'Accounting', minProficiency: 'INTERMEDIATE', isRequired: true },
    ],
  });

  const oppDigitalMktgIntern = await createOpp({
    industryId: indFinEdge.industryProfile.id,
    title: 'Digital Marketing Intern',
    type: 'INTERNSHIP',
    description: 'Execute growth marketing campaigns, SEO strategy, social media funnels, and performance marketing analytics.',
    degree: 'B.Com / BBA / Mass Comm',
    department: 'Marketing / Commerce',
    minCgpa: 7.0,
    experience: 'Fresher',
    location: 'Bengaluru, Karnataka',
    workMode: 'REMOTE',
    stipendOrSalary: 'INR 16,000 / month',
    duration: '4 Months',
    responsibilities: 'Manage ad copy campaigns, analyze Google Analytics metrics, and run A/B conversion tests.',
    selectionProcess: 'Campaign Portfolio & Presentation',
    skills: [
      { name: 'Digital Marketing', minProficiency: 'INTERMEDIATE', isRequired: true },
      { name: 'Marketing', minProficiency: 'INTERMEDIATE', isRequired: true },
      { name: 'Communication', minProficiency: 'INTERMEDIATE', isRequired: true },
    ],
  });

  // --- 9 ENTRY-LEVEL JOBS ---
  // Ayurveda Jobs (4)
  const oppJrAyuAssocJob = await createOpp({
    industryId: indDhanvantari.industryProfile.id,
    title: 'Junior Ayurveda Clinical Associate',
    type: 'JOB',
    description: 'Full-time junior doctor role managing patient consultations, prescription management, and clinical treatment supervision.',
    degree: 'BAMS Graduate',
    department: 'Kayachikitsa',
    minCgpa: 7.5,
    experience: '0-2 Years',
    location: 'Chennai, Tamil Nadu',
    workMode: 'ON_SITE',
    stipendOrSalary: 'INR 5.5 - INR 7.0 LPA',
    duration: 'Permanent Full-time',
    responsibilities: 'Conduct outpatient diagnostics, design patient care plans, and monitor treatment responses.',
    selectionProcess: 'Clinical Board Interview & Case Vetting',
    skills: [
      { name: 'Ayurvedic Diagnosis', minProficiency: 'ADVANCED', isRequired: true },
      { name: 'Ayurvedic Fundamentals', minProficiency: 'ADVANCED', isRequired: true },
      { name: 'Kayachikitsa', minProficiency: 'INTERMEDIATE', isRequired: true },
    ],
  });

  const oppAyuResAssocJob = await createOpp({
    industryId: indAyurvedaLife.industryProfile.id,
    title: 'Ayurvedic Research Associate',
    type: 'JOB',
    description: 'Full-time clinical investigator responsible for trial management, scientific manuscript drafting, and biostatistical analysis.',
    degree: 'BAMS / MD (Ayu) / M.Sc Clinical Research',
    department: 'Kayachikitsa / Research',
    minCgpa: 7.5,
    experience: '0-2 Years',
    location: 'Bengaluru, Karnataka',
    workMode: 'HYBRID',
    stipendOrSalary: 'INR 6.0 - INR 8.0 LPA',
    duration: 'Permanent Full-time',
    responsibilities: 'Coordinate trial subject visits, compile regulatory submission dossiers, and analyze trial outcomes.',
    selectionProcess: 'Research Publication Review & Panel Interview',
    skills: [
      { name: 'Clinical Research', minProficiency: 'ADVANCED', isRequired: true },
      { name: 'Research Methodology', minProficiency: 'ADVANCED', isRequired: true },
      { name: 'Scientific Writing', minProficiency: 'INTERMEDIATE', isRequired: true },
    ],
  });

  const oppHerbalResAssocJob = await createOpp({
    industryId: indKeralaHerbal.industryProfile.id,
    title: 'Herbal Research Associate',
    type: 'JOB',
    description: 'Senior laboratory analyst for phytochemical profiling, crude botanical authentication, and formulation R&D.',
    degree: 'BAMS / M.Pharm (Ayurveda)',
    department: 'Dravyaguna / Pharmacy',
    minCgpa: 7.5,
    experience: '1-3 Years',
    location: 'Kochi, Kerala',
    workMode: 'ON_SITE',
    stipendOrSalary: 'INR 5.0 - INR 6.8 LPA',
    duration: 'Permanent Full-time',
    responsibilities: 'Operate HPLC / HPTLC chromatography instruments and standardize herbal extracts.',
    selectionProcess: 'Practical Analytical Chemistry Exam & Interview',
    skills: [
      { name: 'Dravyaguna', minProficiency: 'ADVANCED', isRequired: true },
      { name: 'Herbal Medicine', minProficiency: 'ADVANCED', isRequired: true },
      { name: 'Pharmacognosy', minProficiency: 'INTERMEDIATE', isRequired: true },
    ],
  });

  const oppWellnessConsultJob = await createOpp({
    industryId: indPrana.industryProfile.id,
    title: 'Wellness Consultant',
    type: 'JOB',
    description: 'Senior lifestyle physician advising clients on integrative wellness, Dinacharya, therapeutic yoga, and nutritional restoration.',
    degree: 'BAMS / BNYS',
    department: 'Swasthavritta',
    minCgpa: 7.5,
    experience: '0-2 Years',
    location: 'Hyderabad, Telangana',
    workMode: 'ON_SITE',
    stipendOrSalary: 'INR 5.2 - INR 7.2 LPA',
    duration: 'Permanent Full-time',
    responsibilities: 'Deliver holistic client consultations and guide lifestyle health plans.',
    selectionProcess: 'Wellness Protocol Assessment & Senior Interview',
    skills: [
      { name: 'Yoga', minProficiency: 'ADVANCED', isRequired: true },
      { name: 'Lifestyle Counselling', minProficiency: 'ADVANCED', isRequired: true },
      { name: 'Nutrition', minProficiency: 'ADVANCED', isRequired: true },
    ],
  });

  // Engineering Jobs (3)
  const oppJrFullStackJob = await createOpp({
    industryId: indTechNova.industryProfile.id,
    title: 'Junior Full Stack Developer',
    type: 'JOB',
    description: 'Full-time software engineer building production web applications with React, TypeScript, Node.js, and SQL databases.',
    degree: 'B.Tech / B.E. (CSE / IT)',
    department: 'Computer Science',
    minCgpa: 7.5,
    experience: '0-2 Years',
    location: 'Bengaluru, Karnataka',
    workMode: 'HYBRID',
    stipendOrSalary: 'INR 7.5 - INR 9.5 LPA',
    duration: 'Permanent Full-time',
    responsibilities: 'Develop frontend user experiences, engineer scalable backend APIs, and participate in code reviews.',
    selectionProcess: 'System Design & Coding Rounds',
    skills: [
      { name: 'JavaScript', minProficiency: 'ADVANCED', isRequired: true },
      { name: 'React', minProficiency: 'ADVANCED', isRequired: true },
      { name: 'Node.js', minProficiency: 'ADVANCED', isRequired: true },
      { name: 'SQL', minProficiency: 'INTERMEDIATE', isRequired: true },
    ],
  });

  const oppEmbeddedEngineerJob = await createOpp({
    industryId: indEmbeddedLabs.industryProfile.id,
    title: 'Embedded Systems Engineer',
    type: 'JOB',
    description: 'Firmware design and hardware prototyping engineer developing register-level embedded systems for smart automotive and medical devices.',
    degree: 'B.E. / B.Tech (ECE / EEE)',
    department: 'Electronics',
    minCgpa: 7.5,
    experience: '0-2 Years',
    location: 'Chennai, Tamil Nadu',
    workMode: 'ON_SITE',
    stipendOrSalary: 'INR 6.5 - INR 8.5 LPA',
    duration: 'Permanent Full-time',
    responsibilities: 'Architect RTOS firmware, write peripheral drivers in C, and conduct hardware board bring-up.',
    selectionProcess: 'Hardware Debugging & Firmware Architecture',
    skills: [
      { name: 'Embedded C', minProficiency: 'ADVANCED', isRequired: true },
      { name: 'Digital Electronics', minProficiency: 'ADVANCED', isRequired: true },
      { name: 'Microcontrollers', minProficiency: 'ADVANCED', isRequired: true },
    ],
  });

  const oppIoTEngineerJob = await createOpp({
    industryId: indEmbeddedLabs.industryProfile.id,
    title: 'IoT Engineer',
    type: 'JOB',
    description: 'Engineer industrial IoT telemetry nodes, edge processing gateways, and wireless sensor meshes.',
    degree: 'B.E. / B.Tech (ECE / CSE)',
    department: 'Electronics / IoT',
    minCgpa: 7.5,
    experience: '0-2 Years',
    location: 'Chennai, Tamil Nadu',
    workMode: 'HYBRID',
    stipendOrSalary: 'INR 6.8 - INR 8.8 LPA',
    duration: 'Permanent Full-time',
    responsibilities: 'Deploy sensor telemetry networks and integrate with cloud MQTT brokers.',
    selectionProcess: 'IoT End-to-End System Evaluation',
    skills: [
      { name: 'IoT', minProficiency: 'ADVANCED', isRequired: true },
      { name: 'Embedded C', minProficiency: 'ADVANCED', isRequired: true },
      { name: 'Sensors', minProficiency: 'ADVANCED', isRequired: true },
    ],
  });

  // Commerce Jobs (2)
  const oppJrFinAnalystJob = await createOpp({
    industryId: indFinEdge.industryProfile.id,
    title: 'Junior Financial Analyst',
    type: 'JOB',
    description: 'Deliver financial analysis, financial statement modeling, M&A valuation reports, and equity analysis for corporate clients.',
    degree: 'B.Com / BBA / MBA Finance',
    department: 'Commerce / Finance',
    minCgpa: 8.0,
    experience: '0-2 Years',
    location: 'Bengaluru, Karnataka',
    workMode: 'HYBRID',
    stipendOrSalary: 'INR 6.8 - INR 8.5 LPA',
    duration: 'Permanent Full-time',
    responsibilities: 'Construct DCF models, compute valuation ratios, and compile investment memoranda.',
    selectionProcess: 'Financial Modeling Assessment & Partner Interview',
    skills: [
      { name: 'Financial Analysis', minProficiency: 'ADVANCED', isRequired: true },
      { name: 'Excel', minProficiency: 'ADVANCED', isRequired: true },
      { name: 'Accounting', minProficiency: 'ADVANCED', isRequired: true },
    ],
  });

  const oppDigitalMktgAssocJob = await createOpp({
    industryId: indFinEdge.industryProfile.id,
    title: 'Digital Marketing Associate',
    type: 'JOB',
    description: 'Execute performance acquisition campaigns, optimize lead generation funnels, and manage corporate brand presence.',
    degree: 'B.Com / BBA / Marketing',
    department: 'Marketing / Commerce',
    minCgpa: 7.5,
    experience: '0-2 Years',
    location: 'Bengaluru, Karnataka',
    workMode: 'ON_SITE',
    stipendOrSalary: 'INR 5.5 - INR 7.0 LPA',
    duration: 'Permanent Full-time',
    responsibilities: 'Oversee multi-channel digital campaigns and conversion rate tracking.',
    selectionProcess: 'Marketing Case Study & Presentation',
    skills: [
      { name: 'Digital Marketing', minProficiency: 'ADVANCED', isRequired: true },
      { name: 'Marketing', minProficiency: 'ADVANCED', isRequired: true },
      { name: 'Business Analytics', minProficiency: 'INTERMEDIATE', isRequired: true },
    ],
  });

  // ---------------------------------------------------------
  // 9. Student Applications & Live Match Statuses
  // ---------------------------------------------------------
  console.log('9. Seeding Student Applications and Match Results...');

  // Rahul Kumar applied to Full Stack Intern -> SHORTLISTED
  await prisma.application.create({
    data: {
      studentId: stuRahul.studentProfile.id,
      opportunityId: oppFullStackIntern.id,
      status: 'SHORTLISTED',
      matchScore: 87.5,
      coverLetter: 'Passionate full stack developer with experience in React, Node.js, and TypeScript microservices.',
    },
  });

  // Rahul Kumar applied to Junior Full Stack Developer
  await prisma.application.create({
    data: {
      studentId: stuRahul.studentProfile.id,
      opportunityId: oppJrFullStackJob.id,
      status: 'APPLIED',
      matchScore: 85.0,
      coverLetter: 'Eager to contribute high quality frontend components and robust RESTful APIs.',
    },
  });

  // Sneha Patel applied to Financial Analysis Intern -> SELECTED / HIRED
  await prisma.application.create({
    data: {
      studentId: stuSneha.studentProfile.id,
      opportunityId: oppFinAnalystIntern.id,
      status: 'SELECTED',
      matchScore: 95.0,
      coverLetter: 'Completed certified valuation modeling in Excel with deep understanding of DCF and ratio analysis.',
    },
  });

  // Sneha Patel applied to Junior Financial Analyst
  await prisma.application.create({
    data: {
      studentId: stuSneha.studentProfile.id,
      opportunityId: oppJrFinAnalystJob.id,
      status: 'UNDER_REVIEW',
      matchScore: 92.5,
      coverLetter: 'Demonstrated top-tier performance in financial statement analysis.',
    },
  });

  // Ananya Iyer applied to Panchakarma Therapy Intern & Clinical Ayurveda Intern
  await prisma.application.create({
    data: {
      studentId: stuAnanya.studentProfile.id,
      opportunityId: oppPanchaIntern.id,
      status: 'APPLIED',
      matchScore: 80.0,
      coverLetter: 'Dedicated to classical Panchakarma therapies and inpatient care.',
    },
  });

  await prisma.application.create({
    data: {
      studentId: stuAnanya.studentProfile.id,
      opportunityId: oppClinAyuIntern.id,
      status: 'UNDER_REVIEW',
      matchScore: 85.0,
      coverLetter: 'Experienced in Roganidana diagnostic examinations.',
    },
  });

  // Arjun Menon applied to Clinical Research Intern & Ayurvedic Research Associate
  await prisma.application.create({
    data: {
      studentId: stuArjun.studentProfile.id,
      opportunityId: oppClinResearchIntern.id,
      status: 'SHORTLISTED',
      matchScore: 85.0,
      coverLetter: 'Strong research foundation in GCP and biostatistics.',
    },
  });

  await prisma.application.create({
    data: {
      studentId: stuArjun.studentProfile.id,
      opportunityId: oppAyuResAssocJob.id,
      status: 'APPLIED',
      matchScore: 82.5,
      coverLetter: 'Seeking full-time clinical trial coordination responsibilities.',
    },
  });

  // Meera Krishnan applied to Herbal Medicine Research Intern & Medicinal Plant Research Intern
  await prisma.application.create({
    data: {
      studentId: stuMeera.studentProfile.id,
      opportunityId: oppHerbalMedIntern.id,
      status: 'SHORTLISTED',
      matchScore: 90.0,
      coverLetter: 'Holder of verified Dravyaguna specialization certificate with lab experience.',
    },
  });

  await prisma.application.create({
    data: {
      studentId: stuMeera.studentProfile.id,
      opportunityId: oppMedPlantIntern.id,
      status: 'APPLIED',
      matchScore: 88.0,
      coverLetter: 'Expertise in botanical taxonomy and crude herbarium identification.',
    },
  });

  // Priya Sharma applied to Embedded Systems Intern
  await prisma.application.create({
    data: {
      studentId: stuPriya.studentProfile.id,
      opportunityId: oppEmbeddedIntern.id,
      status: 'SHORTLISTED',
      matchScore: 90.0,
      coverLetter: 'Certified in Embedded Systems Fundamentals with hands-on microcontroller coding.',
    },
  });

  // Rohan Sharma applied to Ayurvedic Pharmacy Intern
  await prisma.application.create({
    data: {
      studentId: stuRohan.studentProfile.id,
      opportunityId: oppAyuPharmIntern.id,
      status: 'UNDER_REVIEW',
      matchScore: 85.0,
      coverLetter: 'Focused on GMP compliance and classical pharmacy formulations.',
    },
  });

  // Kavya Nair applied to Wellness Consultant Intern
  await prisma.application.create({
    data: {
      studentId: stuKavya.studentProfile.id,
      opportunityId: oppWellnessConsultIntern.id,
      status: 'APPLIED',
      matchScore: 88.0,
      coverLetter: 'Passionate about therapeutic yoga and preventive wellness planning.',
    },
  });

  // Vishal Reddy applied to Healthcare Documentation Intern
  await prisma.application.create({
    data: {
      studentId: stuVishal.studentProfile.id,
      opportunityId: oppHealthDocIntern.id,
      status: 'APPLIED',
      matchScore: 85.0,
      coverLetter: 'Specializing in AYUSH digital health records and clinical data taxonomy.',
    },
  });

  // Aditya Rao applied to Digital Marketing Intern
  await prisma.application.create({
    data: {
      studentId: stuAditya.studentProfile.id,
      opportunityId: oppDigitalMktgIntern.id,
      status: 'APPLIED',
      matchScore: 87.5,
      coverLetter: 'Skilled in performance acquisition funnels and social media marketing.',
    },
  });

  // ---------------------------------------------------------
  // 10. Academia <-> Industry Collaborations & Activities (10 total)
  // ---------------------------------------------------------
  console.log('10. Seeding 10 Academia-Industry Collaborations & MoUs...');

  // 1. Dhanvantari Wellness <-> Sri Dhanvantari Ayurveda College
  await prisma.collaboration.create({
    data: {
      initiatorId: indDhanvantari.id,
      initiatorRole: 'INDUSTRY',
      title: 'Ayurveda Wellness Internship Program',
      type: 'INDUSTRIAL_TRAINING',
      description: 'Joint clinical training partnership providing clinical rotations for final year BAMS students in specialized inpatient Panchakarma centers.',
      targetAudience: 'BAMS Final Year & Interns',
      location: 'Chennai, Tamil Nadu',
      mode: 'OFFLINE',
      duration: '12 Months',
      remunerationOrStipend: 'INR 18,000 / month',
      eligibilityCriteria: 'Minimum CGPA 7.5 in Roganidana and Kayachikitsa',
      status: 'OPEN',
      budget: 'INR 12,00,000',
    },
  });

  // 2. Kerala Herbal Sciences <-> Kerala Ayurveda Research Institute
  await prisma.collaboration.create({
    data: {
      initiatorId: indKeralaHerbal.id,
      initiatorRole: 'INDUSTRY',
      title: 'Medicinal Plant Research Project',
      type: 'RESEARCH',
      description: 'Collaborative phytochemical profiling and standardization of rare Western Ghats botanical extracts for standardized AYUSH formulations.',
      targetAudience: 'Dravyaguna Faculty & Researchers',
      location: 'Kochi, Kerala',
      mode: 'HYBRID',
      duration: '18 Months',
      remunerationOrStipend: 'Grant funded research fellowships',
      eligibilityCriteria: 'Postgraduates and Faculty in Dravyaguna and Pharmacognosy',
      status: 'OPEN',
      budget: 'INR 25,00,000',
    },
  });

  // 3. Ayurveda Life Sciences <-> South Indian Institute of Ayurveda
  await prisma.collaboration.create({
    data: {
      initiatorId: indAyurvedaLife.id,
      initiatorRole: 'INDUSTRY',
      title: 'Clinical Research Training Program',
      type: 'FDP',
      description: 'Faculty Development Program and postgraduate clinical fellowship training in GCP trial design, ethical clearances, and biostatistics.',
      targetAudience: 'Ayurveda Faculty and Clinical PGs',
      location: 'Coimbatore, Tamil Nadu',
      mode: 'HYBRID',
      duration: '6 Months',
      remunerationOrStipend: 'Fully sponsored training',
      eligibilityCriteria: 'Teaching faculty in AYUSH Medical Colleges',
      status: 'OPEN',
      budget: 'INR 8,50,000',
    },
  });

  // 4. Embedded Systems Labs <-> SSN Engineering College
  await prisma.collaboration.create({
    data: {
      initiatorId: indEmbeddedLabs.id,
      initiatorRole: 'INDUSTRY',
      title: 'Embedded Systems Industry Training',
      type: 'INDUSTRIAL_TRAINING',
      description: 'Hands-on industrial firmware development training, microcontroller hardware design, and connected IoT smart edge systems.',
      targetAudience: 'ECE & CSE 3rd/4th Year Engineering Students',
      location: 'Chennai, Tamil Nadu',
      mode: 'OFFLINE',
      duration: '6 Months',
      remunerationOrStipend: 'INR 22,000 / month stipend during live phase',
      eligibilityCriteria: 'Proficiency in C and Digital Electronics',
      status: 'OPEN',
      budget: 'INR 15,00,000',
    },
  });

  // 5. TechNova Solutions <-> SSN Engineering College
  await prisma.collaboration.create({
    data: {
      initiatorId: indTechNova.id,
      initiatorRole: 'INDUSTRY',
      title: 'Full Stack Development Internship Program',
      type: 'LIVE_PROJECT',
      description: 'Mentored live software engineering project building full-stack cloud microservices with React, TypeScript, and Node.js.',
      targetAudience: 'B.Tech CSE & IT Students',
      location: 'Bengaluru / Chennai',
      mode: 'HYBRID',
      duration: '6 Months',
      remunerationOrStipend: 'INR 25,000 / month with pre-placement opportunity',
      eligibilityCriteria: 'Knowledge of React, Node.js, and SQL',
      status: 'OPEN',
      budget: 'INR 18,00,000',
    },
  });

  // 6. FinEdge Consulting <-> South India Commerce Institute
  await prisma.collaboration.create({
    data: {
      initiatorId: indFinEdge.id,
      initiatorRole: 'INDUSTRY',
      title: 'Financial Analytics Industry Project',
      type: 'CONSULTANCY',
      description: 'Joint corporate finance consultancy project conducting industry benchmarking, valuation models, and financial statement analytics.',
      targetAudience: 'B.Com & Finance Students',
      location: 'Bengaluru, Karnataka',
      mode: 'HYBRID',
      duration: '4 Months',
      remunerationOrStipend: 'INR 20,000 / month project stipend',
      eligibilityCriteria: 'Advanced Excel & Financial Statement Analysis',
      status: 'OPEN',
      budget: 'INR 10,00,000',
    },
  });

  // 7. Workshop: Clinical Diagnostics & Nadi Pariksha Masterclass (Dr. Ananya Krishnan ↔ Dhanvantari Wellness)
  await prisma.collaboration.create({
    data: {
      initiatorId: acadAnanya.id,
      initiatorRole: 'ACADEMICIAN',
      title: 'Clinical Diagnostics & Nadi Pariksha Masterclass',
      type: 'WORKSHOP',
      description: 'Hands-on clinical workshop on subtle radial pulse palpation, sub-dosha analysis, and acute bedside Roganidana diagnosis.',
      targetAudience: 'Ayurveda Practitioners, Interns, and Final Year Students',
      location: 'Chennai, Tamil Nadu',
      mode: 'OFFLINE',
      duration: '3 Days',
      remunerationOrStipend: 'Honorarium provided for expert trainers',
      eligibilityCriteria: 'BAMS Graduates / Final Year Students',
      status: 'OPEN',
      budget: 'INR 3,00,000',
    },
  });

  // 8. Guest Lecture: Advanced Phytochemistry in Drug Standardisation (Dr. Ravi Narayanan ↔ Kerala Herbal Sciences)
  await prisma.collaboration.create({
    data: {
      initiatorId: acadRavi.id,
      initiatorRole: 'ACADEMICIAN',
      title: 'Advanced Phytochemistry in Drug Standardisation',
      type: 'GUEST_LECTURE',
      description: 'Expert guest lecture series covering chromatographic fingerprinting, spectroscopic validation, and AYUSH heavy metal standards.',
      targetAudience: 'R&D Chemists & Dravyaguna Postgraduates',
      location: 'Kochi, Kerala',
      mode: 'ONLINE',
      duration: '2 Weeks',
      remunerationOrStipend: 'Sponsored by Kerala Herbal Sciences',
      eligibilityCriteria: 'Open to registered researchers',
      status: 'OPEN',
      budget: 'INR 1,50,000',
    },
  });

  // 9. Faculty Internship: Embedded Real-Time OS & Automotive IoT (Dr. Suresh Kumar ↔ Embedded Systems Labs)
  await prisma.collaboration.create({
    data: {
      initiatorId: acadSuresh.id,
      initiatorRole: 'ACADEMICIAN',
      title: 'Embedded Real-Time OS & Automotive IoT',
      type: 'FACULTY_INTERNSHIP',
      description: 'Faculty summer immersion at Embedded Systems Labs to build RTOS microkernel modules for connected automotive telemetry.',
      targetAudience: 'Engineering Faculty (ECE/CSE)',
      location: 'Chennai, Tamil Nadu',
      mode: 'OFFLINE',
      duration: '2 Months',
      remunerationOrStipend: 'INR 40,000 / month faculty fellowship',
      eligibilityCriteria: 'Doctoral / Master degree in Electronics with C programming proficiency',
      status: 'OPEN',
      budget: 'INR 2,50,000',
    },
  });

  // 10. Innovation Challenge: FinTech Hackathon & ESG Portfolio Modeling (Dr. Karthik Rao ↔ FinEdge Consulting)
  await prisma.collaboration.create({
    data: {
      initiatorId: acadKarthik.id,
      initiatorRole: 'ACADEMICIAN',
      title: 'FinTech Hackathon & ESG Portfolio Modeling',
      type: 'LIVE_PROJECT',
      description: 'Collegiate financial modeling hackathon creating automated valuation dashboards and ESG compliance scorecards.',
      targetAudience: 'Commerce and Business Students',
      location: 'Bengaluru, Karnataka',
      mode: 'ONLINE',
      duration: '4 Weeks',
      remunerationOrStipend: 'INR 1,00,000 Cash Prize Pool',
      eligibilityCriteria: 'Undergraduate commerce teams',
      status: 'OPEN',
      budget: 'INR 4,00,000',
    },
  });

  // ---------------------------------------------------------
  // 11. Industry Mentorship Programs (5 total)
  // ---------------------------------------------------------
  console.log('11. Seeding Industry Mentorship Programs...');

  await prisma.mentorshipProgram.create({
    data: {
      mentorId: indDhanvantari.industryProfile.id,
      title: 'Ayurvedic Clinical Practice & Wellness Entrepreneurship',
      description: 'One-on-one executive mentorship guiding young doctors on establishing clinical practices, OPD patient flow, and integrative wellness retreats.',
      maxMentees: 5,
      expertiseAreas: 'Clinical Practice, Panchakarma Setup, Healthcare Management',
      isAccepting: true,
    },
  });

  await prisma.mentorshipProgram.create({
    data: {
      mentorId: indKeralaHerbal.industryProfile.id,
      title: 'Herbal Drug Standardization & Phytochemistry Mentorship',
      description: 'Guidance on botanical authentication, HPTLC laboratory testing, and AYUSH regulatory filings for herbal startups.',
      maxMentees: 4,
      expertiseAreas: 'Dravyaguna, Pharmacognosy, GMP Standards',
      isAccepting: true,
    },
  });

  await prisma.mentorshipProgram.create({
    data: {
      mentorId: indAyurvedaLife.industryProfile.id,
      title: 'Clinical Research & Evidence-Based AYUSH Trials',
      description: 'Mentorship in clinical research methodology, trial ethical submissions, protocol drafting, and biostatistical analysis.',
      maxMentees: 4,
      expertiseAreas: 'Clinical Trials, GCP, Protocol Design',
      isAccepting: true,
    },
  });

  await prisma.mentorshipProgram.create({
    data: {
      mentorId: indTechNova.industryProfile.id,
      title: 'Modern Full Stack & Cloud Engineering Mentorship',
      description: 'Mentoring engineering students on production React, Node.js TypeScript architecture, Docker containerization, and system design.',
      maxMentees: 6,
      expertiseAreas: 'Full Stack Web, React, Node.js, Cloud Architecture',
      isAccepting: true,
    },
  });

  await prisma.mentorshipProgram.create({
    data: {
      mentorId: indFinEdge.industryProfile.id,
      title: 'Financial Valuation & Corporate Analytics Mentorship',
      description: 'Practical guidance on DCF valuation modeling, equity research reporting, and preparing for financial analyst roles.',
      maxMentees: 5,
      expertiseAreas: 'Corporate Finance, DCF Valuation, Business Analytics',
      isAccepting: true,
    },
  });

  console.log('\n==================================================================');
  console.log('🎉 SEEDING COMPLETED SUCCESSFULLY!');
  console.log('   - 6 Academicians across 3 Disciplines');
  console.log('   - 5 Partner Institutions across 3 Disciplines');
  console.log('   - 7 Industry Partners across 3 Disciplines');
  console.log('   - 10 Students with Skills & Career Targets');
  console.log('   - 18 Courses with Modules & Lessons');
  console.log('   - 24 Opportunities (15 Internships + 9 Jobs)');
  console.log('   - 10 Collaborations, MoUs & Activities');
  console.log('   - 5 Mentorship Programs');
  console.log('==================================================================');
}

if (require.main === module) {
  seedMultiDomainDemo()
    .then(async () => {
      await prisma.$disconnect();
      process.exit(0);
    })
    .catch(async (e) => {
      console.error('❌ Seeding failed:', e);
      await prisma.$disconnect();
      process.exit(1);
    });
}

export default seedMultiDomainDemo;
