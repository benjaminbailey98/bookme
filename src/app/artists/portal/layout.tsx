'use client';

import {
  Sidebar,
  SidebarProvider,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from '@/components/ui/sidebar';
import Link from 'next/link';
import {
  LayoutDashboard,
  User,
  CalendarDays,
  ListMusic,
  LogOut,
  CreditCard,
  Loader2,
} from 'lucide-react';
import { Icons } from '@/components/icons';
import { useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { usePathname, useRouter } from 'next/navigation';
import { useUserProfile } from '@/hooks/use-user-profile';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const sidebarNavLinks = [
  { href: '/artists/portal', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/artists/portal/profile', label: 'Profile', icon: User },
  { href: '/artists/portal/availability', label: 'Availability', icon: CalendarDays },
  { href: '/artists/portal/bookings', label: 'Bookings', icon: ListMusic },
  { href: '/artists/portal/subscription', label: 'Subscription', icon: CreditCard },
];

export default function ArtistPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth = useAuth();
  const { toast } = useToast();
  const pathname = usePathname();
  const router = useRouter();
  const { user, isUserLoading } = useUserProfile();

  const handleLogout = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
      toast({
        title: 'Logged Out',
        description: 'You have been successfully logged out.',
      });
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        variant: 'destructive',
        title: 'Logout Failed',
        description: 'There was a problem logging you out. Please try again.',
      });
    }
  };

  if (isUserLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user || user.isVenue) {
    return (
      <div className="container flex h-screen items-center justify-center">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              You must be logged in as an artist to access this portal.
            </p>
            <div className="flex flex-col space-y-2">
              <Button asChild>
                <Link href="/login?redirect=/artists/portal">Login as Artist</Link>
              </Button>
               <Button asChild variant="outline">
                <Link href="/">Return to Home</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <Sidebar side="left" variant="sidebar" collapsible="icon">
        <SidebarHeader>
          <Link
            href="/"
            className="flex items-center gap-2 overflow-hidden font-bold"
          >
            <Icons.logo className="size-6 shrink-0" />
            <span className="group-data-[collapsible=icon]:hidden">
              Vibe Request
            </span>
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Artist Menu</SidebarGroupLabel>
            <SidebarMenu>
              {sidebarNavLinks.map((link) => (
                <SidebarMenuItem key={link.href}>
                  <Link href={link.href}>
                    <SidebarMenuButton
                      isActive={pathname === link.href}
                      tooltip={{ children: link.label }}
                    >
                      <link.icon />
                      <span>{link.label}</span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={handleLogout}>
                <LogOut />
                <span>Logout</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <main className="flex-1">{children}</main>
    </SidebarProvider>
  );
}
