'use client';

import React, { useRef, useCallback, memo } from 'react';
import dynamic from 'next/dynamic';
import { Input } from '@/components/ui/input';
import { Search, MapPin } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useWeatherStore } from '@/lib/store';
import { useOptimizedSearch } from '@/hooks/useOptimizedSearch';
import LogoSvg from '@/public/svgs/logo';
import { AppLanguage, t } from '@/lib/language/i18n';

const ModeToggle = dynamic(() => import('../theme-toggle'), {
  ssr: false,
});

// Memoized components for better performance
const Logo = memo(({ onClick }: { onClick: () => void }) => (
  <div
    className="shrink-0 flex flex-row items-center justify-between gap-2 cursor-pointer hover:opacity-80 transition-opacity mr-4 md:mr-0"
    onClick={onClick}
    role="button"
    tabIndex={0}
    onKeyDown={(e) => e.key === 'Enter' && onClick()}
    aria-label="logo"
  >
    <LogoSvg className="w-8 h-8" fill="currentColor" />
    <span className="text-md md:text-2xl font-bold md:font-bold">Weatherly</span>
  </div>
));
Logo.displayName = 'Logo';

const SearchSuggestions = memo(
  ({
    suggestions,
    selectedIndex,
    onSelect,
    onMouseEnter,
    language,
  }: {
    suggestions: Array<{ name: string; country: string; lat: number; lon: number }>;
    selectedIndex: number;
    onSelect: (city: { name: string; country: string; lat: number; lon: number }) => void;
    onMouseEnter: (index: number) => void;
    language: AppLanguage;
  }) => (
    <div className="absolute left-0 right-0 top-full mt-1">
      <ul
        id="city-suggestions"
        className="w-full bg-background shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm"
        role="listbox"
        aria-label={t(language, 'citySuggestions')}
        tabIndex={-1}
      >
        {suggestions.map((city, index) => (
          <li
            key={`${city.name}-${city.lat}-${city.lon}`}
            className={`cursor-pointer select-none relative py-2 pl-3 pr-9 ${
              index === selectedIndex ? 'bg-primary/10' : ''
            }`}
            onClick={() => onSelect(city)}
            onMouseEnter={() => onMouseEnter(index)}
            role="option"
            aria-selected={index === selectedIndex}
            tabIndex={-1}
            id={`city-option-${index}`}
          >
            <span className="flex items-center">
              <span className="ml-3 block truncate">
                {city.name}, {city.country}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  ),
);
SearchSuggestions.displayName = 'SearchSuggestions';

// NavBar is the main navigation component for the app.
// It handles search, location selection, and navigation logic, using hooks and handlers for user interaction.
const NavBar = memo(() => {
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { isManualSelection, triggerCurrentLocation, language, setLanguage } =
    useWeatherStore();
  const {
    searchQuery,
    citySuggestions,
    isSearching,
    error,
    selectedIndex,
    setSelectedIndex,
    handleKeyDown,
    handleCitySelect,
    clearSearch,
    setSearchQuery,
  } = useOptimizedSearch();

  // Memoized handlers
  const handleLogoClick = useCallback(() => {
    router.refresh();
  }, [router]);

  const handleUseCurrentLocation = useCallback(() => {
    triggerCurrentLocation();
    clearSearch();
  }, [triggerCurrentLocation, clearSearch]);

  const handleClickOutside = useCallback(
    (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setSelectedIndex(-1);
      }
    },
    [setSelectedIndex],
  );

  // Click outside effect
  React.useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [handleClickOutside]);

  // Clear search when switching to current location
  React.useEffect(() => {
    if (!isManualSelection) {
      clearSearch();
    }
  }, [isManualSelection, clearSearch]);

  React.useEffect(() => {
    const savedLanguage = window.localStorage.getItem('weather-language');
    if (savedLanguage === 'en' || savedLanguage === 'km') {
      setLanguage(savedLanguage);
    }
  }, [setLanguage]);

  React.useEffect(() => {
    document.documentElement.lang = language === 'km' ? 'km' : 'en';
    window.localStorage.setItem('weather-language', language);
  }, [language]);

  const isOpen = citySuggestions.length > 0;

  return (
    <nav
      className="bg-background sticky top-0 z-50 border-b"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="container px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Logo onClick={handleLogoClick} />

          <div className="flex-1 flex justify-center px-2 lg:ml-6 lg:justify-end">
            <div className="max-w-lg w-full lg:max-w-xs" ref={dropdownRef}>
              <div className="relative">
                <div className="relative flex items-center gap-2">
                  <div className="relative flex-1">
                    <label htmlFor="city-search" className="sr-only">
                      {t(language, 'searchForCity')}
                    </label>
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search
                        className="h-5 w-5 text-muted-foreground"
                        aria-hidden="true"
                      />
                    </div>
                    <Input
                      ref={inputRef}
                      id="city-search"
                      name="search"
                      className="block w-full pl-10 pr-3 py-2 border border-input rounded-md leading-5 bg-background placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm"
                      placeholder={t(language, 'searchPlaceholder')}
                      type="search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={handleKeyDown}
                      aria-expanded={isOpen}
                      aria-autocomplete="list"
                      aria-controls="city-suggestions"
                      aria-activedescendant={
                        selectedIndex >= 0 ? `city-option-${selectedIndex}` : undefined
                      }
                      aria-busy={isSearching}
                      aria-label={t(language, 'searchForCity')}
                    />
                  </div>
                  <button
                    onClick={handleUseCurrentLocation}
                    className={`p-2 rounded-md hover:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-primary ${
                      !isManualSelection ? 'text-primary' : 'text-muted-foreground'
                    }`}
                    aria-label={t(
                      language,
                      !isManualSelection ? 'usingCurrentLocation' : 'useCurrentLocation',
                    )}
                    aria-pressed={!isManualSelection}
                  >
                    <MapPin className="h-5 w-5" aria-hidden="true" />
                  </button>
                  <div className="hidden sm:flex items-center">
                    <label htmlFor="language-select" className="sr-only">
                      {t(language, 'language')}
                    </label>
                    <select
                      id="language-select"
                      value={language}
                      onChange={(e) => setLanguage(e.target.value as AppLanguage)}
                      className="h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      aria-label={t(language, 'language')}
                    >
                      <option value="en">{t(language, 'english')}</option>
                      <option value="km">{t(language, 'khmer')}</option>
                    </select>
                  </div>
                </div>

                {isOpen && (
                  <div className="relative">
                    <SearchSuggestions
                      suggestions={citySuggestions}
                      selectedIndex={selectedIndex}
                      onSelect={handleCitySelect}
                      onMouseEnter={setSelectedIndex}
                      language={language}
                    />
                  </div>
                )}

                {error && (
                  <div
                    className="absolute left-0 right-0 top-full mt-1 text-red-500 bg-background p-2 rounded-md shadow-lg"
                    role="alert"
                    aria-live="polite"
                  >
                    {error}
                  </div>
                )}

                {isSearching && (
                  <div
                    className="absolute left-0 right-0 top-full mt-1 text-muted-foreground bg-background p-2 rounded-md shadow-lg"
                    aria-live="polite"
                  >
                    {t(language, 'searching')}
                  </div>
                )}

                {searchQuery.length > 0 && searchQuery.length < 3 && (
                  <div
                    className="absolute left-0 right-0 top-full mt-1 text-muted-foreground bg-background p-2 rounded-md shadow-lg text-sm"
                    aria-live="polite"
                  >
                    {t(language, 'enterThreeLetters')}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="sm:hidden">
              <label htmlFor="language-select-mobile" className="sr-only">
                {t(language, 'language')}
              </label>
              <select
                id="language-select-mobile"
                value={language}
                onChange={(e) => setLanguage(e.target.value as AppLanguage)}
                className="h-9 rounded-md border border-input bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                aria-label={t(language, 'language')}
              >
                <option value="en">EN</option>
                <option value="km">KM</option>
              </select>
            </div>
            <ModeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
});

NavBar.displayName = 'NavBar';

export default NavBar;
