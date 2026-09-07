import bcrypt from 'bcryptjs';
import prisma from './config/db';

async function seedDemoData() {
  console.log('====================================================');
  console.log('🌱 SEEDING REALISTIC DEMO DATA FOR SIH 2026 DEMO');
  console.log('====================================================\n');

  const passwordHash = await bcrypt.hash('Demo@12345', 10);

  // ---------------------------------------------------------
  // 1. Skill Categories and Skills Taxonomy
  // ---------------------------------------------------------
  console.log('1. Seeding Skill Taxonomy & Categories...');
  
  const skillCategories = [
    {
      name: 'Web & Full Stack Development',
      description: 'Modern frontend, backend, and full-stack web technologies.',
      skills: [
        { name: 'JavaScript', description: 'Core ECMAScript programming, async patterns, and DOM APIs' },
        { name: 'TypeScript', description: 'Type-safe JavaScript for enterprise-grade scalable applications' },
        { name: 'React.js', description: 'Component architecture, hooks, state management, and modern SPA design' },
        { name: 'Node.js', description: 'Server-side runtime, event loop, streams, and non-blocking I/O' },
        { name: 'Express.js', description: 'Minimalist Node.js web framework for robust RESTful APIs' },
        { name: 'HTML/CSS', description: 'Semantic markup, modern CSS grid/flexbox, and responsive layouts' },
        { name: 'REST APIs', description: 'RESTful architectural design, status codes, and endpoint modeling' },
        { name: 'GraphQL', description: 'Schema definition, queries, mutations, and API resolvers' },
      ],
    },
    {
      name: 'Data Science & Machine Learning',
      description: 'Statistical modeling, machine learning, neural networks, and data analytics.',
      skills: [
        { name: 'Python', description: 'Data structures, OOP, scientific packages, and automation' },
        { name: 'Machine Learning', description: 'Supervised, unsupervised algorithms, model validation, and metrics' },
        { name: 'Data Analysis', description: 'Exploratory data analysis, hypothesis testing, and statistical insights' },
        { name: 'Deep Learning', description: 'Neural architectures, backpropagation, PyTorch, and TensorFlow' },
        { name: 'Pandas', description: 'High-performance data manipulation, dataframes, and transformations' },
        { name: 'SQL', description: 'Relational querying, schema indexing, joins, and aggregations' },
      ],
    },
    {
      name: 'Cloud Computing & DevOps',
      description: 'Cloud infrastructure, containerization, orchestration, and CI/CD automation.',
      skills: [
        { name: 'Docker', description: 'Container image building, multi-stage Dockerfiles, and compose' },
        { name: 'Kubernetes', description: 'Pod scheduling, deployments, services, ingress, and configmaps' },
        { name: 'AWS', description: 'EC2, S3, IAM, Lambda, VPC, and cloud networking architecture' },
        { name: 'CI/CD Pipelines', description: 'Automated build, test, and deployment workflows with GitHub Actions' },
        { name: 'Git & GitHub', description: 'Version control, branching strategies, PR reviews, and merge conflict resolution' },
      ],
    },
    {
      name: 'Cybersecurity & Systems',
      description: 'Defensive security, network protocols, vulnerability analysis, and Linux administration.',
      skills: [
        { name: 'Network Security', description: 'Firewalls, TCP/IP handshake, TLS encryption, and packet inspection' },
        { name: 'Ethical Hacking', description: 'Penetration testing methodology, OWASP Top 10, and vulnerability scanning' },
        { name: 'Linux Administration', description: 'Shell scripting, permissions, systemd services, and log analysis' },
        { name: 'Cryptography', description: 'Symmetric/asymmetric encryption, hashing algorithms, and PKI' },
      ],
    },
    {
      name: 'Embedded Systems & IoT',
      description: 'Microcontroller programming, firmware development, sensors, and IoT protocols.',
      skills: [
        { name: 'Embedded C', description: 'Low-level memory management, registers, pointers, and interrupts' },
        { name: 'Arduino & Microcontrollers', description: 'AVR, ESP32, STM32 hardware prototyping and peripheral interfacing' },
        { name: 'IoT Protocols', description: 'MQTT, CoAP, HTTP telemetry, and sensor network communications' },
      ],
    },
  ];

  const skillMap = new Map<string, string>(); // skillName -> skillId
  const categoryMap = new Map<string, string>(); // catName -> catId

  for (const catData of skillCategories) {
    const category = await prisma.skillCategory.upsert({
      where: { name: catData.name },
      update: { description: catData.description },
      create: { name: catData.name, description: catData.description },
    });
    categoryMap.set(catData.name, category.id);

    for (const s of catData.skills) {
      const skill = await prisma.skill.upsert({
        where: { name: s.name },
        update: { description: s.description, categoryId: category.id },
        create: { name: s.name, description: s.description, categoryId: category.id },
      });
      skillMap.set(s.name, skill.id);
    }
  }

  // ---------------------------------------------------------
  // 2. Assessments and Questions
  // ---------------------------------------------------------
  console.log('2. Seeding Skill Assessments & Question Banks...');
  
  const webAssessCat = categoryMap.get('Web & Full Stack Development');
  const webAssessment = await prisma.assessment.create({
    data: {
      title: 'Full Stack Web Development Assessment',
      description: 'Standardized technical evaluation of React, Node.js, TypeScript, and modern web architectures.',
      categoryId: webAssessCat,
      durationMinutes: 30,
      passingScore: 60.0,
      questions: {
        create: [
          {
            questionText: 'What is the primary role of the Virtual DOM in React?',
            difficulty: 'MEDIUM',
            weightage: 2,
            skillId: skillMap.get('React.js'),
            options: {
              create: [
                { optionText: 'Directly modifies native browser DOM nodes for faster painting', isCorrect: false },
                { optionText: 'Maintains an in-memory representation to compute minimal required UI diffs', isCorrect: true },
                { optionText: 'Stores server-side session cookies securely', isCorrect: false },
                { optionText: 'Compiles TypeScript interfaces into WebAssembly', isCorrect: false },
              ],
            },
          },
          {
            questionText: 'Which HTTP response code indicates that a new resource was successfully created on the server?',
            difficulty: 'EASY',
            weightage: 1,
            skillId: skillMap.get('REST APIs'),
            options: {
              create: [
                { optionText: '200 OK', isCorrect: false },
                { optionText: '201 Created', isCorrect: true },
                { optionText: '204 No Content', isCorrect: false },
                { optionText: '304 Not Modified', isCorrect: false },
              ],
            },
          },
          {
            questionText: 'In TypeScript, which type represents a value that will never occur (e.g. a function that throws an error)?',
            difficulty: 'MEDIUM',
            weightage: 2,
            skillId: skillMap.get('TypeScript'),
            options: {
              create: [
                { optionText: 'void', isCorrect: false },
                { optionText: 'unknown', isCorrect: false },
                { optionText: 'never', isCorrect: true },
                { optionText: 'undefined', isCorrect: false },
              ],
            },
          },
          {
            questionText: 'What is the purpose of middleware in Express.js?',
            difficulty: 'MEDIUM',
            weightage: 2,
            skillId: skillMap.get('Express.js'),
            options: {
              create: [
                { optionText: 'To access and manipulate the request/response cycle or terminate it', isCorrect: true },
                { optionText: 'To convert CSS stylesheets into responsive JavaScript', isCorrect: false },
                { optionText: 'To create database schema migrations automatically', isCorrect: false },
                { optionText: 'To compress video assets for streaming', isCorrect: false },
              ],
            },
          },
        ],
      },
    },
  });

  const dsAssessCat = categoryMap.get('Data Science & Machine Learning');
  const dsAssessment = await prisma.assessment.create({
    data: {
      title: 'Data Science & Python Proficiency Assessment',
      description: 'Rigorous assessment covering Python data structures, Pandas manipulation, and machine learning principles.',
      categoryId: dsAssessCat,
      durationMinutes: 30,
      passingScore: 60.0,
      questions: {
        create: [
          {
            questionText: 'In supervised machine learning, how does a classification problem differ from a regression problem?',
            difficulty: 'EASY',
            weightage: 1,
            skillId: skillMap.get('Machine Learning'),
            options: {
              create: [
                { optionText: 'Classification predicts discrete categorical labels, while regression predicts continuous numerical values', isCorrect: true },
                { optionText: 'Classification requires unlabeled data, whereas regression requires labeled data', isCorrect: false },
                { optionText: 'Classification only runs on GPUs, while regression runs on CPUs', isCorrect: false },
                { optionText: 'There is no fundamental difference between the two', isCorrect: false },
              ],
            },
          },
          {
            questionText: 'In the Pandas library, what does the .groupby() operation do?',
            difficulty: 'MEDIUM',
            weightage: 2,
            skillId: skillMap.get('Pandas'),
            options: {
              create: [
                { optionText: 'Splits DataFrame data into buckets based on specified keys for aggregation', isCorrect: true },
                { optionText: 'Deletes duplicate rows across all columns', isCorrect: false },
                { optionText: 'Sorts rows alphabetically', isCorrect: false },
                { optionText: 'Converts numerical columns into categorical strings', isCorrect: false },
              ],
            },
          },
        ],
      },
    },
  });

  // ---------------------------------------------------------
  // 3. Institution Accounts (2)
  // ---------------------------------------------------------
  console.log('3. Seeding Institution Accounts...');

  const citUser = await prisma.user.create({
    data: {
      email: 'admin@cit.demo',
      passwordHash,
      role: 'INSTITUTION',
      institutionProfile: {
        create: {
          institutionName: 'Chennai Institute of Technology',
          officialEmail: 'admin@cit.demo',
          institutionType: 'Autonomous Engineering College',
          affiliatedUniversity: 'Anna University',
          address: 'Sarathy Nagar, Kundrathur, Chennai, Tamil Nadu 600069',
          website: 'https://citchennai.edu.in',
          contactPerson: 'Dr. S. Ramesh (Principal)',
          contactNumber: '+91 44 7111 9111',
        },
      },
    },
    include: { institutionProfile: true },
  });

  const siieUser = await prisma.user.create({
    data: {
      email: 'dean@siie.demo',
      passwordHash,
      role: 'INSTITUTION',
      institutionProfile: {
        create: {
          institutionName: 'South India Institute of Engineering',
          officialEmail: 'dean@siie.demo',
          institutionType: 'Private Technical University',
          affiliatedUniversity: 'Visvesvaraya Technological University',
          address: 'Electronics City Phase 1, Bengaluru, Karnataka 560100',
          website: 'https://siie-edu.demo',
          contactPerson: 'Dr. P. Sundaram (Dean of Academics)',
          contactNumber: '+91 80 4123 5678',
        },
      },
    },
    include: { institutionProfile: true },
  });

  // ---------------------------------------------------------
  // 4. Academician Accounts (2)
  // ---------------------------------------------------------
  console.log('4. Seeding Academician Accounts...');

  const academician1 = await prisma.user.create({
    data: {
      email: 'ananya.krishnan@demo.skillbridge.com',
      passwordHash,
      role: 'ACADEMICIAN',
      academicianProfile: {
        create: {
          fullName: 'Dr. Ananya Krishnan',
          phone: '+91 98401 23456',
          institutionName: 'Chennai Institute of Technology',
          department: 'Computer Science and Engineering',
          designation: 'Associate Professor',
          yearsOfExperience: 12,
          areasOfExpertise: 'Full Stack Web Development, Cloud Computing, Distributed Systems',
          location: 'Chennai, Tamil Nadu',
          bio: 'Senior researcher and educator with over a decade of experience in modern full-stack architectures and scalable cloud systems.',
        },
      },
    },
    include: { academicianProfile: true },
  });

  const academician2 = await prisma.user.create({
    data: {
      email: 'ravi.narayanan@demo.skillbridge.com',
      passwordHash,
      role: 'ACADEMICIAN',
      academicianProfile: {
        create: {
          fullName: 'Dr. Ravi Narayanan',
          phone: '+91 94440 98765',
          institutionName: 'South India Institute of Engineering',
          department: 'Artificial Intelligence & Data Science',
          designation: 'Professor & Head',
          yearsOfExperience: 18,
          areasOfExpertise: 'Machine Learning, Deep Learning, Natural Language Processing, Big Data Analytics',
          location: 'Bengaluru, Karnataka',
          bio: 'Distinguished AI academician guiding national research in deep neural architectures, predictive modeling, and applied AI.',
        },
      },
    },
    include: { academicianProfile: true },
  });

  // ---------------------------------------------------------
  // 5. Industry Accounts (3)
  // ---------------------------------------------------------
  console.log('5. Seeding Industry Accounts...');

  const technovaUser = await prisma.user.create({
    data: {
      email: 'recruitment@technova.demo',
      passwordHash,
      role: 'INDUSTRY',
      industryProfile: {
        create: {
          companyName: 'TechNova Solutions Pvt Ltd',
          officialEmail: 'recruitment@technova.demo',
          industrySector: 'Information Technology & Enterprise Software',
          companySize: '250-500 employees',
          website: 'https://technova-example.demo',
          location: 'Bengaluru, Karnataka',
          description: 'Global enterprise software company specializing in cloud-native SaaS platforms, real-time analytics engines, and modern full-stack architectures.',
          contactPerson: 'Arun Verma (Lead Technical Recruiter)',
          contactNumber: '+91 80 6789 0123',
        },
      },
    },
    include: { industryProfile: true },
  });

  const cloudsphereUser = await prisma.user.create({
    data: {
      email: 'careers@cloudsphere.demo',
      passwordHash,
      role: 'INDUSTRY',
      industryProfile: {
        create: {
          companyName: 'CloudSphere Technologies',
          officialEmail: 'careers@cloudsphere.demo',
          industrySector: 'Cloud Infrastructure & DevOps Consulting',
          companySize: '100-250 employees',
          website: 'https://cloudsphere-example.demo',
          location: 'Hyderabad, Telangana',
          description: 'Cloud consulting and infrastructure specialists leading enterprise Kubernetes migrations, AWS cloud infrastructure, and GitOps CI/CD automation.',
          contactPerson: 'Kavita Sen (Director of Talent Acquisition)',
          contactNumber: '+91 40 4567 8901',
        },
      },
    },
    include: { industryProfile: true },
  });

  const datamindUser = await prisma.user.create({
    data: {
      email: 'talent@datamind.demo',
      passwordHash,
      role: 'INDUSTRY',
      industryProfile: {
        create: {
          companyName: 'DataMind Analytics Lab',
          officialEmail: 'talent@datamind.demo',
          industrySector: 'Data Science & Applied Artificial Intelligence',
          companySize: '50-100 employees',
          website: 'https://datamind-example.demo',
          location: 'Chennai, Tamil Nadu',
          description: 'Premier AI research and enterprise data science laboratory pioneering predictive analytics, deep neural networks, and scalable data pipelines.',
          contactPerson: 'Vikram Malhotra (Head of Talent)',
          contactNumber: '+91 44 2345 6789',
        },
      },
    },
    include: { industryProfile: true },
  });

  // ---------------------------------------------------------
  // 6. Student Accounts (5)
  // ---------------------------------------------------------
  console.log('6. Seeding Student Profiles, Skills, Certifications & Projects...');

  // Student 1: Priya Sharma (Full Stack Star - High Match for Web roles)
  const student1User = await prisma.user.create({
    data: {
      email: 'priya.sharma@demo.skillbridge.com',
      passwordHash,
      role: 'STUDENT',
      studentProfile: {
        create: {
          fullName: 'Priya Sharma',
          phone: '+91 98765 43210',
          institutionName: 'Chennai Institute of Technology',
          department: 'Computer Science and Engineering',
          degree: 'B.Tech',
          currentYear: 4,
          cgpa: 8.9,
          graduationYear: 2026,
          location: 'Chennai, Tamil Nadu',
          careerInterests: 'Full Stack Developer, Frontend Engineer, Web Application Developer',
          preferredRoles: 'Full Stack Engineer, React Developer, Frontend Software Engineer',
          preferredLocations: 'Bengaluru, Chennai, Remote',
          bio: 'Passionate final-year CSE student specializing in modern React, TypeScript, and full-stack web architectures with hands-on internship experience.',
          educations: {
            create: {
              institution: 'Chennai Institute of Technology',
              degree: 'B.Tech',
              fieldOfStudy: 'Computer Science and Engineering',
              startYear: 2022,
              endYear: 2026,
              grade: '8.9 CGPA',
              verificationStatus: 'VERIFIED',
            },
          },
          certificates: {
            create: [
              {
                title: 'Meta Certified Front-End Developer',
                issuingOrganization: 'Meta / Coursera',
                issueDate: '2025-06-15',
                credentialId: 'META-FE-9921',
                verificationStatus: 'VERIFIED',
                skillsCovered: 'React.js, JavaScript, HTML/CSS',
              },
              {
                title: 'AWS Certified Cloud Practitioner',
                issuingOrganization: 'Amazon Web Services',
                issueDate: '2025-11-20',
                verificationStatus: 'PENDING',
                skillsCovered: 'AWS, Cloud Computing',
              },
            ],
          },
          projects: {
            create: {
              title: 'Collaborative Project Management Suite',
              description: 'Full stack Kanban board with real-time WebSocket updates, React frontend, and Node.js REST backend.',
              technologies: 'React.js, Node.js, Express.js, TypeScript, PostgreSQL',
              projectUrl: 'https://demo-kanban.skillbridge.com',
              repoUrl: 'https://github.com/priyasharma/collab-kanban',
              verificationStatus: 'VERIFIED',
            },
          },
          skillProfiles: {
            create: [
              { skillId: skillMap.get('React.js')!, proficiencyLevel: 'ADVANCED', scorePercentage: 88, verified: true, verificationStatus: 'VERIFIED' },
              { skillId: skillMap.get('JavaScript')!, proficiencyLevel: 'ADVANCED', scorePercentage: 85, verified: true, verificationStatus: 'VERIFIED' },
              { skillId: skillMap.get('TypeScript')!, proficiencyLevel: 'INTERMEDIATE', scorePercentage: 78, verified: true, verificationStatus: 'VERIFIED' },
              { skillId: skillMap.get('HTML/CSS')!, proficiencyLevel: 'ADVANCED', scorePercentage: 90, verified: true, verificationStatus: 'VERIFIED' },
              { skillId: skillMap.get('Node.js')!, proficiencyLevel: 'INTERMEDIATE', scorePercentage: 74, verified: true, verificationStatus: 'VERIFIED' },
              { skillId: skillMap.get('Git & GitHub')!, proficiencyLevel: 'ADVANCED', scorePercentage: 82, verified: true, verificationStatus: 'VERIFIED' },
              { skillId: skillMap.get('REST APIs')!, proficiencyLevel: 'INTERMEDIATE', scorePercentage: 75, verified: true, verificationStatus: 'VERIFIED' },
            ],
          },
          assessmentAttempts: {
            create: {
              assessmentId: webAssessment.id,
              score: 88,
              totalScore: 100,
              percentage: 88,
              passed: true,
              startedAt: new Date(Date.now() - 86400000 * 3),
              completedAt: new Date(Date.now() - 86400000 * 3 + 1800000),
            },
          },
        },
      },
    },
    include: { studentProfile: true },
  });

  // Student 2: Rahul Kumar (DevOps beginner - Useful for testing Ineligible Scenarios)
  const student2User = await prisma.user.create({
    data: {
      email: 'rahul.kumar@demo.skillbridge.com',
      passwordHash,
      role: 'STUDENT',
      studentProfile: {
        create: {
          fullName: 'Rahul Kumar',
          phone: '+91 97890 12345',
          institutionName: 'Chennai Institute of Technology',
          department: 'Information Technology',
          degree: 'B.Tech',
          currentYear: 3,
          cgpa: 6.8,
          graduationYear: 2027,
          location: 'Chennai, Tamil Nadu',
          careerInterests: 'DevOps Engineer, Cloud Architect, Systems Engineer',
          preferredRoles: 'DevOps Intern, Junior Systems Administrator',
          preferredLocations: 'Chennai, Bengaluru, Remote',
          bio: 'Third-year IT student focused on Linux administration, shell automation, and container fundamentals. Currently learning Kubernetes.',
          educations: {
            create: {
              institution: 'Chennai Institute of Technology',
              degree: 'B.Tech',
              fieldOfStudy: 'Information Technology',
              startYear: 2023,
              endYear: 2027,
              grade: '6.8 CGPA',
              verificationStatus: 'VERIFIED',
            },
          },
          certificates: {
            create: [
              {
                title: 'Linux Professional Institute LPIC-1',
                issuingOrganization: 'Linux Professional Institute',
                issueDate: '2025-08-10',
                verificationStatus: 'VERIFIED',
                skillsCovered: 'Linux Administration',
              },
            ],
          },
          projects: {
            create: {
              title: 'Automated Linux Server Provisioning',
              description: 'Shell script collection for provisioning Debian/Ubuntu cloud VMs and automating Nginx reverse proxy configs.',
              technologies: 'Linux, Bash, Git, Nginx',
              verificationStatus: 'VERIFIED',
            },
          },
          skillProfiles: {
            create: [
              { skillId: skillMap.get('Linux Administration')!, proficiencyLevel: 'INTERMEDIATE', scorePercentage: 72, verified: true, verificationStatus: 'VERIFIED' },
              { skillId: skillMap.get('Git & GitHub')!, proficiencyLevel: 'INTERMEDIATE', scorePercentage: 70, verified: true, verificationStatus: 'VERIFIED' },
              { skillId: skillMap.get('Python')!, proficiencyLevel: 'BEGINNER', scorePercentage: 55, verified: false, verificationStatus: 'PENDING' },
              { skillId: skillMap.get('Docker')!, proficiencyLevel: 'BEGINNER', scorePercentage: 50, verified: false, verificationStatus: 'PENDING' },
            ],
          },
        },
      },
    },
    include: { studentProfile: true },
  });

  // Student 3: Meera Krishnan (AI & Data Science Star - Completed Courses + Certificate)
  const student3User = await prisma.user.create({
    data: {
      email: 'meera.krishnan@demo.skillbridge.com',
      passwordHash,
      role: 'STUDENT',
      studentProfile: {
        create: {
          fullName: 'Meera Krishnan',
          phone: '+91 96543 21098',
          institutionName: 'South India Institute of Engineering',
          department: 'Artificial Intelligence & Data Science',
          degree: 'B.Tech',
          currentYear: 4,
          cgpa: 9.2,
          graduationYear: 2026,
          location: 'Bengaluru, Karnataka',
          careerInterests: 'Data Scientist, Machine Learning Engineer, AI Research Associate',
          preferredRoles: 'Data Scientist, ML Engineer, AI Specialist',
          preferredLocations: 'Bengaluru, Hyderabad, Remote',
          bio: 'Final-year AI & Data Science scholar with published conference papers, specialized in neural architectures, computer vision, and predictive tabular pipelines.',
          educations: {
            create: {
              institution: 'South India Institute of Engineering',
              degree: 'B.Tech',
              fieldOfStudy: 'Artificial Intelligence & Data Science',
              startYear: 2022,
              endYear: 2026,
              grade: '9.2 CGPA',
              verificationStatus: 'VERIFIED',
            },
          },
          certificates: {
            create: [
              {
                title: 'TensorFlow Developer Certificate',
                issuingOrganization: 'Google TensorFlow',
                issueDate: '2025-05-10',
                credentialId: 'TF-DEV-88219',
                verificationStatus: 'VERIFIED',
                skillsCovered: 'Python, Deep Learning, Machine Learning',
              },
              {
                title: 'DeepLearning.AI Machine Learning Specialization',
                issuingOrganization: 'DeepLearning.AI / Coursera',
                issueDate: '2025-09-12',
                credentialId: 'DLAI-ML-4412',
                verificationStatus: 'VERIFIED',
                skillsCovered: 'Machine Learning, Python',
              },
            ],
          },
          projects: {
            create: {
              title: 'Healthcare Diagnostic Neural Pipeline',
              description: 'ResNet-based medical imaging classification pipeline achieving 96.4% sensitivity on open chest X-ray datasets.',
              technologies: 'Python, Deep Learning, PyTorch, Pandas, SQL',
              projectUrl: 'https://demo-medvision.skillbridge.com',
              repoUrl: 'https://github.com/meerakrishnan/medvision-ai',
              verificationStatus: 'VERIFIED',
            },
          },
          skillProfiles: {
            create: [
              { skillId: skillMap.get('Python')!, proficiencyLevel: 'EXPERT', scorePercentage: 94, verified: true, verificationStatus: 'VERIFIED' },
              { skillId: skillMap.get('Machine Learning')!, proficiencyLevel: 'ADVANCED', scorePercentage: 90, verified: true, verificationStatus: 'VERIFIED' },
              { skillId: skillMap.get('Pandas')!, proficiencyLevel: 'ADVANCED', scorePercentage: 92, verified: true, verificationStatus: 'VERIFIED' },
              { skillId: skillMap.get('SQL')!, proficiencyLevel: 'ADVANCED', scorePercentage: 86, verified: true, verificationStatus: 'VERIFIED' },
              { skillId: skillMap.get('Deep Learning')!, proficiencyLevel: 'INTERMEDIATE', scorePercentage: 80, verified: true, verificationStatus: 'VERIFIED' },
              { skillId: skillMap.get('Data Analysis')!, proficiencyLevel: 'ADVANCED', scorePercentage: 89, verified: true, verificationStatus: 'VERIFIED' },
            ],
          },
          assessmentAttempts: {
            create: {
              assessmentId: dsAssessment.id,
              score: 94,
              totalScore: 100,
              percentage: 94,
              passed: true,
              startedAt: new Date(Date.now() - 86400000 * 2),
              completedAt: new Date(Date.now() - 86400000 * 2 + 1500000),
            },
          },
        },
      },
    },
    include: { studentProfile: true },
  });

  // Student 4: Arjun Patel (Embedded Systems & IoT)
  const student4User = await prisma.user.create({
    data: {
      email: 'arjun.patel@demo.skillbridge.com',
      passwordHash,
      role: 'STUDENT',
      studentProfile: {
        create: {
          fullName: 'Arjun Patel',
          phone: '+91 95432 10987',
          institutionName: 'South India Institute of Engineering',
          department: 'Electronics and Communication Engineering',
          degree: 'B.Tech',
          currentYear: 3,
          cgpa: 7.9,
          graduationYear: 2027,
          location: 'Bengaluru, Karnataka',
          careerInterests: 'Embedded Systems Engineer, IoT Solutions Developer, Firmware Engineer',
          preferredRoles: 'Embedded Firmware Engineer, IoT Systems Intern',
          preferredLocations: 'Bengaluru, Pune, Hyderabad',
          bio: 'ECE undergraduate passionate about microcontrollers, RTOS firmware development, and IoT telemetry sensor networks.',
          educations: {
            create: {
              institution: 'South India Institute of Engineering',
              degree: 'B.Tech',
              fieldOfStudy: 'Electronics and Communication Engineering',
              startYear: 2023,
              endYear: 2027,
              grade: '7.9 CGPA',
              verificationStatus: 'VERIFIED',
            },
          },
          certificates: {
            create: [
              {
                title: 'Arm Accredited Engineer (AAE)',
                issuingOrganization: 'Arm Education',
                issueDate: '2025-07-20',
                verificationStatus: 'VERIFIED',
                skillsCovered: 'Embedded C, Microcontrollers',
              },
            ],
          },
          projects: {
            create: {
              title: 'Smart Agriculture IoT Node',
              description: 'ESP32-based mesh sensor node transmitting soil moisture, ambient humidity, and NPK metrics via MQTT.',
              technologies: 'Embedded C, IoT Protocols, Arduino, MQTT',
              verificationStatus: 'VERIFIED',
            },
          },
          skillProfiles: {
            create: [
              { skillId: skillMap.get('Embedded C')!, proficiencyLevel: 'ADVANCED', scorePercentage: 86, verified: true, verificationStatus: 'VERIFIED' },
              { skillId: skillMap.get('Arduino & Microcontrollers')!, proficiencyLevel: 'ADVANCED', scorePercentage: 84, verified: true, verificationStatus: 'VERIFIED' },
              { skillId: skillMap.get('IoT Protocols')!, proficiencyLevel: 'INTERMEDIATE', scorePercentage: 76, verified: true, verificationStatus: 'VERIFIED' },
              { skillId: skillMap.get('Python')!, proficiencyLevel: 'BEGINNER', scorePercentage: 58, verified: false, verificationStatus: 'PENDING' },
            ],
          },
        },
      },
    },
    include: { studentProfile: true },
  });

  // Student 5: Nisha Reddy (Cybersecurity Analyst)
  const student5User = await prisma.user.create({
    data: {
      email: 'nisha.reddy@demo.skillbridge.com',
      passwordHash,
      role: 'STUDENT',
      studentProfile: {
        create: {
          fullName: 'Nisha Reddy',
          phone: '+91 94321 09876',
          institutionName: 'Chennai Institute of Technology',
          department: 'Computer Science and Engineering',
          degree: 'B.Tech',
          currentYear: 4,
          cgpa: 8.4,
          graduationYear: 2026,
          location: 'Chennai, Tamil Nadu',
          careerInterests: 'Cybersecurity Analyst, SOC Analyst, Information Security Engineer',
          preferredRoles: 'Cybersecurity Analyst, Security Engineer, Penetration Tester',
          preferredLocations: 'Chennai, Bengaluru, Hyderabad, Remote',
          bio: 'Cybersecurity enthusiast experienced in threat vulnerability management, network protocol forensics, and defensive SOC monitoring.',
          educations: {
            create: {
              institution: 'Chennai Institute of Technology',
              degree: 'B.Tech',
              fieldOfStudy: 'Computer Science and Engineering',
              startYear: 2022,
              endYear: 2026,
              grade: '8.4 CGPA',
              verificationStatus: 'VERIFIED',
            },
          },
          certificates: {
            create: [
              {
                title: 'CompTIA Security+',
                issuingOrganization: 'CompTIA',
                issueDate: '2025-04-18',
                credentialId: 'COMP-SEC-7712',
                verificationStatus: 'VERIFIED',
                skillsCovered: 'Network Security, Cryptography',
              },
              {
                title: 'Certified Ethical Hacker (CEH)',
                issuingOrganization: 'EC-Council',
                issueDate: '2025-10-05',
                verificationStatus: 'PENDING',
                skillsCovered: 'Ethical Hacking',
              },
            ],
          },
          projects: {
            create: {
              title: 'Vulnerability Scanning & Penetration Testing Framework',
              description: 'Automated vulnerability scanner combining Nmap, custom Python scripts, and CVE database lookups.',
              technologies: 'Python, Linux Administration, Network Security, Ethical Hacking',
              verificationStatus: 'VERIFIED',
            },
          },
          skillProfiles: {
            create: [
              { skillId: skillMap.get('Network Security')!, proficiencyLevel: 'ADVANCED', scorePercentage: 87, verified: true, verificationStatus: 'VERIFIED' },
              { skillId: skillMap.get('Ethical Hacking')!, proficiencyLevel: 'INTERMEDIATE', scorePercentage: 79, verified: true, verificationStatus: 'VERIFIED' },
              { skillId: skillMap.get('Linux Administration')!, proficiencyLevel: 'ADVANCED', scorePercentage: 85, verified: true, verificationStatus: 'VERIFIED' },
              { skillId: skillMap.get('Cryptography')!, proficiencyLevel: 'INTERMEDIATE', scorePercentage: 75, verified: true, verificationStatus: 'VERIFIED' },
              { skillId: skillMap.get('Python')!, proficiencyLevel: 'INTERMEDIATE', scorePercentage: 72, verified: true, verificationStatus: 'VERIFIED' },
            ],
          },
        },
      },
    },
    include: { studentProfile: true },
  });

  // ---------------------------------------------------------
  // 7. Courses (11 Courses across Academician, Industry, Institution)
  // ---------------------------------------------------------
  console.log('7. Seeding Courses, Modules, Lessons, and Taxonomy Mappings...');

  // Course 1: Full-Stack React & TS (Dr. Ananya Krishnan)
  const course1 = await prisma.course.create({
    data: {
      title: 'Modern Full-Stack React & TypeScript Masterclass',
      description: 'Master component-driven frontend engineering with React 19, TypeScript interfaces, Next.js patterns, and RESTful API integrations.',
      providerId: academician1.id,
      providerRole: 'ACADEMICIAN',
      providerName: 'Dr. Ananya Krishnan',
      category: 'Web Development',
      skillLevel: 'INTERMEDIATE',
      duration: '8 Weeks',
      mode: 'ONLINE',
      prerequisites: 'Basic JavaScript and HTML/CSS fundamentals.',
      learningOutcomes: 'Build type-safe SPAs, manage complex state with Zustand, integrate secure JWT APIs, and deploy production web applications.',
      startDate: '2026-03-01',
      endDate: '2026-04-30',
      enrollmentDeadline: '2026-02-28',
      maxParticipants: 100,
      certificateAvailable: true,
      status: 'PUBLISHED',
      skills: {
        create: [
          { skillId: skillMap.get('React.js')! },
          { skillId: skillMap.get('TypeScript')! },
          { skillId: skillMap.get('JavaScript')! },
          { skillId: skillMap.get('REST APIs')! },
        ],
      },
      modules: {
        create: [
          {
            title: 'Module 1: Advanced React Patterns & TypeScript',
            orderIndex: 1,
            lessons: {
              create: [
                { title: 'TypeScript Generics with React Props & Hooks', durationMinutes: 45, orderIndex: 1, content: 'Comprehensive guide to strict prop types and custom hook typing.' },
                { title: 'State Management Architecture with Zustand', durationMinutes: 50, orderIndex: 2, content: 'Eliminating prop-drilling with atomic global state slices.' },
              ],
            },
          },
          {
            title: 'Module 2: Server Integrations & Production Deployment',
            orderIndex: 2,
            lessons: {
              create: [
                { title: 'Optimistic UI Updates and TanStack Query', durationMinutes: 60, orderIndex: 3, content: 'Caching strategies and seamless optimistic mutation rollbacks.' },
                { title: 'CI/CD Automated Deployments with Docker', durationMinutes: 50, orderIndex: 4, content: 'Containerizing single page applications with multi-stage Nginx builds.' },
              ],
            },
          },
        ],
      },
    },
    include: { modules: { include: { lessons: true } } },
  });

  // Course 2: Applied Machine Learning & Neural Networks (Dr. Ravi Narayanan)
  const course2 = await prisma.course.create({
    data: {
      title: 'Applied Machine Learning & Neural Networks with Python',
      description: 'In-depth journey into predictive modeling, gradient boosted decision trees, neural network backpropagation, and PyTorch deep learning architectures.',
      providerId: academician2.id,
      providerRole: 'ACADEMICIAN',
      providerName: 'Dr. Ravi Narayanan',
      category: 'Data Science',
      skillLevel: 'ADVANCED',
      duration: '10 Weeks',
      mode: 'HYBRID',
      prerequisites: 'Linear algebra, Python programming, and basic calculus.',
      learningOutcomes: 'Train state-of-the-art tabular and neural models, perform feature engineering at scale, and deploy inference endpoints.',
      startDate: '2026-03-10',
      endDate: '2026-05-20',
      enrollmentDeadline: '2026-03-05',
      maxParticipants: 80,
      certificateAvailable: true,
      status: 'PUBLISHED',
      skills: {
        create: [
          { skillId: skillMap.get('Python')! },
          { skillId: skillMap.get('Machine Learning')! },
          { skillId: skillMap.get('Deep Learning')! },
          { skillId: skillMap.get('Pandas')! },
        ],
      },
      modules: {
        create: [
          {
            title: 'Module 1: Feature Engineering & Tabular Machine Learning',
            orderIndex: 1,
            lessons: {
              create: [
                { title: 'High-Dimensional Feature Selection & Pandas Pipelines', durationMinutes: 55, orderIndex: 1, content: 'Vectorized data cleaning and robust cross-validation schemas.' },
                { title: 'Ensemble Learning: XGBoost, LightGBM & CatBoost', durationMinutes: 60, orderIndex: 2, content: 'Tuning tree depths, learning rates, and regularization.' },
              ],
            },
          },
          {
            title: 'Module 2: PyTorch Deep Neural Networks',
            orderIndex: 2,
            lessons: {
              create: [
                { title: 'Building Multi-Layer Perceptrons in PyTorch', durationMinutes: 65, orderIndex: 3, content: 'Loss functions, optimizers, and automated gradient backprop.' },
                { title: 'Model Evaluation Metrics & ROC-AUC Analysis', durationMinutes: 45, orderIndex: 4, content: 'Precision, recall, F1 curves, and confusion matrix calibration.' },
              ],
            },
          },
        ],
      },
    },
    include: { modules: { include: { lessons: true } } },
  });

  // Course 3: Cloud Architecture on AWS & Kubernetes (CloudSphere Technologies)
  const course3 = await prisma.course.create({
    data: {
      title: 'Production Cloud Architecture on AWS & Kubernetes',
      description: 'Hands-on enterprise cloud engineering: Multi-tier VPC networks, Amazon EKS clusters, Helm chart deployments, and zero-downtime rolling upgrades.',
      providerId: cloudsphereUser.id,
      providerRole: 'INDUSTRY',
      providerName: 'CloudSphere Technologies',
      category: 'Cloud Computing',
      skillLevel: 'ADVANCED',
      duration: '8 Weeks',
      mode: 'ONLINE',
      prerequisites: 'Linux administration and basic containerization concepts.',
      learningOutcomes: 'Design highly available multi-region cloud infrastructures, orchestrate Kubernetes clusters, and implement automated GitOps workflows.',
      startDate: '2026-03-15',
      endDate: '2026-05-15',
      enrollmentDeadline: '2026-03-10',
      maxParticipants: 120,
      certificateAvailable: true,
      status: 'PUBLISHED',
      skills: {
        create: [
          { skillId: skillMap.get('AWS')! },
          { skillId: skillMap.get('Kubernetes')! },
          { skillId: skillMap.get('Docker')! },
          { skillId: skillMap.get('CI/CD Pipelines')! },
        ],
      },
      modules: {
        create: [
          {
            title: 'Module 1: AWS Core Infrastructure & VPC Networking',
            orderIndex: 1,
            lessons: {
              create: [
                { title: 'Designing High-Availability VPCs and Subnets', durationMinutes: 50, orderIndex: 1, content: 'Public/private routing, NAT gateways, and internet egress control.' },
                { title: 'IAM Policies, Roles, and Cloud Security Best Practices', durationMinutes: 45, orderIndex: 2, content: 'Least privilege access control and AWS security groups.' },
              ],
            },
          },
          {
            title: 'Module 2: Container Orchestration with Kubernetes',
            orderIndex: 2,
            lessons: {
              create: [
                { title: 'Kubernetes Pods, Deployments & Service Networking', durationMinutes: 60, orderIndex: 3, content: 'Cluster IP, NodePort, Ingress controllers, and service meshes.' },
                { title: 'ConfigMaps, Secrets & Persistent Volume Claims', durationMinutes: 50, orderIndex: 4, content: 'Decoupling application configs from container images.' },
                { title: 'Helm Charts and Automated GitOps Pipelines', durationMinutes: 60, orderIndex: 5, content: 'ArgoCD synchronization and declarative cluster state management.' },
              ],
            },
          },
        ],
      },
    },
    include: { modules: { include: { lessons: true } } },
  });

  // Course 4: Enterprise Microservices with Node.js & Docker (TechNova Solutions)
  const course4 = await prisma.course.create({
    data: {
      title: 'Enterprise Microservices with Node.js & Docker',
      description: 'Architect resilient event-driven microservices using Node.js, Express, Redis caching, RabbitMQ message brokers, and Docker Compose.',
      providerId: technovaUser.id,
      providerRole: 'INDUSTRY',
      providerName: 'TechNova Solutions Pvt Ltd',
      category: 'Web Development',
      skillLevel: 'INTERMEDIATE',
      duration: '6 Weeks',
      mode: 'ONLINE',
      certificateAvailable: true,
      status: 'PUBLISHED',
      skills: {
        create: [
          { skillId: skillMap.get('Node.js')! },
          { skillId: skillMap.get('Express.js')! },
          { skillId: skillMap.get('Docker')! },
          { skillId: skillMap.get('REST APIs')! },
        ],
      },
      modules: {
        create: [
          {
            title: 'Module 1: Microservice Decomposition & API Gateways',
            orderIndex: 1,
            lessons: {
              create: [
                { title: 'Domain-Driven Design and Microservice Boundaries', durationMinutes: 45, orderIndex: 1, content: 'Decoupling monolithic architectures into domain-bounded services.' },
                { title: 'API Gateway Routing, Rate Limiting & Authentication', durationMinutes: 50, orderIndex: 2, content: 'Reverse proxying with Express and Redis rate limiting.' },
              ],
            },
          },
          {
            title: 'Module 2: Containerization & Inter-Service Messaging',
            orderIndex: 2,
            lessons: {
              create: [
                { title: 'Dockerizing Node.js Services with Healthchecks', durationMinutes: 40, orderIndex: 3, content: 'Graceful shutdown handling and lean alpine container images.' },
                { title: 'Event Publishing & Asynchronous Task Queues', durationMinutes: 55, orderIndex: 4, content: 'Message brokers and guaranteed delivery patterns.' },
              ],
            },
          },
        ],
      },
    },
  });

  // Course 5: Practical Data Engineering & SQL Pipelines (DataMind Analytics Lab)
  const course5 = await prisma.course.create({
    data: {
      title: 'Practical Data Engineering & SQL Pipelines',
      description: 'Build enterprise ETL/ELT pipelines, dimensional data warehouses, and query optimizations using PostgreSQL and Python.',
      providerId: datamindUser.id,
      providerRole: 'INDUSTRY',
      providerName: 'DataMind Analytics Lab',
      category: 'Data Science',
      skillLevel: 'INTERMEDIATE',
      duration: '6 Weeks',
      mode: 'ONLINE',
      certificateAvailable: true,
      status: 'PUBLISHED',
      skills: {
        create: [
          { skillId: skillMap.get('SQL')! },
          { skillId: skillMap.get('Python')! },
          { skillId: skillMap.get('Data Analysis')! },
          { skillId: skillMap.get('Pandas')! },
        ],
      },
      modules: {
        create: [
          {
            title: 'Module 1: Advanced Relational SQL & Indexing',
            orderIndex: 1,
            lessons: {
              create: [
                { title: 'Window Functions, CTEs, and Complex Aggregations', durationMinutes: 50, orderIndex: 1, content: 'ROW_NUMBER, RANK, DENSE_RANK, and recursive CTE expressions.' },
                { title: 'Query Execution Plans & B-Tree Index Optimization', durationMinutes: 55, orderIndex: 2, content: 'EXPLAIN ANALYZE interpretation and index strategies.' },
              ],
            },
          },
          {
            title: 'Module 2: Automated ETL with Python and Pandas',
            orderIndex: 2,
            lessons: {
              create: [
                { title: 'Extracting and Transforming Multi-Source Data', durationMinutes: 45, orderIndex: 3, content: 'Batch data ingestion from REST APIs and relational stores.' },
                { title: 'Data Validation and Pipeline Monitoring', durationMinutes: 40, orderIndex: 4, content: 'Schema assertions and error alerting.' },
              ],
            },
          },
        ],
      },
    },
  });

  // Course 6: Foundations of Cyber Defense & Ethical Hacking (Chennai Institute of Technology)
  const course6 = await prisma.course.create({
    data: {
      title: 'Foundations of Cyber Defense & Ethical Hacking',
      description: 'Fundamental course covering defensive cybersecurity, vulnerability management, network protocol analysis, and penetration testing methodologies.',
      providerId: citUser.id,
      providerRole: 'INSTITUTION',
      providerName: 'Chennai Institute of Technology',
      category: 'Cybersecurity',
      skillLevel: 'BEGINNER',
      duration: '8 Weeks',
      mode: 'HYBRID',
      certificateAvailable: true,
      status: 'PUBLISHED',
      skills: {
        create: [
          { skillId: skillMap.get('Network Security')! },
          { skillId: skillMap.get('Ethical Hacking')! },
          { skillId: skillMap.get('Linux Administration')! },
          { skillId: skillMap.get('Cryptography')! },
        ],
      },
      modules: {
        create: [
          {
            title: 'Module 1: Network Protocols & Security Architecture',
            orderIndex: 1,
            lessons: {
              create: [
                { title: 'Packet Sniffing and Wireshark Traffic Forensics', durationMinutes: 50, orderIndex: 1, content: 'Dissecting TCP 3-way handshakes and TLS encryption negotiations.' },
                { title: 'Port Scanning and Network Reconnaissance with Nmap', durationMinutes: 45, orderIndex: 2, content: 'SYN scanning, OS fingerprinting, and service detection.' },
              ],
            },
          },
          {
            title: 'Module 2: Web Security & Vulnerability Assessment',
            orderIndex: 2,
            lessons: {
              create: [
                { title: 'OWASP Top 10: SQL Injection & XSS Exploits', durationMinutes: 60, orderIndex: 3, content: 'Identifying and patching input injection vulnerabilities.' },
                { title: 'Defensive Hardening on Linux Servers', durationMinutes: 45, orderIndex: 4, content: 'SSH key-based auth, UFW firewalls, and fail2ban setup.' },
              ],
            },
          },
        ],
      },
    },
    include: { modules: { include: { lessons: true } } },
  });

  // Course 7: IoT Architecture & Embedded C Firmware (South India Institute of Engineering)
  const course7 = await prisma.course.create({
    data: {
      title: 'IoT Architecture & Embedded C Firmware Programming',
      description: 'Design robust microcontroller firmware in Embedded C, interface sensors and actuators, and publish telemetry data via MQTT protocols.',
      providerId: siieUser.id,
      providerRole: 'INSTITUTION',
      providerName: 'South India Institute of Engineering',
      category: 'Embedded Systems',
      skillLevel: 'INTERMEDIATE',
      duration: '8 Weeks',
      mode: 'HYBRID',
      certificateAvailable: true,
      status: 'PUBLISHED',
      skills: {
        create: [
          { skillId: skillMap.get('Embedded C')! },
          { skillId: skillMap.get('Arduino & Microcontrollers')! },
          { skillId: skillMap.get('IoT Protocols')! },
        ],
      },
      modules: {
        create: [
          {
            title: 'Module 1: Embedded C & Microcontroller Peripherals',
            orderIndex: 1,
            lessons: {
              create: [
                { title: 'Bitwise Manipulation & Direct Register Access', durationMinutes: 50, orderIndex: 1, content: 'Configuring GPIO registers, timers, and external interrupts in C.' },
                { title: 'Serial Communication: UART, SPI & I2C Protocols', durationMinutes: 55, orderIndex: 2, content: 'Interfacing multi-sensor modules with bus arbitration.' },
              ],
            },
          },
          {
            title: 'Module 2: IoT Telemetry & Cloud Connectivity',
            orderIndex: 2,
            lessons: {
              create: [
                { title: 'ESP32 Wi-Fi Integration and MQTT Publishing', durationMinutes: 50, orderIndex: 3, content: 'Publish/subscribe paradigms and QoS levels with MQTT brokers.' },
                { title: 'Power Optimization & Sleep Modes for Edge Nodes', durationMinutes: 40, orderIndex: 4, content: 'Deep sleep cycling and battery management for remote IoT.' },
              ],
            },
          },
        ],
      },
    },
    include: { modules: { include: { lessons: true } } },
  });

  // Courses 8 - 11: Additional rich catalog offerings
  const course8 = await prisma.course.create({
    data: {
      title: 'Frontend Performance Optimization & Architecture',
      description: 'Master Core Web Vitals, code splitting, memoization patterns, bundle analysis, and progressive web apps in modern React applications.',
      providerId: academician1.id,
      providerRole: 'ACADEMICIAN',
      providerName: 'Dr. Ananya Krishnan',
      category: 'Web Development',
      skillLevel: 'ADVANCED',
      duration: '4 Weeks',
      mode: 'ONLINE',
      certificateAvailable: true,
      status: 'PUBLISHED',
      skills: {
        create: [
          { skillId: skillMap.get('React.js')! },
          { skillId: skillMap.get('JavaScript')! },
          { skillId: skillMap.get('HTML/CSS')! },
        ],
      },
      modules: {
        create: {
          title: 'Module 1: Profiling and Web Performance Metrics',
          orderIndex: 1,
          lessons: {
            create: [
              { title: 'Measuring LCP, INP, and CLS Metrics', durationMinutes: 40, orderIndex: 1, content: 'Lighthouse audits and Chrome DevTools flamegraph analysis.' },
              { title: 'Virtualization & Dynamic Code Splitting', durationMinutes: 45, orderIndex: 2, content: 'React.lazy, Suspense boundaries, and windowing large lists.' },
            ],
          },
        },
      },
    },
  });

  const course9 = await prisma.course.create({
    data: {
      title: 'Deep Learning with PyTorch & Computer Vision',
      description: 'Convolutional Neural Networks, transfer learning with ResNet/Vision Transformers, and object detection for real-time video feeds.',
      providerId: academician2.id,
      providerRole: 'ACADEMICIAN',
      providerName: 'Dr. Ravi Narayanan',
      category: 'Data Science',
      skillLevel: 'ADVANCED',
      duration: '8 Weeks',
      mode: 'HYBRID',
      certificateAvailable: true,
      status: 'PUBLISHED',
      skills: {
        create: [
          { skillId: skillMap.get('Deep Learning')! },
          { skillId: skillMap.get('Python')! },
          { skillId: skillMap.get('Machine Learning')! },
        ],
      },
      modules: {
        create: {
          title: 'Module 1: Vision Architectures and Transfer Learning',
          orderIndex: 1,
          lessons: {
            create: [
              { title: 'CNN Convolutions, Kernels and Pooling Layers', durationMinutes: 50, orderIndex: 1, content: 'Feature map extraction and spatial hierarchy learning.' },
              { title: 'Fine-Tuning Pretrained Vision Models in PyTorch', durationMinutes: 55, orderIndex: 2, content: 'Freezing layers, learning rate schedulers, and augmentation.' },
            ],
          },
        },
      },
    },
  });

  const course10 = await prisma.course.create({
    data: {
      title: 'Automated CI/CD with GitHub Actions & Docker',
      description: 'Complete hands-on engineering for building continuous integration matrices, linting gates, automated test runners, and multi-cloud container registry pushes.',
      providerId: cloudsphereUser.id,
      providerRole: 'INDUSTRY',
      providerName: 'CloudSphere Technologies',
      category: 'Cloud Computing',
      skillLevel: 'INTERMEDIATE',
      duration: '4 Weeks',
      mode: 'ONLINE',
      certificateAvailable: true,
      status: 'PUBLISHED',
      skills: {
        create: [
          { skillId: skillMap.get('CI/CD Pipelines')! },
          { skillId: skillMap.get('Docker')! },
          { skillId: skillMap.get('Git & GitHub')! },
        ],
      },
      modules: {
        create: {
          title: 'Module 1: Workflow Syntax and Runner Automation',
          orderIndex: 1,
          lessons: {
            create: [
              { title: 'Writing GitHub Actions Workflows and Job Matrices', durationMinutes: 45, orderIndex: 1, content: 'Trigger filters, environment secrets, and artifact caching.' },
              { title: 'Building and Publishing Multi-Arch Docker Images', durationMinutes: 40, orderIndex: 2, content: 'Docker Buildx and container vulnerability scanning.' },
            ],
          },
        },
      },
    },
  });

  const course11 = await prisma.course.create({
    data: {
      title: 'Advanced Database Systems & Query Optimization',
      description: 'PostgreSQL internal storage engines, WAL logs, MVCC concurrency, vacuuming mechanics, and distributed database sharding strategies.',
      providerId: technovaUser.id,
      providerRole: 'INDUSTRY',
      providerName: 'TechNova Solutions Pvt Ltd',
      category: 'Data Science',
      skillLevel: 'ADVANCED',
      duration: '6 Weeks',
      mode: 'ONLINE',
      certificateAvailable: true,
      status: 'PUBLISHED',
      skills: {
        create: [
          { skillId: skillMap.get('SQL')! },
          { skillId: skillMap.get('REST APIs')! },
        ],
      },
      modules: {
        create: {
          title: 'Module 1: Concurrency and Storage Internals',
          orderIndex: 1,
          lessons: {
            create: [
              { title: 'Transaction Isolation Levels and MVCC Mechanics', durationMinutes: 50, orderIndex: 1, content: 'Read committed, repeatable read, and serializable locks.' },
              { title: 'Partitioning Large Datasets & Sharding Architectures', durationMinutes: 55, orderIndex: 2, content: 'Range, list, and hash table partitioning.' },
            ],
          },
        },
      },
    },
  });

  // ---------------------------------------------------------
  // 8. Dynamic Course Enrollments, Lesson Progress & Certificates
  // ---------------------------------------------------------
  console.log('8. Seeding Dynamic Course Enrollments & Verified Certificates...');

  // Priya Sharma -> Enrolled in Course 1 (3 of 4 lessons completed = 75%)
  const c1Lessons = course1.modules.flatMap((m) => m.lessons);
  const priyaEnrollment = await prisma.courseEnrollment.create({
    data: {
      studentId: student1User.studentProfile!.id,
      courseId: course1.id,
      progressPercentage: 75.0,
      status: 'IN_PROGRESS',
      enrolledAt: new Date(Date.now() - 86400000 * 14),
      lessonProgress: {
        create: [
          { lessonId: c1Lessons[0].id, isCompleted: true, completedAt: new Date(Date.now() - 86400000 * 10) },
          { lessonId: c1Lessons[1].id, isCompleted: true, completedAt: new Date(Date.now() - 86400000 * 7) },
          { lessonId: c1Lessons[2].id, isCompleted: true, completedAt: new Date(Date.now() - 86400000 * 2) },
          { lessonId: c1Lessons[3].id, isCompleted: false },
        ],
      },
    },
  });

  // Rahul Kumar -> Enrolled in Course 3 (2 of 5 lessons completed = 40%)
  const c3Lessons = course3.modules.flatMap((m) => m.lessons);
  await prisma.courseEnrollment.create({
    data: {
      studentId: student2User.studentProfile!.id,
      courseId: course3.id,
      progressPercentage: 40.0,
      status: 'IN_PROGRESS',
      enrolledAt: new Date(Date.now() - 86400000 * 10),
      lessonProgress: {
        create: [
          { lessonId: c3Lessons[0].id, isCompleted: true, completedAt: new Date(Date.now() - 86400000 * 8) },
          { lessonId: c3Lessons[1].id, isCompleted: true, completedAt: new Date(Date.now() - 86400000 * 5) },
          { lessonId: c3Lessons[2].id, isCompleted: false },
          { lessonId: c3Lessons[3].id, isCompleted: false },
          { lessonId: c3Lessons[4].id, isCompleted: false },
        ],
      },
    },
  });

  // Meera Krishnan -> Enrolled in Course 2 (4 of 4 lessons completed = 100% + Certificate Issued!)
  const c2Lessons = course2.modules.flatMap((m) => m.lessons);
  const meeraEnrollment = await prisma.courseEnrollment.create({
    data: {
      studentId: student3User.studentProfile!.id,
      courseId: course2.id,
      progressPercentage: 100.0,
      status: 'COMPLETED',
      completedAt: new Date(Date.now() - 86400000 * 3),
      certificateStatus: 'ISSUED',
      enrolledAt: new Date(Date.now() - 86400000 * 25),
      lessonProgress: {
        create: c2Lessons.map((l) => ({
          lessonId: l.id,
          isCompleted: true,
          completedAt: new Date(Date.now() - 86400000 * 4),
        })),
      },
    },
  });

  await prisma.courseCertificate.create({
    data: {
      enrollmentId: meeraEnrollment.id,
      studentId: student3User.studentProfile!.id,
      courseId: course2.id,
      certificateCode: 'SKB-CERT-ML-2026-MEERA',
      studentName: 'Meera Krishnan',
      courseTitle: 'Applied Machine Learning & Neural Networks with Python',
      providerName: 'Dr. Ravi Narayanan',
      issueDate: new Date(Date.now() - 86400000 * 3),
      verificationStatus: 'VERIFIED',
      verifiedById: academician2.id,
      verifiedAt: new Date(Date.now() - 86400000 * 2),
      remarks: 'Verified complete curriculum mastery and neural network implementation proficiency.',
    },
  });

  // Arjun Patel -> Enrolled in Course 7 (2 of 4 lessons = 50%)
  const c7Lessons = course7.modules.flatMap((m) => m.lessons);
  await prisma.courseEnrollment.create({
    data: {
      studentId: student4User.studentProfile!.id,
      courseId: course7.id,
      progressPercentage: 50.0,
      status: 'IN_PROGRESS',
      enrolledAt: new Date(Date.now() - 86400000 * 12),
      lessonProgress: {
        create: [
          { lessonId: c7Lessons[0].id, isCompleted: true, completedAt: new Date(Date.now() - 86400000 * 8) },
          { lessonId: c7Lessons[1].id, isCompleted: true, completedAt: new Date(Date.now() - 86400000 * 4) },
          { lessonId: c7Lessons[2].id, isCompleted: false },
          { lessonId: c7Lessons[3].id, isCompleted: false },
        ],
      },
    },
  });

  // Nisha Reddy -> Enrolled in Course 6 (3 of 4 lessons = 75%)
  const c6Lessons = course6.modules.flatMap((m) => m.lessons);
  await prisma.courseEnrollment.create({
    data: {
      studentId: student5User.studentProfile!.id,
      courseId: course6.id,
      progressPercentage: 75.0,
      status: 'IN_PROGRESS',
      enrolledAt: new Date(Date.now() - 86400000 * 18),
      lessonProgress: {
        create: [
          { lessonId: c6Lessons[0].id, isCompleted: true, completedAt: new Date(Date.now() - 86400000 * 14) },
          { lessonId: c6Lessons[1].id, isCompleted: true, completedAt: new Date(Date.now() - 86400000 * 9) },
          { lessonId: c6Lessons[2].id, isCompleted: true, completedAt: new Date(Date.now() - 86400000 * 3) },
          { lessonId: c6Lessons[3].id, isCompleted: false },
        ],
      },
    },
  });

  // ---------------------------------------------------------
  // 9. Opportunities (8 Internships + 6 Jobs = 14 Postings)
  // ---------------------------------------------------------
  console.log('9. Seeding Opportunities (Internships & Jobs) with Strict Criteria...');

  // Internship 1: Full Stack Intern (TechNova) -> Priya is ELIGIBLE (90%+)
  const opp1 = await prisma.opportunity.create({
    data: {
      industryId: technovaUser.industryProfile!.id,
      title: 'Full Stack Web Developer Intern',
      type: 'INTERNSHIP',
      description: 'Join our SaaS engineering team to build scalable responsive features using React.js, TypeScript, Node.js, and RESTful APIs.',
      degree: 'B.Tech',
      department: 'Computer Science and Engineering',
      minCgpa: 7.5,
      experience: 'Fresher / Final Year',
      location: 'Bengaluru, Karnataka',
      workMode: 'HYBRID',
      stipendOrSalary: 'INR 25,000 / month',
      duration: '6 Months',
      startDate: '2026-06-01',
      numberOfOpenings: 4,
      responsibilities: 'Develop frontend components in React, design backend REST endpoints in Express, write unit tests, and participate in sprint reviews.',
      selectionProcess: 'Resume Screening -> Technical Skill Assessment -> Live Coding & Architecture Interview',
      isPublished: true,
      applicationDeadline: new Date(Date.now() + 86400000 * 45),
      skills: {
        create: [
          { skillId: skillMap.get('React.js')!, isRequired: true, minProficiency: 'ADVANCED' },
          { skillId: skillMap.get('Node.js')!, isRequired: true, minProficiency: 'INTERMEDIATE' },
          { skillId: skillMap.get('TypeScript')!, isRequired: true, minProficiency: 'INTERMEDIATE' },
          { skillId: skillMap.get('GraphQL')!, isRequired: false, minProficiency: 'BEGINNER' },
        ],
      },
    },
  });

  // Internship 2: Cloud & DevOps Intern (CloudSphere) -> Rahul is NOT ELIGIBLE (CGPA 6.8 < 7.5, missing K8s/AWS)
  const opp2 = await prisma.opportunity.create({
    data: {
      industryId: cloudsphereUser.industryProfile!.id,
      title: 'Cloud & DevOps Engineering Intern',
      type: 'INTERNSHIP',
      description: 'Assist in configuring Kubernetes container clusters, writing automated CI/CD GitHub Actions pipelines, and managing AWS infrastructure.',
      degree: 'B.Tech',
      department: 'Computer Science and Engineering',
      minCgpa: 7.5,
      experience: 'Final Year / Pre-Final Year',
      location: 'Hyderabad, Telangana',
      workMode: 'REMOTE',
      stipendOrSalary: 'INR 30,000 / month',
      duration: '6 Months',
      startDate: '2026-06-01',
      numberOfOpenings: 3,
      isPublished: true,
      applicationDeadline: new Date(Date.now() + 86400000 * 30),
      skills: {
        create: [
          { skillId: skillMap.get('Docker')!, isRequired: true, minProficiency: 'ADVANCED' },
          { skillId: skillMap.get('Kubernetes')!, isRequired: true, minProficiency: 'INTERMEDIATE' },
          { skillId: skillMap.get('AWS')!, isRequired: true, minProficiency: 'INTERMEDIATE' },
        ],
      },
    },
  });

  // Internship 3: Data Science & ML Intern (DataMind) -> Meera is ELIGIBLE (95%+)
  const opp3 = await prisma.opportunity.create({
    data: {
      industryId: datamindUser.industryProfile!.id,
      title: 'Data Science & Machine Learning Intern',
      type: 'INTERNSHIP',
      description: 'Collaborate with AI scientists on predictive modeling, feature engineering, and fine-tuning deep learning models for production datasets.',
      degree: 'B.Tech',
      department: 'Artificial Intelligence & Data Science',
      minCgpa: 8.0,
      experience: 'Final Year Scholar',
      location: 'Chennai, Tamil Nadu',
      workMode: 'ON_SITE',
      stipendOrSalary: 'INR 35,000 / month',
      duration: '6 Months',
      startDate: '2026-05-15',
      numberOfOpenings: 2,
      isPublished: true,
      applicationDeadline: new Date(Date.now() + 86400000 * 40),
      skills: {
        create: [
          { skillId: skillMap.get('Python')!, isRequired: true, minProficiency: 'ADVANCED' },
          { skillId: skillMap.get('Machine Learning')!, isRequired: true, minProficiency: 'ADVANCED' },
          { skillId: skillMap.get('Pandas')!, isRequired: true, minProficiency: 'INTERMEDIATE' },
          { skillId: skillMap.get('Deep Learning')!, isRequired: false, minProficiency: 'INTERMEDIATE' },
        ],
      },
    },
  });

  // Internship 4: Cybersecurity Operations Intern (TechNova) -> Nisha is ELIGIBLE
  const opp4 = await prisma.opportunity.create({
    data: {
      industryId: technovaUser.industryProfile!.id,
      title: 'Cybersecurity Operations Intern',
      type: 'INTERNSHIP',
      description: 'Monitor enterprise SOC alerts, investigate security incidents, perform vulnerability assessments, and harden Linux application servers.',
      degree: 'B.Tech',
      department: 'Computer Science and Engineering',
      minCgpa: 7.5,
      location: 'Chennai, Tamil Nadu',
      workMode: 'ON_SITE',
      stipendOrSalary: 'INR 22,000 / month',
      duration: '6 Months',
      numberOfOpenings: 3,
      isPublished: true,
      applicationDeadline: new Date(Date.now() + 86400000 * 50),
      skills: {
        create: [
          { skillId: skillMap.get('Network Security')!, isRequired: true, minProficiency: 'INTERMEDIATE' },
          { skillId: skillMap.get('Linux Administration')!, isRequired: true, minProficiency: 'INTERMEDIATE' },
          { skillId: skillMap.get('Ethical Hacking')!, isRequired: false, minProficiency: 'BEGINNER' },
        ],
      },
    },
  });

  // Internship 5: Embedded Systems & IoT Intern (CloudSphere) -> Arjun is ELIGIBLE
  const opp5 = await prisma.opportunity.create({
    data: {
      industryId: cloudsphereUser.industryProfile!.id,
      title: 'Embedded Systems & IoT Intern',
      type: 'INTERNSHIP',
      description: 'Develop low-level C firmware for smart edge nodes, configure MQTT telemetry pipelines, and interface sensor peripherals.',
      degree: 'B.Tech',
      department: 'Electronics and Communication Engineering',
      minCgpa: 7.0,
      location: 'Bengaluru, Karnataka',
      workMode: 'HYBRID',
      stipendOrSalary: 'INR 20,000 / month',
      duration: '6 Months',
      numberOfOpenings: 2,
      isPublished: true,
      applicationDeadline: new Date(Date.now() + 86400000 * 35),
      skills: {
        create: [
          { skillId: skillMap.get('Embedded C')!, isRequired: true, minProficiency: 'INTERMEDIATE' },
          { skillId: skillMap.get('Arduino & Microcontrollers')!, isRequired: true, minProficiency: 'INTERMEDIATE' },
          { skillId: skillMap.get('IoT Protocols')!, isRequired: true, minProficiency: 'INTERMEDIATE' },
        ],
      },
    },
  });

  // Internship 6: Frontend React Engineer Intern (TechNova)
  const opp6 = await prisma.opportunity.create({
    data: {
      industryId: technovaUser.industryProfile!.id,
      title: 'Frontend React Engineer Intern',
      type: 'INTERNSHIP',
      description: 'Work closely with UI/UX designers to implement polished interactive components and animations using React.js and CSS.',
      degree: 'B.Tech',
      department: 'Computer Science and Engineering',
      minCgpa: 7.0,
      location: 'Remote',
      workMode: 'REMOTE',
      stipendOrSalary: 'INR 20,000 / month',
      duration: '3 Months',
      numberOfOpenings: 5,
      isPublished: true,
      applicationDeadline: new Date(Date.now() + 86400000 * 20),
      skills: {
        create: [
          { skillId: skillMap.get('React.js')!, isRequired: true, minProficiency: 'INTERMEDIATE' },
          { skillId: skillMap.get('JavaScript')!, isRequired: true, minProficiency: 'ADVANCED' },
          { skillId: skillMap.get('HTML/CSS')!, isRequired: true, minProficiency: 'ADVANCED' },
        ],
      },
    },
  });

  // Internship 7: AI & Data Analytics Intern (DataMind)
  const opp7 = await prisma.opportunity.create({
    data: {
      industryId: datamindUser.industryProfile!.id,
      title: 'AI & Data Analytics Intern',
      type: 'INTERNSHIP',
      description: 'Analyze complex customer behavioral datasets, build automated dashboard reports, and generate statistical insights.',
      degree: 'B.Tech',
      minCgpa: 7.5,
      location: 'Bengaluru, Karnataka',
      workMode: 'HYBRID',
      stipendOrSalary: 'INR 28,000 / month',
      duration: '6 Months',
      numberOfOpenings: 3,
      isPublished: true,
      applicationDeadline: new Date(Date.now() + 86400000 * 25),
      skills: {
        create: [
          { skillId: skillMap.get('Python')!, isRequired: true, minProficiency: 'INTERMEDIATE' },
          { skillId: skillMap.get('SQL')!, isRequired: true, minProficiency: 'INTERMEDIATE' },
          { skillId: skillMap.get('Data Analysis')!, isRequired: true, minProficiency: 'INTERMEDIATE' },
        ],
      },
    },
  });

  // Internship 8: Infrastructure & Site Reliability Intern (CloudSphere)
  const opp8 = await prisma.opportunity.create({
    data: {
      industryId: cloudsphereUser.industryProfile!.id,
      title: 'Infrastructure & Site Reliability Intern',
      type: 'INTERNSHIP',
      description: 'Maintain production infrastructure health, monitor latency metrics with Prometheus/Grafana, and automate incident responses.',
      degree: 'B.Tech',
      minCgpa: 8.0,
      location: 'Remote',
      workMode: 'REMOTE',
      stipendOrSalary: 'INR 25,000 / month',
      duration: '6 Months',
      numberOfOpenings: 2,
      isPublished: true,
      applicationDeadline: new Date(Date.now() + 86400000 * 30),
      skills: {
        create: [
          { skillId: skillMap.get('Linux Administration')!, isRequired: true, minProficiency: 'ADVANCED' },
          { skillId: skillMap.get('Docker')!, isRequired: true, minProficiency: 'INTERMEDIATE' },
        ],
      },
    },
  });

  // Jobs 1 - 6
  const job1 = await prisma.opportunity.create({
    data: {
      industryId: technovaUser.industryProfile!.id,
      title: 'Junior Full Stack Software Engineer',
      type: 'JOB',
      description: 'Full-time role building high-throughput web microservices and responsive web client interfaces for international enterprise clients.',
      degree: 'B.Tech',
      department: 'Computer Science and Engineering',
      minCgpa: 8.0,
      experience: 'Fresher / 0-1 Years',
      location: 'Bengaluru, Karnataka',
      workMode: 'HYBRID',
      stipendOrSalary: 'INR 8.5 - 11.0 LPA',
      numberOfOpenings: 3,
      isPublished: true,
      applicationDeadline: new Date(Date.now() + 86400000 * 60),
      skills: {
        create: [
          { skillId: skillMap.get('React.js')!, isRequired: true, minProficiency: 'ADVANCED' },
          { skillId: skillMap.get('Node.js')!, isRequired: true, minProficiency: 'ADVANCED' },
          { skillId: skillMap.get('TypeScript')!, isRequired: true, minProficiency: 'INTERMEDIATE' },
          { skillId: skillMap.get('SQL')!, isRequired: false, minProficiency: 'INTERMEDIATE' },
        ],
      },
    },
  });

  const job2 = await prisma.opportunity.create({
    data: {
      industryId: cloudsphereUser.industryProfile!.id,
      title: 'Associate Cloud Solutions Architect',
      type: 'JOB',
      description: 'Architect, deploy, and manage enterprise cloud migrations to AWS with hardened Kubernetes clusters and Terraform infrastructure-as-code.',
      degree: 'B.Tech',
      minCgpa: 7.5,
      experience: '0-2 Years',
      location: 'Hyderabad, Telangana',
      workMode: 'REMOTE',
      stipendOrSalary: 'INR 9.0 - 13.0 LPA',
      numberOfOpenings: 2,
      isPublished: true,
      applicationDeadline: new Date(Date.now() + 86400000 * 45),
      skills: {
        create: [
          { skillId: skillMap.get('AWS')!, isRequired: true, minProficiency: 'ADVANCED' },
          { skillId: skillMap.get('Kubernetes')!, isRequired: true, minProficiency: 'ADVANCED' },
          { skillId: skillMap.get('Docker')!, isRequired: true, minProficiency: 'ADVANCED' },
        ],
      },
    },
  });

  const job3 = await prisma.opportunity.create({
    data: {
      industryId: datamindUser.industryProfile!.id,
      title: 'Junior Machine Learning Engineer',
      type: 'JOB',
      description: 'Build automated ML training pipelines, optimize neural network inference latency, and deploy scalable model endpoints on cloud GPUs.',
      degree: 'B.Tech',
      department: 'Artificial Intelligence & Data Science',
      minCgpa: 8.5,
      experience: '0-1 Years',
      location: 'Chennai, Tamil Nadu',
      workMode: 'HYBRID',
      stipendOrSalary: 'INR 10.0 - 14.0 LPA',
      numberOfOpenings: 2,
      isPublished: true,
      applicationDeadline: new Date(Date.now() + 86400000 * 50),
      skills: {
        create: [
          { skillId: skillMap.get('Python')!, isRequired: true, minProficiency: 'ADVANCED' },
          { skillId: skillMap.get('Machine Learning')!, isRequired: true, minProficiency: 'ADVANCED' },
          { skillId: skillMap.get('Deep Learning')!, isRequired: true, minProficiency: 'INTERMEDIATE' },
          { skillId: skillMap.get('SQL')!, isRequired: false, minProficiency: 'INTERMEDIATE' },
        ],
      },
    },
  });

  const job4 = await prisma.opportunity.create({
    data: {
      industryId: technovaUser.industryProfile!.id,
      title: 'Associate Security Analyst (SOC)',
      type: 'JOB',
      description: 'L1/L2 Security Operations Center analyst responsible for analyzing SIEM telemetry, threat triage, and incident remediation.',
      degree: 'B.Tech',
      department: 'Computer Science and Engineering',
      minCgpa: 7.5,
      location: 'Chennai, Tamil Nadu',
      workMode: 'ON_SITE',
      stipendOrSalary: 'INR 7.5 - 10.0 LPA',
      numberOfOpenings: 2,
      isPublished: true,
      applicationDeadline: new Date(Date.now() + 86400000 * 40),
      skills: {
        create: [
          { skillId: skillMap.get('Network Security')!, isRequired: true, minProficiency: 'ADVANCED' },
          { skillId: skillMap.get('Ethical Hacking')!, isRequired: true, minProficiency: 'INTERMEDIATE' },
          { skillId: skillMap.get('Linux Administration')!, isRequired: true, minProficiency: 'ADVANCED' },
        ],
      },
    },
  });

  const job5 = await prisma.opportunity.create({
    data: {
      industryId: cloudsphereUser.industryProfile!.id,
      title: 'Firmware & Embedded Systems Engineer',
      type: 'JOB',
      description: 'Write robust RTOS device drivers in Embedded C, perform board bring-up, and implement industrial IoT wireless sensor protocols.',
      degree: 'B.Tech',
      department: 'Electronics and Communication Engineering',
      minCgpa: 7.5,
      location: 'Bengaluru, Karnataka',
      workMode: 'ON_SITE',
      stipendOrSalary: 'INR 8.0 - 11.5 LPA',
      numberOfOpenings: 2,
      isPublished: true,
      applicationDeadline: new Date(Date.now() + 86400000 * 35),
      skills: {
        create: [
          { skillId: skillMap.get('Embedded C')!, isRequired: true, minProficiency: 'ADVANCED' },
          { skillId: skillMap.get('IoT Protocols')!, isRequired: true, minProficiency: 'ADVANCED' },
          { skillId: skillMap.get('Arduino & Microcontrollers')!, isRequired: true, minProficiency: 'ADVANCED' },
        ],
      },
    },
  });

  const job6 = await prisma.opportunity.create({
    data: {
      industryId: datamindUser.industryProfile!.id,
      title: 'Data Platform Engineer',
      type: 'JOB',
      description: 'Architect distributed data warehouses, build automated streaming ingestion pipelines, and optimize analytical SQL queries.',
      degree: 'B.Tech',
      minCgpa: 8.0,
      location: 'Remote',
      workMode: 'REMOTE',
      stipendOrSalary: 'INR 9.5 - 12.5 LPA',
      numberOfOpenings: 3,
      isPublished: true,
      applicationDeadline: new Date(Date.now() + 86400000 * 45),
      skills: {
        create: [
          { skillId: skillMap.get('SQL')!, isRequired: true, minProficiency: 'ADVANCED' },
          { skillId: skillMap.get('Python')!, isRequired: true, minProficiency: 'ADVANCED' },
          { skillId: skillMap.get('Pandas')!, isRequired: true, minProficiency: 'ADVANCED' },
        ],
      },
    },
  });

  // ---------------------------------------------------------
  // 10. Student Applications & Lifecycle Tracking
  // ---------------------------------------------------------
  console.log('10. Seeding Realistic Student Applications & Interview Records...');

  // Priya Sharma -> Full Stack Intern (INTERVIEW stage)
  const app1 = await prisma.application.create({
    data: {
      studentId: student1User.studentProfile!.id,
      opportunityId: opp1.id,
      status: 'INTERVIEW',
      matchScore: 92.0,
      appliedAt: new Date(Date.now() - 86400000 * 7),
      coverLetter: 'I have extensive hands-on experience building full-stack React and TypeScript applications with verified assessments.',
      history: {
        create: [
          { status: 'APPLIED', notes: 'Application submitted online', createdAt: new Date(Date.now() - 86400000 * 7) },
          { status: 'SHORTLISTED', notes: 'Exceeded minimum CGPA and skill requirements', createdAt: new Date(Date.now() - 86400000 * 5) },
          { status: 'INTERVIEW', notes: 'Scheduled technical live coding round', createdAt: new Date(Date.now() - 86400000 * 2) },
        ],
      },
      interviews: {
        create: {
          scheduledAt: new Date(Date.now() + 86400000 * 2),
          meetingLink: 'https://meet.google.com/skb-demo-interview',
          notes: 'Round 1: React architecture & component state design.',
          status: 'SCHEDULED',
        },
      },
    },
  });

  // Priya Sharma -> Frontend React Engineer Intern (SHORTLISTED)
  await prisma.application.create({
    data: {
      studentId: student1User.studentProfile!.id,
      opportunityId: opp6.id,
      status: 'SHORTLISTED',
      matchScore: 95.0,
      appliedAt: new Date(Date.now() - 86400000 * 4),
      history: {
        create: [
          { status: 'APPLIED', notes: 'Application submitted', createdAt: new Date(Date.now() - 86400000 * 4) },
          { status: 'SHORTLISTED', notes: 'High skill match in React and JavaScript', createdAt: new Date(Date.now() - 86400000 * 2) },
        ],
      },
    },
  });

  // Meera Krishnan -> Data Science & ML Intern (SELECTED!)
  await prisma.application.create({
    data: {
      studentId: student3User.studentProfile!.id,
      opportunityId: opp3.id,
      status: 'SELECTED',
      matchScore: 96.0,
      appliedAt: new Date(Date.now() - 86400000 * 14),
      coverLetter: 'Published author in applied deep learning pipelines with verified TensorFlow certification.',
      history: {
        create: [
          { status: 'APPLIED', createdAt: new Date(Date.now() - 86400000 * 14) },
          { status: 'SHORTLISTED', createdAt: new Date(Date.now() - 86400000 * 10) },
          { status: 'INTERVIEW', createdAt: new Date(Date.now() - 86400000 * 6) },
          { status: 'SELECTED', notes: 'Formal internship offer letter extended.', createdAt: new Date(Date.now() - 86400000 * 1) },
        ],
      },
    },
  });

  // Meera Krishnan -> Junior Machine Learning Engineer (INTERVIEW)
  await prisma.application.create({
    data: {
      studentId: student3User.studentProfile!.id,
      opportunityId: job3.id,
      status: 'INTERVIEW',
      matchScore: 94.0,
      appliedAt: new Date(Date.now() - 86400000 * 8),
      history: {
        create: [
          { status: 'APPLIED', createdAt: new Date(Date.now() - 86400000 * 8) },
          { status: 'SHORTLISTED', createdAt: new Date(Date.now() - 86400000 * 5) },
          { status: 'INTERVIEW', createdAt: new Date(Date.now() - 86400000 * 2) },
        ],
      },
    },
  });

  // Nisha Reddy -> Cybersecurity Operations Intern (SHORTLISTED)
  await prisma.application.create({
    data: {
      studentId: student5User.studentProfile!.id,
      opportunityId: opp4.id,
      status: 'SHORTLISTED',
      matchScore: 89.0,
      appliedAt: new Date(Date.now() - 86400000 * 5),
    },
  });

  // Nisha Reddy -> Associate Security Analyst (UNDER_REVIEW)
  await prisma.application.create({
    data: {
      studentId: student5User.studentProfile!.id,
      opportunityId: job4.id,
      status: 'UNDER_REVIEW',
      matchScore: 86.0,
      appliedAt: new Date(Date.now() - 86400000 * 3),
    },
  });

  // Arjun Patel -> Embedded Systems & IoT Intern (APPLIED)
  await prisma.application.create({
    data: {
      studentId: student4User.studentProfile!.id,
      opportunityId: opp5.id,
      status: 'APPLIED',
      matchScore: 90.0,
      appliedAt: new Date(Date.now() - 86400000 * 2),
    },
  });

  // Rahul Kumar -> Site Reliability Intern (REJECTED)
  await prisma.application.create({
    data: {
      studentId: student2User.studentProfile!.id,
      opportunityId: opp8.id,
      status: 'REJECTED',
      matchScore: 58.0,
      appliedAt: new Date(Date.now() - 86400000 * 12),
      history: {
        create: [
          { status: 'APPLIED', createdAt: new Date(Date.now() - 86400000 * 12) },
          { status: 'REJECTED', notes: 'Did not satisfy minimum CGPA requirement of 8.0', createdAt: new Date(Date.now() - 86400000 * 10) },
        ],
      },
    },
  });

  // ---------------------------------------------------------
  // 11. Collaborations and Mentorship Programs
  // ---------------------------------------------------------
  console.log('11. Seeding Academic-Industry Collaborations & Mentorship Programs...');

  await prisma.collaboration.create({
    data: {
      initiatorId: datamindUser.id,
      initiatorRole: 'INDUSTRY',
      title: 'Joint AI & Deep Learning Research Initiative',
      type: 'RESEARCH',
      description: 'Industry-sponsored academic research program focused on federated learning, data privacy in healthcare neural models, and joint IEEE publications.',
      targetAudience: 'Faculty Researchers & PG Scholars',
      location: 'Chennai, Tamil Nadu',
      mode: 'HYBRID',
      duration: '12 Months',
      remunerationOrStipend: 'INR 3,50,000 Research Grant',
      eligibilityCriteria: 'Ph.D. / M.Tech in Computer Science or AI with demonstrable PyTorch/TensorFlow publications.',
      status: 'IN_PROGRESS',
      budget: 'INR 5,00,000',
      startDate: '2026-02-01',
      endDate: '2027-01-31',
      applications: {
        create: {
          applicantRole: 'ACADEMICIAN',
          academicianId: academician2.academicianProfile!.id,
          proposal: 'Proposed project on privacy-preserving differential privacy layers for tabular healthcare models.',
          status: 'ACCEPTED',
        },
      },
    },
  });

  await prisma.collaboration.create({
    data: {
      initiatorId: cloudsphereUser.id,
      initiatorRole: 'INDUSTRY',
      title: 'Cloud-Native Kubernetes Curriculum Modernization FDP',
      type: 'FDP',
      description: 'Faculty Development Program for modernizing cloud engineering syllabi with real-world Kubernetes, Terraform, and AWS labs.',
      targetAudience: 'Engineering Faculty & Department Heads',
      location: 'Hyderabad, Telangana',
      mode: 'ONLINE',
      duration: '2 Weeks',
      remunerationOrStipend: 'INR 1,20,000 Program Sponsorship',
      status: 'OPEN',
      applications: {
        create: {
          applicantRole: 'ACADEMICIAN',
          academicianId: academician1.academicianProfile!.id,
          proposal: 'Integrating container orchestration labs into semester 6 distributed systems course.',
          status: 'UNDER_REVIEW',
        },
      },
    },
  });

  // Industry Mentorship Programs
  await prisma.mentorshipProgram.create({
    data: {
      mentorId: technovaUser.industryProfile!.id,
      title: 'Full Stack Architecture & Career Acceleration',
      description: '1-on-1 industry mentorship for senior engineering students preparing for product engineering and tech interviews.',
      maxMentees: 5,
      expertiseAreas: 'React.js, Node.js, System Design, Tech Interviews',
      isAccepting: true,
      requests: {
        create: {
          studentId: student1User.studentProfile!.id,
          message: 'Eager to receive guidance on full stack microservice design and portfolio code reviews.',
          status: 'ACCEPTED',
          sessions: {
            create: {
              topic: 'Portfolio Review & Microservices Architecture',
              scheduledAt: new Date(Date.now() + 86400000 * 3),
              meetingLink: 'https://meet.google.com/skb-mentor-demo',
              status: 'SCHEDULED',
            },
          },
        },
      },
    },
  });

  await prisma.mentorshipProgram.create({
    data: {
      mentorId: datamindUser.industryProfile!.id,
      title: 'Data Science & AI Career Mastery',
      description: 'Guidance from senior data scientists on productionizing ML pipelines and publishing research.',
      maxMentees: 5,
      expertiseAreas: 'Python, Machine Learning, Deep Learning, ML Engineering',
      isAccepting: true,
      requests: {
        create: {
          studentId: student3User.studentProfile!.id,
          message: 'Seeking guidance on scaling PyTorch deep learning models for production inference.',
          status: 'ACCEPTED',
        },
      },
    },
  });

  console.log('\n====================================================');
  console.log('🎉 SEEDING COMPLETE! SUMMARY OF GENERATED DATA:');
  console.log('====================================================');
  console.log('✓ 5 Students: Priya (Full Stack), Rahul (DevOps), Meera (AI/DS), Arjun (Embedded), Nisha (Cybersecurity)');
  console.log('✓ 2 Academicians: Dr. Ananya Krishnan (CIT), Dr. Ravi Narayanan (SIIE)');
  console.log('✓ 3 Industry Partners: TechNova Solutions, CloudSphere Technologies, DataMind Analytics');
  console.log('✓ 2 Institutions: Chennai Institute of Technology (CIT), South India Institute of Eng (SIIE)');
  console.log('✓ 11 Published Courses across all provider types with real syllabus & modules');
  console.log('✓ 14 Active Opportunities (8 Internships + 6 High-Paying Jobs)');
  console.log('✓ Real dynamic progress (Meera @ 100% with verified cert, Priya @ 75%, Arjun @ 50%, Rahul @ 40%)');
  console.log('✓ Realistic application pipeline (INTERVIEW, SELECTED, SHORTLISTED, APPLIED, REJECTED)');
  console.log('====================================================\n');

  await prisma.$disconnect();
}

seedDemoData().catch((err) => {
  console.error('❌ Error during demo data seeding:', err);
  process.exit(1);
});
