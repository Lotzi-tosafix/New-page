import React, { useState, useEffect } from 'react';

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
  const dateString = time.toLocaleDateString('he-IL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="flex flex-col items-center justify-center mb-8 animate-fade-in text-center">
      <h1 className={`text-6xl md:text-8xl font-thin tracking-tighter ${lightMode ? 'text-gray-800' : 'text-white drop-shadow-lg'}`}>
        {timeString}
      </h1>
      <p className={`text-xl md:text-2xl mt-2 font-light ${lightMode ? 'text-gray-600' : 'text-gray-200 drop-shadow-md'}`}>
        {getGreeting()}, היום {dateString}
      </p>
    </div>
  );
};

export default Clock;