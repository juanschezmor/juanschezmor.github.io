import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const storedLanguage =
  typeof window !== "undefined"
    ? window.localStorage.getItem("portfolio-language")
    : null;

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
        subtitle:
          "I work on real production systems, fixing legacy code and shipping new features.",
        points: [
          "Reduced code duplication by 60% in a production app",
          "Migrated systems from Oracle to PostgreSQL",
          "Deliver features across frontend and backend",
        ],
        current: "Currently working on public-sector platforms.",
        ctas: {
          projects: "View Projects",
          contact: "Get In Touch",
          cv: "Download CV",
        },
        cvToast: "CV downloaded successfully!",
        signal: {
          running: "running",
          whoami: "Full-stack developer",
          years: "2+ years",
          where: "Based in Spain. Open to relocation.",
          stack: "React / Spring Boot / PostgreSQL",
          mindset: "Still learning, tightening, and improving.",
        },
        dock: "scroll to explore",
      },
      activity: {
        eyebrow: "Activity",
        title: "Recent updates",
        copy: "A running log of what I have been building, learning, and shipping lately.",
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
        eyebrow: "Summary",
        title: "Professional summary",
        aboutTitle: "About me",
        paragraphs: [
          "My name is Juan Sánchez, and I’ve been working as a full-stack developer since 2024.",
          "I tend to learn by building things. When I have an idea, I usually try to implement it, whether that means exploring a new tool or improving something I’ve already worked on.",
          "I’m comfortable moving across the stack when needed, especially when a feature depends on both frontend and backend decisions.",
        ],
        sideTitle: "Right now",
        current: "Current work",
        currentCopy: "Building and maintaining public-sector software.",
        learning: "Learning",
        learningCopy: "AWS foundations, delivery patterns, and stronger UI systems.",
        next: "Next",
        nextCopy: "Sharper personal projects and a better portfolio system.",
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
                  "Develop and maintain React and Spring Boot features for a public-sector platform used in Spain.",
                  "Work with PostgreSQL data flows, service integrations, and production support tasks.",
                  "Contribute to Docker-based deployments in a microservices environment.",
                ],
              },
              previous: {
                title: "Full Stack Developer",
                description: [
                  "Maintained a legacy JSF and EJB application for the Government of the Canary Islands.",
                  "Worked on PostgreSQL-backed workflows and internal business logic.",
                  "Helped move legacy modules toward Vaadin and Spring Boot.",
                  "Built Angular and Spring Boot side projects for internal and client-facing use cases.",
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
                  "Built internal tools with React, Flask, and GeoServer.",
                  "Automated Python scraping workflows and cut execution time by about 50%.",
                  "Implemented a RAG prototype for semantic document retrieval.",
                  "Explored image-classification prototypes with convolutional neural networks.",
                  "Wrote technical documentation with Jupyter Books and managed PostgreSQL datasets.",
                ],
              },
            },
          },
        },
      },
      projects: {
        eyebrow: "Projects",
        title: "Personal projects",
        copy:
          "Things I’ve built outside work to explore ideas, try technologies, and make products that feel worth shipping.",
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
          "local-bubbly": {
            description:
              "Private one-to-one chat app built to explore real-time messaging and anonymous conversations.",
            bullet_points: [
              "Built the frontend in React and Tailwind CSS.",
              "Implemented real-time messaging with Flask-SocketIO.",
              "Packaged and deployed the app with Docker and DigitalOcean.",
            ],
          },
          "local-hive-challenges": {
            description:
              "Gamified web app used to run monthly sales challenges for Hive.",
            bullet_points: [
              "Built the frontend in React and Bootstrap.",
              "Connected the app to Google Firestore.",
            ],
          },
          "local-hangman": {
            title: "Ecologic Hangman Game",
            description:
              "Educational word game created for a science fair to teach sustainability to children.",
            bullet_points: [
              "Built the interface in React and Tailwind CSS.",
              "Designed the game flow for a live event and a younger audience.",
              "Deployed it on GitHub Pages.",
            ],
          },
          "local-casa-milan": {
            description: "Marketing website for a student residence in Seville.",
            bullet_points: [
              "Built with Next.js.",
              "Designed responsive pages for mobile and desktop.",
              "Deployed the site on Vercel.",
            ],
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
        copy:
          "If you are hiring or want to talk through a project, you can reach me here.",
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
          "Trabajo en sistemas reales en producción, arreglando código heredado y sacando funcionalidades nuevas.",
        points: [
          "Reduje un 60% la duplicación de código en una aplicación en producción",
          "Migré sistemas de Oracle a PostgreSQL",
          "Saco funcionalidades entre frontend y backend",
        ],
        current: "Ahora mismo trabajo en plataformas del sector público.",
        ctas: {
          projects: "Ver proyectos",
          contact: "Contactar",
          cv: "Descargar CV",
        },
        cvToast: "CV descargado correctamente",
        signal: {
          running: "activo",
          whoami: "Desarrollador full-stack",
          years: "2+ años",
          where: "Vivo en España. Abierto a reubicación.",
          stack: "React / Spring Boot / PostgreSQL",
          mindset: "Aprendo rápido y no me cuesta entrar en terreno nuevo.",
        },
        dock: "baja para seguir",
      },
      activity: {
        eyebrow: "Actividad",
        title: "Últimas actualizaciones",
        copy: "Un registro rápido de lo que he ido construyendo, aprendiendo y sacando adelante.",
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
        eyebrow: "Resumen",
        title: "Resumen profesional",
        aboutTitle: "Sobre mí",
        paragraphs: [
          "Me llamo Juan Sánchez y trabajo como desarrollador full-stack desde 2024.",
          "Suelo aprender construyendo. Cuando se me ocurre una idea, intento llevarla a algo real, ya sea probando una herramienta nueva o mejorando algo que ya había hecho antes.",
          "Me muevo bien por distintas capas cuando hace falta, sobre todo cuando una funcionalidad depende tanto del frontend como del backend.",
        ],
        sideTitle: "Ahora mismo",
        current: "Trabajo actual",
        currentCopy: "Desarrollo y mantengo software para el sector público.",
        learning: "Aprendiendo",
        learningCopy: "Fundamentos de AWS, patrones de entrega y sistemas de interfaz más sólidos.",
        next: "Siguiente paso",
        nextCopy: "Proyectos personales más pulidos y un portfolio mejor resuelto.",
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
                  "Desarrollo y mantengo funcionalidades con React y Spring Boot para una plataforma pública usada en España.",
                  "Trabajo con flujos de datos en PostgreSQL, integraciones de servicios y soporte en producción.",
                  "Participo en despliegues con Docker dentro de un entorno de microservicios.",
                ],
              },
              previous: {
                title: "Desarrollador full stack",
                description: [
                  "Mantuve una aplicación heredada en JSF y EJB para el Gobierno de Canarias.",
                  "Trabajé sobre flujos con PostgreSQL y lógica de negocio interna.",
                  "Ayudé a mover módulos heredados hacia Vaadin y Spring Boot.",
                  "Saqué side projects con Angular y Spring Boot para usos internos y de cliente.",
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
                  "Construí herramientas internas con React, Flask y GeoServer.",
                  "Automaticé flujos de scraping en Python y recorté el tiempo de ejecución cerca de un 50%.",
                  "Implementé un prototipo RAG para recuperación semántica de documentos.",
                  "Probé prototipos de clasificación de imagen con redes convolucionales.",
                  "Escribí documentación técnica con Jupyter Books y gestioné datasets en PostgreSQL.",
                ],
              },
            },
          },
        },
      },
      projects: {
        eyebrow: "Proyectos",
        title: "Proyectos personales",
        copy:
          "Cosas que he construido fuera del trabajo para probar ideas, tocar tecnologías nuevas y sacar productos con sentido.",
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
          "local-bubbly": {
            description:
              "App de chat privado uno a uno creada para explorar mensajería en tiempo real y conversaciones anónimas.",
            bullet_points: [
              "Construí el frontend con React y Tailwind CSS.",
              "Implementé mensajería en tiempo real con Flask-SocketIO.",
              "Empaqueté y desplegué la app con Docker y DigitalOcean.",
            ],
          },
          "local-hive-challenges": {
            description:
              "Aplicación gamificada usada para lanzar retos mensuales de ventas en Hive.",
            bullet_points: [
              "Construí el frontend con React y Bootstrap.",
              "Conecté la app con Google Firestore.",
            ],
          },
          "local-hangman": {
            title: "Ahorcado ecológico",
            description:
              "Juego educativo creado para una feria de ciencias con el objetivo de enseñar sostenibilidad a niños.",
            bullet_points: [
              "Construí la interfaz con React y Tailwind CSS.",
              "Diseñé el flujo del juego para un evento en vivo y un público joven.",
              "Lo desplegué en GitHub Pages.",
            ],
          },
          "local-casa-milan": {
            description:
              "Web corporativa para una residencia de estudiantes en Sevilla.",
            bullet_points: [
              "Construida con Next.js.",
              "Diseñé páginas responsive para móvil y escritorio.",
              "Desplegué la web en Vercel.",
            ],
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
        copy:
          "Si estás contratando o quieres hablar de un proyecto, puedes escribirme aquí.",
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
  lng: storedLanguage === "es" || storedLanguage === "en" ? storedLanguage : "en",
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

i18n.on("languageChanged", (language) => {
  if (typeof window !== "undefined") {
    window.localStorage.setItem("portfolio-language", language);
  }

  if (typeof document !== "undefined") {
    document.documentElement.lang = language;
  }
});

if (typeof document !== "undefined") {
  document.documentElement.lang = i18n.language;
}

export default i18n;
