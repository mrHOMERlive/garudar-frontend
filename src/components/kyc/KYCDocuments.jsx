import React, { useState } from 'react';
import { apiClient } from '@/api/apiClient';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Upload, Download, CheckCircle } from 'lucide-react';
import { t } from '@/components/utils/language';

export default function KYCDocuments({ formData = {}, onChange, clientId }) {
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState({});

  // Fetch uploaded documents
  const { data: uploadedDocs = [] } = useQuery({
    queryKey: ['kycDocuments', clientId],
    queryFn: () => apiClient.listKycDocuments(clientId),
    enabled: !!clientId,
  });

  const getDocStatus = (key) => {
    return uploadedDocs.find((d) => d.doc_type === key);
  };

  const handleDownload = async (doc) => {
    if (!doc || !clientId) return;
    try {
      const blob = await apiClient.downloadKycDocument(clientId, doc.doc_id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.file_name || `${doc.doc_type}_document`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (e) {
      console.error('Download error:', e);
      toast.error(t('kycDownloadFailed'));
    }
  };

  const handleFileUpload = async (field, file) => {
    if (!file || !clientId) return;
    setUploading((prev) => ({ ...prev, [field]: true }));
    try {
      const DOC_TYPE_MAPPING = {
        cert_incorporation: 'cert_incorporation',
        register_of_commerce: 'register_of_commerce',
        company_committee_list: 'company_committee_list',
        memorandum_articles: 'memorandum_articles',
        shareholders_list: 'shareholders_list',
        authorized_signatories_list: 'authorized_signatories_list',
        passport_signatories: 'passport_signatories',
      };

      const docType = DOC_TYPE_MAPPING[field] || 'other';
      const comment = field; // Use the original field key as comment to preserve context

      await apiClient.uploadKycDocument(clientId, file, docType, comment);
      queryClient.invalidateQueries(['kycDocuments']);
      toast.success(t('kycFileUploadedSuccess'));

      onChange({ [field]: true });
    } catch (error) {
      console.error(error);
      toast.error(t('kycFailedUploadFile'));
    } finally {
      setUploading((prev) => ({ ...prev, [field]: false }));
    }
  };

  const documents = [
    { key: 'cert_incorporation', labelKey: 'kycDocCertOfIncorporation', code: '2.1' },
    { key: 'register_of_commerce', labelKey: 'kycDocTradeLicense', code: '2.2' },
    { key: 'company_committee_list', labelKey: 'kycDocCommitteeList', code: '2.3' },
    { key: 'memorandum_articles', labelKey: 'kycDocMemorandum', code: '2.4' },
    { key: 'shareholders_list', labelKey: 'kycDocShareholdersList', code: '2.5' },
    { key: 'authorized_signatories_list', labelKey: 'kycDocAuthSignatories', code: '2.6' },
    { key: 'passport_signatories', labelKey: 'kycDocPassportSignatories', code: '2.7' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-[#1e3a5f] mb-2">{t('kycSectionCompanyId')}</h3>
        <p className="text-sm text-slate-600">{t('kycDocumentsInstruction')}</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-slate-300">
          <thead>
            <tr className="bg-slate-100">
              <th className="border border-slate-300 p-3 text-left">{t('kycMandatoryDocsHeader')}</th>
              <th className="border border-slate-300 p-3 text-center w-40">{t('kycUploadHeader')}</th>
            </tr>
          </thead>
          <tbody>
            {documents.map((doc) => (
              <tr key={doc.key} className="hover:bg-slate-50">
                <td className="border border-slate-300 p-3 flex items-center">
                  <span className="font-medium mr-2">{doc.code}</span>
                  <div className="flex-1">
                    <Label>{t(doc.labelKey)}</Label>
                    {getDocStatus(doc.key) && (
                      <div className="flex items-center text-green-600 mt-2">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        <span className="text-sm">{t('kycUploadedLabel')}</span>
                      </div>
                    )}
                  </div>
                </td>
                <td className="border border-slate-300 p-3 text-center">
                  <div className="flex gap-2 justify-center">
                    {getDocStatus(doc.key) && (
                      <Button size="sm" variant="ghost" onClick={() => handleDownload(getDocStatus(doc.key))}>
                        <Download className="w-4 h-4" />
                      </Button>
                    )}
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
                        {uploading[doc.key] ? '...' : t('kycUploadHeader')}
                      </Button>
                    </label>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
