
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
