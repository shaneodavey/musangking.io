// src/lib/AuthContext.jsx
import React, { createContext, useContext } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const value = {
    user: null,
    isAuthenticated: true,
    isLoadingAuth: false,
    isLoadingPublicSettings: false,
    authError: null,
    appPublicSettings: null,
    navigateToLogin: () => {},
    refreshAuth: () => {},
    logout: () => {},
    checkAppState: () => {},
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
};
