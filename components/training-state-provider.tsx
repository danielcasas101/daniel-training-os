'use client'

import { useEffect, useSyncExternalStore } from 'react'
import type { ReactNode } from 'react'
import { trainingStore } from '@/lib/training-store'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { loadTrainingState, saveTrainingState } from '@/lib/supabase/training-repository'

export function TrainingStateProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    trainingStore.initialize()

    const candidate = getSupabaseBrowserClient()
    if (!candidate) return
    const client = candidate
    let cancelled = false
    let unsubscribeStore: (() => void) | undefined
    let saveTimer: ReturnType<typeof setTimeout> | undefined
    let saveQueue = Promise.resolve()

    async function connectRemote() {
      const { data } = await client.auth.getUser()
      if (cancelled || !data.user) return
      const remote = await loadTrainingState(client, data.user.id)
      if (cancelled) return
      if (remote) trainingStore.replaceState(remote)
      else await saveTrainingState(client, data.user.id, trainingStore.getSnapshot())

      unsubscribeStore = trainingStore.subscribe(() => {
        if (saveTimer) clearTimeout(saveTimer)
        saveTimer = setTimeout(() => {
          saveQueue = saveQueue
            .then(() => saveTrainingState(client, data.user!.id, trainingStore.getSnapshot()))
            .catch(() => undefined)
        }, 600)
      })
    }

    void connectRemote().catch(() => undefined)
    const { data: authListener } = client.auth.onAuthStateChange(() => {
      unsubscribeStore?.()
      void connectRemote().catch(() => undefined)
    })

    return () => {
      cancelled = true
      if (saveTimer) clearTimeout(saveTimer)
      unsubscribeStore?.()
      authListener.subscription.unsubscribe()
    }
  }, [])
  return children
}

export function useTrainingState() {
  return useSyncExternalStore(
    trainingStore.subscribe,
    trainingStore.getSnapshot,
    trainingStore.getServerSnapshot,
  )
}
