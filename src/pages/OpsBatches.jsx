import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/api/apiClient';
import { toast } from 'sonner';
import OpsHeader from '@/components/ops/OpsHeader';
import DropZone from '@/components/ops/DropZone';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Copy, FileSpreadsheet, FileText, Loader2, Trash2 } from 'lucide-react';

const SOURCE_TYPES = [
  {
    value: 'TYPE1_GPB_EXCEL',
    label: 'Type 1 — GPB (Excel)',
    short: 'GPB (Excel)',
    hint: 'Regular Excel payment orders',
    accept: ['.xls', '.xlsx', '.xlsm'],
    icon: FileSpreadsheet,
  },
  {
    value: 'TYPE2_VTB_PDF',
    label: 'Type 2 — VTB (PDF)',
    short: 'VTB (PDF)',
    hint: 'Payment assignment PDFs',
    accept: ['.pdf'],
    icon: FileText,
  },
  {
    value: 'TYPE3_SPB_EXCEL',
    label: 'Type 3 — SPB (Excel)',
    short: 'SPB (Excel)',
    hint: 'Staff-layout Excel orders',
    accept: ['.xls', '.xlsx', '.xlsm'],
    icon: FileSpreadsheet,
  },
];

export const sourceTypeLabel = (value) => SOURCE_TYPES.find((s) => s.value === value)?.label || value;

// Encode/decode a company+alias pair for the <Select> value.
const ACCOUNT_SEP = '␟';
const encodeAccount = (companyCode, alias) => `${companyCode}${ACCOUNT_SEP}${alias}`;
const decodeAccount = (key) => {
  const [companyCode, alias] = (key || '').split(ACCOUNT_SEP);
  return { companyCode, alias };
};

export default function OpsBatches() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Selected account-set: "<companyCode>␟<alias>"
  const [accountKey, setAccountKey] = useState('');
  const [busyType, setBusyType] = useState(null);

  const { data: companies = [] } = useQuery({
    queryKey: ['ops-companies'],
    queryFn: () => apiClient.opsGetCompanies(),
  });

  const { data: batches = [], isLoading } = useQuery({
    queryKey: ['ops-batches'],
    queryFn: () => apiClient.opsGetBatches(),
  });

  // Flatten companies -> [{ companyCode, companyName, alias }] account-sets.
  const accountSets = useMemo(() => {
    const out = [];
    for (const c of companies) {
      if (c.is_active === false) continue;
      const aliases = [];
      for (const acc of c.debit_accounts || []) {
        if (acc.alias && !aliases.includes(acc.alias)) aliases.push(acc.alias);
      }
      for (const alias of aliases) {
        out.push({ companyCode: c.code, companyName: c.name, alias });
      }
    }
    return out;
  }, [companies]);

  const selected = accountKey ? decodeAccount(accountKey) : null;

  const createMutation = useMutation({
    mutationFn: ({ sType, files }) => {
      if (!selected) return Promise.reject(new Error('Select an account first'));
      return apiClient.opsCreateBatch(selected.companyCode, sType, files, selected.alias);
    },
    onMutate: ({ sType }) => setBusyType(sType),
    onSettled: () => setBusyType(null),
    onSuccess: (batch) => {
      queryClient.invalidateQueries({ queryKey: ['ops-batches'] });
      if (batch.parse_errors?.length) {
        toast.warning(`Batch created with ${batch.parse_errors.length} file error(s)`);
      } else {
        toast.success(`Batch ${batch.batch_name} created (${batch.row_count} rows)`);
      }
      navigate(`/opsbatcheditor?id=${batch.id}`);
    },
    onError: (error) => toast.error(error.message),
  });

  const cloneMutation = useMutation({
    mutationFn: (batchId) => apiClient.opsCloneBatch(batchId),
    onSuccess: (batch) => {
      queryClient.invalidateQueries({ queryKey: ['ops-batches'] });
      toast.success(`Cloned to ${batch.batch_name}`);
      navigate(`/opsbatcheditor?id=${batch.id}`);
    },
    onError: (error) => toast.error(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (batchId) => apiClient.opsDeleteBatch(batchId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ops-batches'] });
      toast.success('Batch deleted');
    },
    onError: (error) => toast.error(error.message),
  });

  const noAccount = !selected;

  return (
    <div className="min-h-screen bg-slate-50">
      <OpsHeader title="Payment Orders" subtitle="Drop заявки by bank, edit, export TXT" />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Intake: pick account-set, then drop into the matching bank zone */}
        <Card>
          <CardHeader>
            <CardTitle className="text-[#1e3a5f]">New batch — drop by bank</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-end gap-4">
              <div className="space-y-1 w-72">
                <Label>Account (company · alias)</Label>
                <Select value={accountKey} onValueChange={setAccountKey}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an account-set" />
                  </SelectTrigger>
                  <SelectContent>
                    {accountSets.length === 0 ? (
                      <div className="px-3 py-2 text-sm text-slate-400">No accounts — add them in Settings</div>
                    ) : (
                      accountSets.map((a) => (
                        <SelectItem
                          key={encodeAccount(a.companyCode, a.alias)}
                          value={encodeAccount(a.companyCode, a.alias)}
                        >
                          {a.companyName} · {a.alias}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              {noAccount && (
                <p className="text-sm text-amber-600 pb-2">Pick an account-set to enable the drop zones.</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {SOURCE_TYPES.map((t) => (
                <DropZone
                  key={t.value}
                  title={t.short}
                  hint={t.hint}
                  icon={t.icon}
                  accept={t.accept}
                  disabled={noAccount}
                  busy={busyType === t.value}
                  onFiles={(files) => createMutation.mutate({ sType: t.value, files })}
                  onReject={(msg) => toast.error(msg)}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Batch list */}
        <Card>
          <CardHeader>
            <CardTitle className="text-[#1e3a5f]">Batches</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="w-6 h-6 animate-spin text-[#1e3a5f]" />
              </div>
            ) : batches.length === 0 ? (
              <p className="text-slate-500 text-sm py-6 text-center">
                No batches yet — drop files into a bank zone above.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Batch</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Account</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Rows</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {batches.map((batch) => (
                    <TableRow
                      key={batch.id}
                      className="cursor-pointer hover:bg-slate-50"
                      onClick={() => navigate(`/opsbatcheditor?id=${batch.id}`)}
                    >
                      <TableCell className="font-medium">{batch.batch_name}</TableCell>
                      <TableCell>{batch.company_name || batch.company_code}</TableCell>
                      <TableCell className="text-sm text-slate-500">{batch.account_alias || '—'}</TableCell>
                      <TableCell className="text-sm">{sourceTypeLabel(batch.source_type)}</TableCell>
                      <TableCell>{batch.row_count}</TableCell>
                      <TableCell>
                        <Badge
                          className={
                            batch.status === 'EXPORTED'
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100'
                              : 'bg-amber-100 text-amber-800 hover:bg-amber-100'
                          }
                        >
                          {batch.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-slate-500">
                        {batch.created_at ? new Date(batch.created_at).toLocaleString() : ''}
                      </TableCell>
                      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-end gap-2">
                          {batch.status === 'EXPORTED' && (
                            <Button
                              size="sm"
                              variant="outline"
                              title="Clone to a new draft batch"
                              onClick={() => cloneMutation.mutate(batch.id)}
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                          )}
                          {batch.status === 'DRAFT' && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 hover:text-red-700"
                              title="Delete draft batch"
                              onClick={() => {
                                if (window.confirm(`Delete batch ${batch.batch_name}?`)) {
                                  deleteMutation.mutate(batch.id);
                                }
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
