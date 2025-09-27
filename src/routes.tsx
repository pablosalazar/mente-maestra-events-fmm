import { createBrowserRouter, Navigate } from "react-router";
import { AdminLayout, AuthLayout } from "./layouts";

import { ActivitiesList } from "./features/activities/pages/ActivitiesList";
import { ActivityProvider } from "./features/activities/context/ActivityContext";
import RegisterPage from "./features/auth/pages/RegisterPage";

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
  ...adminRoutes,
]);

export default router;
