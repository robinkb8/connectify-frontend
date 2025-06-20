import React, { useState, useCallback } from 'react';

// ✅ OPTIMIZED: Static dummy post data (no recreation per render)
const DUMMY_POST = {
  id: '1',
  user: {
    username: 'alex_photographer',
    avatar: '/api/placeholder/32/32',
    verified: false
  },
  content: 'Just captured this amazing sunset over the mountains! Sometimes nature provides the most incredible backdrops for photography. What do you think?',
  image: '/api/placeholder/400/300',
  timestamp: '2h ago',
  votes: {
    up: 1247,
    down: 23,
    userVote: null  // null, 'up', or 'down'
  },
  comments: 89,
  shares: 34
};

const PostCard = () => {
  // ✅ ADD THIS STATE MANAGEMENT:
  const [voteState, setVoteState] = useState({
    up: DUMMY_POST.votes.up,
    down: DUMMY_POST.votes.down,
    userVote: DUMMY_POST.votes.userVote  // null, 'up', or 'down'
  });

  // ✅ REPLACE your handleVote function with this REAL one:
  const handleVote = useCallback((voteType) => {
    setVoteState(currentState => {
      const newState = { ...currentState };
      
      if (newState.userVote === voteType) {
        // Remove vote if clicking same button
        newState[voteType] -= 1;
        newState.userVote = null;
      } else {
        // Add new vote
        if (newState.userVote) {
          // Remove previous vote first
          newState[newState.userVote] -= 1;
        }
        newState[voteType] += 1;
        newState.userVote = voteType;
      }
      
      return newState;
    });
  }, []);

  // Keep your other handlers the same...
  const handleComment = useCallback(() => {
    console.log('Comments clicked');
  }, []);

  const handleShare = useCallback(() => {
    console.log('Share clicked');
  }, []);

 return (
    <article className="bg-white border border-gray-200 rounded-xl shadow-sm mb-4 overflow-hidden">
      {/* User Header */}
      <div className="flex items-center space-x-3 p-4 pb-3">
        <img 
          src={DUMMY_POST.user.avatar} 
          alt={DUMMY_POST.user.username}
          className="w-8 h-8 rounded-full object-cover"
        />
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{DUMMY_POST.user.username}</h3>
          <p className="text-xs text-gray-500">{DUMMY_POST.timestamp}</p>
        </div>
      </div>

      {/* Post Content */}
      <div className="px-4 pb-3">
        <p className="text-gray-800 leading-relaxed">{DUMMY_POST.content}</p>
      </div>

      {/* Post Image */}
      <div className="relative bg-gray-100">
        <img 
          src={DUMMY_POST.image} 
          alt="Post content"
          className="w-full object-cover"
          style={{ aspectRatio: '16/9' }}
        />
      </div>

     {/* Interaction Bar */}
<div className="flex items-center justify-between p-4 pt-3 border-t border-gray-100">
  <div className="flex items-center space-x-2">
    <button 
      onClick={() => handleVote('up')}
      className={`flex items-center space-x-1 px-2 py-1 rounded-lg transition-colors ${
        voteState.userVote === 'up' 
          ? 'bg-green-100 text-green-600' 
          : 'hover:bg-green-50 text-gray-600'
      }`}
    >
      <span>⬆️</span>
      <span className="text-sm font-medium">{voteState.up}</span>
    </button>
    
    <button 
      onClick={() => handleVote('down')}
      className={`flex items-center space-x-1 px-2 py-1 rounded-lg transition-colors ${
        voteState.userVote === 'down' 
          ? 'bg-red-100 text-red-600' 
          : 'hover:bg-red-50 text-gray-600'
      }`}
    >
      <span>⬇️</span>
      <span className="text-sm font-medium">{voteState.down}</span>
    </button>
  </div>
  
  {/* Keep the comment and share buttons the same */}
  <div className="flex items-center space-x-4">
    <button 
      onClick={handleComment}
      className="flex items-center space-x-1 text-gray-600 hover:text-blue-600 transition-colors"
    >
      <span>💬</span>
      <span className="text-sm">{DUMMY_POST.comments}</span>
    </button>
    
    <button 
      onClick={handleShare}
      className="flex items-center space-x-1 text-gray-600 hover:text-purple-600 transition-colors"
    >
      <span>📤</span>
      <span className="text-sm">{DUMMY_POST.shares}</span>
    </button>
  </div>
</div>
    </article>
  );
};

export default PostCard;