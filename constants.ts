import { BackgroundOption, SearchEngine } from './types';

export const API_BASE_URL = 'https://tosafix-api.onrender.com';
export const NEWS_API_URL = 'https://tfx-news.onrender.com/news';

export const SEARCH_ENGINES: Record<SearchEngine, { url: string; icon: string }> = {
  [SearchEngine.GOOGLE]: {
    url: 'https://www.google.com/search?q=',
    icon: 'https://www.google.com/favicon.ico',
  },
  [SearchEngine.BING]: {
    url: 'https://www.bing.com/search?q=',
    icon: 'https://www.bing.com/favicon.ico',
  },
  [SearchEngine.DUCKDUCKGO]: {
    url: 'https://duckduckgo.com/?q=',
    icon: 'https://duckduckgo.com/favicon.ico',
  },
  [SearchEngine.YANDEX]: {
    url: 'https://yandex.com/search/?text=',
    icon: 'https://yandex.com/favicon.ico',
  },
};

export const BACKGROUNDS: BackgroundOption[] = [
  {
    id: 'nature-mountains',
    name: 'הרים מושלגים',
    url: 'https://picsum.photos/id/1036/1920/1080',
    thumbnail: 'https://picsum.photos/id/1036/200/200',
  },
  {
    id: 'nature-forest',
    name: 'יער ירוק',
    url: 'https://picsum.photos/id/1043/1920/1080',
    thumbnail: 'https://picsum.photos/id/1043/200/200',
  },
  {
    id: 'city-night',
    name: 'עיר בלילה',
    url: 'https://picsum.photos/id/1067/1920/1080',
    thumbnail: 'https://picsum.photos/id/1067/200/200',
  },
  {
    id: 'abstract-tech',
    name: 'טכנולוגיה',
    url: 'https://picsum.photos/id/1/1920/1080',
    thumbnail: 'https://picsum.photos/id/1/200/200',
  },
  {
    id: 'calm-water',
    name: 'מים שקטים',
    url: 'https://picsum.photos/id/10/1920/1080',
    thumbnail: 'https://picsum.photos/id/10/200/200',
  }
];

export const DEFAULT_SETTINGS = {
  backgroundImageId: null,
  searchEngine: SearchEngine.GOOGLE,
  hiddenCategories: [],
  isDarkMode: false,
};

export const WEATHER_TRANSLATIONS: Record<string, string> = {
  'clear sky': 'שמיים בהירים',
  'few clouds': 'מעט עננים',
  'scattered clouds': 'עננות חלקית',
  'broken clouds': 'מעונן חלקית',
  'shower rain': 'גשם חזק',
  'rain': 'גשם',
  'thunderstorm': 'סופת רעמים',
  'snow': 'שלג',
  'mist': 'ערפל',
  'overcast clouds': 'מעונן',
  'light rain': 'גשם קל',
  'moderate rain': 'גשם בינוני',
  'heavy intensity rain': 'גשם כבד',
  'light snow': 'שלג קל',
  'haze': 'אובך',
  'fog': 'ערפל',
  'drizzle': 'טפטוף',
  'smoke': 'עשן',
  'dust': 'אבק',
  'sand': 'חול',
  'ash': 'אפר',
  'squall': 'סופת רוח',
  'tornado': 'טורנדו'
};

export const CURRENCY_LABELS: Record<string, string> = {
  'USD': 'דולר',
  'EUR': 'אירו',
  'GBP': 'ליש"ט',
  'JPY': 'יין יפני',
};