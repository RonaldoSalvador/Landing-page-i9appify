import { useState, useEffect, createContext, useContext } from 'react'
import { supabase } from '../lib/supabaseClient'

const AuthContext = createContext({})

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Check active sessions
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null)
            setLoading(false)
        })

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null)
            setLoading(false)
        })

        return () => subscription.unsubscribe()
    }, [])

    const signIn = async (email, password) => {
        // MAGIC BYPASS FOR ADMIN
        if (email === 'admin@admin.com' && password === 'admin123456') {
            const mockUser = {
                id: 'admin-bypass-001',
                email: 'admin@admin.com',
                user_metadata: { name: 'Admin Master' },
                aud: 'authenticated',
                role: 'authenticated'
            }
            setUser(mockUser)
            return { user: mockUser, session: { user: mockUser } }
        }

        // Standard Supabase Login
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        return data
    }

    const signOut = async () => {
        const { error } = await supabase.auth.signOut()
        if (error) throw error
        setUser(null)
    }

    return (
        <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)
