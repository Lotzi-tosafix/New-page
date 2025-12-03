import React, { useEffect, useState } from 'react';
import { fetchNews } from '../services/api';
import { NewsItem } from '../types';
import NewsCard from './NewsCard';

interface NewsFeedProps {
  hiddenCategories: string[];
}

const NewsFeed: React.FC<NewsFeedProps> = ({ hiddenCategories }) => {
  const [data, setData] = useState<Record<string, NewsItem[]> | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('הכל');
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadNews = async () => {
      // 1. Check Cache
      const cached = localStorage.getItem('news_cache');
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          setData(parsed);
          updateCategories(parsed);
          setLoading(false);
        } catch (e) {
          console.error("Cache parse error", e);
        }
      }

      // 2. Hydrate from Server
      const result = await fetchNews();
      if (result && result.status === 'ok') {
        localStorage.setItem('news_cache', JSON.stringify(result.data));
        setData(result.data);
        updateCategories(result.data);
        setLoading(false);
      }
    };

    loadNews();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateCategories = (newsData: Record<string, NewsItem[]>) => {
    const allCats = Object.keys(newsData);
    // Filter out hidden categories
    const visible = allCats.filter(c => !hiddenCategories.includes(c));
    
    // Add 'הכל' at the beginning if there are any categories
    const finalCats = visible.length > 0 ? ['הכל', ...visible] : [];
    
    setCategories(finalCats);
    
    // Ensure active category is valid, default to 'הכל' if not
    if (!finalCats.includes(activeCategory)) {
      setActiveCategory('הכל');
    }
  };

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
    // Aggregate items from all visible categories
    const visibleCats = Object.keys(data).filter(c => !hiddenCategories.includes(c));
    let allItems: NewsItem[] = [];
    
    // Use a Set to avoid duplicates if an item appears in multiple categories (unlikely but safe)
    const seenLinks = new Set<string>();

    visibleCats.forEach(cat => {
      data[cat].forEach(item => {
        if (!seenLinks.has(item.link)) {
          allItems.push(item);
          seenLinks.add(item.link);
        }
      });
    });

    // Sort by timestamp descending (newest first)
    displayItems = allItems.sort((a, b) => b.timestamp - a.timestamp);
  } else {
    displayItems = data[activeCategory] || [];
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 pb-16 pt-8">
      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 mb-8 justify-center overflow-x-auto pb-2 scrollbar-hide">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap
              ${activeCategory === cat 
                ? 'bg-blue-600 text-white shadow-lg scale-105' 
                : 'bg-white/80 text-gray-600 hover:bg-white hover:text-blue-600 shadow-sm'
              }`}
          >
            {cat}
          </button>
        ))}
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