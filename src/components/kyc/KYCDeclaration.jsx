import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Download, Upload } from 'lucide-react';
import { toast } from 'sonner';

export default function KYCDeclaration({ formData = {}, onChange, language = 'en' }) {
  const [uploading, setUploading] = useState(false);

  const handleChange = (field, value) => {
    onChange({ [field]: value });
  };

  const handleDownloadKYC = () => {
    toast.info(language === 'en' ? 'Generating KYC document...' : 'Membuat dokumen KYC...');
  };

  const handleUploadSignedKYC = async (file) => {
    if (!file) return;
    
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      handleChange('signed_kyc_document', file_url);
      toast.success(language === 'en' ? 'Signed KYC uploaded' : 'KYC yang ditandatangani diunggah');
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
            {formData.signed_kyc_document ? (
              <div className="flex gap-2">
                <a 
                  href={formData.signed_kyc_document} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex-1"
                >
                  <Button variant="outline" className="w-full">
                    <Download className="w-4 h-4 mr-2" />
                    {language === 'en' ? 'View Uploaded Document' : 'Lihat Dokumen yang Diunggah'}
                  </Button>
                </a>
                <label>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => handleUploadSignedKYC(e.target.files?.[0])}
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
                  onChange={(e) => handleUploadSignedKYC(e.target.files?.[0])}
                  className="hidden"
                />
                <Button 
                  type="button"
                  variant="outline"
                  disabled={uploading}
                  className="w-full"
                  onClick={(e) => e.currentTarget.previousElementSibling?.click()}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {uploading ? (language === 'en' ? 'Uploading...' : 'Mengunggah...') : (language === 'en' ? 'Upload Signed Document' : 'Unggah Dokumen Bertanda Tangan')}
                </Button>
              </label>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}