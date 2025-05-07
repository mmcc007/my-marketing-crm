"use client";

import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Users, Briefcase, ListChecks, Activity } from "lucide-react";
import React, { useState, useEffect } from 'react';

// Mock data - replace with API calls later
const mockDashboardData = {
  totalClients: 125,
  activeCampaigns: 12,
  upcomingTasks: 5,
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

  useEffect(() => {
    // Simulate API call
    setLoading(true);
    setError(null);
    setTimeout(() => {
      // In a real app, fetch from /api/dashboard
      setDashboardData(mockDashboardData);
      setLoading(false);
    }, 1000);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement search logic later
    console.log("Searching for:", searchTerm);
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
                  {/* <p className="text-xs text-muted-foreground">+20.1% from last month</p> */}
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardData.activeCampaigns}</div>
                  {/* <p className="text-xs text-muted-foreground">+15 since last week</p> */}
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Upcoming Tasks</CardTitle>
                  <ListChecks className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardData.upcomingTasks}</div>
                  {/* <p className="text-xs text-muted-foreground">3 due today</p> */}
                </CardContent>
              </Card>
              {/* Recent Activity Widget - can be made more complex */}
              <Card className="md:col-span-2 lg:col-span-1">
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground float-right" /> 
                </CardHeader>
                <CardContent className="max-h-60 overflow-y-auto">
                  {dashboardData.recentActivity.length > 0 ? (
                    <ul className="space-y-2">
                      {dashboardData.recentActivity.map((activity: ActivityItem) => (
                        <li key={activity.id} className="text-xs">
                          <p className="font-medium">{activity.description}</p>
                          <p className="text-muted-foreground">{activity.time}</p>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">No recent activity.</p>
                  )}
                </CardContent>
              </Card>
            </div>
            
            {/* Placeholder for Client/Campaign list based on viewMode */}
            <div className="mt-6">
              <h2 className="text-xl font-semibold mb-3">
                {viewMode === 'clients' ? 'Client Overview' : 'Campaign Overview'}
              </h2>
              <Card>
                <CardContent className="p-6">
                  <p>Data for {viewMode} will be displayed here. (TODO: Implement table/list)</p>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
} 