import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/api/apiClient';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, Loader2, CheckCircle, FileSearch, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import HitDetailsDrawer from './HitDetailsDrawer';
import CountrySelector from '@/components/kyc/CountrySelector';
import { t } from '@/components/utils/language';

export default function ScreeningForm({ type, onResult }) {
  // Тот же ключ кэша, что и в остальных формах со странами — список тянется один раз.
  const { data: countries = [] } = useQuery({
    queryKey: ['countries'],
    queryFn: () => apiClient.getCountries(),
    staleTime: 60 * 60 * 1000,
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  // latestAlertId — id последнего алерта созданного этим скринингом.
  // Используется для кнопки "View full details" открывающей HitDetailsDrawer.
  const [latestAlertId, setLatestAlertId] = useState(null);
  // Совпадения по нашим спискам (PPATK, OFAC, UN, EU, UK, SECO, US CSL, FinCEN A7).
  // CA их не видит: Result может быть NO_PROFILES при высоком риске, поэтому
  // показываем каждое совпадение с именем из списка и процентом похожести.
  const [localMatches, setLocalMatches] = useState([]);
  const localLists = [...new Set(localMatches.map((a) => a.match_details?.source_list).filter(Boolean))];
  // Какой алерт открыт в drawer: CA ("View full details") или локальный ("Details").
  const [drawerAlertId, setDrawerAlertId] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const openDrawer = (alertId) => {
    setDrawerAlertId(alertId);
    setDrawerOpen(true);
  };
  const [form, setForm] = useState({
    name: '',
    date_of_birth: '',
    nationality: '',
    registration_number: '',
    incorporation_country: '',
    external_id: '',
  });

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  // Скрининг компании по одному названию — наименее точный режим: у CA нет
  // ничего, кроме строки, и совпадение может прийти по родовым словам
  // ("imp exp co ltd"). Предупреждаем до запуска, а не после разбора алерта.
  const nameOnlyCompanyScreen =
    type === 'company' && form.name.trim() && !form.registration_number.trim() && !form.incorporation_country.trim();

  const handleScreen = async () => {
    if (!form.name.trim()) {
      toast.error(t('complyNameRequired'));
      return;
    }
    setLoading(true);
    setLatestAlertId(null);
    setLocalMatches([]);
    try {
      const data = type === 'person' ? await apiClient.screenPerson(form) : await apiClient.screenCompany(form);
      toast.success(t('complyScreeningSubmitted'));
      setResult(data);
      onResult && onResult(data);

      // Подтянуть алерты: совпадения по локальным спискам показываем в карточке
      // списком (сильные первыми, затем по похожести), а свежий алерт CA готовим
      // для "View full details".
      if (data?.id) {
        try {
          const alerts = await apiClient.getCustomerAlerts(data.id);
          const list = Array.isArray(alerts) ? alerts : [];
          const local = list.filter((a) => a.match_type === 'ppatk_local');
          const isWeak = (a) => a.match_details?.match_quality?.strong === false;
          local.sort(
            (a, b) => isWeak(a) - isWeak(b) || (b.match_details?.similarity || 0) - (a.match_details?.similarity || 0)
          );
          setLocalMatches(local);
          // getCustomerAlerts возвращает desc by created_at → первый = новейший.
          const firstCa = list.find((a) => a.match_type !== 'ppatk_local');
          if (data.screening_result === 'HAS_PROFILES' && firstCa?.id) setLatestAlertId(firstCa.id);
        } catch {
          // не фатально — кнопка и строка со списками просто не появятся
        }
      }
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
          <Input
            placeholder={type === 'person' ? 'John Doe' : 'Acme Corporation'}
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-slate-600">External ID (optional)</Label>
          <Input
            placeholder="e.g. CL001"
            value={form.external_id}
            onChange={(e) => set('external_id', e.target.value)}
          />
        </div>
        {type === 'person' && (
          <>
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-600">Date of Birth</Label>
              <Input type="date" value={form.date_of_birth} onChange={(e) => set('date_of_birth', e.target.value)} />
            </div>
            <div className="space-y-1.5" data-testid="screen-nationality">
              <Label className="text-xs text-slate-600">Nationality</Label>
              {/* Селектор отдаёт ISO alpha-2 из справочника — на бэкенд уходит
                  ровно тот же формат, что и при ручном вводе. */}
              <CountrySelector
                value={form.nationality}
                onChange={(v) => set('nationality', v)}
                countries={countries}
                allowClear
                allowCustomCode
                fullWidthPopover
              />
            </div>
          </>
        )}
        {type === 'company' && (
          <>
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-600">Registration Number</Label>
              <Input
                placeholder="e.g. 123456789"
                value={form.registration_number}
                onChange={(e) => set('registration_number', e.target.value)}
              />
            </div>
            <div className="space-y-1.5" data-testid="screen-incorporation-country">
              <Label className="text-xs text-slate-600">Incorporation Country</Label>
              <CountrySelector
                value={form.incorporation_country}
                onChange={(v) => set('incorporation_country', v)}
                countries={countries}
                allowClear
                allowCustomCode
                fullWidthPopover
              />
            </div>
          </>
        )}
      </div>
      {nameOnlyCompanyScreen && (
        <div
          className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-900"
          data-testid="name-only-screen-warning"
        >
          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>
            Screening by name only. Without a registration number or incorporation country the match can be driven by
            generic words alone (&quot;imp&quot;, &quot;exp&quot;, &quot;co&quot;, &quot;ltd&quot;), and an ambiguous
            hit cannot be resolved afterwards. Fill either field if you have it.
          </span>
        </div>
      )}

      <Button onClick={handleScreen} disabled={loading} className="bg-[#1e3a5f] hover:bg-[#152a45]">
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Screening...
          </>
        ) : (
          <>
            <Shield className="w-4 h-4 mr-2" /> Run AML Screen
          </>
        )}
      </Button>

      {result && (
        <div className="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
          <div className="flex items-center gap-2 text-emerald-700 font-semibold mb-2">
            <CheckCircle className="w-5 h-5" /> Screening Submitted
          </div>
          <div className="text-sm text-slate-600 space-y-1">
            {result.id && (
              <div>
                Customer ID: <span className="font-mono text-slate-800">{result.id}</span>
              </div>
            )}
            {result.name && (
              <div>
                Name: <span className="font-semibold text-slate-800">{result.name}</span>
              </div>
            )}
            {result.risk_level && (
              <div>
                Risk Level: <span className="font-semibold text-slate-800 capitalize">{result.risk_level}</span>
              </div>
            )}
            {result.screening_result && (
              <div>
                Result: <span className="font-semibold text-slate-800">{result.screening_result}</span>
              </div>
            )}
            {localLists.length > 0 && (
              <div className="flex items-center gap-1.5 text-amber-800" data-testid="local-list-matches">
                <AlertTriangle className="w-4 h-4" />
                Sanctions lists match: <span className="font-semibold">{localLists.join(', ')}</span>
              </div>
            )}
          </div>
          {localMatches.length > 0 && (
            <div className="mt-3 space-y-1.5" data-testid="local-matches">
              <div className="text-xs font-semibold text-slate-700">Sanctions list matches ({localMatches.length})</div>
              {localMatches.map((a) => {
                const md = a.match_details || {};
                const weak = md.match_quality?.strong === false;
                return (
                  <div
                    key={a.id}
                    className="flex items-center gap-2 flex-wrap text-xs bg-white/70 border border-slate-200 rounded px-2 py-1.5"
                    data-testid={`local-match-${a.id}`}
                  >
                    <Badge className="bg-red-700 text-white font-mono text-[10px]">LIST • {md.source_list}</Badge>
                    <span className="font-medium text-slate-800 flex-1 min-w-[160px]">
                      {md.full_name || md.matched_name}
                    </span>
                    {md.similarity != null && (
                      <span className="font-mono text-slate-600" title="Text similarity of the names">
                        {Math.round(md.similarity * 100)}%
                      </span>
                    )}
                    <Badge
                      className={
                        weak
                          ? 'bg-amber-100 text-amber-900 border border-amber-300 text-[10px]'
                          : 'bg-red-100 text-red-800 border border-red-300 text-[10px]'
                      }
                    >
                      {weak ? 'Weak match' : 'Name match'}
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-6 px-2 text-xs"
                      onClick={() => openDrawer(a.id)}
                      data-testid={`local-match-details-${a.id}`}
                    >
                      Details
                    </Button>
                  </div>
                );
              })}
              {result.local_weak_skipped > 0 && (
                <div className="text-xs text-slate-500" data-testid="local-weak-skipped">
                  {result.local_weak_skipped} more weak matches (only generic words in common) were not saved.
                </div>
              )}
            </div>
          )}
          {latestAlertId && (
            <Button
              size="sm"
              variant="outline"
              className="mt-3 border-emerald-300 text-emerald-800 hover:bg-emerald-100"
              onClick={() => openDrawer(latestAlertId)}
              data-testid="view-full-details-btn"
            >
              <FileSearch className="w-4 h-4 mr-1.5" /> View full details
            </Button>
          )}
        </div>
      )}

      <HitDetailsDrawer alertId={drawerAlertId} open={drawerOpen} onOpenChange={setDrawerOpen} />
    </div>
  );
}
