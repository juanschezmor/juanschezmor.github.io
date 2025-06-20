import { projectImages } from "./images";

export const experiences = [
  {
    id: 2,
    company: "Ayesa Advanced Technologies",
    period: "Sept 2024 – Present",
    roles: [
      {
        id: 1,
        title: "Full Stack Developer",
        description: [
          "Development and maintenance of a React and Spring Boot application for the Government of Spain.",
          "Database management with PostgreSQL.",
          "Deployment with Docker and microservices architecture.",
        ],
      },
      {
        id: 2,
        title: "Full Stack Developer",
        description: [
          "Development and maintenance of a JSF and EJB application for the Government of the Canary Islands.",
          "Database management with PostgreSQL.",
          "Migration of legacy applications to a modern stack with Vaadin (Spring Boot).",
          "Development and maintenance of side projects in Angular and Spring Boot.",
        ],
      },
    ],
  },
  {
    id: 1,
    company: "Randbee Consultants",
    period: "Mar 2024 – July 2024",
    roles: [
      {
        id: 1,
        title: "Software developer intern",
        description: [
          "Built internal tools with ReactJS, Flask, and GeoServer.",
          "Automated scraping workflows with Python, reducing script execution time by 50%.",
          "Developed a RAG system for semantic document retrieval.",
          "Trained an image classification model using convolutional neural networks (CNNs) for internal prototypes.",
          "Authored technical docs with Jupyter Books (MyST).",
          "Managed structured datasets using PostgreSQL.",
        ],
      },
    ],
  },
];

export const skillsCategories = ["All", "Frontend", "Backend", "Tools"];
export const skills = [
  {
    skill: "HTML",
    category: "Frontend",
  },
  {
    skill: "CSS",
    category: "Frontend",
  },
  {
    skill: "JavaScript",
    category: "Frontend",
  },
  {
    skill: "ReactJS",
    category: "Frontend",
  },
  {
    skill: "Angular",
    category: "Frontend",
  },
  {
    skill: "Tailwind",
    category: "Frontend",
  },
  {
    skill: "Bootstrap",
    category: "Frontend",
  },
  {
    skill: "Python",
    category: "Backend",
  },
  {
    skill: "Flask",
    category: "Backend",
  },
  {
    skill: "Java",
    category: "Backend",
  },
  {
    skill: "Kotlin",
    category: "Backend",
  },
  {
    skill: "Jetpack Compose",
    category: "Frontend",
  },
  {
    skill: "Google Firebase",
    category: "Backend",
  },
  {
    skill: "GitHub",
    category: "Tools",
  },
  {
    skill: "Docker",
    category: "Tools",
  },
  {
    skill: "JIRA",
    category: "Tools",
  },
  {
    skill: "Slack",
    category: "Tools",
  },
];
export const projects = [
  {
    image: projectImages.bubbly,
    title: "Bubbly",
    description: "One-to-One private and anonymous chat platform",
    bullet_points: [
      "Build with ReactJS and TailwindCSS",
      "Supported by a Flask-SocketIO backend",
      "Dockerized and deployed with DigitalOcean",
    ],
    github_link: "https://github.com/juanschezmor/bubbly",
    live_link: "not-available",
  },
  {
    image: projectImages.hiveChallenges,
    title: "Hive Challenges",
    description: "Sales boost gamification web app website for Hive",
    bullet_points: [
      "Built with ReactJS and Bootstrap",
      "Connected to a Google Firestore database",
    ],
    github_link: "https://github.com/juanschezmor/web-month-challenges",
    live_link: "hive-month-challenges.vercel.app",
  },
  {
    image: projectImages.hangman,
    title: "Ecologic Hangman Game",
    description:
      "Hangman game with an ecological twist presented for kids at a science fair to raise awareness in a fun and interactive way.",
    bullet_points: [
      "Built with ReactJS and TailwindCSS",
      "Deployed with GitHub Pages",
    ],
    github_link: "https://github.com/juanschezmor/AhorcadoEcologico",
    live_link: "https://juanschezmor.github.io/AhorcadoEcologico/",
  },
  {
    image: projectImages.logocasamilan,
    title: "Casa Milán",
    description:
      "Website for a student residence in Seville, offering accommodation with included services.",
    bullet_points: [
      "Built with Next.js",
      "Responsive design for mobile and desktop",
      "Deployed on Vercel",
    ],
    github_link: "https://github.com/juanschezmor/casa-milan", // Replace with the actual repo link if available
    live_link: "https://casa-milan.vercel.app/",
  },
];
