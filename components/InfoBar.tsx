
import React, { useEffect, useState } from 'react';
import { WeatherData, CurrencyData, ProverbData, ZmanimData } from '../types';
import { fetchCurrency, fetchProverb, fetchWeather } from '../services/api';
import { CURRENCY_LABELS, WEATHER_TRANSLATIONS } from '../constants';
import { CACHE_KEYS, getFromCache, saveToCache, shouldUpdateHourly } from '../services/cacheService';
// Zmanim, GeoLocation, HDate and DailyLearning are all in @hebcal/core
import { Zmanim, GeoLocation, HDate, DailyLearning } from '@hebcal/core';
// Import dafYomi to ensure @hebcal/learning is loaded and registered
import { dafYomi } from '@hebcal/learning';

interface InfoBarProps {
  isTransparent: boolean;
}

const InfoBar: React.FC<InfoBarProps> = ({ isTransparent }) => {
  const [weather, setWeather] = useState<WeatherData | null>(() => {
    return getFromCache<WeatherData>(CACHE_KEYS.WEATHER)?.data || null;
  });
  const [currency, setCurrency] = useState<CurrencyData | null>(() => {
    return getFromCache<CurrencyData>(CACHE_KEYS.CURRENCY)?.data || null;
  });
  const [proverb, setProverb] = useState<ProverbData | null>(() => {
    return getFromCache<ProverbData>(CACHE_KEYS.PROVERB)?.data || null;
  });
  const [zmanim, setZmanim] = useState<ZmanimData | null>(null);

  const calculateZmanim = (lat: number, lon: number) => {
    try {
        const now = new Date();
        
        // System timezone ensures calculations match the user's system clock
        const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        
        const loc = new GeoLocation("User Location", lat, lon, 0, userTimezone);
        const hd = new HDate(now);
        
        // Zmanim calculation
        const z = new Zmanim(loc, hd, false);
        
        // Daf Yomi retrieval using DailyLearning lookup
        const dafEvent = DailyLearning.lookup('dafYomi', hd);
        let dafYomiStr = 'לא נמצא';
        
        if (dafEvent) {
            // Render in Hebrew and clean prefix for clean UI
            dafYomiStr = dafEvent.render('he').replace('דף יומי: ', '');
        }

        const data: ZmanimData = {
            alot: z.alotHaShachar(),
            sunrise: z.sunrise(),
            szksMga: z.sofZmanShmaMGA(),
            szksGra: z.sofZmanShma(),
            sztMga: z.sofZmanTfillaMGA(),
            sztGra: z.sofZmanTfilla(),
            chatzot: z.chatzot(),
            sunset: z.sunset(),
            tzeit: z.tzeit(),
            dafYomi: dafYomiStr,
        };
        setZmanim(data);
    } catch (e) {
        console.error("Error calculating Zmanim", e);
    }
  };

  const checkAndUpdateData = async () => {
    const cachedWeather = getFromCache<WeatherData>(CACHE_KEYS.WEATHER);
    
    const handleLocation = async (lat: number, lon: number) => {
        calculateZmanim(lat, lon);
        
        if (!cachedWeather || shouldUpdateHourly(cachedWeather.timestamp)) {
             const w = await fetchWeather(lat, lon);
             if (w) {
               setWeather(w);
               saveToCache(CACHE_KEYS.WEATHER, w);
             }
        }
    };

    const handleDefaultLocation = async () => {
        calculateZmanim(31.7683, 35.2137); // Jerusalem default
        if (!cachedWeather || shouldUpdateHourly(cachedWeather.timestamp)) {
            const w = await fetchWeather(undefined, undefined, 'Jerusalem');
            if (w) {
                setWeather(w);
                saveToCache(CACHE_KEYS.WEATHER, w);
            }
        }
    };

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => handleLocation(position.coords.latitude, position.coords.longitude),
            (error) => {
                console.warn("Geolocation failed, using default:", error);
                handleDefaultLocation();
            }
        );
    } else {
        handleDefaultLocation();
    }

    const cachedCurrency = getFromCache<CurrencyData>(CACHE_KEYS.CURRENCY);
    if (!cachedCurrency || shouldUpdateHourly(cachedCurrency.timestamp)) {
      const c = await fetchCurrency();
      if (c) {
        setCurrency(c);
        saveToCache(CACHE_KEYS.CURRENCY, c);
      }
    }

    const cachedProverb = getFromCache<ProverbData>(CACHE_KEYS.PROVERB);
    const proverbDate = cachedProverb ? new Date(cachedProverb.timestamp).getDate() : -1;
    const today = new Date().getDate();
    
    if (!cachedProverb || proverbDate !== today) {
      const p = await fetchProverb();
      if (p) {
        setProverb(p);
        saveToCache(CACHE_KEYS.PROVERB, p);
      }
    }
  };

  useEffect(() => {
    checkAndUpdateData();
    const intervalId = setInterval(checkAndUpdateData, 60 * 1000);
    return () => clearInterval(intervalId);
  }, []);

  const cardClass = isTransparent
    ? "bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20"
    : "bg-white border border-gray-100 text-gray-700 shadow-sm hover:shadow-md";

  const textSecondary = isTransparent ? "text-gray-200" : "text-gray-500";
  const textPrimary = isTransparent ? "text-white" : "text-gray-800";
  const skeletonBg = isTransparent ? "bg-white/20" : "bg-gray-200";

  const calculateRate = (targetCurrency: string, amount: number = 1) => {
    if (!currency || !currency.conversion_rates) return 0;
    const rateInUSD = currency.conversion_rates[targetCurrency];
    const ilsInUSD = currency.conversion_rates['ILS'];
    if (!rateInUSD || !ilsInUSD) return 0;
    return (ilsInUSD / rateInUSD) * amount;
  };

  const getWeatherDescription = (desc: string) => {
    return WEATHER_TRANSLATIONS[desc.toLowerCase()] || desc;
  };

  const formatTime = (date: Date) => {
    if (!date) return '--:--';
    return date.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 px-4">
      
      {/* Weather Card */}
      <div className={`rounded-2xl p-4 flex items-center justify-between transition-all duration-300 min-h-[140px] ${cardClass}`}>
        {weather ? (
          <>
            <div className="flex flex-col">
              <span className={`text-sm ${textSecondary}`}>{weather.name}</span>
              <span className={`text-3xl font-bold ${textPrimary}`}>{Math.round(weather.main.temp)}°C</span>
              <span className={`text-sm ${textSecondary} mt-1`}>
                {weather.weather[0] ? getWeatherDescription(weather.weather[0].description) : ''}
              </span>
            </div>
            <div className="text-5xl">🌤️</div>
          </>
        ) : (
          <div className="w-full flex justify-between items-center animate-pulse">
             <div className="space-y-2">
                <div className={`h-4 w-20 rounded ${skeletonBg}`}></div>
                <div className={`h-8 w-16 rounded ${skeletonBg}`}></div>
                <div className={`h-3 w-24 rounded ${skeletonBg}`}></div>
             </div>
             <div className={`h-12 w-12 rounded-full ${skeletonBg}`}></div>
          </div>
        )}
      </div>

      {/* Zmanim Card */}
      <div className={`rounded-2xl p-3 px-4 flex flex-col justify-center transition-all duration-300 min-h-[140px] ${cardClass}`}>
        {zmanim ? (
            <div className="w-full h-full flex flex-col justify-between text-xs sm:text-[0.8rem]">
                <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                    <div className="flex justify-between"><span className={textSecondary}>עלות:</span> <span className={`font-medium ${textPrimary}`}>{formatTime(zmanim.alot)}</span></div>
                    <div className="flex justify-between"><span className={textSecondary}>הנץ:</span> <span className={`font-medium ${textPrimary}`}>{formatTime(zmanim.sunrise)}</span></div>
                    <div className="flex justify-between"><span className={textSecondary}>סוזק"ש מג"א:</span> <span className={`font-medium ${textPrimary}`}>{formatTime(zmanim.szksMga)}</span></div>
                    <div className="flex justify-between"><span className={textSecondary}>סוזק"ש גר"א:</span> <span className={`font-medium ${textPrimary}`}>{formatTime(zmanim.szksGra)}</span></div>
                    <div className="flex justify-between"><span className={textSecondary}>סוזת"פ מג"א:</span> <span className={`font-medium ${textPrimary}`}>{formatTime(zmanim.sztMga)}</span></div>
                    <div className="flex justify-between"><span className={textSecondary}>סוזת"פ גר"א:</span> <span className={`font-medium ${textPrimary}`}>{formatTime(zmanim.sztGra)}</span></div>
                    <div className="flex justify-between"><span className={textSecondary}>חצות:</span> <span className={`font-medium ${textPrimary}`}>{formatTime(zmanim.chatzot)}</span></div>
                    <div className="flex justify-between"><span className={textSecondary}>שקיעה:</span> <span className={`font-medium ${textPrimary}`}>{formatTime(zmanim.sunset)}</span></div>
                    <div className="flex justify-between col-span-1"><span className={textSecondary}>צאה"כ:</span> <span className={`font-medium ${textPrimary}`}>{formatTime(zmanim.tzeit)}</span></div>
                </div>
                <div className="mt-2 pt-2 border-t border-gray-100/20 text-center">
                    <span className={`${textSecondary} text-xs`}>דף יומי: </span>
                    <span className={`font-bold ${textPrimary}`}>{zmanim.dafYomi}</span>
                </div>
            </div>
        ) : (
             <div className="w-full grid grid-cols-2 gap-2 animate-pulse">
               {[...Array(8)].map((_, i) => (
                   <div key={i} className={`h-3 w-full rounded ${skeletonBg}`}></div>
               ))}
             </div>
        )}
      </div>

      {/* Currency Card */}
      <div className={`rounded-2xl p-4 flex flex-col justify-center transition-all duration-300 min-h-[140px] ${cardClass}`}>
        {currency ? (
          <div className="grid grid-cols-2 gap-x-6 gap-y-3">
            <div className={`flex justify-between items-center`}>
               <span className={`text-sm font-medium ${textSecondary}`}>{CURRENCY_LABELS['USD']} $</span>
               <span className={`font-bold ${textPrimary}`}>{calculateRate('USD').toFixed(2)} ₪</span>
            </div>
            <div className={`flex justify-between items-center`}>
               <span className={`text-sm font-medium ${textSecondary}`}>{CURRENCY_LABELS['EUR']} €</span>
               <span className={`font-bold ${textPrimary}`}>{calculateRate('EUR').toFixed(2)} ₪</span>
            </div>
            <div className={`flex justify-between items-center`}>
               <span className={`text-sm font-medium ${textSecondary}`}>{CURRENCY_LABELS['GBP']} £</span>
               <span className={`font-bold ${textPrimary}`}>{calculateRate('GBP').toFixed(2)} ₪</span>
            </div>
            <div className={`flex justify-between items-center`}>
               <span className={`text-sm font-medium ${textSecondary}`}>{CURRENCY_LABELS['JPY']} (100)</span>
               <span className={`font-bold ${textPrimary}`}>{calculateRate('JPY', 100).toFixed(2)} ₪</span>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 animate-pulse w-full">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="flex justify-between items-center">
                 <div className={`h-4 w-12 rounded ${skeletonBg}`}></div>
                 <div className={`h-4 w-16 rounded ${skeletonBg}`}></div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Proverb Card */}
      <div className={`rounded-2xl p-4 flex flex-col justify-center text-center transition-all duration-300 min-h-[140px] ${cardClass}`}>
        {proverb ? (
          <p className={`text-base italic font-medium leading-relaxed ${textPrimary}`}>
            "{proverb.proverb}"
          </p>
        ) : (
           <div className="w-full flex flex-col items-center gap-2 animate-pulse">
               <div className={`h-4 w-3/4 rounded ${skeletonBg}`}></div>
               <div className={`h-4 w-1/2 rounded ${skeletonBg}`}></div>
               <div className={`h-4 w-2/3 rounded ${skeletonBg}`}></div>
           </div>
        )}
      </div>
    </div>
  );
};

export default InfoBar;
