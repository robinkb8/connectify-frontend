// src/components/pages/UpgradePage/UpgradePage.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Check, Crown, Star, Zap, Shield, ArrowRight, Infinity, Loader2 } from "lucide-react";
import { Button } from "../../ui/Button/Button";
import { useAuth } from "../../../contexts/AuthContext";

export default function UpgradePage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, upgradeToPro, verifyPayment, isEligibleForUpgrade } = useAuth();
  
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredFeature, setHoveredFeature] = useState(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null); // 'success', 'error', or null
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Redirect if user is already pro
  useEffect(() => {
    if (user && user.is_pro) {
      navigate("/home");
    }
  }, [user, navigate]);

  const features = [
    {
      icon: Crown,
      title: "Verified Badge",
      description: "Get the coveted blue checkmark that sets you apart",
      color: "from-blue-400 to-cyan-400",
    },
    {
      icon: Infinity,
      title: "Unlimited Everything",
      description: "No limits on posts, connections, or storage space",
      color: "from-emerald-400 to-teal-400",
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Priority servers for instant loading and responses",
      color: "from-amber-400 to-orange-400",
    },
    {
      icon: Shield,
      title: "Advanced Security",
      description: "Military-grade encryption and privacy protection",
      color: "from-violet-400 to-purple-400",
    },
  ];

  const benefits = [
    "Remove all advertisements forever",
    "Unlimited high-quality media uploads",
    "Advanced analytics and insights",
    "Custom profile themes and layouts",
    "Priority customer support 24/7",
    "Early access to beta features",
    "Enhanced messaging capabilities",
    "Exclusive premium-only content",
  ];

  const handleBack = () => {
    navigate("/home");
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    // Check authentication
    if (!isAuthenticated) {
      setPaymentStatus("error");
      setStatusMessage("Please login to upgrade to Pro");
      return;
    }

    // Check eligibility
    if (!isEligibleForUpgrade()) {
      setPaymentStatus("error");
      setStatusMessage("You already have a Pro subscription");
      return;
    }

    setIsProcessingPayment(true);
    setPaymentStatus(null);
    setStatusMessage("");

    try {
      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error("Failed to load Razorpay SDK");
      }

      // Create payment order
      const orderResponse = await upgradeToPro();
      
      if (!orderResponse.success) {
        throw new Error(orderResponse.message || "Failed to create payment order");
      }

      const { order, keyId, config } = orderResponse;

      // Configure Razorpay options
      const options = {
        key: keyId,
        amount: order.amount,
        currency: order.currency,
        name: "Connectify",
        description: "Upgrade to Connectify Pro",
        order_id: order.id,
        handler: async function (response) {
          try {
            // Verify payment on backend
            const verificationResponse = await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verificationResponse.success) {
              setPaymentStatus("success");
              setStatusMessage(verificationResponse.data?.message || "Welcome to Connectify Pro!");
              
              // Redirect to home after 3 seconds
              setTimeout(() => {
                navigate("/home");
              }, 3000);
            } else {
              throw new Error(verificationResponse.message || "Payment verification failed");
            }
          } catch (error) {
            console.error("Payment verification error:", error);
            setPaymentStatus("error");
            setStatusMessage("Payment verification failed. Please contact support.");
          } finally {
            setIsProcessingPayment(false);
          }
        },
        prefill: {
          name: user?.full_name || "",
          email: user?.email || "",
          contact: user?.phone || "",
        },
        notes: {
          user_id: user?.id || "",
          subscription_type: "pro",
        },
        theme: {
          color: "#3B82F6",
        },
        modal: {
          ondismiss: function () {
            setIsProcessingPayment(false);
            setPaymentStatus("error");
            setStatusMessage("Payment cancelled");
          },
        },
      };

      // Open Razorpay checkout
      const razorpay = new window.Razorpay(options);
      razorpay.open();

    } catch (error) {
      console.error("Payment error:", error);
      setIsProcessingPayment(false);
      setPaymentStatus("error");
      setStatusMessage(error.message || "Payment failed. Please try again.");
    }
  };

  // Card Component (inline since it's simple)
  const Card = ({ children, className = "", onMouseEnter, onMouseLeave }) => (
    <div className={`rounded-lg ${className}`} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
      {children}
    </div>
  );

  const CardContent = ({ children, className = "" }) => (
    <div className={className}>
      {children}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden">
      {/* Animated Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.03)_1px,transparent_1px)] bg-[size:72px_72px] [mask-image:radial-gradient(ellipse_at_center,black_50%,transparent_100%)]"></div>

      {/* Floating Orbs */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1000ms' }}></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '500ms' }}></div>

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between p-6 border-b border-slate-800/50 backdrop-blur-sm">
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-slate-400 hover:text-white hover:bg-slate-800/50"
          onClick={handleBack}
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
          <h1 className="text-xl font-semibold text-slate-200">Upgrade to Pro</h1>
        </div>
        <div className="w-10"></div>
      </div>

      <div className="relative z-10 px-6 pb-8 max-w-4xl mx-auto">
        {/* Status Messages */}
        {paymentStatus && (
          <div
            className={`mb-8 p-4 rounded-lg border ${
              paymentStatus === "success"
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                : "bg-red-500/10 border-red-500/20 text-red-400"
            }`}
          >
            <div className="flex items-center">
              {paymentStatus === "success" ? (
                <Check className="h-5 w-5 mr-2" />
              ) : (
                <Shield className="h-5 w-5 mr-2" />
              )}
              <span>{statusMessage}</span>
            </div>
          </div>
        )}

        {/* Hero Section */}
        <div
          className={`text-center py-16 transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className="relative inline-block mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-teal-500/20 rounded-2xl blur-xl"></div>
            <div className="relative bg-gradient-to-r from-slate-800 to-slate-700 p-6 rounded-2xl border border-slate-700/50 backdrop-blur-sm">
              <div className="bg-gradient-to-r from-blue-400 to-teal-400 p-3 rounded-xl inline-block">
                <Crown className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>

          <h2 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              Unlock Your
            </span>
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-teal-400 to-emerald-400 bg-clip-text text-transparent">
              Full Potential
            </span>
          </h2>

          <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Join thousands of creators who've elevated their Connectify experience with premium features designed for
            success.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-16">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card
                key={index}
                className={`group bg-slate-900/50 border border-slate-800/50 backdrop-blur-sm hover:bg-slate-800/50 transition-all duration-500 cursor-pointer ${
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
                style={{ transitionDelay: `${index * 150}ms` }}
                onMouseEnter={() => setHoveredFeature(index)}
                onMouseLeave={() => setHoveredFeature(null)}
              >
                <CardContent className="p-8">
                  <div className="flex items-start space-x-4">
                    <div
                      className={`p-4 rounded-xl bg-gradient-to-r ${feature.color} bg-opacity-10 group-hover:scale-110 transition-transform duration-300`}
                    >
                      <Icon className={`h-6 w-6 bg-gradient-to-r ${feature.color} bg-clip-text text-transparent`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-blue-400 transition-colors">
                        {feature.title}
                      </h3>
                      <p className="text-slate-400 leading-relaxed">{feature.description}</p>
                    </div>
                  </div>
                  <div
                    className={`mt-4 h-1 bg-gradient-to-r ${feature.color} rounded-full transform origin-left transition-transform duration-300 ${
                      hoveredFeature === index ? "scale-x-100" : "scale-x-0"
                    }`}
                  ></div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Benefits Section */}
        <Card
          className={`bg-slate-900/30 border border-slate-800/50 backdrop-blur-sm mb-12 transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
          style={{ transitionDelay: "600ms" }}
        >
          <CardContent className="p-8">
            <div className="flex items-center mb-8">
              <div className="bg-gradient-to-r from-emerald-400 to-teal-400 p-2 rounded-lg mr-4">
                <Star className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white">Everything You Need to Succeed</h3>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {benefits.map((benefit, index) => (
                <div
                  key={index}
                  className={`flex items-center p-4 rounded-lg bg-slate-800/30 hover:bg-slate-800/50 transition-all duration-300 ${
                    isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
                  }`}
                  style={{ transitionDelay: `${800 + index * 100}ms` }}
                >
                  <div className="bg-emerald-500/20 p-2 rounded-full mr-4 flex-shrink-0">
                    <Check className="h-4 w-4 text-emerald-400" />
                  </div>
                  <span className="text-slate-300">{benefit}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pricing Section */}
        <div
          className={`text-center mb-12 transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
          style={{ transitionDelay: "1400ms" }}
        >
          <div className="bg-gradient-to-r from-slate-900/50 to-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 max-w-md mx-auto">
            <div className="text-sm text-slate-400 mb-2 uppercase tracking-wider">Limited Time Offer</div>
            <div className="flex items-baseline justify-center mb-4">
              <span className="text-6xl font-bold bg-gradient-to-r from-blue-400 to-teal-400 bg-clip-text text-transparent">
                ₹10
              </span>
              <span className="text-slate-400 ml-2 text-lg">/month</span>
            </div>
            <div className="flex items-center justify-center space-x-2 text-sm text-slate-500">
              <span className="line-through">₹99</span>
              <span className="bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-full text-xs font-medium">
                90% OFF
              </span>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div
          className={`space-y-6 transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
          style={{ transitionDelay: "1600ms" }}
        >
          <Button 
            className={`w-full font-semibold py-6 text-lg rounded-xl shadow-2xl transition-all duration-300 transform hover:scale-[1.02] group ${
              isProcessingPayment || paymentStatus === "success"
                ? "bg-slate-600 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 hover:shadow-blue-500/25"
            }`}
            onClick={handlePayment}
            disabled={isProcessingPayment || paymentStatus === "success"}
          >
            {isProcessingPayment ? (
              <>
                <Loader2 className="h-5 w-5 mr-3 animate-spin" />
                Processing Payment...
              </>
            ) : paymentStatus === "success" ? (
              <>
                <Check className="h-5 w-5 mr-3 text-emerald-400" />
                Payment Successful!
              </>
            ) : (
              <>
                <Crown className="h-5 w-5 mr-3 group-hover:rotate-12 transition-transform" />
                Upgrade Now - ₹10
                <ArrowRight className="h-5 w-5 ml-3 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </Button>

          <div className="flex items-center justify-center space-x-8 text-sm text-slate-400">
            <div className="flex items-center">
              <Shield className="h-4 w-4 mr-2 text-emerald-400" />
              30-day guarantee
            </div>
            <div className="flex items-center">
              <Zap className="h-4 w-4 mr-2 text-blue-400" />
              Instant activation
            </div>
            <div className="flex items-center">
              <Check className="h-4 w-4 mr-2 text-teal-400" />
              Cancel anytime
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}