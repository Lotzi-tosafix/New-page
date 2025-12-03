import React from 'react';
import { BackgroundOption, SearchEngine, UserSettings } from '../types';
import { BACKGROUNDS, SEARCH_ENGINES } from '../constants';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  onUpdateSettings: (newSettings: UserSettings) => void;
  availableCategories: string[]; // For filtering
}

const SettingsModal: React.FC<SettingsModalProps> = ({ 
  isOpen, 
  onClose, 
  settings, 
  onUpdateSettings,
  availableCategories 
}) => {
  if (!isOpen) return null;

  const toggleCategory = (cat: string) => {
    const isHidden = settings.hiddenCategories.includes(cat);
    let newHidden;
    if (isHidden) {
      newHidden = settings.hiddenCategories.filter(c => c !== cat);
    } else {
      newHidden = [...settings.hiddenCategories, cat];
    }
    onUpdateSettings({ ...settings, hiddenCategories: newHidden });
  };

  const setBackground = (id: string | null) => {
    onUpdateSettings({ ...settings, backgroundImageId: id });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative bg-white rounded-3xl w-full max-w-3xl h-[80vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">הגדרות</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition">
            <svg className="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          {/* Background Selection */}
          <section>
            <h3 className="text-lg font-semibold mb-4 text-gray-700">רקע</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* No Background Option */}
              <button 
                onClick={() => setBackground(null)}
                className={`aspect-video rounded-xl border-2 flex items-center justify-center transition hover:opacity-80
                  ${settings.backgroundImageId === null ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200 bg-gray-50'}`}
              >
                <span className="text-gray-500 font-medium">ללא רקע</span>
              </button>

              {BACKGROUNDS.map(bg => (
                <button
                  key={bg.id}
                  onClick={() => setBackground(bg.id)}
                  className={`relative aspect-video rounded-xl overflow-hidden border-2 transition hover:opacity-90
                    ${settings.backgroundImageId === bg.id ? 'border-blue-500 ring-2 ring-blue-200' : 'border-transparent'}`}
                >
                  <img src={bg.thumbnail} alt={bg.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-x-0 bottom-0 bg-black/50 p-1 text-center">
                    <span className="text-white text-xs">{bg.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* Search Engine */}
          <section>
            <h3 className="text-lg font-semibold mb-4 text-gray-700">מנוע חיפוש</h3>
            <div className="flex flex-wrap gap-4">
              {Object.values(SearchEngine).map((eng) => (
                <button
                  key={eng}
                  onClick={() => onUpdateSettings({ ...settings, searchEngine: eng })}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition
                    ${settings.searchEngine === eng 
                      ? 'bg-blue-50 border-blue-500 text-blue-700' 
                      : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'}`}
                >
                   <img src={SEARCH_ENGINES[eng].icon} alt={eng} className="w-5 h-5" />
                   <span className="font-medium">{eng}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Categories */}
          <section>
             <h3 className="text-lg font-semibold mb-4 text-gray-700">תצוגת תוכן</h3>
             <p className="text-sm text-gray-500 mb-4">בחר אילו נושאים להציג בדף הבית</p>
             <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
               {availableCategories.map(cat => (
                 <label key={cat} className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 cursor-pointer transition">
                   <div className="relative flex items-center">
                     <input 
                       type="checkbox" 
                       checked={!settings.hiddenCategories.includes(cat)}
                       onChange={() => toggleCategory(cat)}
                       className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-gray-300 transition-all checked:border-blue-500 checked:bg-blue-500"
                     />
                     <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100">
                        <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                   </div>
                   <span className="text-gray-700">{cat}</span>
                 </label>
               ))}
             </div>
          </section>
        </div>
        
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
            <button 
                onClick={onClose}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
            >
                שמור וסגור
            </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;