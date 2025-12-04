'use client';

import { useMemo } from 'react';
import { collection, query, orderBy } from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { useUserProfile } from '@/hooks/use-user-profile';
import type { Review, User } from '@/lib/types';
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
import { Loader2, Star } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

export default function AdminReviewsPage() {
  const firestore = useFirestore();
  const { user: currentUser } = useUserProfile();
  const isUserAdmin = currentUser?.isAdmin;


  const reviewsQuery = useMemoFirebase(() => {
    if (!firestore || !isUserAdmin) return null;
    return query(collection(firestore, 'reviews'), orderBy('createdAt', 'desc'));
  }, [firestore, isUserAdmin]);

  const usersQuery = useMemoFirebase(() => {
    if (!firestore || !isUserAdmin) return null;
    return query(collection(firestore, 'users'));
  }, [firestore, isUserAdmin]);
  

  const { data: reviews, isLoading: reviewsLoading } =
    useCollection<Review>(reviewsQuery);
  const { data: users, isLoading: usersLoading } =
    useCollection<User>(usersQuery);

  const userMap = useMemo(() => {
    const map = new Map<string, string>();
    if (users) {
      users.forEach((user) => map.set(user.id, user.displayName || user.email));
    }
    return map;
  }, [users]);

  const isLoading = (reviewsLoading || usersLoading) && isUserAdmin;

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < rating
                ? 'text-primary fill-primary'
                : 'text-muted-foreground'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Manage Reviews</h2>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>All User Reviews</CardTitle>
          <CardDescription>
            A list of all reviews submitted by artists and venues.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Reviewer</TableHead>
                <TableHead>Reviewee</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Comment</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ) : reviews && reviews.length > 0 ? (
                reviews.map((review) => (
                  <TableRow key={review.id}>
                    <TableCell>
                      {review.createdAt?.toDate
                        ? format(review.createdAt.toDate(), 'PPP')
                        : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        {userMap.get(review.reviewerId) || 'Unknown User'}
                      </div>
                      <Badge variant="outline">{review.reviewerRole}</Badge>
                    </TableCell>
                     <TableCell>
                      <div className="font-medium">
                        {userMap.get(review.revieweeId) || 'Unknown User'}
                      </div>
                      <Badge variant="secondary">{review.reviewerRole === 'artist' ? 'venue' : 'artist'}</Badge>
                    </TableCell>
                    <TableCell>{renderStars(review.rating)}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {review.reviewText || '-'}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="h-24 text-center text-muted-foreground"
                    >
                       No reviews found.
                    </TableCell>
                  </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
