export interface User {
  id: string;
  name: string;
  email: string;
  role: "Admin" | "Manager";
  status: "Active" | "Suspended";
}

export interface Client {
  id: string;
  clientName: string;
  email: string;
  company: string;
  status: "Lead" | "Active" | "Inactive";
  lastInteraction: string; // Should be a Date, but string for now
  assignedManager: User | null; // Or string for manager ID
  phone?: string;
  notes?: string;
  campaignTags?: string[]; // Or a more complex Tag object
}

export interface Campaign {
  id: string;
  campaignName: string;
  client: Client; // Or string for client ID
  startDate: string; // Should be a Date
  endDate: string; // Should be a Date
  budget: number;
  status: "Planning" | "Active" | "Completed" | "Paused";
  description?: string;
}

export interface Task {
  id: string;
  title: string;
  dueDate: string; // Should be a Date
  assignedTo?: User | null; // Or string for user ID
  relatedClient?: Client | null; // Or string for client ID
  relatedCampaign?: Campaign | null; // Or string for campaign ID
}

export interface RecentActivity {
  id: string;
  type: "Email" | "Call" | "Meeting" | "Note";
  date: string; // Should be a Date
  notes: string;
  client: Client; // Or string for client ID
} 