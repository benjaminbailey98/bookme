
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFieldArray } from 'react-hook-form';
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
import { UploadCloud, PlusCircle, Trash2, Loader2 } from 'lucide-react';
import { PasswordInput } from '@/components/ui/password-input';
import { useFirestore, useUser, useDoc, useMemoFirebase } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { ArtistProfile } from '@/lib/types';
import { useEffect } from 'react';

const socialLinkSchema = z.object({
  platform: z.string(),
  url: z.string().url('Please enter a valid URL.'),
});

const profileFormSchema = z.object({
  stageName: z.string().min(1, 'Stage name is required.'),
  realName: z.string().min(1, 'Real name is required.'),
  personalEmail: z.string().email(),
  personalPhone: z.string().min(1, 'Phone number is required.'),
  shortBio: z.string().max(500, 'Bio cannot exceed 500 characters.'),
  websiteUrl: z.string().url().optional().or(z.literal('')),
  instagramUrl: z.string().url().optional().or(z.literal('')),
  facebookUrl: z.string().url().optional().or(z.literal('')),
  youtubeUrl: z.string().url().optional().or(z.literal('')),
  spotifyUrl: z.string().url().optional().or(z.literal('')),
  additionalLinks: z.array(socialLinkSchema).optional(),
  managementCompanyName: z.string().optional(),
  managementContactPerson: z.string().optional(),
  managementEmail: z.string().email().optional().or(z.literal('')),
  managementPhone: z.string().optional(),
  newPassword: z.string().min(8, 'Password must be at least 8 characters.').optional().or(z.literal('')),
  confirmPassword: z.string().optional().or(z.literal('')),
}).refine(data => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
});


type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function ArtistProfilePage() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  
  const artistProfileRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'artist_profiles', user.uid);
  }, [firestore, user]);

  const { data: profile, isLoading: isProfileLoading } = useDoc<ArtistProfile>(artistProfileRef);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      stageName: '',
      realName: '',
      personalEmail: '',
      personalPhone: '',
      shortBio: '',
      websiteUrl: '',
      instagramUrl: '',
      facebookUrl: '',
      youtubeUrl: '',
      spotifyUrl: '',
      additionalLinks: [],
      managementCompanyName: '',
      managementContactPerson: '',
      managementEmail: '',
      managementPhone: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    if (profile) {
      form.reset(profile);
    }
     if (user && !profile) {
      form.setValue('personalEmail', user.email || '');
    }
  }, [profile, user, form]);

  const { fields, append, remove } =
    useFieldArray({
    name: 'additionalLinks',
    control: form.control,
  });

  function onSubmit(data: ProfileFormValues) {
    if (!user || !firestore) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'You must be logged in to update your profile.',
      });
      return;
    }

    const { newPassword, confirmPassword, ...profileData } = data;
    const profileRef = doc(firestore, 'artist_profiles', user.uid);
    
    const finalProfileData = {
      ...profileData,
      userId: user.uid,
      id: user.uid, // Explicitly set id for consistency with schema
    };

    setDoc(profileRef, finalProfileData, { merge: true })
      .then(() => {
        toast({
          title: 'Profile Updated!',
          description: 'Your changes have been saved successfully.',
        });
      })
      .catch((serverError) => {
        const permissionError = new FirestorePermissionError({
          path: profileRef.path,
          operation: 'update',
          requestResourceData: finalProfileData,
        });
        errorEmitter.emit('permission-error', permissionError);
      });

    // TODO: Handle password change logic
    if (newPassword) {
      console.log('Password change requested. Implement this securely.');
    }
  }

  if (isUserLoading || isProfileLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <h2 className="text-3xl font-bold tracking-tight">Artist Profile</h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {/* Personal Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Personal Details</CardTitle>
                  <CardDescription>
                    This information is for internal use and will not be displayed publicly.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="stageName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Stage Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., DJ Smooth" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="realName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Real Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="personalEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Personal Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="you@example.com" {...field} disabled/>
                        </FormControl>
                         <FormDescription>Your login email cannot be changed.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="personalPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Personal Phone</FormLabel>
                        <FormControl>
                          <Input placeholder="(555) 123-4567" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Public Profile */}
              <Card>
                <CardHeader>
                  <CardTitle>Public Profile</CardTitle>
                  <CardDescription>
                    This information will be visible on your artist page.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="shortBio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Short Bio</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Tell us about your music and style..."
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          A brief description of your act (max 500 characters).
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Social Media Links */}
              <Card>
                <CardHeader>
                  <CardTitle>Social Media & Links</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <FormField control={form.control} name="websiteUrl" render={({ field }) => (
                        <FormItem><FormLabel>Website</FormLabel><FormControl><Input placeholder="https://yourwebsite.com" {...field} /></FormControl><FormMessage /></FormItem>
                     )}/>
                     <FormField control={form.control} name="instagramUrl" render={({ field }) => (
                        <FormItem><FormLabel>Instagram</FormLabel><FormControl><Input placeholder="https://instagram.com/your-profile" {...field} /></FormControl><FormMessage /></FormItem>
                     )}/>
                     <FormField control={form.control} name="facebookUrl" render={({ field }) => (
                        <FormItem><FormLabel>Facebook</FormLabel><FormControl><Input placeholder="https://facebook.com/your-page" {...field} /></FormControl><FormMessage /></FormItem>
                     )}/>
                     <FormField control={form.control} name="youtubeUrl" render={({ field }) => (
                        <FormItem><FormLabel>YouTube</FormLabel><FormControl><Input placeholder="https://youtube.com/your-channel" {...field} /></FormControl><FormMessage /></FormItem>
                     )}/>
                     <FormField control={form.control} name="spotifyUrl" render={({ field }) => (
                        <FormItem><FormLabel>Spotify</FormLabel><FormControl><Input placeholder="https://spotify.com/your-artist-link" {...field} /></FormControl><FormMessage /></FormItem>
                     )}/>
                  </div>
                  <div>
                    <FormLabel>Additional Links</FormLabel>
                    {fields.map((field, index) => (
                      <div key={field.id} className="flex items-center gap-2 mt-2">
                        <FormField
                          control={form.control}
                          name={`additionalLinks.${index}.platform`}
                          render={({ field }) => (
                             <Input {...field} placeholder="Platform (e.g. TikTok)" />
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`additionalLinks.${index}.url`}
                          render={({ field }) => (
                            <Input {...field} placeholder="URL" />
                          )}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => remove(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => append({ platform: '', url: '' })}
                    >
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Add Link
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Management Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Management Information</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField control={form.control} name="managementCompanyName" render={({ field }) => (
                      <FormItem><FormLabel>Company Name</FormLabel><FormControl><Input placeholder="Music Management Inc." {...field} /></FormControl><FormMessage /></FormItem>
                  )}/>
                  <FormField control={form.control} name="managementContactPerson" render={({ field }) => (
                      <FormItem><FormLabel>Contact Person</FormLabel><FormControl><Input placeholder="Manager Name" {...field} /></FormControl><FormMessage /></FormItem>
                  )}/>
                  <FormField control={form.control} name="managementEmail" render={({ field }) => (
                      <FormItem><FormLabel>Management Email</FormLabel><FormControl><Input type="email" placeholder="manager@example.com" {...field} /></FormControl><FormMessage /></FormItem>
                  )}/>
                  <FormField control={form.control} name="managementPhone" render={({ field }) => (
                      <FormItem><FormLabel>Management Phone</FormLabel><FormControl><Input placeholder="(555) 555-5555" {...field} /></FormControl><FormMessage /></FormItem>
                  )}/>
                </CardContent>
              </Card>

              {/* Password */}
              <Card>
                <CardHeader>
                  <CardTitle>Update Password</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <FormControl>
                          <PasswordInput placeholder="********" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm New Password</FormLabel>
                        <FormControl>
                          <PasswordInput placeholder="********" {...field} />
                        </FormControl>
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
                  <CardTitle>Profile Picture</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-4">
                  <Avatar className="w-40 h-40">
                    <AvatarImage src={profile?.artistProfilePictureUrl || "https://picsum.photos/seed/artist-pfp/400/400"} alt="Artist Profile Picture"/>
                    <AvatarFallback>{profile?.stageName?.charAt(0) || 'A'}</AvatarFallback>
                  </Avatar>
                  <Button type="button" variant="outline">
                    <UploadCloud className="mr-2 h-4 w-4" />
                    Upload Photo
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    PNG, JPG, GIF up to 10MB.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Video</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-4">
                    <div className="w-full aspect-video bg-muted rounded-md flex items-center justify-center">
                        <p className="text-muted-foreground">Video Preview</p>
                    </div>
                  <Button type="button" variant="outline">
                    <UploadCloud className="mr-2 h-4 w-4" />
                    Upload Video
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    MP4, 2 minutes max.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Referral Code</CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                   <div className="w-32 h-32 bg-muted mx-auto flex items-center justify-center">
                       <p className="text-sm text-muted-foreground">QR Code</p>
                   </div>
                   <p className="font-mono text-lg font-bold">ARTIST-12345</p>
                   <Button type="button" variant="outline" size="sm">Copy Code</Button>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" size="lg" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
