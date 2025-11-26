
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from '@/components/ui/card';
  
  export default function AdminReferralsPage() {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Manage Referrals</h2>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>All Referrals</CardTitle>
            <CardDescription>
              A list of all user referrals made on the platform.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>Referral management table coming soon.</p>
          </CardContent>
        </Card>
      </div>
    );
  }
