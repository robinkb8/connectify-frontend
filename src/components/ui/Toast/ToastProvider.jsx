 
// ===== src/components/ui/Toast/ToastProvider.jsx =====
import React, { createContext, useContext, useState, useCallback } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Info, 
  X 
} from 'lucide-react';

// ✅ Toast Types
export const TOAST_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

// ✅ Toast Context
const ToastContext = createContext();

// ✅ Individual Toast Component
const Toast = ({ toast, onRemove }) => {
  const [isLeaving, setIsLeaving] = useState(false);

  const handleRemove = () => {
    setIsLeaving(true);
    setTimeout(() => onRemove(toast.id), 300); // Animation duration
  };

  // Auto-dismiss after duration
  React.useEffect(() => {
    if (toast.duration > 0) {
      const timer = setTimeout(handleRemove, toast.duration);
      return () => clearTimeout(timer);
    }
  }, [toast.duration]);

  const getToastStyles = () => {
    switch (toast.type) {
      case TOAST_TYPES.SUCCESS:
        return {
          bg: 'bg-green-50 dark:bg-green-900/20',
          border: 'border-green-200 dark:border-green-800',
          icon: <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />,
          text: 'text-green-800 dark:text-green-200'
        };
      case TOAST_TYPES.ERROR:
        return {
          bg: 'bg-red-50 dark:bg-red-900/20',
          border: 'border-red-200 dark:border-red-800',
          icon: <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />,
          text: 'text-red-800 dark:text-red-200'
        };
      case TOAST_TYPES.WARNING:
        return {
          bg: 'bg-yellow-50 dark:bg-yellow-900/20',
          border: 'border-yellow-200 dark:border-yellow-800',
          icon: <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />,
          text: 'text-yellow-800 dark:text-yellow-200'
        };
      case TOAST_TYPES.INFO:
        return {
          bg: 'bg-blue-50 dark:bg-blue-900/20',
          border: 'border-blue-200 dark:border-blue-800',
          icon: <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
          text: 'text-blue-800 dark:text-blue-200'
        };
      default:
        return {
          bg: 'bg-gray-50 dark:bg-gray-800',
          border: 'border-gray-200 dark:border-gray-700',
          icon: <Info className="w-5 h-5 text-gray-600 dark:text-gray-400" />,
          text: 'text-gray-800 dark:text-gray-200'
        };
    }
  };

  const styles = getToastStyles();

  return (
    <div
      className={`
        transform transition-all duration-300 ease-in-out mb-3
        ${isLeaving 
          ? 'translate-x-full opacity-0' 
          : 'translate-x-0 opacity-100'
        }
      `}
    >
      <div className={`
        max-w-sm w-full ${styles.bg} border ${styles.border} rounded-lg shadow-lg p-4
        backdrop-blur-sm
      `}>
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {styles.icon}
          </div>
          <div className="ml-3 w-0 flex-1">
            {toast.title && (
              <h4 className={`text-sm font-semibold ${styles.text} mb-1`}>
                {toast.title}
              </h4>
            )}
            <p className={`text-sm ${styles.text}`}>
              {toast.message}
            </p>
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              onClick={handleRemove}
              className={`
                inline-flex text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 
                focus:outline-none focus:text-gray-600 dark:focus:text-gray-200 
                transition-colors duration-200
              `}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ✅ Toast Container Component
const ToastContainer = ({ toasts, removeToast }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[9999] max-w-sm w-full">
      {toasts.map((toast) => (
        <Toast 
          key={toast.id} 
          toast={toast} 
          onRemove={removeToast}
        />
      ))}
    </div>
  );
};

// ✅ Toast Provider Component
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((toast) => {
    const id = Date.now() + Math.random();
    const newToast = {
      id,
      type: TOAST_TYPES.INFO,
      duration: 5000, // 5 seconds default
      ...toast
    };

    setToasts(prev => [newToast, ...prev]);
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  // Toast helper methods
  const toast = {
    success: (message, options = {}) => addToast({
      type: TOAST_TYPES.SUCCESS,
      message,
      title: options.title || 'Success',
      ...options
    }),
    
    error: (message, options = {}) => addToast({
      type: TOAST_TYPES.ERROR,
      message,
      title: options.title || 'Error',
      duration: 7000, // Errors stay longer
      ...options
    }),
    
    warning: (message, options = {}) => addToast({
      type: TOAST_TYPES.WARNING,
      message,
      title: options.title || 'Warning',
      ...options
    }),
    
    info: (message, options = {}) => addToast({
      type: TOAST_TYPES.INFO,
      message,
      title: options.title || 'Info',
      ...options
    }),

    // Custom toast
    custom: (options) => addToast(options)
  };

  const value = {
    toasts,
    addToast,
    removeToast,
    clearAllToasts,
    toast
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}

// ✅ Hook to use Toast
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// ✅ Export everything
export default ToastProvider;