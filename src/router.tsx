import { Suspense, lazy } from "react";
import type { ReactNode } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

const AdminPage = lazy(() => import("./pages/Admin/AdminPage"));
const Home = lazy(() => import("./pages/Home"));

const RouteFallback = () => (
  <div className="flex min-h-[40vh] items-center justify-center text-sm text-slate-400">
    Loading...
  </div>
);

const withSuspense = (element: ReactNode) => (
  <Suspense fallback={<RouteFallback />}>{element}</Suspense>
);

const router = createBrowserRouter([
  { path: "/", element: withSuspense(<Home />) },
  { path: "/admin", element: withSuspense(<AdminPage />) },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
