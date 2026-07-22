import { DesktopSidebar } from './desktop-sidebar'
import { MobileNav } from './mobile-nav'
import { ExerciseDetailProvider } from '@/components/exercise-detail-provider'

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <ExerciseDetailProvider>
      <div className="flex min-h-screen bg-background">
        <DesktopSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-24 pt-5 md:px-8 md:pb-10">
            {children}
          </main>
        </div>
        <MobileNav />
      </div>
    </ExerciseDetailProvider>
  )
}

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string
  description?: string
  action?: React.ReactNode
}) {
  return (
    <div className="mb-5 flex items-start justify-between gap-4">
      <div className="min-w-0">
        <h1 className="text-balance text-2xl font-semibold tracking-tight">
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-pretty text-sm text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}
