import React, { useState } from 'react';
// client import
import { apiClient } from '@/api/apiClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { ArrowLeft, Send, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import KYCCorporateDetails from '../components/kyc/KYCCorporateDetails';
import KYCDocuments from '../components/kyc/KYCDocuments';
import KYCBankingDetails from '../components/kyc/KYCBankingDetails';
import KYCOwnership from '../components/kyc/KYCOwnership';
import KYCDeclaration from '../components/kyc/KYCDeclaration';

export default function ClientKYC() {
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(0);
  const [language, setLanguage] = useState('en');

  // 1. Get Current User
  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => apiClient.getCurrentUser()
  });

  // 2. Get Current Client
  const { data: client, isLoading: clientLoading } = useQuery({
    queryKey: ['currentClient', user?.email],
    queryFn: async () => {
      // Try to get existing client linked to user
      try {
        const myClient = await apiClient.getMyClient();
        return myClient;
      } catch (e) {
        // If not found, creating a new one might be part of registration flow, 
        // but here we assume client exists or we just fail gracefully.
        // For migration safety, if 404, we might redirect or show error.
        console.error("Client fetch error", e);
        return null;
      }
    },
    enabled: !!user
  });

  // 3. Get KYC Profile
  const { data: kycData, isLoading: kycLoading } = useQuery({
    queryKey: ['kycProfile', client?.client_id],
    queryFn: async () => {
      try {
        const response = await apiClient.getKycProfile(client.client_id);
        // Response wrapper: { profile_id, data: { corporate: {}, banking: {}, declaration: {} }, ... }
        // We need to flatten this or adapt components to use structured data
        // For simpler migration, let's flatten 'data' into formData equivalent
        const { data } = response;
        return {
          profile_id: response.profile_id,
          status: response.status,
          submitted_at: response.submitted_at,
          // Merge all sections for the monolithic formData state used by components
          ...data.corporate,
          ...data.banking,
          ...data.declaration,
          declaration_confirmed: data.declaration?.declaration_confirmed
        };
      } catch (err) {
        // If 404 (profile not found), return empty object to initialize form
        return {};
      }
    },
    enabled: !!client?.client_id // client_id needed
  });

  // 4. Get UBOs
  const { data: ubos = [] } = useQuery({
    queryKey: ['ubos', client?.client_id],
    queryFn: () => apiClient.listUbos(client.client_id),
    enabled: !!client?.client_id
  });

  const [formData, setFormData] = useState({});

  // Effect to populate formData when kycData loads
  React.useEffect(() => {
    if (kycData) {
      setFormData(prev => ({ ...prev, ...kycData }));
    }
  }, [kycData]);

  const saveKYCMutation = useMutation({
    mutationFn: async (dataToSave) => {
      // Based on the user-provided spec:
      // The endpoint accepts a flat JSON with partial updates.
      // No 'data' wrapper, no nested 'corporate'/'banking' objects.
      const payload = {
        // Corporate
        company_name: dataToSave.company_name, // Note: Spec snippet didn't list this, but form has it. Keeping it.
        trading_name: dataToSave.trading_name,
        incorporation_date: dataToSave.incorporation_date,
        incorporation_country: dataToSave.incorporation_country,
        registered_address: dataToSave.registered_address,
        tax_id: dataToSave.tax_id,
        registration_number: dataToSave.registration_number,
        telephone: dataToSave.telephone,
        website: dataToSave.website,

        // Banking
        principal_bankers: dataToSave.principal_bankers,
        swift_bic: dataToSave.swift_bic,
        bank_branch_address: dataToSave.bank_branch_address,
        bank_city_country: dataToSave.bank_city_country,
        bank_account_name: dataToSave.bank_account_name,
        bank_account_currency: dataToSave.bank_account_currency,
        bank_account_number: dataToSave.bank_account_number,
        bank_manager_contact: dataToSave.bank_manager_contact,

        // Declaration
        declaration_confirmed: dataToSave.declaration_confirmed,
        authorized_person_name: dataToSave.authorized_person_name,
        signature_date: dataToSave.signature_date,
        authorized_person_position: dataToSave.authorized_person_position,
        signature_location: dataToSave.signature_location,
        signed_kyc_document_url: dataToSave.signed_kyc_document_url
      };

      console.log('Sending KYC Update Payload:', payload);

      return await apiClient.updateKycProfile(client.client_id, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['kycProfile']);
      toast.success('Progress saved');
    },
    onError: (err) => {
      toast.error('Failed to save: ' + err.message);
    }
  });

  const submitKYCMutation = useMutation({
    mutationFn: async () => {
      await apiClient.submitKyc(client.client_id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['kycProfile']);
      queryClient.invalidateQueries(['currentClient']);
      toast.success('KYC submitted for review!');
    },
    onError: (err) => {
      toast.error('Failed to submit: ' + err.message);
    }
  });

  const handleFormChange = (updates) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const handleSaveProgress = () => {
    // Merge current kycData with local formData state
    saveKYCMutation.mutate({ ...kycData, ...formData });
  };

  const handleSubmit = () => {
    if (!kycData?.profile_id && !saveKYCMutation.isSuccess) {
      // Try to save first if not saved yet (simplified logic)
      handleSaveProgress();
      // ideally we wait for save then submit, but for now let's just warn
      toast.info('Saving changes first...');
    }
    submitKYCMutation.mutate();
  };

  const steps = [
    {
      title: language === 'en' ? 'Corporate Details' : 'Detail Perusahaan',
      component: KYCCorporateDetails
    },
    {
      title: language === 'en' ? 'Documents' : 'Dokumen',
      component: KYCDocuments
    },
    {
      title: language === 'en' ? 'Banking Details' : 'Detail Perbankan',
      component: KYCBankingDetails
    },
    {
      title: language === 'en' ? 'Ownership' : 'Kepemilikan',
      component: KYCOwnership
    },
    {
      title: language === 'en' ? 'Declaration & Signature' : 'Deklarasi & Tanda Tangan',
      component: KYCDeclaration
    }
  ];

  const CurrentStepComponent = steps[currentStep].component;

  if (userLoading || clientLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#1e3a5f] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-slate-600">Client not found. Please contact support.</p>
          <Link to={createPageUrl('UserDashboard')}>
            <Button className="mt-4">Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  const statusConfig = {
    created: { icon: Clock, color: 'text-slate-500', bg: 'bg-slate-50', text: 'Not Started' },
    in_progress: { icon: Clock, color: 'text-blue-500', bg: 'bg-blue-50', text: 'In Progress' },
    submitted: { icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50', text: 'Under Review' },
    approved: { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50', text: 'Approved' },
    rejected: { icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-50', text: 'Rejected' }
  };

  const status = statusConfig[client.kyc_status] || statusConfig.created;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-[#1e3a5f] shadow-lg">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <Link to={createPageUrl('UserDashboard')}>
              <Button variant="ghost" className="text-white hover:bg-white/10">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${status.bg}`}>
              <status.icon className={`w-5 h-5 ${status.color}`} />
              <span className={`font-semibold ${status.color}`}>{status.text}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-[#1e3a5f] mb-2">
                {language === 'en' ? 'KYC Verification' : 'Verifikasi KYC'}
              </h1>
              <p className="text-slate-600">
                {language === 'en'
                  ? 'Complete your Know Your Customer verification'
                  : 'Lengkapi verifikasi Know Your Customer Anda'}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant={language === 'en' ? 'default' : 'outline'}
                onClick={() => setLanguage('en')}
                className={language === 'en' ? 'bg-[#1e3a5f]' : ''}
              >
                English
              </Button>
              <Button
                variant={language === 'id' ? 'default' : 'outline'}
                onClick={() => setLanguage('id')}
                className={language === 'id' ? 'bg-[#1e3a5f]' : ''}
              >
                Bahasa
              </Button>
            </div>
          </div>
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {steps.map((step, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentStep(idx)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all ${idx === currentStep
                ? 'bg-[#1e3a5f] text-white'
                : 'bg-white text-slate-600 hover:bg-slate-100'
                }`}
            >
              {idx + 1}. {step.title}
            </button>
          ))}
        </div>

        <Card>
          <CardContent className="pt-6">
            <CurrentStepComponent
              formData={formData}
              onChange={handleFormChange}
              ubos={ubos}
              clientId={client?.client_id}
              kycProfileId={kycData?.profile_id}
              language={language}
            />
          </CardContent>
        </Card>

        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
          >
            {language === 'en' ? 'Previous' : 'Sebelumnya'}
          </Button>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleSaveProgress}
              disabled={saveKYCMutation.isPending}
            >
              {language === 'en' ? 'Save Progress' : 'Simpan Progres'}
            </Button>

            {currentStep < steps.length - 1 ? (
              <Button
                onClick={() => setCurrentStep(currentStep + 1)}
                className="bg-[#1e3a5f] hover:bg-[#152a45]"
              >
                {language === 'en' ? 'Next' : 'Selanjutnya'}
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={submitKYCMutation.isPending || (!kycData?.profile_id && !saveKYCMutation.isSuccess)}
                className="bg-green-600 hover:bg-green-700"
              >
                <Send className="w-4 h-4 mr-2" />
                {language === 'en' ? 'Submit KYC' : 'Kirim KYC'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}