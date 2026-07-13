import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { fetchProfile } from '../lib/db'
import AdminLogin from './AdminLogin'
import AdminDashboard from './AdminDashboard'

export default function AdminApp() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [accessDenied, setAccessDenied] = useState(false)

  const checkAdmin = async (currentSession: Session | null) => {
    if (!currentSession) {
      setIsAdmin(false)
      setLoading(false)
      return
    }
    setAccessDenied(false)
    try {
      const profile = await fetchProfile()
      if (profile?.role === 'admin') {
        setIsAdmin(true)
      } else {
        // A real customer account (or a session with no admin profile row)
        // must never see the dashboard -- being logged in isn't enough.
        setIsAdmin(false)
        setAccessDenied(true)
        await supabase.auth.signOut()
      }
    } catch {
      setIsAdmin(false)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => checkAdmin(data.session))
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, newSession) => {
      checkAdmin(newSession)
    })
    return () => subscription.subscription.unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-navy-900 flex items-center justify-center text-navy-300">
        در حال بارگذاری...
      </div>
    )
  }

  return isAdmin ? (
    <AdminDashboard onLogout={() => supabase.auth.signOut()} />
  ) : (
    <AdminLogin accessDenied={accessDenied} />
  )
}
