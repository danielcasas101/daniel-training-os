'use client'

import { useMemo, useState } from 'react'
import type { GuideResource } from '@/lib/types'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { useTrainingState } from '@/components/training-state-provider'
import { trainingStore } from '@/lib/training-store'
import {
  Search,
  Video,
  FileText,
  Dumbbell,
  ListChecks,
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  ExternalLink,
  Clock,
} from 'lucide-react'

const TYPE_ICON = {
  video: Video,
  article: FileText,
  program: Dumbbell,
  drill: ListChecks,
} as const

export function LibraryClient({ resources }: { resources: GuideResource[] }) {
  const [query, setQuery] = useState('')
  const [skill, setSkill] = useState('all')
  const [savedOnly, setSavedOnly] = useState(false)
  const trainingState = useTrainingState()
  const items = trainingState.resources.length ? trainingState.resources : resources

  const skillsList = useMemo(
    () => ['all', ...Array.from(new Set(resources.map((r) => r.skill)))],
    [resources],
  )

  const filtered = useMemo(() => {
    return items.filter((r) => {
      if (savedOnly && !r.saved) return false
      if (skill !== 'all' && r.skill !== skill) return false
      if (query) {
        const q = query.toLowerCase()
        return (
          r.title.toLowerCase().includes(q) ||
          r.summary.toLowerCase().includes(q) ||
          r.skill.toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [items, query, skill, savedOnly])

  function toggleSaved(id: string) {
    trainingStore.saveResources(
      items.map((resource) =>
        resource.id === id ? { ...resource, saved: !resource.saved } : resource,
      ),
    )
  }
  function toggleCompleted(id: string) {
    trainingStore.saveResources(
      items.map((resource) =>
        resource.id === id ? { ...resource, completed: !resource.completed } : resource,
      ),
    )
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search guides, drills, articles..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {skillsList.map((s) => (
            <button
              key={s}
              onClick={() => setSkill(s)}
              className={cn(
                'rounded-full border px-3 py-1 text-xs transition-colors',
                skill === s
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border text-muted-foreground hover:text-foreground',
              )}
            >
              {s === 'all' ? 'All skills' : s}
            </button>
          ))}
          <button
            onClick={() => setSavedOnly((v) => !v)}
            className={cn(
              'ml-auto flex items-center gap-1 rounded-full border px-3 py-1 text-xs transition-colors',
              savedOnly
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border text-muted-foreground hover:text-foreground',
            )}
          >
            <Bookmark className="size-3" />
            Saved
          </button>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        {filtered.length} {filtered.length === 1 ? 'resource' : 'resources'}
      </p>

      <div className="grid gap-3 lg:grid-cols-2">
        {filtered.map((r) => {
          const Icon = TYPE_ICON[r.contentType]
          return (
            <Card key={r.id} className="gap-3 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-secondary">
                    <Icon className="size-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium leading-tight">{r.title}</h3>
                    <div className="mt-1 flex flex-wrap items-center gap-1.5">
                      <Badge variant="secondary" className="text-xs">
                        {r.skill}
                      </Badge>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="size-3" />
                        {r.durationMin}m
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => toggleSaved(r.id)}
                  aria-label={r.saved ? 'Unsave' : 'Save'}
                  className="text-muted-foreground hover:text-primary"
                >
                  {r.saved ? (
                    <BookmarkCheck className="size-4 text-primary" />
                  ) : (
                    <Bookmark className="size-4" />
                  )}
                </button>
              </div>

              <p className="text-xs text-muted-foreground">{r.summary}</p>
              <p className="rounded-md bg-primary/5 px-2.5 py-1.5 text-xs text-primary">
                Why it&apos;s relevant: {r.relevance}
              </p>

              <div className="flex items-center justify-between gap-2 pt-1">
                <Button
                  variant={r.completed ? 'secondary' : 'outline'}
                  size="sm"
                  onClick={() => toggleCompleted(r.id)}
                >
                  <CheckCircle2
                    className={cn('size-4', r.completed && 'text-success')}
                  />
                  {r.completed ? 'Completed' : 'Mark done'}
                </Button>
                {!r.url.includes('example.com') && (
                  <Button
                    variant="ghost"
                    size="sm"
                    nativeButton={false}
                    render={<a href={r.url} target="_blank" rel="noopener noreferrer" />}
                  >
                    Open
                    <ExternalLink className="size-3.5" />
                  </Button>
                )}
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
