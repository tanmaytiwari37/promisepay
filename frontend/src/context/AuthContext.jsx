import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import apiClient from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch user profile from /auth/me
  const loadUser = useCallback(async () => {
    try {
      const data = await apiClient('/auth/me');
      setUser(data);
    } catch {
      localStorage.removeItem('token');
      setUser(null);
    }
  }, []);

  // On mount, restore session if token exists
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      loadUser().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [loadUser]);

  const login = async (email, password) => {
    const data = await apiClient('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    // API returns { access_token, token_type } — store token, then fetch user
    localStorage.setItem('token', data.access_token);
    await loadUser();
    return data;
  };

  const register = async (name, email, password, role) => {
    await apiClient('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name, role }),
    });
    // Auto-login after registration
    return login(email, password);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
