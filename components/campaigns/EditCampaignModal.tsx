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

interface EditCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaign: Campaign | null;
  clients: Client[]; // List of clients for the dropdown
  onCampaignUpdated: (updatedCampaign: Campaign) => void;
}

interface CampaignFormData {
  campaignName: string;
  clientId: string;
  startDate: Date | undefined;
  endDate: Date | undefined;
  budget: string;
  status: Campaign['status'] | "";
  description: string;
}

export default function EditCampaignModal({
  isOpen,
  onClose,
  campaign,
  clients,
  onCampaignUpdated,
}: EditCampaignModalProps) {
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

  useEffect(() => {
    if (campaign && isOpen) {
      setFormData({
        campaignName: campaign.campaignName || "",
        clientId: campaign.client?.id || "",
        startDate: campaign.startDate ? new Date(campaign.startDate) : undefined,
        endDate: campaign.endDate ? new Date(campaign.endDate) : undefined,
        budget: campaign.budget?.toString() || "",
        status: campaign.status || "",
        description: campaign.description || "",
      });
      setErrors({});
    } else if (!isOpen) {
        setFormData({ campaignName: "", clientId: "", startDate: undefined, endDate: undefined, budget: "", status: "", description: "" });
        setErrors({});
    }
  }, [campaign, isOpen]);

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
    if (!campaign || !validate()) {
        if(!campaign) toast({title: "Error", description:"Campaign data missing.", variant: "destructive"});
        else toast({title: "Validation Error", description:"Please check form fields.", variant: "destructive"});
      return;
    }
    setIsSubmitting(true);
    try {
      const selectedClient = clients.find(c => c.id === formData.clientId);
      if (!selectedClient) throw new Error("Selected client not found for update");

      const submissionData = {
        ...formData,
        budget: parseFloat(formData.budget),
        startDate: formData.startDate!.toISOString().split('T')[0],
        endDate: formData.endDate!.toISOString().split('T')[0],
      };
      
      console.log("Updating campaign:", campaign.id, submissionData);
      await new Promise(resolve => setTimeout(resolve, 1000));

      const updatedCampaign: Campaign = {
        ...campaign, // Spread existing campaign to keep ID etc.
        ...submissionData,
        client: selectedClient,
      };
      
      onCampaignUpdated(updatedCampaign);
      toast({
        title: "Campaign Updated",
        description: `${formData.campaignName} has been successfully updated.`,
      });
      handleCloseModal(false); // Don't reset form immediately, allow useEffect to handle based on isOpen
    } catch (error) {
      console.error("Failed to update campaign:", error);
      toast({
        title: "Error Updating Campaign",
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
  
  const handleCloseModal = (shouldResetForm = true) => {
    if (shouldResetForm) {
        setFormData({ campaignName: "", clientId: "", startDate: undefined, endDate: undefined, budget: "", status: "", description: "" });
        setErrors({});
    }
    onClose(); 
  };

  if (!isOpen || !campaign) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleCloseModal()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Campaign: {campaign.campaignName}</DialogTitle>
          <DialogDescription>Update the details for this marketing campaign.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 py-2">
            <div className="space-y-1.5">
                <Label htmlFor="edit-campaignName">Campaign Name <span className="text-red-500">*</span></Label>
                <Input id="edit-campaignName" name="campaignName" value={formData.campaignName} onChange={handleInputChange} className={errors.campaignName ? "border-red-500" : ""}/>
                {errors.campaignName && <p className="text-xs text-red-500">{errors.campaignName}</p>}
            </div>

            <div className="space-y-1.5">
                <Label htmlFor="edit-clientId">Client <span className="text-red-500">*</span></Label>
                <Select name="clientId" value={formData.clientId} onValueChange={(value) => handleSelectChange("clientId", value)} >
                    <SelectTrigger id="edit-clientId" className={errors.clientId ? "border-red-500" : ""}><SelectValue placeholder="Select a client" /></SelectTrigger>
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
                    <Label htmlFor="edit-startDate">Start Date <span className="text-red-500">*</span></Label>
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
                    <Label htmlFor="edit-endDate">End Date <span className="text-red-500">*</span></Label>
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
                    <Label htmlFor="edit-budget">Budget ($) <span className="text-red-500">*</span></Label>
                    <Input id="edit-budget" name="budget" type="number" value={formData.budget} onChange={handleInputChange} className={errors.budget ? "border-red-500" : ""}/>
                    {errors.budget && <p className="text-xs text-red-500">{errors.budget}</p>}
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="edit-status">Status <span className="text-red-500">*</span></Label>
                    <Select name="status" value={formData.status} onValueChange={(value) => handleSelectChange("status", value)} >
                        <SelectTrigger id="edit-status" className={errors.status ? "border-red-500" : ""}><SelectValue placeholder="Select status" /></SelectTrigger>
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
                <Label htmlFor="edit-description">Description</Label>
                <Textarea id="edit-description" name="description" value={formData.description} onChange={handleInputChange} rows={3}/>
            </div>

          <DialogFooter className="pt-4">
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