
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { PasswordInput } from '@/components/ui/password-input';
import { useAuth, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { doc, setDoc, writeBatch, collection, query, where, limit } from 'firebase/firestore';
import type { User } from '@/lib/types';
import { useEffect } from 'react';


const adminFormSchema = z.object({
  displayName: z.string().min(1, 'Display name is required.'),
  email: z.string().email('Please enter a valid email.'),
  password: z.string().min(8, 'Password must be at least 8 characters.'),
});
type AdminFormValues = z.infer<typeof adminFormSchema>;

export default function AdminRegistrationPage() {
    const { toast } = useToast();
    const auth = useAuth();
    const firestore = useFirestore();
    const router = useRouter();

    const form = useForm<AdminFormValues>({
        resolver: zodResolver(adminFormSchema),
        defaultValues: {
            displayName: '',
            email: '',
            password: '',
        },
    });

    const adminQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'users'), where('isAdmin', '==', true), limit(1));
    }, [firestore]);

    const { data: admins, isLoading } = useCollection<User>(adminQuery);
    
    useEffect(() => {
        if (!isLoading && admins && admins.length > 0) {
            router.replace('/admin');
        }
    }, [isLoading, admins, router]);
    

    async function onSubmit(data: AdminFormValues) {
        if (!auth || !firestore) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Firebase not initialized. Please try again.',
            });
            return;
        }

        if (admins && admins.length > 0) {
            toast({
                variant: 'destructive',
                title: 'Registration Closed',
                description: 'An administrator account already exists.',
            });
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
            const user = userCredential.user;

            await updateProfile(user, { displayName: data.displayName });
            
            const userDocRef = doc(firestore, 'users', user.uid);
            const newUser: User = {
                id: user.uid,
                email: user.email!,
                registrationDate: new Date().toISOString(),
                isAdmin: true, // This is the first admin!
                displayName: data.displayName,
            };
            
            await setDoc(userDocRef, newUser);

            toast({
                title: 'Administrator Created!',
                description: 'Your admin account has been created. Redirecting to the dashboard...',
            });
            
            router.push('/admin');

        } catch (error: any) {
            console.error('Admin sign up error:', error);
            if (error.code === 'auth/email-already-in-use') {
                toast({
                    variant: 'destructive',
                    title: 'Sign Up Failed',
                    description: 'This email is already in use. Please log in or use a different email.',
                });
            } else {
                toast({
                    variant: 'destructive',
                    title: 'Sign Up Failed',
                    description: error.message || 'An unexpected error occurred.',
                });
            }
        }
    }
    
    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-16 w-16 animate-spin text-muted-foreground" />
            </div>
        );
    }
    
    // Don't render the form if an admin already exists and we're just waiting for redirect
    if (admins && admins.length > 0) {
        return (
             <div className="flex h-screen items-center justify-center">
                <p>An administrator account already exists. Redirecting...</p>
            </div>
        );
    }

  return (
    <div className="container mx-auto flex min-h-screen items-center justify-center py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create Initial Administrator</CardTitle>
          <CardDescription>
            This form is for setting up the first administrative user for Vibe Request.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
               <FormField
                control={form.control}
                name="displayName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Admin Name" {...field} />
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
                    <FormLabel>Admin Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="admin@example.com" {...field} />
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
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <PasswordInput placeholder="********" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Admin Account
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

