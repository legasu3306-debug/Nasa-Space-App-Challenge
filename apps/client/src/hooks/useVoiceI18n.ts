import { useState, useCallback } from 'react';
import { SupportedLanguage, TRANSLATIONS } from '../lib/i18n.js';

export function useVoiceI18n() {
  const [language, setLanguage] = useState<SupportedLanguage>('en');

  const t = useCallback(
    (key: string) => TRANSLATIONS[language]?.[key] || TRANSLATIONS.en[key] || key,
    [language]
  );

  const speakAdvisory = useCallback(
    (text: string) => {
      if (!('speechSynthesis' in window)) return;
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === 'am' ? 'am-ET' : language === 'om' ? 'om-ET' : 'en-US';
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    },
    [language]
  );

  return { language, setLanguage, t, speakAdvisory };
}
