
'use client';

import { useMemo, useState } from 'react';
import { collectionGroup, query, where, collection } from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import type { BookingRequest, ArtistAvailability, ArtistProfile } from '@/lib/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { EventCalendar } from '@/components/event-calendar';
import { Calendar } from '@/components/ui/calendar';
import { format, isSameDay, parseISO } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

export default function AdminCalendarPage() {
  const firestore = useFirestore();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // 1. Fetch confirmed bookings for the event calendar
  const confirmedBookingsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(
      collectionGroup(firestore, 'booking_requests'),
      where('status', '==', 'confirmed')
    );
  }, [firestore]);

  const { data: bookings, isLoading: bookingsLoading } =
    useCollection<BookingRequest>(confirmedBookingsQuery);
  

  // 2. Fetch all artist profiles
  const artistsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'artist_profiles'));
  }, [firestore]);
  const { data: artists, isLoading: artistsLoading } = useCollection<ArtistProfile>(artistsQuery);

  // 3. Fetch all availability data
  const availabilityQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collectionGroup(firestore, 'availability'));
  }, [firestore]);
  const { data: allAvailability, isLoading: availabilityLoading } = useCollection<ArtistAvailability>(availabilityQuery);
  

  const calendarEvents = useMemo(() => {
    if (!bookings || !artists) return [];
    const artistMap = new Map(artists.map(a => [a.id, a.stageName]));
    return bookings.map((booking) => ({
      title: `${booking.venueName} - ${artistMap.get(booking.artistProfileId) || 'Unknown'}`,
      date: booking.eventDate.toDate(),
      description: `Event Type: ${booking.eventType}`,
    }));
  }, [bookings, artists]);

  // 4. Process availability for the selected date
  const { available, unavailable } = useMemo(() => {
    if (!artists || !allAvailability) return { available: [], unavailable: [] };

    const unavailableForDate = allAvailability.filter(avail => 
        isSameDay(parseISO(avail.unavailableDate), selectedDate)
    );
    
    const unavailableArtistIds = new Set(unavailableForDate.map(a => a.artistProfileId));

    const availableArtists = artists.filter(artist => !unavailableArtistIds.has(artist.id));
    
    const unavailableArtistsWithDetails = unavailableForDate.map(avail => {
      const artist = artists.find(a => a.id === avail.artistProfileId);
      return {
        ...artist,
        id: artist?.id || avail.artistProfileId,
        stageName: artist?.stageName || 'Unknown Artist',
        artistProfilePictureUrl: artist?.artistProfilePictureUrl,
        unavailabilityReason: avail.isAllDay ? 'All Day' : `${avail.unavailableStartTime} - ${avail.unavailableEndTime}`
      }
    });

    return { available: availableArtists, unavailable: unavailableArtistsWithDetails as (ArtistProfile & {unavailabilityReason: string})[] };

  }, [artists, allAvailability, selectedDate]);


  const isLoading = bookingsLoading || artistsLoading || availabilityLoading;

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Master Calendar</h2>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>All Confirmed Bookings</CardTitle>
          <CardDescription>
            A master calendar view of all confirmed events on the platform. (Admin access required)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-96">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <EventCalendar events={calendarEvents} />
          )}
        </CardContent>
      </Card>

       <Card>
        <CardHeader>
          <CardTitle>Artist Availability Checker</CardTitle>
          <CardDescription>
            Select a date to see which artists are available or unavailable. (Admin access required)
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex justify-center items-center">
                 <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    className="rounded-md border"
                />
            </div>
            <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                    <h3 className="font-semibold mb-2">Unavailable Artists ({unavailable.length})</h3>
                    <ScrollArea className="h-72 rounded-md border p-2">
                        {isLoading ? <div className="flex justify-center items-center h-full"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div> :
                         unavailable.length > 0 ? (
                            <ul className="space-y-2">
                                {unavailable.map(artist => (
                                    <li key={artist.id} className="flex items-center justify-between gap-3 p-2 rounded-md bg-muted/50">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={artist.artistProfilePictureUrl} />
                                                <AvatarFallback>{artist.stageName.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <span className="text-sm font-medium">{artist.stageName}</span>
                                        </div>
                                        <Badge variant="secondary">{artist.unavailabilityReason}</Badge>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-muted-foreground text-center pt-4">No artists are unavailable on {format(selectedDate, 'PPP')}.</p>
                        )}
                    </ScrollArea>
                </div>
                 <div>
                    <h3 className="font-semibold mb-2">Available Artists ({available.length})</h3>
                     <ScrollArea className="h-72 rounded-md border p-2">
                        {isLoading ? <div className="flex justify-center items-center h-full"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div> :
                         available.length > 0 ? (
                             <ul className="space-y-2">
                                {available.map(artist => (
                                    <li key={artist.id} className="flex items-center gap-3 p-2 rounded-md">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={artist.artistProfilePictureUrl} />
                                            <AvatarFallback>{artist.stageName.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <span className="text-sm font-medium">{artist.stageName}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-muted-foreground text-center pt-4">No artists available.</p>
                        )}
                    </ScrollArea>
                </div>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}

    