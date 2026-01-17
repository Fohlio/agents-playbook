import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['en', 'ru'],
  defaultLocale: 'en',
  localePrefix: 'as-needed', // Show prefix only for non-default locale (/ru)
  localeCookie: {
    name: 'NEXT_LOCALE',
    maxAge: 31536000, // 1 year
  },
});

export type Locale = (typeof routing.locales)[number];
