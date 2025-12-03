// Weather Types
export interface WeatherData {
    weather: Array<{ description: string; icon?: string }>;
    main: {
      temp: number;
      humidity: number;
    };
    name: string;
  }
  
  // Currency Types
  export interface CurrencyData {
    result: string;
    base_code: string;
    conversion_rates: Record<string, number>;
  }
  
  // Proverb Types
  export interface ProverbData {
    proverb: string;
  }
  
  // News Types
  export interface NewsSource {
    name: string;
    logo: string;
    bg_color: string;
  }
  
  export interface NewsItem {
    title: string;
    link: string;
    date: string;
    timestamp: number;
    summary: string;
    image: string | null;
    source: NewsSource;
  }
  
  export interface NewsResponse {
    status: string;
    data: Record<string, NewsItem[]>;
  }
  
  // Settings Types
  export enum SearchEngine {
    GOOGLE = 'Google',
    BING = 'Bing',
    DUCKDUCKGO = 'DuckDuckGo',
    YANDEX = 'Yandex',
  }
  
  export interface BackgroundOption {
    id: string;
    name: string;
    url: string; // Using picsum/unsplash or similar
    thumbnail: string;
  }
  
  export interface UserSettings {
    backgroundImageId: string | null; // null means no background (default)
    searchEngine: SearchEngine;
    hiddenCategories: string[]; // List of categories user wants to hide
    isDarkMode: boolean;
  }