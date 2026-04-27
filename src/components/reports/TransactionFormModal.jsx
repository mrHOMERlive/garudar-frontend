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
import { t } from '@/components/utils/language';

const EMPTY = {
  transaction_id: '',
  date: '',
  customer_report_id: '',
  sender_name: '',
  sender_address: '',
  sender_bank_bic: '',
  sender_bank_name: '',
  account_holder_name: '',
  account_number: '',
  transaction_type: '',
  transaction_purpose: '',
  fund_source: '',
  transaction_method: '',
  currency: '',
  amount: '',
  recipient_name: '',
  recipient_address: '',
  transfer_fee: '',
  beneficiary_type: '',
  risk_level: '',
  dttot_check: false,
  dpppspm_check: false,
};

export default function TransactionFormModal({ record, onClose, onSaved }) {
  const [form, setForm] = useState(
    record
      ? {
          ...EMPTY,
          ...record,
          amount: record.amount ?? '',
          transfer_fee: record.transfer_fee ?? '',
        }
      : { ...EMPTY }
  );

  const saveMutation = useMutation({
    mutationFn: (data) =>
      record ? apiClient.updateTransactionReport(record.id, data) : apiClient.createTransactionReport(data),
    onSuccess: () => {
      toast.success(record ? t('recordUpdatedToast') : t('recordCreatedToast'));
      onSaved();
    },
  });

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

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
          <DialogTitle>{record ? t('txnEditTitle') : t('txnAddTitle')}</DialogTitle>
          <DialogDescription className="sr-only">
            {record ? t('txnEditDescription') : t('txnAddDescription')}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4 pt-2">
          {/* Basic */}
          <div className="space-y-1">
            <Label>{t('txnTransactionId')}</Label>
            <Input value={form.transaction_id || ''} onChange={(e) => set('transaction_id', e.target.value)} required />
          </div>
          <div className="space-y-1">
            <Label>{t('txnDate')}</Label>
            <Input type="date" value={form.date || ''} onChange={(e) => set('date', e.target.value)} required />
          </div>
          <div className="space-y-1">
            <Label>{t('txnCustomerReportId')}</Label>
            <Input
              type="number"
              value={form.customer_report_id || ''}
              onChange={(e) => set('customer_report_id', e.target.value ? Number(e.target.value) : null)}
              placeholder={t('txnLinkToCustomer')}
            />
          </div>

          {/* Sender */}
          <div className="col-span-2 pt-1 border-t">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {t('txnSenderDetailsHeader')}
            </p>
          </div>
          <div className="space-y-1">
            <Label>{t('txnSenderName')}</Label>
            <Input value={form.sender_name || ''} onChange={(e) => set('sender_name', e.target.value)} />
          </div>
          <div className="col-span-2 space-y-1">
            <Label>{t('txnSenderAddress')}</Label>
            <Input value={form.sender_address || ''} onChange={(e) => set('sender_address', e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>{t('txnSenderBankBic')}</Label>
            <Input
              value={form.sender_bank_bic || ''}
              onChange={(e) => set('sender_bank_bic', e.target.value)}
              placeholder="e.g. BMRIIDJAXXX"
            />
          </div>
          <div className="space-y-1">
            <Label>{t('txnSenderBankName')}</Label>
            <Input
              value={form.sender_bank_name || ''}
              onChange={(e) => set('sender_bank_name', e.target.value)}
              placeholder="e.g. PT Bank Mandiri"
            />
          </div>
          <div className="space-y-1">
            <Label>{t('txnAccountHolderName')}</Label>
            <Input
              value={form.account_holder_name || ''}
              onChange={(e) => set('account_holder_name', e.target.value)}
              placeholder="e.g. PT Garuda Arma Nusa"
            />
          </div>
          <div className="space-y-1">
            <Label>{t('txnAccountNumber')}</Label>
            <Input value={form.account_number || ''} onChange={(e) => set('account_number', e.target.value)} />
          </div>

          {/* Transaction */}
          <div className="col-span-2 pt-1 border-t">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {t('txnTransactionDetailsHeader')}
            </p>
          </div>
          <div className="space-y-1">
            <Label>{t('txnTransactionType')}</Label>
            <Select value={form.transaction_type} onValueChange={(v) => set('transaction_type', v)}>
              <SelectTrigger>
                <SelectValue placeholder={t('txnSelectType')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ingoing">{t('txnIngoing')}</SelectItem>
                <SelectItem value="outgoing">{t('txnOutgoing')}</SelectItem>
                <SelectItem value="domestic">{t('txnDomestic')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>{t('txnTransactionPurpose')}</Label>
            <Input
              value={form.transaction_purpose || ''}
              onChange={(e) => set('transaction_purpose', e.target.value)}
              placeholder={t('txnTransactionPurposeHint')}
            />
          </div>
          <div className="space-y-1">
            <Label>{t('txnFundSource')}</Label>
            <Input
              value={form.fund_source || ''}
              onChange={(e) => set('fund_source', e.target.value)}
              placeholder={t('txnFundSourceHint')}
            />
          </div>
          <div className="space-y-1">
            <Label>{t('txnTransactionMethod')}</Label>
            <Input
              value={form.transaction_method || ''}
              onChange={(e) => set('transaction_method', e.target.value)}
              placeholder={t('txnTransactionMethodHint')}
            />
          </div>
          <div className="space-y-1">
            <Label>{t('txnCurrency')}</Label>
            <Input
              value={form.currency || ''}
              onChange={(e) => set('currency', e.target.value)}
              placeholder={t('txnCurrencyHint')}
            />
          </div>
          <div className="space-y-1">
            <Label>{t('txnAmount')}</Label>
            <Input type="number" step="any" value={form.amount} onChange={(e) => set('amount', e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>{t('txnTransferFee')}</Label>
            <Input
              type="number"
              step="any"
              value={form.transfer_fee}
              onChange={(e) => set('transfer_fee', e.target.value)}
              placeholder="0.00"
            />
          </div>

          {/* Recipient */}
          <div className="col-span-2 pt-1 border-t">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {t('txnRecipientDetailsHeader')}
            </p>
          </div>
          <div className="space-y-1">
            <Label>{t('txnRecipientName')}</Label>
            <Input value={form.recipient_name || ''} onChange={(e) => set('recipient_name', e.target.value)} />
          </div>
          <div className="col-span-2 space-y-1">
            <Label>{t('txnRecipientAddress')}</Label>
            <Input value={form.recipient_address || ''} onChange={(e) => set('recipient_address', e.target.value)} />
          </div>

          {/* Compliance */}
          <div className="col-span-2 pt-1 border-t">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('txnComplianceHeader')}</p>
          </div>
          <div className="space-y-1">
            <Label>{t('txnBeneficiaryType')}</Label>
            <Select value={form.beneficiary_type} onValueChange={(v) => set('beneficiary_type', v)}>
              <SelectTrigger>
                <SelectValue placeholder={t('txnSelect')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MC">MC</SelectItem>
                <SelectItem value="Bank">Bank</SelectItem>
                <SelectItem value="Individual">{t('staffKycTypeIndividual')}</SelectItem>
                <SelectItem value="Corporate">{t('staffKycTypeCorporate')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>{t('txnRiskLevel')}</Label>
            <Select value={form.risk_level} onValueChange={(v) => set('risk_level', v)}>
              <SelectTrigger>
                <SelectValue placeholder={t('txnSelectLevel')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">{t('txnRiskLow')}</SelectItem>
                <SelectItem value="medium">{t('txnRiskMedium')}</SelectItem>
                <SelectItem value="high">{t('txnRiskHigh')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <Checkbox id="dttot" checked={!!form.dttot_check} onCheckedChange={(v) => set('dttot_check', v)} />
            <Label htmlFor="dttot">{t('txnDttotCheck')}</Label>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <Checkbox id="dpppspm" checked={!!form.dpppspm_check} onCheckedChange={(v) => set('dpppspm_check', v)} />
            <Label htmlFor="dpppspm">{t('txnDpppspmCheck')}</Label>
          </div>

          <div className="col-span-2 flex justify-end gap-2 pt-2 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              {t('formCancel')}
            </Button>
            <Button type="submit" className="bg-[#1e3a5f] text-white" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? t('formSavingDots') : record ? t('formUpdate') : t('formCreate')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
