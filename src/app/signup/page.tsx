'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import Link from 'next/link';

export default function SignupPage() {
  return (
    <div className="container mx-auto flex min-h-[calc(100vh-4rem)] items-center justify-center py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold tracking-tight">
            Join Vibe Request
          </CardTitle>
          <CardDescription>
            Already have an account?{' '}
            <Link href="/login" className="text-primary hover:underline">
              Login
            </Link>
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col space-y-4">
          <Button asChild size="lg">
            <Link href="/signup/artist">Register as an Artist</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/signup/venue">Register as a Venue</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
