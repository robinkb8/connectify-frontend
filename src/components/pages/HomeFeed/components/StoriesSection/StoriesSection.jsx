// src/components/pages/HomeFeed/components/StoriesSection/StoriesSection.jsx - REAL STORIES
import React, { useState, useEffect, useCallback } from 'react';

// ✅ API Configuration
const API_BASE_URL = 'http://127.0.0.1:8000/api';

// ✅ SAFE DATA ACCESS HELPERS
const safeGet = (obj, path, defaultValue = '') => {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : defaultValue;
  }, obj);
};

const getAvatarUrl = (avatarPath) => {
  if (!avatarPath || avatarPath === 'null' || avatarPath === null) {
    return '/api/placeholder/56/56';
  }
  return avatarPath;
};

const StoriesSection = ({ onCreateStory, onViewStory }) => {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ FETCH STORIES FROM API
  const fetchStories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/stories/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Stories fetched from Django:', data);

      // Transform API data to component format
      const transformedStories = (data.results || data || []).map(story => ({
        id: story.id,
        username: safeGet(story, 'author.username', 'Unknown User'),
        avatar: getAvatarUrl(safeGet(story, 'author.avatar')),
        isViewed: story.is_viewed || false,
        isExpired: story.is_expired || false,
        timePosted: story.time_since_posted || '0m',
        image: story.image_url,
        caption: story.caption || '',
        totalViews: story.total_views || 0
      }));

      console.log('✅ Transformed stories:', transformedStories);
      setStories(transformedStories);

    } catch (err) {
      console.error('❌ Failed to fetch stories:', err);
      setError(err.message);
      setStories([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ LOAD STORIES ON COMPONENT MOUNT
  useEffect(() => {
    fetchStories();
  }, [fetchStories]);

  // ✅ HANDLE STORY CLICK
  const handleStoryClick = useCallback(async (story) => {
    console.log('Story clicked:', story);

    // Mark story as viewed
    try {
      await fetch(`${API_BASE_URL}/stories/${story.id}/view/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      // Update local state to mark as viewed
      setStories(prevStories => 
        prevStories.map(s => 
          s.id === story.id ? { ...s, isViewed: true } : s
        )
      );

      // Call parent callback for story viewing
      if (onViewStory) {
        onViewStory(story);
      }

    } catch (error) {
      console.error('❌ Error marking story as viewed:', error);
    }
  }, [onViewStory]);

  // ✅ HANDLE CREATE STORY CLICK
  const handleCreateStoryClick = useCallback(() => {
    console.log('Create story clicked');
    if (onCreateStory) {
      onCreateStory();
    }
  }, [onCreateStory]);

  // ✅ REFRESH STORIES
  const handleRefresh = useCallback(() => {
    fetchStories();
  }, [fetchStories]);

  // ✅ LOADING STATE
  if (loading) {
    return (
      <section className="stories-section">
        <div className="stories-container">
          {/* Loading skeletons */}
          {[...Array(6)].map((_, index) => (
            <div key={index} className="story-item">
              <div className="story-avatar-container loading">
                <div className="story-avatar skeleton"></div>
              </div>
              <span className="story-username skeleton-text"></span>
            </div>
          ))}
        </div>

        <style jsx>{`
          .stories-section {
            background: white;
            border-bottom: 1px solid #e5e7eb;
            padding: 16px 0;
          }

          .stories-container {
            display: flex;
            gap: 16px;
            padding: 0 16px;
            overflow-x: auto;
            scrollbar-width: none;
            -ms-overflow-style: none;
          }

          .stories-container::-webkit-scrollbar {
            display: none;
          }

          .story-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 8px;
            min-width: 60px;
          }

          .story-avatar-container {
            position: relative;
            padding: 2px;
            border-radius: 50%;
            background: #e5e7eb;
          }

          .story-avatar {
            width: 56px;
            height: 56px;
            border-radius: 50%;
            background: #f3f4f6;
          }

          .story-username {
            font-size: 12px;
            color: #6b7280;
            text-align: center;
            width: 60px;
            height: 16px;
          }

          .skeleton {
            background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%);
            background-size: 200% 100%;
            animation: loading 1.5s infinite;
          }

          .skeleton-text {
            background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%);
            background-size: 200% 100%;
            animation: loading 1.5s infinite;
            border-radius: 4px;
          }

          @keyframes loading {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }
        `}</style>
      </section>
    );
  }

  // ✅ ERROR STATE
  if (error) {
    return (
      <section className="stories-section">
        <div className="error-container">
          <p className="error-text">Failed to load stories</p>
          <button onClick={handleRefresh} className="retry-button">
            Try Again
          </button>
        </div>

        <style jsx>{`
          .stories-section {
            background: white;
            border-bottom: 1px solid #e5e7eb;
            padding: 16px;
          }

          .error-container {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
            padding: 20px;
          }

          .error-text {
            color: #ef4444;
            font-size: 14px;
            margin: 0;
          }

          .retry-button {
            background: #3b82f6;
            color: white;
            border: none;
            padding: 6px 12px;
            border-radius: 6px;
            font-size: 12px;
            cursor: pointer;
            transition: background-color 0.2s ease;
          }

          .retry-button:hover {
            background: #2563eb;
          }
        `}</style>
      </section>
    );
  }

  return (
    <section className="stories-section">
      <div className="stories-container">
        {/* Create Story Button */}
        <div className="story-item" onClick={handleCreateStoryClick}>
          <div className="story-avatar-container create">
            <div className="story-avatar">
              <img 
                src="/api/placeholder/56/56" 
                alt="Your avatar"
                className="avatar-image"
              />
            </div>
            <div className="plus-icon">
              <span>+</span>
            </div>
          </div>
          <span className="story-username">Your Story</span>
        </div>

        {/* Real Stories */}
        {stories.map((story) => (
          <div 
            key={story.id}
            onClick={() => handleStoryClick(story)}
            className="story-item clickable"
          >
            <div className={`story-avatar-container ${story.isViewed ? 'viewed' : 'unviewed'}`}>
              <div className="story-avatar">
                <img 
                  src={story.avatar} 
                  alt={story.username}
                  className="avatar-image"
                  onError={(e) => {
                    e.target.src = '/api/placeholder/56/56';
                  }}
                />
              </div>
            </div>
            <span className="story-username">{story.username}</span>
            <span className="story-time">{story.timePosted}</span>
          </div>
        ))}

        {/* Empty State */}
        {stories.length === 0 && !loading && (
          <div className="empty-state">
            <p className="empty-text">No stories available</p>
            <button onClick={handleRefresh} className="refresh-button">
              Refresh
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        /* ✅ RESPONSIVE STORIES SECTION */
        .stories-section {
          background: white;
          border-bottom: 1px solid #e5e7eb;
          padding: 16px 0;
        }

        .stories-container {
          display: flex;
          gap: 16px;
          padding: 0 16px;
          overflow-x: auto;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }

        .stories-container::-webkit-scrollbar {
          display: none;
        }

        /* Story Items */
        .story-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          min-width: 60px;
          flex-shrink: 0;
        }

        .story-item.clickable {
          cursor: pointer;
        }

        .story-item.clickable:hover .story-avatar-container {
          transform: scale(1.05);
        }

        /* Avatar Container */
        .story-avatar-container {
          position: relative;
          padding: 3px;
          border-radius: 50%;
          transition: transform 0.2s ease;
        }

        .story-avatar-container.create {
          background: linear-gradient(45deg, #a855f7, #ec4899);
        }

        .story-avatar-container.unviewed {
          background: linear-gradient(45deg, #a855f7, #ec4899);
        }

        .story-avatar-container.viewed {
          background: #d1d5db;
        }

        /* Avatar */
        .story-avatar {
          position: relative;
          background: white;
          padding: 2px;
          border-radius: 50%;
        }

        .avatar-image {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          object-fit: cover;
          display: block;
        }

        /* Plus Icon for Create Story */
        .plus-icon {
          position: absolute;
          bottom: 0;
          right: 0;
          background: linear-gradient(45deg, #a855f7, #ec4899);
          border-radius: 50%;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid white;
        }

        .plus-icon span {
          color: white;
          font-size: 12px;
          font-weight: bold;
        }

        /* Username */
        .story-username {
          font-size: 12px;
          color: #374151;
          text-align: center;
          width: 60px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        /* Time Posted */
        .story-time {
          font-size: 10px;
          color: #9ca3af;
          text-align: center;
        }

        /* Empty State */
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 20px;
          min-width: 200px;
        }

        .empty-text {
          color: #6b7280;
          font-size: 14px;
          margin: 0;
        }

        .refresh-button {
          background: #3b82f6;
          color: white;
          border: none;
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 12px;
          cursor: pointer;
          transition: background-color 0.2s ease;
        }

        .refresh-button:hover {
          background: #2563eb;
        }

        /* ✅ RESPONSIVE BREAKPOINTS */
        @media (min-width: 640px) {
          .stories-container {
            max-width: 500px;
            margin: 0 auto;
            padding: 0;
          }
        }

        @media (min-width: 1024px) {
          .stories-container {
            max-width: 600px;
          }
        }

        /* Touch improvements */
        @media (pointer: coarse) {
          .story-item {
            min-width: 70px;
          }

          .avatar-image {
            width: 64px;
            height: 64px;
          }

          .plus-icon {
            width: 24px;
            height: 24px;
          }
        }
      `}</style>
    </section>
  );
};

export default StoriesSection;