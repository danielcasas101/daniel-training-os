'use client'

import { cn } from '@/lib/utils'
import { NAV_ITEMS } from '@/lib/nav'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { ChevronLeft, Dumbbell } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function DesktopSidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={cn(
        'sticky top-0 hidden h-screen shrink-0 flex-col border-r border-sidebar-border bg-sidebar md:flex',
        collapsed ? 'w-16' : 'w-60',
      )}
    >
      <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-4">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <Dumbbell className="size-4" />
        </div>
        {!collapsed && (
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold">Training OS</span>
            <span className="text-xs text-muted-foreground">Daniel</span>
          </div>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-3">
        <ul className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const active =
              item.href === '/'
                ? pathname === '/'
                : pathname.startsWith(item.href)
            const Icon = item.icon
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  title={item.label}
                  className={cn(
                    'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                    active
                      ? 'bg-sidebar-accent font-medium text-sidebar-accent-foreground'
                      : 'text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-foreground',
                    collapsed && 'justify-center px-0',
                  )}
                >
                  <Icon className="size-[18px] shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="border-t border-sidebar-border p-2">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-center text-muted-foreground"
          onClick={() => setCollapsed((c) => !c)}
        >
          <ChevronLeft
            className={cn('size-4 transition-transform', collapsed && 'rotate-180')}
          />
          {!collapsed && <span className="ml-1">Collapse</span>}
        </Button>
      </div>
    </aside>
  )
}
