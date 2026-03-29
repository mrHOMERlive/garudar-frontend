import React, { useState } from 'react';
import { FileText, ShieldCheck } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import apiClient from '@/api/apiClient';

export default function ObligationsModal({ open, onAgreed }) {
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleOpenPdf = async () => {
    try {
      const res = await apiClient.getObligations();
      if (res?.url) {
        window.open(res.url, '_blank', 'noopener,noreferrer');
      } else {
        toast.error('Could not open document');
      }
    } catch {
      toast.error('Failed to load document');
    }
  };

  const handleAgree = async () => {
    if (!agreed) return;
    setLoading(true);
    try {
      await apiClient.acceptTerms();
      onAgreed();
    } catch {
      toast.error('Failed to save agreement. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        className="max-w-lg [&>button:last-child]:hidden"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[#1e3a5f] text-lg">
            <ShieldCheck className="w-5 h-5 text-[#1e3a5f]" />
            Obligations Management — Password &amp; User ID
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <p className="text-sm text-slate-600">
            Before accessing the platform, please review and accept the Password and User ID
            Obligations document issued by PT Garuda Arma Nusa.
          </p>
          <p className="text-sm text-slate-600">
            Sebelum mengakses platform, harap tinjau dan terima dokumen Kewajiban Password dan
            User ID yang diterbitkan oleh PT Garuda Arma Nusa.
          </p>

          <div className="text-center">
            <button
              type="button"
              onClick={handleOpenPdf}
              className="inline-flex items-center gap-2 text-[#1e3a5f] hover:text-[#f5a623] transition-colors"
            >
              <FileText className="w-5 h-5" />
              <span className="font-medium underline">
                Open Full Document (PDF) / Buka Dokumen Lengkap (PDF)
              </span>
            </button>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex items-start gap-3">
            <Checkbox
              id="obligations-agree"
              checked={agreed}
              onCheckedChange={setAgreed}
              className="mt-0.5"
            />
            <label htmlFor="obligations-agree" className="text-sm text-slate-700 cursor-pointer leading-relaxed">
              I have read and agree to the <strong>Obligations Management Password and User ID</strong> document.
              <br />
              <span className="text-slate-500">
                Saya telah membaca dan menyetujui dokumen <strong>Kewajiban Pengelolaan Password dan User ID</strong>.
              </span>
            </label>
          </div>

          <Button
            onClick={handleAgree}
            disabled={!agreed || loading}
            className="w-full bg-[#1e3a5f] hover:bg-[#152a45] py-5"
          >
            {loading ? 'Processing...' : 'I Agree / Saya Setuju'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
