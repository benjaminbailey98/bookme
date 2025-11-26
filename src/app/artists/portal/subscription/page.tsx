
'use client';

import { useState } from 'react';
import { useFirestore, useUser, useCollection, useMemoFirebase } from '@/firebase';
import type { Subscription } from '@/lib/types';
import {
  collection,
  doc,
  updateDoc,
  query,
  limit,
} from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  StripeConnect,
  StripeDashboard,
  CreditCard,
  PauseCircle,
  PlayCircle,
  XCircle,
  Loader2
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function ArtistSubscriptionPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isActionLoading, setIsActionLoading] = useState(false);

  const subscriptionQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(
        collection(firestore, 'users', user.uid, 'subscriptions'),
        limit(1)
    );
  }, [user, firestore]);

  const { data: subscriptions, isLoading } = useCollection<Subscription>(subscriptionQuery);
  const subscription = subscriptions?.[0];

  const getStatusVariant = (status: string | undefined) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'default';
      case 'paid':
        return 'default';
      case 'paused':
        return 'secondary';
      case 'inactive':
        return 'outline';
      case 'canceled':
          return 'destructive';
      case 'delinquent':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const handleSubscriptionAction = async (newStatus: 'active' | 'paused' | 'canceled') => {
      if (!user || !firestore || !subscription) return;
      
      setIsActionLoading(true);
      const subDocRef = doc(firestore, 'users', user.uid, 'subscriptions', subscription.id);
      
      try {
          await updateDoc(subDocRef, { accountStatus: newStatus });
          toast({
              title: "Subscription Updated",
              description: `Your subscription is now ${newStatus}.`
          });
      } catch (error) {
          console.error("Failed to update subscription:", error);
          toast({
              variant: "destructive",
              title: "Update Failed",
              description: "Could not update your subscription status. Please try again."
          })
      } finally {
        setIsActionLoading(false);
      }
  }

  const renderSubscriptionCard = () => {
    if (isLoading) {
        return <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />;
    }

    if (!subscription) {
        return (
            <div className="text-center text-muted-foreground">
                <p>You do not have an active subscription.</p>
                <Button className="mt-4">Start Subscription</Button>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge variant={getStatusVariant(subscription.accountStatus)} className="mt-1 text-lg">
                    {subscription.accountStatus}
                </Badge>
            </div>
            <div>
                <p className="text-sm text-muted-foreground">Next Due Date</p>
                <p className="font-semibold text-lg">{format(subscription.dueDate.toDate(), 'PPP')}</p>
            </div>
             <div>
                <p className="text-sm text-muted-foreground">Payment Status</p>
                <Badge variant={getStatusVariant(subscription.paymentStatus)} className="mt-1 text-lg">
                   {subscription.paymentStatus}
                </Badge>
            </div>
             <div>
                <p className="text-sm text-muted-foreground">Start Date</p>
                <p className="font-semibold text-lg">{format(subscription.startDate.toDate(), 'PPP')}</p>
            </div>
        </div>
    )
  }

  return (
    <div className="container mx-auto max-w-4xl py-12 md:py-20 space-y-8">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tighter font-headline">
          My Subscription
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          View and manage your Vibe Request artist subscription.
        </p>
      </div>

      <Card>
        <CardHeader>
            <CardTitle>Overview</CardTitle>
            <CardDescription>Your current subscription details.</CardDescription>
        </CardHeader>
        <CardContent>
            {renderSubscriptionCard()}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
            <CardHeader>
                <CardTitle>Manage Subscription</CardTitle>
                <CardDescription>Pause, resume, or cancel your plan.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row gap-4">
                 <Button onClick={() => handleSubscriptionAction('paused')} disabled={subscription?.accountStatus === 'paused' || isActionLoading} variant="outline" className="w-full">
                    {isActionLoading && subscription?.accountStatus !== 'paused' ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <PauseCircle className="mr-2 h-4 w-4" />}
                    Pause
                 </Button>
                 <Button onClick={() => handleSubscriptionAction('active')} disabled={subscription?.accountStatus === 'active' || isActionLoading} className="w-full">
                     {isActionLoading && subscription?.accountStatus !== 'active' ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <PlayCircle className="mr-2 h-4 w-4" />}
                    Resume
                 </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                     <Button variant="destructive" disabled={isActionLoading} className="w-full">
                        <XCircle className="mr-2 h-4 w-4" />
                        Cancel
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure you want to cancel?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. You will lose access to premium artist features at the end of your current billing cycle.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleSubscriptionAction('canceled')}>
                        Confirm Cancellation
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle>Payment Integration</CardTitle>
                <CardDescription>Connect with Stripe to receive payouts for your gigs.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row gap-4">
                <Button className="w-full">
                    <CreditCard className="mr-2 h-4 w-4" />
                    Connect with Stripe
                </Button>
                 <Button variant="outline" className="w-full">
                    Go to Stripe Dashboard
                </Button>
            </CardContent>
        </Card>
      </div>

       <Card>
        <CardHeader>
            <CardTitle>Payment History</CardTitle>
            <CardDescription>A record of your past subscription payments.</CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Invoice ID</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading ? (
                         <TableRow>
                            <TableCell colSpan={4} className="text-center">
                                <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
                            </TableCell>
                        </TableRow>
                    ) : subscription?.paymentHistory && subscription.paymentHistory.length > 0 ? (
                        subscription.paymentHistory.map((payment, index) => (
                            <TableRow key={index}>
                                <TableCell>Awaiting real data</TableCell>
                                <TableCell>$29.99</TableCell>
                                <TableCell><Badge variant="default">Paid</Badge></TableCell>
                                <TableCell className="text-right font-mono">{payment}</TableCell>
                            </TableRow>
                        ))
                    ) : (
                         <TableRow>
                            <TableCell colSpan={4} className="text-center text-muted-foreground">
                                No payment history found.
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
