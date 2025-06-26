 
// ===== src/components/modals/PostOptionsMenu.jsx =====
import React from 'react';
import { X, Flag, VolumeX, EyeOff, Settings } from "lucide-react";

function PostOptionsMenu({ isOpen, onClose, isOwnPost = false }) {
  if (!isOpen) return null;

  const handleReport = () => {
    alert("Post reported. Thank you for helping keep our community safe.");
    onClose();
  };

  const handleMute = () => {
    alert("Account muted. You won't see posts from this user anymore.");
    onClose();
  };

  const handleHide = () => {
    alert("Post hidden from your feed.");
    onClose();
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this post?")) {
      alert("Post deleted.");
      onClose();
    }
  };

  const handleEdit = () => {
    alert("Edit functionality would open here.");
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="absolute right-0 top-8 w-48 bg-background border border-border rounded-lg shadow-lg z-50 py-2">
        {isOwnPost ? (
          <>
            <button
              onClick={handleEdit}
              className="w-full text-left px-4 py-2 hover:bg-muted flex items-center space-x-2"
            >
              <Settings className="w-4 h-4" />
              <span>Edit Post</span>
            </button>
            <button
              onClick={handleDelete}
              className="w-full text-left px-4 py-2 hover:bg-muted text-red-500 flex items-center space-x-2"
            >
              <X className="w-4 h-4" />
              <span>Delete Post</span>
            </button>
          </>
        ) : (
          <>
            <button
              onClick={handleReport}
              className="w-full text-left px-4 py-2 hover:bg-muted flex items-center space-x-2"
            >
              <Flag className="w-4 h-4" />
              <span>Report Post</span>
            </button>
            <button
              onClick={handleMute}
              className="w-full text-left px-4 py-2 hover:bg-muted flex items-center space-x-2"
            >
              <VolumeX className="w-4 h-4" />
              <span>Mute Account</span>
            </button>
            <button
              onClick={handleHide}
              className="w-full text-left px-4 py-2 hover:bg-muted flex items-center space-x-2"
            >
              <EyeOff className="w-4 h-4" />
              <span>Hide Post</span>
            </button>
          </>
        )}
      </div>
    </>
  );
}

export default PostOptionsMenu;