import React, { useState, useMemo } from 'react';
import { apiClient } from '@/api/apiClient';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Plus, Download, ChevronUp, ChevronDown, Search, Edit2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import TransactionFormModal from '@/components/reports/TransactionFormModal';
import { t } from '@/components/utils/language';
import LanguageSwitcher from '@/components/common/LanguageSwitcher';

const COLUMNS = [
  { key: 'transaction_id', label: 'Transaction ID' },
  { key: 'date', label: 'Date' },
  { key: 'customer_report_id', label: 'Customer Report ID' },
  { key: 'sender_name', label: 'Sender Name' },
  { key: 'sender_address', label: 'Sender Address' },
  { key: 'sender_bank_bic', label: 'Sender Bank BIC' },
  { key: 'sender_bank_name', label: 'Sender Bank Name' },
  { key: 'account_holder_name', label: 'Account Holder' },
  { key: 'account_number', label: 'Account Number' },
  { key: 'transaction_type', label: 'Transaction Type' },
  { key: 'transaction_purpose', label: 'Transaction Purpose' },
  { key: 'fund_source', label: 'Fund Source' },
  { key: 'transaction_method', label: 'Transaction Method' },
  { key: 'currency', label: 'Currency' },
  { key: 'amount', label: 'Amount' },
  { key: 'recipient_name', label: 'Recipient Name' },
  { key: 'recipient_address', label: 'Recipient Address' },
  { key: 'transfer_fee', label: 'Transfer Fee' },
  { key: 'beneficiary_type', label: 'Beneficiary Type' },
  { key: 'risk_level', label: 'Risk Level' },
  { key: 'dttot_check', label: 'DTTOT CHECK' },
  { key: 'dpppspm_check', label: 'DPPPSPM CHECK' },
];

function SortIcon({ active, dir }) {
  if (!active) return <ChevronUp className="w-3 h-3 opacity-20" />;
  return dir === 'asc' ? <ChevronUp className="w-3 h-3 text-white" /> : <ChevronDown className="w-3 h-3 text-white" />;
}

const TYPE_BADGE = {
  ingoing: 'bg-blue-100 text-blue-700',
  outgoing: 'bg-orange-100 text-orange-700',
  domestic: 'bg-slate-100 text-slate-700',
};
const RISK_BADGE = {
  low: 'bg-green-100 text-green-700',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-red-100 text-red-700',
};

export default function StaffTransactionReport() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterCurrency, setFilterCurrency] = useState('all');
  const [filterRisk, setFilterRisk] = useState('all');
  const [filterDTTOT, setFilterDTTOT] = useState('all');
  const [filterDPPPSPM, setFilterDPPPSPM] = useState('all');
  const [sortCol, setSortCol] = useState('date');
  const [sortDir, setSortDir] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [showModal, setShowModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);

  const { data: records = [], isLoading } = useQuery({
    queryKey: ['transaction-reports'],
    queryFn: () => apiClient.getTransactionReports('-date'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => apiClient.deleteTransactionReport(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['transaction-reports']);
      toast.success('Record deleted');
    },
  });

  const currencies = useMemo(() => [...new Set(records.map((r) => r.currency).filter(Boolean))].sort(), [records]);

  const filtered = useMemo(() => {
    let r = [...records];
    if (search) {
      const q = search.toLowerCase();
      r = r.filter((x) =>
        [x.transaction_id, x.sender_name, x.sender_id, x.recipient_name, x.currency].some((v) =>
          String(v || '')
            .toLowerCase()
            .includes(q)
        )
      );
    }
    if (filterType !== 'all') r = r.filter((x) => x.transaction_type === filterType);
    if (filterCurrency !== 'all') r = r.filter((x) => x.currency === filterCurrency);
    if (filterRisk !== 'all') r = r.filter((x) => x.risk_level === filterRisk);
    if (filterDTTOT !== 'all') r = r.filter((x) => String(!!x.dttot_check) === filterDTTOT);
    if (filterDPPPSPM !== 'all') r = r.filter((x) => String(!!x.dpppspm_check) === filterDPPPSPM);
    r.sort((a, b) => {
      const av = a[sortCol] ?? '',
        bv = b[sortCol] ?? '';
      return sortDir === 'asc' ? (av < bv ? -1 : av > bv ? 1 : 0) : av > bv ? -1 : av < bv ? 1 : 0;
    });
    return r;
  }, [records, search, filterType, filterCurrency, filterRisk, filterDTTOT, filterDPPPSPM, sortCol, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleSort = (col) => {
    if (sortCol === col) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSortCol(col);
      setSortDir('asc');
    }
  };

  const clearFilters = () => {
    setSearch('');
    setFilterType('all');
    setFilterCurrency('all');
    setFilterRisk('all');
    setFilterDTTOT('all');
    setFilterDPPPSPM('all');
    setCurrentPage(1);
  };

  const openEdit = (row) => {
    setEditingRecord(row);
    setShowModal(true);
  };
  const openAdd = () => {
    setEditingRecord(null);
    setShowModal(true);
  };
  const onSaved = () => {
    setShowModal(false);
    queryClient.invalidateQueries(['transaction-reports']);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-[#1e3a5f] shadow-lg">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link to={createPageUrl('StaffDashboard')}>
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                <ArrowLeft className="w-4 h-4 mr-1" /> {t('backToDashboard')}
              </Button>
            </Link>
            <div>
              <h1 className="text-lg font-bold text-white">{t('transactionDataReport')}</h1>
              <p className="text-xs text-slate-300">
                {filtered.length} records
                {filtered.length !== records.length ? ` (filtered from ${records.length})` : ''}
              </p>
            </div>
            <LanguageSwitcher />
          </div>
          <div className="flex gap-2">
            <Button
              onClick={async () => {
                try {
                  const blob = await apiClient.exportTransactionReportExcel();
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'TransactionReport.xlsx';
                  a.click();
                  window.URL.revokeObjectURL(url);
                } catch (e) {
                  toast.error('Failed to export: ' + e.message);
                }
              }}
              variant="outline"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <Download className="w-4 h-4 mr-2" /> {t('downloadExcel')}
            </Button>
            <Button onClick={openAdd} className="bg-[#f5a623] hover:bg-[#e09000] text-white">
              <Plus className="w-4 h-4 mr-2" /> {t('addRecord')}
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-6 space-y-4">
        {/* Filters */}
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder={t('searchTransactionPlaceholder')}
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-9"
              />
            </div>
            <Select
              value={filterType}
              onValueChange={(v) => {
                setFilterType(v);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-36">
                <SelectValue placeholder={t('transTypePlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('allTypes')}</SelectItem>
                <SelectItem value="ingoing">{t('ingoing')}</SelectItem>
                <SelectItem value="outgoing">{t('outgoing')}</SelectItem>
                <SelectItem value="domestic">{t('domestic')}</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filterCurrency}
              onValueChange={(v) => {
                setFilterCurrency(v);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder={t('transCurrencyPlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('allCurrencies')}</SelectItem>
                {currencies.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={filterRisk}
              onValueChange={(v) => {
                setFilterRisk(v);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder={t('transRiskPlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('allRisk')}</SelectItem>
                <SelectItem value="low">{t('riskLow')}</SelectItem>
                <SelectItem value="medium">{t('riskMedium')}</SelectItem>
                <SelectItem value="high">{t('riskHigh')}</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filterDTTOT}
              onValueChange={(v) => {
                setFilterDTTOT(v);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-36">
                <SelectValue placeholder={t('transDttotPlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">DTTOT: {t('pepAll').split(': ')[1]}</SelectItem>
                <SelectItem value="true">DTTOT: {t('pepYes').split(': ')[1]}</SelectItem>
                <SelectItem value="false">DTTOT: {t('pepNo').split(': ')[1]}</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filterDPPPSPM}
              onValueChange={(v) => {
                setFilterDPPPSPM(v);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder={t('transDpppspmPlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">DPPPSPM: {t('pepAll').split(': ')[1]}</SelectItem>
                <SelectItem value="true">DPPPSPM: {t('pepYes').split(': ')[1]}</SelectItem>
                <SelectItem value="false">DPPPSPM: {t('pepNo').split(': ')[1]}</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={clearFilters} className="text-slate-500 shrink-0">
              {t('clearFilters')}
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#1e3a5f]">
                <tr>
                  {COLUMNS.map((col) => (
                    <th
                      key={col.key}
                      onClick={() => handleSort(col.key)}
                      className="px-3 py-3 text-left text-xs font-semibold text-white uppercase tracking-wide cursor-pointer hover:bg-white/10 whitespace-nowrap select-none"
                    >
                      <div className="flex items-center gap-1">
                        {col.label}
                        <SortIcon active={sortCol === col.key} dir={sortDir} />
                      </div>
                    </th>
                  ))}
                  <th className="px-3 py-3 text-xs font-semibold text-white uppercase tracking-wide whitespace-nowrap">
                    {t('actionsLabel')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={COLUMNS.length + 1} className="px-4 py-12 text-center text-slate-400">
                      {t('loadingDots')}
                    </td>
                  </tr>
                ) : paged.length === 0 ? (
                  <tr>
                    <td colSpan={COLUMNS.length + 1} className="px-4 py-12 text-center text-slate-400">
                      {t('noRecordsFound')}
                    </td>
                  </tr>
                ) : (
                  paged.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-3 py-2.5 font-mono text-xs text-slate-700 whitespace-nowrap">
                        {String(row.transaction_id || row.id)}
                      </td>
                      <td className="px-3 py-2.5 text-xs text-slate-600 whitespace-nowrap">{row.date}</td>
                      <td className="px-3 py-2.5 text-xs text-slate-500 whitespace-nowrap">{row.customer_report_id}</td>
                      <td className="px-3 py-2.5 text-xs font-medium text-slate-800 whitespace-nowrap">
                        {row.sender_name}
                      </td>
                      <td
                        className="px-3 py-2.5 text-xs text-slate-500 max-w-[120px] truncate"
                        title={row.sender_address}
                      >
                        {row.sender_address}
                      </td>
                      <td className="px-3 py-2.5 text-xs text-slate-600 whitespace-nowrap">{row.sender_bank_bic}</td>
                      <td className="px-3 py-2.5 text-xs text-slate-600 whitespace-nowrap">{row.sender_bank_name}</td>
                      <td className="px-3 py-2.5 text-xs font-medium text-slate-800 whitespace-nowrap">
                        {row.account_holder_name}
                      </td>
                      <td className="px-3 py-2.5 font-mono text-xs text-slate-600 whitespace-nowrap">
                        {row.account_number}
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        <span
                          className={`px-1.5 py-0.5 rounded text-xs font-medium ${TYPE_BADGE[row.transaction_type] || 'bg-slate-100 text-slate-600'}`}
                        >
                          {row.transaction_type}
                        </span>
                      </td>
                      <td
                        className="px-3 py-2.5 text-xs text-slate-600 max-w-[120px] truncate"
                        title={row.transaction_purpose}
                      >
                        {row.transaction_purpose}
                      </td>
                      <td className="px-3 py-2.5 text-xs text-slate-600 whitespace-nowrap">{row.fund_source}</td>
                      <td className="px-3 py-2.5 text-xs text-slate-600 whitespace-nowrap">{row.transaction_method}</td>
                      <td className="px-3 py-2.5 text-xs font-medium text-slate-700">{row.currency}</td>
                      <td className="px-3 py-2.5 text-xs text-right font-medium text-slate-800 whitespace-nowrap">
                        {row.amount != null ? row.amount.toLocaleString() : ''}
                      </td>
                      <td className="px-3 py-2.5 text-xs font-medium text-slate-800 whitespace-nowrap">
                        {row.recipient_name}
                      </td>
                      <td
                        className="px-3 py-2.5 text-xs text-slate-500 max-w-[120px] truncate"
                        title={row.recipient_address}
                      >
                        {row.recipient_address}
                      </td>
                      <td className="px-3 py-2.5 text-xs text-right font-medium text-slate-700 whitespace-nowrap">
                        {row.transfer_fee != null ? row.transfer_fee.toLocaleString() : ''}
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        <span className="px-1.5 py-0.5 rounded text-xs bg-slate-100 text-slate-700">
                          {row.beneficiary_type}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        <span
                          className={`px-1.5 py-0.5 rounded text-xs font-medium capitalize ${RISK_BADGE[row.risk_level] || 'bg-slate-100 text-slate-600'}`}
                        >
                          {row.risk_level}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <span
                          className={`px-1.5 py-0.5 rounded text-xs font-bold ${row.dttot_check ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}
                        >
                          {row.dttot_check ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <span
                          className={`px-1.5 py-0.5 rounded text-xs font-bold ${row.dpppspm_check ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}
                        >
                          {row.dpppspm_check ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex gap-1">
                          <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => openEdit(row)}>
                            <Edit2 className="w-3 h-3" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6 text-red-500 hover:bg-red-50"
                            onClick={() => {
                              if (window.confirm('Delete this record?')) deleteMutation.mutate(row.id);
                            }}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="border-t border-slate-200 px-4 py-3 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <span>{t('rowsPerPage')}</span>
              <Select
                value={String(pageSize)}
                onValueChange={(v) => {
                  setPageSize(Number(v));
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-16 h-7 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[10, 20, 50, 100].map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {n}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <span>
                {t('pageLabel')} {currentPage} {t('pageOfLabel')} {totalPages}
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                {t('prevLabel')}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
              >
                {t('nextLabel')}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <TransactionFormModal record={editingRecord} onClose={() => setShowModal(false)} onSaved={onSaved} />
      )}
    </div>
  );
}
