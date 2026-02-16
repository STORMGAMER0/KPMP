import { createBrowserRouter } from "react-router";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import LiveSession from "./pages/LiveSession";
import Profile from "./pages/Profile";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Login,
  },
  {
    path: "/dashboard",
    Component: Dashboard,
  },
  {
    path: "/session",
    Component: LiveSession,
  },
  {
    path: "/profile",
    Component: Profile,
  },
]);
