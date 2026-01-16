import { CachedData } from '../types';

export const CACHE_KEYS = {
    WEATHER: 'weather_cache',
    CURRENCY: 'currency_cache',
    PROVERB: 'proverb_cache',
    NEWS: 'news_cache'
};

export const saveToCache = <T>(key: string, data: T) => {
    const cacheEntry: CachedData<T> = {
        data,
        timestamp: Date.now()
    };
    localStorage.setItem(key, JSON.stringify(cacheEntry));
};

export const getFromCache = <T>(key: string): CachedData<T> | null => {
    const item = localStorage.getItem(key);
    if (!item) return null;
    try {
        return JSON.parse(item) as CachedData<T>;
    } catch (e) {
        console.error('Cache parse error', e);
        return null;
    }
};

// Rule: Update every round hour + 1 minute (e.g. 10:01, 11:01)
export const shouldUpdateHourly = (lastTimestamp: number): boolean => {
    const now = new Date();
    const last = new Date(lastTimestamp);

    // Safety: If more than 65 minutes passed, definitely update
    if (now.getTime() - last.getTime() > 65 * 60 * 1000) return true;

    // Calculate the most recent "XX:01" threshold
    const threshold = new Date(now);
    threshold.setMinutes(1);
    threshold.setSeconds(0);
    threshold.setMilliseconds(0);

    // If current time is 10:00, the threshold is 10:01 (future), 
    // so we look at the previous hour's threshold (09:01).
    if (now < threshold) {
        threshold.setHours(threshold.getHours() - 1);
    }

    // If the data was saved BEFORE the most recent XX:01 threshold, it is stale.
    return last.getTime() < threshold.getTime();
};

// Rule: Update every X minutes
export const shouldUpdateInterval = (lastTimestamp: number, minutes: number): boolean => {
    const now = Date.now();
    return now - lastTimestamp > minutes * 60 * 1000;
};
