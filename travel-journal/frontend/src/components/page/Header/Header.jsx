import React, { useState, useEffect } from 'react';
import { Map, Search, BookOpen, Settings, User, LogOut, Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../../context/ThemeContext';
import { useLanguage } from '../../../context/LanguageContext';

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [dropdownTimeout, setDropdownTimeout] = useState(null);
  const { isDarkMode, toggleTheme } = useTheme();
  const { language, t } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    // Kiểm tra token và thông tin user từ localStorage
    const token = localStorage.getItem('token');
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    
    if (token && userInfo) {
      setIsLoggedIn(true);
      setUser({
        name: userInfo.username,
        avatar: userInfo.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userInfo.username}`
      });
    }
  }, []);

  // Cleanup timeout khi component unmount
  useEffect(() => {
    return () => {
      if (dropdownTimeout) {
        clearTimeout(dropdownTimeout);
      }
    };
  }, [dropdownTimeout]);

  const handleMouseEnter = () => {
    if (dropdownTimeout) {
      clearTimeout(dropdownTimeout);
      setDropdownTimeout(null);
    }
    setShowDropdown(true);
  };

  const handleMouseLeave = () => {
    const timeout = setTimeout(() => {
      setShowDropdown(false);
    }, 200); // 200ms delay để animation mượt hơn
    setDropdownTimeout(timeout);
  };

  const toggleLogin = () => {
    if (isLoggedIn) {
      // Xử lý đăng xuất
      localStorage.removeItem('token');
      localStorage.removeItem('userInfo');
      setIsLoggedIn(false);
      setUser(null);
      setShowDropdown(false);
      // Điều hướng về trang đăng nhập sau khi đăng xuất
      navigate('/', { replace: true });
    } else {
      // Điều hướng đến trang đăng nhập
      navigate('/');
    }
  };

  // toggleTheme đã được import từ useTheme hook

  return (
    <header className={`sticky top-0 z-50 transition-colors duration-300 ${
      isDarkMode ? 'bg-gray-900 border-b border-gray-700' : 'bg-white'
    } shadow-lg ${isDarkMode ? 'shadow-gray-900/50' : 'shadow-gray-200/50'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div 
            onClick={() => navigate('/home')}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className={`p-2 rounded-xl shadow-lg transform group-hover:scale-105 transition-transform duration-200 ${
              isDarkMode 
                ? 'bg-gradient-to-br from-amber-400 to-orange-500 shadow-amber-500/25' 
                : 'bg-gradient-to-br from-amber-400 to-orange-500'
            }`}>
              <Map className="w-6 h-6 text-white" />
            </div>
            <span className={`text-xl font-bold bg-gradient-to-r from-indigo-900 to-purple-900 bg-clip-text text-transparent hidden sm:block ${
              isDarkMode ? 'from-indigo-300 to-purple-300 drop-shadow-lg' : ''
            }`}>
              MemoryMap
            </span>
          </div>

          {/* Search Bar - Desktop Version */}
          <div className="flex flex-1 max-w-md mx-4 sm:mx-8">
            <div className={`relative w-full group ${isDarkMode ? 'text-gray-300' : ''}`}>
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-amber-500 transition-colors" />
              <input
                type="text"
                placeholder={t ? t.searchMemories : "Tìm kiếm ký ức..."}
                className={`w-full pl-11 pr-4 py-2.5 rounded-full border-2 transition-all duration-200 focus:outline-none focus:border-amber-500 focus:shadow-lg ${
                  isDarkMode 
                    ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400 hover:border-gray-500 focus:shadow-amber-500/25' 
                    : 'bg-gray-50 border-gray-200 text-gray-900 hover:border-gray-300'
                }`}
              />
            </div>
          </div>

          {/* Desktop Navigation - Always Visible */}
          <nav className="flex items-center gap-1 sm:gap-2">
            <NavButton icon={Map} label={t ? t.myMap : "Bản đồ của tôi"} isDark={isDarkMode} />
            <NavButton icon={BookOpen} label={t ? t.journal : "Nhật ký"} isDark={isDarkMode} />
            
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={`p-2.5 rounded-lg transition-all duration-200 hover:scale-105 ${
                isDarkMode 
                  ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700 hover:shadow-lg hover:shadow-yellow-400/25' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-lg'
              }`}
              title={isDarkMode ? (t ? t.lightMode : "Chế độ sáng") : (t ? t.darkMode : "Chế độ tối")}
            >
              {isDarkMode ? '☀️' : '🌙'}
            </button>

            {/* User Profile Section - Only show when logged in */}
            {isLoggedIn && (
              <div 
                className="relative ml-2"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <button
                  className={`flex items-center gap-2 px-3 py-2 rounded-full transition-colors ${
                    isDarkMode 
                      ? 'hover:bg-gray-800 hover:shadow-lg hover:shadow-gray-800/50' 
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className={`w-9 h-9 rounded-full border-2 shadow-md ${
                      isDarkMode 
                        ? 'border-amber-400 shadow-amber-400/25' 
                        : 'border-amber-400'
                    }`}
                  />
                  <span className={`hidden lg:block font-medium ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>
                    {user.name}
                  </span>
                </button>

                <div 
                  className={`absolute right-0 mt-2 w-48 rounded-xl shadow-2xl py-2 px-1 transition-all duration-300 ease-out transform backdrop-blur-sm ${
                    showDropdown 
                      ? 'opacity-100 translate-y-0 scale-100' 
                      : 'opacity-0 -translate-y-2 scale-95 pointer-events-none'
                  } ${
                    isDarkMode 
                      ? 'bg-gray-800/90 shadow-gray-900/50' 
                      : 'bg-white/90 shadow-gray-200/50'
                  }`}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                >
                    <button 
                      onClick={() => navigate('/profile')}
                      className={`w-full px-4 py-3 text-left flex items-center gap-3 transition-all duration-300 ease-out hover:scale-[1.02] rounded-lg relative group ${
                        isDarkMode 
                          ? 'text-gray-300 hover:text-white' 
                          : 'text-gray-700 hover:text-gray-900'
                      }`}
                      style={{
                        boxShadow: 'none'
                      }}
                    >
                      <div className={`absolute inset-0 rounded-lg transition-all duration-300 ease-out ${
                        isDarkMode 
                          ? 'group-hover:bg-gray-700/30 group-hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]' 
                          : 'group-hover:bg-gray-50/50 group-hover:shadow-[0_0_20px_rgba(0,0,0,0.1)]'
                      }`}></div>
                      <Settings className="w-4 h-4 transition-transform duration-300 hover:rotate-12 relative z-10" />
                      <span className="relative z-10">{t ? t.settings : "Cài đặt"}</span>
                    </button>
                    <button
                      onClick={toggleLogin}
                      className={`w-full px-4 py-3 text-left flex items-center gap-3 transition-all duration-300 ease-out hover:scale-[1.02] rounded-lg relative group ${
                        isDarkMode 
                          ? 'text-red-400 hover:text-red-300' 
                          : 'text-red-600 hover:text-red-700'
                      }`}
                      style={{
                        boxShadow: 'none'
                      }}
                    >
                      <div className={`absolute inset-0 rounded-lg transition-all duration-300 ease-out ${
                        isDarkMode 
                          ? 'group-hover:bg-red-500/20 group-hover:shadow-[0_0_20px_rgba(239,68,68,0.3)]' 
                          : 'group-hover:bg-red-50/50 group-hover:shadow-[0_0_20px_rgba(239,68,68,0.2)]'
                      }`}></div>
                      <LogOut className="w-4 h-4 transition-transform duration-300 hover:rotate-12 relative z-10" />
                      <span className="relative z-10">{t ? t.logout : "Đăng xuất"}</span>
                    </button>
                  </div>
              </div>
            )}
          </nav>

          {/* Mobile Menu Button - Hidden */}
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="hidden p-2 rounded-lg ${isDarkMode ? 'text-white' : 'text-gray-700'}"
          >
            {showMobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu - Hidden */}
        {false && showMobileMenu && (
          <div className={`md:hidden pb-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            {/* Mobile Search */}
            <div className="pt-4 pb-3 px-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder={t ? t.searchMemories : "Tìm kiếm ký ức..."}
                  className={`w-full pl-11 pr-4 py-2.5 rounded-full border-2 transition-all ${
                    isDarkMode 
                      ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' 
                      : 'bg-gray-50 border-gray-200'
                  }`}
                />
              </div>
            </div>

            {/* Mobile Nav Links */}
            <div className="space-y-1 px-2">
              <MobileNavButton icon={Map} label={t ? t.myMap : "Bản đồ của tôi"} isDark={isDarkMode} />
              <MobileNavButton icon={BookOpen} label={t ? t.journal : "Nhật ký"} isDark={isDarkMode} />
              
              <button
                onClick={toggleTheme}
                className={`w-full px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${
                  isDarkMode 
                    ? 'text-gray-300 hover:bg-gray-800' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {isDarkMode ? '☀️' : '🌙'}
                <span>{isDarkMode ? (t ? t.lightMode : 'Chế độ sáng') : (t ? t.darkMode : 'Chế độ tối')}</span>
              </button>

              {isLoggedIn && (
                <>
                  <button
                    onClick={() => navigate('/profile')}
                    className={`w-full px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${
                      isDarkMode 
                        ? 'text-gray-300 hover:bg-gray-800' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Settings className="w-5 h-5" />
                    <span>{t ? t.settings : "Cài đặt"}</span>
                  </button>
                  <button
                    onClick={toggleLogin}
                    className="w-full px-4 py-3 rounded-lg flex items-center gap-3 text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>{t ? t.logout : "Đăng xuất"}</span>
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

function NavButton({ icon: Icon, label, isDark }) {
  return (
    <button className={`px-4 py-2.5 rounded-lg flex items-center gap-2 font-medium transition-all duration-200 hover:scale-105 ${
      isDark 
        ? 'text-gray-200 hover:bg-gray-800 hover:text-white hover:shadow-lg hover:shadow-gray-800/50' 
        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
    }`}>
      <Icon className="w-5 h-5" />
      <span className="hidden lg:inline">{label}</span>
    </button>
  );
}

function MobileNavButton({ icon: Icon, label, isDark }) {
  return (
    <button className={`w-full px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${
      isDark 
        ? 'text-gray-300 hover:bg-gray-800' 
        : 'text-gray-700 hover:bg-gray-100'
    }`}>
      <Icon className="w-5 h-5" />
      <span>{label}</span>
    </button>
  );
}

