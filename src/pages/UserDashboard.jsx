import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/api/apiClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, FileText, History, Globe, LogOut, User, CheckCircle, XCircle, Trash2, FileCheck, Shield, AlertCircle } from 'lucide-react';
import LanguageSwitcher from '@/components/common/LanguageSwitcher';
import { t } from '@/components/utils/language';
import { Badge } from '@/components/ui/badge';

export default function UserDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate(createPageUrl('GTransLogin'));
  };

  const { data: client } = useQuery({
    queryKey: ['currentClient', user?.email],
    queryFn: () => apiClient.getMyClient(),
    enabled: !!user
  });

  const { data: orders = [] } = useQuery({
    queryKey: ['all-orders'],
    queryFn: () => apiClient.getOrders({ include_deleted: true }),
    enabled: !!user
  });

  const { data: clientBadges = [] } = useQuery({
    queryKey: ['client-badges', client?.client_id],
    queryFn: () => apiClient.getClientBadges(client.client_id),
    enabled: !!client?.client_id
  });

  const kycApproved = client?.kyc_status === 'approved';
  const accountActive = client?.account_status !== 'hold';
  const canCreateOrders = accountActive;

  const stats = {
    total: orders.length,
    current: orders.filter(o => !o.deleted && !o.executed && o.status !== 'canceled' && o.status !== 'client_canceled' && o.status !== 'released').length,
    executed: orders.filter(o => o.executed || o.status === 'released').length,
    cancelled: orders.filter(o => (o.status === 'canceled' || o.status === 'client_canceled') && !o.deleted).length,
    deleted: orders.filter(o => o.deleted).length,
    labels: {
      total: t('totalOrders'),
      current: t('currentOrders'),
      executed: t('executed'),
      cancelled: t('cancelled'),
      deleted: t('deleted')
    }
  };

  const modules = [
    {
      title: t('createOrder'),
      description: !accountActive ? t('accountOnHold') : t('initiateFundTransfer'),
      icon: PlusCircle,
      page: 'CreateOrder',
      color: 'bg-[#1e3a5f]',
      disabled: !canCreateOrders,
      holdMessage: !accountActive ? client?.account_hold_reason : null
    },
    {
      title: t('currentOrders'),
      description: t('viewActiveOrders'),
      icon: FileText,
      page: 'CurrentOrders',
      color: 'bg-[#f5a623]'
    },
    {
      title: t('executedOrders'),
      description: t('viewCompletedOrders'),
      icon: CheckCircle,
      page: 'ExecutedOrders',
      color: 'bg-emerald-600'
    },
    {
      title: t('cancelledOrders'),
      description: t('viewCancelledOrders'),
      icon: XCircle,
      page: 'CancelledOrders',
      color: 'bg-red-600'
    },
    {
      title: t('deletedOrders'),
      description: t('viewDeletedOrders'),
      icon: Trash2,
      page: 'DeletedOrders',
      color: 'bg-slate-600'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-[#1e3a5f] border-b border-[#1e3a5f]/20 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <Link to={createPageUrl('UserDashboard')} className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center p-3 shadow-lg">
                <img
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69233f5a9a123941f81322f5/b1a1be267_gan.png"
                  alt="Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-white">GTrans</h1>
                  <span className="text-xs bg-emerald-500 px-2 py-1 rounded text-white font-medium">{t('clientDashboard')}</span>
                </div>
                <p className="text-slate-300 text-sm">{t('manageYourFundTransfers')}</p>
              </div>
            </Link>
            <div className="flex items-center gap-4">
              <LanguageSwitcher variant="ghost" />

              {user && (
                <div className="flex items-center gap-2 text-white">
                  <User className="w-4 h-4" />
                  <span className="text-sm">{user.username}</span>
                </div>
              )}
              <Link to={createPageUrl('GTrans')}>
                <Button className="bg-white text-[#1e3a5f] hover:bg-slate-100">
                  <Globe className="w-4 h-4 mr-2" />
                  {t('publicSite')}
                </Button>
              </Link>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="bg-white text-[#1e3a5f] hover:bg-slate-100"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Order Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Card className="bg-white border-slate-200">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-[#1e3a5f]">{stats.total}</div>
              <div className="text-sm text-slate-600 mt-1">{stats.labels.total}</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-slate-200">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-[#f5a623]">{stats.current}</div>
              <div className="text-sm text-slate-600 mt-1">{stats.labels.current}</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-slate-200">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-emerald-600">{stats.executed}</div>
              <div className="text-sm text-slate-600 mt-1">{stats.labels.executed}</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-slate-200">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-red-600">{stats.cancelled}</div>
              <div className="text-sm text-slate-600 mt-1">{stats.labels.cancelled}</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-slate-200">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-slate-600">{stats.deleted}</div>
              <div className="text-sm text-slate-600 mt-1">{stats.labels.deleted}</div>
            </CardContent>
          </Card>
        </div>

        {!accountActive && (
          <Card className="bg-red-50 border-red-200 mb-8">
            <CardContent className="flex items-center gap-4 pt-6">
              <AlertCircle className="w-8 h-8 text-red-600" />
              <div>
                <h3 className="text-lg font-semibold text-red-900">{t('accountOnHoldTitle')}</h3>
                <p className="text-red-700">{t('accountOnHoldMessage')}</p>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {modules.filter(m => !['ExecutedOrders', 'CancelledOrders', 'DeletedOrders'].includes(m.page)).map((module) => (
            module.disabled ? (
              <Card key={module.page + module.title} className="bg-slate-100 border-slate-300 opacity-60 cursor-not-allowed h-full">
                <CardHeader>
                  <div className={`w-12 h-12 ${module.color} rounded-lg flex items-center justify-center mb-3 opacity-50`}>
                    <module.icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-slate-500">{module.title}</CardTitle>
                  <CardDescription className="text-slate-400">{module.description}</CardDescription>
                </CardHeader>
              </Card>
            ) : (
              <Link key={module.page + module.title} to={createPageUrl(module.page)}>
                <Card className="bg-white border-slate-200 hover:border-[#1e3a5f] hover:shadow-lg transition-all cursor-pointer h-full">
                  <CardHeader>
                    <div className={`w-12 h-12 ${module.color} rounded-lg flex items-center justify-center mb-3`}>
                      <module.icon className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-[#1e3a5f]">{module.title}</CardTitle>
                    <CardDescription className="text-slate-500">{module.description}</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            )
          ))}
        </div>

        <div className="border-t border-slate-200 pt-8">
          <h2 className="text-lg font-semibold text-slate-600 mb-4">{t('history')}</h2>
          <div className="mb-6">
            {modules.filter(m => m.page === 'ExecutedOrders').map((module) => (
              <Link key={module.page + module.title} to={createPageUrl(module.page)}>
                <Card className="bg-white border-slate-200 hover:border-[#1e3a5f] hover:shadow-lg transition-all cursor-pointer">
                  <CardHeader>
                    <div className={`w-12 h-12 ${module.color} rounded-lg flex items-center justify-center mb-3`}>
                      <module.icon className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-[#1e3a5f]">{module.title}</CardTitle>
                    <CardDescription className="text-slate-500">{module.description}</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>

          <div className="flex gap-4 text-sm">
            {modules.filter(m => ['CancelledOrders', 'DeletedOrders'].includes(m.page)).map((module) => (
              <Link key={module.page + module.title} to={createPageUrl(module.page)}>
                <div className="flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors">
                  <module.icon className="w-3.5 h-3.5" />
                  <span className="underline">{module.title}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="border-t border-slate-200 pt-8 mt-8">
          <h2 className="text-xl font-bold text-slate-700 mb-6">{t('requestsFromGTrans')}</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* KYC Request */}
            {(() => {
              const kycBadge = clientBadges.find(b => b.badge_type === 'kyc');
              if (!kycBadge?.is_active) return null;

              const kycStatus = client?.kyc_status;
              const needsAttention = kycStatus === 'needs_fix' || kycStatus === 'in_progress' || kycStatus === 'created' || kycStatus === 'rejected';

              return (
                <Link to={createPageUrl('ClientKYC')}>
                  <div className={`relative rounded-xl p-6 border transition-all hover:shadow-md group h-full ${needsAttention ? 'bg-red-50 border-red-300' : 'bg-white border-slate-200 hover:border-slate-300'}`}>
                    {needsAttention && (
                      <div className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full animate-pulse" />
                    )}
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${needsAttention ? 'bg-red-100 group-hover:bg-red-200' : 'bg-slate-100 group-hover:bg-slate-200'}`}>
                        <FileCheck className="w-6 h-6 text-slate-700" />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-slate-900 mb-1">{t('kycVerification')}</div>
                        <div className="text-sm text-slate-600">
                          {t('kycStatus')} {kycStatus?.replace('_', ' ')}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })()}

            {/* Service Agreement */}
            {(() => {
              const serviceAgreementBadge = clientBadges.find(b => b.badge_type === 'service_agreement');
              if (!serviceAgreementBadge?.is_active) return null;

              return (
                <Link to={createPageUrl('ClientServiceAgreement')}>
                  <div className="bg-white rounded-xl p-6 border border-slate-200 transition-all hover:border-slate-300 hover:shadow-md group h-full">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-slate-200 transition-colors">
                        <FileText className="w-6 h-6 text-slate-700" />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-slate-900 mb-1">{t('serviceAgreement')}</div>
                        {serviceAgreementBadge?.staff_comment && (
                          <div className="text-sm text-slate-600">{serviceAgreementBadge.staff_comment}</div>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })()}
          </div>
        </div>
      </main>
    </div>
  );
}