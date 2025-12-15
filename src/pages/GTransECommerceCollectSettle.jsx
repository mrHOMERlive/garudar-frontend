import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from 'framer-motion';
import { 
  ArrowRight, ShoppingCart, Globe, DollarSign, FileText,
  CheckCircle, Users, Building2, TrendingUp
} from 'lucide-react';

import PublicHeader from '@/components/public/PublicHeader';
import PublicFooter from '@/components/public/PublicFooter';

export default function GTransECommerceCollectSettle() {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('gtrans_language') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('gtrans_language', language);
  }, [language]);

  const steps = [
    {
      step: 1,
      title: language === 'en' ? 'Customer selects goods/services' : 'Pelanggan memilih barang/jasa',
      description: language === 'en' 
        ? 'Customer selects goods or services on the merchant\'s website.'
        : 'Pelanggan memilih barang atau jasa di website merchant.'
    },
    {
      step: 2,
      title: language === 'en' ? 'Merchant initiates payment order' : 'Merchant memulai pesanan pembayaran',
      description: language === 'en'
        ? 'Merchant initiates a payment order via GTrans or through a licensed partner in a supported jurisdiction.'
        : 'Merchant memulai pesanan pembayaran melalui GTrans atau melalui mitra berlisensi di yurisdiksi yang didukung.'
    },
    {
      step: 3,
      title: language === 'en' ? 'Buyer pays in home currency' : 'Pembeli membayar dalam mata uang asal',
      description: language === 'en'
        ? 'Buyer pays in their home currency into a GAN account held at a partner bank in the selected jurisdiction.'
        : 'Pembeli membayar dalam mata uang asal mereka ke akun GAN yang dimiliki di bank mitra di yurisdiksi yang dipilih.'
    },
    {
      step: 4,
      title: language === 'en' ? 'GTrans processes settlement' : 'GTrans memproses penyelesaian',
      description: language === 'en'
        ? 'GTrans processes the settlement and transfers funds directly to the seller in IDR (or another agreed currency).'
        : 'GTrans memproses penyelesaian dan mentransfer dana langsung ke penjual dalam IDR (atau mata uang lain yang disepakati).'
    },
    {
      step: 5,
      title: language === 'en' ? 'Settlement report delivered' : 'Laporan penyelesaian dikirim',
      description: language === 'en'
        ? 'Final settlement report is delivered to the merchant, ensuring full transparency and auditability.'
        : 'Laporan penyelesaian akhir dikirim ke merchant, memastikan transparansi dan auditabilitas penuh.'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <PublicHeader language={language} setLanguage={setLanguage} />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-2 mb-6">
                <ShoppingCart className="w-5 h-5 text-white" />
                <span className="text-white font-medium">
                  {language === 'en' ? 'Coming Soon' : 'Segera Hadir'}
                </span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
                {language === 'en' ? 'GTrans eCommerce Collect & Settle' : 'GTrans Koleksi & Penyelesaian eCommerce'}
              </h1>
              <p className="text-xl md:text-2xl text-slate-100 mb-8 max-w-3xl mx-auto">
                {language === 'en'
                  ? 'Get paid globally, settle locally'
                  : 'Terima pembayaran global, selesaikan lokal'
                }
              </p>
              <p className="text-lg text-slate-200 mb-8 max-w-3xl mx-auto">
                {language === 'en'
                  ? 'For Indonesian online sellers and marketplaces selling to overseas buyers in non-IDR currencies.'
                  : 'Untuk penjual online Indonesia dan marketplace yang menjual ke pembeli luar negeri dalam mata uang non-IDR.'
                }
              </p>
              <Link to={createPageUrl('GTransContactSales')}>
                <Button size="lg" className="bg-white text-emerald-700 hover:bg-slate-100 text-lg px-8">
                  {language === 'en' ? 'Contact Sales' : 'Hubungi Sales'}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Product Overview */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-[#1e3a5f] mb-8">
                {language === 'en' ? 'GTrans – eCommerce Collect & Settle' : 'GTrans – eCommerce Collect & Settle'}
              </h2>
              <div className="space-y-6 text-lg text-slate-700">
                <p className="text-xl font-medium text-emerald-700">
                  {language === 'en'
                    ? 'GTrans enables Indonesian marketplace sellers to expand into overseas e-commerce by collecting and settling payments in non-IDR currencies, with full support for international transactions.'
                    : 'GTrans memungkinkan penjual marketplace Indonesia untuk berkembang ke e-commerce luar negeri dengan mengumpulkan dan menyelesaikan pembayaran dalam mata uang non-IDR, dengan dukungan penuh untuk transaksi internasional.'
                  }
                </p>
                
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-1" />
                    <span>{language === 'en' ? 'Collects buyer payments in non-IDR currencies (e.g., USD, EUR, GBP) on behalf of Indonesian sellers' : 'Mengumpulkan pembayaran pembeli dalam mata uang non-IDR (misalnya, USD, EUR, GBP) atas nama penjual Indonesia'}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-1" />
                    <span>{language === 'en' ? 'Provides a seamless, compliant payment flow through licensed financial partners in key jurisdictions' : 'Menyediakan alur pembayaran yang lancar dan sesuai melalui mitra keuangan berlisensi di yurisdiksi utama'}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-1" />
                    <span>{language === 'en' ? 'Supports Indonesian merchants engaging in global e-commerce and unlocking new revenue streams' : 'Mendukung pedagang Indonesia yang terlibat dalam e-commerce global dan membuka aliran pendapatan baru'}</span>
                  </li>
                </ul>
              </div>
            </div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-8 shadow-xl">
                <img 
                  src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&q=80" 
                  alt="eCommerce Illustration"
                  className="w-full h-auto rounded-xl shadow-lg"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Two Core Services */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-emerald-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-[#1e3a5f] mb-12 text-center">
            {language === 'en' ? 'Two Core Services' : 'Dua Layanan Inti'}
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Card className="h-full border-emerald-200 bg-white">
                <CardContent className="p-8">
                  <div className="w-14 h-14 rounded-xl bg-emerald-100 flex items-center justify-center mb-6">
                    <Globe className="w-7 h-7 text-emerald-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-[#1e3a5f] mb-4">
                    {language === 'en' ? '1. Collection Service' : '1. Layanan Koleksi'}
                  </h3>
                  <p className="text-slate-700 mb-4">
                    {language === 'en'
                      ? 'We receive buyer payments in non-IDR into GAN accounts held with partner banks.'
                      : 'Kami menerima pembayaran pembeli dalam non-IDR ke akun GAN yang dimiliki dengan bank mitra.'
                    }
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-600">{language === 'en' ? 'Buyers pay in their local or chosen currency' : 'Pembeli membayar dalam mata uang lokal atau pilihan mereka'}</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-600">{language === 'en' ? 'Funds are collected via our regulated banking partners' : 'Dana dikumpulkan melalui mitra perbankan teregulasi kami'}</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-600">{language === 'en' ? 'Transactions are consolidated and matched to your orders' : 'Transaksi dikonsolidasikan dan dicocokkan dengan pesanan Anda'}</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Card className="h-full border-emerald-200 bg-white">
                <CardContent className="p-8">
                  <div className="w-14 h-14 rounded-xl bg-emerald-100 flex items-center justify-center mb-6">
                    <DollarSign className="w-7 h-7 text-emerald-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-[#1e3a5f] mb-4">
                    {language === 'en' ? '2. Payout Service' : '2. Layanan Pembayaran'}
                  </h3>
                  <p className="text-slate-700 mb-4">
                    {language === 'en'
                      ? 'Once funds are collected, GTrans settles to Indonesian sellers:'
                      : 'Setelah dana terkumpul, GTrans menyelesaikan ke penjual Indonesia:'
                    }
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-600">{language === 'en' ? 'In IDR, or' : 'Dalam IDR, atau'}</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-600">{language === 'en' ? 'In another agreed currency, depending on your needs' : 'Dalam mata uang lain yang disepakati, tergantung kebutuhan Anda'}</span>
                    </li>
                  </ul>
                  <p className="text-slate-700 mt-4">
                    {language === 'en'
                      ? 'You receive clear settlement reports with amounts, FX, and order references for easy reconciliation.'
                      : 'Anda menerima laporan penyelesaian yang jelas dengan jumlah, FX, dan referensi pesanan untuk rekonsiliasi yang mudah.'
                    }
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Key Benefits */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1e3a5f] mb-4">
              {language === 'en' ? 'Why Choose GTrans eCommerce Collect & Settle' : 'Mengapa Memilih GTrans eCommerce Collect & Settle'}
            </h2>
            <p className="text-lg text-slate-600 max-w-3xl mx-auto">
              {language === 'en'
                ? 'This solution removes currency and account barriers, empowering Indonesian sellers to access global markets and grow their revenues.'
                : 'Solusi ini menghilangkan hambatan mata uang dan akun, memberdayakan penjual Indonesia untuk mengakses pasar global dan meningkatkan pendapatan mereka.'
              }
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <img 
                src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80" 
                alt="Global eCommerce"
                className="w-full h-auto rounded-2xl shadow-xl"
              />
            </motion.div>
            
            <div className="space-y-6">
              <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-white">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Globe className="w-8 h-8 text-emerald-600 flex-shrink-0" />
                    <div>
                      <h3 className="text-lg font-bold text-[#1e3a5f] mb-2">
                        {language === 'en' ? 'Global Reach' : 'Jangkauan Global'}
                      </h3>
                      <p className="text-slate-600">
                        {language === 'en' ? 'Accept payments from buyers worldwide in multiple currencies' : 'Terima pembayaran dari pembeli di seluruh dunia dalam berbagai mata uang'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-white">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <DollarSign className="w-8 h-8 text-emerald-600 flex-shrink-0" />
                    <div>
                      <h3 className="text-lg font-bold text-[#1e3a5f] mb-2">
                        {language === 'en' ? 'Local Settlement' : 'Penyelesaian Lokal'}
                      </h3>
                      <p className="text-slate-600">
                        {language === 'en' ? 'Receive funds directly in IDR to your Indonesian bank account' : 'Terima dana langsung dalam IDR ke rekening bank Indonesia Anda'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-white">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <FileText className="w-8 h-8 text-emerald-600 flex-shrink-0" />
                    <div>
                      <h3 className="text-lg font-bold text-[#1e3a5f] mb-2">
                        {language === 'en' ? 'Full Transparency' : 'Transparansi Penuh'}
                      </h3>
                      <p className="text-slate-600">
                        {language === 'en' ? 'Complete reporting and auditability for all transactions' : 'Pelaporan lengkap dan auditabilitas untuk semua transaksi'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Collection Flow */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-emerald-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-[#1e3a5f] mb-4">
                {language === 'en' ? 'How the Collection Flow Works' : 'Bagaimana Alur Koleksi Bekerja'}
              </h2>
              <p className="text-lg text-slate-600">
                {language === 'en' ? 'Step-by-step process from checkout to settlement' : 'Proses langkah demi langkah dari checkout hingga penyelesaian'}
              </p>
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
            >
              <img 
                src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80" 
                alt="Collection Flow"
                className="w-full h-auto rounded-2xl shadow-xl"
              />
            </motion.div>
          </div>

          <div className="grid gap-6">
            {steps.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="border-slate-200 bg-white">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xl font-bold flex-shrink-0">
                        {item.step}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-[#1e3a5f] mb-2">{item.title}</h3>
                        <p className="text-slate-600">{item.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <div className="bg-white rounded-xl p-8 shadow-lg border border-emerald-200 max-w-3xl mx-auto">
              <TrendingUp className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
              <p className="text-lg font-medium text-slate-700">
                {language === 'en'
                  ? 'The result: overseas customers pay in their own currency, and Indonesian merchants get local, compliant settlement and clear reporting.'
                  : 'Hasilnya: pelanggan luar negeri membayar dalam mata uang mereka sendiri, dan pedagang Indonesia mendapatkan penyelesaian lokal yang sesuai dan pelaporan yang jelas.'
                }
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-emerald-600 to-teal-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            {language === 'en' ? 'Interested in GTrans eCommerce Collect & Settle?' : 'Tertarik dengan GTrans eCommerce Collect & Settle?'}
          </h2>
          <p className="text-lg text-slate-100 mb-8 max-w-2xl mx-auto">
            {language === 'en'
              ? 'Contact our sales team to learn more about this upcoming solution for cross-border eCommerce.'
              : 'Hubungi tim sales kami untuk mempelajari lebih lanjut tentang solusi mendatang untuk eCommerce lintas batas ini.'
            }
          </p>
          <Link to={createPageUrl('GTransContactSales')}>
            <Button size="lg" className="bg-white text-emerald-700 hover:bg-slate-100 text-lg px-8">
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