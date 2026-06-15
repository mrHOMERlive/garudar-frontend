import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Landmark, Settings } from 'lucide-react';
import OpsHeader from '@/components/ops/OpsHeader';

const modules = [
  {
    title: 'Payment Orders',
    description: 'Upload source files (GPB / VTB / SPB), review and fix rows, export bank TXT',
    icon: FileText,
    page: 'OpsBatches',
    color: 'bg-[#1e3a5f]',
  },
  {
    title: 'Bank Statements',
    description: 'Upload Mandiri / VTB statements, categorize transactions, match order IDs',
    icon: Landmark,
    page: 'OpsStatements',
    color: 'bg-[#f5a623]',
  },
  {
    title: 'Settings',
    description: 'Companies and debit accounts, invoice thresholds, counterparties, BIC reference',
    icon: Settings,
    page: 'OpsSettings',
    color: 'bg-emerald-600',
  },
];

export default function OpsDashboard() {
  return (
    <div className="min-h-screen bg-slate-50">
      <OpsHeader title="Operations" subtitle="Payment orders workbench" showBack={false} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-xl font-bold text-slate-700 mb-6">Modules</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
