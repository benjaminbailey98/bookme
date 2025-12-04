'use client';

import {
  collectionGroup,
  query,
  where,
  Timestamp,
  doc,
  updateDoc,
  collection,
  addDoc,
} from 'firebase/firestore';
import { useFirestore, useUser, useCollection, useMemoFirebase } from '@/firebase';
import type { BookingRequest, Review } from '@/lib/types';
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
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Loader2, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

export default function ArtistBookingsPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [selectedBooking, setSelectedBooking] = useState<BookingRequest | null>(null);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);


  const bookingsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(
        collectionGroup(firestore, 'booking_requests'),
        where('artistProfileId', '==', user.uid)
    );
  }, [firestore, user]);

  const { data: bookings, isLoading } = useCollection<BookingRequest>(bookingsQuery);

  const handleStatusChange = async (booking: BookingRequest, newStatus: 'confirmed' | 'declined' | 'completed') => {
    if (!firestore || !user) return;
    
    const bookingDocRef = doc(firestore, 'venue_profiles', booking.venueProfileId, 'booking_requests', booking.id);

    try {
      await updateDoc(bookingDocRef, { status: newStatus });
      toast({
        title: `Booking ${newStatus}`,
        description: `The request from ${booking.venueName} has been ${newStatus}.`,
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: 'Could not update booking status.',
      });
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
    
    const reviewData: Omit<Review, 'id' | 'createdAt'> = {
      bookingRequestId: selectedBooking.id,
      reviewerId: user.uid,
      revieweeId: selectedBooking.venueProfileId, // Artist reviews the venue owner's user ID
      reviewerRole: 'artist',
      rating,
      reviewText: review,
    };

    const reviewsCollection = collection(firestore, 'reviews');
    try {
      await addDoc(reviewsCollection, { ...reviewData, createdAt: Timestamp.now() });
      toast({ title: 'Review Submitted', description: 'Thank you for your feedback!' });
      // Close dialog
      setSelectedBooking(null); 
      setRating(0);
      setReview('');
    } catch (error) {
       toast({
        variant: 'destructive',
        title: 'Submission Failed',
        description: 'Could not submit your review.',
      });
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
                            <TableCell colSpan={5} className="text-center h-24">
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
                                <TableCell className="text-right space-x-2">
                                     {(booking.status === 'pending' || !booking.status) && (
                                        <>
                                        <Button
                                            size="sm"
                                            onClick={() => handleStatusChange(booking, 'confirmed')}
                                        >
                                            Confirm
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => handleStatusChange(booking, 'declined')}
                                        >
                                            Decline
                                        </Button>
                                        </>
                                    )}
                                    {booking.status === 'confirmed' && new Date() > (booking.eventDate.toDate ? booking.eventDate.toDate() : new Date()) && (
                                      <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => handleStatusChange(booking, 'completed')}>
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
                                            Rate Venue
                                          </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                          <DialogHeader>
                                            <DialogTitle>
                                              Rate your experience at {booking.venueName}
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
                                                placeholder="How was the venue? Was communication good?"
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
                                    {booking.status === 'declined' &&(
                                         <Button variant="outline" size="sm" disabled>View Details</Button>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        !isLoading && (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
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
