import React, { useState, useEffect } from 'react';
import { DEFAULT_SETTINGS, BACKGROUNDS } from './constants';
import { UserSettings, SearchEngine } from './types';
import Clock from './components/Clock';
import SearchBar from './components/SearchBar';
import InfoBar from './components/InfoBar';
import NewsFeed from './components/NewsFeed';
import SettingsModal from './components/SettingsModal';
import { fetchNews } from './services/api';

function App() {
  const [settings, setSettings] = useState<UserSettings>(() => {
    const saved = localStorage.getItem('user_settings');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  
  // Background logic
  const activeBackground = settings.backgroundImageId 
    ? BACKGROUNDS.find(b => b.id === settings.backgroundImageId) 
    : null;

  useEffect(() => {
    localStorage.setItem('user_settings', JSON.stringify(settings));
  }, [settings]);

  // Fetch initial news just to get category list for settings
  useEffect(() => {
    const getCats = async () => {
        // Try cache first for immediate UI
        const cached = localStorage.getItem('news_cache');
        if (cached) {
            setAvailableCategories(Object.keys(JSON.parse(cached)));
        }
        
        const res = await fetchNews();
        if (res?.data) {
            setAvailableCategories(Object.keys(res.data));
        }
    };
    getCats();
  }, []);

  const hasBackground = !!activeBackground;
  
  return (
    <div 
        className={`min-h-screen transition-all duration-500 ${hasBackground ? 'bg-cover bg-center bg-fixed bg-no-repeat' : 'bg-gray-50'}`}
        style={hasBackground ? { backgroundImage: `url(${activeBackground.url})` } : {}}
    >
       {/* Overlay for readability if background exists */}
       {hasBackground && <div className="absolute inset-0 bg-black/30 fixed pointer-events-none" />}

       <div className="relative z-10 flex flex-col min-h-screen">
          {/* Header */}
          <header className="flex justify-end p-4">
              <button 
                onClick={() => setIsSettingsOpen(true)}
                className={`p-2 rounded-full transition-all duration-300 ${hasBackground ? 'bg-white/20 text-white hover:bg-white/30' : 'bg-white text-gray-600 shadow-sm hover:bg-gray-100'}`}
              >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
              </button>
          </header>

          {/* Main Content */}
          <main className="flex-grow flex flex-col items-center pt-8 pb-12 w-full">
              
              {/* 1. Clock at the top */}
              <Clock lightMode={!hasBackground} />
              
              <div className="w-full px-4 mb-12 flex flex-col items-center gap-10">
                  {/* 2. InfoBar in the middle (where clock used to be visually) */}
                  <InfoBar isTransparent={hasBackground} />

                  {/* 3. SearchBar at the bottom of the hero section */}
                  <SearchBar 
                    engine={settings.searchEngine} 
                    onEngineChange={(eng) => setSettings(prev => ({ ...prev, searchEngine: eng }))}
                    isTransparent={hasBackground}
                  />
              </div>

              {/* News Section (Glassmorphic container if background, else clean) */}
              <div className={`w-full ${hasBackground ? 'bg-white/90 backdrop-blur-xl rounded-t-3xl shadow-2xl pt-6' : ''}`}>
                 <NewsFeed hiddenCategories={settings.hiddenCategories} />
              </div>

          </main>
       </div>

       <SettingsModal 
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          settings={settings}
          onUpdateSettings={setSettings}
          availableCategories={availableCategories}
       />
    </div>
  );
}

export default App;