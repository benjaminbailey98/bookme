'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { PasswordInput } from '@/components/ui/password-input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { VenueProfile } from '@/lib/types';
import { useTransition } from 'react';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { createVenueAccountAndProfile } from './actions';

const profileFormSchema = z.object({
  companyName: z.string().min(1, 'Company name is required.'),
  companyEmail: z.string().email('A valid email is required to create an account.'),
  password: z.string().min(8, 'Password must be at least 8 characters.'),
  companyPhone: z.string().min(1, 'Phone number is required.'),
  companyAddress: z.string().min(1, 'Address is required.'),
  businessHours: z.string().min(1, 'Business hours are required.'),
  contactTitle: z.string().min(1, 'Contact title is required.'),
  contactName: z.string().min(1, 'Contact name is required.'),
  contactEmail: z.string().email('A valid contact email is required.'),
  contactPhone: z.string().min(1, 'A valid contact phone is required.'),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface VenueFormProps {
  venue?: VenueProfile;
  onSuccess?: () => void;
}

export function VenueForm({ venue, onSuccess }: VenueFormProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      companyName: venue?.companyName || '',
      companyEmail: venue?.companyEmail || '',
      password: '',
      companyPhone: venue?.companyPhone || '',
      companyAddress: venue?.companyAddress || '',
      businessHours: venue?.businessHours || '',
      contactTitle: venue?.contactTitle || '',
      contactName: venue?.contactName || '',
      contactEmail: venue?.contactEmail || '',
      contactPhone: venue?.contactPhone || '',
    },
  });

  const onSubmit = (data: ProfileFormValues) => {
    startTransition(async () => {
      const { password, ...profileData } = data;
      
      const result = await createVenueAccountAndProfile(profileData, password);

      if (result.success) {
        toast({
          title: 'Venue Created',
          description: `The profile for ${data.companyName} has been successfully created.`,
        });
        form.reset();
        onSuccess?.();
      } else {
        toast({
          variant: 'destructive',
          title: 'Creation Failed',
          description: result.error,
        });
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <ScrollArea className="h-96 pr-6">
          <div className="space-y-6">
            <div className="space-y-4 rounded-md border p-4">
              <h3 className="text-lg font-medium">Account Credentials</h3>
              <FormField
                control={form.control}
                name="companyEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Venue's Email (for login)</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="contact@venue.com"
                        {...field}
                      />
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
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Company Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="companyName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., The Grand Hall" {...field} />
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
                        <Input placeholder="(555) 123-4567" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
               <FormField
                  control={form.control}
                  name="companyAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input placeholder="123 Music Lane, Nashville, TN" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
               <FormField
                  control={form.control}
                  name="businessHours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business Hours</FormLabel>
                      <FormControl>
                        <Textarea placeholder="e.g., Mon-Fri: 9am-5pm, Sat: 12pm-12am, Sun: Closed" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Primary Contact</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="contactName"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Contact Name</FormLabel>
                            <FormControl>
                            <Input placeholder="e.g., Alex Doe" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="contactTitle"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Contact Title</FormLabel>
                            <FormControl>
                            <Input placeholder="e.g., Booking Manager" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="contactEmail"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Contact Email</FormLabel>
                            <FormControl>
                            <Input placeholder="alex.doe@venue.com" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="contactPhone"
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
                </div>
            </div>
          </div>
        </ScrollArea>
        <div className="flex justify-end pt-6">
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Venue
          </Button>
        </div>
      </form>
    </Form>
  );
}
