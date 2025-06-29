// ===== src/components/pages/Profile/UserProfile.jsx - UPDATED =====
import React, { useState } from 'react';
import { Settings, MapPin, Calendar, LinkIcon, Edit3, MoreHorizontal, MessageCircle } from "lucide-react";
import { Button } from '../../ui/Button/Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/Tabs/Tabs';
import PostCard from '../HomeFeed/components/PostCard';
import FollowButton, { FOLLOW_STATES } from '../../ui/FollowButton'; // ✅ Import Enhanced FollowButton
import { ResponsiveContainer } from '../../layout/ResponsiveLayout';

function UserProfile({ isOwnProfile = false, onBack, userId }) {
  const [activeTab, setActiveTab] = useState("posts");
  const [followerCount, setFollowerCount] = useState(1234);

  // DEBUG: Log the isOwnProfile value
  console.log("🔍 UserProfile isOwnProfile:", isOwnProfile);

  // ✅ Mock user data
  const user = {
    id: userId || 'robin-123',
    name: "ROBIN",
    username: "Robinkb",
    bio: "Full-stack developer passionate about creating amazing user experiences. Love working with React, Node.js, and exploring new technologies. Always learning, always building! 🚀",
    location: "Ernakulam kerala",
    website: "yoursite.dev",
    avatar: "",
    verified: true,
    joinDate: "March 2023",
    followers: followerCount,
    following: 567,
    posts: 89,
    media: 42,
    isPrivate: false,
    isFollowing: false // This would come from API
  };

  // ✅ Mock posts data with correct structure for PostCard
  const userPosts = [
    {
      id: 1,
      author: { username: user.username, name: user.name, avatar: user.avatar, verified: user.verified },
      content: "Just launched my new project! Excited to share it with the community 🚀",
      image_url: null,
      total_likes: 124,
      total_comments: 23,
      total_shares: 12,
      time_since_posted: "2h",
      is_liked: false,
      is_active: true,
    },
    {
      id: 2,
      author: { username: user.username, name: user.name, avatar: user.avatar, verified: user.verified },
      content: "Beautiful sunset from my rooftop garden 🌅 Nature never fails to amaze me!",
      image_url: null,
      total_likes: 89,
      total_comments: 15,
      total_shares: 7,
      time_since_posted: "1d",
      is_liked: false,
      is_active: true,
    },
    {
      id: 3,
      author: { username: user.username, name: user.name, avatar: user.avatar, verified: user.verified },
      content: "Working on some exciting new features. Can't wait to show you all! 💻✨",
      image_url: null,
      total_likes: 67,
      total_comments: 18,
      total_shares: 9,
      time_since_posted: "3d",
      is_liked: true,
      is_active: true,
    },
  ];

  // ✅ Handle Follow Change (from FollowButton)
  const handleFollowChange = ({ userId, isFollowing, followerCount: newCount }) => {
    setFollowerCount(newCount);
    console.log(`User ${userId} ${isFollowing ? 'followed' : 'unfollowed'}, new count: ${newCount}`);
  };

  // ✅ Handle Message
  const handleMessage = () => {
    console.log('💬 Message button clicked!');
    // Navigate to messages or open chat
  };

  // ✅ Handle Edit Profile
  const handleEditProfile = () => {
    console.log('⚙️ Edit Profile clicked!');
    // Open edit profile modal
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 dark:from-slate-900 dark:via-blue-900 dark:to-slate-900">
      
      <ResponsiveContainer className="py-8">
        {/* Profile Header Card */}
        <div className="bg-white/60 dark:bg-black/40 backdrop-blur-md border border-gray-200 dark:border-white/20 rounded-2xl mb-6 shadow-xl">
          <div className="p-8">
            <div className="flex flex-col md:flex-row items-start gap-6">
              {/* Profile Picture */}
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-gradient-to-r from-blue-500 via-teal-500 to-emerald-500 p-1">
                  <div className="w-full h-full rounded-full bg-white dark:bg-gray-900 flex items-center justify-center overflow-hidden">
                    {user.avatar ? (
                      <img 
                        src={user.avatar} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
                        {user.name.charAt(0)}
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

              {/* Profile Info */}
              <div className="flex-1 space-y-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        {user.name}
                      </h1>
                      {user.verified && (
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                      )}
                    </div>
                    <p className="text-blue-600 dark:text-blue-300 text-lg mb-2">
                      @{user.username}
                    </p>
                    <div className="inline-flex px-3 py-1 bg-blue-100 dark:bg-blue-600/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-500/30 rounded-full text-sm font-medium">
                      {user.isPrivate ? "Private Account" : "Pro Member"}
                    </div>
                  </div>
                </div>

                {/* Bio */}
                <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed max-w-2xl">
                  {user.bio}
                </p>

                {/* Details */}
                <div className="flex flex-wrap gap-6 text-gray-600 dark:text-gray-400">
                  {user.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{user.location}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Joined {user.joinDate}</span>
                  </div>
                  {user.website && (
                    <div className="flex items-center gap-2">
                      <LinkIcon className="h-4 w-4" />
                      <a href={`https://${user.website}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                        {user.website}
                      </a>
                    </div>
                  )}
                </div>

                {/* Stats with Follow & Message Buttons */}
                <div className="flex flex-col gap-4 pt-4">
                  {/* Stats Row */}
                  <div className="flex gap-8">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">{user.posts}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Posts</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">{followerCount.toLocaleString()}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Followers</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">{user.following}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Following</div>
                    </div>
                  </div>

                  {/* ✅ ENHANCED ACTION BUTTONS */}
                  <div className="flex gap-3">
                    {isOwnProfile ? (
                      /* YOUR OWN PROFILE - Show Edit Profile */
                      <Button 
                        onClick={handleEditProfile}
                        className="flex-1 py-3 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white transition-all duration-200 font-semibold"
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        Edit Profile
                      </Button>
                    ) : (
                      /* OTHER USER'S PROFILE - Show Enhanced Follow & Message */
                      <>
                        {/* ✅ ENHANCED FOLLOW BUTTON */}
                        <FollowButton
                          userId={user.id}
                          initialFollowState={user.isFollowing ? FOLLOW_STATES.FOLLOWING : FOLLOW_STATES.NOT_FOLLOWING}
                          initialFollowerCount={followerCount}
                          userName={user.name}
                          isPrivate={user.isPrivate}
                          onFollowChange={handleFollowChange}
                          className="flex-1 py-3"
                          size="default"
                        />

                        {/* Message Button */}
                        <Button 
                          onClick={handleMessage}
                          variant="outline" 
                          className="flex-1 py-3 border-blue-300 dark:border-blue-400 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-400 dark:hover:border-blue-300 transition-all duration-200 font-semibold"
                        >
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Message
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
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
            {userPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
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
    </div>
  );
}

export default UserProfile;