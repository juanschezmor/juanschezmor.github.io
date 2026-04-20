import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const storedLanguage =
  globalThis.window === undefined
    ? null
    : globalThis.localStorage.getItem("portfolio-language");

const resources = {
  en: {
    translation: {
      header: {
        role: "Full-stack developer",
        nav: {
          activity: "Activity",
          about: "About",
          experience: "Experience",
          projects: "Projects",
          stack: "Stack",
          contact: "Contact",
        },
        themeToLight: "Switch to light mode",
        themeToDark: "Switch to dark mode",
        languageLabel: "Switch language",
      },
      hero: {
        role: "Full-stack developer.",
        subtitle: "I build, fix, and learn as I go.",
        ctas: {
          projects: "View Projects",
          contact: "Get In Touch",
          cv: "Download CV",
        },
        cvToast: "CV downloaded successfully!",
        signal: {
          running: "running",
          whoami: "Juan Sánchez",
          years: "2+ years in real projects",
          where: "Spain / open to relocation",
          stack: "React / Spring Boot / PostgreSQL",
          mindset: "Build, learn, improve",
        },
        dock: "scroll to explore",
      },
      activity: {
        eyebrow: "Activity",
        title: "Recent updates",
        copy: "Recent work, learning, and small updates.",
        items: {
          "1": {
            label: "Portfolio rewrite",
            description:
              "Reworked the structure and copy of this portfolio to make it easier to scan and easier to update.",
          },
          "2": {
            label: "AWS study block",
            description:
              "Finished another block of AWS Developer Associate material and used it to rethink how I handle portfolio content.",
          },
          "3": {
            label: "Production delivery",
            description:
              "Worked on public-sector applications in React, Spring Boot, PostgreSQL, and Docker-based workflows.",
          },
          "4": {
            label: "RAG prototype and internal tools",
            description:
              "Built internal tools, automated data collection, and explored retrieval and ML prototypes during my internship.",
          },
        },
      },
      about: {
        eyebrow: "About",
        title: "A bit about me",
        aboutTitle: "How I work",
        paragraphs: [
          "I’ve been working as a full-stack developer since 2024, mostly in real production environments.",
          "I tend to learn by building. If an idea sticks with me, I usually end up turning it into something real.",
          "I like working across the stack when a feature needs both product sense and technical follow-through.",
        ],
        sideTitle: "Right now",
        current: "Work",
        currentCopy: "Building and maintaining software for the public sector.",
        learning: "Learning",
        learningCopy: "AWS, delivery patterns, and cleaner interface systems.",
        next: "Next",
        nextCopy:
          "Stronger personal projects and a portfolio that feels more like my own.",
      },
      experience: {
        eyebrow: "Experience",
        title: "Professional work",
        items: {
          ayesa: {
            period: "Sept 2024 – Present",
            roles: {
              current: {
                title: "Full Stack Developer",
                description: [
                  "Developed and maintained public-sector web applications using React, Angular, and Spring Boot.",
                  "Built reusable components with Vaadin, reducing code duplication and improving maintainability.",
                  "Implemented new features and maintained legacy applications based on JSF.",
                  "Migrated over 100 Oracle packages, tables, and functions to PostgreSQL.",
                  "Set up local development environments and identity services (Keycloak) using Docker.",
                  "Worked in a Scrum team, participating in daily stand-ups, sprint planning, and reviews.",
                ],
              },
            },
          },
          randbee: {
            period: "Mar 2024 – July 2024",
            roles: {
              internship: {
                title: "Software developer intern",
                description: [
                  "Developed a web platform for meteorological data using React, Flask, and Leaflet for interactive maps.",
                  "Managed spatial databases with PostGIS and processed complex meteorological datasets.",
                  "Built web scraping pipelines to extract financial data automatically.",
                  "Designed a RAG-based system to analyze and retrieve insights from corporate reports.",
                  "Automated data workflows with Python, reducing execution time by around 50%.",
                  "Wrote technical documentation and managed datasets using Jupyter Books.",
                ],
              },
            },
          },
        },
      },
      projects: {
        eyebrow: "Projects",
        title: "Personal projects",
        copy: "Things I’ve built outside work to explore ideas, try technologies, and make products that feel worth shipping.",
        loading: "Loading project content...",
        fallback: "Showing local projects while the API is unavailable.",
        previous: "Previous project",
        next: "Next project",
        counter: "{{current}} out of {{total}}",
        kicker: "Project",
        highlights: "Highlights",
        code: "Code",
        live: "Live",
        items: {
          "local-hive-challenges": {
            title: "Hive Challenges",
            description:
              "Gamified web app used to run monthly sales challenges for Hive.",
            bullet_points: [
              "Built the frontend in React and Bootstrap.",
              "Connected the app to Google Firestore.",
            ],
            github_link: "https://github.com/juanschezmor/web-month-challenges",
            image:
              "https://portfolio-juanschezmor-project-images-519845866784.s3.eu-north-1.amazonaws.com/project-images/2026-04-17T19-52-27-569Z-b7412cb0-d10a-45dc-916a-7a746a0f1b67-hive-challenges.png",
            live_link: "https://hive-month-challenges.vercel.app",
          },
          "local-bubbly": {
            title: "Bubbly",
            description:
              "Private one-to-one chat app built to explore real-time messaging and anonymous conversations.",
            bullet_points: [
              "Built the frontend in React and Tailwind CSS.",
              "Implemented real-time messaging with Flask-SocketIO.",
              "Packaged and deployed the app with Docker and DigitalOcean.",
            ],
            github_link: "https://github.com/juanschezmor/bubbly",
            image:
              "https://portfolio-juanschezmor.s3.eu-north-1.amazonaws.com/project-photos/bubbly.png",
            live_link: "not-available",
          },
          "7f806e68-0b4e-4ab3-8354-fa833d91721b": {
            title: "Moggy",
            description:
              "A web app that generates AI-based roasts of World of Warcraft characters by analyzing their outfits and creating shareable visual content.",
            bullet_points: [
              "Fetches character data and images from the Blizzard API using name and realm.",
              "Uses AI to generate custom roasts based on the character’s appearance.",
              "Generates shareable image cards ready for social media.",
              "Designed a simple flow to create short-form video content for platforms like TikTok.",
              "Built with a focus on fast iteration and viral content potential.",
            ],
            github_link: "https://github.com/juanschezmor/moggy",
            image:
              "https://portfolio-juanschezmor-project-images-519845866784.s3.eu-north-1.amazonaws.com/project-images/2026-04-17T19-59-01-690Z-d77bcccc-4b11-46e8-ae8c-eebcbce5d456-icon.png",
            live_link: "https://moggy.vercel.app",
          },
          "e99d34b6-9da5-441d-8173-fa16d54d5999": {
            title: "Hall of Mogs",
            description:
              "A community-driven platform where players can share, explore, and vote on World of Warcraft transmogs, with user profiles and post interaction features.",
            bullet_points: [
              "Full-stack application built with Next.js, Supabase, and deployed on Vercel.",
              "User authentication and profile system with post creation and interaction.",
              "Voting system to rank transmogs and highlight weekly winners.",
              "Image moderation and content handling for user-generated posts.",
              "Reached active usage with dozens of users and real content generated by the community.",
            ],
            github_link: "https://github.com/juanschezmor/hall-of-mogs",
            image:
              "https://portfolio-juanschezmor-project-images-519845866784.s3.eu-north-1.amazonaws.com/project-images/2026-04-17T19-58-22-971Z-6c47c574-1b6b-4cef-9ede-9bd794ac909b-logo.png",
            live_link: "https://hallofmogs.com",
          },
          "local-casa-milan": {
            title: "Casa Milán",
            description:
              "Marketing website for a student residence in Seville.",
            bullet_points: [
              "Built with Next.js.",
              "Designed responsive pages for mobile and desktop.",
              "Deployed the site on Vercel.",
            ],
            github_link: "https://github.com/juanschezmor/casa-milan",
            image:
              "https://portfolio-juanschezmor-project-images-519845866784.s3.eu-north-1.amazonaws.com/project-images/2026-04-17T19-52-51-388Z-365235d0-5292-4884-bfb3-a1074d3f3efd-logocasamilan.png",
            live_link: "https://casa-milan.vercel.app/",
          },
        },
      },
      stack: {
        eyebrow: "Stack",
        title: "Tools I use",
        copy: "The tools I use most often across personal and professional work.",
        categories: {
          all: "All",
          frontend: "Frontend",
          backend: "Backend",
          tools: "Tools",
        },
      },
      contact: {
        eyebrow: "Contact",
        title: "Contact",
        copy: "If you are hiring or want to talk through a project, you can reach me here.",
        labels: {
          email: "Email",
          basedIn: "Based in",
          openTo: "Open to",
          name: "Name",
          emailInput: "Email",
          company: "Company",
          message: "Message",
          optional: "(optional)",
        },
        openTo: ["Full-stack", "Frontend", "Backend"],
        placeholders: {
          name: "Enter your name",
          email: "Enter your email",
          company: "Company name",
          message: "Enter your message...",
        },
        sending: "Sending...",
        send: "Send message",
        toastSuccess: "Message sent successfully!",
        toastError: "Failed to send your message. Please try again.",
        toastUnexpected: "An unexpected error occurred. Please try again.",
      },
      footer: {
        builtWith: "Open to full-stack software opportunities.",
      },
    },
  },
  es: {
    translation: {
      header: {
        role: "Desarrollador full-stack",
        nav: {
          activity: "Actividad",
          about: "Sobre mí",
          experience: "Experiencia",
          projects: "Proyectos",
          stack: "Stack",
          contact: "Contacto",
        },
        themeToLight: "Cambiar a modo claro",
        themeToDark: "Cambiar a modo oscuro",
        languageLabel: "Cambiar idioma",
      },
      hero: {
        role: "Desarrollador full-stack.",
        subtitle:
          "Aprendo construyendo, arreglando y probando cosas de verdad.",
        ctas: {
          projects: "Ver proyectos",
          contact: "Contactar",
          cv: "Descargar CV",
        },
        cvToast: "CV descargado correctamente",
        signal: {
          running: "activo",
          whoami: "Juan Sánchez",
          years: "2+ años en proyectos reales",
          where: "España / abierto a reubicación",
          stack: "React / Spring Boot / PostgreSQL",
          mindset: "Construir, aprender, mejorar",
        },
        dock: "baja para seguir",
      },
      activity: {
        eyebrow: "Actividad",
        title: "Últimas actualizaciones",
        copy: "Un resumen rápido de lo que he ido construyendo, aprendiendo y mejorando últimamente",
        items: {
          "1": {
            label: "Reescritura del portfolio",
            description:
              "Reorganicé la estructura y el copy del portfolio para que sea más fácil de recorrer y más fácil de mantener.",
          },
          "2": {
            label: "Bloque de estudio de AWS",
            description:
              "Cerré otro bloque del Developer Associate de AWS y lo aproveché para replantear cómo gestiono el contenido del portfolio.",
          },
          "3": {
            label: "Entrega en producción",
            description:
              "He trabajado en aplicaciones del sector público con React, Spring Boot, PostgreSQL y flujos de despliegue con Docker.",
          },
          "4": {
            label: "Prototipo RAG y herramientas internas",
            description:
              "Construí herramientas internas, automaticé recogida de datos y probé prototipos de retrieval y machine learning durante las prácticas.",
          },
        },
      },
      about: {
        eyebrow: "Sobre mí",
        title: "Un poco sobre mí",
        aboutTitle: "Cómo trabajo",
        paragraphs: [
          "Trabajo como desarrollador full-stack desde 2024, sobre todo en entornos reales de producción.",
          "Suelo aprender construyendo. Si una idea se me queda en la cabeza, normalmente acabo convirtiéndola en algo real.",
          "Me gusta moverme por distintas capas cuando una funcionalidad necesita tanto criterio de producto como ejecución técnica.",
        ],
        sideTitle: "Ahora mismo",
        current: "Trabajo",
        currentCopy:
          "Desarrollando y manteniendo software para el sector público.",
        learning: "Aprendiendo",
        learningCopy:
          "AWS, patrones de entrega y sistemas de interfaz más limpios.",
        next: "Siguiente",
        nextCopy: "Proyectos personales más sólidos y un portfolio más mío.",
      },
      experience: {
        eyebrow: "Experiencia",
        title: "Trabajo profesional",
        items: {
          ayesa: {
            period: "Sept 2024 – Actualidad",
            roles: {
              current: {
                title: "Desarrollador full stack",
                description: [
                  "Desarrollo y mantenimiento de aplicaciones web del sector público con React, Angular y Spring Boot.",
                  "Creación de componentes reutilizables con Vaadin, reduciendo la duplicidad de código y mejorando el mantenimiento.",
                  "Desarrollo de nuevas funcionalidades y mantenimiento de aplicaciones legacy basadas en JSF.",
                  "Migración de más de 100 paquetes, tablas y funciones de Oracle a PostgreSQL.",
                  "Configuración de entornos de desarrollo local y servicios de identidad (Keycloak) con Docker.",
                  "Trabajo en equipo bajo metodología Scrum, participando en dailies, planificación de sprints y revisiones.",
                ],
              },
            },
          },
          randbee: {
            period: "Mar 2024 – Jul 2024",
            roles: {
              internship: {
                title: "Prácticas de desarrollo de software",
                description: [
                  "Desarrollo de una plataforma web de datos meteorológicos utilizando React, Flask y Leaflet para mapas interactivos.",
                  "Gestión de bases de datos espaciales con PostGIS y procesamiento de datasets meteorológicos complejos.",
                  "Desarrollo de pipelines de web scraping para extraer datos financieros de forma automatizada.",
                  "Diseño de un sistema basado en RAG para analizar y recuperar información de informes corporativos.",
                  "Automatización de flujos de datos con Python, reduciendo el tiempo de ejecución en torno a un 50%.",
                  "Redacción de documentación técnica y gestión de datasets con Jupyter Books.",
                ],
              },
            },
          },
        },
      },
      projects: {
        eyebrow: "Proyectos",
        title: "Proyectos personales",
        copy: "Cosas que he construido fuera del trabajo para probar ideas, tocar tecnologías nuevas y sacar productos con sentido.",
        loading: "Cargando proyectos...",
        fallback: "Mostrando proyectos locales mientras la API no responde.",
        previous: "Proyecto anterior",
        next: "Proyecto siguiente",
        counter: "{{current}} de {{total}}",
        kicker: "Proyecto",
        highlights: "Puntos clave",
        code: "Código",
        live: "Demo",
        items: {
          "local-hive-challenges": {
            title: "Hive Challenges",
            description:
              "Aplicación gamificada usada para lanzar retos mensuales de ventas en Hive.",
            bullet_points: [
              "Construí el frontend con React y Bootstrap.",
              "Conecté la app con Google Firestore.",
            ],
            github_link: "https://github.com/juanschezmor/web-month-challenges",
            image:
              "https://portfolio-juanschezmor-project-images-519845866784.s3.eu-north-1.amazonaws.com/project-images/2026-04-17T19-52-27-569Z-b7412cb0-d10a-45dc-916a-7a746a0f1b67-hive-challenges.png",
            live_link: "https://hive-month-challenges.vercel.app",
          },
          "local-bubbly": {
            title: "Bubbly",
            description:
              "App de chat privado uno a uno creada para explorar mensajería en tiempo real y conversaciones anónimas.",
            bullet_points: [
              "Construí el frontend con React y Tailwind CSS.",
              "Implementé mensajería en tiempo real con Flask-SocketIO.",
              "Empaqueté y desplegué la app con Docker y DigitalOcean.",
            ],
            github_link: "https://github.com/juanschezmor/bubbly",
            image:
              "https://portfolio-juanschezmor.s3.eu-north-1.amazonaws.com/project-photos/bubbly.png",
            live_link: "not-available",
          },
          "7f806e68-0b4e-4ab3-8354-fa833d91721b": {
            title: "Moggy",
            description:
              "Una aplicación web que genera críticas humorísticas con IA sobre personajes de World of Warcraft, analizando sus outfits y creando contenido visual compartible.",
            bullet_points: [
              "Obtiene datos e imágenes de personajes desde la API de Blizzard usando nombre y reino.",
              "Utiliza IA para generar críticas personalizadas basadas en la apariencia del personaje.",
              "Genera tarjetas visuales listas para compartir en redes sociales.",
              "Diseñado con un flujo simple para crear contenido en formato corto tipo TikTok.",
              "Enfocado en iteración rápida y potencial de viralidad.",
            ],
            github_link: "https://github.com/juanschezmor/moggy",
            image:
              "https://portfolio-juanschezmor-project-images-519845866784.s3.eu-north-1.amazonaws.com/project-images/2026-04-17T19-59-01-690Z-d77bcccc-4b11-46e8-ae8c-eebcbce5d456-icon.png",
            live_link: "https://moggy.vercel.app",
          },
          "e99d34b6-9da5-441d-8173-fa16d54d5999": {
            title: "Hall of Mogs",
            description:
              "Una plataforma impulsada por la comunidad donde los jugadores pueden compartir, explorar y votar transmogs de World of Warcraft, con perfiles de usuario e interacción entre publicaciones.",
            bullet_points: [
              "Aplicación full stack desarrollada con Next.js, Supabase y desplegada en Vercel.",
              "Sistema de autenticación y perfiles de usuario con creación e interacción de posts.",
              "Sistema de votación para clasificar transmogs y destacar ganadores semanales.",
              "Moderación de imágenes y gestión de contenido generado por usuarios.",
              "Uso real con usuarios activos y contenido generado por la comunidad.",
            ],
            github_link: "https://github.com/juanschezmor/hall-of-mogs",
            image:
              "https://portfolio-juanschezmor-project-images-519845866784.s3.eu-north-1.amazonaws.com/project-images/2026-04-17T19-58-22-971Z-6c47c574-1b6b-4cef-9ede-9bd794ac909b-logo.png",
            live_link: "https://hallofmogs.com",
          },
          "local-casa-milan": {
            title: "Casa Milán",
            description:
              "Web corporativa para una residencia de estudiantes en Sevilla.",
            bullet_points: [
              "Construida con Next.js.",
              "Diseñé páginas responsive para móvil y escritorio.",
              "Desplegué la web en Vercel.",
            ],
            github_link: "https://github.com/juanschezmor/casa-milan",
            image:
              "https://portfolio-juanschezmor-project-images-519845866784.s3.eu-north-1.amazonaws.com/project-images/2026-04-17T19-52-51-388Z-365235d0-5292-4884-bfb3-a1074d3f3efd-logocasamilan.png",
            live_link: "https://casa-milan.vercel.app/",
          },
        },
      },
      stack: {
        eyebrow: "Stack",
        title: "Herramientas que uso",
        copy: "Las herramientas que más uso entre trabajo y proyectos personales.",
        categories: {
          all: "Todas",
          frontend: "Frontend",
          backend: "Backend",
          tools: "Herramientas",
        },
      },
      contact: {
        eyebrow: "Contacto",
        title: "Contacto",
        copy: "Si estás contratando o quieres hablar de un proyecto, puedes escribirme aquí.",
        labels: {
          email: "Email",
          basedIn: "Ubicación",
          openTo: "Busco",
          name: "Nombre",
          emailInput: "Email",
          company: "Empresa",
          message: "Mensaje",
          optional: "(opcional)",
        },
        openTo: ["Full-stack", "Frontend", "Backend"],
        placeholders: {
          name: "Tu nombre",
          email: "Tu email",
          company: "Nombre de la empresa",
          message: "Escribe tu mensaje...",
        },
        sending: "Enviando...",
        send: "Enviar mensaje",
        toastSuccess: "Mensaje enviado correctamente",
        toastError: "No se pudo enviar el mensaje. Inténtalo de nuevo.",
        toastUnexpected: "Ha ocurrido un error inesperado. Inténtalo de nuevo.",
      },
      footer: {
        builtWith: "Abierto a oportunidades como desarrollador full-stack.",
      },
    },
  },
} as const;

i18n.use(initReactI18next).init({
  resources,
  lng:
    storedLanguage === "es" || storedLanguage === "en" ? storedLanguage : "en",
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

i18n.on("languageChanged", (language) => {
  if (globalThis.window !== undefined) {
    globalThis.localStorage.setItem("portfolio-language", language);
  }

  if (typeof document !== "undefined") {
    document.documentElement.lang = language;
  }
});

if (typeof document !== "undefined") {
  document.documentElement.lang = i18n.language;
}

export default i18n;
