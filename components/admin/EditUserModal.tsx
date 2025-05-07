"use client";

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { User } from "@/types";

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onUserUpdated: (updatedUser: User) => void;
}

interface UserFormData {
  name: string;
  email: string;
  role: "Admin" | "Manager" | "";
}

export default function EditUserModal({
  isOpen,
  onClose,
  user,
  onUserUpdated,
}: EditUserModalProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState<UserFormData>({
    name: "",
    email: "",
    role: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof UserFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user && isOpen) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        role: user.role || "",
      });
      setErrors({});
    } else if (!isOpen) {
      setFormData({
        name: "",
        email: "",
        role: "",
      });
      setErrors({});
    }
  }, [user, isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear the error for this field when the user starts typing
    if (errors[name as keyof UserFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear the error for this field when the user makes a selection
    if (errors[name as keyof UserFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof UserFormData, string>> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }
    
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    
    if (!formData.role) {
      newErrors.role = "Role is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !validate()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // In a real app, this would be an API call
      // Simulate API call with setTimeout
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const updatedUser: User = {
        ...user,
        name: formData.name,
        email: formData.email,
        role: formData.role as "Admin" | "Manager",
      };
      
      onUserUpdated(updatedUser);
      toast({
        title: "Success!",
        description: "User has been updated successfully.",
      });
      handleCloseModal();
    } catch (error) {
      toast({
        title: "Error",
        description: "There was a problem updating the user.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    onClose();
  };

  if (!isOpen || !user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && handleCloseModal()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit User: {user.name}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name <span className="text-red-500">*</span></Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              className={errors.email ? "border-red-500" : ""}
            />
            {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="role">Role <span className="text-red-500">*</span></Label>
            <Select 
              name="role" 
              value={formData.role} 
              onValueChange={(value) => handleSelectChange("role", value)}
            >
              <SelectTrigger id="role" className={errors.role ? "border-red-500" : ""}>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Admin">Admin</SelectItem>
                <SelectItem value="Manager">Manager</SelectItem>
              </SelectContent>
            </Select>
            {errors.role && <p className="text-xs text-red-500">{errors.role}</p>}
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 