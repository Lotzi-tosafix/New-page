
import React, { useState } from 'react';
import { NewsItem } from '../types';

interface NewsCardProps {
  item: NewsItem;
}

const NewsCard: React.FC<NewsCardProps> = ({ item }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const getRelativeTimeHebrew = (dateStr: string): string => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30);

    if (diffMinutes < 1) return 'ממש עכשיו';
    if (diffMinutes === 1) return 'לפני דקה';
    if (diffMinutes < 60) return `לפני ${diffMinutes} דקות`;

    if (diffHours === 1) return 'לפני שעה';
    if (diffHours === 2) return 'לפני שעתיים';
    if (diffHours < 24) return `לפני ${diffHours} שעות`;

    if (diffDays === 1) return 'לפני יום';
    if (diffDays === 2) return 'לפני יומיים';
    if (diffDays < 7) return `לפני ${diffDays} ימים`;

    if (diffWeeks === 1) return 'לפני שבוע';
    if (diffWeeks === 2) return 'לפני שבועיים';
    if (diffWeeks < 4) return `לפני ${diffWeeks} שבועות`;

    if (diffMonths === 1) return 'לפני חודש';
    if (diffMonths === 2) return 'לפני חודשיים';
    
    return `לפני ${diffMonths} חודשים`;
  };

  return (
    <a 
      href={item.link} 
      target="_blank" 
      rel="noopener noreferrer"
      className="group relative block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-transparent hover:border-blue-100 h-full flex flex-col"
    >
      <div className="relative h-48 overflow-hidden bg-gray-100">
        
        {/* Skeleton Loader - Visible when loading or no image yet */}
        {(!imageLoaded && !imageError) && (
           <div className="absolute inset-0 z-10 bg-gray-200 animate-pulse">
              <div className="h-full w-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-[shimmer_1.5s_infinite]"></div>
           </div>
        )}

        {!imageError && item.image ? (
          <img 
            src={item.image} 
            alt={item.title} 
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
            className={`w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-110 group-hover:brightness-105
              ${imageLoaded ? 'opacity-100' : 'opacity-0'}
            `}
          />
        ) : (
          // Fallback: Grey/White background if no image or error
          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
             <span className="text-gray-400 text-3xl opacity-20">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
             </span>
          </div>
        )}
        
        {/* Hover Overlay - Subtle darken + Icon */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />

        {/* External Link Icon - Slides in from top right */}
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 delay-75 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg z-20">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
        </div>
        
        {/* Source Badge */}
        <div 
          className="absolute bottom-2 left-2 p-1 px-2 rounded-lg shadow-sm z-10 transition-transform duration-300 group-hover:scale-105" 
          style={{ backgroundColor: item.source.bg_color }}
        >
          <img 
            src={item.source.logo} 
            alt={item.source.name} 
            className="h-4 w-auto object-contain brightness-200 contrast-125"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
           {!item.source.logo && <span className="text-white text-xs font-bold">{item.source.name}</span>}
        </div>
      </div>
      
      <div className="p-5 flex flex-col flex-grow relative">
        <h3 className="text-lg font-bold text-gray-900 leading-snug mb-3 group-hover:text-blue-600 transition-colors duration-300">
          {item.title}
        </h3>
        <p className="text-sm text-gray-500 line-clamp-3 mb-4 flex-grow leading-relaxed">
          {item.summary}
        </p>
        <div className="text-xs text-gray-400 mt-auto flex justify-between items-center border-t border-gray-50 pt-3">
             <span className="font-medium text-gray-500 flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                {getRelativeTimeHebrew(item.date)}
             </span>
             <span className="bg-gray-50 px-2.5 py-1 rounded-lg text-gray-600 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors duration-300 font-medium">
                {item.source.name}
             </span>
        </div>
      </div>
    </a>
  );
};

export default NewsCard;
