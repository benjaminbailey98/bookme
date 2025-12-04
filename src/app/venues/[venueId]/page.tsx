'use client';

import { useParams } from 'next/navigation';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { VenueProfile } from '@/lib/types';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  Clock,
  Loader2,
  Mail,
  MapPin,
  Phone,
  User as UserIcon,
} from 'lucide-react';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function VenuePublicProfilePage() {
  const params = useParams();
  const firestore = useFirestore();
  const venueId = params.venueId as string;

  const venueRef = useMemoFirebase(() => {
    if (!firestore || !venueId) return null;
    return doc(firestore, 'venue_profiles', venueId);
  }, [firestore, venueId]);

  const { data: venue, isLoading } = useDoc<VenueProfile>(venueRef);
  
  const heroImage = PlaceHolderImages.find((img) => img.id === 'venue-1');

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!venue) {
    return (
      <div className="container mx-auto py-20 text-center">
        <h1 className="text-2xl font-bold">Venue Not Found</h1>
        <p className="text-muted-foreground">
          The venue you are looking for does not exist.
        </p>
        <Button asChild className="mt-4">
          <Link href="/venues">Browse Other Venues</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20">
       <section className="relative h-64 bg-muted">
        {heroImage && (
          <Image
            src={heroImage.imageUrl}
            alt={`${venue.companyName} background`}
            fill
            className="object-cover"
            priority
            data-ai-hint={heroImage.imageHint}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/50 to-transparent" />
      </section>

      <div className="container mx-auto -mt-20 pb-24">
         <div className="bg-background/80 backdrop-blur-md p-6 rounded-lg shadow-lg">
            <div className="flex flex-col md:flex-row items-center gap-6">
                <Avatar className="h-32 w-32 border-4 border-background">
                    <AvatarImage src={venue.companyLogoUrl} alt={venue.companyName} />
                    <AvatarFallback className="text-4xl">{venue.companyName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="text-center md:text-left">
                    <h1 className="text-4xl font-bold font-headline">{venue.companyName}</h1>
                    <p className="text-muted-foreground text-lg">{venue.companyAddress}</p>
                </div>
                <div className="md:ml-auto w-full md:w-auto pt-4 md:pt-0">
                    <Button asChild size="lg" className="w-full">
                        <Link href="/artists">Book an Artist for this Venue</Link>
                    </Button>
                </div>
            </div>
         </div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 flex flex-col gap-8">
               <Card>
                   <CardHeader>
                       <CardTitle>About {venue.companyName}</CardTitle>
                   </CardHeader>
                   <CardContent>
                       <p className="text-muted-foreground">
                           Detailed description about the venue will go here. This section can be used to highlight the venue's history, capacity, technical specifications, and unique features that make it an ideal choice for live entertainment.
                       </p>
                   </CardContent>
               </Card>
               <Card>
                   <CardHeader>
                       <CardTitle>Upcoming Events</CardTitle>
                   </CardHeader>
                   <CardContent>
                       <p className="text-muted-foreground">A list or calendar of upcoming public events at the venue would go here.</p>
                   </CardContent>
               </Card>
            </div>
             <div className="space-y-8">
                 <Card>
                     <CardHeader><CardTitle>Venue Details</CardTitle></CardHeader>
                     <CardContent className="space-y-4">
                        <InfoItem icon={MapPin} label="Address" value={venue.companyAddress} />
                        <InfoItem icon={Phone} label="Phone" value={venue.companyPhone} />
                        <InfoItem icon={Mail} label="Email" value={venue.companyEmail} />
                        <InfoItem icon={Clock} label="Hours" value={venue.businessHours} />
                     </CardContent>
                 </Card>
                 <Card>
                     <CardHeader><CardTitle>Booking Contact</CardTitle></CardHeader>
                     <CardContent className="space-y-4">
                        <InfoItem icon={UserIcon} label={venue.contactTitle} value={venue.contactName} />
                        <InfoItem icon={Phone} label="Contact Phone" value={venue.contactPhone} />
                        <InfoItem icon={Mail} label="Contact Email" value={venue.contactEmail} />
                     </CardContent>
                 </Card>
            </div>
        </div>
      </div>
    </div>
  );
}


interface InfoItemProps {
    icon: React.ElementType;
    label: string;
    value?: string;
}

const InfoItem = ({ icon: Icon, label, value }: InfoItemProps) => (
    <div className="flex items-start gap-4">
        <Icon className="h-5 w-5 text-muted-foreground mt-1 shrink-0" />
        <div>
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p className="font-semibold">{value || 'Not provided'}</p>
        </div>
    </div>
)
