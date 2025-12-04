'use server';

import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { ArtistProfile, User } from '@/lib/types';
import { firebaseConfig } from '@/firebase/config';

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
  try {
    const app = getApp();
    const auth = getAuth(app);
    const firestore = getFirestore(app);

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
