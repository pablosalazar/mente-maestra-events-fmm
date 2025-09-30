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
const SaveResults = lazy(() => import("./features/game/pages/SaveResults"));
const Podium = lazy(() => import("./features/game/pages/Podium"));

// Admin
const ActivitiesList = lazy(
  () => import("./features/activities/pages/ActivitiesList")
);
const UserList = lazy(
  () => import("./features/users/pages/user-list/UserList")
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
                path: "resultados",
                element: <SaveResults />,
              },
              {
                path: "podio",
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
        children: [
          {
            index: true,
            element: <ActivitiesList />,
          },
        ],
      },
      {
        path: "participantes",
        element: <UserList />,
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
