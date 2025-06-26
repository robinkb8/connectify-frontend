 

// ===== src/components/pages/HomeFeed/components/SimpleCreatePost.jsx =====
import React, { useState } from 'react';
import { Button } from '../../../ui/Button/Button';
import PostCreationModal from '../../../modals/PostCreationModal';

function SimpleCreatePost({ onPostCreated }) {
  const [showModal, setShowModal] = useState(false);

  const handlePostCreated = () => {
    setShowModal(false);
    if (onPostCreated) {
      onPostCreated();
    }
  };

  return (
    <>
      <div className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-6">
        <div className="flex space-x-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-lg">Y</span>
          </div>

          <Button
            variant="ghost"
            onClick={() => setShowModal(true)}
            className="flex-1 justify-start text-muted-foreground hover:text-foreground hover:bg-muted rounded-full px-4 py-3 h-auto"
          >
            What's on your mind?
          </Button>
        </div>
      </div>

      <PostCreationModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)}
        onPostCreated={handlePostCreated}
      />
    </>
  );
}

export default SimpleCreatePost;