import React, { useState, useEffect } from 'react';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { parseStatusHistory } from '@/components/utils/statusHistoryHelper';

import { toast } from 'sonner';
import { Download, Upload, FileText } from 'lucide-react';
import moment from 'moment';
import apiClient from '@/api/apiClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export default function StaffExecutedDrawer({ order, open, onClose, onUpdate }) {
  const [formData, setFormData] = useState({});
  const [uploading, setUploading] = useState({});

  const queryClient = useQueryClient();

  useEffect(() => {
    if (order) {
      setFormData({
        mt103_status: order.mt103_status || 'not_sent',
        mt103_number: order.mt103_no || order.mt103_number || '',
        mt103_date: order.mt103_date || '',
        mt103_received: order.mt103_received || false,
        transaction_status_number: order.transaction_status_no || order.transaction_status_number || '',
        transaction_status_date: order.transaction_status_date || '',
        transaction_status_received: (order.transaction_status_status === 'Y') || order.transaction_status_received || false,
        act_report_number: order.act_report_no || order.act_report_number || '',
        act_report_date: order.act_report_date || '',
        act_report_status: order.doc_package_status || order.act_report_status || 'not_made',
        settled: order.settled_status || order.settled || 'NA',
        refund: (order.refund_flag === 'Y') || order.refund || false,
        staff_description: order.staff_description || '',
        closed: order.closed || false
      });
    }
  }, [order]);

  // Fetch documents specifically for this order
  const { data: documents = [], refetch: refetchDocuments } = useQuery({
    queryKey: ['order-documents', order?.sourceOrderId || order?.orderId],
    queryFn: () => apiClient.getOrderDocuments(order?.sourceOrderId || order?.orderId),
    enabled: !!order && open, // Only fetch when drawer is open
    staleTime: 0, // Always fetch fresh
  });

  // Find documents by type
  const mt103Doc = documents.find(d => d.doc_type === 'mt103');
  const txStatusDoc = documents.find(d => d.doc_type === 'transaction_status');
  const actReportDoc = documents.find(d => d.doc_type === 'act_report_unsigned'); // Unsigned
  const actReportSignedDoc = documents.find(d => d.doc_type === 'act_report_signed_staff'); // Signed Staff

  if (!order) return null;



  const handleSave = async () => {
    try {
      const payload = {
        doc_package_status: formData.act_report_status,
        mt103_status: formData.mt103_received ? 'sent' : 'not_sent',
        settled_status: formData.settled,
        refund_flag: formData.refund ? 'Y' : 'N',
        staff_description: formData.staff_description,

        mt103_no: formData.mt103_number,
        mt103_date: formData.mt103_date || null,

        transaction_status_no: formData.transaction_status_number,
        transaction_status_date: formData.transaction_status_date || null,
        transaction_status_status: formData.transaction_status_received ? 'Y' : 'N',

        act_report_no: formData.act_report_number,
        act_report_date: formData.act_report_date || null
      };

      const idToUpdate = order.sourceOrderId || order.orderId;
      await apiClient.updateExecutedOrder(idToUpdate, payload);

      onUpdate(formData);
      onClose();
      toast.success('Changes saved successfully');
    } catch (error) {
      console.error(error);
      toast.error('Failed to save changes');
    }
  };

  const handleFileUpload = async (file, field) => {
    if (!file) return;

    setUploading(prev => ({ ...prev, [field]: true }));
    try {
      const orderId = order.sourceOrderId || order.orderId;
      let docType = null;

      if (field === 'attachment_mt103') docType = 'mt103';
      if (field === 'attachment_transaction_status') docType = 'transaction_status';
      if (field === 'attachment_act_report') docType = 'act_report_unsigned';
      if (field === 'attachment_act_report_signed') docType = 'act_report_signed_staff';

      if (!docType) throw new Error('Unknown document type');

      // Upload using new API
      await apiClient.uploadOrderDocument(orderId, file, docType);

      // Refresh documents list
      await refetchDocuments();

      toast.success('Document uploaded successfully');
    } catch (error) {
      console.error(error);
      toast.error(error.message || 'Failed to upload document');
    } finally {
      setUploading(prev => ({ ...prev, [field]: false }));
    }
  };

  const handleDownload = async (docId, fileName) => {
    try {
      const orderId = order.sourceOrderId || order.orderId;
      const { presigned_url } = await apiClient.downloadDocument(orderId, docId);

      // Create hidden link and click it
      const link = document.createElement('a');
      link.href = presigned_url;
      link.download = fileName || 'document'; // fileName might be ignored by browser if Content-Disposition is set
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download document');
    }
  };

  const handleCreateActReport = async () => {
    setUploading(prev => ({ ...prev, create_act_report: true }));
    try {
      const id = order.sourceOrderId || order.orderId;
      const blob = await apiClient.generateExecutedOrderActReport(id);

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Act_Report_${id}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('Act Report generated successfully');
    } catch (error) {
      console.error(error);
      toast.error('Failed to generate Act Report');
    } finally {
      setUploading(prev => ({ ...prev, create_act_report: false }));
    }
  };

  const historyEntries = parseStatusHistory(order.status_history);

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent aria-describedby={undefined} className="w-full sm:max-w-2xl overflow-y-auto bg-white border-slate-200 text-slate-900">
        <SheetHeader>
          <SheetTitle className="text-slate-900 flex items-center gap-3">
            Order #{order.order_number}
            <Badge className="bg-emerald-600 text-white">Released</Badge>
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Order Info (Read-only) */}
          <div className="bg-slate-50 rounded-lg p-4 space-y-2 border border-slate-200">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-slate-500">Client:</div>
              <div className="text-slate-900">{order.client_name || '-'}</div>
              <div className="text-slate-500">Amount:</div>
              <div className="font-medium text-emerald-700">{order.amount?.toLocaleString()} {order.currency}</div>
              <div className="text-slate-500">Beneficiary:</div>
              <div className="text-slate-900">{order.beneficiary_name}</div>
              <div className="text-slate-500">Bank:</div>
              <div className="text-slate-900">{order.bank_name} ({order.bic})</div>
            </div>
          </div>

          <Separator className="bg-slate-200" />

          {/* Transaction Status Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-[#1e3a5f] uppercase">Transaction Status</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-slate-600">Number</Label>
                <Input
                  value={formData.transaction_status_number || ''}
                  onChange={(e) => setFormData({ ...formData, transaction_status_number: e.target.value })}
                  className="mt-1 bg-white border-slate-300"
                />
              </div>
              <div>
                <Label className="text-xs text-slate-600">Date</Label>
                <Input
                  type="date"
                  value={formData.transaction_status_date || ''}
                  onChange={(e) => setFormData({ ...formData, transaction_status_date: e.target.value })}
                  className="mt-1 bg-white border-slate-300"
                />
              </div>
            </div>
            <div>
              <Label className="text-xs text-slate-600">Status</Label>
              <Select
                value={formData.transaction_status_received ? 'Y' : 'N'}
                onValueChange={(val) => setFormData({ ...formData, transaction_status_received: val === 'Y' })}
              >
                <SelectTrigger className="bg-white border-slate-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Y">Yes</SelectItem>
                  <SelectItem value="N">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <label className="flex-1">
                <input
                  type="file"
                  onChange={(e) => handleFileUpload(e.target.files?.[0], 'attachment_transaction_status')}
                  className="hidden"
                  accept=".pdf,.doc,.docx"
                />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="w-full border-slate-300"
                  onClick={(e) => e.currentTarget.previousElementSibling?.click()}
                  disabled={uploading.attachment_transaction_status}
                >
                  <Upload className="w-3 h-3 mr-2" />
                  {uploading.attachment_transaction_status ? 'Uploading...' : 'Upload Document'}
                </Button>
              </label>
              {txStatusDoc && (
                <Button
                  size="sm"
                  variant="outline"
                  className="border-slate-300"
                  onClick={() => handleDownload(txStatusDoc.doc_id, txStatusDoc.file_name)}
                >
                  <Download className="w-3 h-3" />
                </Button>
              )}
            </div>
          </div>

          <Separator className="bg-slate-200" />

          {/* MT103 Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-[#1e3a5f] uppercase">MT103</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-slate-600">Number</Label>
                <Input
                  value={formData.mt103_number || ''}
                  onChange={(e) => setFormData({ ...formData, mt103_number: e.target.value })}
                  className="mt-1 bg-white border-slate-300"
                />
              </div>
              <div>
                <Label className="text-xs text-slate-600">Date</Label>
                <Input
                  type="date"
                  value={formData.mt103_date || ''}
                  onChange={(e) => setFormData({ ...formData, mt103_date: e.target.value })}
                  className="mt-1 bg-white border-slate-300"
                />
              </div>
            </div>
            <div>
              <Label className="text-xs text-slate-600">Status</Label>
              <Select
                value={formData.mt103_received ? 'Y' : 'N'}
                onValueChange={(val) => setFormData({ ...formData, mt103_received: val === 'Y' })}
              >
                <SelectTrigger className="bg-white border-slate-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Y">Yes</SelectItem>
                  <SelectItem value="N">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <label className="flex-1">
                <input
                  type="file"
                  onChange={(e) => handleFileUpload(e.target.files?.[0], 'attachment_mt103')}
                  className="hidden"
                  accept=".pdf,.doc,.docx"
                />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="w-full border-slate-300"
                  onClick={(e) => e.currentTarget.previousElementSibling?.click()}
                  disabled={uploading.attachment_mt103}
                >
                  <Upload className="w-3 h-3 mr-2" />
                  {uploading.attachment_mt103 ? 'Uploading...' : 'Upload Document'}
                </Button>
              </label>
              {mt103Doc && (
                <Button
                  size="sm"
                  variant="outline"
                  className="border-slate-300"
                  onClick={() => handleDownload(mt103Doc.doc_id, mt103Doc.file_name)}
                >
                  <Download className="w-3 h-3" />
                </Button>
              )}
            </div>
          </div>

          <Separator className="bg-slate-200" />

          {/* Act Report Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-[#1e3a5f] uppercase">Act Report</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-slate-600">Number</Label>
                <Input
                  value={formData.act_report_number || ''}
                  onChange={(e) => setFormData({ ...formData, act_report_number: e.target.value })}
                  className="mt-1 bg-white border-slate-300"
                />
              </div>
              <div>
                <Label className="text-xs text-slate-600">Date</Label>
                <Input
                  type="date"
                  value={formData.act_report_date || ''}
                  onChange={(e) => setFormData({ ...formData, act_report_date: e.target.value })}
                  className="mt-1 bg-white border-slate-300"
                />
              </div>
            </div>
            <div>
              <Label className="text-xs text-slate-600">Status</Label>
              <Select
                value={formData.act_report_status || 'not_made'}
                onValueChange={(val) => setFormData({ ...formData, act_report_status: val })}
              >
                <SelectTrigger className="bg-white border-slate-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="not_made">Not Made</SelectItem>
                  <SelectItem value="on_sign">On Sign</SelectItem>
                  <SelectItem value="signed">Signed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-slate-600">Create Act Report</Label>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="w-full border-blue-600 text-blue-700 hover:bg-blue-50"
                onClick={handleCreateActReport}
                disabled={uploading.create_act_report}
              >
                <FileText className="w-3 h-3 mr-2" />
                {uploading.create_act_report ? 'Generating...' : 'Create Act Report'}
              </Button>
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-slate-600">Unsigned Act Report</Label>
              <div className="flex items-center gap-2">
                <label className="flex-1">
                  <input
                    type="file"
                    onChange={(e) => handleFileUpload(e.target.files?.[0], 'attachment_act_report')}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.xlsx,.xls"
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="w-full border-slate-300"
                    onClick={(e) => e.currentTarget.previousElementSibling?.click()}
                    disabled={uploading.attachment_act_report}
                  >
                    <Upload className="w-3 h-3 mr-2" />
                    {uploading.attachment_act_report ? 'Uploading...' : 'Upload Unsigned'}
                  </Button>
                </label>
                {actReportDoc && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-slate-300"
                    onClick={() => handleDownload(actReportDoc.doc_id, actReportDoc.file_name)}
                  >
                    <Download className="w-3 h-3" />
                  </Button>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-slate-600">Signed Act Report</Label>
              <div className="flex items-center gap-2">
                <label className="flex-1">
                  <input
                    type="file"
                    onChange={(e) => handleFileUpload(e.target.files?.[0], 'attachment_act_report_signed')}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.xlsx,.xls"
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="w-full border-emerald-600 text-emerald-700 hover:bg-emerald-50"
                    onClick={(e) => e.currentTarget.previousElementSibling?.click()}
                    disabled={uploading.attachment_act_report_signed}
                  >
                    <Upload className="w-3 h-3 mr-2" />
                    {uploading.attachment_act_report_signed ? 'Uploading...' : 'Upload Signed'}
                  </Button>
                </label>
                {actReportSignedDoc && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-emerald-600 text-emerald-700"
                    onClick={() => handleDownload(actReportSignedDoc.doc_id, actReportSignedDoc.file_name)}
                  >
                    <Download className="w-3 h-3" />
                  </Button>
                )}
              </div>
            </div>
          </div>

          <Separator className="bg-slate-200" />

          {/* Notes */}
          <div className="space-y-2">
            <Label className="text-xs text-slate-600">Staff Notes</Label>
            <Textarea
              value={formData.staff_description || ''}
              onChange={(e) => setFormData({ ...formData, staff_description: e.target.value })}
              placeholder="Additional notes..."
              className="bg-white border-slate-300 min-h-[80px]"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1 border-slate-300">
              Cancel
            </Button>
            <Button onClick={handleSave} className="flex-1 bg-emerald-600 hover:bg-emerald-700">
              Save Changes
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}