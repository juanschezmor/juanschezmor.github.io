type Props = {
  setView: (
    view: "projects" | "activities" | "skills" | "experiences" | "resume"
  ) => void;
};

export default function AdminSidebar({ setView }: Readonly<Props>) {
  return (
    <aside className="w-64 self-start rounded-3xl border border-white/10 bg-slate-950/80 p-6 text-slate-100 shadow-[0_24px_60px_rgba(2,6,23,0.45)] backdrop-blur-xl">
      <h2 className="mb-1 text-xl font-semibold">Admin</h2>
      <p className="mb-6 text-sm text-slate-400">Content management</p>
      <ul className="space-y-3">
        <li>
          <button
            className="w-full rounded-xl border border-transparent bg-white/5 px-4 py-3 text-left font-medium text-slate-100 transition hover:border-orange-400/40 hover:bg-white/10 hover:text-orange-200"
            onClick={() => setView("projects")}
          >
            Projects
          </button>
        </li>
        <li>
          <button
            className="w-full rounded-xl border border-transparent bg-white/5 px-4 py-3 text-left font-medium text-slate-100 transition hover:border-orange-400/40 hover:bg-white/10 hover:text-orange-200"
            onClick={() => setView("activities")}
          >
            Activity
          </button>
        </li>
        <li>
          <button
            className="w-full rounded-xl border border-transparent bg-white/5 px-4 py-3 text-left font-medium text-slate-100 transition hover:border-orange-400/40 hover:bg-white/10 hover:text-orange-200"
            onClick={() => setView("skills")}
          >
            Skills
          </button>
        </li>
        <li>
          <button
            className="w-full rounded-xl border border-transparent bg-white/5 px-4 py-3 text-left font-medium text-slate-100 transition hover:border-orange-400/40 hover:bg-white/10 hover:text-orange-200"
            onClick={() => setView("experiences")}
          >
            Experiences
          </button>
        </li>
        <li>
          <button
            className="w-full rounded-xl border border-transparent bg-white/5 px-4 py-3 text-left font-medium text-slate-100 transition hover:border-orange-400/40 hover:bg-white/10 hover:text-orange-200"
            onClick={() => setView("resume")}
          >
            Resume
          </button>
        </li>
      </ul>
    </aside>
  );
}
