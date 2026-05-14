import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { apiClient } from '@/api/apiClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ArrowLeft, Globe, ChevronLeft, ChevronRight, Search, UserPlus, Loader2 } from 'lucide-react';

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

const formatShortDate = (iso) => {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
    });
  } catch {
    return iso;
  }
};

const formatFullDate = (iso) => {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
};

export default function StaffLeads() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [detailsLead, setDetailsLead] = useState(null);

  const { data: leadList, isLoading } = useQuery({
    queryKey: ['leads'],
    queryFn: () => apiClient.getLeads({ limit: 500 }),
  });

  // Stable reference so dependent useMemos don't invalidate every render
  // when leadList?.items is undefined.
  const leads = useMemo(() => leadList?.items ?? [], [leadList]);

  const stats = useMemo(
    () => ({
      total: leads.length,
      new: leads.filter((l) => l.status === 'new').length,
      in_progress: leads.filter((l) => l.status === 'in_progress').length,
      converted: leads.filter((l) => l.status === 'converted').length,
      rejected: leads.filter((l) => l.status === 'rejected').length,
    }),
    [leads]
  );

  const filteredLeads = useMemo(() => {
    let rows = statusFilter === 'all' ? leads : leads.filter((l) => l.status === statusFilter);
    const q = search.trim().toLowerCase();
    if (q) {
      rows = rows.filter(
        (l) =>
          l.company_name?.toLowerCase().includes(q) ||
          l.business_email?.toLowerCase().includes(q) ||
          l.contact_person?.toLowerCase().includes(q) ||
          l.country?.toLowerCase().includes(q)
      );
    }
    return rows;
  }, [leads, statusFilter, search]);

  const totalPages = Math.max(1, Math.ceil(filteredLeads.length / itemsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * itemsPerPage;
  const paginatedLeads = filteredLeads.slice(startIndex, startIndex + itemsPerPage);

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
    navigate(`${createPageUrl('StaffClients')}?prefill_from_lead=${lead.id}`);
  };

  const STAT_BUTTONS = [
    { key: 'all', label: t('leadsFilterAll'), count: stats.total },
    { key: 'new', label: t('leadsStatNew'), count: stats.new },
    { key: 'in_progress', label: t('leadsStatInProgress'), count: stats.in_progress },
    { key: 'converted', label: t('leadsStatConverted'), count: stats.converted },
    { key: 'rejected', label: t('leadsStatRejected'), count: stats.rejected },
  ];

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
                <img src="/gan.png" alt="Logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-white">GTrans Staff</h1>
                  <span className="text-white/60">•</span>
                  <span className="text-white">{t('leadsPageTitle')}</span>
                </div>
                <Badge className="bg-[#f5a623] text-white">
                  {stats.total} {t('leadsPageTitle')}
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <LanguageSwitcher />
              <Link to={createPageUrl('GTrans')}>
                <Button variant="outline" size="sm" className="bg-white text-[#1e3a5f] hover:bg-slate-100">
                  <Globe className="w-4 h-4 mr-1" />
                  {t('publicSite')}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Filter chips */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {STAT_BUTTONS.map((btn) => {
            const isActive = statusFilter === btn.key;
            return (
              <button
                key={btn.key}
                type="button"
                onClick={() => {
                  setStatusFilter(btn.key);
                  setCurrentPage(1);
                }}
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

        {/* Search */}
        <div className="mb-4">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
            <Input
              placeholder={t('leadsSearchPlaceholder')}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-9 bg-white border-slate-300 text-slate-800 placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
          <Table className="table-fixed w-full">
            <TableHeader>
              <TableRow className="border-slate-200 bg-slate-50 hover:bg-slate-50">
                <TableHead className="text-[#1e3a5f] font-semibold w-28">{t('leadsTableDate')}</TableHead>
                <TableHead className="text-[#1e3a5f] font-semibold">{t('leadsTableCompany')}</TableHead>
                <TableHead className="text-[#1e3a5f] font-semibold w-32">{t('leadsTableCountry')}</TableHead>
                <TableHead className="text-[#1e3a5f] font-semibold w-56">{t('leadsTableEmail')}</TableHead>
                <TableHead className="text-[#1e3a5f] font-semibold w-44">{t('leadsTableStatus')}</TableHead>
                <TableHead className="text-[#1e3a5f] font-semibold w-36 text-right">{t('leadsTableActions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-slate-500 py-8">
                    <span className="inline-flex items-center">
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {t('loading')}
                    </span>
                  </TableCell>
                </TableRow>
              ) : paginatedLeads.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-slate-500 py-8">
                    {t('leadsNoneFound')}
                  </TableCell>
                </TableRow>
              ) : (
                paginatedLeads.map((lead) => {
                  const isTerminal = lead.status === 'converted' || lead.status === 'rejected';
                  const stop = (e) => e.stopPropagation();
                  return (
                    <TableRow
                      key={lead.id}
                      className="border-slate-200 hover:bg-slate-100 cursor-pointer"
                      onClick={() => setDetailsLead(lead)}
                    >
                      <TableCell className="text-slate-600 text-xs whitespace-nowrap">
                        {formatShortDate(lead.created_at)}
                      </TableCell>
                      <TableCell className="text-[#1e3a5f] font-medium overflow-hidden">
                        <div className="truncate" title={lead.company_name}>
                          {lead.company_name}
                        </div>
                        {lead.contact_person && (
                          <div className="text-slate-500 text-xs truncate" title={lead.contact_person}>
                            {lead.contact_person}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-slate-700 text-sm truncate" title={lead.country || ''}>
                        {lead.country || '—'}
                      </TableCell>
                      <TableCell className="text-slate-700 text-sm overflow-hidden">
                        <a
                          href={`mailto:${lead.business_email}`}
                          className="text-blue-600 hover:underline truncate block"
                          title={lead.business_email}
                          onClick={stop}
                        >
                          {lead.business_email}
                        </a>
                      </TableCell>
                      <TableCell onClick={stop}>
                        <Select value={lead.status} onValueChange={(v) => handleStatusChange(lead, v)}>
                          <SelectTrigger className={`h-8 w-full border ${STATUS_BADGE_STYLE[lead.status] || ''}`}>
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
                          <Link
                            to={createPageUrl('StaffClients')}
                            onClick={stop}
                            className="text-emerald-700 hover:underline text-[11px] mt-1 block truncate"
                            title={`${t('leadsConvertedLinkLabel')} ${lead.converted_client_id}`}
                          >
                            {t('leadsConvertedLinkLabel')} {lead.converted_client_id}
                          </Link>
                        )}
                      </TableCell>
                      <TableCell className="text-right" onClick={stop}>
                        {isTerminal ? (
                          <span className="text-slate-400 text-sm">—</span>
                        ) : (
                          <Button
                            size="sm"
                            className="bg-[#1e3a5f] hover:bg-[#152a45] text-white h-8"
                            onClick={() => handleConvert(lead)}
                          >
                            <UserPlus className="w-3.5 h-3.5 mr-1" />
                            {t('leadsConvertBtn')}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-600">{t('showLabel')}</span>
            <Select
              value={itemsPerPage.toString()}
              onValueChange={(value) => {
                setItemsPerPage(Number(value));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-20 bg-white border-slate-300 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-slate-600">
              {filteredLeads.length === 0
                ? '0 of 0'
                : `${startIndex + 1}-${Math.min(startIndex + itemsPerPage, filteredLeads.length)} of ${filteredLeads.length}`}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, safePage - 1))}
              disabled={safePage <= 1}
              className="border-slate-300"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm text-slate-600">
              {t('pageLabel')} {safePage} {t('ofLabel')} {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.min(totalPages, safePage + 1))}
              disabled={safePage >= totalPages}
              className="border-slate-300"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </main>

      {/* Details Dialog — opens on row click */}
      <Dialog open={!!detailsLead} onOpenChange={(open) => !open && setDetailsLead(null)}>
        <DialogContent className="bg-white border-slate-200 text-slate-800 max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[#1e3a5f]">{t('leadsDetailsTitle')}</DialogTitle>
          </DialogHeader>
          {detailsLead && (
            <div className="space-y-4 py-2 text-sm">
              <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                <Field label={t('leadsTableDate')} value={formatFullDate(detailsLead.created_at)} />
                <Field label={t('leadsTableStatus')} value={t(statusLabelKey(detailsLead.status))} />
                <Field label={t('leadsTableCompany')} value={detailsLead.company_name} />
                <Field label={t('leadsTableContact')} value={detailsLead.contact_person} />
                <Field label={t('leadsTableEmail')} value={detailsLead.business_email} />
                <Field label={t('leadsTablePhone')} value={detailsLead.phone || '—'} />
                <Field label={t('leadsTableCountry')} value={detailsLead.country || '—'} />
                <Field label={t('leadsTableVolume')} value={detailsLead.monthly_volume} />
                <Field
                  label={t('leadsTableProducts')}
                  value={
                    Array.isArray(detailsLead.products_interested) && detailsLead.products_interested.length > 0
                      ? detailsLead.products_interested.join(', ')
                      : '—'
                  }
                  full
                />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                  {t('leadsViewMessageTitle')}
                </div>
                <div className="text-slate-700 whitespace-pre-wrap bg-slate-50 border border-slate-200 rounded-md p-3 max-h-48 overflow-y-auto">
                  {detailsLead.message || '—'}
                </div>
              </div>
              {detailsLead.converted_client_id && (
                <div className="border-t border-slate-200 pt-3 text-sm">
                  <span className="text-slate-500">{t('leadsConvertedLinkLabel')} </span>
                  <Link
                    to={createPageUrl('StaffClients')}
                    onClick={() => setDetailsLead(null)}
                    className="text-emerald-700 hover:underline font-medium"
                  >
                    {detailsLead.converted_client_id}
                  </Link>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailsLead(null)}>
              {t('close')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/** Small two-row label/value pair used inside the details dialog grid. */
function Field({ label, value, full }) {
  return (
    <div className={full ? 'col-span-2' : ''}>
      <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</div>
      <div className="text-slate-800 break-words">{value || '—'}</div>
    </div>
  );
}
