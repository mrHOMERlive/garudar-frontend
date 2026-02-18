import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, FileText, CheckCircle, Database, Globe, LogOut, User, FileCheck, Shield, FileSignature } from 'lucide-react';

const modules = [
  {
    title: 'Clients',
    description: 'Manage client accounts',
    icon: Users,
    page: 'StaffClients',
    color: 'bg-[#1e3a5f]'
  },
  {
    title: 'Active Orders',
    description: 'View and process active orders',
    icon: FileText,
    page: 'StaffActiveOrders',
    color: 'bg-[#f5a623]'
  },
  {
    title: 'Executed Orders',
    description: 'View completed orders',
    icon: CheckCircle,
    page: 'StaffExecutedOrders',
    color: 'bg-emerald-600'
  },
  {
    title: 'Payeer Accounts',
    description: 'Manage payer accounts by currency',
    icon: Database,
    page: 'StaffPayeerAccounts',
    color: 'bg-[#1e3a5f]'
  },
  {
    title: 'KYC Database',
    description: 'Know Your Customer verification',
    icon: Users,
    page: 'StaffKYC',
    color: 'bg-[#f5a623]'
  },
  {
    title: 'KYC Onboarding Queue',
    description: 'Review client KYC submissions',
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
                  <span className="text-xs bg-[#f5a623] px-2 py-1 rounded text-white font-medium">STAFF</span>
                </div>
                <p className="text-slate-300 text-sm">Manage orders, clients, and operations</p>
              </div>
            </Link>
            <div className="flex items-center gap-4">
              {user && (
                <div className="flex items-center gap-2 text-white">
                  <User className="w-4 h-4" />
                  <span className="text-sm">{user.username}</span>
                </div>
              )}
              <Link to={createPageUrl('GTrans')}>
                <Button className="bg-white text-[#1e3a5f] hover:bg-slate-100">
                  <Globe className="w-4 h-4 mr-2" />
                  Public Site
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
          <h2 className="text-xl font-bold text-slate-700 mb-6">Administration</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {administrationModules.map((module) => (
              <Link key={module.page} to={createPageUrl(module.page)}>
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
            ))}
          </div>
        </div>

        {/* Orders Section */}
        <div>
          <h2 className="text-xl font-bold text-slate-700 mb-6">Orders</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {ordersModules.map((module) => (
              <Link key={module.page} to={createPageUrl(module.page)}>
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
            ))}
          </div>
        </div>

        {/* KYC Section */}
        <div>
          <h2 className="text-xl font-bold text-slate-700 mb-6">KYC</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link to={createPageUrl('StaffKYC')}>
              <Card className="bg-white border-slate-200 hover:border-[#1e3a5f] hover:shadow-lg transition-all cursor-pointer h-full">
                <CardHeader>
                  <div className="w-12 h-12 bg-[#f5a623] rounded-lg flex items-center justify-center mb-3">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-[#1e3a5f]">KYC Database</CardTitle>
                  <CardDescription className="text-slate-500">Know Your Customer verification database</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          </div>
        </div>

        {/* Requests Section */}
        <div>
          <h2 className="text-xl font-bold text-slate-700 mb-6">Requests</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link to={createPageUrl('StaffKYCQueue')}>
              <Card className="bg-white border-slate-200 hover:border-[#1e3a5f] hover:shadow-lg transition-all cursor-pointer h-full">
                <CardHeader>
                  <div className="w-12 h-12 bg-emerald-600 rounded-lg flex items-center justify-center mb-3">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-[#1e3a5f]">KYC Onboarding Queue</CardTitle>
                  <CardDescription className="text-slate-500">Review client KYC submissions</CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link to={createPageUrl('StaffServiceAgreement')}>
              <Card className="bg-white border-slate-200 hover:border-[#1e3a5f] hover:shadow-lg transition-all cursor-pointer h-full">
                <CardHeader>
                  <div className="w-12 h-12 bg-[#1e3a5f] rounded-lg flex items-center justify-center mb-3">
                    <FileSignature className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-[#1e3a5f]">Service Agreement</CardTitle>
                  <CardDescription className="text-slate-500">Manage master documents and client submissions</CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link to={createPageUrl('StaffClientRequests')}>
              <Card className="bg-white border-slate-200 hover:border-[#1e3a5f] hover:shadow-lg transition-all cursor-pointer h-full">
                <CardHeader>
                  <div className="w-12 h-12 bg-slate-600 rounded-lg flex items-center justify-center mb-3">
                    <FileCheck className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-[#1e3a5f]">Manage Badges</CardTitle>
                  <CardDescription className="text-slate-500">Account status, KYC, and Service Agreement badges</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}