import React from 'react';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Download } from 'lucide-react';
import apiClient from '@/api/apiClient';
import { useQuery } from '@tanstack/react-query';

export default function ClientDeletedDrawer({ order, open, onClose }) {
  const { data: terms } = useQuery({
    queryKey: ['order-terms', order?.orderId],
    queryFn: () => apiClient.getOrderTerms(order?.orderId),
    enabled: !!order?.orderId && open,
  });

  if (!order) return null;

  const hasDocuments = order.attachment_sales_contract || order.attachment_invoice ||
    order.attachment_other || order.attachment_word_order ||
    order.attachment_word_order_signed;

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
            {/* Documents (if any) */}
            {hasDocuments && (
              <>
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

                  {order.attachment_word_order_signed && (
                    <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                      <Label className="text-xs text-slate-600 mb-2 block">Signed WORD Order</Label>
                      <a href={order.attachment_word_order_signed} target="_blank" rel="noopener noreferrer">
                        <Button size="sm" variant="outline" className="w-full border-slate-300">
                          <Download className="w-3 h-3 mr-2" />
                          Download
                        </Button>
                      </a>
                    </div>
                  )}
                </div>

                <Separator className="bg-slate-200" />
              </>
            )}

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
                  <div className="font-semibold text-slate-900">{terms?.GANBankAccount || '-'}</div>
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