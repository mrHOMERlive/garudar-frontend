import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Upload, Download } from 'lucide-react';

export default function KYCDocuments({ formData = {}, onChange, language = 'en' }) {
  const [uploading, setUploading] = useState({});
  const [checklist, setChecklist] = useState({});

  const handleFileUpload = async (field, file) => {
    if (!file) return;
    
    setUploading(prev => ({ ...prev, [field]: true }));
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      onChange({ [field]: file_url });
      toast.success(language === 'en' ? 'File uploaded successfully' : 'File berhasil diunggah');
    } catch (error) {
      toast.error(language === 'en' ? 'Failed to upload file' : 'Gagal mengunggah file');
    } finally {
      setUploading(prev => ({ ...prev, [field]: false }));
    }
  };

  const documents = [
    { 
      key: 'cert_incorporation', 
      label: language === 'en' ? 'Certificate of Incorporation' : 'Sertifikat Pendirian',
      code: '2.1'
    },
    { 
      key: 'register_of_commerce', 
      label: language === 'en' ? 'Trade License' : 'Izin Usaha',
      code: '2.2'
    },
    { 
      key: 'company_committee_list', 
      label: language === 'en' ? 'List Of Company Committee (Commissioners & Directors)' : 'Daftar Komite Perusahaan (Komisaris & Direktur)',
      code: '2.3'
    },
    { 
      key: 'memorandum_articles', 
      label: language === 'en' ? 'Memorandum/Articles of Association and Amendments' : 'Anggaran Dasar dan Perubahannya',
      code: '2.4'
    },
    { 
      key: 'shareholders_list', 
      label: language === 'en' ? 'List of Shareholder and capital share' : 'Daftar Pemegang Saham dan Modal',
      code: '2.5'
    },
    { 
      key: 'authorized_signatories_list', 
      label: language === 'en' ? 'List of Authorized signatories with signatures authentication' : 'Daftar Penandatangan Resmi dengan Autentikasi Tanda Tangan',
      code: '2.6'
    },
    { 
      key: 'passport_signatories', 
      label: language === 'en' ? 'Copy of Passport for authorized signatories (2.6)' : 'Salinan Paspor untuk Penandatangan Resmi (2.6)',
      code: '2.7'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-[#1e3a5f] mb-2">
          {language === 'en' ? '2. Company Identification Details' : '2. Detail Identifikasi Perusahaan'}
        </h3>
        <p className="text-sm text-slate-600">
          {language === 'en' 
            ? 'Please provide copies of the below documents. These documents should be provided in the English Language or with an English Translation.'
            : 'Harap sediakan salinan dokumen di bawah ini. Dokumen-dokumen ini harus disediakan dalam Bahasa Inggris atau dengan Terjemahan Bahasa Inggris.'}
        </p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-slate-300">
          <thead>
            <tr className="bg-slate-100">
              <th className="border border-slate-300 p-3 text-left">
                {language === 'en' ? 'Mandatory documents to be provided' : 'Dokumen wajib yang harus disediakan'}
              </th>
              <th className="border border-slate-300 p-3 text-center w-24">
                {language === 'en' ? 'Please Tick (X)' : 'Beri Tanda (X)'}
              </th>
              <th className="border border-slate-300 p-3 text-center w-32">
                {language === 'en' ? 'Reference No.' : 'No. Referensi'}
              </th>
              <th className="border border-slate-300 p-3 text-center w-40">
                {language === 'en' ? 'Upload' : 'Unggah'}
              </th>
            </tr>
          </thead>
          <tbody>
            {documents.map((doc) => (
              <tr key={doc.key} className="hover:bg-slate-50">
                <td className="border border-slate-300 p-3">
                  <span className="font-medium mr-2">{doc.code}</span>
                  {doc.label}
                </td>
                <td className="border border-slate-300 p-3 text-center">
                  <input
                    type="checkbox"
                    checked={checklist[doc.key] || false}
                    onChange={(e) => setChecklist(prev => ({ ...prev, [doc.key]: e.target.checked }))}
                    className="w-5 h-5"
                  />
                </td>
                <td className="border border-slate-300 p-3">
                  <Input
                    placeholder={language === 'en' ? 'Reference' : 'Referensi'}
                    className="text-sm"
                  />
                </td>
                <td className="border border-slate-300 p-3 text-center">
                  {formData[doc.key] ? (
                    <div className="flex gap-2 justify-center">
                      <a 
                        href={formData[doc.key]} 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        <Button size="sm" variant="outline">
                          <Download className="w-4 h-4" />
                        </Button>
                      </a>
                      <label>
                        <input
                          type="file"
                          onChange={(e) => handleFileUpload(doc.key, e.target.files?.[0])}
                          className="hidden"
                        />
                        <Button 
                          type="button" 
                          size="sm" 
                          variant="outline"
                          disabled={uploading[doc.key]}
                          onClick={(e) => e.currentTarget.previousElementSibling?.click()}
                        >
                          <Upload className="w-4 h-4" />
                        </Button>
                      </label>
                    </div>
                  ) : (
                    <label>
                      <input
                        type="file"
                        onChange={(e) => handleFileUpload(doc.key, e.target.files?.[0])}
                        className="hidden"
                      />
                      <Button 
                        type="button" 
                        size="sm"
                        disabled={uploading[doc.key]}
                        onClick={(e) => e.currentTarget.previousElementSibling?.click()}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        {uploading[doc.key] ? '...' : (language === 'en' ? 'Upload' : 'Unggah')}
                      </Button>
                    </label>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}