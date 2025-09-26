import { lazy } from "react";
import { createBrowserRouter, Navigate } from "react-router";

// layouts
import { AuthLayout, AdminLayout, TabletLayout } from "./layouts";
import { ActivitiesList } from "./features/activities/pages/ActivitiesList";
import { ActivityProvider } from "./features/activities/context/ActivityContext";
const UserList = lazy(() => import("./pages/users/UserList"));

// guards
// import { ProtectedRoute } from "./guards";

// auth pages
const Login = lazy(() => import("./pages/auth/Login"));
const Register = lazy(() => import("./pages/auth/Register"));

const authRoutes = [
  {
    element: <AuthLayout />,
    children: [
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "registro",
        element: <Register />,
      },
    ],
  },
];

const adminRoutes = [
  {
    element: <AdminLayout />,
    children: [
      {
        path: "participantes",
        element: <UserList />,
      },
      {
        path: "eventos",
        element: <ActivityProvider />,
        children: [{ index: true, element: <ActivitiesList /> }],
      },
    ],
  },
];

const tabletRoutes = [
  {
    element: <TabletLayout />,
    children: [
      {
        path: "/",
        element: <h1>Test Page</h1>,
      },
    ],
  },
];

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/login" replace />,
  },
  ...authRoutes,
  ...adminRoutes,
  ...tabletRoutes,
]);

export default router;
