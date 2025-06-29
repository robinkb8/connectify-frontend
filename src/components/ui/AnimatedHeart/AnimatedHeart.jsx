 
 
// ===== src/components/ui/AnimatedHeart/AnimatedHeart.jsx - PRODUCTION QUALITY =====
import React, { useState, useRef, useEffect } from 'react';
import { Heart } from 'lucide-react';

const AnimatedHeart = ({ 
  isLiked, 
  onClick, 
  size = 20, 
  className = "",
  showParticles = true,
  disabled = false 
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [particles, setParticles] = useState([]);
  const heartRef = useRef(null);
  const particleIdRef = useRef(0);

  // ✅ Create floating particles on like
  const createParticles = () => {
    if (!showParticles) return;
    
    const newParticles = Array.from({ length: 6 }, (_, i) => ({
      id: particleIdRef.current++,
      x: Math.random() * 40 - 20, // Random x offset
      y: -10 - Math.random() * 20, // Upward direction
      rotation: Math.random() * 360,
      scale: 0.3 + Math.random() * 0.4,
      opacity: 1,
      color: ['#ff6b6b', '#ff8e8e', '#ffa8a8', '#ffcccc'][Math.floor(Math.random() * 4)]
    }));
    
    setParticles(newParticles);
    
    // Remove particles after animation
    setTimeout(() => setParticles([]), 1000);
  };

  // ✅ Handle click with sophisticated animation
  const handleClick = (e) => {
    if (disabled) return;
    
    e.stopPropagation();
    setIsAnimating(true);
    
    // Create particles only when liking (not unliking)
    if (!isLiked) {
      createParticles();
    }
    
    // Call parent onClick
    onClick?.();
    
    // Reset animation state
    setTimeout(() => setIsAnimating(false), 600);
  };

  // ✅ Dynamic styles based on state
  const getHeartStyles = () => {
    let transform = 'scale(1)';
    let filter = 'none';
    
    if (isAnimating) {
      if (isLiked) {
        // Unliking animation - simple scale down
        transform = 'scale(0.8)';
      } else {
        // Liking animation - dramatic scale up with bounce
        transform = 'scale(1.3)';
        filter = 'drop-shadow(0 0 8px rgba(239, 68, 68, 0.6))';
      }
    } else if (isLiked) {
      // Steady liked state - slight scale up
      transform = 'scale(1.1)';
    }
    
    return {
      transform,
      filter,
      transition: isAnimating 
        ? 'all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)' 
        : 'all 0.2s ease-out'
    };
  };

  return (
    <div className="relative inline-block">
      {/* ✅ Floating Particles */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute pointer-events-none"
          style={{
            left: '50%',
            top: '50%',
            transform: `translate(-50%, -50%) translate(${particle.x}px, ${particle.y}px) rotate(${particle.rotation}deg) scale(${particle.scale})`,
            opacity: particle.opacity,
            animation: 'floatUp 1s ease-out forwards',
            zIndex: 10
          }}
        >
          <Heart 
            size={12} 
            className="fill-current"
            style={{ color: particle.color }}
          />
        </div>
      ))}
      
      {/* ✅ Main Heart Button */}
      <button
        ref={heartRef}
        onClick={handleClick}
        disabled={disabled}
        className={`
          relative inline-flex items-center justify-center
          ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
          ${className}
        `}
        style={getHeartStyles()}
      >
        <Heart
          size={size}
          className={`
            transition-colors duration-200
            ${isLiked 
              ? 'fill-red-500 text-red-500' 
              : 'text-gray-500 dark:text-gray-400 hover:text-red-500'
            }
          `}
        />
        
        {/* ✅ Pulse ring effect for dramatic likes */}
        {isAnimating && !isLiked && (
          <div 
            className="absolute inset-0 rounded-full border-2 border-red-500 opacity-0"
            style={{
              animation: 'pulseRing 0.6s ease-out'
            }}
          />
        )}
      </button>
      
      {/* ✅ CSS Animations */}
      <style jsx>{`
        @keyframes floatUp {
          0% {
            transform: translate(-50%, -50%) translate(var(--x), var(--y)) rotate(var(--rotation)) scale(var(--scale));
            opacity: 1;
          }
          100% {
            transform: translate(-50%, -50%) translate(var(--x), calc(var(--y) - 30px)) rotate(calc(var(--rotation) + 180deg)) scale(0);
            opacity: 0;
          }
        }
        
        @keyframes pulseRing {
          0% {
            transform: scale(1);
            opacity: 0.8;
          }
          100% {
            transform: scale(2);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default AnimatedHeart;