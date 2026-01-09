import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
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

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: client, isLoading: clientLoading } = useQuery({
    queryKey: ['currentClient', user?.email],
    queryFn: async () => {
      const clients = await base44.entities.Client.filter({ email: user.email });
      if (clients[0]) return clients[0];
      
      // Auto-create client for testing
      const newClient = await base44.entities.Client.create({
        client_id: `CLI-${Date.now()}`,
        name: user.full_name || user.email,
        email: user.email,
        login: user.email,
        password: 'temp123',
        kyc_status: 'created',
        nda_status: 'not_started'
      });
      return newClient;
    },
    enabled: !!user
  });

  const { data: kycProfile } = useQuery({
    queryKey: ['kycProfile', client?.id],
    queryFn: async () => {
      const profiles = await base44.entities.OnboardingKYC.filter({ client_id: client.id });
      return profiles[0];
    },
    enabled: !!client
  });

  const { data: ubos = [] } = useQuery({
    queryKey: ['ubos', kycProfile?.id],
    queryFn: () => base44.entities.KYC_UBO.filter({ kyc_profile_id: kycProfile.id }),
    enabled: !!kycProfile
  });

  const [formData, setFormData] = useState({});

  const createKYCMutation = useMutation({
    mutationFn: async (data) => {
      if (kycProfile) {
        return await base44.entities.OnboardingKYC.update(kycProfile.id, data);
      } else {
        return await base44.entities.OnboardingKYC.create({ ...data, client_id: client.id });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['kycProfile']);
      toast.success('Progress saved');
    }
  });

  const submitKYCMutation = useMutation({
    mutationFn: async () => {
      await base44.entities.OnboardingKYC.update(kycProfile.id, {
        status: 'submitted',
        submitted_at: new Date().toISOString()
      });
      await base44.entities.Client.update(client.id, {
        kyc_status: 'submitted',
        kyc_submitted_at: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['kycProfile']);
      queryClient.invalidateQueries(['currentClient']);
      toast.success('KYC submitted for review!');
    }
  });

  const handleFormChange = (updates) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const handleSaveProgress = () => {
    createKYCMutation.mutate({ ...kycProfile, ...formData });
  };

  const handleSubmit = () => {
    if (!kycProfile) {
      toast.error('Please save progress first');
      return;
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
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                idx === currentStep
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
              formData={{ ...kycProfile, ...formData }}
              onChange={handleFormChange}
              ubos={ubos}
              kycProfileId={kycProfile?.id}
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
              disabled={createKYCMutation.isPending}
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
                disabled={submitKYCMutation.isPending || !kycProfile}
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