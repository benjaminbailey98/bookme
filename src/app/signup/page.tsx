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

const venueFormSchema = z.object({
  companyName: z.string().min(1, 'Company name is required.'),
  companyEmail: z.string().email('Please enter a valid email.'),
  companyPhone: z.string().min(1, 'Company phone is required.'),
  password: z.string().min(8, 'Password must be at least 8 characters.'),
});

type VenueFormValues = z.infer<typeof venueFormSchema>;

function VenueRegistrationForm() {
  const { toast } = useToast();
  const form = useForm<VenueFormValues>({
    resolver: zodResolver(venueFormSchema),
  });

  function onSubmit(data: VenueFormValues) {
    console.log(data);
    toast({
      title: 'Venue Profile Created!',
      description: 'Your venue profile has been successfully created.',
    });
    form.reset({
      companyName: '',
      companyEmail: '',
      companyPhone: '',
      password: '',
    });
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
          name="companyEmail"
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
          name="companyPhone"
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
        <Button type="submit" className="w-full">
          Create Venue Profile
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
          Choose the option that best fits your needs.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 items-start">
        <Card className="flex flex-col">
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

        <Card>
          <CardHeader>
            <CardTitle>Create a Venue Profile</CardTitle>
            <CardDescription>
              Register your venue to easily manage bookings and connect with
              artists.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <VenueRegistrationForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
