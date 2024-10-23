// WeatherApp.tsx
'use client';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useEffect, useState, useCallback, useRef } from 'react';
import { WeatherData } from '@/types/weather';
import { fetchWeatherData } from '@/actions/weatherActions';
import NavBar from '@/components/views/navbar';
import WeatherDashboard from '@/components/views/dashboard';
import WeatherDashboardSkeleton from '@/components/views/dashboard-skeleton';
import Footer from '@/components/views/footer';

const DEFAULT_COORDINATES = {
  lat: 12.9762,
  lon: 77.6033,
};

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

  const handleLocationChange = (lat: number, lon: number) => {
    setIsManualSelection(true);
    setCoordinates({ lat, lon });
  };

  const handleUseCurrentLocation = useCallback(() => {
    setIsManualSelection(false);
    initialLoadDone.current = false;
  }, []);

  // Fetch weather data effect
  useEffect(() => {
    // Abort previous fetch if it exists
    if (fetchController.current) {
      fetchController.current.abort();
    }

    // Create new abort controller for this fetch
    fetchController.current = new AbortController();
    const currentController = fetchController.current;

    const fetchData = async () => {
      if (!coordinates) return;
      setIsLoading(true);

      try {
        const data = await fetchWeatherData(coordinates.lat, coordinates.lon);

        // Check if this fetch is still relevant
        if (currentController.signal.aborted) {
          return;
        }

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

    // Cleanup function
    return () => {
      currentController.abort();
    };
  }, [coordinates]);

  // Component cleanup
  useEffect(() => {
    return () => {
      if (fetchController.current) {
        fetchController.current.abort();
      }
      isMounted.current = false;
    };
  }, []);

  // Coordinates update logging
  useEffect(() => {
    initialLoadDone.current = true;
  }, [coordinates]);

  const renderContent = () => {
    if (locationLoading && !isManualSelection && !initialLoadDone.current) {
      return (
        <div className="flex items-center justify-center flex-1">
          <p className="text-lg">Getting location...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center flex-1">
          <p className="text-red-500">{error}</p>
        </div>
      );
    }

    if (!weatherData) {
      return <WeatherDashboardSkeleton />;
    }

    return <WeatherDashboard weatherData={weatherData} unit={unit} />;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar
        onLocationChange={handleLocationChange}
        onUseCurrentLocation={handleUseCurrentLocation}
        isUsingCurrentLocation={!isManualSelection}
      />
      {renderContent()}
      <Footer />
    </div>
  );
}
