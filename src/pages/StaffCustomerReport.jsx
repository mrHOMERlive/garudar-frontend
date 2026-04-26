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
import CustomerFormModal from '@/components/reports/CustomerFormModal';
import { t } from '@/components/utils/language';
import LanguageSwitcher from '@/components/common/LanguageSwitcher';

const COLUMNS = [
  { key: 'id', label: 'ID' },
  { key: 'customer_type', label: 'Type' },
  { key: 'registration_number', label: 'Identity Number' },
  { key: 'tax_number', label: 'Tax Number (NPWP)' },
  { key: 'legal_tax_number_type', label: 'Legal/Tax Doc Type' },
  { key: 'legal_tax_number', label: 'Other Identity Number' },
  { key: 'name', label: 'Sender Name' },
  { key: 'birth_place_date', label: 'Birth Place/Date' },
  { key: 'address', label: 'Address' },
  { key: 'indonesian_citizenship', label: 'Citizenship' },
  { key: 'director_name', label: 'Director Name' },
  { key: 'occupation', label: 'Occupation' },
  { key: 'gender', label: 'Gender' },
  { key: 'phone_number', label: 'Phone Number' },
  { key: 'recipient_name', label: 'Recipient Name' },
  { key: 'recipient_address', label: 'Recipient Address' },
  { key: 'pep_indicator', label: 'PEP Indicator' },
  { key: 'code_type', label: 'Code Type' },
  { key: 'business_area', label: 'Business Area' },
];

function SortIcon({ active, dir }) {
  if (!active) return <ChevronUp className="w-3 h-3 opacity-20" />;
  return dir === 'asc' ? <ChevronUp className="w-3 h-3 text-white" /> : <ChevronDown className="w-3 h-3 text-white" />;
}

const TYPE_BADGE = { client: 'bg-blue-100 text-blue-700', counterparty: 'bg-purple-100 text-purple-700' };

export default function StaffCustomerReport() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterCode, setFilterCode] = useState('all');
  const [filterPEP, setFilterPEP] = useState('all');
  const [filterCitizen, setFilterCitizen] = useState('all');
  const [sortCol, setSortCol] = useState('name');
  const [sortDir, setSortDir] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [showModal, setShowModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);

  const { data: records = [], isLoading } = useQuery({
    queryKey: ['customer-reports'],
    queryFn: () => apiClient.getCustomerReports('-created_date'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => apiClient.deleteCustomerReport(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['customer-reports']);
      toast.success('Record deleted');
    },
  });

  const filtered = useMemo(() => {
    let r = [...records];
    if (search) {
      const q = search.toLowerCase();
      r = r.filter((x) =>
        [x.name, x.legal_tax_number, x.director_name, x.address, x.id].some((v) =>
          String(v || '')
            .toLowerCase()
            .includes(q)
        )
      );
    }
    if (filterType !== 'all') r = r.filter((x) => x.customer_type === filterType);
    if (filterCode !== 'all') r = r.filter((x) => x.code_type === filterCode);
    if (filterPEP !== 'all') r = r.filter((x) => String(!!x.pep_indicator) === filterPEP);
    if (filterCitizen !== 'all') r = r.filter((x) => String(!!x.indonesian_citizenship) === filterCitizen);
    r.sort((a, b) => {
      const av = a[sortCol] ?? '',
        bv = b[sortCol] ?? '';
      return sortDir === 'asc' ? (av < bv ? -1 : av > bv ? 1 : 0) : av > bv ? -1 : av < bv ? 1 : 0;
    });
    return r;
  }, [records, search, filterType, filterCode, filterPEP, filterCitizen, sortCol, sortDir]);

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
    setFilterCode('all');
    setFilterPEP('all');
    setFilterCitizen('all');
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
    queryClient.invalidateQueries(['customer-reports']);
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
              <h1 className="text-lg font-bold text-white">{t('customerDataReport')}</h1>
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
                  const blob = await apiClient.exportCustomerReportExcel();
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'CustomerReport.xlsx';
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
              <Plus className="w-4 h-4 mr-2" /> {t('addCustomer')}
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
                placeholder={t('searchCustomerPlaceholder')}
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
              <SelectTrigger className="w-40">
                <SelectValue placeholder={t('custTypePlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('allCustomerTypes')}</SelectItem>
                <SelectItem value="client">Client</SelectItem>
                <SelectItem value="counterparty">Counterparty</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filterCode}
              onValueChange={(v) => {
                setFilterCode(v);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-36">
                <SelectValue placeholder={t('custCodePlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('allCodes')}</SelectItem>
                <SelectItem value="MC">MC</SelectItem>
                <SelectItem value="Bank">Bank</SelectItem>
                <SelectItem value="Individual">Individual</SelectItem>
                <SelectItem value="Corporate">Corporate</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filterPEP}
              onValueChange={(v) => {
                setFilterPEP(v);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder={t('custPepPlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('pepAll')}</SelectItem>
                <SelectItem value="true">{t('pepYes')}</SelectItem>
                <SelectItem value="false">{t('pepNo')}</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filterCitizen}
              onValueChange={(v) => {
                setFilterCitizen(v);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder={t('custCitizenshipPlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('citizenshipAll')}</SelectItem>
                <SelectItem value="true">{t('indonesianYes')}</SelectItem>
                <SelectItem value="false">{t('indonesianNo')}</SelectItem>
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
                      <td className="px-3 py-2.5 font-mono text-xs text-slate-400 whitespace-nowrap">
                        {String(row.id).substring(0, 8)}…
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        <span
                          className={`px-1.5 py-0.5 rounded text-xs font-medium capitalize ${TYPE_BADGE[row.customer_type] || 'bg-slate-100 text-slate-600'}`}
                        >
                          {row.customer_type}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-xs text-slate-600 whitespace-nowrap">
                        {row.registration_number}
                      </td>
                      <td className="px-3 py-2.5 text-xs text-slate-600 whitespace-nowrap">{row.tax_number}</td>
                      <td className="px-3 py-2.5 text-xs text-slate-600 whitespace-nowrap">
                        {row.legal_tax_number_type}
                      </td>
                      <td className="px-3 py-2.5 font-mono text-xs text-slate-700 whitespace-nowrap">
                        {row.legal_tax_number}
                      </td>
                      <td className="px-3 py-2.5 text-xs font-medium text-slate-800 whitespace-nowrap">{row.name}</td>
                      <td className="px-3 py-2.5 text-xs text-slate-600 whitespace-nowrap">{row.birth_place_date}</td>
                      <td className="px-3 py-2.5 text-xs text-slate-500 max-w-[150px] truncate" title={row.address}>
                        {row.address}
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <span
                          className={`px-1.5 py-0.5 rounded text-xs font-bold ${row.indonesian_citizenship ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}
                        >
                          {row.indonesian_citizenship ? 'WNI' : 'WNA'}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-xs text-slate-700 whitespace-nowrap">{row.director_name}</td>
                      <td className="px-3 py-2.5 text-xs text-slate-600 whitespace-nowrap">{row.occupation}</td>
                      <td className="px-3 py-2.5 text-xs text-slate-600 whitespace-nowrap">{row.gender}</td>
                      <td className="px-3 py-2.5 text-xs text-slate-600 whitespace-nowrap">{row.phone_number}</td>
                      <td className="px-3 py-2.5 text-xs text-slate-600 whitespace-nowrap">{row.recipient_name}</td>
                      <td
                        className="px-3 py-2.5 text-xs text-slate-500 max-w-[150px] truncate"
                        title={row.recipient_address}
                      >
                        {row.recipient_address}
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <span
                          className={`px-1.5 py-0.5 rounded text-xs font-bold ${row.pep_indicator ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}
                        >
                          {row.pep_indicator ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        <span className="px-1.5 py-0.5 rounded text-xs bg-slate-100 text-slate-700">
                          {row.code_type}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-xs text-slate-600 whitespace-nowrap">{row.business_area}</td>
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

      {showModal && <CustomerFormModal record={editingRecord} onClose={() => setShowModal(false)} onSaved={onSaved} />}
    </div>
  );
}
