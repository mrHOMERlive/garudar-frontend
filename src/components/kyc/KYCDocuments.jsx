import React, { useState } from 'react';
import { apiClient } from '@/api/apiClient';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Upload, Download, X, CheckCircle } from 'lucide-react';
import { t } from '@/components/utils/language';

const MAX_FILES_PER_TYPE = 10;

const DOC_TYPE_MAPPING = {
  cert_incorporation: 'cert_incorporation',
  register_of_commerce: 'register_of_commerce',
  company_committee_list: 'company_committee_list',
  memorandum_articles: 'memorandum_articles',
  shareholders_list: 'shareholders_list',
  authorized_signatories_list: 'authorized_signatories_list',
  passport_signatories: 'passport_signatories',
};

export default function KYCDocuments({ formData = {}, onChange, clientId }) {
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState({});

  // Fetch all uploaded documents for this client
  const { data: uploadedDocs = [] } = useQuery({
    queryKey: ['kycDocuments', clientId],
    queryFn: () => apiClient.listKycDocuments(clientId),
    enabled: !!clientId,
  });

  const getDocsForType = (key) => uploadedDocs.filter((d) => d.doc_type === key);

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

  const handleFilesUpload = async (field, files) => {
    if (!files?.length || !clientId) return;
    setUploading((prev) => ({ ...prev, [field]: true }));
    const docType = DOC_TYPE_MAPPING[field] || 'other';
    let uploadedCount = 0;
    let limitHit = false;

    try {
      for (const file of Array.from(files)) {
        try {
          await apiClient.uploadKycDocument(clientId, file, docType, field);
          uploadedCount += 1;
        } catch (e) {
          if (e?.status === 409 || String(e?.message || '').includes('409')) {
            limitHit = true;
            break;
          }
          console.error('Upload error:', e);
          toast.error(t('kycFailedUploadFile'));
          break;
        }
      }

      if (uploadedCount > 0) {
        await queryClient.invalidateQueries({ queryKey: ['kycDocuments'] });
        toast.success(t('kycFileUploadedSuccess'));
        onChange({ [field]: true });
      }
      if (limitHit) {
        toast.error(t('kycFileLimitReached'));
      }
    } finally {
      setUploading((prev) => ({ ...prev, [field]: false }));
    }
  };

  const handleDelete = async (doc, field) => {
    if (!doc || !clientId) return;
    if (!window.confirm(t('kycRemoveFileConfirm'))) return;
    try {
      await apiClient.deleteKycDocument(clientId, doc.doc_id);
      await queryClient.invalidateQueries({ queryKey: ['kycDocuments'] });
      toast.success(t('kycFileRemoved'));
      // Update the boolean flag based on remaining files for this type
      const remaining = uploadedDocs.filter((d) => d.doc_type === doc.doc_type && d.doc_id !== doc.doc_id);
      onChange({ [field]: remaining.length > 0 });
    } catch (e) {
      console.error('Delete error:', e);
      toast.error(t('kycFailedRemoveFile'));
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
        <p className="text-xs text-slate-500 mt-1">{t('kycMultipleFilesHint')}</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-slate-300">
          <thead>
            <tr className="bg-slate-100">
              <th className="border border-slate-300 p-3 text-left">{t('kycMandatoryDocsHeader')}</th>
              <th className="border border-slate-300 p-3 text-left w-[50%]">{t('kycUploadHeader')}</th>
            </tr>
          </thead>
          <tbody>
            {documents.map((doc) => {
              const files = getDocsForType(doc.key);
              const limitReached = files.length >= MAX_FILES_PER_TYPE;
              return (
                <tr key={doc.key} className="hover:bg-slate-50 align-top">
                  <td className="border border-slate-300 p-3">
                    <div className="flex items-start">
                      <span className="font-medium mr-2">{doc.code}</span>
                      <div className="flex-1">
                        <Label>{t(doc.labelKey)}</Label>
                        {files.length > 0 && (
                          <div className="flex items-center text-green-600 mt-2">
                            <CheckCircle className="w-4 h-4 mr-2" />
                            <span className="text-sm">
                              {files.length} {t('kycFilesCount')}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="border border-slate-300 p-3">
                    <div className="space-y-2">
                      {files.length > 0 && (
                        <div className="space-y-1">
                          {files.map((file) => (
                            <div
                              key={file.doc_id}
                              className="flex items-center gap-2 text-sm bg-slate-50 rounded px-2 py-1 border border-slate-100"
                            >
                              <span className="flex-1 truncate" title={file.file_name}>
                                {file.file_name}
                              </span>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7"
                                title={t('download')}
                                onClick={() => handleDownload(file)}
                              >
                                <Download className="w-4 h-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7 text-red-500 hover:text-red-700"
                                title={t('kycRemoveFile')}
                                onClick={() => handleDelete(file, doc.key)}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs text-slate-500">
                          {files.length} / {MAX_FILES_PER_TYPE}
                        </span>
                        <label>
                          <input
                            type="file"
                            multiple
                            disabled={limitReached || uploading[doc.key]}
                            onChange={(e) => {
                              handleFilesUpload(doc.key, e.target.files);
                              // reset value so re-uploading the same file works
                              e.target.value = '';
                            }}
                            className="hidden"
                          />
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            disabled={limitReached || uploading[doc.key]}
                            onClick={(e) => e.currentTarget.previousElementSibling?.click()}
                          >
                            <Upload className="w-4 h-4 mr-1" />
                            {uploading[doc.key] ? t('uploadingDots') : t('kycAddFiles')}
                          </Button>
                        </label>
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
