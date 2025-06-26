 

// ===== src/components/modals/ShareModal.jsx =====
import React, { useState } from 'react';
import { X, Copy, Facebook, Twitter, Instagram, Linkedin, Mail } from "lucide-react";
import { Button } from '../ui/Button/Button';

function ShareModal({ isOpen, onClose, postContent }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const shareOptions = [
    { name: "Facebook", icon: Facebook, color: "text-blue-600", action: shareToFacebook },
    { name: "Twitter", icon: Twitter, color: "text-blue-400", action: shareToTwitter },
    { name: "Instagram", icon: Instagram, color: "text-pink-500", action: shareToInstagram },
    { name: "LinkedIn", icon: Linkedin, color: "text-blue-700", action: shareToLinkedIn },
    { name: "Email", icon: Mail, color: "text-gray-600", action: shareViaEmail },
    { name: "Copy Link", icon: Copy, color: "text-gray-600", action: copyLink },
  ];

  function shareToFacebook() {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`;
    window.open(url, "_blank", "width=600,height=400");
  }

  function shareToTwitter() {
    const text = encodeURIComponent(postContent.substring(0, 200) + "...");
    const url = `https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(window.location.href)}`;
    window.open(url, "_blank", "width=600,height=400");
  }

  function shareToInstagram() {
    navigator.clipboard.writeText(postContent + "\n\n" + window.location.href);
    alert("Content copied! You can now paste it on Instagram.");
  }

  function shareToLinkedIn() {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`;
    window.open(url, "_blank", "width=600,height=400");
  }

  function shareViaEmail() {
    const subject = encodeURIComponent("Check out this post on Connectify");
    const body = encodeURIComponent(postContent + "\n\n" + window.location.href);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  }

  function copyLink() {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-background rounded-2xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold">Share Post</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-4">
          <div className="grid grid-cols-3 gap-4">
            {shareOptions.map((option) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.name}
                  onClick={option.action}
                  className="flex flex-col items-center space-y-2 p-3 rounded-lg hover:bg-muted transition-colors"
                >
                  <div className={`w-12 h-12 rounded-full bg-muted flex items-center justify-center ${option.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-medium">{option.name}</span>
                </button>
              );
            })}
          </div>

          {copied && (
            <div className="mt-4 p-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-lg text-center text-sm">
              Link copied to clipboard!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ShareModal;