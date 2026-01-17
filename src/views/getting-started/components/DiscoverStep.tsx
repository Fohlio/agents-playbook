'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ROUTES } from '@/shared/routes';

/**
 * Discover Step
 *
 * Explains Discover page functionality
 * Shows how to find and explore workflows
 */
export function DiscoverStep() {
  const t = useTranslations('gettingStarted.discover');

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {t('title')}
        </h2>
        <p className="text-gray-600">
          {t('subtitle')}
        </p>
      </div>

      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-6 space-y-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold">
            1
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{t('step1Title')}</h3>
            <p className="text-sm text-gray-600">
              {t('step1Desc')}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-lg flex items-center justify-center font-bold">
            2
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{t('step2Title')}</h3>
            <p className="text-sm text-gray-600">
              {t('step2Desc')}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-8 h-8 bg-emerald-600 text-white rounded-lg flex items-center justify-center font-bold">
            3
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{t('step3Title')}</h3>
            <p className="text-sm text-gray-600">
              {t('step3Desc')}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900">
              {t('readyToExplore')}
            </p>
            <p className="text-xs text-gray-600 mt-1">
              {t('visitDiscover')}
            </p>
          </div>
          <Link
            href={ROUTES.DISCOVER}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors text-sm font-medium"
          >
            {t('goToDiscover')}
          </Link>
        </div>
      </div>
    </div>
  );
}
