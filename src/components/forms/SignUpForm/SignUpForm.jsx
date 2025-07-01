// ===== src/components/forms/SignUpForm/SignUpForm.jsx ===== ENHANCED WITH JWT
import React, { useState, useCallback, useEffect } from 'react';
import { useFormValidation } from '../../../hooks/useFormValidation';
import { FORM_STATES } from '../../../utils/constants/validation';
import { useAuth } from '../../../contexts/AuthContext';
import { authAPI } from '../../../utils/api';
import Input from '../../ui/Input/Input';
import { Button } from '../../ui/Button/Button';
import { useToast } from '../../ui/Toast';
import PasswordStrength from './PasswordStrength';
import { X, Mail, Lock, User, Phone, Eye, EyeOff, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// ✅ PRESERVED - Form Configuration (keeping all your settings)
const SIGNUP_FORM_CONFIG = {
  initialValues: {
    full_name: '',
    username: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
  },
  otpStates: {
    NOT_SENT: 'not_sent',
    SENDING: 'sending',
    SENT: 'sent',
    VERIFYING: 'verifying',
    VERIFIED: 'verified',
  },
  timing: {
    timerDuration: 120,
    errorDisplayTime: 3000,
    successDisplayTime: 2000,
  },
  messages: {
    otpSent: 'OTP sent to your email!',
    otpVerified: 'Email verified successfully!',
    invalidOtp: 'Invalid OTP. Please try again.',
    serverError: 'Server error. Please try again later.',
    accountCreated: 'Account created successfully! Redirecting...',
    validationError: 'Please complete all fields and verify your email first.',
    networkError: 'Network error. Please check your connection.',
  },
};

// ✅ ENHANCED - Utility Functions now use JWT but preserve all your logic
const SIGNUP_FORM_UTILS = {
  // Enhanced to use JWT API but keep same interface
  checkEmailAvailability: async (email) => {
    try {
      const result = await authAPI.checkEmailAvailability(email);
      return {
        success: result.available,
        available: result.available,
        error: result.available ? null : 'Email is already registered'
      };
    } catch (error) {
      console.error('Email check error:', error);
      return { success: false, available: false, error: 'Failed to check email' };
    }
  },

  checkUsernameAvailability: async (username) => {
    try {
      const result = await authAPI.checkUsernameAvailability(username);
      return {
        success: result.available,
        available: result.available,
        error: result.available ? null : 'Username is already taken'
      };
    } catch (error) {
      console.error('Username check error:', error);
      return { success: false, available: false, error: 'Failed to check username' };
    }
  },

  sendOTP: async (email) => {
    try {
      const result = await authAPI.sendOTP(email);
      return result;
    } catch (error) {
      console.error('Send OTP error:', error);
      return { success: false, message: 'Failed to send OTP' };
    }
  },

  verifyOTP: async (email, otp_code) => {
    try {
      const result = await authAPI.verifyOTP(email, otp_code);
      return result;
    } catch (error) {
      console.error('Verify OTP error:', error);
      return { success: false, message: 'Failed to verify OTP' };
    }
  }
};

// ✅ ENHANCED - Main Component with JWT Authentication
function SignUpForm({ isOpen, onClose, onSwitchToLogin }) {
  // ✅ PRESERVED - All your existing state
  const [formState, setFormState] = useState(FORM_STATES.IDLE);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [otpState, setOtpState] = useState(SIGNUP_FORM_CONFIG.otpStates.NOT_SENT);
  const [otp, setOtp] = useState('');
  const [otpTimer, setOtpTimer] = useState(0);
  const { toast } = useToast();
  const navigate = useNavigate();

  // ✅ NEW - JWT Authentication hooks
  const { register, isLoading } = useAuth();

  // ✅ PRESERVED - Your exact form validation setup
  const {
    values,
    errors,
    touched,
    isValid,
    handleChange,
    handleBlur,
    reset,
    validation,
  } = useFormValidation(SIGNUP_FORM_CONFIG.initialValues);

  // ✅ PRESERVED - OTP Timer Effect (exact same logic)
  useEffect(() => {
    let interval;
    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpTimer]);

  // ✅ PRESERVED - Your exact input handlers
  const handleInputChange = useCallback(
    (fieldName) => (e) => {
      const value = e.target.value;
      handleChange(fieldName, value);
    },
    [handleChange]
  );

  const handleInputBlur = useCallback(
    (fieldName) => () => {
      handleBlur(fieldName);
    },
    [handleBlur]
  );

  // ✅ ENHANCED - Send OTP handler now uses JWT but preserves your logic flow
  const handleSendOTP = useCallback(async () => {
    if (!validation.email?.isValid) return;

    setOtpState(SIGNUP_FORM_CONFIG.otpStates.SENDING);
    
    try {
      const result = await SIGNUP_FORM_UTILS.sendOTP(values.email);

      if (result.success) {
        setOtpState(SIGNUP_FORM_CONFIG.otpStates.SENT);
        setOtpTimer(SIGNUP_FORM_CONFIG.timing.timerDuration);
        toast.success(SIGNUP_FORM_CONFIG.messages.otpSent);
        console.log('✅ OTP sent successfully');
      } else {
        setOtpState(SIGNUP_FORM_CONFIG.otpStates.NOT_SENT);
        toast.error(result.message || 'Failed to send OTP');
      }
    } catch (error) {
      setOtpState(SIGNUP_FORM_CONFIG.otpStates.NOT_SENT);
      console.error('OTP sending error:', error);
      toast.error(SIGNUP_FORM_CONFIG.messages.serverError);
    }
  }, [values.email, validation.email, toast]);

  // ✅ ENHANCED - Verify OTP handler now uses JWT but preserves your logic flow
  const handleVerifyOTP = useCallback(async () => {
    if (otp.length !== 6) return;

    setOtpState(SIGNUP_FORM_CONFIG.otpStates.VERIFYING);
    
    try {
      const result = await SIGNUP_FORM_UTILS.verifyOTP(values.email, otp);

      if (result.success) {
        setOtpState(SIGNUP_FORM_CONFIG.otpStates.VERIFIED);
        toast.success(SIGNUP_FORM_CONFIG.messages.otpVerified);
        console.log('✅ OTP verified successfully');
      } else {
        setOtpState(SIGNUP_FORM_CONFIG.otpStates.SENT);
        toast.error(result.message || SIGNUP_FORM_CONFIG.messages.invalidOtp);
        setOtp('');
      }
    } catch (error) {
      setOtpState(SIGNUP_FORM_CONFIG.otpStates.SENT);
      console.error('OTP verification error:', error);
      toast.error(SIGNUP_FORM_CONFIG.messages.serverError);
    }
  }, [values.email, otp, toast]);

  // ✅ ENHANCED - Submit handler now uses JWT registration but preserves your logic flow
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    if (!isValid || otpState !== SIGNUP_FORM_CONFIG.otpStates.VERIFIED) {
      toast.warning(SIGNUP_FORM_CONFIG.messages.validationError);
      return;
    }

    setFormState(FORM_STATES.SUBMITTING);

    try {
      // Use JWT registration instead of direct API call
      const userData = {
        full_name: values.full_name,
        username: values.username,
        phone: values.phone.replace(/\D/g, ''), // Keep your phone formatting logic
        email: values.email,
        password: values.password,
        confirm_password: values.confirmPassword // Match your backend field name
      };

      const result = await register(userData);

      if (result.success) {
        setFormState(FORM_STATES.SUCCESS);
        console.log('✅ Account created successfully with JWT tokens');

        setTimeout(() => {
          onClose();
          setFormState(FORM_STATES.IDLE);
          setOtpState(SIGNUP_FORM_CONFIG.otpStates.NOT_SENT);
          setOtp('');
          reset();
          toast.success(SIGNUP_FORM_CONFIG.messages.accountCreated);
          navigate('/home'); // Redirect to home after successful registration
        }, SIGNUP_FORM_CONFIG.timing.successDisplayTime);
      } else {
        setFormState(FORM_STATES.ERROR);
        toast.error(result.message || 'Registration failed');
        setTimeout(() => setFormState(FORM_STATES.IDLE), SIGNUP_FORM_CONFIG.timing.errorDisplayTime);
      }
    } catch (error) {
      setFormState(FORM_STATES.ERROR);
      console.error('Registration error:', error);
      toast.error(SIGNUP_FORM_CONFIG.messages.serverError);
      setTimeout(() => setFormState(FORM_STATES.IDLE), SIGNUP_FORM_CONFIG.timing.errorDisplayTime);
    }
  }, [isValid, otpState, values, register, onClose, reset, toast, navigate]);

  if (!isOpen) return null;

  // ✅ PRESERVED - Your exact UI structure and styling
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-slate-800 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-700 animate-in zoom-in-95 duration-200">
        
        {/* ✅ PRESERVED - Header */}
        <div className="sticky top-0 bg-gradient-to-r from-slate-800 to-slate-700 p-6 border-b border-gray-700 z-10">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors duration-200"
            disabled={formState === FORM_STATES.SUBMITTING || isLoading}
          >
            <X className="w-6 h-6" />
          </button>
          
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-2">Join Connectify</h2>
            <p className="text-gray-300">Create your account to get started</p>
          </div>
        </div>

        {/* ✅ PRESERVED - Content */}
        <div className="p-6 bg-slate-800">
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* ✅ PRESERVED - Full Name */}
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
              <Input
                type="text"
                placeholder="Full Name"
                value={values.full_name}
                onChange={handleInputChange('full_name')}
                onBlur={handleInputBlur('full_name')}
                disabled={formState === FORM_STATES.SUBMITTING || isLoading}
                className="h-12 pl-10 bg-slate-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20"
              />
              {touched.full_name && errors.full_name && (
                <p className="text-red-400 text-sm mt-1">{errors.full_name}</p>
              )}
            </div>

            {/* ✅ PRESERVED - Username */}
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
              <Input
                type="text"
                placeholder="Username"
                value={values.username}
                onChange={handleInputChange('username')}
                onBlur={handleInputBlur('username')}
                disabled={formState === FORM_STATES.SUBMITTING || isLoading}
                className="h-12 pl-10 bg-slate-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20"
              />
              {touched.username && errors.username && (
                <p className="text-red-400 text-sm mt-1">{errors.username}</p>
              )}
              {validation.username?.isChecking && (
                <p className="text-blue-400 text-sm mt-1">Checking availability...</p>
              )}
              {validation.username?.isValid && touched.username && (
                <p className="text-green-400 text-sm mt-1">Username is available!</p>
              )}
            </div>

            {/* ✅ PRESERVED - Phone */}
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
              <Input
                type="tel"
                placeholder="Phone Number"
                value={values.phone}
                onChange={handleInputChange('phone')}
                onBlur={handleInputBlur('phone')}
                disabled={formState === FORM_STATES.SUBMITTING || isLoading}
                className="h-12 pl-10 bg-slate-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20"
              />
              {touched.phone && errors.phone && (
                <p className="text-red-400 text-sm mt-1">{errors.phone}</p>
              )}
            </div>

            {/* ✅ PRESERVED - Email with OTP (exact same logic and UI) */}
            <div className="space-y-2">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
                <Input
                  type="email"
                  placeholder="Email Address"
                  value={values.email}
                  onChange={handleInputChange('email')}
                  onBlur={handleInputBlur('email')}
                  disabled={formState === FORM_STATES.SUBMITTING || isLoading}
                  className="h-12 pl-10 bg-slate-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20"
                />
                {touched.email && errors.email && (
                  <p className="text-red-400 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              {/* ✅ PRESERVED - OTP Section (exact same UI and logic) */}
              {validation.email?.isValid && (
                <div className="space-y-3">
                  {otpState === SIGNUP_FORM_CONFIG.otpStates.NOT_SENT && (
                    <Button
                      type="button"
                      onClick={handleSendOTP}
                      disabled={otpState === SIGNUP_FORM_CONFIG.otpStates.SENDING}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {otpState === SIGNUP_FORM_CONFIG.otpStates.SENDING ? 'Sending...' : 'Send Verification Code'}
                    </Button>
                  )}

                  {[SIGNUP_FORM_CONFIG.otpStates.SENT, SIGNUP_FORM_CONFIG.otpStates.VERIFYING, SIGNUP_FORM_CONFIG.otpStates.VERIFIED].includes(otpState) && (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Input
                          type="text"
                          placeholder="Enter 6-digit code"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          maxLength={6}
                          className="flex-1 h-10 bg-slate-800/50 border-gray-600 text-white placeholder-gray-400"
                          disabled={otpState === SIGNUP_FORM_CONFIG.otpStates.VERIFIED || formState === FORM_STATES.SUBMITTING || isLoading}
                        />
                        {otpState !== SIGNUP_FORM_CONFIG.otpStates.VERIFIED && (
                          <Button
                            type="button"
                            onClick={handleVerifyOTP}
                            disabled={otp.length !== 6 || otpState === SIGNUP_FORM_CONFIG.otpStates.VERIFYING}
                            className="bg-green-600 hover:bg-green-700 text-white px-4"
                          >
                            {otpState === SIGNUP_FORM_CONFIG.otpStates.VERIFYING ? 'Verifying...' : 'Verify'}
                          </Button>
                        )}
                        {otpState === SIGNUP_FORM_CONFIG.otpStates.VERIFIED && (
                          <div className="flex items-center text-green-400">
                            <Check className="w-5 h-5" />
                          </div>
                        )}
                      </div>
                      
                      {otpTimer > 0 && (
                        <p className="text-sm text-gray-400">
                          Resend code in {Math.floor(otpTimer / 60)}:{(otpTimer % 60).toString().padStart(2, '0')}
                        </p>
                      )}
                      
                      {otpTimer === 0 && otpState !== SIGNUP_FORM_CONFIG.otpStates.VERIFIED && (
                        <Button
                          type="button"
                          onClick={handleSendOTP}
                          variant="ghost"
                          className="text-blue-400 hover:text-blue-300"
                          disabled={formState === FORM_STATES.SUBMITTING || isLoading}
                        >
                          Resend Code
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ✅ PRESERVED - Password */}
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={values.password}
                onChange={handleInputChange('password')}
                onBlur={handleInputBlur('password')}
                disabled={formState === FORM_STATES.SUBMITTING || isLoading}
                className="h-12 pl-10 pr-10 bg-slate-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={formState === FORM_STATES.SUBMITTING || isLoading}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-200 z-10 disabled:opacity-50"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
              {touched.password && errors.password && (
                <p className="text-red-400 text-sm mt-1">{errors.password}</p>
              )}
            </div>

            {/* ✅ PRESERVED - Password Strength */}
            {values.password && (
              <PasswordStrength password={values.password} />
            )}

            {/* ✅ PRESERVED - Confirm Password */}
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
              <Input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm Password"
                value={values.confirmPassword}
                onChange={handleInputChange('confirmPassword')}
                onBlur={handleInputBlur('confirmPassword')}
                disabled={formState === FORM_STATES.SUBMITTING || isLoading}
                className="h-12 pl-10 pr-10 bg-slate-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={formState === FORM_STATES.SUBMITTING || isLoading}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-200 z-10 disabled:opacity-50"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
              {touched.confirmPassword && errors.confirmPassword && (
                <p className="text-red-400 text-sm mt-1">{errors.confirmPassword}</p>
              )}
            </div>

            {/* ✅ ENHANCED - Submit Button with JWT loading state */}
            <Button
              type="submit"
              disabled={formState === FORM_STATES.SUBMITTING || isLoading || !isValid || otpState !== SIGNUP_FORM_CONFIG.otpStates.VERIFIED}
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold shadow-lg hover:shadow-blue-500/25 transition-all duration-300 disabled:cursor-not-allowed"
            >
              {formState === FORM_STATES.SUBMITTING || isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Creating Account...</span>
                </div>
              ) : (
                'Create Account'
              )}
            </Button>
          </form>

          {/* ✅ PRESERVED - Switch to Login */}
          <div className="text-center mt-6">
            <span className="text-gray-400">Already have an account? </span>
            <button
              onClick={onSwitchToLogin}
              disabled={formState === FORM_STATES.SUBMITTING || isLoading}
              className="text-blue-400 hover:text-blue-300 transition-colors font-medium disabled:opacity-50"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignUpForm;