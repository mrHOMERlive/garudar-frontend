import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Mail, Phone, MessageCircle, MapPin, CheckCircle, 
  ArrowRight, Send
} from 'lucide-react';

import PublicHeader from '@/components/public/PublicHeader';
import PublicFooter from '@/components/public/PublicFooter';

const PRODUCTS = [
  { value: 'gtrans', label: 'GTrans B2B Payments' },
  { value: 'merchantpay', label: 'GTrans MerchantPay' },
  { value: 'ecommerce', label: 'eCommerce Collect & Settle' }
];

const VOLUME_OPTIONS = [
  { value: 'under_100k', label: '< $100,000 / month' },
  { value: '100k_500k', label: '$100,000 - $500,000 / month' },
  { value: '500k_1m', label: '$500,000 - $1,000,000 / month' },
  { value: 'over_1m', label: '> $1,000,000 / month' }
];

export default function GTransContactSales() {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('gtrans_language') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('gtrans_language', language);
  }, [language]);

  const [formData, setFormData] = useState({
    company_name: '',
    country: '',
    contact_name: '',
    email: '',
    phone: '',
    products_interested: [],
    expected_volume: '',
    message: '',
    consent_given: false
  });

  const [submitted, setSubmitted] = useState(false);

  const submitMutation = useMutation({
    mutationFn: (data) => base44.entities.SalesLead.create({
      ...data,
      source_page: window.location.href
    }),
    onSuccess: () => {
      setSubmitted(true);
      toast.success(language === 'en' ? 'Thank you! We will contact you soon.' : 'Terima kasih! Kami akan segera menghubungi Anda.');
    },
    onError: () => {
      toast.error(language === 'en' ? 'Something went wrong. Please try again.' : 'Terjadi kesalahan. Silakan coba lagi.');
    }
  });

  const handleProductToggle = (product) => {
    const current = formData.products_interested;
    if (current.includes(product)) {
      setFormData({ ...formData, products_interested: current.filter(p => p !== product) });
    } else {
      setFormData({ ...formData, products_interested: [...current, product] });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.company_name || !formData.email || !formData.contact_name) {
      toast.error(language === 'en' ? 'Please fill all required fields' : 'Harap isi semua field yang wajib');
      return;
    }
    if (!formData.consent_given) {
      toast.error(language === 'en' ? 'Please agree to the Terms and Privacy Policy' : 'Harap setujui Syarat dan Kebijakan Privasi');
      return;
    }
    submitMutation.mutate(formData);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <PublicHeader language={language} setLanguage={setLanguage} />
      
      <main className="pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-[#1e3a5f] mb-6">
              {language === 'en' ? 'Contact Sales' : 'Hubungi Sales'}
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              {language === 'en'
                ? 'Share your details and our team will respond with onboarding steps and KYC/KYB requirements.'
                : 'Bagikan detail Anda dan tim kami akan merespons dengan langkah onboarding dan persyaratan KYC/KYB.'
              }
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-12">
            <div className="lg:col-span-1">
              <div className="sticky top-28 space-y-6">
                <h3 className="text-xl font-bold text-[#1e3a5f] mb-6">
                  {language === 'en' ? 'Get in Touch' : 'Hubungi Kami'}
                </h3>

                <Card className="border-slate-200">
                  <CardContent className="p-6">
                    <a href="mailto:sales@garudar.id" className="flex items-center gap-4 text-slate-700 hover:text-[#1e3a5f] transition-colors">
                      <div className="w-12 h-12 rounded-lg bg-[#1e3a5f]/10 flex items-center justify-center">
                        <Mail className="w-6 h-6 text-[#1e3a5f]" />
                      </div>
                      <div>
                        <div className="font-medium">Email</div>
                        <div className="text-sm text-slate-500">sales@garudar.id</div>
                      </div>
                    </a>
                  </CardContent>
                </Card>

                <Card className="border-slate-200">
                  <CardContent className="p-6">
                    <a href="https://wa.me/62778123456" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 text-slate-700 hover:text-[#1e3a5f] transition-colors">
                      <div className="w-12 h-12 rounded-lg bg-emerald-100 flex items-center justify-center">
                        <MessageCircle className="w-6 h-6 text-emerald-600" />
                      </div>
                      <div>
                        <div className="font-medium">WhatsApp</div>
                        <div className="text-sm text-slate-500">+62 778 123 456</div>
                      </div>
                    </a>
                  </CardContent>
                </Card>

                <Card className="border-slate-200">
                  <CardContent className="p-6">
                    <a href="tel:+62778123456" className="flex items-center gap-4 text-slate-700 hover:text-[#1e3a5f] transition-colors">
                      <div className="w-12 h-12 rounded-lg bg-[#f5a623]/20 flex items-center justify-center">
                        <Phone className="w-6 h-6 text-[#f5a623]" />
                      </div>
                      <div>
                        <div className="font-medium">{language === 'en' ? 'Phone' : 'Telepon'}</div>
                        <div className="text-sm text-slate-500">+62 778 123 456</div>
                      </div>
                    </a>
                  </CardContent>
                </Card>

                <Card className="border-slate-200">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-6 h-6 text-slate-600" />
                      </div>
                      <div>
                        <div className="font-medium text-slate-700">{language === 'en' ? 'Office' : 'Kantor'}</div>
                        <div className="text-sm text-slate-500">Batam, Kepulauan Riau, Indonesia</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="lg:col-span-2">
              {submitted ? (
                <Card className="border-slate-200">
                  <CardContent className="p-12 text-center">
                    <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
                      <CheckCircle className="w-10 h-10 text-emerald-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-[#1e3a5f] mb-4">
                      {language === 'en' ? 'Thank You!' : 'Terima Kasih!'}
                    </h3>
                    <p className="text-slate-600 mb-8">
                      {language === 'en'
                        ? 'Your inquiry has been submitted. Our sales team will contact you within 1-2 business days.'
                        : 'Pertanyaan Anda telah dikirim. Tim sales kami akan menghubungi Anda dalam 1-2 hari kerja.'
                      }
                    </p>
                    <Button 
                      variant="outline" 
                      onClick={() => setSubmitted(false)}
                      className="border-[#1e3a5f] text-[#1e3a5f]"
                    >
                      {language === 'en' ? 'Submit Another Inquiry' : 'Kirim Pertanyaan Lain'}
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-slate-200">
                  <CardContent className="p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label className="text-slate-700">
                            {language === 'en' ? 'Company Name' : 'Nama Perusahaan'} *
                          </Label>
                          <Input
                            value={formData.company_name}
                            onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                            placeholder={language === 'en' ? 'Your company name' : 'Nama perusahaan Anda'}
                            className="border-slate-300"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-slate-700">
                            {language === 'en' ? 'Country' : 'Negara'}
                          </Label>
                          <Input
                            value={formData.country}
                            onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                            placeholder={language === 'en' ? 'Country' : 'Negara'}
                            className="border-slate-300"
                          />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label className="text-slate-700">
                            {language === 'en' ? 'Contact Person' : 'Nama Kontak'} *
                          </Label>
                          <Input
                            value={formData.contact_name}
                            onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                            placeholder={language === 'en' ? 'Your name' : 'Nama Anda'}
                            className="border-slate-300"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-slate-700">
                            {language === 'en' ? 'Business Email' : 'Email Bisnis'} *
                          </Label>
                          <Input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder="email@company.com"
                            className="border-slate-300"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-slate-700">
                          {language === 'en' ? 'Phone / WhatsApp' : 'Telepon / WhatsApp'}
                        </Label>
                        <Input
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="+62 xxx xxx xxxx"
                          className="border-slate-300"
                        />
                      </div>

                      <div className="space-y-3">
                        <Label className="text-slate-700">
                          {language === 'en' ? 'Products Interested' : 'Produk yang Diminati'}
                        </Label>
                        <div className="grid md:grid-cols-3 gap-3">
                          {PRODUCTS.map((product) => (
                            <button
                              key={product.value}
                              type="button"
                              onClick={() => handleProductToggle(product.value)}
                              className={`p-4 rounded-lg border-2 text-left transition-all ${
                                formData.products_interested.includes(product.value)
                                  ? 'border-[#1e3a5f] bg-[#1e3a5f]/5'
                                  : 'border-slate-200 hover:border-slate-300'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                  formData.products_interested.includes(product.value)
                                    ? 'border-[#1e3a5f] bg-[#1e3a5f]'
                                    : 'border-slate-300'
                                }`}>
                                  {formData.products_interested.includes(product.value) && (
                                    <CheckCircle className="w-3 h-3 text-white" />
                                  )}
                                </div>
                                <span className="text-sm font-medium text-slate-700">{product.label}</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-slate-700">
                          {language === 'en' ? 'Expected Monthly Volume' : 'Perkiraan Volume Bulanan'}
                        </Label>
                        <select
                          value={formData.expected_volume}
                          onChange={(e) => setFormData({ ...formData, expected_volume: e.target.value })}
                          className="w-full h-10 px-3 rounded-md border border-slate-300 bg-white text-slate-800"
                        >
                          <option value="">{language === 'en' ? 'Select volume' : 'Pilih volume'}</option>
                          {VOLUME_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-slate-700">
                          {language === 'en' ? 'Message / Additional Context' : 'Pesan / Konteks Tambahan'}
                        </Label>
                        <Textarea
                          value={formData.message}
                          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                          placeholder={language === 'en' ? 'Tell us about your business needs...' : 'Ceritakan kebutuhan bisnis Anda...'}
                          className="border-slate-300 min-h-[120px]"
                        />
                      </div>

                      <div className="flex items-start gap-3">
                        <Checkbox
                          id="consent"
                          checked={formData.consent_given}
                          onCheckedChange={(checked) => setFormData({ ...formData, consent_given: checked })}
                        />
                        <Label htmlFor="consent" className="text-sm text-slate-600 cursor-pointer">
                          {language === 'en'
                            ? 'I agree to the Terms of Service and Privacy Policy'
                            : 'Saya setuju dengan Syarat Layanan dan Kebijakan Privasi'
                          }
                        </Label>
                      </div>

                      <Button 
                        type="submit" 
                        disabled={submitMutation.isPending}
                        className="w-full bg-[#1e3a5f] hover:bg-[#152a45] py-6 text-lg"
                      >
                        {submitMutation.isPending ? (
                          language === 'en' ? 'Submitting...' : 'Mengirim...'
                        ) : (
                          <>
                            {language === 'en' ? 'Submit Inquiry' : 'Kirim Pertanyaan'}
                            <Send className="w-5 h-5 ml-2" />
                          </>
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>

      <PublicFooter language={language} setLanguage={setLanguage} />
    </div>
  );
}