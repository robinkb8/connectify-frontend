// src/components/forms/LoginForm/LoginForm.jsx
import React, { useState, useCallback, useEffect } from 'react';
import { useFormValidation } from '../../../hooks/useFormValidation';
import { FORM_STATES } from '../../../utils/constants/validation';
import Input from '../../ui/Input/Input';

// ✅ OPTIMIZED: Complete login form configuration (static data)
const LOGIN_FORM_CONFIG = {
  // Initial form values
  initialValues: {
    email: '',
    password: ''
  },
  
  // Mock data for demo purposes
  mockData: {
    googleUser: {
      email: 'user@gmail.com',
      name: 'John Doe',
      picture: 'https://example.com/photo.jpg',
      googleId: '1234567890'
    },
    
    // Simulated registered users database
    registeredEmails: [
      'user@gmail.com',
      'test@gmail.com', 
      'demo@gmail.com',
      'admin@gmail.com',
      'john@gmail.com'
    ]
  },
  
  // Timing configuration for various operations
  timing: {
    emailLoginDelay: 2000,
    successDisplayTime: 1500,
    googleAuthDelay: 2000,
    databaseCheckDelay: 1000,
    errorDisplayTime: 3000
  },
  
  // User interface messages
  messages: {
    // Success messages
    emailLoginSuccess: 'Email/Password login successful!',
    googleLoginSuccess: 'Google login successful! User was registered.',
    welcomeBack: 'Welcome back!',
    loginSuccessful: 'Login successful!',
    
    // Error messages
    accountNotFound: 'Account not found. Please register first using the Sign Up form.',
    invalidCredentials: 'Invalid email or password. Please try again.',
    loginFailed: 'Login failed. Please try again.',
    
    // Google Auth messages
    googleAuthStart: 'Initiating Google Sign-In...',
    googleAuthSuccess: 'Google OAuth successful:',
    databaseCheck: 'Checking user registration...',
    
    // Loading messages
    signingIn: 'Signing you in...',
    checkingAccount: 'Checking Account...',
    processing: 'Processing...',
    
    // UI messages
    forgotPassword: 'Forgot your password?',
    noAccount: "Don't have an account?",
    signUp: 'Sign Up',
    continueWithGoogle: 'Continue with Google',
    orDivider: 'or'
  }
};

// ✅ OPTIMIZED: Static utility functions (created once, reused forever)
const LOGIN_FORM_UTILS = {
  // Check if email is registered (mock function)
  isEmailRegistered: (email) => {
    return LOGIN_FORM_CONFIG.mockData.registeredEmails.includes(email?.toLowerCase());
  },
  
  // Simulate email/password login API call
  simulateEmailLogin: (credentials) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Mock validation - in real app, send to backend
        if (LOGIN_FORM_UTILS.isEmailRegistered(credentials.email) && credentials.password) {
          resolve({ 
            success: true, 
            message: LOGIN_FORM_CONFIG.messages.emailLoginSuccess,
            user: {
              email: credentials.email,
              name: 'Demo User'
            }
          });
        } else {
          reject({ 
            success: false, 
            message: LOGIN_FORM_CONFIG.messages.invalidCredentials 
          });
        }
      }, LOGIN_FORM_CONFIG.timing.emailLoginDelay);
    });
  },
  
  // Simulate Google OAuth API call
  simulateGoogleAuth: () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(LOGIN_FORM_CONFIG.mockData.googleUser);
      }, LOGIN_FORM_CONFIG.timing.googleAuthDelay);
    });
  },
  
  // Simulate database user lookup
  simulateDatabaseCheck: (email) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const isRegistered = LOGIN_FORM_UTILS.isEmailRegistered(email);
        resolve({ 
          isRegistered, 
          message: isRegistered 
            ? LOGIN_FORM_CONFIG.messages.googleLoginSuccess 
            : LOGIN_FORM_CONFIG.messages.accountNotFound 
        });
      }, LOGIN_FORM_CONFIG.timing.databaseCheckDelay);
    });
  },
  
  // Handle successful login completion
  handleLoginSuccess: (onClose, reset, setFormState, setGoogleAuthState, message) => {
    setTimeout(() => {
      onClose();
      setFormState(FORM_STATES.IDLE);
      if (setGoogleAuthState) setGoogleAuthState(FORM_STATES.IDLE);
      reset();
      console.log(message);
    }, LOGIN_FORM_CONFIG.timing.successDisplayTime);
  },
  
  // Handle login error
  handleLoginError: (setFormState, setGoogleAuthState, message) => {
    console.error(message);
    if (setFormState) setFormState(FORM_STATES.ERROR);
    if (setGoogleAuthState) setGoogleAuthState(FORM_STATES.ERROR);
    
    setTimeout(() => {
      if (setFormState) setFormState(FORM_STATES.IDLE);
      if (setGoogleAuthState) setGoogleAuthState(FORM_STATES.IDLE);
    }, LOGIN_FORM_CONFIG.timing.errorDisplayTime);
  }
};

const LoginForm = ({ isOpen, onClose, onSwitchToSignUp }) => {
  // ✅ OPTIMIZED: Using static configuration for state initialization
  const [formState, setFormState] = useState(FORM_STATES.IDLE);
  const [googleAuthState, setGoogleAuthState] = useState(FORM_STATES.IDLE);
  
  // ✅ OPTIMIZED: Using static configuration for form validation
  const { values, validation, touched, isValid, handleChange, handleBlur, reset } = 
    useFormValidation(LOGIN_FORM_CONFIG.initialValues);

  // ✅ OPTIMIZED: Email/password login using static utilities
  const handleSubmit = useCallback(async () => {
    if (!isValid) return;

    setFormState(FORM_STATES.SUBMITTING);

    try {
      const result = await LOGIN_FORM_UTILS.simulateEmailLogin(values);
      setFormState(FORM_STATES.SUCCESS);
      
      LOGIN_FORM_UTILS.handleLoginSuccess(
        onClose, 
        reset, 
        setFormState, 
        null, 
        result.message
      );
    } catch (error) {
      LOGIN_FORM_UTILS.handleLoginError(
        setFormState, 
        null, 
        error.message
      );
    }
  }, [isValid, values, onClose, reset]);

  // ✅ OPTIMIZED: Google Sign-In with registration check using static utilities
  const handleGoogleSignIn = useCallback(async () => {
    setGoogleAuthState(FORM_STATES.SUBMITTING);
    console.log(LOGIN_FORM_CONFIG.messages.googleAuthStart);

    try {
      // Step 1: Get Google OAuth user data
      const googleUser = await LOGIN_FORM_UTILS.simulateGoogleAuth();
      console.log(LOGIN_FORM_CONFIG.messages.googleAuthSuccess, googleUser);

      // Step 2: Check if user is registered in our database
      const dbResult = await LOGIN_FORM_UTILS.simulateDatabaseCheck(googleUser.email);

      if (dbResult.isRegistered) {
        // User is registered - allow login
        setGoogleAuthState(FORM_STATES.SUCCESS);
        LOGIN_FORM_UTILS.handleLoginSuccess(
          onClose, 
          reset, 
          null, 
          setGoogleAuthState, 
          dbResult.message
        );
      } else {
        // User not registered - show error and suggest signup
        setGoogleAuthState(FORM_STATES.ERROR);
        alert(`${LOGIN_FORM_CONFIG.messages.accountNotFound}`);
        
        setTimeout(() => {
          setGoogleAuthState(FORM_STATES.IDLE);
        }, LOGIN_FORM_CONFIG.timing.errorDisplayTime);
      }
    } catch (error) {
      LOGIN_FORM_UTILS.handleLoginError(
        null, 
        setGoogleAuthState, 
        LOGIN_FORM_CONFIG.messages.loginFailed
      );
    }
  }, [onClose, reset]);

  // Handle modal close
  const handleClose = useCallback((e) => {
    if (e.target === e.currentTarget) onClose();
  }, [onClose]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm"
      onClick={handleClose}
    >
      <div 
        className="relative w-full max-w-md bg-white bg-opacity-10 backdrop-blur-md border border-white border-opacity-20 rounded-2xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-white border-opacity-20">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              {LOGIN_FORM_CONFIG.messages.welcomeBack}
            </h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-300 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 rounded-lg p-1"
              aria-label="Close modal"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-white text-opacity-80 mt-2">Sign in to your Connectify account</p>
        </div>

        {/* Form */}
        <div className="p-6 space-y-4">
          {/* Google Sign-In Button */}
          <button
            onClick={handleGoogleSignIn}
            disabled={formState === FORM_STATES.SUBMITTING || googleAuthState === FORM_STATES.SUBMITTING}
            className={`w-full font-semibold py-3 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 flex items-center justify-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed ${
              googleAuthState === FORM_STATES.ERROR 
                ? 'bg-red-100 hover:bg-red-50 text-red-700 border border-red-300'
                : googleAuthState === FORM_STATES.SUCCESS
                ? 'bg-green-100 hover:bg-green-50 text-green-700 border border-green-300'
                : 'bg-white hover:bg-gray-50 text-gray-700'
            }`}
          >
            {googleAuthState === FORM_STATES.SUBMITTING ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                <span>{LOGIN_FORM_CONFIG.messages.checkingAccount}</span>
              </>
            ) : googleAuthState === FORM_STATES.SUCCESS ? (
              <>
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>{LOGIN_FORM_CONFIG.messages.loginSuccessful}</span>
              </>
            ) : googleAuthState === FORM_STATES.ERROR ? (
              <>
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span>Account Not Found</span>
              </>
            ) : (
              <>
                {/* Google Icon */}
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span>{LOGIN_FORM_CONFIG.messages.continueWithGoogle}</span>
              </>
            )}
          </button>

          {/* Registration Reminder for Google Auth Error */}
          {googleAuthState === FORM_STATES.ERROR && (
            <div className="bg-yellow-100 bg-opacity-10 border border-yellow-400 border-opacity-30 rounded-lg p-3">
              <div className="flex items-start space-x-2">
                <svg className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <div>
                  <p className="text-yellow-400 text-sm font-medium">Account Not Found</p>
                  <p className="text-yellow-300 text-xs mt-1">
                    This Google account is not registered. Please{' '}
                    <button 
                      onClick={onSwitchToSignUp}
                      className="font-medium underline hover:text-yellow-200"
                    >
                      sign up first
                    </button>{' '}
                    to create an account.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-grow border-t border-white border-opacity-30"></div>
            <span className="flex-shrink-0 px-4 text-white text-opacity-60 text-sm">
              {LOGIN_FORM_CONFIG.messages.orDivider}
            </span>
            <div className="flex-grow border-t border-white border-opacity-30"></div>
          </div>

          {/* Email/Password Form */}
          <Input
            id="email"
            label="Email Address"
            type="email"
            value={values.email}
            onChange={(e) => handleChange('email', e.target.value)}
            onBlur={() => handleBlur('email')}
            placeholder="your.email@example.com"
            error={touched.email && !validation.email?.isValid ? validation.email?.message : null}
            success={touched.email && validation.email?.isValid ? validation.email?.message : null}
            disabled={formState === FORM_STATES.SUBMITTING}
          />

          <Input
            id="password"
            label="Password"
            type="password"
            value={values.password}
            onChange={(e) => handleChange('password', e.target.value)}
            onBlur={() => handleBlur('password')}
            placeholder="Enter your password"
            showPasswordToggle
            error={touched.password && !validation.password?.isValid ? validation.password?.message : null}
            success={touched.password && validation.password?.isValid ? validation.password?.message : null}
            disabled={formState === FORM_STATES.SUBMITTING}
          />

          {/* Forgot Password Link */}
          <div className="text-right">
            <button
              type="button"
              onClick={() => console.log('Forgot password clicked')}
              className="text-purple-300 hover:text-purple-200 text-sm font-medium focus:outline-none focus:underline"
              disabled={formState === FORM_STATES.SUBMITTING}
            >
              {LOGIN_FORM_CONFIG.messages.forgotPassword}
            </button>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              onClick={handleSubmit}
              disabled={!isValid || formState === FORM_STATES.SUBMITTING}
              className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-opacity-50 ${
                formState === FORM_STATES.SUBMITTING
                  ? 'bg-purple-500 bg-opacity-50 cursor-not-allowed'
                  : isValid
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 focus:ring-purple-400 transform hover:scale-105'
                  : 'bg-gray-500 bg-opacity-50 cursor-not-allowed'
              }`}
            >
              {formState === FORM_STATES.SUBMITTING ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  {LOGIN_FORM_CONFIG.messages.signingIn}
                </div>
              ) : formState === FORM_STATES.SUCCESS ? (
                <div className="flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {LOGIN_FORM_CONFIG.messages.welcomeBack}
                </div>
              ) : (
                'Sign In'
              )}
            </button>
          </div>

          {/* Sign Up Link */}
          <div className="text-center pt-4 border-t border-white border-opacity-20">
            <p className="text-white text-opacity-80 text-sm">
              {LOGIN_FORM_CONFIG.messages.noAccount}{' '}
              <button
                type="button"
                onClick={onSwitchToSignUp}
                className="text-purple-300 hover:text-purple-200 font-medium focus:outline-none focus:underline"
                disabled={formState === FORM_STATES.SUBMITTING}
              >
                {LOGIN_FORM_CONFIG.messages.signUp}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;