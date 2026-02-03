import React, { useState } from 'react';
import { apiClient } from '@/api/apiClient';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Search, Eye, Loader2 } from 'lucide-react';
import StaffKYCDrawer from '../components/staff/StaffKYCDrawer';

export default function StaffKYCQueue() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedQueueItem, setSelectedQueueItem] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // 1. Fetch the Queue (Summary List)
  const { data: kycQueue = [], isLoading: isQueueLoading } = useQuery({
    queryKey: ['kycQueue'],
    queryFn: () => apiClient.getKycQueue(),
  });

  // 2. Fetch Full Details when an item is selected (for the Drawer)
  const { data: fullKycProfile, isLoading: isProfileLoading } = useQuery({
    queryKey: ['kycProfile', selectedQueueItem?.client_id],
    queryFn: () => apiClient.getKycProfile(selectedQueueItem.client_id),
    enabled: !!selectedQueueItem?.client_id,
  });

  const { data: fullClient, isLoading: isClientLoading } = useQuery({
    queryKey: ['client', selectedQueueItem?.client_id],
    queryFn: () => apiClient.getClientById(selectedQueueItem.client_id),
    enabled: !!selectedQueueItem?.client_id,
  });

  // Filter logic on the client side (search by company name or client name)
  const filteredQueue = kycQueue.filter(item => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      item.company_name?.toLowerCase().includes(searchLower) ||
      item.client_name?.toLowerCase().includes(searchLower) ||
      item.client_email?.toLowerCase().includes(searchLower)
    );
  });

  const handleViewKYC = (item) => {
    setSelectedQueueItem(item);
    setDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false);
    setSelectedQueueItem(null);
  };

  const statusColors = {
    submitted: 'bg-amber-100 text-amber-800',
    in_progress: 'bg-blue-100 text-blue-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    needs_fix: 'bg-orange-100 text-orange-800'
  };

  const formatStatus = (status) => {
    if (!status) return 'UNKNOWN';
    return status.replace(/_/g, ' ').toUpperCase();
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-[#1e3a5f] shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link to={createPageUrl('StaffDashboard')}>
            <Button variant="ghost" className="text-white hover:bg-white/10">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#1e3a5f] mb-2">KYC Review Queue</h1>
          <p className="text-slate-600">Review and process client KYC submissions</p>
        </div>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <Input
                placeholder="Search by company, client name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4">
          {isQueueLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-[#1e3a5f]" />
            </div>
          ) : filteredQueue.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-slate-500">
                No KYC submissions pending review matches your criteria.
              </CardContent>
            </Card>
          ) : (
            filteredQueue.map((item) => (
              <Card key={item.profile_id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">
                        {item.company_name || 'Company Name Not Provided'}
                      </CardTitle>
                      <div className="text-sm text-slate-600 space-y-1">
                        <div className="font-medium text-slate-800">{item.client_name || 'Unknown Client'}</div>
                        <div>Email: {item.client_email || 'N/A'}</div>
                        {item.submitted_at && (
                          <div>Submitted: {new Date(item.submitted_at).toLocaleDateString()} {new Date(item.submitted_at).toLocaleTimeString()}</div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={statusColors[item.status] || 'bg-gray-100 text-gray-800'}>
                        {formatStatus(item.status)}
                      </Badge>
                      <Button
                        onClick={() => handleViewKYC(item)}
                        className="bg-[#1e3a5f] hover:bg-[#152a45]"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Review
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Conditionally render the Drawer only if we have the necessary data loaded */}
      {selectedQueueItem && (
        <StaffKYCDrawer
          open={drawerOpen}
          onClose={handleDrawerClose}
          // Pass the FULL data fetched in this component.
          // If loading, you might want to show a loader or pass null/loading state, 
          // but usually it's better to wait or let the drawer handle partials.
          // Since we can't edit the drawer, we hope it handles updates gracefully 
          // or we can block rendering until data is ready locally if we want strictly specific behavior.
          // However, react-query caches, so subsequent opens are fast.
          kycProfile={fullKycProfile}
          client={fullClient}
          isLoading={isProfileLoading || isClientLoading}
        />
      )}
    </div>
  );
}