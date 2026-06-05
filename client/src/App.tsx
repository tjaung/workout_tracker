import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { DashboardLayout } from '@components/layout/DashboardLayout'
import { AuthPage } from '@pages/auth/AuthPage'
import { DashboardPage } from '@pages/dashboard/DashboardPage'
import { DashboardPlaceholderPage } from '@pages/dashboard/DashboardPlaceholderPage'
import { AddRoutinePage } from '@pages/dashboard/routines/AddRoutinePage'
import { MakeRoutinePage } from '@pages/dashboard/routines/makeRoutine/MakeRoutinePage'
import { RoutineListPage } from '@pages/dashboard/routines/selectRoutine/RoutineListPage'
import { RoutinesPage } from '@pages/dashboard/routines/RoutinesPage'
import { ProtectedRoute } from '@routes/ProtectedRoute'
import { RootLayout } from '@routes/root'

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <AuthPage />,
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            element: <DashboardLayout />,
            children: [
              {
                path: 'dashboard',
                element: <DashboardPage />,
              },
              {
                path: 'dashboard/workouts',
                element: <DashboardPlaceholderPage title="Workouts" />,
              },
              {
                path: 'dashboard/routines',
                element: <RoutinesPage />,
              },
              {
                path: 'routines/add-routine',
                element: <AddRoutinePage />,
              },
              {
                path: 'routine/add-routine',
                element: <AddRoutinePage />,
              },
              {
                path: 'routines/add-routine/routine-list',
                element: <RoutineListPage />,
              },
              {
                path: 'routine/add-routine/routine-list',
                element: <RoutineListPage />,
              },
              {
                path: 'routines/add-routine/build',
                element: <MakeRoutinePage />,
              },
              {
                path: 'routine/add-routine/build',
                element: <MakeRoutinePage />,
              },
              {
                path: 'dashboard/progress',
                element: <DashboardPlaceholderPage title="Progress" />,
              },
              {
                path: 'dashboard/records',
                element: <DashboardPlaceholderPage title="Records" />,
              },
              {
                path: 'dashboard/settings',
                element: <DashboardPlaceholderPage title="Settings" />,
              },
            ],
          },
        ],
      },
    ],
  },
])

function App() {
  return <RouterProvider router={router} />
}

export default App
