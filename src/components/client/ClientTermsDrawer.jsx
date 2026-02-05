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
import { Download, Upload, CheckCircle, X, Trash2, Building2, FileText } from 'lucide-react';

export default function ClientTermsDrawer({ order, client, open, onClose, onUpdate }) {
  const [uploadingWordOrder, setUploadingWordOrder] = useState(false);
  const [uploadingPaymentProof, setUploadingPaymentProof] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const queryClient = useQueryClient();

  const selectedPayeerAccount = null;

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

  const handleDownloadExcel = async () => {
    try {
      const blob = await apiClient.exportOrderExcel(order.orderId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Order_${order.orderId}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Excel downloaded successfully');
    } catch (error) {
      console.error(error);
      toast.error('Failed to download Excel: ' + error.message);
    }
  };

  const getDocumentByType = (docType) => {
    return documents?.find(doc => doc.doc_type === docType);
  };

  const wordOrderUnsigned = getDocumentByType('word_order_unsigned');
  const wordOrderSignedStaff = getDocumentByType('word_order_signed_staff');
  const wordOrderSigned = getDocumentByType('word_order_signed_client');
  const paymentProofDoc = getDocumentByType('payment_proof');

  return (
    <Sheet open={open} onOpenChange={(val) => !val && onClose()}>
      <SheetContent className="w-full sm:max-w-2xl bg-white border-slate-200 text-slate-900 flex flex-col overflow-hidden">
        <SheetHeader className="mb-4 flex-shrink-0">
          <SheetTitle className="text-slate-900 flex items-center gap-3">
            <div className="bg-[#1e3a5f] text-white px-4 py-2 rounded-lg font-bold text-lg">
              Order #{order.orderId}
            </div>
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-1 pb-6">
          <div className="space-y-6">
            {/* TERMS Section */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Terms</h3>

              <div className="bg-white rounded-lg p-4 border border-slate-200">
                <div className="space-y-3 text-xs">
                  {/* Amount */}
                  <div className="pb-3 border-b border-slate-100">
                    <div className="text-slate-500 mb-1">Amount</div>
                    <div className="text-base font-semibold text-slate-900">
                      {parseFloat(order.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {order.currency}
                    </div>
                  </div>

                  {/* Remuneration Type & Details */}
                  <div className="grid grid-cols-2 gap-4 pb-3 border-b border-slate-100">
                    <div>
                      <div className="text-slate-500 mb-1">Remuneration Type</div>
                      <div className="font-medium text-slate-900">{terms?.remunerationType || '-'}</div>
                    </div>
                    {terms?.remunerationType === 'percent' && terms?.remunerationPercentage && (
                      <div>
                        <div className="text-slate-500 mb-1">Remuneration %</div>
                        <div className="font-medium text-slate-900">{parseFloat(terms.remunerationPercentage)}%</div>
                      </div>
                    )}
                    {terms?.remunerationType === 'fixed' && terms?.remunerationFixed && (
                      <div>
                        <div className="text-slate-500 mb-1">Remuneration Fixed</div>
                        <div className="font-medium text-slate-900">{parseFloat(terms.remunerationFixed).toLocaleString()} {order.currency}</div>
                      </div>
                    )}
                  </div>

                  {terms?.amountRemuneration && (
                    <div className="pb-3 border-b border-slate-100">
                      <div className="text-slate-500 mb-1">Amount Remuneration</div>
                      <div className="text-base font-semibold text-slate-900">
                        {parseFloat(terms.amountRemuneration).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {order.currency}
                      </div>
                    </div>
                  )}

                  {/* Client Payment Currency & Exchange Rate */}
                  {terms?.exchangeRate && (
                    <div className="grid grid-cols-2 gap-4 pb-3 border-b border-slate-100">
                      <div>
                        <div className="text-slate-500 mb-1">Client Payment Currency</div>
                        <div className="font-medium text-slate-900">{terms.clientPaymentCurrency || order.clientPaymentCurrency || 'RUB'}</div>
                      </div>
                      <div>
                        <div className="text-slate-500 mb-1">Exchange Rate</div>
                        <div className="font-medium text-slate-900">{Number(terms.exchangeRate).toFixed(4)}</div>
                      </div>
                    </div>
                  )}

                  {/* FV - Remuneration - Total */}
                  {terms?.exchangeRate && order.amount && (
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <div className="text-slate-500 mb-1">FV</div>
                        <div className="text-sm font-semibold text-slate-900">
                          {(parseFloat(order.amount) * parseFloat(terms.exchangeRate || 1)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{terms.clientPaymentCurrency || order.clientPaymentCurrency || 'RUB'}</div>
                      </div>
                      <div>
                        <div className="text-slate-500 mb-1">Remuneration</div>
                        <div className="text-sm font-semibold text-slate-900">
                          {(parseFloat(terms.amountRemuneration || 0) * parseFloat(terms.exchangeRate || 1)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{terms.clientPaymentCurrency || order.clientPaymentCurrency || 'RUB'}</div>
                      </div>
                      <div>
                        <div className="text-slate-500 mb-1">TOTAL</div>
                        <div className="text-sm font-bold text-slate-900">
                          {(terms.amountToBePaidTargetCur || terms.amount_to_be_paid_target_cur) ? parseFloat(terms.amountToBePaidTargetCur || terms.amount_to_be_paid_target_cur).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) :
                            (parseFloat(terms.amountRemuneration || 0) * parseFloat(terms.exchangeRate || 1) + parseFloat(order.amount) * parseFloat(terms.exchangeRate || 1)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{terms.clientPaymentCurrency || order.clientPaymentCurrency || 'RUB'}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Proof Upload Section */}
              <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                <Label className="text-xs text-slate-700 mb-2 block">Upload Payment Proof</Label>
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
                      className="w-full"
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
                      onClick={() => handleDownloadDocument(paymentProofDoc.doc_id, paymentProofDoc.file_name)}
                    >
                      <Download className="w-3 h-3" />
                    </Button>
                  )}
                </div>
                {paymentProofDoc && (
                  <div className="mt-2 text-[10px] text-slate-500">
                    Uploaded: {new Date(paymentProofDoc.uploaded_at).toLocaleDateString()}
                  </div>
                )}
              </div>

              {/* Data Fixing & Date Paid */}
              {(terms?.dataFixing || terms?.datePaid) && (
                <div className="grid grid-cols-2 gap-3">
                  {terms?.dataFixing && (
                    <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                      <div className="text-[10px] text-slate-500 mb-1">Data Fixing</div>
                      <div className="text-xs text-slate-900">{new Date(terms.dataFixing).toLocaleDateString()}</div>
                    </div>
                  )}
                  <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                    <div className="text-[10px] text-slate-500 mb-1">Date Paid</div>
                    <div className="text-xs text-slate-900">
                      {terms?.datePaid
                        ? new Date(terms.datePaid).toLocaleDateString()
                        : 'Not Paid'}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Separator className="bg-slate-200" />

            {/* WORD Order Section */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Order Document</h3>

              <div className="bg-white rounded-lg p-3 border border-slate-200">
                <Label className="text-xs text-slate-700 mb-2 block">Order (from Staff)</Label>
                {wordOrderUnsigned ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="w-full"
                    onClick={() => handleDownloadDocument(wordOrderUnsigned.doc_id, wordOrderUnsigned.file_name)}
                  >
                    <Download className="w-3 h-3 mr-2" />
                    Download Signed Order
                  </Button>
                ) : (
                  <div className="text-xs text-slate-500">No order document available yet</div>
                )}
              </div>

              {terms?.amountRemuneration && wordOrderUnsigned && (
                <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                  <Label className="text-xs text-slate-700 mb-2 block">Upload Signed Order</Label>
                  <div className="flex items-center gap-2">
                    <label className="flex-1">
                      <input
                        type="file"
                        onChange={handleWordOrderUpload}
                        className="hidden"
                        accept=".doc,.docx,.pdf,.xls,.xlsx"
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="w-full"
                        onClick={(e) => e.currentTarget.previousElementSibling?.click()}
                        disabled={uploadingWordOrder}
                      >
                        <Upload className="w-3 h-3 mr-2" />
                        {uploadingWordOrder ? 'Uploading..' : 'Upload Signed Order'}
                      </Button>
                    </label>
                    {wordOrderSigned && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownloadDocument(wordOrderSigned.doc_id, wordOrderSigned.file_name)}
                      >
                        <Download className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </div>
              )}
              <div className="bg-white rounded-lg p-3 border border-slate-200">
                <Label className="text-xs text-slate-700 mb-2 block">Signed Order (from Staff)</Label>
                {wordOrderSignedStaff ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="w-full"
                    onClick={() => handleDownloadDocument(wordOrderSignedStaff.doc_id, wordOrderSignedStaff.file_name)}
                  >
                    <Download className="w-3 h-3 mr-2" />
                    Download Signed Order
                  </Button>
                ) : (
                  <div className="text-xs text-slate-500">No order document available yet</div>
                )}
              </div>
            </div>

            <Separator className="bg-slate-200" />

            {/* Order Info Section */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Order Information</h3>

              <div className="bg-white rounded-lg p-4 text-xs space-y-2 border border-slate-200">
                <div><span className="text-slate-500 font-medium">Beneficiary Name:</span> <span className="text-slate-900">{order.beneficiaryName}</span></div>
                <div><span className="text-slate-500 font-medium">Beneficiary Address:</span> <span className="text-slate-900">{order.beneficiaryAdress}</span></div>
                <div><span className="text-slate-500 font-medium">Destination Account:</span> <span className="text-slate-900">{order.destinationAccount}</span></div>
                <div><span className="text-slate-500 font-medium">Bank Name:</span> <span className="text-slate-900">{order.bankName}</span></div>
                <div><span className="text-slate-500 font-medium">BIC/SWIFT:</span> <span className="text-slate-900">{order.bankBic}</span></div>
                <div><span className="text-slate-500 font-medium">Bank Address:</span> <span className="text-slate-900">{order.bankAddress}</span></div>
                <div><span className="text-slate-500 font-medium">Country:</span> <span className="text-slate-900">{order.bankCountry}</span></div>
                {order.remark && (
                  <div><span className="text-slate-500 font-medium">Remark:</span> <span className="text-slate-900">{order.remark}</span></div>
                )}
              </div>
            </div>

            {/* Payeer Account Info Section - shown when staff selected an account */}
            {(order.client_payment_account_id || order.gan_bank_account) && (
              <>
                <Separator className="bg-slate-200" />
                <div className="space-y-3">
                  <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wide flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    Payeer Account Information
                  </h3>

                  {selectedPayeerAccount ? (
                    <div className="bg-white rounded-lg p-4 border border-slate-200">
                      <div className="grid gap-3">
                        {/* Account Name - Highlighted */}
                        <div className="bg-white rounded-lg p-3 border border-slate-200">
                          <div className="text-xs text-slate-500 mb-1 font-medium">Account Name</div>
                          <div className="text-base font-semibold text-[#1e3a5f]">
                            {selectedPayeerAccount.account_name || '-'}
                          </div>
                        </div>

                        {/* Account Number & Currency */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-white rounded-lg p-3 border border-slate-200">
                            <div className="text-xs text-slate-500 mb-1 font-medium">Account Number</div>
                            <div className="text-sm font-mono text-slate-900">
                              {selectedPayeerAccount.account_number}
                            </div>
                          </div>
                          <div className="bg-white rounded-lg p-3 border border-slate-200">
                            <div className="text-xs text-slate-500 mb-1 font-medium">Currency</div>
                            <div className="text-sm font-semibold text-blue-600">
                              {selectedPayeerAccount.currency}
                            </div>
                          </div>
                        </div>

                        {/* Bank Details */}
                        <div className="bg-white rounded-lg p-3 border border-slate-200 space-y-2 text-xs">
                          {selectedPayeerAccount.bank_name && (
                            <div>
                              <span className="text-slate-500 font-medium">Bank Name:</span>{' '}
                              <span className="text-slate-900">{selectedPayeerAccount.bank_name}</span>
                            </div>
                          )}
                          {selectedPayeerAccount.bank_address && (
                            <div>
                              <span className="text-slate-500 font-medium">Bank Address:</span>{' '}
                              <span className="text-slate-900">{selectedPayeerAccount.bank_address}</span>
                            </div>
                          )}
                          {(selectedPayeerAccount.bank_bic || selectedPayeerAccount.bank_swift) && (
                            <div className="flex gap-4">
                              {selectedPayeerAccount.bank_bic && (
                                <div>
                                  <span className="text-slate-500 font-medium">BIC:</span>{' '}
                                  <span className="text-slate-900 font-mono">{selectedPayeerAccount.bank_bic}</span>
                                </div>
                              )}
                              {selectedPayeerAccount.bank_swift && (
                                <div>
                                  <span className="text-slate-500 font-medium">SWIFT:</span>{' '}
                                  <span className="text-slate-900 font-mono">{selectedPayeerAccount.bank_swift}</span>
                                </div>
                              )}
                            </div>
                          )}
                          {selectedPayeerAccount.id_payeer && (
                            <div>
                              <span className="text-slate-500 font-medium">Payeer ID:</span>{' '}
                              <span className="text-slate-900">{selectedPayeerAccount.id_payeer}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                      <div className="text-xs space-y-2">
                        {order.client_payment_account_number && (
                          <div>
                            <span className="text-slate-500 font-medium">Account Number:</span>{' '}
                            <span className="text-slate-900 font-mono">{order.client_payment_account_number}</span>
                          </div>
                        )}
                        {order.client_payment_account_name && (
                          <div>
                            <span className="text-slate-500 font-medium">Account Name:</span>{' '}
                            <span className="text-slate-900">{order.client_payment_account_name}</span>
                          </div>
                        )}
                        {order.client_payment_bank_name && (
                          <div>
                            <span className="text-slate-500 font-medium">Bank Name:</span>{' '}
                            <span className="text-slate-900">{order.client_payment_bank_name}</span>
                          </div>
                        )}
                        {order.client_payment_bank_address && (
                          <div>
                            <span className="text-slate-500 font-medium">Bank Address:</span>{' '}
                            <span className="text-slate-900">{order.client_payment_bank_address}</span>
                          </div>
                        )}
                        {(order.client_payment_bank_bic || order.client_payment_bank_swift) && (
                          <div className="flex gap-4">
                            {order.client_payment_bank_bic && (
                              <div>
                                <span className="text-slate-500 font-medium">BIC:</span>{' '}
                                <span className="text-slate-900 font-mono">{order.client_payment_bank_bic}</span>
                              </div>
                            )}
                            {order.client_payment_bank_swift && (
                              <div>
                                <span className="text-slate-500 font-medium">SWIFT:</span>{' '}
                                <span className="text-slate-900 font-mono">{order.client_payment_bank_swift}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
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