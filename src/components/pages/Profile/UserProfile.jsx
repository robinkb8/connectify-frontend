// src/components/pages/Profile/UserProfile.jsx
import React, { useState } from 'react';
import { Settings, MapPin, Calendar, LinkIcon, Edit3, MoreHorizontal } from "lucide-react";
import { Button } from '../../ui/Button/Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/Tabs/Tabs';
import PostCard from '../HomeFeed/components/PostCard';

function UserProfile({ isOwnProfile = false, onBack }) {
  const [activeTab, setActiveTab] = useState("posts");

  // ✅ Mock user data - replace with real API calls later
  const user = {
    name: "ROBIN",
    username: "Robinkb",
    bio: "Full-stack developer passionate about creating amazing user experiences. Love working with React, Node.js, and exploring new technologies. Always learning, always building! 🚀",
    location: "Ernakulam kerala ",
    website: "yoursite.dev",
    avatar: "",
    verified: true,
    joinDate: "March 2023",
    followers: 1234,
    following: 567,
    posts: 89,
    media: 42,
  };

  // ✅ Mock posts data - replace with real API calls later
  const userPosts = [
    {
      id: 1,
      author: { username: user.username, avatar: user.avatar },
      content: "Just launched my new project! Excited to share it with the community 🚀",
      image_url: null,
      total_likes: 124,
      total_comments: 23,
      total_shares: 12,
      time_since_posted: "2h",
      is_liked: false,
      is_active: true
    },
    {
      id: 2,
      author: { username: user.username, avatar: user.avatar },
      content: "Beautiful sunset from my rooftop garden 🌅 Nature never fails to amaze me!",
      image_url: null,
      total_likes: 89,
      total_comments: 15,
      total_shares: 7,
      time_since_posted: "1d",
      is_liked: false,
      is_active: true
    },
    {
      id: 3,
      author: { username: user.username, avatar: user.avatar },
      content: "Working on some exciting new features. Can't wait to show you all! 💻✨",
      image_url: null,
      total_likes: 67,
      total_comments: 18,
      total_shares: 9,
      time_since_posted: "3d",
      is_liked: true,
      is_active: true
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 dark:from-slate-900 dark:via-blue-900 dark:to-slate-900">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-gray-200 dark:border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          {onBack && (
            <Button 
              variant="ghost" 
              onClick={onBack} 
              className="text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-white/10"
            >
              ← Back
            </Button>
          )}
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Profile</h1>
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-white/10"
          >
            <MoreHorizontal className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Profile Header Card - No Background Photo */}
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
                      Pro Member
                    </div>
                  </div>

                  <div className="flex gap-3">
                    {isOwnProfile ? (
                      <Button 
                        variant="outline" 
                        className="border-gray-300 dark:border-white/20 text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-white/10"
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        Edit Profile
                      </Button>
                    ) : (
                      <>
                        <Button className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white px-6">
                          Follow
                        </Button>
                        <Button 
                          variant="outline" 
                          className="border-gray-300 dark:border-white/20 text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-white/10"
                        >
                          Message
                        </Button>
                      </>
                    )}
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

                {/* Stats */}
                <div className="flex gap-8 pt-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{user.posts}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Posts</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{user.followers.toLocaleString()}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Followers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{user.following}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Following</div>
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
              {Array.from({ length: 6 }).map((i) => (
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
      </div>
    </div>
  );
}

export default UserProfile;