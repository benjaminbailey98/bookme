
'use client';

import { collection, query, where } from 'firebase/firestore';
import { useFirestore, useUser, useCollection, useMemoFirebase } from '@/firebase';
import type { Review } from '@/lib/types';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Loader2, Star } from 'lucide-react';
import { format } from 'date-fns';

export default function VenueReviewsPage() {
  const { user } = useUser();
  const firestore = useFirestore();

  const reviewsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(
      collection(firestore, 'reviews'),
      where('venueProfileId', '==', user.uid)
    );
  }, [firestore, user]);

  const { data: reviews, isLoading } = useCollection<Review>(reviewsQuery);

  return (
    <div className="container mx-auto max-w-4xl py-12 md:py-20">
      <div className="space-y-2 text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tighter font-headline">
          Artist Reviews
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          A collection of all the reviews you've submitted for artists.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Submitted Reviews</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {isLoading ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : reviews && reviews.length > 0 ? (
            reviews.map((review) => (
              <Card key={review.id} className="bg-muted/50">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center justify-between">
                    <span>For Artist: {review.artistProfileId}</span>
                    <div className="flex items-center gap-1">
                      <span className="text-base font-bold">{review.rating}</span>
                      <Star className="h-5 w-5 text-primary fill-primary" />
                    </div>
                  </CardTitle>
                  <CardDescription>
                     {review.createdAt && `Reviewed on ${format(review.createdAt.toDate(), 'PPP')}`}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm italic">"{review.reviewText}"</p>
                </CardContent>
              </Card>
            ))
          ) : (
            <p className="text-center text-muted-foreground py-10">
              You haven't submitted any reviews yet.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
