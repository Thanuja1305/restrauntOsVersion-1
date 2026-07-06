import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User as UserType } from '../types';
import { useLoadingStore } from '../store/useLoadingStore';

interface AuthContextType {
  user: UserType | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, user: UserType) => void;
  logout: () => void;
  updateUser: (user: UserType) => void;
  setUser: (user: UserType | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(localStorage.getItem('restaurant_os_token'));
  const [user, setUser] = useState<UserType | null>(null);
  
  const { setAuthChecking, setGlobalLoading } = useLoadingStore();

  const login = (newToken: string, newUser: UserType) => {
    localStorage.setItem('restaurant_os_token', newToken);
    setTokenState(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('restaurant_os_token');
    setTokenState(null);
    setUser(null);
  };

  const updateUser = (updatedUser: UserType) => {
    setUser(updatedUser);
  };

  // Verification process on mount
  useEffect(() => {
    const verifySession = async () => {
      const storedToken = localStorage.getItem('restaurant_os_token');
      if (!storedToken) {
        setTokenState(null);
        setUser(null);
        setAuthChecking(false);
        setGlobalLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/auth/me', {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${storedToken}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          setTokenState(storedToken);
        } else {
          // Token invalid or expired
          localStorage.removeItem('restaurant_os_token');
          setTokenState(null);
          setUser(null);
        }
      } catch (err) {
        console.error('Session validation error:', err);
      } finally {
        setAuthChecking(false);
        setGlobalLoading(false);
      }
    };

    verifySession();
  }, [setAuthChecking, setGlobalLoading]);

  const isAuthenticated = !!token && !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        login,
        logout,
        updateUser,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
