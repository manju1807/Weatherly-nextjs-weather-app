import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { TooltipProvider } from '@/components/ui/tooltip';

// Define font with improved font-display strategy
const inter = localFont({
  src: './fonts/Inter/Inter-VariableFont_opsz,wght.ttf',
  variable: '--font-inter-regular',
  weight: '100 900',
  display: 'swap', // Add font-display strategy for better performance
});

export const metadata: Metadata = {
  metadataBase: new URL('https://weatherly18.netlify.app/'),
  title: 'Weatherly: Real-Time Weather Updates & Forecasts',
  description:
    'Get accurate weather forecasts, real-time updates, air quality data, and detailed weather information for any location worldwide. Features interactive maps, hourly forecasts, and comprehensive weather metrics using OpenWeather API.',
  keywords:
    'weather app, weather forecast, real-time weather, air quality index, temperature tracking, weather radar, climate data, weather maps, hourly forecast, weather alerts, precipitation forecast, wind speed, humidity levels, atmospheric pressure, UV index, weather dashboard, global weather, local weather, weather visualization, meteorological data, weather conditions',
  openGraph: {
    type: 'website',
    url: 'https://weatherly18.netlify.app/',
    title: 'Weatherly: Real-Time Weather Updates & Forecasts',
    description:
      'Get accurate weather forecasts, real-time updates, and detailed weather information for any location worldwide.',
    siteName: 'Weatherly',
    images: [
      {
        url: 'https://weatherly18.netlify.app/opengraph-image.png',
        width: 1200,
        height: 630,
        alt: 'Weatherly - Your Global Weather Companion',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Weatherly: Real-Time Weather Updates & Forecasts',
    description: 'Global weather forecasts and real-time updates at your fingertips',
    images: ['https://weatherly18.netlify.app/opengraph-image.png'],
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/icons/apple-touch-icon.png',
  },
  alternates: {
    languages: {
      'en-US': '/en-US',
      'es-ES': '/es-ES',
    },
    canonical: 'https://weatherly18.netlify.app/',
  },
  authors: [{ name: 'Manjunath R' }],
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
  applicationName: 'Weatherly',
  category: 'Weather, Forecast, Climate',
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'theme-color': '#ffffff',
    'msapplication-TileColor': '#2b5797',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Add dir attribute for text direction support
    <html lang="en" dir="ltr">
      <head>
        {/* Add viewport meta tag for responsive design */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* Add high contrast support */}
        <meta name="color-scheme" content="light dark" />
      </head>
      <body
        className={`${inter.variable} font-[family-name:var(--font-inter)] antialiased min-h-screen`}
        // Keep suppressHydrationWarning only if necessary for theme switching
        suppressHydrationWarning={true}
      >
        {/* Add skip to main content link for keyboard users */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-background focus:text-foreground"
        >
          Skip to main content
        </a>

        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          // Add forcedTheme prop for users who prefer reduced motion
          forcedTheme={
            typeof window !== 'undefined' &&
            window.matchMedia('(prefers-reduced-motion: reduce)').matches
              ? 'light'
              : undefined
          }
        >
          <main id="main-content" className="min-h-screen">
            <TooltipProvider>{children}</TooltipProvider>
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
