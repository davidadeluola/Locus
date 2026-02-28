/**
 * ProfileCacheService - Caches student profiles locally
 * Prevents "Unknown Student" from appearing when profile fetch fails
 * 
 * Strategy:
 * 1. Cache profiles in localStorage after fetching
 * 2. Use cached profile as fallback if fetch fails
 * 3. Auto-invalidate old cache after 24 hours
 */

class ProfileCacheService {
  constructor() {
    this.CACHE_KEY = "locus_profile_cache";
    this.CACHE_TIMESTAMP_KEY = "locus_profile_cache_ts";
    this.CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours
  }

  /**
   * Get or initialize profile cache object
   * @private
   * @returns {Object}
   */
  _getCache() {
    try {
      const cacheStr = localStorage.getItem(this.CACHE_KEY);
      return cacheStr ? JSON.parse(cacheStr) : {};
    } catch (err) {
      console.error("❌ Error reading profile cache:", err);
      return {};
    }
  }

  /**
   * Save cache to localStorage
   * @private
   * @param {Object} cache
   */
  _saveCache(cache) {
    try {
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(cache));
      localStorage.setItem(this.CACHE_TIMESTAMP_KEY, new Date().toISOString());
    } catch (err) {
      console.error("❌ Error saving profile cache:", err);
    }
  }

  /**
   * Cache a student profile
   * @param {string} userId - Student ID (UUID)
   * @param {Object} profileData - Profile object from Supabase
   */
  cacheProfile(userId, profileData) {
    if (!userId || !profileData) {
      console.warn("⚠️ Cannot cache profile: missing userId or profileData");
      return;
    }

    try {
      const cache = this._getCache();
      cache[userId] = {
        ...profileData,
        cachedAt: new Date().toISOString(),
      };

      this._saveCache(cache);
      console.log(`✅ Profile cached for student ${userId}`);
    } catch (err) {
      console.error("❌ Error caching profile:", err);
    }
  }

  /**
   * Batch cache multiple profiles (efficient for enrollment lists)
   * @param {Array} profiles - Array of profile objects with id field
   */
  cacheProfiles(profiles) {
    if (!Array.isArray(profiles)) {
      console.warn("⚠️ Cannot cache profiles: invalid input");
      return;
    }

    try {
      const cache = this._getCache();

      profiles.forEach((profile) => {
        if (profile?.id) {
          cache[profile.id] = {
            ...profile,
            cachedAt: new Date().toISOString(),
          };
        }
      });

      this._saveCache(cache);
      console.log(`✅ Batch cached ${profiles.length} profiles`);
    } catch (err) {
      console.error("❌ Error batch caching profiles:", err);
    }
  }

  /**
   * Retrieve cached profile
   * @param {string} userId - Student ID
   * @returns {Object|null}
   */
  getProfile(userId) {
    try {
      if (!userId) return null;

      const cache = this._getCache();
      const profile = cache[userId];

      if (!profile) {
        console.log(`⚠️ No cached profile for student ${userId}`);
        return null;
      }

      // Check if cache is still valid
      if (this._isCacheExpired(profile.cachedAt)) {
        console.log(`⚠️ Cached profile expired for student ${userId}`);
        this.removeProfile(userId);
        return null;
      }

      console.log(`✅ Retrieved cached profile for student ${userId}`);
      return profile;
    } catch (err) {
      console.error("❌ Error retrieving cached profile:", err);
      return null;
    }
  }

  /**
   * Get multiple cached profiles
   * @param {Array} userIds - Array of student IDs
   * @returns {Object} Map of userId -> profile
   */
  getProfiles(userIds) {
    try {
      const cache = this._getCache();
      const result = {};

      userIds.forEach((userId) => {
        const profile = cache[userId];
        if (profile && !this._isCacheExpired(profile.cachedAt)) {
          result[userId] = profile;
        }
      });

      return result;
    } catch (err) {
      console.error("❌ Error retrieving cached profiles:", err);
      return {};
    }
  }

  /**
   * Remove specific profile from cache
   * @param {string} userId
   */
  removeProfile(userId) {
    try {
      const cache = this._getCache();
      delete cache[userId];
      this._saveCache(cache);
      console.log(`✅ Removed cached profile for student ${userId}`);
    } catch (err) {
      console.error("❌ Error removing profile:", err);
    }
  }

  /**
   * Clear entire profile cache
   */
  clearCache() {
    try {
      localStorage.removeItem(this.CACHE_KEY);
      localStorage.removeItem(this.CACHE_TIMESTAMP_KEY);
      console.log("✅ Profile cache cleared");
    } catch (err) {
      console.error("❌ Error clearing profile cache:", err);
    }
  }

  /**
   * Check if cache is expired
   * @private
   * @param {string} cachedAt - ISO timestamp when profile was cached
   * @returns {boolean}
   */
  _isCacheExpired(cachedAt) {
    try {
      if (!cachedAt) return true;

      const cacheTime = new Date(cachedAt).getTime();
      const now = new Date().getTime();
      const age = now - cacheTime;

      return age > this.CACHE_TTL;
    } catch (err) {
      console.error("❌ Error checking cache expiration:", err);
      return true;
    }
  }

  /**
   * Get cache statistics
   * @returns {Object} Stats about cached profiles
   */
  getCacheStats() {
    try {
      const cache = this._getCache();
      const profiles = Object.values(cache);
      const validProfiles = profiles.filter(
        (p) => !this._isCacheExpired(p.cachedAt)
      );

      return {
        totalCached: profiles.length,
        validProfiles: validProfiles.length,
        expiredProfiles: profiles.length - validProfiles.length,
        cacheSize: new Blob([JSON.stringify(cache)]).size,
        lastUpdated: localStorage.getItem(this.CACHE_TIMESTAMP_KEY),
      };
    } catch (err) {
      console.error("❌ Error getting cache stats:", err);
      return null;
    }
  }

  /**
   * Clean up expired profiles from cache
   */
  cleanupExpired() {
    try {
      const cache = this._getCache();
      const before = Object.keys(cache).length;

      Object.keys(cache).forEach((userId) => {
        if (this._isCacheExpired(cache[userId].cachedAt)) {
          delete cache[userId];
        }
      });

      const after = Object.keys(cache).length;
      this._saveCache(cache);

      console.log(
        `✅ Profile cache cleanup: removed ${before - after} expired entries`
      );
      return before - after;
    } catch (err) {
      console.error("❌ Error cleaning up expired profiles:", err);
      return 0;
    }
  }
}

// Export singleton instance
export default new ProfileCacheService();
