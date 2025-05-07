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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Task, User, Client, Campaign } from "@/types";
import { cn } from "@/lib/utils";

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task?: Task | null;
  onSave: (task: Task) => void;
  users: User[];
  clients: Client[];
  campaigns: Campaign[];
  defaultClientId?: string;
  defaultCampaignId?: string;
}

interface TaskFormData {
  title: string;
  description: string;
  dueDate: Date | undefined;
  assignedToId: string;
  priority: "low" | "medium" | "high" | "";
  relatedClientId: string;
  relatedCampaignId: string;
}

export default function TaskModal({
  isOpen,
  onClose,
  task,
  onSave,
  users,
  clients,
  campaigns,
  defaultClientId = "",
  defaultCampaignId = "",
}: TaskModalProps) {
  const { toast } = useToast();
  const isEditing = !!task;
  
  const [formData, setFormData] = useState<TaskFormData>({
    title: "",
    description: "",
    dueDate: undefined,
    assignedToId: "unassigned",
    priority: "medium",
    relatedClientId: defaultClientId || "none",
    relatedCampaignId: defaultCampaignId || "none",
  });
  
  const [errors, setErrors] = useState<Partial<Record<keyof TaskFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    if (isOpen) {
      if (task) {
        // Edit mode: populate with existing task data
        setFormData({
          title: task.title || "",
          description: task.description || "",
          dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
          assignedToId: task.assignedTo?.id || "unassigned",
          priority: task.priority || "medium",
          relatedClientId: task.relatedClient?.id || "none",
          relatedCampaignId: task.relatedCampaign?.id || "none",
        });
      } else {
        // Add mode: reset form with default values
        setFormData({
          title: "",
          description: "",
          dueDate: undefined,
          assignedToId: "unassigned",
          priority: "medium",
          relatedClientId: defaultClientId || "none",
          relatedCampaignId: defaultCampaignId || "none",
        });
      }
      setErrors({});
    }
  }, [isOpen, task, defaultClientId, defaultCampaignId]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when field is edited
    if (errors[name as keyof TaskFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when field is changed
    if (errors[name as keyof TaskFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };
  
  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof TaskFormData, string>> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }
    
    if (!formData.dueDate) {
      newErrors.dueDate = "Due date is required";
    }
    
    if (!formData.priority) {
      newErrors.priority = "Priority is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    setIsSubmitting(true);
    
    try {
      // Find related objects
      const assignedTo = formData.assignedToId === "unassigned" ? null : 
        users.find(user => user.id === formData.assignedToId) || null;
      
      const relatedClient = formData.relatedClientId === "none" ? null : 
        clients.find(client => client.id === formData.relatedClientId) || null;
      
      const relatedCampaign = formData.relatedCampaignId === "none" ? null : 
        campaigns.find(campaign => campaign.id === formData.relatedCampaignId) || null;
      
      // Prepare the task object
      const taskData: Task = {
        id: task?.id || `task-${Date.now()}`,
        title: formData.title,
        description: formData.description,
        dueDate: formData.dueDate ? formData.dueDate.toISOString() : new Date().toISOString(),
        assignedTo,
        priority: formData.priority as "low" | "medium" | "high",
        relatedClient,
        relatedCampaign,
        isCompleted: task?.isCompleted || false,
        createdAt: task?.createdAt || new Date().toISOString(),
      };
      
      onSave(taskData);
      
      toast({
        title: isEditing ? "Task Updated" : "Task Created",
        description: isEditing 
          ? "Your task has been updated successfully."
          : "Your new task has been created.",
      });
      
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${isEditing ? 'update' : 'create'} task. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Task" : "Create New Task"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title <span className="text-red-500">*</span></Label>
            <Input
              id="title"
              name="title"
              placeholder="Task title"
              value={formData.title}
              onChange={handleInputChange}
              className={errors.title ? "border-red-500" : ""}
            />
            {errors.title && <p className="text-xs text-red-500">{errors.title}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Task description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
            />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date <span className="text-red-500">*</span></Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.dueDate && "text-muted-foreground",
                      errors.dueDate && "border-red-500"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.dueDate ? format(formData.dueDate, "PPP") : "Select a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.dueDate}
                    onSelect={(date) => {
                      setFormData(prev => ({ ...prev, dueDate: date }));
                      if (errors.dueDate) {
                        setErrors(prev => ({ ...prev, dueDate: undefined }));
                      }
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {errors.dueDate && <p className="text-xs text-red-500">{errors.dueDate}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="priority">Priority <span className="text-red-500">*</span></Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => handleSelectChange("priority", value)}
              >
                <SelectTrigger id="priority" className={errors.priority ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
              {errors.priority && <p className="text-xs text-red-500">{errors.priority}</p>}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="assignedToId">Assigned To</Label>
            <Select
              value={formData.assignedToId}
              onValueChange={(value) => handleSelectChange("assignedToId", value)}
            >
              <SelectTrigger id="assignedToId">
                <SelectValue placeholder="Select a user" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unassigned">Unassigned</SelectItem>
                {users.map(user => (
                  <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="relatedClientId">Related Client</Label>
              <Select
                value={formData.relatedClientId}
                onValueChange={(value) => handleSelectChange("relatedClientId", value)}
                disabled={!!defaultClientId}
              >
                <SelectTrigger id="relatedClientId">
                  <SelectValue placeholder="Select a client" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {clients.map(client => (
                    <SelectItem key={client.id} value={client.id}>{client.clientName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="relatedCampaignId">Related Campaign</Label>
              <Select
                value={formData.relatedCampaignId}
                onValueChange={(value) => handleSelectChange("relatedCampaignId", value)}
                disabled={!!defaultCampaignId}
              >
                <SelectTrigger id="relatedCampaignId">
                  <SelectValue placeholder="Select a campaign" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {campaigns.map(campaign => (
                    <SelectItem key={campaign.id} value={campaign.id}>{campaign.campaignName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting 
                ? (isEditing ? "Updating..." : "Creating...") 
                : (isEditing ? "Update Task" : "Create Task")
              }
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 