export const SKILL_CATEGORIES = [
  {
    category: 'Software & Web Development',
    skills: [
      'Full-Stack Web Development (MERN Stack)',
      'Frontend Development (React.js & Next.js)',
      'Backend Engineering (Node.js & Express)',
      'Python Full-Stack & Django / FastAPI',
      'PHP & Laravel Web Development',
      'Java & Spring Boot Enterprise Development',
      'ASP.NET Core & C# Development',
      'Vue.js & Nuxt.js Frontend Development',
      'Angular Web App Development',
      'Ruby on Rails Development',
      'RESTful API & GraphQL Development',
      'TypeScript & Modern JavaScript'
    ]
  },
  {
    category: 'Mobile Application Development',
    skills: [
      'Flutter & Dart Cross-Platform Development',
      'React Native Mobile App Development',
      'Android App Development (Kotlin / Java)',
      'iOS App Development (Swift & SwiftUI)',
      'Mobile UI/UX & Responsive App Architecture',
      'Progressive Web Apps (PWA) Development'
    ]
  },
  {
    category: 'Cloud Computing & DevOps',
    skills: [
      'AWS Cloud Solutions Architecture',
      'Microsoft Azure Cloud Administration',
      'Google Cloud Platform (GCP) Engineering',
      'DevOps CI/CD Pipelines (GitHub Actions / Jenkins)',
      'Docker Containerization & Kubernetes (K8s)',
      'Infrastructure as Code (Terraform & Ansible)',
      'Linux System Administration (Ubuntu / RedHat)',
      'Serverless Architecture & Microservices'
    ]
  },
  {
    category: 'Cybersecurity & Ethical Hacking',
    skills: [
      'Ethical Hacking & Penetration Testing',
      'Network Security & Firewall Management',
      'SOC Analyst & Incident Response',
      'Web Application Security (OWASP Top 10)',
      'Vulnerability Assessment & VAPT',
      'Cryptography & Public Key Infrastructure (PKI)',
      'Information Security & ISO 27001 Compliance',
      'Cyber Forensics & Threat Hunting'
    ]
  },
  {
    category: 'Network Engineering & Infrastructure',
    skills: [
      'Cisco Networking (CCNA / CCNP Routing & Switching)',
      'Network Administration & Troubleshooting',
      'Computer Hardware & System Maintenance',
      'Windows Server & Active Directory Administration',
      'Wireless Networking & Subnetting',
      'IT Support Specialist & Helpdesk Administration (CompTIA A+)'
    ]
  },
  {
    category: 'Database Administration & Big Data',
    skills: [
      'SQL & Relational Database Design (MySQL / PostgreSQL)',
      'Microsoft SQL Server Administration (T-SQL)',
      'Oracle Database Administration (DBA)',
      'NoSQL Databases (MongoDB & Cassandra)',
      'Data Warehousing & ETL Pipelines (Snowflake / BigQuery)',
      'Big Data Engineering (Apache Spark / Hadoop)',
      'Redis Caching & In-Memory Data Storage'
    ]
  },
  {
    category: 'Data Science & Business Intelligence',
    skills: [
      'Data Analytics with Python (Pandas / NumPy)',
      'Business Intelligence & Dashboards (Power BI)',
      'Tableau Data Visualization & Reporting',
      'Statistical Analysis & R Programming',
      'Advanced Excel & Financial Modeling',
      'Exploratory Data Analysis (EDA) & Data Mining'
    ]
  },
  {
    category: 'UI/UX Design & Digital Products',
    skills: [
      'UI/UX Design & Prototyping (Figma / Adobe XD)',
      'Wireframing & User Journey Mapping',
      'Design Systems & Component Libraries',
      'Graphic Design for Digital Media (Photoshop / Illustrator)',
      'Product Management & Agile / Scrum Methodologies',
      'Usability Testing & User Research'
    ]
  },
  {
    category: 'Software Quality Assurance (QA) & Testing',
    skills: [
      'Manual Software Testing & Test Case Design',
      'Automated Testing (Selenium & Cypress)',
      'API Testing & Automation (Postman / RestAssured)',
      'Performance & Load Testing (JMeter)',
      'Mobile Automation Testing (Appium)',
      'Quality Assurance (QA) Management & Bug Tracking'
    ]
  },
  {
    category: 'CMS, E-Commerce & No-Code',
    skills: [
      'WordPress & Custom Theme / Plugin Development',
      'Shopify E-Commerce Store Development',
      'WooCommerce Customization & Integration',
      'Webflow & Framer Visual Web Development',
      'Workflow Automation (Zapier / Make.com)'
    ]
  },
  {
    category: 'Game Development & 3D Interactive Tech',
    skills: [
      'Unity 3D Game Development (C#)',
      'Unreal Engine Game Development (C++ & Blueprints)',
      '3D Modeling & Animation (Blender)',
      'AR/VR Interactive Experiences & Metaverse'
    ]
  }
];

export const ALL_PRESET_SKILLS = SKILL_CATEGORIES.flatMap((c) => c.skills);
