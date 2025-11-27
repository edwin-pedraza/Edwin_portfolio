import {
  backend,
  creator,
  web,
  javascript,
  typescript,
  html,
  css,
  reactjs,
  tailwind,
  nodejs,
  mongodb,
  git,
  figma,
  choucair,
  IqOuts,
  carrent,
  upskilled,
  ecci,
  insutec,
} from "../../../assets";

export const navLinks = [
  {
    id: "about",
    title: "About",
  },
  {
    id: "resume",
    title: "Resume",
  },
  {
    id: "projects",
    title: "Projects",
  },
  {
    id: "contact",
    title: "Contact",
  },
  {
    id: "service",
    title: "Service",
  },
];

const services = [
  {
    title: "Web Developer",
    slug: "web-developer",
    icon: web,
    shortDescription:
      "Responsive interfaces crafted with accessibility, performance, and maintainability in mind.",
    focusAreas: [
      "Pixel-perfect UI implementation with React, Tailwind, and Framer Motion animations.",
      "Design system stewardship to keep typography, spacing, and colors consistent.",
      "Performance budgets, Core Web Vitals tracking, and Lighthouse-driven optimizations.",
    ],
    toolset: ["React", "Vite", "Tailwind CSS", "TypeScript", "Framer Motion", "Storybook"],
  },
  {
    title: "Backend Developer",
    slug: "backend-developer",
    icon: backend,
    shortDescription: "Robust APIs, secure data flows, and cloud-native deployments that scale.",
    focusAreas: [
      "REST and GraphQL API design with proper validation, rate limiting, and observability.",
      "Database schema design plus migration strategies across PostgreSQL, MongoDB, and Supabase.",
      "CI/CD pipelines that automate testing, container builds, and blue/green deployments.",
    ],
    toolset: ["Node.js", "Express", "Supabase", "PostgreSQL", "MongoDB", "Docker"],
  },
  {
    title: "Game Developer",
    slug: "game-developer",
    icon: creator,
    shortDescription: "Gameplay prototypes that balance mechanics, narrative, and player feedback loops.",
    focusAreas: [
      "Rapid prototyping of mechanics, level design, and UI flows for early playtesting.",
      "Shader and particle experimentation to bring environments and characters to life.",
      "Build automation for multi-platform exports plus telemetry hooks for balancing data.",
    ],
    toolset: ["Unity", "C#", "Blender", "Three.js", "WebGL", "Figma"],
  },
];

const resume = [
  {
    title: "Web Developer",
    
  },
  {
    title: "React Native Developer",
    
  },
  {
    title: "Backend Developer",
    
  },
  {
    title: "Content Creator",
    
  },
];

const technologies = [
  {
    name: "HTML 5",
    icon: html,
  },
  {
    name: "CSS 3",
    icon: css,
  },
  {
    name: "JavaScript",
    icon: javascript,
  },
  {
    name: "TypeScript",
    icon: typescript,
  },
  {
    name: "React JS",
    icon: reactjs,
  },
   {
    name: "Tailwind CSS",
    icon: tailwind,
  },
  {
    name: "Node JS",
    icon: nodejs,
  },
  {
    name: "MongoDB",
    icon: mongodb,
  },
  {
    name: "git",
    icon: git,
  },
  {
    name: "figma",
    icon: figma,
  },
];

const educationes = [
  {
    title: "Certificate IV in Information Technology,",
    company_name: "Upskilled Pty Ltd, Australia",
    icon: upskilled,
    iconBg: "#383E56",
    date: "2023 - Currently",
    Achievement: {
      subtitle: "Achievements",
      point:[      
      "Developed business requirement templates aimed to collect input for an implementation project to automate processes in a major local bank.",
      "Developed an UAT procedure from scratch",
      "Documented UAT which had to be signed and agreed by clients."
    ]},
  },
  {
    title: "Bachelor Degree of Systems Engineer",
    company_name: "ECCI University, Bogota, Colombia",
    icon: ecci,
    iconBg: "#383E56",
    date: "2010 - 2014",
    Achievement: {
      subtitle: "Achievements",
      point:[      
      "Developed business requirement templates aimed to collect input for an implementation project to automate processes in a major local bank.",
      "Developed an UAT procedure from scratch",
      "Documented UAT which had to be signed and agreed by clients."
    ]},
  },
  {
    title: "Professional Technician in Systems Engineering",
    company_name: "INSUTEC. Bogota, Colombia",
    icon: insutec,
    iconBg: "#383E56",
    date: "2005 - 2008",
    Achievement: {
      subtitle: "Achievements",
      point:[      
      "Developed business requirement templates aimed to collect input for an implementation project to automate processes in a major local bank.",
      "Developed an UAT procedure from scratch",
      "Documented UAT which had to be signed and agreed by clients."
    ]},
  },

];

const experiences = [
  {
    title: "System Test Analyst",
    company_name: "Choucair Testing, Colombia",
    icon: choucair,
    iconBg: "#383E56",
    date: "June 2015 - July 2016",
    
    Achievement: {
      subtitle: "Achievements",
      point:[      
      "Developed business requirement templates aimed to collect input for an implementation project to automate processes in a major local bank.",
      "Developed an UAT procedure from scratch",
      "Documented UAT which had to be signed and agreed by clients."
    ]},
    
    respon: {
      subtitle: "Responsibilities",
      point:[      
      "Identifying and breaking down the necessary tasks to test new or existed product.",
      "Designing tests, either alone or as part of a team",
      "Setting up automated tests.",
      "Performing functional tests of clients’ web page.",
      "Analysing the customers’ IT Quality Assurance Area."
      
    ]},
  },
  {
    title: "IT Support Officer",
    company_name: "IQ Outsourcing, Colombia",
    icon: IqOuts,
    iconBg: "#E6DEDD",
    date: "September 2013 - May 2015",
    Achievement: {
      subtitle: "Achievements",
      point:[      
      "Proposed, prepared and facilitated training for new team members, this included developing training information packages and knowledge assessment test. This initiative increased team productivity by 20%.",
      "Designed and implemented an operational status report using SQL to pull information out of different systems and consolidating it in a company dashboard",
      "Utilised SQL to identify errors in data bases, escalating errors to correct areas. This process allowed the business to fix errors in a timely manner saving time and money"
    ]},

    respon: {
      subtitle: "Responsibilities",
      point:[      
      "Monitoring and maintaining computer systems and networks.",
      "Ensuring that new technologies and processes are adapted to current systems effectively.",
      "Supervising installation of software and hardware modules and ensuring that upgrades are performed timely.",
      "Validating errors and proposing solutions to applications.",
      "Ensuring that computer hardware and software is updated and maintained correctly.",
      "Repairing and replacing equipment as necessary.",
      "• Diagnosing and troubleshooting technical problems.",
      "• Identifying priority issues and ensuring that they are handled first.",
      "• Responding on time to service issues and requests.",
      "• Providing technical support to customers’ IT staff.",
    ]},
  },
  
];

const projects = [
  {
    name: "Portfolio",
    description:
      "I'm thrilled to present my front-end web portfolio, created using cutting-edge technologies like Vite and React. This portfolio showcases my ability to design and develop captivating, responsive user experiences. Notable features include user-centric design, seamless responsiveness across various devices, meticulous performance optimization, and a steadfast commitment to accessibility.",
    tags: [
      {
        name: "react",
        color: "blue-text-gradient",
      },
      {
        name: "CSS",
        color: "green-text-gradient",
      },
      
    ],
    image: carrent,
    source_code_link: "https://github.com/edwin-pedraza/React_portafoliopapp",
    source_link_web: "https://edwin-pedraza.github.io/Edwin_portfolio/Project/portfolio/build/index.html",
  },
];

export { services, technologies, educationes, experiences, projects, resume };
