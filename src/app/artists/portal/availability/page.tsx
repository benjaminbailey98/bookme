
'use client';

import { useState } from 'react';
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  query,
  where,
  getDocs,
  writeBatch,
} from 'firebase/firestore';
import { useFirestore, useUser, useCollection, useMemoFirebase } from '@/firebase';
import type { ArtistAvailability } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { format, isSameDay, parseISO } from 'date-fns';
import { PlusCircle, Trash2, XCircle } from 'lucide-react';
import { FirestorePermissionError } from '@/firebase/errors';
import { errorEmitter } from '@/firebase/error-emitter';

export default function ArtistAvailabilityPage() {
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );
  const [isAllDay, setIsAllDay] = useState(false);
  const [timeRanges, setTimeRanges] = useState([{ from: '', to: '' }]);

  const availabilityCollectionRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, 'artist_profiles', user.uid, 'availability');
  }, [firestore, user]);
  
  const { data: availabilityData, isLoading } = useCollection<ArtistAvailability>(availabilityCollectionRef);

  const unavailableDates =
    availabilityData?.map((a) => new Date(a.unavailableDate)) || [];
    
  const sortedUnavailableDates = availabilityData
    ? [...availabilityData].sort((a, b) => new Date(a.unavailableDate).getTime() - new Date(b.unavailableDate).getTime())
    : [];

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;
    setSelectedDate(date);
    
    const existingForDate = availabilityData?.find(a => isSameDay(new Date(a.unavailableDate), date));
    if (existingForDate) {
      setIsAllDay(existingForDate.isAllDay || false);
      if (existingForDate.unavailableStartTime && existingForDate.unavailableEndTime) {
         // This is simplified. A real app might have multiple entries per day.
         setTimeRanges([{ from: existingForDate.unavailableStartTime, to: existingForDate.unavailableEndTime }]);
      } else {
         setTimeRanges([{ from: '', to: '' }]);
      }
    } else {
      setIsAllDay(false);
      setTimeRanges([{ from: '', to: '' }]);
    }
  };

  const handleTimeChange = (
    index: number,
    field: 'from' | 'to',
    value: string
  ) => {
    const newRanges = [...timeRanges];
    newRanges[index][field] = value;
    setTimeRanges(newRanges);
  };

  const addTimeRange = () => {
    setTimeRanges([...timeRanges, { from: '', to: '' }]);
  };

  const removeTimeRange = (index: number) => {
    const newRanges = timeRanges.filter((_, i) => i !== index);
    setTimeRanges(newRanges);
  };

  const handleSaveAvailability = async () => {
    if (!user || !firestore || !selectedDate) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'You must be logged in and select a date.',
      });
      return;
    }

    const formattedDate = format(selectedDate, 'yyyy-MM-dd');
  
    // First, clear existing availability for the selected date
    const q = query(collection(firestore, 'artist_profiles', user.uid, 'availability'), where("unavailableDate", "==", formattedDate));
    const querySnapshot = await getDocs(q);
    const batch = writeBatch(firestore);
    querySnapshot.forEach(doc => {
        batch.delete(doc.ref);
    });

    const baseData = {
      artistProfileId: user.uid,
      unavailableDate: formattedDate,
    };

    if (isAllDay) {
        const newEntry = { ...baseData, isAllDay: true };
        const docRef = doc(collection(firestore, 'artist_profiles', user.uid, 'availability'));
        batch.set(docRef, newEntry);

    } else {
        for (const range of timeRanges) {
            if (range.from && range.to) {
                const newEntry = {
                    ...baseData,
                    isAllDay: false,
                    unavailableStartTime: range.from,
                    unavailableEndTime: range.to,
                };
                const docRef = doc(collection(firestore, 'artist_profiles', user.uid, 'availability'));
                batch.set(docRef, newEntry);
            }
        }
    }

    batch.commit().then(() => {
        toast({
            title: 'Availability Saved',
            description: `Your schedule for ${format(
              selectedDate,
              'PPP'
            )} has been updated.`,
          });
    }).catch(serverError => {
        const permissionError = new FirestorePermissionError({
            path: `artist_profiles/${user.uid}/availability`,
            operation: 'write',
        });
        errorEmitter.emit('permission-error', permissionError);
    })
  };

  const handleClearAvailabilityForDay = async () => {
     if (!user || !firestore || !selectedDate) return;
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      const q = query(collection(firestore, 'artist_profiles', user.uid, 'availability'), where("unavailableDate", "==", formattedDate));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        toast({ title: "You are already available on this day."});
        return;
      }
      
      const batch = writeBatch(firestore);
      querySnapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });

      await batch.commit().then(() => {
          toast({
              title: "Availability Cleared",
              description: `You are now marked as available for ${format(selectedDate, 'PPP')}.`,
              variant: "default"
          });
          setIsAllDay(false);
          setTimeRanges([{ from: '', to: '' }]);
      }).catch(serverError => {
           const permissionError = new FirestorePermissionError({
                path: `artist_profiles/${user.uid}/availability`,
                operation: 'delete',
            });
            errorEmitter.emit('permission-error', permissionError);
      });
  }


  return (
    <div className="container mx-auto max-w-7xl py-12 md:py-20 space-y-8">
      <div className="space-y-2 mb-12">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tighter font-headline text-center">
          My Availability
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto text-center">
          Select dates on the calendar to mark yourself as unavailable for
          bookings.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 flex justify-center items-center">
          <Calendar
            mode="multiple"
            selected={unavailableDates}
            onSelect={(dates) => {
              // This component is for display only, selection logic is handled by onDayClick
            }}
            onDayClick={handleDateSelect}
            className="p-0"
            numberOfMonths={2}
            classNames={{
              month: 'space-y-4 border-r last:border-r-0 p-3',
              months: 'flex flex-col sm:flex-row rounded-lg border',
            }}
          />
        </Card>

        <Card className="lg:col-span-1 h-fit">
          <CardHeader>
            <CardTitle>
              Set Unavailability for{' '}
              {selectedDate ? format(selectedDate, 'PPP') : '...'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center space-x-2">
              <Switch
                id="all-day"
                checked={isAllDay}
                onCheckedChange={setIsAllDay}
              />
              <Label htmlFor="all-day">Unavailable for the entire day</Label>
            </div>

            {!isAllDay && (
              <div className="space-y-4">
                <Label>Unavailable Times</Label>
                {timeRanges.map((range, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      type="time"
                      value={range.from}
                      onChange={(e) =>
                        handleTimeChange(index, 'from', e.target.value)
                      }
                    />
                    <span>-</span>
                    <Input
                      type="time"
                      value={range.to}
                      onChange={(e) =>
                        handleTimeChange(index, 'to', e.target.value)
                      }
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeTimeRange(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addTimeRange}
                  className="w-full"
                >
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Time Range
                </Button>
              </div>
            )}
            <div className="flex flex-col space-y-2">
                <Button onClick={handleSaveAvailability}>Save Unavailability</Button>
                 <Button variant="outline" onClick={handleClearAvailabilityForDay}>
                    <XCircle className="mr-2 h-4 w-4" />
                    Mark as Available
                </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
          <CardHeader>
              <CardTitle>Unavailable Dates</CardTitle>
              <CardDescription>A list of all your currently marked unavailable dates.</CardDescription>
          </CardHeader>
          <CardContent>
              {isLoading ? (
                  <p>Loading availability...</p>
              ) : sortedUnavailableDates.length > 0 ? (
                  <ul className="space-y-2">
                  {sortedUnavailableDates.map(item => (
                      <li key={item.id} className="flex justify-between items-center text-sm p-2 rounded-md bg-muted">
                      <span>{format(parseISO(item.unavailableDate), 'PPP')}</span>
                      <span>
                          {item.isAllDay
                          ? 'All Day'
                          : `${item.unavailableStartTime} - ${item.unavailableEndTime}`}
                      </span>
                      </li>
                  ))}
                  </ul>
              ) : (
                  <p className="text-muted-foreground">You have not set any unavailable dates.</p>
              )}
          </CardContent>
      </Card>
    </div>
  );
}

    