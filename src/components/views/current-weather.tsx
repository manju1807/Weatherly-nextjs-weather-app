import React from 'react';
import { Card } from '@/components/ui/card';
import { CloudRain, Wind, Droplets, Gauge } from 'lucide-react';
import { CurrentWeatherResponse, ForecastResponse } from '@/types/weather';
import { ClearSky, Cloudy, Rainy, Sunny } from '@/public/svgs/weather';
import {
  AppLanguage,
  getLocale,
  t,
  translateWeatherCondition,
} from '@/lib/language/i18n';

interface CurrentWeatherCardProps {
  currentWeather: CurrentWeatherResponse;
  forecast: ForecastResponse;
  unit: 'metric' | 'imperial';
  language: AppLanguage;
}

const CurrentWeatherCard: React.FC<CurrentWeatherCardProps> = ({
  currentWeather,
  forecast,
  unit,
  language,
}) => {
  const locale = getLocale(language);

  const getWeatherIcon = (main: string) => {
    switch (main.toLowerCase()) {
      case 'clear':
        return (
          <Sunny className="w-32 h-32 text-yellow-500 transition-transform hover:scale-105" />
        );
      case 'clouds':
        return (
          <Cloudy className="w-32 h-32 text-gray-500 transition-transform hover:scale-105" />
        );
      case 'rain':
        return (
          <Rainy className="w-32 h-32 text-blue-500 transition-transform hover:scale-105" />
        );
      default:
        return (
          <ClearSky className="w-32 h-32 text-yellow-400 transition-transform hover:scale-105" />
        );
    }
  };

  return (
    <Card>
      <div className="px-6 py-2">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <h2 className="text-xl font-bold tracking-tight">
              {currentWeather.name}, {currentWeather.sys.country}
            </h2>
            <div className="space-y-1">
              <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                {t(language, 'today')},{' '}
                {new Date().toLocaleDateString(locale, {
                  weekday: 'long',
                  month: 'short',
                  day: 'numeric',
                })}
              </p>
              <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                {new Date().toLocaleTimeString(locale, {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>
          <div className="transform transition-transform hover:scale-105 duration-300">
            {getWeatherIcon(currentWeather.weather[0].main)}
          </div>
        </div>

        <div className="mb-8">
          <div className="flex items-end mb-2">
            <p className="text-8xl font-bold tracking-tighter">
              {Math.round(currentWeather.main.temp)}°
            </p>
            <p className="text-2xl font-bold mb-2 ml-1">{unit === 'metric' ? 'C' : 'F'}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xl font-semibold text-muted-foreground">
              {translateWeatherCondition(language, currentWeather.weather[0].main)}
            </p>
            <p className="text-xs sm:text-sm font-medium text-muted-foreground">
              {t(language, 'feelsLike')} {Math.round(currentWeather.main.feels_like)}°
              {unit === 'metric' ? 'C' : 'F'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 w-full text-sm text-muted-foreground">
          <div className="flex items-center">
            <CloudRain className="w-5 h-5 mr-2 flex-shrink-0 text-blue-400" />
            <span className="text-xs sm:text-sm text-nowrap">
              {t(language, 'rainChance')}: {Math.round(forecast.list[0].pop * 100)}%
            </span>
          </div>
          <div className="flex items-center">
            <Wind className="w-5 h-5 mr-2 flex-shrink-0 text-blue-400" />
            <span className="text-xs sm:text-sm text-nowrap">
              {t(language, 'windSpeed')}: {Math.round(currentWeather.wind.speed)}{' '}
              {unit === 'metric' ? 'km/h' : 'mph'}
            </span>
          </div>
          <div className="flex items-center">
            <Droplets className="w-5 h-5 mr-2 flex-shrink-0 text-blue-400" />
            <span className="text-xs sm:text-sm text-nowrap">
              {t(language, 'humidity')}: {currentWeather.main.humidity}%
            </span>
          </div>
          <div className="flex items-center">
            <Gauge className="w-5 h-5 mr-2 flex-shrink-0 text-red-400" />
            <span className="text-xs sm:text-sm text-nowrap">
              {t(language, 'pressure')}: {currentWeather.main.pressure} mb
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default CurrentWeatherCard;
