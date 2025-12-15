import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Code, Zap, Headphones, CheckCircle, ArrowRight,
  FileCode, Blocks, Terminal
} from 'lucide-react';

import PublicHeader from '@/components/public/PublicHeader';
import PublicFooter from '@/components/public/PublicFooter';

export default function GTransAPIIntegration() {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('gtrans_language') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('gtrans_language', language);
  }, [language]);

  const benefits = [
    {
      icon: Zap,
      title: language === 'en' ? 'Increase Efficiency' : 'Tingkatkan Efisiensi',
      description: language === 'en' 
        ? 'Use tools you\'re already familiar with. Integrate GTrans directly into your existing workflows and business systems.'
        : 'Gunakan alat yang sudah Anda kenal. Integrasikan GTrans langsung ke dalam alur kerja dan sistem bisnis yang ada.'
    },
    {
      icon: Blocks,
      title: language === 'en' ? 'Eliminate Workflow Gaps' : 'Hilangkan Kesenjangan Alur Kerja',
      description: language === 'en'
        ? 'Seamless, in-house integration means no manual data entry, no context switching, and no delays.'
        : 'Integrasi internal yang mulus berarti tidak ada entri data manual, tidak ada perpindahan konteks, dan tidak ada penundaan.'
    },
    {
      icon: Headphones,
      title: language === 'en' ? 'Dedicated Support' : 'Dukungan Khusus',
      description: language === 'en'
        ? 'Get dedicated support from our tech team to bring your solution to life. We work with you every step of the way.'
        : 'Dapatkan dukungan khusus dari tim teknologi kami untuk mewujudkan solusi Anda. Kami bekerja dengan Anda di setiap langkah.'
    }
  ];

  const features = [
    language === 'en' ? 'RESTful API with comprehensive documentation' : 'RESTful API dengan dokumentasi lengkap',
    language === 'en' ? 'Real-time order status webhooks' : 'Webhook status pesanan real-time',
    language === 'en' ? 'Secure authentication with API keys' : 'Autentikasi aman dengan API key',
    language === 'en' ? 'Multi-currency support across all endpoints' : 'Dukungan multi-mata uang di semua endpoint',
    language === 'en' ? 'Sandbox environment for testing' : 'Lingkungan sandbox untuk pengujian',
    language === 'en' ? 'Rate limiting and usage monitoring' : 'Pembatasan kecepatan dan pemantauan penggunaan'
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <PublicHeader language={language} setLanguage={setLanguage} />
      
      <main className="pt-24 pb-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1e3a5f]/10 text-[#1e3a5f] text-sm font-medium mb-6">
              <Code className="w-4 h-4" />
              {language === 'en' ? 'API Integration' : 'Integrasi API'}
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-[#1e3a5f] mb-6">
              {language === 'en' ? 'Connect Your Business Directly' : 'Hubungkan Bisnis Anda Langsung'}
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              {language === 'en'
                ? 'A customized solution built for your workflows. Integrate GTrans directly into your platform for seamless cross-border payments.'
                : 'Solusi yang disesuaikan untuk alur kerja Anda. Integrasikan GTrans langsung ke dalam platform Anda untuk pembayaran lintas batas yang mulus.'
              }
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {benefits.map((benefit, idx) => (
              <Card key={idx} className="border-slate-200">
                <CardContent className="p-8">
                  <div className="w-14 h-14 rounded-xl bg-[#1e3a5f]/10 flex items-center justify-center mb-6">
                    <benefit.icon className="w-7 h-7 text-[#1e3a5f]" />
                  </div>
                  <h3 className="text-xl font-bold text-[#1e3a5f] mb-4">{benefit.title}</h3>
                  <p className="text-slate-600">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="border-slate-200 mb-16">
            <CardContent className="p-8">
              <div className="flex items-start gap-6">
                <div className="w-14 h-14 rounded-xl bg-[#f5a623]/20 flex items-center justify-center flex-shrink-0">
                  <Terminal className="w-7 h-7 text-[#f5a623]" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-[#1e3a5f] mb-4">
                    {language === 'en' ? 'API Features' : 'Fitur API'}
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                        <span className="text-slate-600">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#1e3a5f]/30 bg-[#1e3a5f]/5">
            <CardContent className="p-8">
              <div className="flex items-start gap-6">
                <div className="w-14 h-14 rounded-xl bg-[#1e3a5f]/20 flex items-center justify-center flex-shrink-0">
                  <FileCode className="w-7 h-7 text-[#1e3a5f]" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-[#1e3a5f] mb-3">
                    {language === 'en' ? 'Access Full API Documentation' : 'Akses Dokumentasi API Lengkap'}
                  </h3>
                  <p className="text-slate-600 mb-6">
                    {language === 'en'
                      ? 'Complete API documentation, code examples, and integration guides are available to onboarded clients. Contact our sales team to begin the onboarding process and receive API credentials.'
                      : 'Dokumentasi API lengkap, contoh kode, dan panduan integrasi tersedia untuk klien yang telah onboard. Hubungi tim sales kami untuk memulai proses onboarding dan menerima kredensial API.'
                    }
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <Link to={createPageUrl('GTransContactSales')}>
                      <Button className="bg-[#1e3a5f] hover:bg-[#152a45]">
                        {language === 'en' ? 'Contact Sales' : 'Hubungi Sales'}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                    <Link to={createPageUrl('GTransDocumentation')}>
                      <Button variant="outline" className="border-slate-300">
                        {language === 'en' ? 'View General Documentation' : 'Lihat Dokumentasi Umum'}
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <PublicFooter language={language} setLanguage={setLanguage} />
    </div>
  );
}