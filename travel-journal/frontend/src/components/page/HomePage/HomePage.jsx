import React from 'react';
import Header from '../Header/Header';
import { useLanguage } from '../../../context/LanguageContext';
import { useTheme } from '../../../context/ThemeContext';

export default function HomePage() {
  const { t } = useLanguage();
  const { theme, isDarkMode } = useTheme();
  
  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'dark bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'} transition-colors duration-300`}>
      <Header />
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className={`text-4xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            🌍 {t ? t.welcomeTitle : "Chào mừng đến với Travel Journal"}
          </h1>
          <p className={`text-xl mb-8 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            {t ? t.welcomeSubtitle : "Ghi lại hành trình và khoảnh khắc đáng nhớ của bạn"}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow`}>
            <div className="text-center">
              <div className={`w-16 h-16 ${isDarkMode ? 'bg-blue-900' : 'bg-blue-100'} rounded-full flex items-center justify-center mx-auto mb-4`}>
                <span className="text-2xl">✏️</span>
              </div>
              <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{t ? t.createNewPost : "Tạo bài viết mới"}</h3>
              <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{t ? t.createNewPostDesc : "Bắt đầu ghi lại chuyến đi của bạn"}</p>
              <button className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors">
                {t ? t.createNow : "Tạo ngay"}
              </button>
            </div>
          </div>

          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow`}>
            <div className="text-center">
              <div className={`w-16 h-16 ${isDarkMode ? 'bg-green-900' : 'bg-green-100'} rounded-full flex items-center justify-center mx-auto mb-4`}>
                <span className="text-2xl">🗺️</span>
              </div>
              <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{t ? t.viewMap : "Xem bản đồ"}</h3>
              <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{t ? t.viewMapDesc : "Khám phá những nơi bạn đã đến"}</p>
              <button className="w-full bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors">
                {t ? t.viewMap : "Xem bản đồ"}
              </button>
            </div>
          </div>

          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow`}>
            <div className="text-center">
              <div className={`w-16 h-16 ${isDarkMode ? 'bg-purple-900' : 'bg-purple-100'} rounded-full flex items-center justify-center mx-auto mb-4`}>
                <span className="text-2xl">📖</span>
              </div>
              <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{t ? t.myJournal : "Nhật ký của tôi"}</h3>
              <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{t ? t.myJournalDesc : "Xem lại những bài viết đã tạo"}</p>
              <button className="w-full bg-purple-500 text-white py-2 px-4 rounded-lg hover:bg-purple-600 transition-colors">
                {t ? t.viewJournal : "Xem nhật ký"}
              </button>
            </div>
          </div>
        </div>

        {/* Recent Entries */}
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6`}>
          <h2 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{t ? t.recentPosts : "Bài viết gần đây"}</h2>
          <div className="text-center py-12">
            <div className={`w-24 h-24 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-full flex items-center justify-center mx-auto mb-4`}>
              <span className="text-3xl">📝</span>
            </div>
            <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{t ? t.noPostsYet : "Chưa có bài viết nào"}</h3>
            <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{t ? t.createFirstPost : "Hãy bắt đầu tạo bài viết đầu tiên của bạn!"}</p>
            <button className="bg-blue-500 text-white py-2 px-6 rounded-lg hover:bg-blue-600 transition-colors">
              {t ? t.createFirstPost : "Tạo bài viết đầu tiên"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
