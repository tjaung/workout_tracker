import {
  CalendarDays,
  Dumbbell,
  Home,
  LineChart,
  Settings,
  Trophy,
  type LucideIcon,
} from 'lucide-react'

export interface DashboardNavItem {
  href: string
  icon: LucideIcon
  label: string
}

export const dashboardNavItems: DashboardNavItem[] = [
  {
    href: '/dashboard',
    icon: Home,
    label: 'Overview',
  },
  {
    href: '/dashboard/workouts',
    icon: Dumbbell,
    label: 'Workouts',
  },
  {
    href: '/dashboard/routines',
    icon: CalendarDays,
    label: 'Routines',
  },
  {
    href: '/dashboard/progress',
    icon: LineChart,
    label: 'Progress',
  },
  {
    href: '/dashboard/records',
    icon: Trophy,
    label: 'Records',
  },
  {
    href: '/dashboard/settings',
    icon: Settings,
    label: 'Settings',
  },
]
