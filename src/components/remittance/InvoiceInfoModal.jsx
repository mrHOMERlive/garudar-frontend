import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Copy, Mail, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { t } from '@/components/utils/language';

const INVOICE_EMAIL = 'info@garudar.id';

export default function InvoiceInfoModal({ open, onClose, orderNumber, invoiceNumber }) {
  const emailSubject = `Invoice ${invoiceNumber} for Order #${orderNumber}`;

  const copyEmail = () => {
    navigator.clipboard.writeText(INVOICE_EMAIL);
    toast.success(t('emailCopiedToClipboard'));
  };

  const copySubject = () => {
    navigator.clipboard.writeText(emailSubject);
    toast.success(t('subjectCopiedToClipboard'));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <DialogTitle className="text-xl">{t('orderCreatedSuccessTitle')}</DialogTitle>
              <DialogDescription className="text-slate-600 mt-1">
                {t('order')} #{orderNumber}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-2 mb-3">
              <Mail className="w-5 h-5 text-blue-700 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-blue-900 mb-1">{t('sendYourInvoiceTitle')}</h4>
                <p className="text-sm text-slate-700">{t('sendInvoiceInstruction')}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">{t('emailAddressColon')}</label>
                <div className="flex gap-2">
                  <Input value={INVOICE_EMAIL} readOnly className="bg-white" />
                  <Button variant="outline" size="icon" onClick={copyEmail}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">{t('emailSubjectColon')}</label>
                <div className="flex gap-2">
                  <Input value={emailSubject} readOnly className="bg-white" />
                  <Button variant="outline" size="icon" onClick={copySubject}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm text-slate-600">
            💡 {t('orderInDraftMessage')}
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button onClick={onClose} className="bg-blue-900 hover:bg-blue-800">
            {t('gotItButton')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
