
'use server';

import { initializeApp, getApps, App } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { ArtistProfile, User } from '@/lib/types';
import { firebaseConfig } from '@/firebase/config';

// This is a temporary solution for server-side Firebase admin actions.
// In a real-world scenario, you would use a more secure way to manage service accounts.
const getApp = (): App => {
  if (getApps().length > 0) {
    return getApps()[0];
  }
  return initializeApp(firebaseConfig);
};

export async function createAccountAndProfile(
  profileData: Omit<ArtistProfile, 'id' | 'userId'>,
  password: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const app = getApp();
    const auth = getAuth(app);
    const firestore = getFirestore(app);

    // 1. Create the user account in Firebase Auth
    // This is not a true admin action, as it requires re-authentication,
    // but it's a workaround without a full admin backend.
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      profileData.personalEmail,
      password
    );
    const userRecord = userCredential.user;

    // 2. Create the user document in the `users` collection
    const userDocRef = doc(firestore, 'users', userRecord.uid);
    const newUserData: User = {
      id: userRecord.uid,
      email: profileData.personalEmail,
      registrationDate: new Date().toISOString(),
      isVenue: false,
      displayName: profileData.stageName,
    };
    await setDoc(userDocRef, newUserData);

    // 3. Create the artist_profile document
    const artistProfileRef = doc(firestore, 'artist_profiles', userRecord.uid);
    const newArtistProfile: ArtistProfile = {
      ...profileData,
      id: userRecord.uid,
      userId: userRecord.uid,
    };
    await setDoc(artistProfileRef, newArtistProfile);

    return { success: true };
  } catch (error: any) {
    console.error('Error creating artist account and profile:', error);
    // It's better to sign out the newly created user if subsequent steps fail
    // to avoid leaving orphaned auth accounts.
    return {
      success: false,
      error: error.message || 'An unknown error occurred.',
    };
  }
}
