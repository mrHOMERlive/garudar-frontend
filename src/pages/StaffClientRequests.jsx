import React, { useState } from 'react';
import apiClient from '@/api/apiClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle
} from "@/components/ui/sheet";
import { ArrowLeft, Search, FileCheck, FileText, Shield, FileSignature, AlertCircle, CheckCircle, Clock, Globe } from 'lucide-react';

const BADGE_TYPES = [
  { value: 'kyc', label: 'KYC Verification', icon: FileCheck },
  { value: 'service_agreement', label: 'Service Agreement', icon: FileSignature }
];



export default function StaffClientRequests() {
  const [search, setSearch] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: () => apiClient.getAllClients(),
  });

  const filteredClients = clients.filter(c =>
    c.client_name?.toLowerCase().includes(search.toLowerCase()) ||
    c.client_id?.toLowerCase().includes(search.toLowerCase()) ||
    c.client_mail?.toLowerCase().includes(search.toLowerCase())
  );

  const openDrawer = (client) => {
    setSelectedClient(client);
    setDrawerOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-[#1e3a5f] border-b border-[#1e3a5f]/20 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to={createPageUrl('StaffDashboard')}>
                <Button variant="ghost" size="icon" className="text-white/80 hover:text-white hover:bg-white/10">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center p-2 shadow-lg">
                <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69233f5a9a123941f81322f5/b1a1be267_gan.png" alt="Logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-white">GTrans Staff</h1>
                  <span className="text-white/60">•</span>
                  <span className="text-white">Client Requests Management</span>
                </div>
                <Badge className="bg-[#f5a623] text-white">{clients.length} clients</Badge>
              </div>
            </div>
            <Link to={createPageUrl('GTrans')}>
              <Button className="bg-white text-[#1e3a5f] hover:bg-slate-100">
                <Globe className="w-4 h-4 mr-1" />
                Public Site
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
            <Input
              placeholder="Search clients..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-white border-slate-300"
            />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-200 bg-slate-50 hover:bg-slate-50">
                <TableHead className="text-[#1e3a5f] font-semibold">Client</TableHead>
                <TableHead className="text-[#1e3a5f] font-semibold">Email</TableHead>
                <TableHead className="text-[#1e3a5f] font-semibold">Active Badges</TableHead>
                <TableHead className="text-[#1e3a5f] font-semibold">Account Status</TableHead>
                <TableHead className="text-[#1e3a5f] font-semibold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-slate-500 py-8">No clients found</TableCell>
                </TableRow>
              ) : filteredClients.map((client) => {
                const isOnHold = client.account_status === 'hold';

                return (
                  <TableRow key={client.user_id} className="border-slate-200 hover:bg-slate-50">
                    <TableCell>
                      <div>
                        <div className="text-[#1e3a5f] font-medium">{client.client_name}</div>
                        <div className="text-slate-500 text-sm font-mono">{client.client_id}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-700">{client.client_mail}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-[#1e3a5f] text-[#1e3a5f]">
                        {client.active_badges_count || 0} active
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {isOnHold ? (
                        <Badge className="bg-red-100 text-red-800 border border-red-300">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          On Hold
                        </Badge>
                      ) : (
                        <Badge className="bg-emerald-100 text-emerald-800 border border-emerald-300">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Active
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        onClick={() => openDrawer(client)}
                        className="bg-[#1e3a5f] hover:bg-[#152a45] text-white"
                      >
                        Manage Badges
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </main>

      {/* Badge Management Drawer */}
      {selectedClient && (
        <ClientBadgeDrawer
          client={selectedClient}
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
        />
      )}
    </div>
  );
}

function ClientBadgeDrawer({ client, open, onClose }) {
  const [editedBadges, setEditedBadges] = useState({});
  const [accountStatus, setAccountStatus] = useState('active');
  const [holdReason, setHoldReason] = useState('');

  const queryClient = useQueryClient();

  // Fetch badges for this client
  const { data: badges = [] } = useQuery({
    queryKey: ['client-badges', client?.client_id],
    queryFn: () => apiClient.getClientBadges(client.client_id),
    enabled: !!client && open,
  });

  // Reset state when drawer opens with new client
  React.useEffect(() => {
    if (open && client) {
      setAccountStatus(client.account_status || 'active');
      setHoldReason(client.account_hold_reason || '');
      setEditedBadges({});
    }
  }, [open, client]);

  const updateClientMutation = useMutation({
    mutationFn: (data) => apiClient.updateClient(client.client_id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast.success('Account status updated');
    },
  });

  const saveBadgeMutation = useMutation({
    mutationFn: ({ badgeType, data }) => apiClient.updateClientBadge(client.client_id, badgeType, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-badges', client.client_id] });
      // Also invalidate clients list to update counts
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });

  const getBadgeData = (badgeType) => {
    const existing = badges.find(b => b.badge_type === badgeType);
    const edited = editedBadges[badgeType];
    return edited || existing || {
      client_id: client.client_id,
      badge_type: badgeType,
      is_active: false
    };
  };

  const updateBadge = (badgeType, updates) => {
    const existing = badges.find(b => b.badge_type === badgeType);
    const currentData = getBadgeData(badgeType);

    setEditedBadges({
      ...editedBadges,
      [badgeType]: {
        ...currentData,
        ...updates
      }
    });
  };

  const handleSaveAll = async () => {
    const promises = [];

    // Save account status if changed
    if (accountStatus !== client.account_status || holdReason !== client.account_hold_reason) {
      promises.push(updateClientMutation.mutateAsync({
        account_status: accountStatus,
        account_hold_reason: holdReason
      }));
    }

    // Save badges
    Object.entries(editedBadges).forEach(([badgeType, data]) => {
      // Clean up data for submission (remove unnecessary fields if needed, but API usually handles it)
      const payload = {
        is_active: data.is_active
      };

      promises.push(saveBadgeMutation.mutateAsync({ badgeType, data: payload }));
    });

    try {
      await Promise.all(promises);
      toast.success('All changes saved successfully');
      setEditedBadges({});
      onClose();
    } catch (error) {
      console.error(error);
      toast.error('Failed to save some changes');
    }
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto bg-white">
        <SheetHeader className="border-b border-slate-200 pb-4">
          <SheetTitle className="text-[#1e3a5f]">
            Manage Badges for {client.client_name}
          </SheetTitle>
          <p className="text-sm text-slate-500">{client.client_id}</p>
        </SheetHeader>

        <div className="space-y-4 py-6">
          {/* Account Status Section */}
          <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900">Account Status</h3>
              <Badge variant="outline" className={accountStatus === 'hold' ? 'border-red-300 bg-red-50 text-red-700' : 'border-emerald-300 bg-emerald-50 text-emerald-700'}>
                {accountStatus === 'hold' ? 'On Hold' : 'Active'}
              </Badge>
            </div>

            <div className="space-y-3">
              <Select value={accountStatus} onValueChange={setAccountStatus}>
                <SelectTrigger className="bg-white border-slate-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active - Can create orders</SelectItem>
                  <SelectItem value="hold">Hold - Cannot create orders</SelectItem>
                </SelectContent>
              </Select>

              {accountStatus === 'hold' && (
                <Textarea
                  value={holdReason}
                  onChange={(e) => setHoldReason(e.target.value)}
                  placeholder="Reason for hold..."
                  className="bg-white border-slate-300"
                  rows={2}
                />
              )}
            </div>
          </div>

          {/* Badges */}
          {BADGE_TYPES.map((badgeType) => {
            const badgeData = getBadgeData(badgeType.value);

            const Icon = badgeType.icon;

            return (
              <div key={badgeType.value} className="bg-white rounded-xl p-5 border border-slate-200 hover:border-slate-300 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${badgeData.is_active ? 'bg-[#1e3a5f]' : 'bg-slate-200'}`}>
                      <Icon className={`w-5 h-5 ${badgeData.is_active ? 'text-white' : 'text-slate-400'}`} />
                    </div>
                    <div>
                      <div className="font-medium text-slate-900">{badgeType.label}</div>
                      <div className="text-sm text-slate-500">
                        {badgeData.is_active ? 'Visible to client' : 'Hidden from client'}
                      </div>
                    </div>
                  </div>
                  <Switch
                    checked={badgeData.is_active}
                    onCheckedChange={(checked) => updateBadge(badgeType.value, { is_active: checked })}
                  />
                </div>


              </div>
            );
          })}
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
          <Button variant="outline" onClick={onClose} className="border-slate-300">
            Cancel
          </Button>
          <Button onClick={handleSaveAll} className="bg-[#1e3a5f] hover:bg-[#152a45]">
            Save All Changes
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}