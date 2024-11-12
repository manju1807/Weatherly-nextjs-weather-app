'use client';

import { useGeolocation } from '@/hooks/useGeolocation';
import { useEffect, useState, useCallback, useRef, Suspense, lazy } from 'react';
import { WeatherData, DEFAULT_COORDINATES } from '@/types/weather';
import { fetchWeatherData } from '@/actions/weatherActions';
import NavBar from '@/components/views/navbar';
import WeatherDashboardSkeleton from '@/components/views/dashboard-skeleton';
import Footer from '@/components/views/footer';
import { ErrorBoundary } from 'react-error-boundary';
import LocationPermissionDialog from '@/components/views/location-dialog';

// Lazy load the WeatherDashboard component for better initial load performance
const WeatherDashboard = lazy(() => import('@/components/views/dashboard'));

/**
 * Error Fallback component displayed when an error occurs in the application
 */
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

/**
 * Loading indicator component with accessibility support
 */
function LoadingIndicator({ message }: { message: string }) {
  return (
    <div className="flex-1">
      <WeatherDashboardSkeleton />
      <div
        className="absolute inset-0 flex items-center justify-center bg-black/5"
        role="status"
        aria-live="polite"
      >
        <p className="text-lg font-medium text-gray-700">{message}</p>
      </div>
    </div>
  );
}

/**
 * Custom hook for debouncing values to prevent excessive API calls
 */
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

/**
 * Main WeatherApp component that handles weather data fetching and display
 */
export default function WeatherApp() {
  // State management for weather data and UI control
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [coordinates, setCoordinates] = useState(DEFAULT_COORDINATES);
  const [isManualSelection, setIsManualSelection] = useState(false);
  const [unit] = useState<'metric' | 'imperial'>('metric');
  const [showLocationDialog, setShowLocationDialog] = useState(true);
  const [geolocationEnabled, setGeolocationEnabled] = useState(false);

  // Refs for component lifecycle and API call management
  const isMounted = useRef(true);
  const fetchController = useRef<AbortController | null>(null);
  const hasInitialLoad = useRef(false);

  // Debounce coordinates changes to prevent rapid API calls
  const debouncedCoordinates = useDebounce(coordinates, 500);

  // Get user's location using the geolocation hook
  const {
    latitude,
    longitude,
    loading: locationLoading,
    hasPermission,
  } = useGeolocation({
    timeout: 1000,
    enabled: geolocationEnabled,
  });

  // Update coordinates when geolocation values change
  useEffect(() => {
    if (
      geolocationEnabled &&
      hasPermission &&
      latitude &&
      longitude &&
      !isManualSelection
    ) {
      setCoordinates({
        lat: latitude,
        lon: longitude,
      });
      hasInitialLoad.current = true;
    }
  }, [latitude, longitude, geolocationEnabled, isManualSelection, hasPermission]);

  // Handler for manual location selection
  const handleLocationChange = useCallback((lat: number, lon: number) => {
    setIsManualSelection(true);
    setGeolocationEnabled(false);
    setCoordinates({ lat, lon });
    hasInitialLoad.current = true;
  }, []);

  // Handler for using current location
  const handleUseCurrentLocation = useCallback(() => {
    setIsManualSelection(false);
    setGeolocationEnabled(true);
  }, []);

  // Handlers for location permission dialog
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

  // Effect for fetching weather data with proper cleanup
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

  // Cleanup effect
  useEffect(() => {
    return () => {
      isMounted.current = false;
      if (fetchController.current) {
        fetchController.current.abort();
      }
    };
  }, []);

  // Render appropriate content based on current state
  const renderContent = () => {
    if (showLocationDialog) {
      return <WeatherDashboardSkeleton />;
    }

    if (!isManualSelection && locationLoading && !hasInitialLoad.current) {
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

    if (!weatherData || isLoading) {
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
