'use client';

import { Suspense, lazy, useMemo, useState, useEffect } from 'react';
import WeatherDashboardSkeleton from '@/components/views/dashboard-skeleton';
import Footer from '@/components/views/footer';
import { ErrorBoundary } from 'react-error-boundary';
import LocationPermissionDialog from '@/components/views/location-dialog';
import { useOptimizedWeather } from '@/hooks/useOptimizedWeather';
import { ErrorFallback } from '@/components/error-fallback';
import { AnimatePresence, motion } from 'framer-motion';
import { useWeatherStore } from '@/lib/store';

// Lazy loaded component
const WeatherDashboard = lazy(() => import('@/components/views/dashboard'));

// WeatherApp is the main page component for the weather application.
// It manages state, handles loading and error boundaries, and renders the dashboard or skeleton as appropriate.
export default function WeatherApp() {
  const unit = 'metric' as const;

  // Use the optimized store and hooks
  const {
    showLocationDialog,
    setLocationDialog,
    triggerCurrentLocation, // This is a store action, not a hook. Linter may warn due to naming.
    handleLocationPermission,
    reset,
  } = useWeatherStore();

  const { weatherData, error, isLoading } = useOptimizedWeather();

  // Add a local state to control skeleton exit delay
  const [showSkeleton, setShowSkeleton] = useState(true);

  // Show skeleton while loading weather data
  useEffect(() => {
    if (showLocationDialog || !weatherData || isLoading) {
      setShowSkeleton(true);
    } else {
      // Add a short delay before removing the skeleton for smooth transition
      const timeout = setTimeout(() => setShowSkeleton(false), 250);
      return () => clearTimeout(timeout);
    }
  }, [showLocationDialog, weatherData, isLoading]);

  // Handlers
  const handleUseCurrentLocation = () => {
    triggerCurrentLocation();
  };

  const handleLocationPermissionChange = (allow: boolean) => {
    handleLocationPermission(allow);
  };

  // Memoize renderContent to avoid unnecessary recalculations
  const renderContent = useMemo(() => {
    if (error) {
      return (
        <div
          className="flex items-center justify-center flex-1"
          role="alert"
          aria-live="assertive"
        >
          <p className="text-red-500">{error}</p>
        </div>
      );
    }
    return (
      <AnimatePresence mode="wait" initial={false}>
        {showSkeleton ? (
          <motion.div
            key="skeleton"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex-1"
          >
            <WeatherDashboardSkeleton />
          </motion.div>
        ) : (
          weatherData &&
          !isLoading && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.4 }}
              className="flex-1"
            >
              <Suspense fallback={<WeatherDashboardSkeleton />}>
                <WeatherDashboard weatherData={weatherData} unit={unit} />
              </Suspense>
            </motion.div>
          )
        )}
      </AnimatePresence>
    );
  }, [showSkeleton, error, weatherData, isLoading, unit]);

  return (
    <div className="min-h-screen flex flex-col">
      <LocationPermissionDialog
        open={showLocationDialog}
        onOpenChange={(open) => setLocationDialog(open)}
        onAllowLocation={() => handleLocationPermissionChange(true)}
        onDenyLocation={() => handleLocationPermissionChange(false)}
      />
      <ErrorBoundary
        FallbackComponent={ErrorFallback}
        onReset={() => {
          reset();
          handleUseCurrentLocation();
        }}
      >
        <NavBar />
        {renderContent}
        <Footer />
      </ErrorBoundary>
    </div>
  );
}

// Import the navbar
import NavBar from '@/components/views/navbar';
