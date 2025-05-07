"use client";

import React, { useState } from 'react';
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
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Client, RecentActivity as Interaction } from "@/types";

interface AddInteractionModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client | null;
  onInteractionAdded: (newInteraction: Interaction) => void; // Callback to update parent state
}

interface InteractionFormData {
  type: "Email" | "Call" | "Meeting" | "Note" | "";
  date: string;
  notes: string;
}

export default function AddInteractionModal({ 
  isOpen, 
  onClose, 
  client, 
  onInteractionAdded 
}: AddInteractionModalProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState<InteractionFormData>({
    type: "",
    date: new Date().toISOString().split('T')[0], // Default to today
    notes: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof InteractionFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof InteractionFormData, string>> = {};
    if (!formData.type) newErrors.type = "Interaction type is required.";
    if (!formData.date) {
      newErrors.date = "Date is required.";
    } else if (new Date(formData.date) > new Date()) {
        newErrors.date = "Date cannot be in the future.";
    }
    if (!formData.notes.trim()) newErrors.notes = "Notes are required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!client || !validate()) {
        if (!client) toast({ title: "Error", description: "Client data is missing.", variant: "destructive" });
        else toast({ title: "Validation Error", description: "Please check the form.", variant: "destructive"});
      return;
    }
    setIsSubmitting(true);

    // Simulate API call
    try {
      // const response = await fetch(`/api/clients/${client.id}/interactions`, {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(formData),
      // });
      // if (!response.ok) throw new Error("Failed to add interaction");
      // const newInteraction = await response.json();
      
      // Mocking successful response:
      const newInteraction: Interaction = {
        id: `int${Date.now()}`,
        client: client, // Link back to the client
        type: formData.type as Interaction['type'],
        date: formData.date,
        notes: formData.notes,
      };
      console.log("Submitting new interaction:", newInteraction);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate delay

      onInteractionAdded(newInteraction); // Update parent component's state
      toast({
        title: "Interaction Added",
        description: `Interaction with ${client.clientName} has been logged.`,
      });
      handleCloseModal();
    } catch (error) {
      console.error("Failed to add interaction:", error);
      toast({
        title: "Error",
        description: (error as Error).message || "Could not add interaction.",
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

  const handleSelectChange = (name: keyof InteractionFormData, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value as InteractionFormData['type'] }));
  };

  const handleCloseModal = () => {
    setFormData({ type: "", date: new Date().toISOString().split('T')[0], notes: "" });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleCloseModal()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Interaction</DialogTitle>
          {client && <DialogDescription>Log a new interaction for {client.clientName}.</DialogDescription>}
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            {/* Interaction Type */}
            <div className="space-y-1.5">
                <Label htmlFor="type">Type <span className="text-red-500">*</span></Label>
                <Select 
                    name="type"
                    value={formData.type}
                    onValueChange={(value) => handleSelectChange("type", value)}
                >
                    <SelectTrigger id="type" className={errors.type ? "border-red-500" : ""}>
                        <SelectValue placeholder="Select interaction type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Email">Email</SelectItem>
                        <SelectItem value="Call">Call</SelectItem>
                        <SelectItem value="Meeting">Meeting</SelectItem>
                        <SelectItem value="Note">Note</SelectItem>
                    </SelectContent>
                </Select>
                {errors.type && <p className="text-xs text-red-500">{errors.type}</p>}
            </div>

            {/* Date */}
            <div className="space-y-1.5">
                <Label htmlFor="date">Date <span className="text-red-500">*</span></Label>
                <Input 
                    id="date" 
                    name="date" 
                    type="date"
                    value={formData.date} 
                    onChange={handleInputChange} 
                    className={errors.date ? "border-red-500" : ""}
                />
                {errors.date && <p className="text-xs text-red-500">{errors.date}</p>}
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
                <Label htmlFor="notes">Notes <span className="text-red-500">*</span></Label>
                <Textarea 
                    id="notes" 
                    name="notes" 
                    value={formData.notes} 
                    onChange={handleInputChange} 
                    placeholder="Details of the interaction..."
                    rows={4}
                    className={errors.notes ? "border-red-500" : ""}
                />
                {errors.notes && <p className="text-xs text-red-500">{errors.notes}</p>}
            </div>
          <DialogFooter className="pt-4">
            <DialogClose asChild>
              <Button type="button" variant="outline" onClick={handleCloseModal} disabled={isSubmitting}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Interaction"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 