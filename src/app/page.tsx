'use client';

import { useGeolocation } from '@/hooks/useGeolocation';
import { useEffect, useState, useCallback, useRef, Suspense, lazy, useMemo } from 'react';
import { WeatherData, DEFAULT_COORDINATES } from '@/types/weather';
import { fetchWeatherData } from '@/actions/weatherActions';
import NavBar from '@/components/views/navbar';
import WeatherDashboardSkeleton from '@/components/views/dashboard-skeleton';
import Footer from '@/components/views/footer';
import { ErrorBoundary } from 'react-error-boundary';
import LocationPermissionDialog from '@/components/views/location-dialog';

// Lazy load the WeatherDashboard component
const WeatherDashboard = lazy(() => import('@/components/views/dashboard'));

// Utility function to compare coordinates
const areCoordinatesEqual = (
  prev: { lat: number; lon: number },
  next: { lat: number; lon: number },
): boolean => {
  return (
    Math.abs(prev.lat - next.lat) < 0.000001 && Math.abs(prev.lon - next.lon) < 0.000001
  );
};

// Custom hook for debounced coordinates with equality check
function useDebounceWithComparison<T>(
  value: T,
  delay: number,
  compareFunc: (prev: T, next: T) => boolean,
): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  const previousValue = useRef(value);

  useEffect(() => {
    if (!compareFunc(previousValue.current, value)) {
      const handler = setTimeout(() => {
        setDebouncedValue(value);
        previousValue.current = value;
      }, delay);

      return () => {
        clearTimeout(handler);
      };
    }
  }, [value, delay, compareFunc]);

  return debouncedValue;
}

// Error Fallback component
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
      >
        Try again
      </button>
    </div>
  );
}

export default function WeatherApp() {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [coordinates, setCoordinates] = useState(DEFAULT_COORDINATES);
  const [isManualSelection, setIsManualSelection] = useState(false);
  const [unit] = useState<'metric' | 'imperial'>('metric');
  const [showLocationDialog, setShowLocationDialog] = useState(true);
  const [geolocationEnabled, setGeolocationEnabled] = useState(false);
  const isMounted = useRef(true);
  const fetchController = useRef<AbortController | null>(null);
  const hasInitialLoad = useRef(false);

  // Memoize coordinates comparison function
  const compareCoordinates = useCallback(areCoordinatesEqual, []);

  // Use custom debounce hook with coordinates comparison
  const debouncedCoordinates = useDebounceWithComparison(
    coordinates,
    500,
    compareCoordinates,
  );

  const {
    latitude,
    longitude,
    loading: locationLoading,
    hasPermission,
  } = useGeolocation({
    timeout: 1000,
    enabled: geolocationEnabled,
  });

  // Memoize new coordinates to prevent unnecessary updates
  const newCoordinates = useMemo(
    () => ({ lat: latitude, lon: longitude }),
    [latitude, longitude],
  );

  // Update coordinates only when geolocation values actually change
  useEffect(() => {
    if (
      geolocationEnabled &&
      hasPermission &&
      !isManualSelection &&
      !areCoordinatesEqual(coordinates, newCoordinates)
    ) {
      setCoordinates(newCoordinates);
      hasInitialLoad.current = true;
    }
  }, [geolocationEnabled, hasPermission, isManualSelection, newCoordinates, coordinates]);

  const handleLocationChange = useCallback(
    (lat: number, lon: number) => {
      const newCoords = { lat, lon };
      if (!areCoordinatesEqual(coordinates, newCoords)) {
        setIsManualSelection(true);
        setGeolocationEnabled(false);
        setCoordinates(newCoords);
        hasInitialLoad.current = true;
      }
    },
    [coordinates],
  );

  const handleUseCurrentLocation = useCallback(() => {
    setIsManualSelection(false);
    setGeolocationEnabled(true);
  }, []);

  const handleAllowLocation = useCallback(() => {
    setShowLocationDialog(false);
    setGeolocationEnabled(true);
  }, []);

  const handleDenyLocation = useCallback(() => {
    setShowLocationDialog(false);
    setGeolocationEnabled(false);
    setIsManualSelection(true);
    setCoordinates(DEFAULT_COORDINATES);
    hasInitialLoad.current = true;
  }, []);

  // Effect for fetching weather data with debounced coordinates
  useEffect(() => {
    if (!debouncedCoordinates || (locationLoading && !hasInitialLoad.current)) return;

    if (fetchController.current) {
      fetchController.current.abort();
    }

    fetchController.current = new AbortController();
    const currentController = fetchController.current;

    const fetchData = async () => {
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
  }, [debouncedCoordinates, locationLoading]);

  useEffect(() => {
    return () => {
      isMounted.current = false;
      if (fetchController.current) {
        fetchController.current.abort();
      }
    };
  }, []);

  const renderContent = useCallback(() => {
    if (showLocationDialog) {
      return <WeatherDashboardSkeleton />;
    }

    if (!isManualSelection && locationLoading && !hasInitialLoad.current) {
      return <WeatherDashboardSkeleton />;
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

    if (!weatherData || isLoading) {
      return <WeatherDashboardSkeleton />;
    }

    return (
      <Suspense fallback={<WeatherDashboardSkeleton />}>
        <WeatherDashboard weatherData={weatherData} unit={unit} />
      </Suspense>
    );
  }, [
    showLocationDialog,
    isManualSelection,
    locationLoading,
    error,
    weatherData,
    isLoading,
    unit,
  ]);

  return (
    <div className="min-h-screen flex flex-col">
      <LocationPermissionDialog
        open={showLocationDialog}
        onOpenChange={setShowLocationDialog}
        onAllowLocation={handleAllowLocation}
        onDenyLocation={handleDenyLocation}
      />
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
