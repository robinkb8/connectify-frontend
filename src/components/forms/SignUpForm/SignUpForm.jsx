// ===== src/components/forms/SignUpForm/SignUpForm.jsx =====
import React, { useState, useCallback, useEffect } from 'react';
import { useFormValidation } from '../../../hooks/useFormValidation';
import { FORM_STATES } from '../../../utils/constants/validation';
import Input from '../../ui/Input/Input';
import { Button } from '../../ui/Button/Button';
import { useToast } from '../../ui/Toast'; // ✅ CORRECT IMPORT
import PasswordStrength from './PasswordStrength';
import { X, Mail, Lock, User, Phone, Eye, EyeOff, Check } from 'lucide-react';

// ✅ API Configuration
const DJANGO_API_CONFIG = {
  baseURL: 'http://127.0.0.1:8000',
  endpoints: {
    checkEmail: '/api/auth/check-email/',
    checkUsername: '/api/auth/check-username/',
    sendOTP: '/api/auth/send-otp/',
    verifyOTP: '/api/auth/verify-otp/',
    register: '/api/auth/register/',
  },
  requestConfig: {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    credentials: 'include',
  },
};

// ✅ Form Configuration
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
    accountCreated: 'Account created successfully! You can now login.',
  },
};

// ✅ Utility Functions
const DJANGO_API_UTILS = {
  makeApiCall: async (endpoint, data = null) => {
    const url = `${DJANGO_API_CONFIG.baseURL}${endpoint}`;
    const config = {
      method: data ? 'POST' : 'GET',
      ...DJANGO_API_CONFIG.requestConfig,
      ...(data && { body: JSON.stringify(data) }),
    };
    const response = await fetch(url, config);
    const result = await response.json();
    return {
      success: response.ok,
      data: result,
      error: response.ok ? null : result.message || `HTTP ${response.status}`,
    };
  },
};

// ✅ Main Component
function SignUpForm({ isOpen, onClose, onSwitchToLogin }) {
  const [formState, setFormState] = useState(FORM_STATES.IDLE);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [otpState, setOtpState] = useState(SIGNUP_FORM_CONFIG.otpStates.NOT_SENT);
  const [otp, setOtp] = useState('');
  const [otpTimer, setOtpTimer] = useState(0);
  const { toast } = useToast(); // ✅ CORRECT HOOK USAGE

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

  // ✅ OTP Timer Effect
  useEffect(() => {
    let interval;
    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpTimer]);

  // ✅ Input Handlers
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
        toast.success('OTP sent to your email!'); // ✅ FIXED: Use toast
        console.log('✅ OTP sent successfully');
      } else {
        setOtpState(SIGNUP_FORM_CONFIG.otpStates.NOT_SENT);
        toast.error(`Failed to send OTP: ${result.error}`); // ✅ FIXED: Use toast
      }
    } catch (error) {
      setOtpState(SIGNUP_FORM_CONFIG.otpStates.NOT_SENT);
      console.error('OTP sending error:', error);
      toast.error(SIGNUP_FORM_CONFIG.messages.serverError); // ✅ FIXED: Use toast
    }
  }, [values.email, validation.email, toast]);

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
        toast.success('Email verified successfully!'); // ✅ FIXED: Use toast
        console.log('✅ OTP verified successfully');
      } else {
        setOtpState(SIGNUP_FORM_CONFIG.otpStates.SENT);
        toast.error(SIGNUP_FORM_CONFIG.messages.invalidOtp); // ✅ FIXED: Use toast
        setOtp('');
      }
    } catch (error) {
      setOtpState(SIGNUP_FORM_CONFIG.otpStates.SENT);
      console.error('OTP verification error:', error);
      toast.error(SIGNUP_FORM_CONFIG.messages.serverError); // ✅ FIXED: Use toast
    }
  }, [values.email, otp, toast]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    if (!isValid || otpState !== SIGNUP_FORM_CONFIG.otpStates.VERIFIED) {
      toast.warning('Please complete all fields and verify your email first.'); // ✅ FIXED: Use toast
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
          toast.success('Account created successfully! You can now login.'); // ✅ FIXED: Use toast
        }, SIGNUP_FORM_CONFIG.timing.successDisplayTime);
      } else {
        setFormState(FORM_STATES.ERROR);
        toast.error(`Registration failed: ${result.error}`); // ✅ FIXED: Use toast
        setTimeout(() => setFormState(FORM_STATES.IDLE), SIGNUP_FORM_CONFIG.timing.errorDisplayTime);
      }
    } catch (error) {
      setFormState(FORM_STATES.ERROR);
      console.error('Registration error:', error);
      toast.error(SIGNUP_FORM_CONFIG.messages.serverError); // ✅ FIXED: Use toast
      setTimeout(() => setFormState(FORM_STATES.IDLE), SIGNUP_FORM_CONFIG.timing.errorDisplayTime);
    }
  }, [isValid, otpState, values, onClose, reset, toast]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-slate-800 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-700 animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-slate-800 to-slate-700 p-6 border-b border-gray-700 z-10">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors duration-200"
          >
            <X className="w-6 h-6" />
          </button>
          
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-2">Join Connectify</h2>
            <p className="text-gray-300">Create your account to get started</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 bg-slate-800">
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Full Name */}
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
              <Input
                type="text"
                placeholder="Full Name"
                value={values.full_name}
                onChange={handleInputChange('full_name')}
                onBlur={handleInputBlur('full_name')}
                className="h-12 pl-10 bg-slate-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20"
              />
              {touched.full_name && errors.full_name && (
                <p className="text-red-400 text-sm mt-1">{errors.full_name}</p>
              )}
            </div>

            {/* Username */}
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
              <Input
                type="text"
                placeholder="Username"
                value={values.username}
                onChange={handleInputChange('username')}
                onBlur={handleInputBlur('username')}
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

            {/* Phone */}
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
              <Input
                type="tel"
                placeholder="Phone Number"
                value={values.phone}
                onChange={handleInputChange('phone')}
                onBlur={handleInputBlur('phone')}
                className="h-12 pl-10 bg-slate-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20"
              />
              {touched.phone && errors.phone && (
                <p className="text-red-400 text-sm mt-1">{errors.phone}</p>
              )}
            </div>

            {/* Email with OTP */}
            <div className="space-y-2">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
                <Input
                  type="email"
                  placeholder="Email Address"
                  value={values.email}
                  onChange={handleInputChange('email')}
                  onBlur={handleInputBlur('email')}
                  className="h-12 pl-10 bg-slate-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20"
                />
                {touched.email && errors.email && (
                  <p className="text-red-400 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              {/* OTP Section */}
              {validation.email?.isValid && (
                <div className="space-y-3">
                  {otpState === SIGNUP_FORM_CONFIG.otpStates.NOT_SENT && (
                    <Button
                      type="button"
                      onClick={handleSendOTP}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Send Verification Code
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
                          disabled={otpState === SIGNUP_FORM_CONFIG.otpStates.VERIFIED}
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
                        >
                          Resend Code
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Password */}
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={values.password}
                onChange={handleInputChange('password')}
                onBlur={handleInputBlur('password')}
                className="h-12 pl-10 pr-10 bg-slate-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20"
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

            {/* Password Strength */}
            {values.password && (
              <PasswordStrength password={values.password} />
            )}

            {/* Confirm Password */}
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
              <Input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm Password"
                value={values.confirmPassword}
                onChange={handleInputChange('confirmPassword')}
                onBlur={handleInputBlur('confirmPassword')}
                className="h-12 pl-10 pr-10 bg-slate-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20"
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
  );
}

export default SignUpForm;