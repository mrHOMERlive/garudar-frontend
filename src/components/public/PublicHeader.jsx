import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import {
  ChevronDown, Menu, X, Globe, ArrowRight,
  CreditCard, RefreshCw, Building2, ShoppingCart,
  Code, MessageSquare, FileText, HelpCircle, Workflow
} from 'lucide-react';
import { cn } from "@/lib/utils";

const LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69233f5a9a123941f81322f5/b1a1be267_gan.png";

export default function PublicHeader({ language, setLanguage }) {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleStaffClick = (e) => {
    e.preventDefault();
    const savedUser = localStorage.getItem('gtrans_user');
    
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      if (userData.role === 'ADMIN') {
        navigate(createPageUrl('StaffDashboard'));
      } else {
        navigate(createPageUrl('GTrans'));
      }
    } else {
      navigate(createPageUrl('GTrans'));
    }
  };

  const navItems = [
    {
      label: language === 'en' ? 'Products' : 'Produk',
      items: [
        {
          label: language === 'en' ? 'GTrans B2B Payments' : 'GTrans Pembayaran B2B',
          description: language === 'en' ? 'Cross-border pay-in / pay-out for businesses' : 'Pembayaran lintas batas untuk bisnis',
          icon: CreditCard,
          href: createPageUrl('GTransB2BPayments')
        },
        {
          label: language === 'en' ? 'GTrans eCommerce Collect & Settle' : 'GTrans Koleksi & Penyelesaian eCommerce',
          description: language === 'en' ? 'Get paid globally, settle locally' : 'Terima pembayaran global, selesaikan lokal',
          icon: ShoppingCart,
          href: createPageUrl('GTransECommerceCollectSettle')
        },
        {
          label: 'GTrans MerchantPay',
          description: language === 'en' ? 'Foreign buyers pay in their currency' : 'Pembeli asing bayar dalam mata uang mereka',
          icon: RefreshCw,
          href: createPageUrl('GTransMerchantPay')
        }
      ]
    },
    {
      label: language === 'en' ? 'Solutions' : 'Solusi',
      items: [
        {
          label: language === 'en' ? 'FX Solutions' : 'Solusi FX',
          description: language === 'en' ? 'Competitive rates, zero fees, transparent pricing' : 'Kurs kompetitif, nol biaya, harga transparan',
          icon: RefreshCw,
          href: createPageUrl('GTransFXSolutions')
        },
        {
          label: language === 'en' ? 'API Integration' : 'Integrasi API',
          description: language === 'en' ? 'Connect via our platform APIs' : 'Hubungkan melalui API platform kami',
          icon: Code,
          href: createPageUrl('GTransAPIIntegration')
        },
        {
          label: language === 'en' ? 'Marketplaces & Platforms' : 'Marketplace & Platform',
          description: language === 'en' ? 'Coming soon' : 'Segera hadir',
          icon: Building2,
          href: '#'
        }
      ]
    },
    {
      label: language === 'en' ? 'Resources' : 'Sumber Daya',
      items: [
        {
          label: language === 'en' ? 'Documentation' : 'Dokumentasi',
          icon: FileText,
          href: createPageUrl('GTransDocumentation')
        },
        {
          label: language === 'en' ? 'Work Scheme' : 'Skema Kerja',
          icon: Workflow,
          href: createPageUrl('GTransWorkScheme')
        },
        {
          label: language === 'en' ? 'FAQ' : 'FAQ',
          icon: HelpCircle,
          href: createPageUrl('GTransFAQ')
        }
      ]
    }
  ];

  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white shadow-sm",
      scrolled ? "py-2" : "py-4"
    )}>
      {/* Abstract Background Graphics */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className={cn(
          "absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#1e3a5f]/10 to-transparent rounded-full blur-3xl transition-opacity",
          scrolled ? "opacity-30" : "opacity-50"
        )} />
        <div className={cn(
          "absolute top-10 left-1/4 w-64 h-64 bg-gradient-to-br from-[#f5a623]/10 to-transparent rounded-full blur-2xl transition-opacity",
          scrolled ? "opacity-20" : "opacity-40"
        )} />
        <svg className={cn(
          "absolute inset-0 w-full h-full transition-opacity",
          scrolled ? "opacity-10" : "opacity-20"
        )} xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style={{ stopColor: '#1e3a5f', stopOpacity: 0.2 }} />
              <stop offset="100%" style={{ stopColor: '#f5a623', stopOpacity: 0.2 }} />
            </linearGradient>
          </defs>
          <path d="M0,20 Q400,10 800,20 T1600,20" stroke="url(#grad1)" strokeWidth="2" fill="none" opacity="0.3" />
          <path d="M0,40 Q400,50 800,40 T1600,40" stroke="url(#grad1)" strokeWidth="1.5" fill="none" opacity="0.2" />
          <circle cx="200" cy="30" r="3" fill="#1e3a5f" opacity="0.2" />
          <circle cx="600" cy="25" r="2" fill="#f5a623" opacity="0.3" />
          <circle cx="1000" cy="35" r="2.5" fill="#1e3a5f" opacity="0.2" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to={createPageUrl('GTrans')} className="flex items-center gap-3 group">
            <div className={cn(
              "rounded-xl flex items-center justify-center p-2 bg-white shadow-md transition-all",
              scrolled ? "w-12 h-12" : "w-14 h-14"
            )}>
              <img src={LOGO_URL} alt="GTrans" className="w-full h-full object-contain" />
            </div>
            <div className="flex flex-col">
              <span className={cn(
                "font-bold transition-all text-[#1e3a5f]",
                scrolled ? "text-xl" : "text-2xl"
              )}>
                GTrans
              </span>
              <span className="text-xs text-[#f5a623] font-medium">by PT Garuda Arma Nusa</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item, idx) => (
              <div
                key={idx}
                className="relative"
                onMouseEnter={() => setActiveDropdown(idx)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <button className="flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors">
                  {item.label}
                  <ChevronDown className={cn(
                    "w-4 h-4 transition-transform",
                    activeDropdown === idx && "rotate-180"
                  )} />
                </button>

                {activeDropdown === idx && (
                  <div className="absolute top-full left-0 pt-2 w-80 z-50">
                    <div className="bg-white rounded-xl shadow-xl border border-slate-200 p-2 animate-in fade-in slide-in-from-top-2 duration-200">
                      {item.items.map((subItem, subIdx) => (
                        <Link
                          key={subIdx}
                          to={subItem.href}
                          className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors"
                        >
                          <div className="w-10 h-10 rounded-lg bg-[#1e3a5f]/10 flex items-center justify-center flex-shrink-0">
                            <subItem.icon className="w-5 h-5 text-[#1e3a5f]" />
                          </div>
                          <div>
                            <div className="font-medium text-slate-900">{subItem.label}</div>
                            {subItem.description && (
                              <div className="text-sm text-slate-500 mt-0.5">{subItem.description}</div>
                            )}
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Language Switcher */}
            <button
              onClick={() => setLanguage(language === 'en' ? 'id' : 'en')}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <span className="text-lg">{language === 'en' ? '🇬🇧' : '🇮🇩'}</span>
              {language === 'en' ? 'EN' : 'ID'}
            </button>

            <Link to={createPageUrl('GTransLogin')}>
              <Button variant="ghost" className="text-slate-700">
                {language === 'en' ? 'Login' : 'Masuk'}
              </Button>
            </Link>

            <Link to={createPageUrl('GTransContactSales')}>
              <Button className="bg-[#1e3a5f] hover:bg-[#152a45]">
                {language === 'en' ? 'Contact Sales' : 'Hubungi Sales'}
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>

            <Button 
              variant="outline" 
              size="sm" 
              className="text-slate-500 border-slate-300"
              onClick={handleStaffClick}
            >
              {language === 'en' ? 'For Staff' : 'Untuk Staf'}
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-slate-100"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-4 pb-4 border-t border-slate-200 pt-4">
            <div className="space-y-2">
              {navItems.map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="text-xs font-semibold text-slate-400 uppercase px-3 pt-2">
                    {item.label}
                  </div>
                  {item.items.map((subItem, subIdx) => (
                    <Link
                      key={subIdx}
                      to={subItem.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-100"
                    >
                      <subItem.icon className="w-5 h-5 text-[#1e3a5f]" />
                      <span className="text-slate-700">{subItem.label}</span>
                    </Link>
                  ))}
                </div>
              ))}

              <div className="pt-4 space-y-2 border-t border-slate-200 mt-4">
                <Link to={createPageUrl('GTransLogin')} onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full">
                    {language === 'en' ? 'Login' : 'Masuk'}
                  </Button>
                </Link>
                <Link to={createPageUrl('GTransContactSales')} onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full bg-[#1e3a5f] hover:bg-[#152a45]">
                    {language === 'en' ? 'Contact Sales' : 'Hubungi Sales'}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}