
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
import Link from 'next/link';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { PasswordInput } from '@/components/ui/password-input';
import { useToast } from '@/hooks/use-toast';
import { useAuth, useFirestore, errorEmitter, FirestorePermissionError } from '@/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

// Venue Schema
const venueFormSchema = z.object({
  companyName: z.string().min(1, 'Company name is required.'),
  email: z.string().email('Please enter a valid email.'),
  phone: z.string().min(1, 'Company phone is required.'),
  password: z.string().min(8, 'Password must be at least 8 characters.'),
});
type VenueFormValues = z.infer<typeof venueFormSchema>;

// Artist Schema
const artistFormSchema = z.object({
  stageName: z.string().min(1, 'Stage name is required.'),
  email: z.string().email('Please enter a valid email.'),
  phone: z.string().min(1, 'Phone number is required.'),
  password: z.string().min(8, 'Password must be at least 8 characters.'),
});
type ArtistFormValues = z.infer<typeof artistFormSchema>;

function VenueRegistrationForm() {
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
      
      const userDocRef = doc(firestore, 'users', user.uid);
      const userDocData = {
        id: user.uid,
        email: data.email,
        registrationDate: new Date().toISOString(),
        isVenue: true,
      };

      // Non-blocking write with contextual error handling
      setDoc(userDocRef, userDocData)
        .then(() => {
            toast({
              title: 'Venue Profile Created!',
              description: 'Your venue profile has been successfully created.',
            });
            router.push('/venues');
        })
        .catch(serverError => {
            const permissionError = new FirestorePermissionError({
              path: userDocRef.path,
              operation: 'create',
              requestResourceData: userDocData,
            });
            errorEmitter.emit('permission-error', permissionError);
        });

    } catch (error: any) {
      console.error('Venue registration failed:', error);
      toast({
        variant: 'destructive',
        title: 'Registration Failed',
        description: error.message || 'An unexpected error occurred.',
      });
    }
  }

  return (
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
  );
}

function ArtistRegistrationForm() {
  const { toast } = useToast();
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const form = useForm<ArtistFormValues>({
    resolver: zodResolver(artistFormSchema),
    defaultValues: {
      stageName: '',
      email: '',
      phone: '',
      password: '',
    },
  });

  async function onSubmit(data: ArtistFormValues) {
    if (!auth || !firestore) return;
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );
      const user = userCredential.user;

      const userDocRef = doc(firestore, 'users', user.uid);
      const userDocData = {
        id: user.uid,
        email: data.email,
        registrationDate: new Date().toISOString(),
        isVenue: false,
      };

      // Non-blocking write with contextual error handling
      setDoc(userDocRef, userDocData)
        .then(() => {
          toast({
            title: 'Artist Profile Created!',
            description: 'Your artist profile has been successfully created.',
          });
          router.push('/artists/portal');
        })
        .catch(serverError => {
          const permissionError = new FirestorePermissionError({
            path: userDocRef.path,
            operation: 'create',
            requestResourceData: userDocData,
          });
          errorEmitter.emit('permission-error', permissionError);
        });

    } catch (error: any) {
      console.error('Artist registration failed:', error);
      toast({
        variant: 'destructive',
        title: 'Registration Failed',
        description: error.message || 'An unexpected error occurred.',
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="stageName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Stage Name</FormLabel>
              <FormControl>
                <Input placeholder="DJ Smooth" {...field} />
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
              <FormLabel>Contact Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="contact@djsmooth.com"
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
              <FormLabel>Contact Phone</FormLabel>
              <FormControl>
                <Input placeholder="(555) 123-4567" {...field} />
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
          Create Artist Profile
        </Button>
      </form>
    </Form>
  );
}

export default function SignupPage() {
  return (
    <div className="container mx-auto max-w-4xl py-12 md:py-20">
      <div className="space-y-2 text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tighter font-headline">
          Join Vibe Request
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Choose the option that best fits your needs. Already have an account?{' '}
          <Link href="/login" className="text-primary hover:underline">
            Login
          </Link>
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
        <Card className="flex flex-col lg:col-span-1">
          <CardHeader>
            <CardTitle>One-Time Booking</CardTitle>
            <CardDescription>
              Need an artist for a single event? Submit a booking request
              without creating an account.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow flex items-center justify-center">
            <Button asChild size="lg">
              <Link href="/book">Submit a Booking Request</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Register as a Venue</CardTitle>
            <CardDescription>
              Register your venue to easily manage bookings and connect with
              artists.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <VenueRegistrationForm />
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Register as an Artist</CardTitle>
            <CardDescription>
              Join our roster of talented artists to get booked for events.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ArtistRegistrationForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
