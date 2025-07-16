import React, { useMemo, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Clock, CloudSnow } from 'lucide-react';
import { ClearSky, Cloudy, Rainy, Sunny } from '@/public/svgs/weather';

interface HourlyForecast {
  time: string;
  temperature: number;
  weather: string;
}

interface HourlyForecastProps {
  forecast: HourlyForecast[];
  unit: 'metric' | 'imperial';
}

const HourlyForecast: React.FC<HourlyForecastProps> = React.memo(function HourlyForecast({
  forecast,
  unit,
}) {
  const getWeatherIcon = useCallback((weather: string) => {
    switch (weather.toLowerCase()) {
      case 'clear':
        return <Sunny className="w-6 h-6" />;
      case 'clouds':
        return <Cloudy className="w-6 h-6" />;
      case 'rain':
        return <Rainy className="w-6 h-6" />;
      case 'snow':
        return <CloudSnow className="w-6 h-6" />;
      default:
        return <ClearSky className="w-6 h-6" />;
    }
  }, []);

  const memoizedForecast = useMemo(() => forecast.slice(0, 5), [forecast]);

  return (
    <Card className="flex flex-col h-full">
      <div className="text-center">
        <div className="flex items-center justify-center gap-2">
          <Clock className="h-4 w-4" />
          Hourly Forecast
        </div>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="w-full max-w-lg mx-auto">
          <div className="flex items-center justify-evenly w-full">
            {memoizedForecast.map((hour, index) => (
              <div key={index} className="text-center flex flex-col items-center gap-3">
                <p className="text-sm font-medium text-muted-foreground">{hour.time}</p>
                <div className="flex justify-center">{getWeatherIcon(hour.weather)}</div>
                <p className="text-sm font-semibold">
                  {Math.round(hour.temperature)}°{unit === 'metric' ? 'C' : 'F'}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
});

export default HourlyForecast;
