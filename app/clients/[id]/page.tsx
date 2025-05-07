"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Client, User, RecentActivity as Interaction, Task } from "@/types";
import { ArrowLeft, Edit3, PlusCircle, Archive, Mail, PhoneIcon, Briefcase, Info, Tag, CalendarDays, MessageSquare } from 'lucide-react';
import AddInteractionModal from "@/components/clients/AddInteractionModal";
import ConfirmationDialog from "@/components/common/ConfirmationDialog";
import EditClientModal from "@/components/clients/EditClientModal";
import TaskList from "@/components/tasks/TaskList";
import TaskModal from "@/components/tasks/TaskModal";
import { useToast } from "@/hooks/use-toast";

// It's better to move mock data to a shared file, e.g., lib/mockData.ts
// For now, duplicating for simplicity, but this should be centralized.
const mockUsers: User[] = [
  { id: 'user1', name: 'Alice Wonderland', email: 'alice@example.com', role: 'Manager', status: 'Active' },
  { id: 'user2', name: 'Bob The Builder', email: 'bob@example.com', role: 'Manager', status: 'Active' },
  { id: 'user3', name: 'Charlie Brown', email: 'charlie@example.com', role: 'Admin', status: 'Active' },
];

const mockClients: Client[] = [
  {
    id: 'client1',
    clientName: 'Innovatech Solutions',
    email: 'contact@innovatech.com',
    company: 'Innovatech Ltd.',
    status: 'Active',
    lastInteraction: '2024-05-10',
    assignedManager: mockUsers[0],
    phone: '555-0101',
    notes: 'Key client, interested in Q3 campaign. Prefers morning calls.',
    campaignTags: ['Q3 Campaign', 'High Value', 'Newsletter'],
  },
  {
    id: 'client2',
    clientName: 'Quantum Leap Inc.',
    email: 'info@quantumleap.io',
    company: 'Quantum Leap Inc.',
    status: 'Lead',
    lastInteraction: '2024-05-15',
    assignedManager: mockUsers[1],
    phone: '555-0102',
    notes: 'New lead from website. Follow up regarding service package A.',
    campaignTags: ['Website Lead', 'Service A'],
  },
  {
    id: 'client3',
    clientName: 'Synergy Corp',
    email: 'support@synergy.com',
    company: 'Synergy Corp.',
    status: 'Inactive',
    lastInteraction: '2024-03-20',
    assignedManager: mockUsers[0],
    phone: '555-0103',
    notes: 'Paused services. Potential to re-engage in Q4.',
    campaignTags: ['Paused', 'Re-engage Q4'],
  },
  // ... add more clients if needed for direct navigation testing
];

const mockInteractions: Interaction[] = [
    { id: 'int1', client: mockClients[0], date: '2024-05-10', type: 'Call', notes: 'Discussed Q3 campaign proposal. Client is very interested.'},
    { id: 'int2', client: mockClients[0], date: '2024-05-08', type: 'Email', notes: 'Sent follow-up email with brochure.'},
    { id: 'int3', client: mockClients[1], date: '2024-05-15', type: 'Meeting', notes: 'Initial consultation. Demoed Service Package A.'},
    { id: 'int4', client: mockClients[0], date: '2024-04-20', type: 'Note', notes: 'Client mentioned budget constraints for Q2.'}
];

// Mock data for tasks
const mockTasks: Task[] = [
  {
    id: 'task1',
    title: 'Follow up with Innovatech about Q3 budget',
    description: 'Schedule a call to discuss budget for the upcoming campaign',
    dueDate: '2024-05-25',
    assignedTo: mockUsers[0],
    relatedClient: mockClients[0],
    relatedCampaign: null,
    priority: 'high',
    isCompleted: false,
    createdAt: '2024-05-10',
  },
  {
    id: 'task2',
    title: 'Draft proposal for Innovatech summer campaign',
    description: 'Create a proposal based on their requests from last meeting',
    dueDate: '2024-05-28',
    assignedTo: mockUsers[1],
    relatedClient: mockClients[0],
    relatedCampaign: null,
    priority: 'medium',
    isCompleted: false,
    createdAt: '2024-05-12',
  },
  {
    id: 'task3',
    title: 'Create proposal for Quantum Leap',
    description: 'Draft a proposal for the summer marketing campaign',
    dueDate: '2024-05-20',
    assignedTo: mockUsers[1],
    relatedClient: mockClients[1],
    relatedCampaign: null,
    priority: 'medium',
    isCompleted: true,
    createdAt: '2024-05-08',
  },
];

export default function ClientDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params.id as string;
  const { toast } = useToast();

  const [client, setClient] = useState<Client | null>(null);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddInteractionModalOpen, setIsAddInteractionModalOpen] = useState(false);
  const [isArchiveConfirmOpen, setIsArchiveConfirmOpen] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  useEffect(() => {
    if (clientId) {
      setLoading(true);
      setError(null);
      setTimeout(() => {
        const foundClient = mockClients.find(c => c.id === clientId);
        if (foundClient) {
          setClient(foundClient);
          const clientInteractions = mockInteractions.filter(int => int.client.id === clientId);
          setInteractions(clientInteractions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
          
          // Load client-related tasks
          const clientTasks = mockTasks.filter(task => task.relatedClient?.id === clientId);
          setTasks(clientTasks);
          
          // In a real app, you would fetch the campaigns for this client here
          setCampaigns([]);
        } else {
          setError("Client not found.");
        }
        setLoading(false);
      }, 500);
    }
  }, [clientId]);

  const handleInteractionAdded = (newInteraction: Interaction) => {
    setInteractions(prevInteractions => 
      [newInteraction, ...prevInteractions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    );
    // Potentially re-fetch client if lastInteraction date needs update from server
    // For mock: if (client) setClient({...client, lastInteraction: newInteraction.date});
  };

  const handleArchiveClient = async () => {
    if (!client) return;
    setIsArchiving(true);
    // Simulate API call
    try {
      console.log(`Archiving client ${client.id}...`);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
      
      // Update local client state (mock behavior)
      setClient(prevClient => prevClient ? { ...prevClient, status: 'Inactive' } : null);
      
      toast({
        title: "Client Archived",
        description: `${client.clientName} has been successfully archived and set to Inactive.`,
      });
      setIsArchiveConfirmOpen(false);
    } catch (error) {
      console.error("Failed to archive client:", error);
      toast({
        title: "Error Archiving Client",
        description: (error as Error).message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsArchiving(false);
    }
  };

  const handleClientUpdated = (updatedClient: Client) => {
    setClient(updatedClient);
    // Potentially, you might want to refresh the whole client list if some global property changed
    // or update the specific client in the mockClients array if we were managing a global mock store.
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
    return <AppLayout><div className="flex justify-center items-center h-full"><p>Loading client details...</p></div></AppLayout>;
  }

  if (error) {
    return <AppLayout><div className="flex flex-col justify-center items-center h-full"><p className="text-red-500 text-xl">{error}</p><Button onClick={() => router.push('/clients')} className="mt-4">Back to Clients</Button></div></AppLayout>;
  }

  if (!client) {
    return <AppLayout><div className="flex justify-center items-center h-full"><p>Client data could not be loaded.</p></div></AppLayout>;
  }

  const DetailItem = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value?: string | null | React.ReactNode }) => (
    <div className="flex items-start space-x-3">
        <Icon className="h-5 w-5 text-muted-foreground mt-1" />
        <div>
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p className="text-base text-foreground">{value || 'N/A'}</p>
        </div>
    </div>
  );

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header & Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <Button variant="outline" size="sm" onClick={() => router.push('/clients')} className="mb-2 sm:mb-0">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Clients
            </Button>
            <h1 className="text-3xl font-bold flex items-center">
                {client.clientName}
                <Badge variant={client.status === 'Active' ? 'default' : client.status === 'Lead' ? 'secondary' : 'outline'} className={`ml-3 ${client.status === 'Active' ? 'bg-green-500' : client.status === 'Lead' ? 'bg-blue-500' : 'bg-gray-500'} text-white`}>
                    {client.status}
                </Badge>
            </h1>
            <p className="text-muted-foreground">{client.company}</p>
          </div>
          <div className="flex space-x-2 mt-2 sm:mt-0">
            <Button variant="outline" onClick={() => setIsEditModalOpen(true)}>
                <Edit3 className="mr-2 h-4 w-4" /> Edit Client
            </Button>
            <Button onClick={() => setIsAddInteractionModalOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Interaction
            </Button>
            <Button variant="destructive" onClick={() => setIsArchiveConfirmOpen(true)} disabled={client?.status === 'Inactive'}>
                <Archive className="mr-2 h-4 w-4" /> {client?.status === 'Inactive' ? 'Archived' : 'Archive'}
            </Button>
          </div>
        </div>

        {/* Client Details Card */}
        <Card>
          <CardHeader>
            <CardTitle>Client Information</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <DetailItem icon={Mail} label="Email" value={client.email} />
            <DetailItem icon={PhoneIcon} label="Phone" value={client.phone} />
            <DetailItem icon={Briefcase} label="Assigned Manager" value={client.assignedManager?.name} />
            <DetailItem icon={CalendarDays} label="Last Interaction" value={new Date(client.lastInteraction).toLocaleDateString()} />
            
            <div className="md:col-span-2 lg:col-span-3 space-y-3">
                <div className="flex items-start space-x-3">
                    <Tag className="h-5 w-5 text-muted-foreground mt-1" />
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Campaign Tags</p>
                        {client.campaignTags && client.campaignTags.length > 0 ? (
                            <div className="flex flex-wrap gap-2 mt-1">
                            {client.campaignTags.map(tag => <Badge key={tag} variant="secondary">{tag}</Badge>)}
                            </div>
                        ) : <p className="text-base text-foreground">N/A</p>}
                    </div>
                </div>
            </div>

            <div className="md:col-span-2 lg:col-span-3 space-y-3">
                 <div className="flex items-start space-x-3">
                    <Info className="h-5 w-5 text-muted-foreground mt-1" />
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Notes</p>
                        <p className="text-base text-foreground whitespace-pre-wrap">{client.notes || 'N/A'}</p>
                    </div>
                </div>
            </div>
          </CardContent>
        </Card>

        {/* Tasks Card */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Tasks</h2>
            <Button onClick={handleAddTask}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Task
            </Button>
          </div>
          
          <TaskList 
            tasks={tasks}
            users={mockUsers}
            campaigns={campaigns}
            relatedToClient={clientId}
            onAddTask={handleAddTask}
            onEditTask={handleEditTask}
            onCompleteTask={handleCompleteTask}
          />
        </div>

        {/* Interaction History Card */}
        <Card>
          <CardHeader>
            <CardTitle>Interaction History</CardTitle>
            <CardDescription>Record of communications and activities with {client.clientName}.</CardDescription>
          </CardHeader>
          <CardContent>
            {interactions.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {interactions.map(interaction => (
                    <TableRow key={interaction.id}>
                      <TableCell>{new Date(interaction.date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{interaction.type}</Badge>
                      </TableCell>
                      <TableCell>{interaction.notes}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                <p>No interaction history yet.</p>
                <Button onClick={() => setIsAddInteractionModalOpen(true)} variant="outline" className="mt-4">
                  <PlusCircle className="mr-2 h-4 w-4" /> Add First Interaction
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      <AddInteractionModal 
        isOpen={isAddInteractionModalOpen}
        onClose={() => setIsAddInteractionModalOpen(false)}
        client={client}
        onInteractionAdded={handleInteractionAdded}
      />
      
      <EditClientModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        client={client}
        onClientUpdated={handleClientUpdated}
      />
      
      <ConfirmationDialog
        isOpen={isArchiveConfirmOpen}
        onClose={() => setIsArchiveConfirmOpen(false)}
        onConfirm={handleArchiveClient}
        title="Archive Client?"
        description={
          <p>Are you sure you want to archive <strong>{client.clientName}</strong>? This will set their status to Inactive.</p>
        }
        confirmButtonText="Yes, Archive Client"
        isConfirming={isArchiving}
      />
      
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        task={editingTask}
        onSave={handleSaveTask}
        users={mockUsers}
        clients={mockClients}
        campaigns={campaigns}
        defaultClientId={clientId}
      />
    </AppLayout>
  );
} 