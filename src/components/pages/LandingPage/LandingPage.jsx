// ===== src/components/pages/LandingPage/LandingPage.jsx =====
import React, { useState, useEffect, useCallback } from "react";
import { ArrowRight, Users, MessageCircle, Heart, Share2, Mail, MapPin, Phone } from "lucide-react";
import SignUpModal from "../../forms/SignUpForm/SignUpForm";
import LoginForm from "../../forms/LoginForm/LoginForm";
import { useToast } from '../../ui/Toast'; // ✅ CORRECT IMPORT

const ConnectifyLanding = () => {
  // ✅ GLITCH EFFECT STYLES
  const glitchStyles = `
    .glitch {
      color: #fff;
      font-size: clamp(2rem, 10vw, 8rem);
      white-space: nowrap;
      font-weight: 900;
      position: relative;
      margin: 0 auto;
      user-select: none;
      cursor: pointer;
    }
    .glitch::after,
    .glitch::before {
      content: attr(data-text);
      position: absolute;
      top: 0;
      color: #fff;
      background-color: #060010;
      overflow: hidden;
      clip-path: inset(0 0 0 0);
    }
    .glitch:not(.enable-on-hover)::after {
      left: 10px;
      text-shadow: var(--after-shadow, -10px 0 red);
      animation: animate-glitch var(--after-duration, 3s) infinite linear alternate-reverse;
    }
    .glitch:not(.enable-on-hover)::before {
      left: -10px;
      text-shadow: var(--before-shadow, 10px 0 cyan);
      animation: animate-glitch var(--before-duration, 2s) infinite linear alternate-reverse;
    }
    .glitch.enable-on-hover::after,
    .glitch.enable-on-hover::before {
      content: '';
      opacity: 0;
      animation: none;
    }
    .glitch.enable-on-hover:hover::after {
      content: attr(data-text);
      opacity: 1;
      left: 10px;
      text-shadow: var(--after-shadow, -10px 0 red);
      animation: animate-glitch var(--after-duration, 3s) infinite linear alternate-reverse;
    }
    .glitch.enable-on-hover:hover::before {
      content: attr(data-text);
      opacity: 1;
      left: -10px;
      text-shadow: var(--before-shadow, 10px 0 cyan);
      animation: animate-glitch var(--before-duration, 2s) infinite linear alternate-reverse;
    }
    @keyframes animate-glitch {
      0%   { clip-path: inset(20% 0 50% 0); }
      5%   { clip-path: inset(10% 0 60% 0); }
      10%  { clip-path: inset(15% 0 55% 0); }
      15%  { clip-path: inset(25% 0 35% 0); }
      20%  { clip-path: inset(30% 0 40% 0); }
      25%  { clip-path: inset(40% 0 20% 0); }
      30%  { clip-path: inset(10% 0 60% 0); }
      35%  { clip-path: inset(15% 0 55% 0); }
      40%  { clip-path: inset(25% 0 35% 0); }
      45%  { clip-path: inset(30% 0 40% 0); }
      50%  { clip-path: inset(20% 0 50% 0); }
      55%  { clip-path: inset(10% 0 60% 0); }
      60%  { clip-path: inset(15% 0 55% 0); }
      65%  { clip-path: inset(25% 0 35% 0); }
      70%  { clip-path: inset(30% 0 40% 0); }
      75%  { clip-path: inset(40% 0 20% 0); }
      80%  { clip-path: inset(20% 0 50% 0); }
      85%  { clip-path: inset(10% 0 60% 0); }
      90%  { clip-path: inset(15% 0 55% 0); }
      95%  { clip-path: inset(25% 0 35% 0); }
      100% { clip-path: inset(30% 0 40% 0); }
    }
  `;

  // ✅ CARD DATA FOR AUTO SWIPER
  const cardData = [
    {
      id: 1,
      name: "Alex Rivera",
      time: "2 hours ago",
      message: "Just had an amazing sunset view from the mountains!",
      emoji: "🌅",
      bgGradient: "from-orange-400 to-pink-500",
      avatarGradient: "from-emerald-500 to-teal-500",
      likes: 142,
      comments: 23,
      shares: 12
    },
    {
      id: 2,
      name: "Sarah Chen",
      time: "1 hour ago",
      message: "Coffee and coding session at my favorite café ☕",
      emoji: "💻",
      bgGradient: "from-amber-400 to-orange-500",
      avatarGradient: "from-purple-500 to-pink-500",
      likes: 89,
      comments: 15,
      shares: 8
    },
    {
      id: 3,
      name: "Mike Johnson",
      time: "3 hours ago",
      message: "New artwork finished! What do you think?",
      emoji: "🎨",
      bgGradient: "from-blue-400 to-purple-500",
      avatarGradient: "from-cyan-500 to-blue-500",
      likes: 234,
      comments: 41,
      shares: 19
    },
    {
      id: 4,
      name: "Emma Davis",
      time: "30 min ago",
      message: "Hiking adventure in the national park today!",
      emoji: "🏔️",
      bgGradient: "from-green-400 to-emerald-500",
      avatarGradient: "from-lime-500 to-green-500",
      likes: 156,
      comments: 28,
      shares: 14
    },
    {
      id: 5,
      name: "David Kim",
      time: "4 hours ago",
      message: "Homemade pizza night with friends! 🍕",
      emoji: "🍕",
      bgGradient: "from-red-400 to-orange-500",
      avatarGradient: "from-indigo-500 to-purple-500",
      likes: 178,
      comments: 35,
      shares: 22
    }
  ];

  // ✅ BACKGROUND ANIMATION STATE
  const [currentBg, setCurrentBg] = useState(0);
  const backgrounds = [
    "bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900",
    "bg-gradient-to-br from-slate-900 via-teal-900 to-slate-900",
    "bg-gradient-to-br from-slate-900 via-cyan-900 to-slate-900"
  ];

  // ✅ CARD SWIPER STATE
  const [currentCard, setCurrentCard] = useState(0);

  // ✅ MODAL STATE MANAGEMENT
  const [showSignUpModal, setShowSignUpModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  
  // ✅ CORRECT TOAST USAGE
  const { toast } = useToast(); // Get toast from the hook

  // ✅ BACKGROUND CYCLING EFFECT
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBg((prev) => (prev + 1) % backgrounds.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [backgrounds.length]);

  // ✅ CARD AUTO SWIPER EFFECT (2-second intervals)
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentCard((prev) => (prev + 1) % cardData.length);
    }, 2000); // 2-second intervals
    return () => clearInterval(interval);
  }, [cardData.length]);

  // ✅ MODAL EVENT HANDLERS
  const handleJoinNowClick = useCallback(() => {
    console.log('Join Now button clicked!');
    setShowSignUpModal(true);
    setShowLoginModal(false);
  }, []);

  const handleExploreClick = useCallback(() => {
    console.log('Explore Features button clicked!');
    setShowLoginModal(true);
    setShowSignUpModal(false);
  }, []);

  const handleCloseModals = useCallback(() => {
    console.log('Closing modals');
    setShowSignUpModal(false);
    setShowLoginModal(false);
  }, []);

  const handleSwitchToSignUp = useCallback(() => {
    console.log('Switching to SignUp');
    setShowLoginModal(false);
    setShowSignUpModal(true);
  }, []);

  const handleSwitchToLogin = useCallback(() => {
    console.log('Switching to Login');
    setShowSignUpModal(false);
    setShowLoginModal(true);
  }, []);

  // ✅ BUTTON COMPONENT
  const Button = ({ children, className, variant = "default", size = "default", onClick, ...props }) => {
    const baseClasses = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background";
    
    const variants = {
      default: "bg-gradient-to-r from-blue-500 to-teal-500 text-white hover:from-blue-600 hover:to-teal-600",
      outline: "border border-input hover:bg-accent hover:text-accent-foreground"
    };
    
    const sizes = {
      default: "h-10 py-2 px-4",
      lg: "h-11 px-8 rounded-md"
    };
    
    return (
      <button
        className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
        onClick={onClick}
        {...props}
      >
        {children}
      </button>
    );
  };

  // Get current card data
  const card = cardData[currentCard];

  return (
    <div className="min-h-screen bg-slate-900">
      {/* ✅ INJECT GLITCH STYLES */}
      <style dangerouslySetInnerHTML={{ __html: glitchStyles }} />
      

      {/* Hero Section with Changing Background */}
      <section className="relative min-h-screen overflow-hidden">
        {/* Background Layers with Fade Effect */}
        {backgrounds.map((bg, index) => (
          <div 
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentBg ? "opacity-100" : "opacity-0"
            } ${bg}`}
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=&quot;60&quot; height=&quot;60&quot; viewBox=&quot;0 0 60 60&quot; xmlns=&quot;http://www.w3.org/2000/svg&quot;%3E%3Cg fill=&quot;none&quot; fillRule=&quot;evenodd&quot;%3E%3Cg fill=&quot;%239C92AC&quot; fillOpacity=&quot;0.05&quot;%3E%3Ccircle cx=&quot;30&quot; cy=&quot;30&quot; r=&quot;2&quot;/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40"></div>
          </div>
        ))}

        {/* Floating Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-20 h-20 bg-blue-500/20 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute top-40 right-20 w-32 h-32 bg-teal-500/20 rounded-full blur-xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-40 left-20 w-24 h-24 bg-emerald-500/20 rounded-full blur-xl animate-pulse delay-2000"></div>
          <div className="absolute bottom-20 right-10 w-16 h-16 bg-cyan-500/20 rounded-full blur-xl animate-pulse delay-500"></div>
        </div>

        {/* Main Content */}
        <div className="relative z-10 container mx-auto px-4 py-20 min-h-screen flex items-center">
          <div className="grid lg:grid-cols-2 gap-12 items-center w-full">
            {/* Left Content */}
            <div className="text-center lg:text-left space-y-8">
              <div className="space-y-4">
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight">
                  <span className="relative inline-block">
                    <span className="glitch bg-gradient-to-r from-blue-400 via-teal-500 to-blue-400 bg-clip-text" data-text="Connectify">
                      Connectify
                    </span>
                    <span className="absolute -bottom-1 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-teal-400 transform scale-x-0 transition-transform duration-700 animate-expand-line"></span>
                  </span>
                </h1>
                <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto lg:mx-0 mt-4">
                  Join millions of creators, thinkers, and dreamers in the most vibrant social community on the web.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button 
                  size="lg" 
                  onClick={handleJoinNowClick}
                  className="bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105"
                >
                  Join Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={handleExploreClick}
                  className="border-2 border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-white px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-300"
                >
                  Explore Features
                </Button>
              </div>
            </div>

            {/* Right Content - Phone Mockup */}
            <div className="flex justify-center lg:justify-center lg:pr-12">
              <div className="relative">
                {/* Phone Frame */}
                <div className="w-80 h-[600px] bg-gray-900 rounded-[3rem] p-2 shadow-2xl">
                  <div className="w-full h-full bg-gray-800 rounded-[2.5rem] overflow-hidden relative">
                    {/* Status Bar */}
                    <div className="flex justify-between items-center px-6 py-2 bg-gray-900">
                      <span className="text-white text-sm font-medium">9:41</span>
                      <div className="flex space-x-1">
                        <div className="w-4 h-2 bg-white rounded-sm"></div>
                        <div className="w-1 h-2 bg-white rounded-sm"></div>
                        <div className="w-6 h-2 bg-white rounded-sm"></div>
                      </div>
                    </div>

                    {/* App Content */}
                    <div className="px-4 space-y-4">
                      {/* Header */}
                      <div className="flex items-center justify-between py-4">
                        <h2 className="text-white text-xl font-bold">
                          <span className="bg-gradient-to-r from-blue-400 to-teal-400 bg-clip-text text-transparent">
                            Connectify
                          </span>
                        </h2>
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-teal-500 rounded-full"></div>
                      </div>

                      {/* Auto-Swiper Cards - Bigger Layout */}
                      <div className="bg-gray-700 rounded-2xl p-6 space-y-4 transition-all duration-500 ease-in-out">
                        <div className="flex items-center space-x-4">
                          <div className={`w-12 h-12 bg-gradient-to-r ${card.avatarGradient} rounded-full transition-all duration-500`}></div>
                          <div>
                            <p className="text-white font-semibold text-base">{card.name}</p>
                            <p className="text-gray-400 text-sm">{card.time}</p>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <p className="text-white text-base leading-relaxed">
                            {card.message}
                          </p>
                          <div className={`w-full h-40 bg-gradient-to-br ${card.bgGradient} rounded-xl flex items-center justify-center transition-all duration-500 text-5xl shadow-lg`}>
                            {card.emoji}
                          </div>
                          <div className="flex items-center justify-between pt-2">
                            <div className="flex items-center space-x-6 text-gray-400 text-sm">
                              <div className="flex items-center space-x-2">
                                <Heart className="w-5 h-5 text-red-400" />
                                <span>{card.likes}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <MessageCircle className="w-5 h-5" />
                                <span>{card.comments}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Share2 className="w-5 h-5" />
                                <span>{card.shares}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Card Indicators */}
                      <div className="flex justify-center space-x-2 py-2">
                        {cardData.map((_, index) => (
                          <div
                            key={index}
                            className={`w-2 h-2 rounded-full transition-all duration-300 ${
                              index === currentCard ? 'bg-blue-400' : 'bg-gray-600'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating UI Elements */}
                <div className="absolute -top-4 -left-4 bg-blue-500 text-white p-3 rounded-xl shadow-lg animate-bounce">
                  <Users className="w-6 h-6" />
                </div>
                <div className="absolute top-20 -right-4 bg-emerald-500 text-white p-3 rounded-xl shadow-lg animate-bounce delay-500">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <div className="absolute -bottom-4 -left-4 bg-teal-500 text-white p-3 rounded-xl shadow-lg animate-bounce delay-1000">
                  <Heart className="w-6 h-6" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-slate-950 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=&quot;60&quot; height=&quot;60&quot; viewBox=&quot;0 0 60 60&quot; xmlns=&quot;http://www.w3.org/2000/svg&quot;%3E%3Cg fill=&quot;none&quot; fillRule=&quot;evenodd&quot;%3E%3Cg fill=&quot;%236366f1&quot; fillOpacity=&quot;0.03&quot;%3E%3Ccircle cx=&quot;30&quot; cy=&quot;30&quot; r=&quot;2&quot;/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Why Choose 
              <span className="bg-gradient-to-r from-blue-400 to-teal-400 bg-clip-text text-transparent"> Connectify</span>?
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Experience the next generation of social networking with powerful features designed for creators and communities.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300 group">
              <div className="bg-gradient-to-r from-blue-500 to-teal-500 w-12 h-12 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Connect Globally</h3>
              <p className="text-gray-300">
                Build meaningful connections with people from around the world who share your interests and passions.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300 group">
              <div className="bg-gradient-to-r from-emerald-500 to-teal-500 w-12 h-12 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Real-time Chat</h3>
              <p className="text-gray-300">
                Instant messaging with advanced features like voice notes, file sharing, and group conversations.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300 group">
              <div className="bg-gradient-to-r from-cyan-500 to-blue-500 w-12 h-12 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Share2 className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Share Everything</h3>
              <p className="text-gray-300">
                Share photos, videos, thoughts, and experiences with your network using our intuitive sharing tools.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-900 to-teal-900 relative overflow-hidden">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of users who are already connecting, sharing, and building amazing communities on Connectify.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              onClick={handleJoinNowClick}
              className="bg-white text-blue-900 hover:bg-gray-100 px-8 py-4 text-lg font-semibold rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105"
            >
              Start Your Journey
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              variant="outline"
              size="lg"
              onClick={handleExploreClick}
              className="border-2 border-white text-white hover:bg-white hover:text-blue-900 px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-300"
            >
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 py-12 border-t border-gray-800">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white">
                <span className="bg-gradient-to-r from-blue-400 to-teal-400 bg-clip-text text-transparent">
                  Connectify
                </span>
              </h3>
              <p className="text-gray-300">
                Building the future of social connections, one post at a time.
              </p>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold text-white">Product</h4>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#" className="hover:text-blue-400 transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">API</a></li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold text-white">Support</h4>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#" className="hover:text-blue-400 transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Privacy</a></li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold text-white">Connect</h4>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-300 hover:text-blue-400 transition-colors">
                  <Mail className="w-5 h-5" />
                </a>
                <a href="#" className="text-gray-300 hover:text-blue-400 transition-colors">
                  <Phone className="w-5 h-5" />
                </a>
                <a href="#" className="text-gray-300 hover:text-blue-400 transition-colors">
                  <MapPin className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Connectify. All rights reserved.</p>
          </div>
        </div>
      </footer>

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
    </div>
  );
};

export default ConnectifyLanding;