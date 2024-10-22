'use client';

import React from 'react';
import { useSelector } from 'react-redux';
import { AppState } from '@/store';
import DayDuration from '@/components/views/day-duration';
import AirPollutionChart from '@/components/views/air-pollution';
import TemperatureHumidityChart from '@/components/views/temp-humidity';
import ClientMap from '@/components/views/client-map';
import CurrentWeatherCard from '@/components/views/current-weather';
import WindPressureCard from '@/components/views/wind-pressure';
import HourlyForecast from '@/components/views/hourly-forecast';
import NavBar from '@/components/views/navbar';

const WeatherDashboardSkeleton = () => {
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

const WeatherDashboard: React.FC = () => {
  const { currentWeather, forecast, airPollution, loading, error } = useSelector(
    (state: AppState) => state.location,
  );
  const unit = useSelector((state: AppState) => state.location.unit);

  if (error) return <div className='min-h-screen grid place-content-center'>Error occurred please try again later!</div>;

  if (loading) {
    return <WeatherDashboardSkeleton />;
  }

  if (!currentWeather || !forecast || !airPollution) return <WeatherDashboardSkeleton />;

  const hourlyForecastData = forecast.list.slice(0, 5).map((item) => ({
    time: new Date(item.dt * 1000).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    }),
    temperature: Math.round(item.main.temp),
    weather: item.weather[0].main,
  }));

  return (
    <div className="bg-inherit min-h-screen flex flex-col">
      <NavBar />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
        <CurrentWeatherCard
          currentWeather={currentWeather}
          forecast={forecast}
          unit={unit}
        />
        <div className="grid grid-rows-2 gap-4">
          <WindPressureCard currentWeather={currentWeather} unit={unit} />
          <HourlyForecast forecast={hourlyForecastData} unit={unit} />
        </div>
        <AirPollutionChart data={airPollution} />
        <TemperatureHumidityChart data={forecast} unit={unit} />
        <DayDuration data={currentWeather} />
        <ClientMap
          center={[currentWeather.coord.lat, currentWeather.coord.lon]}
          zoom={10}
          markerPosition={[currentWeather.coord.lat, currentWeather.coord.lon]}
          popupContent={`${currentWeather.name}, ${currentWeather.sys.country}`}
        />
      </div>
    </div>
  );
};

export default WeatherDashboard;
