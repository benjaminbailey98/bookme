

import type { Timestamp } from 'firebase/firestore';

export type ImagePlaceholder = {
  id: string;
  description: string;
  imageUrl: string;
  imageHint: string;
};

export interface User {
    id: string;
    email: string;
    registrationDate: string;
    isVenue?: boolean;
    displayName?: string;
    phoneNumber?: string;
}

export interface VenueProfile {
    id: string;
    userId: string;
    companyName: string;
    companyEmail: string;
    companyPhone: string;
    companyLogoUrl?: string;
    companyAddress: string;
    businessHours: string;
    contactTitle: string;
    contactName: string;
    contactEmail: string;
    contactPhone: string;
}

export interface ArtistProfile {
    id: string;
    userId: string;
    stageName: string;
    realName: string;
    personalEmail: string;
    personalPhone: string;
    shortBio: string;
    websiteUrl?: string;
    instagramUrl?: string;
    facebookUrl?: string;
    youtubeUrl?: string;
    spotifyUrl?: string;
    additionalLinks?: { platform: string; url: string }[];
    managementCompanyName?: string;
    managementContactPerson?: string;
    managementEmail?: string;
    managementPhone?: string;
    artistProfilePictureUrl?: string;
    artistPerformingVideoUrl?: string;
}

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
    status?: 'pending' | 'confirmed' | 'declined' | 'completed';
    venueOwnerId?: string;
}
  
export interface Subscription {
    id: string;
    userId: string;
    startDate: Timestamp;
    dueDate: Timestamp;
    accountStatus: 'active' | 'inactive' | 'paused' | 'canceled';
    paymentHistory: string[];
    paymentStatus: 'paid' | 'delinquent';
}

export interface Review {
    id: string;
    bookingRequestId: string;
    artistProfileId: string;
    venueProfileId: string;
    rating: number; // 1-5
    reviewText: string;
    createdAt: Timestamp;
}
