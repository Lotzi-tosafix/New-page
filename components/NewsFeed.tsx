
import React, { useEffect, useState, useRef } from 'react';
import { fetchNews } from '../services/api';
import { NewsItem } from '../types';
import NewsCard from './NewsCard';
import { CACHE_KEYS, getFromCache, saveToCache, shouldUpdateInterval } from '../services/cacheService';

interface NewsFeedProps {
  hiddenCategories: string[];
}

const NewsFeed: React.FC<NewsFeedProps> = ({ hiddenCategories }) => {
  // Initialize from cache immediately
  const [data, setData] = useState<Record<string, NewsItem[]> | null>(() => {
    return getFromCache<Record<string, NewsItem[]>>(CACHE_KEYS.NEWS)?.data || null;
  });
  
  const [activeCategory, setActiveCategory] = useState<string>('הכל');
  const [categories, setCategories] = useState<string[]>([]);
  
  // Loading is only true if we have NO data at all
  const [loading, setLoading] = useState(!data);

  // Scroll logic state
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);

  const updateCategories = (newsData: Record<string, NewsItem[]>) => {
    const allCats = Object.keys(newsData);
    const visible = allCats.filter(c => !hiddenCategories.includes(c));
    const finalCats = visible.length > 0 ? ['הכל', ...visible] : [];
    
    setCategories(finalCats);
    
    if (!finalCats.includes(activeCategory)) {
      setActiveCategory('הכל');
    }
    // Give DOM time to update before checking scroll
    setTimeout(checkScrollAvailability, 100);
  };

  const checkAndUpdateNews = async () => {
    const cached = getFromCache<Record<string, NewsItem[]>>(CACHE_KEYS.NEWS);
    
    // Update if no cache or if 10 minutes (10) have passed
    if (!cached || shouldUpdateInterval(cached.timestamp, 10)) {
      try {
        const result = await fetchNews();
        if (result && result.status === 'ok') {
          saveToCache(CACHE_KEYS.NEWS, result.data);
          setData(result.data);
          updateCategories(result.data);
          setLoading(false);
        }
      } catch (e) {
        console.error("Failed to update news", e);
      }
    } else {
        // We have valid cache, just ensure categories are up to date with settings
        updateCategories(cached.data);
        setLoading(false);
    }
  };

  // --- Scroll Logic for Categories ---
  const checkScrollAvailability = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      
      const maxScroll = scrollWidth - clientWidth;
      const isScrollable = maxScroll > 1;

      if (!isScrollable) {
          setCanScrollLeft(false);
          setCanScrollRight(false);
          return;
      }

      // In RTL with most browsers:
      // Start (Right side) is scrollLeft 0
      // End (Left side) is scrollLeft negative max or positive max (depending on implementation)
      // We use Math.abs to handle both negative/positive implementations
      const currentScroll = Math.abs(scrollLeft);
      
      const isAtStart = currentScroll < 10; 
      const isAtEnd = currentScroll >= maxScroll - 10;

      // "Right" arrow scrolls towards Start (Right)
      setCanScrollRight(!isAtStart); 
      
      // "Left" arrow scrolls towards End (Left)
      setCanScrollLeft(!isAtEnd);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const scrollAmount = 200;
      // In RTL:
      // To scroll visually Left (towards end): subtract (or add negative)
      // To scroll visually Right (towards start): add (or add positive)
      // However, scrollBy logic depends on browser direction.
      // Usually scrollBy({left: -200}) moves Left in RTL.
      
      const scrollValue = direction === 'left' ? -scrollAmount : scrollAmount;
      container.scrollBy({ left: scrollValue, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScrollAvailability);
      window.addEventListener('resize', checkScrollAvailability);
      // Check immediately
      checkScrollAvailability();
      // Check again after a slight delay to ensure layout is computed
      setTimeout(checkScrollAvailability, 200);
    }
    return () => {
      if (container) container.removeEventListener('scroll', checkScrollAvailability);
      window.removeEventListener('resize', checkScrollAvailability);
    };
  }, [categories]);

  useEffect(() => {
    // Initial check
    checkAndUpdateNews();

    // Background check every minute
    const interval = setInterval(checkAndUpdateNews, 60 * 1000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update categories when hidden categories change or data updates
  useEffect(() => {
    if (data) {
        updateCategories(data);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hiddenCategories, data]);

  if (loading) return (
    <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-gray-200 h-64 rounded-xl animate-pulse"></div>
        ))}
    </div>
  );

  if (!data || categories.length === 0) return null;

  // Determine items to display
  let displayItems: NewsItem[] = [];

  if (activeCategory === 'הכל') {
    const visibleCats = Object.keys(data).filter(c => !hiddenCategories.includes(c));
    let allItems: NewsItem[] = [];
    const seenLinks = new Set<string>();

    visibleCats.forEach(cat => {
      data[cat].forEach(item => {
        if (!seenLinks.has(item.link)) {
          allItems.push(item);
          seenLinks.add(item.link);
        }
      });
    });

    displayItems = allItems.sort((a, b) => b.timestamp - a.timestamp);
  } else {
    displayItems = data[activeCategory] || [];
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 pb-16 pt-2 relative">
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
            display: none;
        }
        .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
      `}</style>

      {/* Header Container */}
      <div className="flex flex-col gap-4 mb-12">
        
        {/* Row 2: Categories Carousel */}
        <div className="relative group w-full">
            
            {/* Left Arrow (Visually Left, Logic Deeper/End) */}
            <button
                onClick={() => scroll('left')}
                className={`absolute left-0 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/90 backdrop-blur-sm shadow-lg border border-gray-100 text-gray-700 hover:text-blue-600 transition-all duration-300
                    ${canScrollLeft ? 'opacity-100 translate-x-0 scale-100' : 'opacity-0 -translate-x-4 scale-90 pointer-events-none'}
                `}
                aria-label="גלול שמאלה"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
            </button>

            {/* Right Arrow (Visually Right, Logic Start/Right) */}
            <button
                onClick={() => scroll('right')}
                className={`absolute right-0 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/90 backdrop-blur-sm shadow-lg border border-gray-100 text-gray-700 hover:text-blue-600 transition-all duration-300
                    ${canScrollRight ? 'opacity-100 translate-x-0 scale-100' : 'opacity-0 translate-x-4 scale-90 pointer-events-none'}
                `}
                aria-label="גלול ימינה"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
            </button>

            {/* Scroll Container */}
            <div 
                ref={scrollContainerRef}
                className="flex gap-3 overflow-x-auto scrollbar-hide py-3 px-8 scroll-smooth items-center"
                style={{ scrollBehavior: 'smooth' }}
            >
                {categories.map(cat => (
                <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`whitespace-nowrap px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 flex-shrink-0 select-none border
                    ${activeCategory === cat 
                        ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/30 scale-105' 
                        : 'bg-white/80 backdrop-blur-sm border-white/40 text-gray-700 hover:bg-white hover:border-blue-200 hover:text-blue-600 shadow-sm'
                    }`}
                >
                    {cat}
                </button>
                ))}
            </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {displayItems.map((item, index) => (
          <div key={`${item.link}-${index}`} className="animate-fade-in" style={{ animationDelay: `${Math.min(index * 50, 500)}ms` }}>
            <NewsCard item={item} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default NewsFeed;
