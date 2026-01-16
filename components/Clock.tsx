
import React, { useState, useEffect } from 'react';
import { HDate, gematriya, Locale } from '@hebcal/core';

const Clock: React.FC<{ lightMode: boolean }> = ({ lightMode }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    const hour = time.getHours();
    if (hour >= 5 && hour < 12) return 'בוקר טוב';
    if (hour >= 12 && hour < 18) return 'צהריים טובים';
    if (hour >= 18 && hour < 22) return 'ערב טוב';
    return 'לילה טוב';
  };

  const timeString = time.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });
  
  // Separate date components
  const dayOfWeek = time.toLocaleDateString('he-IL', { weekday: 'long' });
  const gregorianDate = time.toLocaleDateString('he-IL', { day: 'numeric', month: 'long', year: 'numeric' });
  
  // Convert to Hebrew Date using Gematriya
  const hDate = new HDate(time);
  const day = gematriya(hDate.getDate());
  
  // Get month name in Hebrew using Locale, then remove nikkud
  const monthName = hDate.getMonthName();
  const monthHebWithNikkud = Locale.gettext(monthName, 'he');
  const month = monthHebWithNikkud.replace(/[\u0591-\u05C7]/g, '');
  
  const year = gematriya(hDate.getFullYear());
  
  const hebrewDateString = `${day} ${month} ${year}`;

  // Styling based on mode
  const textColor = lightMode ? 'text-gray-800' : 'text-white drop-shadow-md';
  const subTextColor = lightMode ? 'text-gray-600' : 'text-blue-100 drop-shadow-sm';

  return (
    <div className="flex flex-col items-center justify-center mb-10 animate-fade-in select-none w-full max-w-5xl">
      
      {/* Top: Greeting */}
      <h2 className={`text-2xl md:text-3xl font-light mb-2 tracking-wide opacity-90 ${textColor}`}>
        {getGreeting()}
      </h2>

      {/* Center Row: Grid/Flex for layout */}
      {/* On Mobile: Stacked. On Desktop: Right(Hebrew) - Center(Time) - Left(Gregorian) */}
      <div className="flex flex-col md:flex-row items-center justify-center w-full gap-2 md:gap-12 relative">
        
        {/* Right Side (Visually Right in RTL): Day & Hebrew Date */}
        <div className={`order-2 md:order-1 flex flex-col items-center md:items-start text-center md:text-right min-w-[180px] ${subTextColor}`}>
          <span className="text-xl md:text-2xl font-medium">{dayOfWeek}</span>
          <span className="text-lg md:text-xl font-light opacity-85 tracking-wide">{hebrewDateString}</span>
        </div>

        {/* Center: Time */}
        <div className={`order-1 md:order-2 text-4xl md:text-6xl font-thin tracking-tighter leading-none mx-4 transition-all duration-500 ${textColor}`}>
          {timeString}
        </div>

        {/* Left Side (Visually Left in RTL): Gregorian Date */}
        <div className={`order-3 md:order-3 flex flex-col items-center md:items-end text-center md:text-left min-w-[180px] ${subTextColor}`}>
           <span className="text-xl md:text-2xl font-medium tracking-wide">{gregorianDate}</span>
        </div>

      </div>
    </div>
  );
};

export default Clock;
