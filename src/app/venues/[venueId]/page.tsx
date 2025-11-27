
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

export default function VenuePublicProfilePage() {
  const params = useParams();
  const firestore = useFirestore();
  const venueId = params.venueId as string;

  const venueRef = useMemoFirebase(() => {
    if (!firestore || !venueId) return null;
    return doc(firestore, 'venue_profiles', venueId);
  }, [firestore, venueId]);

  const { data: venue, isLoading } = useDoc<VenueProfile>(venueRef);

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
       <div className="container mx-auto py-12 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1 space-y-6">
                <div className="bg-background p-6 rounded-lg shadow-sm flex flex-col items-center text-center">
                     <Avatar className="h-32 w-32 mb-4">
                        <AvatarImage src={venue.companyLogoUrl} alt={venue.companyName} />
                        <AvatarFallback className="text-4xl">{venue.companyName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <h1 className="text-3xl font-bold font-headline">{venue.companyName}</h1>
                    <p className="text-muted-foreground">{venue.companyAddress}</p>
                </div>
                 <div className="bg-background p-6 rounded-lg shadow-sm space-y-4">
                     <InfoItem icon={MapPin} label="Address" value={venue.companyAddress} />
                     <InfoItem icon={Phone} label="Phone" value={venue.companyPhone} />
                     <InfoItem icon={Mail} label="Email" value={venue.companyEmail} />
                     <InfoItem icon={Clock} label="Hours" value={venue.businessHours} />
                 </div>
                 <div className="bg-background p-6 rounded-lg shadow-sm space-y-4">
                     <h3 className="font-bold text-lg">Booking Contact</h3>
                     <InfoItem icon={UserIcon} label={venue.contactTitle} value={venue.contactName} />
                     <InfoItem icon={Phone} label="Contact Phone" value={venue.contactPhone} />
                     <InfoItem icon={Mail} label="Contact Email" value={venue.contactEmail} />
                 </div>
            </div>
             <div className="md:col-span-2 bg-background p-6 rounded-lg shadow-sm">
                <h2 className="text-2xl font-bold font-headline mb-4">Find an Artist for {venue.companyName}</h2>
                <p className="text-muted-foreground mb-6">
                  Ready to bring live music to your stage? Browse our curated list of talented artists and submit a booking request today.
                </p>
                <Button asChild size="lg">
                  <Link href="/artists">Browse Artists & Book Now</Link>
                </Button>
             </div>
        </div>
      </div>
    </div>
  );
}


interface InfoItemProps {
    icon: React.ElementType;
    label: string;
    value: string;
}

const InfoItem = ({ icon: Icon, label, value }: InfoItemProps) => (
    <div className="flex items-start gap-3">
        <Icon className="h-5 w-5 text-muted-foreground mt-1 shrink-0" />
        <div>
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p className="font-medium">{value}</p>
        </div>
    </div>
)
