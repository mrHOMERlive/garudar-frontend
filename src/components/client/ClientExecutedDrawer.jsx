import React, { useState } from 'react';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { base44 } from '@/api/base44Client';
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
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      await base44.entities.RemittanceOrder.update(order.id, { 
        attachment_act_report_signed: file_url 
      });
      toast.success('Signed Act Report uploaded successfully');
      if (order) order.attachment_act_report_signed = file_url;
      onUpdate?.();
    } catch (error) {
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