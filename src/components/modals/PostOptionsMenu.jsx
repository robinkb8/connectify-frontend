// src/components/modals/PostOptionsMenu.jsx
import React from 'react';
import { Edit, Trash2, Flag, Copy, Settings } from 'lucide-react';

function PostOptionsMenu({ isOpen, onClose, isOwnPost = false }) {
  if (!isOpen) return null;

  const handleEdit = () => {
    console.log('Edit post');
    onClose();
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      console.log('Delete post');
    }
    onClose();
  };

  const handleReport = () => {
    console.log('Report post');
    onClose();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    console.log('Link copied');
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="absolute right-0 top-8 w-48 bg-white border rounded-lg shadow-lg z-50 py-2">
        {isOwnPost ? (
          <>
            <button
              onClick={handleEdit}
              className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center space-x-2"
            >
              <Settings className="w-4 h-4" />
              <span>Edit Post</span>
            </button>
            <button
              onClick={handleDelete}
              className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-500 flex items-center space-x-2"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete Post</span>
            </button>
          </>
        ) : (
          <button
            onClick={handleReport}
            className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center space-x-2"
          >
            <Flag className="w-4 h-4" />
            <span>Report Post</span>
          </button>
        )}
        <button
          onClick={handleCopyLink}
          className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center space-x-2"
        >
          <Copy className="w-4 h-4" />
          <span>Copy Link</span>
        </button>
      </div>
    </>
  );
}

export default PostOptionsMenu;