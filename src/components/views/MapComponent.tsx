'use client';

import dynamic from 'next/dynamic';
import { t } from '@/lib/language/i18n';
import { useLanguage } from '@/lib/store';

const LoadingMap = () => {
  const language = useLanguage();
  return <p>{t(language, 'loadingMap')}</p>;
};

const MapComponent = dynamic(() => import('./dynamic-map'), {
  ssr: false,
  loading: LoadingMap,
});

export default MapComponent;
