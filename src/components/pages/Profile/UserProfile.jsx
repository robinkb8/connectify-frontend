 
// ===== src/components/pages/Profile/UserProfile.jsx =====
import React, { useState } from 'react';
import { Settings, MapPin, Calendar, LinkIcon } from "lucide-react";
import { Button } from '../../ui/Button/Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/Tabs/Tabs';
import PostCard from '../HomeFeed/components/PostCard';

function UserProfile({ isOwnProfile = false }) {
  const [activeTab, setActiveTab] = useState("posts");

  // ✅ Mock user data - replace with real API calls later
  const user = {
    name: "Your Name",
    username: "yourname",
    bio: "Full-stack developer passionate about creating amazing user experiences. Coffee enthusiast ☕️",
    location: "San Francisco, CA",
    website: "yoursite.dev",
    avatar: "",
    coverImage: "",
    verified: true,
    joinDate: "March 2022",
    followers: 1234,
    following: 567,
    posts: 89,
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
      content: "Beautiful sunset from my rooftop garden 🌅",
      image_url: null,
      total_likes: 89,
      total_comments: 15,
      total_shares: 7,
      time_since_posted: "1d",
      is_liked: false,
      is_active: true
    }
  ];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Cover Photo */}
      <div className="h-48 md:h-64 bg-gradient-to-r from-purple-500 to-pink-500 relative">
        {user.coverImage && (
          <img src={user.coverImage} alt="Cover" className="w-full h-full object-cover" />
        )}
        <div className="absolute inset-0 bg-black/20"></div>
      </div>

      {/* Profile Info */}
      <div className="px-4 pb-4">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between -mt-16 md:-mt-20">
          <div className="flex flex-col md:flex-row md:items-end space-y-4 md:space-y-0 md:space-x-4">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 p-1 mx-auto md:mx-0">
              <div className="w-full h-full rounded-full bg-background flex items-center justify-center overflow-hidden">
                {user.avatar ? (
                  <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl md:text-5xl font-bold">{user.name.charAt(0)}</span>
                )}
              </div>
            </div>

            <div className="text-center md:text-left space-y-2 md:pb-4">
              <div className="flex items-center justify-center md:justify-start space-x-2">
                <h1 className="text-2xl md:text-3xl font-bold">{user.name}</h1>
                {user.verified && (
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                )}
              </div>
              <p className="text-muted-foreground">@{user.username}</p>
            </div>
          </div>

          <div className="flex items-center justify-center md:justify-end space-x-2 mt-4 md:mt-0">
            {isOwnProfile ? (
              <Button variant="outline">
                <Settings className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            ) : (
              <>
                <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                  Follow
                </Button>
                <Button variant="outline">Message</Button>
              </>
            )}
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <p className="text-center md:text-left">{user.bio}</p>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-muted-foreground">
            {user.location && (
              <div className="flex items-center space-x-1">
                <MapPin className="w-4 h-4" />
                <span>{user.location}</span>
              </div>
            )}
            {user.website && (
              <div className="flex items-center space-x-1">
                <LinkIcon className="w-4 h-4" />
                <a href={`https://${user.website}`} className="text-purple-500 hover:underline">
                  {user.website}
                </a>
              </div>
            )}
            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4" />
              <span>Joined {user.joinDate}</span>
            </div>
          </div>

          <div className="flex items-center justify-center md:justify-start space-x-6 text-sm">
            <div>
              <span className="font-bold">{user.posts}</span> <span className="text-muted-foreground">Posts</span>
            </div>
            <div>
              <span className="font-bold">{user.followers.toLocaleString()}</span>{" "}
              <span className="text-muted-foreground">Followers</span>
            </div>
            <div>
              <span className="font-bold">{user.following}</span>{" "}
              <span className="text-muted-foreground">Following</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-t border-border mt-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-transparent h-auto p-0">
            <TabsTrigger
              value="posts"
              className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-purple-500 rounded-none py-4"
            >
              Posts
            </TabsTrigger>
            <TabsTrigger
              value="media"
              className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-purple-500 rounded-none py-4"
            >
              Media
            </TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="mt-6 space-y-6">
            {userPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </TabsContent>

          <TabsContent value="media" className="mt-6">
            <div className="grid grid-cols-3 gap-1">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="aspect-square bg-muted rounded-lg overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-purple-200 to-pink-200 dark:from-purple-800 dark:to-pink-800 flex items-center justify-center">
                    <span className="text-2xl opacity-50">📷</span>
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