import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state from localStorage token
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('dh_token');
      if (token) {
        try {
          const res = await api.auth.getMe();
          setUser(res.user);
        } catch (err) {
          console.error('Session expired or invalid:', err);
          localStorage.removeItem('dh_token');
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const data = await api.auth.login({ email, password });
    localStorage.setItem('dh_token', data.token);
    setUser(data.user);
    return data.user;
  };

  const register = async (formData) => {
    const data = await api.auth.register(formData);
    localStorage.setItem('dh_token', data.token);
    setUser(data.user);
    return data.user;
  };

  const socialLogin = async (socialData) => {
    const data = await api.auth.socialLogin(socialData);
    localStorage.setItem('dh_token', data.token);
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('dh_token');
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const res = await api.auth.getMe();
      setUser(res.user);
      return res.user;
    } catch (err) {
      console.error('Failed to refresh user:', err);
    }
  };

  const updateProfile = async (formData) => {
    const res = await api.auth.updateProfile(formData);
    setUser(res.user);
    return res.user;
  };

  const updateSubscription = async (action, plan) => {
    const res = await api.auth.updateSubscription({ action, plan });
    setUser(res.user);
    return res.user;
  };

  const value = {
    user,
    loading,
    login,
    register,
    socialLogin,
    logout,
    refreshUser,
    updateProfile,
    updateSubscription,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isActiveSubscriber: user?.subscription_status === 'active'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
