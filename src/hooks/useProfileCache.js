/**
 * useProfileCache - Custom hook for profile caching
 * Prevents "Unknown Student" by caching profiles locally
 * 
 * Usage:
 * const { getProfile, cacheProfile, getCachedProfiles } = useProfileCache();
 */

import { useCallback } from "react";
import profileCacheService from "../services/profileCacheService";

export const useProfileCache = () => {
  // Retrieve cached profile
  const getProfile = useCallback((userId) => {
    return profileCacheService.getProfile(userId);
  }, []);

  // Cache single profile
  const cacheProfile = useCallback((userId, profileData) => {
    profileCacheService.cacheProfile(userId, profileData);
  }, []);

  // Cache multiple profiles (batch operation)
  const cacheProfiles = useCallback((profiles) => {
    profileCacheService.cacheProfiles(profiles);
  }, []);

  // Get multiple cached profiles
  const getCachedProfiles = useCallback((userIds) => {
    return profileCacheService.getProfiles(userIds);
  }, []);

  // Remove profile from cache
  const removeProfile = useCallback((userId) => {
    profileCacheService.removeProfile(userId);
  }, []);

  // Clear all profiles
  const clearCache = useCallback(() => {
    profileCacheService.clearCache();
  }, []);

  // Get cache statistics
  const getCacheStats = useCallback(() => {
    return profileCacheService.getCacheStats();
  }, []);

  // Clean up expired profiles
  const cleanupExpired = useCallback(() => {
    return profileCacheService.cleanupExpired();
  }, []);

  return {
    getProfile,
    cacheProfile,
    cacheProfiles,
    getCachedProfiles,
    removeProfile,
    clearCache,
    getCacheStats,
    cleanupExpired,
  };
};

export default useProfileCache;
