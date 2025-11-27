
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { CalendarIcon, HelpCircle, Loader2, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useEffect, useState, useTransition } from 'react';
import { getSuggestions, submitBookingRequest } from './actions';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query } from 'firebase/firestore';
import type { ArtistProfile } from '@/lib/types';

const bookingFormSchema = z.object({
  eventDate: z.date({
    required_error: 'An event date is required.',
  }),
  eventTime: z.string().min(1, 'Event time is required.'),
  lengthOfEvent: z.string().refine(val => !isNaN(parseFloat(val)) && parseFloat(val) > 0, { message: 'Must be a positive number.' }),
  lengthOfPerformance: z.string().refine(val => !isNaN(parseFloat(val)) && parseFloat(val) > 0, { message: 'Must be a positive number.' }),
  venueName: z.string().min(1, 'Venue name is required.'),
  locationAddress: z.string().min(1, 'Venue location is required.'),
  contactName: z.string().min(1, 'Contact name is required.'),
  contactPhone: z.string().min(1, 'Contact phone is required.'),
  contactEmail: z.string().email('Please enter a valid email.'),
  eventType: z.string().min(1, 'Please select an event type.'),
  attire: z.string().optional(),
  eventTheme: z.string().optional(),
  liveEntertainmentBudget: z.string().refine((val) => !isNaN(parseFloat(val)), 'Must be a number'),
  isTicketedEvent: z.boolean().default(false),
  ticketPrices: z.string().optional(),
  entertainmentType: z.string().min(1, 'Please select entertainment type.'),
  liveBandProvidedBy: z.enum(['venue', 'artist'], {
    required_error: 'Please select an option for the live band.',
  }),
  soundProvidedBy: z.enum(['venue', 'artist'], {
    required_error: 'Please select an option for sound.',
  }),
  artistProfileId: z.string().min(1, 'Please select an artist.'),
  referralInfo: z.string().optional(),
});

type BookingFormValues = z.infer<typeof bookingFormSchema>;

const formFields = [
  { name: 'eventDate', tooltip: 'The date your event will take place.' },
  { name: 'eventTime', tooltip: 'The start time of your event.' },
  { name: 'lengthOfEvent', tooltip: 'Total duration of the event (e.g., 4 hours).' },
  { name: 'lengthOfPerformance', tooltip: 'How long the artist is expected to perform (e.g., 2 hours).'},
  { name: 'venueName', tooltip: 'The name of the venue or place.' },
  { name: 'locationAddress', tooltip: 'The full address of the event location.' },
  { name: 'contactName', tooltip: 'Main point of contact for this booking.' },
  { name: 'contactPhone', tooltip: 'Phone number for the main contact.' },
  { name: 'contactEmail', tooltip: 'Email address for the main contact.' },
  { name: 'eventType', tooltip: 'What kind of event are you hosting?' },
  { name: 'attire', tooltip: 'Suggested dress code for guests (e.g., Formal, Casual).' },
  { name: 'eventTheme', tooltip: 'The theme of your event (e.g., 80s Night, Tropical).' },
  { name: 'liveEntertainmentBudget', tooltip: 'Your total budget for live entertainment.' },
  { name: 'isTicketedEvent', tooltip: 'Will you be selling tickets for this event?' },
  { name: 'ticketPrices', tooltip: 'The price per ticket if applicable.' },
  { name: 'entertainmentType', tooltip: 'What role will the entertainer play?' },
  { name: 'liveBandProvidedBy', tooltip: 'Who is responsible for providing the live band?' },
  { name: 'soundProvidedBy', tooltip: 'Who is responsible for providing sound equipment?' },
  { name: 'artistProfileId', tooltip: 'Choose from our talented roster of artists.' },
  { name: 'referralInfo', tooltip: 'If someone referred you, let us know who!' },
];

const TooltipWrapper = ({
  children,
  content,
}: {
  children: React.ReactNode;
  content: string;
}) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent>
        <p>{content}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

export function BookingForm() {
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();
  const [isAiPending, startAiTransition] = useTransition();
  const [isSubmitPending, startSubmitTransition] = useTransition();
  const [aiNotes, setAiNotes] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  const artistsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'artist_profiles'));
  }, [firestore]);

  const { data: artists, isLoading: artistsLoading } =
    useCollection<ArtistProfile>(artistsQuery);


  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      isTicketedEvent: false,
    },
  });

  useEffect(() => {
    const artistId = searchParams.get('artist');
    if (artistId) {
      form.setValue('artistProfileId', artistId);
    }
    // If a venue user is logged in, use their ID for submission
    if(user && user.isVenue) {
      form.setValue('venueName', user.displayName || '');
    }
  }, [searchParams, form, user]);


  const isTicketed = form.watch('isTicketedEvent');

  function onSubmit(data: BookingFormValues) {
    // A one-time booker might not be logged in. A venue user would be.
    const venueProfileId = user?.uid || 'one-time-booking'; // Fallback for one-time bookers
    
    startSubmitTransition(async () => {
      const parsedData = {
          ...data,
          lengthOfEvent: parseFloat(data.lengthOfEvent),
          lengthOfPerformance: parseFloat(data.lengthOfPerformance),
          liveEntertainmentBudget: parseFloat(data.liveEntertainmentBudget),
      };

      const result = await submitBookingRequest(parsedData, venueProfileId);
      if (result.success) {
        toast({
            title: 'Request Submitted!',
            description:
                'Your request has been sent. Please allow 24-48 hours for a response.',
        });
        form.reset();
        setAiNotes(null);
        if (user) {
            router.push('/venues/portal/bookings');
        }
      } else {
        toast({
            variant: 'destructive',
            title: 'Submission Failed',
            description: result.error || 'Could not submit your booking request.',
        });
      }
    });
  }

  function handleAiSuggestions() {
    const { eventType, venueName, eventTheme } = form.getValues();
    startAiTransition(async () => {
      setAiNotes(null);
      const result = await getSuggestions({
        eventType,
        venue: venueName,
        theme: eventTheme,
      });

      if (result.success && result.data) {
        if (result.data.suggestedAttire) {
          form.setValue('attire', result.data.suggestedAttire, {
            shouldValidate: true,
          });
        }
        if (result.data.suggestedTheme) {
          form.setValue('eventTheme', result.data.suggestedTheme, {
            shouldValidate: true,
          });
        }
        if (result.data.additionalNotes) {
          setAiNotes(result.data.additionalNotes);
        }
        toast({
          title: 'Suggestions Applied',
          description: 'We\'ve filled in some ideas for you!',
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.error || 'Could not fetch suggestions.',
        });
      }
    });
  }
  
  function handleArtistSelect(value: string) {
    if (value === 'browse') {
      router.push('/artists');
    } else {
      form.setValue('artistProfileId', value);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Event Details</CardTitle>
            <CardDescription>
              Provide the core details about your event.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="eventDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="flex items-center gap-2">
                    Event Date
                    <TooltipWrapper content={formFields.find(f => f.name === 'eventDate')?.tooltip || ''}>
                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    </TooltipWrapper>
                  </FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={'outline'}
                          className={cn(
                            'w-full pl-3 text-left font-normal',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          {field.value ? (
                            format(field.value, 'PPP')
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date() || date < new Date('1900-01-01')}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="eventTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    Event Time
                     <TooltipWrapper content={formFields.find(f => f.name === 'eventTime')?.tooltip || ''}>
                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    </TooltipWrapper>
                  </FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lengthOfEvent"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    Length of Event (hours)
                     <TooltipWrapper content={formFields.find(f => f.name === 'lengthOfEvent')?.tooltip || ''}>
                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    </TooltipWrapper>
                  </FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g., 4" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lengthOfPerformance"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    Length of Performance (hours)
                     <TooltipWrapper content={formFields.find(f => f.name === 'lengthOfPerformance')?.tooltip || ''}>
                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    </TooltipWrapper>
                  </FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g., 1.5" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="venueName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    Venue
                     <TooltipWrapper content={formFields.find(f => f.name === 'venueName')?.tooltip || ''}>
                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    </TooltipWrapper>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="The Grand Hall" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="locationAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    Location
                     <TooltipWrapper content={formFields.find(f => f.name === 'locationAddress')?.tooltip || ''}>
                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    </TooltipWrapper>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="123 Main St, Anytown, USA" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="eventType"
              render={({ field }) => (
                <FormItem>
                   <FormLabel className="flex items-center gap-2">
                    Event Type
                     <TooltipWrapper content={formFields.find(f => f.name === 'eventType')?.tooltip || ''}>
                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    </TooltipWrapper>
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an event type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="wedding">Wedding</SelectItem>
                      <SelectItem value="funeral">Funeral</SelectItem>
                      <SelectItem value="ladies-night">Ladies Night</SelectItem>
                      <SelectItem value="studio-session">
                        Studio Session
                      </SelectItem>
                      <SelectItem value="concert">Concert</SelectItem>
                      <SelectItem value="private-party">Private Party</SelectItem>
                      <SelectItem value="corporate-event">Corporate Event</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
             <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
              <div>
                <CardTitle>Vibe & Style (Optional)</CardTitle>
                <CardDescription>
                  Help us understand the atmosphere of your event.
                </CardDescription>
              </div>
              <Button type="button" size="sm" onClick={handleAiSuggestions} disabled={isAiPending} className="mt-4 sm:mt-0">
                {isAiPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                Get Suggestions
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
             {aiNotes && (
              <Alert>
                <Sparkles className="h-4 w-4" />
                <AlertTitle>AI Suggestion</AlertTitle>
                <AlertDescription>{aiNotes}</AlertDescription>
              </Alert>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="attire"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        Attire
                         <TooltipWrapper content={formFields.find(f => f.name === 'attire')?.tooltip || ''}>
                          <HelpCircle className="h-4 w-4 text-muted-foreground" />
                        </TooltipWrapper>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Black-tie, Casual" {...field} value={field.value ?? ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="eventTheme"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        Event Theme
                         <TooltipWrapper content={formFields.find(f => f.name === 'eventTheme')?.tooltip || ''}>
                          <HelpCircle className="h-4 w-4 text-muted-foreground" />
                        </TooltipWrapper>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Roaring 20s" {...field} value={field.value ?? ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Entertainment Details</CardTitle>
            <CardDescription>
              Specify your entertainment needs and technical requirements.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <FormField
                  control={form.control}
                  name="liveEntertainmentBudget"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        Live Entertainment Budget
                        <TooltipWrapper content={formFields.find(f => f.name === 'liveEntertainmentBudget')?.tooltip || ''}>
                          <HelpCircle className="h-4 w-4 text-muted-foreground" />
                        </TooltipWrapper>
                      </FormLabel>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">$</span>
                        <FormControl>
                          <Input type="number" placeholder="2000" className="pl-7" {...field} />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="entertainmentType"
                  render={({ field }) => (
                    <FormItem>
                       <FormLabel className="flex items-center gap-2">
                        Type of Entertainment
                         <TooltipWrapper content={formFields.find(f => f.name === 'entertainmentType')?.tooltip || ''}>
                          <HelpCircle className="h-4 w-4 text-muted-foreground" />
                        </TooltipWrapper>
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select entertainment type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="featured-artist">
                            Featured Artist
                          </SelectItem>
                          <SelectItem value="multiple-artists">
                            Multiple Artists
                          </SelectItem>
                          <SelectItem value="host">Host</SelectItem>
                          <SelectItem value="background-vocals">
                            Background Vocals
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="liveBandProvidedBy"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                       <FormLabel className="flex items-center gap-2">
                        Live Band
                         <TooltipWrapper content={formFields.find(f => f.name === 'liveBandProvidedBy')?.tooltip || ''}>
                          <HelpCircle className="h-4 w-4 text-muted-foreground" />
                        </TooltipWrapper>
                      </FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-1"
                        >
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="venue" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Provided by venue
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="artist" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Provided by artist
                            </FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="soundProvidedBy"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="flex items-center gap-2">
                        Sound
                         <TooltipWrapper content={formFields.find(f => f.name === 'soundProvidedBy')?.tooltip || ''}>
                          <HelpCircle className="h-4 w-4 text-muted-foreground" />
                        </TooltipWrapper>
                      </FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-1"
                        >
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="venue" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Provided by venue
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="artist" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Provided by artist
                            </FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormDescription>
                        Sound is an additional cost for live music events, to be discussed after submission.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </div>
             <div className="space-y-4">
              <FormField
                control={form.control}
                name="isTicketedEvent"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="flex items-center gap-2">
                        Is this a ticketed event?
                         <TooltipWrapper content={formFields.find(f => f.name === 'isTicketedEvent')?.tooltip || ''}>
                          <HelpCircle className="h-4 w-4 text-muted-foreground" />
                        </TooltipWrapper>
                      </FormLabel>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              {isTicketed && (
                <FormField
                  control={form.control}
                  name="ticketPrices"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        Ticket Price
                         <TooltipWrapper content={formFields.find(f => f.name === 'ticketPrices')?.tooltip || ''}>
                          <HelpCircle className="h-4 w-4 text-muted-foreground" />
                        </TooltipWrapper>
                      </FormLabel>
                      <div className="relative">
                         <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">$</span>
                        <FormControl>
                          <Input type="number" placeholder="50.00" className="pl-7" {...field} value={field.value ?? ''}/>
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>
             <FormField
              control={form.control}
              name="artistProfileId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    Select an Artist
                     <TooltipWrapper content={formFields.find(f => f.name === 'artistProfileId')?.tooltip || ''}>
                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    </TooltipWrapper>
                  </FormLabel>
                  <Select
                    onValueChange={handleArtistSelect}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={artistsLoading ? "Loading artists..." : "Choose an artist"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {artistsLoading ? (
                        <SelectItem value="loading" disabled>Loading...</SelectItem>
                      ) : (
                        artists?.map((artist) => (
                            <SelectItem key={artist.id} value={artist.id}>
                                {artist.stageName}
                            </SelectItem>
                        ))
                      )}
                      <SelectItem value="browse">Browse from artist catalog...</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact & Final Details</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="contactName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      Contact Name
                       <TooltipWrapper content={formFields.find(f => f.name === 'contactName')?.tooltip || ''}>
                        <HelpCircle className="h-4 w-4 text-muted-foreground" />
                      </TooltipWrapper>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Jane Doe" {...field} />
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
                    <FormLabel className="flex items-center gap-2">
                      Contact Phone
                       <TooltipWrapper content={formFields.find(f => f.name === 'contactPhone')?.tooltip || ''}>
                        <HelpCircle className="h-4 w-4 text-muted-foreground" />
                      </TooltipWrapper>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="(555) 123-4567" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="contactEmail"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel className="flex items-center gap-2">
                      Contact Email
                       <TooltipWrapper content={formFields.find(f => f.name === 'contactEmail')?.tooltip || ''}>
                        <HelpCircle className="h-4 w-4 text-muted-foreground" />
                      </TooltipWrapper>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="jane.doe@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                  control={form.control}
                  name="referralInfo"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel className="flex items-center gap-2">
                        Referral
                         <TooltipWrapper content={formFields.find(f => f.name === 'referralInfo')?.tooltip || ''}>
                          <HelpCircle className="h-4 w-4 text-muted-foreground" />
                        </TooltipWrapper>
                      </FormLabel>
                      <FormControl>
                        <Textarea placeholder="How did you hear about us? (e.g., John Smith, Instagram)" {...field} value={field.value ?? ''}/>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" size="lg" disabled={isSubmitPending}>
            {isSubmitPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Submit Booking Request
          </Button>
        </div>
      </form>
    </Form>
  );
}

    