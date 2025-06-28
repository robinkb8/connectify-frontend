// ===== src/components/forms/SignUpForm/SignUpForm.jsx - SYNTAX FIXED =====
import React, { useState, useCallback, useEffect } from 'react';
import { useFormValidation } from '../../../hooks/useFormValidation';
import { FORM_STATES } from '../../../utils/constants/validation';
import Input from '../../ui/Input/Input';
import { Button } from '../../ui/Button/Button';
import { X, Mail, Lock, User, Phone, Eye, EyeOff } from "lucide-react";
import { toast } from '../../ui/Toast'; 

const DJANGO_API_CONFIG = {
  baseURL: 'http://127.0.0.1:8000',
  endpoints: {
    register: '/api/auth/register/',
    checkUsername: '/api/auth/check-username/',
    checkEmail: '/api/auth/check-email/',
    sendOTP: '/api/auth/send-otp/',
    verifyOTP: '/api/auth/verify-otp/'
  },
  requestConfig: {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    credentials: 'include'
  }
};

const SIGNUP_FORM_CONFIG = {
  initialValues: {
    full_name: '',
    username: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: ''
  },
  otpStates: {
    NOT_SENT: 'not_sent',
    SENDING: 'sending',
    SENT: 'sent',
    VERIFYING: 'verifying',
    VERIFIED: 'verified',
    EXPIRED: 'expired'
  },
  timing: {
    otpSendDelay: 2000,
    verificationDelay: 1500,
    successDisplayTime: 2000,
    timerDuration: 60
  },
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

const DJANGO_API_UTILS = {
  formatPhoneNumber: (value) => {
    const cleaned = value.replace(/\D/g, '');
    const truncated = cleaned.slice(0, 10);
    return truncated.length >= 6
      ? `${truncated.slice(0, 3)}-${truncated.slice(3, 6)}-${truncated.slice(6)}`
      : truncated;
  },

  makeApiCall: async (endpoint, data = null) => {
    const url = `${DJANGO_API_CONFIG.baseURL}${endpoint}`;
    const config = {
      method: data ? 'POST' : 'GET',
      ...DJANGO_API_CONFIG.requestConfig,
      ...(data && { body: JSON.stringify(data) })
    };

    const response = await fetch(url, config);
    const result = await response.json();
    
    return {
      success: response.ok,
      data: result,
      error: response.ok ? null : result.message || `HTTP ${response.status}`
    };
  }
};

function SignUpForm({ isOpen, onClose, onSwitchToLogin }) {
  const [formState, setFormState] = useState(FORM_STATES.IDLE);
  const [otpState, setOtpState] = useState(SIGNUP_FORM_CONFIG.otpStates.NOT_SENT);
  const [otp, setOtp] = useState('');
  const [otpTimer, setOtpTimer] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { values, errors, touched, isValid, handleChange, handleBlur, reset, validation } = useFormValidation(
    SIGNUP_FORM_CONFIG.initialValues
  );

  const handleInputChange = useCallback((fieldName) => (e) => {
    const value = e.target.value;
    
    if (fieldName === 'phone') {
      const formattedPhone = DJANGO_API_UTILS.formatPhoneNumber(value);
      handleChange(fieldName, formattedPhone);
    } else {
      handleChange(fieldName, value);
    }
  }, [handleChange]);

  const handleInputBlur = useCallback((fieldName) => () => {
    handleBlur(fieldName);
  }, [handleBlur]);

  const handleGoogleSignIn = useCallback(async () => {
    console.log('Google Sign-In clicked');
    alert('Google Sign-In will be implemented in the next version!');
  }, []);

  const handleSendOTP = useCallback(async () => {
    if (!validation.email?.isValid) return;

    setOtpState(SIGNUP_FORM_CONFIG.otpStates.SENDING);
    
    try {
      const result = await DJANGO_API_UTILS.makeApiCall(
        DJANGO_API_CONFIG.endpoints.sendOTP,
        { email: values.email }
      );

      if (result.success) {
        setOtpState(SIGNUP_FORM_CONFIG.otpStates.SENT);
        setOtpTimer(SIGNUP_FORM_CONFIG.timing.timerDuration);
        console.log('✅ OTP sent successfully');
      } else {
        setOtpState(SIGNUP_FORM_CONFIG.otpStates.NOT_SENT);
        toast.error(`Failed to send OTP: ${result.error}`);
      }
    } catch (error) {
      setOtpState(SIGNUP_FORM_CONFIG.otpStates.NOT_SENT);
      console.error('OTP sending error:', error);
      toast.error(SIGNUP_FORM_CONFIG.messages.serverError);
    }
  }, [values.email, validation.email]);

  const handleVerifyOTP = useCallback(async () => {
    if (otp.length !== 6) return;

    setOtpState(SIGNUP_FORM_CONFIG.otpStates.VERIFYING);
    
    try {
      const result = await DJANGO_API_UTILS.makeApiCall(
        DJANGO_API_CONFIG.endpoints.verifyOTP,
        { email: values.email, otp_code: otp }
      );

      if (result.success) {
        setOtpState(SIGNUP_FORM_CONFIG.otpStates.VERIFIED);
        console.log('✅ OTP verified successfully');
      } else {
        setOtpState(SIGNUP_FORM_CONFIG.otpStates.SENT);
        toast.error(SIGNUP_FORM_CONFIG.messages.invalidOtp);
        setOtp('');
      }
    } catch (error) {
      setOtpState(SIGNUP_FORM_CONFIG.otpStates.SENT);
      console.error('OTP verification error:', error);
      alert(SIGNUP_FORM_CONFIG.messages.serverError);
    }
  }, [values.email, otp]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    if (!isValid || otpState !== SIGNUP_FORM_CONFIG.otpStates.VERIFIED) {
      toast.warning('Please complete all fields and verify your email first.');
      return;
    }

    setFormState(FORM_STATES.SUBMITTING);

    try {
      const result = await DJANGO_API_UTILS.makeApiCall(
        DJANGO_API_CONFIG.endpoints.register,
        {
          full_name: values.full_name,
          username: values.username,
          phone: values.phone.replace(/\D/g, ''),
          email: values.email,
          password: values.password
        }
      );

      if (result.success) {
        setFormState(FORM_STATES.SUCCESS);
        console.log('✅ Account created successfully:', result.data);

        setTimeout(() => {
          onClose();
          setFormState(FORM_STATES.IDLE);
          setOtpState(SIGNUP_FORM_CONFIG.otpStates.NOT_SENT);
          setOtp('');
          reset();
          toast.success('Account created successfully! You can now login.');
        }, SIGNUP_FORM_CONFIG.timing.successDisplayTime);
      } else {
        setFormState(FORM_STATES.ERROR);
        alert(`Registration failed: ${result.error}`);
        setTimeout(() => setFormState(FORM_STATES.IDLE), 3000);
      }
    } catch (error) {
      setFormState(FORM_STATES.ERROR);
      console.error('Registration error:', error);
      alert(SIGNUP_FORM_CONFIG.messages.serverError);
      setTimeout(() => setFormState(FORM_STATES.IDLE), 3000);
    }
  }, [isValid, otpState, onClose, reset, values]);

  useEffect(() => {
    if (otpTimer > 0) {
      const timer = setTimeout(() => setOtpTimer(otpTimer - 1), 1000);
      return () => clearTimeout(timer);
    } else if (otpTimer === 0 && otpState === SIGNUP_FORM_CONFIG.otpStates.SENT) {
      setOtpState(SIGNUP_FORM_CONFIG.otpStates.EXPIRED);
    }
  }, [otpTimer, otpState]);

  const handleClose = useCallback((e) => {
    if (e.target === e.currentTarget) onClose();
  }, [onClose]);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />
      
      <div className="relative w-full max-w-md">
        <div className="relative bg-gradient-to-br from-slate-900 via-blue-900/20 to-slate-900 rounded-3xl border border-blue-500/20 shadow-2xl backdrop-blur-xl">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-teal-500/10 rounded-3xl" />

          <div className="relative p-8">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-slate-800/50 hover:bg-slate-700/50 text-gray-400 hover:text-white transition-all duration-200"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2">
               <span className="bg-gradient-to-r from-blue-400 to-teal-400 bg-clip-text text-transparent">
                        Join Connectify
                  </span>
              </h2>
              <p className="text-gray-400">
                {otpState === SIGNUP_FORM_CONFIG.otpStates.VERIFIED
                  ? 'Email verified! Complete your registration'
                  : 'Create your account and start connecting'}
              </p>
            </div>

            <Button
              onClick={handleGoogleSignIn}
              variant="outline"
              className="w-full mb-6 bg-white/10 border-gray-600 hover:bg-white/20 text-white backdrop-blur-sm"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </Button>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-600" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-slate-900 text-gray-400">or</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
                <Input
                  type="text"
                  placeholder="Enter your full name"
                  value={values.full_name}
                  onChange={handleInputChange('full_name')}
                  onBlur={handleInputBlur('full_name')}
                  className="h-12 pl-10 bg-slate-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20"
                />
                {touched.full_name && errors.full_name && (
                  <p className="text-red-400 text-sm mt-1">{errors.full_name}</p>
                )}
              </div>

              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
                <Input
                  type="text"
                  placeholder="Choose a unique username"
                  value={values.username}
                  onChange={handleInputChange('username')}
                  onBlur={handleInputBlur('username')}
                  className="h-12 pl-10 bg-slate-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20"
                />
                {touched.username && errors.username && (
                  <p className="text-red-400 text-sm mt-1">{errors.username}</p>
                )}
              </div>

              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
                <Input
                  type="tel"
                  placeholder="Phone number"
                  value={values.phone}
                  onChange={handleInputChange('phone')}
                  onBlur={handleInputBlur('phone')}
                  className="h-12 pl-10 bg-slate-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20"
                />
                {touched.phone && errors.phone && (
                  <p className="text-red-400 text-sm mt-1">{errors.phone}</p>
                )}
              </div>

              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={values.email}
                  onChange={handleInputChange('email')}
                  onBlur={handleInputBlur('email')}
                  disabled={otpState === SIGNUP_FORM_CONFIG.otpStates.VERIFIED}
                  className="h-12 pl-10 pr-24 bg-slate-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-purple-500/20 disabled:opacity-50"
                />
                {otpState === SIGNUP_FORM_CONFIG.otpStates.NOT_SENT && validation.email?.isValid && (
                  <Button
                    type="button"
                    onClick={handleSendOTP}
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white text-xs"
                  >
                    Send OTP
                  </Button>
                )}
                {otpState === SIGNUP_FORM_CONFIG.otpStates.VERIFIED && (
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-green-600 text-white text-xs px-3 py-1 rounded">
                    ✓ Verified
                  </div>
                )}
                {touched.email && errors.email && (
                  <p className="text-red-400 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              {(otpState === SIGNUP_FORM_CONFIG.otpStates.SENT || 
                otpState === SIGNUP_FORM_CONFIG.otpStates.EXPIRED || 
                otpState === SIGNUP_FORM_CONFIG.otpStates.VERIFIED ||
                otpState === SIGNUP_FORM_CONFIG.otpStates.VERIFYING) && (
                <div className="bg-slate-800/30 rounded-xl p-4 border border-purple-500/20">
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
                    <Input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="123456"
                      maxLength={6}
                      className="flex-1 bg-slate-700/50 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-400 text-center tracking-widest"
                      disabled={otpState === SIGNUP_FORM_CONFIG.otpStates.VERIFIED || otpState === SIGNUP_FORM_CONFIG.otpStates.VERIFYING}
                    />
                    
                    {otpState === SIGNUP_FORM_CONFIG.otpStates.SENT && otp.length === 6 && (
                      <Button
                        type="button"
                        onClick={handleVerifyOTP}
                        disabled={otpState === SIGNUP_FORM_CONFIG.otpStates.VERIFYING}
                        size="sm"
                        className="bg-green-500 hover:bg-green-600 text-white disabled:opacity-50"
                      >
                        {otpState === SIGNUP_FORM_CONFIG.otpStates.VERIFYING ? 'Verifying...' : 'Verify'}
                      </Button>
                    )}
                  </div>
                </div>
              )}

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
                  value={values.password}
                  onChange={handleInputChange('password')}
                  onBlur={handleInputBlur('password')}
                  className="h-12 pl-10 pr-10 bg-slate-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-purple-500/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-200 z-10"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
                {touched.password && errors.password && (
                  <p className="text-red-400 text-sm mt-1">{errors.password}</p>
                )}
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Re-enter your password"
                  value={values.confirmPassword}
                  onChange={handleInputChange('confirmPassword')}
                  onBlur={handleInputBlur('confirmPassword')}
                  className="h-12 pl-10 pr-10 bg-slate-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-purple-500/20"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-200 z-10"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
                {touched.confirmPassword && errors.confirmPassword && (
                  <p className="text-red-400 text-sm mt-1">{errors.confirmPassword}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={formState === FORM_STATES.SUBMITTING || !isValid || otpState !== SIGNUP_FORM_CONFIG.otpStates.VERIFIED}
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold shadow-lg hover:shadow-blue-500/25 transition-all duration-300 disabled:cursor-not-allowed"
              >
                {formState === FORM_STATES.SUBMITTING ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Creating Account...</span>
                  </div>
                ) : otpState !== SIGNUP_FORM_CONFIG.otpStates.VERIFIED ? (
                  'Verify Email First'
                ) : (
                  'Create Account'
                )}
              </Button>
            </form>

            <div className="text-center mt-6">
              <span className="text-gray-400">Already have an account? </span>
              <button
                onClick={onSwitchToLogin}
                className="text-blue-400 hover:text-blue-300 transition-colors font-medium"
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignUpForm;