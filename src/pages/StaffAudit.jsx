/**
 * Staff Audit Log Viewer (ТЗ §4.12).
 *
 * Показывает события из `audit_log` с серверной пагинацией и фильтрами:
 * - entity (clients/orders/payeer_accounts/...)
 * - action (CREATE/UPDATE/KYC_SUBMITTED/...)
 * - created_by (точное имя пользователя)
 * - since / until (диапазон дат)
 * - q (free-text поиск по entity_id + created_by)
 *
 * Row-click открывает Dialog с pretty-printed old_value/new_value
 * (распарсенные JSON из бэка). Кнопка Export CSV скачивает текущий
 * фильтр через `apiClient.downloadAuditCsv`.
 *
 * Доступ — только admin (бэкенд проверяет через require_admin).
 */
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { apiClient } from '@/api/apiClient';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ArrowLeft, ChevronLeft, ChevronRight, Search, Loader2, Download, ScrollText, Globe } from 'lucide-react';

import LanguageSwitcher from '@/components/common/LanguageSwitcher';
import { t } from '@/components/utils/language';

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

// Pretty palette по entity — чтобы быстро глазами различать типы событий.
const ENTITY_BADGE_STYLE = {
  clients: 'bg-blue-100 text-blue-800 border-blue-200',
  customer_reports: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  transaction_reports: 'bg-purple-100 text-purple-800 border-purple-200',
  payeer_accounts: 'bg-amber-100 text-amber-800 border-amber-200',
  order_documents: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  executed_orders: 'bg-teal-100 text-teal-800 border-teal-200',
  order_pobo_terms: 'bg-cyan-100 text-cyan-800 border-cyan-200',
  orders_pobo: 'bg-cyan-100 text-cyan-800 border-cyan-200',
};

const ACTION_BADGE_STYLE = {
  CREATE: 'bg-emerald-600 text-white',
  INSERT: 'bg-emerald-600 text-white',
  UPDATE: 'bg-blue-600 text-white',
  REPLACE: 'bg-blue-600 text-white',
  DELETE: 'bg-red-600 text-white',
  UPLOAD: 'bg-indigo-600 text-white',
  KYC_SUBMITTED: 'bg-amber-500 text-white',
  KYC_DECISION_APPROVED: 'bg-emerald-700 text-white',
  KYC_DECISION_REJECTED: 'bg-red-700 text-white',
  KYC_OVERRIDE_TOGGLE: 'bg-orange-500 text-white',
  KYC_GATE_DENIED: 'bg-rose-500 text-white',
  ACCOUNT_HOLD_DENIED: 'bg-rose-600 text-white',
  BANK_OVERRIDE_USED: 'bg-purple-600 text-white',
};

const formatDateTime = (iso) => {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
};

/** Преобразует datetime-local строку из <input> в ISO без TZ-сдвига для query. */
const toIso = (dtLocal) => {
  if (!dtLocal) return '';
  // datetime-local даёт "2026-05-15T10:30" — добавим секунды + Z, чтобы
  // backend распарсил как UTC. Точность 1-минутная — достаточно для аудита.
  return `${dtLocal}:00Z`;
};

export default function StaffAudit() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [entity, setEntity] = useState('all');
  const [action, setAction] = useState('all');
  const [createdBy, setCreatedBy] = useState('all');
  const [since, setSince] = useState('');
  const [until, setUntil] = useState('');
  const [search, setSearch] = useState('');
  // searchDebounced — поскольку backend получает q через URL, без
  // debounce каждое нажатие клавиши делает запрос. 350ms — стандарт.
  const [searchDebounced, setSearchDebounced] = useState('');
  const [detailId, setDetailId] = useState(null);

  // debounce search → searchDebounced
  useMemo(() => {
    const id = setTimeout(() => setSearchDebounced(search.trim()), 350);
    return () => clearTimeout(id);
  }, [search]);

  // Параметры запроса. all → не передаём (бэкенд не фильтрует).
  const queryParams = useMemo(
    () => ({
      entity: entity === 'all' ? undefined : entity,
      action: action === 'all' ? undefined : action,
      created_by: createdBy === 'all' ? undefined : createdBy,
      since: toIso(since) || undefined,
      until: toIso(until) || undefined,
      q: searchDebounced || undefined,
      limit: pageSize,
      offset: (page - 1) * pageSize,
    }),
    [entity, action, createdBy, since, until, searchDebounced, page, pageSize]
  );

  const {
    data: pageData,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ['audit', queryParams],
    queryFn: () => apiClient.getAuditLog(queryParams),
    placeholderData: (prev) => prev, // плавная пагинация, не "мигает"
  });

  const { data: distinct } = useQuery({
    queryKey: ['audit-distinct-values'],
    queryFn: () => apiClient.getAuditDistinctValues(),
    staleTime: 60 * 1000, // distinct-список не меняется часто
  });

  const { data: detail } = useQuery({
    queryKey: ['audit-detail', detailId],
    queryFn: () => apiClient.getAuditLogDetail(detailId),
    enabled: !!detailId,
  });

  const items = pageData?.items ?? [];
  const total = pageData?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const resetFilters = () => {
    setEntity('all');
    setAction('all');
    setCreatedBy('all');
    setSince('');
    setUntil('');
    setSearch('');
    setSearchDebounced('');
    setPage(1);
  };

  const handleExport = async () => {
    try {
      // Передаём текущий фильтр БЕЗ limit/offset — экспорт цельный.
      const { limit, offset, ...filterOnly } = queryParams;
      void limit;
      void offset;
      await apiClient.downloadAuditCsv(filterOnly);
      toast.success(t('auditExportStarted'));
    } catch (e) {
      toast.error(e.message || 'Export failed');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
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
                  <span className="text-white">{t('auditPageTitle')}</span>
                </div>
                <Badge className="bg-[#f5a623] text-white">
                  {total} {t('auditEventsLabel')}
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
        {/* Filter row 1: entity / action / user */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
          <div>
            <label className="text-xs text-slate-500 block mb-1">{t('auditFilterEntity')}</label>
            <Select
              value={entity}
              onValueChange={(v) => {
                setEntity(v);
                setPage(1);
              }}
            >
              <SelectTrigger className="bg-white border-slate-300 h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('auditFilterAll')}</SelectItem>
                {distinct?.entities?.map((e) => (
                  <SelectItem key={e} value={e}>
                    {e}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs text-slate-500 block mb-1">{t('auditFilterAction')}</label>
            <Select
              value={action}
              onValueChange={(v) => {
                setAction(v);
                setPage(1);
              }}
            >
              <SelectTrigger className="bg-white border-slate-300 h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('auditFilterAll')}</SelectItem>
                {distinct?.actions?.map((a) => (
                  <SelectItem key={a} value={a}>
                    {a}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs text-slate-500 block mb-1">{t('auditFilterUser')}</label>
            <Select
              value={createdBy}
              onValueChange={(v) => {
                setCreatedBy(v);
                setPage(1);
              }}
            >
              <SelectTrigger className="bg-white border-slate-300 h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('auditFilterAll')}</SelectItem>
                {distinct?.users?.map((u) => (
                  <SelectItem key={u} value={u}>
                    {u}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end gap-2">
            <Button variant="outline" size="sm" onClick={resetFilters} className="h-9 border-slate-300 flex-1">
              {t('auditResetFilters')}
            </Button>
            <Button
              size="sm"
              onClick={handleExport}
              className="h-9 bg-[#1e3a5f] hover:bg-[#152a45] text-white"
              data-testid="audit-export-csv"
            >
              <Download className="w-4 h-4 mr-1" />
              {t('auditExportCsv')}
            </Button>
          </div>
        </div>

        {/* Filter row 2: date range + search */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          <div>
            <label className="text-xs text-slate-500 block mb-1">{t('auditFilterSince')}</label>
            <Input
              type="datetime-local"
              value={since}
              onChange={(e) => {
                setSince(e.target.value);
                setPage(1);
              }}
              className="bg-white border-slate-300 h-9"
            />
          </div>
          <div>
            <label className="text-xs text-slate-500 block mb-1">{t('auditFilterUntil')}</label>
            <Input
              type="datetime-local"
              value={until}
              onChange={(e) => {
                setUntil(e.target.value);
                setPage(1);
              }}
              className="bg-white border-slate-300 h-9"
            />
          </div>
          <div>
            <label className="text-xs text-slate-500 block mb-1">{t('auditFilterSearch')}</label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
              <Input
                placeholder={t('auditSearchPlaceholder')}
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-9 bg-white border-slate-300 h-9"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
          <Table className="table-fixed w-full">
            <TableHeader>
              <TableRow className="border-slate-200 bg-slate-50 hover:bg-slate-50">
                <TableHead className="text-[#1e3a5f] font-semibold w-44">{t('auditTableDate')}</TableHead>
                <TableHead className="text-[#1e3a5f] font-semibold w-36">{t('auditTableUser')}</TableHead>
                <TableHead className="text-[#1e3a5f] font-semibold w-44">{t('auditTableEntity')}</TableHead>
                <TableHead className="text-[#1e3a5f] font-semibold">{t('auditTableEntityId')}</TableHead>
                <TableHead className="text-[#1e3a5f] font-semibold w-48">{t('auditTableAction')}</TableHead>
                <TableHead className="text-[#1e3a5f] font-semibold w-20 text-right">{t('auditTableHas')}</TableHead>
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
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-slate-500 py-8">
                    {t('auditNoRecords')}
                  </TableCell>
                </TableRow>
              ) : (
                items.map((row) => (
                  <TableRow
                    key={row.id}
                    className="border-slate-200 hover:bg-slate-100 cursor-pointer"
                    onClick={() => setDetailId(row.id)}
                    data-testid={`audit-row-${row.id}`}
                  >
                    <TableCell className="text-slate-600 text-xs whitespace-nowrap">
                      {formatDateTime(row.created_at)}
                    </TableCell>
                    <TableCell className="text-slate-700 text-sm truncate" title={row.created_by || ''}>
                      {row.created_by || '—'}
                    </TableCell>
                    <TableCell>
                      {row.entity ? (
                        <Badge
                          variant="outline"
                          className={`text-xs ${ENTITY_BADGE_STYLE[row.entity] || 'bg-slate-100 text-slate-700 border-slate-200'}`}
                        >
                          {row.entity}
                        </Badge>
                      ) : (
                        <span className="text-slate-400 text-sm">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-slate-700 text-sm font-mono truncate" title={row.entity_id || ''}>
                      {row.entity_id || '—'}
                    </TableCell>
                    <TableCell>
                      {row.action ? (
                        <Badge className={`text-xs ${ACTION_BADGE_STYLE[row.action] || 'bg-slate-500 text-white'}`}>
                          {row.action}
                        </Badge>
                      ) : (
                        <span className="text-slate-400 text-sm">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="text-xs text-slate-400">
                        {row.has_old_value && row.has_new_value
                          ? '↹'
                          : row.has_new_value
                            ? '＋'
                            : row.has_old_value
                              ? '−'
                              : ''}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-600">{t('showLabel')}</span>
            <Select
              value={pageSize.toString()}
              onValueChange={(v) => {
                setPageSize(Number(v));
                setPage(1);
              }}
            >
              <SelectTrigger className="w-20 bg-white border-slate-300 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAGE_SIZE_OPTIONS.map((n) => (
                  <SelectItem key={n} value={n.toString()}>
                    {n}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-sm text-slate-600">
              {total === 0 ? '0 of 0' : `${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, total)} of ${total}`}
              {isFetching && !isLoading && (
                <Loader2 className="inline-block w-3 h-3 ml-1.5 animate-spin text-slate-400" />
              )}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page <= 1}
              className="border-slate-300"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm text-slate-600">
              {t('pageLabel')} {page} {t('ofLabel')} {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page >= totalPages}
              className="border-slate-300"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </main>

      {/* Details Dialog — pretty-printed JSON old/new */}
      <Dialog open={!!detailId} onOpenChange={(open) => !open && setDetailId(null)}>
        <DialogContent
          className="bg-white border-slate-200 text-slate-800 max-w-3xl max-h-[90vh] overflow-y-auto"
          data-testid="audit-detail-dialog"
        >
          <DialogHeader>
            <DialogTitle className="text-[#1e3a5f] flex items-center gap-2">
              <ScrollText className="w-5 h-5" /> {t('auditDetailsTitle')}
            </DialogTitle>
          </DialogHeader>
          {!detail ? (
            <div className="flex items-center justify-center py-8 text-slate-500">
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {t('loading')}
            </div>
          ) : (
            <div className="space-y-4 py-2 text-sm">
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <div className="text-slate-500 mb-0.5">{t('auditTableDate')}</div>
                  <div className="text-slate-800 font-mono">{formatDateTime(detail.created_at)}</div>
                </div>
                <div>
                  <div className="text-slate-500 mb-0.5">{t('auditTableUser')}</div>
                  <div className="text-slate-800 font-mono">{detail.created_by || '—'}</div>
                </div>
                <div>
                  <div className="text-slate-500 mb-0.5">{t('auditTableEntity')}</div>
                  <div>
                    <Badge variant="outline" className={ENTITY_BADGE_STYLE[detail.entity] || ''}>
                      {detail.entity || '—'}
                    </Badge>
                    <span className="ml-2 font-mono text-slate-700">{detail.entity_id || '—'}</span>
                  </div>
                </div>
                <div>
                  <div className="text-slate-500 mb-0.5">{t('auditTableAction')}</div>
                  <Badge className={ACTION_BADGE_STYLE[detail.action] || 'bg-slate-500 text-white'}>
                    {detail.action || '—'}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <div className="text-xs text-slate-500 mb-1">{t('auditOldValue')}</div>
                  {detail.old_value ? (
                    <pre className="text-[11px] bg-slate-900 text-slate-200 p-3 rounded overflow-x-auto max-h-72">
                      {JSON.stringify(detail.old_value, null, 2)}
                    </pre>
                  ) : (
                    <div className="text-slate-400 text-sm italic">—</div>
                  )}
                </div>
                <div>
                  <div className="text-xs text-slate-500 mb-1">{t('auditNewValue')}</div>
                  {detail.new_value ? (
                    <pre className="text-[11px] bg-slate-900 text-slate-200 p-3 rounded overflow-x-auto max-h-72">
                      {JSON.stringify(detail.new_value, null, 2)}
                    </pre>
                  ) : (
                    <div className="text-slate-400 text-sm italic">—</div>
                  )}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailId(null)}>
              {t('closeBtn') || 'Close'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
