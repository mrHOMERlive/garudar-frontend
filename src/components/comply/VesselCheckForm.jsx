import React, { useState } from 'react';
import apiClient from '@/api/apiClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Ship, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { imoIsValid, normalizeImo } from './imo';

// Проверка судна по номеру IMO по нашим спискам: OFAC SDN, UK, SECO и перечень
// судов Регламента ЕС 833/2014 (приложение XLII). Без ComplyAdvantage и без
// создания AML-клиента. Совпадение по IMO — точное; по имени — только
// подсказка (суда переименовывают).

function KV({ k, v }) {
  if (v === null || v === undefined || v === '' || (Array.isArray(v) && v.length === 0)) return null;
  return (
    <div className="text-xs flex gap-2">
      <span className="text-slate-500 min-w-[110px]">{k}:</span>
      <span className="text-slate-800 break-words">{Array.isArray(v) ? v.join(', ') : String(v)}</span>
    </div>
  );
}

function VesselMatch({ m }) {
  const byImo = m.match === 'imo';
  return (
    <div
      className={`rounded-lg border p-3 space-y-1 ${byImo ? 'border-red-200 bg-red-50/60' : 'border-amber-200 bg-amber-50/60'}`}
      data-testid={`vessel-match-${m.source_list}-${m.source_ref}`}
    >
      <div className="flex items-center gap-2 flex-wrap">
        <Badge className="bg-red-700 text-white font-mono text-[10px]">LIST • {m.source_list}</Badge>
        <span className="font-semibold text-slate-800">{m.full_name}</span>
        <Badge
          className={
            byImo
              ? 'bg-red-100 text-red-800 border border-red-300 text-[10px]'
              : 'bg-amber-100 text-amber-900 border border-amber-300 text-[10px]'
          }
        >
          {byImo ? 'IMO match' : `Name only${m.similarity != null ? ` · ${Math.round(m.similarity * 100)}%` : ''}`}
        </Badge>
      </div>
      <KV k="IMO" v={m.imo} />
      <KV k="Other names" v={m.aliases} />
      <KV k="Flag" v={m.flag} />
      <KV k="Vessel type" v={m.vessel_type} />
      <KV k="Info" v={m.additional_info} />
      <KV k="Reference" v={m.list_label || m.source_ref} />
      <KV k="List loaded" v={m.load_date} />
    </div>
  );
}

export default function VesselCheckForm() {
  const [imo, setImo] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const normalized = normalizeImo(imo);
  const imoError = imo.trim() && !(normalized && imoIsValid(normalized)) ? 'Invalid IMO number' : null;

  const handleCheck = async () => {
    if (!normalized || !imoIsValid(normalized)) {
      toast.error('Enter a valid 7-digit IMO number');
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      setResult(await apiClient.screenVessel({ imo: normalized, name: name.trim() || null }));
    } catch (err) {
      toast.error(err.message || 'Vessel check failed');
    } finally {
      setLoading(false);
    }
  };

  const matches = result?.matches || [];
  const imoMatches = matches.filter((m) => m.match === 'imo');
  const nameMatches = matches.filter((m) => m.match !== 'imo');

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs text-slate-600">IMO number *</Label>
          <Input
            placeholder="e.g. 9179842"
            value={imo}
            onChange={(e) => setImo(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCheck()}
            data-testid="vessel-imo-input"
          />
          {imoError && (
            <p className="text-xs text-red-600" data-testid="vessel-imo-error">
              {imoError}
            </p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-slate-600">Vessel name (optional)</Label>
          <Input placeholder="e.g. Sample Star" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
      </div>

      <Button
        onClick={handleCheck}
        disabled={loading || !!imoError || !imo.trim()}
        className="bg-[#1e3a5f] hover:bg-[#152a45]"
        data-testid="vessel-check-btn"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Checking...
          </>
        ) : (
          <>
            <Ship className="w-4 h-4 mr-2" /> Check IMO
          </>
        )}
      </Button>

      {result && (
        <div className="space-y-3" data-testid="vessel-result">
          {imoMatches.length === 0 ? (
            <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-sm">
              <CheckCircle className="w-5 h-5" /> No sanctions list matches for IMO {result.imo}.
            </div>
          ) : (
            <div className="flex items-center gap-2 text-red-800 bg-red-50 border border-red-200 rounded-lg p-3 text-sm font-semibold">
              <AlertTriangle className="w-5 h-5" /> IMO {result.imo} is on {imoMatches.length} sanctions list
              {imoMatches.length > 1 ? 's' : ''}: {[...new Set(imoMatches.map((m) => m.source_list))].join(', ')}
            </div>
          )}
          {imoMatches.map((m) => (
            <VesselMatch key={`${m.source_list}-${m.source_ref}`} m={m} />
          ))}
          {nameMatches.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-semibold text-slate-700">
                Vessels with a similar name and a different IMO (possible renaming)
              </div>
              {nameMatches.map((m) => (
                <VesselMatch key={`${m.source_list}-${m.source_ref}`} m={m} />
              ))}
            </div>
          )}
          <div className="text-xs text-slate-500">
            Checked against OFAC SDN, UK, SECO and EU Regulation 833/2014 (Annex XLII). The check is recorded in the
            audit log.
          </div>
        </div>
      )}
    </div>
  );
}
