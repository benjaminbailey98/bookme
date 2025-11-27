
'use client';

import { collectionGroup, query, doc, updateDoc } from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import type { BookingRequest, ArtistProfile } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Loader2, MoreHorizontal, PlusCircle } from 'lucide-react';
import { format } from 'date-fns';
import { useMemo } from 'react';
import { collection } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export default function AdminBookingsPage() {
  const firestore = useFirestore();
  const { toast } = useToast();

  const bookingsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    // This collection group query requires a specific security rule to allow admins to list all bookings.
    return query(collectionGroup(firestore, 'booking_requests'));
  }, [firestore]);

  const { data: bookings, isLoading: bookingsLoading } =
    useCollection<BookingRequest>(bookingsQuery);

  const artistsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'artist_profiles'));
  }, [firestore]);

  const { data: artists, isLoading: artistsLoading } =
    useCollection<ArtistProfile>(artistsQuery);

  const artistMap = useMemo(() => {
    if (!artists) return new Map();
    return new Map(artists.map((artist) => [artist.id, artist.stageName]));
  }, [artists]);

  const isLoading = bookingsLoading || artistsLoading;

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

  const handleStatusChange = async (
    booking: BookingRequest,
    newStatus: 'pending' | 'confirmed' | 'declined' | 'completed'
  ) => {
    if (!firestore) return;

    const bookingDocRef = doc(
      firestore,
      'venue_profiles',
      booking.venueProfileId,
      'booking_requests',
      booking.id
    );

    try {
      await updateDoc(bookingDocRef, { status: newStatus });
      toast({
        title: 'Booking Status Updated',
        description: `Booking for ${
          artistMap.get(booking.artistProfileId) || 'artist'
        } at ${booking.venueName} is now ${newStatus}.`,
      });
    } catch (serverError: any) {
      const permissionError = new FirestorePermissionError({
        path: bookingDocRef.path,
        operation: 'update',
        requestResourceData: { status: newStatus },
      });
      errorEmitter.emit('permission-error', permissionError);
    }
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Manage Bookings</h2>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Booking
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>All Bookings</CardTitle>
          <CardDescription>
            A comprehensive list of all bookings submitted on the platform.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event Date</TableHead>
                <TableHead>Venue</TableHead>
                <TableHead>Artist</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
                  </TableCell>
                </TableRow>
              )}
              {!isLoading && bookings && bookings.length > 0 ? (
                bookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell className="font-medium">
                      {booking.eventDate?.toDate
                        ? format(booking.eventDate.toDate(), 'PPP')
                        : 'Invalid Date'}
                    </TableCell>
                    <TableCell>{booking.venueName}</TableCell>
                    <TableCell>
                      {artistMap.get(booking.artistProfileId) || 'Unknown Artist'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(booking.status)}>
                        {booking.status || 'Pending'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem>View Details</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() => handleStatusChange(booking, 'pending')}
                            disabled={booking.status === 'pending'}
                          >
                            Set to Pending
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleStatusChange(booking, 'confirmed')}
                             disabled={booking.status === 'confirmed'}
                          >
                            Set to Confirmed
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleStatusChange(booking, 'declined')}
                             disabled={booking.status === 'declined'}
                          >
                            Set to Declined
                          </DropdownMenuItem>
                           <DropdownMenuItem
                            onClick={() => handleStatusChange(booking, 'completed')}
                             disabled={booking.status === 'completed'}
                          >
                            Set to Completed
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                !isLoading && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="h-24 text-center text-muted-foreground"
                    >
                      No bookings found.
                    </TableCell>
                  </TableRow>
                )
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
