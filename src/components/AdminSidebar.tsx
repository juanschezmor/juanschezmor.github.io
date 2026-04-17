type Props = {
  currentView: "projects" | "activities" | "skills" | "experiences" | "resume";
  setView: (
    view: "projects" | "activities" | "skills" | "experiences" | "resume"
  ) => void;
};

const items = [
  { id: "projects", label: "Projects", description: "Portfolio work" },
  { id: "activities", label: "Activity", description: "Feed updates" },
  { id: "skills", label: "Skills", description: "Stack and tooling" },
  { id: "experiences", label: "Experiences", description: "Career timeline" },
  { id: "resume", label: "Resume", description: "CV and exports" },
] as const;

export default function AdminSidebar({
  currentView,
  setView,
}: Readonly<Props>) {
  return (
    <aside className="w-full self-start rounded-[2rem] border border-white/10 bg-slate-950/80 p-4 text-slate-100 shadow-[0_24px_60px_rgba(2,6,23,0.45)] backdrop-blur-xl lg:sticky lg:top-8 lg:w-72 lg:p-6">
      <div className="mb-5">
        <p className="mb-2 inline-flex rounded-full border border-orange-400/20 bg-orange-400/10 px-3 py-1 text-[11px] uppercase tracking-[0.28em] text-orange-200">
          Admin
        </p>
        <h2 className="mb-1 text-xl font-semibold">Content management</h2>
        <p className="text-sm text-slate-400">
          Jump between sections and keep the editor focused.
        </p>
      </div>

      <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
        {items.map((item) => {
          const isActive = currentView === item.id;

          return (
            <li key={item.id}>
              <button
                className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
                  isActive
                    ? "border-orange-400/40 bg-orange-400/12 text-orange-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
                    : "border-transparent bg-white/5 text-slate-100 hover:border-orange-400/30 hover:bg-white/10 hover:text-orange-200"
                }`}
                onClick={() => setView(item.id)}
              >
                <span className="block text-sm font-semibold">{item.label}</span>
                <span className="mt-1 block text-xs text-slate-400">
                  {item.description}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
