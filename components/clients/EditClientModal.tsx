"use client";

import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel
} from "@/components/ui/select";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Client, User } from "@/types";
import { X as LucideX } from 'lucide-react';

// Mock Data - In a real app, this would come from a shared service or context
const mockUsers: User[] = [
  { id: 'user1', name: 'Alice Wonderland', email: 'alice@example.com', role: 'Manager', status: 'Active' },
  { id: 'user2', name: 'Bob The Builder', email: 'bob@example.com', role: 'Manager', status: 'Active' },
  { id: 'user3', name: 'Charlie Brown', email: 'charlie@example.com', role: 'Admin', status: 'Active' },
];
const MOCK_AVAILABLE_TAGS = ["Newsletter Subscriber", "Lead Magnet Downloaded", "Webinar Attendee", "Social Media Lead", "Referral"];

interface EditClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client | null;
  onClientUpdated: (updatedClient: Client) => void;
}

interface ClientFormData {
  clientName: string;
  email: string; // Will be read-only
  company: string;
  phone: string;
  status: Client['status'] | "";
  assignedManagerId: string;
  notes: string;
  campaignTags: string[];
}

export default function EditClientModal({
  isOpen,
  onClose,
  client,
  onClientUpdated,
}: EditClientModalProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState<ClientFormData>({
    clientName: "",
    email: "",
    company: "",
    phone: "",
    status: "",
    assignedManagerId: "",
    notes: "",
    campaignTags: [],
  });
  const [errors, setErrors] = useState<Partial<Record<keyof Omit<ClientFormData, 'email'>, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [managers, setManagers] = useState<User[]>([]);

  const [tagInput, setTagInput] = useState("");
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const tagInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setManagers(mockUsers);
    if (client && isOpen) {
      setFormData({
        clientName: client.clientName || "",
        email: client.email || "", // Non-editable but pre-filled
        company: client.company || "",
        phone: client.phone || "",
        status: client.status || "",
        assignedManagerId: client.assignedManager?.id || "",
        notes: client.notes || "",
        campaignTags: client.campaignTags || [],
      });
      setErrors({}); // Clear previous errors when modal opens/client changes
    } else if (!isOpen) {
        // Reset form when modal is closed externally
        setFormData({
            clientName: "", email: "", company: "", phone: "", status: "", 
            assignedManagerId: "", notes: "", campaignTags: []
        });
        setTagInput("");
        setErrors({});
    }
  }, [client, isOpen]);

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof Omit<ClientFormData, 'email'>, string>> = {};
    if (!formData.clientName.trim()) newErrors.clientName = "Client name is required.";
    // Email is not validated here as it's read-only
    if (!formData.status) newErrors.status = "Status is required.";
    if (!formData.assignedManagerId) newErrors.assignedManagerId = "Assigned manager is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!client || !validate()) {
        if(!client) toast({title: "Error", description:"Client data missing.", variant: "destructive"});
        else toast({title: "Validation Error", description:"Please check form fields.", variant: "destructive"});
      return;
    }
    setIsSubmitting(true);
    try {
      // const response = await fetch(`/api/clients/${client.id}`, {
      //   method: "PUT", // or PATCH
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ ...formData, email: undefined }), // Don't send email for update
      // });
      // if (!response.ok) throw new Error("Failed to update client");
      // const updatedClientData = await response.json();
      
      console.log("Updating client:", client.id, formData);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay

      const updatedClient: Client = {
        ...client, // Spread existing client to keep ID and other uneditable fields
        ...formData, // Spread form data
        // Ensure assignedManager is correctly structured if only ID is in formData
        assignedManager: managers.find(m => m.id === formData.assignedManagerId) || null,
      };
      
      onClientUpdated(updatedClient);
      toast({
        title: "Client Updated",
        description: `${formData.clientName} has been successfully updated.`,
      });
      handleCloseModal(false); // Pass false to not reset form from onCloseEffect yet
    } catch (error) {
      console.error("Failed to update client:", error);
      toast({
        title: "Error Updating Client",
        description: (error as Error).message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: Extract<keyof ClientFormData, 'status' | 'assignedManagerId'>, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value as any })); // Type assertion for status
  };

  const handleAddTag = (tag: string) => {
    const newTag = tag.trim();
    if (newTag && !formData.campaignTags.includes(newTag)) {
      setFormData(prev => ({ ...prev, campaignTags: [...prev.campaignTags, newTag] }));
    }
    setTagInput("");
    setShowTagSuggestions(false);
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({ 
      ...prev, 
      campaignTags: prev.campaignTags.filter(tag => tag !== tagToRemove) 
    }));
  };

  const filteredTagSuggestions = MOCK_AVAILABLE_TAGS.filter(
    tag => tag.toLowerCase().includes(tagInput.toLowerCase()) && !formData.campaignTags.includes(tag)
  );
  
  const handleCloseModal = (shouldResetForm = true) => {
    if (shouldResetForm) {
        setFormData({
            clientName: "", email: "", company: "", phone: "", status: "", 
            assignedManagerId: "", notes: "", campaignTags: []
        });
        setTagInput("");
        setErrors({});
    }
    onClose(); 
  };

  if (!isOpen || !client) return null; // Ensure client is available before rendering

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleCloseModal()}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Client: {client.clientName}</DialogTitle>
          <DialogDescription>Update the details for this client. Email cannot be changed.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="max-h-[70vh] overflow-y-auto pr-2">
          <div className="space-y-6 p-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="edit-clientName">Client Name <span className="text-red-500">*</span></Label>
              <Input id="edit-clientName" name="clientName" value={formData.clientName} onChange={handleInputChange} className={errors.clientName ? "border-red-500" : ""}/>
              {errors.clientName && <p className="text-xs text-red-500">{errors.clientName}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email (Read-only)</Label>
              <Input id="edit-email" name="email" type="email" value={formData.email} readOnly disabled className="bg-gray-100" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="edit-company">Company</Label>
              <Input id="edit-company" name="company" value={formData.company} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-phone">Phone</Label>
              <Input id="edit-phone" name="phone" type="tel" value={formData.phone} onChange={handleInputChange} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="edit-status">Status <span className="text-red-500">*</span></Label>
              <Select name="status" value={formData.status} onValueChange={(value) => handleSelectChange("status", value)} >
                <SelectTrigger id="edit-status" className={errors.status ? "border-red-500" : ""}><SelectValue placeholder="Select status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Lead">Lead</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              {errors.status && <p className="text-xs text-red-500">{errors.status}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-assignedManagerId">Assigned Manager <span className="text-red-500">*</span></Label>
              <Select name="assignedManagerId" value={formData.assignedManagerId} onValueChange={(value) => handleSelectChange("assignedManagerId", value)} >
                <SelectTrigger id="edit-assignedManagerId" className={errors.assignedManagerId ? "border-red-500" : ""}><SelectValue placeholder="Select a manager" /></SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Available Managers</SelectLabel>
                    {managers.map(manager => <SelectItem key={manager.id} value={manager.id}>{manager.name}</SelectItem>)}
                  </SelectGroup>
                </SelectContent>
              </Select>
              {errors.assignedManagerId && <p className="text-xs text-red-500">{errors.assignedManagerId}</p>}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-campaignTags">Campaign Tags</Label>
            <div className="relative">
                <div className="flex items-center border rounded-md p-2 min-h-[40px] flex-wrap gap-1" onClick={() => tagInputRef.current?.focus()}>
                    {formData.campaignTags.map(tag => (
                        <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                            {tag}
                            <LucideX className="h-3 w-3 cursor-pointer" onClick={() => handleRemoveTag(tag)} />
                        </Badge>
                    ))}
                    <Input ref={tagInputRef} id="edit-campaignTags" name="campaignTagsInput" type="text" placeholder={formData.campaignTags.length === 0 ? "Add tags..." : ""} value={tagInput} onChange={(e) => { setTagInput(e.target.value); setShowTagSuggestions(true); }} onKeyDown={(e) => { if (e.key === 'Enter' && tagInput.trim()) { e.preventDefault(); handleAddTag(tagInput); } if (e.key === 'Backspace' && !tagInput && formData.campaignTags.length > 0) { handleRemoveTag(formData.campaignTags[formData.campaignTags.length - 1]); } }} onFocus={() => setShowTagSuggestions(true)} className="flex-grow border-none shadow-none focus-visible:ring-0 p-0 h-auto leading-tight"/>
                </div>
                {showTagSuggestions && tagInput && filteredTagSuggestions.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-lg">
                        <CommandList>
                            <CommandEmpty>No matching tags. Press Enter to add.</CommandEmpty>
                            <CommandGroup heading="Suggestions">
                                {filteredTagSuggestions.map(tag => (
                                    <CommandItem key={tag} value={tag} onSelect={() => handleAddTag(tag)} className="cursor-pointer">{tag}</CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </div>
                )}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-notes">Notes</Label>
            <Textarea id="edit-notes" name="notes" value={formData.notes} onChange={handleInputChange} rows={3}/>
          </div>
          </div>
          <DialogFooter className="pt-6 pr-1">
            <DialogClose asChild>
              <Button type="button" variant="outline" onClick={() => handleCloseModal()} disabled={isSubmitting}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 