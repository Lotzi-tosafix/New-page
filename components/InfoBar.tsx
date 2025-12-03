import React, { useEffect, useState } from 'react';
import { WeatherData, CurrencyData, ProverbData } from '../types';
import { fetchCurrency, fetchProverb, fetchWeather } from '../services/api';
import { CURRENCY_LABELS, WEATHER_TRANSLATIONS } from '../constants';

interface InfoBarProps {
  isTransparent: boolean;
}

const InfoBar: React.FC<InfoBarProps> = ({ isTransparent }) => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [currency, setCurrency] = useState<CurrencyData | null>(null);
  const [proverb, setProverb] = useState<ProverbData | null>(null);

  useEffect(() => {
    const loadData = async () => {
      // 1. Proverb & Currency (Simple fetch)
      fetchCurrency().then(setCurrency);
      fetchProverb().then(setProverb);

      // 2. Weather with Geolocation
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const w = await fetchWeather(position.coords.latitude, position.coords.longitude);
            setWeather(w);
          },
          async () => {
            // Fallback if permission denied
            const w = await fetchWeather(undefined, undefined, 'Jerusalem');
            setWeather(w);
          }
        );
      } else {
        const w = await fetchWeather(undefined, undefined, 'Jerusalem');
        setWeather(w);
      }
    };

    loadData();
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
    
    // Value of 1 USD in ILS / Value of 1 USD in Target = Value of 1 Target in ILS
    return (ilsInUSD / rateInUSD) * amount;
  };

  const getWeatherDescription = (desc: string) => {
    return WEATHER_TRANSLATIONS[desc.toLowerCase()] || desc;
  };

  return (
    <div className="w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 px-4">
      
      {/* Weather Card */}
      <div className={`rounded-2xl p-4 flex items-center justify-between transition-all duration-300 min-h-[110px] ${cardClass}`}>
        {weather ? (
          <>
            <div className="flex flex-col">
              <span className={`text-sm ${textSecondary}`}>{weather.name}</span>
              <span className={`text-2xl font-bold ${textPrimary}`}>{Math.round(weather.main.temp)}°C</span>
              <span className={`text-xs ${textSecondary}`}>
                {weather.weather[0] ? getWeatherDescription(weather.weather[0].description) : ''}
              </span>
            </div>
            <div className="text-4xl">
               🌤️
            </div>
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

      {/* Currency Card */}
      <div className={`rounded-2xl p-4 flex flex-col justify-center transition-all duration-300 min-h-[110px] ${cardClass}`}>
        {currency ? (
          <div className="grid grid-cols-2 gap-x-6 gap-y-2">
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
               <span className={`text-sm font-medium ${textSecondary}`}>{CURRENCY_LABELS['JPY']} (100) ¥</span>
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
      <div className={`rounded-2xl p-4 flex flex-col justify-center text-center transition-all duration-300 min-h-[110px] ${cardClass}`}>
        {proverb ? (
          <p className={`text-sm italic font-medium leading-relaxed ${textPrimary}`}>
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