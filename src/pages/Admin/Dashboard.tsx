import { useState } from "react";
import Activities from "./Activities";
import Projects from "./Projects";
import Experiences from "./Experiences";
import Resume from "./Resume";
import Skills from "./Skills";
import AdminSidebar from "../../components/AdminSidebar";

export default function Dashboard() {
  const [view, setView] = useState<
    "projects" | "activities" | "skills" | "experiences" | "resume"
  >("projects");

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(243,164,106,0.12),transparent_28%),linear-gradient(180deg,#08111f_0%,#0b1420_100%)] px-6 py-8 text-slate-100">
      <div className="mx-auto flex max-w-7xl items-start gap-8">
      <AdminSidebar setView={setView} />
      <div className="min-w-0 flex-1 rounded-[2rem] border border-white/10 bg-slate-950/45 p-6 shadow-[0_24px_80px_rgba(2,6,23,0.35)] backdrop-blur-xl">
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
