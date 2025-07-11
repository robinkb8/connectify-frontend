// ===== src/components/modals/ShareModal.jsx - ENHANCED DARK/LIGHT MODE STYLING =====
import React, { useState } from 'react';
import { X, Copy, Facebook, Twitter, Linkedin, Mail, MessageCircle } from "lucide-react";
import { Button } from '../ui/Button/Button';

// 🆕 WhatsApp Icon Component
const WhatsAppIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.485"/>
  </svg>
);

function ShareModal({ 
  isOpen, 
  onClose, 
  post, 
  postContent, 
  postUrl, 
  authorName, 
  onShareSuccess 
}) {
  const [copied, setCopied] = useState(false);
  const [sharing, setSharing] = useState(null);

  if (!isOpen) return null;

  // 🆕 ENHANCED: WhatsApp sharing with mobile deep linking
  const shareToWhatsApp = () => {
    setSharing('WhatsApp');
    try {
      const shareText = `Check out this post${authorName ? ` by ${authorName}` : ''}: ${(postContent || '').substring(0, 100)}${(postContent || '').length > 100 ? '...' : ''}\n\n${postUrl || window.location.href}`;
      const encodedText = encodeURIComponent(shareText);
      
      // Try mobile app deep link first
      if (/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        window.location.href = `whatsapp://send?text=${encodedText}`;
        // Fallback to web version after delay
        setTimeout(() => {
          window.open(`https://wa.me/?text=${encodedText}`, '_blank');
        }, 2000);
      } else {
        window.open(`https://wa.me/?text=${encodedText}`, '_blank');
      }
      
      setTimeout(() => {
        onShareSuccess?.();
        setSharing(null);
      }, 1000);
    } catch (error) {
      console.error('WhatsApp share failed:', error);
      setSharing(null);
    }
  };

  const shareToFacebook = () => {
    setSharing('Facebook');
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl || window.location.href)}`;
    window.open(url, "_blank", "width=600,height=400");
    setTimeout(() => {
      onShareSuccess?.();
      setSharing(null);
    }, 1000);
  };

  const shareToTwitter = () => {
    setSharing('Twitter');
    const text = encodeURIComponent((postContent || '').substring(0, 200) + "...");
    const url = `https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(postUrl || window.location.href)}`;
    window.open(url, "_blank", "width=600,height=400");
    setTimeout(() => {
      onShareSuccess?.();
      setSharing(null);
    }, 1000);
  };

  const shareToLinkedIn = () => {
    setSharing('LinkedIn');
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(postUrl || window.location.href)}`;
    window.open(url, "_blank", "width=600,height=400");
    setTimeout(() => {
      onShareSuccess?.();
      setSharing(null);
    }, 1000);
  };

  const shareViaEmail = () => {
    setSharing('Email');
    const subject = encodeURIComponent(`Check out this post${authorName ? ` by ${authorName}` : ''}`);
    const body = encodeURIComponent((postContent || 'Check out this post!') + "\n\n" + (postUrl || window.location.href));
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
    setTimeout(() => {
      onShareSuccess?.();
      setSharing(null);
    }, 1000);
  };

  const copyLink = async () => {
    setSharing('Copy Link');
    try {
      await navigator.clipboard.writeText(postUrl || window.location.href);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        onShareSuccess?.();
        setSharing(null);
      }, 2000);
    } catch (error) {
      console.error('Copy failed:', error);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = postUrl || window.location.href;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        onShareSuccess?.();
        setSharing(null);
      }, 2000);
    }
  };

  // 🆕 ENHANCED: Share options with WhatsApp + better styling
  const shareOptions = [
    { 
      name: "WhatsApp", 
      icon: WhatsAppIcon, 
      color: "text-green-600", 
      bgColor: "bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30", 
      action: shareToWhatsApp 
    },
    { 
      name: "Facebook", 
      icon: Facebook, 
      color: "text-blue-600", 
      bgColor: "bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30", 
      action: shareToFacebook 
    },
    { 
      name: "Twitter", 
      icon: Twitter, 
      color: "text-sky-500", 
      bgColor: "bg-sky-50 dark:bg-sky-900/20 hover:bg-sky-100 dark:hover:bg-sky-900/30", 
      action: shareToTwitter 
    },
    { 
      name: "LinkedIn", 
      icon: Linkedin, 
      color: "text-blue-700", 
      bgColor: "bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30", 
      action: shareToLinkedIn 
    },
    { 
      name: "Email", 
      icon: Mail, 
      color: "text-gray-600 dark:text-gray-300", 
      bgColor: "bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600", 
      action: shareViaEmail 
    },
    { 
      name: "Copy Link", 
      icon: Copy, 
      color: "text-gray-600 dark:text-gray-300", 
      bgColor: "bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600", 
      action: copyLink 
    },
  ];

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-700 animate-slideUp">
        
        {/* 🆕 ENHANCED: Header with gradient and better contrast */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-teal-50 dark:from-gray-800 dark:to-gray-700">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Share Post</h2>
            {authorName && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                by {authorName}
              </p>
            )}
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            className="h-10 w-10 rounded-full hover:bg-white/50 dark:hover:bg-gray-600 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* 🆕 ENHANCED: Content preview with better contrast */}
        {postContent && (
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
            <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
              "{postContent.substring(0, 120)}{postContent.length > 120 ? '...' : ''}"
            </p>
          </div>
        )}

        {/* 🆕 ENHANCED: Share options with perfect dark/light mode styling */}
        <div className="p-6">
          <div className="grid grid-cols-3 gap-4">
            {shareOptions.map((option) => {
              const Icon = option.icon;
              const isSharing = sharing === option.name;
              
              return (
                <button
                  key={option.name}
                  onClick={option.action}
                  disabled={isSharing}
                  className={`
                    flex flex-col items-center space-y-3 p-4 rounded-xl transition-all duration-200 
                    hover:scale-105 hover:shadow-md active:scale-95
                    ${option.bgColor}
                    ${isSharing ? 'opacity-50 cursor-wait' : 'hover:shadow-lg'}
                  `}
                >
                  <div className={`
                    w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200
                    ${option.color} bg-white dark:bg-gray-600 shadow-sm
                    ${isSharing ? 'animate-pulse' : ''}
                  `}>
                    {isSharing ? (
                      <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Icon className="w-6 h-6" />
                    )}
                  </div>
                  <span className={`text-xs font-medium text-center ${option.color}`}>
                    {isSharing ? 'Sharing...' : option.name}
                  </span>
                </button>
              );
            })}
          </div>

          {/* 🆕 ENHANCED: Success feedback with better styling */}
          {copied && (
            <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200 rounded-xl text-center animate-slideDown">
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
                <span className="font-medium">Link copied to clipboard!</span>
              </div>
            </div>
          )}

          {/* 🆕 ENHANCED: URL display with better contrast */}
          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600">
            <div className="flex items-center gap-3">
              <MessageCircle className="w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
              <code className="text-xs text-gray-600 dark:text-gray-300 truncate flex-1 bg-white dark:bg-gray-800 px-2 py-1 rounded border">
                {postUrl || window.location.href}
              </code>
            </div>
          </div>
        </div>
      </div>

      {/* 🆕 ENHANCED: Custom animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
            max-height: 0;
          }
          to {
            opacity: 1;
            transform: translateY(0);
            max-height: 100px;
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        
        .animate-slideUp {
          animation: slideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }

        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}

export default ShareModal;