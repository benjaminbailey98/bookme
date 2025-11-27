
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
  PlayCircle,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
              <CardContent className="p-6 flex-grow">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
                    <div className="w-32 h-32 relative mb-4">
                      <Image
                        src={image}
                        alt={artist.stageName}
                        fill
                        className="rounded-full object-cover"
                        data-ai-hint={imageHint}
                      />
                    </div>
                    <div className="flex items-center gap-4">
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
                  </div>
                  <div className="sm:col-span-2">
                    <CardTitle className="mb-2">{artist.stageName}</CardTitle>
                    <CardDescription>{artist.shortBio}</CardDescription>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="p-6 pt-0 flex justify-between items-center">
                {artist.artistPerformingVideoUrl ? (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline">
                        <PlayCircle className="mr-2 h-4 w-4" />
                        Watch Video
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl">
                      <DialogHeader>
                        <DialogTitle>{artist.stageName} - Video</DialogTitle>
                      </DialogHeader>
                      <div className="aspect-video">
                        <iframe
                          width="100%"
                          height="100%"
                          src={artist.artistPerformingVideoUrl}
                          title="YouTube video player"
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        ></iframe>
                      </div>
                    </DialogContent>
                  </Dialog>
                ) : (
                  <div /> // Empty div to maintain spacing
                )}
                <Button asChild>
                  <Link href={`/book?artist=${artist.id}`}>
                    Book {artist.stageName}
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
