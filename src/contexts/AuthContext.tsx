import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSettings } from './SettingsContext';

type User = {
  id: number;
  email: string;
  name: string;
};

type AuthContextType = {
  user: User | null;
  login: (email: string, pass: string, silent?: boolean) => Promise<boolean>;
  signup: (email: string, name: string, pass: string) => Promise<boolean>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const { settings } = useSettings();

  useEffect(() => {
    // Check local storage for persistent naive session
    const stored = localStorage.getItem('viqa_user');
    if (stored) {
      setUser(JSON.parse(stored));
    }
  }, []);

  const login = async (email: string, pass: string, silent = false) => {
    try {
      const res = await fetch(`${settings.modelUri}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass })
      });
      if (!res.ok) return false;
      const data = await res.json();
      setUser(data.user);
      localStorage.setItem('viqa_user', JSON.stringify(data.user));
      
      if (!silent) {
        alert("Successfully logged in!");
      }
      
      return true;
    } catch (e) {
      return false;
    }
  };

  const signup = async (email: string, name: string, pass: string) => {
    try {
      const res = await fetch(`${settings.modelUri}/api/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, password: pass })
      });
      if (!res.ok) return false;
      
      const success = await login(email, pass, true);
      if (success) {
        alert("Account created successfully! Welcome to VIQA.");
      }
      return success;
    } catch (e) {
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('viqa_user');
    alert("Successfully logged out!");
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
