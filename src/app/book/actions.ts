'use server';

import { addDoc, collection, doc, getDoc } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';
import type { BookingRequest, VenueProfile } from '@/lib/types';
import { Timestamp } from 'firebase/firestore';

type BookingData = Omit<
  BookingRequest,
  'id' | 'eventDate' | 'status' | 'venueOwnerId'
> & {
  eventDate: Date;
};

export async function submitBookingRequest(
  data: BookingData,
  venueProfileId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { firestore } = initializeFirebase();

    let venueOwnerId: string | undefined = undefined;
    if (venueProfileId !== 'one-time-booking') {
        const venueProfileRef = doc(firestore, 'venue_profiles', venueProfileId);
        const venueProfileSnap = await getDoc(venueProfileRef);
        if (venueProfileSnap.exists()) {
            const venueData = venueProfileSnap.data() as VenueProfile;
            venueOwnerId = venueData.userId;
        }
    }


    const bookingCollectionRef = collection(
      firestore,
      `venue_profiles/${venueProfileId}/booking_requests`
    );

    const bookingRequestData: Omit<BookingRequest, 'id'> = {
      ...data,
      eventDate: Timestamp.fromDate(data.eventDate),
      status: 'pending',
      venueProfileId: venueProfileId,
      venueOwnerId: venueOwnerId, 
    };

    await addDoc(bookingCollectionRef, bookingRequestData);

    return { success: true };
  } catch (error: any) {
    console.error('Error submitting booking request:', error);
    return {
      success: false,
      error: error.message || 'An unknown error occurred.',
    };
  }
}
