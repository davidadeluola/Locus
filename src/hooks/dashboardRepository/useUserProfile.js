import { useState, useEffect } from 'react';
import { UserRepository } from '../../repositories/implementations';

/**
 * Hook for fetching user profile with details
 * @param {string} userId - User ID
 * @returns {{
 *   user: any,
 *   profile: import('../../types').UserProfile | null,
 *   loading: boolean,
 *   error: Error | null
 * }}
 */
export function useUserProfile(userId) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        setLoading(true);
        const data = await UserRepository.fetchUserWithProfile(userId);
        setUser(data.user);
        setProfile(data.profile);
      } catch (err) {
        console.error('❌ Error fetching user profile:', err);
        setError(err instanceof Error ? err : new Error('Failed to load profile'));
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  return {
    user,
    profile,
    loading,
    error,
  };
}
