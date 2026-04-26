import React, { useState } from 'react';
import { apiClient } from '@/api/apiClient';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Download, Upload, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { t } from '@/components/utils/language';

export default function KYCDeclaration({ formData = {}, onChange, clientId, onSave }) {
  const [uploading, setUploading] = useState(false);
  const queryClient = useQueryClient();

  // Check if signed doc exists in uploaded documents
  const { data: uploadedDocs = [] } = useQuery({
    queryKey: ['kycDocuments', clientId],
    queryFn: () => apiClient.listKycDocuments(clientId),
    enabled: !!clientId,
  });

  const signedDoc = uploadedDocs.find((d) => d.doc_type === 'signed_kyc_document');

  const handleChange = (field, value) => {
    onChange({ [field]: value });
  };

  const handleDownloadKYC = async () => {
    if (!clientId) {
      toast.error(t('kycClientIdMissingError'));
      return;
    }

    const toastId = toast.loading(t('kycSavingGenerating'));

    try {
      // 1. Trigger save if onSave is provided
      if (onSave) {
        await onSave();
      }

      // 2. Export Excel
      const blob = await apiClient.exportKycExcel(clientId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `KYC_Form_${clientId}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.dismiss(toastId);
      toast.success(t('kycDocumentDownloaded'));
    } catch (error) {
      console.error(error);
      toast.dismiss(toastId);
      toast.error(t('kycFailedDownload'));
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !clientId) return;

    setUploading(true);
    try {
      await apiClient.uploadKycDocument(clientId, file, 'signed_kyc_document');
      queryClient.invalidateQueries(['kycDocuments']);
      onChange({ signed_kyc_document_url: 'uploaded' });
      toast.success(t('kycFileUploadedSuccess'));
    } catch (error) {
      toast.error(t('kycFailedUploadFile'));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-[#1e3a5f] mb-2">{t('kycDeclarationSection')}</h3>
      </div>

      <Card className="bg-amber-50 border-amber-200">
        <CardContent className="pt-6">
          <p className="text-sm leading-relaxed">
            <strong>5.1</strong> {t('kycDeclarationText')}
          </p>
        </CardContent>
      </Card>

      <div className="flex items-start space-x-2">
        <Checkbox
          id="declaration"
          checked={formData.declaration_confirmed || false}
          onCheckedChange={(checked) => handleChange('declaration_confirmed', checked)}
        />
        <label htmlFor="declaration" className="text-sm leading-relaxed">
          {t('kycDeclarationConfirm')}
        </label>
      </div>

      <div className="border-t pt-6">
        <h4 className="font-semibold text-[#1e3a5f] mb-4">{t('kycSignatureSection')}</h4>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label>{t('kycAuthorizedPersonName')}</Label>
            <Input
              value={formData.authorized_person_name || ''}
              onChange={(e) => handleChange('authorized_person_name', e.target.value)}
            />
          </div>
          <div>
            <Label>{t('kycDateColon')} *</Label>
            <Input
              type="date"
              value={formData.signature_date || ''}
              onChange={(e) => handleChange('signature_date', e.target.value)}
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mt-4">
          <div>
            <Label>{t('kycPositionLabel')} *</Label>
            <Input
              value={formData.authorized_person_position || ''}
              onChange={(e) => handleChange('authorized_person_position', e.target.value)}
            />
          </div>
          <div>
            <Label>{t('kycLocationColon')} *</Label>
            <Input
              value={formData.signature_location || ''}
              onChange={(e) => handleChange('signature_location', e.target.value)}
            />
          </div>
        </div>

        <Alert className="mt-4">
          <AlertDescription className="text-xs">* {t('kycPowerOfAttorneyNote')}</AlertDescription>
        </Alert>
      </div>

      <div className="border-t pt-6">
        <h4 className="font-semibold text-[#1e3a5f] mb-4">{t('kycDownloadUploadHeader')}</h4>

        <div className="flex flex-col gap-4">
          <Button onClick={handleDownloadKYC} variant="outline" className="w-full">
            <Download className="w-4 h-4 mr-2" />
            {t('kycDownloadKycForm')}
          </Button>

          <div>
            <Label className="mb-2 block">{t('kycUploadSignedKycDoc')}</Label>
            {signedDoc ? (
              <div className="flex gap-2">
                <Button variant="outline" className="w-full" disabled>
                  <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                  {t('kycDocumentUploadedLabel')}
                </Button>
                <label>
                  <input type="file" accept=".pdf" onChange={handleFileUpload} className="hidden" />
                  <Button
                    type="button"
                    variant="outline"
                    disabled={uploading}
                    onClick={(e) => e.currentTarget.previousElementSibling?.click()}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {uploading ? '...' : t('kycReplaceLabel')}
                  </Button>
                </label>
              </div>
            ) : (
              <label>
                <input type="file" accept=".pdf" onChange={handleFileUpload} className="hidden" />
                <Button
                  type="button"
                  variant="outline"
                  disabled={uploading}
                  onClick={(e) => e.currentTarget.previousElementSibling?.click()}
                  className="w-full"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {uploading ? t('uploadingDots') : t('kycUploadSignedDocBtn')}
                </Button>
              </label>
            )}

            <p className="text-xs text-slate-500 mt-2">{t('kycSignedDocUploadHelp')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
