// src/components/pages/LandingPage/LandingPage.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import slide1 from '../../../assets/images/slides/slide1.png';
import slide2 from '../../../assets/images/slides/slide2.png';
import slide3 from '../../../assets/images/slides/slide3.png';
import SignUpModal from '../../forms/SignUpForm';
import LoginForm from '../../forms/LoginForm';

// Constants - Professional practice
const TIMING_CONFIG = {
  SLIDE_INTERVAL: 3000,
  TRANSITION_DURATION: 2000,
  BRANDING_DELAY: 500,
  ANIMATION_DELAYS: {
    INITIAL: 200,
    LETTER_STAGGER: 100,
    TAGLINE: 1400,
    BUTTONS: 1800,
    DOTS: 2200
  }
};

const ANIMATION_CONFIG = {
  LETTER_DURATION: 700,
  FADE_DURATION: 1000,
  LETTER_COUNT: 10
};

// Static data - Moved outside component for performance
const TIMELINE_DATA = [
  { id: 1, bgImage: slide1, alt: 'People connecting authentically' },
  { id: 2, bgImage: slide2, alt: 'Creative expression and freedom' },
  { id: 3, bgImage: slide3, alt: 'Building supportive community' }
];

const CONNECTIFY_LETTERS = ['C', 'o', 'n', 'n', 'e', 'c', 't', 'i', 'f', 'y'];

const LandingPage = () => {
  // State management
  const [currentIndex, setCurrentIndex] = useState(0);
  const [nextIndex, setNextIndex] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showBranding, setShowBranding] = useState(false);
  const [showSignUpModal, setShowSignUpModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Memoized values for performance
  const currentSlide = useMemo(() => TIMELINE_DATA[currentIndex], [currentIndex]);
  const nextSlide = useMemo(() => TIMELINE_DATA[nextIndex], [nextIndex]);

  // Utility function for consistent transitions
  const getTransitionClasses = useCallback((isVisible, translateY = 'translate-y-4') => {
    return `transform transition-all duration-1000 ease-out ${
      isVisible ? 'translate-y-0 opacity-100' : `${translateY} opacity-0`
    }`;
  }, []);

  // Slide navigation with useCallback for performance
  const goToSlide = useCallback((index) => {
    if (index === currentIndex || isTransitioning) return;
    
    setNextIndex(index);
    setIsTransitioning(true);
    
    setTimeout(() => {
      setCurrentIndex(index);
      setIsTransitioning(false);
    }, TIMING_CONFIG.TRANSITION_DURATION);
  }, [currentIndex, isTransitioning]);

  // Auto-advance slides effect
  useEffect(() => {
    const interval = setInterval(() => {
      const nextSlideIndex = (currentIndex + 1) % TIMELINE_DATA.length;
      setNextIndex(nextSlideIndex);
      setIsTransitioning(true);
      
      setTimeout(() => {
        setCurrentIndex(nextSlideIndex);
        setIsTransitioning(false);
      }, TIMING_CONFIG.TRANSITION_DURATION);
    }, TIMING_CONFIG.SLIDE_INTERVAL);

    return () => clearInterval(interval);
  }, [currentIndex]);

  // Initial branding animation effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowBranding(true);
    }, TIMING_CONFIG.BRANDING_DELAY);
    
    return () => clearTimeout(timer);
  }, []);

  // Event handlers - Modal Management
  const handleLoginClick = useCallback(() => {
    console.log('Login button clicked!'); // Debug log
    setShowLoginModal(true);
    setShowSignUpModal(false);
  }, []);

  const handleSignUpClick = useCallback(() => {
    console.log('SignUp button clicked!'); // Debug log
    setShowSignUpModal(true);
    setShowLoginModal(false);
  }, []);

  const handleCloseModals = useCallback(() => {
    console.log('Closing modals'); // Debug log
    setShowSignUpModal(false);
    setShowLoginModal(false);
  }, []);

  const handleSwitchToSignUp = useCallback(() => {
    console.log('Switching to SignUp'); // Debug log
    setShowLoginModal(false);
    setShowSignUpModal(true);
  }, []);

  const handleSwitchToLogin = useCallback(() => {
    console.log('Switching to Login'); // Debug log
    setShowSignUpModal(false);
    setShowLoginModal(true);
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden" role="main">
      {/* Background Images with Professional Transition */}
      <div className="absolute inset-0" role="img" aria-label={currentSlide.alt}>
        {/* Current Image Layer */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${currentSlide.bgImage})`,
            opacity: isTransitioning ? 0 : 1,
            transform: isTransitioning 
              ? 'translateY(20px) scale(1.05)' 
              : 'translateY(0px) scale(1)',
            transition: `all ${TIMING_CONFIG.TRANSITION_DURATION}ms ease-out`
          }}
        />
        
        {/* Next Image Layer - Professional Slide Down Effect */}
        {isTransitioning && (
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${nextSlide.bgImage})`,
              opacity: 1,
              transform: 'translateY(0px) scale(1)',
              transition: `all ${TIMING_CONFIG.TRANSITION_DURATION}ms ease-out`,
              animation: `slideDownFade ${TIMING_CONFIG.TRANSITION_DURATION}ms ease-out forwards`
            }}
            aria-label={nextSlide.alt}
          />
        )}
        
        {/* Consistent Dark Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-50" />
      </div>

      {/* Main Content - Semantic Structure */}
      <header className="absolute inset-0 z-30 flex flex-col items-center justify-center" 
              style={{ marginTop: '-10vh' }}>
        
        {/* Brand Logo - Letter by Letter Animation */}
        <h1 className="flex items-center justify-center" role="banner">
          {CONNECTIFY_LETTERS.map((letter, index) => (
            <span
              key={`${letter}-${index}`}
              className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-wide transform transition-all ease-out"
              style={{
                fontFamily: 'Montserrat, sans-serif',
                background: 'linear-gradient(135deg, #a855f7, #ec4899, #f59e0b)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                textShadow: '0 4px 20px rgba(168, 85, 247, 0.4), 0 0 40px rgba(168, 85, 247, 0.2)',
                transitionDuration: `${ANIMATION_CONFIG.LETTER_DURATION}ms`,
                transitionDelay: `${TIMING_CONFIG.ANIMATION_DELAYS.INITIAL + (index * TIMING_CONFIG.ANIMATION_DELAYS.LETTER_STAGGER)}ms`,
                opacity: showBranding ? 1 : 0,
                transform: showBranding 
                  ? 'translateY(0px) scale(1)' 
                  : 'translateY(30px) scale(0.8)'
              }}
              aria-hidden="true"
            >
              {letter}
            </span>
          ))}
          <span className="sr-only">Connectify</span>
        </h1>

        {/* Tagline with Semantic Meaning */}
        <div 
          className={`mt-6 ${getTransitionClasses(showBranding)}`}
          style={{
            transitionDelay: `${TIMING_CONFIG.ANIMATION_DELAYS.TAGLINE}ms`
          }}
        >
          <p 
            className="text-white text-lg sm:text-xl md:text-2xl lg:text-3xl font-light tracking-wide text-center px-4"
            style={{
              fontFamily: 'Montserrat, sans-serif',
              textShadow: '0 2px 10px rgba(0,0,0,0.5)',
            }}
          >
            Where people can post and connect
          </p>
        </div>

        {/* Call-to-Action Buttons */}
        <nav 
          className={`mt-12 px-4 ${getTransitionClasses(showBranding, 'translate-y-6')}`}
          style={{
            transitionDelay: `${TIMING_CONFIG.ANIMATION_DELAYS.BUTTONS}ms`
          }}
          role="navigation"
          aria-label="Authentication options"
        >
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <button 
              onClick={handleLoginClick}
              className="w-full sm:w-auto bg-white bg-opacity-20 backdrop-blur-md border border-white border-opacity-30 text-white px-6 sm:px-8 py-3 rounded-lg font-semibold hover:bg-opacity-30 shadow-lg hover:shadow-xl transform hover:scale-105 min-h-[48px] text-base transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
              aria-label="Login to your account"
              type="button"
            >
              Login
            </button>
            
            <button 
              onClick={handleSignUpClick}
              className="w-full sm:w-auto bg-transparent border-2 border-white border-opacity-60 text-white px-6 sm:px-8 py-3 rounded-lg font-semibold hover:bg-white hover:bg-opacity-20 shadow-lg hover:shadow-xl transform hover:scale-105 min-h-[48px] text-base transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
              aria-label="Create a new account"
              type="button"
            >
              Sign Up
            </button>
          </div>
        </nav>

        {/* Slide Navigation Indicator */}
        <div 
          className={`mt-8 ${getTransitionClasses(showBranding)}`}
          style={{
            transitionDelay: `${TIMING_CONFIG.ANIMATION_DELAYS.DOTS}ms`
          }}
          role="tablist"
          aria-label="Slide navigation"
        >
          <div className="flex items-center justify-center space-x-3">
            {TIMELINE_DATA.map((slide, index) => (
              <button
                key={slide.id}
                onClick={() => goToSlide(index)}
                disabled={isTransitioning}
                className={`w-3 h-3 rounded-full transform hover:scale-125 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 ${
                  index === currentIndex 
                    ? 'bg-white shadow-lg scale-110' 
                    : 'bg-white bg-opacity-40 hover:bg-opacity-60 scale-100'
                }`}
                aria-label={`Go to slide ${index + 1}: ${slide.alt}`}
                role="tab"
                aria-selected={index === currentIndex}
                tabIndex={isTransitioning ? -1 : 0}
              />
            ))}
          </div>
        </div>
      </header>

      {/* Debug Info - Remove after testing */}
      
      {/* Modals */}
      <SignUpModal 
        isOpen={showSignUpModal}
        onClose={handleCloseModals}
        onSwitchToLogin={handleSwitchToLogin}
      />

      <LoginForm 
        isOpen={showLoginModal}
        onClose={handleCloseModals}
        onSwitchToSignUp={handleSwitchToSignUp}
      />

      {/* Professional CSS with Scoped Variables */}
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;600;700;800;900&display=swap');
        
        @keyframes slideDownFade {
          0% { 
            opacity: 0;
            transform: translateY(-30px) scale(1.02);
          }
          50% { 
            opacity: 0.7;
            transform: translateY(-10px) scale(1.01);
          }
          100% { 
            opacity: 1;
            transform: translateY(0px) scale(1);
          }
        }

        /* Screen reader only content */
        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border: 0;
        }
      `}</style>
    </div>
  );
};

export default LandingPage;