// ===== src/components/ui/AnimatedButton/AnimatedButton.jsx - PRODUCTION QUALITY =====
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '../Button/Button';

// ✅ Enhanced Button with Press Feedback
const AnimatedButton = ({ 
  children,
  onClick,
  onAsyncClick,
  variant = "default",
  size = "default",
  className = "",
  disabled = false,
  loading = false,
  haptic = true,
  ripple = true,
  pressScale = 0.95,
  pressDuration = 150,
  ...props
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const [isLoading, setIsLoading] = useState(loading);
  const [ripples, setRipples] = useState([]);
  const buttonRef = useRef(null);
  const rippleIdRef = useRef(0);

  // ✅ Trigger haptic feedback (mobile)
  const triggerHaptic = () => {
    if (haptic && 'vibrate' in navigator) {
      navigator.vibrate(10); // Very subtle vibration
    }
  };

  // ✅ Create ripple effect
  const createRipple = (event) => {
    if (!ripple || disabled || isLoading) return;

    const button = buttonRef.current;
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    const newRipple = {
      id: rippleIdRef.current++,
      x,
      y,
      size
    };

    setRipples(prev => [...prev, newRipple]);

    // Remove ripple after animation
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== newRipple.id));
    }, 600);
  };

  // ✅ Handle button press with sophisticated feedback
  const handleMouseDown = (event) => {
    if (disabled || isLoading) return;

    setIsPressed(true);
    createRipple(event);
    triggerHaptic();
  };

  const handleMouseUp = () => {
    setTimeout(() => setIsPressed(false), pressDuration);
  };

  const handleMouseLeave = () => {
    setIsPressed(false);
  };

  // ✅ Handle click with async support
  const handleClick = async (event) => {
    if (disabled || isLoading) return;

    if (onAsyncClick) {
      setIsLoading(true);
      try {
        await onAsyncClick(event);
      } finally {
        setIsLoading(false);
      }
    } else {
      onClick?.(event);
    }
  };

  // ✅ Dynamic styles based on state
  const getButtonStyles = () => {
    let transform = 'scale(1)';
    let transition = 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)';

    if (isPressed && !disabled && !isLoading) {
      transform = `scale(${pressScale})`;
      transition = 'all 0.1s cubic-bezier(0.4, 0, 0.2, 1)';
    }

    return { transform, transition };
  };

  // ✅ Get loading spinner
  const LoadingSpinner = () => (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin opacity-70" />
    </div>
  );

  return (
    <Button
      ref={buttonRef}
      variant={variant}
      size={size}
      className={`
        relative overflow-hidden transition-all duration-150
        ${isPressed ? 'shadow-inner' : ''}
        ${isLoading ? 'cursor-wait' : ''}
        ${className}
      `}
      disabled={disabled || isLoading}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      style={getButtonStyles()}
      {...props}
    >
      {/* ✅ Button Content */}
      <span className={`relative z-10 flex items-center ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-200`}>
        {children}
      </span>

      {/* ✅ Loading State */}
      {isLoading && <LoadingSpinner />}

      {/* ✅ Ripple Effects */}
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className="absolute bg-white/30 rounded-full pointer-events-none animate-ripple"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: ripple.size,
            height: ripple.size,
            transform: 'scale(0)',
            transformOrigin: 'center'
          }}
        />
      ))}
    </Button>
  );
};

// ✅ Floating Action Button with advanced feedback
export const FloatingActionButton = ({ 
  children, 
  onClick,
  onAsyncClick,
  className = "",
  variant = "primary",
  size = "lg",
  disabled = false,
  loading = false,
  pulsate = false,
  ...props 
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseDown = () => {
    if (!disabled && !loading) {
      setIsPressed(true);
      if ('vibrate' in navigator) navigator.vibrate(15);
    }
  };

  const handleMouseUp = () => {
    setTimeout(() => setIsPressed(false), 100);
  };

  const getStyles = () => {
    let transform = 'scale(1)';
    let boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';

    if (isPressed) {
      transform = 'scale(0.9)';
      boxShadow = '0 2px 8px rgba(0, 0, 0, 0.2)';
    } else if (isHovered) {
      transform = 'scale(1.05)';
      boxShadow = '0 6px 20px rgba(0, 0, 0, 0.25)';
    }

    return {
      transform,
      boxShadow,
      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
    };
  };

  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-14 h-14', 
    lg: 'w-16 h-16',
    xl: 'w-20 h-20'
  };

  const variantClasses = {
    primary: 'bg-gradient-to-r from-blue-600 to-purple-600 text-white',
    secondary: 'bg-white text-gray-800 border border-gray-200',
    danger: 'bg-gradient-to-r from-red-500 to-pink-600 text-white'
  };

  return (
    <AnimatedButton
      className={`
        ${sizeClasses[size]} 
        ${variantClasses[variant]}
        rounded-full flex items-center justify-center
        transition-all duration-200 hover:shadow-lg
        ${pulsate ? 'animate-pulse' : ''}
        ${className}
      `}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      onAsyncClick={onAsyncClick}
      disabled={disabled}
      loading={loading}
      style={getStyles()}
      {...props}
    >
      {children}
    </AnimatedButton>
  );
};

// ✅ Icon Button with subtle feedback
export const IconButton = ({ 
  icon: Icon, 
  label,
  onClick,
  onAsyncClick,
  variant = "ghost",
  size = "md",
  active = false,
  disabled = false,
  loading = false,
  badge,
  className = "",
  ...props 
}) => {
  const [isPressed, setIsPressed] = useState(false);

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24
  };

  return (
    <div className="relative">
      <AnimatedButton
        variant={variant}
        className={`
          ${sizeClasses[size]} rounded-full flex items-center justify-center
          ${active ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600' : ''}
          ${className}
        `}
        onClick={onClick}
        onAsyncClick={onAsyncClick}
        disabled={disabled}
        loading={loading}
        title={label}
        pressScale={0.9}
        {...props}
      >
        <Icon size={iconSizes[size]} />
      </AnimatedButton>

      {/* Badge */}
      {badge && (
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
          {badge}
        </span>
      )}
    </div>
  );
};

// ✅ Toggle Button with state feedback
export const ToggleButton = ({ 
  active = false, 
  onChange, 
  children,
  activeColor = "blue",
  size = "md",
  disabled = false,
  className = "",
  ...props 
}) => {
  const [isActive, setIsActive] = useState(active);

  const handleClick = () => {
    if (disabled) return;
    
    const newState = !isActive;
    setIsActive(newState);
    onChange?.(newState);
  };

  const colorClasses = {
    blue: isActive ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 border-blue-300' : '',
    green: isActive ? 'bg-green-100 dark:bg-green-900/20 text-green-600 border-green-300' : '',
    purple: isActive ? 'bg-purple-100 dark:bg-purple-900/20 text-purple-600 border-purple-300' : ''
  };

  return (
    <AnimatedButton
      variant={isActive ? "secondary" : "ghost"}
      size={size}
      className={`
        transition-all duration-200
        ${colorClasses[activeColor]}
        ${className}
      `}
      onClick={handleClick}
      disabled={disabled}
      pressScale={0.95}
      {...props}
    >
      {children}
    </AnimatedButton>
  );
};

// ✅ CSS Animations
export const ButtonAnimationStyles = () => (
  <style jsx global>{`
    @keyframes ripple {
      0% {
        transform: scale(0);
        opacity: 0.6;
      }
      100% {
        transform: scale(2);
        opacity: 0;
      }
    }
    
    .animate-ripple {
      animation: ripple 0.6s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    @keyframes buttonPress {
      0% { transform: scale(1); }
      50% { transform: scale(0.95); }
      100% { transform: scale(1); }
    }
    
    .animate-press {
      animation: buttonPress 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }
  `}</style>
);

export default AnimatedButton;