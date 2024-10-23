import { useState, useEffect } from 'react';

// Bangalore's default coordinates
const BANGALORE_COORDINATES = {
  latitude: 12.9716,
  longitude: 77.5946,
  city: 'Bangalore',
  country: 'IN',
};

interface GeolocationState {
  latitude: number;
  longitude: number;
  accuracy: number | null;
  error: string | null;
  loading: boolean;
  isDefaultLocation: boolean;
  city?: string;
  country?: string;
}

interface GeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  onSuccess?: (position: GeolocationPosition) => void;
  onError?: (error: GeolocationPositionError) => void;
}

export function useGeolocation(options: GeolocationOptions = {}) {
  const [state, setState] = useState<GeolocationState>({
    latitude: BANGALORE_COORDINATES.latitude,
    longitude: BANGALORE_COORDINATES.longitude,
    accuracy: null,
    error: null,
    loading: true,
    isDefaultLocation: true,
    city: BANGALORE_COORDINATES.city,
    country: BANGALORE_COORDINATES.country,
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setState((prev) => ({
        ...prev,
        error: 'Geolocation is not supported. Using default location (Bangalore).',
        loading: false,
      }));
      return;
    }

    const handleSuccess = (position: GeolocationPosition) => {
      setState({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        error: null,
        loading: false,
        isDefaultLocation: false,
        city: undefined, // Clear default city
        country: undefined, // Clear default country
      });

      if (options.onSuccess) {
        options.onSuccess(position);
      }
    };

    const handleError = (error: GeolocationPositionError) => {
      const errorMessage = getGeolocationErrorMessage(error);
      setState((prev) => ({
        ...BANGALORE_COORDINATES,
        accuracy: null,
        error: `${errorMessage} Using default location (Bangalore).`,
        loading: false,
        isDefaultLocation: true,
      }));

      if (options.onError) {
        options.onError(error);
      }
    };

    const geolocationOptions: PositionOptions = {
      enableHighAccuracy: options.enableHighAccuracy ?? true,
      timeout: options.timeout ?? 5000,
      maximumAge: options.maximumAge ?? 0,
    };

    const watchId = navigator.geolocation.watchPosition(
      handleSuccess,
      handleError,
      geolocationOptions,
    );

    // Cleanup function to remove the watcher
    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, []); // Empty dependency array since we want this to run once on mount

  // Function to manually retry getting location
  const retry = () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          error: null,
          loading: false,
          isDefaultLocation: false,
          city: undefined,
          country: undefined,
        });
      },
      (error) => {
        const errorMessage = getGeolocationErrorMessage(error);
        setState((prev) => ({
          ...BANGALORE_COORDINATES,
          accuracy: null,
          error: `${errorMessage} Using default location (Bangalore).`,
          loading: false,
          isDefaultLocation: true,
        }));
      },
      {
        enableHighAccuracy: options.enableHighAccuracy ?? true,
        timeout: options.timeout ?? 5000,
        maximumAge: 0,
      },
    );
  };

  return {
    ...state,
    retry,
  };
}

// Helper function to get user-friendly error messages
function getGeolocationErrorMessage(error: GeolocationPositionError): string {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      return 'Location access denied.';
    case error.POSITION_UNAVAILABLE:
      return 'Location information unavailable.';
    case error.TIMEOUT:
      return 'Location request timed out.';
    default:
      return 'An unknown error occurred while fetching location.';
  }
}
