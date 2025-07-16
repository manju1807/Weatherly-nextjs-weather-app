// performance.ts provides utilities for monitoring and tracking app performance, including layout shifts, long tasks, and network timing.
// It also includes a React HOC for tracking component render times.

import React from 'react';

// LayoutShift interface for tracking layout shift values
interface LayoutShift {
  value: number;
}

// PerformanceMonitor: Singleton class for setting up performance observers and recording metrics
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number[]> = new Map();
  private observers: Map<string, PerformanceObserver> = new Map();

  private constructor() {
    this.setupObservers();
  }

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  private setupObservers(): void {
    // Monitor long tasks
    if ('PerformanceObserver' in window) {
      const longTaskObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          console.warn('Long task detected:', entry);
        }
      });
      longTaskObserver.observe({ entryTypes: ['longtask'] });
      this.observers.set('longtask', longTaskObserver);

      // Monitor layout shifts
      const layoutShiftObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const layoutShift = entry as unknown as LayoutShift;
          if (layoutShift.value > 0.1) {
            console.warn('Layout shift detected:', layoutShift);
          }
        }
      });
      layoutShiftObserver.observe({ entryTypes: ['layout-shift'] });
      this.observers.set('layout-shift', layoutShiftObserver);
    }
  }

  // Measure function execution time
  measureFunction<T>(name: string, fn: () => T): T {
    const start = performance.now();
    try {
      return fn();
    } finally {
      const duration = performance.now() - start;
      this.recordMetric(name, duration);
    }
  }

  // Measure async function execution time
  async measureAsyncFunction<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now();
    try {
      return await fn();
    } finally {
      const duration = performance.now() - start;
      this.recordMetric(name, duration);
    }
  }

  // Record a performance metric
  recordMetric(name: string, value: number): void {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    this.metrics.get(name)?.push(value);
  }

  // Get performance statistics
  getStats(
    name: string,
  ): { avg: number; min: number; max: number; count: number } | null {
    const values = this.metrics.get(name);
    if (!values || values.length === 0) return null;

    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);
    const count = values.length;

    return { avg, min, max, count };
  }

  // Get all performance statistics
  getAllStats(): Record<
    string,
    { avg: number; min: number; max: number; count: number }
  > {
    const stats: Record<
      string,
      { avg: number; min: number; max: number; count: number }
    > = {};
    for (const [name] of this.metrics) {
      const stat = this.getStats(name);
      if (stat) {
        stats[name] = stat;
      }
    }
    return stats;
  }

  // Clear metrics
  clearMetrics(): void {
    this.metrics.clear();
  }

  // Dispose observers
  dispose(): void {
    for (const observer of this.observers.values()) {
      observer.disconnect();
    }
    this.observers.clear();
  }
}

// React performance utilities
export const withPerformanceTracking = <P extends object>(
  Component: React.ComponentType<P>,
  name: string,
): React.ComponentType<P> => {
  const WrappedComponent = React.memo((props: P) => {
    const renderStart = React.useRef(performance.now());

    React.useEffect(() => {
      const renderTime = performance.now() - renderStart.current;
      PerformanceMonitor.getInstance().recordMetric(`${name}-render`, renderTime);
    });

    return React.createElement(Component, props);
  });

  WrappedComponent.displayName = `withPerformanceTracking(${name})`;
  return WrappedComponent;
};

// Debounce utility with performance tracking
export const debounceWithTracking = <T extends (...args: unknown[]) => unknown>(
  func: T,
  delay: number,
  name: string,
): T => {
  let timeoutId: NodeJS.Timeout;

  return ((...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      PerformanceMonitor.getInstance().measureFunction(name, () => func(...args));
    }, delay);
  }) as T;
};

// Throttle utility with performance tracking
export const throttleWithTracking = <T extends (...args: unknown[]) => unknown>(
  func: T,
  delay: number,
  name: string,
): T => {
  let lastCall = 0;

  return ((...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      PerformanceMonitor.getInstance().measureFunction(name, () => func(...args));
    }
  }) as T;
};

// Memory usage monitoring
interface PerformanceMemory {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

export const getMemoryUsage = (): {
  used: number;
  total: number;
  percentage: number;
} | null => {
  if ('memory' in performance) {
    const memory = (performance as { memory: PerformanceMemory }).memory;
    return {
      used: memory.usedJSHeapSize,
      total: memory.totalJSHeapSize,
      percentage: (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100,
    };
  }
  return null;
};

// Network performance monitoring
export const measureNetworkPerformance = async (
  url: string,
): Promise<{
  dns: number;
  tcp: number;
  request: number;
  response: number;
  total: number;
}> => {
  const start = performance.now();

  try {
    await fetch(url);
    const end = performance.now();

    // This is a simplified measurement - in a real app you'd use Resource Timing API
    return {
      dns: 0, // Would need Resource Timing API for accurate measurement
      tcp: 0,
      request: 0,
      response: end - start,
      total: end - start,
    };
  } catch (error) {
    throw new Error(`Failed to measure network performance: ${error}`);
  }
};

// Export singleton instance
export const performanceMonitor = PerformanceMonitor.getInstance();
