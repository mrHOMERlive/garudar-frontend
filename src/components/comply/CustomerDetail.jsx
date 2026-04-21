import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '@/api/apiClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import RiskBadge from './RiskBadge';
import HitDetailsDrawer from './HitDetailsDrawer';
import {
  ArrowLeft,
  User,
  Building2,
  AlertTriangle,
  CheckCircle,
  Loader2,
  RefreshCw,
  Eye,
  EyeOff,
  MessageSquare,
  Shield,
  TrendingUp,
  Bell,
  ChevronRight,
  Download,
  FileText,
  Clock,
} from 'lucide-react';
import { toast } from 'sonner';

// Human-readable labels for known CA audit event types.
// Unknown types are rendered as raw `type` + `detail` in a collapsible block.
const AUDIT_EVENT_LABELS = {
  CUSTOMER_CREATED: 'Customer created',
  CUSTOMER_INFO_UPDATED: 'Customer info updated',
  CUSTOMER_STATUS_UPDATED: 'Customer status changed',
  CUSTOMER_SCREENED: 'Customer screened',
  CUSTOMER_LABELS_UPDATED: 'Customer labels updated',
  CUSTOMER_SEGMENTS_UPDATED: 'Customer segments updated',
  CUSTOMER_MIGRATED: 'Customer migrated',
  CUSTOMER_MONITORING_CONFIGURATION_UPDATED: 'Monitoring configuration changed',
  CUSTOMER_PRODUCT_UPDATED: 'Customer products updated',
  RISK_SCORE_CALCULATED: 'Risk score recalculated',
  CASE_CREATED: 'Case opened',
  CASE_ASSIGNED: 'Case assigned',
  CASE_STAGE_TRANSITIONED: 'Case stage changed',
  ALERT_ADDED_TO_CASE: 'Alert added to case',
  ALERT_STATE_UPDATED: 'Alert state changed',
  ALERT_MUTED_FOR_RISK: 'Alert muted',
  ALERT_UNMUTED_FOR_RISK: 'Alert unmuted',
  NOTE_CREATED_TO_CUSTOMER: 'Note added to customer',
  NOTE_CREATED_TO_CASE_ACTION: 'Note added to case action',
  NOTE_TO_CASE_OBJECT: 'Note added to case',
  NOTE_TO_RISK: 'Note added to risk',
  RISK_CODE_UNMUTED_FOR_ENTITY: 'Risk code unmuted',
  RISK_STATUS_UPDATED: 'Risk status updated',
  PAYMENT_SCREENED: 'Payment screened',
  TRANSACTION_MONITORED: 'Transaction monitored',
  TRANSACTION_RECEIVED: 'Transaction received',
  TRANSACTION_RELEASE_DECISION: 'Transaction release decision',
  TRANSACTION_ADDED_TO_CASE: 'Transaction added to case',
};

function AuditTimeline({ customerId }) {
  const [items, setItems] = React.useState([]);
  const [totalCount, setTotalCount] = React.useState(null);
  const [pageNumber, setPageNumber] = React.useState(1);
  const [nextPage, setNextPage] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);

  const load = React.useCallback(
    async (pn) => {
      setLoading(true);
      setError(null);
      try {
        const data = await apiClient.getAmlCustomerAudit(customerId, {
          page_number: pn,
          page_size: 50,
          sort: '-occurred_at',
        });
        setItems((prev) => (pn === 1 ? data.items || [] : [...prev, ...(data.items || [])]));
        setTotalCount(data.totalCount ?? null);
        setNextPage(data.nextPageNumber ?? null);
        setPageNumber(pn);
      } catch (e) {
        setError(e.message || 'Failed to load audit log');
      } finally {
        setLoading(false);
      }
    },
    [customerId]
  );

  React.useEffect(() => {
    if (customerId) load(1);
  }, [customerId, load]);

  if (loading && items.length === 0) {
    return (
      <div className="flex items-center gap-2 text-slate-500 py-8 justify-center">
        <Loader2 className="w-5 h-5 animate-spin" /> Loading audit log...
      </div>
    );
  }
  if (error) {
    return <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded p-3">{error}</div>;
  }
  if (items.length === 0) {
    return (
      <div className="text-center text-slate-400 py-10 bg-white border border-slate-200 rounded-lg">
        <Clock className="w-8 h-8 mx-auto mb-2 opacity-30" />
        <p>No audit records for this customer</p>
      </div>
    );
  }

  return (
    <div className="space-y-2" data-testid="audit-timeline">
      {totalCount !== null && (
        <p className="text-sm text-slate-500">
          {items.length} of {totalCount} events
        </p>
      )}
      {items.map((ev) => {
        const label = AUDIT_EVENT_LABELS[ev.type] || ev.type;
        const actor =
          ev.actionedByType === 'SYSTEM'
            ? 'System'
            : ev.actionedByType === 'USER'
              ? `User ${ev.actionedByIdentifier ? ev.actionedByIdentifier.slice(0, 8) : '?'}`
              : '—';
        return (
          <Card key={ev.identifier} className="border-slate-200" data-testid={`audit-event-${ev.identifier}`}>
            <CardContent className="p-3">
              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-slate-800 text-sm">{label}</div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {ev.occurredAt ? new Date(ev.occurredAt).toLocaleString('en-GB') : ''} · {actor}
                  </div>
                  {ev.detail && Object.keys(ev.detail).length > 0 && (
                    <details className="mt-1.5">
                      <summary className="text-xs text-slate-500 cursor-pointer hover:text-slate-700">
                        Raw detail
                      </summary>
                      <pre className="mt-1 text-[11px] bg-slate-900 text-slate-200 p-2 rounded overflow-x-auto max-h-40">
                        {JSON.stringify(ev.detail, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
                <Badge variant="outline" className="text-[10px] font-mono flex-shrink-0">
                  {ev.type}
                </Badge>
              </div>
            </CardContent>
          </Card>
        );
      })}
      {nextPage && (
        <div className="flex justify-center pt-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => load(nextPage)}
            disabled={loading}
            data-testid="audit-load-more"
          >
            {loading ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : null} Load more
          </Button>
        </div>
      )}
    </div>
  );
}

export default function CustomerDetail({ customer, onBack }) {
  const [data, setData] = useState(customer);
  const [cases, setCases] = useState(null);
  const [alerts, setAlerts] = useState(null);
  const [riskScore, setRiskScore] = useState(null);
  const [screenings, setScreenings] = useState(null);
  const [loading, setLoading] = useState({});
  const [activeTab, setActiveTab] = useState('overview');
  const [caseComment, setCaseComment] = useState('');
  const [selectedCaseId, setSelectedCaseId] = useState(null);
  const [riskOverride, setRiskOverride] = useState({ level: '', reason: '' });
  // selectedAlertId — id алерта для HitDetailsDrawer
  const [selectedAlertId, setSelectedAlertId] = useState(null);

  const setLoad = (key, val) => setLoading((p) => ({ ...p, [key]: val }));

  // AML screening report (PDF): первый клик → генерация + скачивание в MinIO,
  // повторные — просто берут сохранённый presigned URL без обращения к CA.
  const handleDownloadScreeningReport = async (screeningId, alreadySaved) => {
    const key = `report_${screeningId}`;
    setLoad(key, true);
    try {
      const resp = alreadySaved
        ? await apiClient.downloadAmlScreeningReport(screeningId)
        : await apiClient.generateAmlScreeningReport(screeningId);

      if (resp?.status === 'ready' && resp?.downloadUrl) {
        window.open(resp.downloadUrl, '_blank', 'noopener,noreferrer');
      } else if (resp?.status === 'pending') {
        toast.info('Report is being generated by ComplyAdvantage', {
          description: 'Please try again in a minute — CA generates the PDF asynchronously.',
        });
      } else {
        toast.error('Unexpected response from server');
      }
      // Обновим список screenings, чтобы подтянуть report_s3_key.
      const fresh = await apiClient.getCustomerScreenings(data.id).catch(() => null);
      if (fresh) setScreenings(fresh);
    } catch (e) {
      toast.error(e.message || 'Failed to fetch PDF report');
    } finally {
      setLoad(key, false);
    }
  };

  const loadAll = useCallback(async () => {
    setLoad('cases', true);
    setLoad('alerts', true);
    setLoad('risk', true);
    try {
      const [cust, c, a, r, s] = await Promise.all([
        apiClient.getAmlCustomer(customer.id).catch(() => null),
        apiClient.getCustomerCases(customer.id).catch(() => []),
        apiClient.getCustomerAlerts(customer.id).catch(() => []),
        apiClient.getCustomerRisk(customer.id).catch(() => null),
        apiClient.getCustomerScreenings(customer.id).catch(() => []),
      ]);
      if (cust) setData(cust);
      setCases(c);
      setAlerts(a);
      setRiskScore(r);
      setScreenings(s);
    } finally {
      setLoad('cases', false);
      setLoad('alerts', false);
      setLoad('risk', false);
    }
  }, [customer.id]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const handleRescreen = async () => {
    setLoad('rescreen', true);
    try {
      await apiClient.rescreenCustomer(customer.id);
      toast.success('Re-screen triggered');
      loadAll();
    } catch (err) {
      toast.error(err.message || 'Failed');
    } finally {
      setLoad('rescreen', false);
    }
  };

  const handleToggleMonitor = async () => {
    setLoad('monitor', true);
    try {
      await apiClient.toggleMonitoring(customer.id, { enabled: !data.monitored });
      toast.success(data.monitored ? 'Monitoring disabled' : 'Monitoring enabled');
      setData((p) => ({ ...p, monitored: !p.monitored }));
    } catch (err) {
      toast.error(err.message || 'Failed');
    } finally {
      setLoad('monitor', false);
    }
  };

  const handleRiskOverride = async () => {
    if (!riskOverride.level) {
      toast.error('Select a risk level');
      return;
    }
    setLoad('riskOverride', true);
    try {
      await apiClient.overrideRisk(customer.id, { risk_level: riskOverride.level, reason: riskOverride.reason });
      toast.success('Risk level updated');
      setData((p) => ({ ...p, risk_level: riskOverride.level }));
      loadAll();
    } catch (err) {
      toast.error(err.message || 'Failed');
    } finally {
      setLoad('riskOverride', false);
    }
  };

  const handleAlertAction = async (alertId, action) => {
    setLoad(`alert_${alertId}`, true);
    try {
      if (action === 'confirm') await apiClient.confirmAlert(alertId);
      else await apiClient.dismissAlert(alertId);
      toast.success(`Alert ${action}ed`);
      loadAll();
    } catch (err) {
      toast.error(err.message || 'Failed');
    } finally {
      setLoad(`alert_${alertId}`, false);
    }
  };

  const handleAddComment = async (caseId) => {
    if (!caseComment.trim()) return;
    setLoad('comment', true);
    try {
      await apiClient.addCaseComment(caseId, { comment: caseComment });
      toast.success('Comment added');
      setCaseComment('');
      setSelectedCaseId(null);
    } catch (err) {
      toast.error(err.message || 'Failed');
    } finally {
      setLoad('comment', false);
    }
  };

  const handleUpdateCase = async (caseId, status) => {
    setLoad(`case_${caseId}`, true);
    try {
      await apiClient.updateAmlCase(caseId, { status });
      toast.success('Case updated');
      loadAll();
    } catch (err) {
      toast.error(err.message || 'Failed');
    } finally {
      setLoad(`case_${caseId}`, false);
    }
  };

  const tabs = ['overview', 'cases', 'alerts', 'risk', 'screenings', 'audit'];

  return (
    <div>
      <Button variant="outline" size="sm" onClick={onBack} className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-1" /> Back
      </Button>

      {/* Header card */}
      <Card className="border-slate-200 mb-4">
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-start gap-4">
              <div
                className={`w-14 h-14 rounded-xl flex items-center justify-center ${data.type === 'person' ? 'bg-blue-50' : 'bg-amber-50'}`}
              >
                {data.type === 'person' ? (
                  <User className="w-7 h-7 text-blue-600" />
                ) : (
                  <Building2 className="w-7 h-7 text-amber-600" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-3 flex-wrap mb-1">
                  <h3 className="text-xl font-bold text-[#1e3a5f]">{data.name}</h3>
                  <RiskBadge level={data.risk_level} />
                  <Badge variant="outline" className="text-xs capitalize">
                    {data.type}
                  </Badge>
                  {data.monitored && <Badge className="bg-blue-600 text-white text-xs">Monitored</Badge>}
                  {data.status && (
                    <Badge
                      className={
                        data.status === 'active'
                          ? 'bg-emerald-600 text-white text-xs'
                          : 'bg-slate-400 text-white text-xs'
                      }
                    >
                      {data.status}
                    </Badge>
                  )}
                </div>
                <div className="text-sm text-slate-500 space-y-0.5">
                  {data.external_identifier && (
                    <div>
                      External ID: <span className="font-mono text-slate-700">{data.external_identifier}</span>
                    </div>
                  )}
                  {data.created_at && <div>Created: {new Date(data.created_at).toLocaleDateString()}</div>}
                  {data.updated_at && <div>Last updated: {new Date(data.updated_at).toLocaleDateString()}</div>}
                </div>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button size="sm" variant="outline" onClick={handleRescreen} disabled={loading.rescreen}>
                {loading.rescreen ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-1" />
                )}{' '}
                Re-screen
              </Button>
              <Button size="sm" variant="outline" onClick={handleToggleMonitor} disabled={loading.monitor}>
                {loading.monitor ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : data.monitored ? (
                  <EyeOff className="w-4 h-4 mr-1" />
                ) : (
                  <Eye className="w-4 h-4 mr-1" />
                )}
                {data.monitored ? 'Stop Monitoring' : 'Start Monitoring'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sub-tabs */}
      <div className="flex gap-1 border-b border-slate-200 mb-4 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`px-4 py-2 text-sm font-medium capitalize whitespace-nowrap border-b-2 transition-colors ${activeTab === t ? 'border-[#1e3a5f] text-[#1e3a5f]' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Risk Level', value: <RiskBadge level={data.risk_level} />, icon: Shield },
            {
              label: 'Open Cases',
              value: loading.cases ? '...' : (cases?.filter((c) => c.status === 'open').length ?? '—'),
              icon: AlertTriangle,
            },
            {
              label: 'Open Alerts',
              value: loading.alerts ? '...' : (alerts?.filter((a) => a.status === 'pending').length ?? '—'),
              icon: Bell,
            },
            { label: 'Monitoring', value: data.monitored ? 'Active' : 'Inactive', icon: Eye },
          ].map((item) => (
            <Card key={item.label} className="border-slate-200">
              <CardContent className="p-4 flex items-center gap-3">
                <item.icon className="w-5 h-5 text-slate-400" />
                <div>
                  <div className="text-xs text-slate-500">{item.label}</div>
                  <div className="font-semibold text-slate-800 mt-0.5">{item.value}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* CASES */}
      {activeTab === 'cases' && (
        <div className="space-y-3">
          {loading.cases ? (
            <div className="flex items-center gap-2 text-slate-500 py-6">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading cases...
            </div>
          ) : !cases?.length ? (
            <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-lg p-4">
              <CheckCircle className="w-5 h-5" /> No cases found.
            </div>
          ) : (
            cases.map((c) => (
              <Card
                key={c.id}
                className={`border-l-4 ${c.status === 'open' ? 'border-l-amber-500' : 'border-l-slate-300'}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="flex items-start gap-3">
                      <AlertTriangle
                        className={`w-5 h-5 flex-shrink-0 mt-0.5 ${c.status === 'open' ? 'text-amber-600' : 'text-slate-400'}`}
                      />
                      <div>
                        <div className="font-semibold text-slate-800">{c.title || `Case ${c.id}`}</div>
                        {c.description && <div className="text-sm text-slate-500 mt-0.5">{c.description}</div>}
                        {c.aml_types?.length > 0 && (
                          <div className="flex gap-1 mt-1.5 flex-wrap">
                            {c.aml_types.map((t) => (
                              <Badge
                                key={t}
                                className={`text-xs ${
                                  t === 'SANCTION'
                                    ? 'bg-red-600 text-white'
                                    : t === 'SANCTION_RELATED'
                                      ? 'bg-red-400 text-white'
                                      : t.startsWith('PEP')
                                        ? 'bg-orange-500 text-white'
                                        : t.startsWith('ADVERSE_MEDIA')
                                          ? 'bg-yellow-600 text-white'
                                          : 'bg-slate-500 text-white'
                                }`}
                              >
                                {t}
                              </Badge>
                            ))}
                          </div>
                        )}
                        <div className="flex gap-2 mt-1.5 flex-wrap items-center">
                          <Badge
                            className={
                              c.status === 'open'
                                ? 'bg-amber-500 text-white text-xs'
                                : 'bg-slate-400 text-white text-xs'
                            }
                          >
                            {c.status}
                          </Badge>
                          {c.risk_level && <RiskBadge level={c.risk_level} />}
                          {c.created_at && (
                            <span className="text-xs text-slate-400">
                              {new Date(c.created_at).toLocaleDateString()}
                            </span>
                          )}
                          {c.external_case_id && (
                            <span className="text-xs text-slate-400 font-mono">CA: {c.external_case_id}</span>
                          )}
                          {alerts && alerts.filter((a) => a.status === 'pending').length > 0 && c.status === 'open' && (
                            <span className="text-xs text-red-500 font-medium">
                              {alerts.filter((a) => a.status === 'pending').length} open alert
                              {alerts.filter((a) => a.status === 'pending').length !== 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {c.status === 'open' && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs"
                            onClick={() => handleUpdateCase(c.id, 'closed')}
                            disabled={loading[`case_${c.id}`]}
                          >
                            Close
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs"
                            onClick={() => setSelectedCaseId(selectedCaseId === c.id ? null : c.id)}
                          >
                            <MessageSquare className="w-3 h-3 mr-1" /> Comment
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                  {selectedCaseId === c.id && (
                    <div className="mt-3 space-y-2">
                      <Textarea
                        placeholder="Add a comment..."
                        value={caseComment}
                        onChange={(e) => setCaseComment(e.target.value)}
                        rows={2}
                        className="text-sm"
                      />
                      <Button
                        size="sm"
                        onClick={() => handleAddComment(c.id)}
                        disabled={loading.comment}
                        className="bg-[#1e3a5f] hover:bg-[#152a45]"
                      >
                        {loading.comment ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : null} Submit
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* ALERTS */}
      {activeTab === 'alerts' && (
        <div className="space-y-3">
          {loading.alerts ? (
            <div className="flex items-center gap-2 text-slate-500 py-6">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading alerts...
            </div>
          ) : !alerts?.length ? (
            <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-lg p-4">
              <CheckCircle className="w-5 h-5" /> No alerts found.
            </div>
          ) : (
            alerts.map((a) => (
              <Card
                key={a.id}
                className={`border-l-4 cursor-pointer hover:shadow-md transition-shadow ${a.status === 'pending' ? 'border-l-red-500' : a.status === 'confirmed' ? 'border-l-amber-500' : 'border-l-slate-300'}`}
                onClick={() => setSelectedAlertId(a.id)}
                data-testid={`alert-card-${a.id}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                        {a.title || a.match_type || `Alert ${a.id}`}
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      </div>
                      {a.description && <div className="text-sm text-slate-500 mt-0.5">{a.description}</div>}
                      {a.match_details?.aml_types?.length > 0 && (
                        <div className="flex gap-1.5 mt-1.5 flex-wrap">
                          {a.match_details.aml_types.map((t) => (
                            <Badge
                              key={t}
                              className={`text-xs ${
                                t === 'SANCTION'
                                  ? 'bg-red-600 text-white'
                                  : t === 'SANCTION_RELATED'
                                    ? 'bg-red-400 text-white'
                                    : t.startsWith('PEP')
                                      ? 'bg-orange-500 text-white'
                                      : t.startsWith('ADVERSE_MEDIA')
                                        ? 'bg-yellow-600 text-white'
                                        : 'bg-slate-500 text-white'
                              }`}
                            >
                              {t}
                            </Badge>
                          ))}
                        </div>
                      )}
                      {a.match_details?.entities?.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {a.match_details.entities.map((e, i) => (
                            <div key={i} className="text-xs bg-red-50 border border-red-100 rounded px-2 py-1.5">
                              {e.name && <span className="font-medium text-slate-800">{e.name}</span>}
                              {e.sources?.length > 0 && (
                                <span className="text-slate-500 ml-1.5">— {e.sources.join(', ')}</span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="flex gap-2 mt-1.5 flex-wrap">
                        <Badge
                          className={
                            a.status === 'pending'
                              ? 'bg-red-500 text-white text-xs'
                              : a.status === 'confirmed'
                                ? 'bg-amber-500 text-white text-xs'
                                : 'bg-slate-400 text-white text-xs'
                          }
                        >
                          {a.status}
                        </Badge>
                        {a.created_at && (
                          <span className="text-xs text-slate-400">{new Date(a.created_at).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                    {a.status === 'pending' && (
                      <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                        <Button
                          size="sm"
                          className="bg-emerald-600 hover:bg-emerald-700 text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAlertAction(a.id, 'confirm');
                          }}
                          disabled={loading[`alert_${a.id}`]}
                        >
                          Confirm
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAlertAction(a.id, 'dismiss');
                          }}
                          disabled={loading[`alert_${a.id}`]}
                        >
                          Dismiss
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* RISK */}
      {activeTab === 'risk' && (
        <div className="space-y-4">
          {riskScore && (
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="text-[#1e3a5f] text-base flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" /> Current Risk Score
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <RiskBadge level={riskScore.risk_level || data.risk_level} />
                  {riskScore.score !== undefined && riskScore.score !== null && (
                    <span className="text-2xl font-bold text-slate-800">{riskScore.score}</span>
                  )}
                </div>
                {riskScore.factors?.length > 0 && (
                  <div>
                    <div className="text-sm font-medium text-slate-600 mb-2">Risk Factors</div>
                    <div className="space-y-1">
                      {riskScore.factors.map((f, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 text-sm text-slate-700 bg-slate-50 rounded px-3 py-1.5"
                        >
                          <div className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" />
                          {f.label || f.name || f}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {riskScore.last_updated && (
                  <div className="text-xs text-slate-400">
                    Last updated: {new Date(riskScore.last_updated).toLocaleString()}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-[#1e3a5f] text-base">Override Risk Level</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">New Risk Level</label>
                  <Select
                    value={riskOverride.level}
                    onValueChange={(v) => setRiskOverride((p) => ({ ...p, level: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Reason</label>
                  <input
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                    placeholder="Reason for override..."
                    value={riskOverride.reason}
                    onChange={(e) => setRiskOverride((p) => ({ ...p, reason: e.target.value }))}
                  />
                </div>
              </div>
              <Button
                size="sm"
                onClick={handleRiskOverride}
                disabled={loading.riskOverride}
                className="bg-[#1e3a5f] hover:bg-[#152a45]"
              >
                {loading.riskOverride ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-1" />
                ) : (
                  <Shield className="w-4 h-4 mr-1" />
                )}{' '}
                Apply Override
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* SCREENINGS */}
      {activeTab === 'screenings' && (
        <div className="space-y-3">
          <div className="flex justify-end mb-2">
            <Button
              size="sm"
              onClick={handleRescreen}
              disabled={loading.rescreen}
              className="bg-[#1e3a5f] hover:bg-[#152a45]"
            >
              {loading.rescreen ? (
                <Loader2 className="w-4 h-4 animate-spin mr-1" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-1" />
              )}{' '}
              Trigger Re-screen
            </Button>
          </div>
          {!screenings?.length ? (
            <div className="text-center text-slate-400 py-8 bg-white border border-slate-200 rounded-lg">
              No screening history
            </div>
          ) : (
            screenings.map((s) => (
              <Card key={s.id} className="border-slate-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div>
                      <div className="font-medium text-slate-800">Screening {s.id}</div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        {s.created_at ? new Date(s.created_at).toLocaleString() : ''}
                      </div>
                    </div>
                    <div className="flex gap-2 items-center">
                      {s.status && (
                        <Badge
                          className={
                            s.status === 'complete'
                              ? 'bg-emerald-600 text-white text-xs'
                              : 'bg-amber-500 text-white text-xs'
                          }
                        >
                          {s.status}
                        </Badge>
                      )}
                      {s.match_count !== undefined && (
                        <span className="text-xs text-slate-500">
                          {s.match_count} match{s.match_count !== 1 ? 'es' : ''}
                        </span>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownloadScreeningReport(s.id, Boolean(s.report_s3_key))}
                        disabled={loading[`report_${s.id}`]}
                        data-testid={`download-report-${s.id}`}
                        title={s.report_s3_key ? 'Download saved PDF' : 'Generate and download PDF'}
                      >
                        {loading[`report_${s.id}`] ? (
                          <Loader2 className="w-3 h-3 animate-spin mr-1" />
                        ) : s.report_s3_key ? (
                          <FileText className="w-3 h-3 mr-1" />
                        ) : (
                          <Download className="w-3 h-3 mr-1" />
                        )}
                        PDF
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {activeTab === 'audit' && <AuditTimeline customerId={data.id} />}

      <HitDetailsDrawer
        alertId={selectedAlertId}
        open={!!selectedAlertId}
        onOpenChange={(o) => {
          if (!o) setSelectedAlertId(null);
        }}
      />
    </div>
  );
}
