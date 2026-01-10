import React, { useState } from 'react';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { apiClient } from '@/api/apiClient';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Download, Upload, CheckCircle, X, Trash2 } from 'lucide-react';

export default function ClientTermsDrawer({ order, client, open, onClose, onUpdate }) {
  const [uploadingWordOrder, setUploadingWordOrder] = useState(false);
  const [uploadingPaymentProof, setUploadingPaymentProof] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const queryClient = useQueryClient();

  const { data: terms, isLoading: termsLoading } = useQuery({
    queryKey: ['order-terms', order?.orderId],
    queryFn: () => apiClient.getOrderTerms(order?.orderId),
    enabled: !!order?.orderId && open,
  });

  const { data: documents = [], isLoading: documentsLoading } = useQuery({
    queryKey: ['order-documents', order?.orderId],
    queryFn: () => apiClient.getOrderDocuments(order?.orderId),
    enabled: !!order?.orderId && open,
  });

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
      await apiClient.uploadOrderDocument(order.orderId, file, 'word_order_signed_client');
      queryClient.invalidateQueries({ queryKey: ['order-documents', order.orderId] });
      toast.success('Signed order uploaded successfully');
      onUpdate?.();
    } catch (error) {
      toast.error(error.message || 'Failed to upload signed order');
    } finally {
      setUploadingWordOrder(false);
    }
  };

  const handlePaymentProofUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPaymentProof(true);
    try {
      await apiClient.uploadOrderDocument(order.orderId, file, 'payment_proof');
      queryClient.invalidateQueries({ queryKey: ['order-documents', order.orderId] });
      toast.success('Payment proof uploaded successfully');
      onUpdate?.();
    } catch (error) {
      toast.error(error.message || 'Failed to upload payment proof');
    } finally {
      setUploadingPaymentProof(false);
    }
  };

  const handleDownloadDocument = async (docId, fileName) => {
    try {
      const { presigned_url } = await apiClient.downloadDocument(order.orderId, docId);
      window.open(presigned_url, '_blank');
    } catch (error) {
      toast.error(error.message || 'Failed to download document');
    }
  };

  const getDocumentByType = (docType) => {
    return documents?.find(doc => doc.doc_type === docType);
  };

  const wordOrderUnsigned = getDocumentByType('word_order_unsigned');
  const wordOrderSigned = getDocumentByType('word_order_signed_client');
  const paymentProofDoc = getDocumentByType('payment_proof');

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
            </div>

            <Separator className="bg-slate-200" />
              {termsLoading ? (
                <div className="text-sm text-slate-500">Loading terms...</div>
              ) : terms ? (
                <>
                
                  {/* Remuneration Info */}
                  {terms.remunerationType && (
                    <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <div className="text-xs text-slate-500 mb-1">Remuneration Type</div>
                          <div className="font-medium text-slate-900">{terms.remunerationType.toUpperCase()}</div>
                        </div>
                        {terms.remunerationType === 'percent' && terms.remunerationPercentage && (
                          <div>
                            <div className="text-xs text-slate-500 mb-1">Remuneration %</div>
                            <div className="font-medium text-slate-900">{parseFloat(terms.remunerationPercentage)}%</div>
                          </div>
                        )}
                        {terms.remunerationType === 'fixed' && terms.remunerationFixed && (
                          <div>
                            <div className="text-xs text-slate-500 mb-1">Remuneration Fixed</div>
                            <div className="font-medium text-slate-900">{parseFloat(terms.remunerationFixed).toLocaleString()} {terms.currency}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {terms.amountRemuneration && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="text-xs text-slate-600 mb-1">Amount Remuneration</div>
                      <div className="text-lg font-bold text-[#1e3a5f]">
                        {parseFloat(terms.amountRemuneration).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {terms.currency}
                      </div>
                    </div>
                  )}

                  {terms.exchangeRate && (
                    <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <div className="text-xs text-slate-500 mb-1">Client Payment Currency</div>
                          <div className="font-medium text-slate-900">{terms.clientPaymentCurrency || 'RUB'}</div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-500 mb-1">Exchange Rate</div>
                          <div className="font-medium text-slate-900">{parseFloat(terms.exchangeRate).toFixed(4)}</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {terms.amountToBePaid && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                      <div className="text-xs text-slate-600 mb-1">Total Amount to be Paid</div>
                      <div className="text-lg font-bold text-emerald-700">
                        {parseFloat(terms.amountToBePaid).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {terms.clientPaymentCurrency || 'RUB'}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    {terms.dataFixing && (
                      <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
                        <div className="text-xs text-slate-600 mb-1">Data Fixing</div>
                        <div className="text-sm text-slate-900">{terms.dataFixing}</div>
                      </div>
                    )}
                    {terms.datePaid && (
                      <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                        <div className="text-xs text-slate-600 mb-1">Date Paid</div>
                        <div className="text-sm text-slate-900">{terms.datePaid}</div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="bg-slate-50 rounded-lg p-4 text-sm text-slate-500 text-center">
                  No terms information available yet. Staff will add terms details soon.
                </div>
              )}

              

            {/* WORD Order Section */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-[#1e3a5f] uppercase">Order Document</h3>
              
              <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                <Label className="text-xs text-slate-700 mb-2 block font-medium">WORD Order (from Staff)</Label>
                {wordOrderUnsigned ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="w-full border-blue-300 hover:bg-blue-100"
                    onClick={() => handleDownloadDocument(wordOrderUnsigned.doc_id, wordOrderUnsigned.file_name)}
                  >
                    <Download className="w-3 h-3 mr-2" />
                    Download Unsigned Order
                  </Button>
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
                  {wordOrderSigned && (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="border-green-300"
                      onClick={() => handleDownloadDocument(wordOrderSigned.doc_id, wordOrderSigned.file_name)}
                    >
                      <Download className="w-3 h-3" />
                    </Button>
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
                  {paymentProofDoc && (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="border-blue-300"
                      onClick={() => handleDownloadDocument(paymentProofDoc.doc_id, paymentProofDoc.file_name)}
                    >
                      <Download className="w-3 h-3" />
                    </Button>
                  )}
                </div>
                {paymentProofDoc && (
                  <div className="mt-2 text-xs text-slate-500">
                    Uploaded: {new Date(paymentProofDoc.uploaded_at).toLocaleDateString()}
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