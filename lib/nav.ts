import type { LucideIcon } from 'lucide-react'
import {
  Activity,
  Apple,
  BookOpen,
  CalendarDays,
  Dumbbell,
  Home,
  Library,
  MessageSquare,
  Sparkles,
  StretchHorizontal,
  User,
} from 'lucide-react'

export interface NavItem {
  href: string
  label: string
  icon: LucideIcon
  primaryMobile?: boolean
}

export const NAV_ITEMS: NavItem[] = [
  { href: '/', label: 'Today', icon: Home, primaryMobile: true },
  { href: '/plan', label: 'Plan', icon: CalendarDays, primaryMobile: true },
  { href: '/skills', label: 'Skills', icon: Sparkles, primaryMobile: true },
  { href: '/flexibility', label: 'Flexibility', icon: StretchHorizontal, primaryMobile: true },
  { href: '/progress', label: 'Progress', icon: Activity, primaryMobile: true },
  { href: '/body', label: 'Body', icon: Dumbbell },
  { href: '/diet', label: 'Diet', icon: Apple },
  { href: '/library', label: 'Library', icon: Library },
  { href: '/coach', label: 'Coach', icon: MessageSquare },
  { href: '/settings', label: 'Settings', icon: User },
]

export const MORE_ITEMS = NAV_ITEMS.filter((i) => !i.primaryMobile)
export { BookOpen }
