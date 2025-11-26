
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from '@/components/ui/card';
import { PlusCircle } from 'lucide-react';
  
  export default function AdminBookingsPage() {
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
            <p>Bookings management table coming soon.</p>
          </CardContent>
        </Card>
      </div>
    );
  }
