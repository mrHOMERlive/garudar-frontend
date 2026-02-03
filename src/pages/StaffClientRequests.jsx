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
  { value: 'kyc', label: 'KYC', icon: FileCheck, color: 'bg-blue-600' },
  { value: 'service_agreement', label: 'Service Agreement', icon: FileSignature, color: 'bg-indigo-600' },
  { value: 'platform_terms', label: 'Platform Terms & Conditions', icon: FileText, color: 'bg-purple-600' },
  { value: 'sla', label: 'Service Level Agreement (SLA)', icon: FileCheck, color: 'bg-emerald-600' },
  { value: 'dpa', label: 'Data Processing Agreement (DPA)', icon: FileText, color: 'bg-teal-600' },
  { value: 'aml_kyc_compliance', label: 'AML/KYC & Compliance Annex', icon: Shield, color: 'bg-cyan-600' },
  { value: 'other_signing', label: 'Other Request for Signing', icon: FileSignature, color: 'bg-orange-600' },
  { value: 'other_submit', label: 'Other Request to Submit', icon: FileText, color: 'bg-amber-600' }
];

const STATUS_CONFIG = {
  not_required: { label: 'Not Required', color: 'bg-slate-400', icon: null },
  pending: { label: 'Pending', color: 'bg-orange-500', icon: Clock },
  need_signing: { label: 'Need Signing', color: 'bg-red-600', icon: AlertCircle },
  submitted: { label: 'Submitted', color: 'bg-blue-600', icon: CheckCircle },
  completed: { label: 'Completed', color: 'bg-emerald-600', icon: CheckCircle }
};

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
                <TableHead className="text-[#1e3a5f] font-semibold">Need Attention</TableHead>
                <TableHead className="text-[#1e3a5f] font-semibold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-slate-500 py-8">No clients found</TableCell>
                </TableRow>
              ) : filteredClients.map((client) => {
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
                      {(client.attention_required_count || 0) > 0 ? (
                        <Badge className="bg-red-600 text-white">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          {client.attention_required_count}
                        </Badge>
                      ) : (
                        <span className="text-slate-400 text-sm">-</span>
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
      status: 'not_required',
      is_active: false,
      staff_comment: ''
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
        status: data.status,
        is_active: data.is_active,
        staff_comment: data.staff_comment
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

        <div className="space-y-6 py-6">
          {/* Account Status Section */}
          <div className="border-2 border-slate-300 rounded-lg p-4 bg-slate-50">
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 ${accountStatus === 'hold' ? 'bg-red-600' : 'bg-emerald-600'} rounded-lg flex items-center justify-center flex-shrink-0`}>
                {accountStatus === 'hold' ? (
                  <AlertCircle className="w-6 h-6 text-white" />
                ) : (
                  <CheckCircle className="w-6 h-6 text-white" />
                )}
              </div>
              <div className="flex-1 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-[#1e3a5f]">Account Status</h3>
                  <Badge className={accountStatus === 'hold' ? 'bg-red-600' : 'bg-emerald-600'}>
                    {accountStatus === 'hold' ? 'ON HOLD' : 'ACTIVE'}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm text-slate-700">Status</Label>
                  <Select value={accountStatus} onValueChange={setAccountStatus}>
                    <SelectTrigger className="bg-white border-slate-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active - Can create orders</SelectItem>
                      <SelectItem value="hold">Hold - Cannot create orders</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {accountStatus === 'hold' && (
                  <div className="space-y-2">
                    <Label className="text-sm text-slate-700">Hold Reason</Label>
                    <Textarea
                      value={holdReason}
                      onChange={(e) => setHoldReason(e.target.value)}
                      placeholder="Explain why the account is on hold..."
                      className="bg-white border-slate-300"
                      rows={2}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {BADGE_TYPES.map((badgeType) => {
            const badgeData = getBadgeData(badgeType.value);
            const statusConfig = STATUS_CONFIG[badgeData.status];
            const Icon = badgeType.icon;

            return (
              <div key={badgeType.value} className={`border rounded-lg p-4 ${badgeData.is_active && badgeData.status === 'need_signing' ? 'border-red-500 bg-red-50' : 'border-slate-200'}`}>
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 ${badgeType.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-[#1e3a5f]">{badgeType.label}</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-600">Active</span>
                        <Switch
                          checked={badgeData.is_active}
                          onCheckedChange={(checked) => updateBadge(badgeType.value, { is_active: checked })}
                        />
                      </div>
                    </div>

                    {badgeData.is_active && (
                      <>
                        <div className="space-y-2">
                          <Label className="text-sm text-slate-700">Status</Label>
                          <Select
                            value={badgeData.status}
                            onValueChange={(value) => updateBadge(badgeType.value, { status: value })}
                          >
                            <SelectTrigger className="bg-white border-slate-300">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                                <SelectItem key={key} value={key}>
                                  <div className="flex items-center gap-2">
                                    {config.icon && <config.icon className="w-3 h-3" />}
                                    {config.label}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm text-slate-700">Staff Comment</Label>
                          <Textarea
                            value={badgeData.staff_comment || ''}
                            onChange={(e) => updateBadge(badgeType.value, { staff_comment: e.target.value })}
                            placeholder="Add notes or instructions for the client..."
                            className="bg-white border-slate-300"
                            rows={2}
                          />
                        </div>
                      </>
                    )}
                  </div>
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