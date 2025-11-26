'use server';

import { initializeApp, getApps, App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { ArtistProfile, User } from '@/lib/types';
import { firebaseConfig } from '@/firebase/config';

// This is a temporary solution for server-side Firebase admin actions.
// In a real-world scenario, you would use a more secure way to manage service accounts.
const getAdminApp = (): App => {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  // Horrible hack to get around a bug in the Firebase Admin SDK
  // where it doesn't correctly parse the service account JSON.
  const serviceAccount = JSON.parse(
    process.env.FIREBASE_SERVICE_ACCOUNT_KEY as string
  );

  return initializeApp({
    credential: {
      projectId: serviceAccount.project_id,
      clientEmail: serviceAccount.client_email,
      privateKey: serviceAccount.private_key,
    },
    databaseURL: `https://${firebaseConfig.projectId}.firebaseio.com`,
  });
};

export async function createAccountAndProfile(
  profileData: Omit<ArtistProfile, 'id' | 'userId'>,
  password: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const adminApp = getAdminApp();
    const auth = getAuth(adminApp);
    const firestore = getFirestore(adminApp);

    // 1. Create the user account in Firebase Auth
    const userRecord = await auth.createUser({
      email: profileData.personalEmail,
      password: password,
      displayName: profileData.stageName,
    });

    // 2. Create the user document in the `users` collection
    const userDocRef = firestore.collection('users').doc(userRecord.uid);
    const newUserData: User = {
      id: userRecord.uid,
      email: profileData.personalEmail,
      registrationDate: new Date().toISOString(),
      isVenue: false,
    };
    await userDocRef.set(newUserData);

    // 3. Create the artist_profile document
    const artistProfileRef = firestore
      .collection('artist_profiles')
      .doc(userRecord.uid);
    const newArtistProfile: ArtistProfile = {
      ...profileData,
      id: userRecord.uid,
      userId: userRecord.uid,
    };
    await artistProfileRef.set(newArtistProfile);

    return { success: true };
  } catch (error: any) {
    console.error('Error creating artist account and profile:', error);
    return {
      success: false,
      error: error.message || 'An unknown error occurred.',
    };
  }
}
