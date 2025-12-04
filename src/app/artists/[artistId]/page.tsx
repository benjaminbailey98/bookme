'use client';

import { useParams } from 'next/navigation';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { ArtistProfile } from '@/lib/types';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  Youtube,
  Instagram,
  Facebook,
  Music,
  Globe,
  Loader2,
  Link as LinkIcon,
} from 'lucide-react';
import Link from 'next/link';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function ArtistPublicProfilePage() {
  const params = useParams();
  const firestore = useFirestore();
  const artistId = params.artistId as string;

  const artistRef = useMemoFirebase(() => {
    if (!firestore || !artistId) return null;
    return doc(firestore, 'artist_profiles', artistId);
  }, [firestore, artistId]);

  const { data: artist, isLoading } = useDoc<ArtistProfile>(artistRef);

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!artist) {
    return (
      <div className="container mx-auto py-20 text-center">
        <h1 className="text-2xl font-bold">Artist Not Found</h1>
        <p className="text-muted-foreground">
          The artist you are looking for does not exist.
        </p>
        <Button asChild className="mt-4">
          <Link href="/artists">Browse Other Artists</Link>
        </Button>
      </div>
    );
  }
  
  const heroImage = artist.artistProfilePictureUrl || PlaceHolderImages.find(img => img.id === 'hero-concert')?.imageUrl || '';

  return (
    <div className="min-h-screen">
      <section className="relative h-[50vh] bg-muted">
        <Image
          src={heroImage}
          alt={artist.stageName}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
      </section>

      <div className="container mx-auto -mt-24 md:-mt-32 pb-24">
        <div className="relative z-10 flex flex-col items-center md:flex-row md:items-end gap-6">
          <Avatar className="h-40 w-40 md:h-56 md:w-56 border-4 border-background">
            <AvatarImage src={artist.artistProfilePictureUrl} />
            <AvatarFallback className="text-6xl">
              {artist.stageName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="text-center md:text-left md:pb-6">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tighter font-headline">
              {artist.stageName}
            </h1>
            <p className="text-lg text-muted-foreground">
              {artist.realName}
            </p>
          </div>
           <div className="md:ml-auto md:pb-6 w-full md:w-auto">
             <Button asChild size="lg" className="w-full md:w-auto">
               <Link href={`/book?artist=${artist.id}`}>Book {artist.stageName}</Link>
             </Button>
           </div>
        </div>

        <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          <div className="lg:col-span-2 space-y-8">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold font-headline">About {artist.stageName}</h2>
              <p className="text-muted-foreground whitespace-pre-wrap">{artist.shortBio}</p>
            </div>
            {artist.artistPerformingVideoUrl && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold font-headline">Performance Video</h2>
                 <div className="aspect-video overflow-hidden rounded-lg border">
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
              </div>
            )}
          </div>
          <div className="space-y-6">
            <h2 className="text-2xl font-bold font-headline">Connect</h2>
             <div className="space-y-3">
              {artist.websiteUrl && <SocialLink href={artist.websiteUrl} icon={Globe} label="Website" />}
              {artist.instagramUrl && <SocialLink href={artist.instagramUrl} icon={Instagram} label="Instagram" />}
              {artist.facebookUrl && <SocialLink href={artist.facebookUrl} icon={Facebook} label="Facebook" />}
              {artist.youtubeUrl && <SocialLink href={artist.youtubeUrl} icon={Youtube} label="YouTube" />}
              {artist.spotifyUrl && <SocialLink href={artist.spotifyUrl} icon={Music} label="Spotify" />}
              {artist.additionalLinks?.map(link => (
                  <SocialLink key={link.platform} href={link.url} icon={LinkIcon} label={link.platform} />
              ))}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface SocialLinkProps {
    href: string;
    icon: React.ElementType;
    label: string;
}

const SocialLink = ({ href, icon: Icon, label }: SocialLinkProps) => (
    <Link href={href} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 group">
        <div className="rounded-full border p-2 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
            <Icon className="h-5 w-5" />
        </div>
        <span className="text-muted-foreground group-hover:text-primary transition-colors">{label}</span>
    </Link>
)
