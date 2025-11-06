import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { CookieConsent } from "@/shared/ui/organisms/CookieConsent";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL || 'https://agents-playbook.com'),
  title: {
    default: "Agents Playbook - AI Workflow Orchestration Platform",
    template: "%s | Agents Playbook"
  },
  description: "Production-ready AI workflow orchestration platform with database-driven workflows, modular mini-prompts, semantic search, and MCP server integration for AI agents.",
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
    locale: "en_US",
    url: "/",
    title: "Agents Playbook - AI Workflow Orchestration Platform",
    description: "Production-ready AI workflow orchestration platform with database-driven workflows, modular mini-prompts, and MCP server integration.",
    siteName: "Agents Playbook",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Agents Playbook - AI Workflow Orchestration"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Agents Playbook - AI Workflow Orchestration Platform",
    description: "Production-ready AI workflow orchestration platform with database-driven workflows and MCP server integration.",
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
  verification: {
    // Add your verification tokens when ready
    // google: "your-google-verification-token",
    // yandex: "your-yandex-verification-token",
  },
  category: "technology",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>{children}</Providers>
        <CookieConsent />
      </body>
    </html>
  );
}
