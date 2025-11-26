
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from '@/components/ui/card';
  
  export default function AdminCalendarPage() {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Master Calendar</h2>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Artist Availability</CardTitle>
            <CardDescription>
              View available and unavailable artists by date.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>Master calendar functionality coming soon.</p>
          </CardContent>
        </Card>
      </div>
    );
  }
