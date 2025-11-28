'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { PasswordInput } from '@/components/ui/password-input';
import { useToast } from '@/hooks/use-toast';
import { useAuth, useFirestore } from '@/firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { doc, writeBatch, Timestamp } from 'firebase/firestore';
import {
  type User,
  type VenueProfile,
  type Subscription,
} from '@/lib/types';
import { add } from 'date-fns';

const venueFormSchema = z.object({
  companyName: z.string().min(1, 'Company name is required.'),
  email: z.string().email('Please enter a valid email.'),
  phone: z.string().min(1, 'Company phone is required.'),
  password: z.string().min(8, 'Password must be at least 8 characters.'),
});
type VenueFormValues = z.infer<typeof venueFormSchema>;

function VenueRegistrationPage() {
  const { toast } = useToast();
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();

  const form = useForm<VenueFormValues>({
    resolver: zodResolver(venueFormSchema),
    defaultValues: {
      companyName: '',
      email: '',
      phone: '',
      password: '',
    },
  });

  async function onSubmit(data: VenueFormValues) {
    if (!auth || !firestore) return;

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );
      const user = userCredential.user;

      await updateProfile(user, { displayName: data.companyName });

      const batch = writeBatch(firestore);

      // Create user document
      const userDocRef = doc(firestore, 'users', user.uid);
      const newUserData: User = {
        id: user.uid,
        email: user.email!,
        registrationDate: new Date().toISOString(),
        isVenue: true,
        displayName: data.companyName,
      };
      batch.set(userDocRef, newUserData);

      // Create venue profile document
      const venueProfileRef = doc(firestore, 'venue_profiles', user.uid);
      const newVenueProfile: Partial<VenueProfile> = {
        companyName: data.companyName,
        companyPhone: data.phone,
        companyEmail: user.email!,
        companyAddress: '',
        businessHours: '',
        contactTitle: '',
        contactName: '',
        contactEmail: '',
        contactPhone: '',
      };
      batch.set(venueProfileRef, {
        ...newVenueProfile,
        id: user.uid,
        userId: user.uid,
      });

      // Create initial subscription
      const subscriptionRef = doc(
        firestore,
        'users',
        user.uid,
        'subscriptions',
        'default'
      );
      const now = new Date();
      const newSubscription: Omit<Subscription, 'id'> = {
        userId: user.uid,
        startDate: Timestamp.fromDate(now),
        dueDate: Timestamp.fromDate(add(now, { days: 30 })),
        accountStatus: 'active',
        paymentStatus: 'paid',
        paymentHistory: ['INV-TRIAL-001'],
      };
      batch.set(subscriptionRef, { ...newSubscription, id: 'default' });

      await batch.commit();

      toast({
        title: 'Venue Profile Created!',
        description: 'Your account has been created. Redirecting...',
      });
      router.push('/venues/portal/profile');
    } catch (error: any) {
      console.error('Sign up error:', error);
      if (error.code === 'auth/email-already-in-use') {
        toast({
          variant: 'destructive',
          title: 'Sign Up Failed',
          description:
            'This email is already in use. Please log in or use a different email.',
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Sign Up Failed',
          description: error.message || 'An unexpected error occurred.',
        });
      }
    }
  }

  return (
    <div className="container mx-auto flex min-h-[calc(100vh-4rem)] items-center justify-center py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Register as a Venue</CardTitle>
          <CardDescription>
            Register your venue to easily manage bookings and connect with
            artists.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name</FormLabel>
                    <FormControl>
                      <Input placeholder="The Grand Venue" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="contact@thegrand.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="(555) 987-6543" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Create Password</FormLabel>
                    <FormControl>
                      <PasswordInput placeholder="********" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Create Venue Profile
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

export default VenueRegistrationPage;
