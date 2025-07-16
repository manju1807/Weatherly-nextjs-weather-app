// useOptimizedSearch is a custom hook for searching cities with debounce, caching, abort control, and keyboard navigation.
// It manages search state, suggestions, and error handling for a responsive search experience.

import { useEffect, useRef, useCallback, useState } from 'react';
import {
  useWeatherStore,
  useSearchQuery,
  useCitySuggestions,
  useIsSearching,
} from '@/lib/store';
import { weatherAPI } from '@/lib/api';
import { City } from '@/types/weather';

// SearchCache: LRU-like cache for city search results to reduce API calls and improve performance.
class SearchCache {
  private cache = new Map<string, { data: City[]; timestamp: number }>();
  private maxSize = 50;
  private ttl = 5 * 60 * 1000; // 5 minutes

  // Store a new result in the cache, evicting the oldest if full.
  set(key: string, value: City[]): void {
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }
    this.cache.set(key, { data: value, timestamp: Date.now() });
  }

  // Retrieve a cached result if not expired.
  get(key: string): City[] | null {
    const item = this.cache.get(key);
    if (!item) return null;
    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }
    return item.data;
  }

  // Clear the cache.
  clear(): void {
    this.cache.clear();
  }

  // Get cache stats for debugging.
  getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

const searchCache = new SearchCache();

// Main hook for optimized city search
export const useOptimizedSearch = () => {
  // Selectors for search state from Zustand store
  const searchQuery = useSearchQuery();
  const citySuggestions = useCitySuggestions();
  const isSearching = useIsSearching();
  const { setSearchQuery, setCitySuggestions, setSearching } = useWeatherStore();

  // Ref for aborting in-flight search requests
  const abortControllerRef = useRef<AbortController | null>(null);
  // Ref to track if component is mounted
  const isMountedRef = useRef(true);
  // Local error state for search errors
  const [error, setError] = useState<string | null>(null);

  // Debounced query: reduces API calls for fast typers
  const debouncedQuery = useDebounce(searchQuery, 150);

  // Search function: fetches city suggestions, uses cache, and handles aborts/errors
  const performSearch = useCallback(
    async (query: string) => {
      if (!isMountedRef.current) return;
      // Cancel previous request if still in-flight
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();
      // Check cache first
      const cached = searchCache.get(query);
      if (cached) {
        setCitySuggestions(cached);
        setError(null);
        return;
      }
      // Minimum query length for search
      if (query.length < 3) {
        setCitySuggestions([]);
        setError(null);
        return;
      }
      setSearching(true);
      setError(null);
      try {
        const cities = await weatherAPI.searchCities(
          query,
          abortControllerRef.current.signal,
        );
        if (isMountedRef.current && !abortControllerRef.current.signal.aborted) {
          // Cache the results
          searchCache.set(query, cities);
          setCitySuggestions(cities);
          setError(null);
        }
      } catch (err) {
        if (isMountedRef.current && !abortControllerRef.current.signal.aborted) {
          console.error('Search error:', err);
          setError(err instanceof Error ? err.message : 'Failed to search cities');
          setCitySuggestions([]);
        }
      } finally {
        if (isMountedRef.current && !abortControllerRef.current.signal.aborted) {
          setSearching(false);
        }
      }
    },
    [setCitySuggestions, setSearching],
  );

  // Effect: perform search when debounced query changes
  useEffect(() => {
    performSearch(debouncedQuery);
  }, [debouncedQuery, performSearch]);

  // Cleanup: abort in-flight requests and prevent state updates on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Keyboard navigation for search suggestions
  const [selectedIndex, setSelectedIndex] = useState(-1);

  // Handles keyboard events for navigating and selecting suggestions
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < citySuggestions.length - 1 ? prev + 1 : prev,
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
          break;
        case 'Enter':
          e.preventDefault();
          if (selectedIndex >= 0 && citySuggestions[selectedIndex]) {
            const city = citySuggestions[selectedIndex];
            useWeatherStore.getState().updateLocation(city.lat, city.lon);
            setSearchQuery(`${city.name}, ${city.country}`);
            setSelectedIndex(-1);
          }
          break;
        case 'Escape':
          e.preventDefault();
          setSelectedIndex(-1);
          setSearchQuery('');
          break;
      }
    },
    [citySuggestions, selectedIndex, setSearchQuery],
  );

  // Handles city selection from suggestions
  const handleCitySelect = useCallback(
    (city: City) => {
      useWeatherStore.getState().updateLocation(city.lat, city.lon);
      setSearchQuery(`${city.name}, ${city.country}`);
      setSelectedIndex(-1);
      setError(null);
    },
    [setSearchQuery],
  );

  // Clears the search input and suggestions
  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setCitySuggestions([]);
    setSelectedIndex(-1);
    setError(null);
  }, [setSearchQuery, setCitySuggestions]);

  // Return all relevant state and handlers for search UI
  return {
    searchQuery,
    citySuggestions,
    isSearching,
    error,
    selectedIndex,
    setSelectedIndex,
    handleKeyDown,
    handleCitySelect,
    clearSearch,
    setSearchQuery,
  };
};

// Optimized debounce hook
const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};
