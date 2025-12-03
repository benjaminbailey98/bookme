
'use server';

import {
  intelligentFormCompletion,
  type IntelligentFormCompletionInput,
  type IntelligentFormCompletionOutput,
} from '@/ai/flows/intelligent-form-completion';
import { addDoc, collection, serverTimestamp, Timestamp } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { BookingRequest } from '@/lib/types';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { firebaseConfig } from '@/firebase/config';

// Helper to get a server-side Firebase app instance
const getApp = (): FirebaseApp => {
  if (getApps().length > 0) {
    return getApps()[0];
  }
  return initializeApp(firebaseConfig);
};


export async function getSuggestions(
  input: IntelligentFormCompletionInput
): Promise<
  | { success: true; data: IntelligentFormCompletionOutput }
  | { success: false; error: string }
> {
  try {
    const output = await intelligentFormCompletion(input);
    return { success: true, data: output };
  } catch (error) {
    console.error('Error getting AI suggestions:', error);
    return {
      success: false,
      error: 'An unexpected error occurred while fetching suggestions.',
    };
  }
}


export async function submitBookingRequest(
  requestData: Omit<BookingRequest, 'id' | 'status'>,
  venueProfileId: string,
): Promise<{ success: boolean; error?: string; bookingId?: string; }> {
  try {
    const app = getApp();
    const firestore = getFirestore(app);

    const bookingCollection = collection(firestore, 'venue_profiles', venueProfileId, 'booking_requests');
    
    // The requestData.eventDate is a Date object from the form, it needs to be converted to a Firestore Timestamp
    const bookingDataWithTimestamp = {
      ...requestData,
      eventDate: Timestamp.fromDate(requestData.eventDate as unknown as Date),
      status: 'pending' as const,
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(bookingCollection, bookingDataWithTimestamp);

    return { success: true, bookingId: docRef.id };
    
  } catch (error: any) {
    console.error('Error submitting booking request:', error);
    
    // We can't use the client-side errorEmitter here in the same way,
    // but we can return a structured error message.
    // In a real app, you might log this to a more robust monitoring service.
    
    // A generic permission error for Firestore is often 'permission-denied'
    if (error.code === 'permission-denied') {
       return {
        success: false,
        error: 'Permission denied. You may not have the rights to create a booking for this venue.',
      };
    }

    return { success: false, error: 'An unknown server error occurred.' };
  }
}
