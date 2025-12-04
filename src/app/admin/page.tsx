
'use client';

import { useCollection, useMemoFirebase } from '@/firebase';
import { useUserProfile } from '@/hooks/use-user-profile';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Building, ListMusic, UserCheck, Star } from 'lucide-react';
import { collection, query, where, collectionGroup } from 'firebase/firestore';
import type { User, ArtistProfile, VenueProfile, BookingRequest } from '@/lib/types';
import { useMemo } from 'react';
import { Loader2 } from 'lucide-react';
import { useFirestore } from '@/firebase';

export default function AdminDashboardPage() {

  const firestore = useFirestore();
  const { user: currentUser } = useUserProfile();
  const isUserAdmin = currentUser?.isAdmin;


  const usersQuery = useMemoFirebase(() => {
    if (!firestore || !isUserAdmin) return null;
    return query(collection(firestore, 'users'));
  }, [firestore, isUserAdmin]);

  const artistsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'artist_profiles'));
  }, [firestore]);

  const venuesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'venue_profiles'));
  }, [firestore]);
  
  const bookingsQuery = useMemoFirebase(() => {
    if (!firestore || !isUserAdmin) return null;
    return query(collectionGroup(firestore, 'booking_requests'));
  }, [firestore, isUserAdmin]);

  const { data: users, isLoading: usersLoading } = useCollection<User>(usersQuery);
  const { data: artists, isLoading: artistsLoading } = useCollection<ArtistProfile>(artistsQuery);
  const { data: venues, isLoading: venuesLoading } = useCollection<VenueProfile>(venuesQuery);
  const { data: bookings, isLoading: bookingsLoading } = useCollection<BookingRequest>(bookingsQuery);
  

  const isLoading = usersLoading || artistsLoading || venuesLoading || bookingsLoading;

  const stats = useMemo(() => {
    const safeBookings = bookings || [];
    const confirmedBookings = safeBookings.filter(b => b.status === 'confirmed').length;
    const pendingBookings = safeBookings.filter(b => b.status === 'pending' || !b.status).length;
    
    return [
      { title: 'Total Users', value: (users || []).length.toString(), icon: Users, change: '' },
      { title: 'Registered Artists', value: (artists || []).length.toString(), icon: Star, change: '' },
      { title: 'Registered Venues', value: (venues || []).length.toString(), icon: Building, change: '' },
      { title: 'Total Bookings', value: (bookings || []).length.toString(), icon: ListMusic, change: `${confirmedBookings} confirmed` },
      { title: 'Pending Bookings', value: pendingBookings.toString(), icon: UserCheck, change: '' },
    ];
  }, [users, artists, venues, bookings]);

  if (isLoading && isUserAdmin) {
      return (
          <div className="flex h-screen items-center justify-center">
              <Loader2 className="h-16 w-16 animate-spin text-muted-foreground" />
          </div>
      )
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Admin Dashboard</h2>
      </div>
      { isUserAdmin ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {stats.map((stat) => (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <stat.icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">{stat.change}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Recent activity feed coming soon.</p>
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Platform Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Analytics chart coming soon.</p>
              </CardContent>
            </Card>
          </div>
        </>
      ) : (
        <Card>
            <CardHeader>
                <CardTitle>Welcome to the Admin Portal</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">This area is restricted. Please grant your user account admin privileges from the 'Manage Users' page to view dashboard statistics and manage the platform.</p>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
