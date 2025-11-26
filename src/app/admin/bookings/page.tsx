
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from '@/components/ui/card';
  
  export default function AdminBookingsPage() {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Manage Bookings</h2>
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
