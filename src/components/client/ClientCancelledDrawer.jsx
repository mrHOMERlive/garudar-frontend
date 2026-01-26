import React from 'react';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import apiClient from '@/api/apiClient';
import { useQuery } from '@tanstack/react-query';

export default function ClientCancelledDrawer({ order, open, onClose }) {
  const { data: terms } = useQuery({
    queryKey: ['order-terms', order?.orderId],
    queryFn: () => apiClient.getOrderTerms(order?.orderId),
    enabled: !!order?.orderId && open,
  });

  if (!order) return null;

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
                  <div className="font-semibold text-slate-900">{terms?.executingBank || '-'}</div>
                </div>

                <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                  <div className="text-xs text-slate-500 mb-1">Transaction Reference</div>
                  <div className="font-semibold text-slate-900 text-xs break-all">{order.orderId || '-'}</div>
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