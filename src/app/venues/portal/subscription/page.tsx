
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
  CreditCard,
  PauseCircle,
  PlayCircle,
  XCircle,
  Loader2,
  CalendarCheck2,
  History,
  Info,
  DollarSign
} from 'lucide-react';
import { format } from 'date-fns';
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
} from "@/components/ui/alert-dialog";
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export default function VenueSubscriptionPage() {
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

  const getStatusVariant = (status: string | undefined): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'paid':
        return 'default';
      case 'paused':
        return 'secondary';
      case 'inactive':
        return 'outline';
      case 'canceled':
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
          const permissionError = new FirestorePermissionError({
            path: subDocRef.path,
            operation: 'update',
            requestResourceData: { accountStatus: newStatus }
          });
          errorEmitter.emit('permission-error', permissionError);
      } finally {
        setIsActionLoading(false);
      }
  }

  const renderSubscriptionDetails = () => {
    if (isLoading) {
      return <div className="flex justify-center items-center h-24"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
    }

    if (!subscription) {
      return (
        <div className="text-center py-8">
          <p className="text-muted-foreground mb-4">You do not have an active subscription.</p>
          <Button>Start Your Subscription</Button>
        </div>
      );
    }
    
    const overviewItems = [
      {
        icon: Info,
        label: 'Account Status',
        value: subscription.accountStatus,
        isBadge: true,
      },
      {
        icon: DollarSign,
        label: 'Payment Status',
        value: subscription.paymentStatus,
        isBadge: true,
      },
      {
        icon: CalendarCheck2,
        label: 'Next Due Date',
        value: format(subscription.dueDate.toDate(), 'PPP'),
        isBadge: false,
      },
      {
        icon: History,
        label: 'Member Since',
        value: format(subscription.startDate.toDate(), 'PPP'),
        isBadge: false,
      },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {overviewItems.map(item => (
            <Card key={item.label} className="flex flex-col justify-center items-center text-center p-4">
               <item.icon className="h-8 w-8 text-primary mb-2" />
               <p className="text-sm font-medium text-muted-foreground">{item.label}</p>
              {item.isBadge ? (
                <Badge variant={getStatusVariant(item.value)} className="mt-1 text-base">
                  {item.value}
                </Badge>
              ) : (
                <p className="font-semibold text-xl">{item.value}</p>
              )}
            </Card>
          ))}
        </div>
    );
  };

  return (
    <div className="container mx-auto max-w-6xl py-12 md:py-20 space-y-8">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tighter font-headline">
          Subscription & Billing
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          View and manage your Vibe Request venue subscription and payment details.
        </p>
      </div>
      
      {renderSubscriptionDetails()}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <Card>
            <CardHeader>
                <CardTitle>Manage Subscription</CardTitle>
                <CardDescription>Pause, resume, or cancel your plan at any time.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                 <Button onClick={() => handleSubscriptionAction('paused')} disabled={subscription?.accountStatus === 'paused' || isLoading || isActionLoading} variant="outline" className="w-full">
                    <PauseCircle className="mr-2 h-4 w-4" />
                    Pause
                 </Button>
                 <Button onClick={() => handleSubscriptionAction('active')} disabled={subscription?.accountStatus === 'active' || isLoading || isActionLoading} className="w-full">
                     <PlayCircle className="mr-2 h-4 w-4" />
                    Resume
                 </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                     <Button variant="destructive" disabled={isLoading || isActionLoading || subscription?.accountStatus === 'canceled'} className="w-full">
                        <XCircle className="mr-2 h-4 w-4" />
                        Cancel
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure you want to cancel?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. You will lose access to premium venue features at the end of your current billing cycle.
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
                <CardTitle>Payment Method</CardTitle>
                <CardDescription>Update your billing information.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row gap-4">
                <Button className="w-full">
                    <CreditCard className="mr-2 h-4 w-4" />
                    Update Payment Method
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
                            <TableCell colSpan={4} className="h-24 text-center">
                                <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
                            </TableCell>
                        </TableRow>
                    ) : subscription?.paymentHistory && subscription.paymentHistory.length > 0 ? (
                        subscription.paymentHistory.map((payment, index) => (
                             <TableRow key={index}>
                                <TableCell>{format(subscription.startDate.toDate(), 'PPP')}</TableCell>
                                <TableCell>$0.00</TableCell>
                                <TableCell><Badge variant="default">Trial</Badge></TableCell>
                                <TableCell className="text-right font-mono">{payment}</TableCell>
                            </TableRow>
                        ))
                    ) : (
                         <TableRow>
                            <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
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

    