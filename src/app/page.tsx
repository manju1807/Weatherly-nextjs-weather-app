// WeatherApp.tsx

'use client';

import { useGeolocation } from "@/hooks/useGeolocation";
import { useEffect, useState, useCallback } from "react";
import { WeatherData } from "@/types/weather";
import { fetchWeatherData } from "@/actions/weatherActions";
import NavBar from "@/components/views/navbar";
import WeatherDashboard from "@/components/views/dashboard";
import WeatherDashboardSkeleton from "@/components/views/dashboard-skeleton";

export default function WeatherApp() {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [coordinates, setCoordinates] = useState<{ lat: number; lon: number } | null>(null);
  const [isManualSelection, setIsManualSelection] = useState(false);
  const [unit, setUnit] = useState<'metric' | 'imperial'>('metric');

  const handleGeolocationSuccess = useCallback((position: GeolocationPosition) => {
    if (!isManualSelection) {
      console.log('Updating from geolocation');
      setCoordinates(prev => {
        const newLat = position.coords.latitude;
        const newLon = position.coords.longitude;
        if (!prev) return { lat: newLat, lon: newLon };

        const latDiff = Math.abs(prev.lat - newLat);
        const lonDiff = Math.abs(prev.lon - newLon);

        if (latDiff > 0.001 || lonDiff > 0.001) {
          return { lat: newLat, lon: newLon };
        }
        return prev;
      });
    }
  }, [isManualSelection]);

  const {
    loading: locationLoading
  } = useGeolocation({
    timeout: 5000,
    onSuccess: handleGeolocationSuccess,
    onError: () => {
      if (!isManualSelection) {
        console.log('Using Bangalore coordinates as fallback');
        setCoordinates({ lat: 12.9716, lon: 77.5946 });
      }
    },
  });

  const handleLocationChange = (lat: number, lon: number) => {
    console.log('Manual location change:', lat, lon);
    setIsManualSelection(true);
    setCoordinates({ lat, lon });
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!coordinates) return;

      try {
        setIsLoading(true);
        setError(null);
        console.log('Fetching weather for:', coordinates);
        const data = await fetchWeatherData(coordinates.lat, coordinates.lon);
        setWeatherData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch weather data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [coordinates]);

  const handleUseCurrentLocation = useCallback(() => {
    setIsManualSelection(false);
  }, []);

  const renderContent = () => {
    if (locationLoading && !isManualSelection) {
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
      return <WeatherDashboardSkeleton />
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
    </div>
  );
}