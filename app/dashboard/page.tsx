"use client";

import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Users, Briefcase, ListChecks, Activity, Calendar, ArrowRight, TrendingUp } from "lucide-react";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { Client, Campaign } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

// Mock data - replace with API calls later
// Mock clients data - shared with other pages
const mockClients = [
  {
    id: 'client1',
    clientName: 'Innovatech Solutions',
    email: 'contact@innovatech.com',
    company: 'Innovatech Ltd.',
    status: 'Active',
    lastInteraction: '2024-05-10',
    assignedManager: { id: 'user1', name: 'Alice Wonderland', email: 'alice@example.com', role: 'Manager', status: 'Active' },
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
    assignedManager: { id: 'user2', name: 'Bob The Builder', email: 'bob@example.com', role: 'Manager', status: 'Active' },
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
    assignedManager: { id: 'user1', name: 'Alice Wonderland', email: 'alice@example.com', role: 'Manager', status: 'Active' },
    phone: '555-0103',
    notes: 'Paused services. Potential to re-engage in Q4.',
    campaignTags: ['Paused', 'Re-engage Q4'],
  },
];

// Mock campaigns data - shared with other pages
const mockCampaigns = [
  {
    id: 'camp1',
    campaignName: 'Q1 Product Launch',
    client: mockClients[0],
    startDate: '2024-01-15',
    endDate: '2024-03-15',
    budget: 5000,
    status: 'Completed',
    description: 'Detailed launch strategy for the new X1000 Product, focusing on digital channels and influencer outreach.',
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
  {
    id: 'camp3',
    campaignName: 'Summer Awareness Campaign',
    client: mockClients[0],
    startDate: '2024-06-15',
    endDate: '2024-08-15',
    budget: 6000,
    status: 'Planning',
    description: 'Increase brand awareness over the summer period.',
  },
];

const mockDashboardData = {
  totalClients: mockClients.length,
  activeCampaigns: mockCampaigns.filter(c => c.status === 'Active').length,
  upcomingTasks: 5,
  revenue: 28500,
  recentActivity: [
    { id: "1", description: "Called John Doe about new proposal", time: "2 hours ago" },
    { id: "2", description: "Email sent to Jane Smith for follow-up", time: "Yesterday" },
    { id: "3", description: "Meeting scheduled with Acme Corp", time: "3 days ago" },
  ],
};

// Define a type for recent activity items for clarity
interface ActivityItem {
  id: string;
  description: string;
  time: string;
}

export default function DashboardPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"clients" | "campaigns">("clients");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<typeof mockDashboardData | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);

  useEffect(() => {
    // Simulate API call
    setLoading(true);
    setError(null);
    setTimeout(() => {
      // In a real app, fetch from /api/dashboard
      setDashboardData(mockDashboardData);
      setClients(mockClients as Client[]);
      setCampaigns(mockCampaigns as Campaign[]);
      setLoading(false);
    }, 1000);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Filter clients or campaigns based on search term
    if (viewMode === "clients") {
      const filtered = mockClients.filter(
        client => 
          client.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          client.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
          client.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setClients(filtered as Client[]);
    } else {
      const filtered = mockCampaigns.filter(
        campaign => 
          campaign.campaignName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          campaign.client.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          campaign.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setCampaigns(filtered as Campaign[]);
    }
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setClients(mockClients as Client[]);
    setCampaigns(mockCampaigns as Campaign[]);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <div className="flex gap-2">
            <form onSubmit={handleSearch} className="flex items-center gap-2">
              <Input 
                type="search"
                placeholder={`Search ${viewMode}...`}
                className="w-full sm:w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Button type="submit" variant="outline" size="icon">
                <Search className="h-4 w-4" />
              </Button>
              {searchTerm && (
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm"
                  onClick={handleClearSearch}
                >
                  Clear
                </Button>
              )}
            </form>
            <Button 
              variant={viewMode === 'clients' ? 'default' : 'outline'}
              onClick={() => setViewMode('clients')}
            >
              Clients
            </Button>
            <Button 
              variant={viewMode === 'campaigns' ? 'default' : 'outline'}
              onClick={() => setViewMode('campaigns')}
            >
              Campaigns
            </Button>
          </div>
        </div>

        {loading && <p>Loading dashboard data...</p>}
        {error && <p className="text-red-500">Error loading data: {error}</p>}

        {dashboardData && !loading && !error && (
          <>
            {/* Widgets Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardData.totalClients}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    <Link href="/clients" className="inline-flex items-center hover:underline">
                      View all clients <ArrowRight className="ml-1 h-3 w-3" />
                    </Link>
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardData.activeCampaigns}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    <Link href="/campaigns" className="inline-flex items-center hover:underline">
                      View all campaigns <ArrowRight className="ml-1 h-3 w-3" />
                    </Link>
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Upcoming Tasks</CardTitle>
                  <ListChecks className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardData.upcomingTasks}</div>
                  <p className="text-xs text-muted-foreground mt-1">3 due today</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${dashboardData.revenue.toLocaleString()}</div>
                  <p className="text-xs text-green-600 mt-1">+8.2% from last month</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {/* Recent Activity Widget */}
              <Card className="md:col-span-1">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" /> 
                  </div>
                </CardHeader>
                <CardContent className="max-h-60 overflow-y-auto">
                  {dashboardData.recentActivity.length > 0 ? (
                    <ul className="space-y-3">
                      {dashboardData.recentActivity.map((activity: ActivityItem) => (
                        <li key={activity.id} className="text-sm border-b pb-2">
                          <p className="font-medium">{activity.description}</p>
                          <p className="text-xs text-muted-foreground">{activity.time}</p>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">No recent activity.</p>
                  )}
                </CardContent>
              </Card>

              {/* Calendar Events / Upcoming deadlines */}
              <Card className="md:col-span-2">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-sm font-medium">Upcoming Deadlines</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" /> 
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {campaigns
                      .filter(campaign => campaign.status === 'Active')
                      .slice(0, 3)
                      .map(campaign => (
                        <div key={campaign.id} className="border-b pb-2">
                          <Link href={`/campaigns/${campaign.id}`} className="hover:underline font-medium">
                            {campaign.campaignName}
                          </Link>
                          <div className="flex justify-between items-center mt-1">
                            <div className="text-xs">
                              Client: <span className="text-muted-foreground">{campaign.client.clientName}</span>
                            </div>
                            <div className="text-xs">
                              End date: <span className="text-muted-foreground">{format(new Date(campaign.endDate), 'MMM d, yyyy')}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Client/Campaign list based on viewMode */}
            <div className="mt-6">
              <h2 className="text-xl font-semibold mb-3">
                {viewMode === 'clients' ? 'Client Overview' : 'Campaign Overview'}
              </h2>
              <Card>
                <CardContent className="p-2 sm:p-6">
                  {viewMode === 'clients' ? (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Client Name</TableHead>
                            <TableHead>Company</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Last Interaction</TableHead>
                            <TableHead>Manager</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {clients.length > 0 ? (
                            clients.slice(0, 5).map((client) => (
                              <TableRow key={client.id}>
                                <TableCell className="font-medium">
                                  <Link href={`/clients/${client.id}`} className="hover:underline">
                                    {client.clientName}
                                  </Link>
                                </TableCell>
                                <TableCell>{client.company}</TableCell>
                                <TableCell>
                                  <Badge
                                    variant={
                                      client.status === 'Active' ? 'default' :
                                      client.status === 'Lead' ? 'outline' : 'secondary'
                                    }
                                  >
                                    {client.status}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  {client.lastInteraction ? format(new Date(client.lastInteraction), 'MMM d, yyyy') : 'N/A'}
                                </TableCell>
                                <TableCell>{client.assignedManager?.name || 'N/A'}</TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={5} className="text-center">No clients found</TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                      {clients.length > 5 && (
                        <div className="flex justify-center mt-4">
                          <Button asChild variant="outline" size="sm">
                            <Link href="/clients">View all clients</Link>
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Campaign Name</TableHead>
                            <TableHead>Client</TableHead>
                            <TableHead>Date Range</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Budget</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {campaigns.length > 0 ? (
                            campaigns.slice(0, 5).map((campaign) => (
                              <TableRow key={campaign.id}>
                                <TableCell className="font-medium">
                                  <Link href={`/campaigns/${campaign.id}`} className="hover:underline">
                                    {campaign.campaignName}
                                  </Link>
                                </TableCell>
                                <TableCell>{campaign.client.clientName}</TableCell>
                                <TableCell>
                                  {format(new Date(campaign.startDate), 'MMM d')} - {format(new Date(campaign.endDate), 'MMM d, yyyy')}
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    variant={
                                      campaign.status === 'Active' ? 'default' :
                                      campaign.status === 'Planning' ? 'outline' :
                                      campaign.status === 'Completed' ? 'secondary' : 'destructive'
                                    }
                                  >
                                    {campaign.status}
                                  </Badge>
                                </TableCell>
                                <TableCell>${campaign.budget.toLocaleString()}</TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={5} className="text-center">No campaigns found</TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                      {campaigns.length > 5 && (
                        <div className="flex justify-center mt-4">
                          <Button asChild variant="outline" size="sm">
                            <Link href="/campaigns">View all campaigns</Link>
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
} 