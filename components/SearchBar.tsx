import React, { useState } from 'react';
import { SearchEngine } from '../types';
import { SEARCH_ENGINES } from '../constants';

interface SearchBarProps {
  engine: SearchEngine;
  onEngineChange: (engine: SearchEngine) => void;
  isTransparent: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({ engine, onEngineChange, isTransparent }) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    const searchUrl = SEARCH_ENGINES[engine].url + encodeURIComponent(query);
    window.location.href = searchUrl;
  };

  const containerClasses = isTransparent
    ? `bg-white/20 backdrop-blur-md border border-white/30 text-white placeholder-gray-200`
    : `bg-white border border-gray-200 text-gray-800 shadow-sm`;

  const inputClasses = isTransparent
    ? `text-white placeholder-gray-200`
    : `text-gray-800 placeholder-gray-400`;

  return (
    <div className={`w-full max-w-2xl mx-auto transition-all duration-300 transform ${isFocused ? 'scale-105' : 'scale-100'}`}>
      <form onSubmit={handleSubmit} className={`relative flex items-center rounded-full px-4 py-3 ${containerClasses} shadow-lg`}>
        {/* Engine Selector Dropdown */}
        <div className="relative group shrink-0 ml-2">
            <button type="button" className="flex items-center justify-center p-1 rounded-full hover:bg-black/10 transition">
                 <img 
                    src={SEARCH_ENGINES[engine].icon} 
                    alt={engine} 
                    className="w-6 h-6 rounded-full" 
                />
            </button>
             {/* Simple Hover Dropdown for engine switching */}
             <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-xl py-2 hidden group-hover:block z-50">
                {Object.values(SearchEngine).map((eng) => (
                    <button
                        key={eng}
                        type="button"
                        onClick={() => onEngineChange(eng)}
                        className={`flex items-center w-full px-4 py-2 text-sm hover:bg-gray-100 text-gray-800 ${engine === eng ? 'bg-blue-50 text-blue-600' : ''}`}
                    >
                        <img src={SEARCH_ENGINES[eng].icon} alt={eng} className="w-4 h-4 ml-3" />
                        {eng}
                    </button>
                ))}
             </div>
        </div>

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="חיפוש באינטרנט..."
          className={`flex-grow bg-transparent border-none outline-none text-lg px-2 ${inputClasses}`}
          autoFocus
        />
        
        <button type="submit" className={`p-2 rounded-full transition ${isTransparent ? 'hover:bg-white/20 text-white' : 'hover:bg-gray-100 text-gray-500'}`}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
      </form>
    </div>
  );
};

export default SearchBar;