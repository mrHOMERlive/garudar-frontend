import React, { useState, useEffect } from 'react';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import OrderStatusBadge from '@/components/orders/OrderStatusBadge';
import { parseStatusHistory } from '@/components/utils/statusHistoryHelper';
import moment from 'moment';

export default function StaffOrderDrawer({ order, open, onClose, onSave }) {
  const [invoiceReceived, setInvoiceReceived] = useState(false);
  const [paymentProof, setPaymentProof] = useState(false);
  const [remunerationPercent, setRemunerationPercent] = useState('');
  const [sumToBePaid, setSumToBePaid] = useState('');
  const [currencyToBePaid, setCurrencyToBePaid] = useState('USD');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [staffDescription, setStaffDescription] = useState('');
  const [nonMandiri, setNonMandiri] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (order && open) {
      setInvoiceReceived(!!order.invoice_received);
      setPaymentProof(!!order.payment_proof);
      setRemunerationPercent(order.remuneration_percent ?? '');
      setSumToBePaid(order.sum_to_be_paid ?? '');
      setCurrencyToBePaid(order.currency_to_be_paid || order.currency || 'USD');
      setInvoiceNumber(order.invoice_number || '');
      setStaffDescription(order.staff_description || '');
      setNonMandiri(!!order.non_mandiri_execution);
    }
  }, [order, open]);

  if (!order) return null;

  const handleSave = async () => {
    setSaving(true);
    try {
      const updates = {
        invoice_received: invoiceReceived,
        payment_proof: paymentProof,
        remuneration_percent: remunerationPercent !== '' ? parseFloat(remunerationPercent) : null,
        sum_to_be_paid: sumToBePaid !== '' ? parseFloat(sumToBePaid) : null,
        currency_to_be_paid: currencyToBePaid,
        invoice_number: invoiceNumber,
        staff_description: staffDescription,
        non_mandiri_execution: nonMandiri
      };

      await onSave(updates);
    } finally {
      setSaving(false);
    }
  };

  const historyEntries = parseStatusHistory(order.status_history);

  return (
    <Sheet open={open} onOpenChange={(val) => !val && onClose()}>
      <SheetContent className="w-full sm:max-w-lg bg-slate-900 border-slate-700 text-white overflow-y-auto">
        <SheetHeader className="mb-4">
          <SheetTitle className="text-white flex items-center gap-3">
            #{order.order_number}
            <OrderStatusBadge status={order.status} />
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-4 pb-24">
          {/* Order Info */}
          <div className="bg-slate-800 rounded p-3 text-sm space-y-1">
            <div><span className="text-slate-400">Client:</span> {order.client_name || order.client_id}</div>
            <div><span className="text-slate-400">Amount:</span> <span className="text-emerald-400 font-semibold">{order.amount?.toLocaleString()} {order.currency}</span></div>
            <div><span className="text-slate-400">Beneficiary:</span> {order.beneficiary_name}</div>
            <div><span className="text-slate-400">Bank:</span> {order.bank_name} ({order.bic})</div>
          </div>

          <Separator className="bg-slate-700" />

          {/* Checkboxes */}
          <div className="grid grid-cols-2 gap-3">
            <label className="flex items-center gap-2 cursor-pointer bg-slate-800 p-2 rounded">
              <input 
                type="checkbox" 
                checked={invoiceReceived} 
                onChange={(e) => setInvoiceReceived(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm">Invoice Received</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer bg-slate-800 p-2 rounded">
              <input 
                type="checkbox" 
                checked={paymentProof} 
                onChange={(e) => setPaymentProof(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm">Payment Proof</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer bg-slate-800 p-2 rounded col-span-2">
              <input 
                type="checkbox" 
                checked={nonMandiri} 
                onChange={(e) => setNonMandiri(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm text-orange-400">Non-Mandiri (exclude from TXT)</span>
            </label>
          </div>

          {/* Remuneration */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label className="text-xs">Remun %</Label>
              <Input
                type="number"
                value={remunerationPercent}
                onChange={(e) => setRemunerationPercent(e.target.value)}
                className="bg-slate-800 border-slate-600 mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">Sum to Pay</Label>
              <Input
                type="number"
                value={sumToBePaid}
                onChange={(e) => setSumToBePaid(e.target.value)}
                className="bg-slate-800 border-slate-600 mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">Currency</Label>
              <select
                value={currencyToBePaid}
                onChange={(e) => setCurrencyToBePaid(e.target.value)}
                className="w-full h-10 px-2 rounded bg-slate-800 border border-slate-600 text-white mt-1"
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="CNY">CNY</option>
                <option value="IDR">IDR</option>
              </select>
            </div>
          </div>

          {/* Invoice Number */}
          <div>
            <Label className="text-xs">Invoice Number</Label>
            <Input
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
              className="bg-slate-800 border-slate-600 mt-1"
            />
          </div>

          {/* Notes */}
          <div>
            <Label className="text-xs">Staff Notes</Label>
            <Textarea
              value={staffDescription}
              onChange={(e) => setStaffDescription(e.target.value)}
              className="bg-slate-800 border-slate-600 mt-1"
              rows={2}
            />
          </div>

          {/* History */}
          {historyEntries.length > 0 && (
            <div>
              <Label className="text-xs text-slate-400">History</Label>
              <div className="space-y-1 mt-1 max-h-20 overflow-y-auto">
                {historyEntries.slice().reverse().map((h, i) => (
                  <div key={i} className="flex justify-between text-xs bg-slate-800 rounded p-2">
                    <span>{h.status?.replace('_', ' ')}</span>
                    <span className="text-slate-500">{moment(h.timestamp).format('DD/MM HH:mm')}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-slate-900 border-t border-slate-700 flex gap-3">
          <Button 
            type="button"
            variant="outline" 
            onClick={onClose} 
            className="flex-1 border-slate-600"
          >
            Cancel
          </Button>
          <Button 
            type="button"
            onClick={handleSave} 
            disabled={saving} 
            className="flex-1 bg-teal-600 hover:bg-teal-700"
          >
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}