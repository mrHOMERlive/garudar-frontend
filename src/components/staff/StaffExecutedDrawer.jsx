import React, { useState, useEffect } from 'react';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { parseStatusHistory } from '@/components/utils/statusHistoryHelper';
import moment from 'moment';

export default function StaffExecutedDrawer({ order, open, onClose, onUpdate }) {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (order) {
      setFormData({
        mt103_status: order.mt103_status || 'not_sent',
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

  const historyEntries = parseStatusHistory(order.status_history);

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto bg-slate-900 border-slate-700 text-white">
        <SheetHeader>
          <SheetTitle className="text-white flex items-center gap-3">
            Order #{order.order_number}
            <Badge className="bg-green-600">Released</Badge>
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Order Info (Read-only) */}
          <div className="bg-slate-800 rounded-lg p-4 space-y-2">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-slate-400">Client:</div>
              <div>{order.client_name || '-'}</div>
              <div className="text-slate-400">Amount:</div>
              <div className="font-medium">{order.amount?.toLocaleString()} {order.currency}</div>
              <div className="text-slate-400">Beneficiary:</div>
              <div>{order.beneficiary_name}</div>
              <div className="text-slate-400">Bank:</div>
              <div>{order.bank_name} ({order.bic})</div>
              <div className="text-slate-400">Account:</div>
              <div className="font-mono text-xs">{order.destination_account}</div>
              <div className="text-slate-400">Remark:</div>
              <div className="text-xs">{order.transaction_remark}</div>
            </div>
          </div>

          <Separator className="bg-slate-700" />

          {/* Editable Fields */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>MT103 Status</Label>
              <Select
                value={formData.mt103_status}
                onValueChange={(value) => setFormData({ ...formData, mt103_status: value })}
              >
                <SelectTrigger className="bg-slate-800 border-slate-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="not_sent">Not Sent</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Settled</Label>
              <Select
                value={formData.settled}
                onValueChange={(value) => setFormData({ ...formData, settled: value })}
              >
                <SelectTrigger className="bg-slate-800 border-slate-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Y">Yes</SelectItem>
                  <SelectItem value="N">No</SelectItem>
                  <SelectItem value="NA">N/A</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <Label>Refund</Label>
              <Switch
                checked={formData.refund}
                onCheckedChange={(checked) => setFormData({ ...formData, refund: checked })}
              />
            </div>

            <div className="space-y-2">
              <Label>Description / Notes</Label>
              <Textarea
                value={formData.staff_description}
                onChange={(e) => setFormData({ ...formData, staff_description: e.target.value })}
                placeholder="Additional notes..."
                className="bg-slate-800 border-slate-600 min-h-[80px]"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label>Closed (Move to Client History)</Label>
              <Switch
                checked={formData.closed}
                onCheckedChange={(checked) => setFormData({ ...formData, closed: checked })}
              />
            </div>
          </div>

          <Separator className="bg-slate-700" />

          {/* Timeline */}
          <div>
            <Label className="mb-3 block">Status History</Label>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {historyEntries.length > 0 ? historyEntries.map((entry, i) => (
                <div key={i} className="flex justify-between text-sm bg-slate-800 rounded p-2">
                  <span className="capitalize">{entry.status?.replace('_', ' ')}</span>
                  <span className="text-slate-400">{moment(entry.timestamp).format('DD/MM/YY HH:mm')}</span>
                </div>
              )) : (
                <div className="text-sm text-slate-500">No history</div>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1 border-slate-600 text-slate-300">
              Cancel
            </Button>
            <Button onClick={handleSave} className="flex-1 bg-teal-600 hover:bg-teal-700">
              Save Changes
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}