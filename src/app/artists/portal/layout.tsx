
'use client';

import {
  Sidebar,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
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
} from 'lucide-react';
import { Icons } from '@/components/icons';
import { useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { usePathname } from 'next/navigation';

const sidebarNavLinks = [
  { href: '/artists/portal', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/artists/portal/profile', label: 'Profile', icon: User },
  { href: '/artists/portal/availability', label: 'Availability', icon: CalendarDays },
  { href: '/artists/portal/bookings', label: 'Bookings', icon: ListMusic },
];

export default function ArtistPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth = useAuth();
  const { toast } = useToast();
  const pathname = usePathname();

  const handleLogout = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
      toast({
        title: 'Logged Out',
        description: 'You have been successfully logged out.',
      });
      // You might want to redirect to home or login page
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        variant: 'destructive',
        title: 'Logout Failed',
        description: 'There was a problem logging you out. Please try again.',
      });
    }
  };

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
                  <Link href={link.href} passHref legacyBehavior>
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
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}

