import React, { createContext, useState, useContext, useEffect } from 'react';

// Định nghĩa các bản dịch
const translationData = {
  en: {
    // Header
    appName: 'MemoryMap',
    appDescription: 'Personal Memory Map',
    searchMemories: 'Search memories...',
    myMap: 'My Map',
    journal: 'Journal',
    settings: 'Settings',
    login: 'Login',
    logout: 'Logout',
    lightMode: 'Light mode',
    darkMode: 'Dark mode',
    
    // Profile
    editProfile: 'Edit Profile',
    save: 'Save',
    saving: 'Saving...',
    cancel: 'Cancel',
    profileUpdated: 'Profile updated successfully ✅',
    settingsSaved: 'Settings saved successfully ✅',
    settingsRestored: 'Settings restored to default',

    // Stats
    statistics: 'Journey Statistics',
    places: 'Places',
    photos: 'Photos',
    countries: 'Countries',

    // Settings Tabs
    appearance: 'Appearance',
    map: 'Map',
    language: 'Language',
    account: 'Account',

    // Appearance Settings
    displayMode: 'Display Mode',
    light: 'Light',
    dark: 'Dark',
    accentColor: 'Accent Color',

    // Map Settings
    mapStyle: 'Map Style',
    showOnMap: 'Show on Map',
    photoMarkers: 'Photo Markers',
    placeNames: 'Place Names',
    emotions: 'Emotions (emoji)',
    markerSize: 'Marker Size',
    small: 'Small',
    large: 'Large',

    // Account Settings
    displayName: 'Display Name',
    changePassword: 'Change Password',
    logout: 'Logout',

    // Actions
    saveChanges: 'Save Changes',
    restore: 'Restore',
    
    // HomePage
    welcomeTitle: 'Welcome to Travel Journal',
    welcomeSubtitle: 'Record your journey and memorable moments',
    createNewPost: 'Create New Post',
    createNewPostDesc: 'Start recording your trip',
    createNow: 'Create Now',
    viewMap: 'View Map',
    viewMapDesc: 'Explore the places you\'ve been',
    myJournal: 'My Journal',
    myJournalDesc: 'Review created posts',
    viewJournal: 'View Journal',
    recentPosts: 'Recent Posts',
    noPostsYet: 'No posts yet',
    createFirstPost: 'Create your first post!',
  },
  vi: {
    // Header
    appName: 'MemoryMap',
    appDescription: 'Bản đồ ký ức cá nhân',
    searchMemories: 'Tìm kiếm ký ức...',
    myMap: 'Bản đồ của tôi',
    journal: 'Nhật ký',
    settings: 'Cài đặt',
    login: 'Đăng nhập',
    logout: 'Đăng xuất',
    lightMode: 'Chế độ sáng',
    darkMode: 'Chế độ tối',
    
    // Profile
    editProfile: 'Chỉnh sửa hồ sơ',
    save: 'Lưu',
    saving: 'Đang lưu...',
    cancel: 'Hủy',
    profileUpdated: 'Hồ sơ đã được cập nhật ✅',
    settingsSaved: 'Cài đặt đã được lưu ✅',
    settingsRestored: 'Đã khôi phục cài đặt mặc định',

    // Stats
    statistics: 'Thống kê hành trình',
    places: 'Địa điểm',
    photos: 'Ảnh',
    countries: 'Quốc gia',

    // Settings Tabs
    appearance: 'Giao diện',
    map: 'Bản đồ',
    language: 'Ngôn ngữ',
    account: 'Tài khoản',

    // Appearance Settings
    displayMode: 'Chế độ hiển thị',
    light: 'Sáng',
    dark: 'Tối',
    accentColor: 'Màu nhấn',

    // Map Settings
    mapStyle: 'Kiểu bản đồ',
    showOnMap: 'Hiển thị trên bản đồ',
    photoMarkers: 'Marker ảnh',
    placeNames: 'Tên địa điểm',
    emotions: 'Cảm xúc (emoji)',
    markerSize: 'Kích thước marker',
    small: 'Nhỏ',
    large: 'Lớn',

    // Account Settings
    displayName: 'Tên hiển thị',
    changePassword: 'Đổi mật khẩu',
    logout: 'Đăng xuất',

    // Actions
    saveChanges: 'Lưu thay đổi',
    restore: 'Khôi phục',
    
    // HomePage
    welcomeTitle: 'Chào mừng đến với Travel Journal',
    welcomeSubtitle: 'Ghi lại hành trình và khoảnh khắc đáng nhớ của bạn',
    createNewPost: 'Tạo bài viết mới',
    createNewPostDesc: 'Bắt đầu ghi lại chuyến đi của bạn',
    createNow: 'Tạo ngay',
    viewMap: 'Xem bản đồ',
    viewMapDesc: 'Khám phá những nơi bạn đã đến',
    myJournal: 'Nhật ký của tôi',
    myJournalDesc: 'Xem lại những bài viết đã tạo',
    viewJournal: 'Xem nhật ký',
    recentPosts: 'Bài viết gần đây',
    noPostsYet: 'Chưa có bài viết nào',
    createFirstPost: 'Tạo bài viết đầu tiên',
  }
};

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    // Lấy ngôn ngữ từ localStorage hoặc mặc định là 'vi'
    return localStorage.getItem('language') || 'vi';
  });

  const [translations, setTranslations] = useState(translationData[language]);

  useEffect(() => {
    // Cập nhật translations khi language thay đổi
    setTranslations(translationData[language]);
    // Lưu ngôn ngữ vào localStorage
    localStorage.setItem('language', language);
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t: translations }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};