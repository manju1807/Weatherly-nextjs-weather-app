'use client';

import { AppDispatch } from '@/store';
import { fetchLocation } from '@/store/slices/location-slice';
import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';

const FetchLocation: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(fetchLocation()).catch((error) =>
      console.error('Error fetching location:', error),
    );
  }, [dispatch]);

  return null;
};

export default FetchLocation;
