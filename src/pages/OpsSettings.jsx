import React, { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/api/apiClient';
import { toast } from 'sonner';
import OpsHeader from '@/components/ops/OpsHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Loader2, Pencil, Plus, Save, Search, Trash2 } from 'lucide-react';

// ----------------------------------------------------------------- Companies
function CompaniesTab() {
  const queryClient = useQueryClient();
  const { data: companies = [], isLoading } = useQuery({
    queryKey: ['ops-companies'],
    queryFn: () => apiClient.opsGetCompanies(),
  });

  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [newAccount, setNewAccount] = useState({ alias: '', currency: '', account_no: '' });

  useEffect(() => {
    if (editing) {
      setForm({
        name: editing.name || '',
        sender_email: editing.sender_email || '',
        invoice_number: editing.invoice_number || '',
        is_active: editing.is_active,
      });
    }
  }, [editing]);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['ops-companies'] });

  const saveMutation = useMutation({
    mutationFn: () => apiClient.opsUpdateCompany(editing.id, form),
    onSuccess: () => {
      invalidate();
      toast.success('Company updated');
      setEditing(null);
    },
    onError: (e) => toast.error(e.message),
  });

  const addAccountMutation = useMutation({
    mutationFn: (companyId) => apiClient.opsAddDebitAccount(companyId, newAccount),
    onSuccess: (company) => {
      invalidate();
      toast.success('Account added');
      setNewAccount({ alias: '', currency: '', account_no: '' });
      setEditing(company);
    },
    onError: (e) => toast.error(e.message),
  });

  const deleteAccountMutation = useMutation({
    mutationFn: ({ companyId, accountId }) => apiClient.opsDeleteDebitAccount(companyId, accountId),
    onSuccess: () => {
      invalidate();
      toast.success('Account removed');
      setEditing(null);
    },
    onError: (e) => toast.error(e.message),
  });

  if (isLoading) return <Loader2 className="w-6 h-6 animate-spin text-[#1e3a5f] mx-auto my-8" />;

  return (
    <div className="space-y-4">
      {companies.map((company) => (
        <Card key={company.id}>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-[#1e3a5f] text-base">
              {company.name} ({company.code}){' '}
              {!company.is_active && <span className="text-slate-400 text-sm">— inactive</span>}
            </CardTitle>
            <Button size="sm" variant="outline" onClick={() => setEditing(company)}>
              <Pencil className="w-4 h-4 mr-1" /> Edit
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm mb-3">
              <div>
                <span className="text-slate-500">Sender email (TXT): </span>
                {company.sender_email || <span className="text-amber-600">not set</span>}
              </div>
              <div>
                <span className="text-slate-500">Invoice number: </span>
                {company.invoice_number || <span className="text-amber-600">not set</span>}
              </div>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Alias</TableHead>
                  <TableHead>Currency</TableHead>
                  <TableHead>Debit account</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(company.debit_accounts || []).map((acc) => (
                  <TableRow key={acc.id}>
                    <TableCell>{acc.alias}</TableCell>
                    <TableCell>{acc.currency}</TableCell>
                    <TableCell className="font-mono">{acc.account_no}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ))}

      <Sheet open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <SheetContent className="overflow-y-auto sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>Edit {editing?.name}</SheetTitle>
          </SheetHeader>
          {editing && (
            <div className="space-y-4 py-4">
              <div className="space-y-1">
                <Label>Name</Label>
                <Input value={form.name || ''} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label>Sender email (used in TXT field 29)</Label>
                <Input
                  value={form.sender_email || ''}
                  onChange={(e) => setForm((f) => ({ ...f, sender_email: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <Label>Invoice number (injected when amount ≥ threshold)</Label>
                <Input
                  value={form.invoice_number || ''}
                  onChange={(e) => setForm((f) => ({ ...f, invoice_number: e.target.value }))}
                />
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={!!form.is_active} onCheckedChange={(v) => setForm((f) => ({ ...f, is_active: v }))} />
                <Label>Active</Label>
              </div>

              <div className="border-t pt-4 space-y-2">
                <Label className="font-semibold">Debit accounts</Label>
                {(editing.debit_accounts || []).map((acc) => (
                  <div key={acc.id} className="flex items-center gap-2 text-sm">
                    <span className="w-28 truncate" title={acc.alias}>
                      {acc.alias}
                    </span>
                    <span className="w-12">{acc.currency}</span>
                    <span className="font-mono flex-1">{acc.account_no}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-600"
                      onClick={() => deleteAccountMutation.mutate({ companyId: editing.id, accountId: acc.id })}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                <div className="flex items-end gap-2 pt-2">
                  <div className="space-y-1 w-28">
                    <Label className="text-xs">Alias</Label>
                    <Input
                      value={newAccount.alias}
                      placeholder="Mandiri"
                      onChange={(e) => setNewAccount((a) => ({ ...a, alias: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1 w-20">
                    <Label className="text-xs">Currency</Label>
                    <Input
                      value={newAccount.currency}
                      onChange={(e) => setNewAccount((a) => ({ ...a, currency: e.target.value.toUpperCase() }))}
                    />
                  </div>
                  <div className="space-y-1 flex-1">
                    <Label className="text-xs">Account number</Label>
                    <Input
                      value={newAccount.account_no}
                      onChange={(e) => setNewAccount((a) => ({ ...a, account_no: e.target.value }))}
                    />
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={!newAccount.alias || !newAccount.currency || !newAccount.account_no}
                    onClick={() => addAccountMutation.mutate(editing.id)}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
          <SheetFooter>
            <Button onClick={() => saveMutation.mutate()} className="bg-[#1e3a5f] hover:bg-[#16304f]">
              <Save className="w-4 h-4 mr-2" /> Save
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}

// ----------------------------------------------------------------- Thresholds
function ThresholdsTab() {
  const queryClient = useQueryClient();
  const { data: thresholds = [], isLoading } = useQuery({
    queryKey: ['ops-thresholds'],
    queryFn: () => apiClient.opsGetThresholds(),
  });
  const [items, setItems] = useState(null);

  const rows = items ?? thresholds;

  const saveMutation = useMutation({
    mutationFn: () => apiClient.opsSaveThresholds(rows.filter((r) => r.currency && r.amount !== '')),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ops-thresholds'] });
      setItems(null);
      toast.success('Thresholds saved');
    },
    onError: (e) => toast.error(e.message),
  });

  if (isLoading) return <Loader2 className="w-6 h-6 animate-spin text-[#1e3a5f] mx-auto my-8" />;

  const update = (i, field, value) => {
    const next = rows.map((r, idx) => (idx === i ? { ...r, [field]: value } : r));
    setItems(next);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base text-[#1e3a5f]">
          Invoice thresholds (amount ≥ threshold → invoice required)
        </CardTitle>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => setItems([...(rows || []), { currency: '', amount: '' }])}>
            <Plus className="w-4 h-4 mr-1" /> Add
          </Button>
          <Button size="sm" onClick={() => saveMutation.mutate()} className="bg-[#1e3a5f] hover:bg-[#16304f]">
            <Save className="w-4 h-4 mr-1" /> Save
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {rows.map((row, i) => (
          <div key={i} className="flex items-center gap-3">
            <Input
              className="w-28"
              value={row.currency}
              placeholder="USD"
              onChange={(e) => update(i, 'currency', e.target.value.toUpperCase())}
            />
            <Input
              className="w-48"
              type="number"
              value={row.amount}
              placeholder="50000"
              onChange={(e) => update(i, 'amount', e.target.value)}
            />
            <Button
              size="sm"
              variant="ghost"
              className="text-red-600"
              onClick={() => setItems(rows.filter((_, idx) => idx !== i))}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// ----------------------------------------------------------------- Clients
function ClientsTab() {
  const queryClient = useQueryClient();
  const { data: clients = [], isLoading } = useQuery({
    queryKey: ['ops-clients'],
    queryFn: () => apiClient.opsGetClients(),
  });

  const [editing, setEditing] = useState(null); // null | 'new' | client object
  const [form, setForm] = useState({});

  useEffect(() => {
    if (editing && editing !== 'new') {
      setForm({ ...editing });
    } else if (editing === 'new') {
      setForm({
        name: '',
        country: '',
        default_bank_name: '',
        default_bic: '',
        default_account_no: '',
        notes: '',
        is_active: true,
      });
    }
  }, [editing]);

  const saveMutation = useMutation({
    mutationFn: () =>
      editing === 'new' ? apiClient.opsCreateClient(form) : apiClient.opsUpdateClient(editing.id, form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ops-clients'] });
      toast.success(editing === 'new' ? 'Client created' : 'Client updated');
      setEditing(null);
    },
    onError: (e) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => apiClient.opsDeleteClient(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ops-clients'] });
      toast.success('Client deleted');
    },
    onError: (e) => toast.error(e.message),
  });

  if (isLoading) return <Loader2 className="w-6 h-6 animate-spin text-[#1e3a5f] mx-auto my-8" />;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base text-[#1e3a5f]">Counterparty reference</CardTitle>
        <Button size="sm" onClick={() => setEditing('new')} className="bg-[#1e3a5f] hover:bg-[#16304f]">
          <Plus className="w-4 h-4 mr-1" /> Add client
        </Button>
      </CardHeader>
      <CardContent>
        {clients.length === 0 ? (
          <p className="text-slate-500 text-sm py-4 text-center">No clients yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>Bank</TableHead>
                <TableHead>BIC</TableHead>
                <TableHead>Account</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.map((client) => (
                <TableRow key={client.id} className={!client.is_active ? 'opacity-50' : ''}>
                  <TableCell className="font-medium">{client.name}</TableCell>
                  <TableCell>{client.country}</TableCell>
                  <TableCell className="text-sm">{client.default_bank_name}</TableCell>
                  <TableCell className="font-mono text-xs">{client.default_bic}</TableCell>
                  <TableCell className="font-mono text-xs">{client.default_account_no}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button size="sm" variant="outline" onClick={() => setEditing(client)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600"
                        onClick={() => {
                          if (window.confirm(`Delete client "${client.name}"?`)) deleteMutation.mutate(client.id);
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

        <Sheet open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
          <SheetContent className="overflow-y-auto sm:max-w-lg">
            <SheetHeader>
              <SheetTitle>{editing === 'new' ? 'New client' : `Edit ${editing?.name || ''}`}</SheetTitle>
            </SheetHeader>
            <div className="space-y-3 py-4">
              {[
                ['name', 'Name'],
                ['country', 'Country'],
                ['default_bank_name', 'Default bank name'],
                ['default_bic', 'Default BIC'],
                ['default_account_no', 'Default account number'],
                ['notes', 'Notes'],
              ].map(([field, label]) => (
                <div key={field} className="space-y-1">
                  <Label>{label}</Label>
                  <Input
                    value={form[field] || ''}
                    onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
                  />
                </div>
              ))}
              <div className="flex items-center gap-3">
                <Switch checked={!!form.is_active} onCheckedChange={(v) => setForm((f) => ({ ...f, is_active: v }))} />
                <Label>Active</Label>
              </div>
            </div>
            <SheetFooter>
              <Button
                disabled={!form.name}
                onClick={() => saveMutation.mutate()}
                className="bg-[#1e3a5f] hover:bg-[#16304f]"
              >
                <Save className="w-4 h-4 mr-2" /> Save
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </CardContent>
    </Card>
  );
}

// ----------------------------------------------------------------- BIC
function BicTab() {
  const queryClient = useQueryClient();
  const [query, setQuery] = useState('');
  const [newBic, setNewBic] = useState({ bic: '', bank_name: '' });

  const { data: results = [], isFetching } = useQuery({
    queryKey: ['ops-bic-admin', query],
    queryFn: () => apiClient.opsSearchBic(query),
  });

  const addMutation = useMutation({
    mutationFn: () => apiClient.opsAddBic(newBic),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ops-bic-admin'] });
      toast.success('BIC added to reference');
      setNewBic({ bic: '', bank_name: '' });
    },
    onError: (e) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (bic) => apiClient.opsDeleteBic(bic),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ops-bic-admin'] });
      toast.success('BIC removed');
    },
    onError: (e) => toast.error(e.message),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base text-[#1e3a5f]">BIC reference (validation set)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-end gap-2">
          <div className="space-y-1 w-44">
            <Label className="text-xs">BIC / SWIFT</Label>
            <Input
              value={newBic.bic}
              onChange={(e) => setNewBic((b) => ({ ...b, bic: e.target.value.toUpperCase() }))}
            />
          </div>
          <div className="space-y-1 flex-1">
            <Label className="text-xs">Bank name (optional)</Label>
            <Input value={newBic.bank_name} onChange={(e) => setNewBic((b) => ({ ...b, bank_name: e.target.value }))} />
          </div>
          <Button
            disabled={newBic.bic.length < 8}
            onClick={() => addMutation.mutate()}
            className="bg-[#1e3a5f] hover:bg-[#16304f]"
          >
            <Plus className="w-4 h-4 mr-1" /> Add
          </Button>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 absolute left-2 top-2.5 text-slate-400" />
          <Input
            placeholder="Search the reference..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        {isFetching ? (
          <Loader2 className="w-5 h-5 animate-spin text-[#1e3a5f] mx-auto" />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>BIC</TableHead>
                <TableHead>Bank name</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.map((r) => (
                <TableRow key={r.bic}>
                  <TableCell className="font-mono">{r.bic}</TableCell>
                  <TableCell className="text-sm">{r.bank_name}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-600"
                      onClick={() => deleteMutation.mutate(r.bic)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        <p className="text-xs text-slate-400">
          Showing up to 50 entries. The full set is imported from BIC.xlsx via scripts/import_ops_bic.py.
        </p>
      </CardContent>
    </Card>
  );
}

export default function OpsSettings() {
  return (
    <div className="min-h-screen bg-slate-50">
      <OpsHeader title="Settings" subtitle="Companies, thresholds, clients, BIC reference" />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="companies">
          <TabsList className="mb-4">
            <TabsTrigger value="companies">Companies & Accounts</TabsTrigger>
            <TabsTrigger value="thresholds">Thresholds</TabsTrigger>
            <TabsTrigger value="clients">Clients</TabsTrigger>
            <TabsTrigger value="bic">BIC Reference</TabsTrigger>
          </TabsList>
          <TabsContent value="companies">
            <CompaniesTab />
          </TabsContent>
          <TabsContent value="thresholds">
            <ThresholdsTab />
          </TabsContent>
          <TabsContent value="clients">
            <ClientsTab />
          </TabsContent>
          <TabsContent value="bic">
            <BicTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
