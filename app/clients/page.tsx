"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Client, User } from "@/types"; // Using existing types
import { MoreHorizontal, PlusCircle, ArrowUpDown } from 'lucide-react';

// Mock Data (replace with API calls)
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
  {
    id: 'client3',
    clientName: 'Synergy Corp',
    email: 'support@synergy.com',
    company: 'Synergy Corp.',
    status: 'Inactive',
    lastInteraction: '2024-03-20',
    assignedManager: mockUsers[0],
  },
  {
    id: 'client4',
    clientName: 'Apex Digital',
    email: 'hello@apexdigital.com',
    company: 'Apex Digital LLC',
    status: 'Active',
    lastInteraction: '2024-05-18',
    assignedManager: mockUsers[2],
  },
    // Add more mock clients for pagination testing
  ...Array.from({ length: 15 }, (_, i) => ({
    id: `client${i + 5}`,
    clientName: `Mock Client ${i + 5}`,
    email: `mock${i + 5}@example.com`,
    company: `Mock Company ${i + 5}`,
    status: (i % 3 === 0 ? 'Active' : i % 3 === 1 ? 'Lead' : 'Inactive') as 'Active' | 'Lead' | 'Inactive',
    lastInteraction: `2024-04-${10 + i}`,
    assignedManager: mockUsers[i % 3],
  }))
];

const ITEMS_PER_PAGE = 10;

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [companySearch, setCompanySearch] = useState("");
  const [managerFilter, setManagerFilter] = useState<string>("all");

  // Sorting
  const [sortColumn, setSortColumn] = useState<keyof Client | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    // Simulate API call
    setLoading(true);
    setError(null);
    setTimeout(() => {
      setClients(mockClients);
      setLoading(false);
    }, 500);
  }, []);

  const handleSort = (column: keyof Client) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const filteredClients = useMemo(() => {
    let result = clients;
    if (statusFilter !== "all") {
      result = result.filter(client => client.status === statusFilter);
    }
    if (companySearch) {
      result = result.filter(client => 
        client.company.toLowerCase().includes(companySearch.toLowerCase()) ||
        client.clientName.toLowerCase().includes(companySearch.toLowerCase())
      );
    }
    if (managerFilter !== "all") {
      result = result.filter(client => client.assignedManager?.id === managerFilter);
    }

    if (sortColumn) {
      result.sort((a, b) => {
        const aValue = a[sortColumn];
        const bValue = b[sortColumn];
        
        if (aValue === null || aValue === undefined) return 1;
        if (bValue === null || bValue === undefined) return -1;

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortDirection === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
        }
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
        }
        // Basic date string comparison (can be improved)
        if (sortColumn === 'lastInteraction') {
            return sortDirection === 'asc' ? new Date(aValue as string).getTime() - new Date(bValue as string).getTime() : new Date(bValue as string).getTime() - new Date(aValue as string).getTime();
        }
        return 0;
      });
    }

    return result;
  }, [clients, statusFilter, companySearch, managerFilter, sortColumn, sortDirection]);

  const paginatedClients = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredClients.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredClients, currentPage]);

  const totalPages = Math.ceil(filteredClients.length / ITEMS_PER_PAGE);

  if (loading) return <AppLayout><p>Loading clients...</p></AppLayout>;
  if (error) return <AppLayout><p className="text-red-500">Error: {error}</p></AppLayout>;

  const SortableHeader = ({ column, label }: { column: keyof Client; label: string }) => (
    <TableHead onClick={() => handleSort(column)} className="cursor-pointer">
      <div className="flex items-center">
        {label}
        {sortColumn === column && (
          <ArrowUpDown className={`ml-2 h-4 w-4 ${sortDirection === 'asc' ? '' : 'rotate-180'}`} />
        )}
      </div>
    </TableHead>
  );

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <h1 className="text-3xl font-bold">Clients</h1>
          <Link href="/clients/new">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Add New Client
            </Button>
          </Link>
        </div>

        {/* Filters Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4 border rounded-lg">
          <div>
            <label htmlFor="companySearch" className="block text-sm font-medium text-gray-700 mb-1">Search Name/Company</label>
            <Input 
              id="companySearch"
              placeholder="Search by name or company..."
              value={companySearch}
              onChange={(e) => setCompanySearch(e.target.value)}
              className="w-full"
            />
          </div>
          <div>
            <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger id="statusFilter" className="w-full">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Lead">Lead</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label htmlFor="managerFilter" className="block text-sm font-medium text-gray-700 mb-1">Assigned Manager</label>
            <Select value={managerFilter} onValueChange={setManagerFilter}>
              <SelectTrigger id="managerFilter" className="w-full">
                <SelectValue placeholder="Filter by manager" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Managers</SelectItem>
                {mockUsers.map(user => (
                  <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Client Table */}
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <SortableHeader column="clientName" label="Client Name" />
                <SortableHeader column="email" label="Email" />
                <SortableHeader column="company" label="Company" />
                <SortableHeader column="status" label="Status" />
                <SortableHeader column="lastInteraction" label="Last Interaction" />
                <SortableHeader column="assignedManager" label="Assigned Manager" />
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedClients.length > 0 ? (
                paginatedClients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell className="font-medium">{client.clientName}</TableCell>
                    <TableCell>{client.email}</TableCell>
                    <TableCell>{client.company}</TableCell>
                    <TableCell>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full 
                            ${client.status === 'Active' ? 'bg-green-100 text-green-800' : 
                              client.status === 'Lead' ? 'bg-blue-100 text-blue-800' : 
                              'bg-gray-100 text-gray-800'}`}>
                            {client.status}
                        </span>
                    </TableCell>
                    <TableCell>{new Date(client.lastInteraction).toLocaleDateString()}</TableCell>
                    <TableCell>{client.assignedManager?.name || 'N/A'}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <Link href={`/clients/${client.id}`} passHref>
                             <DropdownMenuItem>View Details</DropdownMenuItem>
                          </Link>
                          {/* Add other actions like Edit, Archive here */}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center h-24">
                    No clients found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-end space-x-2 py-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className='text-sm'>
                Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </AppLayout>
  );
} 