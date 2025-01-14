import React from 'react';
import { WeatherData } from '@/types/weather';
import DayDuration from '@/components/views/day-duration';
import AirPollutionChart from '@/components/views/air-pollution';
import TemperatureHumidityChart from '@/components/views/temp-humidity';
import ClientMap from '@/components/views/client-map';
import CurrentWeatherCard from '@/components/views/current-weather';
import WindPressureCard from '@/components/views/wind-pressure';
import HourlyForecast from '@/components/views/hourly-forecast';

interface WeatherDashboardProps {
  weatherData: WeatherData;
  unit: 'metric' | 'imperial';
}

const WeatherDashboard: React.FC<WeatherDashboardProps> = ({ weatherData, unit }) => {
  const { currentWeather, forecast, airPollution } = weatherData;

  // Extract hourly forecast data for the first 5 items
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
      <div className="container grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
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
