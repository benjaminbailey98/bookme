'use client';

import {
  useUser,
  useFirestore,
  useCollection,
  useMemoFirebase,
} from '@/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Calendar,
  DollarSign,
  ListMusic,
  Users,
  Loader2,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo } from 'react';
import {
  collection,
  query,
  Timestamp,
  orderBy,
  limit,
  where,
} from 'firebase/firestore';
import type { BookingRequest, ArtistProfile } from '@/lib/types';
import { differenceInDays, format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableHeader,
  TableHead,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { EventCalendar } from '@/components/event-calendar';

export default function VenuePortalPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();

  const bookingsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(
      collection(firestore, 'venue_profiles', user.uid, 'booking_requests')
    );
  }, [firestore, user]);

  const recentBookingsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(
      collection(firestore, 'venue_profiles', user.uid, 'booking_requests'),
      orderBy('eventDate', 'desc'),
      limit(5)
    );
  }, [firestore, user]);

  const artistsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'artist_profiles'));
  }, [firestore]);

  const { data: bookings, isLoading: areBookingsLoading } =
    useCollection<BookingRequest>(bookingsQuery);
  const { data: recentBookings, isLoading: areRecentBookingsLoading } =
    useCollection<BookingRequest>(recentBookingsQuery);
  const { data: artists, isLoading: areArtistsLoading } =
    useCollection<ArtistProfile>(artistsQuery);

  const artistMap = useMemo(() => {
    if (!artists) return new Map();
    return new Map(artists.map((artist) => [artist.id, artist.stageName]));
  }, [artists]);

  const stats = useMemo(() => {
    if (!bookings) return { total: 0, upcoming: 0 };

    const now = new Date();
    return {
      total: bookings.length,
      upcoming: bookings.filter(
        (b) =>
          b.eventDate.toDate() > now &&
          differenceInDays(b.eventDate.toDate(), now) <= 30 &&
          b.status === 'confirmed'
      ).length,
    };
  }, [bookings]);

  const calendarEvents = useMemo(() => {
    if (!bookings) return [];
    return bookings
      .filter((b) => b.status === 'confirmed')
      .map((booking) => ({
        title: artistMap.get(booking.artistProfileId) || 'Unknown Artist',
        date: booking.eventDate.toDate(),
        description: `Event: ${booking.eventType}`,
      }));
  }, [bookings, artistMap]);

  const getStatusVariant = (status?: string) => {
    switch (status) {
      case 'confirmed':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'declined':
        return 'destructive';
      case 'completed':
        return 'outline';
      default:
        return 'outline';
    }
  };

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading || areBookingsLoading || !user || areArtistsLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">
          Welcome Back, {user.displayName || 'Venue Manager'}!
        </h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <ListMusic className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              All-time submitted bookings
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Upcoming Events
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.upcoming}</div>
            <p className="text-xs text-muted-foreground">in the next 30 days</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              New Artist Matches
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              New artists in your area (coming soon)
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$0.00</div>
            <p className="text-xs text-muted-foreground">
              On live entertainment (coming soon)
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Booking Activity</CardTitle>
            <Button asChild variant="outline" size="sm">
              <Link href="/venues/portal/bookings">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event Date</TableHead>
                  <TableHead>Artist</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {areRecentBookingsLoading ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center h-24">
                      <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ) : recentBookings && recentBookings.length > 0 ? (
                  recentBookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell>
                        {booking.eventDate?.toDate
                          ? format(booking.eventDate.toDate(), 'PPP')
                          : 'N/A'}
                      </TableCell>
                      <TableCell>
                        {artistMap.get(booking.artistProfileId) ||
                          'Unknown Artist'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(booking.status)}>
                          {booking.status || 'Pending'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="h-24 text-center text-muted-foreground"
                    >
                      No recent booking activity.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Upcoming Events Calendar</CardTitle>
          </CardHeader>
          <CardContent>
            <EventCalendar events={calendarEvents} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
