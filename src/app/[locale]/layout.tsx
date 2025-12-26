import type { ReactNode } from 'react';

import { AdminBar } from '@/components/AdminBar';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { LivePreviewListener } from '@/components/LivePreviewListener';
import { locales, type Locale } from '@/i18n';
import { Providers } from '@/providers';
import { InitTheme } from '@/providers/Theme/InitTheme';
import { GeistMono } from 'geist/font/mono';
import { GeistSans } from 'geist/font/sans';
import { NextIntlClientProvider } from 'next-intl';
import { notFound } from 'next/navigation';
import './globals.css';

export function generateStaticParams() {
  return Object.values(locales).map((locale) => ({ locale }));
}

export default async function RootLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;

  // Validate locale
  if (!Object.values(locales).includes(locale)) {
    notFound();
  }

  // Load messages for the locale directly
  const messages = (await import(`../../../messages/${locale}.json`)).default;

  return (
    <html
      className={[GeistSans.variable, GeistMono.variable].filter(Boolean).join(' ')}
      lang={locale}
      suppressHydrationWarning
    >
      <head>
        <InitTheme />
        <link href="/favicon.ico" rel="icon" sizes="32x32" />
        <link href="/favicon.svg" rel="icon" type="image/svg+xml" />
      </head>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Providers>
            <AdminBar />
            <LivePreviewListener />

            <Header />
            <main>{children}</main>
            <Footer />
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
