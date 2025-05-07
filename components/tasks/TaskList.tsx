"use client";

import React, { useState } from 'react';
import { format } from 'date-fns';
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from '@/components/ui/table';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Circle, Clock, ArrowUpDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Task, User, Client, Campaign } from '@/types';
import { cn } from '@/lib/utils';

interface TaskListProps {
  tasks: Task[];
  users: User[];
  clients?: Client[];
  campaigns?: Campaign[];
  onAddTask?: () => void;
  onEditTask?: (task: Task) => void;
  onCompleteTask?: (task: Task) => void;
  relatedToClient?: string;
  relatedToCampaign?: string;
}

type SortKey = 'title' | 'dueDate' | 'priority' | 'status';

export default function TaskList({
  tasks,
  users,
  clients,
  campaigns,
  onAddTask,
  onEditTask,
  onCompleteTask,
  relatedToClient,
  relatedToCampaign
}: TaskListProps) {
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'pending'>('all');
  const [filterAssignee, setFilterAssignee] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortKey>('dueDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [searchQuery, setSearchQuery] = useState('');

  // Apply filters and sorting
  const filteredTasks = tasks.filter(task => {
    // Apply status filter
    if (filterStatus === 'completed' && !task.isCompleted) return false;
    if (filterStatus === 'pending' && task.isCompleted) return false;
    
    // Apply assignee filter
    if (filterAssignee !== 'all' && task.assignedTo?.id !== filterAssignee) return false;
    
    // Apply client/campaign filters if they exist
    if (relatedToClient && task.relatedClient?.id !== relatedToClient) return false;
    if (relatedToCampaign && task.relatedCampaign?.id !== relatedToCampaign) return false;
    
    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        task.title.toLowerCase().includes(query) ||
        task.description?.toLowerCase().includes(query) ||
        task.assignedTo?.name.toLowerCase().includes(query) ||
        task.relatedClient?.clientName.toLowerCase().includes(query) ||
        task.relatedCampaign?.campaignName.toLowerCase().includes(query)
      );
    }
    
    return true;
  });
  
  // Sort the filtered tasks
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    let aValue: any;
    let bValue: any;
    
    switch (sortBy) {
      case 'dueDate':
        aValue = new Date(a.dueDate).getTime();
        bValue = new Date(b.dueDate).getTime();
        break;
      case 'title':
        aValue = a.title.toLowerCase();
        bValue = b.title.toLowerCase();
        break;
      case 'priority':
        const priorityOrder = { low: 0, medium: 1, high: 2 };
        aValue = priorityOrder[a.priority || 'medium'];
        bValue = priorityOrder[b.priority || 'medium'];
        break;
      case 'status':
        aValue = a.isCompleted ? 1 : 0;
        bValue = b.isCompleted ? 1 : 0;
        break;
      default:
        aValue = a.title.toLowerCase();
        bValue = b.title.toLowerCase();
    }
    
    return sortDirection === 'asc' 
      ? aValue > bValue ? 1 : -1 
      : aValue > bValue ? -1 : 1;
  });
  
  const handleSort = (column: SortKey) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDirection('asc');
    }
  };
  
  const SortableHeader = ({ column, label }: { column: SortKey, label: string }) => (
    <TableHead>
      <Button
        variant="ghost"
        onClick={() => handleSort(column)}
        className="flex items-center gap-1 p-0 h-auto font-medium"
      >
        {label}
        {sortBy === column && (
          <ArrowUpDown className={cn(
            "ml-1 h-3 w-3",
            sortDirection === 'desc' && "rotate-180 transform"
          )} />
        )}
      </Button>
    </TableHead>
  );

  // Get priority badge variant
  const getPriorityBadge = (priority: string | undefined) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive">High</Badge>;
      case 'medium':
        return <Badge variant="default">Medium</Badge>;
      case 'low':
        return <Badge variant="outline">Low</Badge>;
      default:
        return <Badge variant="default">Medium</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <CardTitle>Tasks {tasks.length > 0 && `(${filteredTasks.length}/${tasks.length})`}</CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            <Input
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full md:w-48"
            />
            <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value as 'all' | 'completed' | 'pending')}>
              <SelectTrigger className="w-full md:w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filterAssignee} onValueChange={setFilterAssignee}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Assignee" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Assignees</SelectItem>
                {users.map(user => (
                  <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {onAddTask && (
              <Button onClick={onAddTask} className="w-full md:w-auto">
                Add Task
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredTasks.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">Status</TableHead>
                  <SortableHeader column="title" label="Task" />
                  <SortableHeader column="dueDate" label="Due Date" />
                  <SortableHeader column="priority" label="Priority" />
                  <TableHead>Assigned To</TableHead>
                  {!relatedToClient && <TableHead>Client</TableHead>}
                  {!relatedToCampaign && <TableHead>Campaign</TableHead>}
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedTasks.map(task => (
                  <TableRow 
                    key={task.id} 
                    className={cn(
                      task.isCompleted && "bg-muted/50",
                      new Date(task.dueDate) < new Date() && !task.isCompleted && "bg-red-50",
                    )}
                  >
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 p-0"
                        onClick={() => onCompleteTask?.(task)}
                        disabled={!onCompleteTask}
                      >
                        {task.isCompleted 
                          ? <CheckCircle2 className="h-5 w-5 text-green-500" /> 
                          : <Circle className="h-5 w-5 text-muted-foreground" />
                        }
                        <span className="sr-only">{task.isCompleted ? 'Mark as incomplete' : 'Complete task'}</span>
                      </Button>
                    </TableCell>
                    <TableCell className="font-medium">{task.title}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Clock className="mr-1 h-3 w-3 text-muted-foreground" />
                        {format(new Date(task.dueDate), 'MMM d, yyyy')}
                      </div>
                    </TableCell>
                    <TableCell>{getPriorityBadge(task.priority)}</TableCell>
                    <TableCell>{task.assignedTo?.name || 'Unassigned'}</TableCell>
                    {!relatedToClient && (
                      <TableCell>{task.relatedClient?.clientName || 'N/A'}</TableCell>
                    )}
                    {!relatedToCampaign && (
                      <TableCell>{task.relatedCampaign?.campaignName || 'N/A'}</TableCell>
                    )}
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEditTask?.(task)}
                        disabled={!onEditTask}
                      >
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="py-12 text-center text-muted-foreground">
            <p>No tasks found.</p>
            {onAddTask && (
              <Button onClick={onAddTask} variant="outline" className="mt-4">
                Add your first task
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 