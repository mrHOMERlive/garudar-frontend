import React, { useState } from 'react';
import apiClient from '@/api/apiClient';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Loader2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function ScreeningForm({ type, onResult }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [form, setForm] = useState({
    name: '', date_of_birth: '', nationality: '',
    registration_number: '', incorporation_country: '', external_id: ''
  });

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleScreen = async () => {
    if (!form.name.trim()) { toast.error('Name is required'); return; }
    setLoading(true);
    try {
      const data = type === 'person'
        ? await apiClient.screenPerson(form)
        : await apiClient.screenCompany(form);
      toast.success('Screening submitted successfully');
      setResult(data);
      onResult && onResult(data);
    } catch (err) {
      toast.error(err.message || 'Screening failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs text-slate-600">Full Name *</Label>
          <Input placeholder={type === 'person' ? 'John Doe' : 'Acme Corporation'} value={form.name} onChange={e => set('name', e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-slate-600">External ID (optional)</Label>
          <Input placeholder="e.g. CL001" value={form.external_id} onChange={e => set('external_id', e.target.value)} />
        </div>
        {type === 'person' && (
          <>
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-600">Date of Birth</Label>
              <Input type="date" value={form.date_of_birth} onChange={e => set('date_of_birth', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-600">Nationality (ISO 2-letter)</Label>
              <Input placeholder="e.g. ID, US, GB" value={form.nationality} onChange={e => set('nationality', e.target.value.toUpperCase())} maxLength={2} />
            </div>
          </>
        )}
        {type === 'company' && (
          <>
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-600">Registration Number</Label>
              <Input placeholder="e.g. 123456789" value={form.registration_number} onChange={e => set('registration_number', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-600">Incorporation Country (ISO)</Label>
              <Input placeholder="e.g. ID, US, GB" value={form.incorporation_country} onChange={e => set('incorporation_country', e.target.value.toUpperCase())} maxLength={2} />
            </div>
          </>
        )}
      </div>
      <Button onClick={handleScreen} disabled={loading} className="bg-[#1e3a5f] hover:bg-[#152a45]">
        {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Screening...</> : <><Shield className="w-4 h-4 mr-2" /> Run AML Screen</>}
      </Button>

      {result && (
        <div className="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
          <div className="flex items-center gap-2 text-emerald-700 font-semibold mb-2">
            <CheckCircle className="w-5 h-5" /> Screening Submitted
          </div>
          <div className="text-sm text-slate-600 space-y-1">
            {result.id && <div>Customer ID: <span className="font-mono text-slate-800">{result.id}</span></div>}
            {result.name && <div>Name: <span className="font-semibold text-slate-800">{result.name}</span></div>}
            {result.risk_level && <div>Risk Level: <span className="font-semibold text-slate-800 capitalize">{result.risk_level}</span></div>}
            {result.screening_result && <div>Result: <span className="font-semibold text-slate-800">{result.screening_result}</span></div>}
          </div>
        </div>
      )}
    </div>
  );
}
