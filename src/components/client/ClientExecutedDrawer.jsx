import React, { useState } from 'react';
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

export default function ClientExecutedDrawer({ order, open, onClose, onUpdate }) {
  const [uploadingActReport, setUploadingActReport] = useState(false);

  if (!order) return null;

  const handleActReportUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingActReport(true);
    try {
      await apiClient.uploadOrderDocument(order.orderId, file, 'act_report_signed_client');
      toast.success('Signed Act Report uploaded successfully');
      onUpdate?.();
    } catch (error) {
      toast.error(error.message || 'Failed to upload Act Report');
    } finally {
      setUploadingActReport(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={(val) => !val && onClose()}>
      <SheetContent className="w-full sm:max-w-2xl bg-white border-slate-200 text-slate-900 flex flex-col overflow-hidden">
        <SheetHeader className="mb-4 flex-shrink-0">
          <SheetTitle className="text-slate-900 flex items-center gap-3">
            Order #{order.orderId}
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-1 pb-6">
          <div className="space-y-6">
            {/* Order Info */}
            <div className="bg-slate-50 rounded-lg p-4 text-sm space-y-2 border border-slate-200">
              <div><span className="text-slate-500 font-medium">Client:</span> <span className="text-slate-900">{order.clientName || order.clientId}</span></div>
              <div><span className="text-slate-500 font-medium">Amount:</span> <span className="text-emerald-600 font-semibold">{parseFloat(order.amount || 0).toLocaleString()} {order.currency}</span></div>
              <div><span className="text-slate-500 font-medium">Beneficiary:</span> <span className="text-slate-900">{order.beneficiaryName}</span></div>
              <div><span className="text-slate-500 font-medium">Bank:</span> <span className="text-slate-900">{order.bankName} ({order.bankBic})</span></div>
            </div>

            <Separator className="bg-slate-200" />

            {/* Transaction Status */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-[#1e3a5f] uppercase">Transaction Status</h3>
              <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-xs text-slate-600">Status</Label>
                  <Badge className={order.transactionStatusReceived ? 'bg-emerald-600' : 'bg-slate-400'}>
                    {order.transactionStatusReceived ? 'Received' : 'Not Received'}
                  </Badge>
                </div>
                {order.transactionStatusNumber && (
                  <div className="text-sm text-slate-900 mb-1">
                    <span className="text-slate-500">Number:</span> {order.transactionStatusNumber}
                  </div>
                )}
                {order.transactionStatusDate && (
                  <div className="text-sm text-slate-900 mb-2">
                    <span className="text-slate-500">Date:</span> {new Date(order.transactionStatusDate).toLocaleDateString()}
                  </div>
                )}
                {order.attachmentTransactionStatus && (
                  <a href={order.attachmentTransactionStatus} target="_blank" rel="noopener noreferrer">
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
                  <Badge className={order.mt103Received ? 'bg-emerald-600' : 'bg-slate-400'}>
                    {order.mt103Received ? 'Received' : 'Not Received'}
                  </Badge>
                </div>
                {order.mt103Number && (
                  <div className="text-sm text-slate-900 mb-1">
                    <span className="text-slate-500">Number:</span> {order.mt103Number}
                  </div>
                )}
                {order.mt103Date && (
                  <div className="text-sm text-slate-900 mb-2">
                    <span className="text-slate-500">Date:</span> {new Date(order.mt103Date).toLocaleDateString()}
                  </div>
                )}
                {order.attachmentMt103 && (
                  <a href={order.attachmentMt103} target="_blank" rel="noopener noreferrer">
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
                    order.actReportStatus === 'signed' ? 'bg-emerald-600' :
                    order.actReportStatus === 'on_sign' ? 'bg-amber-500' : 'bg-slate-400'
                  }>
                    {order.actReportStatus === 'signed' ? 'Signed' :
                     order.actReportStatus === 'on_sign' ? 'On Sign' : 'Not Made'}
                  </Badge>
                </div>
                {order.actReportNumber && (
                  <div className="text-sm text-slate-900 mb-1">
                    <span className="text-slate-500">Number:</span> {order.actReportNumber}
                  </div>
                )}
                {order.actReportDate && (
                  <div className="text-sm text-slate-900 mb-2">
                    <span className="text-slate-500">Date:</span> {new Date(order.actReportDate).toLocaleDateString()}
                  </div>
                )}
                {order.attachmentActReport && (
                  <a href={order.attachmentActReport} target="_blank" rel="noopener noreferrer">
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
                  {order.attachmentActReportSigned && (
                    <a href={order.attachmentActReportSigned} target="_blank" rel="noopener noreferrer">
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
              
              {order.attachmentSalesContract && (
                <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                  <Label className="text-xs text-slate-600 mb-2 block">Sales Contract</Label>
                  <a href={order.attachmentSalesContract} target="_blank" rel="noopener noreferrer">
                    <Button size="sm" variant="outline" className="w-full border-slate-300">
                      <Download className="w-3 h-3 mr-2" />
                      Download
                    </Button>
                  </a>
                </div>
              )}

              {order.attachmentInvoice && (
                <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                  <Label className="text-xs text-slate-600 mb-2 block">Invoice</Label>
                  <a href={order.attachmentInvoice} target="_blank" rel="noopener noreferrer">
                    <Button size="sm" variant="outline" className="w-full border-slate-300">
                      <Download className="w-3 h-3 mr-2" />
                      Download
                    </Button>
                  </a>
                </div>
              )}

              {order.attachmentOther && (
                <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                  <Label className="text-xs text-slate-600 mb-2 block">Other Documents</Label>
                  <a href={order.attachmentOther} target="_blank" rel="noopener noreferrer">
                    <Button size="sm" variant="outline" className="w-full border-slate-300">
                      <Download className="w-3 h-3 mr-2" />
                      Download
                    </Button>
                  </a>
                </div>
              )}

              {order.attachmentWordOrder && (
                <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                  <Label className="text-xs text-slate-600 mb-2 block">WORD Order</Label>
                  <a href={order.attachmentWordOrder} target="_blank" rel="noopener noreferrer">
                    <Button size="sm" variant="outline" className="w-full border-slate-300">
                      <Download className="w-3 h-3 mr-2" />
                      Download
                    </Button>
                  </a>
                </div>
              )}
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