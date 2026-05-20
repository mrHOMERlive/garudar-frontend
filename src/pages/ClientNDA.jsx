import React, { useEffect, useState } from 'react';
import { apiClient } from '@/api/apiClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { ArrowLeft, Send, Download, Upload, FileText, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { t } from '@/components/utils/language';

/**
 * ClientNDA — English-only end-to-end NDA flow (страница клиента).
 *
 * Workflow (см. backend `app/routers/nda.py`):
 *   DRAFT → GENERATED → SIGNED_UPLOADED → SUBMITTED → ACCEPTED / REJECTED
 *
 * Поля партнёра (на английском) подставляются в DOCX-шаблон
 * `app/template/nda/NDA_ENG_V1.docx`. Реквизиты PT GAN — hardcoded
 * в шаблоне, поэтому в форме нет понятия «компания группы».
 */

const STATUS_DRAFT = 'draft';
const STATUS_GENERATED = 'generated';
const STATUS_SIGNED_UPLOADED = 'signed_uploaded';
const STATUS_SUBMITTED = 'submitted';
const STATUS_ACCEPTED = 'accepted';
const STATUS_REJECTED = 'rejected';

function StatusBadge({ status }) {
  const map = {
    [STATUS_DRAFT]: { cls: 'bg-slate-200 text-slate-800', label: t('ndaStatusDraft'), icon: FileText },
    [STATUS_GENERATED]: { cls: 'bg-blue-100 text-blue-800', label: t('ndaStatusGenerated'), icon: FileText },
    [STATUS_SIGNED_UPLOADED]: {
      cls: 'bg-indigo-100 text-indigo-800',
      label: t('ndaStatusSignedUploaded'),
      icon: Upload,
    },
    [STATUS_SUBMITTED]: { cls: 'bg-amber-100 text-amber-900', label: t('ndaStatusSubmitted'), icon: Clock },
    [STATUS_ACCEPTED]: { cls: 'bg-emerald-100 text-emerald-900', label: t('ndaStatusAccepted'), icon: CheckCircle2 },
    [STATUS_REJECTED]: { cls: 'bg-red-100 text-red-800', label: t('ndaStatusRejected'), icon: XCircle },
  };
  const entry = map[status] || { cls: 'bg-slate-200 text-slate-800', label: status || '—', icon: FileText };
  const Icon = entry.icon;
  return (
    <Badge className={`${entry.cls} text-xs font-medium px-2 py-1 inline-flex items-center gap-1`}>
      <Icon className="w-3.5 h-3.5" />
      {entry.label}
    </Badge>
  );
}

export default function ClientNDA() {
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => apiClient.getCurrentUser(),
  });

  const { data: client, isLoading: clientLoading } = useQuery({
    queryKey: ['currentClient', user?.email],
    queryFn: async () => apiClient.getMyClient(),
    enabled: !!user,
  });

  const { data: ndaRequest } = useQuery({
    queryKey: ['ndaRequest', client?.client_id],
    queryFn: async () => {
      const requests = await apiClient.getNdaRequests({ client_id: client.client_id });
      return requests[0];
    },
    enabled: !!client,
  });

  const { data: history } = useQuery({
    queryKey: ['ndaHistory', ndaRequest?.id],
    queryFn: async () => apiClient.getNdaHistory(ndaRequest.id),
    enabled: !!ndaRequest,
  });

  // ndaRequest пуст до первого сейва; формa инициализируется один раз,
  // когда ndaRequest подтягивается с бэка.
  const [formData, setFormData] = useState({
    effective_date: '',
    partner_inn: '',
    partner_name_en: '',
    partner_country_en: '',
    partner_address_en: '',
    partner_signatory_en: '',
    partner_signatory_title_en: '',
    partner_contact_name: '',
    partner_contact_email: '',
    partner_contact_phone: '',
    paper_copy_required: false,
  });

  useEffect(() => {
    if (ndaRequest) {
      setFormData({
        effective_date: ndaRequest.effective_date || '',
        partner_inn: ndaRequest.partner_inn || '',
        partner_name_en: ndaRequest.partner_name_en || '',
        partner_country_en: ndaRequest.partner_country_en || '',
        partner_address_en: ndaRequest.partner_address_en || '',
        partner_signatory_en: ndaRequest.partner_signatory_en || '',
        partner_signatory_title_en: ndaRequest.partner_signatory_title_en || '',
        partner_contact_name: ndaRequest.partner_contact_name || '',
        partner_contact_email: ndaRequest.partner_contact_email || '',
        partner_contact_phone: ndaRequest.partner_contact_phone || '',
        paper_copy_required: !!ndaRequest.paper_copy_required,
      });
    }
  }, [ndaRequest]);

  const status = ndaRequest?.status || STATUS_DRAFT;
  // ACCEPTED — окончательное состояние, поля заморожены.
  // REJECTED — клиент правит и regenerate'ит, поэтому НЕ read-only.
  const isReadOnly = [STATUS_SIGNED_UPLOADED, STATUS_SUBMITTED, STATUS_ACCEPTED].includes(status);
  const isFinalized = status === STATUS_ACCEPTED;

  // Последняя запись истории — берём её comment для отображения причины Reject.
  const lastRejection = (history || [])
    .slice()
    .reverse()
    .find((h) => h.new_status === STATUS_REJECTED);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (ndaRequest) {
        return apiClient.updateNdaRequest(ndaRequest.id, formData);
      }
      return apiClient.createNdaRequest({ ...formData, client_id: client.client_id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['ndaRequest']);
      toast.success(t('ndaInformationSavedToast'));
    },
  });

  const generateMutation = useMutation({
    mutationFn: async () => {
      // Сначала сохраняем форму, чтобы backend имел свежие поля для подстановки.
      const saved = ndaRequest
        ? await apiClient.updateNdaRequest(ndaRequest.id, formData)
        : await apiClient.createNdaRequest({ ...formData, client_id: client.client_id });
      return apiClient.generateNda(saved.id);
    },
    onSuccess: (resp) => {
      queryClient.invalidateQueries(['ndaRequest']);
      queryClient.invalidateQueries(['ndaHistory']);
      toast.success(t('ndaGeneratedSuccessToast'));
      // Автооткрытие сгенерированного DOCX в новой вкладке для скачивания.
      if (resp?.generated_file_url) {
        window.open(resp.generated_file_url, '_blank', 'noopener,noreferrer');
      }
    },
    onError: (e) => {
      toast.error(`${t('ndaGenerateFailedToast')}: ${e?.message || ''}`.trim());
    },
  });

  const submitMutation = useMutation({
    mutationFn: async () => apiClient.submitNda(ndaRequest.id),
    onSuccess: () => {
      queryClient.invalidateQueries(['ndaRequest']);
      queryClient.invalidateQueries(['ndaHistory']);
      queryClient.invalidateQueries(['currentClient']);
      toast.success(t('ndaSubmittedForReviewToast'));
    },
  });

  const handleFileUpload = async (file) => {
    if (!file || !ndaRequest) return;
    setUploading(true);
    try {
      await apiClient.uploadSignedNda(ndaRequest.id, file);
      queryClient.invalidateQueries(['ndaRequest']);
      queryClient.invalidateQueries(['ndaHistory']);
      toast.success(t('signedNdaUploadedToast'));
    } catch (err) {
      toast.error(`${t('failedUploadFile')}: ${err?.message || ''}`);
    } finally {
      setUploading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (clientLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#1e3a5f] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">{t('loading')}</p>
        </div>
      </div>
    );
  }

  if (!client) return <div>{t('errorLoadingClient')}</div>;

  // REJECTED тоже даёт re-generate — это правильный resubmit-loop.
  const canGenerate = !isReadOnly && [STATUS_DRAFT, STATUS_GENERATED, STATUS_REJECTED, undefined].includes(status);
  const canUploadSigned = status === STATUS_GENERATED;
  const canSubmit = status === STATUS_SIGNED_UPLOADED;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-[#1e3a5f] shadow-lg">
        <div className="max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-4 md:py-6">
          <Link to={createPageUrl('UserDashboard')}>
            <Button variant="ghost" className="text-white hover:bg-white/10 -ml-2 sm:ml-0">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('backToDashboard')}
            </Button>
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-7 md:py-8">
        <div className="mb-6 sm:mb-8 flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#1e3a5f] mb-1 sm:mb-2">{t('ndaRequestTitle')}</h1>
            <p className="text-sm sm:text-base text-slate-600">{t('ndaRequestSubtitle')}</p>
          </div>
          {ndaRequest && <StatusBadge status={status} />}
        </div>

        {status === STATUS_SUBMITTED && (
          <div className="mb-4 p-3 sm:p-4 rounded-md bg-amber-50 border border-amber-200 text-amber-900 text-sm">
            {t('ndaSubmittedHint')}
          </div>
        )}
        {status === STATUS_ACCEPTED && (
          <div className="mb-4 p-3 sm:p-4 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm">
            {t('ndaAcceptedHint')}
          </div>
        )}
        {status === STATUS_REJECTED && (
          <div className="mb-4 p-3 sm:p-4 rounded-md bg-red-50 border border-red-200 text-red-900 text-sm">
            <div className="font-semibold mb-1">{t('ndaRejectedHint')}</div>
            {lastRejection?.comment && (
              <div className="mt-1">
                <span className="font-medium">{t('ndaRejectCommentLabel')}:</span> {lastRejection.comment}
              </div>
            )}
          </div>
        )}

        <Card className="mb-6">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-lg sm:text-xl">{t('partnerInformation')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-4 sm:p-6 pt-0 sm:pt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="effective_date">{t('effectiveDateLabel')}</Label>
                <Input
                  id="effective_date"
                  type="date"
                  value={formData.effective_date}
                  onChange={(e) => handleChange('effective_date', e.target.value)}
                  disabled={isReadOnly}
                />
              </div>
              <div>
                <Label htmlFor="partner_inn">{t('partnerRegNumberLabel')}</Label>
                <Input
                  id="partner_inn"
                  value={formData.partner_inn}
                  onChange={(e) => handleChange('partner_inn', e.target.value)}
                  disabled={isReadOnly}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="partner_name_en">{t('partnerNameEnLabel')} *</Label>
              <Input
                id="partner_name_en"
                value={formData.partner_name_en}
                onChange={(e) => handleChange('partner_name_en', e.target.value)}
                disabled={isReadOnly}
              />
            </div>

            <div>
              <Label htmlFor="partner_country_en">{t('partnerCountryEn')}</Label>
              <Input
                id="partner_country_en"
                value={formData.partner_country_en}
                onChange={(e) => handleChange('partner_country_en', e.target.value)}
                disabled={isReadOnly}
              />
            </div>

            <div>
              <Label htmlFor="partner_address_en">{t('partnerAddressEnLabel')} *</Label>
              <Input
                id="partner_address_en"
                value={formData.partner_address_en}
                onChange={(e) => handleChange('partner_address_en', e.target.value)}
                disabled={isReadOnly}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="partner_signatory_en">{t('partnerSignatoryEn')} *</Label>
                <Input
                  id="partner_signatory_en"
                  value={formData.partner_signatory_en}
                  onChange={(e) => handleChange('partner_signatory_en', e.target.value)}
                  disabled={isReadOnly}
                />
              </div>
              <div>
                <Label htmlFor="partner_signatory_title_en">{t('partnerSignatoryTitleEn')}</Label>
                <Input
                  id="partner_signatory_title_en"
                  value={formData.partner_signatory_title_en}
                  onChange={(e) => handleChange('partner_signatory_title_en', e.target.value)}
                  disabled={isReadOnly}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="partner_contact_name">{t('contactNameLabel')}</Label>
                <Input
                  id="partner_contact_name"
                  value={formData.partner_contact_name}
                  onChange={(e) => handleChange('partner_contact_name', e.target.value)}
                  disabled={isReadOnly}
                />
              </div>
              <div>
                <Label htmlFor="partner_contact_email">{t('contactEmailLabel')}</Label>
                <Input
                  id="partner_contact_email"
                  type="email"
                  value={formData.partner_contact_email}
                  onChange={(e) => handleChange('partner_contact_email', e.target.value)}
                  disabled={isReadOnly}
                />
              </div>
              <div>
                <Label htmlFor="partner_contact_phone">{t('contactPhoneLabel')}</Label>
                <Input
                  id="partner_contact_phone"
                  value={formData.partner_contact_phone}
                  onChange={(e) => handleChange('partner_contact_phone', e.target.value)}
                  disabled={isReadOnly}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="paper_copy"
                checked={!!formData.paper_copy_required}
                onCheckedChange={(checked) => handleChange('paper_copy_required', checked)}
                disabled={isReadOnly}
              />
              <label htmlFor="paper_copy" className="text-sm">
                {t('paperCopyRequired')}
              </label>
            </div>
          </CardContent>
        </Card>

        {ndaRequest?.generated_file_url && (
          <Card className="mb-6">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-lg sm:text-xl">{t('generatedNdaTitle')}</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
              <a href={ndaRequest.generated_file_url} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="w-full sm:w-auto">
                  <Download className="w-4 h-4 mr-2" />
                  {t('downloadGeneratedNda')}
                </Button>
              </a>
            </CardContent>
          </Card>
        )}

        {(canUploadSigned || ndaRequest?.signed_file_url) && (
          <Card className="mb-6">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-lg sm:text-xl">{t('uploadSignedNdaTitle')}</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
              {canUploadSigned && (
                <>
                  <p className="text-xs sm:text-sm text-slate-600 mb-3">{t('ndaUploadSignedHelp')}</p>
                  <label>
                    <input
                      type="file"
                      onChange={(e) => handleFileUpload(e.target.files?.[0])}
                      className="hidden"
                      accept=".pdf,.doc,.docx"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      disabled={uploading}
                      onClick={(e) => e.currentTarget.previousElementSibling?.click()}
                      className="w-full sm:w-auto"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {uploading ? t('uploading') : t('uploadSignedNdaBtnLabel')}
                    </Button>
                  </label>
                </>
              )}
              {ndaRequest?.signed_file_url && (
                <div className={canUploadSigned ? 'mt-3' : ''}>
                  <a href={ndaRequest.signed_file_url} target="_blank" rel="noopener noreferrer">
                    <Button size="sm" variant="outline" className="w-full sm:w-auto">
                      <Download className="w-4 h-4 mr-2" />
                      {t('viewUploadedNda')}
                    </Button>
                  </a>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3">
          {!isReadOnly && (
            <Button
              variant="outline"
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending}
              className="w-full sm:w-auto"
            >
              {t('saveProgressLabel')}
            </Button>
          )}
          {canGenerate && (
            <Button
              variant="outline"
              onClick={() => generateMutation.mutate()}
              disabled={generateMutation.isPending}
              className="w-full sm:w-auto"
            >
              <FileText className="w-4 h-4 mr-2" />
              {status === STATUS_GENERATED ? t('ndaRegenerateBtn') : t('ndaGenerateBtn')}
            </Button>
          )}
          {canSubmit && (
            <Button
              onClick={() => submitMutation.mutate()}
              disabled={submitMutation.isPending}
              className="w-full sm:w-auto bg-[#1e3a5f] hover:bg-[#152a45]"
            >
              <Send className="w-4 h-4 mr-2" />
              {t('ndaSubmitFinalBtn')}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
