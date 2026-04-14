import React, { useMemo } from 'react';
import { WeatherData } from '@/types/weather';
import DayDuration from '@/components/views/day-duration';
import AirPollutionChart from '@/components/views/air-pollution';
import TemperatureHumidityChart from '@/components/views/temp-humidity';
import ClientMap from '@/components/views/client-map';
import CurrentWeatherCard from '@/components/views/current-weather';
import WindPressureCard from '@/components/views/wind-pressure';
import HourlyForecast from '@/components/views/hourly-forecast';
import { AppLanguage, getLocale, t } from '@/lib/language/i18n';

interface WeatherDashboardProps {
  weatherData: WeatherData;
  unit: 'metric' | 'imperial';
  language: AppLanguage;
}

// Dashboard is a React component that aggregates and displays weather data in various cards and charts.
// It receives weather data and unit as props and passes them to child components.
const WeatherDashboard: React.FC<WeatherDashboardProps> = ({
  weatherData,
  unit,
  language,
}) => {
  const { currentWeather, forecast, airPollution } = weatherData;
  const locale = getLocale(language);

  // Memoize hourly forecast data for the first 5 items
  const hourlyForecastData = useMemo(
    () =>
      forecast.list.slice(0, 5).map((item) => ({
        time: new Date(item.dt * 1000).toLocaleTimeString(locale, {
          hour: '2-digit',
          minute: '2-digit',
        }),
        temperature: Math.round(item.main.temp),
        weather: item.weather[0].main,
      })),
    [forecast.list, locale],
  );

  return (
    <div className="bg-inherit min-h-screen flex flex-col">
      <div className="container grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
        <CurrentWeatherCard
          currentWeather={currentWeather}
          forecast={forecast}
          unit={unit}
          language={language}
        />
        <div className="grid grid-rows-2 gap-4">
          <WindPressureCard currentWeather={currentWeather} unit={unit} language={language} />
          <HourlyForecast forecast={hourlyForecastData} unit={unit} language={language} />
        </div>
        <AirPollutionChart data={airPollution} language={language} />
        <TemperatureHumidityChart data={forecast} unit={unit} language={language} />
        <DayDuration data={currentWeather} language={language} />
        <ClientMap
          center={[currentWeather.coord.lat, currentWeather.coord.lon]}
          zoom={10}
          markerPosition={[currentWeather.coord.lat, currentWeather.coord.lon]}
          popupContent={`${currentWeather.name}, ${currentWeather.sys.country}`}
          title={t(language, 'precipitationMap')}
          description={t(language, 'interactiveMap')}
        />
      </div>
    </div>
  );
};

export default WeatherDashboard;
