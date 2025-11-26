
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Building, ListMusic, Calendar, DollarSign, UserCheck, Star } from 'lucide-react';

export default function AdminDashboardPage() {
  const stats = [
    { title: 'Total Users', value: '1,250', icon: Users, change: '+12.5%' },
    { title: 'Registered Artists', value: '150', icon: Star, change: '+5.2%' },
    { title: 'Registered Venues', value: '75', icon: Building, change: '+8.1%' },
    { title: 'Total Bookings', value: '540', icon: ListMusic, change: '+20.1% since last month' },
    { title: 'Total Subscriptions', value: '225', icon: DollarSign, change: '70% active' },
    { title: 'Pending Approvals', value: '12', icon: UserCheck, change: '5 artists, 7 venues' },
  ];

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Admin Dashboard</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
    </div>
  );
}
