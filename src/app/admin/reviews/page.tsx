'use client';

import { useMemo } from 'react';
import { collection, query } from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import type { Review, ArtistProfile, VenueProfile } from '@/lib/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Loader2, Star } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

export default function AdminReviewsPage() {
  const firestore = useFirestore();

  const reviewsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'reviews'));
  }, [firestore]);

  const artistsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'artist_profiles'));
  }, [firestore]);

  const venuesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'venue_profiles'));
  }, [firestore]);

  const { data: reviews, isLoading: reviewsLoading } =
    useCollection<Review>(reviewsQuery);
  const { data: artists, isLoading: artistsLoading } =
    useCollection<ArtistProfile>(artistsQuery);
  const { data: venues, isLoading: venuesLoading } =
    useCollection<VenueProfile>(venuesQuery);

  const profileMap = useMemo(() => {
    const map = new Map<string, string>();
    if (artists) {
      artists.forEach((artist) => map.set(artist.id, artist.stageName));
    }
    if (venues) {
      venues.forEach((venue) => map.set(venue.id, venue.companyName));
    }
    return map;
  }, [artists, venues]);

  const isLoading = reviewsLoading || artistsLoading || venuesLoading;

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < rating
                ? 'text-primary fill-primary'
                : 'text-muted-foreground'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Manage Reviews</h2>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>All User Reviews</CardTitle>
          <CardDescription>
            A list of all reviews submitted by artists and venues.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Reviewer</TableHead>
                <TableHead>Reviewee</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Comment</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
                  </TableCell>
                </TableRow>
              )}
              {!isLoading && reviews && reviews.length > 0 ? (
                reviews.map((review) => (
                  <TableRow key={review.id}>
                    <TableCell>
                      {review.createdAt?.toDate
                        ? format(review.createdAt.toDate(), 'PPP')
                        : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        {profileMap.get(review.reviewerId) || 'Unknown User'}
                      </div>
                      <Badge variant="outline">{review.reviewerRole}</Badge>
                    </TableCell>
                     <TableCell>
                      <div className="font-medium">
                        {profileMap.get(review.revieweeId) || 'Unknown User'}
                      </div>
                      <Badge variant="secondary">{review.reviewerRole === 'artist' ? 'venue' : 'artist'}</Badge>
                    </TableCell>
                    <TableCell>{renderStars(review.rating)}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {review.reviewText || '-'}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                !isLoading && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="h-24 text-center text-muted-foreground"
                    >
                      No reviews found.
                    </TableCell>
                  </TableRow>
                )
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
