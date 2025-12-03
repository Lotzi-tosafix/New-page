import React, { useState } from 'react';
import { NewsItem } from '../types';

interface NewsCardProps {
  item: NewsItem;
}

const NewsCard: React.FC<NewsCardProps> = ({ item }) => {
  const [imageError, setImageError] = useState(false);

  const getRelativeTimeHebrew = (dateStr: string): string => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30);

    if (diffHours < 1) return 'לפני מספר דקות';
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
      className="group block bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 h-full flex flex-col"
    >
      <div className="relative h-48 overflow-hidden bg-gray-100">
        {!imageError && item.image ? (
          <img 
            src={item.image} 
            alt={item.title} 
            onError={() => setImageError(true)}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
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
        
        {/* Source Badge */}
        <div 
          className="absolute bottom-2 left-2 p-1 rounded-md shadow-sm z-10" 
          style={{ backgroundColor: item.source.bg_color }}
        >
          <img 
            src={item.source.logo} 
            alt={item.source.name} 
            className="h-4 w-auto object-contain brightness-200 contrast-125"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
           {!item.source.logo && <span className="text-white text-xs font-bold px-1">{item.source.name}</span>}
        </div>
      </div>
      
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-lg font-bold text-gray-900 leading-tight mb-2 group-hover:text-blue-600 transition-colors">
          {item.title}
        </h3>
        <p className="text-sm text-gray-500 line-clamp-3 mb-4 flex-grow">
          {item.summary}
        </p>
        <div className="text-xs text-gray-400 mt-auto flex justify-between items-center">
             <span className="font-medium text-gray-500">{getRelativeTimeHebrew(item.date)}</span>
             <span className="bg-gray-100 px-2 py-1 rounded text-gray-600">{item.source.name}</span>
        </div>
      </div>
    </a>
  );
};

export default NewsCard;