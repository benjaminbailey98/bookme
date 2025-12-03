
'use server';

import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { ArtistProfile, User } from '@/lib/types';
import { firebaseConfig } from '@/firebase/config';

// This is a temporary solution for server-side Firebase admin actions.
// In a real-world scenario, you would use a more secure way to manage service accounts
// and would not use client-side authentication logic on the server.
const getApp = (): FirebaseApp => {
  if (getApps().length > 0) {
    return getApps()[0];
  }
  return initializeApp(firebaseConfig);
};

export async function createAccountAndProfile(
  profileData: Omit<ArtistProfile, 'id' | 'userId'>,
  password: string
): Promise<{ success: boolean; error?: string }> {
  // This server action attempts to use client-side auth methods on the server,
  // which is not the correct pattern. A proper implementation would use the
  // Firebase Admin SDK in a secure backend environment (e.g., a Cloud Function)
  // to create users. We are modifying this to prevent build errors.
  
  try {
    const app = getApp();
    const auth = getAuth(app);
    const firestore = getFirestore(app);

    // This is NOT a real admin action. It uses client SDK's createUserWithEmailAndPassword
    // which requires the "admin" to essentially sign up as the new user, then sign back in.
    // This is a workaround for this specific project structure.
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      profileData.personalEmail,
      password
    );
    const userRecord = userCredential.user;

    const userDocRef = doc(firestore, 'users', userRecord.uid);
    const newUserData: User = {
      id: userRecord.uid,
      email: profileData.personalEmail,
      registrationDate: new Date().toISOString(),
      isVenue: false,
      displayName: profileData.stageName,
    };
    await setDoc(userDocRef, newUserData);

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
    return {
      success: false,
      error: error.message || 'An unknown error occurred.',
    };
  }
}
