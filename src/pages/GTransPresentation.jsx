import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from 'framer-motion';
import { 
  Lock, ArrowRight, ArrowLeft, Building2, Globe, Workflow, 
  Users, Shield, Zap, CreditCard, ShoppingCart, RefreshCw,
  CheckCircle, MapPin, Calendar, FileText, Code, Mail, Phone
} from 'lucide-react';
import { cn } from "@/lib/utils";

const LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69233f5a9a123941f81322f5/b1a1be267_gan.png";
const PRESENTATION_PASSWORD = 'gtrans2026';

export default function GTransPresentation() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const sessionAuth = sessionStorage.getItem('gtrans_presentation_auth');
    if (sessionAuth === 'true') {
      setAuthenticated(true);
    }
    
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    document.head.appendChild(meta);
    
    return () => {
      document.head.removeChild(meta);
    };
  }, []);

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (password === PRESENTATION_PASSWORD) {
      sessionStorage.setItem('gtrans_presentation_auth', 'true');
      setAuthenticated(true);
      setError('');
    } else {
      setError('Incorrect password. Please try again.');
    }
  };

  const slides = [
    {
      id: 'intro',
      content: (
        <div className="min-h-screen bg-[#1e3a5f] flex items-center justify-center p-8">
          <div className="text-center text-white max-w-4xl">
            <div className="w-32 h-32 bg-white rounded-2xl mx-auto mb-8 p-4 shadow-2xl">
              <img src={LOGO_URL} alt="GTrans" className="w-full h-full object-contain" />
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6">GTrans</h1>
            <p className="text-2xl md:text-3xl text-slate-300 mb-8">
              One platform for seamless, compliant fund transfers across the globe.
            </p>
            <div className="flex items-center justify-center gap-4 text-slate-400 text-sm">
              <span className="px-4 py-2 rounded-full border border-slate-500">PRIVATE & CONFIDENTIAL</span>
            </div>
            <div className="mt-12 flex items-center justify-center gap-6 text-slate-400">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Batam, Indonesia
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                2026
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'contents',
      content: (
        <div className="min-h-screen bg-slate-50 p-8 md:p-16">
          <h2 className="text-4xl font-bold text-[#1e3a5f] mb-12 text-center">Contents</h2>
          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {[
              { icon: Users, title: 'Who & Why', desc: 'Company overview' },
              { icon: CreditCard, title: 'Product Portfolio', desc: 'Our solutions' },
              { icon: Workflow, title: 'Core Funds-Flow', desc: 'How it works' },
              { icon: Zap, title: 'Our Advantage', desc: 'Why choose us' },
              { icon: FileText, title: 'Operations Flow', desc: 'Process details' },
              { icon: Code, title: 'Technology Roadmap', desc: 'Future plans' },
              { icon: Building2, title: 'Teams & Contacts', desc: 'Get in touch' }
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                onClick={() => setCurrentSlide(idx + 2)}
                className="cursor-pointer"
              >
                <Card className="border-slate-200 hover:border-[#1e3a5f] hover:shadow-lg transition-all h-full">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-xl bg-[#1e3a5f]/10 flex items-center justify-center mb-4">
                      <item.icon className="w-6 h-6 text-[#1e3a5f]" />
                    </div>
                    <h3 className="font-bold text-[#1e3a5f] mb-2">{item.title}</h3>
                    <p className="text-sm text-slate-500">{item.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )
    },
    {
      id: 'who-why',
      content: (
        <div className="min-h-screen bg-white p-8 md:p-16">
          <h2 className="text-4xl font-bold text-[#1e3a5f] mb-12">Who & Why</h2>
          <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
            <div>
              <h3 className="text-2xl font-bold text-[#1e3a5f] mb-6">Who is GTrans?</h3>
              <div className="space-y-4 text-slate-600">
                <p className="text-lg">
                  <strong className="text-[#1e3a5f]">GTrans</strong> – cross-border funds transfer for businesses.
                </p>
                <p>
                  GAN's cross-border funds transfer (remittance) service for corporate clients, enabling multi-currency payouts and collections between entities in different countries.
                </p>
                <p>
                  Operating under Bank Indonesia's PSP licensing framework for remittance, meeting all capital adequacy, risk management, ownership, and technology control requirements.
                </p>
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-[#f5a623] mb-6">Why Now?</h3>
              <div className="space-y-4">
                {[
                  'Cross-border payment flows are exploding globally',
                  'BRICS and new trade corridors are emerging',
                  'Demand for alternative, flexible payment solutions',
                  'Indonesian businesses need reliable cross-border partners',
                  'Regulatory frameworks now support innovation'
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-600">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'products',
      content: (
        <div className="min-h-screen bg-slate-50 p-8 md:p-16">
          <h2 className="text-4xl font-bold text-[#1e3a5f] mb-4">Product Portfolio</h2>
          <p className="text-slate-600 mb-12">Operating under Bank Indonesia's PSP licensing framework</p>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                icon: CreditCard,
                title: 'GTrans B2B',
                subtitle: 'Cross-border Pay-in / Pay-out',
                desc: 'Inbound and outbound payments for corporate clients, multi-currency payouts and collections between entities in different jurisdictions.',
                color: 'bg-[#1e3a5f]'
              },
              {
                icon: RefreshCw,
                title: 'GTrans MerchantPay',
                subtitle: 'Foreign Currency Acceptance',
                desc: 'Foreign buyers pay Indonesian suppliers in their home currency. GTrans manages FX conversion and settlement into IDR or other currencies.',
                color: 'bg-[#f5a623]'
              },
              {
                icon: ShoppingCart,
                title: 'eCommerce Collect & Settle',
                subtitle: 'Marketplace Solutions',
                desc: 'Non-IDR collection with local currency settlement for Indonesian marketplace sellers. Collect via partners, settle in local currency.',
                color: 'bg-emerald-600'
              }
            ].map((product, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="border-slate-200 h-full">
                  <CardContent className="p-8">
                    <div className={`w-14 h-14 rounded-xl ${product.color} flex items-center justify-center mb-6`}>
                      <product.icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-[#1e3a5f] mb-2">{product.title}</h3>
                    <p className="text-sm text-[#f5a623] font-medium mb-4">{product.subtitle}</p>
                    <p className="text-slate-600">{product.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )
    },
    {
      id: 'contact',
      content: (
        <div className="min-h-screen bg-[#1e3a5f] flex items-center justify-center p-8">
          <div className="text-center text-white max-w-4xl">
            <div className="w-24 h-24 bg-white rounded-2xl mx-auto mb-8 p-3">
              <img src={LOGO_URL} alt="GTrans" className="w-full h-full object-contain" />
            </div>
            <h2 className="text-4xl font-bold mb-8">Let's Connect</h2>
            
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <div className="bg-white/10 rounded-xl p-6">
                <Mail className="w-8 h-8 mx-auto mb-4" />
                <div className="text-lg font-medium">Email</div>
                <div className="text-slate-300">contact@garudar.id</div>
              </div>
              <div className="bg-white/10 rounded-xl p-6">
                <Phone className="w-8 h-8 mx-auto mb-4" />
                <div className="text-lg font-medium">Phone</div>
                <div className="text-slate-300">+62 778 123 456</div>
              </div>
              <div className="bg-white/10 rounded-xl p-6">
                <MapPin className="w-8 h-8 mx-auto mb-4" />
                <div className="text-lg font-medium">Location</div>
                <div className="text-slate-300">Batam, Indonesia</div>
              </div>
            </div>
            
            <p className="text-slate-400 text-sm">
              PRIVATE & CONFIDENTIAL • PT Garuda Arma Nusa • 2026
            </p>
          </div>
        </div>
      )
    }
  ];

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1e3a5f] to-[#0f1d2f] flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-0 shadow-2xl">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-slate-100 rounded-2xl mx-auto mb-4 p-3">
                <img src={LOGO_URL} alt="GTrans" className="w-full h-full object-contain" />
              </div>
              <h1 className="text-2xl font-bold text-[#1e3a5f] mb-2">GTrans Presentation</h1>
              <p className="text-slate-500 text-sm">This content is private and confidential</p>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-6">
              <div className="space-y-2">
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter access password"
                    className="pl-10 border-slate-300"
                  />
                </div>
                {error && <p className="text-red-500 text-sm">{error}</p>}
              </div>

              <Button type="submit" className="w-full bg-[#1e3a5f] hover:bg-[#152a45]">
                Enter
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="relative">
      <motion.div
        key={currentSlide}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {slides[currentSlide].content}
      </motion.div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
            disabled={currentSlide === 0}
            className="border-slate-300"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          <div className="flex items-center gap-2">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={cn(
                  "w-2 h-2 rounded-full transition-all",
                  currentSlide === idx ? "w-8 bg-[#1e3a5f]" : "bg-slate-300"
                )}
              />
            ))}
          </div>

          <Button
            onClick={() => setCurrentSlide(Math.min(slides.length - 1, currentSlide + 1))}
            disabled={currentSlide === slides.length - 1}
            className="bg-[#1e3a5f] hover:bg-[#152a45]"
          >
            Next
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}