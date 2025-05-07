"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { format } from "date-fns";
import { DateRange } from "react-day-picker";
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; // May not be needed if filters are select/date only
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Campaign, Client } from "@/types";
import { MoreHorizontal, PlusCircle, CalendarIcon, ArrowUpDown } from 'lucide-react';
import { cn } from "@/lib/utils";

// Mock Data (Ideally, share this with other pages, e.g., from lib/mockData.ts)
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
    description: 'Launch campaign for the new X1000 Product.'
  },
  {
    id: 'camp2',
    campaignName: 'Spring Sales Drive',
    client: mockClients[1],
    startDate: '2024-04-01',
    endDate: '2024-05-31',
    budget: 7500,
    status: 'Active',
    description: 'Boost spring sales with targeted promotions.'
  },
  {
    id: 'camp3',
    campaignName: 'Summer Awareness Campaign',
    client: mockClients[0],
    startDate: '2024-06-15',
    endDate: '2024-08-15',
    budget: 6000,
    status: 'Planning',
    description: 'Increase brand awareness over the summer period.'
  },
  // Add more for pagination
  ...Array.from({ length: 12 }, (_, i) => ({
    id: `camp${i + 4}`,
    campaignName: `Old Campaign ${i + 1}`,
    client: mockClients[i % 2],
    startDate: `2023-0${i % 2 + 1}-01`,
    endDate: `2023-0${i % 2 + 2}-28`,
    budget: 3000 + (i*500),
    status: 'Completed',
    description: `Completed campaign from last year ${i+1}`
  }))
];

const ITEMS_PER_PAGE = 10;

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [clientFilter, setClientFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>(undefined);

  // Sorting
  const [sortColumn, setSortColumn] = useState<keyof Campaign | 'clientName' | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    setError(null);
    setTimeout(() => {
      setCampaigns(mockCampaigns);
      setLoading(false);
    }, 500);
  }, []);

  const handleSort = (column: keyof Campaign | 'clientName') => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const filteredCampaigns = useMemo(() => {
    let result = campaigns;
    if (clientFilter !== "all") {
      result = result.filter(campaign => campaign.client.id === clientFilter);
    }
    if (statusFilter !== "all") {
      result = result.filter(campaign => campaign.status === statusFilter);
    }
    if (dateRange?.from && dateRange?.to) {
      result = result.filter(campaign => {
        const startDate = new Date(campaign.startDate);
        const endDate = new Date(campaign.endDate);
        return startDate >= dateRange.from! && endDate <= dateRange.to!;
      });
    } else if (dateRange?.from) {
        result = result.filter(campaign => new Date(campaign.startDate) >= dateRange.from!);
    }

    if (sortColumn) {
      result.sort((a, b) => {
        let aValue, bValue;
        if (sortColumn === 'clientName') {
          aValue = a.client.clientName;
          bValue = b.client.clientName;
        } else {
          aValue = a[sortColumn as keyof Campaign];
          bValue = b[sortColumn as keyof Campaign];
        }
        
        if (aValue === null || aValue === undefined) return 1;
        if (bValue === null || bValue === undefined) return -1;

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortDirection === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
        }
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
        }
        if (sortColumn === 'startDate' || sortColumn === 'endDate') {
            return sortDirection === 'asc' ? new Date(aValue as string).getTime() - new Date(bValue as string).getTime() : new Date(bValue as string).getTime() - new Date(aValue as string).getTime();
        }
        return 0;
      });
    }
    return result;
  }, [campaigns, clientFilter, statusFilter, dateRange, sortColumn, sortDirection]);

  const paginatedCampaigns = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredCampaigns.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredCampaigns, currentPage]);

  const totalPages = Math.ceil(filteredCampaigns.length / ITEMS_PER_PAGE);

  if (loading) return <AppLayout><p>Loading campaigns...</p></AppLayout>;
  if (error) return <AppLayout><p className="text-red-500">Error: {error}</p></AppLayout>;

  const SortableHeader = ({ column, label }: { column: keyof Campaign | 'clientName'; label: string }) => (
    <TableHead onClick={() => handleSort(column)} className="cursor-pointer">
      <div className="flex items-center">
        {label}
        {sortColumn === column && <ArrowUpDown className={`ml-2 h-4 w-4 ${sortDirection === 'asc' ? '' : 'rotate-180'}`} />}
      </div>
    </TableHead>
  );

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <h1 className="text-3xl font-bold">Campaigns</h1>
          {/* TODO: Link to Add Campaign Modal trigger */}
          <Button onClick={() => alert('Add Campaign Modal to be implemented')}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Campaign
          </Button>
        </div>

        {/* Filters Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-4 border rounded-lg">
          <div>
            <label htmlFor="clientFilter" className="block text-sm font-medium text-gray-700 mb-1">Client</label>
            <Select value={clientFilter} onValueChange={setClientFilter}>
              <SelectTrigger id="clientFilter"><SelectValue placeholder="Filter by client" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Clients</SelectItem>
                {mockClients.map(client => <SelectItem key={client.id} value={client.id}>{client.clientName}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger id="statusFilter"><SelectValue placeholder="Filter by status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Planning">Planning</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Paused">Paused</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label htmlFor="dateRangeFilter" className="block text-sm font-medium text-gray-700 mb-1">Date Range (Start)</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="dateRangeFilter"
                  variant={"outline"}
                  className={cn("w-full justify-start text-left font-normal", !dateRange && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>{format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}</>
                    ) : (
                      format(dateRange.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <SortableHeader column="campaignName" label="Campaign Name" />
                <SortableHeader column="clientName" label="Client" />
                <SortableHeader column="startDate" label="Start Date" />
                <SortableHeader column="endDate" label="End Date" />
                <SortableHeader column="budget" label="Budget" />
                <SortableHeader column="status" label="Status" />
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedCampaigns.length > 0 ? (
                paginatedCampaigns.map((campaign) => (
                  <TableRow key={campaign.id}>
                    <TableCell className="font-medium">{campaign.campaignName}</TableCell>
                    <TableCell>{campaign.client.clientName}</TableCell>
                    <TableCell>{format(new Date(campaign.startDate), "PP")}</TableCell>
                    <TableCell>{format(new Date(campaign.endDate), "PP")}</TableCell>
                    <TableCell>${campaign.budget.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant={campaign.status === 'Active' ? 'default' : campaign.status === 'Completed' ? 'secondary' : 'outline'}
                         className={cn(campaign.status === 'Active' && 'bg-green-500 text-white', campaign.status === 'Planning' && 'bg-yellow-500 text-black', campaign.status === 'Paused' && 'bg-orange-500 text-white')}>
                        {campaign.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {/* TODO: Link to Campaign Details Page */}
                          <DropdownMenuItem onClick={() => alert(`View details for ${campaign.campaignName}`)}>View Details</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow><TableCell colSpan={7} className="text-center h-24">No campaigns found.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-end space-x-2 py-4">
            <Button variant="outline" size="sm" onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} disabled={currentPage === 1}>Previous</Button>
            <span className='text-sm'>Page {currentPage} of {totalPages}</span>
            <Button variant="outline" size="sm" onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages}>Next</Button>
          </div>
        )}
      </div>
    </AppLayout>
  );
} 