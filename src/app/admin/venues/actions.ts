
'use server';

import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { VenueProfile, User } from '@/lib/types';
import { firebaseConfig } from '@/firebase/config';


const getApp = (): FirebaseApp => {
  if (getApps().length > 0) {
    return getApps()[0];
  }
  return initializeApp(firebaseConfig);
};

export async function createVenueAccountAndProfile(
  profileData: Omit<VenueProfile, 'id' | 'userId'>,
  password: string
): Promise<{ success: boolean; error?: string }> {
  // This server action attempts to use client-side auth methods on the server,
  // which is not the correct pattern. A proper implementation would use the
  // Firebase Admin SDK in a secure backend environment.
  try {
    const app = getApp();
    const auth = getAuth(app);
    const firestore = getFirestore(app);

    const userCredential = await createUserWithEmailAndPassword(
      auth,
      profileData.companyEmail,
      password
    );
    const userRecord = userCredential.user;

    const userDocRef = doc(firestore, 'users', userRecord.uid);
    const newUserData: User = {
      id: userRecord.uid,
      email: profileData.companyEmail,
      registrationDate: new Date().toISOString(),
      isVenue: true,
      displayName: profileData.companyName,
    };
    await setDoc(userDocRef, newUserData);

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
