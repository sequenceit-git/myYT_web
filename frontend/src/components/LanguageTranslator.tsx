import React, { useState, useEffect, useRef } from 'react';
import { Globe, Check, Search, X, Sparkles, ChevronDown } from 'lucide-react';

export interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

export const POPULAR_LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇧🇩' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇧🇷' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', flag: '🇮🇩' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', flag: '🇵🇰' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
  { code: 'zh-CN', name: 'Chinese (Simplified)', nativeName: '简体中文', flag: '🇨🇳' },
  { code: 'zh-TW', name: 'Chinese (Traditional)', nativeName: '繁體中文', flag: '🇹🇼' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
  { code: 'th', name: 'Thai', nativeName: 'ไทย', flag: '🇹🇭' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski', flag: '🇵🇱' },
  { code: 'uk', name: 'Ukrainian', nativeName: 'Українська', flag: '🇺🇦' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱' },
  { code: 'fa', name: 'Persian', nativeName: 'فارسی', flag: '🇮🇷' },
  { code: 'ms', name: 'Malay', nativeName: 'Bahasa Melayu', flag: '🇲🇾' },
  { code: 'sw', name: 'Swahili', nativeName: 'Kiswahili', flag: '🇰🇪' },
  { code: 'ro', name: 'Romanian', nativeName: 'Română', flag: '🇷🇴' },
  { code: 'cs', name: 'Czech', nativeName: 'Čeština', flag: '🇨🇿' },
  { code: 'el', name: 'Greek', nativeName: 'Ελληνικά', flag: '🇬🇷' },
  { code: 'sv', name: 'Swedish', nativeName: 'Svenska', flag: '🇸🇪' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', flag: '🇮🇳' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', flag: '🇮🇳' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
  { code: 'ne', name: 'Nepali', nativeName: 'नेपाली', flag: '🇳🇵' },
  { code: 'tl', name: 'Filipino / Tagalog', nativeName: 'Tagalog', flag: '🇵🇭' },
];

declare global {
  interface Window {
    google?: any;
    googleTranslateElementInit?: () => void;
  }
}

interface LanguageTranslatorProps {
  compact?: boolean;
  align?: 'left' | 'right';
}

export const LanguageTranslator: React.FC<LanguageTranslatorProps> = ({
  compact = false,
  align = 'right',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentLang, setCurrentLang] = useState<string>('en');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Initialize Google Translate Script
  useEffect(() => {
    // Read current cookie language if set
    const match = document.cookie.match(/googtrans=\/en\/([^;]+)/);
    if (match && match[1]) {
      setCurrentLang(match[1]);
    } else {
      const saved = localStorage.getItem('ytcash_lang');
      if (saved) setCurrentLang(saved);
    }

    if (!window.googleTranslateElementInit) {
      window.googleTranslateElementInit = () => {
        try {
          if (window.google && window.google.translate) {
            new window.google.translate.TranslateElement(
              {
                pageLanguage: 'en',
                layout: window.google.translate.TranslateElement.InlineLayout.HORIZONTAL,
                autoDisplay: false,
              },
              'google_translate_element'
            );
          }
        } catch {}
      };
    }

    if (!document.getElementById('google-translate-script')) {
      const script = document.createElement('script');
      script.id = 'google-translate-script';
      script.type = 'text/javascript';
      script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  // Continuous anti-banner observer to protect the sticky navbar from shifting or being blocked
  useEffect(() => {
    const sanitizeTranslateBanner = () => {
      if (document.body.style.top && document.body.style.top !== '0px') {
        document.body.style.setProperty('top', '0px', 'important');
      }
      if (document.body.style.position && document.body.style.position !== 'static') {
        document.body.style.setProperty('position', 'static', 'important');
      }
      if (document.documentElement.style.top && document.documentElement.style.top !== '0px') {
        document.documentElement.style.setProperty('top', '0px', 'important');
      }
      const banners = document.querySelectorAll(
        '.goog-te-banner-frame, iframe.goog-te-banner-frame, iframe.skiptranslate, .VIpgJd-ZVi9gl-ORHb-OEVmcd, .VIpgJd-ZVi9gl-ORHb-OEVmcd.skiptranslate'
      );
      banners.forEach((el) => {
        const htmlEl = el as HTMLElement;
        htmlEl.style.setProperty('display', 'none', 'important');
        htmlEl.style.setProperty('visibility', 'hidden', 'important');
        htmlEl.style.setProperty('height', '0px', 'important');
        htmlEl.style.setProperty('width', '0px', 'important');
        htmlEl.style.setProperty('pointer-events', 'none', 'important');
      });
    };

    sanitizeTranslateBanner();
    const interval = setInterval(sanitizeTranslateBanner, 200);

    const observer = new MutationObserver(() => {
      sanitizeTranslateBanner();
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['style', 'class'],
      childList: true,
      subtree: true,
    });

    return () => {
      clearInterval(interval);
      observer.disconnect();
    };
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelectLanguage = (langCode: string) => {
    setCurrentLang(langCode);
    localStorage.setItem('ytcash_lang', langCode);
    setIsOpen(false);

    if (langCode === 'en') {
      // Clear cookie for original language
      document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; domain=${window.location.hostname}; path=/;`;
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; domain=.${window.location.hostname}; path=/;`;
    } else {
      const cookieVal = `/en/${langCode}`;
      document.cookie = `googtrans=${cookieVal}; path=/;`;
      document.cookie = `googtrans=${cookieVal}; domain=${window.location.hostname}; path=/;`;
      document.cookie = `googtrans=${cookieVal}; domain=.${window.location.hostname}; path=/;`;
    }

    // Attempt to trigger native Google Translate select box if mounted
    const selectElem = document.querySelector('.goog-te-combo') as HTMLSelectElement | null;
    if (selectElem) {
      selectElem.value = langCode;
      selectElem.dispatchEvent(new Event('change'));
    } else {
      window.location.reload();
    }
  };

  const currentOption =
    POPULAR_LANGUAGES.find((l) => l.code === currentLang) || {
      code: currentLang,
      name: currentLang.toUpperCase(),
      nativeName: currentLang.toUpperCase(),
      flag: '🌐',
    };

  const filteredLanguages = POPULAR_LANGUAGES.filter(
    (l) =>
      l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.nativeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div ref={dropdownRef} style={{ position: 'relative', display: 'inline-block' }}>
      {/* Hidden Google Translate Mount Point */}
      <div id="google_translate_element" style={{ display: 'none' }} />

      {/* Language Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="btn"
        style={{
          padding: compact ? '5px 10px' : '6px 12px',
          fontSize: '0.74rem',
          fontWeight: 600,
          borderRadius: 9999,
          background: isOpen ? '#e0f2fe' : '#f0f9ff',
          color: '#0284c7',
          border: '1px solid rgba(14, 165, 233, 0.28)',
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          transition: 'all 0.15s ease',
          boxShadow: '0 2px 6px rgba(14, 165, 233, 0.08)',
        }}
        title="Translate Website"
      >
        <span style={{ fontSize: '0.9rem', lineHeight: 1 }}>{currentOption.flag}</span>
        <Globe size={13} color="#0284c7" />
        <span style={{ fontWeight: 700, color: '#0f172a' }}>
          {compact ? currentOption.code.toUpperCase() : currentOption.nativeName}
        </span>
        <ChevronDown size={12} color="#0284c7" style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
      </button>

      {/* Language Selection Modal / Dropdown */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            [align === 'right' ? 'right' : 'left']: 0,
            width: 290,
            maxHeight: 380,
            background: '#ffffff',
            borderRadius: 18,
            boxShadow: '0 18px 45px rgba(14, 165, 233, 0.18), 0 4px 12px rgba(0,0,0,0.06)',
            border: '1.5px solid rgba(14, 165, 233, 0.25)',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            animation: 'fadeIn 0.15s ease-out',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '12px 14px 10px',
              background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
              borderBottom: '1px solid rgba(14, 165, 233, 0.18)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Globe size={15} color="#0284c7" />
              <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a' }}>
                Translate Website
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              style={{
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                padding: 4,
                color: '#64748b',
                display: 'flex',
              }}
            >
              <X size={14} />
            </button>
          </div>

          {/* Search Box */}
          <div style={{ padding: '8px 10px', borderBottom: '1px solid #f1f5f9' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                background: '#f8fafc',
                borderRadius: 10,
                padding: '6px 10px',
                border: '1px solid #e2e8f0',
              }}
            >
              <Search size={13} color="#94a3b8" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search language..."
                autoFocus
                style={{
                  border: 'none',
                  background: 'transparent',
                  outline: 'none',
                  fontSize: '0.76rem',
                  width: '100%',
                  color: '#0f172a',
                }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 0, color: '#94a3b8' }}
                >
                  <X size={12} />
                </button>
              )}
            </div>
          </div>

          {/* Quick Reset to English */}
          {currentLang !== 'en' && (
            <div style={{ padding: '6px 10px', background: '#f0fdf4', borderBottom: '1px solid #dcfce7' }}>
              <button
                type="button"
                onClick={() => handleSelectLanguage('en')}
                style={{
                  width: '100%',
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  fontSize: '0.72rem',
                  color: '#16a34a',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 5,
                  padding: '4px 0',
                }}
              >
                <Sparkles size={12} /> Reset to Original English
              </button>
            </div>
          )}

          {/* Languages List */}
          <div
            style={{
              overflowY: 'auto',
              maxHeight: 250,
              padding: '4px 6px',
            }}
          >
            {filteredLanguages.length === 0 ? (
              <div style={{ padding: '16px', textAlign: 'center', fontSize: '0.76rem', color: '#94a3b8' }}>
                No languages found matching "{searchQuery}"
              </div>
            ) : (
              filteredLanguages.map((lang) => {
                const isSelected = currentLang === lang.code;
                return (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => handleSelectLanguage(lang.code)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 10px',
                      borderRadius: 10,
                      border: 'none',
                      background: isSelected ? '#e0f2fe' : 'transparent',
                      color: isSelected ? '#0284c7' : '#0f172a',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'background 0.12s ease',
                      marginBottom: 2,
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) e.currentTarget.style.background = '#f8fafc';
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                      <span style={{ fontSize: '1.05rem', lineHeight: 1 }}>{lang.flag}</span>
                      <div>
                        <div style={{ fontSize: '0.78rem', fontWeight: isSelected ? 700 : 600 }}>
                          {lang.nativeName}
                        </div>
                        <div style={{ fontSize: '0.66rem', color: '#64748b' }}>{lang.name}</div>
                      </div>
                    </div>
                    {isSelected && <Check size={14} color="#0284c7" strokeWidth={3} />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
