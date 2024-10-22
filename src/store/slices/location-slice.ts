import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  fetchCurrentWeather,
  fetchForecast,
  fetchAirPollution,
  searchCities,
} from '@/actions/weatherActions';
import {
  CurrentWeatherResponse,
  ForecastResponse,
  AirPollutionResponse,
  City,
} from '@/types/weather';

interface LocationState {
  latitude: number | null;
  longitude: number | null;
  error: string | null;
  loading: boolean;
  currentWeather: CurrentWeatherResponse | null;
  forecast: ForecastResponse | null;
  airPollution: AirPollutionResponse | null;
  citySuggestions: City[];
  selectedCity: City | null;
  unit: 'metric' | 'imperial';
}

const initialState: LocationState = {
  latitude: null,
  longitude: null,
  error: null,
  loading: false,
  currentWeather: null,
  forecast: null,
  airPollution: null,
  citySuggestions: [],
  selectedCity: null,
  unit: 'metric',
};

export const fetchLocation = createAsyncThunk(
  'location/fetchLocation',
  async (_, { rejectWithValue, dispatch }) => {
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });
      const coords = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };
      dispatch(fetchWeatherData(coords));
      return coords;
    } catch (error) {
      console.error('Error fetching location:', error);
      const defaultCoords = { latitude: 12.9716, longitude: 77.5946 };
      dispatch(fetchWeatherData(defaultCoords));
      return rejectWithValue('Unable to fetch location. Using default location.');
    }
  },
);

export const fetchWeatherData = createAsyncThunk(
  'location/fetchWeatherData',
  async (
    { latitude, longitude }: { latitude: number; longitude: number },
    { dispatch },
  ) => {
    try {
      const [currentWeather, forecast, airPollution] = await Promise.all([
        fetchCurrentWeather(latitude, longitude),
        fetchForecast(latitude, longitude),
        fetchAirPollution(latitude, longitude),
      ]);
      return { currentWeather, forecast, airPollution };
    } catch (error) {
      console.error('Error fetching weather data:', error);
      throw error;
    }
  },
);

export const searchCitiesThunk = createAsyncThunk(
  'location/searchCities',
  async (query: string) => {
    const suggestions = await searchCities(query);
    return suggestions;
  },
);

const locationSlice = createSlice({
  name: 'location',
  initialState,
  reducers: {
    setSelectedCity: (state, action: PayloadAction<City>) => {
      state.selectedCity = action.payload;
      state.latitude = action.payload.lat;
      state.longitude = action.payload.lon;
    },
    toggleUnit: (state) => {
      state.unit = state.unit === 'metric' ? 'imperial' : 'metric';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLocation.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchLocation.fulfilled, (state, action) => {
        state.loading = false;
        state.latitude = action.payload.latitude;
        state.longitude = action.payload.longitude;
        state.error = null;
      })
      .addCase(fetchLocation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.latitude = 12.9716;
        state.longitude = 77.5946;
      })
      .addCase(fetchWeatherData.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchWeatherData.fulfilled, (state, action) => {
        state.loading = false;
        state.currentWeather = action.payload.currentWeather;
        state.forecast = action.payload.forecast;
        state.airPollution = action.payload.airPollution;
        state.error = null;
      })
      .addCase(fetchWeatherData.rejected, (state, action) => {
        state.loading = false;
        state.error = 'Failed to fetch weather data';
      })
      .addCase(searchCitiesThunk.fulfilled, (state, action) => {
        state.citySuggestions = action.payload;
      });
  },
});

export const { setSelectedCity, toggleUnit } = locationSlice.actions;
export default locationSlice.reducer;
