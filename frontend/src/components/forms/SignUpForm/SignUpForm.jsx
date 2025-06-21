// src/components/forms/SignUpForm/SignUpForm.jsx
import React, { useState, useCallback, useEffect } from 'react';
import { useFormValidation } from '../../../hooks/useFormValidation';
import { FORM_STATES } from '../../../utils/constants/validation';
import Input from '../../ui/Input/Input';
import PasswordStrength from './PasswordStrength';

// ✅ REAL DJANGO API CONFIGURATION
const DJANGO_API_CONFIG = {
  // Django server URL
  baseURL: 'http://127.0.0.1:8000',

  // API endpoints (matching your Django urls.py)
  endpoints: {
    register: '/api/auth/register/',
    checkUsername: '/api/auth/check-username/',
    checkEmail: '/api/auth/check-email/',
    sendOTP: '/api/auth/send-otp/',
    verifyOTP: '/api/auth/verify-otp/'
  },

  // Request configuration
  requestConfig: {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    credentials: 'include' // Include cookies for CORS
  }
};

// ✅ OPTIMIZED: Form configuration (static data)
const SIGNUP_FORM_CONFIG = {
  // Initial form values
  initialValues: {
    full_name: '',      // Changed from 'name' to match Django model
    username: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: ''
  },

  // OTP states configuration
  otpStates: {
    NOT_SENT: 'not_sent',
    SENDING: 'sending',
    SENT: 'sent',
    VERIFYING: 'verifying',
    VERIFIED: 'verified',
    EXPIRED: 'expired'
  },

  // Timing configuration for various operations
  timing: {
    otpSendDelay: 2000,
    verificationDelay: 1500,
    successDisplayTime: 2000,
    timerDuration: 60
  },

  // User interface messages
  messages: {
    otpSent: 'OTP sent to',
    otpVerified: 'Email verified successfully!',
    accountCreated: 'Account created successfully!',
    invalidOtp: 'Invalid OTP. Try again.',
    checkInbox: 'Check your inbox!',
    otpExpired: 'OTP has expired',
    resendOtp: 'Resend OTP',
    sending: 'Sending...',
    verifying: 'Verifying...',
    enterVerificationCode: 'Enter verification code',
    networkError: 'Network error. Please check your connection.',
    serverError: 'Server error. Please try again later.'
  }
};

// ✅ REAL DJANGO API UTILITY FUNCTIONS
const DJANGO_API_UTILS = {
  // Phone number formatting utility (unchanged)
  formatPhoneNumber: (value) => {
    const cleaned = value.replace(/\D/g, '');
    const truncated = cleaned.slice(0, 10);
    return truncated.length >= 6
      ? `${truncated.slice(0, 5)} ${truncated.slice(5)}`
      : truncated;
  },

  // ✅ REAL API CALL: Check username availability
  checkUsernameAvailability: async (username) => {
    try {
      console.log('Checking username availability with Django:', username);

      const response = await fetch(`${DJANGO_API_CONFIG.baseURL}${DJANGO_API_CONFIG.endpoints.checkUsername}`, {
        method: 'POST',
        ...DJANGO_API_CONFIG.requestConfig,
        body: JSON.stringify({ username })
      });

      const data = await response.json();
      console.log('Django username check response:', data);

      if (response.ok) {
        // Django returns: { available: true/false, message: "..." }
        return {
          isValid: data.available,  // Convert Django 'available' to 'isValid'
          message: data.available
            ? 'Username is available!'
            : 'Username is already taken',
          isChecking: false
        };
      } else {
        return {
          isValid: false,
          message: data.message || 'Could not check username availability',
          isChecking: false
        };
      }
    } catch (error) {
      console.error('Username check network error:', error);
      return {
        isValid: false,
        message: 'Could not check username availability',
        isChecking: false
      };
    }
  },

  // ✅ REAL API CALL: Check email availability
  checkEmailAvailability: async (email) => {
    try {
      const response = await fetch(`${DJANGO_API_CONFIG.baseURL}${DJANGO_API_CONFIG.endpoints.checkEmail}`, {
        method: 'POST',
        ...DJANGO_API_CONFIG.requestConfig,
        body: JSON.stringify({ email })
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Email check error:', error);
      return { available: false, message: 'Could not check email availability' };
    }
  },

  // ✅ REAL API CALL: Register user with Django
  registerUser: async (formData) => {
    try {
      console.log('Sending registration data to Django:', formData);

      const response = await fetch(`${DJANGO_API_CONFIG.baseURL}${DJANGO_API_CONFIG.endpoints.register}`, {
        method: 'POST',
        ...DJANGO_API_CONFIG.requestConfig,
        body: JSON.stringify({
          full_name: formData.full_name,
          username: formData.username,
          phone: formData.phone.replace(/\s/g, ''), // Remove spaces from phone
          email: formData.email,
          password: formData.password,
          confirm_password: formData.confirmPassword
        })
      });

      const data = await response.json();

      if (response.ok) {
        console.log('Django registration successful:', data);
        return { success: true, data };
      } else {
        console.error('Django registration failed:', data);
        return { success: false, error: data.message || 'Registration failed' };
      }
    } catch (error) {
      console.error('Registration network error:', error);
      return {
        success: false,
        error: SIGNUP_FORM_CONFIG.messages.networkError
      };
    }
  }
};

const SignUpModal = ({ isOpen, onClose, onSwitchToLogin }) => {
  // ✅ State management
  const [formState, setFormState] = useState(FORM_STATES.IDLE);
  const [otpState, setOtpState] = useState(SIGNUP_FORM_CONFIG.otpStates.NOT_SENT);
  const [otp, setOtp] = useState('');
  const [otpTimer, setOtpTimer] = useState(0);

  // ✅ Form validation using static configuration
  const { values, validation, touched, isValid, handleChange, handleBlur, reset } =
    useFormValidation(SIGNUP_FORM_CONFIG.initialValues);

  // ✅ Phone formatting (unchanged)
  const handlePhoneChange = useCallback((e) => {
    const formatted = DJANGO_API_UTILS.formatPhoneNumber(e.target.value);
    handleChange('phone', formatted);
  }, [handleChange]);

  // ✅ REAL DJANGO OTP INTEGRATION - Replace mock functions in SignUpForm.jsx

  // ✅ REAL API CALL: Send OTP via Django
  const handleSendOTP = useCallback(async () => {
    if (!validation.email?.isValid) return;

    setOtpState(SIGNUP_FORM_CONFIG.otpStates.SENDING);

    try {
      // ✅ REAL DJANGO API CALL
      const response = await fetch('http://127.0.0.1:8000/api/auth/send-otp/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email: values.email })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setOtpState(SIGNUP_FORM_CONFIG.otpStates.SENT);
        setOtpTimer(SIGNUP_FORM_CONFIG.timing.timerDuration);
        console.log(`OTP sent to ${values.email} via Django!`);
      } else {
        setOtpState(SIGNUP_FORM_CONFIG.otpStates.NOT_SENT);
        alert(`Failed to send OTP: ${data.message}`);
      }
    } catch (error) {
      console.error('OTP sending error:', error);
      setOtpState(SIGNUP_FORM_CONFIG.otpStates.NOT_SENT);
      alert('Network error. Please try again.');
    }
  }, [validation.email, values.email]);

  // ✅ REAL API CALL: Verify OTP via Django
  const handleVerifyOTP = useCallback(async () => {
    if (otp.length !== 6) return;

    setOtpState(SIGNUP_FORM_CONFIG.otpStates.VERIFYING);

    try {
      // ✅ REAL DJANGO API CALL
      const response = await fetch('http://127.0.0.1:8000/api/auth/verify-otp/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          email: values.email,
          otp_code: otp
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setOtpState(SIGNUP_FORM_CONFIG.otpStates.VERIFIED);
        console.log('OTP verified successfully via Django!');
      } else {
        alert(`OTP verification failed: ${data.message}`);
        setOtpState(SIGNUP_FORM_CONFIG.otpStates.SENT);
        setOtp(''); // Clear wrong OTP
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      setOtpState(SIGNUP_FORM_CONFIG.otpStates.SENT);
      alert('Network error. Please try again.');
    }
  }, [otp, values.email]);

  // ✅ REAL DJANGO API CALL: Submit registration
  const handleSubmit = useCallback(async () => {
    if (!isValid || otpState !== SIGNUP_FORM_CONFIG.otpStates.VERIFIED) return;

    setFormState(FORM_STATES.SUBMITTING);

    try {
      // ✅ CALL REAL DJANGO API
      const result = await DJANGO_API_UTILS.registerUser(values);

      if (result.success) {
        setFormState(FORM_STATES.SUCCESS);
        console.log('User registered successfully in Django!', result.data);

        setTimeout(() => {
          onClose();
          setFormState(FORM_STATES.IDLE);
          setOtpState(SIGNUP_FORM_CONFIG.otpStates.NOT_SENT);
          setOtp('');
          reset();
          alert('Account created successfully! You can now login.');
        }, SIGNUP_FORM_CONFIG.timing.successDisplayTime);
      } else {
        setFormState(FORM_STATES.ERROR);
        alert(`Registration failed: ${result.error}`);

        setTimeout(() => {
          setFormState(FORM_STATES.IDLE);
        }, 3000);
      }
    } catch (error) {
      setFormState(FORM_STATES.ERROR);
      console.error('Registration error:', error);
      alert(SIGNUP_FORM_CONFIG.messages.serverError);

      setTimeout(() => {
        setFormState(FORM_STATES.IDLE);
      }, 3000);
    }
  }, [isValid, otpState, onClose, reset, values]);

  // ✅ OTP Timer countdown (unchanged)
  useEffect(() => {
    if (otpTimer > 0) {
      const timer = setTimeout(() => setOtpTimer(otpTimer - 1), 1000);
      return () => clearTimeout(timer);
    } else if (otpTimer === 0 && otpState === SIGNUP_FORM_CONFIG.otpStates.SENT) {
      setOtpState(SIGNUP_FORM_CONFIG.otpStates.EXPIRED);
    }
  }, [otpTimer, otpState]);

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
        className="relative w-full max-w-md bg-white bg-opacity-10 backdrop-blur-md border border-white border-opacity-20 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-white border-opacity-20">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              Join Connectify
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
          <p className="text-white text-opacity-80 mt-2">
            {otpState === SIGNUP_FORM_CONFIG.otpStates.VERIFIED
              ? "Complete your registration"
              : "Create your account to start connecting"
            }
          </p>
        </div>

        {/* Form */}
        <div className="p-6 space-y-4">
          {/* Registration Form Fields */}
          <Input
            id="full_name"
            label="Full Name"
            value={values.full_name}
            onChange={(e) => handleChange('full_name', e.target.value)}
            onBlur={() => handleBlur('full_name')}
            placeholder="Enter your full name"
            error={touched.full_name && !validation.full_name?.isValid ? validation.full_name?.message : null}
            success={touched.full_name && validation.full_name?.isValid ? validation.full_name?.message : null}
            disabled={formState === FORM_STATES.SUBMITTING}
          />

          <Input
            id="username"
            label="Username"
            value={values.username}
            onChange={(e) => handleChange('username', e.target.value)}
            onBlur={() => handleBlur('username')}
            placeholder="Choose a unique username"
            error={touched.username && !validation.username?.isValid && !validation.username?.isChecking ? validation.username?.message : null}
            success={touched.username && validation.username?.isValid ? validation.username?.message : null}
            isLoading={validation.username?.isChecking}
            disabled={formState === FORM_STATES.SUBMITTING}
          />

          <Input
            id="phone"
            label="Phone Number"
            type="tel"
            value={values.phone}
            onChange={handlePhoneChange}
            onBlur={() => handleBlur('phone')}
            placeholder="98765 43210"
            prefix="+91"
            error={touched.phone && !validation.phone?.isValid ? validation.phone?.message : null}
            success={touched.phone && validation.phone?.isValid ? validation.phone?.message : null}
            disabled={formState === FORM_STATES.SUBMITTING}
          />

          {/* Email Field with OTP Integration */}
          <div>
            <div className="flex space-x-2">
              <div className="flex-1">
                <Input
                  id="email"
                  label="Email Address"
                  type="email"
                  value={values.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  onBlur={() => handleBlur('email')}
                  placeholder="your.email@example.com"
                  error={touched.email && !validation.email?.isValid ? validation.email?.message : null}
                  success={otpState === SIGNUP_FORM_CONFIG.otpStates.VERIFIED ? SIGNUP_FORM_CONFIG.messages.otpVerified : (touched.email && validation.email?.isValid ? validation.email?.message : null)}
                  disabled={formState === FORM_STATES.SUBMITTING || otpState === SIGNUP_FORM_CONFIG.otpStates.VERIFIED}
                />
              </div>

              {/* Send OTP Button */}
              {otpState === SIGNUP_FORM_CONFIG.otpStates.NOT_SENT && validation.email?.isValid && (
                <button
                  onClick={handleSendOTP}
                  className="mt-8 px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm whitespace-nowrap"
                >
                  Send OTP
                </button>
              )}
            </div>
// ✅ FIXED OTP Input Section - Replace in your SignUpForm.jsx

{/* OTP Input Section - FIXED VERSION */}
{(otpState === SIGNUP_FORM_CONFIG.otpStates.SENT || 
  otpState === SIGNUP_FORM_CONFIG.otpStates.EXPIRED || 
  otpState === SIGNUP_FORM_CONFIG.otpStates.VERIFIED ||
  otpState === SIGNUP_FORM_CONFIG.otpStates.VERIFYING) && (
  <div className="mt-4 p-4 bg-white bg-opacity-5 rounded-lg border border-white border-opacity-20">
    <div className="flex items-center justify-between mb-2">
      <span className="text-white text-sm font-medium">
        Enter verification code
      </span>
      {otpState === SIGNUP_FORM_CONFIG.otpStates.SENT && (
        <span className="text-blue-400 text-sm">
          {otpTimer > 0 ? `${otpTimer}s` : 'OTP expired'}
        </span>
      )}
    </div>
    
    <div className="flex space-x-2">
      <input
        type="text"
        value={otp}
        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
        placeholder="123456"
        maxLength={6}
        className="flex-1 px-3 py-2 bg-white bg-opacity-10 border border-white border-opacity-30 rounded text-white placeholder-white placeholder-opacity-60 focus:outline-none focus:ring-2 focus:ring-blue-400 text-center tracking-widest"
        disabled={otpState === SIGNUP_FORM_CONFIG.otpStates.VERIFIED || otpState === SIGNUP_FORM_CONFIG.otpStates.VERIFYING}
      />
      
      {/* ✅ FIXED: Verify Button - Always show when OTP is 6 digits and state is SENT */}
      {otpState === SIGNUP_FORM_CONFIG.otpStates.SENT && otp.length === 6 && (
        <button
          onClick={handleVerifyOTP}
          disabled={otpState === SIGNUP_FORM_CONFIG.otpStates.VERIFYING}
          className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-400 text-sm disabled:opacity-50"
        >
          {otpState === SIGNUP_FORM_CONFIG.otpStates.VERIFYING ? 'Verifying...' : 'Verify'}
        </button>
      )}
    </div>

    {/* Resend OTP */}
    {(otpState === SIGNUP_FORM_CONFIG.otpStates.EXPIRED || 
      (otpState === SIGNUP_FORM_CONFIG.otpStates.SENT && otpTimer === 0)) && (
      <button
        onClick={handleSendOTP}
        disabled={otpState === SIGNUP_FORM_CONFIG.otpStates.SENDING}
        className="mt-2 text-purple-300 hover:text-purple-200 text-sm font-medium focus:outline-none focus:underline disabled:opacity-50"
      >
        {otpState === SIGNUP_FORM_CONFIG.otpStates.SENDING ? 'Sending...' : 'Resend OTP'}
      </button>
    )}

    {/* OTP Status Messages */}
    {otpState === SIGNUP_FORM_CONFIG.otpStates.SENT && (
      <p className="mt-2 text-blue-400 text-sm">
        📧 OTP sent to {values.email}. Check your inbox!
      </p>
    )}
    
    {otpState === SIGNUP_FORM_CONFIG.otpStates.VERIFIED && (
      <p className="mt-2 text-green-400 text-sm">
        ✅ OTP verified successfully!
      </p>
    )}
  </div>
)}
          </div>

          <div>
            <Input
              id="password"
              label="Password"
              type="password"
              value={values.password}
              onChange={(e) => handleChange('password', e.target.value)}
              onBlur={() => handleBlur('password')}
              placeholder="Create a strong password"
              showPasswordToggle
              error={touched.password && !validation.password?.isValid ? validation.password?.message : null}
              success={touched.password && validation.password?.isValid ? validation.password?.message : null}
              disabled={formState === FORM_STATES.SUBMITTING}
            />
            {values.password && <PasswordStrength strength={validation.password?.strength || 0} />}
          </div>

          <Input
            id="confirmPassword"
            label="Confirm Password"
            type="password"
            value={values.confirmPassword}
            onChange={(e) => handleChange('confirmPassword', e.target.value)}
            onBlur={() => handleBlur('confirmPassword')}
            placeholder="Re-enter your password"
            showPasswordToggle
            error={touched.confirmPassword && !validation.confirmPassword?.isValid ? validation.confirmPassword?.message : null}
            success={touched.confirmPassword && validation.confirmPassword?.isValid ? validation.confirmPassword?.message : null}
            disabled={formState === FORM_STATES.SUBMITTING}
          />

          {/* Submit Button */}
          <div className="pt-4">
            <button
              onClick={handleSubmit}
              disabled={!isValid || otpState !== SIGNUP_FORM_CONFIG.otpStates.VERIFIED || formState === FORM_STATES.SUBMITTING}
              className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-opacity-50 ${formState === FORM_STATES.SUBMITTING
                  ? 'bg-purple-500 bg-opacity-50 cursor-not-allowed'
                  : isValid && otpState === SIGNUP_FORM_CONFIG.otpStates.VERIFIED
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 focus:ring-purple-400 transform hover:scale-105'
                    : 'bg-gray-500 bg-opacity-50 cursor-not-allowed'
                }`}
            >
              {formState === FORM_STATES.SUBMITTING ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Creating Account...
                </div>
              ) : formState === FORM_STATES.SUCCESS ? (
                <div className="flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Account Created!
                </div>
              ) : otpState !== SIGNUP_FORM_CONFIG.otpStates.VERIFIED ? (
                'Verify Email First'
              ) : (
                'Create Account'
              )}
            </button>
          </div>

          {/* Login Link */}
          <div className="text-center pt-4 border-t border-white border-opacity-20">
            <p className="text-white text-opacity-80 text-sm">
              Already have an account?{' '}
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="text-purple-300 hover:text-purple-200 font-medium focus:outline-none focus:underline"
                disabled={formState === FORM_STATES.SUBMITTING}
              >
                Sign In
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpModal;