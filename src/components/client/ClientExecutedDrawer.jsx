import React, { useState, useMemo } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { apiClient } from '@/api/apiClient';
import { toast } from 'sonner';
import { Download, Upload } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { t } from '@/components/utils/language';

export default function ClientExecutedDrawer({ order, open, onClose, onUpdate }) {
  const [uploadingActReport, setUploadingActReport] = useState(false);

  const { data: terms } = useQuery({
    queryKey: ['order-terms', order?.id],
    queryFn: () => apiClient.getOrderTerms(order?.id),
    enabled: !!order?.id && open,
  });

  const { data: documents, refetch: refetchDocuments } = useQuery({
    queryKey: ['order-documents', order?.id],
    queryFn: () => apiClient.getOrderDocuments(order?.id),
    enabled: !!order?.id && open,
  });

  const { data: client } = useQuery({
    queryKey: ['client', 'me'],
    queryFn: () => apiClient.getMyClient(),
  });

  const debitAccount = useMemo(() => {
    return terms?.GANBankAccount || order?.debit_account_no || '-';
  }, [terms, order]);

  if (!order) return null;

  const handleActReportUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingActReport(true);
    try {
      await apiClient.uploadOrderDocument(order.id, file, 'act_report_signed_client');

      toast.success(t('signedActReportUploadedToast'));

      refetchDocuments();
      onUpdate?.();
    } catch (error) {
      console.error(error);
      toast.error(t('failedUploadActReportToast'));
    } finally {
      setUploadingActReport(false);
    }
  };

  const handleDownload = async (docId) => {
    try {
      const response = await apiClient.downloadDocument(order.id, docId);
      if (response && response.presigned_url) {
        const link = document.createElement('a');
        link.href = response.presigned_url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        toast.error(t('failedDownloadUrlToast'));
      }
    } catch (error) {
      console.error(error);
      toast.error(t('toastFailedDownloadDoc'));
    }
  };

  return (
    <Sheet open={open} onOpenChange={(val) => !val && onClose()}>
      <SheetContent className="w-full sm:max-w-2xl bg-white border-slate-200 text-slate-900 flex flex-col overflow-hidden">
        <SheetHeader className="mb-4 flex-shrink-0">
          <SheetTitle className="text-slate-900 flex items-center gap-3">
            {t('order')} #{order.order_number}
          </SheetTitle>
          <SheetDescription className="text-slate-500">
            {t('executedDetailsSubtitle')} #{order.order_number}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-1 pb-6">
          <div className="space-y-6">
            {/* Order Info */}
            <div className="bg-slate-50 rounded-lg p-4 text-sm space-y-2 border border-slate-200">
              <div>
                <span className="text-slate-500 font-medium">{t('clientShortLabel')}:</span>{' '}
                <span className="text-slate-900">{client?.client_name || order.client_name || order.client_id}</span>
              </div>
              <div>
                <span className="text-slate-500 font-medium">{t('drawerAmountLabel')}:</span>{' '}
                <span className="text-emerald-600 font-semibold">
                  {order.amount?.toLocaleString()} {order.currency}
                </span>
              </div>
              <div>
                <span className="text-slate-500 font-medium">{t('beneficiaryShortLabel')}:</span>{' '}
                <span className="text-slate-900">{order.beneficiary_name}</span>
              </div>
              <div>
                <span className="text-slate-500 font-medium">{t('bankShortLabel')}:</span>{' '}
                <span className="text-slate-900">
                  {order.bank_name} ({order.bic})
                </span>
              </div>
            </div>

            <Separator className="bg-slate-200" />

            {/* Transaction Status */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-[#1e3a5f] uppercase">{t('transactionStatusUppercase')}</h3>
              <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-xs text-slate-600">{t('status')}</Label>
                  <Badge className={order.transaction_status_received ? 'bg-emerald-600' : 'bg-slate-400'}>
                    {order.transaction_status_received ? t('statusReceivedLabel') : t('statusNotReceivedLabel')}
                  </Badge>
                </div>
                {order.transaction_status_number && (
                  <div className="text-sm text-slate-900 mb-1">
                    <span className="text-slate-500">{t('drawerNumberLabel')}:</span> {order.transaction_status_number}
                  </div>
                )}
                {order.transaction_status_date && (
                  <div className="text-sm text-slate-900 mb-2">
                    <span className="text-slate-500">{t('drawerDateLabel')}:</span>{' '}
                    {new Date(order.transaction_status_date).toLocaleDateString()}
                  </div>
                )}
                {documents?.find((d) => d.doc_type === 'transaction_status') && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full border-slate-300"
                    onClick={() =>
                      handleDownload(
                        documents.find((d) => d.doc_type === 'transaction_status').doc_id,
                        documents.find((d) => d.doc_type === 'transaction_status').file_name
                      )
                    }
                  >
                    <Download className="w-3 h-3 mr-2" />
                    {t('downloadTransactionStatusBtn')}
                  </Button>
                )}
              </div>
            </div>

            <Separator className="bg-slate-200" />

            {/* MT103 */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-[#1e3a5f] uppercase">{t('mt103Title')}</h3>
              <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-xs text-slate-600">{t('status')}</Label>
                  <Badge className={order.mt103_received ? 'bg-emerald-600' : 'bg-slate-400'}>
                    {order.mt103_received ? t('statusReceivedLabel') : t('statusNotReceivedLabel')}
                  </Badge>
                </div>
                {order.mt103_number && (
                  <div className="text-sm text-slate-900 mb-1">
                    <span className="text-slate-500">{t('drawerNumberLabel')}:</span> {order.mt103_number}
                  </div>
                )}
                {order.mt103_date && (
                  <div className="text-sm text-slate-900 mb-2">
                    <span className="text-slate-500">{t('drawerDateLabel')}:</span>{' '}
                    {new Date(order.mt103_date).toLocaleDateString()}
                  </div>
                )}
                {documents?.find((d) => d.doc_type === 'mt103') && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full border-slate-300"
                    onClick={() =>
                      handleDownload(
                        documents.find((d) => d.doc_type === 'mt103').doc_id,
                        documents.find((d) => d.doc_type === 'mt103').file_name
                      )
                    }
                  >
                    <Download className="w-3 h-3 mr-2" />
                    {t('downloadMt103Btn')}
                  </Button>
                )}
              </div>
            </div>

            <Separator className="bg-slate-200" />

            {/* Act Report */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-[#1e3a5f] uppercase">{t('actReportTitle')}</h3>
              <div
                className={`rounded-lg p-3 border mb-3 ${
                  order.act_report_status === 'signed'
                    ? 'bg-emerald-50 border-emerald-200'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-xs text-slate-600">{t('status')}</Label>
                  <Badge
                    className={
                      order.act_report_status === 'signed'
                        ? 'bg-emerald-600'
                        : order.act_report_status === 'on_sign'
                          ? 'bg-amber-500'
                          : 'bg-slate-400'
                    }
                  >
                    {order.act_report_status === 'signed'
                      ? t('actSignedLabel')
                      : order.act_report_status === 'on_sign'
                        ? t('actOnSignLabel')
                        : t('actNotMadeLabel')}
                  </Badge>
                </div>
                {order.act_report_number && (
                  <div className="text-sm text-slate-900 mb-1">
                    <span className="text-slate-500">{t('drawerNumberLabel')}:</span> {order.act_report_number}
                  </div>
                )}
                {order.act_report_date && (
                  <div className="text-sm text-slate-900 mb-2">
                    <span className="text-slate-500">{t('drawerDateLabel')}:</span>{' '}
                    {new Date(order.act_report_date).toLocaleDateString()}
                  </div>
                )}
                {order.act_report_status === 'signed'
                  ? documents?.find((d) => d.doc_type === 'act_report_signed_staff') && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full border-emerald-200 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 mb-2"
                        onClick={() =>
                          handleDownload(
                            documents.find((d) => d.doc_type === 'act_report_signed_staff').doc_id,
                            documents.find((d) => d.doc_type === 'act_report_signed_staff').file_name
                          )
                        }
                      >
                        <Download className="w-3 h-3 mr-2" />
                        {t('downloadActReportBtn')}
                      </Button>
                    )
                  : documents?.find((d) => d.doc_type === 'act_report_unsigned') && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full border-slate-300 mb-2"
                        onClick={() =>
                          handleDownload(
                            documents.find((d) => d.doc_type === 'act_report_unsigned').doc_id,
                            documents.find((d) => d.doc_type === 'act_report_unsigned').file_name
                          )
                        }
                      >
                        <Download className="w-3 h-3 mr-2" />
                        {t('downloadUnsignedActReportBtn')}
                      </Button>
                    )}
              </div>

              {order.act_report_status !== 'signed' && (
                <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                  <Label className="text-xs text-slate-700 mb-2 block font-medium">
                    {t('uploadSignedActReportLabel')}
                  </Label>
                  <div className="flex items-center gap-2">
                    <label className="flex-1">
                      <input
                        type="file"
                        onChange={handleActReportUpload}
                        className="hidden"
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt"
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
                        {uploadingActReport ? t('uploadingDots') : t('uploadSignedActReportBtn')}
                      </Button>
                    </label>
                    {documents?.find((d) => d.doc_type === 'act_report_signed_client') && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-green-300"
                        onClick={() =>
                          handleDownload(
                            documents.find((d) => d.doc_type === 'act_report_signed_client').doc_id,
                            documents.find((d) => d.doc_type === 'act_report_signed_client').file_name
                          )
                        }
                      >
                        <Download className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>

            <Separator className="bg-slate-200" />

            {/* Other Documents */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-[#1e3a5f] uppercase">{t('documentsHeader')}</h3>

              {documents?.find((d) => d.doc_type === 'sales_contract') && (
                <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                  <Label className="text-xs text-slate-600 mb-2 block">{t('salesContractDrawerLabel')}</Label>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full border-slate-300"
                    onClick={() =>
                      handleDownload(
                        documents.find((d) => d.doc_type === 'sales_contract').doc_id,
                        documents.find((d) => d.doc_type === 'sales_contract').file_name
                      )
                    }
                  >
                    <Download className="w-3 h-3 mr-2" />
                    {t('downloadShortLabel')}
                  </Button>
                </div>
              )}

              {documents?.find((d) => d.doc_type === 'invoice') && (
                <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                  <Label className="text-xs text-slate-600 mb-2 block">{t('invoiceDrawerLabel')}</Label>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full border-slate-300"
                    onClick={() =>
                      handleDownload(
                        documents.find((d) => d.doc_type === 'invoice').doc_id,
                        documents.find((d) => d.doc_type === 'invoice').file_name
                      )
                    }
                  >
                    <Download className="w-3 h-3 mr-2" />
                    {t('downloadShortLabel')}
                  </Button>
                </div>
              )}

              {documents?.find((d) => d.doc_type === 'other') && (
                <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                  <Label className="text-xs text-slate-600 mb-2 block">{t('otherDocumentsDrawerLabel')}</Label>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full border-slate-300"
                    onClick={() =>
                      handleDownload(
                        documents.find((d) => d.doc_type === 'other').doc_id,
                        documents.find((d) => d.doc_type === 'other').file_name
                      )
                    }
                  >
                    <Download className="w-3 h-3 mr-2" />
                    {t('downloadShortLabel')}
                  </Button>
                </div>
              )}
            </div>

            <Separator className="bg-slate-200" />

            {/* Order Information */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-[#1e3a5f] uppercase">{t('orderInformationSection')}</h3>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                  <div className="text-xs text-slate-500 mb-1">{t('drawerAmountLabel')}</div>
                  <div className="font-semibold text-slate-900">
                    {order.currency}{' '}
                    {order.amount?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>

                <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                  <div className="text-xs text-slate-500 mb-1">{t('remittanceCurrencyLabel')}</div>
                  <div className="font-semibold text-slate-900">{order.currency}</div>
                </div>

                <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                  <div className="text-xs text-slate-500 mb-1">{t('debitAccountLabel')}</div>
                  <div className="font-semibold text-slate-900">{debitAccount}</div>
                </div>

                <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                  <div className="text-xs text-slate-500 mb-1">{t('transactionReferenceLabel')}</div>
                  <div className="font-semibold text-slate-900 text-xs break-all">
                    {order.transaction_reference || '-'}
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                <div className="text-xs text-slate-500 mb-1">{t('beneficiaryNameDrawerLabel')}</div>
                <div className="font-semibold text-slate-900">{order.beneficiary_name}</div>
              </div>

              <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                <div className="text-xs text-slate-500 mb-1">{t('beneficiaryAddressDrawerLabel')}</div>
                <div className="font-semibold text-slate-900 text-sm">{order.beneficiary_address}</div>
              </div>

              <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                <div className="text-xs text-slate-500 mb-1">{t('destinationAccountDrawerLabel')}</div>
                <div className="font-semibold text-slate-900">{order.destination_account}</div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                  <div className="text-xs text-slate-500 mb-1">{t('bankCountryLabel')}</div>
                  <div className="font-semibold text-slate-900">{order.country_bank}</div>
                </div>

                <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                  <div className="text-xs text-slate-500 mb-1">{t('bicSwiftLabel')}</div>
                  <div className="font-semibold text-slate-900">{order.bic}</div>
                </div>
              </div>

              <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                <div className="text-xs text-slate-500 mb-1">{t('bankNameDrawerLabel')}</div>
                <div className="font-semibold text-slate-900">{order.bank_name}</div>
              </div>

              <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                <div className="text-xs text-slate-500 mb-1">{t('bankAddressDrawerLabel')}</div>
                <div className="font-semibold text-slate-900 text-sm">{order.bank_address || '-'}</div>
              </div>

              <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                <div className="text-xs text-slate-500 mb-1">{t('transactionRemarkDrawerLabel')}</div>
                <div className="font-semibold text-slate-900 text-sm whitespace-pre-wrap">
                  {order.transaction_remark}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 p-4 bg-white border-t border-slate-200">
          <Button type="button" onClick={onClose} className="w-full bg-[#1e3a5f] hover:bg-[#152a45]">
            {t('closeBtn')}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
