// app/not-found.tsx
'use client';

import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
      <div className="text-center space-y-6">
        <div className="flex justify-center">
          <AlertTriangle className="h-24 w-24 text-yellow-500" />
        </div>
        <h1 className="text-4xl font-bold text-primary">404</h1>
        <h2 className="text-2xl font-semibold text-foreground">Page Not Found</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          Oops! The weather seems unpredictable here. The page you&apos;re looking for
          doesn&apos;t exist or has been moved to a different location.
        </p>
        <div className="flex justify-center gap-4">
          <Button asChild>
            <Link href="/">Return Home</Link>
          </Button>
          <Button variant="outline" onClick={() => window.history.back()}>
            Go Back
          </Button>
        </div>
      </div>

      {/* Weather-themed background decoration */}
      <div className="fixed inset-0 -z-10 pointer-events-none opacity-5">
        <div className="absolute top-10 left-10 w-16 h-16">☁️</div>
        <div className="absolute top-40 right-20 w-16 h-16">🌤️</div>
        <div className="absolute bottom-20 left-30 w-16 h-16">🌧️</div>
        <div className="absolute bottom-40 right-40 w-16 h-16">⛈️</div>
      </div>
    </div>
  );
}
