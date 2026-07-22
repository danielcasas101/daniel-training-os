'use client'

import { createContext, useCallback, useContext, useState } from 'react'
import { ExerciseDetailSheet } from './exercise-detail-sheet'

interface DetailContextValue {
  show: (name: string) => void
}

const DetailContext = createContext<DetailContextValue | null>(null)

export function ExerciseDetailProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [name, setName] = useState<string | null>(null)
  const [open, setOpen] = useState(false)

  const show = useCallback((n: string) => {
    setName(n)
    setOpen(true)
  }, [])

  return (
    <DetailContext.Provider value={{ show }}>
      {children}
      <ExerciseDetailSheet name={name} open={open} onOpenChange={setOpen} />
    </DetailContext.Provider>
  )
}

export function useExerciseDetail() {
  const ctx = useContext(DetailContext)
  if (!ctx) {
    return { show: () => {} }
  }
  return ctx
}
