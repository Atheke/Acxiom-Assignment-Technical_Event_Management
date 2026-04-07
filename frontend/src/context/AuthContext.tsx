import { createContext } from 'react'

/**
 * Optional hook for global auth state. Routes currently use `ProtectedRoute` and
 * `/api/auth/me` directly; wrap the app with a provider here when you centralize session.
 */
export const AuthContext = createContext<unknown>(null)
