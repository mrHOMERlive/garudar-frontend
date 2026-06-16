import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/api/apiClient';
import { toast } from 'sonner';
import OpsHeader from '@/components/ops/OpsHeader';
import { sourceTypeLabel } from './OpsBatches';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { AlertTriangle, Copy, Download, FileDown, Loader2, Pencil, Plus, Search, Trash2 } from 'lucide-react';

const LINE_LIMIT = 35;
const REMARK_LIMIT = 120;

// Editable fields sent to PATCH (subset of the row DTO).
const EDIT_FIELDS = [
  'debit_account_no',
  'destination_acc_no',
  'remittance_currency',
  'transfer_amount',
  'beneficiary_name',
  'beneficiary_addr1',
  'beneficiary_addr2',
  'beneficiary_addr3',
  'bank_code_swift',
  'bank_name',
  'country',
  'transaction_reference',
  'remark',
  'invoice',
  'client_id',
  'order_id',
  'include',
];

function CharCounter({ value, limit }) {
  const length = (value || '').length;
  const over = length > limit;
  return (
    <span className={`text-xs ${over ? 'text-red-600 font-semibold' : 'text-slate-400'}`}>
      {length}/{limit}
    </span>
  );
}

function RemarkPreview({ remark }) {
  const normalized = (remark || '').replace(/\s+/g, ' ').trim();
  const chunks = [0, 1, 2, 3].map((i) => normalized.slice(i * 30, i * 30 + 30));
  const overflow = normalized.length > REMARK_LIMIT;
  return (
    <div className="space-y-1">
      <p className="text-xs text-slate-500">TXT preview (4 × 30 chars):</p>
      {chunks.map((chunk, i) => (
        <div key={i} className="text-xs font-mono bg-slate-100 rounded px-2 py-1 min-h-5">
          {chunk || <span className="text-slate-300">—</span>}
        </div>
      ))}
      {overflow && (
        <p className="text-xs text-red-600 font-medium">Text beyond 120 chars will be CUT in the TXT file.</p>
      )}
    </div>
  );
}

function BicPicker({ onPick }) {
  const [query, setQuery] = useState('');
  const { data: results = [], isFetching } = useQuery({
    queryKey: ['ops-bic-search', query],
    queryFn: () => apiClient.opsSearchBic(query),
    enabled: query.length >= 3,
  });
  return (
    <div className="space-y-2">
      <div className="relative">
        <Search className="w-4 h-4 absolute left-2 top-2.5 text-slate-400" />
        <Input
          placeholder="Search BIC reference (min 3 chars)..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-8"
        />
      </div>
      {isFetching && <p className="text-xs text-slate-400">Searching…</p>}
      {query.length >= 3 && !isFetching && results.length === 0 && (
        <p className="text-xs text-slate-400">No matches in the BIC reference.</p>
      )}
      {results.length > 0 && (
        <ul className="max-h-32 overflow-y-auto border rounded divide-y">
          {results.map((r) => (
            <li
              key={r.bic}
              className="px-2 py-1 text-xs cursor-pointer hover:bg-slate-50 flex justify-between"
              onClick={() => onPick(r)}
            >
              <span className="font-mono font-semibold">{r.bic}</span>
              <span className="text-slate-500 truncate ml-2">{r.bank_name || ''}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function OpsBatchEditor() {
  const [searchParams] = useSearchParams();
  const batchId = searchParams.get('id');
  const queryClient = useQueryClient();

  const [editingRow, setEditingRow] = useState(null);
  const [form, setForm] = useState({});
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { data: batch, isLoading } = useQuery({
    queryKey: ['ops-batch', batchId],
    queryFn: () => apiClient.opsGetBatch(batchId),
    enabled: !!batchId,
  });

  const { data: companies = [] } = useQuery({
    queryKey: ['ops-companies'],
    queryFn: () => apiClient.opsGetCompanies(),
  });

  const { data: clients = [] } = useQuery({
    queryKey: ['ops-clients'],
    queryFn: () => (apiClient.opsGetClients ? apiClient.opsGetClients() : apiClient.request('/ops/clients')),
  });

  const readOnly = batch?.status === 'EXPORTED';

  // {currency: account_no} for the batch's selected account-set, used by the
  // per-row "fill from alias" helper when fixing an exceptional debit account.
  const aliasAccountMap = useMemo(() => {
    if (!batch?.account_alias) return {};
    const company = companies.find((c) => c.code === batch.company_code);
    if (!company) return {};
    const map = {};
    for (const acc of company.debit_accounts || []) {
      if (acc.alias === batch.account_alias) map[(acc.currency || '').toUpperCase()] = acc.account_no;
    }
    return map;
  }, [batch, companies]);

  const aliasAccountForCurrency = aliasAccountMap[(form.remittance_currency || '').toUpperCase()] || '';

  useEffect(() => {
    if (editingRow) {
      const initial = {};
      for (const field of EDIT_FIELDS) initial[field] = editingRow[field] ?? '';
      initial.include = editingRow.include;
      setForm(initial);
      setDrawerOpen(true);
    }
  }, [editingRow]);

  const saveMutation = useMutation({
    mutationFn: () => {
      const payload = {};
      for (const field of EDIT_FIELDS) {
        const value = form[field];
        payload[field] = value === '' ? null : value;
      }
      payload.include = !!form.include;
      if (payload.transfer_amount != null) payload.transfer_amount = Number(payload.transfer_amount);
      return apiClient.opsUpdateBatchRow(batchId, editingRow.id, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ops-batch', batchId] });
      toast.success('Row updated');
      setDrawerOpen(false);
      setEditingRow(null);
    },
    onError: (error) => toast.error(error.message),
  });

  const deleteRowMutation = useMutation({
    mutationFn: (rowId) => apiClient.opsDeleteBatchRow(batchId, rowId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ops-batch', batchId] });
      toast.success('Row deleted');
    },
    onError: (error) => toast.error(error.message),
  });

  const addRowMutation = useMutation({
    mutationFn: () => apiClient.opsAddBatchRow(batchId, { remark: '', include: true }),
    onSuccess: (row) => {
      queryClient.invalidateQueries({ queryKey: ['ops-batch', batchId] });
      setEditingRow(row);
    },
    onError: (error) => toast.error(error.message),
  });

  const exportTxtMutation = useMutation({
    mutationFn: () => apiClient.opsExportBatchTxt(batchId, batch?.batch_name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ops-batch', batchId] });
      queryClient.invalidateQueries({ queryKey: ['ops-batches'] });
      toast.success('TXT exported — batch is now read-only');
    },
    onError: (error) => toast.error(error.message),
  });

  const cloneMutation = useMutation({
    mutationFn: () => apiClient.opsCloneBatch(batchId),
    onSuccess: (clone) => {
      toast.success(`Cloned to ${clone.batch_name}`);
      window.location.href = `/opsbatcheditor?id=${clone.id}`;
    },
    onError: (error) => toast.error(error.message),
  });

  const warningTotal = useMemo(
    () => (batch?.rows || []).reduce((acc, r) => acc + (r.warnings?.length ? 1 : 0), 0),
    [batch]
  );

  const setField = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target?.value ?? e }));

  const onPickClient = async (clientId) => {
    setForm((f) => ({ ...f, client_id: clientId }));
    if (!clientId) return;
    const inFlight = (batch?.rows || []).filter((r) => r.id !== editingRow?.id && r.order_id).map((r) => r.order_id);
    try {
      const nx = await apiClient.opsClientNextOrder(clientId, inFlight);
      setForm((f) => ({ ...f, order_id: nx.suggested_ord_ref || nx.prefix }));
      if (nx.last_ord_ref) toast.message(`Last order for client: ${nx.last_ord_ref}`);
    } catch (e) {
      toast.error(e.message);
    }
  };

  if (!batchId) {
    return (
      <div className="min-h-screen bg-slate-50">
        <OpsHeader title="Batch Editor" backTo="OpsBatches" />
        <main className="max-w-7xl mx-auto px-4 py-8">
          <p className="text-slate-500">No batch selected.</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <OpsHeader
        title={batch ? batch.batch_name : 'Batch Editor'}
        subtitle={batch ? `${batch.company_name || batch.company_code} · ${sourceTypeLabel(batch.source_type)}` : ''}
        backTo="OpsBatches"
      />
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <CardTitle className="text-[#1e3a5f]">Rows</CardTitle>
              {batch && (
                <Badge
                  className={
                    readOnly
                      ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100'
                      : 'bg-amber-100 text-amber-800 hover:bg-amber-100'
                  }
                >
                  {batch.status}
                </Badge>
              )}
              {warningTotal > 0 && (
                <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  {warningTotal} row(s) with warnings
                </Badge>
              )}
            </div>
            <div className="flex gap-2 flex-wrap">
              {!readOnly && (
                <Button variant="outline" onClick={() => addRowMutation.mutate()}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add row
                </Button>
              )}
              <Button variant="outline" onClick={() => apiClient.opsExportBatchXlsx(batchId, batch?.batch_name)}>
                <Download className="w-4 h-4 mr-2" />
                XLSX
              </Button>
              {readOnly ? (
                <Button onClick={() => cloneMutation.mutate()} className="bg-[#1e3a5f] hover:bg-[#16304f]">
                  <Copy className="w-4 h-4 mr-2" />
                  Clone to edit
                </Button>
              ) : (
                <Button
                  onClick={() => {
                    if (window.confirm('Export TXT? The batch becomes read-only after export.')) {
                      exportTxtMutation.mutate();
                    }
                  }}
                  disabled={exportTxtMutation.isPending}
                  className="bg-[#1e3a5f] hover:bg-[#16304f]"
                >
                  {exportTxtMutation.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <FileDown className="w-4 h-4 mr-2" />
                  )}
                  Export TXT
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="w-6 h-6 animate-spin text-[#1e3a5f]" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>#</TableHead>
                      <TableHead>Beneficiary</TableHead>
                      <TableHead>Account</TableHead>
                      <TableHead>SWIFT</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Remark (purpose)</TableHead>
                      <TableHead>Order Id</TableHead>
                      <TableHead>Warnings</TableHead>
                      <TableHead>Incl.</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(batch?.rows || []).map((row) => (
                      <TableRow key={row.id} className={!row.include ? 'opacity-50' : ''}>
                        <TableCell>{row.row_no}</TableCell>
                        <TableCell>
                          <div className="font-medium max-w-48 truncate">{row.beneficiary_name}</div>
                          <div className="text-xs text-slate-400 max-w-48 truncate">{row.source_file}</div>
                        </TableCell>
                        <TableCell className="font-mono text-xs max-w-36 truncate">{row.destination_acc_no}</TableCell>
                        <TableCell className="font-mono text-xs">{row.bank_code_swift}</TableCell>
                        <TableCell className="whitespace-nowrap">
                          {row.transfer_amount != null ? Number(row.transfer_amount).toLocaleString() : ''}{' '}
                          {row.remittance_currency}
                        </TableCell>
                        <TableCell className="max-w-64">
                          <div className="text-xs truncate">{row.remark}</div>
                        </TableCell>
                        <TableCell className="text-xs font-mono">{row.order_id}</TableCell>
                        <TableCell>
                          {row.warnings?.length > 0 && (
                            <div className="flex flex-col gap-1 max-w-52">
                              {row.warnings.map((w) => (
                                <Badge
                                  key={w}
                                  variant="outline"
                                  className="text-[10px] border-red-200 text-red-700 whitespace-normal text-left"
                                >
                                  {w}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>{row.include ? 'Yes' : 'No'}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button size="sm" variant="outline" disabled={readOnly} onClick={() => setEditingRow(row)}>
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600"
                              disabled={readOnly}
                              onClick={() => {
                                if (window.confirm(`Delete row ${row.row_no}?`)) {
                                  deleteRowMutation.mutate(row.id);
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
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <Sheet
        open={drawerOpen}
        onOpenChange={(open) => {
          setDrawerOpen(open);
          if (!open) setEditingRow(null);
        }}
      >
        <SheetContent className="overflow-y-auto sm:max-w-xl">
          <SheetHeader>
            <SheetTitle>Edit row {editingRow?.row_no}</SheetTitle>
          </SheetHeader>
          {editingRow && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <Label>Debit account</Label>
                    {batch?.account_alias &&
                      aliasAccountForCurrency &&
                      aliasAccountForCurrency !== form.debit_account_no && (
                        <button
                          type="button"
                          className="text-[11px] text-[#1e3a5f] hover:underline"
                          onClick={() => setForm((f) => ({ ...f, debit_account_no: aliasAccountForCurrency }))}
                          title={`Use ${form.remittance_currency} account from "${batch.account_alias}"`}
                        >
                          Use {batch.account_alias} · {form.remittance_currency}
                        </button>
                      )}
                  </div>
                  <Input value={form.debit_account_no || ''} onChange={setField('debit_account_no')} />
                </div>
                <div className="space-y-1">
                  <Label>Destination account</Label>
                  <Input value={form.destination_acc_no || ''} onChange={setField('destination_acc_no')} />
                </div>
                <div className="space-y-1">
                  <Label>Currency</Label>
                  <Input value={form.remittance_currency || ''} onChange={setField('remittance_currency')} />
                </div>
                <div className="space-y-1">
                  <Label>Amount</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={form.transfer_amount ?? ''}
                    onChange={setField('transfer_amount')}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between">
                  <Label>Beneficiary name</Label>
                  <CharCounter value={form.beneficiary_name} limit={LINE_LIMIT} />
                </div>
                <Input value={form.beneficiary_name || ''} onChange={setField('beneficiary_name')} />
              </div>

              {['beneficiary_addr1', 'beneficiary_addr2', 'beneficiary_addr3'].map((field, i) => (
                <div className="space-y-1" key={field}>
                  <div className="flex justify-between">
                    <Label>Address line {i + 1}</Label>
                    <CharCounter value={form[field]} limit={LINE_LIMIT} />
                  </div>
                  <Input value={form[field] || ''} onChange={setField(field)} />
                </div>
              ))}

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>SWIFT / BIC</Label>
                  <Input
                    value={form.bank_code_swift || ''}
                    onChange={(e) => setForm((f) => ({ ...f, bank_code_swift: e.target.value.toUpperCase() }))}
                  />
                </div>
                <div className="space-y-1">
                  <Label>Bank name</Label>
                  <Input value={form.bank_name || ''} onChange={setField('bank_name')} />
                </div>
              </div>

              <BicPicker
                onPick={(r) =>
                  setForm((f) => ({
                    ...f,
                    bank_code_swift: r.bic,
                    bank_name: f.bank_name || r.bank_name || '',
                  }))
                }
              />

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Country</Label>
                  <Input value={form.country || ''} onChange={setField('country')} />
                </div>
                <div className="space-y-1">
                  <Label>Transaction reference</Label>
                  <Input value={form.transaction_reference || ''} onChange={setField('transaction_reference')} />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between">
                  <Label>Remark (payment purpose)</Label>
                  <CharCounter value={(form.remark || '').replace(/\s+/g, ' ').trim()} limit={REMARK_LIMIT} />
                </div>
                <Textarea rows={3} value={form.remark || ''} onChange={setField('remark')} />
                <RemarkPreview remark={form.remark} />
              </div>

              <div className="space-y-1">
                <Label>Client</Label>
                <select
                  className="w-full border rounded h-9 px-2 text-sm"
                  value={form.client_id || ''}
                  onChange={(e) => onPickClient(e.target.value ? Number(e.target.value) : null)}
                  disabled={readOnly}
                >
                  <option value="">—</option>
                  {clients
                    .filter((c) => c.number != null)
                    .sort((a, b) => a.number - b.number)
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.number} — {c.name}
                      </option>
                    ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Order Id</Label>
                  <Input
                    value={form.order_id || ''}
                    onChange={setField('order_id')}
                    placeholder="e.g. 123-456 -> ID/123-456/"
                  />
                </div>
                <div className="space-y-1">
                  <Label>Invoice</Label>
                  <Input value={form.invoice || ''} onChange={setField('invoice')} />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Switch
                  checked={!!form.include}
                  onCheckedChange={(checked) => setForm((f) => ({ ...f, include: checked }))}
                />
                <Label>Include in TXT export</Label>
              </div>
            </div>
          )}
          <SheetFooter>
            <Button
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending}
              className="bg-[#1e3a5f] hover:bg-[#16304f]"
            >
              {saveMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
