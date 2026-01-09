import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Search, Eye } from 'lucide-react';
import StaffKYCDrawer from '../components/staff/StaffKYCDrawer';

export default function StaffKYCQueue() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedKYC, setSelectedKYC] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { data: kycProfiles = [] } = useQuery({
    queryKey: ['kycQueue'],
    queryFn: async () => {
      const profiles = await base44.entities.OnboardingKYC.list('-updated_date');
      return profiles.filter(p => ['submitted', 'in_progress'].includes(p.status));
    }
  });

  const { data: clients = [] } = useQuery({
    queryKey: ['allClients'],
    queryFn: () => base44.entities.Client.list()
  });

  const filteredProfiles = kycProfiles.filter(profile => {
    const client = clients.find(c => c.id === profile.client_id);
    if (!searchTerm) return true;
    return (
      profile.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handleViewKYC = (profile) => {
    setSelectedKYC(profile);
    setDrawerOpen(true);
  };

  const statusColors = {
    submitted: 'bg-amber-100 text-amber-800',
    in_progress: 'bg-blue-100 text-blue-800'
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
                placeholder="Search by company or client name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4">
          {filteredProfiles.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-slate-500">
                No KYC submissions pending review
              </CardContent>
            </Card>
          ) : (
            filteredProfiles.map((profile) => {
              const client = clients.find(c => c.id === profile.client_id);
              return (
                <Card key={profile.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-2">
                          {profile.company_name || 'Company Name Not Provided'}
                        </CardTitle>
                        <div className="text-sm text-slate-600 space-y-1">
                          <div>Client: {client?.name || 'Unknown'}</div>
                          <div>Email: {client?.email || 'N/A'}</div>
                          {profile.submitted_at && (
                            <div>Submitted: {new Date(profile.submitted_at).toLocaleDateString()}</div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={statusColors[profile.status]}>
                          {profile.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                        <Button
                          onClick={() => handleViewKYC(profile)}
                          className="bg-[#1e3a5f] hover:bg-[#152a45]"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Review
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              );
            })
          )}
        </div>
      </div>

      {selectedKYC && (
        <StaffKYCDrawer
          open={drawerOpen}
          onClose={() => {
            setDrawerOpen(false);
            setSelectedKYC(null);
          }}
          kycProfile={selectedKYC}
          client={clients.find(c => c.id === selectedKYC.client_id)}
        />
      )}
    </div>
  );
}