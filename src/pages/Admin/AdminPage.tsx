import { useEffect, useRef, useState } from "react";
import { getMutationErrorMessage } from "../../api/client";
import { useAdminAuth } from "../../hooks/useAdminAuth";
import Dashboard from "./Dashboard";

const formatExpiry = (value: string) =>
  new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));

export default function AdminPage() {
  const { session, loading, isAuthenticated, login, logout, refreshSession } =
    useAdminAuth();
  const [username, setUsername] = useState(session?.username ?? "admin");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const validatedTokenRef = useRef<string | null>(null);

  useEffect(() => {
    if (!session) {
      validatedTokenRef.current = null;
      return;
    }

    if (validatedTokenRef.current === session.token) {
      return;
    }

    let active = true;

    const validateSession = async () => {
      try {
        setError(null);
        await refreshSession();
        if (active) {
          validatedTokenRef.current = session.token;
        }
      } catch (validationError) {
        if (active) {
          setError(getMutationErrorMessage("verify admin session", validationError));
        }
      }
    };

    void validateSession();

    return () => {
      active = false;
    };
  }, [refreshSession, session]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setError(null);
      await login({
        username: username.trim(),
        password,
      });
      setPassword("");
    } catch (loginError) {
      setError(getMutationErrorMessage("sign in", loginError));
    }
  };

  if (isAuthenticated && session) {
    return (
      <Dashboard
        adminUsername={session.username}
        sessionExpiresAt={session.expires_at}
        onLogout={logout}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(243,164,106,0.14),transparent_28%),linear-gradient(180deg,#08111f_0%,#0b1420_100%)] px-4 py-10 text-slate-100 sm:px-6">
      <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(20rem,0.95fr)] lg:items-stretch">
        <section className="rounded-[2rem] border border-white/10 bg-slate-950/45 p-6 shadow-[0_24px_80px_rgba(2,6,23,0.35)] backdrop-blur-xl sm:p-8">
          <p className="text-xs uppercase tracking-[0.28em] text-orange-300/80">
            Private admin access
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white">
            Manage your portfolio from anywhere.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300">
            Public visitors can still browse the site normally, but write actions
            now require a signed admin session. Log in here to edit projects,
            activity, experience, skills, and bilingual CV versions.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <article className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                Protected
              </p>
              <p className="mt-2 text-sm text-slate-200">
                All create, update, delete, upload and activate actions.
              </p>
            </article>
            <article className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                Still public
              </p>
              <p className="mt-2 text-sm text-slate-200">
                Portfolio reads and CV downloads for visitors.
              </p>
            </article>
            <article className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                Session length
              </p>
              <p className="mt-2 text-sm text-slate-200">
                Tokens expire automatically and can be rotated in AWS later.
              </p>
            </article>
          </div>
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-slate-950/55 p-6 shadow-[0_24px_80px_rgba(2,6,23,0.35)] backdrop-blur-xl sm:p-8">
          <div className="mb-6">
            <p className="text-xs uppercase tracking-[0.28em] text-slate-500">
              Sign in
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-white">
              Admin login
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              Use your admin credentials to unlock the control panel.
            </p>
          </div>

          {error && (
            <div className="mb-5 rounded-2xl border border-amber-400/25 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
              {error}
            </div>
          )}

          <form className="grid gap-4" onSubmit={handleSubmit}>
            <label className="grid gap-2 text-sm text-slate-200">
              Username
              <input
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                autoComplete="username"
                className="rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-orange-300/60"
              />
            </label>

            <label className="grid gap-2 text-sm text-slate-200">
              Password
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                className="rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-orange-300/60"
              />
            </label>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 rounded-xl bg-orange-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-orange-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Open admin panel"}
            </button>
          </form>

          <p className="mt-5 text-xs leading-5 text-slate-500">
            Once authenticated, your session stays in this browser until{" "}
            {session ? formatExpiry(session.expires_at) : "it expires"} or you log
            out.
          </p>
        </section>
      </div>
    </div>
  );
}

