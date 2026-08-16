import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getAuthUser, logoutUser, redirectToOAuth, getProviderStatus } from '../api/authApi';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [providerStatus, setProviderStatus] = useState({
    google: false,
    github: false,
    facebook: false,
    linkedin: false,
  });

  // Verify authentication state on mount
  const checkAuth = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [authRes, providersRes] = await Promise.all([
        getAuthUser(),
        getProviderStatus(),
      ]);

      if (authRes.ok && authRes.data.authenticated && authRes.data.user) {
        setUser(authRes.data.user);
      } else {
        setUser(null);
      }

      if (providersRes.ok && providersRes.data) {
        setProviderStatus(providersRes.data);
      }
    } catch (err) {
      console.error('Failed to check authentication status:', err);
      setUser(null);
      setError('Unable to verify login session');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Initiate OAuth flow for a provider
  const login = (provider) => {
    setError(null);
    redirectToOAuth(provider);
  };

  // Log out current session
  const logout = async () => {
    setIsLoading(true);
    try {
      await logoutUser();
      setUser(null);
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    isAuthenticated: Boolean(user),
    isLoading,
    error,
    setError,
    providerStatus,
    login,
    logout,
    refreshUser: checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
