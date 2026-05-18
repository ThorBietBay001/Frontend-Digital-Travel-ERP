import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';

export interface User {
  hoTen: string;
  maVaiTro: string;
  tenHienThi: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
}

interface AuthContextType extends AuthState {
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const getRoleFromToken = (decoded: any): string => {
  if (decoded.maVaiTro) return decoded.maVaiTro;
  if (decoded.role) return decoded.role;
  if (Array.isArray(decoded.roles) && decoded.roles.length > 0) {
    return decoded.roles[0];
  }
  return '';
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    token: null,
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode<any>(token);
        const user: User = {
          hoTen: decoded.hoTen || decoded.name || 'User',
          maVaiTro: getRoleFromToken(decoded),
          tenHienThi: decoded.tenHienThi || decoded.sub || 'User',
        };
        setAuthState({
          isAuthenticated: true,
          user,
          token,
        });
      } catch (error) {
        console.error('Invalid token', error);
        localStorage.removeItem('token');
      }
    }
  }, []);

  const login = (token: string, user: User) => {
    localStorage.setItem('token', token);
    setAuthState({
      isAuthenticated: true,
      user,
      token,
    });
  };

  const logout = () => {
    localStorage.removeItem('token');
    setAuthState({
      isAuthenticated: false,
      user: null,
      token: null,
    });
  };

  return (
    <AuthContext.Provider value={{ ...authState, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
