// useGeolocation is a custom React hook for accessing and tracking the user's geolocation in real time.
// It manages permission, error, and loading state, and provides up-to-date coordinates for the app.

'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { DEFAULT_COORDINATES } from '@/constants';

// GeolocationState defines the shape of the state managed by this hook.
interface GeolocationState {
  latitude: number;
  longitude: number;
  loading: boolean;
  error: string | null;
  hasPermission: boolean;
}

interface GeolocationOptions {
  timeout?: number;
  enabled?: boolean;
}

/**
 * useGeolocation
 * A custom hook that provides geolocation functionality with real-time updates
 * @param options Configuration options for the geolocation hook
 * @returns Current geolocation state including coordinates, loading status, and errors
 *
 * Why: This hook abstracts the browser's geolocation API, handles permission, errors, and updates,
 * and provides a simple interface for components to access the user's location.
 */
export function useGeolocation(options: GeolocationOptions = {}) {
  // Initialize state with default coordinates and loading status
  const [state, setState] = useState<GeolocationState>(() => ({
    latitude: DEFAULT_COORDINATES.lat,
    longitude: DEFAULT_COORDINATES.lon,
    loading: false, // Do not set loading to true on initial mount
    error: null,
    hasPermission: false,
  }));

  // Refs to store watch ID and component mount status
  const watchId = useRef<number | null>(null);
  const isMounted = useRef(true);

  // Handler for successful geolocation updates
  // Only updates state if coordinates have changed, to avoid unnecessary re-renders
  const handleSuccess = useCallback((position: GeolocationPosition) => {
    if (!isMounted.current) return;

    const { latitude, longitude } = position.coords;
    setState((prev) => {
      // Only update if coordinates actually changed
      if (
        Math.abs(prev.latitude - latitude) < 0.000001 &&
        Math.abs(prev.longitude - longitude) < 0.000001
      ) {
        return prev;
      }
      return {
        latitude,
        longitude,
        loading: false,
        error: null,
        hasPermission: true,
      };
    });
  }, []);

  // Handler for geolocation errors
  const handleError = useCallback((error: GeolocationPositionError) => {
    if (!isMounted.current) return;
    // If permission is denied or user turns off location, fallback to default location
    setState({
      latitude: DEFAULT_COORDINATES.lat,
      longitude: DEFAULT_COORDINATES.lon,
      loading: false,
      error: error.message,
      hasPermission: false,
    });
  }, []);

  // Effect: sets up geolocation listeners and cleans up on unmount or option change
  useEffect(() => {
    // Only run geolocation logic if enabled is true
    if (!options.enabled) {
      // If disabled, reset to default location and not loading
      setState((prev) => ({
        ...prev,
        latitude: DEFAULT_COORDINATES.lat,
        longitude: DEFAULT_COORDINATES.lon,
        loading: false,
        error: null,
        hasPermission: false,
      }));
      // Clean up any previous watch
      if (watchId.current !== null) {
        navigator.geolocation.clearWatch(watchId.current);
        watchId.current = null;
      }
      return;
    }

    // Check browser support for geolocation
    if (!navigator.geolocation) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: 'Geolocation is not supported by your browser',
        hasPermission: false,
      }));
      return;
    }

    // Configure geolocation options
    const geolocationOptions: PositionOptions = {
      enableHighAccuracy: true,
      timeout: options.timeout ?? 5000,
      maximumAge: 0,
    };

    // Set loading state while fetching position
    setState((prev) => ({ ...prev, loading: true }));

    try {
      // Get initial position (one-time)
      navigator.geolocation.getCurrentPosition(
        handleSuccess,
        handleError,
        geolocationOptions,
      );

      // Set up continuous position watching
      watchId.current = navigator.geolocation.watchPosition(
        handleSuccess,
        handleError,
        geolocationOptions,
      );
    } catch {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: 'Error setting up geolocation',
        hasPermission: false,
      }));
    }

    // Cleanup function to clear watch on unmount or options change
    return () => {
      if (watchId.current !== null) {
        navigator.geolocation.clearWatch(watchId.current);
        watchId.current = null;
      }
    };
  }, [options.enabled, options.timeout, handleSuccess, handleError]);

  // Effect: marks component as unmounted to prevent state updates after unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  return state;
}
