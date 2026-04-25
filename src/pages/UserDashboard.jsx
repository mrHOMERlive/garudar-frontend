import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/api/apiClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import {
  PlusCircle,
  FileText,
  History,
  Globe,
  LogOut,
  User,
  CheckCircle,
  XCircle,
  FileCheck,
  Shield,
  AlertCircle,
  Menu,
} from 'lucide-react';
import LanguageSwitcher from '@/components/common/LanguageSwitcher';
import { t } from '@/components/utils/language';
import { Badge } from '@/components/ui/badge';
import ProfileDrawer from '@/components/user/ProfileDrawer';

export default function UserDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate(createPageUrl('GTransLogin'));
  };

  const openProfile = () => {
    setMobileMenuOpen(false);
    setProfileOpen(true);
  };

  const { data: client } = useQuery({
    queryKey: ['currentClient', user?.email],
    queryFn: async () => {
      try {
        return await apiClient.getMyClient();
      } catch {
        return null;
      }
    },
    enabled: !!user,
  });

  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ['all-orders'],
    queryFn: () => apiClient.getOrders({ include_deleted: true }),
    enabled: !!user,
  });

  const { data: clientBadges = [] } = useQuery({
    queryKey: ['client-badges', client?.client_id],
    queryFn: () => apiClient.getClientBadges(client.client_id),
    enabled: !!client?.client_id,
  });

  const kycApproved = client?.kyc_status === 'approved';
  const accountActive = client?.account_status !== 'hold';
  const canCreateOrders = accountActive;

  const stats = {
    total: orders.length,
    current: orders.filter(
      (o) =>
        !o.deleted &&
        !o.executed &&
        o.status !== 'canceled' &&
        o.status !== 'client_canceled' &&
        o.status !== 'released'
    ).length,
    executed: orders.filter((o) => o.executed || o.status === 'released').length,
    cancelled: orders.filter((o) => (o.status === 'canceled' || o.status === 'client_canceled') && !o.deleted).length,
    deleted: orders.filter((o) => o.deleted).length,
    labels: {
      total: t('totalOrders'),
      current: t('currentOrders'),
      executed: t('executed'),
      cancelled: t('cancelled'),
      deleted: t('deleted'),
    },
  };

  const modules = [
    {
      title: t('createOrder'),
      description: !accountActive ? t('accountOnHold') : t('initiateFundTransfer'),
      icon: PlusCircle,
      page: 'CreateOrder',
      color: 'bg-[#1e3a5f]',
      disabled: !canCreateOrders,
      holdMessage: !accountActive ? client?.account_hold_reason : null,
    },
    {
      title: t('currentOrders'),
      description: t('viewActiveOrders'),
      icon: FileText,
      page: 'CurrentOrders',
      color: 'bg-[#f5a623]',
    },
    {
      title: t('executedOrders'),
      description: t('viewCompletedOrders'),
      icon: CheckCircle,
      page: 'ExecutedOrders',
      color: 'bg-emerald-600',
    },
    {
      title: t('cancelledOrders'),
      description: t('viewCancelledOrders'),
      icon: XCircle,
      page: 'CancelledOrders',
      color: 'bg-red-600',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-[#1e3a5f] border-b border-[#1e3a5f]/20 shadow-lg">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-5 md:py-6">
          <div className="flex items-center justify-between gap-2">
            <Link
              to={createPageUrl('UserDashboard')}
              className="flex items-center gap-2 sm:gap-3 md:gap-4 min-w-0 flex-1"
            >
              <div className="w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-white rounded-lg sm:rounded-xl flex items-center justify-center p-2 sm:p-3 shadow-lg flex-shrink-0">
                <img src="/gan.png" alt="Logo" className="w-full h-full object-contain" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                  <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-white">GTrans</h1>
                  <span className="text-[10px] sm:text-xs bg-emerald-500 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-white font-medium whitespace-nowrap">
                    {t('clientDashboard')}
                  </span>
                </div>
                <p className="text-slate-300 text-xs sm:text-sm truncate hidden lg:block">
                  {t('manageYourFundTransfers')}
                </p>
              </div>
            </Link>

            {/* Desktop actions (≥md) */}
            <div className="hidden md:flex items-center gap-2 lg:gap-4 flex-shrink-0 min-w-0">
              <LanguageSwitcher variant="ghost" />
              {user && (
                <div className="hidden lg:flex items-center gap-2 text-white max-w-[140px]">
                  <span className="text-sm truncate">{user.username}</span>
                </div>
              )}
              <Button className="bg-white text-[#1e3a5f] hover:bg-slate-100" onClick={() => setProfileOpen(true)}>
                <User className="w-4 h-4 mr-2" />
                {t('myProfile')}
              </Button>
              <Button onClick={handleLogout} variant="outline" className="bg-white text-[#1e3a5f] hover:bg-slate-100">
                <LogOut className="w-4 h-4 mr-2" />
                {t('logout')}
              </Button>
            </div>

            {/* Mobile hamburger (<md) */}
            <div className="md:hidden flex items-center gap-1 flex-shrink-0">
              <LanguageSwitcher variant="ghost" />
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/10 h-9 w-9"
                    aria-label="Open menu"
                  >
                    <Menu className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-full sm:max-w-sm">
                  <SheetHeader>
                    <SheetTitle>{t('myProfile')}</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6 space-y-4">
                    {user && (
                      <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                        <div className="w-10 h-10 rounded-full bg-[#1e3a5f] text-white flex items-center justify-center font-semibold">
                          {user.username?.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium text-slate-900 truncate">{user.username}</div>
                          {user.email && <div className="text-xs text-slate-500 truncate">{user.email}</div>}
                        </div>
                      </div>
                    )}
                    <Button
                      onClick={openProfile}
                      className="w-full justify-start bg-[#1e3a5f] hover:bg-[#152a45] text-white"
                    >
                      <User className="w-4 h-4 mr-2" />
                      {t('myProfile')}
                    </Button>
                    <Button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        handleLogout();
                      }}
                      variant="outline"
                      className="w-full justify-start"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      {t('logout')}
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-7 md:py-8">
        {/* Order Statistics */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-3 md:gap-4 mb-6 sm:mb-8">
          <Card className="bg-white border-slate-200">
            <CardContent className="pt-4 sm:pt-6 px-3 sm:px-6 pb-3 sm:pb-6">
              <div className="text-2xl sm:text-3xl font-bold text-[#1e3a5f]">{ordersLoading ? '—' : stats.total}</div>
              <div className="text-xs sm:text-sm text-slate-600 mt-0.5 sm:mt-1">{stats.labels.total}</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-slate-200">
            <CardContent className="pt-4 sm:pt-6 px-3 sm:px-6 pb-3 sm:pb-6">
              <div className="text-2xl sm:text-3xl font-bold text-[#f5a623]">{ordersLoading ? '—' : stats.current}</div>
              <div className="text-xs sm:text-sm text-slate-600 mt-0.5 sm:mt-1">{stats.labels.current}</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-slate-200">
            <CardContent className="pt-4 sm:pt-6 px-3 sm:px-6 pb-3 sm:pb-6">
              <div className="text-2xl sm:text-3xl font-bold text-emerald-600">
                {ordersLoading ? '—' : stats.executed}
              </div>
              <div className="text-xs sm:text-sm text-slate-600 mt-0.5 sm:mt-1">{stats.labels.executed}</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-slate-200">
            <CardContent className="pt-4 sm:pt-6 px-3 sm:px-6 pb-3 sm:pb-6">
              <div className="text-2xl sm:text-3xl font-bold text-red-600">{ordersLoading ? '—' : stats.cancelled}</div>
              <div className="text-xs sm:text-sm text-slate-600 mt-0.5 sm:mt-1">{stats.labels.cancelled}</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-slate-200 col-span-2 sm:col-span-1">
            <CardContent className="pt-4 sm:pt-6 px-3 sm:px-6 pb-3 sm:pb-6">
              <div className="text-2xl sm:text-3xl font-bold text-slate-600">{ordersLoading ? '—' : stats.deleted}</div>
              <div className="text-xs sm:text-sm text-slate-600 mt-0.5 sm:mt-1">{stats.labels.deleted}</div>
            </CardContent>
          </Card>
        </div>

        {!accountActive && (
          <Card className="bg-red-50 border-red-200 mb-6 sm:mb-8">
            <CardContent className="flex items-start sm:items-center gap-3 sm:gap-4 pt-5 sm:pt-6 px-4 sm:px-6">
              <AlertCircle className="w-7 h-7 sm:w-8 sm:h-8 text-red-600 flex-shrink-0 mt-0.5 sm:mt-0" />
              <div className="min-w-0">
                <h3 className="text-base sm:text-lg font-semibold text-red-900">{t('accountOnHoldTitle')}</h3>
                <p className="text-sm text-red-700">{t('accountOnHoldMessage')}</p>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6 mb-8 sm:mb-12">
          {modules
            .filter((m) => !['ExecutedOrders', 'CancelledOrders'].includes(m.page))
            .map((module) =>
              module.disabled ? (
                <Card
                  key={module.page + module.title}
                  className="bg-slate-100 border-slate-300 opacity-60 cursor-not-allowed h-full"
                >
                  <CardHeader className="p-4 sm:p-6">
                    <div
                      className={`w-10 h-10 sm:w-12 sm:h-12 ${module.color} rounded-lg flex items-center justify-center mb-2 sm:mb-3 opacity-50`}
                    >
                      <module.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <CardTitle className="text-slate-500 text-base sm:text-lg">{module.title}</CardTitle>
                    <CardDescription className="text-slate-400 text-xs sm:text-sm">
                      {module.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              ) : (
                <Link key={module.page + module.title} to={createPageUrl(module.page)}>
                  <Card className="bg-white border-slate-200 hover:border-[#1e3a5f] hover:shadow-lg transition-all cursor-pointer h-full">
                    <CardHeader className="p-4 sm:p-6">
                      <div
                        className={`w-10 h-10 sm:w-12 sm:h-12 ${module.color} rounded-lg flex items-center justify-center mb-2 sm:mb-3`}
                      >
                        <module.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      </div>
                      <CardTitle className="text-[#1e3a5f] text-base sm:text-lg">{module.title}</CardTitle>
                      <CardDescription className="text-slate-500 text-xs sm:text-sm">
                        {module.description}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              )
            )}
        </div>

        <div className="border-t border-slate-200 pt-6 sm:pt-8">
          <h2 className="text-base sm:text-lg font-semibold text-slate-600 mb-3 sm:mb-4">{t('history')}</h2>
          <div className="mb-5 sm:mb-6">
            {modules
              .filter((m) => m.page === 'ExecutedOrders')
              .map((module) => (
                <Link key={module.page + module.title} to={createPageUrl(module.page)}>
                  <Card className="bg-white border-slate-200 hover:border-[#1e3a5f] hover:shadow-lg transition-all cursor-pointer">
                    <CardHeader className="p-4 sm:p-6">
                      <div
                        className={`w-10 h-10 sm:w-12 sm:h-12 ${module.color} rounded-lg flex items-center justify-center mb-2 sm:mb-3`}
                      >
                        <module.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      </div>
                      <CardTitle className="text-[#1e3a5f] text-base sm:text-lg">{module.title}</CardTitle>
                      <CardDescription className="text-slate-500 text-xs sm:text-sm">
                        {module.description}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              ))}
          </div>

          <div className="flex flex-wrap gap-3 sm:gap-4 text-sm">
            {modules
              .filter((m) => ['CancelledOrders'].includes(m.page))
              .map((module) => (
                <Link key={module.page + module.title} to={createPageUrl(module.page)}>
                  <div className="flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors">
                    <module.icon className="w-3.5 h-3.5" />
                    <span className="underline">{module.title}</span>
                  </div>
                </Link>
              ))}
          </div>
        </div>

        <div className="border-t border-slate-200 pt-6 sm:pt-8 mt-6 sm:mt-8">
          <h2 className="text-lg sm:text-xl font-bold text-slate-700 mb-4 sm:mb-6">{t('requestsFromGTrans')}</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {/* KYC Request */}
            {(() => {
              const kycBadge = clientBadges.find((b) => b.badge_type === 'kyc');
              if (!kycBadge?.is_active) return null;

              const kycStatus = client?.kyc_status;
              const needsAttention =
                kycStatus === 'needs_fix' ||
                kycStatus === 'in_progress' ||
                kycStatus === 'created' ||
                kycStatus === 'rejected';

              return (
                <Link to={createPageUrl('ClientKYC')}>
                  <div
                    className={`relative rounded-xl p-4 sm:p-6 border transition-all hover:shadow-md group h-full ${needsAttention ? 'bg-red-50 border-red-300' : 'bg-white border-slate-200 hover:border-slate-300'}`}
                  >
                    {needsAttention && (
                      <div className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full animate-pulse" />
                    )}
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div
                        className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${needsAttention ? 'bg-red-100 group-hover:bg-red-200' : 'bg-slate-100 group-hover:bg-slate-200'}`}
                      >
                        <FileCheck className="w-5 h-5 sm:w-6 sm:h-6 text-slate-700" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-slate-900 mb-1 text-sm sm:text-base">
                          {t('kycVerification')}
                        </div>
                        <div className="text-xs sm:text-sm text-slate-600">
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
              const serviceAgreementBadge = clientBadges.find((b) => b.badge_type === 'service_agreement');
              if (!serviceAgreementBadge?.is_active) return null;

              return (
                <Link to={createPageUrl('ClientServiceAgreement')}>
                  <div className="bg-white rounded-xl p-4 sm:p-6 border border-slate-200 transition-all hover:border-slate-300 hover:shadow-md group h-full">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-slate-200 transition-colors">
                        <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-slate-700" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-slate-900 mb-1 text-sm sm:text-base">
                          {t('serviceAgreement')}
                        </div>
                        {serviceAgreementBadge?.staff_comment && (
                          <div className="text-xs sm:text-sm text-slate-600 break-words">
                            {serviceAgreementBadge.staff_comment}
                          </div>
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

      <ProfileDrawer open={profileOpen} onClose={() => setProfileOpen(false)} />
    </div>
  );
}
