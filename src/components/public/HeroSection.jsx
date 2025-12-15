import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { ArrowRight, Globe, Shield, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export default function HeroSection({ language }) {
  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Animated circles */}
        <motion.div
          className="absolute top-20 right-20 w-96 h-96 rounded-full bg-[#1e3a5f]/5"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-20 left-10 w-64 h-64 rounded-full bg-[#f5a623]/10"
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
        
        {/* Animated currency flows */}
        <div className="absolute inset-0">
          {['USD', 'EUR', 'CNY', 'IDR', 'SGD'].map((currency, idx) => (
            <motion.div
              key={currency}
              className="absolute text-[#1e3a5f]/10 font-bold text-2xl"
              style={{
                left: `${10 + idx * 20}%`,
                top: `${20 + (idx % 3) * 25}%`
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.1, 0.3, 0.1]
              }}
              transition={{
                duration: 4 + idx,
                repeat: Infinity,
                ease: "easeInOut",
                delay: idx * 0.5
              }}
            >
              {currency}
            </motion.div>
          ))}
        </div>

        {/* Connection lines */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1200 800">
          <motion.path
            d="M100,400 Q400,200 600,400 T1100,400"
            stroke="#1e3a5f"
            strokeWidth="1"
            fill="none"
            strokeOpacity="0.1"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 3, repeat: Infinity, repeatType: "loop" }}
          />
          <motion.path
            d="M100,500 Q400,300 600,500 T1100,500"
            stroke="#f5a623"
            strokeWidth="1"
            fill="none"
            strokeOpacity="0.15"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 4, repeat: Infinity, repeatType: "loop", delay: 1 }}
          />
        </svg>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1e3a5f]/10 text-[#1e3a5f] text-sm font-medium mb-6">
              <Shield className="w-4 h-4" />
              {language === 'en' ? 'Bank Indonesia PSP Licensed' : 'Berlisensi PSP Bank Indonesia'}
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#1e3a5f] leading-tight mb-6">
              {language === 'en' 
                ? 'One platform for seamless, compliant fund transfers'
                : 'Satu platform untuk transfer dana yang mulus dan sesuai regulasi'
              }
            </h1>

            <p className="text-lg md:text-xl text-slate-600 mb-8 max-w-xl">
              {language === 'en'
                ? 'Cross-border B2B payments and collections for corporate clients. Multi-currency transfers between entities in different jurisdictions.'
                : 'Pembayaran dan penagihan B2B lintas batas untuk klien korporat. Transfer multi-mata uang antar entitas di yurisdiksi berbeda.'
              }
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link to={createPageUrl('GTransContactSales')}>
                <Button size="lg" className="bg-[#1e3a5f] hover:bg-[#152a45] text-lg px-8">
                  {language === 'en' ? 'Start Now' : 'Mulai Sekarang'}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to={createPageUrl('GTransWorkScheme')}>
                <Button size="lg" variant="outline" className="text-lg px-8 border-[#1e3a5f] text-[#1e3a5f]">
                  {language === 'en' ? 'See How It Works' : 'Lihat Cara Kerjanya'}
                </Button>
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="mt-12 flex flex-wrap items-center gap-8">
              <div className="flex items-center gap-2 text-slate-500">
                <Globe className="w-5 h-5" />
                <span className="text-sm">{language === 'en' ? '19+ Currencies' : '19+ Mata Uang'}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-500">
                <Shield className="w-5 h-5" />
                <span className="text-sm">{language === 'en' ? 'BI Regulated' : 'Diatur BI'}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-500">
                <Zap className="w-5 h-5" />
                <span className="text-sm">{language === 'en' ? 'Fast Settlement' : 'Penyelesaian Cepat'}</span>
              </div>
            </div>
          </motion.div>

          {/* Right Visual */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            {/* Main Card */}
            <div className="relative bg-white rounded-2xl shadow-2xl p-8 border border-slate-100">
              <div className="flex items-center justify-between mb-6">
                <div className="text-sm font-medium text-slate-500">
                  {language === 'en' ? 'Transfer Order' : 'Pesanan Transfer'}
                </div>
                <div className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-medium">
                  {language === 'en' ? 'Processing' : 'Diproses'}
                </div>
              </div>

              <div className="space-y-6">
                {/* From */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#1e3a5f]/10 flex items-center justify-center text-lg font-bold text-[#1e3a5f]">
                    ID
                  </div>
                  <div>
                    <div className="text-sm text-slate-500">{language === 'en' ? 'From' : 'Dari'}</div>
                    <div className="font-semibold text-slate-800">PT Example Corp</div>
                    <div className="text-sm text-slate-500">IDR 1,500,000,000</div>
                  </div>
                </div>

                {/* Arrow */}
                <div className="flex items-center justify-center">
                  <motion.div
                    animate={{ y: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="w-10 h-10 rounded-full bg-[#f5a623] flex items-center justify-center"
                  >
                    <ArrowRight className="w-5 h-5 text-white rotate-90" />
                  </motion.div>
                </div>

                {/* To */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#f5a623]/20 flex items-center justify-center text-lg font-bold text-[#f5a623]">
                    CN
                  </div>
                  <div>
                    <div className="text-sm text-slate-500">{language === 'en' ? 'To' : 'Ke'}</div>
                    <div className="font-semibold text-slate-800">Shenzhen Trading Co.</div>
                    <div className="text-sm text-slate-500">CNY 680,000.00</div>
                  </div>
                </div>
              </div>

              {/* Rate */}
              <div className="mt-6 pt-6 border-t border-slate-100">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">{language === 'en' ? 'Exchange Rate' : 'Kurs'}</span>
                  <span className="font-medium text-slate-800">1 CNY = 2,205.88 IDR</span>
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <motion.div
              className="absolute -top-4 -right-4 bg-white rounded-lg shadow-lg p-4 border border-slate-100"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                  <Shield className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-sm font-medium text-slate-700">
                  {language === 'en' ? 'Compliant' : 'Sesuai Regulasi'}
                </div>
              </div>
            </motion.div>

            <motion.div
              className="absolute -bottom-4 -left-4 bg-white rounded-lg shadow-lg p-4 border border-slate-100"
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, delay: 0.5 }}
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#f5a623]/20 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-[#f5a623]" />
                </div>
                <div className="text-sm font-medium text-slate-700">
                  {language === 'en' ? 'Fast Processing' : 'Proses Cepat'}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}