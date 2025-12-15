import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from 'sonner';
import { Eye, EyeOff, ArrowRight, Shield } from 'lucide-react';

const LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69233f5a9a123941f81322f5/b1a1be267_gan.png";

export default function GTransLogin() {
  const navigate = useNavigate();
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('gtrans_language') || 'en';
  });
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    localStorage.setItem('gtrans_language', language);
  }, [language]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error(language === 'en' ? 'Please fill all fields' : 'Harap isi semua field');
      return;
    }

    setLoading(true);
    
    try {
      localStorage.setItem('gtrans_client_logged_in', 'true');
      navigate(createPageUrl('UserDashboard'));
    } catch (error) {
      toast.error(language === 'en' 
        ? 'Invalid credentials. Please try again.' 
        : 'Kredensial tidak valid. Silakan coba lagi.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to={createPageUrl('GTrans')} className="inline-flex items-center gap-3">
            <div className="w-14 h-14 bg-white rounded-xl shadow-lg p-2">
              <img src={LOGO_URL} alt="GTrans" className="w-full h-full object-contain" />
            </div>
            <span className="text-2xl font-bold text-[#1e3a5f]">GTrans</span>
          </Link>
        </div>

        <Card className="border-slate-200 shadow-xl">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-[#1e3a5f] mb-2">
                {language === 'en' ? 'Client Login' : 'Login Klien'}
              </h1>
              <p className="text-slate-500">
                {language === 'en' 
                  ? 'Access your GTrans account' 
                  : 'Akses akun GTrans Anda'
                }
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label className="text-slate-700">Email</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@company.com"
                  className="border-slate-300"
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-slate-700">
                    {language === 'en' ? 'Password' : 'Kata Sandi'}
                  </Label>
                  <button
                    type="button"
                    className="text-sm text-[#1e3a5f] hover:underline"
                  >
                    {language === 'en' ? 'Forgot password?' : 'Lupa kata sandi?'}
                  </button>
                </div>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="border-slate-300 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={loading}
                className="w-full bg-[#1e3a5f] hover:bg-[#152a45] py-6"
              >
                {loading 
                  ? (language === 'en' ? 'Logging in...' : 'Masuk...')
                  : (language === 'en' ? 'Login' : 'Masuk')
                }
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-slate-500 text-sm">
                {language === 'en' ? "Don't have an account?" : 'Belum punya akun?'}
              </p>
              <Link 
                to={createPageUrl('GTransContactSales')} 
                className="text-[#1e3a5f] font-medium hover:underline text-sm"
              >
                {language === 'en' ? 'Contact Sales to Get Started' : 'Hubungi Sales untuk Memulai'}
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 flex items-center justify-center gap-2 text-slate-500 text-sm">
          <Shield className="w-4 h-4" />
          {language === 'en' ? 'Secured by Bank Indonesia PSP framework' : 'Diamankan oleh kerangka PSP Bank Indonesia'}
        </div>

        <div className="mt-4 text-center">
          <button
            onClick={() => setLanguage(language === 'en' ? 'id' : 'en')}
            className="text-sm text-slate-500 hover:text-[#1e3a5f]"
          >
            {language === 'en' ? 'Bahasa Indonesia' : 'English'}
          </button>
        </div>

        <div className="mt-6 text-center">
          <Link 
            to={createPageUrl('GTrans')} 
            className="text-slate-500 hover:text-[#1e3a5f] text-sm"
          >
            ← {language === 'en' ? 'Back to Home' : 'Kembali ke Beranda'}
          </Link>
        </div>
      </div>
    </div>
  );
}