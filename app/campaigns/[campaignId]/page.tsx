"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Campaign, Client, Task, User } from "@/types"; // Added Task and User for task management
import { ArrowLeft, Edit3, Archive, Users, CalendarDays, DollarSign, ClipboardList, FileText, PlusCircle } from 'lucide-react';
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import EditCampaignModal from "@/components/campaigns/EditCampaignModal";
import ConfirmationDialog from "@/components/common/ConfirmationDialog";
import TaskList from "@/components/tasks/TaskList";
import TaskModal from "@/components/tasks/TaskModal";
import { useToast } from "@/hooks/use-toast";

// Mock Data - Ideally, centralize this
const mockUsers: User[] = [
  { id: 'user1', name: 'Alice Wonderland', email: 'alice@example.com', role: 'Admin', status: 'Active' },
  { id: 'user2', name: 'Bob The Builder', email: 'bob@example.com', role: 'Manager', status: 'Active' },
  { id: 'user3', name: 'Charlie Brown', email: 'charlie@example.com', role: 'Manager', status: 'Active' },
];

const mockClients: Client[] = [
  { id: 'client1', clientName: 'Innovatech Solutions', email: 'c1@example.com', company: 'IS Ltd', status: 'Active', lastInteraction: '2023-01-01', assignedManager: null },
  { id: 'client2', clientName: 'Quantum Leap Inc.', email: 'c2@example.com', company: 'QL Inc', status: 'Active', lastInteraction: '2023-01-01', assignedManager: null },
];

const mockCampaigns: Campaign[] = [
  {
    id: 'camp1',
    campaignName: 'Q1 Product Launch',
    client: mockClients[0],
    startDate: '2024-01-15',
    endDate: '2024-03-15',
    budget: 5000,
    status: 'Completed',
    description: 'Detailed launch strategy for the new X1000 Product, focusing on digital channels and influencer outreach. Key metrics include website traffic, conversion rates, and social media engagement.'
  },
  {
    id: 'camp2',
    campaignName: 'Spring Sales Drive',
    client: mockClients[1],
    startDate: '2024-04-01',
    endDate: '2024-05-31',
    budget: 7500,
    status: 'Active',
    description: 'Aggressive sales campaign to boost Q2 revenue. Includes promotional discounts, email marketing, and a limited-time offer. Tracking sales figures and lead generation closely.'
  },
  // Add more campaigns if needed for direct navigation testing
];

// Mock data for tasks
const mockTasks: Task[] = [
  {
    id: 'task1',
    title: 'Review Q1 Product Launch analytics',
    description: 'Analyze performance metrics and prepare report for client meeting',
    dueDate: '2024-03-20',
    assignedTo: mockUsers[0],
    relatedClient: mockClients[0],
    relatedCampaign: mockCampaigns[0],
    priority: 'high',
    isCompleted: true,
    createdAt: '2024-03-16',
  },
  {
    id: 'task2',
    title: 'Prepare client presentation for Q1 results',
    description: 'Create slides showing campaign performance',
    dueDate: '2024-03-25',
    assignedTo: mockUsers[1],
    relatedClient: mockClients[0],
    relatedCampaign: mockCampaigns[0],
    priority: 'medium',
    isCompleted: false,
    createdAt: '2024-03-18',
  },
  {
    id: 'task3',
    title: 'Schedule content creation for Spring campaign',
    description: 'Coordinate with design team for promotional materials',
    dueDate: '2024-04-15',
    assignedTo: mockUsers[2],
    relatedClient: mockClients[1],
    relatedCampaign: mockCampaigns[1],
    priority: 'high',
    isCompleted: false,
    createdAt: '2024-04-02',
  },
];

export default function CampaignDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = params.campaignId as string;

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isArchiveConfirmOpen, setIsArchiveConfirmOpen] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (campaignId) {
      setLoading(true);
      setError(null);
      setTimeout(() => {
        const foundCampaign = mockCampaigns.find(c => c.id === campaignId);
        if (foundCampaign) {
          setCampaign(foundCampaign);
          
          // Load campaign-related tasks
          const campaignTasks = mockTasks.filter(task => task.relatedCampaign?.id === campaignId);
          setTasks(campaignTasks);
        } else {
          setError("Campaign not found.");
        }
        setClients(mockClients);
        setLoading(false);
      }, 500);
    }
  }, [campaignId]);

  const handleCampaignUpdated = (updatedCampaign: Campaign) => {
    setCampaign(updatedCampaign);
  };

  const handleArchiveCampaign = async () => {
    if (!campaign) return;
    setIsArchiving(true);
    try {
      console.log(`Archiving campaign ${campaign.id}...`);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay

      // Mock behavior: Update local campaign state
      setCampaign(prevCampaign => prevCampaign ? { ...prevCampaign, status: 'Paused' } : null);
      // In a real app, you might also want to update the list on the main /campaigns page
      // by calling a callback passed from there or using global state.
      
      toast({
        title: "Campaign Archived",
        description: `${campaign.campaignName} has been archived (status set to Paused).`,
      });
      setIsArchiveConfirmOpen(false);
    } catch (error) {
      console.error("Failed to archive campaign:", error);
      toast({
        title: "Error Archiving Campaign",
        description: (error as Error).message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsArchiving(false);
    }
  };
  
  const handleAddTask = () => {
    setEditingTask(null);
    setIsTaskModalOpen(true);
  };
  
  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };
  
  const handleCompleteTask = (task: Task) => {
    const updatedTask = {
      ...task,
      isCompleted: !task.isCompleted
    };
    
    // Update task in the "database"
    setTasks(prev => prev.map(t => t.id === task.id ? updatedTask : t));
    
    toast({
      title: updatedTask.isCompleted ? "Task Completed" : "Task Reopened",
      description: updatedTask.isCompleted 
        ? `"${task.title}" has been marked as completed.`
        : `"${task.title}" has been reopened.`,
    });
  };
  
  const handleSaveTask = (task: Task) => {
    if (editingTask) {
      // Update existing task
      setTasks(prev => prev.map(t => t.id === task.id ? task : t));
    } else {
      // Add new task
      setTasks(prev => [...prev, task]);
    }
  };

  if (loading) {
    return <AppLayout><div className="flex justify-center items-center h-full"><p>Loading campaign details...</p></div></AppLayout>;
  }

  if (error) {
    return <AppLayout><div className="flex flex-col justify-center items-center h-full"><p className="text-red-500 text-xl">{error}</p><Button onClick={() => router.push('/campaigns')} className="mt-4">Back to Campaigns</Button></div></AppLayout>;
  }

  if (!campaign) {
    return <AppLayout><div className="flex justify-center items-center h-full"><p>Campaign data could not be loaded.</p></div></AppLayout>;
  }

  const DetailItem = ({ icon: Icon, label, value, isWide = false }: { icon: React.ElementType, label: string, value?: string | number | React.ReactNode, isWide?: boolean }) => (
    <div className={`flex items-start space-x-3 ${isWide ? 'md:col-span-2 lg:col-span-3' : ''}`}>
        <Icon className="h-5 w-5 text-muted-foreground mt-1 flex-shrink-0" />
        <div className="min-w-0">
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <div className="text-base text-foreground break-words">{value === undefined || value === null || value === '' ? 'N/A' : value}</div>
        </div>
    </div>
  );

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header & Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <Button variant="outline" size="sm" onClick={() => router.push('/campaigns')} className="mb-2 sm:mb-0">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Campaigns
            </Button>
            <h1 className="text-3xl font-bold flex items-center">
                {campaign.campaignName}
                <Badge 
                    variant={campaign.status === 'Active' ? 'default' : campaign.status === 'Completed' ? 'secondary' : 'outline'} 
                    className={cn(
                        "ml-3 text-white",
                        campaign.status === 'Active' && 'bg-green-500',
                        campaign.status === 'Planning' && 'bg-yellow-500 !text-black',
                        campaign.status === 'Paused' && 'bg-orange-500',
                        campaign.status === 'Completed' && 'bg-blue-600'
                    )}
                >
                    {campaign.status}
                </Badge>
            </h1>
            <p className="text-muted-foreground">Client: {campaign.client.clientName}</p>
          </div>
          <div className="flex space-x-2 mt-2 sm:mt-0">
            <Button variant="outline" onClick={() => setIsEditModalOpen(true)}><Edit3 className="mr-2 h-4 w-4" /> Edit Campaign</Button>
            <Button variant="destructive" onClick={() => setIsArchiveConfirmOpen(true)} disabled={campaign?.status === 'Paused' || campaign?.status === 'Completed'}>
                <Archive className="mr-2 h-4 w-4" /> 
                {campaign?.status === 'Paused' ? 'Archived (Paused)' : campaign?.status === 'Completed' ? 'Archived (Completed)' : 'Archive'}
            </Button>
          </div>
        </div>

        {/* Campaign Details Card */}
        <Card>
          <CardHeader>
            <CardTitle>Campaign Overview</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-8">
            <DetailItem icon={Users} label="Client" value={campaign.client.clientName} />
            <DetailItem icon={CalendarDays} label="Start Date" value={format(new Date(campaign.startDate), "PP")} />
            <DetailItem icon={CalendarDays} label="End Date" value={format(new Date(campaign.endDate), "PP")} />
            <DetailItem icon={DollarSign} label="Budget" value={`$${campaign.budget.toLocaleString()}`} />
            <DetailItem icon={ClipboardList} label="Status" value={campaign.status} />
            <div /> {/* Empty div for grid alignment if needed */}
            
            <DetailItem icon={FileText} label="Description" value={<p className="whitespace-pre-wrap">{campaign.description || 'N/A'}</p>} isWide={true} />
          </CardContent>
        </Card>

        {/* Tasks Card */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Campaign Tasks</h2>
            <Button onClick={handleAddTask}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Task
            </Button>
          </div>
          
          <TaskList 
            tasks={tasks}
            users={mockUsers}
            clients={mockClients}
            campaigns={mockCampaigns}
            relatedToCampaign={campaignId}
            onAddTask={handleAddTask}
            onEditTask={handleEditTask}
            onCompleteTask={handleCompleteTask}
          />
        </div>
      </div>
      
      {/* Modals */}
      <EditCampaignModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        campaign={campaign}
        clients={clients}
        onCampaignUpdated={handleCampaignUpdated}
      />
      
      <ConfirmationDialog
        isOpen={isArchiveConfirmOpen}
        onClose={() => setIsArchiveConfirmOpen(false)}
        onConfirm={handleArchiveCampaign}
        title="Archive Campaign?"
        description={
          <p>Are you sure you want to archive the campaign <strong>{campaign?.campaignName}</strong>? This will typically set its status to Paused or prevent further active changes.</p>
        }
        confirmButtonText="Yes, Archive Campaign"
        isConfirming={isArchiving}
      />
      
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        task={editingTask}
        onSave={handleSaveTask}
        users={mockUsers}
        clients={mockClients}
        campaigns={mockCampaigns}
        defaultCampaignId={campaignId}
      />
    </AppLayout>
  );
} 