
'use client';

import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

// This page now acts as a redirector to the venue portal.
// Public-facing venue pages can be built out separately.
export default function VenuesPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading) {
      if (user) {
        // If the user is logged in, redirect them to their portal.
        router.replace('/venues/portal');
      } else {
        // If not logged in, redirect to the signup page as a fallback.
        router.replace('/signup');
      }
    }
  }, [user, isUserLoading, router]);

  return (
    <div className="container mx-auto flex min-h-[calc(100vh-4rem)] items-center justify-center">
      <p>Redirecting to venue portal...</p>
    </div>
  );
}
