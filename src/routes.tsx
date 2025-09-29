import { lazy } from "react";
import { createBrowserRouter, Navigate } from "react-router";
import { ActivityProvider } from "./features/activities/context/ActivityContext";
import { AdminLayout, AuthLayout, AppLayout } from "./layouts";
import { AuthGuard } from "./guards/AuthGuard";
import QuestionView from "./features/game/pages/QuestionView";
import { SessionProvider } from "./contexts/SessionContext";

// Auth
const RegisterPage = lazy(() => import("./features/auth/pages/RegisterPage"));

// App
const AvatarSelect = lazy(() => import("./features/users/pages/AvatarSelect"));
const CountDown = lazy(() => import("./features/game/pages/CountDown"));
const Feedback = lazy(() => import("./features/game/pages/Feedback"));
const Podium = lazy(() => import("./features/game/pages/Podium"));

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
          {
            path: "/",
            element: <SessionProvider />,
            children: [
              {
                path: "/contador",
                element: <CountDown />,
              },
              { path: "/pregunta", element: <QuestionView /> },
              {
                path: "feedback",
                element: <Feedback />,
              },
              {
                path: "podium",
                element: <Podium />,
              },
            ],
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
