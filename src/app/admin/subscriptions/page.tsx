'use client';

import { useMemo } from 'react';
import { collectionGroup, query } from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { useUserProfile } from '@/hooks/use-user-profile';
import type { Subscription, User } from '@/lib/types';
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
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';

export default function AdminSubscriptionsPage() {
  const firestore = useFirestore();
  const { user: currentUser } = useUserProfile();
  const isUserAdmin = currentUser?.isAdmin;

  const subscriptionsQuery = useMemoFirebase(() => {
    if (!firestore || !isUserAdmin) return null;
    return query(collectionGroup(firestore, 'subscriptions'));
  }, [firestore, isUserAdmin]);

  const usersQuery = useMemoFirebase(() => {
    if (!firestore || !isUserAdmin) return null;
    return query(collection(firestore, 'users'));
  }, [firestore, isUserAdmin]);

  const { data: subscriptions, isLoading: subsLoading } = useCollection<Subscription>(subscriptionsQuery);
  const { data: users, isLoading: usersLoading } = useCollection<User>(usersQuery);

  const userMap = useMemo(() => {
    if (!users) return new Map();
    return new Map(users.map((user) => [user.id, user.displayName || user.email]));
  }, [users]);

  const isLoading = (subsLoading || usersLoading) && isUserAdmin;

  const getStatusVariant = (status: string | undefined): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'paid':
        return 'default';
      case 'paused':
        return 'secondary';
      case 'inactive':
        return 'outline';
      case 'canceled':
      case 'delinquent':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Manage Subscriptions</h2>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>All Subscriptions</CardTitle>
          <CardDescription>
            View and manage all user subscriptions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Account Status</TableHead>
                <TableHead>Payment Status</TableHead>
                <TableHead>Next Due Date</TableHead>
                <TableHead>Member Since</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ) : subscriptions && subscriptions.length > 0 ? (
                subscriptions.map((sub) => (
                  <TableRow key={sub.id}>
                    <TableCell className="font-medium">
                      {userMap.get(sub.userId) || 'Unknown User'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(sub.accountStatus)}>
                        {sub.accountStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(sub.paymentStatus)}>
                        {sub.paymentStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {sub.dueDate?.toDate ? format(sub.dueDate.toDate(), 'PPP') : 'N/A'}
                    </TableCell>
                    <TableCell>
                      {sub.startDate?.toDate ? format(sub.startDate.toDate(), 'PPP') : 'N/A'}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No subscriptions found.
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
