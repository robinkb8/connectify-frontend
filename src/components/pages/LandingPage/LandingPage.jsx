import React, { useState, useEffect, useCallback } from "react";
import { ArrowRight, Users, MessageCircle, Heart, Share2, Mail, MapPin, Phone } from "lucide-react";
import SignUpModal from "../../forms/SignUpForm/SignUpForm";
import LoginForm from "../../forms/LoginForm/LoginForm";

const ConnectifyLanding = () => {
  // ✅ BACKGROUND ANIMATION STATE
  const [currentBg, setCurrentBg] = useState(0);
  const backgrounds = [
    "bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900",
    "bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900",
    "bg-gradient-to-br from-slate-900 via-violet-900 to-slate-900"
  ];

  // ✅ MODAL STATE MANAGEMENT (Same pattern as your existing LandingPage.jsx)
  const [showSignUpModal, setShowSignUpModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // ✅ BACKGROUND CYCLING EFFECT
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBg((prev) => (prev + 1) % backgrounds.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [backgrounds.length]);

  // ✅ MODAL EVENT HANDLERS (Same pattern as your existing code)
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
      default: "bg-primary text-primary-foreground hover:bg-primary/90",
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

  return (
    <div className="min-h-screen bg-slate-900">
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
          <div className="absolute top-20 left-10 w-20 h-20 bg-purple-500/20 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute top-40 right-20 w-32 h-32 bg-blue-500/20 rounded-full blur-xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-40 left-20 w-24 h-24 bg-pink-500/20 rounded-full blur-xl animate-pulse delay-2000"></div>
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
                    <span className="animate-text-shimmer bg-gradient-to-r from-purple-400 via-pink-500 to-purple-400 bg-[length:200%_100%] bg-clip-text text-transparent">
                      Connectify
                    </span>
                    <span className="absolute -bottom-1 left-0 w-full h-1 bg-gradient-to-r from-purple-400 to-pink-400 transform scale-x-0 transition-transform duration-700 animate-expand-line"></span>
                  </span>
                </h1>
                <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto lg:mx-0 mt-4">
                  Join millions of creators, thinkers, and dreamers in the most vibrant social community on the web.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                {/* ✅ CONNECTED TO SIGNUP MODAL */}
                <Button
                  size="lg"
                  onClick={handleJoinNowClick}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 text-lg font-semibold rounded-full shadow-2xl hover:shadow-purple-500/25 transition-all duration-300"
                >
                  Join Now - It's Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                {/* ✅ CONNECTED TO LOGIN MODAL */}
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleExploreClick}
                  className="border-2 border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-white px-8 py-4 text-lg font-semibold rounded-full bg-transparent backdrop-blur-sm"
                >
                  Explore Features
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-8 pt-8 border-t border-gray-700/50">
                <div className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-white">10M+</div>
                  <div className="text-gray-400 text-sm">Active Users</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-white">50M+</div>
                  <div className="text-gray-400 text-sm">Posts Shared</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-white">180+</div>
                  <div className="text-gray-400 text-sm">Countries</div>
                </div>
              </div>
            </div>

            {/* Right Content - Interactive Visual */}
            <div className="relative">
              <div className="relative w-full max-w-lg mx-auto">
                {/* Main Phone Mockup */}
                <div className="relative bg-gradient-to-b from-gray-800 to-gray-900 rounded-[3rem] p-2 shadow-2xl">
                  <div className="bg-black rounded-[2.5rem] overflow-hidden">
                    {/* Phone Screen */}
                    <div className="relative h-[600px] bg-gradient-to-b from-slate-900 to-slate-800">
                      {/* Status Bar */}
                      <div className="flex justify-between items-center px-6 py-3 text-white text-sm">
                        <span>9:41</span>
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
                            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                              Connectify
                            </span>
                          </h2>
                          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
                        </div>

                        {/* Post Cards */}
                        <div className="space-y-4">
                          {/* Post 1 */}
                          <div className="bg-gray-800/50 rounded-2xl p-4 backdrop-blur-sm border border-gray-700/30">
                            <div className="flex items-center space-x-3 mb-3">
                              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"></div>
                              <div>
                                <div className="text-white font-semibold text-sm">Alex Chen</div>
                                <div className="text-gray-400 text-xs">2 hours ago</div>
                              </div>
                            </div>
                            <div className="text-gray-300 text-sm mb-3">
                              Just launched my new project! Excited to share it with the community 🚀
                            </div>
                            <div className="flex items-center space-x-6 text-gray-400">
                              <div className="flex items-center space-x-1">
                                <Heart className="w-4 h-4" />
                                <span className="text-xs">124</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <MessageCircle className="w-4 h-4" />
                                <span className="text-xs">23</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Share2 className="w-4 h-4" />
                                <span className="text-xs">12</span>
                              </div>
                            </div>
                          </div>

                          {/* Post 2 */}
                          <div className="bg-gray-800/50 rounded-2xl p-4 backdrop-blur-sm border border-gray-700/30">
                            <div className="flex items-center space-x-3 mb-3">
                              <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full"></div>
                              <div>
                                <div className="text-white font-semibold text-sm">Sarah Kim</div>
                                <div className="text-gray-400 text-xs">4 hours ago</div>
                              </div>
                            </div>
                            <div className="text-gray-300 text-sm mb-3">Beautiful sunset from my rooftop garden 🌅</div>
                            <div className="h-32 bg-gradient-to-r from-orange-400 to-pink-400 rounded-xl mb-3"></div>
                            <div className="flex items-center space-x-6 text-gray-400">
                              <div className="flex items-center space-x-1">
                                <Heart className="w-4 h-4" />
                                <span className="text-xs">89</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <MessageCircle className="w-4 h-4" />
                                <span className="text-xs">15</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Share2 className="w-4 h-4" />
                                <span className="text-xs">7</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Social Icons */}
                <div className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                  <Users className="w-8 h-8 text-white" />
                </div>

                <div className="absolute top-20 -left-6 w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>

                <div className="absolute bottom-20 -right-6 w-14 h-14 bg-gradient-to-r from-pink-500 to-red-500 rounded-full flex items-center justify-center shadow-lg animate-bounce delay-1000">
                  <Heart className="w-7 h-7 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center text-white animate-bounce">
          <span className="text-sm mb-2">Scroll to learn more</span>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>

        {/* Bottom Gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/50 to-transparent"></div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-white">About <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Connectify</span></h2>
            <div className="w-24 h-1 bg-gradient-to-r from-purple-400 to-pink-400 mx-auto"></div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-white">Our Mission</h3>
              <p className="text-gray-300">
                Connectify was founded with a simple yet powerful mission: to bring people together in meaningful ways. 
                We believe that social media should enhance our lives, not complicate them.
              </p>
              <p className="text-gray-300">
                Our platform is designed to foster genuine connections, encourage authentic sharing, and create 
                communities where everyone feels valued and heard.
              </p>
              <div className="pt-4">
                <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                  Learn Our Story
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-purple-900 to-slate-800 p-6 rounded-2xl">
                <Users className="w-10 h-10 text-purple-400 mb-4" />
                <h4 className="text-xl font-bold text-white mb-2">Community First</h4>
                <p className="text-gray-300">Building spaces where people can truly connect and belong</p>
              </div>
              <div className="bg-gradient-to-br from-slate-800 to-purple-900 p-6 rounded-2xl">
                <MessageCircle className="w-10 h-10 text-purple-400 mb-4" />
                <h4 className="text-xl font-bold text-white mb-2">Meaningful Conversations</h4>
                <p className="text-gray-300">Facilitating discussions that matter and create impact</p>
              </div>
              <div className="bg-gradient-to-br from-slate-800 to-indigo-900 p-6 rounded-2xl">
                <Heart className="w-10 h-10 text-purple-400 mb-4" />
                <h4 className="text-xl font-bold text-white mb-2">Authentic Sharing</h4>
                <p className="text-gray-300">Encouraging real expression over curated perfection</p>
              </div>
              <div className="bg-gradient-to-br from-indigo-900 to-slate-800 p-6 rounded-2xl">
                <Share2 className="w-10 h-10 text-purple-400 mb-4" />
                <h4 className="text-xl font-bold text-white mb-2">Global Reach</h4>
                <p className="text-gray-300">Connecting people across borders and cultures</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-slate-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-white">Why Choose <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Connectify</span></h2>
            <div className="w-24 h-1 bg-gradient-to-r from-purple-400 to-pink-400 mx-auto"></div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-slate-900/80 p-8 rounded-2xl border border-purple-500/20 backdrop-blur-sm hover:transform hover:scale-105 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-6">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Smart Connections</h3>
              <p className="text-gray-300">
                Our AI-powered algorithm connects you with like-minded individuals and communities that share your interests and values.
              </p>
            </div>
            
            <div className="bg-slate-900/80 p-8 rounded-2xl border border-purple-500/20 backdrop-blur-sm hover:transform hover:scale-105 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-6">
                <MessageCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Meaningful Engagement</h3>
              <p className="text-gray-300">
                Designed to promote quality interactions over quantity, with features that encourage thoughtful conversations.
              </p>
            </div>
            
            <div className="bg-slate-900/80 p-8 rounded-2xl border border-purple-500/20 backdrop-blur-sm hover:transform hover:scale-105 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-6">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Privacy First</h3>
              <p className="text-gray-300">
                Advanced privacy controls that put you in charge of your data and who sees your content.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-white">Get In Touch</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-purple-400 to-pink-400 mx-auto"></div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-8">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Our Address</h3>
                  <p className="text-gray-300">
                    123 Innovation Drive<br />
                    Tech Valley, CA 94103<br />
                    United States
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Email Us</h3>
                  <p className="text-gray-300">
                    info@connectify.com<br />
                    support@connectify.com
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Phone className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Call Us</h3>
                  <p className="text-gray-300">
                    +1 (555) 123-4567<br />
                    +1 (555) 987-6543
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-slate-800 p-8 rounded-2xl">
              <h3 className="text-2xl font-bold text-white mb-6">Send Us a Message</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">Your Name</label>
                  <input 
                    type="text" 
                    id="name" 
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">Your Email</label>
                  <input 
                    type="email" 
                    id="email" 
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-1">Your Message</label>
                  <textarea 
                    id="message" 
                    rows={4}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  ></textarea>
                </div>
                <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
                  Send Message
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <h2 className="text-2xl font-bold">
                <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Connectify
                </span>
              </h2>
              <p className="text-gray-400 mt-2">Connect. Share. Inspire.</p>
            </div>
            
            <div className="flex space-x-6">
              <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.023.047 1.351.058 3.807.058h.468c2.456 0 2.784-.011 3.807-.058.975-.045 1.504-.207 1.857-.344.467-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.047-1.023.058-1.351.058-3.807v-.468c0-2.456-.011-2.784-.058-3.807-.045-.975-.207-1.504-.344-1.857a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* ✅ MODAL COMPONENTS - Same pattern as your existing LandingPage.jsx */}
      {showSignUpModal && (
        <SignUpModal
          isOpen={showSignUpModal}
          onClose={handleCloseModals}
          onSwitchToLogin={handleSwitchToLogin}
        />
      )}

      {showLoginModal && (
        <LoginForm
          isOpen={showLoginModal}
          onClose={handleCloseModals}
          onSwitchToSignUp={handleSwitchToSignUp}
        />
      )}

      {/* ✅ ANIMATIONS - Add these to your global CSS */}
      <style jsx>{`
        @keyframes text-shimmer {
          0% {
            background-position: 0% 50%;
          }
          100% {
            background-position: 100% 50%;
          }
        }

        @keyframes expand-line {
          0% {
            transform: scaleX(0);
          }
          100% {
            transform: scaleX(1);
          }
        }

        .animate-text-shimmer {
          animation: text-shimmer 3s ease-in-out infinite alternate;
        }

        .animate-expand-line {
          animation: expand-line 3s ease-in-out infinite alternate;
        }
      `}</style>
    </div>
  );
};

export default ConnectifyLanding;