import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Dashboard from "./pages/Admin/Dashboard";
import Home from "./pages/Home";

const router = createBrowserRouter([
  { path: "/", element: <Home /> },
  { path: "/admin", element: <Dashboard /> },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
