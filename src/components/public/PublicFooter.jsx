import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Mail, Phone, MessageCircle, MapPin, Linkedin, Globe } from 'lucide-react';

const LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69233f5a9a123941f81322f5/b1a1be267_gan.png";

export default function PublicFooter({ language, setLanguage }) {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    products: [
      { label: language === 'en' ? 'B2B Payments' : 'Pembayaran B2B', href: createPageUrl('GTrans') + '#products' },
      { label: 'MerchantPay', href: createPageUrl('GTrans') + '#products' },
      { label: 'eCommerce Collect', href: createPageUrl('GTrans') + '#products' }
    ],
    resources: [
      { label: language === 'en' ? 'Documentation' : 'Dokumentasi', href: createPageUrl('GTransDocumentation') },
      { label: language === 'en' ? 'Work Scheme' : 'Skema Kerja', href: createPageUrl('GTransWorkScheme') },
      { label: 'FAQ', href: createPageUrl('GTransFAQ') },
      { label: language === 'en' ? 'Contact Sales' : 'Hubungi Sales', href: createPageUrl('GTransContactSales') }
    ],
    legal: [
      { label: language === 'en' ? 'Terms of Service' : 'Syarat Layanan', href: '#' },
      { label: language === 'en' ? 'Privacy Policy' : 'Kebijakan Privasi', href: '#' },
      { label: language === 'en' ? 'Cookie Policy' : 'Kebijakan Cookie', href: '#' },
      { label: language === 'en' ? 'Regulatory Notices' : 'Pemberitahuan Regulasi', href: '#' }
    ]
  };

  return (
    <footer className="bg-[#1e3a5f] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-white rounded-lg p-1">
                <img src={LOGO_URL} alt="GTrans" className="w-full h-full object-contain" />
              </div>
              <div>
                <div className="font-bold text-xl">GTrans</div>
                <div className="text-sm text-slate-300">by PT Garuda Arma Nusa</div>
              </div>
            </div>
            <p className="text-slate-300 mb-6 max-w-sm">
              {language === 'en'
                ? 'One platform for seamless, compliant fund transfers across the globe. Licensed under Bank Indonesia PSP framework.'
                : 'Satu platform untuk transfer dana yang mulus dan sesuai regulasi di seluruh dunia. Berlisensi di bawah kerangka PSP Bank Indonesia.'
              }
            </p>

            {/* Contact Info */}
            <div className="space-y-3">
              <a href="mailto:info@garudar.id" className="flex items-center gap-3 text-slate-300 hover:text-white transition-colors">
                <Mail className="w-5 h-5" />
                info@garudar.id
              </a>
              <a href="tel:+6281117796126" className="flex items-center gap-3 text-slate-300 hover:text-white transition-colors">
                <Phone className="w-5 h-5" />
                +62 811 1779 6126
              </a>
              <a href="https://wa.me/6281117796126" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-slate-300 hover:text-white transition-colors">
                <MessageCircle className="w-5 h-5" />
                WhatsApp
              </a>
              <div className="flex items-start gap-3 text-slate-300">
                <MapPin className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>Batam, Kepulauan Riau, Indonesia</span>
              </div>
            </div>
          </div>

          {/* Products */}
          <div>
            <h4 className="font-semibold mb-4">{language === 'en' ? 'Products' : 'Produk'}</h4>
            <ul className="space-y-3">
              {footerLinks.products.map((link, idx) => (
                <li key={idx}>
                  <Link to={link.href} className="text-slate-300 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-semibold mb-4">{language === 'en' ? 'Resources' : 'Sumber Daya'}</h4>
            <ul className="space-y-3">
              {footerLinks.resources.map((link, idx) => (
                <li key={idx}>
                  <Link to={link.href} className="text-slate-300 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-4">{language === 'en' ? 'Legal' : 'Legal'}</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link, idx) => (
                <li key={idx}>
                  <Link to={link.href} className="text-slate-300 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/20 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-slate-400 text-sm">
            © {currentYear} PT Garuda Arma Nusa. {language === 'en' ? 'All rights reserved.' : 'Hak cipta dilindungi.'}
          </div>

          <div className="flex items-center gap-6">
            {/* Language Switcher */}
            <button
              onClick={() => setLanguage(language === 'en' ? 'id' : 'en')}
              className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
            >
              <span className="text-lg">{language === 'en' ? '🇬🇧' : '🇮🇩'}</span>
              {language === 'en' ? 'English' : 'Bahasa Indonesia'}
            </button>

            {/* Social Links */}
            <div className="flex items-center gap-4">
              <a href="#" className="text-slate-400 hover:text-white transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}