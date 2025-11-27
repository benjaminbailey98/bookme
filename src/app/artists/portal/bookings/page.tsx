
'use client';

import {
  collectionGroup,
  query,
  where,
  Timestamp,
} from 'firebase/firestore';
import { useFirestore, useUser, useCollection, useMemoFirebase } from '@/firebase';
import type { BookingRequest } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table"
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';

export default function ArtistBookingsPage() {
  const { user } = useUser();
  const firestore = useFirestore();

  const bookingsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(
        collectionGroup(firestore, 'booking_requests'),
        where('artistProfileId', '==', user.uid)
    );
  }, [firestore, user]);

  const { data: bookings, isLoading } = useCollection<BookingRequest>(bookingsQuery);

  const getStatusVariant = (status?: string) => {
    switch (status) {
        case 'confirmed':
            return 'default';
        case 'pending':
            return 'secondary';
        case 'declined':
            return 'destructive';
        default:
            return 'outline';
    }
  }

  return (
    <div className="container mx-auto max-w-7xl py-12 md:py-20">
      <div className="space-y-2 text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tighter font-headline">
          My Bookings
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          View and manage your incoming booking requests.
        </p>
      </div>

      <Card>
        <CardHeader>
            <CardTitle>Booking Requests</CardTitle>
            <CardDescription>A list of all booking requests submitted to you.</CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Event Date</TableHead>
                        <TableHead>Venue</TableHead>
                        <TableHead>Event Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading && (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center">
                                <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
                            </TableCell>
                        </TableRow>
                    )}
                    {!isLoading && bookings && bookings.length > 0 ? (
                        bookings.map(booking => (
                            <TableRow key={booking.id}>
                                <TableCell className="font-medium">{booking.eventDate.toDate ? format(booking.eventDate.toDate(), 'PPP') : 'Invalid Date'}</TableCell>
                                <TableCell>{booking.venueName}</TableCell>
                                <TableCell>{booking.eventType}</TableCell>
                                <TableCell>
                                    <Badge variant={getStatusVariant(booking.status)}>
                                        {booking.status || 'Pending'}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button variant="outline" size="sm">View Details</Button>
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        !isLoading && (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center text-muted-foreground">
                                    You have no booking requests yet.
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
