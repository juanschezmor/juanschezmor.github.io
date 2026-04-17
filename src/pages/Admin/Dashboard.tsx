import { useState } from "react";
import Activities from "./Activities";
import Projects from "./Projects";
import Experiences from "./Experiences";
import Resume from "./Resume";
import Skills from "./Skills";
import AdminSidebar from "../../components/AdminSidebar";

const viewMeta = {
  projects: {
    title: "Projects",
    description: "Create, update and trim portfolio entries without losing context.",
  },
  activities: {
    title: "Activity",
    description: "Keep the feed tidy and add new updates from a focused editor.",
  },
  skills: {
    title: "Skills",
    description: "Manage the stack quickly with a lighter grid and search.",
  },
  experiences: {
    title: "Experiences",
    description: "Edit timeline entries in a dedicated workspace instead of one long page.",
  },
  resume: {
    title: "Resume",
    description: "CV-related actions and future exports live here.",
  },
} as const;

interface DashboardProps {
  adminUsername: string;
  sessionExpiresAt: string;
  onLogout: () => void;
}

const formatExpiry = (value: string) =>
  new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));

export default function Dashboard({
  adminUsername,
  sessionExpiresAt,
  onLogout,
}: DashboardProps) {
  const [view, setView] = useState<
    "projects" | "activities" | "skills" | "experiences" | "resume"
  >("projects");
  const meta = viewMeta[view];

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(243,164,106,0.12),transparent_28%),linear-gradient(180deg,#08111f_0%,#0b1420_100%)] px-4 py-6 text-slate-100 sm:px-6 sm:py-8">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[18rem_minmax(0,1fr)] lg:items-start lg:gap-8">
        <AdminSidebar currentView={view} setView={setView} />
        <div className="min-w-0 rounded-[2rem] border border-white/10 bg-slate-950/45 p-4 shadow-[0_24px_80px_rgba(2,6,23,0.35)] backdrop-blur-xl sm:p-6">
          <header className="mb-6 flex flex-col gap-4 border-b border-white/10 pb-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-2 text-xs uppercase tracking-[0.28em] text-orange-300/80">
                Dashboard / {meta.title}
              </p>
              <h1 className="text-3xl font-semibold tracking-tight text-white">
                {meta.title}
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-400">
                {meta.description}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-300">
              <div className="rounded-full border border-white/10 bg-slate-950/60 px-4 py-2">
                Signed in as <span className="font-semibold text-white">{adminUsername}</span>
              </div>
              <div className="rounded-full border border-white/10 bg-slate-950/60 px-4 py-2 text-slate-400">
                Expires {formatExpiry(sessionExpiresAt)}
              </div>
              <button
                type="button"
                onClick={onLogout}
                className="rounded-full border border-white/15 px-4 py-2 font-medium text-white transition hover:border-white/30 hover:bg-white/5"
              >
                Log out
              </button>
            </div>
          </header>

          {view === "projects" && <Projects />}
          {view === "activities" && <Activities />}
          {view === "skills" && <Skills />}
          {view === "experiences" && <Experiences />}
          {view === "resume" && <Resume />}
        </div>
      </div>
    </div>
  );
}
