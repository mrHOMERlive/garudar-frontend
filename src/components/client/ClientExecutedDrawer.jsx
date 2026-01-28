import React, { useState, useMemo } from 'react';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { apiClient } from '@/api/apiClient';
import { toast } from 'sonner';
import { Download, Upload } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

export default function ClientExecutedDrawer({ order, open, onClose, onUpdate }) {
  const [uploadingActReport, setUploadingActReport] = useState(false);

  const { data: terms } = useQuery({
    queryKey: ['order-terms', order?.id],
    queryFn: () => apiClient.getOrderTerms(order?.id),
    enabled: !!order?.id && open,
  });

  const { data: payeerAccounts = [] } = useQuery({
    queryKey: ['payeer-accounts'],
    queryFn: () => apiClient.getPayeerAccounts(),
    enabled: open,
    retry: false, // Don't retry if it fails (e.g. 403)
  });

  const debitAccount = useMemo(() => {
    let exBank = terms?.executingBank || order?.debit_account_no || '';
    if (exBank && payeerAccounts.length > 0) {
      const found = payeerAccounts.find(p => p.bank_name === exBank || p.account_no === exBank);
      if (found) exBank = found.account_no;
    }
    return exBank || '-';
  }, [terms, payeerAccounts, order]);

  if (!order) return null;

  const handleActReportUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingActReport(true);
    try {
      // Upload document using apiClient
      // DocType 'act_report_signed_client' maps to the client upload permission
      const response = await apiClient.uploadOrderDocument(order.id, file, 'act_report_signed_client');

      toast.success('Signed Act Report uploaded successfully');

      // Update local state if needed (though onUpdate refetching usually handles it)
      // Note: apiClient upload doesn't return file_url directly in the same way, 
      // but the order refetch will get the new status.
      // If we need the URL immediately, we might need a separate call or rely on refetch.

      onUpdate?.();
    } catch (error) {
      console.error(error);
      toast.error('Failed to upload Act Report');
    } finally {
      setUploadingActReport(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={(val) => !val && onClose()}>
      <SheetContent className="w-full sm:max-w-2xl bg-white border-slate-200 text-slate-900 flex flex-col overflow-hidden">
        <SheetHeader className="mb-4 flex-shrink-0">
          <SheetTitle className="text-slate-900 flex items-center gap-3">
            Order #{order.order_number}
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-1 pb-6">
          <div className="space-y-6">
            {/* Order Info */}
            <div className="bg-slate-50 rounded-lg p-4 text-sm space-y-2 border border-slate-200">
              <div><span className="text-slate-500 font-medium">Client:</span> <span className="text-slate-900">{order.client_name || order.client_id}</span></div>
              <div><span className="text-slate-500 font-medium">Amount:</span> <span className="text-emerald-600 font-semibold">{order.amount?.toLocaleString()} {order.currency}</span></div>
              <div><span className="text-slate-500 font-medium">Beneficiary:</span> <span className="text-slate-900">{order.beneficiary_name}</span></div>
              <div><span className="text-slate-500 font-medium">Bank:</span> <span className="text-slate-900">{order.bank_name} ({order.bic})</span></div>
            </div>

            <Separator className="bg-slate-200" />

            {/* Transaction Status */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-[#1e3a5f] uppercase">Transaction Status</h3>
              <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-xs text-slate-600">Status</Label>
                  <Badge className={order.transaction_status_received ? 'bg-emerald-600' : 'bg-slate-400'}>
                    {order.transaction_status_received ? 'Received' : 'Not Received'}
                  </Badge>
                </div>
                {order.transaction_status_number && (
                  <div className="text-sm text-slate-900 mb-1">
                    <span className="text-slate-500">Number:</span> {order.transaction_status_number}
                  </div>
                )}
                {order.transaction_status_date && (
                  <div className="text-sm text-slate-900 mb-2">
                    <span className="text-slate-500">Date:</span> {new Date(order.transaction_status_date).toLocaleDateString()}
                  </div>
                )}
                {order.attachment_transaction_status && (
                  <a href={order.attachment_transaction_status} target="_blank" rel="noopener noreferrer">
                    <Button size="sm" variant="outline" className="w-full border-slate-300">
                      <Download className="w-3 h-3 mr-2" />
                      Download Transaction Status
                    </Button>
                  </a>
                )}
              </div>
            </div>

            <Separator className="bg-slate-200" />

            {/* MT103 */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-[#1e3a5f] uppercase">MT103</h3>
              <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-xs text-slate-600">Status</Label>
                  <Badge className={order.mt103_received ? 'bg-emerald-600' : 'bg-slate-400'}>
                    {order.mt103_received ? 'Received' : 'Not Received'}
                  </Badge>
                </div>
                {order.mt103_number && (
                  <div className="text-sm text-slate-900 mb-1">
                    <span className="text-slate-500">Number:</span> {order.mt103_number}
                  </div>
                )}
                {order.mt103_date && (
                  <div className="text-sm text-slate-900 mb-2">
                    <span className="text-slate-500">Date:</span> {new Date(order.mt103_date).toLocaleDateString()}
                  </div>
                )}
                {order.attachment_mt103 && (
                  <a href={order.attachment_mt103} target="_blank" rel="noopener noreferrer">
                    <Button size="sm" variant="outline" className="w-full border-slate-300">
                      <Download className="w-3 h-3 mr-2" />
                      Download MT103
                    </Button>
                  </a>
                )}
              </div>
            </div>

            <Separator className="bg-slate-200" />

            {/* Act Report */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-[#1e3a5f] uppercase">Act Report</h3>
              <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 mb-3">
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-xs text-slate-600">Status</Label>
                  <Badge className={
                    order.act_report_status === 'signed' ? 'bg-emerald-600' :
                      order.act_report_status === 'on_sign' ? 'bg-amber-500' : 'bg-slate-400'
                  }>
                    {order.act_report_status === 'signed' ? 'Signed' :
                      order.act_report_status === 'on_sign' ? 'On Sign' : 'Not Made'}
                  </Badge>
                </div>
                {order.act_report_number && (
                  <div className="text-sm text-slate-900 mb-1">
                    <span className="text-slate-500">Number:</span> {order.act_report_number}
                  </div>
                )}
                {order.act_report_date && (
                  <div className="text-sm text-slate-900 mb-2">
                    <span className="text-slate-500">Date:</span> {new Date(order.act_report_date).toLocaleDateString()}
                  </div>
                )}
                {order.attachment_act_report && (
                  <a href={order.attachment_act_report} target="_blank" rel="noopener noreferrer">
                    <Button size="sm" variant="outline" className="w-full border-slate-300 mb-2">
                      <Download className="w-3 h-3 mr-2" />
                      Download Unsigned Act Report
                    </Button>
                  </a>
                )}
              </div>

              <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                <Label className="text-xs text-slate-700 mb-2 block font-medium">Upload Signed Act Report</Label>
                <div className="flex items-center gap-2">
                  <label className="flex-1">
                    <input
                      type="file"
                      onChange={handleActReportUpload}
                      className="hidden"
                      accept=".pdf,.doc,.docx"
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="w-full border-green-300 hover:bg-green-100"
                      onClick={(e) => e.currentTarget.previousElementSibling?.click()}
                      disabled={uploadingActReport}
                    >
                      <Upload className="w-3 h-3 mr-2" />
                      {uploadingActReport ? 'Uploading...' : 'Upload Signed Act Report'}
                    </Button>
                  </label>
                  {order.attachment_act_report_signed && (
                    <a href={order.attachment_act_report_signed} target="_blank" rel="noopener noreferrer">
                      <Button size="sm" variant="outline" className="border-green-300">
                        <Download className="w-3 h-3" />
                      </Button>
                    </a>
                  )}
                </div>
              </div>
            </div>

            <Separator className="bg-slate-200" />

            {/* Other Documents */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-[#1e3a5f] uppercase">Documents</h3>

              {order.attachment_sales_contract && (
                <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                  <Label className="text-xs text-slate-600 mb-2 block">Sales Contract</Label>
                  <a href={order.attachment_sales_contract} target="_blank" rel="noopener noreferrer">
                    <Button size="sm" variant="outline" className="w-full border-slate-300">
                      <Download className="w-3 h-3 mr-2" />
                      Download
                    </Button>
                  </a>
                </div>
              )}

              {order.attachment_invoice && (
                <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                  <Label className="text-xs text-slate-600 mb-2 block">Invoice</Label>
                  <a href={order.attachment_invoice} target="_blank" rel="noopener noreferrer">
                    <Button size="sm" variant="outline" className="w-full border-slate-300">
                      <Download className="w-3 h-3 mr-2" />
                      Download
                    </Button>
                  </a>
                </div>
              )}

              {order.attachment_other && (
                <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                  <Label className="text-xs text-slate-600 mb-2 block">Other Documents</Label>
                  <a href={order.attachment_other} target="_blank" rel="noopener noreferrer">
                    <Button size="sm" variant="outline" className="w-full border-slate-300">
                      <Download className="w-3 h-3 mr-2" />
                      Download
                    </Button>
                  </a>
                </div>
              )}

              {order.attachment_word_order && (
                <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                  <Label className="text-xs text-slate-600 mb-2 block">WORD Order</Label>
                  <a href={order.attachment_word_order} target="_blank" rel="noopener noreferrer">
                    <Button size="sm" variant="outline" className="w-full border-slate-300">
                      <Download className="w-3 h-3 mr-2" />
                      Download
                    </Button>
                  </a>
                </div>
              )}
            </div>

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
                  <div className="font-semibold text-slate-900">{debitAccount}</div>
                </div>

                <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                  <div className="text-xs text-slate-500 mb-1">Transaction Reference</div>
                  <div className="font-semibold text-slate-900 text-xs break-all">{order.transaction_reference || '-'}</div>
                </div>
              </div>

              <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                <div className="text-xs text-slate-500 mb-1">Beneficiary Name</div>
                <div className="font-semibold text-slate-900">{order.beneficiary_name}</div>
              </div>

              <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                <div className="text-xs text-slate-500 mb-1">Beneficiary Address</div>
                <div className="font-semibold text-slate-900 text-sm">{order.beneficiary_address}</div>
              </div>

              <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                <div className="text-xs text-slate-500 mb-1">Destination Account</div>
                <div className="font-semibold text-slate-900">{order.destination_account}</div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                  <div className="text-xs text-slate-500 mb-1">Bank Country</div>
                  <div className="font-semibold text-slate-900">{order.country_bank}</div>
                </div>

                <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                  <div className="text-xs text-slate-500 mb-1">BIC/SWIFT</div>
                  <div className="font-semibold text-slate-900">{order.bic}</div>
                </div>
              </div>

              <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                <div className="text-xs text-slate-500 mb-1">Bank Name</div>
                <div className="font-semibold text-slate-900">{order.bank_name}</div>
              </div>

              <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                <div className="text-xs text-slate-500 mb-1">Bank Address</div>
                <div className="font-semibold text-slate-900 text-sm">{order.bank_address || '-'}</div>
              </div>

              <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                <div className="text-xs text-slate-500 mb-1">Transaction Remark</div>
                <div className="font-semibold text-slate-900 text-sm whitespace-pre-wrap">{order.transaction_remark}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 p-4 bg-white border-t border-slate-200">
          <Button
            type="button"
            onClick={onClose}
            className="w-full bg-[#1e3a5f] hover:bg-[#152a45]"
          >
            Close
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}