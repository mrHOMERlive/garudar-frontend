import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Download, Copy, CheckCircle2, Circle } from 'lucide-react';
import { toast } from 'sonner';
import moment from 'moment';
import OrderStatusBadge, { STATUS_CONFIG } from './OrderStatusBadge';
import { generateCSVData, downloadCSV } from '../remittance/utils/csvGenerator';

const STATUS_ORDER = ['SUBMITTED', 'PENDING', 'IN_PROGRESS', 'COMPLETED'];

function maskAccount(account) {
  if (!account || account.length < 8) return account;
  return account.slice(0, 4) + '****' + account.slice(-4);
}

function DetailRow({ label, value, mono = false }) {
  return (
    <div className="flex justify-between py-2">
      <span className="text-slate-500 text-sm">{label}</span>
      <span className={`text-slate-800 text-sm ${mono ? 'font-mono' : ''}`}>{value || '-'}</span>
    </div>
  );
}

function StatusTimeline({ order }) {
  const statusHistory = [
    { status: order.status, timestamp: order.createdAt }
  ];
  
  const currentStatusIndex = STATUS_ORDER.indexOf(order.status);
  
  return (
    <div className="space-y-3">
      <h4 className="font-medium text-slate-800">Status Timeline</h4>
      <div className="space-y-2">
        {STATUS_ORDER.map((status, index) => {
          const historyEntry = statusHistory.find(h => h.status === status);
          const isCompleted = index <= currentStatusIndex && order.status !== 'REJECTED';
          const isCurrent = status === order.status;
          const config = STATUS_CONFIG[status];
          
          return (
            <div key={status} className="flex items-center gap-3">
              {isCompleted ? (
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              ) : (
                <Circle className="w-5 h-5 text-slate-300" />
              )}
              <div className="flex-1">
                <span className={`text-sm ${isCurrent ? 'font-semibold text-slate-800' : 'text-slate-600'}`}>
                  {config?.label || status}
                </span>
              </div>
              {historyEntry && (
                <span className="text-xs text-slate-400">
                  {moment(historyEntry.timestamp).format('DD/MM/YY HH:mm')}
                </span>
              )}
            </div>
          );
        })}
        
        {order.status === 'REJECTED' && (
          <div className="flex items-center gap-3">
            <Circle className="w-5 h-5 text-red-500" />
            <span className="text-sm font-semibold text-red-600">Rejected</span>
          </div>
        )}
        {order.status === 'canceled' && (
          <div className="flex items-center gap-3">
            <Circle className="w-5 h-5 text-slate-500" />
            <span className="text-sm font-semibold text-slate-600">Cancelled</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function OrderDetailsDrawer({ order, open, onClose }) {
  if (!order) return null;

  const handleDownloadCSV = () => {
    const csvData = generateCSVData(order);
    downloadCSV(csvData, `order_${order.orderId}.csv`);
    toast.success('CSV downloaded');
  };

  const handleCopyOrderId = () => {
    navigator.clipboard.writeText(order.orderId);
    toast.success('Order ID copied');
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2">
              Order #{order.orderId}
              <button onClick={handleCopyOrderId} className="text-slate-400 hover:text-slate-600">
                <Copy className="w-4 h-4" />
              </button>
            </SheetTitle>
            <OrderStatusBadge status={order.status} />
          </div>
          <SheetDescription>
            Created {order.createdAt ? moment(order.createdAt).format('DD MMM YYYY, HH:mm') : '-'}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Payment Details */}
          <div>
            <h4 className="font-medium text-slate-800 mb-2">Payment Details</h4>
            <div className="bg-slate-50 rounded-lg p-4">
              <DetailRow label="Amount" value={`${order.amount?.toLocaleString()} ${order.currency}`} />
            </div>
          </div>

          <Separator />

          {/* Beneficiary */}
          <div>
            <h4 className="font-medium text-slate-800 mb-2">Beneficiary</h4>
            <div className="bg-slate-50 rounded-lg p-4">
              <DetailRow label="Name" value={order.beneficiaryName} />
              <DetailRow label="Address" value={order.beneficiaryAddress} />
              <DetailRow label="Account" value={maskAccount(order.destinationAccount)} mono />
            </div>
          </div>

          <Separator />

          {/* Bank Details */}
          <div>
            <h4 className="font-medium text-slate-800 mb-2">Bank Details</h4>
            <div className="bg-slate-50 rounded-lg p-4">
              <DetailRow label="Bank Name" value={order.bankName} />
              <DetailRow label="BIC/SWIFT" value={order.bankBic} mono />
              <DetailRow label="Country" value={order.bankCountry} />
              <DetailRow label="Address" value={order.bankAddress} />
            </div>
          </div>

          <Separator />

          {/* Transaction Remark */}
          <div>
            <h4 className="font-medium text-slate-800 mb-2">Transaction Remark</h4>
            <div className="bg-slate-50 rounded-lg p-4">
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{order.remark || '-'}</p>
            </div>
          </div>

          <Separator />

          {/* Status Timeline */}
          <StatusTimeline order={order} />

          <Separator />

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              onClick={handleDownloadCSV}
              variant="outline"
              className="flex-1"
            >
              <Download className="w-4 h-4 mr-2" />
              Download CSV
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}