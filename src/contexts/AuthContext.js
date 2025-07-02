// src/contexts/AuthContext.js - ENHANCED WITH PROFILE MANAGEMENT + ALL EXISTING PRESERVED

import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, profileAPI } from '../utils/api';

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

  // ✅ PRESERVED - Initialize authentication state on app load
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

  // ✅ PRESERVED - Login method
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

  // ✅ PRESERVED - Register method
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

  // ✅ PRESERVED - Logout method
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

  // ✅ PRESERVED - Update user method
  const updateUser = (userData) => {
    setUser(prevUser => ({ ...prevUser, ...userData }));
  };

  // ✅ ENHANCED - Refresh user data with profile support
  const refreshUserData = async () => {
    try {
      const response = await authAPI.getCurrentUser();
      if (response.success) {
        // Django returns response.user, not response.data.user
        setUser(response.user);
        return { success: true, user: response.user };
      }
      return { success: false, message: 'Failed to refresh user data' };
    } catch (error) {
      console.error('Failed to refresh user data:', error);
      return { success: false, message: 'Failed to refresh user data' };
    }
  };

  // ✅ NEW - Profile management methods
  const updateProfile = async (profileData) => {
    try {
      const response = await profileAPI.updateUserProfile(profileData);
      
      if (response.success) {
        // Update local user state with new profile data
        setUser(prevUser => ({
          ...prevUser,
          ...response.user
        }));
        
        return { 
          success: true, 
          user: response.user,
          message: response.message 
        };
      } else {
        return { 
          success: false, 
          message: response.message,
          errors: response.errors 
        };
      }
    } catch (error) {
      console.error('Profile update error:', error);
      return { 
        success: false, 
        message: 'Failed to update profile. Please try again.' 
      };
    }
  };

  // ✅ NEW - Avatar upload method
  const uploadAvatar = async (avatarFile) => {
    try {
      const response = await profileAPI.uploadAvatar(avatarFile);
      
      if (response.success) {
        // Update local user state with new avatar
        setUser(prevUser => ({
          ...prevUser,
          profile: {
            ...prevUser.profile,
            avatar: response.avatar_url
          }
        }));
        
        return { 
          success: true, 
          avatar_url: response.avatar_url,
          message: response.message 
        };
      } else {
        return { 
          success: false, 
          message: response.message 
        };
      }
    } catch (error) {
      console.error('Avatar upload error:', error);
      return { 
        success: false, 
        message: 'Failed to upload avatar. Please try again.' 
      };
    }
  };

  // ✅ NEW - Get user profile by username
  const getUserProfile = async (username) => {
    try {
      const response = await profileAPI.getUserProfile(username);
      return response;
    } catch (error) {
      console.error('Get user profile error:', error);
      return { 
        success: false, 
        message: 'Failed to fetch user profile' 
      };
    }
  };

  // ✅ PRESERVED - All existing helper methods with proper error handling
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

  // ✅ ENHANCED - Complete value object with all methods (existing + new)
  const value = {
    // ✅ PRESERVED - State
    user,
    isLoading,
    isAuthenticated,
    
    // ✅ PRESERVED - Core authentication methods
    login,
    register,
    logout,
    updateUser,
    refreshUserData,
    
    // ✅ NEW - Profile management methods
    updateProfile,
    uploadAvatar,
    getUserProfile,
    
    // ✅ PRESERVED - Helper methods for forms
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