'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../lib/api';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        api.setToken(token);
        const data = await api.getMe();
        if (data.success !== false && data.user) {
          setUser(data.user);
        } else {
          // Token is invalid or expired
          api.clearToken();
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      api.clearToken();
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    const data = await api.login(credentials);
    if (data.success === false || data.error) {
      throw new Error(data.error || 'Login failed');
    }
    setUser(data.user);
    return data;
  };

  const register = async (userData) => {
    const data = await api.register(userData);
    if (data.success === false || data.error) {
      throw new Error(data.error || 'Registration failed');
    }
    setUser(data.user);
    return data;
  };

  const logout = async () => {
    await api.logout();
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const data = await api.getMe();
      if (data.success !== false && data.user) {
        setUser(data.user);
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

