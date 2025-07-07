// ===== src/components/pages/Settings/SettingsPage.jsx - ENHANCED WITH REAL DATA =====
import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft,
  User,
  Bell,
  Shield,
  Eye,
  Smartphone,
  Download,
  Trash2,
  LogOut,
  ChevronRight,
  Check,
  X,
  Camera,
  Moon,
  Sun,
  Globe,
  Lock,
  Mail,
  Phone,
  AlertTriangle,
  Loader2,
  Upload
} from 'lucide-react';
import { Button } from '../../ui/Button/Button';
import { useTheme } from '../../providers/ThemeProvider';
import { useAuth } from '../../../contexts/AuthContext'; // ✅ ADDED

// ✅ Settings Categories - PRESERVED
const SETTINGS_CATEGORIES = {
  ACCOUNT: 'account',
  PRIVACY: 'privacy',
  NOTIFICATIONS: 'notifications',
  APPEARANCE: 'appearance',
  DATA: 'data',
  SUPPORT: 'support'
};

// ✅ Settings Section Component - PRESERVED
const SettingsSection = ({ title, children, icon: Icon }) => (
  <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
    <div className="p-6 border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center space-x-3">
        {Icon && <Icon className="w-5 -5 text-gray-600 dark:text-gray-400" />}
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
      </div>
    </div>
    <div className="p-6 space-y-4">
      {children}
    </div>
  </div>
);

// ✅ Settings Item Component - PRESERVED
const SettingsItem = ({ 
  icon: Icon, 
  title, 
  description, 
  action, 
  rightElement,
  onClick,
  danger = false 
}) => (
  <div 
    className={`flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
      onClick ? 'cursor-pointer' : ''
    }`}
    onClick={onClick}
  >
    <div className="flex items-center space-x-3">
      {Icon && (
        <Icon className={`w-5 h-5 ${danger ? 'text-red-500' : 'text-gray-600 dark:text-gray-400'}`} />
      )}
      <div>
        <h3 className={`font-medium ${danger ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
          {title}
        </h3>
        {description && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {description}
          </p>
        )}
      </div>
    </div>
    
    <div className="flex items-center space-x-2">
      {rightElement}
      {onClick && (
        <ChevronRight className="w-4 h-4 text-gray-400" />
      )}
    </div>
  </div>
);

// ✅ Toggle Switch Component - PRESERVED
const ToggleSwitch = ({ enabled, onChange, disabled = false }) => (
  <button
    onClick={() => !disabled && onChange(!enabled)}
    disabled={disabled}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
      enabled ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
    } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
  >
    <span
      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
        enabled ? 'translate-x-6' : 'translate-x-1'
      }`}
    />
  </button>
);

// ✅ ENHANCED - Main Settings Page Component with Real Data Integration
function SettingsPage({ onBack, onNavigate }) {
  const { theme, toggleTheme } = useTheme();
  const { user, updateProfile, uploadAvatar } = useAuth(); // ✅ REAL USER DATA
  
  const [activeCategory, setActiveCategory] = useState(SETTINGS_CATEGORIES.ACCOUNT);
  
  // ✅ ENHANCED - Use real user data instead of mock data
  const [userData, setUserData] = useState({
    name: '',
    username: '',
    email: '',
    phone: '',
    bio: '',
    avatar: null,
    joinDate: ''
  });
  
  // ✅ NEW - Loading and error states for profile updates
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState(null);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  
  // ✅ PRESERVED - Notification states
  const [notifications, setNotifications] = useState({
    likes: true,
    comments: true,
    follows: true,
    messages: true,
    mentions: true,
    marketing: false,
    push: true,
    email: true,
    sms: false
  });
  
  // ✅ PRESERVED - Privacy states  
  const [privacy, setPrivacy] = useState({
    profilePublic: true,
    showEmail: false,
    showPhone: false,
    allowMessages: true,
    allowTags: true,
    activityStatus: true
  });

  // ✅ NEW - Load real user data when component mounts
  useEffect(() => {
    if (user) {
      setUserData({
        name: user.full_name || '',
        username: user.username || '',
        email: user.email || '',
        phone: user.phone || '',
        bio: user.profile?.bio || '',
        avatar: user.profile?.avatar || null,
        joinDate: user.date_joined ? new Date(user.date_joined).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long' 
        }) : 'Unknown'
      });
    }
  }, [user]);

  // ✅ NEW - Handle profile updates with real API calls
  const handleSaveProfile = async () => {
    setIsUpdating(true);
    setUpdateError(null);
    setUpdateSuccess(false);

    try {
      const profileData = {
        full_name: userData.name,
        username: userData.username,
        bio: userData.bio
      };

      const response = await updateProfile(profileData);
      
      if (response.success) {
        setUpdateSuccess(true);
        setTimeout(() => setUpdateSuccess(false), 3000); // Hide success message after 3 seconds
      } else {
        setUpdateError(response.message || 'Failed to update profile');
      }
    } catch (error) {
      setUpdateError('Failed to update profile. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  // ✅ NEW - Handle avatar upload
  const handleAvatarUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setUpdateError('Please select a valid image file');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setUpdateError('Image size must be less than 5MB');
      return;
    }

    setAvatarUploading(true);
    setUpdateError(null);

    try {
      const response = await uploadAvatar(file);
      
      if (response.success) {
        setUserData(prev => ({
          ...prev,
          avatar: response.avatar_url
        }));
        setUpdateSuccess(true);
        setTimeout(() => setUpdateSuccess(false), 3000);
      } else {
        setUpdateError(response.message || 'Failed to upload avatar');
      }
    } catch (error) {
      setUpdateError('Failed to upload avatar. Please try again.');
    } finally {
      setAvatarUploading(false);
    }
  };

  // ✅ PRESERVED - Handle Settings Updates
  const handleNotificationToggle = (key) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handlePrivacyToggle = (key) => {
    setPrivacy(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out?')) {
      console.log('Logging out...');
      // TODO: Implement logout logic
    }
  };

  const handleDeleteAccount = () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      console.log('Deleting account...');
      // TODO: Implement account deletion
    }
  };

  // ✅ ENHANCED - Render Settings Content with Real Data
  const renderSettingsContent = () => {
    switch (activeCategory) {
      case SETTINGS_CATEGORIES.ACCOUNT:
        return (
          <div className="space-y-6">
            {/* ✅ Success/Error Messages */}
            {updateSuccess && (
              <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="flex items-center">
                  <Check className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
                  <p className="text-green-800 dark:text-green-200">Profile updated successfully!</p>
                </div>
              </div>
            )}
            
            {updateError && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-center">
                  <X className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
                  <p className="text-red-800 dark:text-red-200">{updateError}</p>
                </div>
              </div>
            )}

            <SettingsSection title="Profile Information" icon={User}>
              <div className="space-y-4">
                {/* ✅ ENHANCED Avatar Section with Upload */}
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-teal-500 rounded-full flex items-center justify-center relative overflow-hidden">
                    {userData.avatar ? (
                      <img 
                        src={userData.avatar} 
                        alt={userData.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-white font-bold text-xl">
                        {userData.name?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    )}
                    
                    {/* Upload Button */}
                    <label className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-700 transition-colors">
                      {avatarUploading ? (
                        <Loader2 className="w-3 h-3 text-white animate-spin" />
                      ) : (
                        <Camera className="w-3 h-3 text-white" />
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                        disabled={avatarUploading}
                      />
                    </label>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{userData.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">@{userData.username}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">Joined {userData.joinDate}</p>
                  </div>
                </div>
                
                {/* ✅ ENHANCED Form Fields with Real Data */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={userData.name}
                      onChange={(e) => setUserData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      disabled={isUpdating}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Username
                    </label>
                    <input
                      type="text"
                      value={userData.username}
                      onChange={(e) => setUserData(prev => ({ ...prev, username: e.target.value }))}
                      className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      disabled={isUpdating}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Bio
                  </label>
                  <textarea
                    value={userData.bio}
                    onChange={(e) => setUserData(prev => ({ ...prev, bio: e.target.value }))}
                    rows={3}
                    maxLength={150}
                    className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 resize-none"
                    placeholder="Tell us about yourself..."
                    disabled={isUpdating}
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {userData.bio?.length || 0}/150 characters
                  </p>
                </div>
                
                {/* ✅ ENHANCED Save Button with Loading State */}
                <Button 
                  onClick={handleSaveProfile}
                  disabled={isUpdating}
                  className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </div>
            </SettingsSection>

            {/* ✅ ENHANCED Contact Information with Real Data */}
            <SettingsSection title="Contact Information" icon={Mail}>
              <SettingsItem
                icon={Mail}
                title="Email Address"
                description={userData.email}
                rightElement={<Button variant="ghost" className="text-blue-600">Change</Button>}
              />
              <SettingsItem
                icon={Phone}
                title="Phone Number"
                description={userData.phone}
                rightElement={<Button variant="ghost" className="text-blue-600">Change</Button>}
              />
            </SettingsSection>
          </div>
        );

      case SETTINGS_CATEGORIES.PRIVACY:
        return (
          <div className="space-y-6">
            <SettingsSection title="Profile Privacy" icon={Shield}>
              <SettingsItem
                icon={Globe}
                title="Public Profile"
                description="Allow others to find and view your profile"
                rightElement={
                  <ToggleSwitch 
                    enabled={privacy.profilePublic} 
                    onChange={() => handlePrivacyToggle('profilePublic')}
                  />
                }
              />
              <SettingsItem
                icon={Mail}
                title="Show Email"
                description="Display your email address on your profile"
                rightElement={
                  <ToggleSwitch 
                    enabled={privacy.showEmail} 
                    onChange={() => handlePrivacyToggle('showEmail')}
                  />
                }
              />
              <SettingsItem
                icon={Phone}
                title="Show Phone"
                description="Display your phone number on your profile"
                rightElement={
                  <ToggleSwitch 
                    enabled={privacy.showPhone} 
                    onChange={() => handlePrivacyToggle('showPhone')}
                  />
                }
              />
            </SettingsSection>

            <SettingsSection title="Interaction Privacy" icon={Eye}>
              <SettingsItem
                icon={Bell}
                title="Activity Status"
                description="Show when you're active on Connectify"
                rightElement={
                  <ToggleSwitch 
                    enabled={privacy.activityStatus} 
                    onChange={() => handlePrivacyToggle('activityStatus')}
                  />
                }
              />
              <SettingsItem
                icon={User}
                title="Allow Messages"
                description="Let others send you direct messages"
                rightElement={
                  <ToggleSwitch 
                    enabled={privacy.allowMessages} 
                    onChange={() => handlePrivacyToggle('allowMessages')}
                  />
                }
              />
              <SettingsItem
                icon={User}
                title="Allow Tags"
                description="Let others tag you in posts"
                rightElement={
                  <ToggleSwitch 
                    enabled={privacy.allowTags} 
                    onChange={() => handlePrivacyToggle('allowTags')}
                  />
                }
              />
            </SettingsSection>
          </div>
        );

      case SETTINGS_CATEGORIES.NOTIFICATIONS:
        return (
          <div className="space-y-6">
            <SettingsSection title="Push Notifications" icon={Smartphone}>
              <SettingsItem
                icon={Bell}
                title="Push Notifications"
                description="Receive notifications on your device"
                rightElement={
                  <ToggleSwitch 
                    enabled={notifications.push} 
                    onChange={() => handleNotificationToggle('push')}
                  />
                }
              />
            </SettingsSection>

            <SettingsSection title="Activity Notifications" icon={Bell}>
              <SettingsItem
                icon={Bell}
                title="Likes"
                description="When someone likes your posts"
                rightElement={
                  <ToggleSwitch 
                    enabled={notifications.likes} 
                    onChange={() => handleNotificationToggle('likes')}
                  />
                }
              />
              <SettingsItem
                icon={Bell}
                title="Comments"
                description="When someone comments on your posts"
                rightElement={
                  <ToggleSwitch 
                    enabled={notifications.comments} 
                    onChange={() => handleNotificationToggle('comments')}
                  />
                }
              />
              <SettingsItem
                icon={Bell}
                title="Follows"
                description="When someone follows you"
                rightElement={
                  <ToggleSwitch 
                    enabled={notifications.follows} 
                    onChange={() => handleNotificationToggle('follows')}
                  />
                }
              />
              <SettingsItem
                icon={Bell}
                title="Messages"
                description="When you receive new messages"
                rightElement={
                  <ToggleSwitch 
                    enabled={notifications.messages} 
                    onChange={() => handleNotificationToggle('messages')}
                  />
                }
              />
              <SettingsItem
                icon={Bell}
                title="Mentions"
                description="When someone mentions you"
                rightElement={
                  <ToggleSwitch 
                    enabled={notifications.mentions} 
                    onChange={() => handleNotificationToggle('mentions')}
                  />
                }
              />
            </SettingsSection>

            <SettingsSection title="Communication" icon={Mail}>
              <SettingsItem
                icon={Mail}
                title="Email Notifications"
                description="Receive notifications via email"
                rightElement={
                  <ToggleSwitch 
                    enabled={notifications.email} 
                    onChange={() => handleNotificationToggle('email')}
                  />
                }
              />
              <SettingsItem
                icon={Phone}
                title="SMS Notifications"
                description="Receive notifications via SMS"
                rightElement={
                  <ToggleSwitch 
                    enabled={notifications.sms} 
                    onChange={() => handleNotificationToggle('sms')}
                  />
                }
              />
              <SettingsItem
                icon={Mail}
                title="Marketing Emails"
                description="Receive updates about new features"
                rightElement={
                  <ToggleSwitch 
                    enabled={notifications.marketing} 
                    onChange={() => handleNotificationToggle('marketing')}
                  />
                }
              />
            </SettingsSection>
          </div>
        );

      case SETTINGS_CATEGORIES.APPEARANCE:
        return (
          <div className="space-y-6">
            <SettingsSection title="Theme" icon={theme === 'dark' ? Moon : Sun}>
              <SettingsItem
                icon={theme === 'dark' ? Moon : Sun}
                title="Dark Mode"
                description="Switch between light and dark themes"
                rightElement={
                  <ToggleSwitch 
                    enabled={theme === 'dark'} 
                    onChange={toggleTheme}
                  />
                }
              />
            </SettingsSection>
          </div>
        );

      case SETTINGS_CATEGORIES.DATA:
        return (
          <div className="space-y-6">
            <SettingsSection title="Data Management" icon={Download}>
              <SettingsItem
                icon={Download}
                title="Download Your Data"
                description="Get a copy of all your data on Connectify"
                rightElement={<Button variant="ghost" className="text-blue-600">Download</Button>}
                onClick={() => console.log('Download data')}
              />
            </SettingsSection>

            <SettingsSection title="Danger Zone" icon={AlertTriangle}>
              <SettingsItem
                icon={Trash2}
                title="Delete Account"
                description="Permanently delete your account and all data"
                rightElement={<Button variant="ghost" className="text-red-600">Delete</Button>}
                onClick={handleDeleteAccount}
                danger
              />
            </SettingsSection>
          </div>
        );

      case SETTINGS_CATEGORIES.SUPPORT:
        return (
          <div className="space-y-6">
            <SettingsSection title="Help & Support" icon={Bell}>
              <SettingsItem
                title="Help Center"
                description="Find answers to common questions"
                onClick={() => console.log('Open help center')}
              />
              <SettingsItem
                title="Contact Support"
                description="Get help from our support team"
                onClick={() => console.log('Contact support')}
              />
              <SettingsItem
                title="Report a Problem"
                description="Let us know about bugs or issues"
                onClick={() => console.log('Report problem')}
              />
              <SettingsItem
                title="Privacy Policy"
                description="Read our privacy policy"
                onClick={() => console.log('Open privacy policy')}
              />
              <SettingsItem
                title="Terms of Service"
                description="Read our terms of service"
                onClick={() => console.log('Open terms')}
              />
            </SettingsSection>

            <SettingsSection title="Account Actions" icon={LogOut}>
              <SettingsItem
                icon={LogOut}
                title="Log Out"
                description="Sign out of your account"
                onClick={handleLogout}
                rightElement={<Button variant="ghost" className="text-red-600">Log Out</Button>}
                danger
              />
            </SettingsSection>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 dark:from-slate-900 dark:via-blue-900 dark:to-slate-900">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-gray-200 dark:border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {onBack && (
              <Button 
                variant="ghost" 
                onClick={onBack} 
                className="text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-white/10"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            )}
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Settings</h1>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Settings Navigation */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <nav className="p-2">
                {[
                  { id: SETTINGS_CATEGORIES.ACCOUNT, label: 'Account', icon: User },
                  { id: SETTINGS_CATEGORIES.PRIVACY, label: 'Privacy', icon: Shield },
                  { id: SETTINGS_CATEGORIES.NOTIFICATIONS, label: 'Notifications', icon: Bell },
                  { id: SETTINGS_CATEGORIES.APPEARANCE, label: 'Appearance', icon: theme === 'dark' ? Moon : Sun },
                  { id: SETTINGS_CATEGORIES.DATA, label: 'Data & Privacy', icon: Download },
                  { id: SETTINGS_CATEGORIES.SUPPORT, label: 'Support', icon: Bell }
                ].map((category) => {
                  const Icon = category.icon;
                  return (
                    <button
                      key={category.id}
                      onClick={() => setActiveCategory(category.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                        activeCategory === category.id
                          ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{category.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Settings Content */}
          <div className="flex-1">
            {renderSettingsContent()}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;