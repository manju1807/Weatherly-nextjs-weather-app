import enTranslations from './en.json';
import khTranslations from './kh.json';

export type AppLanguage = 'en' | 'km';

export type TranslationKey =
  | 'searchForCity'
  | 'searchPlaceholder'
  | 'citySuggestions'
  | 'usingCurrentLocation'
  | 'useCurrentLocation'
  | 'searching'
  | 'enterThreeLetters'
  | 'language'
  | 'english'
  | 'khmer'
  | 'today'
  | 'feelsLike'
  | 'rainChance'
  | 'windSpeed'
  | 'humidity'
  | 'pressure'
  | 'windAndPressure'
  | 'wind'
  | 'gust'
  | 'seaLevel'
  | 'groundLevel'
  | 'hourlyForecast'
  | 'airPollution'
  | 'airQualityIndex'
  | 'aqi'
  | 'temperatureHumidityForecast'
  | 'nextFewDays'
  | 'temperature'
  | 'daylightHours'
  | 'lightCycleDescription'
  | 'sunrise'
  | 'sunset'
  | 'precipitationMap'
  | 'interactiveMap'
  | 'loadingMap'
  | 'locationAccess'
  | 'locationAccessIntro'
  | 'allowBrowserPrompt'
  | 'defaultLocationNote'
  | 'maybeLater'
  | 'allowLocationAccess'
  | 'madeWith'
  | 'by'
  | 'visitGithubProfile'
  | 'viewSourceCode'
  | 'source'
  | 'failedToSearchCities'
  | 'good'
  | 'fair'
  | 'moderate'
  | 'poor'
  | 'veryPoor'
  | 'unknown';

type TranslationDictionary = Record<TranslationKey, string>;

const translations: Record<AppLanguage, TranslationDictionary> = {
  en: enTranslations as TranslationDictionary,
  km: khTranslations as TranslationDictionary,
};

const weatherConditionMap: Record<string, { en: string; km: string }> = {
  clear: { en: 'Clear', km: 'មេឃស្រឡះ' },
  clouds: { en: 'Clouds', km: 'មានពពក' },
  rain: { en: 'Rain', km: 'ភ្លៀង' },
  drizzle: { en: 'Drizzle', km: 'ភ្លៀងរលឹម' },
  thunderstorm: { en: 'Thunderstorm', km: 'ព្យុះផ្គរ' },
  snow: { en: 'Snow', km: 'ព្រិល' },
  mist: { en: 'Mist', km: 'អ័ព្ទស្រាល' },
  smoke: { en: 'Smoke', km: 'ផ្សែង' },
  haze: { en: 'Haze', km: 'អ័ព្ទ' },
  dust: { en: 'Dust', km: 'ធូលី' },
  fog: { en: 'Fog', km: 'អ័ព្ទក្រាស់' },
  sand: { en: 'Sand', km: 'ខ្សាច់' },
  ash: { en: 'Ash', km: 'ផេះ' },
  squall: { en: 'Squall', km: 'ខ្យល់កន្ត្រាក់' },
  tornado: { en: 'Tornado', km: 'ខ្យល់កួច' },
};

export const t = (language: AppLanguage, key: TranslationKey) => translations[language][key];

export const getLocale = (language: AppLanguage) =>
  language === 'km' ? 'km-KH' : 'en-US';

export const translateWeatherCondition = (
  language: AppLanguage,
  condition: string,
) => {
  const key = condition.toLowerCase();
  return weatherConditionMap[key]?.[language] ?? condition;
};
