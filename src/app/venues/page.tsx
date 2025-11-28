
'use client';

import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query } from 'firebase/firestore';
import type { VenueProfile } from '@/lib/types';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const venueImages = PlaceHolderImages.filter(img => img.id.startsWith('venue-'));

export default function VenuesPage() {
  const firestore = useFirestore();

  const venuesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'venue_profiles'));
  }, [firestore]);

  const { data: venues, isLoading } = useCollection<VenueProfile>(venuesQuery);

  return (
    <div className="container mx-auto py-12 md:py-20">
      <div className="space-y-2 text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tighter font-headline">
          Discover Venues
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Explore amazing venues perfect for hosting your next live entertainment event.
        </p>
      </div>

      {isLoading && (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
        </div>
      )}

      {!isLoading && venues && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {venues.map((venue, index) => {
            const image =
              venue.companyLogoUrl ||
              venueImages[index % venueImages.length].imageUrl;
            const imageHint = venueImages[index % venueImages.length].imageHint;

            return (
              <Card key={venue.id} className="flex flex-col">
                <CardHeader>
                  <div className="relative aspect-video w-full">
                    <Image
                      src={image}
                      alt={venue.companyName}
                      fill
                      className="rounded-t-lg object-cover"
                      data-ai-hint={imageHint}
                    />
                  </div>
                </CardHeader>
                <CardContent className="flex-grow">
                  <CardTitle className="mb-1">{venue.companyName}</CardTitle>
                  <CardDescription>{venue.companyAddress}</CardDescription>
                </CardContent>
                <CardFooter className="p-6 pt-0">
                  <Button asChild className="w-full">
                    <Link href={`/venues/${venue.id}`}>View Details</Link>
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      {!isLoading && (!venues || venues.length === 0) && (
        <div className="text-center text-muted-foreground py-10">
          <p>No venues have been added yet. Check back soon!</p>
        </div>
      )}
    </div>
  );
}
