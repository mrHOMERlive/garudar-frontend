import React, { useState, useEffect } from 'react';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import OrderStatusBadge from '@/components/orders/OrderStatusBadge';

// import { parseStatusHistory, addStatusEntry } from '@/components/utils/statusHistoryHelper'; // Removed
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

  const activePayeerAccounts = payeerAccounts.filter(acc => acc.status === 'active');

  const { data: currencies = [] } = useQuery({
    queryKey: ['currencies'],
    queryFn: () => apiClient.getCurrencies(),
    enabled: open,
  });



  const { data: terms } = useQuery({
    queryKey: ['order-terms', order?.orderId],
    queryFn: () => apiClient.getOrderTerms(order?.orderId),
    enabled: !!order?.orderId && open,
  });

  const { data: documents = [], refetch: refetchDocuments } = useQuery({
    queryKey: ['order-documents', order?.orderId],
    queryFn: () => apiClient.getOrderDocuments(order?.orderId),
    enabled: !!order?.orderId && open,
  });

  const { data: lastInstructionExport } = useQuery({
    queryKey: ['last-instruction-export', order?.orderId],
    queryFn: () => apiClient.getLastInstructionExportDate(order?.orderId),
    enabled: !!order?.orderId && open,
  });

  useEffect(() => {
    if (order && open) {
      setStatus(order.status || 'created');
      setDatePaid(order.datePaid || '');
      setDataFixing(order.dataFixing || '');
      setInvoiceNumber(order.invoiceNumber || '');

      setInvoiceReceived(order.invoiceReceived || order.invocieReceived || false);
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
      setStaffDescription(terms.description || '');

      // Populate other terms fields
      setConversionMethod(terms.conversionMethod || 'none');
      setGanBankName(terms.GANBankName || '');
      setGanBankAccount(terms.GANBankAccount || '');
      setDateReport(terms.dateReport || '');
      setBaseCurrency(terms.baseCurrency || '');
      // Resolve executing bank to account_no if possible
      let exBank = terms.executingBank || '';
      if (exBank && payeerAccounts.length > 0) {
        const found = payeerAccounts.find(p => p.bank_name === exBank || p.account_no === exBank);
        if (found) exBank = found.account_no;
      }
      setExecutingBank(exBank);
      setFxExecutingBank(terms.FXExecutingBank ?? '');
      setBankStatementInType(terms.bankStatementInType || '');
      setBankStatementInId(terms.bankStatementInId || '');
      setBankStatementOutType(terms.bankStatementOutType || '');
      setBankStatementOutId(terms.bankStatementOutId || '');
      setAmountToBePaidTargetCur(terms.amountToBePaidTargetCur ?? '');
      setAmountPaidTargetCur(terms.amountPaidTargetCur ?? '');
      setDocPaidNo(terms.docPaidNo || '');
      setDocPaidDate(terms.docPaidDate || '');
      setPaymentProofNo(terms.paymentProofNo || '');
      setPaymentProofDate(terms.paymentProofDate || '');
      if (terms.amountToBePaid) setAmountToBePaid(terms.amountToBePaid);

      // Auto-select Payment Account based on GANBankAccount from terms
      if (terms.GANBankAccount && payeerAccounts.length > 0) {
        const matchedAccount = payeerAccounts.find(acc => acc.account_no === terms.GANBankAccount);
        if (matchedAccount) {
          setClientPaymentAccountId(matchedAccount.account_no);
          setClientPaymentAccountName(matchedAccount.currency || matchedAccount.account_no);
          setClientPaymentAccountNumber(matchedAccount.account_no || '');
          setClientPaymentBankName(matchedAccount.bank_name || '');
          setClientPaymentBankAddress(matchedAccount.bank_address || '');
          setClientPaymentBankBic(matchedAccount.bank_bic || '');
          setClientPaymentBankSwift(matchedAccount.bank_bic || '');
        }
      }
    }
  }, [terms, open, payeerAccounts]);

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
      // 1. Update Terms (always attempt to save terms data)
      const termsData = {
        remuneration_type: remunerationType.toLowerCase(),
        client_payment_currency: clientPaymentCurrency || null,
        date_paid: datePaid || null,
        data_fixing: dataFixing || null,
        GAN_bank_name: ganBankName || null,
        GAN_bank_account: ganBankAccount || null,
        date_report: dateReport || null,
        conversion_method: conversionMethod === 'none' ? null : conversionMethod,
        base_currency: baseCurrency || null,
        executing_bank: executingBank || null,
        FX: !!fxExecutingBank,
        status: status,
        bank_statement_in_type: bankStatementInType || null,
        bank_statement_in_id: bankStatementInId || null,
        bank_statement_out_type: bankStatementOutType || null,
        bank_statement_out_id: bankStatementOutId || null,
        amount_to_be_paid: amountToBePaid !== '' ? parseFloat(amountToBePaid) : (calculateAmountRemuneration() + (Number(order.amount) || 0)),
        doc_paid_no: docPaidNo || null,
        doc_paid_date: docPaidDate || null,
        payment_proof_no: paymentProofNo || null,
        payment_proof_date: paymentProofDate || null,
        description: staffDescription || null,
      };

      // Conditionally add Decimal fields to avoid sending null
      if (exchangeRate !== '') {
        termsData.exchange_rate = parseFloat(exchangeRate);
      }
      if (fxExecutingBank !== '') {
        termsData.FX_executing_bank = parseFloat(fxExecutingBank);
      }
      if (amountToBePaidTargetCur !== '') {
        termsData.amount_to_be_paid_target_cur = parseFloat(amountToBePaidTargetCur);
      }
      if (amountPaidTargetCur !== '') {
        termsData.amount_paid_target_cur = parseFloat(amountPaidTargetCur);
      }

      if (remunerationType === 'PERCENT') {
        if (!remunerationPercentage && remunerationPercentage !== 0) {
          toast.error('Please enter Remuneration Percentage');
          setSaving(false);
          return;
        }
        termsData.remuneration_percentage = parseFloat(remunerationPercentage);
        termsData.remuneration_fixed = null; // Clear fixed if switching to percent
      } else if (remunerationType === 'FIXED') {
        if (!remunerationFixed && remunerationFixed !== 0) {
          toast.error('Please enter Remuneration Fixed Amount');
          setSaving(false);
          return;
        }
        termsData.remuneration_fixed = parseFloat(remunerationFixed);
        termsData.remuneration_percentage = null; // Clear percent if switching to fixed
      }

      console.log('Sending Terms Payload:', termsData);

      await apiClient.createOrUpdateOrderTerms(order.orderId, termsData);

      // 2. Update Order
      const updates = {
        status,
        invoice_number: invoiceNumber,
        invocie_received: invoiceReceived,
        payment_proof: paymentProof,
        date_payment_proof: paymentProofDate || null,
        non_mandiri_execution: nonMandiriExecution,

      };

      await onSave(updates);
      toast.success('Order updated successfully');
      refetchDocuments(); // Refresh docs just in case
    } catch (error) {
      console.error(error);
      toast.error('Failed to update order: ' + (error.message || 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  const handleDownload = async (docId) => {
    try {
      const response = await apiClient.downloadDocument(order.orderId, docId);
      if (response && response.presigned_url) {
        window.open(response.presigned_url, '_blank');
      } else {
        toast.error('No download URL returned');
      }
    } catch (error) {
      toast.error('Failed to download: ' + error.message);
    }
  };


  const handleDownloadExcel = async () => {
    try {
      const blob = await apiClient.exportOrderExcel(order.orderId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Order_${order.orderId}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Excel downloaded successfully');
    } catch (error) {
      console.error(error);
      toast.error('Failed to download Excel: ' + error.message);
    }
  };

  // const historyEntries = parseStatusHistory(order.statusHistory); // Removed

  const handleProofUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingProof(true);
    try {
      await apiClient.uploadOrderDocument(order.orderId, file, 'payment_proof');
      toast.success('Payment proof uploaded successfully');
      refetchDocuments();
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
        (type === 'word_order' || type === 'word_order_signed_client') ? setUploadingWordOrder : setUploadingOther;

    setLoading(true);
    try {
      await apiClient.uploadOrderDocument(order.orderId, file, type);
      toast.success('Document uploaded successfully');
      refetchDocuments();
    } catch (error) {
      toast.error('Failed to upload document: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const getDoc = (type) => documents.find(d => d.doc_type === type);
  const signedOrderDoc = getDoc('word_order') || getDoc('word_order_signed_client');

  return (
    <Sheet open={open} onOpenChange={(val) => !val && onClose()}>
      <SheetContent className="w-full sm:max-w-2xl bg-white border-slate-200 text-slate-900 flex flex-col overflow-hidden">
        <SheetHeader className="mb-4 flex-shrink-0">
          <SheetTitle className="text-slate-900 flex items-center gap-3">
            #{order.orderId}
            <OrderStatusBadge status={status} />
          </SheetTitle>
          <SheetDescription className="hidden">
            Manage order details, documents, and status.
          </SheetDescription>
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

                    // Auto-fill fields for backend
                    if (account.currency) setClientPaymentCurrency(account.currency);
                    setGanBankName(account.bank_name || '');
                    setGanBankAccount(account.account_no || '');
                  }
                }}>
                  <SelectTrigger className="mt-1 bg-white border-slate-300">
                    <SelectValue placeholder="Select account from Payeer Accounts..." />
                  </SelectTrigger>
                  <SelectContent>
                    {activePayeerAccounts.map(acc => (
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
                  <Select
                    value={clientPaymentCurrency}
                    onValueChange={setClientPaymentCurrency}
                  >
                    <SelectTrigger className="mt-1 bg-white border-slate-300">
                      <SelectValue placeholder="RUB" />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map((c) => (
                        <SelectItem key={c.code || c} value={c.code || c}>
                          {c.symbol ? c.symbol + ' ' : ''}{c.code || c} {c.name ? `- ${c.name}` : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs text-slate-600">Reference Currency</Label>
                  <Select
                    value={baseCurrency}
                    onValueChange={setBaseCurrency}
                  >
                    <SelectTrigger className="mt-1 bg-white border-slate-300">
                      <SelectValue placeholder="USD" />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map((c) => (
                        <SelectItem key={c.code || c} value={c.code || c}>
                          {c.symbol ? c.symbol + ' ' : ''}{c.code || c} {c.name ? `- ${c.name}` : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                    <SelectItem value="central_bank">Central Bank Official Rate</SelectItem>
                    <SelectItem value="executing_bank">Executing Bank Rate</SelectItem>
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
                  type="date"
                  value={dataFixing}
                  onChange={(e) => setDataFixing(e.target.value)}
                  className="mt-1 bg-white border-slate-300"
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
                    {activePayeerAccounts.map(acc => (
                      <SelectItem key={acc.account_no} value={acc.account_no}>
                        {acc.bank_name}
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

              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
                <div className="text-xs text-slate-600 mb-1">Total Originator Pays</div>
                <div className="text-lg font-bold text-indigo-900">
                  {Number(amountToBePaid || (calculateAmountRemuneration() + (Number(order.amount) || 0))).toLocaleString('en-US', { minimumFractionDigits: 2 })} {order.currency}
                </div>
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
                    {Number(order.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
                    value={paymentProofDate}
                    onChange={(e) => setPaymentProofDate(e.target.value)}
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
                  {getDoc('payment_proof') && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDownload(getDoc('payment_proof').doc_id)}
                      className="inline-flex items-center gap-2 text-xs text-[#1e3a5f] hover:underline p-0 h-auto"
                    >
                      <Download className="w-3 h-3" />
                      Download Uploaded Proof
                    </Button>
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
                    {getDoc('sales_contract') && (
                      <Button size="sm" variant="outline" className="border-slate-300" onClick={() => handleDownload(getDoc('sales_contract').doc_id)}>
                        <Download className="w-3 h-3" />
                      </Button>
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
                    {getDoc('invoice') && (
                      <Button size="sm" variant="outline" className="border-slate-300" onClick={() => handleDownload(getDoc('invoice').doc_id)}>
                        <Download className="w-3 h-3" />
                      </Button>
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
                    {getDoc('other') && (
                      <Button size="sm" variant="outline" className="border-slate-300" onClick={() => handleDownload(getDoc('other').doc_id)}>
                        <Download className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </div>

                {/* WORD Order */}
                <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                  <Label className="text-xs text-slate-600 mb-2 block">Order</Label>
                  <div className="flex flex-col gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="border-blue-300 hover:bg-blue-100"
                      onClick={handleDownloadExcel}
                    >
                      <FileText className="w-3 h-3 mr-2" />
                      Download Unsigned Order
                    </Button>
                    <div className="flex items-center gap-2">
                      <label className="flex-1">
                        <input
                          type="file"
                          onChange={(e) => handleDocUpload(e, 'word_order_signed_client')}
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
                      {signedOrderDoc && (
                        <Button size="sm" variant="outline" className="border-blue-300" onClick={() => handleDownload(signedOrderDoc.doc_id)}>
                          <Download className="w-3 h-3" />
                        </Button>
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
                {lastInstructionExport?.last_export_date ? moment(lastInstructionExport.last_export_date).format('DD/MM/YYYY HH:mm') : 'Not exported yet'}
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

            <div>
              <Label className="text-xs text-slate-600">Description</Label>
              <Textarea
                value={staffDescription}
                onChange={(e) => setStaffDescription(e.target.value)}
                className="mt-1 bg-white border-slate-300"
                rows={3}
              />
            </div>

            <Separator className="bg-slate-200" />

            {/* History Removed - backend doesn't support status history yet */}

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
                  <div className="font-semibold text-slate-900">{executingBank || '-'}</div>
                </div>

                <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                  <div className="text-xs text-slate-500 mb-1">Transaction Reference</div>
                  <div className="font-semibold text-slate-900 text-xs break-all">{order.orderId || '-'}</div>
                </div>
              </div>

              <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                <div className="text-xs text-slate-500 mb-1">Beneficiary Name</div>
                <div className="font-semibold text-slate-900">{order.beneficiaryName}</div>
              </div>

              <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                <div className="text-xs text-slate-500 mb-1">Beneficiary Address</div>
                <div className="font-semibold text-slate-900 text-sm">{order.beneficiaryAddress || order.beneficiaryAdress}</div>
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