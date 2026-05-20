import React, { useEffect, useState } from 'react';
import { apiClient } from '@/api/apiClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { ArrowLeft, Send, Download, Upload, FileText, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { t } from '@/components/utils/language';

/**
 * ClientServiceAgreement — English-only end-to-end Service Agreement flow.
 *
 * Workflow (см. backend `app/routers/service_agreement.py`):
 *   DRAFT → GENERATED → SIGNED_UPLOADED → SUBMITTED → ACCEPTED / REJECTED
 *
 * Реквизиты PT GAN — hardcoded в шаблоне DOCX. В форме клиент заполняет
 * только данные своей компании, которые подставляются в плейсхолдеры.
 */

const STATUS_DRAFT = 'draft';
const STATUS_GENERATED = 'generated';
const STATUS_SIGNED_UPLOADED = 'signed_uploaded';
const STATUS_SUBMITTED = 'submitted';
const STATUS_ACCEPTED = 'accepted';
const STATUS_REJECTED = 'rejected';

function StatusBadge({ status }) {
  const map = {
    [STATUS_DRAFT]: { cls: 'bg-slate-200 text-slate-800', label: t('saStatusDraft'), icon: FileText },
    [STATUS_GENERATED]: { cls: 'bg-blue-100 text-blue-800', label: t('saStatusGenerated'), icon: FileText },
    [STATUS_SIGNED_UPLOADED]: {
      cls: 'bg-indigo-100 text-indigo-800',
      label: t('saStatusSignedUploaded'),
      icon: Upload,
    },
    [STATUS_SUBMITTED]: { cls: 'bg-amber-100 text-amber-900', label: t('saStatusSubmitted'), icon: Clock },
    [STATUS_ACCEPTED]: { cls: 'bg-emerald-100 text-emerald-900', label: t('saStatusAccepted'), icon: CheckCircle2 },
    [STATUS_REJECTED]: { cls: 'bg-red-100 text-red-800', label: t('saStatusRejected'), icon: XCircle },
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

export default function ClientServiceAgreement() {
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

  const { data: saRequest } = useQuery({
    queryKey: ['saRequest', client?.client_id],
    queryFn: async () => {
      const requests = await apiClient.listServiceAgreementRequests(client.client_id);
      return requests[0];
    },
    enabled: !!client,
  });

  const { data: history } = useQuery({
    queryKey: ['saHistory', saRequest?.id],
    queryFn: async () => apiClient.getServiceAgreementHistory(saRequest.id),
    enabled: !!saRequest,
  });

  const [formData, setFormData] = useState({
    effective_date: '',
    company_name: '',
    country: '',
    address: '',
    signatory_name: '',
    signatory_title: '',
    registration_number: '',
    tax_id: '',
    contact_email: '',
    contact_phone: '',
    term: '',
  });

  useEffect(() => {
    if (saRequest) {
      setFormData({
        effective_date: saRequest.effective_date || '',
        company_name: saRequest.company_name || '',
        country: saRequest.country || '',
        address: saRequest.address || '',
        signatory_name: saRequest.signatory_name || '',
        signatory_title: saRequest.signatory_title || '',
        registration_number: saRequest.registration_number || '',
        tax_id: saRequest.tax_id || '',
        contact_email: saRequest.contact_email || '',
        contact_phone: saRequest.contact_phone || '',
        term: saRequest.term || '',
      });
    } else if (client) {
      // Префилл из карточки клиента, если SA-заявка ещё не создана.
      // Облегчает первое заполнение — клиент видит свои данные, а не пустые поля.
      setFormData((prev) => ({
        ...prev,
        company_name: prev.company_name || client.client_name || '',
        country: prev.country || client.client_reg_country || '',
        registration_number: prev.registration_number || client.client_reg_number || '',
        signatory_name: prev.signatory_name || client.client_director || '',
        contact_email: prev.contact_email || client.client_mail || '',
      }));
    }
  }, [saRequest, client]);

  const status = saRequest?.status || STATUS_DRAFT;
  const isReadOnly = [STATUS_SIGNED_UPLOADED, STATUS_SUBMITTED, STATUS_ACCEPTED].includes(status);
  const lastRejection = (history || [])
    .slice()
    .reverse()
    .find((h) => h.new_status === STATUS_REJECTED);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (saRequest) {
        return apiClient.updateServiceAgreementRequest(saRequest.id, formData);
      }
      return apiClient.createServiceAgreementRequest(formData, client.client_id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['saRequest']);
      toast.success(t('saInformationSavedToast'));
    },
  });

  const generateMutation = useMutation({
    mutationFn: async () => {
      const saved = saRequest
        ? await apiClient.updateServiceAgreementRequest(saRequest.id, formData)
        : await apiClient.createServiceAgreementRequest(formData, client.client_id);
      return apiClient.generateServiceAgreementRequest(saved.id);
    },
    onSuccess: (resp) => {
      queryClient.invalidateQueries(['saRequest']);
      queryClient.invalidateQueries(['saHistory']);
      toast.success(t('saGeneratedSuccessToast'));
      if (resp?.generated_file_url) {
        window.open(resp.generated_file_url, '_blank', 'noopener,noreferrer');
      }
    },
    onError: (e) => {
      toast.error(`${t('failedGenerateSaToast')}: ${e?.message || ''}`.trim());
    },
  });

  const submitMutation = useMutation({
    mutationFn: async () => apiClient.submitServiceAgreementRequest(saRequest.id),
    onSuccess: () => {
      queryClient.invalidateQueries(['saRequest']);
      queryClient.invalidateQueries(['saHistory']);
      queryClient.invalidateQueries(['currentClient']);
      toast.success(t('saSubmittedForReviewToast'));
    },
  });

  const handleFileUpload = async (file) => {
    if (!file || !saRequest) return;
    setUploading(true);
    try {
      await apiClient.uploadSignedServiceAgreement(saRequest.id, file);
      queryClient.invalidateQueries(['saRequest']);
      queryClient.invalidateQueries(['saHistory']);
      toast.success(t('signedSaUploadSuccessToast'));
    } catch (err) {
      toast.error(`${t('failedToUploadDocumentToast')}: ${err?.message || ''}`);
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
            <h1 className="text-2xl sm:text-3xl font-bold text-[#1e3a5f] mb-1 sm:mb-2">{t('saRequestTitle')}</h1>
            <p className="text-sm sm:text-base text-slate-600">{t('saRequestSubtitle')}</p>
          </div>
          {saRequest && <StatusBadge status={status} />}
        </div>

        {status === STATUS_SUBMITTED && (
          <div className="mb-4 p-3 sm:p-4 rounded-md bg-amber-50 border border-amber-200 text-amber-900 text-sm">
            {t('saSubmittedHint')}
          </div>
        )}
        {status === STATUS_ACCEPTED && (
          <div className="mb-4 p-3 sm:p-4 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm">
            {t('saAcceptedHint')}
          </div>
        )}
        {status === STATUS_REJECTED && (
          <div className="mb-4 p-3 sm:p-4 rounded-md bg-red-50 border border-red-200 text-red-900 text-sm">
            <div className="font-semibold mb-1">{t('saRejectedHint')}</div>
            {lastRejection?.comment && (
              <div className="mt-1">
                <span className="font-medium">{t('saRejectCommentLabel')}:</span> {lastRejection.comment}
              </div>
            )}
          </div>
        )}

        <Card className="mb-6">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-lg sm:text-xl">{t('saCompanyInformation')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-4 sm:p-6 pt-0 sm:pt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="effective_date">{t('effectiveDateLabel')} *</Label>
                <Input
                  id="effective_date"
                  type="date"
                  value={formData.effective_date}
                  onChange={(e) => handleChange('effective_date', e.target.value)}
                  disabled={isReadOnly}
                />
              </div>
              <div>
                <Label htmlFor="term">{t('saTermLabel')}</Label>
                <Input
                  id="term"
                  value={formData.term}
                  onChange={(e) => handleChange('term', e.target.value)}
                  disabled={isReadOnly}
                  placeholder={t('saTermPlaceholder')}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="company_name">{t('saCompanyNameLabel')} *</Label>
              <Input
                id="company_name"
                value={formData.company_name}
                onChange={(e) => handleChange('company_name', e.target.value)}
                disabled={isReadOnly}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="country">{t('saCountryLabel')} *</Label>
                <Input
                  id="country"
                  value={formData.country}
                  onChange={(e) => handleChange('country', e.target.value)}
                  disabled={isReadOnly}
                />
              </div>
              <div>
                <Label htmlFor="registration_number">{t('saRegNumberLabel')}</Label>
                <Input
                  id="registration_number"
                  value={formData.registration_number}
                  onChange={(e) => handleChange('registration_number', e.target.value)}
                  disabled={isReadOnly}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="address">{t('saAddressLabel')} *</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                disabled={isReadOnly}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="signatory_name">{t('saSignatoryNameLabel')} *</Label>
                <Input
                  id="signatory_name"
                  value={formData.signatory_name}
                  onChange={(e) => handleChange('signatory_name', e.target.value)}
                  disabled={isReadOnly}
                />
              </div>
              <div>
                <Label htmlFor="signatory_title">{t('saSignatoryTitleLabel')}</Label>
                <Input
                  id="signatory_title"
                  value={formData.signatory_title}
                  onChange={(e) => handleChange('signatory_title', e.target.value)}
                  disabled={isReadOnly}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="tax_id">{t('saTaxIdLabel')}</Label>
                <Input
                  id="tax_id"
                  value={formData.tax_id}
                  onChange={(e) => handleChange('tax_id', e.target.value)}
                  disabled={isReadOnly}
                />
              </div>
              <div>
                <Label htmlFor="contact_email">{t('contactEmailLabel')}</Label>
                <Input
                  id="contact_email"
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) => handleChange('contact_email', e.target.value)}
                  disabled={isReadOnly}
                />
              </div>
              <div>
                <Label htmlFor="contact_phone">{t('contactPhoneLabel')}</Label>
                <Input
                  id="contact_phone"
                  value={formData.contact_phone}
                  onChange={(e) => handleChange('contact_phone', e.target.value)}
                  disabled={isReadOnly}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {saRequest?.generated_file_url && (
          <Card className="mb-6">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-lg sm:text-xl">{t('generatedSaTitle')}</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
              <a href={saRequest.generated_file_url} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="w-full sm:w-auto">
                  <Download className="w-4 h-4 mr-2" />
                  {t('downloadGeneratedSa')}
                </Button>
              </a>
            </CardContent>
          </Card>
        )}

        {(canUploadSigned || saRequest?.signed_file_url) && (
          <Card className="mb-6">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-lg sm:text-xl">{t('uploadSignedSaTitle')}</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
              {canUploadSigned && (
                <>
                  <p className="text-xs sm:text-sm text-slate-600 mb-3">{t('saUploadSignedHelp')}</p>
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
                      {uploading ? t('uploading') : t('uploadSignedSaBtnLabel')}
                    </Button>
                  </label>
                </>
              )}
              {saRequest?.signed_file_url && (
                <div className={canUploadSigned ? 'mt-3' : ''}>
                  <a href={saRequest.signed_file_url} target="_blank" rel="noopener noreferrer">
                    <Button size="sm" variant="outline" className="w-full sm:w-auto">
                      <Download className="w-4 h-4 mr-2" />
                      {t('viewUploadedSa')}
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
              {status === STATUS_GENERATED ? t('saRegenerateBtn') : t('saGenerateBtn')}
            </Button>
          )}
          {canSubmit && (
            <Button
              onClick={() => submitMutation.mutate()}
              disabled={submitMutation.isPending}
              className="w-full sm:w-auto bg-[#1e3a5f] hover:bg-[#152a45]"
            >
              <Send className="w-4 h-4 mr-2" />
              {t('saSubmitFinalBtn')}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
