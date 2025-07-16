// components/pages/Profile/UserProfile.jsx - FIXED MESSAGE BUTTON & AVATAR DISPLAY + POST COUNT SYNC + COMMENTS MODAL + Redux Integration
import React, { useState, useEffect, useCallback } from 'react'; // ✅ PRESERVED: useCallback import
import { useParams, useNavigate } from 'react-router-dom';
import { Settings, MapPin, Calendar, LinkIcon, Edit3, MoreHorizontal, MessageCircle } from "lucide-react";
import { Button } from '../../ui/Button/Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/Tabs/Tabs';
import PostCard from '../HomeFeed/components/PostCard';
import FollowButton, { FOLLOW_STATES } from '../../ui/FollowButton'; 
import { ResponsiveContainer } from '../../layout/ResponsiveLayout';
import useProfileRedux from '../../../hooks/useProfileRedux'; // 🆕 SURGICAL CHANGE: Redux hook
import { useAuth } from '../../../contexts/AuthContext';
import { postsAPI } from '../../../utils/api';
import useMessagingRedux from '../../../hooks/useMessagingRedux'; // 🆕 SURGICAL CHANGE: Redux messaging hook
import EditProfileModal from './EditProfileModal';
import EnhancedCommentsModal from '../../modals/EnhancedCommentsModal';  // 🆕 SURGICAL FIX: Added comments modal import

// PRESERVED: Avatar URL helper function
const getFullAvatarUrl = (avatarPath) => {
  if (!avatarPath) return null;
  // If already a full URL, return as-is
  if (avatarPath.startsWith('http')) return avatarPath;
  // Convert relative path to full URL
  return `http://127.0.0.1:8000${avatarPath}`;
};

function UserProfile({ isOwnProfile: propIsOwnProfile, onBack, userId: propUserId }) {
  // PRESERVED: Get username from URL params or use current user
  const { username } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, updateUser } = useAuth();
  
  // PRESERVED: State management
  const [activeTab, setActiveTab] = useState("posts");
  const [userPosts, setUserPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isCreatingChat, setIsCreatingChat] = useState(false);

  // 🆕 SURGICAL FIX: Comments modal state
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);

  // 🆕 SURGICAL CHANGE: Use Redux messaging hook
  const { createChat } = useMessagingRedux();

  // PRESERVED: Determine which user profile to show
  const targetUsername = username || currentUser?.username;
  const targetUserId = propUserId || currentUser?.id;

  // 🆕 SURGICAL CHANGE: Use Redux profile hook with identical API
  const { 
    profile, 
    loading: profileLoading, 
    error: profileError, 
    isOwnProfile: hookIsOwnProfile,
    refreshProfile 
  } = useProfileRedux(targetUsername);

  // PRESERVED: Determine if this is own profile
  const isOwnProfile = propIsOwnProfile !== undefined ? propIsOwnProfile : hookIsOwnProfile;

  // PRESERVED: Fetch user posts
  useEffect(() => {
    const fetchUserPosts = async () => {
      if (!profile?.id) return;

      setPostsLoading(true);
      try {
        const response = await postsAPI.getUserPosts(profile.id);
        if (response && response.results) {
          setUserPosts(response.results);
        }
      } catch (error) {
        console.error('Failed to fetch user posts:', error);
        setUserPosts([]);
      } finally {
        setPostsLoading(false);
      }
    };

    fetchUserPosts();
  }, [profile?.id]);

  // PRESERVED: Sync AuthContext posts count with actual posts array
  useEffect(() => {
    if (isOwnProfile && currentUser && userPosts.length !== currentUser.profile?.posts_count) {
      console.log(`🔄 SYNCING: AuthContext posts_count ${currentUser.profile?.posts_count} → ${userPosts.length}`);
      updateUser({
        ...currentUser,
        profile: {
          ...currentUser.profile,
          posts_count: userPosts.length
        }
      });
    }
  }, [userPosts.length, isOwnProfile, currentUser, updateUser]);

  // PRESERVED: Handle Follow Change
  const handleFollowChange = ({ userId, isFollowing, followerCount }) => {
    // Update profile data with new follower count
    if (profile) {
      refreshProfile();
    }
    console.log(`User ${userId} ${isFollowing ? 'followed' : 'unfollowed'}, new count: ${followerCount}`);
  };

  // PRESERVED: Handle post deletion - SURGICAL ADDITION
  const handlePostDeleted = useCallback((deletedPostId) => {
    // Remove post from local array (immediate UI update)
    setUserPosts(prevPosts => {
      const newPosts = prevPosts.filter(post => post.id !== deletedPostId);
      
      // ✅ SURGICAL FIX: Update AuthContext immediately with real count
      if (isOwnProfile && currentUser) {
        console.log(`🗑️ POST DELETED: Updating sidebar count to ${newPosts.length}`);
        updateUser({
          ...currentUser,
          profile: {
            ...currentUser.profile,
            posts_count: newPosts.length  // Use actual array length
          }
        });
      }
      
      return newPosts;
    });
    
    // Refresh profile to update backend (background sync)
    refreshProfile();
  }, [refreshProfile, isOwnProfile, currentUser, updateUser]);

  // 🆕 SURGICAL FIX: Handle opening comments modal
  const handleOpenCommentsModal = useCallback((post) => {
    setSelectedPost(post);
    setShowCommentsModal(true);
  }, []);

  // PRESERVED: Handle Message - Create/Find Chat and Navigate to Chat ID
  const handleMessage = async () => {
    if (!profile?.id || isCreatingChat) return;
    
    console.log('💬 Message button clicked!');
    console.log('Target user ID:', profile.id);
    console.log('Current user ID:', currentUser?.id);
    
    setIsCreatingChat(true);
    
    try {
      // Create a direct message chat with the target user
      // participantIds should contain the target user ID (current user is added automatically)
      const newChat = await createChat([profile.id], false, null);
      
      console.log('✅ Chat created/found:', newChat);
      console.log('🔍 Chat ID:', newChat.id);
      console.log('🔍 Chat keys:', Object.keys(newChat));
      console.log('🔍 Full chat object:', JSON.stringify(newChat, null, 2));
      
      // Navigate to the chat using the Chat ID (UUID)
      navigate(`/messages/${newChat.id}`);
      
    } catch (error) {
      console.error('❌ Error creating/finding chat:', error);
      
      // Show user-friendly error message
      alert('Failed to start conversation. Please try again.');
      
    } finally {
      setIsCreatingChat(false);
    }
  };

  // PRESERVED: Handle Edit Profile
  const handleEditProfile = () => {
    setShowEditModal(true);
  };

  // PRESERVED: Handle profile update success
  const handleProfileUpdated = (updatedUser) => {
    refreshProfile();
    setShowEditModal(false);
  };

  // PRESERVED: Loading state
  if (profileLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 dark:from-slate-900 dark:via-blue-900 dark:to-slate-900">
        <ResponsiveContainer className="py-8">
          <div className="flex justify-center items-center h-96">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
          </div>
        </ResponsiveContainer>
      </div>
    );
  }

  // PRESERVED: Error state
  if (profileError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 dark:from-slate-900 dark:via-blue-900 dark:to-slate-900">
        <ResponsiveContainer className="py-8">
          <div className="flex flex-col justify-center items-center h-96">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Profile Not Found
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {profileError}
            </p>
            <Button onClick={() => navigate(-1)} className="bg-blue-600 hover:bg-blue-700 text-white">
              Go Back
            </Button>
          </div>
        </ResponsiveContainer>
      </div>
    );
  }

  // PRESERVED: No profile data
  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 dark:from-slate-900 dark:via-blue-900 dark:to-slate-900">
        <ResponsiveContainer className="py-8">
          <div className="flex justify-center items-center h-96">
            <p className="text-gray-600 dark:text-gray-400">No profile data available</p>
          </div>
        </ResponsiveContainer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 dark:from-slate-900 dark:via-blue-900 dark:to-slate-900">
      
      <ResponsiveContainer className="py-8">
        {/* PRESERVED: Profile Header Card */}
        <div className="bg-white/60 dark:bg-black/40 backdrop-blur-md border border-gray-200 dark:border-white/20 rounded-2xl mb-6 shadow-xl">
          <div className="p-8">
            <div className="flex flex-col md:flex-row items-start gap-6">
              {/* PRESERVED: Profile Picture */}
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-gradient-to-r from-blue-500 via-teal-500 to-emerald-500 p-1">
                  <div className="w-full h-full rounded-full bg-white dark:bg-gray-900 flex items-center justify-center overflow-hidden">
                    {profile.profile?.avatar ? (
                      <img 
                        src={getFullAvatarUrl(profile.profile.avatar)} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
                        {profile.full_name?.charAt(0) || profile.username?.charAt(0) || 'U'}
                      </span>
                    )}
                  </div>
                </div>
                {isOwnProfile && (
                  <Button
                    size="icon"
                    onClick={handleEditProfile}
                    className="absolute -bottom-2 -right-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
                  >
                    <Edit3 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {/* PRESERVED: Profile Info */}
              <div className="flex-1 space-y-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        {profile.full_name || profile.username}
                      </h1>
                      {profile.verified && (
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                      )}
                    </div>
                    <p className="text-blue-600 dark:text-blue-300 text-lg mb-2">
                      @{profile.username}
                    </p>
                    <div className="inline-flex px-3 py-1 bg-blue-100 dark:bg-blue-600/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-500/30 rounded-full text-sm font-medium">
                      {profile.profile?.is_private ? "Private Account" : "Public Account"}
                    </div>
                  </div>
                </div>

                {/* PRESERVED: Bio */}
                {profile.profile?.bio && (
                  <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed max-w-2xl">
                    {profile.profile.bio}
                  </p>
                )}

                {/* PRESERVED: Details */}
                <div className="flex flex-wrap gap-6 text-gray-600 dark:text-gray-400">
                  {profile.profile?.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{profile.profile.location}</span>
                    </div>
                  )}
                  {profile.date_joined && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>Joined {new Date(profile.date_joined).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                    </div>
                  )}
                  {profile.profile?.website && (
                    <div className="flex items-center gap-2">
                      <LinkIcon className="h-4 w-4" />
                      <a 
                        href={profile.profile.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        {profile.profile.website.replace(/^https?:\/\//, '')}
                      </a>
                    </div>
                  )}
                </div>

                {/* PRESERVED: Stats with Follow & Message Buttons */}
                <div className="flex flex-col gap-4 pt-4">
                  {/* PRESERVED: Stats Row */}
                  <div className="flex gap-8">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {userPosts.length}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Posts</div>
                    </div>
                    <div className="text-center cursor-pointer hover:opacity-80 transition-opacity">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {profile.profile?.followers_count || 0}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Followers</div>
                    </div>
                    <div className="text-center cursor-pointer hover:opacity-80 transition-opacity">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {profile.profile?.following_count || 0}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Following</div>
                    </div>
                  </div>

                  {/* PRESERVED: Action Buttons */}
                  <div className="flex gap-3">
                    {isOwnProfile ? (
                      /* PRESERVED: YOUR OWN PROFILE - Show Edit Profile */
                      <Button 
                        onClick={handleEditProfile}
                        className="flex-1 py-3 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white transition-all duration-200 font-semibold"
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        Edit Profile
                      </Button>
                    ) : (
                      /* PRESERVED: OTHER USER'S PROFILE - Show Follow & Message */
                      <>
                        {/* PRESERVED: Enhanced Follow Button */}
                        <FollowButton
                          userId={profile.id}
                          initialFollowState={profile.is_following ? FOLLOW_STATES.FOLLOWING : FOLLOW_STATES.NOT_FOLLOWING}
                          initialFollowerCount={profile.profile?.followers_count || 0}
                          userName={profile.full_name || profile.username}
                          isPrivate={profile.profile?.is_private || false}
                          onFollowChange={handleFollowChange}
                          className="flex-1 py-3"
                          size="default"
                        />

                        {/* PRESERVED: Message Button with Chat Creation */}
                        <Button 
                          onClick={handleMessage}
                          disabled={isCreatingChat}
                          variant="outline" 
                          className="flex-1 py-3 border-blue-300 dark:border-blue-400 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-400 dark:hover:border-blue-300 transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isCreatingChat ? (
                            <>
                              <div className="w-4 h-4 mr-2 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                              Starting...
                            </>
                          ) : (
                            <>
                              <MessageCircle className="w-4 h-4 mr-2" />
                              Message
                            </>
                          )}
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* PRESERVED: Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="bg-white/60 dark:bg-black/40 backdrop-blur-md border border-gray-200 dark:border-white/20 rounded-2xl mb-6">
            <TabsList className="grid w-full grid-cols-2 bg-transparent h-auto p-0">
              <TabsTrigger
                value="posts"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-teal-600 data-[state=active]:text-white text-gray-700 dark:text-gray-300 rounded-none py-4 font-medium"
              >
                Posts
              </TabsTrigger>
              <TabsTrigger
                value="media"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-teal-600 data-[state=active]:text-white text-gray-700 dark:text-gray-300 rounded-none py-4 font-medium"
              >
                Media
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="posts" className="space-y-4 mt-6">
            {postsLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : userPosts.length > 0 ? (
              userPosts.map((post) => (
                <PostCard 
                  key={post.id} 
                  post={post} 
                  onPostDeleted={handlePostDeleted}
                  onCommentClick={handleOpenCommentsModal}  // 🆕 SURGICAL FIX: Added comments functionality
                />
              ))
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">
                  {isOwnProfile ? "You haven't posted anything yet." : "No posts yet."}
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="media" className="mt-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div 
                  key={i} 
                  className="aspect-square bg-white/60 dark:bg-black/40 backdrop-blur-md border border-gray-200 dark:border-white/20 rounded-lg overflow-hidden"
                >
                  <div className="w-full h-full bg-gradient-to-br from-blue-200 to-teal-200 dark:from-blue-800 dark:to-teal-800 flex items-center justify-center hover:scale-105 transition-transform cursor-pointer">
                    <span className="text-4xl opacity-50">📷</span>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </ResponsiveContainer>

      {/* 🆕 SURGICAL FIX: Comments Modal */}
      {showCommentsModal && selectedPost && (
        <EnhancedCommentsModal
          isOpen={showCommentsModal}
          onClose={() => {
            setShowCommentsModal(false);
            setSelectedPost(null);
          }}
          postId={selectedPost.id}
          postAuthor={selectedPost.author}
        />
      )}

      {/* PRESERVED: Edit Profile Modal */}
      {showEditModal && (
        <EditProfileModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          user={profile}
          onProfileUpdated={handleProfileUpdated}
        />
      )}
    </div>
  );
}

export default UserProfile;