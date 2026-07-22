'use client'

import { useEffect, useState } from 'react'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'

export function AuthCallbackClient() {
  const [message, setMessage] = useState('Completing your secure sign-in…')

  useEffect(() => {
    let cancelled = false

    async function completeSignIn() {
      const client = getSupabaseBrowserClient()
      if (!client) {
        setMessage('Supabase is not configured for this deployment.')
        return
      }

      const code = new URLSearchParams(window.location.search).get('code')
      if (code) {
        const { error } = await client.auth.exchangeCodeForSession(code)
        if (error) {
          if (!cancelled) setMessage(`Sign-in failed: ${error.message}`)
          return
        }
      } else {
        // Hash-token links are processed automatically by the browser client.
        // Confirm that processing produced a usable session before continuing.
        const { data, error } = await client.auth.getSession()
        if (error || !data.session) {
          if (!cancelled) {
            setMessage(
              'The sign-in link is incomplete or expired. Return to Sign in and request a new link.',
            )
          }
          return
        }
      }

      if (!cancelled) window.location.replace('/')
    }

    void completeSignIn()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <main className="mx-auto flex min-h-[60vh] max-w-lg items-center justify-center px-4">
      <div className="w-full rounded-xl border border-border bg-card p-6 text-center">
        <h1 className="text-xl font-semibold">Signing you in</h1>
        <p className="mt-2 text-sm text-muted-foreground">{message}</p>
        {message.startsWith('Sign-in failed') || message.includes('expired') ? (
          <a className="mt-4 inline-block text-sm font-medium underline" href="/login">
            Return to sign in
          </a>
        ) : null}
      </div>
    </main>
  )
}
