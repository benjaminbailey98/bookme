
'use server';

import {
  intelligentFormCompletion,
  type IntelligentFormCompletionInput,
  type IntelligentFormCompletionOutput,
} from '@/ai/flows/intelligent-form-completion';
import { addDoc, collection, doc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';
import { BookingRequest } from '@/lib/types';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

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

// NOTE: This server action uses the Firebase Admin SDK implicitly through initializeFirebase
// and getFirestore. This is a simplified approach for demonstration. In a production
// environment, you would want to use the Firebase Admin SDK more explicitly for server-side
// operations, with proper service account authentication.
export async function submitBookingRequest(
  requestData: Omit<BookingRequest, 'id' | 'status' | 'venueProfileId'>,
  venueProfileId: string,
): Promise<{ success: boolean; error?: string; bookingId?: string; }> {
  try {
    // This is a simplified way to get a server-side firestore instance.
    const { firestore } = initializeFirebase();

    const bookingCollectionRef = collection(firestore, 'venue_profiles', venueProfileId, 'booking_requests');

    const newBookingData = {
        ...requestData,
        eventDate: Timestamp.fromDate(new Date(requestData.eventDate)),
        status: 'pending' as const,
        venueProfileId: venueProfileId,
    };
    
    const docRef = await addDoc(bookingCollectionRef, newBookingData);
    
    return { success: true, bookingId: docRef.id };
  } catch (error: any) {
    console.error('Error submitting booking request:', error);
    // In a real app, you might not want to expose raw error messages to the client.
    // However, for debugging and the contextual error system, this is useful.
    // The FirestorePermissionError logic would typically be in a client-side call
    // wrapper, but we place a server-side log here for visibility.
    return {
      success: false,
      error: error.message || 'An unknown error occurred while submitting the request.',
    };
  }
}
