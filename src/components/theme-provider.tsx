'use client';

import * as React from 'react';
import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps as NextThemesProviderProps,
} from 'next-themes';

// Define the props for the ThemeProvider component
interface ThemeProviderProps extends NextThemesProviderProps {
  children: React.ReactNode; // Explicitly define the children prop
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class" // Apply the theme as a class on the <html> element
      defaultTheme="system" // Use the system theme by default
      enableSystem // Enable automatic theme detection based on the user's system preferences
      disableTransitionOnChange // Disable transitions when the theme changes to avoid flickering
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
