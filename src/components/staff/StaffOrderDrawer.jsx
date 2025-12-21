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
import { base44 } from '@/api/base44Client';
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

  useEffect(() => {
    if (order && open) {
      setStatus(order.status || 'created');
      setDatePaid(order.date_paid || '');
      setDataFixing(order.data_fixing || '');
      setRemunerationType(order.remuneration_type || 'PERCENT');
      setRemunerationPercentage(order.remuneration_percentage ?? '');
      setRemunerationFixed(order.remuneration_fixed ?? '');
      setClientPaymentCurrency(order.client_payment_currency || 'RUB');
      setExchangeRate(order.exchange_rate ?? '');
      setExchangeRateMode(order.exchange_rate_mode || 'manual');
      setInvoiceNumber(order.invoice_number || '');
      setStaffDescription(order.staff_description || '');
      setInvoiceReceived(order.invoice_received || false);
      setPaymentProof(order.payment_proof || false);
      setDatePaymentProof(order.date_payment_proof || '');
      setAttachmentTransactionStatus(order.attachment_transaction_status || '');
      setNonMandiriExecution(order.non_mandiri_execution || false);
    }
  }, [order, open]);

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
      const amountRemuneration = calculateAmountRemuneration();
      const amountTotalInClientCurrency = calculateAmountTotalInClientCurrency();

      const updates = {
        status,
        date_paid: datePaid,
        data_fixing: dataFixing,
        remuneration_type: remunerationType,
        remuneration_percentage: remunerationPercentage !== '' ? parseFloat(remunerationPercentage) : null,
        remuneration_fixed: remunerationFixed !== '' ? parseFloat(remunerationFixed) : null,
        amount_remuneration: amountRemuneration,
        client_payment_currency: clientPaymentCurrency,
        exchange_rate: exchangeRate !== '' ? parseFloat(exchangeRate) : null,
        exchange_rate_mode: exchangeRateMode,
        sum_to_be_paid: amountTotalInClientCurrency,
        currency_to_be_paid: clientPaymentCurrency,
        invoice_number: invoiceNumber,
        staff_description: staffDescription,
        invoice_received: invoiceReceived,
        payment_proof: paymentProof,
        date_payment_proof: datePaymentProof,
        attachment_transaction_status: attachmentTransactionStatus,
        non_mandiri_execution: nonMandiriExecution,
        status_history: order.status !== status ? addStatusEntry(order.status_history, status) : order.status_history
      };

      await onSave(updates);
    } finally {
      setSaving(false);
    }
  };

  const historyEntries = parseStatusHistory(order.status_history);

  const handleProofUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingProof(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setAttachmentTransactionStatus(file_url);
      toast.success('Payment proof uploaded successfully');
    } catch (error) {
      toast.error('Failed to upload payment proof');
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
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      const field = type === 'sales_contract' ? 'attachment_sales_contract' :
                  type === 'invoice' ? 'attachment_invoice' :
                  type === 'word_order' ? 'attachment_word_order' : 'attachment_other';

      await base44.entities.RemittanceOrder.update(order.id, { [field]: file_url });
      toast.success('Document uploaded successfully');

      const updatedOrder = await base44.entities.RemittanceOrder.filter({ id: order.id });
      if (updatedOrder?.[0]) {
        Object.assign(order, updatedOrder[0]);
      }
    } catch (error) {
      toast.error('Failed to upload document');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={(val) => !val && onClose()}>
      <SheetContent className="w-full sm:max-w-2xl bg-white border-slate-200 text-slate-900 flex flex-col overflow-hidden">
        <SheetHeader className="mb-4 flex-shrink-0">
          <SheetTitle className="text-slate-900 flex items-center gap-3">
            #{order.order_number}
            <OrderStatusBadge status={status} />
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-1 pb-6">
          <div className="space-y-6">
            {/* Order Info */}
            <div className="bg-slate-50 rounded-lg p-4 text-sm space-y-2">
              <div><span className="text-slate-500 font-medium">Client:</span> {order.client_name || order.client_id}</div>
              <div><span className="text-slate-500 font-medium">Amount:</span> <span className="text-emerald-600 font-semibold">{order.amount?.toLocaleString()} {order.currency}</span></div>
              <div><span className="text-slate-500 font-medium">Beneficiary:</span> {order.beneficiary_name}</div>
              <div><span className="text-slate-500 font-medium">Bank:</span> {order.bank_name} ({order.bic})</div>
            </div>

            <Separator className="bg-slate-200" />

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

            {/* TERMS Section */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-[#1e3a5f] uppercase">Terms</h3>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-slate-600">Date Paid</Label>
                  <Input
                    type="date"
                    value={datePaid}
                    onChange={(e) => setDatePaid(e.target.value)}
                    className="mt-1 bg-white border-slate-300"
                  />
                </div>
                <div>
                  <Label className="text-xs text-slate-600">Data Fixing</Label>
                  <Input
                    value={dataFixing}
                    onChange={(e) => setDataFixing(e.target.value)}
                    className="mt-1 bg-white border-slate-300"
                  />
                </div>
              </div>

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
                <Label className="text-xs text-slate-600">Client Payment Currency</Label>
                <Input
                  value={clientPaymentCurrency}
                  onChange={(e) => setClientPaymentCurrency(e.target.value.toUpperCase())}
                  className="mt-1 bg-white border-slate-300"
                  placeholder="RUB"
                />
              </div>

              <div>
                <Label className="text-xs text-slate-600">Exchange Rate Mode</Label>
                <Select value={exchangeRateMode} onValueChange={setExchangeRateMode}>
                  <SelectTrigger className="mt-1 bg-white border-slate-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manual">Manual</SelectItem>
                    <SelectItem value="central_bank">Central Bank Rate on Data Fixing</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs text-slate-600">Exchange Rate</Label>
                <Input
                  type="number"
                  step="0.0001"
                  value={exchangeRate}
                  onChange={(e) => setExchangeRate(e.target.value)}
                  className="mt-1 bg-white border-slate-300"
                  placeholder="1.0000"
                  disabled={exchangeRateMode === 'central_bank'}
                />
                {exchangeRateMode === 'central_bank' && (
                  <p className="text-xs text-slate-500 mt-1">Rate will be fetched from central bank on data fixing date</p>
                )}
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="text-xs text-slate-600 mb-1">Remuneration in {clientPaymentCurrency}</div>
                  <div className="text-sm font-bold text-[#1e3a5f]">
                    {calculateAmountRemunerationInClientCurrency().toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                  <div className="text-xs text-slate-600 mb-1">FV in {clientPaymentCurrency}</div>
                  <div className="text-sm font-bold text-purple-700">
                    {calculateAmountFaceValueInClientCurrency().toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                  <div className="text-xs text-slate-600 mb-1">Total in {clientPaymentCurrency}</div>
                  <div className="text-sm font-bold text-emerald-700">
                    {calculateAmountTotalInClientCurrency().toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
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
              {order.csv_data && (
                <a
                  href={`data:text/csv;charset=utf-8,${encodeURIComponent(order.csv_data)}`}
                  download={`invoice_${order.order_number}.csv`}
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
                  {order.attachment_sales_contract && (
                    <a href={order.attachment_sales_contract} target="_blank" rel="noopener noreferrer">
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
                  {order.attachment_invoice && (
                    <a href={order.attachment_invoice} target="_blank" rel="noopener noreferrer">
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
                  {order.attachment_other && (
                    <a href={order.attachment_other} target="_blank" rel="noopener noreferrer">
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
                    {order.attachment_word_order_signed && (
                      <a href={order.attachment_word_order_signed} target="_blank" rel="noopener noreferrer">
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

            <Separator className="bg-slate-200" />

            {/* Last Export Info */}
            <div>
              <Label className="text-xs text-slate-600">Last Instruction Export</Label>
              <div className="mt-1 text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded p-2">
                {order.last_download ? moment(order.last_download).format('DD/MM/YYYY HH:mm') : 'Not exported yet'}
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