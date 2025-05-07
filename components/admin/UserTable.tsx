"use client";

import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { User } from "@/types";

interface UserTableProps {
  users: User[];
  onEditUser: (user: User) => void;
  onToggleUserStatus: (user: User) => void;
}

export default function UserTable({ 
  users, 
  onEditUser, 
  onToggleUserStatus 
}: UserTableProps) {
  if (!users.length) {
    return (
      <div className="text-center p-6 border rounded-md bg-muted/10">
        <p className="text-muted-foreground">No users found.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map(user => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.role}</TableCell>
              <TableCell>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  user.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {user.status}
                </span>
              </TableCell>
              <TableCell className="text-right space-x-2">
                <Button variant="outline" size="sm" onClick={() => onEditUser(user)}>
                  Edit
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className={user.status === 'Active' ? 'text-red-500' : 'text-green-500'}
                  onClick={() => onToggleUserStatus(user)}
                >
                  {user.status === 'Active' ? 'Suspend' : 'Activate'}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
} 