'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { pageview } from '@/lib/analytics';

// Analytics is a React component that tracks page views using Google Analytics.
// It uses the usePathname hook to detect route changes and logs a pageview on each change.
export function Analytics() {
  const pathname = usePathname();

  useEffect(() => {
    pageview(pathname);
  }, [pathname]);

  return null;
}
