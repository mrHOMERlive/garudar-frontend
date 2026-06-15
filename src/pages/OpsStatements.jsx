import React, { useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/api/apiClient';
import { toast } from 'sonner';
import OpsHeader from '@/components/ops/OpsHeader';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, FileUp, Loader2, RefreshCw, Trash2 } from 'lucide-react';

// ISO "2026-05-29" -> "29.05.2026"
const fmtDate = (iso) => {
  if (!iso) return '';
  const p = String(iso).slice(0, 10).split('-');
  return p.length === 3 ? `${p[2]}.${p[1]}.${p[0]}` : String(iso);
};
// ISO datetime -> "11/12/2025 11.54.05" (Mandiri "Date & Time" layout)
const fmtDateTime = (iso) => {
  if (!iso) return '';
  const [datePart, timeRaw = ''] = String(iso).split('T');
  const p = datePart.split('-');
  const date = p.length === 3 ? `${p[2]}/${p[1]}/${p[0]}` : datePart;
  const time = timeRaw.slice(0, 8).replace(/:/g, '.');
  return time ? `${date} ${time}` : date;
};
const fmtAmount = (v) => (v != null && v !== '' ? Number(v).toLocaleString() : '');

export default function OpsStatements() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);

  const [source, setSource] = useState('MANDIRI');
  const [companyCode, setCompanyCode] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [primaryFile, setPrimaryFile] = useState(null);
  const [combineIds, setCombineIds] = useState([]); // statements picked for combined FX export

  const { data: companies = [] } = useQuery({
    queryKey: ['ops-companies'],
    queryFn: () => apiClient.opsGetCompanies(),
  });

  const { data: statements = [], isLoading } = useQuery({
    queryKey: ['ops-statements'],
    queryFn: () => apiClient.opsGetStatements(),
  });

  const { data: detail, isFetching: detailLoading } = useQuery({
    queryKey: ['ops-statement', selectedId],
    queryFn: () => apiClient.opsGetStatement(selectedId),
    enabled: !!selectedId,
  });

  const resetUpload = () => {
    setPrimaryFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const uploadMutation = useMutation({
    mutationFn: () => apiClient.opsUploadStatement(source, primaryFile, companyCode || null),
    onSuccess: (statement) => {
      queryClient.invalidateQueries({ queryKey: ['ops-statements'] });
      toast.success(`Statement parsed: ${statement.row_count} rows, ${statement.matched_count} matched`);
      setSelectedId(statement.id);
      resetUpload();
    },
    onError: (error) => toast.error(error.message),
  });

  const rematchMutation = useMutation({
    mutationFn: (id) => apiClient.opsRematchStatement(id),
    onSuccess: (statement) => {
      queryClient.invalidateQueries({ queryKey: ['ops-statements'] });
      queryClient.invalidateQueries({ queryKey: ['ops-statement', statement.id] });
      toast.success(`Rematched: ${statement.matched_count} of ${statement.row_count} rows`);
    },
    onError: (error) => toast.error(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => apiClient.opsDeleteStatement(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ops-statements'] });
      setSelectedId(null);
      toast.success('Statement deleted');
    },
    onError: (error) => toast.error(error.message),
  });

  const combineMutation = useMutation({
    mutationFn: () => apiClient.opsExportCombinedStatements(combineIds),
    onSuccess: () => toast.success('Combined FX export downloaded'),
    onError: (error) => toast.error(error.message),
  });

  const toggleCombine = (id) =>
    setCombineIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  // combined FX needs >=2 Mandiri statements from different companies
  const combineSelectable = statements.filter((s) => combineIds.includes(s.id));
  const canCombine =
    combineSelectable.length >= 2 &&
    combineSelectable.every((s) => s.source === 'MANDIRI') &&
    new Set(combineSelectable.map((s) => s.company_code)).size >= 2;

  const isMandiri = source === 'MANDIRI';

  return (
    <div className="min-h-screen bg-slate-50">
      <OpsHeader title="Bank Statements" subtitle="Mandiri / VTB statement processing" />
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-[#1e3a5f]">Upload statement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-end gap-4">
              <div className="space-y-1 w-44">
                <Label>Source bank</Label>
                <Select
                  value={source}
                  onValueChange={(v) => {
                    setSource(v);
                    resetUpload();
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MANDIRI">Mandiri (XLS)</SelectItem>
                    <SelectItem value="VTB">VTB (CSV)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1 w-44">
                <Label>Company (optional)</Label>
                <Select value={companyCode || 'ALL'} onValueChange={(v) => setCompanyCode(v === 'ALL' ? '' : v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All companies</SelectItem>
                    {companies.map((c) => (
                      <SelectItem key={c.code} value={c.code}>
                        {c.name} ({c.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* primary statement file */}
              <input
                ref={fileInputRef}
                type="file"
                accept={isMandiri ? '.xls,.xlsx,.csv' : '.csv'}
                className="hidden"
                onChange={(e) => setPrimaryFile(e.target.files?.[0] || null)}
              />
              <div className="space-y-1">
                <Label>{isMandiri ? 'Statement (.xls)' : 'Statement (.csv)'}</Label>
                <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                  <FileUp className="w-4 h-4 mr-2" />
                  {primaryFile ? primaryFile.name : 'Choose file'}
                </Button>
              </div>

              <Button
                onClick={() => uploadMutation.mutate()}
                disabled={!primaryFile || uploadMutation.isPending}
                className="bg-[#1e3a5f] hover:bg-[#16304f]"
              >
                {uploadMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <FileUp className="w-4 h-4 mr-2" />
                )}
                Upload &amp; parse
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-[#1e3a5f]">Statements</CardTitle>
            <Button
              variant="outline"
              disabled={!canCombine || combineMutation.isPending}
              onClick={() => combineMutation.mutate()}
              title="Exact FX for Mitra+Anema (pairs intercompany transfers). Tick two Mandiri statements from different companies."
            >
              {combineMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Download className="w-4 h-4 mr-2" />
              )}
              Combined FX export{combineIds.length ? ` (${combineIds.length})` : ''}
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-[#1e3a5f]" />
              </div>
            ) : statements.length === 0 ? (
              <p className="text-slate-500 text-sm py-4 text-center">No statements uploaded yet.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-8"></TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>File</TableHead>
                    <TableHead>Rows</TableHead>
                    <TableHead>Matched</TableHead>
                    <TableHead>Uploaded</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {statements.map((s) => (
                    <TableRow
                      key={s.id}
                      className={`cursor-pointer hover:bg-slate-50 ${selectedId === s.id ? 'bg-slate-100' : ''}`}
                      onClick={() => setSelectedId(s.id)}
                    >
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        {s.source === 'MANDIRI' && (
                          <input
                            type="checkbox"
                            className="cursor-pointer"
                            checked={combineIds.includes(s.id)}
                            onChange={() => toggleCombine(s.id)}
                            title="Include in combined FX export"
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{s.source}</Badge>
                      </TableCell>
                      <TableCell>{s.company_code || '—'}</TableCell>
                      <TableCell className="text-sm max-w-56 truncate">{s.file_name}</TableCell>
                      <TableCell>{s.row_count}</TableCell>
                      <TableCell>
                        <span className={s.matched_count > 0 ? 'text-emerald-700 font-medium' : 'text-slate-400'}>
                          {s.matched_count}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-slate-500">
                        {s.created_at ? new Date(s.created_at).toLocaleString() : ''}
                      </TableCell>
                      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            title="Refresh: re-run order matching + recompute Kind"
                            onClick={() => rematchMutation.mutate(s.id)}
                          >
                            <RefreshCw className="w-4 h-4" />
                          </Button>
                          {/* Mandiri is exported only via "Combined FX export"
                              (exact FX needs both Mitra+Anema statements). */}
                          {s.source !== 'MANDIRI' && (
                            <Button
                              size="sm"
                              variant="outline"
                              title="Download XLSX"
                              onClick={() => apiClient.opsExportStatementXlsx(s.id, s.source)}
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600"
                            onClick={() => {
                              if (window.confirm('Delete this statement and its rows?')) {
                                deleteMutation.mutate(s.id);
                              }
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {selectedId && (
          <Card>
            <CardHeader>
              <CardTitle className="text-[#1e3a5f]">Rows {detail ? `— ${detail.file_name}` : ''}</CardTitle>
            </CardHeader>
            <CardContent>
              {detailLoading || !detail ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-[#1e3a5f]" />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  {detail.source === 'MANDIRI' ? <MandiriRows rows={detail.rows} /> : <VtbRows rows={detail.rows} />}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}

// Mirrors the Mandiri bank table + our enrichment (category/holder/matched order).
function MandiriRows({ rows }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Date &amp; Time</TableHead>
          <TableHead>Value date</TableHead>
          <TableHead>Account</TableHead>
          <TableHead>Holder</TableHead>
          <TableHead>Cur</TableHead>
          <TableHead>Kind</TableHead>
          <TableHead>Description</TableHead>
          <TableHead className="text-right">Debit</TableHead>
          <TableHead className="text-right">Credit</TableHead>
          <TableHead className="text-right">Balance</TableHead>
          <TableHead>Order</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.id}>
            <TableCell className="font-mono text-xs">{row.generated_id}</TableCell>
            <TableCell className="text-sm whitespace-nowrap">
              {fmtDateTime(row.txn_datetime) || fmtDate(row.txn_date)}
            </TableCell>
            <TableCell className="text-sm whitespace-nowrap">{fmtDate(row.value_date)}</TableCell>
            <TableCell className="font-mono text-xs">{row.account_no || ''}</TableCell>
            <TableCell className="text-xs max-w-40 truncate" title={row.account_alias || ''}>
              {row.account_alias || ''}
            </TableCell>
            <TableCell>{row.currency || ''}</TableCell>
            <TableCell className="text-sm">{row.category || ''}</TableCell>
            <TableCell className="text-xs max-w-72 truncate" title={row.description_1 || ''}>
              {row.description_1 || ''}
            </TableCell>
            <TableCell className="text-right text-sm whitespace-nowrap">{fmtAmount(row.debit)}</TableCell>
            <TableCell className="text-right text-sm whitespace-nowrap">{fmtAmount(row.credit)}</TableCell>
            <TableCell className="text-right text-sm whitespace-nowrap">{fmtAmount(row.balance)}</TableCell>
            <TableCell className="font-mono text-xs">{row.matched_order_id || ''}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

// Mirrors the reference VTB table: date, Counterparty, Description, Credit, Debet,
// type, order retrieved, order date.
function VtbRows({ rows }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Counterparty</TableHead>
          <TableHead>Description</TableHead>
          <TableHead className="text-right">Credit</TableHead>
          <TableHead className="text-right">Debet</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Order retrieved</TableHead>
          <TableHead>Order date</TableHead>
          <TableHead>Matched</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.id}>
            <TableCell className="font-mono text-xs">{row.generated_id}</TableCell>
            <TableCell className="text-sm whitespace-nowrap">{fmtDate(row.txn_date)}</TableCell>
            <TableCell className="text-xs max-w-48 truncate" title={row.payer_name || ''}>
              {row.payer_name || row.beneficiary_name || ''}
            </TableCell>
            <TableCell className="text-xs max-w-80 truncate" title={row.description_1 || ''}>
              {row.description_1 || ''}
            </TableCell>
            <TableCell className="text-right text-sm whitespace-nowrap">{fmtAmount(row.credit)}</TableCell>
            <TableCell className="text-right text-sm whitespace-nowrap">{fmtAmount(row.debit)}</TableCell>
            <TableCell className="text-sm">{row.category || ''}</TableCell>
            <TableCell className="font-mono text-xs">{row.retrieved_order_no || ''}</TableCell>
            <TableCell className="text-sm whitespace-nowrap">{fmtDate(row.retrieved_order_date)}</TableCell>
            <TableCell className="font-mono text-xs">{row.matched_order_id || ''}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
