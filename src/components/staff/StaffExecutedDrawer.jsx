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
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { Download, Upload, FileText } from 'lucide-react';
import moment from 'moment';

export default function StaffExecutedDrawer({ order, open, onClose, onUpdate }) {
  const [formData, setFormData] = useState({});
  const [uploading, setUploading] = useState({});

  useEffect(() => {
    if (order) {
      setFormData({
        mt103_status: order.mt103_status || 'not_sent',
        mt103_number: order.mt103_number || '',
        mt103_date: order.mt103_date || '',
        mt103_received: order.mt103_received || false,
        transaction_status_number: order.transaction_status_number || '',
        transaction_status_date: order.transaction_status_date || '',
        transaction_status_received: order.transaction_status_received || false,
        act_report_number: order.act_report_number || '',
        act_report_date: order.act_report_date || '',
        act_report_status: order.act_report_status || 'not_made',
        settled: order.settled || 'NA',
        refund: order.refund || false,
        staff_description: order.staff_description || '',
        closed: order.closed || false
      });
    }
  }, [order]);

  if (!order) return null;

  const handleSave = () => {
    onUpdate(formData);
    onClose();
  };

  const handleFileUpload = async (file, field) => {
    if (!file) return;

    setUploading(prev => ({ ...prev, [field]: true }));
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      const updates = { [field]: file_url };

      await base44.entities.RemittanceOrder.update(order.id, updates);
      toast.success('Document uploaded successfully');

      // Update local order
      if (order) order[field] = file_url;
    } catch (error) {
      toast.error('Failed to upload document');
    } finally {
      setUploading(prev => ({ ...prev, [field]: false }));
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
              {order.attachment_transaction_status && (
                <a href={order.attachment_transaction_status} target="_blank" rel="noopener noreferrer">
                  <Button size="sm" variant="outline" className="border-slate-300">
                    <Download className="w-3 h-3" />
                  </Button>
                </a>
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
              {order.attachment_mt103 && (
                <a href={order.attachment_mt103} target="_blank" rel="noopener noreferrer">
                  <Button size="sm" variant="outline" className="border-slate-300">
                    <Download className="w-3 h-3" />
                  </Button>
                </a>
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
              <Label className="text-xs text-slate-600">Unsigned Act Report</Label>
              <div className="flex items-center gap-2">
                <label className="flex-1">
                  <input
                    type="file"
                    onChange={(e) => handleFileUpload(e.target.files?.[0], 'attachment_act_report')}
                    className="hidden"
                    accept=".pdf,.doc,.docx"
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
                {order.attachment_act_report && (
                  <a href={order.attachment_act_report} target="_blank" rel="noopener noreferrer">
                    <Button size="sm" variant="outline" className="border-slate-300">
                      <Download className="w-3 h-3" />
                    </Button>
                  </a>
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
                    accept=".pdf,.doc,.docx"
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
                {order.attachment_act_report_signed && (
                  <a href={order.attachment_act_report_signed} target="_blank" rel="noopener noreferrer">
                    <Button size="sm" variant="outline" className="border-emerald-600">
                      <Download className="w-3 h-3" />
                    </Button>
                  </a>
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