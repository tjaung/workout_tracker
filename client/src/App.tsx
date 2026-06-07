import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { DashboardLayout } from '@components/layout/DashboardLayout'
import { AuthPage } from '@pages/auth/AuthPage'
import { DashboardPage } from '@pages/dashboard/DashboardPage'
import { DashboardPlaceholderPage } from '@pages/dashboard/DashboardPlaceholderPage'
import { AddRoutinePage } from '@pages/dashboard/routines/AddRoutinePage'
import { MakeRoutinePage } from '@pages/dashboard/routines/makeRoutine/MakeRoutinePage'
import { RoutineListPage } from '@pages/dashboard/routines/selectRoutine/RoutineListPage'
import { RoutinesPage } from '@pages/dashboard/routines/RoutinesPage'
import { SettingsPage } from '@pages/dashboard/settings/SettingsPage'
import { CurrentWorkoutPage } from '@pages/dashboard/workouts/CurrentWorkoutPage'
import { WorkoutsPage } from '@pages/dashboard/workouts/WorkoutsPage'
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
                element: <WorkoutsPage />,
              },
              {
                path: 'workouts/current-workout',
                element: <CurrentWorkoutPage />,
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
                element: <SettingsPage />,
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
