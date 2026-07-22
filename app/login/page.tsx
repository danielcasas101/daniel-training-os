import { PageHeader } from '@/components/shell/app-shell'
import { LoginClient } from '@/components/auth/login-client'
import { hasSupabaseConfig } from '@/lib/supabase/config'

export default function LoginPage() {
  return (
    <>
      <PageHeader
        title="Sign in"
        description="Protect your training history and sync it across devices."
      />
      <LoginClient configured={hasSupabaseConfig()} />
    </>
  )
}
