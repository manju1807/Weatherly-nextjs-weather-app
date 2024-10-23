'use client';
import { memo } from 'react';
import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

// Weather emoji backgrounds with proper aria labels
const WEATHER_BACKGROUNDS = [
  { emoji: '☁️', label: 'Cloud', position: 'top-10 left-10' },
  { emoji: '🌤️', label: 'Sun behind cloud', position: 'top-40 right-20' },
  { emoji: '🌧️', label: 'Rain cloud', position: 'bottom-20 left-30' },
  { emoji: '⛈️', label: 'Storm cloud', position: 'bottom-40 right-40' },
] as const;

const WeatherBackground = memo(() => (
  <div className="fixed inset-0 -z-10 pointer-events-none opacity-5" aria-hidden="true">
    {WEATHER_BACKGROUNDS.map(({ emoji, label, position }, index) => (
      <div
        key={label}
        className={`absolute w-16 h-16 ${position} animate-float`}
        style={{
          animationDelay: `${index * 0.5}s`,
          animationDuration: '3s',
        }}
        role="presentation"
        aria-hidden="true"
      >
        <span aria-label={label}>{emoji}</span>
      </div>
    ))}
  </div>
));

WeatherBackground.displayName = 'WeatherBackground';

export default function NotFound() {
  const router = useRouter();

  const handleGoBack = () => {
    try {
      window.history.back();
    } catch (error) {
      // Fallback to home if history is not available
      router.push('/');
    }
  };

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center p-4 bg-background"
      role="main"
      aria-labelledby="error-title"
    >
      <div className="text-center space-y-6 animate-fade-in">
        <div className="flex justify-center" role="presentation" aria-hidden="true">
          <AlertTriangle
            className="h-24 w-24 text-yellow-500 animate-pulse"
            aria-hidden="true"
          />
        </div>

        <div className="space-y-2">
          <h1 id="error-title" className="text-4xl font-bold text-primary" tabIndex={-1}>
            404
          </h1>
          <h2 className="text-2xl font-semibold text-foreground">Page Not Found</h2>
        </div>

        <p className="text-muted-foreground max-w-md mx-auto">
          Oops! The weather seems unpredictable here. The page you&apos;re looking for
          doesn&apos;t exist or has been moved to a different location.
        </p>

        <div
          className="flex flex-col sm:flex-row justify-center gap-4"
          role="navigation"
          aria-label="Error page navigation"
        >
          <Button asChild>
            <Link href="/" className="min-w-[120px]" aria-label="Return to homepage">
              Return Home
            </Link>
          </Button>
          <Button
            variant="outline"
            onClick={handleGoBack}
            className="min-w-[120px]"
            aria-label="Go back to previous page"
          >
            Go Back
          </Button>
        </div>
      </div>

      <WeatherBackground />

      {/* Add keyboard trap for focus management */}
      <div tabIndex={0} className="sr-only" aria-hidden="true">
        End of content
      </div>
    </main>
  );
}
