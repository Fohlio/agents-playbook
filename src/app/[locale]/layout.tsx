import type { Metadata } from "next";
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { Providers } from "../providers";
import { CookieConsent } from "@/shared/ui/organisms/CookieConsent";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'landing' });
  const tCommon = await getTranslations({ locale, namespace: 'common' });

  const title = `${tCommon('appName')} - ${t('hero.subtitle')}`;
  const description = t('hero.description');

  return {
    title: {
      default: title,
      template: `%s | ${tCommon('appName')}`
    },
    description,
    keywords: [
      "AI workflows",
      "workflow orchestration",
      "AI agents",
      "MCP server",
      "Model Context Protocol",
      "AI automation",
      "workflow management",
      "semantic search",
      "mini prompts",
      "AI productivity",
      "Claude AI",
      "workflow constructor"
    ],
    authors: [{ name: "Agents Playbook Team" }],
    creator: "Agents Playbook",
    publisher: "Agents Playbook",
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    openGraph: {
      type: "website",
      locale: locale === 'ru' ? 'ru_RU' : 'en_US',
      url: "/",
      title,
      description,
      siteName: tCommon('appName'),
      images: [
        {
          url: "/og-image.png",
          width: 1200,
          height: 630,
          alt: `${tCommon('appName')} - AI Workflow Orchestration`
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og-image.png"],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    icons: {
      icon: [
        { url: "/favicon.ico", sizes: "any" },
        { url: "/icon.svg", type: "image/svg+xml" }
      ],
      apple: "/icon.svg",
    },
    manifest: "/manifest.json",
    category: "technology",
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  
  // Validate locale
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // Enable static rendering
  setRequestLocale(locale);

  const messages = await getMessages();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Agents Playbook',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    description: 'Production-ready AI workflow orchestration platform with database-driven workflows, modular mini-prompts, semantic search, and MCP server integration for AI agents.',
    url: process.env.NEXTAUTH_URL || 'https://agents-playbook.com',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '127',
    },
    featureList: [
      'AI Workflow Orchestration',
      'Database-Driven Workflows',
      'Semantic Search',
      'MCP Server Integration',
      'Visual Workflow Constructor',
      'Modular Mini-Prompts',
      'API Token Management',
      'Workflow Sharing',
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <NextIntlClientProvider locale={locale} messages={messages}>
        <Providers>{children}</Providers>
        <CookieConsent />
      </NextIntlClientProvider>
    </>
  );
}
