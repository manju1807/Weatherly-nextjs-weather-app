'use client';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useEffect, useState, useCallback, useRef, Suspense, lazy } from 'react';
import { WeatherData } from '@/types/weather';
import { fetchWeatherData } from '@/actions/weatherActions';
import NavBar from '@/components/views/navbar';
import WeatherDashboardSkeleton from '@/components/views/dashboard-skeleton';
import Footer from '@/components/views/footer';
import { ErrorBoundary } from 'react-error-boundary';

// Lazy load the WeatherDashboard component
const WeatherDashboard = lazy(() => import('@/components/views/dashboard'));

const DEFAULT_COORDINATES = {
  lat: 12.9762,
  lon: 77.6033,
};

// Error Fallback Component
function ErrorFallback({
  error,
  resetErrorBoundary,
}: {
  error: Error;
  resetErrorBoundary: () => void;
}) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center p-4 text-center"
    >
      <h2 className="text-lg font-semibold text-red-600">Something went wrong</h2>
      <p className="text-sm text-gray-600 mt-2">{error.message}</p>
      <button
        onClick={resetErrorBoundary}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        aria-label="Retry loading weather data"
      >
        Try again
      </button>
    </div>
  );
}

// Loading component with aria-live for accessibility
function LoadingIndicator({ message }: { message: string }) {
  return (
    <div
      className="flex items-center justify-center flex-1"
      role="status"
      aria-live="polite"
    >
      <p className="text-lg">{message}</p>
    </div>
  );
}

export default function WeatherApp() {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [coordinates, setCoordinates] = useState<{ lat: number; lon: number }>(
    DEFAULT_COORDINATES,
  );
  const [isManualSelection, setIsManualSelection] = useState(false);
  const [unit] = useState<'metric' | 'imperial'>('metric');
  const isMounted = useRef(true);
  const initialLoadDone = useRef(false);
  const fetchController = useRef<AbortController | null>(null);

  // Debounced coordinates update
  const debouncedCoordinates = useDebounce(coordinates, 500);

  const handleGeolocationSuccess = useCallback((position: GeolocationPosition) => {
    if (isMounted.current) {
      setCoordinates({
        lat: position.coords.latitude,
        lon: position.coords.longitude,
      });
    }
  }, []);

  const { loading: locationLoading } = useGeolocation({
    timeout: 5000,
    onSuccess: handleGeolocationSuccess,
    onError: () => {
      if (!isManualSelection && isMounted.current) {
        setCoordinates(DEFAULT_COORDINATES);
      }
    },
    enabled: !isManualSelection && !initialLoadDone.current,
  });

  const handleLocationChange = useCallback((lat: number, lon: number) => {
    setIsManualSelection(true);
    setCoordinates({ lat, lon });
  }, []);

  const handleUseCurrentLocation = useCallback(() => {
    setIsManualSelection(false);
    initialLoadDone.current = false;
  }, []);

  // Fetch weather data effect with debounced coordinates
  useEffect(() => {
    if (fetchController.current) {
      fetchController.current.abort();
    }

    fetchController.current = new AbortController();
    const currentController = fetchController.current;

    const fetchData = async () => {
      if (!debouncedCoordinates) return;
      setIsLoading(true);

      try {
        const data = await fetchWeatherData(
          debouncedCoordinates.lat,
          debouncedCoordinates.lon,
        );

        if (currentController.signal.aborted) return;

        setWeatherData(data);
        setError(null);
      } catch (err) {
        if (currentController.signal.aborted) return;

        console.error('Error fetching weather data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch weather data');
        setWeatherData(null);
      } finally {
        if (!currentController.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      currentController.abort();
    };
  }, [debouncedCoordinates]);

  useEffect(() => {
    return () => {
      if (fetchController.current) {
        fetchController.current.abort();
      }
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    initialLoadDone.current = true;
  }, [coordinates]);

  const renderContent = () => {
    if (locationLoading && !isManualSelection && !initialLoadDone.current) {
      return <LoadingIndicator message="Getting location..." />;
    }

    if (error) {
      return (
        <div
          className="flex items-center justify-center flex-1"
          role="alert"
          aria-live="assertive"
        >
          <p className="text-red-500">{error}</p>
        </div>
      );
    }

    if (!weatherData) {
      return <WeatherDashboardSkeleton />;
    }

    return (
      <Suspense fallback={<WeatherDashboardSkeleton />}>
        <WeatherDashboard weatherData={weatherData} unit={unit} />
      </Suspense>
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      <ErrorBoundary
        FallbackComponent={ErrorFallback}
        onReset={() => {
          setError(null);
          handleUseCurrentLocation();
        }}
      >
        <NavBar
          onLocationChange={handleLocationChange}
          onUseCurrentLocation={handleUseCurrentLocation}
          isUsingCurrentLocation={!isManualSelection}
        />
        {renderContent()}
        <Footer />
      </ErrorBoundary>
    </div>
  );
}

// Custom debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
