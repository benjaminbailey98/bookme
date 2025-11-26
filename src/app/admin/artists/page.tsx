
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from '@/components/ui/card';
  
  export default function AdminArtistsPage() {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Manage Artists</h2>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Registered Artists</CardTitle>
            <CardDescription>
              A list of all artists who have registered on the platform.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>Artist management table coming soon.</p>
          </CardContent>
        </Card>
      </div>
    );
  }
