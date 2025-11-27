'use client';

import { useMemo } from 'react';
import { collectionGroup, query, where } from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import type { BookingRequest } from '@/lib/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { EventCalendar } from '@/components/event-calendar';

export default function AdminCalendarPage() {
  const firestore = useFirestore();

  const confirmedBookingsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(
      collectionGroup(firestore, 'booking_requests'),
      where('status', '==', 'confirmed')
    );
  }, [firestore]);

  const { data: bookings, isLoading } =
    useCollection<BookingRequest>(confirmedBookingsQuery);

  const calendarEvents = useMemo(() => {
    if (!bookings) return [];
    return bookings.map((booking) => ({
      title: `${booking.venueName} - ${booking.artistProfileId}`, // We'd need to map artist ID to name here
      date: booking.eventDate.toDate(),
      description: `Event Type: ${booking.eventType}`,
    }));
  }, [bookings]);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Master Calendar</h2>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>All Confirmed Bookings</CardTitle>
          <CardDescription>
            A master calendar view of all confirmed events on the platform.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-96">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <EventCalendar events={calendarEvents} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
