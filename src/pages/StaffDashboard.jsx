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
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69233f5a9a123941f81322f5/b1a1be267_gan.png"
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
            {kycModules.map((module) => (
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

        {/* Client Requests Management Section */}
        <div className="mt-12">
          <h2 className="text-xl font-bold text-slate-800 mb-6">Client Requests Management</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-white border-slate-200 hover:border-[#1e3a5f] hover:shadow-lg transition-all cursor-pointer h-full opacity-60">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-3">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-[#1e3a5f]">Platform Usage Terms</CardTitle>
                <CardDescription className="text-slate-500">Manage terms & conditions</CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-white border-slate-200 hover:border-[#1e3a5f] hover:shadow-lg transition-all cursor-pointer h-full opacity-60">
              <CardHeader>
                <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center mb-3">
                  <FileSignature className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-[#1e3a5f]">Service Agreement</CardTitle>
                <CardDescription className="text-slate-500">Manage service agreements</CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-white border-slate-200 hover:border-[#1e3a5f] hover:shadow-lg transition-all cursor-pointer h-full opacity-60">
              <CardHeader>
                <div className="w-12 h-12 bg-cyan-600 rounded-lg flex items-center justify-center mb-3">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-[#1e3a5f]">Privacy Policy</CardTitle>
                <CardDescription className="text-slate-500">Manage privacy policies</CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-white border-slate-200 hover:border-[#1e3a5f] hover:shadow-lg transition-all cursor-pointer h-full opacity-60">
              <CardHeader>
                <div className="w-12 h-12 bg-teal-600 rounded-lg flex items-center justify-center mb-3">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-[#1e3a5f]">Data Processing Agreement</CardTitle>
                <CardDescription className="text-slate-500">Manage DPAs</CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-white border-slate-200 hover:border-[#1e3a5f] hover:shadow-lg transition-all cursor-pointer h-full opacity-60">
              <CardHeader>
                <div className="w-12 h-12 bg-emerald-600 rounded-lg flex items-center justify-center mb-3">
                  <FileCheck className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-[#1e3a5f]">Service Level Agreement</CardTitle>
                <CardDescription className="text-slate-500">Manage SLAs</CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-white border-slate-200 hover:border-[#1e3a5f] hover:shadow-lg transition-all cursor-pointer h-full opacity-60">
              <CardHeader>
                <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center mb-3">
                  <FileSignature className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-[#1e3a5f]">Other Request for Signing</CardTitle>
                <CardDescription className="text-slate-500">Custom signing requests</CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-white border-slate-200 hover:border-[#1e3a5f] hover:shadow-lg transition-all cursor-pointer h-full opacity-60">
              <CardHeader>
                <div className="w-12 h-12 bg-amber-600 rounded-lg flex items-center justify-center mb-3">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-[#1e3a5f]">Other Request to Submit</CardTitle>
                <CardDescription className="text-slate-500">Custom submission requests</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}