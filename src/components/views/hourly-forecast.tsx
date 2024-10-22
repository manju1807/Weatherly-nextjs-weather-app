import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, Sun, Cloud, CloudRain, CloudSnow } from 'lucide-react';

interface HourlyForecast {
  time: string;
  temperature: number;
  weather: string;
}

interface HourlyForecastProps {
  forecast: HourlyForecast[];
  unit: 'metric' | 'imperial';
}

const HourlyForecast: React.FC<HourlyForecastProps> = ({ forecast, unit }) => {
  const getWeatherIcon = (weather: string) => {
    switch (weather.toLowerCase()) {
      case 'clear':
        return <Sun className="w-6 h-6 text-yellow-400" />;
      case 'clouds':
        return <Cloud className="w-6 h-6 text-gray-400" />;
      case 'rain':
        return <CloudRain className="w-6 h-6 text-blue-400" />;
      case 'snow':
        return <CloudSnow className="w-6 h-6 text-blue-200" />;
      default:
        return <Sun className="w-6 h-6 text-yellow-400" />;
    }
  };

  return (
    <Card className="w-full h-full">
      <CardContent className="p-4 flex flex-col gap-6">
        <h2 className="text-md font-semibold flex items-center">
          <Clock className="w-5 h-5 mr-2" /> Hourly Forecast
        </h2>
        <div className="flex items-center justify-evenly w-full h-full">
          {forecast.slice(0, 5).map((hour, index) => (
            <div key={index} className="text-center flex flex-col items-center gap-2">
              <p className="text-sm font-medium">{hour.time}</p>
              {getWeatherIcon(hour.weather)}
              <p className="mt-1 text-sm">
                {Math.round(hour.temperature)}°{unit === 'metric' ? 'C' : 'F'}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default HourlyForecast;
