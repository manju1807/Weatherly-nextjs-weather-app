'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { ModeToggle } from '../theme-toggle';
import { Search } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, AppState } from '@/store/index';
import {
  searchCitiesThunk,
  setSelectedCity,
  fetchWeatherData,
} from '@/store/slices/location-slice';
import { City } from '@/types/weather';
import { useDebounce } from '@/hooks/useDebounce';

const NavBar = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [error, setError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLUListElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounced search query
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const citySuggestions = useSelector((state: AppState) => {
    return state.location?.citySuggestions || [];
  });

  useEffect(() => {
    const fetchCities = async () => {
      if (debouncedSearchQuery.length > 2) {
        try {
          await dispatch(searchCitiesThunk(debouncedSearchQuery));
          setIsOpen(true);
          setError(null);
        } catch (err) {
          console.error('Error fetching cities:', err);
          setError('Failed to fetch city suggestions. Please try again.');
          setIsOpen(false);
        }
      } else {
        setIsOpen(false);
      }
    };

    fetchCities();
  }, [debouncedSearchQuery, dispatch]);

  const handleCitySelect = async (city: City) => {
    try {
      await dispatch(setSelectedCity(city));
      await dispatch(fetchWeatherData({ latitude: city.lat, longitude: city.lon }));
      setSearchQuery(`${city.name}, ${city.country}`);
      setIsOpen(false);
      setSelectedIndex(-1);
      setError(null);
    } catch (err) {
      console.error('Error selecting city:', err);
      setError('Failed to fetch weather data. Please try again.');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < citySuggestions.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      handleCitySelect(citySuggestions[selectedIndex]);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setSelectedIndex(-1);
    }
  };

  useEffect(() => {
    if (selectedIndex >= 0 && dropdownRef.current) {
      const selectedElement = dropdownRef.current.children[selectedIndex] as HTMLElement;
      selectedElement.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  return (
    <nav className="bg-background" role="navigation">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-2xl font-bold text-primary">WeatherApp</span>
            </div>
          </div>
          <div className="flex-1 flex justify-center px-2 lg:ml-6 lg:justify-end">
            <div className="max-w-lg w-full lg:max-w-xs relative">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                </div>
                <Input
                  ref={inputRef}
                  id="search"
                  name="search"
                  className="block w-full pl-10 pr-3 py-2 border border-input rounded-md leading-5 bg-background placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm"
                  placeholder="Search for a city..."
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsOpen(true)}
                  onBlur={() => setTimeout(() => setIsOpen(false), 200)}
                  onKeyDown={handleKeyDown}
                  aria-expanded={isOpen}
                  aria-autocomplete="list"
                  aria-controls="city-suggestions"
                />
              </div>
              {isOpen && citySuggestions.length > 0 && (
                <ul
                  ref={dropdownRef}
                  id="city-suggestions"
                  className="absolute z-10 mt-1 w-full bg-background shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm"
                  role="listbox"
                >
                  {citySuggestions.map((city, index) => (
                    <li
                      key={`${city.name}-${city.country}`}
                      className={`cursor-pointer select-none relative py-2 pl-3 pr-9 ${index === selectedIndex ? 'bg-primary/10' : ''
                        }`}
                      onClick={() => handleCitySelect(city)}
                      onMouseEnter={() => setSelectedIndex(index)}
                      role="option"
                      aria-selected={index === selectedIndex}
                    >
                      {city.name}, {city.country}
                    </li>
                  ))}
                </ul>
              )}
              {error && <div className="text-red-500 mt-2">{error}</div>}
            </div>
          </div>
          <div className="flex items-center">
            <ModeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
