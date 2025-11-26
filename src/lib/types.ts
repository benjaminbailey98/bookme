

import type { Timestamp } from 'firebase/firestore';

export type ImagePlaceholder = {
  id: string;
  description: string;
  imageUrl: string;
  imageHint: string;
};

export interface ArtistAvailability {
    id: string;
    artistProfileId: string;
    unavailableDate: string; // Stored as 'YYYY-MM-DD'
    unavailableStartTime?: string;
    unavailableEndTime?: string;
    isAllDay?: boolean;
}

export interface BookingRequest {
    id: string;
    venueProfileId: string;
    artistProfileId: string;
    eventDate: Timestamp;
    eventTime: string;
    lengthOfEvent: number;
    lengthOfPerformance: number;
    venueName: string;
    locationAddress: string;
    contactName: string;
    contactPhone: string;
    contactEmail: string;
    eventType: string;
    attire?: string;
    eventTheme?: string;
    liveEntertainmentBudget: number;
    isTicketedEvent?: boolean;
    ticketPrices?: string;
    entertainmentType: string;
    liveBandProvidedBy: 'venue' | 'artist';
    soundProvidedBy: 'venue' | 'artist';
    referralInfo?: string;
    status?: 'pending' | 'confirmed' | 'declined';
  }
  
