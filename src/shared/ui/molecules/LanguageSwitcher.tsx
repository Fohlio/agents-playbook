'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useTransition } from 'react';
import { useRouter, usePathname } from '@/i18n/navigation';
import { routing, type Locale } from '@/i18n/routing';
import { Globe, Check } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

interface LanguageSwitcherProps {
  variant?: 'default' | 'dark';
  className?: string;
}

const LANGUAGES: Record<Locale, { flag: string; nativeName: string }> = {
  en: { flag: '🇬🇧', nativeName: 'English' },
  ru: { flag: '🇷🇺', nativeName: 'Русский' },
};

export function LanguageSwitcher({ variant = 'default', className = '' }: LanguageSwitcherProps) {
  const t = useTranslations('languageSwitcher');
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const handleLocaleChange = (newLocale: Locale) => {
    if (newLocale === locale) return;
    startTransition(() => {
      router.replace(pathname, { locale: newLocale });
    });
  };

  const isDark = variant === 'dark';

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild disabled={isPending}>
        <button
          className={`
            flex items-center gap-2 px-3 py-2 text-sm rounded-xl transition-all duration-200
            ${isDark 
              ? 'bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20' 
              : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 shadow-sm'
            }
            ${isPending ? 'opacity-50 cursor-wait' : 'cursor-pointer'}
            ${className}
          `}
          aria-label={t('label')}
        >
          <Globe className="w-4 h-4" />
          <span className="font-medium">{locale.toUpperCase()}</span>
          <svg className="w-3.5 h-3.5 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className={`
            min-w-[140px] rounded-xl p-1 shadow-xl z-[9999]
            ${isDark 
              ? 'bg-slate-800 border border-white/10' 
              : 'bg-white border border-gray-100'
            }
          `}
          sideOffset={8}
          align="end"
        >
          {routing.locales.map((loc) => {
            const lang = LANGUAGES[loc];
            const isActive = loc === locale;
            return (
              <DropdownMenu.Item
                key={loc}
                onSelect={() => handleLocaleChange(loc)}
                disabled={isPending}
                className={`
                  flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg cursor-pointer outline-none
                  transition-colors
                  ${isDark 
                    ? isActive 
                      ? 'bg-white/10 text-white' 
                      : 'text-white/80 hover:bg-white/5 hover:text-white focus:bg-white/5'
                    : isActive 
                      ? 'bg-blue-50 text-blue-700' 
                      : 'text-gray-700 hover:bg-gray-50 focus:bg-gray-50'
                  }
                  ${isPending ? 'opacity-50' : ''}
                `}
              >
                <span className="text-base">{lang.flag}</span>
                <span className={isActive ? 'font-medium' : ''}>{lang.nativeName}</span>
                {isActive && (
                  <Check className={`w-4 h-4 ml-auto ${isDark ? 'text-emerald-400' : 'text-blue-600'}`} />
                )}
              </DropdownMenu.Item>
            );
          })}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
