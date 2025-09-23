import React from 'react';
import type { Language } from '../types';
import { playClickSound } from '../services/audioService';

interface LanguageSelectorProps {
  availableLanguages: Language[];
  selectedLanguages: Language[];
  onLanguageChange: (language: Language) => void;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  availableLanguages,
  selectedLanguages,
  onLanguageChange,
}) => {
  const isMaxSelected = selectedLanguages.length >= 3;
  const isMinSelected = selectedLanguages.length <= 1;

  const handleChange = (language: Language) => {
    playClickSound();
    onLanguageChange(language);
  };

  return (
    <section className="mb-10 p-6 bg-white/60 backdrop-blur-sm rounded-2xl shadow-md border border-slate-200">
      <h2 className="text-xl font-semibold text-slate-700 mb-4 text-center">
        Choose up to 3 Languages
      </h2>
      <div className="max-h-60 overflow-y-auto space-y-2 pr-2">
        {availableLanguages.map(lang => {
          const isSelected = selectedLanguages.some(l => l.code === lang.code);
          const isDisabled = (!isSelected && isMaxSelected) || (isSelected && isMinSelected);

          return (
            <label
              key={lang.code}
              className={`flex items-center p-3 rounded-lg transition-colors duration-200 cursor-pointer ${
                isSelected
                  ? 'bg-sky-100 border-sky-300 border'
                  : 'bg-slate-50 hover:bg-sky-50'
              } ${
                isDisabled && !isSelected
                  ? 'cursor-not-allowed opacity-60'
                  : ''
              }`}
            >
              <input
                type="checkbox"
                checked={isSelected}
                disabled={isDisabled}
                onChange={() => handleChange(lang)}
                className="h-5 w-5 rounded border-gray-300 text-sky-600 focus:ring-sky-500 cursor-pointer disabled:cursor-not-allowed"
              />
              <span className="ml-3 text-slate-700 font-medium">{lang.name}</span>
            </label>
          );
        })}
      </div>
    </section>
  );
};

export default LanguageSelector;
