'use client';
// context/AuthContext.js

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [employeeProfile, setEmployeeProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('hrm_token');
    const savedUser = localStorage.getItem('hrm_user');
    const savedProfile = localStorage.getItem('hrm_employee_profile');
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
        if (savedProfile) setEmployeeProfile(JSON.parse(savedProfile));
      } catch {
        localStorage.removeItem('hrm_token');
        localStorage.removeItem('hrm_user');
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await authApi.login(email, password);
    localStorage.setItem('hrm_token', data.token);
    localStorage.setItem('hrm_user', JSON.stringify(data.user));
    if (data.employeeProfile) {
      localStorage.setItem('hrm_employee_profile', JSON.stringify(data.employeeProfile));
      setEmployeeProfile(data.employeeProfile);
    }
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    try { await authApi.logout(); } catch { /* stateless */ }
    localStorage.removeItem('hrm_token');
    localStorage.removeItem('hrm_user');
    localStorage.removeItem('hrm_employee_profile');
    setUser(null);
    setEmployeeProfile(null);
    router.replace('/login');
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, employeeProfile, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
};
