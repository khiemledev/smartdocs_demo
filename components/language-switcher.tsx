'use client';

import React from 'react';
import { useLanguage } from '@/contexts/language-context';
import { Globe } from 'lucide-react';

export const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'vi' : 'en');
  };

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors duration-200 text-gray-700 hover:text-gray-900"
      title={`Switch to ${language === 'en' ? 'Vietnamese' : 'English'}`}
    >
      <Globe className="w-4 h-4" />
      <span className="text-sm font-medium">
        {language === 'en' ? 'EN' : 'VI'}
      </span>
    </button>
  );
}; 