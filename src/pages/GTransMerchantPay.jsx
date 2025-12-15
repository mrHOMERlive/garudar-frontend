import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from 'framer-motion';
import { 
  ArrowRight, RefreshCw, DollarSign, Globe, Users,
  CheckCircle, Building2, TrendingUp, Shield
} from 'lucide-react';

import PublicHeader from '@/components/public/PublicHeader';
import PublicFooter from '@/components/public/PublicFooter';

export default function GTransMerchantPay() {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('gtrans_language') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('gtrans_language', language);
  }, [language]);

  const steps = [
    {
      step: 1,
      title: language === 'en' ? 'Invoice in buyer\'s home currency' : 'Faktur dalam mata uang pembeli',
      description: language === 'en'
        ? 'The Indonesian supplier prices the transaction in the buyer\'s currency (e.g. USD, EUR, SGD).'
        : 'Supplier Indonesia memberi harga transaksi dalam mata uang pembeli (misalnya USD, EUR, SGD).'
    },
    {
      step: 2,
      title: language === 'en' ? 'Buyer pays in home currency' : 'Pembeli membayar dalam mata uang asal',
      description: language === 'en'
        ? 'The foreign buyer pays through GTrans channels in their own currency.'
        : 'Pembeli asing membayar melalui saluran GTrans dalam mata uang mereka sendiri.'
    },
    {
      step: 3,
      title: language === 'en' ? 'GTrans converts and settles' : 'GTrans mengonversi dan menyelesaikan',
      description: language === 'en'
        ? 'GTrans manages the FX conversion at agreed rates.'
        : 'GTrans mengelola konversi FX dengan kurs yang disepakati.'
    },
    {
      step: 4,
      title: language === 'en' ? 'Supplier receives local settlement' : 'Supplier menerima penyelesaian lokal',
      description: language === 'en'
        ? 'The Indonesian supplier receives funds in IDR or another agreed currency into their local bank account.'
        : 'Supplier Indonesia menerima dana dalam IDR atau mata uang lain yang disepakati ke rekening bank lokal mereka.'
    }
  ];

  const buyerBenefits = [
    {
      icon: DollarSign,
      title: language === 'en' ? 'Pay in your own currency' : 'Bayar dalam mata uang Anda',
      description: language === 'en'
        ? 'Use familiar payment processes without dealing with IDR exchange.'
        : 'Gunakan proses pembayaran yang familiar tanpa berurusan dengan tukar IDR.'
    },
    {
      icon: Shield,
      title: language === 'en' ? 'Avoid local banking complexity' : 'Hindari kompleksitas perbankan lokal',
      description: language === 'en'
        ? 'No need to set up local Indonesian bank accounts.'
        : 'Tidak perlu membuka rekening bank lokal Indonesia.'
    },
    {
      icon: CheckCircle,
      title: language === 'en' ? 'Smoother payment experience' : 'Pengalaman pembayaran yang lebih lancar',
      description: language === 'en'
        ? 'Simplified process when working with Indonesian suppliers.'
        : 'Proses yang disederhanakan saat bekerja dengan supplier Indonesia.'
    }
  ];

  const supplierBenefits = [
    {
      icon: Globe,
      title: language === 'en' ? 'Attract foreign customers' : 'Tarik pelanggan asing',
      description: language === 'en'
        ? 'Offer home-currency payments to make it easier for foreign buyers.'
        : 'Tawarkan pembayaran mata uang asal untuk memudahkan pembeli asing.'
    },
    {
      icon: DollarSign,
      title: language === 'en' ? 'Receive in IDR or preferred currency' : 'Terima dalam IDR atau mata uang pilihan',
      description: language === 'en'
        ? 'Get settled in your preferred currency without managing FX risk directly.'
        : 'Dapatkan penyelesaian dalam mata uang pilihan Anda tanpa mengelola risiko FX secara langsung.'
    },
    {
      icon: TrendingUp,
      title: language === 'en' ? 'Improve cash flow visibility' : 'Tingkatkan visibilitas arus kas',
      description: language === 'en'
        ? 'Better reconciliation and clearer payment tracking.'
        : 'Rekonsiliasi yang lebih baik dan pelacakan pembayaran yang lebih jelas.'
    },
    {
      icon: RefreshCw,
      title: language === 'en' ? 'Reduce operational workload' : 'Kurangi beban operasional',
      description: language === 'en'
        ? 'Let GTrans handle the international payment complexity.'
        : 'Biarkan GTrans menangani kompleksitas pembayaran internasional.'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <PublicHeader language={language} setLanguage={setLanguage} />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-br from-[#f5a623] via-[#e09000] to-[#f5a623]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-2 mb-6">
                <RefreshCw className="w-5 h-5 text-white" />
                <span className="text-white font-medium">
                  {language === 'en' ? 'Coming Soon' : 'Segera Hadir'}
                </span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
                GTrans MerchantPay
              </h1>
              <p className="text-xl md:text-2xl text-slate-100 mb-8 max-w-3xl mx-auto">
                {language === 'en'
                  ? 'Let foreign buyers pay in their own currency'
                  : 'Biarkan pembeli asing membayar dalam mata uang mereka sendiri'
                }
              </p>
              <p className="text-lg text-slate-200 mb-8 max-w-3xl mx-auto">
                {language === 'en'
                  ? 'Foreign buyers pay Indonesian suppliers in their home currency. GTrans manages FX conversion and settlement into IDR or other agreed currencies.'
                  : 'Pembeli asing membayar supplier Indonesia dalam mata uang asal mereka. GTrans mengelola konversi FX dan penyelesaian ke IDR atau mata uang lain yang disepakati.'
                }
              </p>
              <Link to={createPageUrl('GTransContactSales')}>
                <Button size="lg" className="bg-white text-[#f5a623] hover:bg-slate-100 text-lg px-8">
                  {language === 'en' ? 'Contact Sales' : 'Hubungi Sales'}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* What is MerchantPay */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-[#1e3a5f] mb-8">
                {language === 'en' ? 'GTrans – MerchantPay' : 'GTrans – MerchantPay'}
              </h2>
              <div className="space-y-6 text-lg text-slate-700">
                <p className="text-xl font-medium text-[#f5a623]">
                  {language === 'en'
                    ? 'Foreign customers can now pay Indonesian suppliers in their home currency, without needing an IDR account.'
                    : 'Pelanggan asing sekarang dapat membayar supplier Indonesia dalam mata uang asal mereka, tanpa perlu akun IDR.'
                  }
                </p>
                
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-[#f5a623] flex-shrink-0 mt-1" />
                    <span>{language === 'en' ? 'Enables non-Indonesian buyers to settle bills directly in their home currency (e.g., USD, EUR, GBP)' : 'Memungkinkan pembeli non-Indonesia untuk menyelesaikan tagihan langsung dalam mata uang asal mereka (misalnya, USD, EUR, GBP)'}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-[#f5a623] flex-shrink-0 mt-1" />
                    <span>{language === 'en' ? 'GTrans handles FX conversion and settlement into IDR or any agreed currency, ensuring seamless transactions' : 'GTrans menangani konversi FX dan penyelesaian ke IDR atau mata uang yang disepakati, memastikan transaksi yang lancar'}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-[#f5a623] flex-shrink-0 mt-1" />
                    <span>{language === 'en' ? 'Supports local merchants on Indonesian marketplaces by removing barriers for buyers who lack IDR accounts' : 'Mendukung pedagang lokal di marketplace Indonesia dengan menghilangkan hambatan bagi pembeli yang tidak memiliki akun IDR'}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-[#f5a623] flex-shrink-0 mt-1" />
                    <span>{language === 'en' ? 'Boosts sales and trust by offering a frictionless, transparent payment experience for local suppliers' : 'Meningkatkan penjualan dan kepercayaan dengan menawarkan pengalaman pembayaran yang transparan dan tanpa hambatan untuk supplier lokal'}</span>
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
              <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-8 shadow-xl">
                <img 
                  src="https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&q=80" 
                  alt="MerchantPay Illustration"
                  className="w-full h-auto rounded-xl shadow-lg"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-orange-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-[#1e3a5f] mb-4">
                {language === 'en' ? 'How GTrans MerchantPay Works' : 'Bagaimana GTrans MerchantPay Bekerja'}
              </h2>
              <p className="text-lg text-slate-600">
                {language === 'en' ? 'Simple, transparent, and efficient' : 'Sederhana, transparan, dan efisien'}
              </p>
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
            >
              <img 
                src="https://images.unsplash.com/photo-1556742111-a301076d9d18?w=800&q=80" 
                alt="Payment Process"
                className="w-full h-auto rounded-2xl shadow-xl"
              />
            </motion.div>
          </div>

          <div className="grid gap-6">
            {steps.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="border-slate-200 bg-white">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-[#f5a623] text-white flex items-center justify-center text-xl font-bold flex-shrink-0">
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
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <img 
                src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80" 
                alt="Business Benefits"
                className="w-full h-auto rounded-2xl shadow-xl"
              />
            </motion.div>
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-[#1e3a5f] mb-4">
                {language === 'en' ? 'Benefits for Both Sides' : 'Manfaat untuk Kedua Belah Pihak'}
              </h2>
              <p className="text-lg text-slate-600">
                {language === 'en' ? 'Streamlined payments that work for buyers and suppliers' : 'Pembayaran yang disederhanakan untuk pembeli dan supplier'}
              </p>
            </div>
          </div>

          {/* For Foreign Buyers */}
          <div className="mb-16">
            <h3 className="text-2xl font-bold text-[#1e3a5f] mb-8">
              {language === 'en' ? 'For Foreign Buyers' : 'Untuk Pembeli Asing'}
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              {buyerBenefits.map((benefit, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card className="h-full border-slate-200 hover:shadow-lg transition-all">
                    <CardContent className="p-6">
                      <div className="w-12 h-12 rounded-xl bg-[#f5a623]/10 flex items-center justify-center mb-4">
                        <benefit.icon className="w-6 h-6 text-[#f5a623]" />
                      </div>
                      <h4 className="text-lg font-bold text-[#1e3a5f] mb-2">{benefit.title}</h4>
                      <p className="text-slate-600">{benefit.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>

          {/* For Indonesian Suppliers */}
          <div>
            <h3 className="text-2xl font-bold text-[#1e3a5f] mb-8">
              {language === 'en' ? 'For Indonesian Suppliers' : 'Untuk Supplier Indonesia'}
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {supplierBenefits.map((benefit, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card className="h-full border-slate-200 hover:shadow-lg transition-all">
                    <CardContent className="p-6">
                      <div className="w-12 h-12 rounded-xl bg-[#1e3a5f]/10 flex items-center justify-center mb-4">
                        <benefit.icon className="w-6 h-6 text-[#1e3a5f]" />
                      </div>
                      <h4 className="text-lg font-bold text-[#1e3a5f] mb-2">{benefit.title}</h4>
                      <p className="text-slate-600">{benefit.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#f5a623] to-[#e09000]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            {language === 'en' ? 'Interested in GTrans MerchantPay?' : 'Tertarik dengan GTrans MerchantPay?'}
          </h2>
          <p className="text-lg text-slate-100 mb-8 max-w-2xl mx-auto">
            {language === 'en'
              ? 'Contact our sales team to learn more about this upcoming solution for cross-border merchant payments.'
              : 'Hubungi tim sales kami untuk mempelajari lebih lanjut tentang solusi mendatang untuk pembayaran merchant lintas batas ini.'
            }
          </p>
          <Link to={createPageUrl('GTransContactSales')}>
            <Button size="lg" className="bg-white text-[#f5a623] hover:bg-slate-100 text-lg px-8">
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