'use client'

import { cn } from '@/lib/utils'
import { NAV_ITEMS, MORE_ITEMS } from '@/lib/nav'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { MoreHorizontal } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

export function MobileNav() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const primary = NAV_ITEMS.filter((i) => i.primaryMobile)

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href)

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur md:hidden">
      <ul className="flex items-stretch justify-around px-1 pb-[env(safe-area-inset-bottom)]">
        {primary.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                className={cn(
                  'flex flex-col items-center gap-0.5 py-2 text-[10px] font-medium transition-colors',
                  active ? 'text-primary' : 'text-muted-foreground',
                )}
              >
                <Icon className="size-5" />
                {item.label}
              </Link>
            </li>
          )
        })}
        <li className="flex-1">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              className={cn(
                'flex w-full flex-col items-center gap-0.5 py-2 text-[10px] font-medium transition-colors',
                MORE_ITEMS.some((i) => isActive(i.href))
                  ? 'text-primary'
                  : 'text-muted-foreground',
              )}
            >
              <MoreHorizontal className="size-5" />
              More
            </SheetTrigger>
            <SheetContent side="bottom" className="rounded-t-2xl">
              <SheetHeader>
                <SheetTitle>More</SheetTitle>
              </SheetHeader>
              <div className="grid grid-cols-3 gap-3 p-4">
                {MORE_ITEMS.map((item) => {
                  const Icon = item.icon
                  const active = isActive(item.href)
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        'flex flex-col items-center gap-2 rounded-lg border border-border p-4 text-xs font-medium transition-colors',
                        active
                          ? 'border-primary/40 bg-primary/10 text-primary'
                          : 'text-muted-foreground hover:bg-accent',
                      )}
                    >
                      <Icon className="size-5" />
                      {item.label}
                    </Link>
                  )
                })}
              </div>
            </SheetContent>
          </Sheet>
        </li>
      </ul>
    </nav>
  )
}
