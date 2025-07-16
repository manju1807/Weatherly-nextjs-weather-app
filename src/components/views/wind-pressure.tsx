import React from 'react';
import { Card } from '@/components/ui/card';
import { Wind, Compass, Gauge, Waves, Mountain } from 'lucide-react';
import { CurrentWeatherResponse } from '@/types/weather';

interface WindPressureCardProps {
  currentWeather: CurrentWeatherResponse;
  unit: 'metric' | 'imperial';
}

const WindPressureCard: React.FC<WindPressureCardProps> = ({ currentWeather, unit }) => {
  const getWindDirection = (deg: number) => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    return directions[Math.round(deg / 45) % 8];
  };

  return (
    <Card className="flex flex-col h-full">
      <div className="text-center">
        <div className="flex items-center justify-center gap-2">
          <Wind className="h-4 w-4" />
          Wind & Pressure
        </div>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center space-y-6">
        <div className="w-full max-w-md mx-auto">
          <div className="grid grid-cols-2 gap-6">
            <div className="flex flex-col items-center">
              <h3 className="text-sm font-semibold mb-4 text-center">Wind</h3>
              <div className="space-y-3 w-full">
                <div className="flex items-center gap-2">
                  <Wind className="w-5 h-5 text-blue-400 dark:text-blue-300" />
                  <span className="text-sm text-muted-foreground">
                    {Math.round(currentWeather.wind.speed)}{' '}
                    {unit === 'metric' ? 'km/h' : 'mph'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Compass className="w-5 h-5 text-gray-400 dark:text-gray-300" />
                  <span className="text-sm text-muted-foreground">
                    {getWindDirection(currentWeather.wind.deg)} ({currentWeather.wind.deg}
                    °)
                  </span>
                </div>
                {currentWeather.wind.gust && (
                  <div className="flex items-center gap-2">
                    <Wind className="w-5 h-5 text-blue-400 dark:text-blue-300" />
                    <span className="text-sm text-muted-foreground">
                      Gust: {Math.round(currentWeather.wind.gust)}{' '}
                      {unit === 'metric' ? 'km/h' : 'mph'}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-col items-center">
              <h3 className="text-sm font-semibold mb-4 text-center">Pressure</h3>
              <div className="space-y-3 w-full">
                <div className="flex items-center gap-2">
                  <Gauge className="w-5 h-5 text-red-400 dark:text-red-300" />
                  <span className="text-sm text-muted-foreground">
                    {currentWeather.main.pressure} hPa
                  </span>
                </div>
                {currentWeather.main.sea_level && (
                  <div className="flex items-center gap-2">
                    <Waves className="w-5 h-5 text-blue-400 dark:text-blue-300" />
                    <span className="text-sm text-muted-foreground">
                      Sea Level: {currentWeather.main.sea_level} hPa
                    </span>
                  </div>
                )}
                {currentWeather.main.grnd_level && (
                  <div className="flex items-center gap-2">
                    <Mountain className="w-5 h-5 text-green-400 dark:text-green-300" />
                    <span className="text-sm text-muted-foreground">
                      Ground Level: {currentWeather.main.grnd_level} hPa
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default WindPressureCard;
