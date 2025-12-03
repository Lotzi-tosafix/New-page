import { API_BASE_URL, NEWS_API_URL } from '../constants';
import { CurrencyData, NewsResponse, ProverbData, WeatherData } from '../types';

export const fetchWeather = async (lat?: number, lon?: number, location?: string): Promise<WeatherData | null> => {
  try {
    let url = `${API_BASE_URL}/weather`;
    if (lat && lon) {
      url += `?lat=${lat}&lon=${lon}`;
    } else if (location) {
      url += `?location=${location}`;
    } else {
        // Default fallback
       url += `?location=Jerusalem`;
    }

    const res = await fetch(url);
    if (!res.ok) throw new Error('Weather fetch failed');
    return await res.json();
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const fetchCurrency = async (): Promise<CurrencyData | null> => {
  try {
    const res = await fetch(`${API_BASE_URL}/currency`);
    if (!res.ok) throw new Error('Currency fetch failed');
    return await res.json();
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const fetchProverb = async (): Promise<ProverbData | null> => {
  try {
    const res = await fetch(`${API_BASE_URL}/proverb`);
    if (!res.ok) throw new Error('Proverb fetch failed');
    return await res.json();
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const fetchNews = async (): Promise<NewsResponse | null> => {
  try {
    const res = await fetch(NEWS_API_URL);
    if (!res.ok) throw new Error('News fetch failed');
    return await res.json();
  } catch (error) {
    console.error(error);
    return null;
  }
};