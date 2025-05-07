"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Campaign, Client } from "@/types"; // Assuming User might be needed if we add more details
import { ArrowLeft, Edit3, Archive, Users, CalendarDays, DollarSign, ClipboardList, FileText } from 'lucide-react';
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import EditCampaignModal from "@/components/campaigns/EditCampaignModal";
import ConfirmationDialog from "@/components/common/ConfirmationDialog";
import { useToast } from "@/hooks/use-toast";

// Mock Data - Ideally, centralize this
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

export default function CampaignDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = params.campaignId as string;

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isArchiveConfirmOpen, setIsArchiveConfirmOpen] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (campaignId) {
      setLoading(true);
      setError(null);
      setTimeout(() => {
        const foundCampaign = mockCampaigns.find(c => c.id === campaignId);
        if (foundCampaign) {
          setCampaign(foundCampaign);
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

        {/* Placeholder for other sections like Tasks or KPIs */}
        {/* 
        <Card>
          <CardHeader><CardTitle>Key Performance Indicators</CardTitle></CardHeader>
          <CardContent><p>KPI data will be shown here...</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Associated Tasks</CardTitle></CardHeader>
          <CardContent><p>Tasks related to this campaign will be listed here...</p></CardContent>
        </Card>
        */}
      </div>
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
    </AppLayout>
  );
} 