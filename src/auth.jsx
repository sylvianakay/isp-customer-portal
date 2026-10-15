import { createContext, useContext, useMemo, useState } from 'react';
import * as api from './data/mockApi.js';

const AuthContext = createContext(null);

function readSession() {
  try {
    const raw = sessionStorage.getItem('session');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(readSession);

  const value = useMemo(
    () => ({
      session,
      async signIn(contract, password) {
        const next = await api.signIn(contract, password);
        try { sessionStorage.setItem('session', JSON.stringify(next)); } catch { /* storage unavailable */ }
        setSession(next);
      },
      signOut() {
        try { sessionStorage.removeItem('session'); } catch { /* storage unavailable */ }
        setSession(null);
      },
    }),
    [session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
