import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { apiClient } from '@/api/apiClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ArrowLeft, Inbox, MessageSquare, UserPlus, Loader2 } from 'lucide-react';

import LanguageSwitcher from '@/components/common/LanguageSwitcher';
import { t } from '@/components/utils/language';

const STATUSES = ['new', 'in_progress', 'converted', 'rejected'];

const STATUS_BADGE_STYLE = {
  new: 'bg-amber-100 text-amber-800 border-amber-200',
  in_progress: 'bg-blue-100 text-blue-800 border-blue-200',
  converted: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  rejected: 'bg-slate-200 text-slate-700 border-slate-300',
};

const statusLabelKey = (s) => {
  switch (s) {
    case 'new':
      return 'leadStatusNew';
    case 'in_progress':
      return 'leadStatusInProgress';
    case 'converted':
      return 'leadStatusConverted';
    case 'rejected':
      return 'leadStatusRejected';
    default:
      return s;
  }
};

const formatDate = (iso) => {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    return d.toLocaleString();
  } catch {
    return iso;
  }
};

export default function StaffLeads() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('all');
  const [messageDialog, setMessageDialog] = useState({ open: false, lead: null });

  // Full list (no server-side filter — let the page handle filtering for
  // simpler stats and quick switching between tabs). Pagination is bounded
  // server-side at 500.
  const { data: leadList, isLoading } = useQuery({
    queryKey: ['leads'],
    queryFn: () => apiClient.getLeads({ limit: 500 }),
  });

  const leads = leadList?.items || [];

  const stats = {
    total: leads.length,
    new: leads.filter((l) => l.status === 'new').length,
    in_progress: leads.filter((l) => l.status === 'in_progress').length,
    converted: leads.filter((l) => l.status === 'converted').length,
    rejected: leads.filter((l) => l.status === 'rejected').length,
  };

  const filteredLeads = statusFilter === 'all' ? leads : leads.filter((l) => l.status === statusFilter);

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => apiClient.updateLead(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast.success(t('leadStatusUpdatedToast'));
    },
    onError: (err) => {
      toast.error(err?.message || t('leadStatusUpdateFailedToast'));
    },
  });

  const handleStatusChange = (lead, newStatus) => {
    if (newStatus === lead.status) return;
    updateStatusMutation.mutate({ id: lead.id, status: newStatus });
  };

  const handleConvert = (lead) => {
    // Navigate to StaffClients with a query param. StaffClients reads it,
    // prefills the Add-Client dialog and (on submit success) PATCHes the
    // lead status back to 'converted'.
    navigate(`${createPageUrl('StaffClients')}?prefill_from_lead=${lead.id}`);
  };

  const openMessage = (lead) => setMessageDialog({ open: true, lead });
  const closeMessage = () => setMessageDialog({ open: false, lead: null });

  const STAT_BUTTONS = [
    { key: 'all', label: t('leadsFilterAll'), count: stats.total },
    { key: 'new', label: t('leadsStatNew'), count: stats.new },
    { key: 'in_progress', label: t('leadsStatInProgress'), count: stats.in_progress },
    { key: 'converted', label: t('leadsStatConverted'), count: stats.converted },
    { key: 'rejected', label: t('leadsStatRejected'), count: stats.rejected },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-[#1e3a5f] shadow-lg border-b border-[#1e3a5f]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                to={createPageUrl('StaffDashboard')}
                className="inline-flex items-center text-white/80 hover:text-white text-sm"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t('leadsBackToDashboard')}
              </Link>
            </div>
            <LanguageSwitcher />
          </div>
          <div className="flex items-center gap-4 mt-4">
            <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center shadow-lg">
              <Inbox className="w-7 h-7 text-[#1e3a5f]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{t('leadsPageTitle')}</h1>
              <p className="text-slate-300 text-sm">{t('leadsPageSubtitle')}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Filter chips with embedded counts */}
        <div className="flex flex-wrap gap-2">
          {STAT_BUTTONS.map((btn) => {
            const isActive = statusFilter === btn.key;
            return (
              <button
                key={btn.key}
                type="button"
                onClick={() => setStatusFilter(btn.key)}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm border transition-colors ${
                  isActive
                    ? 'bg-[#1e3a5f] text-white border-[#1e3a5f]'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400'
                }`}
              >
                <span>{btn.label}</span>
                <span
                  className={`text-xs font-semibold rounded-full px-2 py-0.5 ${
                    isActive ? 'bg-white/20' : 'bg-slate-100'
                  }`}
                >
                  {btn.count}
                </span>
              </button>
            );
          })}
        </div>

        <Card className="border-slate-200">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-16 text-slate-500">
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                {t('loading')}
              </div>
            ) : filteredLeads.length === 0 ? (
              <div className="py-16 text-center text-slate-500">{t('leadsNoneFound')}</div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('leadsTableDate')}</TableHead>
                      <TableHead>{t('leadsTableCompany')}</TableHead>
                      <TableHead>{t('leadsTableCountry')}</TableHead>
                      <TableHead>{t('leadsTableContact')}</TableHead>
                      <TableHead>{t('leadsTableEmail')}</TableHead>
                      <TableHead>{t('leadsTablePhone')}</TableHead>
                      <TableHead>{t('leadsTableProducts')}</TableHead>
                      <TableHead>{t('leadsTableVolume')}</TableHead>
                      <TableHead>{t('leadsTableStatus')}</TableHead>
                      <TableHead className="text-right">{t('leadsTableActions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLeads.map((lead) => {
                      const isTerminal = lead.status === 'converted' || lead.status === 'rejected';
                      return (
                        <TableRow key={lead.id}>
                          <TableCell className="whitespace-nowrap text-xs text-slate-600">
                            {formatDate(lead.created_at)}
                          </TableCell>
                          <TableCell className="font-medium text-[#1e3a5f]">{lead.company_name}</TableCell>
                          <TableCell>{lead.country || '—'}</TableCell>
                          <TableCell>{lead.contact_person}</TableCell>
                          <TableCell className="text-xs">
                            <a href={`mailto:${lead.business_email}`} className="text-blue-600 hover:underline">
                              {lead.business_email}
                            </a>
                          </TableCell>
                          <TableCell className="text-xs">{lead.phone || '—'}</TableCell>
                          <TableCell className="text-xs">
                            {Array.isArray(lead.products_interested) && lead.products_interested.length > 0
                              ? lead.products_interested.join(', ')
                              : '—'}
                          </TableCell>
                          <TableCell className="text-xs">{lead.monthly_volume}</TableCell>
                          <TableCell>
                            <Select value={lead.status} onValueChange={(v) => handleStatusChange(lead, v)}>
                              <SelectTrigger
                                className={`h-8 w-[140px] border ${STATUS_BADGE_STYLE[lead.status] || ''}`}
                              >
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {STATUSES.map((s) => (
                                  <SelectItem key={s} value={s}>
                                    {t(statusLabelKey(s))}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {lead.converted_client_id && (
                              <div className="mt-1 text-[11px]">
                                <Link to={createPageUrl('StaffClients')} className="text-emerald-700 hover:underline">
                                  {t('leadsConvertedLinkLabel')} {lead.converted_client_id}
                                </Link>
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="inline-flex gap-2">
                              {lead.message && (
                                <Button variant="outline" size="sm" onClick={() => openMessage(lead)}>
                                  <MessageSquare className="w-3.5 h-3.5 mr-1" />
                                  {t('leadsViewMessageBtn')}
                                </Button>
                              )}
                              {!isTerminal && (
                                <Button
                                  size="sm"
                                  className="bg-[#1e3a5f] hover:bg-[#152a45] text-white"
                                  onClick={() => handleConvert(lead)}
                                >
                                  <UserPlus className="w-3.5 h-3.5 mr-1" />
                                  {t('leadsConvertBtn')}
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <Dialog open={messageDialog.open} onOpenChange={(open) => !open && closeMessage()}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t('leadsViewMessageTitle')}</DialogTitle>
          </DialogHeader>
          <div className="text-sm text-slate-700 whitespace-pre-wrap py-2">{messageDialog.lead?.message || '—'}</div>
          <div className="text-xs text-slate-500 border-t pt-2">
            {messageDialog.lead?.company_name} · {messageDialog.lead?.business_email}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeMessage}>
              {t('close')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
