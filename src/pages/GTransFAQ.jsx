import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ChevronDown, HelpCircle, ArrowRight, Globe, Shield, 
  AlertTriangle, Search
} from 'lucide-react';
import { cn } from "@/lib/utils";

import PublicHeader from '@/components/public/PublicHeader';
import PublicFooter from '@/components/public/PublicFooter';

const DEFAULT_FAQS = {
  currencies: [
    {
      question_en: 'What currencies does GTrans support?',
      question_id: 'Mata uang apa saja yang didukung GTrans?',
      answer_en: 'GTrans supports 19+ currencies including: AUD, CAD, CHF, DKK, EUR, GBP, JPY, MYR, NOK, NZD, SAR, THB, SEK, SGD, USD, HKD, CNY, and IDR.',
      answer_id: 'GTrans mendukung 19+ mata uang termasuk: AUD, CAD, CHF, DKK, EUR, GBP, JPY, MYR, NOK, NZD, SAR, THB, SEK, SGD, USD, HKD, CNY, dan IDR.'
    },
    {
      question_en: 'Can I transfer without FX conversion?',
      question_id: 'Bisakah saya transfer tanpa konversi FX?',
      answer_en: 'Yes, GTrans supports same-currency transfers where the original currency is delivered directly to beneficiaries holding accounts in that currency, without any FX conversion or spread.',
      answer_id: 'Ya, GTrans mendukung transfer mata uang yang sama di mana mata uang asli dikirimkan langsung ke penerima yang memiliki rekening dalam mata uang tersebut, tanpa konversi FX atau spread.'
    }
  ],
  risk_management: [
    {
      question_en: 'What KYC/KYB requirements apply?',
      question_id: 'Persyaratan KYC/KYB apa yang berlaku?',
      answer_en: 'All corporate clients must complete our KYC/KYB process which includes company registration documents, beneficial ownership information, authorized signatories, and source of funds documentation.',
      answer_id: 'Semua klien korporat harus menyelesaikan proses KYC/KYB kami yang mencakup dokumen pendaftaran perusahaan, informasi kepemilikan benefisial, penandatangan yang berwenang, dan dokumentasi sumber dana.'
    }
  ],
  general: [
    {
      question_en: 'How long does a transfer take?',
      question_id: 'Berapa lama waktu yang dibutuhkan untuk transfer?',
      answer_en: 'Transfer times vary depending on the currency pair, destination country, and banking networks involved. Most transfers are completed within 1-3 business days.',
      answer_id: 'Waktu transfer bervariasi tergantung pada pasangan mata uang, negara tujuan, dan jaringan perbankan yang terlibat. Sebagian besar transfer diselesaikan dalam 1-3 hari kerja.'
    },
    {
      question_en: 'How do I get started with GTrans?',
      question_id: 'Bagaimana cara memulai dengan GTrans?',
      answer_en: 'Contact our sales team, receive and complete KYC/KYB documentation, submit corporate documents for review, sign the Service Agreement, and receive access credentials.',
      answer_id: 'Hubungi tim sales kami, terima dan lengkapi dokumentasi KYC/KYB, kirim dokumen perusahaan untuk ditinjau, tandatangani Perjanjian Layanan, dan terima kredensial akses.'
    }
  ]
};

const CATEGORY_CONFIG = {
  currencies: {
    icon: Globe,
    label_en: 'Currencies',
    label_id: 'Mata Uang',
    color: 'bg-emerald-100 text-emerald-700'
  },
  risk_management: {
    icon: Shield,
    label_en: 'Risk Management',
    label_id: 'Manajemen Risiko',
    color: 'bg-blue-100 text-blue-700'
  },
  general: {
    icon: HelpCircle,
    label_en: 'General',
    label_id: 'Umum',
    color: 'bg-slate-100 text-slate-700'
  }
};

export default function GTransFAQ() {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('gtrans_language') || 'en';
  });
  const [activeCategory, setActiveCategory] = useState('all');
  const [openItems, setOpenItems] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    localStorage.setItem('gtrans_language', language);
  }, [language]);

  const allFaqs = Object.entries(DEFAULT_FAQS).flatMap(([category, items]) => 
    items.map(item => ({ ...item, category }))
  );

  const filteredFaqs = allFaqs.filter(faq => {
    if (activeCategory !== 'all' && faq.category !== activeCategory) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const question = language === 'en' ? faq.question_en : (faq.question_id || faq.question_en);
      const answer = language === 'en' ? faq.answer_en : (faq.answer_id || faq.answer_en);
      return question.toLowerCase().includes(query) || answer.toLowerCase().includes(query);
    }
    return true;
  });

  const toggleItem = (idx) => {
    const newOpen = new Set(openItems);
    if (newOpen.has(idx)) {
      newOpen.delete(idx);
    } else {
      newOpen.add(idx);
    }
    setOpenItems(newOpen);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <PublicHeader language={language} setLanguage={setLanguage} />
      
      <main className="pt-24 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1e3a5f]/10 text-[#1e3a5f] text-sm font-medium mb-6">
              <HelpCircle className="w-4 h-4" />
              FAQ
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-[#1e3a5f] mb-6">
              {language === 'en' ? 'Frequently Asked Questions' : 'Pertanyaan yang Sering Diajukan'}
            </h1>
            <p className="text-lg text-slate-600">
              {language === 'en'
                ? 'Find answers to common questions about GTrans services.'
                : 'Temukan jawaban untuk pertanyaan umum tentang layanan GTrans.'
              }
            </p>
          </div>

          <div className="relative mb-8">
            <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder={language === 'en' ? 'Search questions...' : 'Cari pertanyaan...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 bg-white focus:border-[#1e3a5f] focus:ring-1 focus:ring-[#1e3a5f] outline-none"
            />
          </div>

          <div className="flex flex-wrap gap-2 mb-8">
            <button
              onClick={() => setActiveCategory('all')}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                activeCategory === 'all' 
                  ? "bg-[#1e3a5f] text-white" 
                  : "bg-white text-slate-600 hover:bg-slate-100"
              )}
            >
              {language === 'en' ? 'All' : 'Semua'}
            </button>
            {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
              <button
                key={key}
                onClick={() => setActiveCategory(key)}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2",
                  activeCategory === key 
                    ? "bg-[#1e3a5f] text-white" 
                    : "bg-white text-slate-600 hover:bg-slate-100"
                )}
              >
                <config.icon className="w-4 h-4" />
                {language === 'en' ? config.label_en : config.label_id}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {filteredFaqs.length === 0 ? (
              <Card className="border-slate-200">
                <CardContent className="p-8 text-center">
                  <p className="text-slate-500">
                    {language === 'en' ? 'No questions found.' : 'Tidak ada pertanyaan yang ditemukan.'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredFaqs.map((faq, idx) => {
                const config = CATEGORY_CONFIG[faq.category] || CATEGORY_CONFIG.general;
                const question = language === 'en' ? faq.question_en : (faq.question_id || faq.question_en);
                const answer = language === 'en' ? faq.answer_en : (faq.answer_id || faq.answer_en);
                
                return (
                  <Card key={idx} className="border-slate-200 overflow-hidden">
                    <button
                      onClick={() => toggleItem(idx)}
                      className="w-full p-6 text-left flex items-start gap-4 hover:bg-slate-50 transition-colors"
                    >
                      <div className={cn("px-3 py-1 rounded-full text-xs font-medium", config.color)}>
                        {language === 'en' ? config.label_en : config.label_id}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-[#1e3a5f]">{question}</h3>
                      </div>
                      <ChevronDown className={cn(
                        "w-5 h-5 text-slate-400 transition-transform flex-shrink-0",
                        openItems.has(idx) && "rotate-180"
                      )} />
                    </button>
                    {openItems.has(idx) && (
                      <div className="px-6 pb-6 pt-0">
                        <div className="pl-[88px] text-slate-600 leading-relaxed">
                          {answer}
                        </div>
                      </div>
                    )}
                  </Card>
                );
              })
            )}
          </div>

          <Card className="border-slate-200 mt-12">
            <CardContent className="p-8 text-center">
              <h3 className="text-xl font-bold text-[#1e3a5f] mb-4">
                {language === 'en' ? "Can't find what you're looking for?" : 'Tidak menemukan yang Anda cari?'}
              </h3>
              <p className="text-slate-600 mb-6">
                {language === 'en'
                  ? 'Our sales team is happy to answer any additional questions.'
                  : 'Tim sales kami dengan senang hati menjawab pertanyaan tambahan.'
                }
              </p>
              <Link to={createPageUrl('GTransContactSales')}>
                <Button className="bg-[#1e3a5f] hover:bg-[#152a45]">
                  {language === 'en' ? 'Contact Sales' : 'Hubungi Sales'}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>

      <PublicFooter language={language} setLanguage={setLanguage} />
    </div>
  );
}