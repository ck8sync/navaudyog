'use client'

import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react'
import { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { ROLE_PATHS } from '@/lib/constants'
import { useRouter } from 'next/navigation'

interface Profile {
  id: string
  role: 'employee' | 'employer' | 'admin'
  full_name: string
  phone: string
}

interface AuthContextType {
  user: User | null
  profile: Profile | null
  loading: boolean
  signOut: () => Promise<void>
  dashboardPath: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const supabase = useMemo(() => createClient(), [])

  const loadUserProfile = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Error fetching profile:', {
        message: error.message,
        code: error.code,
        details: error.details,
      })
      if (error.code === 'PGRST205') {
        console.error("Supabase PostgREST error PGRST205: 'public.profiles' table not found. Run the SQL migration to create the table.")
      }
      setProfile(null)
      return null
    }

    setProfile(data)
    return data as Profile
  }, [supabase])

  useEffect(() => {
    // Get initial session
    let isMounted = true
    let profileRequest = 0

    const getSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (!isMounted) return
      if (error) console.error('Error restoring auth session:', error.message)

      setUser(session?.user ?? null)
      setLoading(false)
      if (session?.user) {
        const request = ++profileRequest
        void loadUserProfile(session.user.id).then((profile) => {
          if (isMounted && request === profileRequest) setProfile(profile)
        })
      }
    }

    void getSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        const request = ++profileRequest
        setUser(session?.user ?? null)
        if (session?.user) {
          setLoading(true)
          void loadUserProfile(session.user.id).then((profile) => {
            if (isMounted && request === profileRequest) {
              setProfile(profile)
              setLoading(false)
            }
          })
        } else {
          setProfile(null)
          setLoading(false)
        }
      }
    )

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [supabase, loadUserProfile])

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('Error signing out:', error.message)
      throw error
    }
    setUser(null)
    setProfile(null)
    router.replace('/')
    router.refresh()
  }

  const dashboardPath = profile ? ROLE_PATHS[profile.role] : null

  return (
    <AuthContext.Provider value={{ user, profile, loading, signOut, dashboardPath }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
