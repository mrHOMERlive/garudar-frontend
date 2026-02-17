import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from 'framer-motion';
import {
  ArrowRight, CheckCircle, CreditCard, Globe, Zap,
  TrendingUp, Shield, Clock, Building2, Factory, Truck,
  Settings, Briefcase, ArrowLeft
} from 'lucide-react';

import PublicHeader from '@/components/public/PublicHeader';
import PublicFooter from '@/components/public/PublicFooter';

import { getLanguage, setLanguage } from '@/components/utils/language';

export default function GTransB2BPayments() {
  const language = getLanguage();

  const benefits = [
    {
      icon: Clock,
      title: language === 'en' ? 'Fast Settlement' : 'Penyelesaian Cepat',
      description: language === 'en' ? 'Streamlined processes so funds move quickly and predictably' : 'Proses efisien sehingga dana bergerak cepat dan dapat diprediksi'
    },
    {
      icon: Globe,
      title: language === 'en' ? 'Global Reach' : 'Jangkauan Global',
      description: language === 'en' ? 'Collections and payouts with counterparties around the world' : 'Koleksi dan pembayaran dengan mitra di seluruh dunia'
    },
    {
      icon: CreditCard,
      title: language === 'en' ? 'Multi-Currency Support' : 'Dukungan Multi-Mata Uang',
      description: language === 'en' ? 'Pay and get paid in major global currencies' : 'Bayar dan terima dalam mata uang global utama'
    },
    {
      icon: Zap,
      title: language === 'en' ? 'Lower Operational Friction' : 'Gesekan Operasional Lebih Rendah',
      description: language === 'en' ? 'Less manual work, fewer follow-ups and payment errors' : 'Lebih sedikit pekerjaan manual, lebih sedikit tindak lanjut dan kesalahan pembayaran'
    },
    {
      icon: TrendingUp,
      title: language === 'en' ? 'Clear Visibility' : 'Visibilitas Jelas',
      description: language === 'en' ? 'Reporting that makes reconciliation and cash management easier' : 'Pelaporan yang mempermudah rekonsiliasi dan manajemen kas'
    },
    {
      icon: Shield,
      title: language === 'en' ? 'Secure & Compliant' : 'Aman & Sesuai',
      description: language === 'en' ? 'Regulated service with full compliance and security' : 'Layanan teregulasi dengan kepatuhan dan keamanan penuh'
    }
  ];

  const industries = [
    {
      icon: Factory,
      title: language === 'en' ? 'Oil & Gas' : 'Minyak & Gas',
      image: 'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=800&q=80'
    },
    {
      icon: Settings,
      title: language === 'en' ? 'Machinery & Equipment' : 'Mesin & Peralatan',
      image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&q=80'
    },
    {
      icon: Building2,
      title: language === 'en' ? 'Manufacturing' : 'Manufaktur',
      image: 'https://images.unsplash.com/photo-1565043666747-69f6646db940?w=800&q=80'
    },
    {
      icon: Building2,
      title: language === 'en' ? 'Construction & EPC' : 'Konstruksi & EPC',
      image: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&q=80'
    },
    {
      icon: Truck,
      title: language === 'en' ? 'Trading Houses' : 'Trading Houses',
      image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&q=80'
    },
    {
      icon: Briefcase,
      title: language === 'en' ? 'Professional Services' : 'Layanan Profesional',
      image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80'
    }
  ];

  const howItWorks = [
    {
      step: 1,
      title: language === 'en' ? 'You agree a deal or issue an invoice' : 'Anda setuju kesepakatan atau keluarkan invoice',
      description: language === 'en' ? 'Set price and currency with your buyer or supplier.' : 'Tetapkan harga dan mata uang dengan pembeli atau pemasok Anda.'
    },
    {
      step: 2,
      title: language === 'en' ? 'Counterparty pays GTrans' : 'Pihak lawan bayar ke GTrans',
      description: language === 'en' ? 'Your counterparty pays into GTrans-designated accounts via our banking network.' : 'Pihak lawan Anda membayar ke akun yang ditentukan GTrans melalui jaringan perbankan kami.'
    },
    {
      step: 3,
      title: language === 'en' ? 'GTrans processes and converts' : 'GTrans proses dan konversi',
      description: language === 'en' ? 'We match the payment to your transaction, apply conversion if agreed, and prepare settlement.' : 'Kami mencocokkan pembayaran dengan transaksi Anda, terapkan konversi jika disepakati, dan siapkan penyelesaian.'
    },
    {
      step: 4,
      title: language === 'en' ? 'We settle funds to you or your beneficiary' : 'Kami selesaikan dana ke Anda atau beneficiary',
      description: language === 'en' ? 'Funds are sent to your nominated account, or directly to your supplier/beneficiary, in IDR or other agreed currencies.' : 'Dana dikirim ke akun yang Anda nominasikan, atau langsung ke pemasok/beneficiary Anda, dalam IDR atau mata uang lain yang disepakati.'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <PublicHeader language={language} setLanguage={setLanguage} />

      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-br from-[#1e3a5f] via-[#2d5a8f] to-[#1e3a5f] text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#f5a623] rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <Link to={createPageUrl('GTrans')} className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            {language === 'en' ? 'Back to Home' : 'Kembali ke Beranda'}
          </Link>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white text-sm font-medium mb-6">
                <CreditCard className="w-4 h-4" />
                GTrans B2B Payments
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                {language === 'en'
                  ? 'Cross-border payments for real-world businesses'
                  : 'Pembayaran lintas batas untuk bisnis dunia nyata'
                }
              </h1>
              <p className="text-xl text-blue-100 mb-8">
                {language === 'en'
                  ? 'Let your team focus on the core business. GTrans handles fast, compliant collections and settlements with counterparties worldwide.'
                  : 'Biarkan tim Anda fokus pada bisnis inti. GTrans menangani koleksi dan penyelesaian yang cepat dan sesuai dengan mitra di seluruh dunia.'
                }
              </p>
              <Link to={createPageUrl('GTransContactSales')}>
                <Button size="lg" className="bg-[#f5a623] hover:bg-[#e09000] text-white text-lg px-8">
                  {language === 'en' ? 'Get Started' : 'Mulai'}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <img
                src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&q=80"
                alt="Business"
                className="rounded-2xl shadow-2xl"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* What is GTrans B2B Payments */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1e3a5f] mb-6">
              {language === 'en' ? 'What is GTrans B2B Payments?' : 'Apa itu GTrans B2B Payments?'}
            </h2>
            <p className="text-lg text-slate-600 leading-relaxed">
              {language === 'en'
                ? 'GTrans B2B Payments is a cross-border payment service for companies that trade, manufacture, build and supply across borders.'
                : 'GTrans B2B Payments adalah layanan pembayaran lintas batas untuk perusahaan yang berdagang, memproduksi, membangun, dan memasok lintas batas.'
              }
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {[
              language === 'en' ? 'Receive funds from customers and partners worldwide' : 'Terima dana dari pelanggan dan mitra di seluruh dunia',
              language === 'en' ? 'Pay suppliers and affiliates in multiple currencies' : 'Bayar pemasok dan afiliasi dalam berbagai mata uang',
              language === 'en' ? 'Settle fast, with clear remittance details' : 'Selesaikan cepat, dengan detail remitansi yang jelas',
              language === 'en' ? 'Reduce time spent on payment operations so your team can focus on sales, production and delivery' : 'Kurangi waktu yang dihabiskan untuk operasi pembayaran sehingga tim Anda dapat fokus pada penjualan, produksi, dan pengiriman'
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-start gap-4 p-6 bg-gradient-to-br from-blue-50 to-white rounded-xl border border-blue-100"
              >
                <CheckCircle className="w-6 h-6 text-emerald-500 flex-shrink-0 mt-1" />
                <span className="text-slate-700 text-lg">{item}</span>
              </motion.div>
            ))}
          </div>

          <Card className="bg-gradient-to-br from-slate-50 to-blue-50 border-slate-200">
            <CardContent className="p-8">
              <p className="text-slate-600 text-center text-lg leading-relaxed">
                {language === 'en'
                  ? 'GTrans operates as a regulated remittance service, working with banking partners to move funds securely between entities in different countries.'
                  : 'GTrans beroperasi sebagai layanan remitansi teregulasi, bekerja sama dengan mitra perbankan untuk memindahkan dana dengan aman antar entitas di berbagai negara.'
                }
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Key Benefits */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1e3a5f] mb-4">
              {language === 'en' ? 'Key Benefits' : 'Manfaat Utama'}
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="h-full border-slate-200 hover:shadow-xl transition-all bg-white">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-xl bg-[#1e3a5f]/10 flex items-center justify-center mb-4">
                      <benefit.icon className="w-6 h-6 text-[#1e3a5f]" />
                    </div>
                    <h3 className="text-lg font-bold text-[#1e3a5f] mb-3">{benefit.title}</h3>
                    <p className="text-slate-600">{benefit.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1e3a5f] mb-4">
              {language === 'en' ? 'How It Works' : 'Cara Kerja'}
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.15 }}
                className="relative"
              >
                <Card className="h-full border-[#1e3a5f]/20 hover:shadow-lg transition-all">
                  <CardContent className="p-6">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#1e3a5f] to-[#2d5a8f] text-white flex items-center justify-center text-2xl font-bold mb-4">
                      {step.step}
                    </div>
                    <h3 className="text-lg font-bold text-[#1e3a5f] mb-3">{step.title}</h3>
                    <p className="text-slate-600">{step.description}</p>
                  </CardContent>
                </Card>
                {idx < howItWorks.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-[#1e3a5f] to-transparent" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Industries */}
      <section className="py-20 bg-gradient-to-br from-[#1e3a5f] to-[#2d5a8f] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {language === 'en' ? 'Built for Real Industries' : 'Dibangun untuk Industri Nyata'}
            </h2>
            <p className="text-lg text-blue-100 max-w-3xl mx-auto">
              {language === 'en'
                ? 'GTrans B2B Payments supports businesses in sectors where cross-border flows are mission-critical'
                : 'GTrans B2B Payments mendukung bisnis di sektor di mana aliran lintas batas sangat penting'
              }
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {industries.map((industry, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="overflow-hidden border-white/20 hover:shadow-2xl transition-all group">
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={industry.image}
                      alt={industry.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1e3a5f] via-[#1e3a5f]/50 to-transparent" />
                  </div>
                  <CardContent className="p-6 bg-white">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#1e3a5f]/10 flex items-center justify-center">
                        <industry.icon className="w-5 h-5 text-[#1e3a5f]" />
                      </div>
                      <h3 className="text-lg font-bold text-[#1e3a5f]">{industry.title}</h3>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-[#1e3a5f] mb-6">
            {language === 'en' ? 'Ready to streamline your cross-border payments?' : 'Siap untuk menyederhanakan pembayaran lintas batas Anda?'}
          </h2>
          <p className="text-lg text-slate-600 mb-8">
            {language === 'en'
              ? 'Contact our team to learn how GTrans B2B Payments can become your operational backbone.'
              : 'Hubungi tim kami untuk mengetahui bagaimana GTrans B2B Payments dapat menjadi tulang punggung operasional Anda.'
            }
          </p>
          <Link to={createPageUrl('GTransContactSales')}>
            <Button size="lg" className="bg-[#1e3a5f] hover:bg-[#152a45] text-white text-lg px-8">
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