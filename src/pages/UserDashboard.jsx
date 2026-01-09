import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/api/apiClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, FileText, History, Globe, LogOut, User, CheckCircle, XCircle, Trash2, FileCheck } from 'lucide-react';

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

  const kycApproved = client?.kyc_status === 'approved';

  const stats = {
    total: orders.length,
    current: orders.filter(o => !o.deleted && !o.executed && o.status !== 'canceled' && o.status !== 'released').length,
    executed: orders.filter(o => o.executed || o.status === 'released').length,
    cancelled: orders.filter(o => o.status === 'canceled' && !o.deleted).length,
    deleted: orders.filter(o => o.deleted).length
  };

  const modules = [
    {
      title: 'Create Order',
      description: kycApproved ? 'Initiate new fund transfer' : 'Complete KYC to create orders',
      icon: PlusCircle,
      page: 'CreateOrder',
      color: 'bg-[#1e3a5f]',
      disabled: !kycApproved
    },
    {
      title: 'Current Orders',
      description: 'View active orders in progress',
      icon: FileText,
      page: 'CurrentOrders',
      color: 'bg-[#f5a623]'
    },
    {
      title: 'Executed Orders',
      description: 'View completed orders',
      icon: CheckCircle,
      page: 'ExecutedOrders',
      color: 'bg-emerald-600'
    },
    {
      title: 'Cancelled Orders',
      description: 'View cancelled orders',
      icon: XCircle,
      page: 'CancelledOrders',
      color: 'bg-red-600'
    },
    {
      title: 'Deleted Orders',
      description: 'View deleted orders',
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
                  <span className="text-xs bg-emerald-500 px-2 py-1 rounded text-white font-medium">CLIENT</span>
                </div>
                <p className="text-slate-300 text-sm">Manage your fund transfers</p>
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
              <div className="text-sm text-slate-600 mt-1">Total Orders</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-slate-200">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-[#f5a623]">{stats.current}</div>
              <div className="text-sm text-slate-600 mt-1">Current Orders</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-slate-200">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-emerald-600">{stats.executed}</div>
              <div className="text-sm text-slate-600 mt-1">Executed</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-slate-200">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-red-600">{stats.cancelled}</div>
              <div className="text-sm text-slate-600 mt-1">Cancelled</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-slate-200">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-slate-600">{stats.deleted}</div>
              <div className="text-sm text-slate-600 mt-1">Deleted</div>
            </CardContent>
          </Card>
        </div>

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
          <h2 className="text-xl font-bold text-slate-700 mb-6">History</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {modules.filter(m => ['ExecutedOrders', 'CancelledOrders', 'DeletedOrders'].includes(m.page)).map((module) => (
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
            ))}
          </div>
        </div>

        <div className="border-t border-slate-200 pt-8 mt-8">
          <h2 className="text-xl font-bold text-slate-700 mb-6">Requests from GTrans</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link to={createPageUrl('ClientKYC')}>
              <Card className={`bg-white border-slate-200 hover:border-[#1e3a5f] hover:shadow-lg transition-all cursor-pointer h-full ${client?.kyc_status !== 'approved' ? 'border-amber-300 bg-amber-50' : ''}`}>
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-3 ${client?.kyc_status !== 'approved' ? 'bg-amber-600' : 'bg-blue-600'}`}>
                    <FileCheck className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-[#1e3a5f]">KYC</CardTitle>
                  <CardDescription className="text-slate-500">
                    {client?.kyc_status !== 'approved' ? (
                      <span className="text-amber-700 font-medium">Status: {client?.kyc_status?.replace('_', ' ').toUpperCase()}</span>
                    ) : (
                      'Complete KYC verification'
                    )}
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Card className="bg-white border-slate-200 hover:border-[#1e3a5f] hover:shadow-lg transition-all cursor-pointer h-full opacity-60">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-3">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-[#1e3a5f]">Platform Usage Terms</CardTitle>
                <CardDescription className="text-slate-500">Review and accept terms</CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-white border-slate-200 hover:border-[#1e3a5f] hover:shadow-lg transition-all cursor-pointer h-full opacity-60">
              <CardHeader>
                <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center mb-3">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-[#1e3a5f]">Service Agreement</CardTitle>
                <CardDescription className="text-slate-500">Sign service agreement</CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-white border-slate-200 hover:border-[#1e3a5f] hover:shadow-lg transition-all cursor-pointer h-full opacity-60">
              <CardHeader>
                <div className="w-12 h-12 bg-cyan-600 rounded-lg flex items-center justify-center mb-3">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-[#1e3a5f]">Privacy Policy</CardTitle>
                <CardDescription className="text-slate-500">Review privacy policy</CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-white border-slate-200 hover:border-[#1e3a5f] hover:shadow-lg transition-all cursor-pointer h-full opacity-60">
              <CardHeader>
                <div className="w-12 h-12 bg-teal-600 rounded-lg flex items-center justify-center mb-3">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-[#1e3a5f]">Data Processing Agreement</CardTitle>
                <CardDescription className="text-slate-500">Sign DPA</CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-white border-slate-200 hover:border-[#1e3a5f] hover:shadow-lg transition-all cursor-pointer h-full opacity-60">
              <CardHeader>
                <div className="w-12 h-12 bg-emerald-600 rounded-lg flex items-center justify-center mb-3">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-[#1e3a5f]">Service Level Agreement</CardTitle>
                <CardDescription className="text-slate-500">Review SLA</CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-white border-slate-200 hover:border-[#1e3a5f] hover:shadow-lg transition-all cursor-pointer h-full opacity-60">
              <CardHeader>
                <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center mb-3">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-[#1e3a5f]">Other Request for Signing</CardTitle>
                <CardDescription className="text-slate-500">Additional documents to sign</CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-white border-slate-200 hover:border-[#1e3a5f] hover:shadow-lg transition-all cursor-pointer h-full opacity-60">
              <CardHeader>
                <div className="w-12 h-12 bg-amber-600 rounded-lg flex items-center justify-center mb-3">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-[#1e3a5f]">Other Request to Submit</CardTitle>
                <CardDescription className="text-slate-500">Additional submissions required</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}