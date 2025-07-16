// Zustand store for managing global weather app state, including coordinates, weather data, UI state, and search state.
// Zustand is used for its minimal API, good performance, and ease of use in React apps.

import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { Coordinates, WeatherData } from '@/types/weather';
import { DEFAULT_COORDINATES } from '@/constants';

// WeatherState defines the shape of the global state managed by Zustand.
// It includes core weather data, UI flags, search state, and all actions to mutate state.
interface WeatherState {
  // Core state: stores the user's coordinates and fetched weather data.
  coordinates: Coordinates;
  weatherData: WeatherData | null;
  unit: 'metric' | 'imperial';

  // UI state: controls loading, error, dialogs, and selection flags.
  isLoading: boolean;
  error: string | null;
  showLocationDialog: boolean;
  isManualSelection: boolean;
  geolocationEnabled: boolean;
  hasInitialLoad: boolean;

  // Search state: manages search query, suggestions, and searching flag.
  searchQuery: string;
  citySuggestions: Array<{ name: string; country: string; lat: number; lon: number }>;
  isSearching: boolean;

  // Actions: functions to update state.
  setCoordinates: (coords: Coordinates) => void;
  setWeatherData: (data: WeatherData | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setLocationDialog: (show: boolean) => void;
  setManualSelection: (manual: boolean) => void;
  setGeolocationEnabled: (enabled: boolean) => void;
  setInitialLoad: (loaded: boolean) => void;
  setSearchQuery: (query: string) => void;
  setCitySuggestions: (
    suggestions: Array<{ name: string; country: string; lat: number; lon: number }>,
  ) => void;
  setSearching: (searching: boolean) => void;

  // Complex actions: logic for updating location, triggering geolocation, handling permissions, and resetting state.
  updateLocation: (lat: number, lon: number) => void;
  triggerCurrentLocation: () => void;
  handleLocationPermission: (allow: boolean) => void;
  reset: () => void;
}

// Initial state for the store, using default coordinates and empty values.
const initialState = {
  coordinates: DEFAULT_COORDINATES,
  weatherData: null,
  unit: 'metric' as const,
  isLoading: false,
  error: null,
  showLocationDialog: true,
  isManualSelection: false,
  geolocationEnabled: false,
  hasInitialLoad: false,
  searchQuery: '',
  citySuggestions: [],
  isSearching: false,
};

// Create the Zustand store with devtools and subscribeWithSelector for debugging and performance.
export const useWeatherStore = create<WeatherState>()(
  devtools(
    subscribeWithSelector((set, get) => ({
      ...initialState,

      // Simple setters for updating state fields.
      setCoordinates: (coords) => set({ coordinates: coords }),
      setWeatherData: (data) => set({ weatherData: data }),
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      setLocationDialog: (show) => set({ showLocationDialog: show }),
      setManualSelection: (manual) => set({ isManualSelection: manual }),
      setGeolocationEnabled: (enabled) => set({ geolocationEnabled: enabled }),
      setInitialLoad: (loaded) => set({ hasInitialLoad: loaded }),
      setSearchQuery: (query) => set({ searchQuery: query }),
      setCitySuggestions: (suggestions) => set({ citySuggestions: suggestions }),
      setSearching: (searching) => set({ isSearching: searching }),

      // updateLocation: updates coordinates only if they have changed, and sets manual selection.
      updateLocation: (lat, lon) => {
        const newCoords = { lat, lon };
        const current = get().coordinates;
        // Only update if coordinates actually changed (avoids unnecessary re-renders)
        if (
          Math.abs(current.lat - lat) > 0.000001 ||
          Math.abs(current.lon - lon) > 0.000001
        ) {
          set({
            coordinates: newCoords,
            isManualSelection: true,
            geolocationEnabled: false,
            hasInitialLoad: true,
            error: null,
          });
        }
      },

      // triggerCurrentLocation: enables geolocation and resets manual selection and search state.
      triggerCurrentLocation: () => {
        set({
          isManualSelection: false,
          geolocationEnabled: true,
          hasInitialLoad: true,
          searchQuery: '',
          citySuggestions: [],
          error: null,
        });
      },

      // handleLocationPermission: updates state based on user permission for geolocation.
      handleLocationPermission: (allow) => {
        set({
          showLocationDialog: false,
          geolocationEnabled: allow,
          isManualSelection: !allow,
          hasInitialLoad: true,
          coordinates: allow ? get().coordinates : DEFAULT_COORDINATES,
        });
      },

      // reset: resets the store to its initial state.
      reset: () => set(initialState),
    })),
    {
      name: 'weather-store', // Name for Redux DevTools
    },
  ),
);

// Selectors for accessing specific parts of the store for better performance and less re-rendering.
export const useCoordinates = () => useWeatherStore((state) => state.coordinates);
export const useWeatherData = () => useWeatherStore((state) => state.weatherData);
export const useLoading = () => useWeatherStore((state) => state.isLoading);
export const useError = () => useWeatherStore((state) => state.error);
export const useLocationDialog = () =>
  useWeatherStore((state) => state.showLocationDialog);
export const useManualSelection = () =>
  useWeatherStore((state) => state.isManualSelection);
export const useGeolocationEnabled = () =>
  useWeatherStore((state) => state.geolocationEnabled);
export const useInitialLoad = () => useWeatherStore((state) => state.hasInitialLoad);
export const useSearchQuery = () => useWeatherStore((state) => state.searchQuery);
export const useCitySuggestions = () => useWeatherStore((state) => state.citySuggestions);
export const useIsSearching = () => useWeatherStore((state) => state.isSearching);
