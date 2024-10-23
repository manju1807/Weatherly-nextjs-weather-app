'use client';

import React from 'react';
import { ForecastResponse } from '@/types/weather';
import { Thermometer, Droplets } from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartTooltip } from '@/components/ui/chart';

interface TemperatureHumidityChartProps {
  data: ForecastResponse;
  unit: 'metric' | 'imperial';
}

const chartConfig = {
  temperature: {
    label: 'Temperature',
    color: 'hsl(var(--chart-1))',
  },
  humidity: {
    label: 'Humidity',
    color: 'hsl(var(--chart-2))',
  },
} satisfies ChartConfig;

const TemperatureHumidityChart: React.FC<TemperatureHumidityChartProps> = ({
  data,
  unit,
}) => {
  const temperatureUnit = unit === 'metric' ? '°C' : '°F';

  const chartData = data.list.map((item) => ({
    time: new Date(item.dt * 1000).toLocaleString(),
    temperature: item.main.temp,
    humidity: item.main.humidity,
  }));

  return (
    <Card className="md:col-span-2 w-full h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Thermometer className="h-4 w-4" />
          Temperature and Humidity Forecast
        </CardTitle>
        <CardDescription>Weather conditions for the next few days</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="w-full h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <ChartContainer config={chartConfig}>
              <AreaChart
                data={chartData}
                margin={{
                  top: 10,
                  right: 30,
                  left: 0,
                  bottom: 0,
                }}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="time"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(time) =>
                    new Date(time).toLocaleString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                    })
                  }
                />
                <YAxis
                  yAxisId="temp"
                  orientation="left"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value) => `${value}${temperatureUnit}`}
                />
                <YAxis
                  yAxisId="humidity"
                  orientation="right"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value) => `${value}%`}
                />
                <ChartTooltip
                  cursor={false}
                  content={({ active, payload }) => {
                    if (!active || !payload) return null;
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-sm">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex items-center gap-1">
                            <div className="h-2 w-2 rounded-full bg-[var(--color-temperature)]" />
                            <span className="text-sm font-medium">
                              {payload[0]?.value}
                              {temperatureUnit}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="h-2 w-2 rounded-full bg-[var(--color-humidity)]" />
                            <span className="text-sm font-medium">
                              {payload[1]?.value}%
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  }}
                />
                <defs>
                  <linearGradient id="temperatureGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--color-temperature)"
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--color-temperature)"
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                  <linearGradient id="humidityGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--color-humidity)"
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--color-humidity)"
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                </defs>
                <Area
                  yAxisId="temp"
                  type="natural"
                  dataKey="temperature"
                  stroke="var(--color-temperature)"
                  fill="url(#temperatureGradient)"
                  fillOpacity={0.4}
                />
                <Area
                  yAxisId="humidity"
                  type="natural"
                  dataKey="humidity"
                  stroke="var(--color-humidity)"
                  fill="url(#humidityGradient)"
                  fillOpacity={0.4}
                />
              </AreaChart>
            </ChartContainer>
          </ResponsiveContainer>
        </div>
      </CardContent>
      <CardFooter>
        <div className="flex justify-between mt-4 text-sm w-full">
          <div className="flex items-center gap-2">
            <Thermometer className="h-4 w-4 text-[var(--color-temperature)]" />
            <span className="text-muted-foreground">Temperature ({temperatureUnit})</span>
          </div>
          <div className="flex items-center gap-2">
            <Droplets className="h-4 w-4 text-[var(--color-humidity)]" />
            <span className="text-muted-foreground">Humidity (%)</span>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};

export default TemperatureHumidityChart;
