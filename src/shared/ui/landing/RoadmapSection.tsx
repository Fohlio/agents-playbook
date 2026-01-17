'use client';

import { useTranslations } from 'next-intl';

export default function RoadmapSection() {
  const t = useTranslations('landing.roadmap');

  const roadmapItems = [
    { titleKey: 'item1.title', descriptionKey: 'item1.description' },
    { titleKey: 'item2.title', descriptionKey: 'item2.description' },
    { titleKey: 'item3.title', descriptionKey: 'item3.description' },
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-blue-50 to-indigo-100 border-t border-b border-blue-200" aria-labelledby="roadmap-title">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 id="roadmap-title" className="text-4xl font-bold text-gray-900 mb-4">
            {t('title')}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t('subtitle')}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-blue-200 p-8">
          <ol className="space-y-6">
            {roadmapItems.map((item, index) => (
              <li key={index} className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-full flex items-center justify-center font-bold text-sm mr-4 mt-1">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {t(item.titleKey)}
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    {t(item.descriptionKey)}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
