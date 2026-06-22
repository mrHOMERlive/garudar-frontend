import React, { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/api/apiClient';
import { toast } from 'sonner';
import OpsHeader from '@/components/ops/OpsHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, Loader2, Save } from 'lucide-react';

const STATUSES = ['NEW', 'EXPORTED', 'EXECUTED', 'CANCELLED'];

function OrderRow({ order, onSaved }) {
  const [form, setForm] = useState({
    reward: order.reward ?? '',
    rate_fixation_date: order.rate_fixation_date ?? '',
    execution_date: order.execution_date ?? '',
    status: order.status || 'NEW',
  });

  const dirty =
    String(form.reward ?? '') !== String(order.reward ?? '') ||
    (form.rate_fixation_date || '') !== (order.rate_fixation_date || '') ||
    (form.execution_date || '') !== (order.execution_date || '') ||
    (form.status || 'NEW') !== (order.status || 'NEW');

  const mutation = useMutation({
    mutationFn: () =>
      apiClient.opsUpdateOrder(order.id, {
        reward: form.reward === '' || form.reward === null ? null : Number(form.reward),
        rate_fixation_date: form.rate_fixation_date || null,
        execution_date: form.execution_date || null,
        status: form.status,
      }),
    onSuccess: () => {
      toast.success(`Order ${order.ord_ref} saved`);
      onSaved();
    },
    onError: (e) => toast.error(e.message),
  });

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  return (
    <TableRow>
      <TableCell className="font-mono text-xs whitespace-nowrap">{order.ord_ref}</TableCell>
      <TableCell className="text-sm">
        {order.client_number != null ? `${order.client_number} — ` : ''}
        {order.client_name || ''}
      </TableCell>
      <TableCell className="text-right whitespace-nowrap">
        {order.amount != null ? Number(order.amount).toLocaleString() : '—'}
      </TableCell>
      <TableCell className="text-sm">{order.currency || '—'}</TableCell>
      <TableCell className="w-28">
        <Input
          type="number"
          step="0.01"
          className="h-8"
          value={form.reward ?? ''}
          onChange={set('reward')}
          placeholder="—"
        />
      </TableCell>
      <TableCell className="w-40">
        <Input type="date" className="h-8" value={form.rate_fixation_date || ''} onChange={set('rate_fixation_date')} />
      </TableCell>
      <TableCell className="w-36">
        <select className="w-full border rounded h-8 px-2 text-sm" value={form.status} onChange={set('status')}>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </TableCell>
      <TableCell className="w-40">
        <Input type="date" className="h-8" value={form.execution_date || ''} onChange={set('execution_date')} />
      </TableCell>
      <TableCell className="text-right">
        <Button
          size="sm"
          variant="outline"
          disabled={!dirty || mutation.isPending}
          onClick={() => mutation.mutate()}
          title={dirty ? 'Save changes' : 'No changes'}
        >
          {mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        </Button>
      </TableCell>
    </TableRow>
  );
}

export default function OpsOrders() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('');
  const [clientFilter, setClientFilter] = useState('');

  const { data: clients = [] } = useQuery({
    queryKey: ['ops-clients'],
    queryFn: () => apiClient.opsGetClients(),
  });

  const filters = useMemo(() => {
    const f = {};
    if (statusFilter) f.status = statusFilter;
    if (clientFilter) f.client_id = clientFilter;
    return f;
  }, [statusFilter, clientFilter]);

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['ops-orders', filters],
    queryFn: () => apiClient.opsGetOrders(filters),
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ['ops-orders'] });

  const sortedClients = useMemo(
    () => clients.filter((c) => c.number != null).sort((a, b) => a.number - b.number),
    [clients]
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <OpsHeader title="Orders Ledger" subtitle="Persisted orders — reward, dates, status" backTo="OpsDashboard" />
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-3">
            <CardTitle className="text-[#1e3a5f]">Orders</CardTitle>
            <div className="flex items-end gap-3 flex-wrap">
              <div className="space-y-1">
                <Label className="text-xs">Status</Label>
                <select
                  className="border rounded h-9 px-2 text-sm w-36"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">All</option>
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Client</Label>
                <select
                  className="border rounded h-9 px-2 text-sm w-56"
                  value={clientFilter}
                  onChange={(e) => setClientFilter(e.target.value)}
                >
                  <option value="">All</option>
                  {sortedClients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.number} — {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <Button
                variant="outline"
                onClick={() => apiClient.opsExportOrders(filters).catch((e) => toast.error(e.message))}
              >
                <Download className="w-4 h-4 mr-2" />
                Export XLSX
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="w-6 h-6 animate-spin text-[#1e3a5f]" />
              </div>
            ) : orders.length === 0 ? (
              <p className="text-slate-500 text-sm py-6 text-center">
                No orders yet — they appear here once a batch with assigned ORD numbers is exported to TXT.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Currency</TableHead>
                      <TableHead>Reward</TableHead>
                      <TableHead>Rate-fix date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Execution date</TableHead>
                      <TableHead className="text-right">Save</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <OrderRow key={order.id} order={order} onSaved={refresh} />
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
