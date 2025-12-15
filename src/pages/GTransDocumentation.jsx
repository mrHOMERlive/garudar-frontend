import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  FileText, Shield, Globe, ArrowRight, Workflow, HelpCircle,
  CheckCircle, Lock, Download, Eye, FileCheck
} from 'lucide-react';

import PublicHeader from '@/components/public/PublicHeader';
import PublicFooter from '@/components/public/PublicFooter';

export default function GTransDocumentation() {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('gtrans_language') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('gtrans_language', language);
  }, [language]);

  const sections = [
    {
      icon: Shield,
      title: language === 'en' ? 'Regulatory Framework' : 'Kerangka Regulasi',
      description: language === 'en'
        ? "GTrans operates under Bank Indonesia's Payment Service Provider (PSP) licensing framework for remittance services."
        : 'GTrans beroperasi di bawah kerangka lisensi Payment Service Provider (PSP) Bank Indonesia untuk layanan remitansi.',
      items: [
        language === 'en' ? 'Licensed under BI PSP remittance framework' : 'Berlisensi di bawah kerangka remitansi PSP BI',
        language === 'en' ? 'Capital adequacy requirements met' : 'Persyaratan kecukupan modal terpenuhi',
        language === 'en' ? 'Risk management controls in place' : 'Kontrol manajemen risiko telah diterapkan',
        language === 'en' ? 'Technology and security compliance' : 'Kepatuhan teknologi dan keamanan'
      ]
    },
    {
      icon: Globe,
      title: language === 'en' ? 'Supported Currencies' : 'Mata Uang yang Didukung',
      description: language === 'en'
        ? 'GTrans supports 19+ currencies for cross-border transactions with competitive exchange rates.'
        : 'GTrans mendukung 19+ mata uang untuk transaksi lintas batas dengan kurs yang kompetitif.',
      items: [
        'AUD, CAD, CHF, DKK, EUR, GBP, JPY',
        'MYR, NOK, NZD, SAR, THB, SEK, SGD',
        'USD, HKD, CNY, IDR'
      ]
    }
  ];

  const resources = [
    {
      icon: Workflow,
      title: language === 'en' ? 'Work Scheme' : 'Skema Kerja',
      description: language === 'en' ? 'Understand our core funds-flow structure' : 'Pahami struktur aliran dana inti kami',
      href: createPageUrl('GTransWorkScheme')
    },
    {
      icon: HelpCircle,
      title: 'FAQ',
      description: language === 'en' ? 'Frequently asked questions' : 'Pertanyaan yang sering diajukan',
      href: createPageUrl('GTransFAQ')
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <PublicHeader language={language} setLanguage={setLanguage} />
      
      <main className="pt-24 pb-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1e3a5f]/10 text-[#1e3a5f] text-sm font-medium mb-6">
              <FileText className="w-4 h-4" />
              {language === 'en' ? 'Documentation' : 'Dokumentasi'}
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-[#1e3a5f] mb-6">
              {language === 'en' ? 'GTrans Documentation' : 'Dokumentasi GTrans'}
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              {language === 'en'
                ? 'Overview of our regulatory framework, supported currencies, and service capabilities. Detailed API documentation is available to onboarded clients.'
                : 'Gambaran umum kerangka regulasi kami, mata uang yang didukung, dan kemampuan layanan. Dokumentasi API detail tersedia untuk klien yang telah onboard.'
              }
            </p>
          </div>

          <Card className="border-[#f5a623]/30 bg-[#f5a623]/5 mb-12">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-[#f5a623]/20 flex items-center justify-center flex-shrink-0">
                  <Lock className="w-5 h-5 text-[#f5a623]" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800 mb-2">
                    {language === 'en' ? 'Full Documentation Access' : 'Akses Dokumentasi Lengkap'}
                  </h3>
                  <p className="text-slate-600 mb-4">
                    {language === 'en'
                      ? 'Complete API documentation, integration guides, and technical specifications are available to onboarded clients. Contact sales to begin the onboarding process.'
                      : 'Dokumentasi API lengkap, panduan integrasi, dan spesifikasi teknis tersedia untuk klien yang telah onboard. Hubungi sales untuk memulai proses onboarding.'
                    }
                  </p>
                  <Link to={createPageUrl('GTransContactSales')}>
                    <Button className="bg-[#1e3a5f] hover:bg-[#152a45]">
                      {language === 'en' ? 'Contact Sales' : 'Hubungi Sales'}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-8 mb-16">
            {sections.map((section, idx) => (
              <Card key={idx} className="border-slate-200">
                <CardContent className="p-8">
                  <div className="flex items-start gap-6">
                    <div className="w-14 h-14 rounded-xl bg-[#1e3a5f]/10 flex items-center justify-center flex-shrink-0">
                      <section.icon className="w-7 h-7 text-[#1e3a5f]" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl font-bold text-[#1e3a5f] mb-3">{section.title}</h2>
                      <p className="text-slate-600 mb-6">{section.description}</p>
                      <ul className="grid md:grid-cols-2 gap-3">
                        {section.items.map((item, itemIdx) => (
                          <li key={itemIdx} className="flex items-center gap-2 text-slate-700">
                            <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <h2 className="text-2xl font-bold text-[#1e3a5f] mb-6">
            {language === 'en' ? 'Related Resources' : 'Sumber Daya Terkait'}
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {resources.map((resource, idx) => (
              <Link key={idx} to={resource.href}>
                <Card className="border-slate-200 hover:border-[#1e3a5f]/30 hover:shadow-lg transition-all h-full">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-[#1e3a5f]/10 flex items-center justify-center">
                        <resource.icon className="w-6 h-6 text-[#1e3a5f]" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-[#1e3a5f]">{resource.title}</h3>
                        <p className="text-sm text-slate-500">{resource.description}</p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-slate-400" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </main>

      <PublicFooter language={language} setLanguage={setLanguage} />
    </div>
  );
}