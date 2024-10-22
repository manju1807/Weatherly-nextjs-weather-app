// app/actions/weatherActions.ts

import axiosInstance from '@/lib/axios';
import {
  CurrentWeatherResponse,
  ForecastResponse,
  AirPollutionResponse,
  City,
} from '@/types/weather';

const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

export async function fetchCurrentWeather(
  lat: number,
  lon: number,
): Promise<CurrentWeatherResponse> {
  const response = await axiosInstance.get<CurrentWeatherResponse>(
    `${BASE_URL}/weather`,
    {
      params: {
        lat,
        lon,
        units: 'metric',
        appid: API_KEY,
      },
    },
  );
  return response.data;
}

export async function fetchForecast(lat: number, lon: number): Promise<ForecastResponse> {
  const response = await axiosInstance.get<ForecastResponse>(`${BASE_URL}/forecast`, {
    params: {
      lat,
      lon,
      units: 'metric',
      appid: API_KEY,
    },
  });
  return response.data;
}

export async function fetchAirPollution(
  lat: number,
  lon: number,
): Promise<AirPollutionResponse> {
  const response = await axiosInstance.get<AirPollutionResponse>(
    `${BASE_URL}/air_pollution`,
    {
      params: {
        lat,
        lon,
        appid: API_KEY,
      },
    },
  );
  return response.data;
}

export async function searchCities(query: string): Promise<City[]> {
  const response = await axiosInstance.get(`${BASE_URL}/find`, {
    params: {
      q: query,
      type: 'like',
      sort: 'population',
      cnt: 5,
      appid: API_KEY,
    },
  });
  return response.data.list.map((city: any) => ({
    name: city.name,
    country: city.sys.country,
    lat: city.coord.lat,
    lon: city.coord.lon,
  }));
}
