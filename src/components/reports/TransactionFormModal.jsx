import React, { useState } from 'react';
import apiClient from '@/api/apiClient';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { toast } from 'sonner';

const EMPTY = {
  transaction_id: '', date: '', customer_report_id: '',
  sender_name: '', sender_address: '',
  sender_bank_bic: '', sender_bank_name: '', account_holder_name: '', account_number: '',
  transaction_type: '', transaction_purpose: '', fund_source: '', transaction_method: '',
  currency: '', amount: '',
  recipient_name: '', recipient_address: '', transfer_fee: '',
  beneficiary_type: '', risk_level: '', dttot_check: false, dpppspm_check: false
};

export default function TransactionFormModal({ record, onClose, onSaved }) {
  const [form, setForm] = useState(record ? {
    ...EMPTY, ...record,
    amount: record.amount ?? '',
    transfer_fee: record.transfer_fee ?? ''
  } : { ...EMPTY });

  const saveMutation = useMutation({
    mutationFn: (data) => record
      ? apiClient.updateTransactionReport(record.id, data)
      : apiClient.createTransactionReport(data),
    onSuccess: () => { toast.success(record ? 'Record updated' : 'Record created'); onSaved(); }
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    saveMutation.mutate({
      ...form,
      customer_report_id: form.customer_report_id || null,
      amount: form.amount !== '' ? Number(form.amount) : undefined,
      transfer_fee: form.transfer_fee !== '' ? Number(form.transfer_fee) : undefined,
    });
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{record ? 'Edit Transaction Record' : 'Add Transaction Record'}</DialogTitle>
          <DialogDescription className="sr-only">
            Form to {record ? 'edit' : 'add'} a transaction record
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4 pt-2">

          {/* Basic */}
          <div className="space-y-1">
            <Label>Transaction ID *</Label>
            <Input value={form.transaction_id || ''} onChange={e => set('transaction_id', e.target.value)} required />
          </div>
          <div className="space-y-1">
            <Label>Date *</Label>
            <Input type="date" value={form.date || ''} onChange={e => set('date', e.target.value)} required />
          </div>
          <div className="space-y-1">
            <Label>Customer Report ID</Label>
            <Input type="number" value={form.customer_report_id || ''} onChange={e => set('customer_report_id', e.target.value ? Number(e.target.value) : null)} placeholder="Link to customer" />
          </div>

          {/* Sender */}
          <div className="col-span-2 pt-1 border-t">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Sender Details</p>
          </div>
          <div className="space-y-1">
            <Label>Sender Name</Label>
            <Input value={form.sender_name || ''} onChange={e => set('sender_name', e.target.value)} />
          </div>
          <div className="col-span-2 space-y-1">
            <Label>Sender Address</Label>
            <Input value={form.sender_address || ''} onChange={e => set('sender_address', e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>Sender Bank BIC</Label>
            <Input value={form.sender_bank_bic || ''} onChange={e => set('sender_bank_bic', e.target.value)} placeholder="e.g. BMRIIDJAXXX" />
          </div>
          <div className="space-y-1">
            <Label>Sender Bank Name</Label>
            <Input value={form.sender_bank_name || ''} onChange={e => set('sender_bank_name', e.target.value)} placeholder="e.g. PT Bank Mandiri" />
          </div>
          <div className="space-y-1">
            <Label>Account Holder Name</Label>
            <Input value={form.account_holder_name || ''} onChange={e => set('account_holder_name', e.target.value)} placeholder="e.g. PT Garuda Arma Nusa" />
          </div>
          <div className="space-y-1">
            <Label>Account Number</Label>
            <Input value={form.account_number || ''} onChange={e => set('account_number', e.target.value)} />
          </div>

          {/* Transaction */}
          <div className="col-span-2 pt-1 border-t">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Transaction Details</p>
          </div>
          <div className="space-y-1">
            <Label>Transaction Type</Label>
            <Select value={form.transaction_type} onValueChange={v => set('transaction_type', v)}>
              <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ingoing">Ingoing</SelectItem>
                <SelectItem value="outgoing">Outgoing</SelectItem>
                <SelectItem value="domestic">Domestic</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Transaction Purpose (Tujuan Transaksi)</Label>
            <Input value={form.transaction_purpose || ''} onChange={e => set('transaction_purpose', e.target.value)} placeholder="e.g. goods, services, grants…" />
          </div>
          <div className="space-y-1">
            <Label>Sumber Dana (Fund Source)</Label>
            <Input value={form.fund_source || ''} onChange={e => set('fund_source', e.target.value)} placeholder="e.g. Tabungan, Gaji…" />
          </div>
          <div className="space-y-1">
            <Label>Metode Transaksi (Method)</Label>
            <Input value={form.transaction_method || ''} onChange={e => set('transaction_method', e.target.value)} placeholder="e.g. Transfer, Cash…" />
          </div>
          <div className="space-y-1">
            <Label>Currency</Label>
            <Input value={form.currency || ''} onChange={e => set('currency', e.target.value)} placeholder="USD, EUR, IDR…" />
          </div>
          <div className="space-y-1">
            <Label>Amount</Label>
            <Input type="number" step="any" value={form.amount} onChange={e => set('amount', e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>Transfer Fee</Label>
            <Input type="number" step="any" value={form.transfer_fee} onChange={e => set('transfer_fee', e.target.value)} placeholder="0.00" />
          </div>

          {/* Recipient */}
          <div className="col-span-2 pt-1 border-t">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Recipient Details</p>
          </div>
          <div className="space-y-1">
            <Label>Recipient Name</Label>
            <Input value={form.recipient_name || ''} onChange={e => set('recipient_name', e.target.value)} />
          </div>
          <div className="col-span-2 space-y-1">
            <Label>Recipient Address</Label>
            <Input value={form.recipient_address || ''} onChange={e => set('recipient_address', e.target.value)} />
          </div>

          {/* Compliance */}
          <div className="col-span-2 pt-1 border-t">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Compliance</p>
          </div>
          <div className="space-y-1">
            <Label>Beneficiary Type</Label>
            <Select value={form.beneficiary_type} onValueChange={v => set('beneficiary_type', v)}>
              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="MC">MC</SelectItem>
                <SelectItem value="Bank">Bank</SelectItem>
                <SelectItem value="Individual">Individual</SelectItem>
                <SelectItem value="Corporate">Corporate</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Risk Level</Label>
            <Select value={form.risk_level} onValueChange={v => set('risk_level', v)}>
              <SelectTrigger><SelectValue placeholder="Select level" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <Checkbox id="dttot" checked={!!form.dttot_check} onCheckedChange={v => set('dttot_check', v)} />
            <Label htmlFor="dttot">DTTOT CHECK (Yes)</Label>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <Checkbox id="dpppspm" checked={!!form.dpppspm_check} onCheckedChange={v => set('dpppspm_check', v)} />
            <Label htmlFor="dpppspm">DPPPSPM CHECK (Yes)</Label>
          </div>

          <div className="col-span-2 flex justify-end gap-2 pt-2 border-t">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="bg-[#1e3a5f] text-white" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? 'Saving…' : record ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}