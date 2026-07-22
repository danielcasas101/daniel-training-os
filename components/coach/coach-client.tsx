'use client'

import { useRef, useState } from 'react'
import type { CoachConversation, CoachMessage } from '@/lib/types'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { proposedChangesSample } from '@/lib/seed-data'
import {
  Send,
  Sparkles,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Target,
  Database,
  Check,
  X,
  Bot,
  User,
} from 'lucide-react'

const QUICK_ACTIONS = [
  'Review my week',
  'Plan next week',
  'Why is my kick-up stalling?',
  'Adjust for sore forearms',
]

interface ReviewState {
  show: boolean
  edits: { id: string; summary: string; detail: string; status: 'pending' | 'approved' | 'rejected' }[]
}

export function CoachClient({ conversation }: { conversation: CoachConversation }) {
  const [messages, setMessages] = useState<CoachMessage[]>(conversation.messages)
  const [input, setInput] = useState('')
  const [review, setReview] = useState<ReviewState>({ show: false, edits: [] })
  const scrollRef = useRef<HTMLDivElement>(null)

  function pushCoachReply(userText: string) {
    const reply: CoachMessage = {
      id: `cm-${Date.now()}-c`,
      role: 'coach',
      content:
        'Based on your recent workouts, pain logs, and current plan, here is what I see. Review the proposed changes below and approve the ones you want applied to your plan.',
      createdAt: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, reply])
    setReview({
      show: true,
      edits: proposedChangesSample.change.map((c, i) => ({
        id: `edit-${i}`,
        summary: c,
        detail: 'Proposed update to your weekly plan based on recent data.',
        status: 'pending',
      })),
    })
  }

  function send(text: string) {
    const value = text.trim()
    if (!value) return
    const userMsg: CoachMessage = {
      id: `cm-${Date.now()}`,
      role: 'user',
      content: value,
      createdAt: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setTimeout(() => pushCoachReply(value), 400)
    setTimeout(
      () => scrollRef.current?.scrollTo({ top: 99999, behavior: 'smooth' }),
      450,
    )
  }

  function setEditStatus(id: string, status: 'approved' | 'rejected') {
    setReview((prev) => ({
      ...prev,
      edits: prev.edits.map((e) => (e.id === id ? { ...e, status } : e)),
    }))
  }

  return (
    <div className="flex flex-col gap-4">
      <Card className="flex-row items-start gap-2 border-primary/20 bg-primary/5 p-3 text-xs">
        <Sparkles className="mt-0.5 size-4 shrink-0 text-primary" />
        <p className="text-muted-foreground">
          Your coach reviews your real logged data and proposes plan changes. Nothing
          is applied until you approve it.
        </p>
      </Card>

      <div className="flex flex-wrap gap-2">
        {QUICK_ACTIONS.map((a) => (
          <button
            key={a}
            onClick={() => send(a)}
            className="rounded-full border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
          >
            {a}
          </button>
        ))}
      </div>

      <div
        ref={scrollRef}
        className="flex max-h-[420px] flex-col gap-4 overflow-y-auto rounded-xl bg-card p-4 text-sm ring-1 ring-foreground/10"
      >
        {messages.map((m) => (
          <MessageBubble key={m.id} message={m} />
        ))}
        {review.show && <ReviewCard edits={review.edits} onSet={setEditStatus} />}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          send(input)
        }}
        className="flex items-center gap-2"
      >
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask your coach anything..."
          className="flex-1"
        />
        <Button type="submit" size="icon" aria-label="Send">
          <Send className="size-4" />
        </Button>
      </form>
    </div>
  )
}

function MessageBubble({ message }: { message: CoachMessage }) {
  const isCoach = message.role === 'coach'
  return (
    <div className={cn('flex gap-2.5', !isCoach && 'flex-row-reverse')}>
      <div
        className={cn(
          'flex size-7 shrink-0 items-center justify-center rounded-full',
          isCoach ? 'bg-primary/15 text-primary' : 'bg-secondary text-foreground',
        )}
      >
        {isCoach ? <Bot className="size-4" /> : <User className="size-4" />}
      </div>
      <div
        className={cn(
          'max-w-[80%] rounded-lg px-3 py-2 text-sm',
          isCoach ? 'bg-secondary' : 'bg-primary text-primary-foreground',
        )}
      >
        {message.content}
      </div>
    </div>
  )
}

function ReviewCard({
  edits,
  onSet,
}: {
  edits: ReviewState['edits']
  onSet: (id: string, status: 'approved' | 'rejected') => void
}) {
  const sections = [
    { title: 'What I noticed', items: proposedChangesSample.noticed, icon: Eye, tone: 'text-foreground' },
    { title: 'Keep doing', items: proposedChangesSample.keep, icon: CheckCircle2, tone: 'text-success' },
    { title: 'Watch out', items: proposedChangesSample.warnings, icon: AlertTriangle, tone: 'text-warning' },
    { title: 'Next focus', items: proposedChangesSample.nextFocus, icon: Target, tone: 'text-primary' },
  ]

  return (
    <Card className="gap-4 border-primary/30 bg-card p-4">
      <div className="flex items-center gap-2">
        <Sparkles className="size-4 text-primary" />
        <h3 className="text-sm font-semibold">Weekly review &amp; proposed changes</h3>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {sections.map((s) => (
          <div key={s.title}>
            <div className="mb-1.5 flex items-center gap-1.5">
              <s.icon className={cn('size-3.5', s.tone)} />
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {s.title}
              </p>
            </div>
            <ul className="flex flex-col gap-1">
              {s.items.map((item, i) => (
                <li key={i} className="text-xs text-muted-foreground">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Proposed plan edits
        </p>
        <div className="flex flex-col gap-2">
          {edits.map((e) => (
            <div
              key={e.id}
              className={cn(
                'flex items-center justify-between gap-3 rounded-md border p-3',
                e.status === 'approved' && 'border-success/40 bg-success/5',
                e.status === 'rejected' && 'border-border bg-muted/40 opacity-60',
                e.status === 'pending' && 'border-border bg-card/50',
              )}
            >
              <p className="text-sm">{e.summary}</p>
              {e.status === 'pending' ? (
                <div className="flex shrink-0 gap-1.5">
                  <Button
                    size="icon"
                    variant="outline"
                    className="size-8"
                    onClick={() => onSet(e.id, 'rejected')}
                    aria-label="Reject"
                  >
                    <X className="size-4" />
                  </Button>
                  <Button
                    size="icon"
                    className="size-8"
                    onClick={() => onSet(e.id, 'approved')}
                    aria-label="Approve"
                  >
                    <Check className="size-4" />
                  </Button>
                </div>
              ) : (
                <Badge
                  variant={e.status === 'approved' ? 'default' : 'outline'}
                  className="shrink-0 text-xs capitalize"
                >
                  {e.status}
                </Badge>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-start gap-1.5 border-t border-border pt-3">
        <Database className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
        <p className="text-xs text-muted-foreground">
          Data used: {proposedChangesSample.dataUsed.join(', ')}.
        </p>
      </div>
    </Card>
  )
}
