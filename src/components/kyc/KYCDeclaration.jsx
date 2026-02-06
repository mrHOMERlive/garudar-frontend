import React, { useState } from 'react';
import { apiClient } from '@/api/apiClient';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Download, Upload, CheckCircle, FileText } from 'lucide-react';
import { toast } from 'sonner';

export default function KYCDeclaration({ formData = {}, onChange, clientId, language = 'en', onSave }) {
  const [uploading, setUploading] = useState(false);
  const queryClient = useQueryClient();

  // Check if signed doc exists in uploaded documents
  const { data: uploadedDocs = [] } = useQuery({
    queryKey: ['kycDocuments', clientId],
    queryFn: () => apiClient.listKycDocuments(clientId),
    enabled: !!clientId
  });

  const signedDoc = uploadedDocs.find(d => d.doc_type === 'signed_kyc_document');

  const handleChange = (field, value) => {
    onChange({ [field]: value });
  };

  const handleDownloadKYC = async () => {
    if (!clientId) {
      toast.error('Client ID missing');
      return;
    }

    const toastId = toast.loading(language === 'en' ? 'Saving & Generating Document...' : 'Menyimpan & Membuat Dokumen...');

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
      toast.success(language === 'en' ? 'KYC document downloaded' : 'Dokumen KYC diunduh');
    } catch (error) {
      console.error(error);
      toast.dismiss(toastId);
      toast.error(language === 'en' ? 'Failed to download KYC document' : 'Gagal mengunduh dokumen KYC');
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !clientId) return;

    setUploading(true);
    try {
      await apiClient.uploadKycDocument(clientId, file, 'signed_kyc_document');
      queryClient.invalidateQueries(['kycDocuments']);
      onChange({ signed_kyc_document_url: 'uploaded' }); // Dummy value to satisfy any prop checks?
      toast.success(language === 'en' ? 'File uploaded successfully' : 'File berhasil diunggah');
    } catch (error) {
      toast.error(language === 'en' ? 'Failed to upload file' : 'Gagal mengunggah file');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-[#1e3a5f] mb-2">
          {language === 'en' ? '5. Declaration' : '5. Deklarasi'}
        </h3>
      </div>

      <Card className="bg-amber-50 border-amber-200">
        <CardContent className="pt-6">
          <p className="text-sm leading-relaxed">
            <strong>5.1</strong> {language === 'en'
              ? 'It is hereby declared that the information and particulars furnished above are true and correct to the best of my/our knowledge and belief and that nothing has been misrepresented and/or concealed.'
              : 'Dengan ini dinyatakan bahwa informasi dan perincian yang diberikan di atas adalah benar dan akurat sebaik pengetahuan dan keyakinan saya/kami dan bahwa tidak ada yang disalahartikan dan/atau disembunyikan.'}
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
          {language === 'en'
            ? 'I confirm that I have read and agree to the declaration above *'
            : 'Saya mengonfirmasi bahwa saya telah membaca dan menyetujui deklarasi di atas *'}
        </label>
      </div>

      <div className="border-t pt-6">
        <h4 className="font-semibold text-[#1e3a5f] mb-4">
          {language === 'en' ? '6. Signature' : '6. Tanda Tangan'}
        </h4>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label>
              {language === 'en'
                ? 'Name of authorized person completing this Registration Form *'
                : 'Nama orang yang berwenang mengisi Formulir Pendaftaran ini *'}
            </Label>
            <Input
              value={formData.authorized_person_name || ''}
              onChange={(e) => handleChange('authorized_person_name', e.target.value)}
            />
          </div>
          <div>
            <Label>{language === 'en' ? 'Date:' : 'Tanggal:'} *</Label>
            <Input
              type="date"
              value={formData.signature_date || ''}
              onChange={(e) => handleChange('signature_date', e.target.value)}
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mt-4">
          <div>
            <Label>{language === 'en' ? 'Position' : 'Posisi'} *</Label>
            <Input
              value={formData.authorized_person_position || ''}
              onChange={(e) => handleChange('authorized_person_position', e.target.value)}
            />
          </div>
          <div>
            <Label>{language === 'en' ? 'Location:' : 'Lokasi:'} *</Label>
            <Input
              value={formData.signature_location || ''}
              onChange={(e) => handleChange('signature_location', e.target.value)}
            />
          </div>
        </div>

        <Alert className="mt-4">
          <AlertDescription className="text-xs">
            * {language === 'en'
              ? 'If Registration Form is filled by unauthorized person, please provide the Power of Attorney Letter'
              : 'Jika Formulir Pendaftaran diisi oleh orang yang tidak berwenang, harap sediakan Surat Kuasa'}
          </AlertDescription>
        </Alert>
      </div>

      <div className="border-t pt-6">
        <h4 className="font-semibold text-[#1e3a5f] mb-4">
          {language === 'en' ? 'Download & Upload Signed Document' : 'Unduh & Unggah Dokumen Bertanda Tangan'}
        </h4>

        <div className="flex flex-col gap-4">
          <Button
            onClick={handleDownloadKYC}
            variant="outline"
            className="w-full"
          >
            <Download className="w-4 h-4 mr-2" />
            {language === 'en'
              ? 'Download KYC Form (with prefilled data)'
              : 'Unduh Formulir KYC (dengan data terisi)'}
          </Button>

          <div>
            <Label className="mb-2 block">
              {language === 'en'
                ? 'Upload Signed KYC Document'
                : 'Unggah Dokumen KYC yang Ditandatangani'}
            </Label>
            {signedDoc ? (
              <div className="flex gap-2">
                <Button variant="outline" className="w-full" disabled>
                  <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                  {language === 'en' ? 'Document Uploaded' : 'Dokumen Terunggah'}
                  {/* Download functionality is currently skipped as per spec analysis */}
                </Button>
                <label>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    disabled={uploading}
                    onClick={(e) => e.currentTarget.previousElementSibling?.click()}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {uploading ? '...' : (language === 'en' ? 'Replace' : 'Ganti')}
                  </Button>
                </label>
              </div>
            ) : (
              <label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  disabled={uploading}
                  onClick={(e) => e.currentTarget.previousElementSibling?.click()}
                  className="w-full"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {uploading ? (language === 'en' ? 'Uploading...' : 'Mengunggah...') : (language === 'en' ? 'Upload Signed Document' : 'Unggah Dokumen yang Ditandatangani')}
                </Button>
              </label>
            )}

            <p className="text-xs text-slate-500 mt-2">
              {language === 'en'
                ? 'Please download the form above, sign it, and upload the scanned PDF.'
                : 'Harap unduh formulir di atas, tandatangani, dan unggah pindaian PDF.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}