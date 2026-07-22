'use client'

import { useState } from 'react'
import { findInstruction } from '@/lib/instructions'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  ChevronDown,
  ExternalLink,
  Lightbulb,
  Sparkles,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export function ExerciseDetailSheet({
  name,
  open,
  onOpenChange,
}: {
  name: string | null
  open: boolean
  onOpenChange: (v: boolean) => void
}) {
  const [more, setMore] = useState(false)
  const inst = name ? findInstruction(name) : undefined

  return (
    <Sheet
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v)
        if (!v) setMore(false)
      }}
    >
      <SheetContent
        side="bottom"
        className="max-h-[85vh] overflow-y-auto rounded-t-2xl sm:max-h-full sm:rounded-none sm:data-[side=bottom]:inset-y-0 sm:data-[side=bottom]:right-0 sm:data-[side=bottom]:left-auto sm:data-[side=bottom]:h-full sm:data-[side=bottom]:w-full sm:data-[side=bottom]:max-w-md sm:data-[side=bottom]:border-l"
      >
        <SheetHeader className="pb-0">
          <SheetTitle>{inst?.title ?? name ?? 'Exercise'}</SheetTitle>
          <SheetDescription>
            {inst?.summary ?? 'No detailed guide for this item yet.'}
          </SheetDescription>
        </SheetHeader>

        {inst && (
          <div className="flex flex-col gap-4 px-4 pb-6">
            <Block label="Why this is in your plan" tone="primary">
              <p>{inst.whyInPlan}</p>
            </Block>

            <div>
              <SubHeading>How to perform</SubHeading>
              <ol className="flex list-decimal flex-col gap-1.5 pl-4 text-sm text-muted-foreground">
                {inst.howTo.map((step, i) => (
                  <li key={i} className="pl-1">
                    {step}
                  </li>
                ))}
              </ol>
            </div>

            <div>
              <SubHeading>Key cues</SubHeading>
              <ul className="flex flex-col gap-1.5">
                {inst.cues.map((cue, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <Lightbulb className="mt-0.5 size-3.5 shrink-0 text-primary" />
                    <span>{cue}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <Block label="Easier" tone="muted" icon={ArrowDownRight}>
                <p>{inst.easier}</p>
              </Block>
              <Block label="Harder" tone="muted" icon={ArrowUpRight}>
                <p>{inst.harder}</p>
              </Block>
            </div>

            {inst.discomfortWarning && (
              <Block label="Discomfort warning" tone="warn" icon={AlertTriangle}>
                <p>{inst.discomfortWarning}</p>
              </Block>
            )}

            <button
              onClick={() => setMore((m) => !m)}
              className="flex items-center justify-center gap-1 rounded-lg border border-border bg-card py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {more ? 'Less detail' : 'More detail'}
              <ChevronDown className={cn('size-4 transition-transform', more && 'rotate-180')} />
            </button>

            {more && (
              <div className="flex flex-col gap-4">
                <div>
                  <SubHeading>Setup</SubHeading>
                  <p className="text-sm text-muted-foreground">{inst.setup}</p>
                </div>
                <div>
                  <SubHeading>Common mistake</SubHeading>
                  <p className="text-sm text-muted-foreground">{inst.commonMistake}</p>
                </div>
                <Block label="What it should feel like" tone="muted" icon={Sparkles}>
                  <p>{inst.feelsLike}</p>
                </Block>
                {inst.guideUrl && (
                  <Button
                    variant="outline"
                    nativeButton={false}
                    render={
                      <a href={inst.guideUrl} target="_blank" rel="noreferrer" />
                    }
                  >
                    <ExternalLink className="size-4" />
                    Open guide
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}

function SubHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
      {children}
    </h3>
  )
}

function Block({
  label,
  children,
  tone,
  icon: Icon,
}: {
  label: string
  children: React.ReactNode
  tone: 'primary' | 'warn' | 'muted'
  icon?: React.ComponentType<{ className?: string }>
}) {
  return (
    <div
      className={cn(
        'rounded-lg border p-3 text-sm',
        tone === 'primary' && 'border-primary/20 bg-primary/5',
        tone === 'warn' && 'border-warning/30 bg-warning/5 text-warning',
        tone === 'muted' && 'border-border bg-card',
      )}
    >
      <p
        className={cn(
          'mb-1 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide',
          tone === 'primary' && 'text-primary',
          tone === 'warn' && 'text-warning',
          tone === 'muted' && 'text-muted-foreground',
        )}
      >
        {Icon && <Icon className="size-3.5" />}
        {label}
      </p>
      <div className={cn(tone === 'warn' ? 'text-foreground' : 'text-muted-foreground')}>
        {children}
      </div>
    </div>
  )
}
