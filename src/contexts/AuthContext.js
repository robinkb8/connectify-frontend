// src/contexts/AuthContext.js - SURGICAL FIX: Fresh Profile Data Sync

import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, profileAPI, paymentsAPI } from '../utils/api';

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
  const [subscriptionConfig, setSubscriptionConfig] = useState(null);

  // ✅ SURGICAL FIX: Fresh profile data fetcher (CORRECTED)
  const refreshUserProfile = async (userId) => {
    try {
      console.log('🔄 Fetching fresh profile data for sidebar...');
      const profileResponse = await profileAPI.getCurrentUserProfile();
      
      console.log('📡 Profile API response:', profileResponse);
      
      if (profileResponse.success && profileResponse.user) {
        console.log('✅ Fresh profile data received, updating AuthContext');
        console.log('📊 Fresh stats:', {
          posts: profileResponse.user.profile?.posts_count,
          followers: profileResponse.user.profile?.followers_count,
          following: profileResponse.user.profile?.following_count
        });
        
        setUser(prevUser => {
          console.log('🔄 BEFORE refresh:', prevUser?.profile?.posts_count);
          
          const updatedUser = {
            ...prevUser,
            profile: {
              ...prevUser?.profile,
              ...profileResponse.user.profile,
              // Ensure we update the key statistics
              posts_count: profileResponse.user.profile?.posts_count || 0,
              followers_count: profileResponse.user.profile?.followers_count || 0,
              following_count: profileResponse.user.profile?.following_count || 0
            }
          };
          
          console.log('✅ AFTER refresh:', updatedUser.profile.posts_count);
          return updatedUser;
        });
      } else {
        console.log('❌ Profile API failed:', profileResponse.message);
      }
    } catch (error) {
      console.error('Background profile refresh failed:', error);
      // Don't throw - this is background operation
    }
  };

  // ✅ ENHANCED: Parallel initialization with background profile refresh
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        if (authAPI.isAuthenticated()) {
          // 🎯 SURGICAL CHANGE: Execute user auth and background tasks in parallel
          const [userResponse] = await Promise.allSettled([
            authAPI.getCurrentUser(),
          ]);
          
          if (userResponse.status === 'fulfilled' && userResponse.value.success) {
            // Django returns response.user, not response.data.user
            setUser(userResponse.value.user);
            setIsAuthenticated(true);
            
            // 🎯 SURGICAL FIX: Start background operations (non-blocking)
            Promise.allSettled([
              loadSubscriptionConfig(),
              refreshUserProfile(userResponse.value.user.id) // ← NEW: Fresh profile data
            ]).catch(error => {
              console.error('Background operations failed:', error);
            });
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

  // ✅ PRESERVED - Load subscription configuration
  const loadSubscriptionConfig = async () => {
    try {
      const response = await paymentsAPI.getSubscriptionConfig();
      if (response.success) {
        setSubscriptionConfig(response.config);
      }
    } catch (error) {
      console.error('Failed to load subscription config:', error);
    }
  };

  // ✅ SURGICAL FIX: Enhanced login method with background profile refresh
  const login = async (email, password) => {
    try {
      setIsLoading(true);
      const response = await authAPI.login(email, password);
      
      if (response.success) {
        // Django returns response.user, not response.data.user
        setUser(response.user);
        setIsAuthenticated(true);
        
        // 🎯 SURGICAL FIX: Start background operations (non-blocking)
        Promise.allSettled([
          loadSubscriptionConfig(),
          refreshUserProfile(response.user.id) // ← NEW: Fresh profile data after login
        ]).catch(error => {
          console.error('Background operations failed:', error);
        });
        
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

  // ✅ PRESERVED - Register method with background profile refresh
  const register = async (userData) => {
    try {
      setIsLoading(true);
      const response = await authAPI.register(userData);
      
      if (response.success) {
        // Django returns response.user, not response.data.user
        setUser(response.user);
        setIsAuthenticated(true);
        
        // Background operations after successful registration
        Promise.allSettled([
          loadSubscriptionConfig(),
          refreshUserProfile(response.user.id) // Fresh profile data after registration
        ]).catch(error => {
          console.error('Background operations failed:', error);
        });
        
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
      setSubscriptionConfig(null);
    }
  };

  // ✅ ENHANCED - Update user method with profile merge
  const updateUser = (userData) => {
    setUser(prevUser => {
      // Smart merge to preserve profile data structure
      if (userData.profile && prevUser?.profile) {
        return {
          ...prevUser,
          ...userData,
          profile: {
            ...prevUser.profile,
            ...userData.profile
          }
        };
      }
      return { ...prevUser, ...userData };
    });
  };

  // ✅ ENHANCED - Refresh user data with profile support and sidebar sync
  const refreshUserData = async () => {
    try {
      const response = await authAPI.getCurrentUser();
      if (response.success) {
        // Django returns response.user, not response.data.user
        setUser(response.user);
        
        // 🎯 SURGICAL FIX: Also fetch fresh profile data for sidebar
        refreshUserProfile(response.user.id).catch(console.error);
        
        return { success: true, user: response.user };
      }
      return { success: false, message: 'Failed to refresh user data' };
    } catch (error) {
      console.error('Failed to refresh user data:', error);
      return { success: false, message: 'Failed to refresh user data' };
    }
  };

  // ✅ PRESERVED - Profile management methods
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

  // ✅ PRESERVED - Avatar upload method
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

  // ✅ PRESERVED - Get user profile by username
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

  // ✅ PRESERVED - Payment and subscription methods
  const createPaymentOrder = async (amount) => {
    try {
      const response = await paymentsAPI.createOrder(amount);
      return response;
    } catch (error) {
      console.error('Create payment order error:', error);
      return { 
        success: false, 
        message: 'Failed to create payment order. Please try again.' 
      };
    }
  };

  const verifyPayment = async (paymentData) => {
    try {
      const response = await paymentsAPI.verifyPayment(paymentData);
      
      if (response.success) {
        // Refresh user data to get updated pro status
        await refreshUserData();
      }
      
      return response;
    } catch (error) {
      console.error('Verify payment error:', error);
      return { 
        success: false, 
        message: 'Payment verification failed. Please try again.' 
      };
    }
  };

  const getSubscriptionStatus = async () => {
    try {
      const response = await paymentsAPI.getSubscriptionStatus();
      return response;
    } catch (error) {
      console.error('Get subscription status error:', error);
      return { 
        success: false, 
        message: 'Failed to get subscription status' 
      };
    }
  };

  const getPaymentHistory = async (limit = 10) => {
    try {
      const response = await paymentsAPI.getPaymentHistory(limit);
      return response;
    } catch (error) {
      console.error('Get payment history error:', error);
      return { 
        success: false, 
        message: 'Failed to get payment history' 
      };
    }
  };

  const cancelSubscription = async () => {
    try {
      const response = await paymentsAPI.cancelSubscription();
      
      if (response.success) {
        // Refresh user data to get updated pro status
        await refreshUserData();
      }
      
      return response;
    } catch (error) {
      console.error('Cancel subscription error:', error);
      return { 
        success: false, 
        message: 'Failed to cancel subscription. Please try again.' 
      };
    }
  };

  // ✅ PRESERVED - Helper methods for payment flow
  const upgradeToPro = async () => {
    try {
      if (!subscriptionConfig) {
        await loadSubscriptionConfig();
      }
      
      if (!subscriptionConfig) {
        return { 
          success: false, 
          message: 'Subscription configuration not available' 
        };
      }
      
      // Create payment order for pro subscription
      const orderResponse = await createPaymentOrder(subscriptionConfig.amount_paise);
      
      if (orderResponse.success) {
        return {
          success: true,
          order: orderResponse.order,
          keyId: orderResponse.key_id,
          config: subscriptionConfig
        };
      } else {
        return orderResponse;
      }
    } catch (error) {
      console.error('Upgrade to pro error:', error);
      return { 
        success: false, 
        message: 'Failed to initiate upgrade process' 
      };
    }
  };

  // ✅ PRESERVED - Check if user is eligible for upgrade
  const isEligibleForUpgrade = () => {
    return user && !user.is_pro;
  };

  // ✅ PRESERVED - Get pro status display
  const getProStatusDisplay = () => {
    return user?.pro_status_display || 'Free User';
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
    
    // ✅ PRESERVED - Subscription state
    subscriptionConfig,
    
    // ✅ PRESERVED - Core authentication methods
    login,
    register,
    logout,
    updateUser,
    refreshUserData,
    
    // ✅ PRESERVED - Profile management methods
    updateProfile,
    uploadAvatar,
    getUserProfile,
    
    // ✅ NEW - Profile refresh helper (for manual calls)
    refreshUserProfile,
    
    // ✅ PRESERVED - Payment and subscription methods
    createPaymentOrder,
    verifyPayment,
    getSubscriptionStatus,
    getPaymentHistory,
    cancelSubscription,
    upgradeToPro,
    
    // ✅ PRESERVED - Helper methods for payments
    isEligibleForUpgrade,
    getProStatusDisplay,
    loadSubscriptionConfig,
    
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