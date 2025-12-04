'use client';

import { useMemo } from 'react';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { User as AuthUser } from 'firebase/auth';
import type { User as AppUser } from '@/lib/types';

interface UserProfileResult {
  user: (AuthUser & AppUser) | null;
  isUserLoading: boolean;
  userError: Error | null;
}

/**
 * Hook to get the authenticated user object combined with their profile from Firestore.
 * @returns {UserProfileResult} Object with the combined user profile, loading state, and error.
 */
export function useUserProfile(): UserProfileResult {
  const { user: authUser, isUserLoading: isAuthLoading, userError: authError } = useUser();
  const firestore = useFirestore();

  const userProfileRef = useMemoFirebase(() => {
    if (!firestore || !authUser) return null;
    return doc(firestore, 'users', authUser.uid);
  }, [firestore, authUser]);

  const { data: userProfile, isLoading: isProfileLoading, error: profileError } = useDoc<AppUser>(userProfileRef);

  const user = useMemo(() => {
    if (!authUser || !userProfile) return null;
    return { ...authUser, ...userProfile };
  }, [authUser, userProfile]);

  return {
    user,
    isUserLoading: isAuthLoading || isProfileLoading,
    userError: authError || profileError,
  };
}
