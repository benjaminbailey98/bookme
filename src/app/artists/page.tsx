
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Youtube, Instagram, Twitter } from 'lucide-react';
import Link from 'next/link';

const artists = [
  {
    id: 'benji-muziq',
    stageName: 'Benji Muziq',
    bio: 'Soulful singer-songwriter with a knack for heartfelt lyrics and captivating melodies. Perfect for intimate events and weddings.',
    socials: {
      youtube: 'https://youtube.com',
      instagram: 'https://instagram.com',
      twitter: 'https://twitter.com',
    },
    imageId: 'artist-1',
  },
  {
    id: 'vibe-setters',
    stageName: 'Vibe Setters',
    bio: 'High-energy party band that guarantees a packed dance floor. Playing all your favorite hits from the 70s to today.',
    socials: {
      youtube: 'https://youtube.com',
      instagram: 'https://instagram.com',
      twitter: 'https://twitter.com',
    },
    imageId: 'artist-3',
  },
  {
    id: 'dj-smooth',
    stageName: 'DJ Smooth',
    bio: 'Versatile DJ who can spin everything from hip-hop to house. Known for seamless transitions and reading the crowd.',
    socials: {
      youtube: 'https://youtube.com',
      instagram: 'https://instagram.com',
      twitter: 'https://twitter.com',
    },
    imageId: 'artist-2',
  },
  {
    id: 'acoustic-soul',
    stageName: 'Acoustic Soul',
    description: 'A female acoustic guitarist and singer.',
    bio: 'A solo performer creating a chill and soulful atmosphere with her acoustic guitar and smooth vocals. Ideal for cafes, lounges, and private parties.',
    socials: {
      youtube: 'https://youtube.com',
      instagram: 'https://instagram.com',
      twitter: 'https://twitter.com',
    },
    imageId: 'artist-4',
  }
];

export default function ArtistsPage() {
  return (
    <div className="container mx-auto py-12 md:py-20">
      <div className="space-y-2 text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tighter font-headline">
          Meet Our Artists
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          A curated selection of the best local talent. Find the perfect vibe for your next event.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {artists.map((artist) => {
          const image = PlaceHolderImages.find((img) => img.id === artist.imageId);
          return (
            <Card key={artist.id} className="flex flex-col">
              <CardContent className="p-6 flex-grow">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
                    {image && (
                      <div className="w-32 h-32 relative mb-4">
                        <Image
                          src={image.imageUrl}
                          alt={artist.stageName}
                          fill
                          className="rounded-full object-cover"
                          data-ai-hint={image.imageHint}
                        />
                      </div>
                    )}
                    <div className="flex items-center gap-4">
                      <Link href={artist.socials.youtube} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
                        <Youtube className="h-6 w-6" />
                      </Link>
                       <Link href={artist.socials.instagram} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
                        <Instagram className="h-6 w-6" />
                      </Link>
                       <Link href={artist.socials.twitter} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
                        <Twitter className="h-6 w-6" />
                      </Link>
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <CardTitle className="mb-2">{artist.stageName}</CardTitle>
                    <CardDescription>{artist.bio}</CardDescription>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="p-6 pt-0">
                 <Button asChild className="w-full">
                  <Link href={`/book?artist=${artist.id}`}>Book {artist.stageName}</Link>
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
