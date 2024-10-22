'use client';

import { useRef } from 'react';
import { Provider } from 'react-redux';
import { makeStore, AppStore } from '@/store/index';

export default function StoreProvider({ children }: { children: React.ReactNode }) {
  // useRef is used to keep a reference to the Redux store
  // The storeRef.current will persist the store instance across renders
  const storeRef = useRef<AppStore>();
  // Initialize the store only once
  // This prevents the store from being recreated on every render
  if (!storeRef.current) {
    storeRef.current = makeStore();
  }

  return <Provider store={storeRef.current}>{children}</Provider>;
  // Provide the store to the rest of the application
  // `Provider` is a React-Redux component that makes the Redux store available to all components
}
