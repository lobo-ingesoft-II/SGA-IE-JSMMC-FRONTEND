// src/context/authContext.tsx
import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

//
// Tipo de usuario que guardaremos en el contexto y en localStorage.
// name = nombre completo / identificador visible.
// role = 'admin' | 'profesor' | 'acudiente' | ...
//
export type User = {
  name: string;
  role: 'admin' | 'profesor' | 'acudiente' | string;
};

type AuthContextType = {
  isAuthenticated: boolean;
  user: User | null;
  login: (token: string, userData: User) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  // 1) Estado para el token: determinamos si hay token en localStorage
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return !!localStorage.getItem('token');
  });

  // 2) Estado para el objeto `user`. Lo cargamos de localStorage (si existe).
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      try {
        return JSON.parse(stored) as User;
      } catch {
        return null;
      }
    }
    return null;
  });

  // 3) Sincronizar en caso de que otra pestaña modifique localStorage
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'token') {
        const hasToken = !!localStorage.getItem('token');
        setIsAuthenticated(hasToken);
      }
      if (e.key === 'user') {
        const u = localStorage.getItem('user');
        setUser(u ? (JSON.parse(u) as User) : null);
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  /**
   * login: guarda token y userData en localStorage,
   * actualiza los estados isAuthenticated y user.
   */
  const login = (token: string, userData: User) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setIsAuthenticated(true);
    setUser(userData);
  };

  /**
   * logout: elimina token y user de localStorage, reinicia estados.
   */
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return context;
}
