import { lazy } from "react";
import { createBrowserRouter, Navigate } from "react-router";
import { ActivityProvider } from "./features/activities/context/ActivityContext";
import { AdminLayout, AuthLayout, AppLayout } from "./layouts";
import { AuthGuard } from "./guards/AuthGuard";

// Auth
const RegisterPage = lazy(() => import("./features/auth/pages/RegisterPage"));

// App
const AvatarSelect = lazy(() => import("./features/users/pages/AvatarSelect"));

// Admin
const ActivitiesList = lazy(
  () => import("./features/activities/pages/ActivitiesList")
);

const authRoutes = [
  {
    element: <AuthLayout />,
    children: [
      {
        path: "/registro",
        element: <RegisterPage />,
      },
    ],
  },
];

const appRoutes = [
  {
    element: <AppLayout />,
    children: [
      {
        element: <AuthGuard />,
        children: [
          {
            path: "/elige-avatar",
            element: <AvatarSelect />,
          },
        ],
      },
    ],
  },
];

const adminRoutes = [
  {
    element: <AdminLayout />,
    children: [
      {
        path: "eventos",
        element: <ActivityProvider />,
        children: [{ index: true, element: <ActivitiesList /> }],
      },
    ],
  },
];

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/registro" replace />,
  },
  ...authRoutes,
  ...appRoutes,
  ...adminRoutes,
]);

export default router;
