"use client";

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserPlus, Settings } from "lucide-react";
import { User } from "@/types";
import UserTable from "@/components/admin/UserTable";
import AddUserModal from "@/components/admin/AddUserModal";
import EditUserModal from "@/components/admin/EditUserModal";
import ConfirmationDialog from "@/components/common/ConfirmationDialog";
import { useToast } from "@/hooks/use-toast";

// Mock data for users
const mockUsers: User[] = [
  { id: 'user1', name: 'Alice Wonderland', email: 'alice@example.com', role: 'Admin', status: 'Active' },
  { id: 'user2', name: 'Bob The Builder', email: 'bob@example.com', role: 'Manager', status: 'Active' },
  { id: 'user3', name: 'Charlie Brown', email: 'charlie@example.com', role: 'Manager', status: 'Active' },
  { id: 'user4', name: 'David Copper', email: 'david@example.com', role: 'Manager', status: 'Suspended' },
];

export default function AdminPage() {
  const { toast } = useToast();
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
  const [isSuspendConfirmOpen, setIsSuspendConfirmOpen] = useState(false);
  const [isProcessingAction, setIsProcessingAction] = useState(false);
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const handleAddUser = (newUser: User) => {
    setUsers(prev => [...prev, newUser]);
    toast({
      title: "Success",
      description: `${newUser.name} has been added successfully.`
    });
  };

  const handleUpdateUser = (updatedUser: User) => {
    setUsers(prev => prev.map(user => 
      user.id === updatedUser.id ? updatedUser : user
    ));
    toast({
      title: "Success",
      description: `${updatedUser.name} has been updated successfully.`
    });
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsEditUserModalOpen(true);
  };

  const handleToggleUserStatus = (user: User) => {
    setSelectedUser(user);
    setIsSuspendConfirmOpen(true);
  };

  const handleConfirmStatusChange = async () => {
    if (!selectedUser) return;
    
    setIsProcessingAction(true);
    
    try {
      // In a real app, this would be an API call
      // Simulate API call with setTimeout
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newStatus = selectedUser.status === 'Active' ? 'Suspended' as const : 'Active' as const;
      const updatedUser = { ...selectedUser, status: newStatus };
      
      setUsers(prev => prev.map(user => 
        user.id === selectedUser.id ? updatedUser : user
      ));
      
      toast({
        title: "Success",
        description: `${selectedUser.name} has been ${newStatus.toLowerCase()}.`
      });
      
      setIsSuspendConfirmOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "There was a problem updating the user's status.",
        variant: "destructive"
      });
    } finally {
      setIsProcessingAction(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      </div>

      <Tabs defaultValue="users" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="users" className="flex items-center">
            <UserPlus className="mr-2 h-4 w-4" />
            User Management
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center">
            <Settings className="mr-2 h-4 w-4" />
            System Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>Manage user accounts and permissions</CardDescription>
                </div>
                <Button onClick={() => setIsAddUserModalOpen(true)}>
                  <UserPlus className="mr-2 h-4 w-4" /> Add User
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <UserTable 
                users={users} 
                onEditUser={handleEditUser} 
                onToggleUserStatus={handleToggleUserStatus} 
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
              <CardDescription>Configure global system settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-md p-4">
                <h3 className="font-medium mb-4">Coming Soon</h3>
                <p className="text-muted-foreground">System settings configuration will be available in a future update.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <AddUserModal 
        isOpen={isAddUserModalOpen} 
        onClose={() => setIsAddUserModalOpen(false)} 
        onUserAdded={handleAddUser} 
      />
      
      <EditUserModal 
        isOpen={isEditUserModalOpen} 
        onClose={() => setIsEditUserModalOpen(false)} 
        user={selectedUser} 
        onUserUpdated={handleUpdateUser} 
      />
      
      <ConfirmationDialog 
        isOpen={isSuspendConfirmOpen}
        onClose={() => setIsSuspendConfirmOpen(false)}
        onConfirm={handleConfirmStatusChange}
        title={selectedUser?.status === 'Active' ? 'Suspend User' : 'Activate User'}
        description={
          selectedUser?.status === 'Active' 
            ? `Are you sure you want to suspend ${selectedUser?.name}? They will lose access to the system.` 
            : `Are you sure you want to activate ${selectedUser?.name}? They will regain access to the system.`
        }
        confirmButtonText={selectedUser?.status === 'Active' ? 'Suspend' : 'Activate'}
        confirmButtonVariant={selectedUser?.status === 'Active' ? 'destructive' : 'default'}
        isConfirming={isProcessingAction}
      />
    </div>
  );
} 