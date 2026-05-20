import React, { useMemo, useState } from 'react';
import { apiClient } from '@/api/apiClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ArrowLeft, FileText, Download, CheckCircle2, XCircle, Clock, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { t } from '@/components/utils/language';

/**
 * StaffNDA — Inbox для NDA-заявок (Staff/Admin).
 *
 * Видим только заявки в статусах SUBMITTED (требуют решения),
 * ACCEPTED/REJECTED (history), плюс опционально SIGNED_UPLOADED/GENERATED
 * для аудита in-flight. Фильтр по умолчанию = submitted (активная очередь).
 *
 * Drawer/dialog показывает все поля партнёра + ссылки на скачивание
 * generated/signed файлов + Accept/Reject. Reject требует comment.
 */

const STATUS_OPTIONS = [
  { value: 'submitted', label: 'Submitted' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'signed_uploaded', label: 'Signed Uploaded' },
  { value: 'generated', label: 'Generated' },
  { value: 'draft', label: 'Draft' },
];

function StatusBadge({ status }) {
  const map = {
    draft: { cls: 'bg-slate-200 text-slate-800', icon: FileText },
    generated: { cls: 'bg-blue-100 text-blue-800', icon: FileText },
    signed_uploaded: { cls: 'bg-indigo-100 text-indigo-800', icon: Upload },
    submitted: { cls: 'bg-amber-100 text-amber-900', icon: Clock },
    accepted: { cls: 'bg-emerald-100 text-emerald-900', icon: CheckCircle2 },
    rejected: { cls: 'bg-red-100 text-red-800', icon: XCircle },
  };
  const entry = map[status] || { cls: 'bg-slate-200 text-slate-800', icon: FileText };
  const Icon = entry.icon;
  return (
    <Badge className={`${entry.cls} text-xs px-2 py-1 inline-flex items-center gap-1`}>
      <Icon className="w-3.5 h-3.5" />
      {status || '—'}
    </Badge>
  );
}

export default function StaffNDA() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('submitted');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null); // NDARequestDto
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectComment, setRejectComment] = useState('');

  const { data: ndaList = [], isLoading } = useQuery({
    queryKey: ['staff-nda-list'],
    queryFn: async () => apiClient.getNdaRequests(),
  });

  const { data: clients = [] } = useQuery({
    queryKey: ['staff-nda-clients'],
    queryFn: async () => apiClient.getAllClients({ limit: 500 }).catch(() => []),
  });

  const clientNameById = useMemo(() => {
    const m = {};
    // `getAllClients` может вернуть и массив, и `{items: [...]}` —
    // нормализуем.
    const arr = Array.isArray(clients) ? clients : clients?.items || [];
    for (const c of arr) {
      m[c.client_id] = c.client_name || c.name || c.email || c.client_id;
    }
    return m;
  }, [clients]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (ndaList || []).filter((n) => {
      if (statusFilter && statusFilter !== 'all' && n.status !== statusFilter) return false;
      if (term) {
        const cname = (clientNameById[n.client_id] || n.client_id || '').toLowerCase();
        const pname = (n.partner_name_en || '').toLowerCase();
        if (!cname.includes(term) && !pname.includes(term)) return false;
      }
      return true;
    });
  }, [ndaList, statusFilter, search, clientNameById]);

  const { data: history } = useQuery({
    queryKey: ['nda-history', selected?.id],
    queryFn: async () => apiClient.getNdaHistory(selected.id),
    enabled: !!selected,
  });

  const acceptMutation = useMutation({
    mutationFn: async () => apiClient.ndaDecision(selected.id, 'accepted'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-nda-list'] });
      queryClient.invalidateQueries({ queryKey: ['nda-history'] });
      toast.success(t('ndaAcceptedToast'));
      setSelected(null);
    },
    onError: (e) => toast.error(`${e?.message || 'Accept failed'}`),
  });

  const rejectMutation = useMutation({
    mutationFn: async () => apiClient.ndaDecision(selected.id, 'rejected', rejectComment.trim()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-nda-list'] });
      queryClient.invalidateQueries({ queryKey: ['nda-history'] });
      toast.success(t('ndaRejectedToast'));
      setRejectOpen(false);
      setRejectComment('');
      setSelected(null);
    },
    onError: (e) => toast.error(`${e?.message || 'Reject failed'}`),
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-[#1e3a5f] shadow-lg" role="banner">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-4 md:py-6 flex items-center justify-between">
          <Link to={createPageUrl('StaffDashboard')}>
            <Button variant="ghost" className="text-white hover:bg-white/10 -ml-2 sm:ml-0">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('backToDashboard')}
            </Button>
          </Link>
          <div className="text-white text-sm sm:text-base font-medium">{t('ndaInboxTitle')}</div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-7 md:py-8">
        <div className="mb-5">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1e3a5f] mb-1">{t('ndaInboxTitle')}</h1>
          <p className="text-sm text-slate-600">{t('ndaInboxSubtitle')}</p>
        </div>

        <Card className="mb-5">
          <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
            <div>
              <Label className="text-xs text-slate-600">{t('ndaInboxFilterStatus')}</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {STATUS_OPTIONS.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="sm:col-span-2">
              <Label className="text-xs text-slate-600">{t('ndaInboxSearchClient')}</Label>
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('ndaInboxSearchClient')}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-lg">{filtered.length} NDA</CardTitle>
          </CardHeader>
          <CardContent className="p-0 sm:p-0">
            {isLoading ? (
              <div className="p-8 text-center text-slate-500">{t('loading')}</div>
            ) : filtered.length === 0 ? (
              <div className="p-8 text-center text-slate-500">{t('ndaInboxNoRecords')}</div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>{t('ndaInboxColClient')}</TableHead>
                      <TableHead>Partner</TableHead>
                      <TableHead>{t('ndaInboxColStatus')}</TableHead>
                      <TableHead>{t('ndaInboxColEffectiveDate')}</TableHead>
                      <TableHead>{t('ndaInboxColSubmittedAt')}</TableHead>
                      <TableHead>{t('ndaInboxColActions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((n) => (
                      <TableRow key={n.id}>
                        <TableCell className="font-mono text-xs">#{n.id}</TableCell>
                        <TableCell>{clientNameById[n.client_id] || n.client_id}</TableCell>
                        <TableCell className="max-w-[260px] truncate" title={n.partner_name_en || ''}>
                          {n.partner_name_en || '—'}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={n.status} />
                        </TableCell>
                        <TableCell>{n.effective_date || '—'}</TableCell>
                        <TableCell>{n.submitted_at ? new Date(n.submitted_at).toLocaleDateString() : '—'}</TableCell>
                        <TableCell>
                          <Button size="sm" variant="outline" onClick={() => setSelected(n)}>
                            {t('ndaInboxReview')}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Review dialog */}
      <Dialog
        open={!!selected}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              NDA #{selected?.id} — {clientNameById[selected?.client_id] || selected?.client_id}
            </DialogTitle>
            <DialogDescription className="flex items-center gap-2">
              <span>{t('ndaInboxColStatus')}:</span>
              <StatusBadge status={selected?.status} />
            </DialogDescription>
          </DialogHeader>

          {selected && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-slate-500">{t('effectiveDateLabel').replace(' *', '')}:</span>{' '}
                  {selected.effective_date || '—'}
                </div>
                <div>
                  <span className="text-slate-500">{t('partnerRegNumberLabel')}:</span> {selected.partner_inn || '—'}
                </div>
              </div>
              <div>
                <span className="text-slate-500">{t('partnerNameEnLabel')}:</span> {selected.partner_name_en || '—'}
              </div>
              <div>
                <span className="text-slate-500">{t('partnerCountryEn')}:</span> {selected.partner_country_en || '—'}
              </div>
              <div>
                <span className="text-slate-500">{t('partnerAddressEnLabel')}:</span>{' '}
                {selected.partner_address_en || '—'}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-slate-500">{t('partnerSignatoryEn')}:</span>{' '}
                  {selected.partner_signatory_en || '—'}
                </div>
                <div>
                  <span className="text-slate-500">{t('partnerSignatoryTitleEn')}:</span>{' '}
                  {selected.partner_signatory_title_en || '—'}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <span className="text-slate-500">{t('contactNameLabel')}:</span>{' '}
                  {selected.partner_contact_name || '—'}
                </div>
                <div>
                  <span className="text-slate-500">{t('contactEmailLabel')}:</span>{' '}
                  {selected.partner_contact_email || '—'}
                </div>
                <div>
                  <span className="text-slate-500">{t('contactPhoneLabel')}:</span>{' '}
                  {selected.partner_contact_phone || '—'}
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-2 border-t">
                {selected.generated_file_url && (
                  <a href={selected.generated_file_url} target="_blank" rel="noopener noreferrer">
                    <Button size="sm" variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      {t('ndaDownloadGenerated')}
                    </Button>
                  </a>
                )}
                {selected.signed_file_url && (
                  <a href={selected.signed_file_url} target="_blank" rel="noopener noreferrer">
                    <Button size="sm" variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      {t('ndaDownloadSigned')}
                    </Button>
                  </a>
                )}
              </div>

              {(history || []).length > 0 && (
                <div className="pt-2 border-t">
                  <div className="text-xs font-semibold text-slate-700 mb-1">History</div>
                  <ul className="text-xs text-slate-600 space-y-0.5">
                    {history.map((h) => (
                      <li key={h.id}>
                        <span className="text-slate-400">{h.changed_at?.slice(0, 19).replace('T', ' ')}</span>{' '}
                        <code className="font-mono">{h.old_status}</code> →{' '}
                        <code className="font-mono">{h.new_status}</code>
                        {h.comment && <span className="text-red-600"> — {h.comment}</span>}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="gap-2">
            {selected?.status === 'submitted' ? (
              <>
                <Button
                  variant="outline"
                  className="border-red-300 text-red-700 hover:bg-red-50"
                  onClick={() => setRejectOpen(true)}
                  disabled={rejectMutation.isPending}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  {t('ndaActionReject')}
                </Button>
                <Button
                  className="bg-emerald-600 hover:bg-emerald-700"
                  onClick={() => acceptMutation.mutate()}
                  disabled={acceptMutation.isPending}
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  {t('ndaActionAccept')}
                </Button>
              </>
            ) : (
              <Button variant="outline" onClick={() => setSelected(null)}>
                Close
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject dialog */}
      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t('ndaRejectDialogTitle')}</DialogTitle>
            <DialogDescription>{t('ndaRejectDialogDesc')}</DialogDescription>
          </DialogHeader>
          <Textarea
            value={rejectComment}
            onChange={(e) => setRejectComment(e.target.value)}
            placeholder={t('ndaRejectCommentLabel')}
            rows={4}
          />
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setRejectOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700"
              onClick={() => rejectMutation.mutate()}
              disabled={!rejectComment.trim() || rejectMutation.isPending}
            >
              {t('ndaConfirmReject')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
