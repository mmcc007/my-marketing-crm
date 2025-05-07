"use client";

import React, { useState, useEffect } from 'react';
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
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useToast } from "@/hooks/use-toast";
import { Campaign, Client } from "@/types";
import { format } from "date-fns";
import { CalendarIcon } from 'lucide-react';
import { cn } from "@/lib/utils";

// Mock Data - Should be fetched or passed as props in a real app
const mockClients: Client[] = [
  { id: 'client1', clientName: 'Innovatech Solutions', email: 'c1@example.com', company: 'IS Ltd', status: 'Active', lastInteraction: '2023-01-01', assignedManager: null },
  { id: 'client2', clientName: 'Quantum Leap Inc.', email: 'c2@example.com', company: 'QL Inc', status: 'Active', lastInteraction: '2023-01-01', assignedManager: null },
  // Add more mock clients if needed for dropdown
];

interface AddCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCampaignAdded: (newCampaign: Campaign) => void;
  // We might pass clients list as a prop if not fetched inside
  clients: Client[]; 
}

interface CampaignFormData {
  campaignName: string;
  clientId: string;
  startDate: Date | undefined;
  endDate: Date | undefined;
  budget: string; // String for input, convert to number on submit
  status: Campaign['status'] | "";
  description: string;
}

export default function AddCampaignModal({
  isOpen,
  onClose,
  onCampaignAdded,
  clients // Use passed clients prop
}: AddCampaignModalProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState<CampaignFormData>({
    campaignName: "",
    clientId: "",
    startDate: undefined,
    endDate: undefined,
    budget: "",
    status: "",
    description: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof CampaignFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Use the clients prop directly instead of fetching mockClients internally
  // useEffect(() => {
  //   // In a real app, clients might be fetched here or passed as prop
  //   // For now, using mockClients imported or passed
  // }, []);

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof CampaignFormData, string>> = {};
    if (!formData.campaignName.trim()) newErrors.campaignName = "Campaign name is required.";
    if (!formData.clientId) newErrors.clientId = "Client is required.";
    if (!formData.startDate) newErrors.startDate = "Start date is required.";
    if (!formData.endDate) {
        newErrors.endDate = "End date is required.";
    } else if (formData.startDate && formData.endDate < formData.startDate) {
        newErrors.endDate = "End date cannot be before start date.";
    }
    if (!formData.budget.trim()) {
        newErrors.budget = "Budget is required.";
    } else if (isNaN(parseFloat(formData.budget)) || parseFloat(formData.budget) < 0) {
        newErrors.budget = "Budget must be a valid positive number.";
    }
    if (!formData.status) newErrors.status = "Status is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) {
        toast({title: "Validation Error", description:"Please check form fields.", variant: "destructive"});
      return;
    }
    setIsSubmitting(true);
    try {
      const selectedClient = clients.find(c => c.id === formData.clientId);
      if (!selectedClient) throw new Error("Selected client not found");

      const submissionData = {
        ...formData,
        budget: parseFloat(formData.budget),
        startDate: formData.startDate!.toISOString().split('T')[0], // Format date to YYYY-MM-DD
        endDate: formData.endDate!.toISOString().split('T')[0],     // Format date to YYYY-MM-DD
      };
      
      console.log("Submitting new campaign:", submissionData);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay

      const newCampaign: Campaign = {
        id: `camp${Date.now()}`,
        ...submissionData,
        client: selectedClient,
      };
      
      onCampaignAdded(newCampaign);
      toast({
        title: "Campaign Created",
        description: `${formData.campaignName} has been successfully created.`,
      });
      handleCloseModal();
    } catch (error) {
      console.error("Failed to create campaign:", error);
      toast({
        title: "Error Creating Campaign",
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

  const handleSelectChange = (name: Extract<keyof CampaignFormData, 'clientId' | 'status'>, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value as any }));
  };

  const handleDateChange = (name: 'startDate' | 'endDate', date: Date | undefined) => {
    setFormData(prev => ({ ...prev, [name]: date }));
  };
  
  const handleCloseModal = () => {
    setFormData({
        campaignName: "", clientId: "", startDate: undefined, endDate: undefined,
        budget: "", status: "", description: ""
    });
    setErrors({});
    onClose(); 
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleCloseModal()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add New Campaign</DialogTitle>
          <DialogDescription>Fill in the details for the new marketing campaign.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 py-2">
            <div className="space-y-1.5">
                <Label htmlFor="campaignName">Campaign Name <span className="text-red-500">*</span></Label>
                <Input id="campaignName" name="campaignName" value={formData.campaignName} onChange={handleInputChange} placeholder="e.g., Summer Sale Blitz" className={errors.campaignName ? "border-red-500" : ""}/>
                {errors.campaignName && <p className="text-xs text-red-500">{errors.campaignName}</p>}
            </div>

            <div className="space-y-1.5">
                <Label htmlFor="clientId">Client <span className="text-red-500">*</span></Label>
                <Select name="clientId" value={formData.clientId} onValueChange={(value) => handleSelectChange("clientId", value)} >
                    <SelectTrigger id="clientId" className={errors.clientId ? "border-red-500" : ""}><SelectValue placeholder="Select a client" /></SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectLabel>Available Clients</SelectLabel>
                            {clients.map(client => <SelectItem key={client.id} value={client.id}>{client.clientName}</SelectItem>)}
                        </SelectGroup>
                    </SelectContent>
                </Select>
                {errors.clientId && <p className="text-xs text-red-500">{errors.clientId}</p>}
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <Label htmlFor="startDate">Start Date <span className="text-red-500">*</span></Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !formData.startDate && "text-muted-foreground", errors.startDate && "border-red-500")}>
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {formData.startDate ? format(formData.startDate, "PPP") : <span>Pick a date</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar mode="single" selected={formData.startDate} onSelect={(date) => handleDateChange('startDate', date)} initialFocus />
                        </PopoverContent>
                    </Popover>
                    {errors.startDate && <p className="text-xs text-red-500">{errors.startDate}</p>}
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="endDate">End Date <span className="text-red-500">*</span></Label>
                     <Popover>
                        <PopoverTrigger asChild>
                            <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !formData.endDate && "text-muted-foreground", errors.endDate && "border-red-500")}>
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {formData.endDate ? format(formData.endDate, "PPP") : <span>Pick a date</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar mode="single" selected={formData.endDate} onSelect={(date) => handleDateChange('endDate', date)} disabled={{ before: formData.startDate }} initialFocus />
                        </PopoverContent>
                    </Popover>
                    {errors.endDate && <p className="text-xs text-red-500">{errors.endDate}</p>}
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <Label htmlFor="budget">Budget ($) <span className="text-red-500">*</span></Label>
                    <Input id="budget" name="budget" type="number" value={formData.budget} onChange={handleInputChange} placeholder="e.g., 5000" className={errors.budget ? "border-red-500" : ""}/>
                    {errors.budget && <p className="text-xs text-red-500">{errors.budget}</p>}
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="status">Status <span className="text-red-500">*</span></Label>
                    <Select name="status" value={formData.status} onValueChange={(value) => handleSelectChange("status", value)} >
                        <SelectTrigger id="status" className={errors.status ? "border-red-500" : ""}><SelectValue placeholder="Select status" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Planning">Planning</SelectItem>
                            <SelectItem value="Active">Active</SelectItem>
                            <SelectItem value="Paused">Paused</SelectItem>
                            <SelectItem value="Completed">Completed</SelectItem>
                        </SelectContent>
                    </Select>
                    {errors.status && <p className="text-xs text-red-500">{errors.status}</p>}
                </div>
            </div>

            <div className="space-y-1.5">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" value={formData.description} onChange={handleInputChange} placeholder="Brief overview of the campaign objectives and strategy..." rows={3}/>
            </div>

          <DialogFooter className="pt-4">
            <DialogClose asChild>
              <Button type="button" variant="outline" onClick={handleCloseModal} disabled={isSubmitting}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Campaign"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 