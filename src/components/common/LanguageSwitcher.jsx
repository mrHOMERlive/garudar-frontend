import React, { useState } from 'react';
import { getLanguage, setLanguage } from '@/components/utils/language';

export default function LanguageSwitcher({ variant = "default" }) {
  const [lang, setLang] = useState(getLanguage());

  const handleChange = (l) => {
    setLanguage(l);
    setLang(l);
  };

  return (
    <div className="flex items-center bg-white/10 rounded-lg p-0.5 gap-0.5">
      <button
        onClick={() => handleChange('en')}
        className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${lang === 'en' ? 'bg-white text-[#1e3a5f]' : 'text-white/70 hover:text-white'}`}
      >
        EN
      </button>
      <button
        onClick={() => handleChange('id')}
        className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${lang === 'id' ? 'bg-white text-[#1e3a5f]' : 'text-white/70 hover:text-white'}`}
      >
        ID
      </button>
    </div>
  );
}
