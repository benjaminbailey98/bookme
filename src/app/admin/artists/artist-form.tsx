
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
import { Textarea } from '@/components/ui/textarea';
import { PasswordInput } from '@/components/ui/password-input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArtistProfile } from '@/lib/types';
import { useTransition } from 'react';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { createAccountAndProfile } from './actions';

const profileFormSchema = z.object({
  stageName: z.string().min(1, 'Stage name is required.'),
  realName: z.string().min(1, 'Real name is required.'),
  personalEmail: z.string().email('A valid email is required to create an account.'),
  personalPhone: z.string().min(1, 'Phone number is required.'),
  password: z.string().min(8, 'Password must be at least 8 characters.'),
  shortBio: z.string().max(500, 'Bio cannot exceed 500 characters.').optional(),
  websiteUrl: z.string().url().optional().or(z.literal('')),
  instagramUrl: z.string().url().optional().or(z.literal('')),
  facebookUrl: z.string().url().optional().or(z.literal('')),
  youtubeUrl: z.string().url().optional().or(z.literal('')),
  spotifyUrl: z.string().url().optional().or(z.literal('')),
  managementCompanyName: z.string().optional(),
  managementContactPerson: z.string().optional(),
  managementEmail: z.string().email().optional().or(z.literal('')),
  managementPhone: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface ArtistFormProps {
  artist?: ArtistProfile;
  onSuccess?: () => void;
}

export function ArtistForm({ artist, onSuccess }: ArtistFormProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      stageName: artist?.stageName || '',
      realName: artist?.realName || '',
      personalEmail: artist?.personalEmail || '',
      personalPhone: artist?.personalPhone || '',
      password: '',
      shortBio: artist?.shortBio || '',
      websiteUrl: artist?.websiteUrl || '',
      instagramUrl: artist?.instagramUrl || '',
      facebookUrl: artist?.facebookUrl || '',
      youtubeUrl: artist?.youtubeUrl || '',
      spotifyUrl: artist?.spotifyUrl || '',
      managementCompanyName: artist?.managementCompanyName || '',
      managementContactPerson: artist?.managementContactPerson || '',
      managementEmail: artist?.managementEmail || '',
      managementPhone: artist?.managementPhone || '',
    },
  });

  const onSubmit = (data: ProfileFormValues) => {
    startTransition(async () => {
      const { password, ...profileData } = data;
      
      const result = await createAccountAndProfile(profileData, password);

      if (result.success) {
        toast({
          title: 'Artist Created',
          description: `The profile for ${data.stageName} has been successfully created.`,
        });
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
                 {/* Account Creation */}
                <div className="space-y-4 rounded-md border p-4">
                    <h3 className="text-lg font-medium">Account Credentials</h3>
                     <FormField
                        control={form.control}
                        name="personalEmail"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Artist's Email (for login)</FormLabel>
                            <FormControl>
                            <Input
                                type="email"
                                placeholder="artist@example.com"
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


                {/* Personal Details */}
                 <div className="space-y-4">
                    <h3 className="text-lg font-medium">Personal Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField control={form.control} name="stageName" render={({ field }) => (
                            <FormItem><FormLabel>Stage Name</FormLabel><FormControl><Input placeholder="e.g., DJ Smooth" {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField control={form.control} name="realName" render={({ field }) => (
                            <FormItem><FormLabel>Real Name</FormLabel><FormControl><Input placeholder="e.g., John Doe" {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField control={form.control} name="personalPhone" render={({ field }) => (
                            <FormItem><FormLabel>Personal Phone</FormLabel><FormControl><Input placeholder="(555) 123-4567" {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                    </div>
                </div>

                {/* Public Profile */}
                 <div className="space-y-4">
                    <h3 className="text-lg font-medium">Public Profile</h3>
                    <FormField control={form.control} name="shortBio" render={({ field }) => (
                        <FormItem><FormLabel>Short Bio</FormLabel><FormControl><Textarea placeholder="Tell us about the artist's music and style..." {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                 </div>

                {/* Social Media Links */}
                 <div className="space-y-4">
                    <h3 className="text-lg font-medium">Social Media & Links</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField control={form.control} name="websiteUrl" render={({ field }) => (<FormItem><FormLabel>Website</FormLabel><FormControl><Input placeholder="https://yourwebsite.com" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                        <FormField control={form.control} name="instagramUrl" render={({ field }) => (<FormItem><FormLabel>Instagram</FormLabel><FormControl><Input placeholder="https://instagram.com/your-profile" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                        <FormField control={form.control} name="facebookUrl" render={({ field }) => (<FormItem><FormLabel>Facebook</FormLabel><FormControl><Input placeholder="https://facebook.com/your-page" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                        <FormField control={form.control} name="youtubeUrl" render={({ field }) => (<FormItem><FormLabel>YouTube</FormLabel><FormControl><Input placeholder="https://youtube.com/your-channel" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                        <FormField control={form.control} name="spotifyUrl" render={({ field }) => (<FormItem><FormLabel>Spotify</FormLabel><FormControl><Input placeholder="https://spotify.com/your-artist-link" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                    </div>
                 </div>

                {/* Management Info */}
                 <div className="space-y-4">
                     <h3 className="text-lg font-medium">Management Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField control={form.control} name="managementCompanyName" render={({ field }) => (<FormItem><FormLabel>Company Name</FormLabel><FormControl><Input placeholder="Music Management Inc." {...field} /></FormControl><FormMessage /></FormItem>)}/>
                        <FormField control={form.control} name="managementContactPerson" render={({ field }) => (<FormItem><FormLabel>Contact Person</FormLabel><FormControl><Input placeholder="Manager Name" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                        <FormField control={form.control} name="managementEmail" render={({ field }) => (<FormItem><FormLabel>Management Email</FormLabel><FormControl><Input type="email" placeholder="manager@example.com" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                        <FormField control={form.control} name="managementPhone" render={({ field }) => (<FormItem><FormLabel>Management Phone</FormLabel><FormControl><Input placeholder="(555) 555-5555" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                    </div>
                </div>
            </div>
        </ScrollArea>
        <div className="flex justify-end pt-6">
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Artist
          </Button>
        </div>
      </form>
    </Form>
  );
}
