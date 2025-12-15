import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from 'framer-motion';
import { 
  ArrowRight, TrendingUp, Shield, Zap, Globe, DollarSign,
  CheckCircle, RefreshCw, Clock
} from 'lucide-react';

import PublicHeader from '@/components/public/PublicHeader';
import PublicFooter from '@/components/public/PublicFooter';

export default function GTransFXSolutions() {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('gtrans_language') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('gtrans_language', language);
  }, [language]);

  const currencies = ['AUD', 'CAD', 'CHF', 'DKK', 'EUR', 'GBP', 'JPY', 'MYR', 'NOK', 'NZD', 'SAR', 'THB', 'SEK', 'SGD', 'USD', 'HKD', 'CNY', 'IDR'];

  const features = [
    {
      icon: TrendingUp,
      title: language === 'en' ? 'Competitive FX Rates' : 'Kurs FX Kompetitif',
      description: language === 'en' 
        ? 'Access wholesale FX rates with transparent pricing. No hidden markups or surprise fees.'
        : 'Akses kurs FX grosir dengan harga transparan. Tanpa markup tersembunyi atau biaya kejutan.'
    },
    {
      icon: DollarSign,
      title: language === 'en' ? 'Zero Transfer Fees' : 'Nol Biaya Transfer',
      description: language === 'en'
        ? 'No transfer fees on qualifying transactions. Pay only the agreed FX spread.'
        : 'Tidak ada biaya transfer pada transaksi yang memenuhi syarat. Bayar hanya spread FX yang disepakati.'
    },
    {
      icon: Clock,
      title: language === 'en' ? 'Fast Settlement' : 'Penyelesaian Cepat',
      description: language === 'en'
        ? 'Same-day or next-day settlement for most currency pairs and destinations.'
        : 'Penyelesaian hari yang sama atau hari berikutnya untuk sebagian besar pasangan mata uang dan tujuan.'
    },
    {
      icon: Shield,
      title: language === 'en' ? 'Fully Regulated' : 'Diatur Penuh',
      description: language === 'en'
        ? 'Licensed under Bank Indonesia PSP framework. Your transactions are secure and compliant.'
        : 'Berlisensi di bawah kerangka PSP Bank Indonesia. Transaksi Anda aman dan sesuai regulasi.'
    },
    {
      icon: Globe,
      title: language === 'en' ? '19+ Currencies' : '19+ Mata Uang',
      description: language === 'en'
        ? 'Convert between major global currencies including USD, EUR, GBP, CNY, SGD and more.'
        : 'Konversi antara mata uang global utama termasuk USD, EUR, GBP, CNY, SGD dan lainnya.'
    },
    {
      icon: RefreshCw,
      title: language === 'en' ? 'Real-Time Rates' : 'Kurs Real-Time',
      description: language === 'en'
        ? 'Lock in rates at the time of order creation. Full transparency on FX applied.'
        : 'Kunci kurs pada saat pembuatan pesanan. Transparansi penuh pada FX yang diterapkan.'
    }
  ];

  const benefits = [
    language === 'en' ? 'No hidden fees or markups' : 'Tidak ada biaya atau markup tersembunyi',
    language === 'en' ? 'Competitive mid-market rates' : 'Kurs pasar menengah yang kompetitif',
    language === 'en' ? 'Transparent pricing structure' : 'Struktur harga transparan',
    language === 'en' ? 'Fast execution and settlement' : 'Eksekusi dan penyelesaian cepat',
    language === 'en' ? 'Full compliance and security' : 'Kepatuhan dan keamanan penuh'
  ];

  return (
    <div className="min-h-screen bg-white">
      <PublicHeader language={language} setLanguage={setLanguage} />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-br from-[#1e3a5f] via-[#2d5a8f] to-[#1e3a5f]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
                {language === 'en' ? 'FX Solutions' : 'Solusi FX'}
              </h1>
              <p className="text-xl md:text-2xl text-slate-200 mb-8 max-w-3xl mx-auto">
                {language === 'en'
                  ? 'Multi-currency transfers with competitive rates, zero fees, and transparent pricing'
                  : 'Transfer multi-mata uang dengan kurs kompetitif, nol biaya, dan harga transparan'
                }
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to={createPageUrl('GTransContactSales')}>
                  <Button size="lg" className="bg-[#f5a623] hover:bg-[#e09000] text-white text-lg px-8">
                    {language === 'en' ? 'Get Started' : 'Mulai'}
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link to={createPageUrl('GTrans')}>
                  <Button size="lg" variant="outline" className="border-white bg-transparent text-white hover:bg-white/10 text-lg px-8">
                    {language === 'en' ? 'View All Products' : 'Lihat Semua Produk'}
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1e3a5f] mb-4">
              {language === 'en' ? 'Why Choose GTrans FX' : 'Mengapa Memilih GTrans FX'}
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              {language === 'en'
                ? 'Best-in-class foreign exchange solutions for your business'
                : 'Solusi valuta asing terbaik di kelasnya untuk bisnis Anda'
              }
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="h-full border-slate-200 hover:shadow-lg transition-all">
                  <CardContent className="p-8">
                    <div className="w-14 h-14 rounded-xl bg-[#1e3a5f]/10 flex items-center justify-center mb-6">
                      <feature.icon className="w-7 h-7 text-[#1e3a5f]" />
                    </div>
                    <h3 className="text-xl font-bold text-[#1e3a5f] mb-4">{feature.title}</h3>
                    <p className="text-slate-600">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Supported Currencies */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1e3a5f] mb-4">
              {language === 'en' ? 'Supported Currencies' : 'Mata Uang yang Didukung'}
            </h2>
            <p className="text-lg text-slate-600">
              {language === 'en' ? '19+ currencies for your global transactions' : '19+ mata uang untuk transaksi global Anda'}
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            {currencies.map((currency, idx) => (
              <motion.div
                key={currency}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.03 }}
                className="px-6 py-3 bg-[#1e3a5f]/10 rounded-lg text-[#1e3a5f] font-medium hover:bg-[#1e3a5f]/20 transition-colors"
              >
                {currency}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1e3a5f] mb-4">
              {language === 'en' ? 'What You Get' : 'Apa yang Anda Dapatkan'}
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {benefits.map((benefit, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-start gap-3 bg-white rounded-lg p-6 shadow-sm border border-blue-100"
              >
                <CheckCircle className="w-6 h-6 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span className="text-slate-700 text-lg">{benefit}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#1e3a5f] to-[#2d5a8f]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            {language === 'en' ? 'Ready to Start?' : 'Siap untuk Memulai?'}
          </h2>
          <p className="text-lg text-slate-200 mb-8 max-w-2xl mx-auto">
            {language === 'en'
              ? 'Contact our sales team to access competitive FX rates and zero-fee transfers.'
              : 'Hubungi tim sales kami untuk mengakses kurs FX kompetitif dan transfer tanpa biaya.'
            }
          </p>
          <Link to={createPageUrl('GTransContactSales')}>
            <Button size="lg" className="bg-[#f5a623] hover:bg-[#e09000] text-white text-lg px-8">
              {language === 'en' ? 'Contact Sales' : 'Hubungi Sales'}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      <PublicFooter language={language} setLanguage={setLanguage} />
    </div>
  );
}