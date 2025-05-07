"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
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
import { User } from "@/types"; // Assuming Client type might also be needed if we pre-fill something related to other clients
import { X as LucideX, Tags } from 'lucide-react';

// Mock Data (replace with API calls)
const mockUsers: User[] = [
  { id: 'user1', name: 'Alice Wonderland', email: 'alice@example.com', role: 'Manager', status: 'Active' },
  { id: 'user2', name: 'Bob The Builder', email: 'bob@example.com', role: 'Manager', status: 'Active' },
  { id: 'user3', name: 'Charlie Brown', email: 'charlie@example.com', role: 'Admin', status: 'Active' },
];

// Available tags for suggestion - in a real app, these might come from an API or be dynamically managed
const MOCK_AVAILABLE_TAGS = [
    "Newsletter Subscriber", 
    "Lead Magnet Downloaded", 
    "Webinar Attendee", 
    "Social Media Lead", 
    "Referral"
];

interface ClientFormData {
  clientName: string;
  email: string;
  company: string;
  phone: string;
  status: "Lead" | "Active" | "Inactive" | "";
  assignedManagerId: string;
  notes: string;
  campaignTags: string[];
}

export default function NewClientPage() {
  const router = useRouter();
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
  const [errors, setErrors] = useState<Partial<Record<keyof ClientFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [managers, setManagers] = useState<User[]>([]);

  // For Campaign Tags multi-select
  const [tagInput, setTagInput] = useState("");
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const tagInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Simulate fetching users for assigned manager dropdown
    setManagers(mockUsers);
  }, []);

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof ClientFormData, string>> = {};
    if (!formData.clientName.trim()) newErrors.clientName = "Client name is required.";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid.";
    }
    if (!formData.status) newErrors.status = "Status is required.";
    if (!formData.assignedManagerId) newErrors.assignedManagerId = "Assigned manager is required.";
    // Add other validations as needed (e.g., phone format, unique email - needs API check)
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) {
        toast({
            title: "Validation Error",
            description: "Please check the form for errors.",
            variant: "destructive",
        });
        return;
    }
    setIsSubmitting(true);
    // Simulate API call
    try {
      // const response = await fetch("/api/clients", { 
      //   method: "POST", 
      //   headers: { "Content-Type": "application/json" }, 
      //   body: JSON.stringify(formData) 
      // });
      // if (!response.ok) throw new Error("Failed to create client");
      // const newClient = await response.json();
      
      console.log("Submitting new client:", formData); // Log data
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay
      
      toast({
        title: "Client Created",
        description: `${formData.clientName} has been successfully added.`,
        variant: "default", // Or a success variant if you add one
      });
      router.push("/clients"); // Redirect to client list page
    } catch (error) {
      console.error("Failed to create client:", error);
      toast({
        title: "Error Creating Client",
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

  const handleSelectChange = (name: keyof ClientFormData, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Campaign Tag functions
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

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Add New Client</CardTitle>
            <CardDescription>Fill in the details below to create a new client profile.</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Client Name */}
                <div className="space-y-2">
                  <Label htmlFor="clientName">Client Name <span className="text-red-500">*</span></Label>
                  <Input 
                    id="clientName" 
                    name="clientName" 
                    value={formData.clientName} 
                    onChange={handleInputChange} 
                    placeholder="e.g., Acme Corporation"
                    className={errors.clientName ? "border-red-500" : ""}
                  />
                  {errors.clientName && <p className="text-xs text-red-500">{errors.clientName}</p>}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
                  <Input 
                    id="email" 
                    name="email" 
                    type="email" 
                    value={formData.email} 
                    onChange={handleInputChange} 
                    placeholder="e.g., contact@acme.com"
                    className={errors.email ? "border-red-500" : ""}
                  />
                  {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Company */}
                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <Input 
                    id="company" 
                    name="company" 
                    value={formData.company} 
                    onChange={handleInputChange} 
                    placeholder="e.g., Acme Ltd."
                  />
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input 
                    id="phone" 
                    name="phone" 
                    type="tel" 
                    value={formData.phone} 
                    onChange={handleInputChange} 
                    placeholder="e.g., (555) 123-4567"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Status */}
                <div className="space-y-2">
                  <Label htmlFor="status">Status <span className="text-red-500">*</span></Label>
                  <Select 
                    name="status"
                    value={formData.status}
                    onValueChange={(value) => handleSelectChange("status", value)}
                  >
                    <SelectTrigger id="status" className={errors.status ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Lead">Lead</SelectItem>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.status && <p className="text-xs text-red-500">{errors.status}</p>}
                </div>

                {/* Assigned Manager */}
                <div className="space-y-2">
                  <Label htmlFor="assignedManagerId">Assigned Manager <span className="text-red-500">*</span></Label>
                  <Select 
                    name="assignedManagerId"
                    value={formData.assignedManagerId}
                    onValueChange={(value) => handleSelectChange("assignedManagerId", value)}
                  >
                    <SelectTrigger id="assignedManagerId" className={errors.assignedManagerId ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select a manager" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Available Managers</SelectLabel>
                        {managers.map(manager => (
                          <SelectItem key={manager.id} value={manager.id}>
                            {manager.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  {errors.assignedManagerId && <p className="text-xs text-red-500">{errors.assignedManagerId}</p>}
                </div>
              </div>

              {/* Campaign Tags - Multi-select with Command */}
              <div className="space-y-2">
                <Label htmlFor="campaignTags">Campaign Tags</Label>
                <div className="relative">
                    <div className="flex items-center border rounded-md p-2 min-h-[40px] flex-wrap gap-1" onClick={() => tagInputRef.current?.focus()}>
                        {formData.campaignTags.map(tag => (
                            <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                                {tag}
                                <LucideX className="h-3 w-3 cursor-pointer" onClick={() => handleRemoveTag(tag)} />
                            </Badge>
                        ))}
                        <Input 
                            ref={tagInputRef}
                            id="campaignTags"
                            name="campaignTagsInput"
                            type="text"
                            placeholder={formData.campaignTags.length === 0 ? "Add tags..." : ""}
                            value={tagInput}
                            onChange={(e) => { setTagInput(e.target.value); setShowTagSuggestions(true); }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && tagInput.trim()) {
                                    e.preventDefault();
                                    handleAddTag(tagInput);
                                }
                                if (e.key === 'Backspace' && !tagInput && formData.campaignTags.length > 0) {
                                    handleRemoveTag(formData.campaignTags[formData.campaignTags.length - 1]);
                                }
                            }}
                            onFocus={() => setShowTagSuggestions(true)}
                            // onBlur={() => setTimeout(() => setShowTagSuggestions(false), 100)} // Delay to allow click on suggestion
                            className="flex-grow border-none shadow-none focus-visible:ring-0 p-0 h-auto leading-tight"
                        />
                    </div>
                    {showTagSuggestions && tagInput && filteredTagSuggestions.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-popover border rounded-md shadow-lg">
                            <CommandList>
                                <CommandEmpty>No matching tags found. Press Enter to add as new.</CommandEmpty>
                                <CommandGroup heading="Suggestions">
                                    {filteredTagSuggestions.map(tag => (
                                        <CommandItem 
                                            key={tag} 
                                            value={tag}
                                            onSelect={() => handleAddTag(tag)}
                                            className="cursor-pointer"
                                        >
                                            {tag}
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </CommandList>
                        </div>
                    )}
                </div>
                <p className="text-xs text-muted-foreground">Type to search or add new tags. Press Enter to add.</p>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea 
                  id="notes" 
                  name="notes" 
                  value={formData.notes} 
                  onChange={handleInputChange} 
                  placeholder="Any relevant notes about the client..."
                  rows={4}
                />
              </div>

            </CardContent>
            <CardFooter className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
                    Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Creating Client..." : "Create Client"}
                </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </AppLayout>
  );
} 