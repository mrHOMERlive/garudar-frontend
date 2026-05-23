import React, { useState } from 'react';
import { apiClient } from '@/api/apiClient';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { CheckCircle, XCircle, AlertCircle, Download, ShieldAlert, AlertTriangle } from 'lucide-react';
import { Loader2 } from 'lucide-react';
import { t } from '@/components/utils/language';

// Map of KYC doc_type → translation key for display in the staff drawer.
// Keep in sync with KYCDocuments.jsx and the backend KYCDocumentType enum.
const DOC_TYPE_LABEL_MAP = {
  cert_incorporation: 'kycDocCertOfIncorporation',
  register_of_commerce: 'kycDocTradeLicense',
  company_committee_list: 'kycDocCommitteeList',
  memorandum_articles: 'kycDocMemorandum',
  shareholders_list: 'kycDocShareholdersList',
  authorized_signatories_list: 'kycDocAuthSignatories',
  passport_signatories: 'kycDocPassportSignatories',
  ubo_passport: 'kycDocUboPassport',
  ubo_proof_of_address: 'kycDocUboProofAddress',
  signed_kyc_document: 'kycDocSignedKyc',
  bank_statement: 'kycDocBankStatement',
  financial_statements: 'kycDocFinancialStatements',
  power_of_attorney: 'kycDocPowerOfAttorney',
  other: 'kycDocOther',
};

function groupDocumentsByType(documents) {
  return documents.reduce((acc, doc) => {
    const key = doc.doc_type || 'other';
    (acc[key] ||= []).push(doc);
    return acc;
  }, {});
}

export default function StaffKYCDrawer({ open, onClose, kycProfile, client, ubos = [], isLoading }) {
  const queryClient = useQueryClient();
  const [comment, setComment] = useState('');

  // Access nested data from the new API structure
  // kycProfile structure: { status, data: { corporate: {}, banking: {}, declaration: {} } }
  const corporate = kycProfile?.data?.corporate || {};
  const banking = kycProfile?.data?.banking || {};
  const status = kycProfile?.status || 'UNKNOWN';
  const clientId = client?.client_id || client?.user_id; // Check both potential ID fields

  // Fetch documents list
  const { data: documents = [] } = useQuery({
    queryKey: ['kycDocuments', clientId],
    queryFn: () => apiClient.listKycDocuments(clientId),
    enabled: !!clientId && open,
  });

  // Локальный PPATK pre-screen (DTTOT/DPPSPM/UN-AQ) — данные созданы при KYC
  // submit, до того как staff-approve. Показываем staff'у санкционные хиты
  // ДО решения, чтобы он не тратил CA-квоту на компании из списков.
  // Эндпоинт staff-only — клиент его не увидит (tipping-off prevention).
  const { data: ppatkData, isLoading: isPpatkLoading } = useQuery({
    queryKey: ['kycPpatkAlerts', clientId],
    queryFn: () => apiClient.getKycPpatkAlerts(clientId),
    enabled: !!clientId && open,
    // Не повторяем на 404 (нет KYC-профиля — нормально)
    retry: false,
  });
  const ppatkRedFlag = Boolean(ppatkData?.has_red_flag);

  const decisionMutation = useMutation({
    mutationFn: async ({ status, comment }) => {
      await apiClient.makeKycDecision(clientId, { status, comment });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['kycQueue']);
      queryClient.invalidateQueries(['kycProfile', clientId]);
      toast.success(t('drKycDecisionRecorded'));
      onClose();
    },
    onError: (error) => {
      toast.error(`${t('drFailedRecordDecision')}: ${error.message}`);
    },
  });

  const handleApprove = () => {
    decisionMutation.mutate({ status: 'approved', comment });
  };

  const handleReject = () => {
    if (!comment) {
      toast.error(t('drFailedRecordDecision'));
      return;
    }
    decisionMutation.mutate({ status: 'rejected', comment });
  };

  const handleNeedsFix = () => {
    if (!comment) {
      toast.error(t('drFailedRecordDecision'));
      return;
    }
    decisionMutation.mutate({ status: 'needs_fix', comment });
  };

  const handleDownload = async (doc) => {
    try {
      const blob = await apiClient.downloadKycDocument(clientId, doc.doc_id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = doc.file_name;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error(`${t('kycDownloadFailed')}: ${error.message}`);
    }
  };

  if (isLoading) {
    return (
      <Sheet open={open} onOpenChange={onClose}>
        <SheetContent className="w-full sm:max-w-2xl flex flex-col">
          <SheetHeader>
            <SheetTitle>Loading KYC Profile</SheetTitle>
            <SheetDescription>Please wait while the data is being fetched...</SheetDescription>
          </SheetHeader>
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#1e3a5f]" />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  if (!kycProfile || !client) return null;

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>KYC Review - {corporate.company_name || 'Unknown Company'}</SheetTitle>
          <SheetDescription>Review and process the KYC application below.</SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          <div>
            <h4 className="font-semibold mb-2 text-[#1e3a5f]">Client Information</h4>
            <CardBox>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-slate-600">
                <div>
                  <span className="font-medium text-slate-800">Client Name:</span>{' '}
                  {client.client_name || client.username}
                </div>
                <div>
                  <span className="font-medium text-slate-800">Email:</span> {client.client_mail || client.email}
                </div>
                <div>
                  <span className="font-medium text-slate-800">Status:</span>{' '}
                  <Badge variant={status === 'approved' ? 'success' : 'secondary'}>{status.toUpperCase()}</Badge>
                </div>
                {kycProfile.submitted_at && (
                  <div className="col-span-2">
                    <span className="font-medium text-slate-800">Submitted:</span>{' '}
                    {new Date(kycProfile.submitted_at).toLocaleString()}
                  </div>
                )}
              </div>
            </CardBox>
          </div>

          <div>
            <h4 className="font-semibold mb-2 text-[#1e3a5f]">Corporate Details</h4>
            <CardBox>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-slate-600">
                <div className="col-span-2">
                  <span className="font-medium text-slate-800">Company Name:</span> {corporate.company_name}
                </div>
                <div className="col-span-2">
                  <span className="font-medium text-slate-800">Trading Name:</span> {corporate.trading_name || '-'}
                </div>
                <div>
                  <span className="font-medium text-slate-800">Country:</span> {corporate.incorporation_country}
                </div>
                <div>
                  <span className="font-medium text-slate-800">Date:</span> {corporate.incorporation_date}
                </div>
                <div>
                  <span className="font-medium text-slate-800">Tax ID:</span> {corporate.tax_id}
                </div>
                <div>
                  <span className="font-medium text-slate-800">Reg. Num:</span> {corporate.registration_number}
                </div>
                <div className="col-span-2">
                  <span className="font-medium text-slate-800">Address:</span> {corporate.registered_address}
                </div>
              </div>
            </CardBox>
          </div>

          <div>
            <h4 className="font-semibold mb-2 text-[#1e3a5f]">Banking Details</h4>
            <CardBox>
              <div className="grid grid-cols-1 gap-y-2 text-sm text-slate-600">
                <div>
                  <span className="font-medium text-slate-800">Bank Name:</span> {banking.principal_bankers}
                </div>
                <div>
                  <span className="font-medium text-slate-800">SWIFT/BIC:</span> {banking.swift_bic}
                </div>
                <div>
                  <span className="font-medium text-slate-800">Account Number:</span> {banking.bank_account_number}
                </div>
                <div>
                  <span className="font-medium text-slate-800">Account Currency:</span> {banking.bank_account_currency}
                </div>
                <div>
                  <span className="font-medium text-slate-800">Bank Address:</span> {banking.bank_branch_address},{' '}
                  {banking.bank_city_country}
                </div>
              </div>
            </CardBox>
          </div>

          {/* AML Pre-screen (PPATK) — между Banking и UBO. Показывает локальные
              санкционные матчи DTTOT/DPPSPM/UN-AQ, найденные на KYC submit
              ДО staff-approve. См. backend: pre_screen_kyc_on_submit. */}
          <div>
            <h4
              className={`font-semibold mb-2 flex items-center gap-2 ${ppatkRedFlag ? 'text-red-700' : 'text-[#1e3a5f]'}`}
            >
              {ppatkRedFlag && <ShieldAlert className="w-4 h-4" />}
              {t('drPpatkSectionTitle')}
            </h4>
            <CardBox>
              {isPpatkLoading ? (
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Loader2 className="w-4 h-4 animate-spin" /> {t('drPpatkLoading')}
                </div>
              ) : !ppatkData || ppatkData.status === null ? (
                <div className="text-sm text-slate-500 italic">{t('drPpatkNotRun')}</div>
              ) : ppatkData.status === 'error' ? (
                <div className="text-sm text-yellow-700">{t('drPpatkErrorStatus')}</div>
              ) : ppatkData.has_red_flag && (!ppatkData.matches || ppatkData.matches.length === 0) ? (
                // Counter-source-of-truth говорит «есть матч», но детальные алерты
                // отсутствуют — рассинхрон БД. Не врём, а сигналим оператору.
                // Должно быть устранено data-migration'ом 31b6c2297cab; этот
                // branch остаётся как защита от будущих edge-кейсов.
                <div className="text-sm text-yellow-700 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-semibold">{t('drPpatkStale')}</div>
                    <div className="text-xs text-slate-600 mt-1">
                      {t('drPpatkStaleHint').replace('{count}', ppatkData.match_count)}
                    </div>
                  </div>
                </div>
              ) : !ppatkData.matches || ppatkData.matches.length === 0 ? (
                <div className="text-sm text-green-700">{t('drPpatkNoMatches')}</div>
              ) : (
                <div className="space-y-2">
                  <div className="text-sm font-semibold text-red-700 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    {t('drPpatkMatchCount').replace('{count}', ppatkData.match_count)}
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 text-left text-slate-700">
                          <th className="py-1 pr-2 font-medium">{t('drPpatkColRole')}</th>
                          <th className="py-1 pr-2 font-medium">{t('drPpatkColName')}</th>
                          <th className="py-1 pr-2 font-medium">{t('drPpatkSource')}</th>
                          <th className="py-1 pr-2 font-medium">{t('drPpatkColMatched')}</th>
                          <th className="py-1 pr-2 font-medium">{t('drPpatkSimilarity')}</th>
                          <th className="py-1 pr-2 font-medium">{t('drPpatkColEntryId')}</th>
                        </tr>
                      </thead>
                      <tbody className="text-slate-600">
                        {ppatkData.matches.map((m, idx) => (
                          <tr key={`${m.entry_id}-${idx}`} className="border-b border-slate-100">
                            <td className="py-1 pr-2 uppercase font-mono text-slate-500">{m.role}</td>
                            <td className="py-1 pr-2">{m.name}</td>
                            <td className="py-1 pr-2">
                              <span className="px-1.5 py-0.5 bg-red-50 text-red-700 rounded font-medium">
                                {m.source_list}
                              </span>
                            </td>
                            <td className="py-1 pr-2">{m.matched_name || m.full_name || '-'}</td>
                            <td className="py-1 pr-2 font-mono">
                              {m.similarity != null ? Number(m.similarity).toFixed(2) : '-'}
                            </td>
                            <td className="py-1 pr-2 font-mono text-slate-400">{m.entry_id}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </CardBox>
          </div>

          <div>
            <h4 className="font-semibold mb-2 text-[#1e3a5f]">Ownership / UBO</h4>
            <CardBox>
              {ubos.length === 0 ? (
                <div className="text-sm text-slate-500 italic">No shareholders/UBOs provided.</div>
              ) : (
                <div className="space-y-3">
                  {ubos.map((ubo, idx) => (
                    <div key={ubo.id} className="p-3 bg-slate-50 rounded border border-slate-100">
                      <div className="font-medium text-slate-800 mb-1">Shareholder {idx + 1}</div>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-slate-600">
                        <div>
                          <span className="font-medium text-slate-800">Name:</span> {ubo.ubo_name || '-'}
                        </div>
                        <div>
                          <span className="font-medium text-slate-800">Shareholding:</span>{' '}
                          {ubo.shareholding_percent != null ? `${ubo.shareholding_percent}%` : '-'}
                        </div>
                        <div>
                          <span className="font-medium text-slate-800">Nationality:</span> {ubo.nationality || '-'}
                        </div>
                        <div>
                          <span className="font-medium text-slate-800">Residence:</span> {ubo.residence_country || '-'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardBox>
          </div>

          <div>
            <h4 className="font-semibold mb-2 text-[#1e3a5f]">{t('kycUploadedDocsHeader')}</h4>
            <CardBox>
              {documents.length === 0 ? (
                <div className="text-sm text-slate-500 italic">{t('kycNoDocumentsUploaded')}</div>
              ) : (
                <div className="space-y-3">
                  {Object.entries(groupDocumentsByType(documents)).map(([type, files]) => (
                    <div key={type} className="bg-slate-50 rounded border border-slate-100 p-2">
                      <div className="font-semibold text-slate-700 mb-1 text-sm">
                        {t(DOC_TYPE_LABEL_MAP[type]) || type.replace(/_/g, ' ')}{' '}
                        <span className="text-slate-500 font-normal">({files.length})</span>
                      </div>
                      <div className="space-y-1">
                        {files.map((doc) => (
                          <Button
                            key={doc.doc_id}
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownload(doc)}
                            className="h-8 text-blue-600 hover:text-blue-800 w-full justify-start"
                          >
                            <Download className="w-4 h-4 mr-2 flex-shrink-0" />
                            <span className="truncate" title={doc.file_name}>
                              {doc.file_name}
                            </span>
                          </Button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardBox>
          </div>

          <div>
            <Label className="mb-2 block font-semibold text-[#1e3a5f]">Decision Comment</Label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={t('drAddCommentsAboutDecision')}
              className="min-h-[100px]"
            />
          </div>

          {/* Если есть PPATK-red_flag — предупреждаем staff перед approve.
              Кнопка остаётся активной (UI-only flow): finальное решение
              принимает сотрудник, не система. */}
          {ppatkRedFlag && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-800">
              <ShieldAlert className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>{t('drPpatkApproveWarning')}</div>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <div className="flex gap-3">
              <Button
                onClick={handleApprove}
                disabled={decisionMutation.isPending}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Approve
              </Button>

              <Button
                onClick={handleNeedsFix}
                disabled={decisionMutation.isPending}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
              >
                <AlertCircle className="w-4 h-4 mr-2" />
                Request Changes
              </Button>
            </div>
            <Button
              onClick={handleReject}
              disabled={decisionMutation.isPending}
              variant="destructive"
              className="w-full"
            >
              <XCircle className="w-4 h-4 mr-2" />
              Reject Application
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function CardBox({ children }) {
  return <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-sm">{children}</div>;
}
