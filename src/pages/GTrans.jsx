import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from 'framer-motion';
import { 
  ArrowRight, Globe, Shield, Zap, Building2, ShoppingCart, 
  CheckCircle, CreditCard, RefreshCw, Eye
} from 'lucide-react';

import PublicHeader from '@/components/public/PublicHeader';
import PublicFooter from '@/components/public/PublicFooter';
import HeroSection from '@/components/public/HeroSection';

export default function GTrans() {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('gtrans_language') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('gtrans_language', language);
  }, [language]);

  const products = [
    {
      icon: CreditCard,
      title: language === 'en' ? 'GTrans B2B Payments' : 'Pembayaran B2B GTrans',
      description: language === 'en' 
        ? 'Cross-border pay-in / pay-out for corporate clients. Inbound and outbound payments across jurisdictions.'
        : 'Pembayaran lintas batas untuk klien korporat. Pembayaran masuk dan keluar antar yurisdiksi.',
      features: [
        language === 'en' ? 'Multi-currency support' : 'Dukungan multi-mata uang',
        language === 'en' ? 'Real-time tracking' : 'Pelacakan real-time',
        language === 'en' ? 'Competitive FX rates' : 'Kurs FX kompetitif'
      ]
    },
    {
      icon: RefreshCw,
      title: 'GTrans MerchantPay',
      description: language === 'en'
        ? 'Foreign buyers pay Indonesian suppliers in their home currency. GTrans manages FX conversion and settlement.'
        : 'Pembeli asing membayar supplier Indonesia dalam mata uang mereka. GTrans mengelola konversi FX dan penyelesaian.',
      features: [
        language === 'en' ? 'Local currency acceptance' : 'Penerimaan mata uang lokal',
        language === 'en' ? 'Automatic FX conversion' : 'Konversi FX otomatis',
        language === 'en' ? 'IDR settlement' : 'Penyelesaian IDR'
      ]
    },
    {
      icon: ShoppingCart,
      title: language === 'en' ? 'eCommerce Collect & Settle' : 'Koleksi & Penyelesaian eCommerce',
      description: language === 'en'
        ? 'Non-IDR collection with local currency settlement for Indonesian marketplace sellers.'
        : 'Koleksi non-IDR dengan penyelesaian mata uang lokal untuk penjual marketplace Indonesia.',
      features: [
        language === 'en' ? 'Global collection' : 'Koleksi global',
        language === 'en' ? 'Partner bank network' : 'Jaringan bank mitra',
        language === 'en' ? 'Fast settlement' : 'Penyelesaian cepat'
      ]
    }
  ];

  const valueProps = [
    {
      icon: Globe,
      title: language === 'en' ? 'The backbone for global commerce' : 'Tulang punggung perdagangan global',
      description: language === 'en'
        ? 'GTrans serves as the core infrastructure layer for cross-border B2B payment flows, connecting businesses across borders with reliability and compliance.'
        : 'GTrans berfungsi sebagai lapisan infrastruktur inti untuk aliran pembayaran B2B lintas batas, menghubungkan bisnis antar negara dengan keandalan dan kepatuhan.'
    },
    {
      icon: Zap,
      title: language === 'en' ? 'Make transfer orders fast via our platform' : 'Buat pesanan transfer cepat via platform kami',
      description: language === 'en'
        ? 'Create cross-border payment orders quickly through our intuitive platform or integrate via API for seamless automation.'
        : 'Buat pesanan pembayaran lintas batas dengan cepat melalui platform intuitif kami atau integrasikan via API untuk otomatisasi yang mulus.'
    },
    {
      icon: Eye,
      title: language === 'en' ? 'Monitor order executions with precision' : 'Pantau eksekusi pesanan dengan presisi',
      description: language === 'en'
        ? 'Full transparency and operational visibility throughout the transfer process. Track every step from initiation to settlement.'
        : 'Transparansi penuh dan visibilitas operasional sepanjang proses transfer. Lacak setiap langkah dari inisiasi hingga penyelesaian.'
    }
  ];

  const clientJourney = [
    { step: 1, title: language === 'en' ? 'Visit & Review' : 'Kunjungi & Tinjau', description: language === 'en' ? 'Explore GTrans services and capabilities' : 'Jelajahi layanan dan kemampuan GTrans' },
    { step: 2, title: language === 'en' ? 'Contact Sales' : 'Hubungi Sales', description: language === 'en' ? 'Submit inquiry via web form or email' : 'Kirim pertanyaan via formulir web atau email' },
    { step: 3, title: language === 'en' ? 'Receive KYC/KYB' : 'Terima KYC/KYB', description: language === 'en' ? 'Get document checklist and templates' : 'Dapatkan daftar dokumen dan template' },
    { step: 4, title: language === 'en' ? 'Submit Documents' : 'Kirim Dokumen', description: language === 'en' ? 'Provide corporate documentation' : 'Berikan dokumentasi perusahaan' },
    { step: 5, title: language === 'en' ? 'KYC Review' : 'Tinjauan KYC', description: language === 'en' ? 'Await compliance review and decision' : 'Tunggu tinjauan dan keputusan kepatuhan' },
    { step: 6, title: language === 'en' ? 'Agreement Signing' : 'Penandatanganan', description: language === 'en' ? 'Sign Service Agreement and Addenda' : 'Tandatangani Perjanjian Layanan dan Adendum' },
    { step: 7, title: language === 'en' ? 'Access Granted' : 'Akses Diberikan', description: language === 'en' ? 'Login and start using GTrans' : 'Masuk dan mulai menggunakan GTrans' }
  ];

  const currencies = ['AUD', 'CAD', 'CHF', 'DKK', 'EUR', 'GBP', 'JPY', 'MYR', 'NOK', 'NZD', 'SAR', 'THB', 'SEK', 'SGD', 'USD', 'HKD', 'CNY', 'IDR'];

  return (
    <div className="min-h-screen bg-white">
      <PublicHeader language={language} setLanguage={setLanguage} />
      
      <HeroSection language={language} />

      {/* What is GTrans */}
      <section className="py-20 bg-gradient-to-br from-blue-50 via-white to-slate-50" id="about">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-[#1e3a5f] mb-8">
                {language === 'en' ? 'What is GTrans?' : 'Apa itu GTrans?'}
              </h2>
              <div className="space-y-4">
                {[
                  language === 'en' ? 'Cross-border funds transfer (remittance) service for corporate clients' : 'Layanan transfer dana lintas batas (remitansi) untuk klien korporat',
                  language === 'en' ? 'Multi-currency payouts and collections between entities in different countries' : 'Pembayaran dan koleksi multi-mata uang antar entitas di berbagai negara',
                  language === 'en' ? 'Meeting all risk management and technology control requirements' : 'Memenuhi semua persyaratan manajemen risiko dan kontrol teknologi',
                  language === 'en' ? 'Secure, compliant, and efficient cross-border payment infrastructure' : 'Infrastruktur pembayaran lintas batas yang aman, patuh, dan efisien'
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 bg-white rounded-lg p-4 shadow-sm border border-blue-100">
                    <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-700">{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <h3 className="text-2xl font-bold text-[#f5a623] mb-6">
                {language === 'en' ? 'Why Now?' : 'Mengapa Sekarang?'}
              </h3>
              <div className="space-y-4">
                {[
                  language === 'en' ? 'Cross-border payment flows are exploding globally' : 'Aliran pembayaran lintas batas meledak secara global',
                  language === 'en' ? 'BRICS and new trade corridors are emerging' : 'BRICS dan koridor perdagangan baru bermunculan',
                  language === 'en' ? 'Demand for alternative, flexible payment solutions' : 'Permintaan untuk solusi pembayaran alternatif yang fleksibel',
                  language === 'en' ? 'Indonesian businesses need reliable cross-border partners' : 'Bisnis Indonesia membutuhkan mitra lintas batas yang andal'
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg p-4 shadow-sm border border-orange-100">
                    <CheckCircle className="w-5 h-5 text-[#f5a623] flex-shrink-0 mt-0.5" />
                    <span className="text-slate-700">{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Value Propositions */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-blue-50" id="features">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1e3a5f] mb-4">
              {language === 'en' ? 'Why Choose GTrans' : 'Mengapa Memilih GTrans'}
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              {language === 'en'
                ? 'Built for businesses that need reliable, compliant, and efficient cross-border payment infrastructure.'
                : 'Dibangun untuk bisnis yang membutuhkan infrastruktur pembayaran lintas batas yang andal, sesuai regulasi, dan efisien.'
              }
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {valueProps.map((prop, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="h-full border-slate-200 hover:border-[#1e3a5f]/30 hover:shadow-lg transition-all">
                  <CardContent className="p-8">
                    <div className="w-14 h-14 rounded-xl bg-[#1e3a5f]/10 flex items-center justify-center mb-6">
                      <prop.icon className="w-7 h-7 text-[#1e3a5f]" />
                    </div>
                    <h3 className="text-xl font-bold text-[#1e3a5f] mb-4">{prop.title}</h3>
                    <p className="text-slate-600">{prop.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Products */}
      <section className="py-20 bg-white" id="products">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1e3a5f] mb-4">
              {language === 'en' ? 'Product Portfolio' : 'Portofolio Produk'}
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              {language === 'en'
                ? 'Comprehensive solutions for every cross-border payment need.'
                : 'Solusi komprehensif untuk setiap kebutuhan pembayaran lintas batas.'
              }
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* B2B Payments */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Link to={createPageUrl('GTransB2BPayments')}>
                <Card className="h-full border-slate-200 hover:shadow-2xl transition-all bg-white group cursor-pointer overflow-hidden">
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80" 
                      alt="B2B Payments"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1e3a5f] via-[#1e3a5f]/30 to-transparent" />
                    <div className="absolute bottom-4 left-4">
                      <div className="w-12 h-12 rounded-xl bg-white/90 flex items-center justify-center">
                        <CreditCard className="w-6 h-6 text-[#1e3a5f]" />
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-[#1e3a5f] mb-3 group-hover:text-[#f5a623] transition-colors">
                      {language === 'en' ? 'GTrans B2B Payments' : 'Pembayaran B2B GTrans'}
                    </h3>
                    <p className="text-slate-600 mb-4">
                      {language === 'en' 
                        ? 'Cross-border payments for real-world businesses. Let your team focus on core business while we handle fast, compliant settlements worldwide.'
                        : 'Pembayaran lintas batas untuk bisnis dunia nyata. Biarkan tim Anda fokus pada bisnis inti sementara kami menangani penyelesaian yang cepat dan sesuai di seluruh dunia.'
                      }
                    </p>
                    <div className="flex items-center gap-2 text-[#1e3a5f] font-medium group-hover:gap-3 transition-all">
                      <span>{language === 'en' ? 'Learn More' : 'Pelajari Lebih Lanjut'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>

            {/* MerchantPay */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <Card className="h-full border-slate-200 hover:shadow-2xl transition-all bg-white group overflow-hidden">
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80" 
                    alt="MerchantPay"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#f5a623] via-[#f5a623]/30 to-transparent" />
                  <div className="absolute bottom-4 left-4">
                    <div className="w-12 h-12 rounded-xl bg-white/90 flex items-center justify-center">
                      <RefreshCw className="w-6 h-6 text-[#f5a623]" />
                    </div>
                  </div>
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-[#1e3a5f] mb-3">GTrans MerchantPay</h3>
                  <p className="text-slate-600 mb-4">
                    {language === 'en'
                      ? 'Foreign buyers pay Indonesian suppliers in their home currency. GTrans manages FX conversion and settlement into IDR or other agreed currencies.'
                      : 'Pembeli asing membayar supplier Indonesia dalam mata uang mereka. GTrans mengelola konversi FX dan penyelesaian ke IDR atau mata uang lain yang disepakati.'
                    }
                  </p>
                  <div className="text-slate-400 text-sm">
                    {language === 'en' ? 'Coming soon' : 'Segera hadir'}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* eCommerce */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <Card className="h-full border-slate-200 hover:shadow-2xl transition-all bg-white group overflow-hidden">
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1556742111-a301076d9d18?w=800&q=80" 
                    alt="eCommerce"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-emerald-600 via-emerald-600/30 to-transparent" />
                  <div className="absolute bottom-4 left-4">
                    <div className="w-12 h-12 rounded-xl bg-white/90 flex items-center justify-center">
                      <ShoppingCart className="w-6 h-6 text-emerald-600" />
                    </div>
                  </div>
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-[#1e3a5f] mb-3">
                    {language === 'en' ? 'eCommerce Collect & Settle' : 'Koleksi & Penyelesaian eCommerce'}
                  </h3>
                  <p className="text-slate-600 mb-4">
                    {language === 'en'
                      ? 'Get paid globally, settle locally. For Indonesian online sellers and marketplaces selling to overseas buyers in non-IDR currencies.'
                      : 'Terima pembayaran global, selesaikan lokal. Untuk penjual online Indonesia dan marketplace yang menjual ke pembeli luar negeri dalam mata uang non-IDR.'
                    }
                  </p>
                  <div className="text-slate-400 text-sm">
                    {language === 'en' ? 'Coming soon' : 'Segera hadir'}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Platform Screenshots */}
      <section className="py-20 bg-white" id="platform">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1e3a5f] mb-4">
              {language === 'en' ? 'Intuitive Platform Interface' : 'Antarmuka Platform yang Intuitif'}
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              {language === 'en'
                ? 'Create orders and track transfers with ease through our user-friendly dashboard.'
                : 'Buat pesanan dan lacak transfer dengan mudah melalui dashboard yang ramah pengguna.'
              }
            </p>
          </div>

          <div className="space-y-12">
            {/* Creating Order - Two Screenshots */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl p-8"
            >
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-[#1e3a5f] mb-2">
                  {language === 'en' ? 'Creating Order' : 'Membuat Pesanan'}
                </h3>
                <p className="text-slate-600">
                  {language === 'en'
                    ? 'Simple, comprehensive form to create cross-border payment orders with all required details.'
                    : 'Formulir sederhana dan komprehensif untuk membuat pesanan pembayaran lintas batas dengan semua detail yang diperlukan.'
                  }
                </p>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-2xl overflow-hidden border border-slate-200">
                  <img 
                    src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69233f5a9a123941f81322f5/27919c1f3_Screenshot2025-12-06at160702.png" 
                    alt="Create Order - Part 1"
                    className="w-full h-auto"
                  />
                </div>
                <div className="bg-white rounded-xl shadow-2xl overflow-hidden border border-slate-200">
                  <img 
                    src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69233f5a9a123941f81322f5/6b1f27775_Screenshot2025-12-06at101704.png" 
                    alt="Create Order - Part 2"
                    className="w-full h-auto"
                  />
                </div>
              </div>
            </motion.div>

            {/* Monitoring Order */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-slate-50 to-emerald-50 rounded-2xl p-8"
            >
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-[#1e3a5f] mb-2">
                  {language === 'en' ? 'Monitoring Order' : 'Memantau Pesanan'}
                </h3>
                <p className="text-slate-600">
                  {language === 'en'
                    ? 'Track all orders in real-time, filter by currency or status, and export reports.'
                    : 'Lacak semua pesanan secara real-time, filter berdasarkan mata uang atau status, dan ekspor laporan.'
                  }
                </p>
              </div>
              <div className="bg-white rounded-xl shadow-2xl overflow-hidden border border-slate-200">
                <img 
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69233f5a9a123941f81322f5/b9437221b_Screenshot2025-12-06at101722.png" 
                  alt="Order Monitoring Interface"
                  className="w-full h-auto"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Client Journey */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-slate-50" id="journey">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1e3a5f] mb-4">
              {language === 'en' ? 'Your Journey with GTrans' : 'Perjalanan Anda dengan GTrans'}
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              {language === 'en'
                ? 'From inquiry to active use – a streamlined onboarding process.'
                : 'Dari pertanyaan hingga penggunaan aktif – proses onboarding yang efisien.'
              }
            </p>
          </div>

          <div className="relative">
            <div className="hidden md:block absolute top-8 left-0 right-0 h-0.5 bg-slate-200" />
            
            <div className="grid md:grid-cols-7 gap-4">
              {clientJourney.map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="relative text-center"
                >
                  <div className="w-16 h-16 rounded-full bg-[#1e3a5f] text-white flex items-center justify-center text-xl font-bold mx-auto mb-4 relative z-10">
                    {item.step}
                  </div>
                  <h4 className="font-semibold text-[#1e3a5f] mb-2">{item.title}</h4>
                  <p className="text-sm text-slate-500">{item.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Currencies */}
      <section className="py-20 bg-[#1e3a5f]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {language === 'en' ? 'Supported Currencies' : 'Mata Uang yang Didukung'}
            </h2>
            <p className="text-lg text-slate-300">
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
                className="px-6 py-3 bg-white/10 rounded-lg text-white font-medium hover:bg-white/20 transition-colors"
              >
                {currency}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#1e3a5f] to-[#2d5a8f]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            {language === 'en' ? 'Ready to Get Started?' : 'Siap untuk Memulai?'}
          </h2>
          <p className="text-lg text-slate-200 mb-8 max-w-2xl mx-auto">
            {language === 'en'
              ? 'Contact our sales team to learn how GTrans can power your cross-border payment needs.'
              : 'Hubungi tim sales kami untuk mengetahui bagaimana GTrans dapat memenuhi kebutuhan pembayaran lintas batas Anda.'
            }
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to={createPageUrl('GTransContactSales')}>
              <Button size="lg" className="bg-[#f5a623] hover:bg-[#e09000] text-white text-lg px-8">
                {language === 'en' ? 'Contact Sales' : 'Hubungi Sales'}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to={createPageUrl('GTransWorkScheme')}>
              <Button size="lg" variant="outline" className="border-white bg-transparent text-white hover:bg-white/10 text-lg px-8">
                {language === 'en' ? 'View Work Scheme' : 'Lihat Skema Kerja'}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter language={language} setLanguage={setLanguage} />
    </div>
  );
}