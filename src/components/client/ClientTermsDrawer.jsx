import React, { useState } from 'react';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { apiClient } from '@/api/apiClient';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Download, Upload, CheckCircle, X, Trash2 } from 'lucide-react';

export default function ClientTermsDrawer({ order, client, open, onClose, onUpdate }) {
  const [uploadingWordOrder, setUploadingWordOrder] = useState(false);
  const [uploadingPaymentProof, setUploadingPaymentProof] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const queryClient = useQueryClient();

  const cancelMutation = useMutation({
    mutationFn: () => apiClient.cancelOrder(order?.orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['current-orders'] });
      toast.success('Order cancelled');
      onUpdate?.();
      onClose();
    },
    onError: () => {
      toast.error('Failed to cancel order');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => apiClient.deleteOrder(order?.orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['current-orders'] });
      toast.success('Order deleted');
      onUpdate?.();
      onClose();
    },
    onError: () => {
      toast.error('Failed to delete order');
    },
  });

  if (!order) return null;

  const handleWordOrderUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingWordOrder(true);
    try {
      const { file_url } = await apiClient.uploadFile(file);
      await apiClient.updateOrder(order.orderId, { 
        attachmentWordOrderSigned: file_url 
      });
      toast.success('Signed order uploaded successfully');
      onUpdate?.();
    } catch (error) {
      toast.error('Failed to upload signed order');
    } finally {
      setUploadingWordOrder(false);
    }
  };

  const handlePaymentProofUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPaymentProof(true);
    try {
      const { file_url } = await apiClient.uploadFile(file);
      await apiClient.updateOrder(order.orderId, {
        attachmentTransactionStatus: file_url,
        paymentProof: true,
        datePaymentProof: new Date().toISOString().split('T')[0]
      });
      toast.success('Payment proof uploaded successfully');
      onUpdate?.();
    } catch (error) {
      toast.error('Failed to upload payment proof');
    } finally {
      setUploadingPaymentProof(false);
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
              <div><span className="text-slate-500 font-medium">Client:</span> <span className="text-slate-900">{client?.client_name || order.clientId}</span></div>
              <div><span className="text-slate-500 font-medium">Amount:</span> <span className="text-emerald-600 font-semibold">{order.amount?.toLocaleString()} {order.currency}</span></div>
              <div><span className="text-slate-500 font-medium">Beneficiary:</span> <span className="text-slate-900">{order.beneficiaryName}</span></div>
              <div><span className="text-slate-500 font-medium">Bank:</span> <span className="text-slate-900">{order.bankName} ({order.bankBic})</span></div>
            </div>

            <Separator className="bg-slate-200" />

            {/* TERMS Section */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-[#1e3a5f] uppercase">Terms</h3>
              
              {/* Payment Proof Status */}
              <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  {order.paymentProof ? (
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-slate-400" />
                  )}
                  <Label className="text-xs text-slate-700 font-medium">Payment Proof</Label>
                </div>
                <div className="text-xs text-slate-600">
                  {order.paymentProof ? 'Submitted' : 'Not submitted'}
                </div>
              </div>

              {/* Remuneration Info */}
              <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Remuneration Type</div>
                    <div className="font-medium text-slate-900">{order.remunerationType || '-'}</div>
                  </div>
                  {order.remunerationType === 'PERCENT' && order.remunerationPercentage && (
                    <div>
                      <div className="text-xs text-slate-500 mb-1">Remuneration %</div>
                      <div className="font-medium text-slate-900">{order.remunerationPercentage}%</div>
                    </div>
                  )}
                  {order.remunerationType === 'FIXED' && order.remunerationFixed && (
                    <div>
                      <div className="text-xs text-slate-500 mb-1">Remuneration Fixed</div>
                      <div className="font-medium text-slate-900">{order.remunerationFixed?.toLocaleString()} {order.currency}</div>
                    </div>
                  )}
                </div>
              </div>

              {order.amountRemuneration && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="text-xs text-slate-600 mb-1">Amount Remuneration</div>
                  <div className="text-lg font-bold text-[#1e3a5f]">
                    {order.amountRemuneration.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {order.currency}
                  </div>
                </div>
              )}

              {order.exchangeRate && (
                <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <div className="text-xs text-slate-500 mb-1">Client Payment Currency</div>
                      <div className="font-medium text-slate-900">{order.clientPaymentCurrency || 'RUB'}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 mb-1">Exchange Rate</div>
                      <div className="font-medium text-slate-900">{order.exchangeRate}</div>
                    </div>
                  </div>
                </div>
              )}

              {order.exchangeRate && order.amount && (
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="text-xs text-slate-600 mb-1">Remuneration in {order.clientPaymentCurrency || 'RUB'}</div>
                    <div className="text-sm font-bold text-[#1e3a5f]">
                      {((order.amountRemuneration || 0) * (order.exchangeRate || 1)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                    <div className="text-xs text-slate-600 mb-1">FV in {order.clientPaymentCurrency || 'RUB'}</div>
                    <div className="text-sm font-bold text-purple-700">
                      {(order.amount * (order.exchangeRate || 1)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                    <div className="text-xs text-slate-600 mb-1">Total in {order.clientPaymentCurrency || 'RUB'}</div>
                    <div className="text-sm font-bold text-emerald-700">
                      {order.sumToBePaid?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || 
                       ((order.amountRemuneration || 0) * (order.exchangeRate || 1) + order.amount * (order.exchangeRate || 1)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                {order.dataFixing && (
                  <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
                    <div className="text-xs text-slate-600 mb-1">Data Fixing</div>
                    <div className="text-sm text-slate-900">{order.dataFixing}</div>
                  </div>
                )}
                {order.datePaid && (
                  <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                    <div className="text-xs text-slate-600 mb-1">Date Paid</div>
                    <div className="text-sm text-slate-900">{new Date(order.datePaid).toLocaleDateString()}</div>
                  </div>
                )}
              </div>
            </div>

            <Separator className="bg-slate-200" />

            {/* WORD Order Section */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-[#1e3a5f] uppercase">Order Document</h3>
              
              <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                <Label className="text-xs text-slate-700 mb-2 block font-medium">WORD Order (from Staff)</Label>
                {order.attachmentWordOrder ? (
                  <a href={order.attachmentWordOrder} target="_blank" rel="noopener noreferrer">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="w-full border-blue-300 hover:bg-blue-100"
                    >
                      <Download className="w-3 h-3 mr-2" />
                      Download Unsigned Order
                    </Button>
                  </a>
                ) : (
                  <div className="text-xs text-slate-500">No order document available yet</div>
                )}
              </div>

              <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                <Label className="text-xs text-slate-700 mb-2 block font-medium">Upload Signed Order</Label>
                <div className="flex items-center gap-2">
                  <label className="flex-1">
                    <input
                      type="file"
                      onChange={handleWordOrderUpload}
                      className="hidden"
                      accept=".doc,.docx,.pdf"
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="w-full border-green-300 hover:bg-green-100"
                      onClick={(e) => e.currentTarget.previousElementSibling?.click()}
                      disabled={uploadingWordOrder}
                    >
                      <Upload className="w-3 h-3 mr-2" />
                      {uploadingWordOrder ? 'Uploading...' : 'Upload Signed Order'}
                    </Button>
                  </label>
                  {order.attachmentWordOrderSigned && (
                    <a href={order.attachmentWordOrderSigned} target="_blank" rel="noopener noreferrer">
                      <Button size="sm" variant="outline" className="border-green-300">
                        <Download className="w-3 h-3" />
                      </Button>
                    </a>
                  )}
                </div>
              </div>
            </div>

            <Separator className="bg-slate-200" />

            {/* Payment Proof Section */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-[#1e3a5f] uppercase">Payment Proof</h3>
              
              <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                <Label className="text-xs text-slate-700 mb-2 block font-medium">Upload Payment Proof</Label>
                <div className="flex items-center gap-2">
                  <label className="flex-1">
                    <input
                      type="file"
                      onChange={handlePaymentProofUpload}
                      className="hidden"
                      accept="image/*,application/pdf"
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="w-full border-blue-300 hover:bg-blue-100"
                      onClick={(e) => e.currentTarget.previousElementSibling?.click()}
                      disabled={uploadingPaymentProof}
                    >
                      <Upload className="w-3 h-3 mr-2" />
                      {uploadingPaymentProof ? 'Uploading...' : 'Upload Payment Proof'}
                    </Button>
                  </label>
                  {order.attachmentTransactionStatus && (
                    <a href={order.attachmentTransactionStatus} target="_blank" rel="noopener noreferrer">
                      <Button size="sm" variant="outline" className="border-blue-300">
                        <Download className="w-3 h-3" />
                      </Button>
                    </a>
                  )}
                </div>
                {order.datePaymentProof && (
                  <div className="mt-2 text-xs text-slate-500">
                    Uploaded: {new Date(order.datePaymentProof).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 p-4 bg-white border-t border-slate-200 space-y-2">
          <div className="flex gap-2">
            <Button 
              type="button"
              onClick={() => setShowCancelDialog(true)}
              variant="outline"
              className="flex-1 border-amber-500 text-amber-600 hover:bg-amber-50"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel Order
            </Button>
            <Button 
              type="button"
              onClick={() => setShowDeleteDialog(true)}
              variant="outline"
              className="flex-1 border-red-500 text-red-600 hover:bg-red-50"
              disabled={order.status !== 'rejected'}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Order
            </Button>
          </div>
          <Button 
            type="button"
            onClick={onClose} 
            className="w-full bg-[#1e3a5f] hover:bg-[#152a45]"
          >
            Close
          </Button>
        </div>
      </SheetContent>

      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Order?</AlertDialogTitle>
            <AlertDialogDescription>
              This will mark the order as cancelled. This action can be reversed by staff.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, Keep It</AlertDialogCancel>
            <AlertDialogAction onClick={() => cancelMutation.mutate()}>
              Yes, Cancel Order
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Order?</AlertDialogTitle>
            <AlertDialogDescription>
              This will mark the order as deleted. Only rejected orders can be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, Keep It</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteMutation.mutate()}>
              Yes, Delete Order
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Sheet>
  );
}