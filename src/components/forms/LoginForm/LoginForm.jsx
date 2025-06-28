// ===== src/components/forms/LoginForm/LoginForm.jsx =====
import React, { useState, useCallback, useEffect } from 'react';
import { useFormValidation } from '../../../hooks/useFormValidation';
import { FORM_STATES } from '../../../utils/constants/validation';
import Input from '../../ui/Input/Input';
import { Button } from '../../ui/Button/Button';
import { useToast } from '../../ui/Toast';
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

// ✅ Utility Functions
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

  handleLoginSuccess: (onClose, reset, setFormState, setGoogleAuthState, message) => {
    console.log('✅ Login successful');
    if (setFormState) setFormState(FORM_STATES.SUCCESS);
    if (setGoogleAuthState) setGoogleAuthState(FORM_STATES.SUCCESS);
    setTimeout(() => {
      onClose();
      if (reset) reset();
      if (setFormState) setFormState(FORM_STATES.IDLE);
      if (setGoogleAuthState) setGoogleAuthState(FORM_STATES.IDLE);
      alert(message);
    }, LOGIN_FORM_CONFIG.timing.successDisplayTime);
  },

  handleLoginError: (setFormState, setGoogleAuthState, message) => {
    if (setFormState) setFormState(FORM_STATES.ERROR);
    if (setGoogleAuthState) setGoogleAuthState(FORM_STATES.ERROR);
    console.error('❌ Login failed:', message);
    alert(message);
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
  const { toast } = useToast();

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
            result.data.message || LOGIN_FORM_CONFIG.messages.loginSuccess
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
    [isValid, values, onClose, reset, navigate]
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
            LOGIN_FORM_CONFIG.messages.googleLoginSuccess
          );
          navigate('/home');
         } else {
          setGoogleAuthState(FORM_STATES.ERROR);
          toast.error('No account found with this email. Please sign up first.');
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
    },
    [navigate, onClose, reset]
  );

  const handleGoogleSignIn = useCallback(() => {
    if (window.google) {
      window.google.accounts.id.prompt();
    }
  }, []);

  useEffect(() => {
    if (window.google) {
      window.google.accounts.id.initialize({
        client_id: CLIENT_ID,
        callback: handleCredentialResponse,
      });
    }
  }, [handleCredentialResponse]);

  const handleClose = useCallback(
    (e) => {
      if (e.target === e.currentTarget) onClose();
    },
    [onClose]
  );

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
                     Welcome Back
                    </span>
              </h2>
              <p className="text-gray-400">
                Sign in to your account
              </p>
            </div>

            <Button
              onClick={handleGoogleSignIn}
              disabled={googleAuthState === FORM_STATES.SUBMITTING}
              variant="outline"
              className="w-full mb-6 bg-white/10 border-gray-600 hover:bg-white/20 text-white backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {googleAuthState === FORM_STATES.SUBMITTING ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Signing in with Google...</span>
                </div>
              ) : (
                <>
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
                </>
              )}
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
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
                <Input
                  type="email"
                  placeholder="your.email@example.com"
                  value={values.email}
                  onChange={handleInputChange('email')}
                  onBlur={handleInputBlur('email')}
                  className="h-12 pl-10 bg-slate-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-purple-500/20"
                />
                {touched.email && errors.email && (
                  <p className="text-red-400 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
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
                  onClick={() => alert('Forgot password functionality will be implemented soon!')}
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
    </div>
  );
}

export default LoginForm;