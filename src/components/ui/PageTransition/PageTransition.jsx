 
// ===== src/components/ui/PageTransition/PageTransition.jsx - PRODUCTION QUALITY =====
import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

// ✅ Main Page Transition Wrapper
const PageTransition = ({ 
  children, 
  duration = 300,
  type = "fade", // "fade", "slide", "scale", "blur"
  direction = "right" // for slide: "left", "right", "up", "down"
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const location = useLocation();
  const prevLocationRef = useRef(location.pathname);
  const timeoutRef = useRef(null);

  // ✅ Handle route changes with smooth transitions
  useEffect(() => {
    if (prevLocationRef.current !== location.pathname) {
      // Start exit animation
      setIsAnimating(true);
      setIsVisible(false);
      
      // Clear existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      // After exit animation, start enter animation
      timeoutRef.current = setTimeout(() => {
        setIsVisible(true);
        setTimeout(() => setIsAnimating(false), duration);
        prevLocationRef.current = location.pathname;
      }, duration / 2);
    } else {
      // Initial load
      setIsVisible(true);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [location.pathname, duration]);

  // ✅ Get transition styles based on type
  const getTransitionStyles = () => {
    const baseTransition = `all ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
    
    switch (type) {
      case "slide":
        const slideTransforms = {
          left: isVisible ? 'translateX(0)' : 'translateX(-100%)',
          right: isVisible ? 'translateX(0)' : 'translateX(100%)',
          up: isVisible ? 'translateY(0)' : 'translateY(-100%)',
          down: isVisible ? 'translateY(0)' : 'translateY(100%)'
        };
        return {
          transform: slideTransforms[direction],
          transition: baseTransition,
          opacity: isVisible ? 1 : 0
        };
        
      case "scale":
        return {
          transform: isVisible ? 'scale(1)' : 'scale(0.95)',
          transition: baseTransition,
          opacity: isVisible ? 1 : 0
        };
        
      case "blur":
        return {
          filter: isVisible ? 'blur(0px)' : 'blur(10px)',
          transform: isVisible ? 'scale(1)' : 'scale(1.02)',
          transition: baseTransition,
          opacity: isVisible ? 1 : 0
        };
        
      default: // fade
        return {
          transition: baseTransition,
          opacity: isVisible ? 1 : 0
        };
    }
  };

  return (
    <div 
      className="h-full w-full"
      style={getTransitionStyles()}
    >
      {children}
    </div>
  );
};

// ✅ Staggered Children Animation Hook
export const useStaggeredAnimation = (childCount, delay = 100) => {
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    setVisibleCount(0);
    const timeouts = [];
    
    for (let i = 0; i < childCount; i++) {
      const timeout = setTimeout(() => {
        setVisibleCount(i + 1);
      }, i * delay);
      timeouts.push(timeout);
    }
    
    return () => timeouts.forEach(clearTimeout);
  }, [childCount, delay]);

  return visibleCount;
};

// ✅ Staggered List Component
export const StaggeredList = ({ 
  children, 
  staggerDelay = 100, 
  className = "",
  animation = "fadeUp" // "fadeUp", "fadeIn", "slideIn"
}) => {
  const visibleCount = useStaggeredAnimation(React.Children.count(children), staggerDelay);

  const getAnimationClasses = (index, isVisible) => {
    const baseClasses = "transition-all duration-500 ease-out";
    
    switch (animation) {
      case "fadeUp":
        return `${baseClasses} ${
          isVisible 
            ? 'opacity-100 translate-y-0' 
            : 'opacity-0 translate-y-4'
        }`;
        
      case "slideIn":
        return `${baseClasses} ${
          isVisible 
            ? 'opacity-100 translate-x-0' 
            : 'opacity-0 translate-x-4'
        }`;
        
      default: // fadeIn
        return `${baseClasses} ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`;
    }
  };

  return (
    <div className={className}>
      {React.Children.map(children, (child, index) => (
        <div 
          key={index}
          className={getAnimationClasses(index, index < visibleCount)}
        >
          {child}
        </div>
      ))}
    </div>
  );
};

// ✅ Modal Transition Component
export const ModalTransition = ({ 
  isOpen, 
  onClose, 
  children, 
  overlayClick = true,
  escapeKey = true,
  duration = 300
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      setTimeout(() => setIsVisible(true), 10);
    } else {
      setIsVisible(false);
      setTimeout(() => setShouldRender(false), duration);
    }
  }, [isOpen, duration]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (escapeKey && e.key === 'Escape') {
        onClose?.();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, escapeKey, onClose]);

  if (!shouldRender) return null;

  return (
    <div 
      className={`
        fixed inset-0 z-50 flex items-center justify-center
        transition-all duration-${duration} ease-out
        ${isVisible ? 'opacity-100' : 'opacity-0'}
      `}
    >
      {/* Backdrop */}
      <div 
        className={`
          absolute inset-0 bg-black/50 backdrop-blur-sm
          transition-opacity duration-${duration}
          ${isVisible ? 'opacity-100' : 'opacity-0'}
        `}
        onClick={overlayClick ? onClose : undefined}
      />
      
      {/* Modal Content */}
      <div 
        className={`
          relative max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden
          transition-all duration-${duration} ease-out
          ${isVisible 
            ? 'opacity-100 scale-100 translate-y-0' 
            : 'opacity-0 scale-95 translate-y-4'
          }
        `}
      >
        {children}
      </div>
    </div>
  );
};

// ✅ Loading Transition for async operations
export const LoadingTransition = ({ 
  isLoading, 
  children, 
  fallback,
  duration = 200
}) => {
  const [showFallback, setShowFallback] = useState(isLoading);
  const [showContent, setShowContent] = useState(!isLoading);

  useEffect(() => {
    if (isLoading) {
      setShowContent(false);
      setTimeout(() => setShowFallback(true), duration / 2);
    } else {
      setShowFallback(false);
      setTimeout(() => setShowContent(true), duration / 2);
    }
  }, [isLoading, duration]);

  return (
    <div className="relative">
      {/* Loading State */}
      <div 
        className={`
          transition-opacity duration-${duration} absolute inset-0
          ${showFallback ? 'opacity-100' : 'opacity-0 pointer-events-none'}
        `}
      >
        {fallback}
      </div>
      
      {/* Content State */}
      <div 
        className={`
          transition-opacity duration-${duration}
          ${showContent ? 'opacity-100' : 'opacity-0'}
        `}
      >
        {children}
      </div>
    </div>
  );
};

// ✅ Reveal Animation Hook
export const useRevealAnimation = (threshold = 0.1) => {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, [threshold]);

  return [elementRef, isVisible];
};

// ✅ Reveal Component
export const RevealOnScroll = ({ 
  children, 
  animation = "fadeUp",
  threshold = 0.1,
  duration = 600,
  delay = 0
}) => {
  const [ref, isVisible] = useRevealAnimation(threshold);

  const getAnimationClasses = () => {
    const baseClasses = `transition-all duration-${duration} ease-out`;
    
    switch (animation) {
      case "fadeUp":
        return `${baseClasses} ${
          isVisible 
            ? 'opacity-100 translate-y-0' 
            : 'opacity-0 translate-y-8'
        }`;
        
      case "fadeLeft":
        return `${baseClasses} ${
          isVisible 
            ? 'opacity-100 translate-x-0' 
            : 'opacity-0 translate-x-8'
        }`;
        
      case "fadeRight":
        return `${baseClasses} ${
          isVisible 
            ? 'opacity-100 translate-x-0' 
            : 'opacity-0 -translate-x-8'
        }`;
        
      case "scale":
        return `${baseClasses} ${
          isVisible 
            ? 'opacity-100 scale-100' 
            : 'opacity-0 scale-95'
        }`;
        
      default: // fadeIn
        return `${baseClasses} ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`;
    }
  };

  return (
    <div 
      ref={ref}
      className={getAnimationClasses()}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

export default PageTransition;