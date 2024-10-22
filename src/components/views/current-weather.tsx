import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Sun, Cloud, CloudRain, Wind, Droplets, Gauge } from 'lucide-react';
import { CurrentWeatherResponse, ForecastResponse } from '@/types/weather';

interface CurrentWeatherCardProps {
  currentWeather: CurrentWeatherResponse;
  forecast: ForecastResponse;
  unit: 'metric' | 'imperial';
}

const CurrentWeatherCard: React.FC<CurrentWeatherCardProps> = ({
  currentWeather,
  forecast,
  unit,
}) => {
  const getWeatherIcon = (main: string) => {
    switch (main.toLowerCase()) {
      case 'clear':
        return <Sun className="w-16 h-16 text-yellow-400" />;
      case 'clouds':
        return <Cloud className="w-16 h-16 text-gray-400" />;
      case 'rain':
        return <CloudRain className="w-16 h-16 text-blue-400" />;
      default:
        return <Sun className="w-16 h-16 text-yellow-400" />;
    }
  };

  return (
    <Card className="w-full mx-auto">
      <CardContent className="flex flex-col items-center h-full p-6">
        <div className="flex justify-between items-center w-full mb-6">
          <div>
            <h2 className="text-xl font-semibold">
              {currentWeather.name}, {currentWeather.sys.country}
            </h2>
            <p className="text-sm text-muted-foreground">
              Today,{' '}
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'short',
                day: 'numeric',
              })}
            </p>
            <p className="text-sm text-muted-foreground">
              {new Date().toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
          {getWeatherIcon(currentWeather.weather[0].main)}
        </div>
        <div className="flex flex-col w-full mb-12">
          <p className="text-8xl font-bold">
            {Math.round(currentWeather.main.temp)}°{unit === 'metric' ? 'C' : 'F'}
          </p>
          <p className="text-xl">{currentWeather.weather[0].main}</p>
          <p className="text-sm text-muted-foreground">
            Feels like {Math.round(currentWeather.main.feels_like)}°
            {unit === 'metric' ? 'C' : 'F'}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4 w-full">
          <div className="flex items-center ">
            <CloudRain className="w-5 h-5 mr-2 text-blue-400" />
            <span>Rain Chance: {forecast.list[0].pop * 100}%</span>
          </div>
          <div className="flex items-center">
            <Wind className="w-5 h-5 mr-2 text-gray-400" />
            <span>
              Wind Speed: {Math.round(currentWeather.wind.speed)}{' '}
              {unit === 'metric' ? 'km/h' : 'mph'}
            </span>
          </div>
          <div className="flex items-center">
            <Droplets className="w-5 h-5 mr-2 text-blue-400" />
            <span>Humidity: {currentWeather.main.humidity}%</span>
          </div>
          <div className="flex items-center">
            <Gauge className="w-5 h-5 mr-2 text-gray-400" />
            <span>Pressure: {currentWeather.main.pressure} mb</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CurrentWeatherCard;
