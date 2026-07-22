'use client'

import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { Check, LogOut, Mail } from 'lucide-react'

export function LoginClient({ configured }: { configured: boolean }) {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const client = getSupabaseBrowserClient()
    if (!client) return

    void client.auth.getUser().then(({ data }) => setUser(data.user))
    const { data } = client.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => data.subscription.unsubscribe()
  }, [])

  async function signIn() {
    const client = getSupabaseBrowserClient()
    if (!client || !email.trim()) return
    setBusy(true)
    const { error } = await client.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    })
    setMessage(error ? error.message : 'Check your email for the secure sign-in link.')
    setBusy(false)
  }

  async function signOut() {
    const client = getSupabaseBrowserClient()
    if (!client) return
    await client.auth.signOut()
    setUser(null)
    setMessage('Signed out. Local data remains on this device.')
  }

  if (!configured) {
    return (
      <div className="max-w-lg rounded-xl border border-sunny/30 bg-sunny-soft p-4 text-sm">
        Supabase is not connected yet. Local tracking works now; secure account sync will activate
        after the deployment variables are configured.
      </div>
    )
  }

  return (
    <div className="max-w-lg rounded-xl border border-border bg-card p-4">
      {user ? (
        <div className="rounded-lg border border-mint/30 bg-mint/10 p-3">
          <p className="text-sm font-medium">Signed in</p>
          <p className="mt-1 text-xs text-muted-foreground">{user.email}</p>
        </div>
      ) : (
        <>
          <label htmlFor="email" className="text-sm font-medium">Email</label>
          <div className="mt-2 flex gap-2">
            <Input
              id="email"
              type="email"
              value={email}
              placeholder="you@example.com"
              onChange={(event) => setEmail(event.target.value)}
            />
            <Button onClick={signIn} disabled={busy || !email.trim()}>
              <Mail className="size-4" />
              {busy ? 'Sending…' : 'Email link'}
            </Button>
          </div>
          {message && (
            <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
              <Check className="size-4 text-mint" /> {message}
            </p>
          )}
        </>
      )}
      {user ? (
        <Button variant="ghost" className="mt-4" onClick={signOut}>
          <LogOut className="size-4" /> Sign out
        </Button>
      ) : null}
    </div>
  )
}
