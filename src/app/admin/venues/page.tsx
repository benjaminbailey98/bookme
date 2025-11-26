
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from '@/components/ui/card';
import { PlusCircle } from 'lucide-react';
  
  export default function AdminVenuesPage() {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Manage Venues</h2>
           <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> Add Venue
          </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Registered Venues</CardTitle>
            <CardDescription>
              A list of all venues that have registered on the platform.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>Venue management table coming soon.</p>
          </CardContent>
        </Card>
      </div>
    );
  }
