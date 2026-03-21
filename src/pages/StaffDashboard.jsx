import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, FileText, CheckCircle, Database, Globe, LogOut, User, FileCheck, ShieldCheck, FileSignature, BarChart2 } from 'lucide-react';
import LanguageSwitcher from '@/components/common/LanguageSwitcher';
import { t } from '@/components/utils/language';

const modules = [
  {
    titleKey: 'mod_clients_title',
    descKey: 'mod_clients_desc',
    icon: Users,
    page: 'StaffClients',
    color: 'bg-[#1e3a5f]'
  },
  {
    titleKey: 'mod_activeOrders_title',
    descKey: 'mod_activeOrders_desc',
    icon: FileText,
    page: 'StaffActiveOrders',
    color: 'bg-[#f5a623]'
  },
  {
    titleKey: 'mod_executedOrders_title',
    descKey: 'mod_executedOrders_desc',
    icon: CheckCircle,
    page: 'StaffExecutedOrders',
    color: 'bg-emerald-600'
  },
  {
    titleKey: 'mod_payeerAccounts_title',
    descKey: 'mod_payeerAccounts_desc',
    icon: Database,
    page: 'StaffPayeerAccounts',
    color: 'bg-[#1e3a5f]'
  },
  {
    titleKey: 'mod_kycDatabase_title',
    descKey: 'mod_kycDatabase_desc',
    icon: Users,
    page: 'StaffKYC',
    color: 'bg-[#f5a623]'
  },
  {
    titleKey: 'mod_kycQueue_title',
    descKey: 'mod_kycQueue_desc',
    icon: Users,
    page: 'StaffKYCQueue',
    color: 'bg-emerald-600'
  }
];

export default function StaffDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate(createPageUrl('GTransLogin'));
  };

  const administrationModules = modules.filter(m => ['StaffClients', 'StaffPayeerAccounts'].includes(m.page));
  const ordersModules = modules.filter(m => ['StaffActiveOrders', 'StaffExecutedOrders'].includes(m.page));
  const kycModules = modules.filter(m => ['StaffKYC', 'StaffKYCQueue'].includes(m.page));

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-[#1e3a5f] border-b border-[#1e3a5f]/20 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <Link to={createPageUrl('StaffDashboard')} className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center p-3 shadow-lg">
                <img
                  src="/gan.png"
                  alt="Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-white">GTrans</h1>
                  <span className="text-xs bg-[#f5a623] px-2 py-1 rounded text-white font-medium">{t('staffLabel')}</span>
                </div>
                <p className="text-slate-300 text-sm">{t('staffSubtitle')}</p>
              </div>
            </Link>
            <div className="flex items-center gap-4">
              <LanguageSwitcher />
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
                className="bg-white text-[#1e3a5f] hover:bg-slate-100"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {/* Administration Section */}
        <div>
          <h2 className="text-xl font-bold text-slate-700 mb-6">{t('administrationSection')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {administrationModules.map((module) => (
              <Link key={module.page} to={createPageUrl(module.page)}>
                <Card className="bg-white border-slate-200 hover:border-[#1e3a5f] hover:shadow-lg transition-all cursor-pointer h-full">
                  <CardHeader>
                    <div className={`w-12 h-12 ${module.color} rounded-lg flex items-center justify-center mb-3`}>
                      <module.icon className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-[#1e3a5f]">{t(module.titleKey)}</CardTitle>
                    <CardDescription className="text-slate-500">{t(module.descKey)}</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Orders Section */}
        <div>
          <h2 className="text-xl font-bold text-slate-700 mb-6">{t('ordersSection')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {ordersModules.map((module) => (
              <Link key={module.page} to={createPageUrl(module.page)}>
                <Card className="bg-white border-slate-200 hover:border-[#1e3a5f] hover:shadow-lg transition-all cursor-pointer h-full">
                  <CardHeader>
                    <div className={`w-12 h-12 ${module.color} rounded-lg flex items-center justify-center mb-3`}>
                      <module.icon className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-[#1e3a5f]">{t(module.titleKey)}</CardTitle>
                    <CardDescription className="text-slate-500">{t(module.descKey)}</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* KYC & AML Section */}
        <div>
          <h2 className="text-xl font-bold text-slate-700 mb-6">{t('kycSection')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link to={createPageUrl('StaffComplyAdvantage')}>
              <Card className="bg-white border-slate-200 hover:border-[#1e3a5f] hover:shadow-lg transition-all cursor-pointer h-full">
                <CardHeader>
                  <div className="w-12 h-12 bg-emerald-600 rounded-lg flex items-center justify-center mb-3">
                    <ShieldCheck className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-[#1e3a5f]">AML Screening</CardTitle>
                  <CardDescription className="text-slate-500">ComplyAdvantage Mesh — sanctions, PEP & adverse media</CardDescription>
                </CardHeader>
              </Card>
            </Link>
            <Link to={createPageUrl('StaffKYC')}>
              <Card className="bg-white border-slate-200 hover:border-[#1e3a5f] hover:shadow-lg transition-all cursor-pointer h-full">
                <CardHeader>
                  <div className="w-12 h-12 bg-[#f5a623] rounded-lg flex items-center justify-center mb-3">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-[#1e3a5f]">{t('mod_kycDatabase_title')}</CardTitle>
                  <CardDescription className="text-slate-500">{t('mod_kycDatabase_desc')}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          </div>
        </div>

        {/* Reports Section */}
        <div>
          <h2 className="text-xl font-bold text-slate-700 mb-6">{t('reportsSection')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link to={createPageUrl('StaffTransactionReport')}>
              <Card className="bg-white border-slate-200 hover:border-[#1e3a5f] hover:shadow-lg transition-all cursor-pointer h-full">
                <CardHeader>
                  <div className="w-12 h-12 bg-[#1e3a5f] rounded-lg flex items-center justify-center mb-3">
                    <BarChart2 className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-[#1e3a5f]">{t('mod_transactionData_title')}</CardTitle>
                  <CardDescription className="text-slate-500">{t('mod_transactionData_desc')}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
            <Link to={createPageUrl('StaffCustomerReport')}>
              <Card className="bg-white border-slate-200 hover:border-[#1e3a5f] hover:shadow-lg transition-all cursor-pointer h-full">
                <CardHeader>
                  <div className="w-12 h-12 bg-[#f5a623] rounded-lg flex items-center justify-center mb-3">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-[#1e3a5f]">{t('mod_customerData_title')}</CardTitle>
                  <CardDescription className="text-slate-500">{t('mod_customerData_desc')}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          </div>
        </div>

        {/* Requests Section */}
        <div>
          <h2 className="text-xl font-bold text-slate-700 mb-6">{t('requestsSection')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link to={createPageUrl('StaffKYCQueue')}>
              <Card className="bg-white border-slate-200 hover:border-[#1e3a5f] hover:shadow-lg transition-all cursor-pointer h-full">
                <CardHeader>
                  <div className="w-12 h-12 bg-emerald-600 rounded-lg flex items-center justify-center mb-3">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-[#1e3a5f]">{t('mod_kycQueue_title')}</CardTitle>
                  <CardDescription className="text-slate-500">{t('mod_kycQueue_desc')}</CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link to={createPageUrl('StaffServiceAgreement')}>
              <Card className="bg-white border-slate-200 hover:border-[#1e3a5f] hover:shadow-lg transition-all cursor-pointer h-full">
                <CardHeader>
                  <div className="w-12 h-12 bg-[#1e3a5f] rounded-lg flex items-center justify-center mb-3">
                    <FileSignature className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-[#1e3a5f]">{t('mod_serviceAgreement_title')}</CardTitle>
                  <CardDescription className="text-slate-500">{t('mod_serviceAgreement_desc')}</CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link to={createPageUrl('StaffClientRequests')}>
              <Card className="bg-white border-slate-200 hover:border-[#1e3a5f] hover:shadow-lg transition-all cursor-pointer h-full">
                <CardHeader>
                  <div className="w-12 h-12 bg-slate-600 rounded-lg flex items-center justify-center mb-3">
                    <FileCheck className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-[#1e3a5f]">{t('mod_manageBadges_title')}</CardTitle>
                  <CardDescription className="text-slate-500">{t('mod_manageBadges_desc')}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}