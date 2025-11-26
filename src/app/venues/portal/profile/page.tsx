
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UploadCloud, PauseCircle, PlayCircle, XCircle, Loader2 } from 'lucide-react';
import { useFirestore, useUser, useDoc, useMemoFirebase } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
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
import { VenueProfile } from '@/lib/types';


const profileFormSchema = z.object({
  companyName: z.string().min(1, 'Company name is required.'),
  companyEmail: z.string().email(),
  companyPhone: z.string().min(1, 'Phone number is required.'),
  companyAddress: z.string().min(1, 'Company address is required.'),
  businessHours: z.string().min(1, 'Business hours are required.'),
  contactTitle: z.string().min(1, 'Contact title is required.'),
  contactName: z.string().min(1, 'Contact name is required.'),
  contactEmail: z.string().email('Please enter a valid email.'),
  contactPhone: z.string().min(1, 'Contact phone is required.'),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function VenueProfilePage() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const venueProfileRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'venue_profiles', user.uid);
  }, [firestore, user]);

  const { data: profile, isLoading: isProfileLoading } = useDoc<VenueProfile>(venueProfileRef);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
        companyName: '',
        companyEmail: '',
        companyPhone: '',
        companyAddress: '',
        businessHours: '',
        contactTitle: '',
        contactName: '',
        contactEmail: '',
        contactPhone: '',
    },
  });

  useEffect(() => {
    if (profile) {
      form.reset(profile);
    } else if (user) {
      form.setValue('companyEmail', user.email || '');
    }
  }, [profile, user, form]);

  async function onSubmit(data: ProfileFormValues) {
    if (!user || !firestore || !venueProfileRef) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'You must be logged in to update your profile.',
      });
      return;
    }

    setIsSubmitting(true);
    
    const finalProfileData = {
      ...data,
      userId: user.uid,
      id: user.uid,
    };

    try {
      await setDoc(venueProfileRef, finalProfileData, { merge: true });
      toast({
        title: 'Profile Updated!',
        description: 'Your venue profile has been saved successfully.',
      });
    } catch (serverError) {
      const permissionError = new FirestorePermissionError({
        path: venueProfileRef.path,
        operation: 'update',
        requestResourceData: finalProfileData,
      });
      errorEmitter.emit('permission-error', permissionError);
    } finally {
        setIsSubmitting(false);
    }
  }

  const handleSubscriptionAction = (action: 'pause' | 'resume' | 'cancel') => {
      // Placeholder for subscription logic
      toast({
          title: `Subscription ${action}`,
          description: `Logic to ${action} subscription is not implemented yet.`
      })
  }

  if (isUserLoading || isProfileLoading) {
    return (
        <div className="flex justify-center items-center h-screen">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
    );
  }

  return (
    <div className="container mx-auto max-w-5xl py-12 md:py-20">
       <div className="space-y-2 text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tighter font-headline">
          Venue Profile
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Manage your public-facing venue information and settings.
        </p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Company Information</CardTitle>
                  <CardDescription>
                    Details about your venue.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="companyName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Name</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="companyEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Email</FormLabel>
                        <FormControl><Input {...field} disabled /></FormControl>
                         <FormDescription>Registration email cannot be modified.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <FormField
                    control={form.control}
                    name="companyPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Phone</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="companyAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Address</FormLabel>
                        <FormControl><Input placeholder="123 Music Lane, Nashville, TN" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="businessHours"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Business Hours</FormLabel>
                        <FormControl>
                          <Textarea placeholder="e.g., Mon-Fri: 9am-5pm, Sat: 12pm-12am, Sun: Closed" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Primary Contact</CardTitle>
                   <CardDescription>
                    The main point of contact for booking inquiries.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <FormField
                    control={form.control}
                    name="contactTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl><Input placeholder="e.g., Booking Manager" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <FormField
                    control={form.control}
                    name="contactName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl><Input placeholder="e.g., Alex Doe" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <FormField
                    control={form.control}
                    name="contactEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl><Input type="email" placeholder="alex.doe@example.com" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <FormField
                    control={form.control}
                    name="contactPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl><Input placeholder="(555) 555-5555" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>
            
            {/* Right Column */}
            <div className="space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Company Logo</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center gap-4">
                        <Avatar className="w-40 h-40">
                            <AvatarImage src={profile?.companyLogoUrl || "https://picsum.photos/seed/venue-logo/400/400"} alt="Company Logo" />
                            <AvatarFallback>{profile?.companyName?.charAt(0) || 'V'}</AvatarFallback>
                        </Avatar>
                        <Button type="button" variant="outline">
                            <UploadCloud className="mr-2 h-4 w-4" />
                            Upload Logo
                        </Button>
                        <p className="text-xs text-muted-foreground">PNG, JPG, GIF up to 10MB.</p>
                    </CardContent>
                </Card>

                 <Card>
                    <CardHeader>
                        <CardTitle>Manage Subscription</CardTitle>
                        <CardDescription>Pause, resume, or cancel your plan.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-2">
                        <Button type="button" onClick={() => handleSubscriptionAction('resume')}>
                            <PlayCircle className="mr-2 h-4 w-4" /> Resume
                        </Button>
                        <Button type="button" onClick={() => handleSubscriptionAction('pause')} variant="outline">
                            <PauseCircle className="mr-2 h-4 w-4" /> Pause
                        </Button>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button type="button" variant="destructive">
                                <XCircle className="mr-2 h-4 w-4" /> Cancel
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure you want to cancel?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    You will lose access to venue features at the end of your billing cycle.
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleSubscriptionAction('cancel')}>
                                    Confirm Cancellation
                                </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </CardContent>
                </Card>
            </div>
          </div>
          <div className="flex justify-end mt-8">
            <Button type="submit" size="lg" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
