import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import StoreProvider from '@/store/store-provider';
import { ThemeProvider } from '@/components/theme-provider';
import FetchLocation from '@/lib/fetchLocation';

const inter = localFont({
  src: './fonts/Inter/Inter-VariableFont_opsz,wght.ttf',
  variable: '--font-inter-regular',
  weight: '100 900',
});

export const metadata: Metadata = {
  title: 'Weather App',
  description: 'Weather Application - Next.js 14, Typescript',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} font-[family-name:var(--font-inter)] antialiased`}
        suppressHydrationWarning={true}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <StoreProvider>
            <FetchLocation />
            {children}
          </StoreProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
