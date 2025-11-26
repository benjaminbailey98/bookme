
'use client';

import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building, Calendar, DollarSign, Music, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo } from 'react';
import type { BookingRequest } from '@/lib/types';
import { collectionGroup, query, where, Timestamp } from 'firebase/firestore';
import { differenceInDays } from 'date-fns';

export default function ArtistPortalPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();

  const bookingsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(
      collectionGroup(firestore, 'booking_requests'),
      where('artistProfileId', '==', user.uid)
    );
  }, [firestore, user]);

  const { data: bookings, isLoading: areBookingsLoading } = useCollection<BookingRequest>(bookingsQuery);
  
  const stats = useMemo(() => {
    if (!bookings) return { total: 0, upcoming: 0, newRequests: 0 };
    
    const now = new Date();
    return {
        total: bookings.length,
        upcoming: bookings.filter(b => b.eventDate.toDate() > now && differenceInDays(b.eventDate.toDate(), now) <= 30 && b.status === 'confirmed').length,
        newRequests: bookings.filter(b => b.status === 'pending' || !b.status).length
    }
  }, [bookings]);


  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading || areBookingsLoading) {
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
          Welcome Back, {user?.displayName || 'Artist'}!
        </h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Bookings
            </CardTitle>
            <Music className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              All-time confirmed and pending
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
            <CardTitle className="text-sm font-medium">New Requests</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.newRequests}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting your response
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payout</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$0.00</div>
            <p className="text-xs text-muted-foreground">
              For completed events (coming soon)
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Booking Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Booking request list coming soon.</p>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Your Availability</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Availability calendar coming soon.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
