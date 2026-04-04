import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { userAPI } from '../lib/api';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('sahyog_token');
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const { data } = await userAPI.getProfile();
      if (data.success) {
        setUser({ ...data.data.user, stats: data.data.stats });
        setIsAuthenticated(true);
      }
    } catch {
      localStorage.removeItem('sahyog_token');
      localStorage.removeItem('sahyog_user');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = (token, userData) => {
    localStorage.setItem('sahyog_token', token);
    localStorage.setItem('sahyog_user', JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('sahyog_token');
    localStorage.removeItem('sahyog_user');
    signOut(auth).catch(() => {});
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateUser = (data) => {
    setUser((prev) => ({ ...prev, ...data }));
    localStorage.setItem('sahyog_user', JSON.stringify({ ...user, ...data }));
  };

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated, login, logout, updateUser, loadUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
