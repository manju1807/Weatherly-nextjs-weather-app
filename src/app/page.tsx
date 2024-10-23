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

export default function WeatherApp() {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [coordinates, setCoordinates] = useState<{ lat: number; lon: number } | null>(
    null,
  );
  const [isManualSelection, setIsManualSelection] = useState(false);
  const [unit] = useState<'metric' | 'imperial'>('metric');
  const isMounted = useRef(true);

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
      if (!isManualSelection && isMounted.current && !coordinates) {
        setCoordinates({ lat: 12.9716, lon: 77.5946 });
      }
    },
    enabled: !isManualSelection, // Only enable geolocation when not manually selected
  });

  const handleLocationChange = (lat: number, lon: number) => {
    setIsManualSelection(true);
    setCoordinates({ lat, lon });
  };

  const handleUseCurrentLocation = useCallback(() => {
    setIsManualSelection(false);
    setCoordinates(null); // Reset coordinates to trigger geolocation
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!coordinates || !isMounted.current) return;

      try {
        setIsLoading(true);
        setError(null);
        const data = await fetchWeatherData(coordinates.lat, coordinates.lon);
        if (isMounted.current) {
          setWeatherData(data);
        }
      } catch (err) {
        if (isMounted.current) {
          setError(err instanceof Error ? err.message : 'Failed to fetch weather data');
        }
      } finally {
        if (isMounted.current) {
          setIsLoading(false);
        }
      }
    };

    fetchData();
  }, [coordinates]);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const renderContent = () => {
    if (locationLoading && !isManualSelection && !coordinates) {
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
    if (isLoading || !weatherData) {
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
