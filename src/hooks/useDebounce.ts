// useDebounce is a custom React hook for debouncing rapidly changing values.
// It is used to delay updates (e.g., for search input) until the user stops typing, reducing unnecessary API calls or renders.

'use client';

import { useState, useEffect } from 'react';

/**
 * useDebounce
 * Returns a debounced version of the input value that only updates after the specified delay.
 *
 * @param value The value to debounce
 * @param delay The debounce delay in milliseconds
 * @returns The debounced value
 *
 * Why: Debouncing is useful for optimizing performance in scenarios like search inputs, where you want to avoid firing a request on every keystroke.
 */
export function useDebounce<T>(value: T, delay: number): T {
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
}
