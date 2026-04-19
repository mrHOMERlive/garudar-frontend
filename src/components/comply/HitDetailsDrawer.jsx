/**
 * HitDetailsDrawer — полная аналитика одного AML-алерта/hit'а.
 *
 * Рендерит секциями данные, собранные backend'ом из ComplyAdvantage _enriched_alert_risks:
 * Profile (matching_name, person/company details), Sanctions (лист + регулятор + дата),
 * PEP позиции, Adverse Media, Sources. Для старых alerts (до расширения match_details)
 * многие секции пусты — показываем "No data" fallback.
 *
 * Использование:
 *   const [alertId, setAlertId] = useState(null);
 *   <HitDetailsDrawer alertId={alertId} open={!!alertId} onOpenChange={(o) => !o && setAlertId(null)} />
 */
import React from 'react';
import apiClient from '@/api/apiClient';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Loader2, Shield, AlertTriangle, FileText, Globe, User } from 'lucide-react';

function Section({ icon: Icon, title, children, empty }) {
  return (
    <section className="space-y-2">
      <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-700 border-b border-slate-200 pb-1.5">
        {Icon ? <Icon className="w-4 h-4 text-[#1e3a5f]" /> : null}
        {title}
      </h3>
      {empty ? <div className="text-xs text-slate-400 italic">No data</div> : children}
    </section>
  );
}

function KV({ k, v }) {
  if (v === null || v === undefined || v === '') return null;
  return (
    <div className="text-xs flex gap-2">
      <span className="text-slate-500 min-w-[110px]">{k}:</span>
      <span className="text-slate-800 break-words">{Array.isArray(v) ? v.join(', ') : String(v)}</span>
    </div>
  );
}

function amlTypeClass(t) {
  if (t === 'SANCTION') return 'bg-red-600 text-white';
  if (t === 'SANCTION_RELATED') return 'bg-red-400 text-white';
  if (typeof t === 'string' && t.startsWith('PEP')) return 'bg-orange-500 text-white';
  if (typeof t === 'string' && t.startsWith('ADVERSE_MEDIA')) return 'bg-yellow-600 text-white';
  return 'bg-slate-500 text-white';
}

export default function HitDetailsDrawer({ alertId, open, onOpenChange }) {
  const [data, setData] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    if (!alertId || !open) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    setData(null);
    apiClient
      .getAmlAlertDetails(alertId)
      .then((d) => {
        if (!cancelled) setData(d);
      })
      .catch((e) => {
        if (!cancelled) setError(e.message || 'Failed to load hit details');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [alertId, open]);

  const md = data?.match_details || {};
  const profile = md.profile || null;
  const sanctions = Array.isArray(md.sanctions) ? md.sanctions : [];
  const pep = Array.isArray(md.pep) ? md.pep : [];
  const adverseMedia = Array.isArray(md.adverse_media) ? md.adverse_media : [];
  const sources = Array.isArray(md.sources) ? md.sources : [];
  const aliases = Array.isArray(md.aliases) ? md.aliases : [];
  const amlTypes = Array.isArray(md.aml_types) ? md.aml_types : [];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-xl md:max-w-2xl overflow-y-auto"
        data-testid="hit-details-drawer"
      >
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 text-[#1e3a5f]">
            <AlertTriangle className="w-5 h-5" />
            {data?.title || 'Hit Details'}
          </SheetTitle>
          {data?.description ? (
            <SheetDescription className="text-slate-600">{data.description}</SheetDescription>
          ) : null}
        </SheetHeader>

        {loading ? (
          <div className="flex items-center gap-2 text-slate-500 py-8">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading hit details...
          </div>
        ) : error ? (
          <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded p-3">{error}</div>
        ) : !data ? null : (
          <div className="space-y-5 mt-4">
            {/* AML type badges */}
            {amlTypes.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {amlTypes.map((t) => (
                  <Badge key={t} className={`text-xs ${amlTypeClass(t)}`}>
                    {t}
                  </Badge>
                ))}
              </div>
            )}

            {/* Profile */}
            <Section icon={User} title="Profile" empty={!profile}>
              {profile ? (
                <div className="space-y-1 bg-slate-50 border border-slate-100 rounded p-3">
                  <KV k="Matching name" v={profile.matching_name} />
                  <KV k="Date of birth" v={profile.date_of_birth} />
                  <KV k="Nationality" v={profile.nationality} />
                  {aliases.length > 0 && (
                    <div className="mt-2">
                      <div className="text-xs text-slate-500 mb-1">Aliases</div>
                      <div className="flex flex-wrap gap-1.5">
                        {aliases.slice(0, 20).map((a, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {a.name}
                            {a.type ? <span className="text-slate-400 ml-1">({a.type})</span> : null}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : null}
            </Section>

            {/* Sanctions */}
            <Section icon={Shield} title={`Sanctions (${sanctions.length})`} empty={sanctions.length === 0}>
              <div className="space-y-2">
                {sanctions.map((s, i) => (
                  <div key={i} className="border border-red-100 bg-red-50 rounded p-2.5 space-y-0.5">
                    <div className="font-medium text-slate-800 text-sm">{s.name || 'Unknown sanctions list'}</div>
                    <KV k="Regulator" v={s.regulator} />
                    <KV k="Date added" v={s.date_added} />
                    <KV k="Status" v={s.status} />
                    {s.description ? (
                      <div className="text-xs text-slate-600 mt-1 leading-relaxed">{s.description}</div>
                    ) : null}
                  </div>
                ))}
              </div>
            </Section>

            {/* PEP */}
            <Section icon={User} title={`PEP positions (${pep.length})`} empty={pep.length === 0}>
              <div className="space-y-2">
                {pep.map((p, i) => (
                  <div key={i} className="border border-orange-100 bg-orange-50 rounded p-2.5 space-y-0.5">
                    <div className="font-medium text-slate-800 text-sm">{p.position || 'Political position'}</div>
                    <KV k="Country" v={p.country} />
                    <KV k="From" v={p.from} />
                    <KV k="To" v={p.to} />
                  </div>
                ))}
              </div>
            </Section>

            {/* Adverse media */}
            <Section icon={FileText} title={`Adverse media (${adverseMedia.length})`} empty={adverseMedia.length === 0}>
              <div className="space-y-2">
                {adverseMedia.map((m, i) => (
                  <div key={i} className="border border-yellow-100 bg-yellow-50 rounded p-2.5 space-y-1">
                    <div className="font-medium text-slate-800 text-sm">{m.title || 'Untitled article'}</div>
                    {m.published ? <div className="text-xs text-slate-500">{m.published}</div> : null}
                    {m.snippet ? <div className="text-xs text-slate-700 leading-relaxed">{m.snippet}</div> : null}
                    {m.url ? (
                      <a
                        href={m.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline break-all"
                      >
                        {m.url}
                      </a>
                    ) : null}
                  </div>
                ))}
              </div>
            </Section>

            {/* Sources */}
            <Section icon={Globe} title={`Sources (${sources.length})`} empty={sources.length === 0}>
              <ul className="list-disc list-inside space-y-1 text-sm text-slate-700">
                {sources.map((s, i) => (
                  <li key={i}>
                    {s.url ? (
                      <a
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {s.name || s.url}
                      </a>
                    ) : (
                      <span>{s.name}</span>
                    )}
                  </li>
                ))}
              </ul>
            </Section>

            {/* Raw risks toggle (staff-advanced view) */}
            {data.raw_risks ? (
              <details className="group">
                <summary className="text-xs text-slate-500 cursor-pointer hover:text-slate-700">
                  Show raw ComplyAdvantage response
                </summary>
                <pre className="mt-2 text-[11px] bg-slate-900 text-slate-200 p-3 rounded overflow-x-auto max-h-80">
                  {JSON.stringify(data.raw_risks, null, 2)}
                </pre>
              </details>
            ) : null}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
