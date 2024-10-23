import React from 'react'

const WeatherDashboardSkeleton: React.FC = () => {
  return (
    <div className="bg-inherit min-h-screen flex flex-col animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
        {/* Current Weather Card Skeleton */}
        <div className="bg-gray-200 dark:bg-gray-600 rounded-lg p-6 h-80">
          <div className="h-8 w-1/3 bg-gray-300 dark:bg-gray-600 rounded mb-4" />
          <div className="h-16 w-2/3 bg-gray-300 dark:bg-gray-600 rounded mb-4" />
          <div className="h-8 w-1/2 bg-gray-300 dark:bg-gray-600 rounded" />
        </div>

        {/* Wind Pressure and Hourly Forecast Skeleton */}
        <div className="grid grid-rows-2 gap-4">
          <div className="bg-gray-200 dark:bg-gray-600 rounded-lg p-4 h-36">
            <div className="h-4 w-1/4 bg-gray-300 dark:bg-gray-600 rounded mb-4" />
            <div className="h-16 w-full bg-gray-300 dark:bg-gray-600 rounded" />
          </div>
          <div className="bg-gray-200 dark:bg-gray-600 rounded-lg p-4 h-36">
            <div className="h-4 w-1/3 bg-gray-300 dark:bg-gray-600 rounded mb-4" />
          </div>
        </div>

        {/* Air Pollution Chart Skeleton */}
        <div className="bg-gray-200 dark:bg-gray-600 rounded-lg p-4 h-80">
          <div className="h-4 w-1/4 bg-gray-300 dark:bg-gray-600 rounded mb-4" />
          <div className="h-60 w-full bg-gray-300 dark:bg-gray-600 rounded" />
        </div>

        {/* Temperature Humidity Chart Skeleton */}
        <div className="bg-gray-200 dark:bg-gray-600 rounded-lg p-4 h-80">
          <div className="h-4 w-1/3 bg-gray-300 dark:bg-gray-600 rounded mb-4" />
          <div className="h-60 w-full bg-gray-300 dark:bg-gray-600 rounded" />
        </div>

        {/* Day Duration Skeleton */}
        <div className="bg-gray-200 dark:bg-gray-600 rounded-lg p-4 h-80">
          <div className="h-4 w-1/4 bg-gray-300 dark:bg-gray-600 rounded mb-4" />
          <div className="h-60 w-full bg-gray-300 dark:bg-gray-600 rounded" />
        </div>

        {/* Map Skeleton */}
        <div className="bg-gray-200 dark:bg-gray-600 rounded-lg h-80" />
      </div>
    </div>
  );
};

export default WeatherDashboardSkeleton;
