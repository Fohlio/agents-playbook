'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Cookie, X } from 'lucide-react';

const COOKIE_CONSENT_KEY = 'cookie-consent';

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const t = useTranslations('cookies');

  useEffect(() => {
    // Check if user has already consented
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      // Delay showing to not interrupt initial page load
      const timer = setTimeout(() => setShowBanner(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'accepted');
    setShowBanner(false);
  };

  const handleDecline = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'declined');
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm bg-white border border-gray-200 rounded-xl shadow-lg z-50 p-4 animate-in slide-in-from-bottom-4 duration-300">
      <button
        onClick={handleDecline}
        className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
        aria-label={t('close')}
      >
        <X className="w-4 h-4" />
      </button>

      <div className="flex items-start gap-3 pr-6">
        <Cookie className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-600 leading-relaxed">
            {t('message')}{' '}
            <a
              href="/privacy"
              className="text-blue-600 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              {t('learnMore')}
            </a>
          </p>

          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={handleAccept}
              className="px-3 py-1.5 bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 rounded-lg transition-colors"
            >
              {t('accept')}
            </button>
            <button
              onClick={handleDecline}
              className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {t('decline')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
