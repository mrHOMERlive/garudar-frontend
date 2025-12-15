import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, FileText, CheckCircle, Database, Globe, LogOut } from 'lucide-react';

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
  }
];

export default function StaffDashboard() {
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
                    <Link to={createPageUrl('GTrans')}>
                      <Button className="bg-white text-[#1e3a5f] hover:bg-slate-100">
                        <Globe className="w-4 h-4 mr-2" />
                        Public Site
                      </Button>
                    </Link>
                  </div>
                </div>
              </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {modules.map((module) => (
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
      </main>
    </div>
  );
}