// useOptimizedWeather is a custom hook that manages fetching and caching weather data based on user coordinates.
// It combines geolocation, debouncing, abort controllers, and Zustand store for robust and efficient weather updates.

import React, { useEffect, useRef, useCallback } from 'react';
import {
  useWeatherStore,
  useCoordinates,
  useWeatherData,
  useLoading,
  useError,
} from '@/lib/store';
import { weatherAPI } from '@/lib/api';
import { useGeolocation } from './useGeolocation';

// Main hook for weather data fetching and state management
export const useOptimizedWeather = () => {
  // Selectors for relevant state from Zustand store
  const coordinates = useCoordinates();
  const weatherData = useWeatherData();
  const isLoading = useLoading();
  const error = useError();

  // Store actions for updating state
  const { setWeatherData, setLoading, setError, setCoordinates } = useWeatherStore();

  // Ref to manage aborting in-flight requests
  const abortControllerRef = useRef<AbortController | null>(null);
  // Ref to track if component is mounted (prevents state updates on unmount)
  const isMountedRef = useRef(true);

  // Geolocation hook: provides real-time user location if enabled
  const geolocation = useGeolocation({
    timeout: 5000,
    enabled: useWeatherStore.getState().geolocationEnabled,
  });

  // Debounced coordinates: prevents excessive API calls when coordinates change rapidly
  const debouncedCoordinates = useDebouncedCoordinates(coordinates, 300);

  // Fetch weather data from API, with abort and error handling
  const fetchWeatherData = useCallback(
    async (coords: { lat: number; lon: number }) => {
      if (!isMountedRef.current) return;

      // Cancel previous request if still in-flight
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller for this request
      abortControllerRef.current = new AbortController();
      setLoading(true);
      setError(null);

      try {
        const data = await weatherAPI.fetchWeatherData(
          coords.lat,
          coords.lon,
          abortControllerRef.current.signal,
        );

        // Only update state if still mounted and not aborted
        if (isMountedRef.current && !abortControllerRef.current.signal.aborted) {
          setWeatherData(data);
        }
      } catch (err) {
        if (isMountedRef.current && !abortControllerRef.current.signal.aborted) {
          setError(err instanceof Error ? err.message : 'Failed to fetch weather data');
          setWeatherData(null);
        }
      } finally {
        if (isMountedRef.current && !abortControllerRef.current.signal.aborted) {
          setLoading(false);
        }
      }
    },
    [setWeatherData, setLoading, setError],
  );

  // Effect: fetch weather data when debounced coordinates change and geolocation is not loading
  useEffect(() => {
    if (debouncedCoordinates && !geolocation.loading) {
      fetchWeatherData(debouncedCoordinates);
    }
  }, [debouncedCoordinates, geolocation.loading, fetchWeatherData]);

  // Effect: update coordinates from geolocation if permission is granted and not manually selected
  useEffect(() => {
    const { geolocationEnabled, isManualSelection } = useWeatherStore.getState();

    if (
      geolocationEnabled &&
      geolocation.hasPermission &&
      !isManualSelection &&
      geolocation.latitude &&
      geolocation.longitude
    ) {
      const newCoords = { lat: geolocation.latitude, lon: geolocation.longitude };
      const currentCoords = coordinates;

      // Only update if coordinates actually changed
      if (
        Math.abs(currentCoords.lat - newCoords.lat) > 0.000001 ||
        Math.abs(currentCoords.lon - newCoords.lon) > 0.000001
      ) {
        setCoordinates(newCoords);
      }
    }
  }, [
    geolocation.latitude,
    geolocation.longitude,
    geolocation.hasPermission,
    coordinates,
    setCoordinates,
  ]);

  // Cleanup: abort any in-flight requests and prevent state updates on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Return all relevant state and a refetch function for consumers
  return {
    weatherData,
    isLoading: isLoading || geolocation.loading,
    error: error || geolocation.error,
    coordinates,
    geolocation,
    refetch: () => fetchWeatherData(coordinates),
  };
};

// useDebouncedCoordinates: custom hook to debounce coordinate changes
// Prevents rapid API calls when user moves map or location updates quickly
const useDebouncedCoordinates = (
  coordinates: { lat: number; lon: number },
  delay: number,
) => {
  const [debouncedCoords, setDebouncedCoords] = React.useState(coordinates);
  const timeoutRef = React.useRef<NodeJS.Timeout | undefined>(undefined);

  React.useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setDebouncedCoords(coordinates);
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [coordinates, delay]);

  return debouncedCoords;
};
