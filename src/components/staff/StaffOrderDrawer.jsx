import React, { useState, useEffect } from 'react';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import OrderStatusBadge from '@/components/orders/OrderStatusBadge';
import { parseStatusHistory, addStatusEntry } from '@/components/utils/statusHistoryHelper';
import apiClient from '@/api/apiClient';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Download, Upload, FileText } from 'lucide-react';
import { downloadWordTemplate } from '@/components/staff/utils/wordTemplateGenerator';
import moment from 'moment';

const ALL_STATUSES = ['created', 'draft', 'check', 'rejected', 'pending_payment', 'on_execution', 'released', 'cancelled'];

export default function StaffOrderDrawer({ order, open, onClose, onSave }) {
  const [status, setStatus] = useState('created');
  const [datePaid, setDatePaid] = useState('');
  const [dataFixing, setDataFixing] = useState('');
  const [remunerationType, setRemunerationType] = useState('PERCENT');
  const [remunerationPercentage, setRemunerationPercentage] = useState('');
  const [remunerationFixed, setRemunerationFixed] = useState('');
  const [clientPaymentCurrency, setClientPaymentCurrency] = useState('RUB');
  const [exchangeRate, setExchangeRate] = useState('');
  const [exchangeRateMode, setExchangeRateMode] = useState('manual');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [staffDescription, setStaffDescription] = useState('');
  const [invoiceReceived, setInvoiceReceived] = useState(false);
  const [paymentProof, setPaymentProof] = useState(false);
  const [datePaymentProof, setDatePaymentProof] = useState('');
  const [attachmentTransactionStatus, setAttachmentTransactionStatus] = useState('');
  const [nonMandiriExecution, setNonMandiriExecution] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingProof, setUploadingProof] = useState(false);
  const [uploadingSalesContract, setUploadingSalesContract] = useState(false);
  const [uploadingInvoice, setUploadingInvoice] = useState(false);
  const [uploadingOther, setUploadingOther] = useState(false);
  const [uploadingWordOrder, setUploadingWordOrder] = useState(false);
  
  const [ganBankName, setGanBankName] = useState('');
  const [ganBankAccount, setGanBankAccount] = useState('');
  const [dateReport, setDateReport] = useState('');
  const [amountToBePaid, setAmountToBePaid] = useState('');
  const [conversionMethod, setConversionMethod] = useState('none');
  const [baseCurrency, setBaseCurrency] = useState('');
  const [executingBank, setExecutingBank] = useState('');
  const [fxExecutingBank, setFxExecutingBank] = useState('');
  const [bankStatementInType, setBankStatementInType] = useState('');
  const [bankStatementInId, setBankStatementInId] = useState('');
  const [bankStatementOutType, setBankStatementOutType] = useState('');
  const [bankStatementOutId, setBankStatementOutId] = useState('');
  const [amountToBePaidTargetCur, setAmountToBePaidTargetCur] = useState('');
  const [amountPaidTargetCur, setAmountPaidTargetCur] = useState('');
  const [docPaidNo, setDocPaidNo] = useState('');
  const [docPaidDate, setDocPaidDate] = useState('');
  const [paymentProofNo, setPaymentProofNo] = useState('');
  const [paymentProofDate, setPaymentProofDate] = useState('');
  
  const [clientPaymentAccountId, setClientPaymentAccountId] = useState('');
  const [clientPaymentAccountName, setClientPaymentAccountName] = useState('');
  const [clientPaymentAccountNumber, setClientPaymentAccountNumber] = useState('');
  const [clientPaymentBankName, setClientPaymentBankName] = useState('');
  const [clientPaymentBankAddress, setClientPaymentBankAddress] = useState('');
  const [clientPaymentBankBic, setClientPaymentBankBic] = useState('');
  const [clientPaymentBankSwift, setClientPaymentBankSwift] = useState('');

  const { data: payeerAccounts = [] } = useQuery({
    queryKey: ['payeer-accounts'],
    queryFn: () => apiClient.getPayeerAccounts(),
    enabled: open,
  });

  const { data: terms } = useQuery({
    queryKey: ['order-terms', order?.orderId],
    queryFn: () => apiClient.getOrderTerms(order?.orderId),
    enabled: !!order?.orderId && open,
  });

  useEffect(() => {
    if (order && open) {
      setStatus(order.status || 'created');
      setDatePaid(order.datePaid || '');
      setDataFixing(order.dataFixing || '');
      setInvoiceNumber(order.invoiceNumber || '');
      setStaffDescription(order.staffDescription || '');
      setInvoiceReceived(order.invoiceReceived || false);
      setPaymentProof(order.paymentProof || false);
      setDatePaymentProof(order.datePaymentProof || '');
      setAttachmentTransactionStatus(order.attachmentTransactionStatus || '');
      setNonMandiriExecution(order.nonMandiriExecution || false);
      
      setGanBankName(order.ganBankName || '');
      setGanBankAccount(order.ganBankAccount || '');
      setDateReport(order.dateReport || '');
      setAmountToBePaid(order.amountToBePaid ?? '');
      setConversionMethod(order.conversionMethod || 'none');
      setBaseCurrency(order.baseCurrency || order.currency || '');
      setExecutingBank(order.executingBank || '');
      setFxExecutingBank(order.fxExecutingBank ?? '');
      setBankStatementInType(order.bankStatementInType || '');
      setBankStatementInId(order.bankStatementInId || '');
      setBankStatementOutType(order.bankStatementOutType || '');
      setBankStatementOutId(order.bankStatementOutId || '');
      setAmountToBePaidTargetCur(order.amountToBePaidTargetCur ?? '');
      setAmountPaidTargetCur(order.amountPaidTargetCur ?? '');
      setDocPaidNo(order.docPaidNo || '');
      setDocPaidDate(order.docPaidDate || '');
      setPaymentProofNo(order.paymentProofNo || '');
      setPaymentProofDate(order.paymentProofDate || '');
      
      setClientPaymentAccountId(order.clientPaymentAccountId || '');
      setClientPaymentAccountName(order.clientPaymentAccountName || '');
      setClientPaymentAccountNumber(order.clientPaymentAccountNumber || '');
      setClientPaymentBankName(order.clientPaymentBankName || '');
      setClientPaymentBankAddress(order.clientPaymentBankAddress || '');
      setClientPaymentBankBic(order.clientPaymentBankBic || '');
      setClientPaymentBankSwift(order.clientPaymentBankSwift || '');
    }
  }, [order, open]);

  useEffect(() => {
    if (terms && open) {
      setRemunerationType(terms.remunerationType?.toUpperCase() || 'PERCENT');
      setRemunerationPercentage(terms.remunerationPercentage ? parseFloat(terms.remunerationPercentage) : '');
      setRemunerationFixed(terms.remunerationFixed ? parseFloat(terms.remunerationFixed) : '');
      setClientPaymentCurrency(terms.clientPaymentCurrency || 'RUB');
      setExchangeRate(terms.exchangeRate ? parseFloat(terms.exchangeRate) : '');
      setExchangeRateMode('manual');
      if (terms.datePaid) setDatePaid(terms.datePaid);
      if (terms.dataFixing) setDataFixing(terms.dataFixing);
    }
  }, [terms, open]);

  if (!order) return null;

  const calculateAmountRemuneration = () => {
    if (remunerationType === 'PERCENT' && remunerationPercentage && order.amount) {
      return order.amount * (parseFloat(remunerationPercentage) / 100);
    } else if (remunerationType === 'FIXED' && remunerationFixed) {
      return parseFloat(remunerationFixed);
    }
    return 0;
  };

  const calculateAmountRemunerationInClientCurrency = () => {
    const remuneration = calculateAmountRemuneration();
    const rate = parseFloat(exchangeRate) || 1;
    return remuneration * rate;
  };

  const calculateAmountFaceValueInClientCurrency = () => {
    const faceValue = order.amount || 0;
    const rate = parseFloat(exchangeRate) || 1;
    return faceValue * rate;
  };

  const calculateAmountTotalInClientCurrency = () => {
    return calculateAmountRemunerationInClientCurrency() + calculateAmountFaceValueInClientCurrency();
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (exchangeRate && exchangeRate !== '') {
        const termsData = {
          remuneration_type: remunerationType.toLowerCase(),
          exchange_rate: parseFloat(exchangeRate),
          client_payment_currency: clientPaymentCurrency || null,
        };

        if (remunerationType === 'PERCENT' && remunerationPercentage !== '') {
          termsData.remuneration_percentage = parseFloat(remunerationPercentage);
        } else if (remunerationType === 'FIXED' && remunerationFixed !== '') {
          termsData.remuneration_fixed = parseFloat(remunerationFixed);
        }

        await apiClient.createOrUpdateOrderTerms(order.orderId, termsData);
      }

      const updates = {
        status,
        invoice_number: invoiceNumber,
        staff_description: staffDescription,
        invocie_received: invoiceReceived,
        payment_proof: paymentProof,
        non_mandiri_execution: nonMandiriExecution,
        
        gan_bank_name: ganBankName,
        gan_bank_account: ganBankAccount,
        date_report: dateReport,
        amount_to_be_paid: amountToBePaid !== '' ? parseFloat(amountToBePaid) : null,
        conversion_method: conversionMethod,
        base_currency: baseCurrency,
        executing_bank: executingBank,
        fx_executing_bank: fxExecutingBank !== '' ? parseFloat(fxExecutingBank) : null,
        bank_statement_in_type: bankStatementInType,
        bank_statement_in_id: bankStatementInId,
        bank_statement_out_type: bankStatementOutType,
        bank_statement_out_id: bankStatementOutId,
        amount_to_be_paid_target_cur: amountToBePaidTargetCur !== '' ? parseFloat(amountToBePaidTargetCur) : null,
        amount_paid_target_cur: amountPaidTargetCur !== '' ? parseFloat(amountPaidTargetCur) : null,
        doc_paid_no: docPaidNo,
        doc_paid_date: docPaidDate,
        payment_proof_no: paymentProofNo,
        payment_proof_date: paymentProofDate,
        
        client_payment_account_id: clientPaymentAccountId,
        client_payment_account_name: clientPaymentAccountName,
        client_payment_account_number: clientPaymentAccountNumber,
        client_payment_bank_name: clientPaymentBankName,
        client_payment_bank_address: clientPaymentBankAddress,
        client_payment_bank_bic: clientPaymentBankBic,
        client_payment_bank_swift: clientPaymentBankSwift,
      };

      await onSave(updates);
      toast.success('Order updated successfully');
    } catch (error) {
      toast.error('Failed to update order: ' + (error.message || 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  const historyEntries = parseStatusHistory(order.statusHistory);

  const handleProofUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingProof(true);
    try {
      const response = await apiClient.uploadFile(file);
      setAttachmentTransactionStatus(response.fileUrl || response.url);
      toast.success('Payment proof uploaded successfully');
    } catch (error) {
      toast.error('Failed to upload payment proof: ' + (error.message || 'Unknown error'));
    } finally {
      setUploadingProof(false);
    }
  };

  const handleDocUpload = async (e, type) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const setLoading = type === 'sales_contract' ? setUploadingSalesContract :
                       type === 'invoice' ? setUploadingInvoice :
                       type === 'word_order' ? setUploadingWordOrder : setUploadingOther;

    setLoading(true);
    try {
      const response = await apiClient.uploadOrderDocument(order.orderId, file, type);
      toast.success('Document uploaded successfully');
      
      if (response.fileUrl || response.url) {
        const field = type === 'sales_contract' ? 'attachmentSalesContract' :
                      type === 'invoice' ? 'attachmentInvoice' :
                      type === 'word_order' ? 'attachmentWordOrder' : 'attachmentOther';
        order[field] = response.fileUrl || response.url;
      }
    } catch (error) {
      toast.error('Failed to upload document: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={(val) => !val && onClose()}>
      <SheetContent className="w-full sm:max-w-2xl bg-white border-slate-200 text-slate-900 flex flex-col overflow-hidden">
        <SheetHeader className="mb-4 flex-shrink-0">
          <SheetTitle className="text-slate-900 flex items-center gap-3">
            #{order.orderId}
            <OrderStatusBadge status={status} />
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-1 pb-6">
          <div className="space-y-6">
            {/* STATUS MANAGEMENT Section */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-[#1e3a5f] uppercase">Status Management</h3>
              <div>
                <Label className="text-xs text-slate-600">Order Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="mt-1 bg-white border-slate-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ALL_STATUSES.map(s => (
                      <SelectItem key={s} value={s}>{s.replace('_', ' ').toUpperCase()}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator className="bg-slate-200" />

            {/* SECTION 1: CLIENT PAYMENT INSTRUCTIONS */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-[#1e3a5f] uppercase">Client Payment Instructions</h3>
              <p className="text-xs text-slate-500 italic">Select the account where client should send payment</p>
              
              <div>
                <Label className="text-xs text-slate-600 font-bold">Select Payment Account *</Label>
                <Select value={clientPaymentAccountId} onValueChange={(val) => {
                  setClientPaymentAccountId(val);
                  const account = payeerAccounts.find(a => a.account_no === val);
                  if (account) {
                    setClientPaymentAccountName(account.account_no || account.currency);
                    setClientPaymentAccountNumber(account.account_no || '');
                    setClientPaymentBankName(account.bank_name || '');
                    setClientPaymentBankAddress(account.bank_address || '');
                    setClientPaymentBankBic(account.bank_bic || '');
                    setClientPaymentBankSwift(account.bank_bic || '');
                  }
                }}>
                  <SelectTrigger className="mt-1 bg-white border-slate-300">
                    <SelectValue placeholder="Select account from Payeer Accounts..." />
                  </SelectTrigger>
                  <SelectContent>
                    {payeerAccounts.map(acc => (
                      <SelectItem key={acc.account_no} value={acc.account_no}>
                        {acc.account_no} ({acc.currency})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {clientPaymentAccountId && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
                  <p className="text-xs font-semibold text-slate-700">Selected Account Details:</p>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Account Name:</span>
                      <span className="font-medium text-slate-900">{clientPaymentAccountName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Account Number:</span>
                      <span className="font-mono font-medium text-slate-900">{clientPaymentAccountNumber}</span>
                    </div>
                    {clientPaymentBankName && (
                      <div className="flex justify-between">
                        <span className="text-slate-600">Bank Name:</span>
                        <span className="font-medium text-slate-900">{clientPaymentBankName}</span>
                      </div>
                    )}
                    {clientPaymentBankAddress && (
                      <div className="flex justify-between">
                        <span className="text-slate-600">Bank Address:</span>
                        <span className="font-medium text-slate-900 text-right">{clientPaymentBankAddress}</span>
                      </div>
                    )}
                    {clientPaymentBankBic && (
                      <div className="flex justify-between">
                        <span className="text-slate-600">BIC:</span>
                        <span className="font-mono font-medium text-slate-900">{clientPaymentBankBic}</span>
                      </div>
                    )}
                    {clientPaymentBankSwift && (
                      <div className="flex justify-between">
                        <span className="text-slate-600">SWIFT:</span>
                        <span className="font-mono font-medium text-slate-900">{clientPaymentBankSwift}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div>
                <Label className="text-xs text-slate-600">Date Received (Date Paid)</Label>
                <Input
                  type="date"
                  value={datePaid}
                  onChange={(e) => setDatePaid(e.target.value)}
                  className="mt-1 bg-white border-slate-300"
                />
              </div>
            </div>

            <Separator className="bg-slate-200" />

            {/* SECTION 3: FX & CONVERSION Section */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-[#1e3a5f] uppercase">Section 3: Transfer Amounts & FX</h3>
              
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs text-slate-600">Source Currency</Label>
                  <Input
                    value={clientPaymentCurrency}
                    onChange={(e) => setClientPaymentCurrency(e.target.value.toUpperCase())}
                    className="mt-1 bg-white border-slate-300"
                    placeholder="RUB/BRL"
                  />
                </div>
                <div>
                  <Label className="text-xs text-slate-600">Reference Currency</Label>
                  <Input
                    value={baseCurrency || order.currency}
                    onChange={(e) => setBaseCurrency(e.target.value.toUpperCase())}
                    className="mt-1 bg-white border-slate-300"
                    placeholder="USD"
                  />
                </div>
                <div>
                  <Label className="text-xs text-slate-600">Payment Currency</Label>
                  <div className="mt-1 bg-slate-50 border border-slate-300 rounded-lg p-3 text-xs text-slate-700">
                    {order.currency}
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-xs text-slate-600">Conversion Method</Label>
                <Select value={conversionMethod} onValueChange={setConversionMethod}>
                  <SelectTrigger className="mt-1 bg-white border-slate-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="central_bank">Central Bank Official Rate</SelectItem>
                    <SelectItem value="manual">Manual / Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs text-slate-600">
                  {conversionMethod === 'central_bank' ? 'Central Bank Rate Applied' : 'Exchange Rate'}
                </Label>
                <Input
                  type="number"
                  step="0.0001"
                  value={exchangeRate}
                  onChange={(e) => setExchangeRate(e.target.value)}
                  className="mt-1 bg-white border-slate-300"
                  placeholder={conversionMethod === 'central_bank' ? '5.4' : '1.0000'}
                />
              </div>

              <div>
                <Label className="text-xs text-slate-600">Data Fixing</Label>
                <Input
                  value={dataFixing}
                  onChange={(e) => setDataFixing(e.target.value)}
                  className="mt-1 bg-white border-slate-300"
                  placeholder="Notes"
                />
              </div>
            </div>

            <Separator className="bg-slate-200" />

            {/* SECTION 4: EXECUTION Section */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-[#1e3a5f] uppercase">Section 4: GAN's Execution & Payment</h3>
              
              <div>
                <Label className="text-xs text-slate-600">Date of Execution</Label>
                <Input
                  type="date"
                  value={dateReport}
                  onChange={(e) => setDateReport(e.target.value)}
                  className="mt-1 bg-white border-slate-300"
                />
              </div>

              <div>
                <Label className="text-xs text-slate-600">Executing Bank</Label>
                <Select value={executingBank} onValueChange={setExecutingBank}>
                  <SelectTrigger className="mt-1 bg-white border-slate-300">
                    <SelectValue placeholder="Select executing bank..." />
                  </SelectTrigger>
                  <SelectContent>
                    {payeerAccounts.map(acc => (
                      <SelectItem key={acc.account_no} value={acc.account_no}>
                        {acc.account_no} ({acc.currency})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs text-slate-600">Bank's FX Rate (if applicable)</Label>
                <Input
                  type="number"
                  step="0.0001"
                  value={fxExecutingBank}
                  onChange={(e) => setFxExecutingBank(e.target.value)}
                  className="mt-1 bg-white border-slate-300"
                  placeholder="7.15"
                />
                <p className="text-xs text-slate-500 mt-1">Used when Executing Bank applies FX conversion</p>
              </div>
            </div>

            <Separator className="bg-slate-200" />

            {/* REMUNERATION & FEES Section */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-[#1e3a5f] uppercase">Transfer Fee / Remuneration</h3>

              <div>
                <Label className="text-xs text-slate-600">Remuneration Type</Label>
                <Select value={remunerationType} onValueChange={setRemunerationType}>
                  <SelectTrigger className="mt-1 bg-white border-slate-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PERCENT">PERCENT</SelectItem>
                    <SelectItem value="FIXED">FIXED</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {remunerationType === 'PERCENT' ? (
                <div>
                  <Label className="text-xs text-slate-600">Remuneration Percentage (%)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={remunerationPercentage}
                    onChange={(e) => setRemunerationPercentage(e.target.value)}
                    className="mt-1 bg-white border-slate-300"
                  />
                </div>
              ) : (
                <div>
                  <Label className="text-xs text-slate-600">Remuneration Fixed Amount</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={remunerationFixed}
                    onChange={(e) => setRemunerationFixed(e.target.value)}
                    className="mt-1 bg-white border-slate-300"
                  />
                </div>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="text-xs text-slate-600 mb-1">Amount Remuneration</div>
                <div className="text-lg font-bold text-[#1e3a5f]">
                  {calculateAmountRemuneration().toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {order.currency}
                </div>
              </div>

              <div>
                <Label className="text-xs text-slate-600">Total Originator Pays (Amount to be Paid)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={amountToBePaid}
                  onChange={(e) => setAmountToBePaid(e.target.value)}
                  className="mt-1 bg-white border-slate-300"
                  placeholder="Calculated: amount + remuneration"
                />
                <p className="text-xs text-slate-500 mt-1">In source currency ({clientPaymentCurrency})</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                  <div className="text-xs text-slate-600 mb-1">Transfer Fee ({order.currency})</div>
                  <div className="text-sm font-bold text-[#1e3a5f]">
                    {calculateAmountRemuneration().toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                  <div className="text-xs text-slate-600 mb-1">Net to Beneficiary ({order.currency})</div>
                  <div className="text-sm font-bold text-emerald-700">
                    {((order.amount || 0) - calculateAmountRemuneration()).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
              </div>

              <Separator className="bg-slate-200" />

              {/* Invoice Section */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-700 uppercase">Invoice</h4>
                <div className="flex items-center gap-3">
                  <Label className="text-xs text-slate-600">Invoice Received</Label>
                  <Select value={invoiceReceived ? 'Y' : 'N'} onValueChange={(val) => setInvoiceReceived(val === 'Y')}>
                    <SelectTrigger className="w-20 bg-white border-slate-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Y">Y</SelectItem>
                      <SelectItem value="N">N</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {order.csvData && (
                  <a
                    href={`data:text/csv;charset=utf-8,${encodeURIComponent(order.csvData)}`}
                    download={`invoice_${order.orderId}.csv`}
                    className="inline-flex items-center gap-2 text-xs text-[#1e3a5f] hover:underline"
                  >
                    <Download className="w-3 h-3" />
                    Download Invoice CSV
                  </a>
                )}
              </div>

              <Separator className="bg-slate-200" />

              {/* Payment Proof Section */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-700 uppercase">Payment Proof</h4>
                <div className="flex items-center gap-3">
                  <Label className="text-xs text-slate-600">Payment Proof Received</Label>
                  <Select value={paymentProof ? 'Y' : 'N'} onValueChange={(val) => setPaymentProof(val === 'Y')}>
                    <SelectTrigger className="w-20 bg-white border-slate-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Y">Y</SelectItem>
                      <SelectItem value="N">N</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs text-slate-600">Payment Proof Date</Label>
                  <Input
                    type="date"
                    value={datePaymentProof}
                    onChange={(e) => setDatePaymentProof(e.target.value)}
                    className="mt-1 bg-white border-slate-300"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-slate-600">Upload Payment Proof</Label>
                  <div className="flex items-center gap-2">
                    <label className="flex-1">
                      <input
                        type="file"
                        onChange={handleProofUpload}
                        className="hidden"
                        accept="image/*,application/pdf"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full border-slate-300"
                        onClick={(e) => e.currentTarget.previousElementSibling?.click()}
                        disabled={uploadingProof}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        {uploadingProof ? 'Uploading...' : 'Upload Document'}
                      </Button>
                    </label>
                  </div>
                  {attachmentTransactionStatus && (
                    <a
                      href={attachmentTransactionStatus}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-xs text-[#1e3a5f] hover:underline"
                    >
                      <Download className="w-3 h-3" />
                      Download Uploaded Proof
                    </a>
                  )}
                </div>
              </div>

              <Separator className="bg-slate-200" />

              {/* Documents Section */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-700 uppercase">Documents</h4>

                {/* Sales Contract */}
                <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                  <Label className="text-xs text-slate-600 mb-2 block">Sales Contract</Label>
                  <div className="flex items-center gap-2">
                    <label className="flex-1">
                      <input
                        type="file"
                        onChange={(e) => handleDocUpload(e, 'sales_contract')}
                        className="hidden"
                        accept=".pdf,.doc,.docx"
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="w-full border-slate-300"
                        onClick={(e) => e.currentTarget.previousElementSibling?.click()}
                        disabled={uploadingSalesContract}
                      >
                        <Upload className="w-3 h-3 mr-2" />
                        {uploadingSalesContract ? 'Uploading...' : 'Upload'}
                      </Button>
                    </label>
                    {order.attachmentSalesContract && (
                      <a href={order.attachmentSalesContract} target="_blank" rel="noopener noreferrer">
                        <Button size="sm" variant="outline" className="border-slate-300">
                          <Download className="w-3 h-3" />
                        </Button>
                      </a>
                    )}
                  </div>
                </div>

                {/* Invoice */}
                <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                  <Label className="text-xs text-slate-600 mb-2 block">Invoice</Label>
                  <div className="flex items-center gap-2">
                    <label className="flex-1">
                      <input
                        type="file"
                        onChange={(e) => handleDocUpload(e, 'invoice')}
                        className="hidden"
                        accept=".pdf,.doc,.docx"
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="w-full border-slate-300"
                        onClick={(e) => e.currentTarget.previousElementSibling?.click()}
                        disabled={uploadingInvoice}
                      >
                        <Upload className="w-3 h-3 mr-2" />
                        {uploadingInvoice ? 'Uploading...' : 'Upload'}
                      </Button>
                    </label>
                    {order.attachmentInvoice && (
                      <a href={order.attachmentInvoice} target="_blank" rel="noopener noreferrer">
                        <Button size="sm" variant="outline" className="border-slate-300">
                          <Download className="w-3 h-3" />
                        </Button>
                      </a>
                    )}
                  </div>
                </div>

                {/* Other Documents */}
                <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                  <Label className="text-xs text-slate-600 mb-2 block">Other Documents</Label>
                  <div className="flex items-center gap-2">
                    <label className="flex-1">
                      <input
                        type="file"
                        onChange={(e) => handleDocUpload(e, 'other')}
                        className="hidden"
                        accept=".pdf,.doc,.docx,.zip"
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="w-full border-slate-300"
                        onClick={(e) => e.currentTarget.previousElementSibling?.click()}
                        disabled={uploadingOther}
                      >
                        <Upload className="w-3 h-3 mr-2" />
                        {uploadingOther ? 'Uploading...' : 'Upload'}
                      </Button>
                    </label>
                    {order.attachmentOther && (
                      <a href={order.attachmentOther} target="_blank" rel="noopener noreferrer">
                        <Button size="sm" variant="outline" className="border-slate-300">
                          <Download className="w-3 h-3" />
                        </Button>
                      </a>
                    )}
                  </div>
                </div>

                {/* WORD Order */}
                <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                  <Label className="text-xs text-slate-600 mb-2 block">WORD Order</Label>
                  <div className="flex flex-col gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="border-blue-300 hover:bg-blue-100"
                      onClick={() => downloadWordTemplate(order)}
                    >
                      <FileText className="w-3 h-3 mr-2" />
                      Download Unsigned Order
                    </Button>
                    <div className="flex items-center gap-2">
                      <label className="flex-1">
                        <input
                          type="file"
                          onChange={(e) => handleDocUpload(e, 'word_order')}
                          className="hidden"
                          accept=".doc,.docx"
                        />
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="w-full border-blue-300 hover:bg-blue-100"
                          onClick={(e) => e.currentTarget.previousElementSibling?.click()}
                          disabled={uploadingWordOrder}
                        >
                          <Upload className="w-3 h-3 mr-2" />
                          {uploadingWordOrder ? 'Uploading...' : 'Upload Signed by Client'}
                        </Button>
                      </label>
                      {order.attachmentWordOrderSigned && (
                        <a href={order.attachmentWordOrderSigned} target="_blank" rel="noopener noreferrer">
                          <Button size="sm" variant="outline" className="border-blue-300">
                            <Download className="w-3 h-3" />
                          </Button>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <Separator className="bg-slate-200" />

              {/* BANK STATEMENTS Section */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-700 uppercase">Bank Statements</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-slate-600">Statement IN Type</Label>
                    <Select value={bankStatementInType} onValueChange={setBankStatementInType}>
                      <SelectTrigger className="mt-1 bg-white border-slate-300">
                        <SelectValue placeholder="Select type..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mandiri_statement">Mandiri Statement</SelectItem>
                        <SelectItem value="other_bank_statements">Other Bank Statements</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs text-slate-600">Statement IN ID</Label>
                    <Input
                      value={bankStatementInId}
                      onChange={(e) => setBankStatementInId(e.target.value)}
                      className="mt-1 bg-white border-slate-300"
                      placeholder="e.g., 2001"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-slate-600">Statement OUT Type</Label>
                    <Select value={bankStatementOutType} onValueChange={setBankStatementOutType}>
                      <SelectTrigger className="mt-1 bg-white border-slate-300">
                        <SelectValue placeholder="Select type..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mandiri_statement">Mandiri Statement</SelectItem>
                        <SelectItem value="other_bank_statements">Other Bank Statements</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs text-slate-600">Statement OUT ID</Label>
                    <Input
                      value={bankStatementOutId}
                      onChange={(e) => setBankStatementOutId(e.target.value)}
                      className="mt-1 bg-white border-slate-300"
                      placeholder="e.g., 1001"
                    />
                  </div>
                </div>
              </div>

              <Separator className="bg-slate-200" />

              {/* PAYMENT AMOUNTS Section */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-700 uppercase">Payment Amounts</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-slate-600">Amount to be Paid (Target Cur)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={amountToBePaidTargetCur}
                      onChange={(e) => setAmountToBePaidTargetCur(e.target.value)}
                      className="mt-1 bg-white border-slate-300"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-slate-600">Amount Paid (Target Cur)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={amountPaidTargetCur}
                      onChange={(e) => setAmountPaidTargetCur(e.target.value)}
                      className="mt-1 bg-white border-slate-300"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-slate-600">Doc Paid No</Label>
                    <Input
                      value={docPaidNo}
                      onChange={(e) => setDocPaidNo(e.target.value)}
                      className="mt-1 bg-white border-slate-300"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-slate-600">Doc Paid Date</Label>
                    <Input
                      type="date"
                      value={docPaidDate}
                      onChange={(e) => setDocPaidDate(e.target.value)}
                      className="mt-1 bg-white border-slate-300"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-slate-600">Payment Proof No</Label>
                    <Input
                      value={paymentProofNo}
                      onChange={(e) => setPaymentProofNo(e.target.value)}
                      className="mt-1 bg-white border-slate-300"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-slate-600">Payment Proof Date</Label>
                    <Input
                      type="date"
                      value={paymentProofDate}
                      onChange={(e) => setPaymentProofDate(e.target.value)}
                      className="mt-1 bg-white border-slate-300"
                    />
                  </div>
                </div>
              </div>

              <Separator className="bg-slate-200" />

              {/* Non-Mandiri Execution */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-700 uppercase">Execution</h4>
                <div className="flex items-center gap-3">
                  <Label className="text-xs text-slate-600">Non-Mandiri Execution</Label>
                  <Select value={nonMandiriExecution ? 'Y' : 'N'} onValueChange={(val) => setNonMandiriExecution(val === 'Y')}>
                    <SelectTrigger className="w-20 bg-white border-slate-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Y">Y</SelectItem>
                      <SelectItem value="N">N</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Separator className="bg-slate-200" />

            {/* Last Export Info */}
            <div>
              <Label className="text-xs text-slate-600">Last Instruction Export</Label>
              <div className="mt-1 text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded p-2">
                {order.lastDownload ? moment(order.lastDownload).format('DD/MM/YYYY HH:mm') : 'Not exported yet'}
              </div>
            </div>

            <Separator className="bg-slate-200" />

            {/* Invoice Number */}
            <div>
              <Label className="text-xs text-slate-600">Invoice Number</Label>
              <Input
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                className="mt-1 bg-white border-slate-300"
              />
            </div>

            {/* Staff Notes */}
            <div>
              <Label className="text-xs text-slate-600">Staff Notes</Label>
              <Textarea
                value={staffDescription}
                onChange={(e) => setStaffDescription(e.target.value)}
                className="mt-1 bg-white border-slate-300"
                rows={3}
              />
            </div>

            <Separator className="bg-slate-200" />

            {/* History */}
            {historyEntries.length > 0 && (
              <div>
                <Label className="text-xs text-slate-600 font-bold uppercase">History</Label>
                <div className="space-y-2 mt-2 max-h-32 overflow-y-auto">
                  {historyEntries.slice().reverse().map((h, i) => (
                    <div key={i} className="flex justify-between text-xs bg-slate-50 rounded p-2 border border-slate-200">
                      <span className="font-medium text-slate-700">{h.status?.replace('_', ' ').toUpperCase()}</span>
                      <span className="text-slate-500">{moment(h.timestamp).format('DD/MM/YY HH:mm')}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Separator className="bg-slate-200" />

            {/* Order Information */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-[#1e3a5f] uppercase">Order Information</h3>
              
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                  <div className="text-xs text-slate-500 mb-1">Amount</div>
                  <div className="font-semibold text-slate-900">{order.currency} {order.amount?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                </div>

                <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                  <div className="text-xs text-slate-500 mb-1">Remittance Currency</div>
                  <div className="font-semibold text-slate-900">{order.currency}</div>
                </div>

                <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                  <div className="text-xs text-slate-500 mb-1">Debit Account</div>
                  <div className="font-semibold text-slate-900">{order.debitAccountNo || '-'}</div>
                </div>

                <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                  <div className="text-xs text-slate-500 mb-1">Transaction Reference</div>
                  <div className="font-semibold text-slate-900 text-xs break-all">{order.transactionReference || '-'}</div>
                </div>
              </div>

              <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                <div className="text-xs text-slate-500 mb-1">Beneficiary Name</div>
                <div className="font-semibold text-slate-900">{order.beneficiaryName}</div>
              </div>

              <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                <div className="text-xs text-slate-500 mb-1">Beneficiary Address</div>
                <div className="font-semibold text-slate-900 text-sm">{order.beneficiaryAddress}</div>
              </div>

              <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                <div className="text-xs text-slate-500 mb-1">Destination Account</div>
                <div className="font-semibold text-slate-900">{order.destinationAccount}</div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                  <div className="text-xs text-slate-500 mb-1">Bank Country</div>
                  <div className="font-semibold text-slate-900">{order.bankCountry}</div>
                </div>

                <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                  <div className="text-xs text-slate-500 mb-1">BIC/SWIFT</div>
                  <div className="font-semibold text-slate-900">{order.bankBic}</div>
                </div>
              </div>

              <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                <div className="text-xs text-slate-500 mb-1">Bank Name</div>
                <div className="font-semibold text-slate-900">{order.bankName}</div>
              </div>

              <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                <div className="text-xs text-slate-500 mb-1">Bank Address</div>
                <div className="font-semibold text-slate-900 text-sm">{order.bankAddress || '-'}</div>
              </div>

              <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                <div className="text-xs text-slate-500 mb-1">Transaction Remark</div>
                <div className="font-semibold text-slate-900 text-sm whitespace-pre-wrap">{order.remark}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 p-4 bg-white border-t border-slate-200 flex gap-3">
          <Button 
            type="button"
            variant="outline" 
            onClick={onClose} 
            className="flex-1 border-slate-300"
          >
            Cancel
          </Button>
          <Button 
            type="button"
            onClick={handleSave} 
            disabled={saving} 
            className="flex-1 bg-[#1e3a5f] hover:bg-[#152a45]"
          >
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}