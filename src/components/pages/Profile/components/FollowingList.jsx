// components/pages/Profile/components/FollowingList.jsx
import React, { useState, useEffect } from 'react';
import { Loader2, User } from 'lucide-react';
import { Button } from '../../../ui/Button/Button';
import { UserCard } from '../../../ui/FollowButton/FollowButton';
import { useFollow } from '../../../../hooks/useFollow';

const FollowingList = ({ userId, className = "" }) => {
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const { getFollowing } = useFollow();

  // Fetch following
  const fetchFollowing = async (page = 1) => {
    setLoading(true);
    setError(null);

    try {
      const result = await getFollowing(userId, page, 20);
      
      if (result.success) {
        if (page === 1) {
          setFollowing(result.following);
        } else {
          setFollowing(prev => [...prev, ...result.following]);
        }
        setPagination(result.pagination);
        setCurrentPage(page);
      } else {
        setError(result.message || 'Failed to fetch following');
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch following');
    } finally {
      setLoading(false);
    }
  };

  // Load more following
  const loadMore = () => {
    if (pagination?.has_next && !loading) {
      fetchFollowing(currentPage + 1);
    }
  };

  // Initial load
  useEffect(() => {
    if (userId) {
      fetchFollowing();
    }
  }, [userId]);

  if (loading && following.length === 0) {
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
        <Button onClick={() => fetchFollowing()} variant="outline" size="sm">
          Try Again
        </Button>
      </div>
    );
  }

  if (following.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500 dark:text-gray-400">Not following anyone yet</p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Following List */}
      {following.map((followingUser) => (
        <UserCard
          key={followingUser.id}
          user={{
            id: followingUser.id,
            name: followingUser.full_name,
            username: followingUser.username,
            bio: followingUser.profile?.bio,
            followers: followingUser.profile?.followers_count,
            isFollowing: followingUser.is_following,
            isPrivate: followingUser.profile?.is_private,
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
          Showing {following.length} of {pagination.total_count} following
        </div>
      )}
    </div>
  );
};

export default FollowingList;