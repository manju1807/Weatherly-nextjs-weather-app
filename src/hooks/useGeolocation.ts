// useGeolocation.ts
import { useState, useEffect, useRef } from 'react';

const DEFAULT_COORDINATES = {
  latitude: 12.9716,
  longitude: 77.5946,
};

interface GeolocationState {
  latitude: number;
  longitude: number;
  loading: boolean;
}

interface GeolocationOptions {
  timeout?: number;
  onSuccess?: (position: GeolocationPosition) => void;
  onError?: () => void;
  enabled?: boolean; // New prop to control whether geolocation is active
}

export function useGeolocation(options: GeolocationOptions = {}) {
  const [state, setState] = useState<GeolocationState>({
    latitude: DEFAULT_COORDINATES.latitude,
    longitude: DEFAULT_COORDINATES.longitude,
    loading: options.enabled ?? true,
  });

  const watchId = useRef<number | null>(null);

  useEffect(() => {
    // If geolocation is disabled, clean up and return
    if (!options.enabled) {
      if (watchId.current !== null) {
        navigator.geolocation.clearWatch(watchId.current);
        watchId.current = null;
      }
      return;
    }

    if (!navigator.geolocation) {
      setState((prev) => ({
        ...prev,
        loading: false,
      }));
      if (options.onError) {
        options.onError();
      }
      return;
    }

    const handleSuccess = (position: GeolocationPosition) => {
      setState({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        loading: false,
      });

      if (options.onSuccess) {
        options.onSuccess(position);
      }
    };

    const handleError = () => {
      setState((prev) => ({
        ...prev,
        loading: false,
      }));

      if (options.onError) {
        options.onError();
      }
    };

    const geolocationOptions: PositionOptions = {
      enableHighAccuracy: true,
      timeout: options.timeout ?? 5000,
      maximumAge: 0,
    };

    watchId.current = navigator.geolocation.watchPosition(
      handleSuccess,
      handleError,
      geolocationOptions,
    );

    // Cleanup function
    return () => {
      if (watchId.current !== null) {
        navigator.geolocation.clearWatch(watchId.current);
        watchId.current = null;
      }
    };
  }, [options.enabled]); // Now depends on enabled prop

  return state;
}
