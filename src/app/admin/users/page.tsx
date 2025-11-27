
'use client';

import { collection, doc, updateDoc, query } from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import type { User } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Loader2, MoreHorizontal, ShieldAlert } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { FirestorePermissionError } from '@/firebase/errors';
import { errorEmitter } from '@/firebase/error-emitter';
import { useUser } from '@/firebase';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function AdminUsersPage() {
  const firestore = useFirestore();
  const { user: currentUser } = useUser();
  const { toast } = useToast();

  const usersQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'users'));
  }, [firestore]);

  const { data: users, isLoading, error } = useCollection<User>(usersQuery);

  const handleRoleChange = async (
    userId: string,
    field: 'isVenue' | 'isAdmin',
    value: boolean
  ) => {
    if (!firestore) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Firestore not available.',
      });
      return;
    }

    const userDocRef = doc(firestore, 'users', userId);
    
    let roleDescription = '';
    if (field === 'isVenue') {
      roleDescription = value ? 'Venue' : 'Artist';
    } else if (field === 'isAdmin') {
      roleDescription = value ? 'Admin' : 'Regular User';
    }

    updateDoc(userDocRef, { [field]: value })
      .then(() => {
        toast({
          title: 'Role Updated',
          description: `User role has been successfully changed to ${roleDescription}.`,
        });
      })
      .catch((serverError) => {
        const permissionError = new FirestorePermissionError({
          path: userDocRef.path,
          operation: 'update',
          requestResourceData: { [field]: value },
        });
        errorEmitter.emit('permission-error', permissionError);
      });
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <TableRow>
          <TableCell colSpan={6} className="h-24 text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
          </TableCell>
        </TableRow>
      );
    }
    
    // This handles the "chicken-and-egg" problem for the first admin.
    // If the query fails, it's likely because the user is not an admin.
    if (error && currentUser) {
      const isCurrentUserOnlyUser = users === null || (users?.length === 1 && users[0].id === currentUser.uid);
      
      // A more specific check for the initial setup case.
      if (isCurrentUserOnlyUser || users?.every(u => !u.isAdmin)) {
         return (
             <TableRow>
              <TableCell colSpan={6}>
                 <Alert>
                    <ShieldAlert className="h-4 w-4" />
                    <AlertTitle>Become the First Admin</AlertTitle>
                    <AlertDescription>
                      To manage users, you first need to grant yourself administrator privileges.
                       <Button 
                          size="sm" 
                          className="ml-4"
                          onClick={() => handleRoleChange(currentUser.uid, 'isAdmin', true)}
                        >
                          Make Me Admin
                        </Button>
                    </AlertDescription>
                  </Alert>
              </TableCell>
             </TableRow>
         )
      }
    }

    if (!users || users.length === 0) {
      return (
        <TableRow>
          <TableCell
            colSpan={6}
            className="h-24 text-center text-muted-foreground"
          >
            No users found or insufficient permissions.
          </TableCell>
        </TableRow>
      );
    }

    return users.map((user) => (
      <TableRow key={user.id}>
        <TableCell className="font-medium">
          {user.displayName || 'N/A'}
        </TableCell>
        <TableCell>{user.email}</TableCell>
        <TableCell>
          {user.registrationDate
            ? new Date(user.registrationDate).toLocaleDateString()
            : 'N/A'}
        </TableCell>
        <TableCell>
          <Badge variant={user.isVenue ? 'secondary' : 'default'}>
            {user.isVenue ? 'Venue' : 'Artist'}
          </Badge>
        </TableCell>
        <TableCell>
           {user.isAdmin && <Badge variant="destructive">Admin</Badge>}
        </TableCell>
        <TableCell className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Change Role</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() =>
                  handleRoleChange(user.id, 'isVenue', false)
                }
                disabled={user.isVenue === false}
              >
                Set as Artist
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  handleRoleChange(user.id, 'isVenue', true)
                }
                disabled={user.isVenue === true}
              >
                Set as Venue
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Admin Actions</DropdownMenuLabel>
               <DropdownMenuItem
                onClick={() =>
                  handleRoleChange(user.id, 'isAdmin', true)
                }
                disabled={user.isAdmin === true}
              >
                Make Admin
              </DropdownMenuItem>
               <DropdownMenuItem
                onClick={() =>
                  handleRoleChange(user.id, 'isAdmin', false)
                }
                disabled={user.isAdmin !== true}
              >
                Remove Admin
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>
    ));
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Manage Users</h2>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Registered Users</CardTitle>
          <CardDescription>
            A list of all users, including artists and venues. (Admin access
            required)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Display Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Registration Date</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {renderContent()}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

    