import { Suspense } from 'react';
import { BookingForm } from './booking-form';

function BookingPageComponent() {
  return (
    <div className="container mx-auto max-w-4xl py-12 md:py-20">
      <div className="space-y-2 text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tighter font-headline">
          Submit a Booking Request
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Tell us about your event, and we'll connect you with the perfect
          talent.
        </p>
      </div>
      <BookingForm />
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense>
      <BookingPageComponent />
    </Suspense>
  );
}
