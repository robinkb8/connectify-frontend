// src/contexts/AuthContext.js - Fixed to match Django response structure

import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initialize authentication state on app load
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        if (authAPI.isAuthenticated()) {
          // Try to get current user info with stored token
          const response = await authAPI.getCurrentUser();
          
          if (response.success) {
            // Django returns response.user, not response.data.user
            setUser(response.user);
            setIsAuthenticated(true);
          } else {
            // Token invalid, clear it
            authAPI.clearTokens();
            setUser(null);
            setIsAuthenticated(false);
          }
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        authAPI.clearTokens();
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    try {
      setIsLoading(true);
      const response = await authAPI.login(email, password);
      
      if (response.success) {
        // Django returns response.user, not response.data.user
        setUser(response.user);
        setIsAuthenticated(true);
        return { success: true, message: response.message };
      } else {
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Login failed. Please try again.' };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setIsLoading(true);
      const response = await authAPI.register(userData);
      
      if (response.success) {
        // Django returns response.user, not response.data.user
        setUser(response.user);
        setIsAuthenticated(true);
        return { success: true, message: response.message };
      } else {
        // Django returns response.errors, not response.data.errors
        return { success: false, message: response.message, errors: response.errors };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, message: 'Registration failed. Please try again.' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const updateUser = (userData) => {
    setUser(prevUser => ({ ...prevUser, ...userData }));
  };

  const refreshUserData = async () => {
    try {
      const response = await authAPI.getCurrentUser();
      if (response.success) {
        // Django returns response.user, not response.data.user
        setUser(response.user);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to refresh user data:', error);
      return false;
    }
  };

  // All existing helper methods with proper error handling
  const checkEmailAvailability = async (email) => {
    try {
      const response = await authAPI.checkEmailAvailability(email);
      return response;
    } catch (error) {
      console.error('Email check error:', error);
      return { success: false, message: 'Failed to check email availability' };
    }
  };

  const checkUsernameAvailability = async (username) => {
    try {
      const response = await authAPI.checkUsernameAvailability(username);
      return response;
    } catch (error) {
      console.error('Username check error:', error);
      return { success: false, message: 'Failed to check username availability' };
    }
  };

  const sendOTP = async (email) => {
    try {
      const response = await authAPI.sendOTP(email);
      return response;
    } catch (error) {
      console.error('Send OTP error:', error);
      return { success: false, message: 'Failed to send OTP' };
    }
  };

  const verifyOTP = async (email, otpCode) => {
    try {
      const response = await authAPI.verifyOTP(email, otpCode);
      return response;
    } catch (error) {
      console.error('Verify OTP error:', error);
      return { success: false, message: 'Failed to verify OTP' };
    }
  };

  // Complete value object with all methods
  const value = {
    // State
    user,
    isLoading,
    isAuthenticated,
    
    // Core authentication methods
    login,
    register,
    logout,
    updateUser,
    refreshUserData,
    
    // Helper methods for forms
    checkEmailAvailability,
    checkUsernameAvailability,
    sendOTP,
    verifyOTP,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;