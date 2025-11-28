
'use server';

import { initializeApp, getApps, App } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { VenueProfile, User } from '@/lib/types';
import { firebaseConfig } from '@/firebase/config';

// This is a temporary solution for server-side Firebase admin actions.
// In a real-world scenario, you would use a more secure way to manage service accounts.
const getApp = (): App => {
  if (getApps().length > 0) {
    return getApps()[0];
  }
  return initializeApp(firebaseConfig);
};

export async function createVenueAccountAndProfile(
  profileData: Omit<VenueProfile, 'id' | 'userId'>,
  password: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const app = getApp();
    const auth = getAuth(app);
    const firestore = getFirestore(app);

    // 1. Create the user account in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      profileData.companyEmail,
      password
    );
    const userRecord = userCredential.user;

    // 2. Create the user document in the `users` collection
    const userDocRef = doc(firestore, 'users', userRecord.uid);
    const newUserData: User = {
      id: userRecord.uid,
      email: profileData.companyEmail,
      registrationDate: new Date().toISOString(),
      isVenue: true,
      displayName: profileData.companyName,
    };
    await setDoc(userDocRef, newUserData);

    // 3. Create the venue_profile document
    const venueProfileRef = doc(firestore, 'venue_profiles', userRecord.uid);
    const newVenueProfile: VenueProfile = {
      ...profileData,
      id: userRecord.uid,
      userId: userRecord.uid,
    };
    await setDoc(venueProfileRef, newVenueProfile);

    return { success: true };
  } catch (error: any) {
    console.error('Error creating venue account and profile:', error);
    return {
      success: false,
      error: error.message || 'An unknown error occurred.',
    };
  }
}
