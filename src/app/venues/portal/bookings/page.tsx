
'use client';

import { useState } from 'react';
import {
  collection,
  query,
  updateDoc,
  doc,
  addDoc,
} from 'firebase/firestore';
import {
  useFirestore,
  useUser,
  useCollection,
  useMemoFirebase,
} from '@/firebase';
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
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Loader2, Star } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export default function VenueBookingsPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [selectedBooking, setSelectedBooking] =
    useState<BookingRequest | null>(null);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const bookingsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    // Assuming venue profiles are keyed by user.uid
    return query(collection(firestore, 'venue_profiles', user.uid, 'booking_requests'));
  }, [firestore, user]);

  const { data: bookings, isLoading } =
    useCollection<BookingRequest>(bookingsQuery);

  const handleStatusChange = async (bookingId: string, newStatus: string) => {
    if (!user || !firestore) return;
    const bookingDocRef = doc(firestore, 'venue_profiles', user.uid, 'booking_requests', bookingId);
    try {
      await updateDoc(bookingDocRef, { status: newStatus });
      toast({
        title: 'Status Updated',
        description: `Booking status has been changed to ${newStatus}.`,
      });
    } catch (serverError) {
      const permissionError = new FirestorePermissionError({
        path: bookingDocRef.path,
        operation: 'update',
        requestResourceData: { status: newStatus },
      });
      errorEmitter.emit('permission-error', permissionError);
    }
  };

  const handleReviewSubmit = async () => {
    if (!user || !firestore || !selectedBooking || rating === 0) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please select a rating to submit your review.',
      });
      return;
    }
    setIsSubmitting(true);
    
    // Create a new review document
    const reviewData = {
      bookingRequestId: selectedBooking.id,
      artistProfileId: selectedBooking.artistProfileId,
      venueProfileId: user.uid, // Venue's user ID is their profile ID
      rating,
      reviewText: review,
      createdAt: new Date(), // Using client-side date, consider server timestamp
    };

    const reviewsCollection = collection(firestore, 'reviews');
    try {
      await addDoc(reviewsCollection, reviewData);
      toast({ title: 'Review Submitted', description: 'Thank you for your feedback!' });
      // Close dialog and reset state
      setRating(0);
      setReview('');
      setSelectedBooking(null); // This will cause the dialog to close if it's tied to this state
    } catch (serverError) {
       const permissionError = new FirestorePermissionError({
        path: 'reviews', // Path for creation
        operation: 'create',
        requestResourceData: reviewData,
      });
      errorEmitter.emit('permission-error', permissionError);
    } finally {
        setIsSubmitting(false);
    }
  };

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

  return (
    <div className="container mx-auto max-w-7xl py-12 md:py-20">
      <div className="space-y-2 text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tighter font-headline">
          Manage Bookings
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          View, manage, and review your past and upcoming events.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Bookings</CardTitle>
          <CardDescription>
            A list of all bookings for your venue.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event Date</TableHead>
                <TableHead>Artist</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
                  </TableCell>
                </TableRow>
              )}
              {!isLoading && bookings && bookings.length > 0 ? (
                bookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell className="font-medium">
                      {format(booking.eventDate.toDate(), 'PPP')}
                    </TableCell>
                    <TableCell>{booking.artistProfileId}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(booking.status)}>
                        {booking.status || 'Pending'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                       {booking.status === 'confirmed' && new Date() > booking.eventDate.toDate() && (
                         <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStatusChange(booking.id, 'completed')}>
                            Mark as Completed
                         </Button>
                      )}
                      {booking.status === 'completed' && (
                        <Dialog
                          onOpenChange={(open) => {
                            if (!open) {
                              setSelectedBooking(null);
                              setRating(0);
                              setReview('');
                            }
                          }}
                        >
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedBooking(booking)}
                            >
                              <Star className="mr-2 h-4 w-4" />
                              Rate Performance
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>
                                Rate {booking.artistProfileId}'s Performance
                              </DialogTitle>
                            </DialogHeader>
                            <div className="py-4 space-y-4">
                              <div className="space-y-2">
                                <Label>Rating</Label>
                                <div className="flex gap-1">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                      key={star}
                                      className={`h-6 w-6 cursor-pointer ${
                                        star <= rating
                                          ? 'text-primary fill-primary'
                                          : 'text-muted-foreground'
                                      }`}
                                      onClick={() => setRating(star)}
                                    />
                                  ))}
                                </div>
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="review">Review (Optional)</Label>
                                <Textarea
                                  id="review"
                                  placeholder="How was the performance? What did you like?"
                                  value={review}
                                  onChange={(e) => setReview(e.target.value)}
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <DialogClose asChild>
                                 <Button variant="outline">Cancel</Button>
                              </DialogClose>
                              <Button onClick={handleReviewSubmit} disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Submit Review
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      )}
                      {(booking.status === 'pending' || !booking.status) && (
                        <>
                           <Button
                            size="sm"
                            onClick={() => handleStatusChange(booking.id, 'confirmed')}>
                            Confirm
                           </Button>
                           <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleStatusChange(booking.id, 'declined')}>
                            Decline
                           </Button>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                !isLoading && (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center text-muted-foreground py-10"
                    >
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
