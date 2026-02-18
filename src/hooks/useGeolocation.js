import { useState, useEffect } from 'react';

/**
 * Custom hook to get user's device location
 * Returns an object with latitude, longitude, and loading/error states
 */
export const useGeolocation = () => {
  const [location, setLocation] = useState({
    latitude: null,
    longitude: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocation((prev) => ({
        ...prev,
        error: 'Geolocation not supported',
        loading: false,
      }));
      return;
    }

    const success = (position) => {
      const { latitude, longitude } = position.coords;
      setLocation({
        latitude: latitude.toFixed(4),
        longitude: longitude.toFixed(4),
        loading: false,
        error: null,
      });
    };

    const error = (err) => {
      setLocation((prev) => ({
        ...prev,
        error: err.message || 'Failed to get location',
        loading: false,
      }));
    };

    // Request user location with high accuracy
    navigator.geolocation.getCurrentPosition(success, error, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    });
  }, []);

  return location;
};
