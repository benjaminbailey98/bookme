import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';
import Link from 'next/link';
import { Music4 } from 'lucide-react';

export default function Home() {
  const heroImage = PlaceHolderImages.find((img) => img.id === 'hero-concert');

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      <section className="relative w-full h-[60vh] md:h-[70vh]">
        {heroImage && (
          <Image
            src={heroImage.imageUrl}
            alt={heroImage.description}
            fill
            className="object-cover"
            priority
            data-ai-hint={heroImage.imageHint}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        <div className="relative container mx-auto flex h-full items-end pb-16 md:pb-24 text-center md:text-left">
          <div className="max-w-3xl space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold font-headline tracking-tighter text-foreground">
              Book Your Vibe, Unforgettable Events Start Here.
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl">
              Vibe Request is your one-stop platform to connect with talented local entertainers. Find the perfect artist for your wedding, concert, or private party.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Button asChild size="lg" className="font-bold">
                <Link href="/book">Submit a Booking Request</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="font-bold">
                <Link href="/artists">Browse Artists</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold font-headline">How It Works</h2>
            <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
              A simple, streamlined process to bring live entertainment to your doorstep.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center space-y-4">
              <div className="bg-primary text-primary-foreground rounded-full p-4">
                <Music4 className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold font-headline">1. Find Your Artist</h3>
              <p className="text-muted-foreground">
                Explore our curated library of diverse local talent. View profiles, watch performance videos, and find the perfect match for your event's vibe.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-4">
               <div className="bg-primary text-primary-foreground rounded-full p-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-file-pen-line"><path d="M10 15h4"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M17 22H7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h7l5 5v3"/><path d="M22 13.34v- facteurs.5 M16 19.5 22 13.5l-4-4-6 6v4h4Z"/></svg>
              </div>
              <h3 className="text-xl font-bold font-headline">2. Submit a Request</h3>
              <p className="text-muted-foreground">
                Fill out our intuitive booking form with your event details. Our AI assistant can even help you with suggestions for themes and attire!
              </p>
            </div>
            <div className="flex flex-col items-center space-y-4">
               <div className="bg-primary text-primary-foreground rounded-full p-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-party-popper"><path d="M5.8 11.3 2 22l10.7-3.79"/><path d="M4 14.12A22.13 22.13 0 0 1 11.23 2a22.13 22.13 0 0 1 7.23 12.12"/><path d="M18.8 11.3 22 22l-10.7-3.79"/><path d="m11.23 2 1.5 3.5-2.5 2.5 3.5 1.5 2.5-2.5 1.5 3.5"/><path d="M7.23 13.5 5.5 12l-2.5 2.5 1.5 3.5 2.5-2.5 3.5 1.5-2.5-2.5Z"/></svg>
              </div>
              <h3 className="text-xl font-bold font-headline">3. Get Ready to Vibe</h3>
              <p className="text-muted-foreground">
                Once the artist confirms, you're all set. Prepare for an unforgettable experience with top-tier live entertainment.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
