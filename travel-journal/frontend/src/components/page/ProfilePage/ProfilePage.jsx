import React, { useState, useEffect } from 'react';
import { User, Settings, MapPin, Image, Globe, Palette, Map, Moon, Sun, Monitor, Camera, Save, LogOut, Lock, RotateCcw, Bell, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '../Header/Header';
import { useLanguage } from '../../../context/LanguageContext';
import { useTheme } from '../../../context/ThemeContext';
import './ProfilePage.css';

export default function ProfilePage() {
  const { language, setLanguage, t } = useLanguage();
  const { theme, isDarkMode, setThemeMode } = useTheme();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('appearance');
  const [isEditing, setIsEditing] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // User profile state
  const [profile, setProfile] = useState({
    name: 'Nguyễn Minh Anh',
    email: 'minhanh@memorymap.vn',
    bio: 'Người đam mê du lịch và ghi lại những khoảnh khắc đẹp trên hành trình khám phá thế giới 🌏✨',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=MinAnh'
  });

  // Get current user ID from localStorage
  const getCurrentUserId = () => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    return userInfo.username || 'guest';
  };

  // Settings state - Load from localStorage or use defaults
  const [settings, setSettings] = useState(() => {
    const userId = getCurrentUserId();
    const savedSettings = localStorage.getItem(`userSettings_${userId}`);
    if (savedSettings) {
      return JSON.parse(savedSettings);
    }
    return {
      font: 'Inter',
      accentColor: '#F5A623',
      mapStyle: 'standard',
      showMarkers: true,
      showPlaceNames: true,
      showEmotions: true,
      markerSize: 24,
      language: 'vi'
    };
  });

  // Update slider thumb color dynamically
  useEffect(() => {
    const style = document.createElement('style');
    style.id = 'slider-thumb-style';
    style.textContent = `
      .marker-size-slider::-webkit-slider-thumb {
        background: ${settings.accentColor} !important;
        --accent-color: ${settings.accentColor};
      }
      .marker-size-slider::-moz-range-thumb {
        background: ${settings.accentColor} !important;
        --accent-color: ${settings.accentColor};
      }
      .marker-size-slider::-webkit-slider-thumb:hover {
        box-shadow: 0 0 25px ${settings.accentColor}60, 0 0 50px ${settings.accentColor}40, 0 0 75px ${settings.accentColor}20 !important;
      }
      .marker-size-slider::-moz-range-thumb:hover {
        box-shadow: 0 0 25px ${settings.accentColor}60, 0 0 50px ${settings.accentColor}40, 0 0 75px ${settings.accentColor}20 !important;
      }
    `;
    
    // Remove existing style if any
    const existingStyle = document.getElementById('slider-thumb-style');
    if (existingStyle) {
      existingStyle.remove();
    }
    
    document.head.appendChild(style);
  }, [settings.accentColor]);

  // Auto-save settings to localStorage whenever settings change
  useEffect(() => {
    const userId = getCurrentUserId();
    localStorage.setItem(`userSettings_${userId}`, JSON.stringify(settings));
  }, [settings]);

  // Reload settings when user changes (login/logout)
  useEffect(() => {
    const userId = getCurrentUserId();
    const savedSettings = localStorage.getItem(`userSettings_${userId}`);
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, [getCurrentUserId()]);

  // Stats
  const stats = [
    { icon: MapPin, label: t ? t.places : 'Địa điểm', value: 127, color: 'text-blue-500' },
    { icon: Image, label: t ? t.photos : 'Ảnh', value: 483, color: 'text-purple-500' },
    { icon: Globe, label: t ? t.countries : 'Quốc gia', value: 12, color: 'text-green-500' },
    { icon: Map, label: 'Tỉnh thành', value: 23, color: 'text-orange-500' }
  ];

  const showNotification = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    setIsSaving(false);
    setIsEditing(false);
    // Hiển thị thông báo bằng ngôn ngữ hiện tại
    const message = language === 'en' ? 'Profile updated successfully!' : 'Đã cập nhật hồ sơ thành công!';
    showNotification(message);
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Lưu settings vào localStorage theo user ID
    const userId = getCurrentUserId();
    localStorage.setItem(`userSettings_${userId}`, JSON.stringify(settings));
    
    setLanguage(settings.language); // Cập nhật ngôn ngữ khi lưu cài đặt
    // Theme đã được cập nhật tự động qua ThemeContext
    setIsSaving(false);
    // Hiển thị thông báo bằng ngôn ngữ đã chọn
    const message = settings.language === 'en' ? 'Settings saved successfully!' : 'Đã lưu cài đặt thành công!';
    showNotification(message);
  };

  const handleResetSettings = () => {
    const defaultSettings = {
      font: 'Inter',
      accentColor: '#F5A623',
      mapStyle: 'standard',
      showMarkers: true,
      showPlaceNames: true,
      showEmotions: true,
      markerSize: 24,
      language: 'vi'
    };
    
    setSettings(defaultSettings);
    // Lưu settings mặc định vào localStorage theo user ID
    const userId = getCurrentUserId();
    localStorage.setItem(`userSettings_${userId}`, JSON.stringify(defaultSettings));
    
    // Hiển thị thông báo bằng ngôn ngữ hiện tại
    const message = language === 'en' ? 'Settings restored to default!' : 'Đã khôi phục cài đặt mặc định!';
    showNotification(message);
  };

  const handleLogout = () => {
    // Xóa token và userInfo khỏi localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('userInfo');
    
    // Hiển thị thông báo
    const message = language === 'en' ? 'Logged out successfully!' : 'Đã đăng xuất thành công!';
    showNotification(message);
    
    // Navigate về trang đăng nhập sau 1 giây
    setTimeout(() => {
      navigate('/', { replace: true });
    }, 1000);
  };

  const tabs = [
    { id: 'appearance', icon: Palette, label: t.appearance },
    { id: 'map', icon: Map, label: t.map },
    { id: 'language', icon: Globe, label: t.language },
    { id: 'account', icon: User, label: t.account }
  ];

  const themeOptions = [
    { id: 'light', icon: Sun, label: t ? t.light : 'Sáng' },
    { id: 'dark', icon: Moon, label: t ? t.dark : 'Tối' }
  ];

  const mapStyles = [
    { id: 'standard', label: 'Standard', preview: 'bg-gradient-to-br from-blue-100 to-green-100' },
    { id: 'satellite', label: 'Satellite', preview: 'bg-gradient-to-br from-blue-900 to-green-900' },
    { id: 'terrain', label: 'Terrain', preview: 'bg-gradient-to-br from-amber-100 to-green-200' },
    { id: 'minimalist', label: 'Minimalist', preview: 'bg-gradient-to-br from-gray-100 to-gray-200' }
  ];

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'dark bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'} transition-colors duration-300`}>
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-24 right-6 z-50 animate-slideIn">
          <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white'} px-6 py-4 rounded-2xl shadow-lg border flex items-center gap-3`}>
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="font-medium">{toastMessage}</span>
          </div>
        </div>
      )}

      <Header />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Profile & Stats */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Card */}
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-md p-6`}>
              <div className="flex flex-col items-center">
                <div className="relative group">
                  <img 
                    src={profile.avatar} 
                    alt="Avatar"
                    className="w-32 h-32 rounded-full border-4"
                    style={{borderColor: settings.accentColor}}
                  />
                  <button className="absolute bottom-0 right-0 p-2 rounded-full text-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{backgroundColor: settings.accentColor}}>
                    <Camera size={18} />
                  </button>
                </div>
                
                {isEditing ? (
                  <div className="w-full mt-4 space-y-3">
                    <input
                      type="text"
                      value={profile.name}
                      onChange={(e) => setProfile({...profile, name: e.target.value})}
                      className={`w-full px-4 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} focus:outline-none focus:ring-2`}
                      style={{'--tw-ring-color': settings.accentColor + '40'}}
                    />
                    <textarea
                      value={profile.bio}
                      onChange={(e) => setProfile({...profile, bio: e.target.value})}
                      rows={3}
                      className={`w-full px-4 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} focus:outline-none focus:ring-2`}
                      style={{'--tw-ring-color': settings.accentColor + '40'}}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveProfile}
                        disabled={isSaving}
                        className="flex-1 px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50"
                        style={{backgroundColor: settings.accentColor}}
                      >
                        {isSaving ? t.saving : t.save}
                      </button>
                      <button
                        onClick={() => setIsEditing(false)}
                        className={`px-4 py-2 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} rounded-lg hover:opacity-80 transition-opacity`}
                      >
                        {t.cancel}
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h2 className="text-2xl font-bold mt-4">{profile.name}</h2>
                    <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} text-sm mt-1`}>{profile.email}</p>
                    <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} text-center mt-3 text-sm leading-relaxed`}>
                      {profile.bio}
                    </p>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="mt-4 px-6 py-2 text-white rounded-lg transition-colors flex items-center gap-2"
                      style={{backgroundColor: settings.accentColor}}
                    >
                      <Camera size={16} />
                      {t.editProfile}
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Stats Cards */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold px-2">{t.statistics}</h3>
              {stats.map((stat, idx) => (
                <div key={idx} className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm p-4 flex items-center justify-between hover:shadow-md transition-shadow`}>
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-100'} shadow-sm`}>
                      <stat.icon className={stat.color} size={24} />
                    </div>
                    <span className="font-medium">{stat.label}</span>
                  </div>
                  <span className="text-2xl font-bold" style={{color: settings.accentColor}}>{stat.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column - Settings */}
          <div className="lg:col-span-2">
            <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-md overflow-hidden`}>
              {/* Tabs */}
              <div className={`flex border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} overflow-x-auto`}>
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'border-b-2'
                        : `${theme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-800'}`
                    }`}
                    style={activeTab === tab.id ? {borderColor: settings.accentColor, color: settings.accentColor} : {}}
                  >
                    <tab.icon size={18} />
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {/* Appearance Tab */}
                {activeTab === 'appearance' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">{t.displayMode}</h3>
                      <div className="grid grid-cols-2 gap-4">
                        {themeOptions.map((option) => (
                          <button
                            key={option.id}
                            onClick={() => setThemeMode(option.id)}
                            className={`flex-1 p-6 rounded-xl border-2 transition-all flex flex-col items-center justify-center ${
                              theme === option.id
                                ? 'dark:bg-gray-700'
                                : `border-gray-200 dark:border-gray-700 ${theme === 'dark' ? 'hover:border-gray-600' : 'hover:border-gray-300'}`
                            }`}
                            style={theme === option.id ? {borderColor: settings.accentColor, backgroundColor: settings.accentColor + '20'} : {}}
                          >
                            <option.icon className={`mb-3 ${
                              theme === option.id 
                                ? '' 
                                : 'text-gray-600 dark:text-gray-400'
                            }`} 
                            style={theme === option.id ? {color: settings.accentColor} : {}}
                            size={28} />
                            <div className={`text-base font-medium ${
                              theme === option.id 
                                ? '' 
                                : 'text-gray-700 dark:text-gray-300'
                            }`}
                            style={theme === option.id ? {color: settings.accentColor} : {}}>{option.label}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-4">{t.accentColor}</h3>
                      <div className="flex justify-between items-center">
                        {['#F5A623', '#E74C3C', '#3498DB', '#2ECC71', '#9B59B6', '#1ABC9C'].map((color) => (
                          <button
                            key={color}
                            onClick={() => setSettings({...settings, accentColor: color})}
                            className={`w-12 h-12 rounded-full transition-all duration-300 hover:scale-110 ${
                              settings.accentColor === color 
                                ? 'scale-110 shadow-2xl' 
                                : 'hover:scale-105'
                            }`}
                            style={{
                              backgroundColor: color,
                              boxShadow: settings.accentColor === color 
                                ? `0 0 25px ${color}60, 0 0 50px ${color}40, 0 0 75px ${color}20` 
                                : 'none'
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Map Tab */}
                {activeTab === 'map' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">{t.mapStyle}</h3>
                      <div className="grid grid-cols-2 gap-4">
                        {mapStyles.map((style) => (
                          <button
                            key={style.id}
                            onClick={() => setSettings({...settings, mapStyle: style.id})}
                            className={`p-4 rounded-xl border-2 transition-all ${
                              settings.mapStyle === style.id
                                ? ''
                                : `border-gray-200 dark:border-gray-700 ${theme === 'dark' ? 'hover:border-gray-600' : 'hover:border-gray-300'}`
                            }`}
                            style={settings.mapStyle === style.id ? {borderColor: settings.accentColor} : {}}
                          >
                            <div className={`h-24 rounded-lg mb-3 ${style.preview}`}></div>
                            <div className="text-sm font-medium">{style.label}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">{t.showOnMap}</h3>
                      {[
                        { key: 'showMarkers', label: t.photoMarkers, icon: MapPin },
                        { key: 'showPlaceNames', label: t.placeNames, icon: Globe },
                        { key: 'showEmotions', label: t.emotions, icon: '😊' }
                      ].map((toggle) => (
                        <div key={toggle.key} className={`flex items-center justify-between p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                          <div className="flex items-center gap-3">
                            {typeof toggle.icon === 'string' ? (
                              <span className="text-2xl">{toggle.icon}</span>
                            ) : (
                              <toggle.icon size={20} />
                            )}
                            <span className="font-medium">{toggle.label}</span>
                          </div>
                          <button
                            onClick={() => setSettings({...settings, [toggle.key]: !settings[toggle.key]})}
                            className={`w-12 h-6 rounded-full transition-colors ${
                              settings[toggle.key] ? '' : 'bg-gray-300 dark:bg-gray-600'
                            }`}
                            style={settings[toggle.key] ? {backgroundColor: settings.accentColor} : {}}
                          >
                            <div className={`w-5 h-5 bg-white rounded-full shadow-md transition-transform ${
                              settings[toggle.key] ? 'translate-x-6' : 'translate-x-0.5'
                            }`}></div>
                          </button>
                        </div>
                      ))}
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-4">{t.markerSize}</h3>
                      <input
                        type="range"
                        min="16"
                        max="48"
                        value={settings.markerSize}
                        onChange={(e) => setSettings({...settings, markerSize: parseInt(e.target.value)})}
                        className="w-full marker-size-slider"
                        style={{
                          background: `linear-gradient(to right, ${settings.accentColor}60 0%, ${settings.accentColor}60 ${(settings.markerSize - 16) / (48 - 16) * 100}%, ${settings.accentColor}15 ${(settings.markerSize - 16) / (48 - 16) * 100}%, ${settings.accentColor}15 100%)`
                        }}
                      />
                      <div className="flex justify-between text-sm text-gray-500 mt-2">
                        <span>{t.small}</span>
                        <span>{settings.markerSize}px</span>
                        <span>{t.large}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Language Tab */}
                {activeTab === 'language' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold mb-4">{t.language}</h3>
                    {[
                      { code: 'vi', shortLabel: 'VI', label: 'Tiếng Việt' },
                      { code: 'en', shortLabel: 'EN', label: 'English' }
                    ].map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => setSettings({...settings, language: lang.code})}
                        className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-4 ${
                          settings.language === lang.code
                            ? 'dark:bg-gray-700'
                            : ''
                        }`}
                        style={{
                          borderColor: settings.accentColor,
                          backgroundColor: settings.language === lang.code 
                            ? settings.accentColor + '40' 
                            : settings.accentColor + '05'
                        }}
                      >
                        <span className={`text-lg font-bold w-10 h-10 flex items-center justify-center rounded-lg ${
                          settings.language === lang.code
                            ? 'text-white'
                            : 'text-white'
                        }`}
                        style={{
                          backgroundColor: settings.language === lang.code 
                            ? settings.accentColor 
                            : settings.accentColor + '30'
                        }}>{lang.shortLabel}</span>
                        <span className={`text-lg font-medium ${
                          settings.language === lang.code 
                            ? '' 
                            : ''
                        }`}
                        style={{color: settings.accentColor}}>{lang.label}</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Account Tab */}
                {activeTab === 'account' && (
                  <div className="space-y-4">
                    <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <div className="text-sm text-gray-500 mb-1">Email</div>
                      <div className="font-medium">{profile.email}</div>
                    </div>

                    <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <div className="text-sm text-gray-500 mb-1">{t.displayName}</div>
                      <div className="font-medium">{profile.name}</div>
                    </div>

                    <button className={`w-full p-4 rounded-xl border-2 ${theme === 'dark' ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50'} transition-colors flex items-center justify-between`}>
                      <div className="flex items-center gap-3">
                        <Lock size={20} />
                        <span className="font-medium">{t.changePassword}</span>
                      </div>
                    </button>

                    <button 
                      onClick={handleLogout}
                      className="w-full p-4 rounded-xl bg-red-500 text-white hover:bg-red-600 transition-colors flex items-center justify-center gap-3 font-medium"
                    >
                      <LogOut size={20} />
                      {t.logout}
                    </button>
                  </div>
                )}

                {/* Save/Reset Buttons */}
                {activeTab !== 'account' && (
                  <div className="flex gap-3 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={handleSaveSettings}
                      disabled={isSaving}
                      className="flex-1 px-6 py-3 text-white rounded-xl transition-colors flex items-center justify-center gap-2 font-medium disabled:opacity-50"
                      style={{backgroundColor: settings.accentColor}}
                    >
                      <Save size={20} />
                      {isSaving ? t.saving : t.saveChanges}
                    </button>
                    <button
                      onClick={handleResetSettings}
                      className={`px-6 py-3 rounded-xl border-2 ${theme === 'dark' ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50'} transition-colors flex items-center gap-2 font-medium`}
                    >
                      <RotateCcw size={20} />
                      {t.restore}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

