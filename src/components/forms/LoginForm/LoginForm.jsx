// ===== src/components/forms/LoginForm/LoginForm.jsx =====
import React, { useState, useCallback, useEffect } from 'react';
import { useFormValidation } from '../../../hooks/useFormValidation';
import { FORM_STATES } from '../../../utils/constants/validation';
import Input from '../../ui/Input/Input';
import { Button } from '../../ui/Button/Button';
import { useToast } from '../../ui/Toast';  // ✅ CORRECT IMPORT
import { X, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// ✅ Google Client ID
const CLIENT_ID = '1030493380102-arir8r2f12aemko0ksdd4hlh6m2qgu5h.apps.googleusercontent.com';

// ✅ Decode Google ID token
const decodeJwt = (token) => {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split('')
      .map((char) => `%${('00' + char.charCodeAt(0).toString(16)).slice(-2)}`)
      .join('')
  );
  return JSON.parse(jsonPayload);
};

// ✅ API Config
const DJANGO_API_CONFIG = {
  baseURL: 'http://127.0.0.1:8000',
  endpoints: {
    login: '/api/auth/login/',
    checkEmail: '/api/auth/check-email/',
  },
  requestConfig: {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    credentials: 'include',
  },
};

// ✅ Form Config
const LOGIN_FORM_CONFIG = {
  initialValues: {
    email: '',
    password: '',
  },
  timing: {
    errorDisplayTime: 3000,
    successDisplayTime: 2000,
  },
  messages: {
    loginSuccess: 'Login successful! Redirecting...',
    loginFailed: 'Invalid email or password. Please try again.',
    accountNotFound: 'No account found with this email. Please sign up first.',
    googleAuthStart: 'Starting Google authentication...',
    googleAuthSuccess: 'Google authentication successful!',
    googleLoginSuccess: 'Logged in with Google successfully!',
    networkError: 'Network error. Please check your connection.',
    serverError: 'Server error. Please try again later.',
  },
};

// ✅ FIXED Utility Functions - Now accepts toast parameter
const LOGIN_FORM_UTILS = {
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

  checkEmailExists: async (email) => {
    const result = await LOGIN_FORM_UTILS.makeApiCall(
      DJANGO_API_CONFIG.endpoints.checkEmail,
      { email }
    );
    return {
      available: result.data.available,
      exists: result.data.exists,
    };
  },

  // ✅ FIXED: Added toast parameter
  handleLoginSuccess: (onClose, reset, setFormState, setGoogleAuthState, message, toast) => {
    console.log('✅ Login successful');
    if (setFormState) setFormState(FORM_STATES.SUCCESS);
    if (setGoogleAuthState) setGoogleAuthState(FORM_STATES.SUCCESS);
    toast.success(message); // ✅ Use toast instead of alert
    setTimeout(() => {
      onClose();
      if (reset) reset();
      if (setFormState) setFormState(FORM_STATES.IDLE);
      if (setGoogleAuthState) setGoogleAuthState(FORM_STATES.IDLE);
    }, LOGIN_FORM_CONFIG.timing.successDisplayTime);
  },

  // ✅ FIXED: Added toast parameter
  handleLoginError: (setFormState, setGoogleAuthState, message, toast) => {
    if (setFormState) setFormState(FORM_STATES.ERROR);
    if (setGoogleAuthState) setGoogleAuthState(FORM_STATES.ERROR);
    console.error('❌ Login failed:', message);
    toast.error(message); // ✅ Use toast instead of alert
    setTimeout(() => {
      if (setFormState) setFormState(FORM_STATES.IDLE);
      if (setGoogleAuthState) setGoogleAuthState(FORM_STATES.IDLE);
    }, LOGIN_FORM_CONFIG.timing.errorDisplayTime);
  },
};

// ✅ Component Starts
function LoginForm({ isOpen, onClose, onSwitchToSignUp }) {
  const [formState, setFormState] = useState(FORM_STATES.IDLE);
  const [googleAuthState, setGoogleAuthState] = useState(FORM_STATES.IDLE);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast(); // ✅ CORRECT HOOK USAGE

  const {
    values,
    errors,
    touched,
    isValid,
    handleChange,
    handleBlur,
    reset,
  } = useFormValidation(LOGIN_FORM_CONFIG.initialValues);

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

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (!isValid) {
        toast.error('Please fill in all fields correctly.');
        return;
      }

      setFormState(FORM_STATES.SUBMITTING);
      try {
        const result = await LOGIN_FORM_UTILS.makeApiCall(
          DJANGO_API_CONFIG.endpoints.login,
          {
            email: values.email,
            password: values.password,
          }
        );

        if (result.success) {
          toast.success('Login successful! Redirecting...'); 
          navigate('/home');
          LOGIN_FORM_UTILS.handleLoginSuccess(
            onClose,
            reset,
            setFormState,
            null,
            result.data.message || LOGIN_FORM_CONFIG.messages.loginSuccess,
            toast // ✅ FIXED: Added comma and toast parameter
          );
        } else {
          setFormState(FORM_STATES.ERROR);
          toast.error(`Login failed: ${result.error}`);
          setTimeout(() => setFormState(FORM_STATES.IDLE), 3000);
        }
      } catch (error) {
        setFormState(FORM_STATES.ERROR);
        console.error('Login error:', error);
        toast.error('Server error. Please try again later.'); 
        setTimeout(() => setFormState(FORM_STATES.IDLE), 3000);
      }
    },
    [isValid, values, onClose, reset, navigate, toast] // ✅ Added toast to dependencies
  );

  const handleCredentialResponse = useCallback(
    async (response) => {
      try {
        const decoded = decodeJwt(response.credential);
        const googleUser = {
          email: decoded.email,
          name: decoded.name,
          picture: decoded.picture,
        };

        console.log('✅ Google User:', googleUser);

        const emailCheck = await LOGIN_FORM_UTILS.checkEmailExists(
          googleUser.email
        );

        if (!emailCheck.available) {
          LOGIN_FORM_UTILS.handleLoginSuccess(
            onClose,
            reset,
            null,
            setGoogleAuthState,
            LOGIN_FORM_CONFIG.messages.googleLoginSuccess,
            toast // ✅ FIXED: Added toast parameter
          );
          navigate('/home');
        } else {
          setGoogleAuthState(FORM_STATES.ERROR);
          toast.error('No account found with this email. Please sign up first.');
          setTimeout(() => setGoogleAuthState(FORM_STATES.IDLE), 3000);
        }
      } catch (error) {
        console.error('Google auth error:', error);
        LOGIN_FORM_UTILS.handleLoginError(
          null,
          setGoogleAuthState,
          LOGIN_FORM_CONFIG.messages.serverError,
          toast // ✅ FIXED: Added toast parameter
        );
      }
    },
    [onClose, reset, navigate, toast] // ✅ Added toast to dependencies
  );

  // ✅ Google OAuth Setup
  useEffect(() => {
    if (!window.google || !isOpen) return;

    try {
      window.google.accounts.id.initialize({
        client_id: CLIENT_ID,
        callback: handleCredentialResponse,
      });

      window.google.accounts.id.renderButton(
        document.getElementById('google-login-button'),
        {
          theme: 'outline',
          size: 'large',
          width: 350,
          text: 'signin_with',
        }
      );
    } catch (error) {
      console.error('Google OAuth setup error:', error);
    }
  }, [isOpen, handleCredentialResponse]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-slate-800 rounded-2xl w-full max-w-md max-h-[90vh] overflow-hidden shadow-2xl border border-gray-700 animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="relative bg-gradient-to-r from-slate-800 to-slate-700 p-6 border-b border-gray-700">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors duration-200"
          >
            <X className="w-6 h-6" />
          </button>
          
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-2">Welcome Back</h2>
            <p className="text-gray-300">Sign in to continue to Connectify</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 bg-slate-800">
          
          {/* Google Login Button */}
          <div className="mb-6">
            <div 
              id="google-login-button" 
              className="w-full flex justify-center"
            ></div>
          </div>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-slate-800 text-gray-400">Or continue with email</span>
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Email Input */}
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
              <Input
                type="email"
                placeholder="Enter your email"
                value={values.email}
                onChange={handleInputChange('email')}
                onBlur={handleInputBlur('email')}
                className="h-12 pl-10 bg-slate-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20"
              />
              {touched.email && errors.email && (
                <p className="text-red-400 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            {/* Password Input */}
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
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

            <div className="text-right">
              <button
                type="button"
                className="text-sm text-blue-400 hover:text-blue-300 transition-colors duration-200"
                onClick={() => toast.info('Forgot password functionality will be implemented soon!')} // ✅ FIXED: Use toast
              >
                Forgot your password?
              </button>
            </div>

            <Button
              type="submit"
              disabled={formState === FORM_STATES.SUBMITTING || !isValid}
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold shadow-lg hover:shadow-blue-500/25 transition-all duration-300 disabled:cursor-not-allowed"
            >
              {formState === FORM_STATES.SUBMITTING ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Signing In...</span>
                </div>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          <div className="text-center mt-6">
            <span className="text-gray-400">Don't have an account? </span>
            <button
              onClick={onSwitchToSignUp}
              className="text-blue-400 hover:text-blue-300 transition-colors font-medium"
            >
              Sign Up
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginForm;