'use client'

import { useState } from 'react'
import type { Profile, UserPreferences } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { cn } from '@/lib/utils'
import { Check, Droplet, Dumbbell, Utensils, Waves } from 'lucide-react'
import { trainingStore } from '@/lib/training-store'
import { localDateKey } from '@/lib/date'

// Daniel ~168 lb -> ~0.9-1g/lb protein target.
const PROTEIN_TARGET_G = 160

const MEAL_IDEAS = [
  'Greek yogurt + berries + granola',
  'Chicken or tofu rice bowl with veggies',
  'Eggs + toast + fruit',
  'Protein shake + banana + peanut butter',
  'Salmon, potatoes, and greens',
  'Cottage cheese + nuts as a snack',
]

const FUELING = [
  { icon: Dumbbell, title: 'Before gym / skills', body: 'Light carbs ~60-90 min prior — fruit, toast, or oats. Train fueled, not stuffed.' },
  { icon: Waves, title: 'Around swimming', body: 'Eat a real meal 1-2 hrs before. Refuel with protein + carbs within an hour after.' },
  { icon: Utensils, title: 'Daily protein', body: `Aim for ~${PROTEIN_TARGET_G}g spread across 3-4 meals to support skill strength work.` },
  { icon: Droplet, title: 'Hydration', body: 'Sip through the day; add electrolytes around long pool sessions or hot days.' },
]

type Choice3 = { value: string; label: string }
const PROTEIN_OPTS: Choice3[] = [
  { value: 'low', label: 'Low' },
  { value: 'okay', label: 'Okay' },
  { value: 'good', label: 'Good' },
]
const ENOUGH_OPTS: Choice3[] = [
  { value: 'no', label: 'No' },
  { value: 'unsure', label: 'Unsure' },
  { value: 'yes', label: 'Yes' },
]
const HYDRATION_OPTS: Choice3[] = [
  { value: 'low', label: 'Low' },
  { value: 'okay', label: 'Okay' },
  { value: 'good', label: 'Good' },
]

export function DietClient({
  profile,
}: {
  preferences: UserPreferences
  profile: Profile
}) {
  const [protein, setProtein] = useState<string | null>(null)
  const [ateEnough, setAteEnough] = useState<string | null>(null)
  const [hydration, setHydration] = useState<string | null>(null)
  const [bw, setBw] = useState('')
  const [note, setNote] = useState('')
  const [saved, setSaved] = useState(false)

  function submit() {
    const today = localDateKey()
    const proteinValue = protein ?? 'okay'
    const enoughValue = ateEnough ?? 'unsure'
    const hydrationValue = hydration ?? 'okay'
    trainingStore.saveNutritionCheckin({
      id: `nutrition-${today}`,
      date: today,
      bodyweightLb: bw ? Number(bw) : undefined,
      protein: proteinValue === 'good' ? 'high' : proteinValue === 'okay' ? 'adequate' : 'low',
      meals: enoughValue === 'yes' ? 4 : enoughValue === 'unsure' ? 3 : 2,
      hunger: enoughValue === 'yes' ? 3 : enoughValue === 'unsure' ? 2 : 1,
      energy: 3,
      hydration: hydrationValue === 'good' ? 5 : hydrationValue === 'okay' ? 3 : 1,
      notes: note.trim() || undefined,
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Daily check-in — the default, low-effort experience */}
      <section className="rounded-xl border border-border bg-card p-4">
        <h2 className="text-sm font-medium">Today&apos;s check-in</h2>
        <p className="mb-4 text-xs text-muted-foreground">
          Three taps. No calorie or macro logging required.
        </p>
        <div className="flex flex-col gap-4">
          <ChoiceRow
            label="Protein today"
            options={PROTEIN_OPTS}
            value={protein}
            onChange={setProtein}
          />
          <ChoiceRow
            label="Ate enough"
            options={ENOUGH_OPTS}
            value={ateEnough}
            onChange={setAteEnough}
          />
          <ChoiceRow
            label="Hydration"
            options={HYDRATION_OPTS}
            value={hydration}
            onChange={setHydration}
          />
          <Button onClick={submit} className="sm:w-fit">
            {saved ? (
              <>
                <Check className="size-4" /> Saved
              </>
            ) : (
              'Save check-in'
            )}
          </Button>
        </div>
      </section>

      {/* Recommendations */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Practical recommendations
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {FUELING.map((f) => (
            <div key={f.title} className="rounded-xl border border-border bg-card p-4">
              <f.icon className="size-4 text-primary" />
              <p className="mt-2 text-sm font-medium">{f.title}</p>
              <p className="mt-0.5 text-xs text-muted-foreground text-pretty">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Optional extras tucked away */}
      <Accordion className="rounded-xl border border-border bg-card px-4">
        <AccordionItem value="meals" className="border-b-0">
          <AccordionTrigger className="text-sm">Simple meal ideas</AccordionTrigger>
          <AccordionContent>
            <ul className="flex flex-col gap-1.5 pb-2">
              {MEAL_IDEAS.map((m) => (
                <li key={m} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="size-1.5 shrink-0 rounded-full bg-primary" />
                  {m}
                </li>
              ))}
            </ul>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <Accordion className="rounded-xl border border-border bg-card px-4">
        <AccordionItem value="bw" className="border-b-0">
          <AccordionTrigger className="text-sm">
            Optional bodyweight &amp; note
          </AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-col gap-3 pb-2">
              <Input
                type="number"
                inputMode="decimal"
                placeholder={`Bodyweight (lb) — last ${profile.bodyweightLb}`}
                value={bw}
                onChange={(e) => setBw(e.target.value)}
              />
              <Textarea
                placeholder="Anything notable about appetite, energy, or fueling."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
              />
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}

function ChoiceRow({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: Choice3[]
  value: string | null
  onChange: (v: string) => void
}) {
  return (
    <div>
      <p className="mb-1.5 text-sm font-medium">{label}</p>
      <div className="grid grid-cols-3 gap-2">
        {options.map((o) => (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            className={cn(
              'rounded-lg border py-2.5 text-sm font-medium transition-colors',
              value === o.value
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border text-muted-foreground hover:text-foreground',
            )}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  )
}
