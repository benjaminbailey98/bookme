'use client';

import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query } from 'firebase/firestore';
import type { ArtistProfile } from '@/lib/types';
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
import {
  Youtube,
  Instagram,
  Facebook,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const artistImages = PlaceHolderImages.filter(img => img.id.startsWith('artist-'));

export default function ArtistsPage() {
  const firestore = useFirestore();

  const artistsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'artist_profiles'));
  }, [firestore]);

  const { data: artists, isLoading } =
    useCollection<ArtistProfile>(artistsQuery);

  return (
    <div className="container mx-auto py-12 md:py-20">
      <div className="space-y-2 text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tighter font-headline">
          Meet Our Artists
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          A curated selection of the best local talent. Find the perfect vibe
          for your next event.
        </p>
      </div>

      {isLoading && (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
        </div>
      )}

      {!isLoading && artists && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {artists.map((artist, index) => {
             const image =
             artist.artistProfilePictureUrl ||
             artistImages[index % artistImages.length].imageUrl;
            const imageHint = artistImages[index % artistImages.length].imageHint;

            return(
            <Card key={artist.id} className="flex flex-col">
              <CardHeader className="p-0">
                  <div className="relative aspect-video w-full">
                     <Image
                        src={image}
                        alt={artist.stageName}
                        fill
                        className="rounded-t-lg object-cover"
                        data-ai-hint={imageHint}
                      />
                  </div>
              </CardHeader>
              <CardContent className="flex-grow p-6">
                <CardTitle className="mb-2">{artist.stageName}</CardTitle>
                <CardDescription className="line-clamp-3">{artist.shortBio}</CardDescription>
                 <div className="flex items-center gap-4 mt-4">
                      {artist.youtubeUrl && (
                        <Link
                          href={artist.youtubeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-primary"
                        >
                          <Youtube className="h-6 w-6" />
                        </Link>
                      )}
                      {artist.instagramUrl && (
                        <Link
                          href={artist.instagramUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-primary"
                        >
                          <Instagram className="h-6 w-6" />
                        </Link>
                      )}
                      {artist.facebookUrl && (
                        <Link
                          href={artist.facebookUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-primary"
                        >
                          <Facebook className="h-6 w-6" />
                        </Link>
                      )}
                    </div>
              </CardContent>
              <CardFooter className="p-6 pt-0">
                <Button asChild className="w-full">
                  <Link href={`/artists/${artist.id}`}>
                    View Profile
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          )})}
        </div>
      )}

      {!isLoading && (!artists || artists.length === 0) && (
        <div className="text-center text-muted-foreground py-10">
          <p>No artists have been added yet. Check back soon!</p>
        </div>
      )}
    </div>
  );
}
