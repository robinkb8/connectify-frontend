// components/pages/Profile/components/FollowersList.jsx
import React, { useState, useEffect } from 'react';
import { Loader2, User } from 'lucide-react';
import { Button } from '../../../ui/Button/Button';
import { UserCard } from '../../../ui/FollowButton/FollowButton';
import { useFollow } from '../../../../hooks/useFollow';

const FollowersList = ({ userId, className = "" }) => {
  const [followers, setFollowers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const { getFollowers } = useFollow();

  // Fetch followers
  const fetchFollowers = async (page = 1) => {
    setLoading(true);
    setError(null);

    try {
      const result = await getFollowers(userId, page, 20);
      
      if (result.success) {
        if (page === 1) {
          setFollowers(result.followers);
        } else {
          setFollowers(prev => [...prev, ...result.followers]);
        }
        setPagination(result.pagination);
        setCurrentPage(page);
      } else {
        setError(result.message || 'Failed to fetch followers');
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch followers');
    } finally {
      setLoading(false);
    }
  };

  // Load more followers
  const loadMore = () => {
    if (pagination?.has_next && !loading) {
      fetchFollowers(currentPage + 1);
    }
  };

  // Initial load
  useEffect(() => {
    if (userId) {
      fetchFollowers();
    }
  }, [userId]);

  if (loading && followers.length === 0) {
    return (
      <div className={`flex justify-center py-8 ${className}`}>
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <p className="text-red-500 dark:text-red-400 mb-4">{error}</p>
        <Button onClick={() => fetchFollowers()} variant="outline" size="sm">
          Try Again
        </Button>
      </div>
    );
  }

  if (followers.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500 dark:text-gray-400">No followers yet</p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Followers List */}
      {followers.map((follower) => (
        <UserCard
          key={follower.id}
          user={{
            id: follower.id,
            name: follower.full_name,
            username: follower.username,
            bio: follower.profile?.bio,
            followers: follower.profile?.followers_count,
            isFollowing: follower.is_following,
            isPrivate: follower.profile?.is_private,
            verified: false
          }}
          showFollowButton={true}
        />
      ))}

      {/* Load More Button */}
      {pagination?.has_next && (
        <div className="text-center pt-4">
          <Button
            onClick={loadMore}
            disabled={loading}
            variant="outline"
            className="w-full"
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Loading...</span>
              </div>
            ) : (
              'Load More'
            )}
          </Button>
        </div>
      )}

      {/* Pagination Info */}
      {pagination && (
        <div className="text-center text-sm text-gray-500 dark:text-gray-400">
          Showing {followers.length} of {pagination.total_count} followers
        </div>
      )}
    </div>
  );
};

export default FollowersList;