
'use client';

import { useMemo } from 'react';
import { collection, query, orderBy } from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { useUserProfile } from '@/hooks/use-user-profile';
import type { Referral, User } from '@/lib/types';
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
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';

export default function AdminReferralsPage() {
  const firestore = useFirestore();
  const { user: currentUser } = useUserProfile();
  const isUserAdmin = currentUser?.isAdmin;

  const referralsQuery = useMemoFirebase(() => {
    if (!firestore || !isUserAdmin) return null;
    return query(collection(firestore, 'referrals'), orderBy('referralDate', 'desc'));
  }, [firestore, isUserAdmin]);

  const usersQuery = useMemoFirebase(() => {
    if (!firestore || !isUserAdmin) return null;
    return query(collection(firestore, 'users'));
  }, [firestore, isUserAdmin]);

  const { data: referrals, isLoading: referralsLoading } = useCollection<Referral>(referralsQuery);
  const { data: users, isLoading: usersLoading } = useCollection<User>(usersQuery);

  const userMap = useMemo(() => {
    if (!users) return new Map();
    return new Map(users.map((user) => [user.id, user.displayName || user.email]));
  }, [users]);
  
  const isLoading = (referralsLoading || usersLoading) && isUserAdmin;

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Manage Referrals</h2>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>All Referrals</CardTitle>
          <CardDescription>
            A list of all user referrals made on the platform. (Admin access required)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Referral Date</TableHead>
                <TableHead>Referred User</TableHead>
                <TableHead>Referred By</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={3} className="h-24 text-center">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ) : !isLoading && referrals && referrals.length > 0 && isUserAdmin ? (
                referrals.map((referral) => (
                  <TableRow key={referral.id}>
                    <TableCell>
                      {referral.referralDate?.toDate
                        ? format(referral.referralDate.toDate(), 'PPP')
                        : 'N/A'}
                    </TableCell>
                    <TableCell className="font-medium">
                      {userMap.get(referral.referredUserId) || referral.referredUserId}
                    </TableCell>
                    <TableCell>
                      {referral.referrerUserId ? (userMap.get(referral.referrerUserId) || referral.referrerUserId) : 'Direct Signup'}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="h-24 text-center text-muted-foreground"
                  >
                    {isUserAdmin ? 'No referrals found.' : 'Insufficient permissions to view referrals.'}
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
