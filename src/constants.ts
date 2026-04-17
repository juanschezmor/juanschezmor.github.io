import type { ExperienceItem } from "./types/Experience";
import type { Project } from "./types/Project";
import type { SkillItem } from "./types/Skill";

export const experiences: ExperienceItem[] = [
  {
    id: 2,
    company: "Ayesa Advanced Technologies",
    period: "Sept 2024 – Present",
    period_i18n: {
      en: "Sept 2024 – Present",
      es: "Sept 2024 – Actualidad",
    },
    roles: [
      {
        id: 1,
        title: "Full Stack Developer",
        title_i18n: {
          en: "Full Stack Developer",
          es: "Desarrollador full stack",
        },
        description: [
          "Develop and maintain React and Spring Boot features for a public-sector platform used in Spain.",
          "Work with PostgreSQL data flows, service integrations, and production support tasks.",
          "Contribute to Docker-based deployments in a microservices environment.",
        ],
        description_i18n: {
          en: [
            "Develop and maintain React and Spring Boot features for a public-sector platform used in Spain.",
            "Work with PostgreSQL data flows, service integrations, and production support tasks.",
            "Contribute to Docker-based deployments in a microservices environment.",
          ],
          es: [
            "Desarrollo y mantengo funcionalidades con React y Spring Boot para una plataforma pública usada en España.",
            "Trabajo con flujos de datos en PostgreSQL, integraciones de servicios y soporte en producción.",
            "Participo en despliegues con Docker dentro de un entorno de microservicios.",
          ],
        },
      },
      {
        id: 2,
        title: "Full Stack Developer",
        title_i18n: {
          en: "Full Stack Developer",
          es: "Desarrollador full stack",
        },
        description: [
          "Maintained a legacy JSF and EJB application for the Government of the Canary Islands.",
          "Worked on PostgreSQL-backed workflows and internal business logic.",
          "Helped move legacy modules toward Vaadin and Spring Boot.",
          "Built Angular and Spring Boot side projects for internal and client-facing use cases.",
        ],
        description_i18n: {
          en: [
            "Maintained a legacy JSF and EJB application for the Government of the Canary Islands.",
            "Worked on PostgreSQL-backed workflows and internal business logic.",
            "Helped move legacy modules toward Vaadin and Spring Boot.",
            "Built Angular and Spring Boot side projects for internal and client-facing use cases.",
          ],
          es: [
            "Mantuve una aplicación heredada en JSF y EJB para el Gobierno de Canarias.",
            "Trabajé sobre flujos con PostgreSQL y lógica de negocio interna.",
            "Ayudé a mover módulos heredados hacia Vaadin y Spring Boot.",
            "Saqué side projects con Angular y Spring Boot para usos internos y de cliente.",
          ],
        },
      },
    ],
  },
  {
    id: 1,
    company: "Randbee Consultants",
    period: "Mar 2024 – July 2024",
    period_i18n: {
      en: "Mar 2024 – July 2024",
      es: "Mar 2024 – Jul 2024",
    },
    roles: [
      {
        id: 1,
        title: "Software developer intern",
        title_i18n: {
          en: "Software developer intern",
          es: "Prácticas de desarrollo de software",
        },
        description: [
          "Built internal tools with React, Flask, and GeoServer.",
          "Automated Python scraping workflows and cut execution time by about 50%.",
          "Implemented a RAG prototype for semantic document retrieval.",
          "Explored image-classification prototypes with convolutional neural networks.",
          "Wrote technical documentation with Jupyter Books and managed PostgreSQL datasets.",
        ],
        description_i18n: {
          en: [
            "Built internal tools with React, Flask, and GeoServer.",
            "Automated Python scraping workflows and cut execution time by about 50%.",
            "Implemented a RAG prototype for semantic document retrieval.",
            "Explored image-classification prototypes with convolutional neural networks.",
            "Wrote technical documentation with Jupyter Books and managed PostgreSQL datasets.",
          ],
          es: [
            "Construí herramientas internas con React, Flask y GeoServer.",
            "Automaticé flujos de scraping en Python y recorté el tiempo de ejecución cerca de un 50%.",
            "Implementé un prototipo RAG para recuperación semántica de documentos.",
            "Probé prototipos de clasificación de imagen con redes convolucionales.",
            "Escribí documentación técnica con Jupyter Books y gestioné datasets en PostgreSQL.",
          ],
        },
      },
    ],
  },
];

export const activities = [
  {
    id: "1",
    date: "Apr 2026",
    label: "Portfolio rewrite",
    description:
      "Reworked the structure and copy of this portfolio to make it easier to scan and easier to update.",
  },
  {
    id: "2",
    date: "Apr 2026",
    label: "AWS study block",
    description:
      "Finished another block of AWS Developer Associate material and used it to rethink how I handle portfolio content.",
  },
  {
    id: "3",
    date: "2025",
    label: "Production delivery",
    description:
      "Worked on public-sector applications in React, Spring Boot, PostgreSQL, and Docker-based workflows.",
  },
  {
    id: "4",
    date: "2024",
    label: "RAG prototype and internal tools",
    description:
      "Built internal tools, automated data collection, and explored retrieval and ML prototypes during my internship.",
  },
];

export const skillsCategories = ["All", "Frontend", "Backend", "Tools"] as const;
export const skills: SkillItem[] = [
  {
    id: "local-html",
    skill: "HTML",
    category: "Frontend",
  },
  {
    id: "local-css",
    skill: "CSS",
    category: "Frontend",
  },
  {
    id: "local-javascript",
    skill: "JavaScript",
    category: "Frontend",
  },
  {
    id: "local-reactjs",
    skill: "ReactJS",
    category: "Frontend",
  },
  {
    id: "local-angular",
    skill: "Angular",
    category: "Frontend",
  },
  {
    id: "local-tailwind",
    skill: "Tailwind",
    category: "Frontend",
  },
  {
    id: "local-bootstrap",
    skill: "Bootstrap",
    category: "Frontend",
  },
  {
    id: "local-python",
    skill: "Python",
    category: "Backend",
  },
  {
    id: "local-flask",
    skill: "Flask",
    category: "Backend",
  },
  {
    id: "local-java",
    skill: "Java",
    category: "Backend",
  },
  {
    id: "local-kotlin",
    skill: "Kotlin",
    category: "Backend",
  },
  {
    id: "local-jetpack-compose",
    skill: "Jetpack Compose",
    category: "Frontend",
  },
  {
    id: "local-spring-boot",
    skill: "Spring Boot",
    category: "Backend",
  },
  {
    id: "local-postgresql",
    skill: "PostgreSQL",
    category: "Backend",
  },
  {
    id: "local-google-firebase",
    skill: "Google Firebase",
    category: "Backend",
  },
  {
    id: "local-github",
    skill: "GitHub",
    category: "Tools",
  },
  {
    id: "local-docker",
    skill: "Docker",
    category: "Tools",
  },
  {
    id: "local-jira",
    skill: "JIRA",
    category: "Tools",
  },
  {
    id: "local-slack",
    skill: "Slack",
    category: "Tools",
  },
];
export const projects: Project[] = [
  {
    id: "local-bubbly",
    title: "Bubbly",
    description:
      "Private one-to-one chat app built to explore real-time messaging and anonymous conversations.",
    bullet_points: [
      "Built the frontend in React and Tailwind CSS.",
      "Implemented real-time messaging with Flask-SocketIO.",
      "Packaged and deployed the app with Docker and DigitalOcean.",
    ],
    github_link: "https://github.com/juanschezmor/bubbly",
    live_link: "not-available",
  },
  {
    id: "local-hive-challenges",
    title: "Hive Challenges",
    description:
      "Gamified web app used to run monthly sales challenges for Hive.",
    bullet_points: [
      "Built the frontend in React and Bootstrap.",
      "Connected the app to Google Firestore.",
    ],
    github_link: "https://github.com/juanschezmor/web-month-challenges",
    live_link: "https://hive-month-challenges.vercel.app",
  },
  {
    id: "local-hangman",
    title: "Ecologic Hangman Game",
    description:
      "Educational word game created for a science fair to teach sustainability to children.",
    bullet_points: [
      "Built the interface in React and Tailwind CSS.",
      "Designed the game flow for a live event and a younger audience.",
      "Deployed it on GitHub Pages.",
    ],
    github_link: "https://github.com/juanschezmor/AhorcadoEcologico",
    live_link: "https://juanschezmor.github.io/AhorcadoEcologico/",
  },
  {
    id: "local-casa-milan",
    title: "Casa Milán",
    description: "Marketing website for a student residence in Seville.",
    bullet_points: [
      "Built with Next.js.",
      "Designed responsive pages for mobile and desktop.",
      "Deployed the site on Vercel.",
    ],
    github_link: "https://github.com/juanschezmor/casa-milan",
    live_link: "https://casa-milan.vercel.app/",
  },
];
