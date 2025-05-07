"use client";

import React, { useState, useEffect } from 'react';
import AppLayout from "@/components/layout/AppLayout";
import TaskList from "@/components/tasks/TaskList";
import TaskModal from "@/components/tasks/TaskModal";
import { Button } from "@/components/ui/button";
import { User, Client, Campaign, Task } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle } from "lucide-react";

// Mock data for users
const mockUsers: User[] = [
  { id: 'user1', name: 'Alice Wonderland', email: 'alice@example.com', role: 'Admin', status: 'Active' },
  { id: 'user2', name: 'Bob The Builder', email: 'bob@example.com', role: 'Manager', status: 'Active' },
  { id: 'user3', name: 'Charlie Brown', email: 'charlie@example.com', role: 'Manager', status: 'Active' },
];

// Mock data for clients
const mockClients: Client[] = [
  {
    id: 'client1',
    clientName: 'Innovatech Solutions',
    email: 'contact@innovatech.com',
    company: 'Innovatech Ltd.',
    status: 'Active',
    lastInteraction: '2024-05-10',
    assignedManager: mockUsers[0],
  },
  {
    id: 'client2',
    clientName: 'Quantum Leap Inc.',
    email: 'info@quantumleap.io',
    company: 'Quantum Leap Inc.',
    status: 'Lead',
    lastInteraction: '2024-05-15',
    assignedManager: mockUsers[1],
  },
];

// Mock data for campaigns
const mockCampaigns: Campaign[] = [
  {
    id: 'camp1',
    campaignName: 'Q1 Product Launch',
    client: mockClients[0],
    startDate: '2024-01-15',
    endDate: '2024-03-15',
    budget: 5000,
    status: 'Completed',
    description: 'Detailed launch strategy for the new X1000 Product.',
  },
  {
    id: 'camp2',
    campaignName: 'Spring Sales Drive',
    client: mockClients[1],
    startDate: '2024-04-01',
    endDate: '2024-05-31',
    budget: 7500,
    status: 'Active',
    description: 'Aggressive sales campaign to boost Q2 revenue.',
  },
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
    relatedCampaign: mockCampaigns[0],
    priority: 'high',
    isCompleted: false,
    createdAt: '2024-05-10',
  },
  {
    id: 'task2',
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
  {
    id: 'task3',
    title: 'Review Q1 campaign analytics',
    description: 'Analyze the performance of Q1 Product Launch campaign',
    dueDate: '2024-05-30',
    assignedTo: mockUsers[2],
    relatedClient: mockClients[0],
    relatedCampaign: mockCampaigns[0],
    priority: 'low',
    isCompleted: false,
    createdAt: '2024-05-12',
  },
  {
    id: 'task4',
    title: 'Update client meeting notes',
    description: 'Update CRM with notes from client meeting',
    dueDate: '2024-05-18',
    assignedTo: mockUsers[0],
    relatedClient: mockClients[1],
    relatedCampaign: null,
    priority: 'medium',
    isCompleted: false,
    createdAt: '2024-05-15',
  },
];

export default function TasksPage() {
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  
  // Simulate API fetch
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      try {
        setTasks(mockTasks);
        setUsers(mockUsers);
        setClients(mockClients);
        setCampaigns(mockCampaigns);
      } catch (err) {
        setError('Failed to load tasks data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 800);
  }, []);
  
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
  
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <h1 className="text-3xl font-bold">Task Management</h1>
          <Button onClick={handleAddTask}>
            <PlusCircle className="mr-2 h-4 w-4" /> New Task
          </Button>
        </div>
        
        {loading ? (
          <div className="py-12 text-center">
            <p>Loading tasks...</p>
          </div>
        ) : error ? (
          <div className="py-12 text-center text-red-500">
            <p>{error}</p>
          </div>
        ) : (
          <TaskList 
            tasks={tasks}
            users={users}
            clients={clients}
            campaigns={campaigns}
            onAddTask={handleAddTask}
            onEditTask={handleEditTask}
            onCompleteTask={handleCompleteTask}
          />
        )}
      </div>
      
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        task={editingTask}
        onSave={handleSaveTask}
        users={users}
        clients={clients}
        campaigns={campaigns}
      />
    </AppLayout>
  );
} 