// src/components/forms/SignUpForm/SignUpForm.jsx
import React, { useState, useCallback, useEffect } from 'react';
import { useFormValidation } from '../../../hooks/useFormValidation';
import { FORM_STATES } from '../../../utils/constants/validation';
import Input from '../../ui/Input/Input';
import PasswordStrength from './PasswordStrength';

// ✅ OPTIMIZED: Complete signup form configuration (static data)
const SIGNUP_FORM_CONFIG = {
  // Initial form values
  initialValues: {
    name: '',
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
  
  // Mock data for demo purposes
  mockData: {
    googleUser: {
      email: 'user@gmail.com',
      name: 'John Doe',
      picture: 'https://example.com/photo.jpg',
      googleId: '1234567890'
    },
    registeredEmails: [
      'user@gmail.com',
      'test@gmail.com',
      'demo@gmail.com'
    ]
  },
  
  // Validation configuration
  validation: {
    phonePattern: /\D/g,
    phoneMaxLength: 10,
    phoneFormatBreakpoint: 6,
    otpLength: 6,
    otpMockValue: '123456'
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
    invalidOtp: 'Invalid OTP. Try 123456 for demo.',
    checkInbox: 'Check your inbox!',
    otpExpired: 'OTP has expired',
    resendOtp: 'Resend OTP',
    sending: 'Sending...',
    verifying: 'Verifying...',
    enterVerificationCode: 'Enter verification code'
  }
};

// ✅ OPTIMIZED: Static utility functions (created once, reused forever)
const SIGNUP_FORM_UTILS = {
  // Phone number formatting utility
  formatPhoneNumber: (value) => {
    const cleaned = value.replace(SIGNUP_FORM_CONFIG.validation.phonePattern, '');
    const truncated = cleaned.slice(0, SIGNUP_FORM_CONFIG.validation.phoneMaxLength);
    return truncated.length >= SIGNUP_FORM_CONFIG.validation.phoneFormatBreakpoint 
      ? `${truncated.slice(0, 5)} ${truncated.slice(5)}` 
      : truncated;
  },
  
  // Check if email is registered (mock function)
  isEmailRegistered: (email) => {
    return SIGNUP_FORM_CONFIG.mockData.registeredEmails.includes(email);
  },
  
  // Validate OTP (mock function)
  validateOTP: (otp) => {
    return otp === SIGNUP_FORM_CONFIG.validation.otpMockValue;
  },
  
  // Simulate OTP sending API call
  simulateOTPSend: (email) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(`${SIGNUP_FORM_CONFIG.messages.otpSent} ${email}: ${SIGNUP_FORM_CONFIG.validation.otpMockValue}`);
        resolve({ success: true });
      }, SIGNUP_FORM_CONFIG.timing.otpSendDelay);
    });
  },
  
  // Simulate OTP verification API call
  simulateOTPVerification: (otp) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const isValid = SIGNUP_FORM_UTILS.validateOTP(otp);
        resolve({ 
          success: isValid, 
          message: isValid ? SIGNUP_FORM_CONFIG.messages.otpVerified : SIGNUP_FORM_CONFIG.messages.invalidOtp 
        });
      }, SIGNUP_FORM_CONFIG.timing.verificationDelay);
    });
  },
  
  // Simulate account creation API call
  simulateAccountCreation: (formData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(SIGNUP_FORM_CONFIG.messages.accountCreated, formData);
        resolve({ success: true });
      }, SIGNUP_FORM_CONFIG.timing.successDisplayTime);
    });
  }
};

const SignUpModal = ({ isOpen, onClose, onSwitchToLogin }) => {
  // ✅ OPTIMIZED: Using static configuration for state initialization
  const [formState, setFormState] = useState(FORM_STATES.IDLE);
  const [otpState, setOtpState] = useState(SIGNUP_FORM_CONFIG.otpStates.NOT_SENT);
  const [otp, setOtp] = useState('');
  const [otpTimer, setOtpTimer] = useState(0);
  
  // ✅ OPTIMIZED: Using static configuration for form validation
  const { values, validation, touched, isValid, handleChange, handleBlur, reset } = 
    useFormValidation(SIGNUP_FORM_CONFIG.initialValues);

  // ✅ OPTIMIZED: Using static utility function for phone formatting
  const handlePhoneChange = useCallback((e) => {
    const formatted = SIGNUP_FORM_UTILS.formatPhoneNumber(e.target.value);
    handleChange('phone', formatted);
  }, [handleChange]);

  // ✅ OPTIMIZED: Using static utilities and configuration
  const handleSendOTP = useCallback(async () => {
    if (!validation.email?.isValid) return;

    setOtpState(SIGNUP_FORM_CONFIG.otpStates.SENDING);
    
    try {
      await SIGNUP_FORM_UTILS.simulateOTPSend(values.email);
      setOtpState(SIGNUP_FORM_CONFIG.otpStates.SENT);
      setOtpTimer(SIGNUP_FORM_CONFIG.timing.timerDuration);
    } catch (error) {
      setOtpState(SIGNUP_FORM_CONFIG.otpStates.NOT_SENT);
    }
  }, [validation.email, values.email]);

  // ✅ OPTIMIZED: Using static utilities and configuration
  const handleVerifyOTP = useCallback(async () => {
    if (otp.length !== SIGNUP_FORM_CONFIG.validation.otpLength) return;

    setOtpState(SIGNUP_FORM_CONFIG.otpStates.VERIFYING);

    try {
      const result = await SIGNUP_FORM_UTILS.simulateOTPVerification(otp);
      if (result.success) {
        setOtpState(SIGNUP_FORM_CONFIG.otpStates.VERIFIED);
        console.log(result.message);
      } else {
        alert(result.message);
        setOtpState(SIGNUP_FORM_CONFIG.otpStates.SENT);
      }
    } catch (error) {
      setOtpState(SIGNUP_FORM_CONFIG.otpStates.SENT);
    }
  }, [otp]);

  // ✅ OPTIMIZED: Using static utilities and configuration
  const handleSubmit = useCallback(async () => {
    if (!isValid || otpState !== SIGNUP_FORM_CONFIG.otpStates.VERIFIED) return;

    setFormState(FORM_STATES.SUBMITTING);

    try {
      await SIGNUP_FORM_UTILS.simulateAccountCreation(values);
      setFormState(FORM_STATES.SUCCESS);
      setTimeout(() => {
        onClose();
        setFormState(FORM_STATES.IDLE);
        setOtpState(SIGNUP_FORM_CONFIG.otpStates.NOT_SENT);
        setOtp('');
        reset();
        console.log(SIGNUP_FORM_CONFIG.messages.accountCreated);
      }, SIGNUP_FORM_CONFIG.timing.successDisplayTime);
    } catch (error) {
      setFormState(FORM_STATES.ERROR);
    }
  }, [isValid, otpState, onClose, reset, values]);

  // ✅ OPTIMIZED: OTP Timer countdown using configuration
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
            id="name"
            label="Full Name"
            value={values.name}
            onChange={(e) => handleChange('name', e.target.value)}
            onBlur={() => handleBlur('name')}
            placeholder="Enter your full name"
            error={touched.name && !validation.name?.isValid ? validation.name?.message : null}
            success={touched.name && validation.name?.isValid ? validation.name?.message : null}
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

            {/* OTP Input Section */}
            {(otpState === SIGNUP_FORM_CONFIG.otpStates.SENT || 
              otpState === SIGNUP_FORM_CONFIG.otpStates.EXPIRED || 
              otpState === SIGNUP_FORM_CONFIG.otpStates.VERIFIED) && (
              <div className="mt-4 p-4 bg-white bg-opacity-5 rounded-lg border border-white border-opacity-20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white text-sm font-medium">
                    {SIGNUP_FORM_CONFIG.messages.enterVerificationCode}
                  </span>
                  {otpState === SIGNUP_FORM_CONFIG.otpStates.SENT && (
                    <span className="text-blue-400 text-sm">
                      {otpTimer > 0 ? `${otpTimer}s` : SIGNUP_FORM_CONFIG.messages.otpExpired}
                    </span>
                  )}
                </div>
                
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, SIGNUP_FORM_CONFIG.validation.otpLength))}
                    placeholder={SIGNUP_FORM_CONFIG.validation.otpMockValue}
                    maxLength={SIGNUP_FORM_CONFIG.validation.otpLength}
                    className="flex-1 px-3 py-2 bg-white bg-opacity-10 border border-white border-opacity-30 rounded text-white placeholder-white placeholder-opacity-60 focus:outline-none focus:ring-2 focus:ring-blue-400 text-center tracking-widest"
                    disabled={otpState === SIGNUP_FORM_CONFIG.otpStates.VERIFIED || otpState === SIGNUP_FORM_CONFIG.otpStates.VERIFYING}
                  />
                  
                  {otpState === SIGNUP_FORM_CONFIG.otpStates.SENT && otp.length === SIGNUP_FORM_CONFIG.validation.otpLength && (
                    <button
                      onClick={handleVerifyOTP}
                      disabled={otpState === SIGNUP_FORM_CONFIG.otpStates.VERIFYING}
                      className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-400 text-sm disabled:opacity-50"
                    >
                      {otpState === SIGNUP_FORM_CONFIG.otpStates.VERIFYING ? SIGNUP_FORM_CONFIG.messages.verifying : 'Verify'}
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
                    {otpState === SIGNUP_FORM_CONFIG.otpStates.SENDING ? SIGNUP_FORM_CONFIG.messages.sending : SIGNUP_FORM_CONFIG.messages.resendOtp}
                  </button>
                )}

                {/* OTP Status Messages */}
                {otpState === SIGNUP_FORM_CONFIG.otpStates.SENT && (
                  <p className="mt-2 text-blue-400 text-sm">
                    📧 {SIGNUP_FORM_CONFIG.messages.otpSent} {values.email}. {SIGNUP_FORM_CONFIG.messages.checkInbox}
                  </p>
                )}
                
                {otpState === SIGNUP_FORM_CONFIG.otpStates.VERIFIED && (
                  <p className="mt-2 text-green-400 text-sm">
                    ✅ {SIGNUP_FORM_CONFIG.messages.otpVerified}
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
              className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-opacity-50 ${
                formState === FORM_STATES.SUBMITTING
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